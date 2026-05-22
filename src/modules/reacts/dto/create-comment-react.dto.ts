export class CreateCommentReactDto {
  userId!: string; // User ID as a string
  commentId!: string; // Comment ID as a string
  state!: string; // React state as a string (e.g., 'LIKE', 'DISLIKE', 'NEUTRAL')
}
