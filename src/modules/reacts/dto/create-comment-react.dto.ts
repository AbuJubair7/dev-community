import { ReactState } from '../enums/react-state.enum';

export class CreateCommentReactDto {
  userId!: string;
  commentId!: string;
  state!: ReactState;
}
