import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SkillEntity } from './pg-entities/skill.entity';
import { validateUuid } from '../../helpers/validate-uuid';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(SkillEntity)
    private skillRepository: Repository<SkillEntity>,
  ) {}

  async create(createSkillDto: CreateSkillDto, id: string) {
    const userId = validateUuid(id, 'user id');
    const skill = this.skillRepository.create({
      ...createSkillDto,
      userId,
    });
    return await this.skillRepository.save(skill);
  }

  async findAll(id: string) {
    const userId = validateUuid(id, 'user id');
    return await this.skillRepository.find({ where: { userId } });
  }

  async findOne(id: string) {
    validateUuid(id, 'skill id');
    const skill = await this.skillRepository.findOne({ where: { _id: id } });
    if (!skill) throw new NotFoundException('Skill not found');
    return skill;
  }

  async findOneByUserId(userId: string) {
    const userObjectId = validateUuid(userId, 'user id');
    return await this.skillRepository.find({ where: { userId: userObjectId } });
  }

  async update(
    skillId: string,
    userId: string,
    updateSkillDto: UpdateSkillDto,
  ) {
    const userObjectId = validateUuid(userId, 'user id');
    validateUuid(skillId, 'skill id');

    const skill = await this.skillRepository.findOne({
      where: { _id: skillId, userId: userObjectId },
    });
    if (!skill) throw new NotFoundException('Skill not found or not yours');

    Object.assign(skill, updateSkillDto);
    return await this.skillRepository.save(skill);
  }

  async remove(skillId: string, userId: string) {
    const userObjectId = validateUuid(userId, 'user id');
    validateUuid(skillId, 'skill id');

    const skill = await this.skillRepository.findOne({
      where: { _id: skillId, userId: userObjectId },
    });
    if (!skill) throw new NotFoundException('Skill not found or not yours');

    await this.skillRepository.remove(skill);
    return skill;
  }
}
