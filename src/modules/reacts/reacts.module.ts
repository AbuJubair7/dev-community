import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReactsService } from './reacts.service';
import { ReactsController } from './reacts.controller';
import { PostReact, PostReactSchema } from './entities/post-react.entity';
import {
  CommentReact,
  CommentReactSchema,
} from './entities/comment-react.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PostReact.name, schema: PostReactSchema },
      { name: CommentReact.name, schema: CommentReactSchema },
    ]),
  ],
  controllers: [ReactsController],
  providers: [ReactsService],
})
export class ReactsModule {}
