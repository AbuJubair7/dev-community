import { Injectable, Inject, OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  async addViewer(postId: string, userId: string): Promise<number> {
    const key = `post:${postId}:views`;
    return await this.redis.sadd(key, userId);
  }

  async getViewCount(postId: string): Promise<number> {
    const key = `post:${postId}:views`;
    return await this.redis.scard(key);
  }

  async getViewers(postId: string): Promise<string[]> {
    const key = `post:${postId}:views`;
    return await this.redis.smembers(key);
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }
}
