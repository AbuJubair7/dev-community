import { Injectable } from '@nestjs/common';
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

  async update(id: string, updatePostDto: UpdatePostDto) {
    return await this.postModel
      .findByIdAndUpdate(id, updatePostDto, { new: true })
      .exec();
  }

  async remove(id: string) {
    return await this.postModel.findByIdAndDelete(id).exec();
  }
}
