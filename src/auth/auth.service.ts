import { Injectable } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}
  async register(createUserDto: CreateUserDto) {
    const res = await this.usersService.create(createUserDto);
    if (!res) {
      throw new Error('User not created');
    }
    const token = await this.signToken(res._id, res.email);
    res.password = '****************';
    return {
      token,
      user: res,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new Error('User not found');
    }
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }
    const token = await this.signToken(user._id, user.email);
    user.password = '****************';
    return {
      token,
      user,
    };
  }

  // Generate JWT token
  async signToken(userId: string, email: string) {
    const payload = {
      id: userId,
      email,
    };
    const secretKey = process.env.JWT_SECRET as string;
    const token = await this.jwtService.signAsync(payload, {
      expiresIn: '1h',
      secret: secretKey,
    });
    return token;
  }
}
