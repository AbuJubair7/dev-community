import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from 'src/modules/users/dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/modules/users/users.service';
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
      throw new InternalServerErrorException('User not created');
    }
    const token = await this.signToken(res._id, res.email);
    res.password = '****************';
    return {
      token,
      user: res,
    };
  }

  async login(loginDto: LoginDto) {
    let user;
    try {
      user = await this.usersService.findByEmail(loginDto.email);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new UnauthorizedException('Invalid credentials');
      }
      throw error;
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
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
