import {
  Controller,
  Get,
  Req,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from 'src/modules/auth/guard/jwt.guard';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePassDto } from './dto/update-pass.dto';
import { Request } from 'express';

@UseGuards(JwtGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Get('my/posts')
  findUserPosts(@Req() req: Request) {
    return this.usersService.findUserPosts((req.user as any).id);
  }

  @Patch()
  update(@Req() req: Request, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update((req.user as any).id, updateUserDto);
  }

  @Patch('password')
  updatePassword(@Req() req: Request, @Body() updatePassDto: UpdatePassDto) {
    return this.usersService.updatePassword(
      (req.user as any).id,
      updatePassDto,
    );
  }

  @Delete()
  remove(@Req() req: Request) {
    return this.usersService.remove((req.user as any).id);
  }
}
