import { Model } from 'mongoose';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';
import { Experience } from './entities/experience.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import crypto from 'crypto';

@Injectable()
export class ExperiencesService {
  constructor(
    @InjectModel(Experience.name) private experienceModel: Model<Experience>,
  ) {}

  async create(createExperienceDto: CreateExperienceDto, id: string) {
    const exp = await this.experienceModel.create({
      _id: crypto.randomUUID(),
      ...createExperienceDto,
      userId: id,
    });
    return exp;
  }

  async findAll(id: string) {
    const experiences = await this.experienceModel.find({ userId: id }).exec();
    return experiences;
  }

  async findOne(id: string) {
    const exp = await this.experienceModel.findById(id).exec();
    if (!exp) throw new NotFoundException('Experience not found');
    return exp;
  }

  async findOneByUserId(userId: string) {
    const experiences = await this.experienceModel.find({ userId }).exec();
    return experiences;
  }

  async update(
    expId: string,
    userId: string,
    updateExperienceDto: UpdateExperienceDto,
  ) {
    const exp = await this.experienceModel
      .findOneAndUpdate({ _id: expId, userId }, updateExperienceDto, {
        new: true,
      })
      .exec();
    if (!exp) throw new NotFoundException('Experience not found');
    return exp;
  }

  async remove(expId: string, userId: string) {
    const exp = await this.experienceModel
      .findOneAndDelete({ _id: expId, userId })
      .exec();
    if (!exp) throw new NotFoundException('Experience not found');
    return { message: 'Experience deleted successfully', experience: exp };
  }
}
