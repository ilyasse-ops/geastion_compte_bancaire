import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login, reset } from '../slices/authSlice';
import { toast } from 'react-toastify';
import { Vault } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { email, password } = formData;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isError) toast.error(message);
    if (isSuccess || user) navigate('/dashboard');
    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e) => setFormData((prevState) => ({ ...prevState, [e.target.name]: e.target.value }));

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(login({ email, password }));
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-panel">
        <Vault size={48} color="var(--accent-primary)" style={{ marginBottom: '16px' }} />
        <h2>Connexion</h2>
        <p>Connectez-vous pour gérer vos finances en toute sécurité.</p>
        <form onSubmit={onSubmit}>
          <input type="email" name="email" value={email} onChange={onChange} placeholder="Adresse email" className="input-field" required />
          <input type="password" name="password" value={password} onChange={onChange} placeholder="Mot de passe" className="input-field" required />
          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>
        <p style={{ marginTop: '24px', fontSize: '14px' }}>
          Vous n'avez pas de compte ? <Link to="/register" style={{ color: 'var(--accent-primary)' }}>S'inscrire</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
