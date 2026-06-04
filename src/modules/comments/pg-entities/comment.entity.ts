import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('comments')
export class CommentEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  _id!: string;

  @Column({ type: 'uuid', nullable: false })
  postId!: string;

  @Column({ type: 'uuid', nullable: false })
  userId!: string;

  @Column({ type: 'text', nullable: false })
  content!: string;

  @Column({ type: 'uuid', nullable: true, default: null })
  parentId!: string | null;

  @Column({ type: 'boolean', default: false })
  isDeleted!: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
