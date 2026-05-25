import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post, PostDocument } from './entities/post.entity';
import { Connection, Model } from 'mongoose';
import { toObjectId } from '../../helpers/to-object-id';
import { Role } from '../community/enums/role.enum';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectConnection() private connection: Connection,
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

    const createdPost = await this.postModel.create({
      ...createPostDto,
      userId: userObjectId,
      communityId: communityObjectId,
    });
    return this.serializePost(createdPost);
  }

  async findAll(userId: string) {
    const userObjectId = toObjectId(userId, 'user id');
    const communityMemberModel = this.connection.model('CommunityMember');
    const memberships = await communityMemberModel.find({ userId: userObjectId }).exec();
    const joinedCommunityIds = memberships.map((m) => m.communityId);

    const posts = await this.postModel.find({
      $or: [
        { communityId: { $in: joinedCommunityIds } },
        { communityId: { $exists: false } },
        { communityId: null },
      ],
    }).exec();

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
