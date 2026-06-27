import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AiForU from './pages/AiForU';
import Methodology from './pages/Methodology';
import RegisterWizard from './pages/auth/RegisterWizard';
import Dashboard from './pages/dashboard/Dashboard';
import WorldEditor from './pages/editor/WorldEditor';
import PublicLanding from './pages/public/PublicLanding';
import MundoDigital from './pages/MundoDigital';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ia" element={<AiForU />} />
        <Route path="/metodologia" element={<Methodology />} />
        <Route path="/mundo-digital" element={<MundoDigital />} />
        <Route path="/register" element={<RegisterWizard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/editor" element={<WorldEditor />} />
        <Route path="/p/:slug" element={<PublicLanding />} />
      </Routes>
    </Router>
  );
}

export default App;
