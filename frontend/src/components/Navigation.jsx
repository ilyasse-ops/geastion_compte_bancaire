import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, reset } from '../slices/authSlice';
import { resetState } from '../slices/accountSlice';
import { LogOut, Vault } from 'lucide-react';

const Navigation = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    dispatch(resetState());
    navigate('/login');
  };

  return (
    <nav className="navbar glass-panel">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Vault color="var(--accent-primary)" size={32} />
        <h1 className="gradient-text" style={{ fontSize: '24px', fontWeight: '700' }}>Vaultia</h1>
      </div>
      <div className="nav-links">
        {user ? (
          <>
            <span style={{ marginRight: '16px', display: 'flex', alignItems: 'center', fontWeight: '500' }}>
              Bonjour, {user.prenom} {user.nom}
            </span>
            <button className="btn-secondary" onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', width: 'auto' }}>
              <LogOut size={18} /> Se déconnecter
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
