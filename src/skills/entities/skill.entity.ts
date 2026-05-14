import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SkillDocument = HydratedDocument<Skill>;

@Schema({ timestamps: true })
export class Skill {
  @Prop({ type: String, primary: true })
  _id!: string;

  @Prop({ type: String, ref: 'User', required: true })
  userId!: string;

  @Prop({ required: true })
  name!: string;
}

export const SkillSchema = SchemaFactory.createForClass(Skill);
