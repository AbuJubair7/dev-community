import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ReactsService } from './reacts.service';
import { CreateReactDto } from './dto/create-react.dto';
import { UpdateReactDto } from './dto/update-react.dto';

@Controller('reacts')
export class ReactsController {
  constructor(private readonly reactsService: ReactsService) {}

  @Post()
  create(@Body() createReactDto: CreateReactDto) {
    return this.reactsService.create(createReactDto);
  }

  @Get()
  findAll() {
    return this.reactsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reactsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReactDto: UpdateReactDto) {
    return this.reactsService.update(+id, updateReactDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reactsService.remove(+id);
  }
}
