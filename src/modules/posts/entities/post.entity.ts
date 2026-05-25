import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { User } from '../../users/entities/user.entity';
import { Community } from 'src/modules/community/entities/community.entity';

export type PostDocument = HydratedDocument<Post>;

@Schema({ timestamps: true })
export class Post {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: User.name, required: true })
  userId!: Types.ObjectId | User;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Community.name,
    required: true,
  })
  communityId!: Types.ObjectId;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  content!: string;
}

export const PostSchema = SchemaFactory.createForClass(Post);
