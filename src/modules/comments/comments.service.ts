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
import { toObjectId } from '../../helpers/to-object-id';

@Injectable()
export class CommentsService {
  private readonly defaultPageSize = 3;
  private readonly maxPageSize = 50;

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

  private getPagination(page: string | undefined, limit: string | undefined) {
    const pageNumber = Number(page ?? 1);
    const limitNumber = Number(limit ?? this.defaultPageSize);

    if (!Number.isInteger(pageNumber) || pageNumber < 1) {
      throw new BadRequestException('page must be a positive integer');
    }

    if (!Number.isInteger(limitNumber) || limitNumber < 1) {
      throw new BadRequestException('limit must be a positive integer');
    }

    const pageSize = Math.min(limitNumber, this.maxPageSize);

    return {
      page: pageNumber,
      limit: pageSize,
      skip: (pageNumber - 1) * pageSize,
      meta: (total: number) => {
        const totalPages = Math.ceil(total / pageSize);
        const hasNextPage = pageNumber < totalPages;

        return {
          page: pageNumber,
          limit: pageSize,
          total,
          totalPages,
          hasNextPage,
          nextPage: hasNextPage ? pageNumber + 1 : null,
        };
      },
    };
  }

  private async findRepliesPage(
    parentId: Types.ObjectId,
    page?: string,
    limit?: string,
  ) {
    const pagination = this.getPagination(page, limit);

    const [replies, total] = await Promise.all([
      this.commentModel
        .find({ parentId })
        .sort({ createdAt: 1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .exec(),
      this.commentModel.countDocuments({ parentId }).exec(),
    ]);

    return {
      data: replies.map((reply) => this.serializeComment(reply)),
      pagination: pagination.meta(total),
    };
  }

  async create(createCommentDto: CreateCommentDto, userId: string) {
    const { postId, content, parentId = null } = createCommentDto;
    const postObjectId = toObjectId(postId, 'post id');
    const userObjectId = toObjectId(userId, 'user id');
    const parentObjectId = parentId
      ? toObjectId(parentId, 'parent comment id')
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

  async findAllByPost(
    postId: string,
    page?: string,
    limit?: string,
    replyLimit?: string,
  ) {
    const postObjectId = toObjectId(postId, 'post id');
    const pagination = this.getPagination(page, limit);

    const [comments, total] = await Promise.all([
      this.commentModel
        .find({ postId: postObjectId, parentId: null })
        .sort({ createdAt: 1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .exec(),
      this.commentModel
        .countDocuments({ postId: postObjectId, parentId: null })
        .exec(),
    ]);

    const data = await Promise.all(
      comments.map(async (comment) => {
        const replies = await this.findRepliesPage(
          comment._id,
          undefined,
          replyLimit,
        );

        return {
          ...this.serializeComment(comment),
          replies: replies.data,
          repliesPagination: replies.pagination,
        };
      }),
    );

    return {
      data,
      pagination: pagination.meta(total),
    };
  }

  async findReplies(id: string, page?: string, limit?: string) {
    const commentObjectId = toObjectId(id, 'comment id');
    const parent = await this.commentModel.findById(commentObjectId).exec();
    if (!parent) throw new NotFoundException('Comment not found');

    return this.findRepliesPage(commentObjectId, page, limit);
  }

  async findOne(id: string) {
    const commentObjectId = toObjectId(id, 'comment id');
    const comment = await this.commentModel.findById(commentObjectId).exec();
    if (!comment) throw new NotFoundException('Comment not found');
    return this.serializeComment(comment);
  }

  async update(id: string, userId: string, updateCommentDto: UpdateCommentDto) {
    const commentObjectId = toObjectId(id, 'comment id');
    const userObjectId = toObjectId(userId, 'user id');
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
    const commentObjectId = toObjectId(id, 'comment id');
    const userObjectId = toObjectId(userId, 'user id');
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
