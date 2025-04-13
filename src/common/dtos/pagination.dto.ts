import { IsOptional, IsPositive, IsString, Min } from 'class-validator';

export class PaginationDTO {
  @IsOptional()
  @IsPositive()
  limit?: number = 10;

  @IsOptional()
  @Min(0)
  offset?: number = 0;

  @IsOptional()
  @IsString()
  filtro?: string;
}
