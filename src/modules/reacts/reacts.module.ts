import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReactsService } from './reacts.service';
import { ReactsController } from './reacts.controller';
import { PostReactEntity } from './pg-entities/post-react.entity';
import { CommentReactEntity } from './pg-entities/comment-react.entity';
import { PostEntity } from '../posts/pg-entities/post.entity';
import { UserEntity } from '../users/pg-entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PostReactEntity,
      CommentReactEntity,
      PostEntity,
      UserEntity,
    ]),
  ],
  controllers: [ReactsController],
  providers: [ReactsService],
  exports: [ReactsService],
})
export class ReactsModule {}
