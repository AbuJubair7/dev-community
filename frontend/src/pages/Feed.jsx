import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getPosts } from '../services/posts.service.js';
import { getUsers } from '../services/users.service.js';
import PostCard from '../components/PostCard.jsx';
import Spinner from '../components/Spinner.jsx';
import ErrorCard from '../components/ErrorCard.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function Feed() {
  const { token, isAuth } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuth) { navigate('/login', { replace: true }); return; }

    Promise.all([getPosts(token), getUsers(token)])
      .then(([fetchedPosts, users]) => {
        // Build userId → "First Last" map
        const nameMap = {};
        users.forEach((u) => { nameMap[u._id] = `${u.fname} ${u.lname}`.trim(); });
        // Enrich each post with the author's real name
        setPosts(fetchedPosts.map((p) => ({ ...p, userName: nameMap[p.userId] || 'Unknown' })));
      })
      .catch((err) => setError(err.message || 'Failed to load posts.'))
      .finally(() => setLoading(false));
  }, [token, isAuth, navigate]);

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Feed</h1>
            <p className="page-subtitle">Latest posts from the community</p>
          </div>
          <Link to="/posts/new" className="btn-primary">+ New Post</Link>
        </div>

        {loading && <Spinner />}
        {error && <ErrorCard message={error} />}
        {!loading && !error && posts.length === 0 && (
          <EmptyState icon="📝" title="No posts yet" message="Be the first to share something with the community.">
            <Link to="/posts/new" className="btn-primary" style={{ marginTop: 8 }}>Write a post</Link>
          </EmptyState>
        )}
        {!loading && !error && posts.length > 0 && (
          <div className="posts-grid">
            {posts.map((p) => <PostCard key={p._id} post={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
