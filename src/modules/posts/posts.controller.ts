import {
  Controller,
  Req,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { Request } from 'express';

@UseGuards(JwtGuard)
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  create(@Body() createPostDto: CreatePostDto, @Req() req: Request) {
    return this.postsService.create(createPostDto, (req.user as any).id);
  }

  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @Patch()
  update(@Req() req: Request, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update((req.user as any).id, updatePostDto);
  }

  @Delete()
  remove(@Req() req: Request) {
    return this.postsService.remove((req.user as any).id);
  }
}
