import { Type } from 'class-transformer';
import {
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { RelationTransactionalDTO } from 'src/common/dtos/relation-transactional.dto';

export class EmailDataDTO {
  @IsOptional()
  @IsString()
  email: string;

  @IsObject()
  @ValidateNested()
  @Type(() => RelationTransactionalDTO)
  comprobante: RelationTransactionalDTO;
}
