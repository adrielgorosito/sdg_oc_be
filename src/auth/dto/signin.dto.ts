import { IsNotEmpty } from 'class-validator';

import { IsString } from 'class-validator';

export class SignInDTO {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
