import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function initials(user) {
  if (!user) return '?';
  return `${user.fname?.[0] ?? ''}${user.lname?.[0] ?? ''}`.toUpperCase();
}

export default function Navbar() {
  const { isAuth, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-logo">
          <div className="navbar-logo-mark">🌐</div>
          DevCom
        </NavLink>

        <div className="navbar-links">
          {isAuth && (
            <>
              <NavLink to="/feed" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                Feed
              </NavLink>
              <NavLink to="/members" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                Members
              </NavLink>
            </>
          )}
        </div>

        <div className="navbar-right">
          {isAuth ? (
            <>
              <NavLink
                to="/profile"
                className="navbar-user"
                style={{ textDecoration: 'none' }}
              >
                <div className="avatar avatar-sm">{initials(user)}</div>
                <span>{user?.fname} {user?.lname}</span>
              </NavLink>
              <button className="btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="btn-ghost btn-sm">Log in</NavLink>
              <NavLink to="/register" className="btn-primary btn-sm">Get Started</NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
