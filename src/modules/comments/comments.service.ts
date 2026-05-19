import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { buildTree } from 'src/helpers/comments-tree';
import crypto from 'crypto';
import { updateReplyStatus } from 'src/helpers/update-reply-status';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
  ) {}

  async create(createCommentDto: CreateCommentDto, userId: string) {
    const { postId, content, parentId = null } = createCommentDto;

    if (parentId) {
      const parent = await this.commentModel.findById(parentId).exec();
      if (!parent) throw new NotFoundException('Parent comment not found');
    }

    const comment = await this.commentModel.create({
      _id: crypto.randomUUID(),
      postId,
      userId,
      content,
      parentId,
    });

    return comment;
  }

  async findAllByPost(postId: string) {
    const all = await this.commentModel
      .find({ postId })
      .sort({ createdAt: 1 })
      .lean()
      .exec();

    return buildTree(all);
  }

  async findOne(id: string) {
    const comment = await this.commentModel.findById(id).exec();
    if (!comment) throw new NotFoundException('Comment not found');
    return comment;
  }

  async update(id: string, userId: string, updateCommentDto: UpdateCommentDto) {
    const comment = await this.commentModel
      .findOneAndUpdate({ _id: id, userId }, updateCommentDto, { new: true })
      .exec();

    if (!comment)
      throw new ForbiddenException('Comment not found or not yours');
    return comment;
  }

  async remove(id: string, userId: string) {
    const comment = await this.commentModel
      .findOneAndUpdate(
        { _id: id, userId },
        { isDeleted: true, content: '[This comment has been deleted]' },
        { new: true }
      )
      .exec();

    if (!comment)
      throw new ForbiddenException('Comment not found or not yours');

    // Cascade soft-delete all replies recursively
    // await updateReplyStatus(id, this.commentModel);

    return { message: 'Comment deleted successfully' };
  }
}
