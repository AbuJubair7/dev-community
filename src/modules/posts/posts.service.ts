import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post, PostDocument } from './entities/post.entity';
import { Model } from 'mongoose';
import { toObjectId } from '../../helpers/to-object-id';

@Injectable()
export class PostsService {
  constructor(@InjectModel(Post.name) private postModel: Model<Post>) {}

  private serializePost(post: PostDocument) {
    const serializedPost = post.toObject();

    return {
      ...serializedPost,
      _id: post._id.toString(),
      userId: post.userId.toString(),
    };
  }

  async create(createPostDto: CreatePostDto, userId: string) {
    const userObjectId = toObjectId(userId, 'user id');
    const createdPost = await this.postModel.create({
      ...createPostDto,
      userId: userObjectId,
    });
    return this.serializePost(createdPost);
  }

  async findAll() {
    const posts = await this.postModel.find().exec();
    return posts.map((post) => this.serializePost(post));
  }

  async findOne(id: string) {
    const post = await this.postModel.findById(id).exec();
    if (!post) throw new NotFoundException('Post not found');
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
    const post = await this.postModel
      .findOneAndDelete({ _id: postId, userId: userObjectId })
      .exec();
    if (!post) throw new NotFoundException('Post not found or not yours');
    return this.serializePost(post);
  }
}
