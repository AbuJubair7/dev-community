import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { Community } from './community.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Prop } from '@nestjs/mongoose';
import { HydratedDocument, Types, Schema as MongooseSchema } from 'mongoose';
import { InviteStatus } from '../enums/invite-status.enum';

export type CommunityRequestDocument = HydratedDocument<CommunityRequest>;

@Schema({ timestamps: true })
export class CommunityRequest {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Community.name,
    required: true,
  })
  communityId!: Types.ObjectId | Community;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: User.name, required: true })
  userId!: Types.ObjectId | User;

  @Prop({ enum: InviteStatus, default: 'pending' })
  status!: InviteStatus;
}

export const CommunityRequestSchema =
  SchemaFactory.createForClass(CommunityRequest);
