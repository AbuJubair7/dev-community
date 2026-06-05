import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import Redis from 'ioredis';
import 'dotenv/config';

@Module({
  providers: [
    RedisService,
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        return new Redis(process.env.REDIS_URL as string, {
          enableOfflineQueue: true,
          keepAlive: 30000,
          noDelay: true,
        });
      },
    },
  ],
  exports: [RedisService],
})
export class RedisModule {}
