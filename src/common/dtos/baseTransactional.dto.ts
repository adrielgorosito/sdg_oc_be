import { IsOptional, IsUUID } from 'class-validator';

export abstract class BaseTransactionalDTO {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsOptional()
  createdAt?: Date;

  @IsOptional()
  updatedAt?: Date;
}
