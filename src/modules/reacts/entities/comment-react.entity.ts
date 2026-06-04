import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { User } from '../../users/entities/user.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { ReactState } from '../enums/react-state.enum';

export type CommentReactDocument = HydratedDocument<CommentReact>;

@Schema({ timestamps: true })
export class CommentReact {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  userId!: Types.ObjectId | User;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Comment.name,
    required: true,
  })
  commentId!: Types.ObjectId | Comment;

  @Prop({
    type: String,
    enum: Object.values(ReactState),
    required: true,
    default: ReactState.NEUTRAL,
  })
  state!: ReactState;
}

export const CommentReactSchema = SchemaFactory.createForClass(CommentReact);
