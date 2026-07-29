import { FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import Logo from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';
import MagicButton from '../components/ui/MagicButton';
import MagicCard from '../components/ui/MagicCard';
import MagicBadge from '../components/ui/MagicBadge';
import GradientText from '../components/ui/GradientText';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn, session, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const next = searchParams.get('next') || '/workspace';

  if (!loading && session) return <Navigate to={next} replace />;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    try {
      await signIn(email, password);
      navigate(next, { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No pudimos iniciar sesion. Intenta otra vez.';
      setErrorMessage(
        message.toLowerCase().includes('invalid login credentials')
          ? 'Supabase no acepto esas credenciales. Si acabas de registrarte, probablemente falta confirmar el email o desactivar Confirm email en Supabase para pruebas.'
          : message,
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="foru-auth-page">
      <MagicCard as="section" className="foru-auth-card">
        <Link to="/" className="foru-auth-logo" aria-label="FOR U">
          <Logo />
        </Link>
        <MagicBadge>Bienvenida de vuelta</MagicBadge>
        <h1><GradientText>Entra a tu tablero, Nicole</GradientText></h1>
        <p>For U recuerda tus proyectos y te deja justo en la proxima accion.</p>

        <form onSubmit={handleSubmit} className="foru-auth-form">
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
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Tu clave"
              autoComplete="current-password"
              required
            />
          </label>

          {errorMessage ? <div className="foru-auth-error">{errorMessage}</div> : null}

          <MagicButton type="submit" disabled={submitting}>
            {submitting ? 'Entrando...' : 'Entrar'}
          </MagicButton>
        </form>

        <small>
          ¿Primera vez por aqui? <Link to="/register">Crear cuenta gratis</Link>
        </small>
      </MagicCard>
    </main>
  );
}
