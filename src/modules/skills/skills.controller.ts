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
import { SkillsService } from './skills.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { JwtGuard } from 'src/modules/auth/guard/jwt.guard';
import { Request } from 'express';

@UseGuards(JwtGuard)
@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Post()
  create(@Body() createSkillDto: CreateSkillDto, @Req() req: Request) {
    return this.skillsService.create(createSkillDto, (req.user as any).id);
  }

  @Get()
  findAll(@Req() req: Request) {
    return this.skillsService.findAll((req.user as any).id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.skillsService.findOne(id);
  }

  @Get('user/:userId')
  findOneByUserId(@Param('userId') userId: string) {
    return this.skillsService.findOneByUserId(userId);
  }

  @Patch()
  update(@Req() req: Request, @Body() updateSkillDto: UpdateSkillDto) {
    return this.skillsService.update((req.user as any).id, updateSkillDto);
  }

  @Delete()
  remove(@Req() req: Request) {
    return this.skillsService.remove((req.user as any).id);
  }
}
