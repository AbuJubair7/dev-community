import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ReactsService } from './reacts.service';
import { CreatePostReactDto } from './dto/create-post-react.dto';
import { UpdatePostReactDto } from './dto/update-post-react.dto.';
import { CreateCommentReactDto } from './dto/create-comment-react.dto';
import { UpdateCommentReactDto } from './dto/update-comment-react.dto';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guard/jwt.guard';

@UseGuards(JwtGuard)
@Controller('reacts')
export class ReactsController {
  constructor(private readonly reactsService: ReactsService) {}

  // ─── Post Reacts ────

  @Post('post')
  createPostReact(@Body() createPostReactDto: CreatePostReactDto) {
    return this.reactsService.createPostReact(createPostReactDto);
  }

  @Get('post')
  findAllPostReacts(@Query('postId') postId: string) {
    return this.reactsService.findAllPostReacts(postId);
  }

  @Get('post/:id')
  findOnePostReact(@Param('id') id: string) {
    return this.reactsService.findOnePostReact(id);
  }

  @Patch('post')
  updatePostReact(
    @Query('postId') postId: string,
    @Query('userId') userId: string,
    @Body() updatePostReactDto: UpdatePostReactDto,
  ) {
    return this.reactsService.updatePostReact(
      postId,
      userId,
      updatePostReactDto,
    );
  }

  @Delete('post/:id')
  removePostReact(@Param('id') id: string, @Query('userId') userId: string) {
    return this.reactsService.removePostReact(id, userId);
  }

  // ─── Comment Reacts ────

  @Post('comment')
  createCommentReact(@Body() createCommentReactDto: CreateCommentReactDto) {
    return this.reactsService.createCommentReact(createCommentReactDto);
  }

  @Get('comment')
  findAllCommentReacts(@Query('commentId') commentId: string) {
    return this.reactsService.findAllCommentReacts(commentId);
  }

  @Get('comment/:id')
  findOneCommentReact(@Param('id') id: string) {
    return this.reactsService.findOneCommentReact(id);
  }

  @Patch('comment')
  updateCommentReact(
    @Query('commentId') commentId: string,
    @Query('userId') userId: string,
    @Body() updateCommentReactDto: UpdateCommentReactDto,
  ) {
    return this.reactsService.updateCommentReact(
      commentId,
      userId,
      updateCommentReactDto,
    );
  }

  @Delete('comment/:id')
  removeCommentReact(@Param('id') id: string, @Query('userId') userId: string) {
    return this.reactsService.removeCommentReact(id, userId);
  }
}
