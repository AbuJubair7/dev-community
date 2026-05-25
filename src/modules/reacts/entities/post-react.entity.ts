import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { User } from '../../users/entities/user.entity';
import { Post } from '../../posts/entities/post.entity';
import { ReactState } from '../enums/react-state.enum';

export type PostReactDocument = HydratedDocument<PostReact>;

@Schema({ timestamps: true })
export class PostReact {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  userId!: Types.ObjectId | User;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Post.name,
    required: true,
  })
  postId!: Types.ObjectId | Post;

  @Prop({
    type: String,
    enum: Object.values(ReactState),
    required: true,
    default: ReactState.NEUTRAL,
  })
  state!: ReactState;
}

export const PostReactSchema = SchemaFactory.createForClass(PostReact);
