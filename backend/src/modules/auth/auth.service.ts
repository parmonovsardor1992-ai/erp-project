import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';
import { AuthUser } from './types';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        username: dto.username,
        deletedAt: null,
      },
    });

    if (!user || !this.passwordService.verify(dto.password, user.passwordHash)) {
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
      accessToken: this.tokenService.sign(authUser),
      user: authUser,
    };
  }

  async validateToken(token: string): Promise<AuthUser> {
    const payload = this.tokenService.verify(token);
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
    return this.passwordService.hash(password);
  }
}
