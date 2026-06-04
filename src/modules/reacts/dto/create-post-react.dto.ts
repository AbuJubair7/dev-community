import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ReactState } from '../enums/react-state.enum';

export class CreatePostReactDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  postId!: string;

  @IsEnum(ReactState)
  state!: ReactState;
}
