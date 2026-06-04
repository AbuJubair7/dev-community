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
import {
  getGoogleAuthLink as generateGoogleLink,
  handleGoogleCallback,
} from 'src/helpers/google-signin-handler';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

export interface UserDocument {
  _id: string;
  email: string;
  password?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  getGoogleAuthLink() {
    const authUrl = generateGoogleLink();
    return { url: authUrl };
  }

  async loginWithGoogle(code: string) {
    const { email, name } = await handleGoogleCallback(code);
    if (!email || !name) {
      throw new InternalServerErrorException(
        'Failed to retrieve Google profile',
      );
    }

    let user: UserDocument;

    try {
      user = await this.usersService.findByEmail(email);
    } catch (error) {
      if (error instanceof NotFoundException) {
        const createUserDto: CreateUserDto = {
          fname: name.split(' ')[0] || 'Google',
          lname: name.split(' ')[1] || 'User',
          email,
          password: '****************',
        };

        try {
          user = await this.usersService.create(createUserDto, true);
        } catch {
          throw new InternalServerErrorException('User could not be created');
        }
      } else {
        throw error;
      }
    }

    const token = await this.signToken(user._id, user.email);
    user.password = '****************';

    return {
      token,
      user,
    };
  }

  async register(createUserDto: CreateUserDto) {
    try {
      const res = await this.usersService.create(createUserDto);
      const token = await this.signToken(res._id, res.email);
      res.password = '****************';
      return {
        token,
        user: res,
      };
    } catch {
      throw new InternalServerErrorException('User registration failed');
    }
  }

  async login(loginDto: LoginDto) {
    let user: UserDocument;
    try {
      user = await this.usersService.findByEmail(loginDto.email);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new UnauthorizedException('Invalid credentials');
      }
      throw error;
    }

    if (!user.password) {
      throw new UnauthorizedException('Invalid credentials');
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
