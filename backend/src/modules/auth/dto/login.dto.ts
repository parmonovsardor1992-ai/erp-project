import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString({ message: 'Логин обязателен' })
  username!: string;

  @IsString({ message: 'Пароль обязателен' })
  @MinLength(1, { message: 'Пароль обязателен' })
  password!: string;
}
