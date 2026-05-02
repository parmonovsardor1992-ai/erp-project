import { IsString } from 'class-validator';

export class LogoutDto {
  @IsString({ message: 'Refresh token обязателен' })
  refreshToken!: string;
}
