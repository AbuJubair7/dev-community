import { Model } from 'mongoose';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';
import { Experience } from './entities/experience.entity';
import { Injectable } from '@nestjs/common';
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
    return exp;
  }

  async findOneByUserId(userId: string) {
    const exp = await this.experienceModel.findOne({ userId }).exec();
    return exp;
  }

  async update(id: string, updateExperienceDto: UpdateExperienceDto) {
    const exp = await this.experienceModel
      .findByIdAndUpdate(id, updateExperienceDto, { new: true })
      .exec();
    return exp;
  }

  async remove(id: string) {
    const exp = await this.experienceModel.findByIdAndDelete(id).exec();
    return { message: 'Experience deleted successfully', experience: exp };
  }
}
