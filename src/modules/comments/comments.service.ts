import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment, CommentDocument } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { buildTree } from 'src/helpers/comments-tree';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
  ) {}

  private serializeComment(comment: CommentDocument) {
    const serializedComment = comment.toObject();

    return {
      ...serializedComment,
      _id: comment._id.toString(),
      postId: comment.postId.toString(),
      userId: comment.userId.toString(),
      parentId: comment.parentId ? comment.parentId.toString() : null,
    };
  }

  private toObjectId(id: string, fieldName: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid ${fieldName}`);
    }

    return new Types.ObjectId(id);
  }

  async create(createCommentDto: CreateCommentDto, userId: string) {
    const { postId, content, parentId = null } = createCommentDto;
    const postObjectId = this.toObjectId(postId, 'post id');
    const userObjectId = this.toObjectId(userId, 'user id');
    const parentObjectId = parentId
      ? this.toObjectId(parentId, 'parent comment id')
      : null;

    if (parentObjectId) {
      const parent = await this.commentModel.findById(parentObjectId).exec();
      if (!parent) throw new NotFoundException('Parent comment not found');

      if (parent.postId.toString() !== postObjectId.toString()) {
        throw new BadRequestException('Parent comment does not belong to post');
      }
    }

    const comment = await this.commentModel.create({
      postId: postObjectId,
      userId: userObjectId,
      content,
      parentId: parentObjectId,
    });

    return this.serializeComment(comment);
  }

  async findAllByPost(postId: string) {
    const postObjectId = this.toObjectId(postId, 'post id');
    const all = await this.commentModel
      .find({ postId: postObjectId })
      .sort({ createdAt: 1 })
      .exec();

    return buildTree(all.map((comment) => this.serializeComment(comment)));
  }

  async findOne(id: string) {
    const commentObjectId = this.toObjectId(id, 'comment id');
    const comment = await this.commentModel.findById(commentObjectId).exec();
    if (!comment) throw new NotFoundException('Comment not found');
    return this.serializeComment(comment);
  }

  async update(id: string, userId: string, updateCommentDto: UpdateCommentDto) {
    const commentObjectId = this.toObjectId(id, 'comment id');
    const userObjectId = this.toObjectId(userId, 'user id');
    const comment = await this.commentModel
      .findOneAndUpdate(
        { _id: commentObjectId, userId: userObjectId },
        updateCommentDto,
        { new: true },
      )
      .exec();

    if (!comment)
      throw new ForbiddenException('Comment not found or not yours');
    return this.serializeComment(comment);
  }

  async remove(id: string, userId: string) {
    const commentObjectId = this.toObjectId(id, 'comment id');
    const userObjectId = this.toObjectId(userId, 'user id');
    const comment = await this.commentModel
      .findOneAndUpdate(
        { _id: commentObjectId, userId: userObjectId },
        { isDeleted: true, content: '[This comment has been deleted]' },
        { new: true },
      )
      .exec();

    if (!comment)
      throw new ForbiddenException('Comment not found or not yours');

    // Cascade soft-delete all replies recursively
    // await updateReplyStatus(id, this.commentModel);

    return { message: 'Comment deleted successfully' };
  }
}
