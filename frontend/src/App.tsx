import { lazy, Suspense, type ReactNode } from 'react';
import { BrowserRouter as Router, Navigate, Routes, Route } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const AiForU = lazy(() => import('./pages/AiForU'));
const Methodology = lazy(() => import('./pages/Methodology'));
const RegisterWizard = lazy(() => import('./pages/auth/RegisterWizard'));
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const WorldEditor = lazy(() => import('./pages/editor/WorldEditor'));
const PublicLanding = lazy(() => import('./pages/public/PublicLanding'));
const MundoDigital = lazy(() => import('./pages/MundoDigital'));
const StudioAccess = lazy(() => import('./pages/StudioAccess'));
const ReservationsAdmin = lazy(() => import('./pages/admin/ReservationsAdmin'));
const AdventureMvp = lazy(() => import('./pages/AdventureMvp'));
const ForUWorkspace = lazy(() => import('./pages/ForUWorkspace'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const WhatsAppConnect = lazy(() => import('./pages/WhatsAppConnect'));

function hasStudioAccess() {
  return window.localStorage.getItem('foru-studio-access') === 'granted';
}

function PrivateStudio({ children }: { children: ReactNode }) {
  const nextPath = `${window.location.pathname}${window.location.search}`;
  return hasStudioAccess() ? children : <Navigate to={`/studio?next=${encodeURIComponent(nextPath)}`} replace />;
}

function PrivateWorkspace({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const nextPath = `${window.location.pathname}${window.location.search}`;

  if (loading) {
    return (
      <main className="foru-auth-page">
        <section className="foru-auth-card">
          <span className="foru-auth-kicker">FOR U</span>
          <h1>Cargando tu espacio...</h1>
          <p>Un segundo, estamos buscando tus proyectos.</p>
        </section>
      </main>
    );
  }

  return session ? children : <Navigate to={`/login?next=${encodeURIComponent(nextPath)}`} replace />;
}

function App() {
  return (
    <Router>
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/ia" element={<AiForU />} />
          <Route path="/metodologia" element={<Methodology />} />
          <Route path="/mundo-digital" element={<MundoDigital />} />
          <Route path="/aventura" element={<AdventureMvp />} />
          <Route path="/workspace" element={<PrivateWorkspace><ForUWorkspace /></PrivateWorkspace>} />
          <Route path="/whatsapp" element={<PrivateWorkspace><WhatsAppConnect /></PrivateWorkspace>} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/studio" element={<StudioAccess />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/register-wizard" element={<RegisterWizard />} />
          <Route path="/dashboard" element={<PrivateStudio><Dashboard /></PrivateStudio>} />
          <Route path="/editor" element={<PrivateStudio><WorldEditor /></PrivateStudio>} />
          <Route path="/reservas" element={<PrivateStudio><ReservationsAdmin /></PrivateStudio>} />
          <Route path="/p/:slug" element={<PublicLanding />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

function RouteLoader() {
  return (
    <main className="foru-auth-page">
      <section className="foru-auth-card">
        <span className="foru-auth-kicker">FOR U</span>
        <h1>Cargando...</h1>
      </section>
    </main>
  );
}

export default App;
