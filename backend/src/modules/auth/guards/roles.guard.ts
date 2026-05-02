import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AuthUser } from '../types';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ method: string; route?: { path?: string }; path: string; user?: AuthUser }>();
    const user = request.user;
    if (!user) {
      throw new ForbiddenException('Нет доступа');
    }

    const explicitRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [context.getHandler(), context.getClass()]);
    if (explicitRoles?.length) {
      return this.allow(user.role, explicitRoles);
    }

    return this.allowByEndpoint(user.role, request.method, request.path);
  }

  private allow(role: UserRole, roles: UserRole[]) {
    if (role === UserRole.ADMIN || roles.includes(role)) {
      return true;
    }

    throw new ForbiddenException('Нет доступа');
  }

  private allowByEndpoint(role: UserRole, method: string, path: string) {
    if (role === UserRole.ADMIN) return true;
    if (role === UserRole.VIEWER) return method === 'GET' || this.deny();

    const normalized = path.replace(/^\/api/, '');
    const first = normalized.split('/').filter(Boolean)[0] ?? '';

    if (role === UserRole.ACCOUNTANT) {
      const allowed = [
        'dashboard',
        'transactions',
        'cash',
        'bank',
        'card',
        'exchanges',
        'balances',
        'salary',
        'salary-accruals',
        'utility-accruals',
        'other-counterparties',
        'orders',
        'counterparties',
        'dictionaries',
        'directories',
        'currency-rates',
        'rates',
        'period-locks',
      ];
      if (!allowed.includes(first)) return this.deny();
      if (first === 'orders') return method === 'GET' || this.deny();
      if (first === 'period-locks') return method === 'GET' || this.deny();
      return true;
    }

    if (role === UserRole.MANAGER) {
      if (first === 'orders') return true;
      if (['dashboard', 'counterparties', 'dictionaries', 'directories'].includes(first)) return method === 'GET' || this.deny();
    }

    return this.deny();
  }

  private deny(): never {
    throw new ForbiddenException('Нет доступа');
  }
}
