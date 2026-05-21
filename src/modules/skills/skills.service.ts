import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Skill, SkillDocument } from './entities/skill.entity';

@Injectable()
export class SkillsService {
  constructor(@InjectModel(Skill.name) private skillModel: Model<Skill>) {}

  private serializeSkill(skill: SkillDocument) {
    const serializedSkill = skill.toObject();

    return {
      ...serializedSkill,
      _id: skill._id.toString(),
      userId: skill.userId.toString(),
    };
  }

  private toUserObjectId(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user id');
    }

    return new Types.ObjectId(userId);
  }

  async create(createSkillDto: CreateSkillDto, id: string) {
    const userId = this.toUserObjectId(id);
    const skill = await this.skillModel.create({
      ...createSkillDto,
      userId,
    });
    return this.serializeSkill(skill);
  }

  async findAll(id: string) {
    const userId = this.toUserObjectId(id);
    const skills = await this.skillModel.find({ userId }).exec();
    return skills.map((skill) => this.serializeSkill(skill));
  }

  async findOne(id: string) {
    const skill = await this.skillModel.findById(id).exec();
    if (!skill) throw new NotFoundException('Skill not found');
    return this.serializeSkill(skill);
  }

  async findOneByUserId(userId: string) {
    const userObjectId = this.toUserObjectId(userId);
    const skills = await this.skillModel.find({ userId: userObjectId }).exec();
    return skills.map((skill) => this.serializeSkill(skill));
  }

  async update(
    skillId: string,
    userId: string,
    updateSkillDto: UpdateSkillDto,
  ) {
    const userObjectId = this.toUserObjectId(userId);
    const skill = await this.skillModel
      .findOneAndUpdate(
        { _id: skillId, userId: userObjectId },
        updateSkillDto,
        { new: true },
      )
      .exec();
    if (!skill) throw new NotFoundException('Skill not found or not yours');
    return this.serializeSkill(skill);
  }

  async remove(skillId: string, userId: string) {
    const userObjectId = this.toUserObjectId(userId);
    const skill = await this.skillModel
      .findOneAndDelete({ _id: skillId, userId: userObjectId })
      .exec();
    if (!skill) throw new NotFoundException('Skill not found or not yours');
    return this.serializeSkill(skill);
  }
}
