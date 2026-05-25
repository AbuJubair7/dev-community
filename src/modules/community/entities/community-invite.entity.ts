import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { Schema } from '@nestjs/mongoose';
import { HydratedDocument, Types, Schema as MongooseSchema } from 'mongoose';
import { User } from 'src/modules/users/entities/user.entity';
import { InviteStatus } from '../enums/invite-status.enum';
import { Community } from './community.entity';

export type CommunityInviteDocument = HydratedDocument<CommunityInvite>;

@Schema({ timestamps: true })
export class CommunityInvite {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: Community.name, required: true })
  communityId!: Types.ObjectId | Community;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: User.name, required: true })
  inviterId!: Types.ObjectId | User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: User.name, required: true })
  inviteeId!: Types.ObjectId | User;

  @Prop({ enum: InviteStatus, default: InviteStatus.PENDING })
  status!: InviteStatus;
}

export const CommunityInviteSchema =
  SchemaFactory.createForClass(CommunityInvite);
