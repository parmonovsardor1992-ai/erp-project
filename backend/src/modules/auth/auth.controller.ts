import { Body, Controller, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { RefreshDto } from './dto/refresh.dto';
import { AuthUser, RequestMeta } from './types';

type RequestLike = {
  ip?: string;
  socket?: { remoteAddress?: string };
  headers: Record<string, string | string[] | undefined>;
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto, @Req() request: RequestLike) {
    return this.authService.login(dto, this.meta(request));
  }

  @Public()
  @Post('refresh')
  refresh(@Body() dto: RefreshDto, @Req() request: RequestLike) {
    return this.authService.refresh(dto, this.meta(request));
  }

  @Public()
  @Post('logout')
  logout(@Body() dto: LogoutDto, @Req() request: RequestLike) {
    return this.authService.logout(dto, this.meta(request));
  }

  @Post('logout-all')
  logoutAll(@CurrentUser() user: AuthUser, @Req() request: RequestLike) {
    return this.authService.logoutAll(user.id, this.meta(request));
  }

  private meta(request: RequestLike): RequestMeta {
    const forwardedFor = request.headers['x-forwarded-for'];
    const ip = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor?.split(',')[0]?.trim();
    const userAgent = request.headers['user-agent'];
    return {
      ip: ip || request.ip || request.socket?.remoteAddress,
      userAgent: Array.isArray(userAgent) ? userAgent[0] : userAgent,
    };
  }
}
