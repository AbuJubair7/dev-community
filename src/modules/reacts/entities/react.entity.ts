import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { User } from '../../users/entities/user.entity';
import { Post } from '../../posts/entities/post.entity';
import { Comment } from '../../comments/entities/comment.entity';

export type ReactDocument = HydratedDocument<React>;

export enum ReactState {
  LIKE = 'LIKE',
  DISLIKE = 'DISLIKE',
  NEUTRAL = 'NEUTRAL',
}

@Schema({ timestamps: true })
export class React {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: User.name, required: true })
  userId!: Types.ObjectId | User;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Post.name,
    required: false,
  })
  postId?: Types.ObjectId | Post;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Comment.name,
    required: false,
  })
  commentId?: Types.ObjectId | Comment;

  @Prop({
    type: String,
    enum: Object.values(ReactState),
    required: true,
    default: ReactState.NEUTRAL,
  })
  state!: ReactState;
}

export const ReactSchema = SchemaFactory.createForClass(React);
