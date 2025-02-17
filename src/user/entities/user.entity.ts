import { Exclude } from 'class-transformer';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity } from 'typeorm';

export enum Role {
  User = 'user',
  Admin = 'admin',
}

@Entity()
export class User extends BaseEntity {
  @Column({ nullable: false, unique: true })
  username: string;

  @Column()
  nombre: string;

  @Exclude()
  @Column()
  password: string;

  @Column({ enum: Role, default: Role.User })
  role: Role;
}
