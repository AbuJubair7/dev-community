import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Skill } from './entities/skill.entity';
import crypto from 'crypto';

@Injectable()
export class SkillsService {
  constructor(@InjectModel(Skill.name) private skillModel: Model<Skill>) {}

  async create(createSkillDto: CreateSkillDto, id: string) {
    const skill = await this.skillModel.create({
      _id: crypto.randomUUID(),
      ...createSkillDto,
      userId: id,
    });
    return skill;
  }

  async findAll(id: string) {
    const skills = await this.skillModel.find({ userId: id }).exec();
    return skills;
  }

  async findOne(id: string) {
    const skill = await this.skillModel.findById(id).exec();
    if (!skill) {
      throw new NotFoundException('Skill not found');
    }
    return skill;
  }

  async update(id: string, updateSkillDto: UpdateSkillDto) {
    const skill = await this.skillModel
      .findByIdAndUpdate(id, updateSkillDto, { new: true })
      .exec();
    if (!skill) {
      throw new NotFoundException('Skill not found');
    }
    return skill;
  }

  async remove(id: string) {
    const skill = await this.skillModel.findByIdAndDelete(id).exec();
    if (!skill) {
      throw new NotFoundException('Skill not found');
    }
    return skill;
  }
}
