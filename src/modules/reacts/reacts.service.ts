import { Injectable } from '@nestjs/common';
import { CreateReactDto } from './dto/create-react.dto';
import { UpdateReactDto } from './dto/update-react.dto';

@Injectable()
export class ReactsService {
  create(createReactDto: CreateReactDto) {
    return 'This action adds a new react';
  }

  findAll() {
    return `This action returns all reacts`;
  }

  findOne(id: number) {
    return `This action returns a #${id} react`;
  }

  update(id: number, updateReactDto: UpdateReactDto) {
    return `This action updates a #${id} react`;
  }

  remove(id: number) {
    return `This action removes a #${id} react`;
  }
}
