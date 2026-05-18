import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PostDocument = HydratedDocument<Post>;

@Schema({ timestamps: true })
export class Post {
  @Prop({ type: String, primary: true })
  _id!: string;

  @Prop()
  userId!: string;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  content!: string;
}

export const PostSchema = SchemaFactory.createForClass(Post);
