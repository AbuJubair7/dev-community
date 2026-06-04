import { CreateExperienceDto } from './dto/create-experience.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';
import { ExperienceEntity } from './pg-entities/experience.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { validateUuid } from '../../helpers/validate-uuid';

@Injectable()
export class ExperiencesService {
  constructor(
    @InjectRepository(ExperienceEntity)
    private experienceRepository: Repository<ExperienceEntity>,
  ) {}

  async create(createExperienceDto: CreateExperienceDto, id: string) {
    const userId = validateUuid(id, 'user id');
    const exp = this.experienceRepository.create({
      ...createExperienceDto,
      userId,
    });
    return await this.experienceRepository.save(exp);
  }

  async findAll(id: string) {
    const userId = validateUuid(id, 'user id');
    return await this.experienceRepository.find({ where: { userId } });
  }

  async findOne(id: string) {
    validateUuid(id, 'experience id');
    const exp = await this.experienceRepository.findOne({ where: { _id: id } });
    if (!exp) throw new NotFoundException('Experience not found');
    return exp;
  }

  async findOneByUserId(userId: string) {
    const userObjectId = validateUuid(userId, 'user id');
    return await this.experienceRepository.find({
      where: { userId: userObjectId },
    });
  }

  async update(
    expId: string,
    userId: string,
    updateExperienceDto: UpdateExperienceDto,
  ) {
    const userObjectId = validateUuid(userId, 'user id');
    validateUuid(expId, 'experience id');
    const exp = await this.experienceRepository.findOne({
      where: { _id: expId, userId: userObjectId },
    });
    if (!exp) throw new NotFoundException('Experience not found');
    Object.assign(exp, updateExperienceDto);
    return await this.experienceRepository.save(exp);
  }

  async remove(expId: string, userId: string) {
    const userObjectId = validateUuid(userId, 'user id');
    validateUuid(expId, 'experience id');
    const exp = await this.experienceRepository.findOne({
      where: { _id: expId, userId: userObjectId },
    });
    if (!exp) throw new NotFoundException('Experience not found');
    await this.experienceRepository.remove(exp);
    return {
      message: 'Experience deleted successfully',
      experience: exp,
    };
  }
}
