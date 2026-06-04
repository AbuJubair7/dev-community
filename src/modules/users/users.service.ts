import bcrypt from 'bcrypt';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePassDto } from './dto/update-pass.dto';
import { UserEntity } from './pg-entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const user = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (user) {
      throw new ConflictException('User already exists');
    }
    createUserDto.password = await bcrypt.hash(createUserDto.password, 10);
    const newUser = this.userRepository.create(createUserDto);
    const savedUser = await this.userRepository.save(newUser);

    return savedUser;
  }

  async findAll() {
    return await this.userRepository.find();
  }

  async findById(id: string) {
    const user = await this.userRepository.findOne({ where: { _id: id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  async updatePassword(id: string, updatePassDto: UpdatePassDto) {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const isPasswordValid = await bcrypt.compare(
      updatePassDto.oldPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new NotFoundException('Invalid password');
    }
    if (updatePassDto.newPassword !== updatePassDto.confirmPassword) {
      throw new NotFoundException('Passwords do not match');
    }
    const newHashedPassword = await bcrypt.hash(updatePassDto.newPassword, 10);
    user.password = newHashedPassword;
    return await this.userRepository.save(user);
  }

  async remove(id: string) {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.userRepository.remove(user);
    return user;
  }
}
