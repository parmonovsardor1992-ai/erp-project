import { UserRole } from '@prisma/client';

export type AuthUser = {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
};

export type JwtPayload = {
  sub: string;
  username: string;
  role: UserRole;
  iat: number;
  exp: number;
};
