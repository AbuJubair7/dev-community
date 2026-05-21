import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { Post } from '../../posts/entities/post.entity';
import { User } from '../../users/entities/user.entity';

export type CommentDocument = HydratedDocument<Comment>;

@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: Post.name, required: true })
  postId!: Types.ObjectId | Post;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: User.name, required: true })
  userId!: Types.ObjectId | User;

  @Prop({ required: true })
  content!: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Comment', default: null })
  parentId!: Types.ObjectId | Comment | null;

  @Prop({ type: Boolean, default: false })
  isDeleted!: boolean;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
