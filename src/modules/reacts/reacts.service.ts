import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePostReactDto } from './dto/create-post-react.dto';
import { UpdatePostReactDto } from './dto/update-post-react.dto.';
import { CreateCommentReactDto } from './dto/create-comment-react.dto';
import { UpdateCommentReactDto } from './dto/update-comment-react.dto';
import { PostReact, PostReactDocument } from './entities/post-react.entity';
import {
  CommentReact,
  CommentReactDocument,
} from './entities/comment-react.entity';
import { toObjectId } from '../../helpers/to-object-id';
import { ReactState } from './enums/react-state.enum';

@Injectable()
export class ReactsService {
  constructor(
    @InjectModel(PostReact.name) private postReactModel: Model<PostReact>,
    @InjectModel(CommentReact.name)
    private commentReactModel: Model<CommentReact>,
  ) {}

  private serializePostReact(react: PostReactDocument) {
    const obj = react.toObject();
    return {
      ...obj,
      _id: react._id.toString(),
      userId: obj.userId.toString(),
      postId: obj.postId.toString(),
    };
  }

  private serializeCommentReact(react: CommentReactDocument) {
    const obj = react.toObject();
    return {
      ...obj,
      _id: react._id.toString(),
      userId: obj.userId.toString(),
      commentId: obj.commentId.toString(),
    };
  }

  // ─── Post Reacts ────

  async createPostReact(createPostReactDto: CreatePostReactDto) {
    const userId = toObjectId(createPostReactDto.userId, 'user id');
    const postId = toObjectId(createPostReactDto.postId, 'post id');

    const existingReact = await this.postReactModel
      .findOne({ userId, postId })
      .exec();

    if (existingReact) {
      if (existingReact.state !== createPostReactDto.state) {
        existingReact.state = createPostReactDto.state;
        await existingReact.save();
        return this.serializePostReact(existingReact);
      } else {
        return this.serializePostReact(existingReact);
      }
    }
    const newReact = await this.postReactModel.create({
      ...createPostReactDto,
      userId,
      postId,
    });

    return this.serializePostReact(newReact);
  }

  // return count of reacts for each state
  async findAllPostReacts(postId: string) {
    const postObjectId = toObjectId(postId, 'post id');
    const likeCount = await this.postReactModel
      .countDocuments({ postId: postObjectId, state: ReactState.LIKE })
      .exec();
    const dislikeCount = await this.postReactModel
      .countDocuments({ postId: postObjectId, state: ReactState.DISLIKE })
      .exec();
    return { likeCount, dislikeCount };
  }

  async findOnePostReact(id: string) {
    const react = await this.postReactModel.findById(id).exec();
    if (!react) throw new NotFoundException('Post react not found');
    return this.serializePostReact(react);
  }

  async updatePostReact(
    postId: string,
    userId: string,
    updatePostReactDto: UpdatePostReactDto,
  ) {
    const postObjectId = toObjectId(postId, 'post id');
    const userObjectId = toObjectId(userId, 'user id');
    const react = await this.postReactModel
      .findOneAndUpdate(
        { postId: postObjectId, userId: userObjectId },
        updatePostReactDto,
        {
          new: true,
        },
      )
      .exec();
    if (!react)
      throw new NotFoundException('Post react not found or not yours');
    return this.serializePostReact(react);
  }

  async removePostReact(id: string, userId: string) {
    const userObjectId = toObjectId(userId, 'user id');
    const react = await this.postReactModel
      .findOneAndDelete({ _id: id, userId: userObjectId })
      .exec();
    if (!react)
      throw new NotFoundException('Post react not found or not yours');
    return this.serializePostReact(react);
  }

  // ─── Comment Reacts ────

  async createCommentReact(createCommentReactDto: CreateCommentReactDto) {
    const userId = toObjectId(createCommentReactDto.userId, 'user id');
    const commentId = toObjectId(createCommentReactDto.commentId, 'comment id');

    const existingReact = await this.commentReactModel
      .findOne({ userId, commentId })
      .exec();

    if (existingReact) {
      if (existingReact.state !== createCommentReactDto.state) {
        existingReact.state = createCommentReactDto.state;
        await existingReact.save();
        return this.serializeCommentReact(existingReact);
      } else {
        return this.serializeCommentReact(existingReact);
      }
    }

    const newReact = await this.commentReactModel.create({
      ...createCommentReactDto,
      userId,
      commentId,
    });
    return this.serializeCommentReact(newReact);
  }

  // return count of reacts for each state
  async findAllCommentReacts(commentId: string) {
    const commentObjectId = toObjectId(commentId, 'comment id');
    const likeCount = await this.commentReactModel
      .countDocuments({ commentId: commentObjectId, state: ReactState.LIKE })
      .exec();
    const dislikeCount = await this.commentReactModel
      .countDocuments({ commentId: commentObjectId, state: ReactState.DISLIKE })
      .exec();
    return { likeCount, dislikeCount };
  }

  async findOneCommentReact(id: string) {
    const react = await this.commentReactModel.findById(id).exec();
    if (!react) throw new NotFoundException('Comment react not found');
    return this.serializeCommentReact(react);
  }

  async updateCommentReact(
    commentId: string,
    userId: string,
    updateCommentReactDto: UpdateCommentReactDto,
  ) {
    const commentObjectId = toObjectId(commentId, 'comment id');
    const userObjectId = toObjectId(userId, 'user id');
    const react = await this.commentReactModel
      .findOneAndUpdate(
        { commentId: commentObjectId, userId: userObjectId },
        updateCommentReactDto,
        { new: true },
      )
      .exec();
    if (!react)
      throw new NotFoundException('Comment react not found or not yours');
    return this.serializeCommentReact(react);
  }

  async removeCommentReact(id: string, userId: string) {
    const userObjectId = toObjectId(userId, 'user id');
    const react = await this.commentReactModel
      .findOneAndDelete({ _id: id, userId: userObjectId })
      .exec();
    if (!react)
      throw new NotFoundException('Comment react not found or not yours');
    return this.serializeCommentReact(react);
  }
}
