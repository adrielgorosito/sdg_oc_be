import { IsIn, IsNumber, IsOptional } from 'class-validator';
import { PaginationDTO } from 'src/common/dtos/pagination.dto';

export class PaginateCCDTO extends PaginationDTO {
  @IsNumber()
  @IsOptional()
  @IsIn([0, 1])
  estado?: number;
}
