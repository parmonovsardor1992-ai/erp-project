import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class MockAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user?: { id: string; role: string } }>();
    request.user ??= { id: 'system', role: 'admin' };

    if (!request.user) {
      throw new UnauthorizedException('Пользователь не авторизован');
    }

    return true;
  }
}
