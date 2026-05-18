import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { createPost } from '../services/posts.service.js';

export default function CreatePost() {
  const { token, isAuth } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', content: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuth) navigate('/login', { replace: true });
  }, [isAuth, navigate]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await createPost(form, token);
      navigate('/feed');
    } catch (err) {
      setError(err.message || 'Failed to create post.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 680 }}>
        <div style={{ marginBottom: 24 }}>
          <Link to="/feed" className="btn-ghost btn-sm">← Back to feed</Link>
        </div>

        <div className="page-header">
          <h1 className="page-title">New Post</h1>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input className="input" placeholder="What's on your mind?"
                value={form.title} onChange={set('title')} required />
            </div>

            <div className="form-group">
              <label className="form-label">Content</label>
              <textarea className="textarea" placeholder="Share your thoughts, insights, or questions..."
                style={{ minHeight: 200 }}
                value={form.content} onChange={set('content')} required />
            </div>

            {error && <div className="form-error">⚠️ {error}</div>}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Link to="/feed" className="btn-ghost">Cancel</Link>
              <button className="btn-primary" type="submit" disabled={loading}>
                {loading ? <span className="spinner spinner-sm" /> : 'Publish post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
