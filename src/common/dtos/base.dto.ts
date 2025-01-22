import { IsOptional, IsNumber } from 'class-validator';

export abstract class BaseDTO {
  @IsNumber()
  @IsOptional()
  id?: number;

  @IsOptional()
  createdAt?: Date;

  @IsOptional()
  updatedAt?: Date;
}
