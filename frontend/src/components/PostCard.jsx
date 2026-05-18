import { Link } from 'react-router-dom';

function formatDate(str) {
  if (!str) return '';
  return new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function PostCard({ post }) {
  const excerpt = post.content?.length > 140
    ? post.content.slice(0, 140) + '…'
    : post.content;

  const displayName = post.userName
    || (post.userId && typeof post.userId === 'object' ? `${post.userId.fname || ''}${post.userId.lname ? ' ' + post.userId.lname : ''}`.trim() : post.userId)
    || 'Unknown';

  return (
    <Link to={`/posts/${post._id}`} className="post-card">
      <div className="post-card-title">{post.title}</div>
      {excerpt && <div className="post-card-excerpt">{excerpt}</div>}
      <div className="post-card-meta">
        <span>By {displayName}</span>
        <span>·</span>
        <span>{formatDate(post.createdAt)}</span>
      </div>
    </Link>
  );
}
