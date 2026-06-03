import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post, PostDocument } from './entities/post.entity';
import { PostStatus } from './enums/post-status.enum';
import { Connection, Model } from 'mongoose';
import { toObjectId } from '../../helpers/to-object-id';
import { Role } from '../community/enums/role.enum';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectConnection() private connection: Connection,
    // Inject the BullMQ queue — 'post-scheduler' matches the name in posts.module.ts
    @InjectQueue('post-scheduler') private postSchedulerQueue: Queue,
  ) {}

  private serializePost(post: PostDocument) {
    const serializedPost = post.toObject();

    return {
      ...serializedPost,
      _id: post._id.toString(),
      userId: post.userId.toString(),
      communityId: post.communityId ? post.communityId.toString() : undefined,
    };
  }

  async create(createPostDto: CreatePostDto, userId: string) {
    const userObjectId = toObjectId(userId, 'user id');
    const communityObjectId = toObjectId(
      createPostDto.communityId,
      'community id',
    );

    // Verify user is a member of the community
    const communityMemberModel = this.connection.model('CommunityMember');
    const member = await communityMemberModel
      .findOne({
        communityId: communityObjectId,
        userId: userObjectId,
      })
      .exec();

    if (!member) {
      throw new ForbiddenException(
        'You must be a member of the community to create a post in it',
      );
    }

    // ── Scheduling Logic ─────────────────────────────────────────────────
    // Check if the user provided a postAt date AND it is in the future
    const postAtDate = createPostDto.postAt
      ? new Date(createPostDto.postAt)
      : null;
    const isScheduled = postAtDate && postAtDate.getTime() > Date.now();

    // Save the post to MongoDB
    // If scheduled → status: 'scheduled', else → status: 'published' (default)
    const createdPost = await this.postModel.create({
      ...createPostDto,
      userId: userObjectId,
      communityId: communityObjectId,
      postAt: postAtDate ?? undefined,
      status: isScheduled ? PostStatus.SCHEDULED : PostStatus.PUBLISHED,
    });

    if (isScheduled && postAtDate) {
      // Calculate how many milliseconds from NOW until postAt
      const delayMs = postAtDate.getTime() - Date.now();

      // Add a job to the BullMQ queue with the delay
      // BullMQ stores this in Redis and waits until delayMs has passed
      // then calls PostSchedulerProcessor.process() automatically
      await this.postSchedulerQueue.add(
        'publish-post', // job name (for identification)
        { postId: createdPost._id.toString() }, // data passed to the processor
        { delay: delayMs }, // wait this many ms before firing
      );

      console.log(
        `📅 Post "${createdPost.title}" scheduled for ${postAtDate.toISOString()} (in ${Math.round(delayMs / 1000)}s)`,
      );
    }
    // ─────────────────────────────────────────────────────────────────────

    return this.serializePost(createdPost);
  }

  async findAll(userId: string) {
    const userObjectId = toObjectId(userId, 'user id');
    const communityMemberModel = this.connection.model('CommunityMember');
    const memberships = await communityMemberModel
      .find({ userId: userObjectId })
      .exec();
    const joinedCommunityIds = memberships.map((m) => m.communityId);

    const posts = await this.postModel
      .find({
        $or: [
          { communityId: { $in: joinedCommunityIds } },
          { communityId: { $exists: false } },
          { communityId: null },
        ],
      })
      .exec();

    return posts.map((post) => this.serializePost(post));
  }

  async findOne(id: string, userId: string) {
    const post = await this.postModel.findById(id).exec();
    if (!post) throw new NotFoundException('Post not found');

    if (post.communityId) {
      const userObjectId = toObjectId(userId, 'user id');
      const communityMemberModel = this.connection.model('CommunityMember');
      const member = await communityMemberModel
        .findOne({
          communityId: post.communityId,
          userId: userObjectId,
        })
        .exec();

      if (!member) {
        throw new ForbiddenException(
          'You must be a member of the community to view this post',
        );
      }
    }

    return this.serializePost(post);
  }

  async findOneByUserId(userId: string) {
    const userObjectId = toObjectId(userId, 'user id');
    const posts = await this.postModel.find({ userId: userObjectId }).exec();
    return posts.map((post) => this.serializePost(post));
  }

  async update(postId: string, userId: string, updatePostDto: UpdatePostDto) {
    const userObjectId = toObjectId(userId, 'user id');
    const post = await this.postModel
      .findOneAndUpdate({ _id: postId, userId: userObjectId }, updatePostDto, {
        new: true,
      })
      .exec();
    if (!post) throw new NotFoundException('Post not found or not yours');
    return this.serializePost(post);
  }

  async remove(postId: string, userId: string) {
    const userObjectId = toObjectId(userId, 'user id');
    const post = await this.postModel.findById(postId).exec();
    if (!post) throw new NotFoundException('Post not found');

    const isOwner = post.userId.toString() === userObjectId.toString();
    let isAllowed = isOwner;

    if (!isAllowed && post.communityId) {
      // Check if user is admin or moderator in the community the post belongs to
      const communityMemberModel = this.connection.model('CommunityMember');
      const member = await communityMemberModel
        .findOne({
          communityId: post.communityId,
          userId: userObjectId,
        })
        .exec();

      if (
        member &&
        (member.role === Role.ADMIN || member.role === Role.MODERATOR)
      ) {
        isAllowed = true;
      }
    }

    if (!isAllowed) {
      throw new ForbiddenException(
        'You do not have permission to delete this post',
      );
    }

    await this.postModel.findByIdAndDelete(postId).exec();
    return this.serializePost(post);
  }
}
