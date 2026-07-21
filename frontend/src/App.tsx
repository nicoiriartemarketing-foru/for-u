import type { ReactNode } from 'react';
import { BrowserRouter as Router, Navigate, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AiForU from './pages/AiForU';
import Methodology from './pages/Methodology';
import RegisterWizard from './pages/auth/RegisterWizard';
import Dashboard from './pages/dashboard/Dashboard';
import WorldEditor from './pages/editor/WorldEditor';
import PublicLanding from './pages/public/PublicLanding';
import MundoDigital from './pages/MundoDigital';
import StudioAccess, { hasStudioAccess } from './pages/StudioAccess';
import ReservationsAdmin from './pages/admin/ReservationsAdmin';
import AdventureMvp from './pages/AdventureMvp';

function PrivateStudio({ children }: { children: ReactNode }) {
  const nextPath = `${window.location.pathname}${window.location.search}`;
  return hasStudioAccess() ? children : <Navigate to={`/studio?next=${encodeURIComponent(nextPath)}`} replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ia" element={<AiForU />} />
        <Route path="/metodologia" element={<Methodology />} />
        <Route path="/mundo-digital" element={<MundoDigital />} />
        <Route path="/aventura" element={<AdventureMvp />} />
        <Route path="/studio" element={<StudioAccess />} />
        <Route path="/register" element={<RegisterWizard />} />
        <Route path="/dashboard" element={<PrivateStudio><Dashboard /></PrivateStudio>} />
        <Route path="/editor" element={<PrivateStudio><WorldEditor /></PrivateStudio>} />
        <Route path="/reservas" element={<PrivateStudio><ReservationsAdmin /></PrivateStudio>} />
        <Route path="/p/:slug" element={<PublicLanding />} />
      </Routes>
    </Router>
  );
}

export default App;
