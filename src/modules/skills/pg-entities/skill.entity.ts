import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('skills')
export class SkillEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  _id!: string;

  @Column({ type: 'uuid', nullable: false })
  userId!: string;

  @Column({ type: 'varchar', nullable: false })
  name!: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
