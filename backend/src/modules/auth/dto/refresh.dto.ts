import { IsString } from 'class-validator';

export class RefreshDto {
  @IsString({ message: 'Refresh token обязателен' })
  refreshToken!: string;
}
