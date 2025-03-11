import { Column, Entity } from 'typeorm';

@Entity()
export class Token {
  @Column({ primary: true })
  id: number;

  @Column({ type: 'varchar', length: 4000 })
  token: string;

  @Column({ type: 'varchar', length: 4000 })
  sign: string;

  @Column({ type: 'datetime2' })
  tokenExpiration: Date;
}
