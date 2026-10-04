import { Input as DSInput } from '../components/ui/DesignSystem';
import { type FormEvent, useRef, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MagicButton from '../components/ui/MagicButton';
import MagicCard from '../components/ui/MagicCard';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { signUp, session, loading } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmation, setConfirmation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const busy = useRef(false);
  if (!loading && session) return <Navigate to="/dashboard" replace />;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current || !displayName.trim()) return;
    busy.current = true; setSubmitting(true); setErrorMessage('');
    try {
      const result = await signUp(email, password, displayName);
      if (result.needsEmailConfirmation) { setConfirmation(true); setPassword(''); return; }
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No pudimos crear la cuenta. Intenta otra vez.');
    } finally { busy.current = false; setSubmitting(false); }
  }
  return <main className="foru-auth-page"><MagicCard as="section" className="foru-auth-card">
    <Link to="/" className="foru-auth-wordmark" aria-label="FOR U">FOR <span>U</span></Link>
    <h1>{confirmation ? 'Revisa tu correo' : 'Tu negocio listo para compartir'}</h1>
    {confirmation ? <div role="status"><p>Te enviamos un enlace a <strong>{email}</strong>. Confirma tu correo para entrar y crear tu Ruta Digital.</p><p>Si no lo encuentras, revisa spam. Si ya tienes una cuenta, entra con tu contraseña.</p><Link to="/login?next=%2Fdashboard">Ir a iniciar sesión</Link></div> : <>
      <p>Crea tu cuenta, arma tu menú y comparte un enlace para recibir pedidos.</p>
      <form onSubmit={handleSubmit} className="foru-auth-form">
        <label>Nombre<DSInput type="text" value={displayName} onChange={event => setDisplayName(event.target.value)} placeholder="Tu nombre" autoComplete="name" required maxLength={100} /></label>
        <label>Email<DSInput type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="tu@email.com" autoComplete="email" required /></label>
        <label>Contraseña<DSInput type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="Mínimo 6 caracteres" autoComplete="new-password" minLength={6} required /></label>
        <label>Tipo de negocio<select name="businessType" defaultValue="restaurant" required><option value="restaurant">Restaurante</option></select></label>
        <small>También para pastelerías, cafeterías y comida por encargo.</small>
        {errorMessage && <div role="alert" className="foru-auth-error">{errorMessage}</div>}
        <MagicButton type="submit" disabled={submitting || loading}>{submitting ? 'Creando tu cuenta…' : 'Crear cuenta gratis'}</MagicButton>
      </form>
    </>}
    <small>¿Ya tienes cuenta? <Link to="/login">Entrar</Link></small>
  </MagicCard></main>;
}
