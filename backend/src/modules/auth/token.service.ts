import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';
import { AuthUser, JwtPayload } from './types';

@Injectable()
export class TokenService {
  constructor(private readonly config: ConfigService) {}

  sign(user: AuthUser): string {
    const issuedAt = Math.floor(Date.now() / 1000);
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      role: user.role,
      iat: issuedAt,
      exp: issuedAt + this.expiresInSeconds(),
    };
    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(payload));
    const signature = this.createSignature(`${encodedHeader}.${encodedPayload}`);
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  verify(token: string): JwtPayload {
    const [header, payload, signature] = token.split('.');
    if (!header || !payload || !signature) {
      throw new UnauthorizedException('Не авторизован');
    }

    const expected = this.createSignature(`${header}.${payload}`);
    const actualBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) {
      throw new UnauthorizedException('Не авторизован');
    }

    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as JwtPayload;
    if (!parsed.sub || !parsed.username || !parsed.role) {
      throw new UnauthorizedException('Не авторизован');
    }
    if (!parsed.exp || parsed.exp < Math.floor(Date.now() / 1000)) {
      throw new UnauthorizedException('Сессия истекла. Войдите снова.');
    }

    return parsed;
  }

  private createSignature(value: string): string {
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
