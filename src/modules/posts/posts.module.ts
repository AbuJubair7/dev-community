import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PostEntity } from './pg-entities/post.entity';
import { CommunityMemberEntity } from '../community/pg-entities/community-member.entity';
import { BullModule } from '@nestjs/bullmq';
import { PostSchedulerProcessor } from './post-scheduler.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostEntity, CommunityMemberEntity]),

    // Register the 'post-scheduler' queue — BullMQ will store jobs in Redis
    BullModule.registerQueue({
      name: 'post-scheduler',
    }),
  ],
  controllers: [PostsController],
  // PostSchedulerProcessor must be a provider so NestJS can create it
  // and BullMQ can call its process() method
  providers: [PostsService, PostSchedulerProcessor],
  exports: [PostsService],
})
export class PostsModule {}
