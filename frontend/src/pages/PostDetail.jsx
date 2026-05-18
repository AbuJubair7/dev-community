import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getPostById, deletePost } from '../services/posts.service.js';
import { getUsers } from '../services/users.service.js';
import Spinner from '../components/Spinner.jsx';
import ErrorCard from '../components/ErrorCard.jsx';

function formatDate(str) {
  if (!str) return '';
  return new Date(str).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function PostDetail() {
  const { id } = useParams();
  const { token, user, isAuth } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [authorName, setAuthorName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!isAuth) { navigate('/login', { replace: true }); return; }
    Promise.all([getPostById(id, token), getUsers(token)])
      .then(([fetchedPost, users]) => {
        setPost(fetchedPost);
        const author = users.find((u) => u._id === fetchedPost.userId);
        setAuthorName(author ? `${author.fname} ${author.lname}`.trim() : 'Unknown');
      })
      .catch((err) => setError(err.message || 'Failed to load post.'))
      .finally(() => setLoading(false));
  }, [id, token, isAuth, navigate]);

  const isOwner = user && post && post.userId === user._id;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deletePost(token);
      navigate('/feed');
    } catch (err) {
      setError(err.message || 'Failed to delete post.');
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (loading) return <div className="page"><div className="container"><Spinner /></div></div>;
  if (error) return <div className="page"><div className="container"><ErrorCard message={error} /></div></div>;
  if (!post) return null;

  return (
    <div className="page">
      <div className="container">
        <div style={{ marginBottom: 24 }}>
          <Link to="/feed" className="btn-ghost btn-sm">← Back to feed</Link>
        </div>

        <h1 className="post-detail-title">{post.title}</h1>

        <div className="post-detail-meta">
          <span>
            By{' '}
            {isOwner ? (
              <Link to="/profile" className="post-card-author">You</Link>
            ) : (
              <Link to={`/users/${post.userId}`} className="post-card-author">{authorName}</Link>
            )}
          </span>
          <span>·</span>
          <span>Posted {formatDate(post.createdAt)}</span>
          {isOwner && (
            <>
              <span>·</span>
              <span style={{ color: 'var(--accent-light)', fontSize: 12 }}>✏️ Your post</span>
            </>
          )}
        </div>

        <div className="post-detail-content">{post.content}</div>

        {isOwner && (
          <div style={{ marginTop: 32, display: 'flex', gap: 10 }}>
            <Link to={`/posts/${id}/edit`} className="btn-ghost btn-sm">Edit</Link>
            <button className="btn-danger btn-sm" onClick={() => setConfirmDelete(true)}>
              Delete
            </button>
          </div>
        )}

        {confirmDelete && (
          <div className="confirm-banner">
            <span>Are you sure you want to delete this post?</span>
            <div className="confirm-banner-actions">
              <button className="btn-ghost btn-sm" onClick={() => setConfirmDelete(false)}>Cancel</button>
              <button className="btn-danger btn-sm" onClick={handleDelete} disabled={deleting}>
                {deleting ? <span className="spinner spinner-sm" /> : 'Yes, delete'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
