import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CommentDocument = HydratedDocument<Comment>;

@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: String, primary: true })
  _id!: string;

  @Prop()
  postId!: string;

  @Prop()
  userId!: string;

  @Prop({ required: true })
  content!: string;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
