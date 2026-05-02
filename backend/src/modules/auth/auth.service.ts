import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { RefreshDto } from './dto/refresh.dto';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';
import { AuthUser, RequestMeta } from './types';

@Injectable()
export class AuthService {
  private readonly loginAttempts = new Map<string, { count: number; resetAt: number; blockedUntil?: number }>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
  ) {}

  async login(dto: LoginDto, meta: RequestMeta = {}) {
    this.assertLoginAllowed(dto.username, meta.ip);
    const user = await this.prisma.user.findFirst({
      where: { username: dto.username, deletedAt: null },
    });

    if (!user || !this.passwordService.verify(dto.password, user.passwordHash)) {
      await this.logAuth(user?.id, 'LOGIN_FAILED', meta);
      throw new UnauthorizedException('Неверный логин или пароль');
    }

    if (!user.isActive) {
      await this.logAuth(user.id, 'LOGIN_FAILED', meta);
      throw new UnauthorizedException('Пользователь заблокирован');
    }

    this.loginAttempts.delete(this.loginKey(dto.username, meta.ip));

    const authUser: AuthUser = {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
    };
    const tokens = await this.createSession(authUser, meta);
    await this.logAuth(user.id, 'LOGIN_SUCCESS', meta);

    return {
      ...tokens,
      user: authUser,
    };
  }

  async refresh(dto: RefreshDto, meta: RequestMeta = {}) {
    const payload = this.verifyRefreshPayload(dto.refreshToken);
    const tokenHash = this.tokenService.hashToken(dto.refreshToken);
    const savedToken = await this.prisma.refreshToken.findFirst({
      where: { userId: payload.sub, tokenHash },
      include: { user: true },
    });

    if (!savedToken) {
      await this.prisma.refreshToken.deleteMany({ where: { userId: payload.sub } });
      await this.logAuth(payload.sub, 'SUSPICIOUS_ACTIVITY', meta);
      throw new UnauthorizedException('Сессия скомпрометирована. Войдите снова.');
    }

    if (savedToken.expiresAt < new Date() || !savedToken.user.isActive || savedToken.user.deletedAt) {
      await this.prisma.refreshToken.deleteMany({ where: { userId: payload.sub } });
      await this.logAuth(payload.sub, 'SUSPICIOUS_ACTIVITY', meta);
      throw new UnauthorizedException('Сессия истекла. Войдите снова.');
    }

    if (this.isDeviceChanged(savedToken.userAgent, savedToken.ipAddress, meta)) {
      await this.logAuth(payload.sub, 'SUSPICIOUS_ACTIVITY', meta);
    }

    const authUser: AuthUser = {
      id: savedToken.user.id,
      username: savedToken.user.username,
      fullName: savedToken.user.fullName,
      role: savedToken.user.role,
    };

    const tokens = await this.prisma.$transaction(async (tx) => {
      await tx.refreshToken.delete({ where: { id: savedToken.id } });
      const accessToken = this.tokenService.signAccess(authUser);
      const refreshToken = this.tokenService.signRefresh(authUser);
      await tx.refreshToken.create({
        data: {
          userId: authUser.id,
          tokenHash: this.tokenService.hashToken(refreshToken),
          expiresAt: this.tokenService.getRefreshExpiresAt(),
          userAgent: meta.userAgent,
          ipAddress: meta.ip,
        },
      });
      return { accessToken, refreshToken };
    });

    await this.logAuth(authUser.id, 'TOKEN_REFRESH', meta);
    return { ...tokens, user: authUser };
  }

  async logout(dto: LogoutDto, meta: RequestMeta = {}) {
    const tokenHash = this.tokenService.hashToken(dto.refreshToken);
    const savedToken = await this.prisma.refreshToken.findFirst({ where: { tokenHash } });
    await this.prisma.refreshToken.deleteMany({ where: { tokenHash } });
    await this.logAuth(savedToken?.userId, 'LOGOUT', meta);
    return { success: true };
  }

  async logoutAll(userId: string, meta: RequestMeta = {}) {
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
    await this.logAuth(userId, 'LOGOUT_ALL', meta);
    return { success: true };
  }

  async validateToken(token: string): Promise<AuthUser> {
    const payload = this.tokenService.verifyAccess(token);
    const user = await this.prisma.user.findFirst({
      where: { id: payload.sub, isActive: true, deletedAt: null },
    });

    if (!user) {
      throw new UnauthorizedException('Пользователь заблокирован');
    }

    return {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
    };
  }

  hashPassword(password: string): string {
    return this.passwordService.hash(password);
  }

  private async createSession(user: AuthUser, meta: RequestMeta) {
    const accessToken = this.tokenService.signAccess(user);
    const refreshToken = this.tokenService.signRefresh(user);

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: this.tokenService.hashToken(refreshToken),
        expiresAt: this.tokenService.getRefreshExpiresAt(),
        userAgent: meta.userAgent,
        ipAddress: meta.ip,
      },
    });

    return { accessToken, refreshToken };
  }

  private verifyRefreshPayload(refreshToken: string) {
    try {
      return this.tokenService.verifyRefresh(refreshToken);
    } catch {
      throw new UnauthorizedException('Сессия истекла. Войдите снова.');
    }
  }

  private assertLoginAllowed(username: string, ip?: string) {
    const key = this.loginKey(username, ip);
    const now = Date.now();
    const current = this.loginAttempts.get(key);

    if (current?.blockedUntil && current.blockedUntil > now) {
      throw new HttpException('Слишком много попыток. Попробуйте позже.', HttpStatus.TOO_MANY_REQUESTS);
    }

    if (!current || current.resetAt < now) {
      this.loginAttempts.set(key, { count: 1, resetAt: now + 60_000 });
      return;
    }

    if (current.count >= 5) {
      current.blockedUntil = now + 5 * 60_000;
      throw new HttpException('Слишком много попыток. Попробуйте позже.', HttpStatus.TOO_MANY_REQUESTS);
    }

    current.count += 1;
  }

  private loginKey(username: string, ip?: string) {
    return `${username.trim().toLowerCase() || 'anonymous'}:${ip ?? 'unknown'}`;
  }

  private isDeviceChanged(savedUserAgent?: string | null, savedIp?: string | null, meta: RequestMeta = {}) {
    return Boolean((savedUserAgent && meta.userAgent && savedUserAgent !== meta.userAgent) || (savedIp && meta.ip && savedIp !== meta.ip));
  }

  private async logAuth(userId: string | null | undefined, action: string, meta: RequestMeta) {
    await this.prisma.authAuditLog.create({
      data: {
        userId,
        action,
        ip: meta.ip,
        userAgent: meta.userAgent,
      },
    });
  }
}
