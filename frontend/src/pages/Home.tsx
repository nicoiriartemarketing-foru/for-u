import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Bot, Edit3, LayoutDashboard, Store } from '../lib/icons';
import { draftStorageKey, loadLocalDraft } from '../lib/digitalWorldDraft';
import { playUiTone } from '../lib/sound';

export default function Home() {
  const hasBusiness = typeof window !== 'undefined' && Boolean(localStorage.getItem(draftStorageKey));
  const draft = loadLocalDraft();

  return (
    <main className="foru-reference-hub text-[#171717]">
      <div className="foru-reference-blur foru-reference-blur--gold" />
      <div className="foru-reference-blur foru-reference-blur--green" />
      <div className="foru-reference-blur foru-reference-blur--pink" />

      <Link to="/" className="foru-reference-logo" onClick={() => playUiTone('tap')}>
        FOR <span>U</span>
      </Link>
      <p className="foru-reference-subtitle">
        {hasBusiness ? `Hola, ${draft.businessName}. Elige cómo quieres continuar.` : 'Tu sistema digital completo. Elige cómo quieres empezar.'}
      </p>

      <section className="foru-reference-buttons">
        <Link to="/dashboard" onClick={() => playUiTone('next')} className="foru-reference-card">
          <span className="foru-reference-card-icon"><LayoutDashboard size={31} /></span>
          <h2>Studio Digital <span className="foru-reference-gradient-text">FOR U</span></h2>
          <p>Plataforma guiada: crea contenido, diseña tu web, organiza tu calendario y publica sin perderte.</p>
          <span className="foru-reference-tag">Experiencia completa →</span>
        </Link>

        <Link to="/mundo-digital" onClick={() => playUiTone('next')} className="foru-reference-card">
          <span className="foru-reference-card-icon"><Store size={31} /></span>
          <h2>Mundo Digital <span className="foru-reference-gradient-text">For U</span></h2>
          <p>Tu presencia lista para vender: portada, oferta, confianza, preguntas y botón principal de acción.</p>
          <span className="foru-reference-tag">Servicio a medida →</span>
        </Link>
      </section>

      <p className="foru-reference-note">Ambos caminos convergen: tu marca, en su mejor versión.</p>

      <section className="foru-reference-minis">
        <Link to="/metodologia" onClick={() => playUiTone('tap')} className="foru-reference-mini">
          <BookOpen size={19} /> Metodología
        </Link>
        <Link to="/ia" onClick={() => playUiTone('tap')} className="foru-reference-mini">
          <Bot size={19} /> IA For U
        </Link>
        <Link to="/dashboard" onClick={() => playUiTone('tap')} className="foru-reference-mini">
          <Edit3 size={19} /> Studio <ArrowRight size={16} className="ml-auto" />
        </Link>
      </section>
    </main>
  );
}
