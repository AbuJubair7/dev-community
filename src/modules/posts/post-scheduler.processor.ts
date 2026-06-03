import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post } from './entities/post.entity';
import { PostStatus } from './enums/post-status.enum';

// @Processor links this class to the 'post-scheduler' queue in BullMQ
// When BullMQ fires a job from that queue, it calls process() below
@Processor('post-scheduler')
export class PostSchedulerProcessor extends WorkerHost {
  constructor(@InjectModel(Post.name) private postModel: Model<Post>) {
    super();
  }

  // This method runs automatically when the scheduled delay expires
  // job.data contains whatever we passed when we added the job to the queue
  async process(job: Job<{ postId: string }>): Promise<void> {
    const { postId } = job.data;

    console.log(`⏰ Scheduled post time arrived! Publishing post: ${postId}`);

    // Update the post status
    await this.postModel.findByIdAndUpdate(postId, {
      status: PostStatus.PUBLISHED,
    });

    console.log(`✅ Post ${postId} is now published!`);
  }
}
