import { Model } from 'mongoose';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';
import { Experience, ExperienceDocument } from './entities/experience.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { toObjectId } from '../../helpers/to-object-id';

@Injectable()
export class ExperiencesService {
  constructor(
    @InjectModel(Experience.name) private experienceModel: Model<Experience>,
  ) {}

  private serializeExperience(experience: ExperienceDocument) {
    const serializedExperience = experience.toObject();

    return {
      ...serializedExperience,
      _id: experience._id.toString(),
      userId: experience.userId.toString(),
    };
  }

  async create(createExperienceDto: CreateExperienceDto, id: string) {
    const userId = toObjectId(id, 'user id');
    const exp = await this.experienceModel.create({
      ...createExperienceDto,
      userId,
    });
    return this.serializeExperience(exp);
  }

  async findAll(id: string) {
    const userId = toObjectId(id, 'user id');
    const experiences = await this.experienceModel.find({ userId }).exec();
    return experiences.map((experience) =>
      this.serializeExperience(experience),
    );
  }

  async findOne(id: string) {
    const exp = await this.experienceModel.findById(id).exec();
    if (!exp) throw new NotFoundException('Experience not found');
    return this.serializeExperience(exp);
  }

  async findOneByUserId(userId: string) {
    const userObjectId = toObjectId(userId, 'user id');
    const experiences = await this.experienceModel
      .find({ userId: userObjectId })
      .exec();
    return experiences.map((experience) =>
      this.serializeExperience(experience),
    );
  }

  async update(
    expId: string,
    userId: string,
    updateExperienceDto: UpdateExperienceDto,
  ) {
    const userObjectId = toObjectId(userId, 'user id');
    const exp = await this.experienceModel
      .findOneAndUpdate(
        { _id: expId, userId: userObjectId },
        updateExperienceDto,
        {
          new: true,
        },
      )
      .exec();
    if (!exp) throw new NotFoundException('Experience not found');
    return this.serializeExperience(exp);
  }

  async remove(expId: string, userId: string) {
    const userObjectId = toObjectId(userId, 'user id');
    const exp = await this.experienceModel
      .findOneAndDelete({ _id: expId, userId: userObjectId })
      .exec();
    if (!exp) throw new NotFoundException('Experience not found');
    return {
      message: 'Experience deleted successfully',
      experience: this.serializeExperience(exp),
    };
  }
}
