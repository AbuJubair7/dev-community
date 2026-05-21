import { Model } from 'mongoose';
import { Comment } from 'src/modules/comments/entities/comment.entity';

// Recursive soft-deletion of replies
export async function updateReplyStatus(
  parentId: string,
  commentModel: Model<Comment>,
): Promise<void> {
  const children = await commentModel.find({ parentId }).exec();

  for (const child of children) {
    // Update the child comment to be soft-deleted
    await commentModel
      .findByIdAndUpdate(child._id, {
        isDeleted: true,
        content: '[This comment has been deleted]',
      })
      .exec();

    // Recursively apply to the child's own replies
    await updateReplyStatus(child._id.toString(), commentModel);
  }
}
