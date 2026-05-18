import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { updateUser, updatePassword } from '../services/users.service.js';

export default function EditProfile() {
  const { token, user, isAuth, updateUser: setUser } = useAuth();
  const navigate = useNavigate();

  const [profileForm, setProfileForm] = useState({ fname: '', lname: '' });
  const [passForm, setPassForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passMsg, setPassMsg] = useState('');
  const [passError, setPassError] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPass, setSavingPass] = useState(false);

  useEffect(() => {
    if (!isAuth) { navigate('/login', { replace: true }); return; }
    if (user) setProfileForm({ fname: user.fname || '', lname: user.lname || '' });
  }, [isAuth, user, navigate]);

  const setP = (k) => (e) => setProfileForm((f) => ({ ...f, [k]: e.target.value }));
  const setPw = (k) => (e) => setPassForm((f) => ({ ...f, [k]: e.target.value }));

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileMsg('');
    setSavingProfile(true);
    try {
      await updateUser(profileForm, token);
      setUser({ ...user, ...profileForm });
      setProfileMsg('✓ Profile updated successfully.');
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePassSave = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassMsg('');
    if (passForm.newPassword !== passForm.confirmPassword) {
      setPassError('New passwords do not match.');
      return;
    }
    setSavingPass(true);
    try {
      await updatePassword(passForm, token);
      setPassMsg('✓ Password updated successfully.');
      setPassForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPassError(err.message || 'Failed to update password.');
    } finally {
      setSavingPass(false);
    }
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 560 }}>
        <div style={{ marginBottom: 24 }}>
          <Link to="/profile" className="btn-ghost btn-sm">← Back to profile</Link>
        </div>

        <div className="page-header">
          <h1 className="page-title">Edit Profile</h1>
        </div>

        {/* Profile Info */}
        <div className="card" style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: 'var(--text-secondary)' }}>
            Personal Info
          </h2>
          <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">First name</label>
                <input className="input" value={profileForm.fname} onChange={setP('fname')} required />
              </div>
              <div className="form-group">
                <label className="form-label">Last name</label>
                <input className="input" value={profileForm.lname} onChange={setP('lname')} required />
              </div>
            </div>
            {profileError && <div className="form-error">⚠️ {profileError}</div>}
            {profileMsg && <div style={{ fontSize: 13, color: 'var(--success)' }}>{profileMsg}</div>}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn-primary btn-sm" disabled={savingProfile}>
                {savingProfile ? <span className="spinner spinner-sm" /> : 'Save changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Password */}
        <div className="card">
          <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: 'var(--text-secondary)' }}>
            Change Password
          </h2>
          <form onSubmit={handlePassSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Current password</label>
              <input className="input" type="password" value={passForm.oldPassword}
                onChange={setPw('oldPassword')} required />
            </div>
            <div className="form-group">
              <label className="form-label">New password</label>
              <input className="input" type="password" placeholder="Min 6 chars, include a number"
                value={passForm.newPassword} onChange={setPw('newPassword')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm new password</label>
              <input className="input" type="password" value={passForm.confirmPassword}
                onChange={setPw('confirmPassword')} required />
            </div>
            {passError && <div className="form-error">⚠️ {passError}</div>}
            {passMsg && <div style={{ fontSize: 13, color: 'var(--success)' }}>{passMsg}</div>}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn-primary btn-sm" disabled={savingPass}>
                {savingPass ? <span className="spinner spinner-sm" /> : 'Update password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
