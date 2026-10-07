import { Card as DSCard } from './components/ui/DesignSystem';
import { Toaster } from 'react-hot-toast';
import { Component, lazy, Suspense, type ErrorInfo, type ReactNode } from 'react';
import { BrowserRouter as Router, Navigate, Routes, Route, useLocation } from 'react-router-dom';
import WorkspaceShell from './pages/dashboard/WorkspaceShell';
import { AreaDocumentsProvider } from './pages/dashboard/AreaDocuments';
const WorldPage = lazy(() => import('./pages/dashboard/WorldPage'));
const WorkspaceSettings = lazy(() => import('./pages/dashboard/WorkspaceSettings'));
import { useAuth } from './contexts/AuthContext';
import { PomodoroProvider } from './contexts/PomodoroContext';
import FloatingPomodoro from './components/FloatingPomodoro';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const AiForU = lazy(() => import('./pages/AiForU'));
const Methodology = lazy(() => import('./pages/Methodology'));
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const LegacyDashboard = lazy(() => import('./pages/dashboard/Dashboard').then(module => ({ default: module.LegacyDashboard })));
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
const ToolkitDemo = lazy(() => import('./toolkit/Toolkit').then(module => ({ default: module.ToolkitDemo })));
const SiteEditorFrame = lazy(() => import('./toolkit/SiteEditorFrame'));
const PublicSite = lazy(() => import('./toolkit/PublicSite'));
const JourneyMapDemo = lazy(() => import('./components/JourneyMap').then(module => ({ default: module.JourneyMapDemo })));
const RestaurantWorkspace = lazy(() => import('./modules/restaurant/RestaurantWorkspace'));
const EcommerceWorkspace = lazy(() => import('./modules/ecommerce/EcommerceWorkspace'));
const HospitalityWorkspace = lazy(() => import('./modules/hospitality/HospitalityWorkspace'));
const TourismWorkspace = lazy(() => import('./modules/tourism/TourismWorkspace'));
const CoursesWorkspace = lazy(() => import('./modules/courses/CoursesWorkspace'));
const ContentCreator = lazy(() => import('./components/shared/ContentCreator'));
const DashboardTool = lazy(() => import('./pages/dashboard/DashboardTool'));
const PublicRestaurant = lazy(() => import('./modules/restaurant/PublicRestaurant'));
const PublicTourism = lazy(() => import('./modules/tourism/PublicTourism'));

// Nuevas rutas creadas recientemente
const CreatorStudio = lazy(() => import('./pages/dashboard/CreatorStudio'));
const LandingCaptacion = lazy(() => import('./pages/estudio/LandingCaptacion'));
const RegistroRapido = lazy(() => import('./pages/estudio/RegistroRapido'));
const PreparacionChecklist = lazy(() => import('./pages/estudio/PreparacionChecklist'));
const ReservaHorario = lazy(() => import('./pages/estudio/ReservaHorario'));
const Confirmacion = lazy(() => import('./pages/estudio/Confirmacion'));

function hasStudioAccess() {
  return window.localStorage.getItem('foru-studio-access') === 'granted';
}

function PrivateStudio({ children }: { children: ReactNode }) {
  const nextPath = `${window.location.pathname}${window.location.search}`;
  return hasStudioAccess() ? children : <Navigate to={`/studio?next=${encodeURIComponent(nextPath)}`} replace />;
}

function PrivateWorkspace({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { session, loading } = useAuth();
  const nextPath = `${window.location.pathname}${window.location.search}`;

  if (loading) {
    return (
      <main className="foru-auth-page">
        <DSCard as="section" className="foru-auth-card">
          <span className="foru-auth-kicker">FOR U</span>
          <h1>Cargando tu espacio...</h1>
          <p>Un segundo, estamos buscando tus proyectos.</p>
        </DSCard>
      </main>
    );
  }

  const unified = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/modules/') || location.pathname === '/content-creator' || location.pathname === '/creator-studio';
  return session ? <>{unified ? <WorkspaceShell>{children}</WorkspaceShell> : children}<FloatingPomodoro /></> : <Navigate to={`/login?next=${encodeURIComponent(nextPath)}`} replace />;
}

function App() {
  return (
    <AppErrorBoundary>
      <Router>
        <Toaster position="top-right" toastOptions={{ duration: 3500, success: { style: { background: '#f0fdf4', color: '#14532d', border: '1px solid #86efac' } } }} />
        <AreaDocumentsProvider><PomodoroProvider><Suspense fallback={<RouteLoader />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/ia" element={<AiForU />} />
            <Route path="/metodologia" element={<Methodology />} />
            <Route path="/mundo-digital" element={<MundoDigital />} />
            <Route path="/aventura" element={<AdventureMvp />} />
            <Route path="/workspace" element={<PrivateWorkspace><ForUWorkspace /></PrivateWorkspace>} />
            <Route path="/modules/restaurant" element={<PrivateWorkspace><RestaurantWorkspace /></PrivateWorkspace>} />
            <Route path="/modules/restaurant/editor" element={<PrivateWorkspace><RestaurantWorkspace /></PrivateWorkspace>} />
            <Route path="/modules/hospitality" element={<PrivateWorkspace><HospitalityWorkspace /></PrivateWorkspace>} />
            <Route path="/modules/hospitality/editor" element={<PrivateWorkspace><HospitalityWorkspace /></PrivateWorkspace>} />
            <Route path="/modules/ecommerce" element={<PrivateWorkspace><EcommerceWorkspace /></PrivateWorkspace>} />
            <Route path="/modules/ecommerce/editor" element={<PrivateWorkspace><EcommerceWorkspace /></PrivateWorkspace>} />
            <Route path="/modules/tourism" element={<PrivateWorkspace><TourismWorkspace /></PrivateWorkspace>} />
            <Route path="/modules/tourism/editor" element={<PrivateWorkspace><TourismWorkspace /></PrivateWorkspace>} />
            <Route path="/modules/courses" element={<PrivateWorkspace><CoursesWorkspace /></PrivateWorkspace>} />
            <Route path="/modules/courses/editor" element={<PrivateWorkspace><CoursesWorkspace /></PrivateWorkspace>} />
            <Route path="/content-creator" element={<PrivateWorkspace><ContentCreator /></PrivateWorkspace>} />
            <Route path="/creator-studio" element={<PrivateWorkspace><CreatorStudio /></PrivateWorkspace>} />
            
            {/* Rutas de captación de El Estudio de Nicole */}
            <Route path="/estudio" element={<LandingCaptacion />} />
            <Route path="/registro" element={<RegistroRapido />} />
            <Route path="/preparacion" element={<PreparacionChecklist />} />
            <Route path="/reserva" element={<ReservaHorario />} />
            <Route path="/exito" element={<Confirmacion />} />

            <Route path="/negocio/:slug" element={<PublicRestaurant />} />
            <Route path="/experiencias/:slug" element={<PublicTourism />} />
            <Route path="/herramientas/demo" element={<ToolkitDemo />} />
            <Route path="/mapa/demo" element={<JourneyMapDemo />} />
            <Route path="/site-preview" element={<SiteEditorFrame />} />
            <Route path="/s/:slug" element={<PublicSite />} />
            <Route path="/whatsapp" element={<PrivateWorkspace><WhatsAppConnect /></PrivateWorkspace>} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/studio" element={<StudioAccess />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/register-wizard" element={<Navigate to="/register" replace />} />
            <Route path="/dashboard" element={<PrivateWorkspace><Dashboard /></PrivateWorkspace>} />
            <Route path="/dashboard/world" element={<PrivateWorkspace><WorldPage /></PrivateWorkspace>} />
            <Route path="/dashboard/settings" element={<PrivateWorkspace><WorkspaceSettings /></PrivateWorkspace>} />
            <Route path="/dashboard/tools/:tool" element={<PrivateWorkspace><DashboardTool /></PrivateWorkspace>} />
            <Route path="/studio/dashboard" element={<PrivateStudio><LegacyDashboard /></PrivateStudio>} />
            <Route path="/editor" element={<PrivateStudio><WorldEditor /></PrivateStudio>} />
            <Route path="/reservas" element={<PrivateStudio><ReservationsAdmin /></PrivateStudio>} />
            <Route path="/p/:slug" element={<PublicLanding />} />
            <Route path="/:slug" element={<PublicRestaurant />} />
          </Routes>
        </Suspense></PomodoroProvider></AreaDocumentsProvider>
      </Router>
    </AppErrorBoundary>
  );
}

class AppErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; message?: string }> {
  state = { hasError: false, message: undefined };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('For U runtime error:', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="foru-auth-page">
        <DSCard as="section" className="foru-auth-card">
          <span className="foru-auth-kicker">FOR U</span>
          <h1>La app cargó con un error.</h1>
          <p>Ya no dejamos la pantalla en blanco. Refresca la página o vuelve al inicio.</p>
          {this.state.message ? <small>{this.state.message}</small> : null}
          <a href="/" className="foru-ripple-button">Volver al inicio</a>
        </DSCard>
      </main>
    );
  }
}

function RouteLoader() {
  return (
    <main className="foru-auth-page">
      <DSCard as="section" className="foru-auth-card">
        <span className="foru-auth-kicker">FOR U</span>
        <h1>Cargando...</h1>
      </DSCard>
    </main>
  );
}

export default App;
