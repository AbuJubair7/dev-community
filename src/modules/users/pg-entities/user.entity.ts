import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  _id!: string;
  @Column({ type: 'varchar', nullable: false })
  fname!: string;

  @Column({ type: 'varchar', nullable: false })
  lname!: string;

  @Column({ type: 'varchar', unique: true, nullable: false })
  email!: string;

  @Column({ type: 'varchar', nullable: false })
  password!: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
