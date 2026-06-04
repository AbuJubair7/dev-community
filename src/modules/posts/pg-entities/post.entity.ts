import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PostStatus } from '../enums/post-status.enum';

@Entity('posts')
export class PostEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  _id!: string;

  @Column({ type: 'uuid', nullable: false })
  userId!: string;

  @Column({ type: 'uuid', nullable: false })
  communityId!: string;

  @Column({ type: 'varchar', nullable: false })
  title!: string;

  @Column({ type: 'text', nullable: false })
  content!: string;

  @Column({ type: 'timestamp', nullable: true })
  postAt?: Date;

  @Column({
    type: 'enum',
    enum: PostStatus,
    default: PostStatus.PUBLISHED,
  })
  status!: PostStatus;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
