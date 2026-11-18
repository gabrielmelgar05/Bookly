import { Transform } from 'class-transformer';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { LoginDto } from './login.dto.js';

export class RegisterDto extends LoginDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value,
  )
  @IsString({ message: 'Informe seu nome completo.' })
  @MinLength(2, { message: 'O nome deve ter pelo menos 2 caracteres.' })
  @MaxLength(100, { message: 'O nome deve ter até 100 caracteres.' })
  name!: string;

  @IsString({ message: 'Informe sua senha.' })
  @MaxLength(128, { message: 'A senha deve ter até 128 caracteres.' })
  @MinLength(15, { message: 'A senha deve ter pelo menos 15 caracteres.' })
  @Matches(/\S/, { message: 'A senha não pode conter apenas espaços.' })
  declare password: string;
}
