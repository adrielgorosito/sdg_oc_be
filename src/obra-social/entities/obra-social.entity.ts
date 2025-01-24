import { BaseEntity, Column } from 'typeorm';

export class ObraSocial extends BaseEntity {
  @Column()
  nombre: string;
}
