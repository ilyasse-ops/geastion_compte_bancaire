import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register, reset } from '../slices/authSlice';
import { toast } from 'react-toastify';
import { UserPlus } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const { username, email, password, confirmPassword } = formData;
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
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
    } else {
      dispatch(register({ username, email, password }));
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-panel">
        <UserPlus size={48} color="var(--accent-primary)" style={{ marginBottom: '16px' }} />
        <h2>Create an Account</h2>
        <p>Join NovaBank for seamless digital banking.</p>
        <form onSubmit={onSubmit}>
          <input type="text" name="username" value={username} onChange={onChange} placeholder="Username" className="input-field" required />
          <input type="email" name="email" value={email} onChange={onChange} placeholder="Email" className="input-field" required />
          <input type="password" name="password" value={password} onChange={onChange} placeholder="Password" className="input-field" required />
          <input type="password" name="confirmPassword" value={confirmPassword} onChange={onChange} placeholder="Confirm Password" className="input-field" required />
          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        <p style={{ marginTop: '24px', fontSize: '14px' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent-primary)' }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
