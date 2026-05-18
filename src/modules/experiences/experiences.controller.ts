import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ExperiencesService } from './experiences.service';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';
import { Request } from 'express';
import { JwtGuard } from 'src/modules/auth/guard/jwt.guard';

@UseGuards(JwtGuard)
@Controller('experiences')
export class ExperiencesController {
  constructor(private readonly experiencesService: ExperiencesService) {}

  @Post()
  create(
    @Body() createExperienceDto: CreateExperienceDto,
    @Req() req: Request,
  ) {
    return this.experiencesService.create(
      createExperienceDto,
      (req.user as any).id,
    );
  }

  @Get()
  findAll(@Req() req: Request) {
    return this.experiencesService.findAll((req.user as any).id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.experiencesService.findOne(id);
  }

  @Patch()
  update(
    @Req() req: Request,
    @Body() updateExperienceDto: UpdateExperienceDto,
  ) {
    return this.experiencesService.update(
      (req.user as any).id,
      updateExperienceDto,
    );
  }

  @Delete()
  remove(@Req() req: Request) {
    return this.experiencesService.remove((req.user as any).id);
  }
}
