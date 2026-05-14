import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePassDto } from './dto/update-pass.dto';
import { User, UserSchema } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(createUserDto: CreateUserDto) {
    const user = await this.findByEmail(createUserDto.email);
    if (user) {
      throw new Error('User already exists');
    }
    createUserDto.password = await bcrypt.hash(
      createUserDto.password as string,
      10,
    );
    const newUser = new this.userModel({
      _id: crypto.randomUUID(),
      ...createUserDto,
    });
    return await newUser.save();
  }

  async findAll() {
    return await this.userModel.find().exec();
  }

  async findById(id: string) {
    return await this.userModel.findById(id).exec();
  }

  async findByEmail(email: string) {
    return await this.userModel.findOne({ email }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(
        updateUserDto.password as string,
        10,
      );
    }
    return await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
  }

  async updatePassword(id: string, updatePassDto: UpdatePassDto) {
    const user = await this.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    const isPasswordValid = await bcrypt.compare(
      updatePassDto.oldPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }
    if (updatePassDto.newPassword !== updatePassDto.confirmPassword) {
      throw new Error('Passwords do not match');
    }
    updatePassDto.newPassword = await bcrypt.hash(
      updatePassDto.newPassword as string,
      10,
    );
    return await this.userModel
      .findByIdAndUpdate(id, updatePassDto, { new: true })
      .exec();
  }

  async remove(id: string) {
    return await this.userModel.findByIdAndDelete(id).exec();
  }
}
