import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ExperienceDocument = HydratedDocument<Experience>;

@Schema()
export class Experience {
  @Prop({ type: String, primary: true })
  _id!: string;

  @Prop({ type: String, ref: 'User', required: true })
  userId!: string;

  @Prop({ required: true })
  companyName!: string;

  @Prop({ required: true })
  role!: string;

  @Prop({ required: true })
  startDate!: Date;

  @Prop()
  endDate?: Date;

  @Prop()
  description?: string;
}

export const ExperienceSchema = SchemaFactory.createForClass(Experience);
