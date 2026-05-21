import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import {
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  fname?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lname?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  @Matches(/[0-9]/, { message: 'Password must contain at least one number' })
  @Matches(/[a-zA-Z]/, { message: 'Password must contain at least one letter' })
  password?: string;
}
