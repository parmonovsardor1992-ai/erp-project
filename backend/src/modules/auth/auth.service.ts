import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { PrismaService } from '../../common/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { AuthUser, JwtPayload } from './types';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        username: dto.username,
        deletedAt: null,
      },
    });

    if (!user || !this.verifyPassword(dto.password, user.passwordHash)) {
      throw new UnauthorizedException('Неверный логин или пароль');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Пользователь заблокирован');
    }

    const authUser: AuthUser = {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
    };

    return {
      accessToken: this.signToken(authUser),
      user: authUser,
    };
  }

  async validateToken(token: string): Promise<AuthUser> {
    const payload = this.verifyToken(token);
    const user = await this.prisma.user.findFirst({
      where: {
        id: payload.sub,
        isActive: true,
        deletedAt: null,
      },
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
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(password, salt, 64).toString('hex');
    return `scrypt:${salt}:${hash}`;
  }

  verifyPassword(password: string, storedHash: string): boolean {
    const [algorithm, salt, hash] = storedHash.split(':');
    if (algorithm !== 'scrypt' || !salt || !hash) {
      return false;
    }

    const calculated = scryptSync(password, salt, 64);
    const expected = Buffer.from(hash, 'hex');
    return calculated.length === expected.length && timingSafeEqual(calculated, expected);
  }

  private signToken(user: AuthUser): string {
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + this.expiresInSeconds(),
    };
    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(payload));
    const signature = this.sign(`${encodedHeader}.${encodedPayload}`);
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  private verifyToken(token: string): JwtPayload {
    const [header, payload, signature] = token.split('.');
    if (!header || !payload || !signature) {
      throw new UnauthorizedException('Нет доступа');
    }

    const expected = this.sign(`${header}.${payload}`);
    const actualBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) {
      throw new UnauthorizedException('Нет доступа');
    }

    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as JwtPayload;
    if (!parsed.sub || !parsed.username || !parsed.role || parsed.exp < Math.floor(Date.now() / 1000)) {
      throw new UnauthorizedException('Нет доступа');
    }

    return parsed;
  }

  private sign(value: string): string {
    return createHmac('sha256', this.jwtSecret()).update(value).digest('base64url');
  }

  private base64UrlEncode(value: string): string {
    return Buffer.from(value).toString('base64url');
  }

  private jwtSecret(): string {
    return this.config.get<string>('JWT_SECRET') ?? 'change-me';
  }

  private expiresInSeconds(): number {
    const value = this.config.get<string>('JWT_EXPIRES_IN') ?? '1d';
    if (value.endsWith('d')) return Number(value.slice(0, -1)) * 24 * 60 * 60;
    if (value.endsWith('h')) return Number(value.slice(0, -1)) * 60 * 60;
    if (value.endsWith('m')) return Number(value.slice(0, -1)) * 60;
    return Number(value) || 24 * 60 * 60;
  }
}
