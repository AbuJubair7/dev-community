import { Model } from 'mongoose';
import { Comment } from 'src/modules/comments/entities/comment.entity';

// recursive deletion of replies
export async function deleteReplies(
  parentId: string,
  commentModel: Model<Comment>,
): Promise<void> {
  const children = await commentModel.find({ parentId }).exec();
  for (const child of children) {
    await commentModel.findByIdAndDelete(child._id).exec();
    await deleteReplies(child._id.toString(), commentModel);
  }
}
