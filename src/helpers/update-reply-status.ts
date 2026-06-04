import { Repository } from 'typeorm';
import { CommentEntity } from 'src/modules/comments/pg-entities/comment.entity';

// Recursive soft-deletion of replies
export async function updateReplyStatus(
  parentId: string,
  commentRepository: Repository<CommentEntity>,
): Promise<void> {
  const children = await commentRepository.find({ where: { parentId } });

  for (const child of children) {
    // Update the child comment to be soft-deleted
    child.isDeleted = true;
    child.content = '[This comment has been deleted]';
    await commentRepository.save(child);

    // Recursively apply to the child's own replies
    await updateReplyStatus(child._id, commentRepository);
  }
}
