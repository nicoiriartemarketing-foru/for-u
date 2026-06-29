import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Bot, Edit3, LayoutDashboard, Sparkles, Store } from '../lib/icons';
import { draftStorageKey, loadLocalDraft } from '../lib/digitalWorldDraft';
import { playUiTone } from '../lib/sound';

export default function Home() {
  const [studioModalOpen, setStudioModalOpen] = useState(false);
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
        <button
          type="button"
          onClick={() => {
            playUiTone('tap');
            setStudioModalOpen(true);
          }}
          className="foru-reference-card"
        >
          <span className="foru-reference-card-icon"><LayoutDashboard size={31} /></span>
          <h2>Studio Digital <span className="foru-reference-gradient-text">FOR U</span></h2>
          <p>Tu centro de contenido, calendario, web y campanas. Estamos puliendo la experiencia antes de abrirla.</p>
          <span className="foru-reference-tag">Muy pronto</span>
        </button>

        <Link to="/mundo-digital" onClick={() => playUiTone('next')} className="foru-reference-card">
          <span className="foru-reference-card-icon"><Store size={31} /></span>
          <h2>Quiero mi mundo <span className="foru-reference-gradient-text">digital</span></h2>
          <p>Agenda tu diagnostico y armamos el sistema que tu negocio necesita para vender, reservar o captar leads.</p>
          <span className="foru-reference-tag">Agendar ahora →</span>
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
        <Link to="/studio" onClick={() => playUiTone('tap')} className="foru-reference-mini">
          <Edit3 size={19} /> Studio <ArrowRight size={16} className="ml-auto" />
        </Link>
      </section>

      {studioModalOpen && (
        <div className="foru-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="studio-modal-title">
          <div className="foru-coming-modal">
            <button type="button" className="foru-modal-close" onClick={() => setStudioModalOpen(false)} aria-label="Cerrar">x</button>
            <span className="foru-lp-badge"><Sparkles size={16} /> Muy pronto</span>
            <h2 id="studio-modal-title">Studio Digital FOR U</h2>
            <p>
              Aqui podras organizar contenido, campanas, calendario, ideas, publicaciones y la evolucion de tu mundo digital.
              Por ahora esta cerrado para terminarlo con calma y abrirlo bien.
            </p>
            <div className="foru-coming-actions">
              <Link to="/mundo-digital" className="foru-btn" onClick={() => playUiTone('next')}>Quiero mi mundo digital</Link>
              <Link to="/studio" className="foru-btn foru-btn--outline" onClick={() => playUiTone('tap')}>Ingresar con contraseña</Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
