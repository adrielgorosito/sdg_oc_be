import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  MinLength,
} from 'class-validator';

import { IsString } from 'class-validator';
import { Role } from 'src/user/entities/user.entity';

export class SignUpDTO {
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  username: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  //@IsStrongPassword()
  password: string;

  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsOptional()
  @IsEnum(Role)
  role: Role;
}
