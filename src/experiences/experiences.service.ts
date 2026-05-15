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

  create(createExperienceDto: CreateExperienceDto, id: string) {
    const exp = this.experienceModel.create({
      _id: crypto.randomUUID(),
      ...createExperienceDto,
      userId: id,
    });
    return exp;
  }

  findAll(id: string) {
    const experiences = this.experienceModel.find({ userId: id }).exec();
    return experiences;
  }

  findOne(id: string) {
    const exp = this.experienceModel.findById(id).exec();
    return exp;
  }

  update(id: string, updateExperienceDto: UpdateExperienceDto) {
    const exp = this.experienceModel
      .findByIdAndUpdate(id, updateExperienceDto, { new: true })
      .exec();
    return exp;
  }

  remove(id: string) {
    const exp = this.experienceModel.findByIdAndDelete(id).exec();
    return { message: 'Experience deleted successfully', experience: exp };
  }
}
