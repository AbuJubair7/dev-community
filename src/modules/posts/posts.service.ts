import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostEntity } from './pg-entities/post.entity';
import { CommunityMemberEntity } from '../community/pg-entities/community-member.entity';
import { PostStatus } from './enums/post-status.enum';
import { In, IsNull, Repository } from 'typeorm';
import { validateUuid } from '../../helpers/validate-uuid';
import { Role } from '../community/enums/role.enum';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostEntity)
    private postRepository: Repository<PostEntity>,
    @InjectRepository(CommunityMemberEntity)
    private communityMemberRepository: Repository<CommunityMemberEntity>,
    // Inject the BullMQ queue — 'post-scheduler' matches the name in posts.module.ts
    @InjectQueue('post-scheduler') private postSchedulerQueue: Queue,
  ) {}

  async create(createPostDto: CreatePostDto, userId: string) {
    const userObjectId = validateUuid(userId, 'user id');
    const communityObjectId = validateUuid(
      createPostDto.communityId,
      'community id',
    );

    // Verify user is a member of the community
    const member = await this.communityMemberRepository.findOne({
      where: {
        communityId: communityObjectId,
        userId: userObjectId,
      },
    });

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

    // Save the post
    // If scheduled → status: 'scheduled', else → status: 'published' (default)
    const createdPost = this.postRepository.create({
      ...createPostDto,
      userId: userObjectId,
      communityId: communityObjectId,
      postAt: postAtDate ?? undefined,
      status: isScheduled ? PostStatus.SCHEDULED : PostStatus.PUBLISHED,
    });
    const savedPost = await this.postRepository.save(createdPost);

    if (isScheduled && postAtDate) {
      // Calculate how many milliseconds from NOW until postAt
      const delayMs = postAtDate.getTime() - Date.now();

      // Add a job to the BullMQ queue with the delay
      await this.postSchedulerQueue.add(
        'publish-post', // job name
        { postId: savedPost._id }, // data passed to the processor
        { delay: delayMs }, // wait this many ms before firing
      );

      console.log(
        `📅 Post "${savedPost.title}" scheduled for ${postAtDate.toISOString()} (in ${Math.round(delayMs / 1000)}s)`,
      );
    }
    // ─────────────────────────────────────────────────────────────────────

    return savedPost;
  }

  async findAll(userId: string) {
    const userObjectId = validateUuid(userId, 'user id');
    const memberships = await this.communityMemberRepository.find({
      where: { userId: userObjectId },
    });
    const joinedCommunityIds = memberships.map((m) => m.communityId);

    const whereConditions: any[] = [{ communityId: IsNull() }];
    if (joinedCommunityIds.length > 0) {
      whereConditions.push({ communityId: In(joinedCommunityIds) });
    }

    return await this.postRepository.find({
      where: whereConditions,
    });
  }

  async findOne(id: string, userId: string) {
    validateUuid(id, 'post id');
    const post = await this.postRepository.findOne({ where: { _id: id } });
    if (!post) throw new NotFoundException('Post not found');

    if (post.communityId) {
      const userObjectId = validateUuid(userId, 'user id');
      const member = await this.communityMemberRepository.findOne({
        where: {
          communityId: post.communityId,
          userId: userObjectId,
        },
      });

      if (!member) {
        throw new ForbiddenException(
          'You must be a member of the community to view this post',
        );
      }
    }

    return post;
  }

  async findOneByUserId(userId: string) {
    const userObjectId = validateUuid(userId, 'user id');
    return await this.postRepository.find({ where: { userId: userObjectId } });
  }

  async update(postId: string, userId: string, updatePostDto: UpdatePostDto) {
    validateUuid(postId, 'post id');
    const userObjectId = validateUuid(userId, 'user id');

    const post = await this.postRepository.findOne({
      where: { _id: postId, userId: userObjectId },
    });
    if (!post) throw new NotFoundException('Post not found or not yours');

    Object.assign(post, updatePostDto);
    return await this.postRepository.save(post);
  }

  async remove(postId: string, userId: string) {
    validateUuid(postId, 'post id');
    const userObjectId = validateUuid(userId, 'user id');

    const post = await this.postRepository.findOne({ where: { _id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    const isOwner = post.userId === userObjectId;
    let isAllowed = isOwner;

    if (!isAllowed && post.communityId) {
      // Check if user is admin or moderator in the community the post belongs to
      const member = await this.communityMemberRepository.findOne({
        where: {
          communityId: post.communityId,
          userId: userObjectId,
        },
      });

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

    await this.postRepository.remove(post);
    return post;
  }
}
