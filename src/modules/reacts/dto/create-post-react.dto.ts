import { ReactState } from '../enums/react-state.enum';

export class CreatePostReactDto {
  userId!: string;
  postId!: string;
  state!: ReactState;
}
