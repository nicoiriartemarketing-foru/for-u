import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Bot, CheckCircle2, Clock, FileText, GraduationCap, Layers3, PlayCircle } from '../lib/icons';
import { learningMaterials, phaseLabels, type LearningPhase, type MaterialFormat } from '../lib/learningMaterials';
import { playUiTone } from '../lib/sound';

const phaseOrder = Object.keys(phaseLabels) as LearningPhase[];

const formatIcon: Record<MaterialFormat, typeof BookOpen> = {
  Curso: GraduationCap,
  Ebook: BookOpen,
  Workbook: FileText,
  Tutorial: PlayCircle,
  Checklist: CheckCircle2,
};

export default function Methodology() {
  const [activePhase, setActivePhase] = useState<LearningPhase>('base');
  const activeMaterials = useMemo(
    () => learningMaterials.filter((material) => material.phase === activePhase),
    [activePhase],
  );
  const aiInputs = useMemo(
    () => learningMaterials.flatMap((material) => material.prompts).slice(0, 8),
    [],
  );

  return (
    <div className="foru-app-bg min-h-screen text-[#171717]">
      <nav className="foru-nav foru-container">
        <Link to="/" onClick={() => playUiTone('tap')} className="foru-logo">FOR <span>U</span></Link>
        <div className="foru-nav-links">
          <Link to="/ia" onClick={() => playUiTone('next')} className="foru-btn foru-btn--outline px-5 py-2 text-sm">
            IA For U
          </Link>
        </div>
      </nav>

      <main className="foru-container pb-12 pt-4">
        <section className="grid gap-6 lg:grid-cols-[1fr_0.72fr]">
          <div className="foru-aurora-card rounded-3xl p-6 md:p-8">
            <span className="foru-badge">Metodologia For U</span>
            <h1 className="foru-title mt-5">
              Aprende a crear tu <span className="text-gradient-animated">mundo digital</span> con orden.
            </h1>
            <p className="foru-subtitle mt-4 max-w-2xl">
              Cursos, ebooks, workbooks, tutoriales y checklists viven aqui. La IA For U usa este material como base para recomendar que estudiar, que crear y que corregir en cada fase.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {['1. Elige tu fase', '2. Abre un material', '3. Usalo con la IA'].map((item) => (
                <div key={item} className="foru-soft-panel rounded-2xl p-4 text-sm font-black text-gray-800">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-3xl border border-black/10 foru-dark-gradient p-6 text-white shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-[#6EE7B7]">Retroalimentacion</p>
                <h2 className="font-serif text-3xl">La IA aprende de la metodologia</h2>
              </div>
              <Bot className="text-[#FDE68A]" />
            </div>
            <p className="rounded-2xl bg-white/10 p-4 text-sm font-semibold leading-6 text-white/90">
              Cada material tiene entregables, prompts y criterios. La IA usa eso para recomendar recursos exactos, escribir mejores textos y decirte el siguiente paso sin mostrarte todo el plan.
            </p>
            <Link
              to="/ia"
              onClick={() => playUiTone('next')}
              className="tap-boost mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-[#1a1a1a]"
            >
              Preguntar a IA For U <ArrowRight size={17} />
            </Link>
          </aside>
        </section>

        <section className="mt-7 rounded-3xl border border-black/10 foru-glass p-5 shadow-xl">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-serif text-2xl font-bold">Fases del Mundo Digital</h2>
              <p className="mt-1 text-sm font-semibold text-gray-600">Toca una fase. Abajo aparece solo el material que importa ahora.</p>
            </div>
            <Layers3 className="text-[#7C5CFF]" />
          </div>

          <div className="grid gap-2 md:grid-cols-6">
            {phaseOrder.map((phase) => (
              <button
                key={phase}
                type="button"
                onClick={() => {
                  playUiTone('tap');
                  setActivePhase(phase);
                }}
                className={`tap-boost rounded-xl px-3 py-3 text-sm font-black ${
                  activePhase === phase ? 'foru-gradient-button' : 'foru-soft-panel text-gray-700'
                }`}
              >
                {phaseLabels[phase]}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-7 grid gap-5 lg:grid-cols-[1fr_0.48fr]">
          <div className="grid gap-4">
            {activeMaterials.map((material) => {
              const Icon = formatIcon[material.format];

              return (
                <article key={material.id} className="foru-gradient-border rounded-3xl p-5 shadow-lg">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-black text-gray-700">
                          <Icon size={14} /> {material.format}
                        </span>
                        <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-black text-[#7C5CFF]">{material.level}</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 text-xs font-black text-gray-600">
                          <Clock size={13} /> {material.minutes} min
                        </span>
                      </div>
                      <h3 className="mt-4 font-serif text-2xl font-bold text-gray-950">{material.title}</h3>
                      <p className="mt-2 text-sm font-semibold leading-7 text-gray-650">{material.summary}</p>
                    </div>
                    <Link
                      to="/ia"
                      onClick={() => playUiTone('next')}
                      className="tap-boost inline-flex shrink-0 items-center justify-center gap-2 rounded-xl foru-dark-gradient px-4 py-3 text-sm font-black text-white"
                    >
                      Usar con IA <ArrowRight size={16} />
                    </Link>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    <InfoBlock label="Por que importa" text={material.whyItMatters} />
                    <InfoBlock label="Entregable" text={material.deliverable} />
                    <InfoBlock label="Como lo usa la IA" text={material.aiUse} />
                  </div>
                </article>
              );
            })}
          </div>

          <aside className="space-y-5">
            <div className="rounded-3xl border border-black/10 foru-glass p-5 shadow-xl">
              <h3 className="font-serif text-2xl font-bold">Prompts que nacen del material</h3>
              <div className="mt-4 grid gap-2">
                {aiInputs.map((prompt) => (
                  <div key={prompt} className="foru-soft-panel rounded-2xl p-3 text-sm font-bold leading-6 text-gray-700">
                    {prompt}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-black/10 foru-glass p-5 shadow-xl">
              <h3 className="font-serif text-2xl font-bold">Materiales vitales incluidos</h3>
              <p className="mt-2 text-sm font-semibold leading-7 text-gray-600">
                Base estrategica, cliente, oferta visible, confianza, landing inmediata, contenido y lanzamiento. Esa es la memoria educativa con la que trabaja IA For U.
              </p>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}

function InfoBlock({ label, text }: { label: string; text: string }) {
  return (
    <div className="foru-soft-panel rounded-2xl p-4">
      <p className="text-xs font-black uppercase text-gray-500">{label}</p>
      <p className="mt-2 text-sm font-semibold leading-6 text-gray-750">{text}</p>
    </div>
  );
}
