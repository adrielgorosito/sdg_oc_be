import { IsNotEmpty, IsNumber } from 'class-validator';

export class RelationDTO {
  @IsNotEmpty()
  @IsNumber()
  id: number;
}
