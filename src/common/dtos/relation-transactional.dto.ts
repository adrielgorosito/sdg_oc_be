import { IsNotEmpty, IsUUID } from 'class-validator';

export class RelationTransactionalDTO {
  @IsNotEmpty()
  @IsUUID()
  id: string;
}
