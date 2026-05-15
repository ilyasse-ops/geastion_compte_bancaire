import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login, reset } from '../slices/authSlice';
import { toast } from 'react-toastify';
import { Lock } from 'lucide-react';

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
        <Lock size={48} color="var(--accent-primary)" style={{ marginBottom: '16px' }} />
        <h2>Welcome Back</h2>
        <p>Login to manage your finances securely.</p>
        <form onSubmit={onSubmit}>
          <input type="email" name="email" value={email} onChange={onChange} placeholder="Email" className="input-field" required />
          <input type="password" name="password" value={password} onChange={onChange} placeholder="Password" className="input-field" required />
          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Login'}
          </button>
        </form>
        <p style={{ marginTop: '24px', fontSize: '14px' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--accent-primary)' }}>Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
