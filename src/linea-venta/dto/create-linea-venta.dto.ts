import { Type } from 'class-transformer';
import { IsNotEmpty, IsObject, ValidateNested } from 'class-validator';
import { BaseTransactionalDTO } from 'src/common/dtos/baseTransactional.dto';
import { RelationDTO } from 'src/common/dtos/relation.dto';
import { Column } from 'typeorm';

export class CreateLineaVentaDTO extends BaseTransactionalDTO {
  @IsNotEmpty()
  @Column()
  cantidad: number;

  @IsObject()
  @ValidateNested()
  @Type(() => RelationDTO)
  producto: RelationDTO;

  @IsNotEmpty()
  @Column()
  precioIndividual: number;
}
