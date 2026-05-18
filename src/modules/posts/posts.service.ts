import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';
import { Model } from 'mongoose';
import crypto from 'crypto';

@Injectable()
export class PostsService {
  constructor(@InjectModel(Post.name) private postModel: Model<Post>) {}

  async create(createPostDto: CreatePostDto, userId: string) {
    const createdPost = await this.postModel.create({
      _id: crypto.randomUUID(),
      ...createPostDto,
      userId,
    });
    return createdPost;
  }

  async findAll() {
    return await this.postModel.find().exec();
  }

  async findOne(id: string) {
    return await this.postModel.findById(id).exec();
  }

  async findOneByUserId(userId: string) {
    return await this.postModel.find({ userId }).exec();
  }

  async update(postId: string, userId: string, updatePostDto: UpdatePostDto) {
    const post = await this.postModel
      .findOneAndUpdate({ _id: postId, userId }, updatePostDto, { new: true })
      .exec();
    if (!post) throw new NotFoundException('Post not found or not yours');
    return post;
  }

  async remove(postId: string, userId: string) {
    const post = await this.postModel.findOneAndDelete({ _id: postId, userId }).exec();
    if (!post) throw new NotFoundException('Post not found or not yours');
    return post;
  }
}
