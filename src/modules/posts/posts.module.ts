import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { Post, PostSchema } from './entities/post.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { PostSchedulerProcessor } from './post-scheduler.processor';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),

    // Register the 'post-scheduler' queue — BullMQ will store jobs in Redis
    BullModule.registerQueue({
      name: 'post-scheduler',
    }),
  ],
  controllers: [PostsController],
  // PostSchedulerProcessor must be a provider so NestJS can create it
  // and BullMQ can call its process() method
  providers: [PostsService, PostSchedulerProcessor],
})
export class PostsModule {}
