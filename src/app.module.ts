import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { SkillsModule } from './modules/skills/skills.module';
import { ExperiencesModule } from './modules/experiences/experiences.module';
import { PostsModule } from './modules/posts/posts.module';
import { CommentsModule } from './modules/comments/comments.module';
import { ReactsModule } from './modules/reacts/reacts.module';
import { CommunityModule } from './modules/community/community.module';
import { dbConfig } from './config/db';
import { TypeOrmModule } from '@nestjs/typeorm';
import 'dotenv/config';

@Module({
  imports: [
    TypeOrmModule.forRoot(dbConfig),
    MongooseModule.forRoot(process.env.MONGO_URI as string),

    // Global BullMQ setup — all queues across all modules share this connection
    // connection.url points to our Upstash Redis instance
    // enableOfflineQueue: true → allow queueing commands during reconnection (prevent console spam)
    // keepAlive: 30000 → enables TCP keep-alive probes every 30s to prevent idle connection resets
    // noDelay: true → disables Nagle's algorithm for low-latency command execution
    BullModule.forRoot({
      connection: {
        url: process.env.REDIS_URL,
        enableOfflineQueue: true,
        keepAlive: 30000,
        noDelay: true,
      },
    }),

    UsersModule,
    AuthModule,
    SkillsModule,
    ExperiencesModule,
    PostsModule,
    CommentsModule,
    ReactsModule,
    CommunityModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
