import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class UpdatePassDto {
  @IsNotEmpty()
  @IsString()
  oldPassword: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @Matches(/[0-9]/, { message: 'Password must contain at least one number' })
  @Matches(/[a-zA-Z]/, { message: 'Password must contain at least one letter' })
  newPassword: string;

  @IsNotEmpty()
  @IsString()
  confirmPassword: string;
}