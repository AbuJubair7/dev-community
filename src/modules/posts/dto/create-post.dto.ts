import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePostDto {
  @IsNotEmpty()
  @IsString()
  communityId!: string;

  @IsNotEmpty()
  title!: string;

  @IsNotEmpty()
  content!: string;
}
