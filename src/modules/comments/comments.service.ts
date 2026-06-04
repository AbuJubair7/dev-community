import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { CommentEntity } from './pg-entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { validateUuid } from '../../helpers/validate-uuid';
import { updateReplyStatus } from '../../helpers/update-reply-status';

@Injectable()
export class CommentsService {
  private readonly defaultPageSize = 3;
  private readonly maxPageSize = 50;

  constructor(
    @InjectRepository(CommentEntity)
    private commentRepository: Repository<CommentEntity>,
  ) {}

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
    parentId: string,
    page?: string,
    limit?: string,
  ) {
    const pagination = this.getPagination(page, limit);

    const [replies, total] = await Promise.all([
      this.commentRepository.find({
        where: { parentId },
        order: { createdAt: 'ASC' },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      this.commentRepository.count({ where: { parentId } }),
    ]);

    return {
      data: replies,
      pagination: pagination.meta(total),
    };
  }

  async create(createCommentDto: CreateCommentDto, userId: string) {
    const { postId, content, parentId = null } = createCommentDto;
    validateUuid(postId, 'post id');
    validateUuid(userId, 'user id');

    if (parentId) {
      validateUuid(parentId, 'parent comment id');
      const parent = await this.commentRepository.findOne({
        where: { _id: parentId },
      });
      if (!parent) throw new NotFoundException('Parent comment not found');

      if (parent.postId !== postId) {
        throw new BadRequestException('Parent comment does not belong to post');
      }
    }

    const comment = this.commentRepository.create({
      postId,
      userId,
      content,
      parentId: parentId || null,
    });

    return await this.commentRepository.save(comment);
  }

  async findAllByPost(
    postId: string,
    page?: string,
    limit?: string,
    replyLimit?: string,
  ) {
    validateUuid(postId, 'post id');
    const pagination = this.getPagination(page, limit);

    const [comments, total] = await Promise.all([
      this.commentRepository.find({
        where: { postId, parentId: IsNull() },
        order: { createdAt: 'ASC' },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      this.commentRepository.count({
        where: { postId, parentId: IsNull() },
      }),
    ]);

    const data = await Promise.all(
      comments.map(async (comment) => {
        const replies = await this.findRepliesPage(
          comment._id,
          undefined,
          replyLimit,
        );

        return {
          ...comment,
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
    validateUuid(id, 'comment id');
    const parent = await this.commentRepository.findOne({ where: { _id: id } });
    if (!parent) throw new NotFoundException('Comment not found');

    return this.findRepliesPage(id, page, limit);
  }

  async findOne(id: string) {
    validateUuid(id, 'comment id');
    const comment = await this.commentRepository.findOne({
      where: { _id: id },
    });
    if (!comment) throw new NotFoundException('Comment not found');
    return comment;
  }

  async update(id: string, userId: string, updateCommentDto: UpdateCommentDto) {
    validateUuid(id, 'comment id');
    validateUuid(userId, 'user id');
    const comment = await this.commentRepository.findOne({
      where: { _id: id, userId },
    });

    if (!comment)
      throw new ForbiddenException('Comment not found or not yours');

    if (updateCommentDto.content !== undefined) {
      comment.content = updateCommentDto.content;
    }
    return await this.commentRepository.save(comment);
  }

  async remove(id: string, userId: string) {
    validateUuid(id, 'comment id');
    validateUuid(userId, 'user id');
    const comment = await this.commentRepository.findOne({
      where: { _id: id, userId },
    });

    if (!comment)
      throw new ForbiddenException('Comment not found or not yours');

    comment.isDeleted = true;
    comment.content = '[This comment has been deleted]';
    await this.commentRepository.save(comment);

    // Cascade soft-delete all replies recursively
    await updateReplyStatus(id, this.commentRepository);

    return { message: 'Comment deleted successfully' };
  }
}
