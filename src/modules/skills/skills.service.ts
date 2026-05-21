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
    if (!skill) throw new NotFoundException('Skill not found');
    return skill;
  }

  async findOneByUserId(userId: string) {
    const skills = await this.skillModel.find({ userId }).exec();
    return skills;
  }

  async update(
    skillId: string,
    userId: string,
    updateSkillDto: UpdateSkillDto,
  ) {
    const skill = await this.skillModel
      .findOneAndUpdate({ _id: skillId, userId }, updateSkillDto, { new: true })
      .exec();
    if (!skill) throw new NotFoundException('Skill not found or not yours');
    return skill;
  }

  async remove(skillId: string, userId: string) {
    const skill = await this.skillModel
      .findOneAndDelete({ _id: skillId, userId })
      .exec();
    if (!skill) throw new NotFoundException('Skill not found or not yours');
    return skill;
  }
}
