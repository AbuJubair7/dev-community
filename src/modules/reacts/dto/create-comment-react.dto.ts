import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ReactState } from '../enums/react-state.enum';

export class CreateCommentReactDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  commentId!: string;

  @IsEnum(ReactState)
  state!: ReactState;
}
