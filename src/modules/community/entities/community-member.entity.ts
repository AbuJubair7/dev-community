import { Schema } from '@nestjs/mongoose';
import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { User } from 'src/modules/users/entities/user.entity';
import { Community } from './community.entity';
import { Role } from 'src/modules/users/enums/role.enum';

export type CommunityMemberDocument = HydratedDocument<CommunityMember>;

@Schema({ timestamps: true })
export class CommunityMember {
  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  communityId!: Types.ObjectId | Community;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  userId!: Types.ObjectId | User;

  @Prop({ enum: Role, default: Role.MEMBER })
  role!: Role;
}

export const CommunityMemberSchema =
  SchemaFactory.createForClass(CommunityMember);
