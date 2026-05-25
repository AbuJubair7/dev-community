import { IsNotEmpty } from 'class-validator';

export class CreateCommunityDto {
  @IsNotEmpty()
  name!: string;

  @IsNotEmpty()
  description!: string;
}
