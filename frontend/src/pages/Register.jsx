import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register, reset } from '../slices/authSlice';
import { toast } from 'react-toastify';
import { Vault } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    confirmPassword: '',
    telephone: '',
    adresse: ''
  });

  const { nom, prenom, email, password, confirmPassword, telephone, adresse } = formData;
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
      toast.error('Les mots de passe ne correspondent pas');
    } else {
      dispatch(register({ nom, prenom, email, password, telephone, adresse }));
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-panel" style={{ maxWidth: '550px' }}>
        <Vault size={48} color="var(--accent-primary)" style={{ marginBottom: '16px' }} />
        <h2>Créer un Compte</h2>
        <p>Rejoignez Vaultia pour des services bancaires numériques sécurisés et intuitifs.</p>
        <form onSubmit={onSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '100%' }}>
          <input
            type="text"
            name="nom"
            value={nom}
            onChange={onChange}
            placeholder="Nom"
            className="input-field"
            required
          />
          <input
            type="text"
            name="prenom"
            value={prenom}
            onChange={onChange}
            placeholder="Prénom"
            className="input-field"
            required
          />
          <input
            type="email"
            name="email"
            value={email}
            onChange={onChange}
            placeholder="Email"
            className="input-field"
            style={{ gridColumn: 'span 2' }}
            required
          />
          <input
            type="text"
            name="telephone"
            value={telephone}
            onChange={onChange}
            placeholder="Téléphone (Optionnel)"
            className="input-field"
          />
          <input
            type="text"
            name="adresse"
            value={adresse}
            onChange={onChange}
            placeholder="Adresse (Optionnel)"
            className="input-field"
          />
          <input
            type="password"
            name="password"
            value={password}
            onChange={onChange}
            placeholder="Mot de passe"
            className="input-field"
            required
          />
          <input
            type="password"
            name="confirmPassword"
            value={confirmPassword}
            onChange={onChange}
            placeholder="Confirmer mot de passe"
            className="input-field"
            required
          />
          <button type="submit" className="btn-primary" style={{ gridColumn: 'span 2', marginTop: '12px' }} disabled={isLoading}>
            {isLoading ? 'Création du compte...' : 'S\'inscrire'}
          </button>
        </form>
        <p style={{ marginTop: '24px', fontSize: '14px' }}>
          Vous avez déjà un compte ? <Link to="/login" style={{ color: 'var(--accent-primary)' }}>Se connecter</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
