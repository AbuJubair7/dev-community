import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostEntity } from './pg-entities/post.entity';
import { PostStatus } from './enums/post-status.enum';

@Processor('post-scheduler')
export class PostSchedulerProcessor extends WorkerHost {
  constructor(
    @InjectRepository(PostEntity)
    private postRepository: Repository<PostEntity>,
  ) {
    super();
  }

  // This method runs automatically when the scheduled delay expires
  async process(job: Job<{ postId: string }>): Promise<void> {
    const { postId } = job.data;

    console.log(`⏰ Scheduled post time arrived! Publishing post: ${postId}`);

    // Update the post status
    const post = await this.postRepository.findOne({ where: { _id: postId } });
    if (post) {
      post.status = PostStatus.PUBLISHED;
      await this.postRepository.save(post);
      console.log(`✅ Post ${postId} is now published!`);
    } else {
      console.log(`❌ Post ${postId} not found!`);
    }
  }
}
