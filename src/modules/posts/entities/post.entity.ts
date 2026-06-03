import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { User } from '../../users/entities/user.entity';
import { Community } from 'src/modules/community/entities/community.entity';
import { PostStatus } from '../enums/post-status.enum';

export type PostDocument = HydratedDocument<Post>;

@Schema({ timestamps: true })
export class Post {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: User.name, required: true })
  userId!: Types.ObjectId | User;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Community.name,
    required: true,
  })
  communityId!: Types.ObjectId;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  content!: string;

  // Optional: when the post should go live
  @Prop({ type: Date, required: false })
  postAt?: Date;

  // Tracks whether the post is live or waiting to be published
  @Prop({
    type: String,
    enum: PostStatus,
    default: PostStatus.PUBLISHED,
  })
  status!: PostStatus;
}

export const PostSchema = SchemaFactory.createForClass(Post);

