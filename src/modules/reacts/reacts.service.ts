import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePostReactDto } from './dto/create-post-react.dto';
import { UpdatePostReactDto } from './dto/update-post-react.dto.';
import { CreateCommentReactDto } from './dto/create-comment-react.dto';
import { UpdateCommentReactDto } from './dto/update-comment-react.dto';
import { PostReactEntity } from './pg-entities/post-react.entity';
import { CommentReactEntity } from './pg-entities/comment-react.entity';
import { PostEntity } from '../posts/pg-entities/post.entity';
import { UserEntity } from '../users/pg-entities/user.entity';
import { validateUuid } from '../../helpers/validate-uuid';
import { ReactState } from './enums/react-state.enum';
import { sendMail } from '../../helpers/mailer';

@Injectable()
export class ReactsService {
  constructor(
    @InjectRepository(PostReactEntity)
    private postReactRepository: Repository<PostReactEntity>,
    @InjectRepository(CommentReactEntity)
    private commentReactRepository: Repository<CommentReactEntity>,
    @InjectRepository(PostEntity)
    private postRepository: Repository<PostEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  // ─── Post Reacts ────

  async createPostReact(createPostReactDto: CreatePostReactDto) {
    const userId = validateUuid(createPostReactDto.userId, 'user id');
    const postId = validateUuid(createPostReactDto.postId, 'post id');
    const { state } = createPostReactDto;

    const existingReact = await this.postReactRepository.findOne({
      where: { userId, postId },
    });

    let savedReact: PostReactEntity;

    if (existingReact) {
      if (existingReact.state !== state) {
        existingReact.state = state;
        savedReact = await this.postReactRepository.save(existingReact);
      } else {
        return existingReact;
      }
    } else {
      const newReact = this.postReactRepository.create({
        ...createPostReactDto,
        userId,
        postId,
      });
      savedReact = await this.postReactRepository.save(newReact);
    }

    // ── Dislike threshold check ──────────────────────────────────────────
    if (savedReact.state === ReactState.DISLIKE) {
      const dislikeCount = await this.postReactRepository.count({
        where: { postId, state: ReactState.DISLIKE },
      });

      if (dislikeCount === 11) {
        const post = await this.postRepository.findOne({
          where: { _id: postId },
        });

        if (post) {
          const owner = await this.userRepository.findOne({
            where: { _id: post.userId },
          });

          if (owner) {
            await sendMail({
              to: [owner.email],
              subject: 'Your post has received more than 10 dislikes',
              text: `Hi ${owner.fname}, your post "${post.title}" has received more than 10 dislikes. You may want to review it.`,
              html: `<p>Hi <b>${owner.fname}</b>,</p><p>Your post <b>"${post.title}"</b> has received more than 10 dislikes.</p><p>You may want to review or update your content.</p>`,
            });
          }
        }
      }
    }
    // ────────────────────────────────────────────────────────────────────

    return savedReact;
  }

  // return count of reacts for each state
  async findAllPostReacts(postId: string) {
    const postObjectId = validateUuid(postId, 'post id');
    const likeCount = await this.postReactRepository.count({
      where: { postId: postObjectId, state: ReactState.LIKE },
    });
    const dislikeCount = await this.postReactRepository.count({
      where: { postId: postObjectId, state: ReactState.DISLIKE },
    });
    return { likeCount, dislikeCount };
  }

  async findOnePostReact(id: string) {
    validateUuid(id, 'post react id');
    const react = await this.postReactRepository.findOne({
      where: { _id: id },
    });
    if (!react) throw new NotFoundException('Post react not found');
    return react;
  }

  async updatePostReact(
    postId: string,
    userId: string,
    updatePostReactDto: UpdatePostReactDto,
  ) {
    const postObjectId = validateUuid(postId, 'post id');
    const userObjectId = validateUuid(userId, 'user id');

    const react = await this.postReactRepository.findOne({
      where: { postId: postObjectId, userId: userObjectId },
    });
    if (!react)
      throw new NotFoundException('Post react not found or not yours');

    if (updatePostReactDto.state !== undefined) {
      react.state = updatePostReactDto.state;
    }
    return await this.postReactRepository.save(react);
  }

  async removePostReact(id: string, userId: string) {
    const userObjectId = validateUuid(userId, 'user id');
    validateUuid(id, 'post react id');

    const react = await this.postReactRepository.findOne({
      where: { _id: id, userId: userObjectId },
    });
    if (!react)
      throw new NotFoundException('Post react not found or not yours');

    await this.postReactRepository.remove(react);
    return react;
  }

  // ─── Comment Reacts ────

  async createCommentReact(createCommentReactDto: CreateCommentReactDto) {
    const userId = validateUuid(createCommentReactDto.userId, 'user id');
    const commentId = validateUuid(
      createCommentReactDto.commentId,
      'comment id',
    );
    const { state } = createCommentReactDto;

    const existingReact = await this.commentReactRepository.findOne({
      where: { userId, commentId },
    });

    if (existingReact) {
      if (existingReact.state !== state) {
        existingReact.state = state;
        return await this.commentReactRepository.save(existingReact);
      } else {
        return existingReact;
      }
    }

    const newReact = this.commentReactRepository.create({
      ...createCommentReactDto,
      userId,
      commentId,
    });
    return await this.commentReactRepository.save(newReact);
  }

  // return count of reacts for each state
  async findAllCommentReacts(commentId: string) {
    const commentObjectId = validateUuid(commentId, 'comment id');
    const likeCount = await this.commentReactRepository.count({
      where: { commentId: commentObjectId, state: ReactState.LIKE },
    });
    const dislikeCount = await this.commentReactRepository.count({
      where: { commentId: commentObjectId, state: ReactState.DISLIKE },
    });
    return { likeCount, dislikeCount };
  }

  async findOneCommentReact(id: string) {
    validateUuid(id, 'comment react id');
    const react = await this.commentReactRepository.findOne({
      where: { _id: id },
    });
    if (!react) throw new NotFoundException('Comment react not found');
    return react;
  }

  async updateCommentReact(
    commentId: string,
    userId: string,
    updateCommentReactDto: UpdateCommentReactDto,
  ) {
    const commentObjectId = validateUuid(commentId, 'comment id');
    const userObjectId = validateUuid(userId, 'user id');

    const react = await this.commentReactRepository.findOne({
      where: { commentId: commentObjectId, userId: userObjectId },
    });
    if (!react)
      throw new NotFoundException('Comment react not found or not yours');

    if (updateCommentReactDto.state !== undefined) {
      react.state = updateCommentReactDto.state;
    }
    return await this.commentReactRepository.save(react);
  }

  async removeCommentReact(id: string, userId: string) {
    const userObjectId = validateUuid(userId, 'user id');
    validateUuid(id, 'comment react id');

    const react = await this.commentReactRepository.findOne({
      where: { _id: id, userId: userObjectId },
    });
    if (!react)
      throw new NotFoundException('Comment react not found or not yours');

    await this.commentReactRepository.remove(react);
    return react;
  }
}
