import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
  @IsNotEmpty()
  @IsString()
  communityId!: string;

  @IsNotEmpty()
  title!: string;

  @IsNotEmpty()
  content!: string;

  // Optional: ISO date string e.g. "2025-12-25T10:00:00Z"
  // If provided and in the future, the post will be scheduled
  @IsOptional()
  @IsDateString()
  postAt?: string;
}
