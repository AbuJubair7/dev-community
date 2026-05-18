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
import { SelfGuard } from '../auth/guard/self.guard';

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

  @UseGuards(SelfGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSkillDto: UpdateSkillDto) {
    return this.skillsService.update(id, updateSkillDto);
  }

  @UseGuards(SelfGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.skillsService.remove(id);
  }
}
