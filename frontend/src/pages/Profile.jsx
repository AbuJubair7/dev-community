import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getSkills, createSkill, deleteSkill } from '../services/skills.service.js';
import { getExperiences, createExperience, deleteExperience } from '../services/experiences.service.js';
import { deleteUser } from '../services/users.service.js';
import Spinner from '../components/Spinner.jsx';
import ErrorCard from '../components/ErrorCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import SkillTag from '../components/SkillTag.jsx';
import ExperienceCard from '../components/ExperienceCard.jsx';

function initials(user) {
  if (!user) return '?';
  return `${user.fname?.[0] ?? ''}${user.lname?.[0] ?? ''}`.toUpperCase();
}

export default function Profile() {
  const { token, user, isAuth, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [skills, setSkills] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [loadingExp, setLoadingExp] = useState(true);
  const [error, setError] = useState('');

  // Add skill form
  const [newSkill, setNewSkill] = useState('');
  const [addingSkill, setAddingSkill] = useState(false);

  // Add experience form
  const [showExpForm, setShowExpForm] = useState(false);
  const [expForm, setExpForm] = useState({ companyName: '', role: '', startDate: '', endDate: '', description: '' });
  const [addingExp, setAddingExp] = useState(false);
  const [expError, setExpError] = useState('');

  // Delete account
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!isAuth) { navigate('/login', { replace: true }); return; }
    getSkills(token).then(setSkills).catch(() => {}).finally(() => setLoadingSkills(false));
    getExperiences(token).then(setExperiences).catch(() => {}).finally(() => setLoadingExp(false));
  }, [token, isAuth, navigate]);

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    setAddingSkill(true);
    try {
      await createSkill({ name: newSkill.trim() }, token);
      const updated = await getSkills(token);
      setSkills(updated);
      setNewSkill('');
    } catch (err) {
      setError(err.message || 'Failed to add skill.');
    } finally {
      setAddingSkill(false);
    }
  };

  const handleDeleteSkill = async () => {
    try {
      await deleteSkill(token);
      const updated = await getSkills(token);
      setSkills(updated);
    } catch (err) {
      setError(err.message || 'Failed to remove skill.');
    }
  };

  const setExpField = (k) => (e) => setExpForm((f) => ({ ...f, [k]: e.target.value }));

  const handleAddExp = async (e) => {
    e.preventDefault();
    setExpError('');
    setAddingExp(true);
    try {
      await createExperience(expForm, token);
      const updated = await getExperiences(token);
      setExperiences(updated);
      setShowExpForm(false);
      setExpForm({ companyName: '', role: '', startDate: '', endDate: '', description: '' });
    } catch (err) {
      setExpError(err.message || 'Failed to add experience.');
    } finally {
      setAddingExp(false);
    }
  };

  const handleDeleteExp = async () => {
    try {
      await deleteExperience(token);
      const updated = await getExperiences(token);
      setExperiences(updated);
    } catch (err) {
      setError(err.message || 'Failed to remove experience.');
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteUser(token);
      logout();
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to delete account.');
      setDeleting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="page">
      <div className="container">

        {/* Profile Header */}
        <div className="profile-header">
          <div className="avatar avatar-lg">{initials(user)}</div>
          <div className="profile-info">
            <h1>{user.fname} {user.lname}</h1>
            <p>{user.email}</p>
          </div>
          <Link to="/profile/edit" className="btn-ghost btn-sm" style={{ marginLeft: 'auto' }}>Edit Profile</Link>
        </div>

        {error && <ErrorCard message={error} />}

        <div className="divider" />

        {/* Skills */}
        <div>
          <div className="section-header">
            <span className="section-title">Skills</span>
          </div>

          {loadingSkills ? <Spinner /> : (
            <>
              <div className="skills-wrap">
                {skills.length === 0 && (
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>No skills added yet.</span>
                )}
                {skills.map((s) => (
                  <SkillTag key={s._id} name={s.name} onDelete={handleDeleteSkill} />
                ))}
              </div>

              <form className="inline-form" onSubmit={handleAddSkill}>
                <input className="input" placeholder="Add a skill…" style={{ maxWidth: 220 }}
                  value={newSkill} onChange={(e) => setNewSkill(e.target.value)} />
                <button className="btn-ghost btn-sm" type="submit" disabled={addingSkill || !newSkill.trim()}>
                  {addingSkill ? <span className="spinner spinner-sm" /> : '+ Add'}
                </button>
              </form>
            </>
          )}
        </div>

        <div className="divider" />

        {/* Experiences */}
        <div>
          <div className="section-header">
            <span className="section-title">Experience</span>
            <button className="btn-ghost btn-sm" onClick={() => setShowExpForm((v) => !v)}>
              {showExpForm ? 'Cancel' : '+ Add'}
            </button>
          </div>

          {showExpForm && (
            <div className="card" style={{ marginBottom: 16 }}>
              <form onSubmit={handleAddExp} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Company</label>
                    <input className="input" placeholder="Tech Corp" value={expForm.companyName}
                      onChange={setExpField('companyName')} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Role</label>
                    <input className="input" placeholder="Software Engineer" value={expForm.role}
                      onChange={setExpField('role')} required />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input className="input" type="date" value={expForm.startDate}
                      onChange={setExpField('startDate')} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date <span style={{ opacity: 0.5 }}>(optional)</span></label>
                    <input className="input" type="date" value={expForm.endDate}
                      onChange={setExpField('endDate')} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Description <span style={{ opacity: 0.5 }}>(optional)</span></label>
                  <textarea className="textarea" placeholder="What did you work on?" style={{ minHeight: 80 }}
                    value={expForm.description} onChange={setExpField('description')} />
                </div>
                {expError && <div className="form-error">⚠️ {expError}</div>}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <button type="button" className="btn-ghost btn-sm" onClick={() => setShowExpForm(false)}>Cancel</button>
                  <button type="submit" className="btn-primary btn-sm" disabled={addingExp}>
                    {addingExp ? <span className="spinner spinner-sm" /> : 'Add Experience'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {loadingExp ? <Spinner /> : experiences.length === 0 ? (
            <EmptyState icon="💼" title="No experiences yet" message="Add your work history to your profile." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {experiences.map((exp) => (
                <ExperienceCard key={exp._id} exp={exp} onDelete={handleDeleteExp} />
              ))}
            </div>
          )}
        </div>

        <div className="divider" />

        {/* Danger Zone */}
        <div>
          <p className="section-title" style={{ color: 'var(--danger)', marginBottom: 12 }}>Danger Zone</p>
          {!confirmDelete ? (
            <button className="btn-danger btn-sm" onClick={() => setConfirmDelete(true)}>Delete account</button>
          ) : (
            <div className="confirm-banner">
              <span>This will permanently delete your account. Are you sure?</span>
              <div className="confirm-banner-actions">
                <button className="btn-ghost btn-sm" onClick={() => setConfirmDelete(false)}>Cancel</button>
                <button className="btn-danger btn-sm" onClick={handleDeleteAccount} disabled={deleting}>
                  {deleting ? <span className="spinner spinner-sm" /> : 'Yes, delete'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
