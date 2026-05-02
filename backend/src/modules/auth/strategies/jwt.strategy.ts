import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy {
  constructor(private readonly authService: AuthService) {}

  validate(token: string) {
    return this.authService.validateToken(token);
  }
}
