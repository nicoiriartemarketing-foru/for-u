import { type FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MagicButton from '../components/ui/MagicButton';
import MagicCard from '../components/ui/MagicCard';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { signUp, session, loading } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && session) return <Navigate to="/workspace" replace />;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const result = await signUp(email, password, displayName, whatsappNumber);
      if (result.needsEmailConfirmation) {
        setSuccessMessage('Cuenta creada. Supabase esta pidiendo confirmar el email antes de entrar. Para pruebas, desactiva Confirm email en Authentication > Providers > Email.');
        return;
      }

      navigate('/workspace', { replace: true });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No pudimos crear la cuenta. Intenta otra vez.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="foru-auth-page">
      <MagicCard as="section" className="foru-auth-card">
        <Link to="/" className="foru-auth-wordmark" aria-label="FOR U">
          FOR <span>U</span>
        </Link>
        <h1>Crea tu cuenta</h1>
        <p>Tu jefa digital guardara tu Ruta Digital, tus proyectos y tus proximas acciones.</p>

        <form onSubmit={handleSubmit} className="foru-auth-form">
          <label>
            Nombre
            <input
              type="text"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Tu nombre"
              autoComplete="name"
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="tu@email.com"
              autoComplete="email"
              required
            />
          </label>
          <label>
            WhatsApp <small>opcional</small>
            <input
              type="tel"
              value={whatsappNumber}
              onChange={(event) => setWhatsappNumber(event.target.value)}
              placeholder="+51 999 999 999"
              autoComplete="tel"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimo 6 caracteres"
              autoComplete="new-password"
              minLength={6}
              required
            />
          </label>

          {errorMessage ? <div className="foru-auth-error">{errorMessage}</div> : null}
          {successMessage ? <div className="foru-auth-success">{successMessage}</div> : null}

          <MagicButton type="submit" disabled={submitting}>
            {submitting ? 'Creando...' : 'Crear cuenta gratis'}
          </MagicButton>
        </form>

        <small>
          ¿Ya tienes cuenta? <Link to="/login">Entrar</Link>
        </small>
      </MagicCard>
    </main>
  );
}
