import { Prop } from '@nestjs/mongoose';
import { Schema } from '@nestjs/mongoose';
import { HydratedDocument, Types, Schema as MongooseSchema } from 'mongoose';
import { User } from 'src/modules/users/entities/user.entity';
import { InviteStatus } from '../enums/invite-status.enum';

export type CommunityInviteDocument = HydratedDocument<CommunityInvite>;

@Schema({ timestamps: true })
export class CommunityInvite {
  @Prop({ required: true })
  communityId!: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: User.name, required: true })
  inviterId!: Types.ObjectId | User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: User.name, required: true })
  inviteeId!: Types.ObjectId | User;

  @Prop({ enum: InviteStatus, default: InviteStatus.PENDING })
  status!: InviteStatus;
}
