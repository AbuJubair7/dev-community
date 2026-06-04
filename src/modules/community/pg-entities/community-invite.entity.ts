import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { InviteStatus } from '../enums/invite-status.enum';

@Entity('community_invites')
export class CommunityInviteEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  _id!: string;

  @Column({ type: 'uuid', nullable: false })
  communityId!: string;

  @Column({ type: 'uuid', nullable: false })
  inviterId!: string;

  @Column({ type: 'uuid', nullable: false })
  inviteeId!: string;

  @Column({
    type: 'enum',
    enum: InviteStatus,
    default: InviteStatus.PENDING,
  })
  status!: InviteStatus;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
