import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CommunityDocument = HydratedDocument<Community>;

@Schema({ timestamps: true })
export class Community {
  @Prop({ required: true })
  name!: string;

  @Prop()
  description!: string;
}

export const CommunitySchema = SchemaFactory.createForClass(Community);
