import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CommentDocument = HydratedDocument<Comment>;

@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: String, primary: true })
  _id!: string;

  @Prop({ required: true })
  postId!: string;

  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true })
  content!: string;

  @Prop({ type: String, default: null })
  parentId!: string | null;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
