import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Bot, CheckCircle2, FileText, Lightbulb, MessageCircle, Send, Sparkles } from '../lib/icons';
import { loadLocalDraft } from '../lib/digitalWorldDraft';
import {
  getLearningPhaseFromDraft,
  getRecommendedMaterials,
  learningMaterials,
  phaseLabels,
  type LearningPhase,
} from '../lib/learningMaterials';
import { playUiTone } from '../lib/sound';
import { supabase } from '../lib/supabase';

const phaseOptions = Object.keys(phaseLabels) as LearningPhase[];

export default function AiForU() {
  const draft = loadLocalDraft();
  const detectedPhase = getLearningPhaseFromDraft(draft);
  const [phase, setPhase] = useState<LearningPhase>(detectedPhase);
  const [question, setQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [aiStatus, setAiStatus] = useState<'local' | 'live' | 'needs-key'>('local');
  const recommendations = useMemo(() => getRecommendedMaterials(phase, draft), [phase, draft]);
  const knowledgeCount = learningMaterials.length;
  const primaryMaterial = recommendations[0];

  const answer = question.trim()
    ? aiAnswer || `Para ${draft.businessName}, yo empezaria por ${primaryMaterial.title}. Tu pregunta apunta a ${phaseLabels[phase].toLowerCase()}, asi que el siguiente paso es crear este entregable: ${primaryMaterial.deliverable.toLowerCase()}.`
    : `Segun tu mundo digital actual, la fase mas util parece ser ${phaseLabels[phase].toLowerCase()}. Te recomiendo empezar con ${primaryMaterial.title} y convertirlo en una accion concreta antes de abrir mas tareas.`;

  async function askAiForU() {
    playUiTone('success');
    if (!question.trim()) return;

    setIsThinking(true);
    setAiAnswer('');

    if (!supabase) {
      setAiStatus('local');
      setIsThinking(false);
      return;
    }

    const { data, error } = await supabase.functions.invoke('chat', {
      body: {
        question,
        context: {
          business: draft,
          selectedPhase: phaseLabels[phase],
          recommendedMaterials: recommendations.map((material) => ({
            title: material.title,
            format: material.format,
            deliverable: material.deliverable,
            aiUse: material.aiUse,
          })),
        },
      },
    });

    if (error || !data?.text) {
      setAiStatus('local');
    } else {
      setAiStatus(data.error === 'missing_gemini_key' ? 'needs-key' : 'live');
      setAiAnswer(data.text);
    }

    setIsThinking(false);
  }

  return (
    <div className="foru-app-bg min-h-screen text-[#171717]">
      <nav className="foru-nav foru-container">
        <Link to="/" onClick={() => playUiTone('tap')} className="foru-logo">FOR <span>U</span></Link>
        <div className="foru-nav-links">
          <Link to="/metodologia" onClick={() => playUiTone('tap')} className="foru-btn foru-btn--outline px-5 py-2 text-sm">
            Metodologia
          </Link>
        </div>
      </nav>

      <main className="foru-container pb-12 pt-4">
        <section className="grid gap-6 lg:grid-cols-[0.74fr_1fr]">
          <aside className="foru-aurora-card rounded-3xl p-6 md:p-7">
            <span className="foru-badge">IA For U</span>
            <h1 className="foru-title mt-5" style={{ fontSize: 'clamp(2.1rem, 4vw, 3.6rem)' }}>
              Una IA guiada por la <span className="text-gradient-animated">metodologia</span>.
            </h1>
            <p className="foru-subtitle mt-4">
              No responde desde el aire: usa cursos, ebooks, workbooks, tutoriales y checklists de For U para recomendar el material correcto en cada fase.
            </p>

            <div className="mt-6 grid gap-3">
              <div className="grid grid-cols-3 gap-2">
                {['Elige fase', 'Pregunta', 'Haz 1 cosa'].map((step, index) => (
                  <div key={step} className="foru-soft-panel rounded-2xl p-3 text-center">
                    <p className="text-lg font-black text-[#7C5CFF]">{index + 1}</p>
                    <p className="text-xs font-black text-gray-700">{step}</p>
                  </div>
                ))}
              </div>
              <div className="foru-soft-panel rounded-2xl p-4">
                <p className="text-xs font-black uppercase text-gray-500">Negocio detectado</p>
                <p className="mt-2 text-lg font-black text-gray-950">{draft.businessName}</p>
                <p className="mt-1 text-sm font-semibold text-gray-600">{draft.businessTitle}</p>
              </div>
              <div className="foru-soft-panel rounded-2xl p-4">
                <p className="text-xs font-black uppercase text-gray-500">Base de conocimiento</p>
                <p className="mt-2 text-lg font-black text-gray-950">{knowledgeCount} materiales internos</p>
                <p className="mt-1 text-sm font-semibold text-gray-600">Cada uno tiene fase, entregable, prompts y uso para IA.</p>
              </div>
            </div>
          </aside>

          <section className="rounded-3xl border border-black/10 foru-glass p-5 shadow-xl md:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black text-[#7C5CFF]">Asistente de fase</p>
                <h2 className="font-serif text-3xl font-bold">Que necesitas resolver ahora?</h2>
              </div>
              <Bot className="text-[#7C5CFF]" />
            </div>

            <div className="grid gap-2 md:grid-cols-3">
              {phaseOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    playUiTone('tap');
                    setPhase(option);
                  }}
                  className={`tap-boost rounded-xl px-3 py-3 text-sm font-black ${
                    phase === option ? 'foru-gradient-button' : 'foru-soft-panel text-gray-700'
                  }`}
                >
                  {phaseLabels[option]}
                </button>
              ))}
            </div>

            <div className="mt-5 rounded-3xl foru-dark-gradient p-5 text-white">
              <div className="flex gap-3">
                <span className="foru-gradient-button flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                  <Sparkles size={18} />
                </span>
                <div>
                  <p className="text-sm font-black text-[#6EE7B7]">Respuesta For U</p>
                  <p className="mt-2 text-base font-semibold leading-7 text-white/92">{isThinking ? 'Pensando con la metodologia For U...' : answer}</p>
                  <span className="mt-4 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-black text-white/80">
                    {aiStatus === 'live' ? 'IA conectada a Supabase' : aiStatus === 'needs-key' ? 'Falta GEMINI_API_KEY en Supabase' : 'Respuesta local de respaldo'}
                  </span>
                </div>
              </div>
            </div>

            <label className="mt-5 block">
              <span className="mb-2 flex items-center gap-2 text-sm font-black text-gray-700">
                <MessageCircle size={16} /> Preguntale a IA For U
              </span>
              <textarea
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                className="foru-input min-h-28 w-full rounded-2xl p-4 text-sm font-semibold text-gray-800 outline-none transition"
                placeholder="Ej. quiero vender mas reservas, no se que poner en la landing, necesito contenido para explicar mi oferta..."
              />
            </label>
            <button
              type="button"
              onClick={askAiForU}
              className="tap-boost mt-3 inline-flex items-center gap-2 rounded-xl foru-dark-gradient px-5 py-3 text-sm font-black text-white"
            >
              {isThinking ? 'Pensando...' : 'Recomendar material'} <Send size={16} />
            </button>
          </section>
        </section>

        <section className="mt-7 grid gap-5 lg:grid-cols-[1fr_0.5fr]">
          <div className="rounded-3xl border border-black/10 foru-glass p-5 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl font-bold">Material recomendado para esta fase</h2>
                <p className="mt-1 text-sm font-semibold text-gray-600">La IA elige desde la metodologia, no desde una lista generica.</p>
              </div>
              <BookOpen className="text-[#7C5CFF]" />
            </div>

            <div className="grid gap-4">
              {recommendations.map((material, index) => (
                <article key={material.id} className={index === 0 ? 'foru-gradient-border rounded-3xl p-5 shadow-lg' : 'foru-soft-panel rounded-3xl p-5'}>
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-black text-[#7C5CFF]">{index === 0 ? 'Primero' : 'Despues'}</span>
                        <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-black text-gray-600">{material.format}</span>
                        <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-black text-gray-600">{material.minutes} min</span>
                      </div>
                      <h3 className="mt-4 font-serif text-2xl font-bold text-gray-950">{material.title}</h3>
                      <p className="mt-2 text-sm font-semibold leading-7 text-gray-650">{material.summary}</p>
                    </div>
                    <Link
                      to="/metodologia"
                      onClick={() => playUiTone('tap')}
                      className="tap-boost inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-gray-950 shadow-sm"
                    >
                      Ver material <ArrowRight size={16} />
                    </Link>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-2xl bg-white/70 p-4">
                      <p className="text-xs font-black uppercase text-gray-500">Entregable</p>
                      <p className="mt-2 text-sm font-bold leading-6 text-gray-800">{material.deliverable}</p>
                    </div>
                    <div className="rounded-2xl bg-white/70 p-4">
                      <p className="text-xs font-black uppercase text-gray-500">Uso de IA</p>
                      <p className="mt-2 text-sm font-bold leading-6 text-gray-800">{material.aiUse}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="space-y-5">
            <div className="rounded-3xl border border-black/10 foru-glass p-5 shadow-xl">
              <h3 className="font-serif text-2xl font-bold">Siguiente paso exacto</h3>
              <div className="mt-4 flex gap-3 rounded-2xl foru-soft-panel p-4">
                <CheckCircle2 className="mt-1 shrink-0 text-[#7C5CFF]" size={20} />
                <p className="text-sm font-bold leading-6 text-gray-800">
                  Abre {primaryMaterial.title}, completa el entregable y vuelve a IA For U para convertirlo en texto de landing, contenido o checklist de publicacion.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-black/10 foru-glass p-5 shadow-xl">
              <h3 className="font-serif text-2xl font-bold">Prompts listos</h3>
              <div className="mt-4 grid gap-2">
                {primaryMaterial.prompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => {
                      playUiTone('tap');
                      setQuestion(prompt);
                    }}
                    className="tap-boost foru-soft-panel rounded-2xl p-3 text-left text-sm font-bold leading-6 text-gray-700"
                  >
                    <Lightbulb className="mr-2 inline text-[#7C5CFF]" size={16} />
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <Link
              to="/register"
              onClick={() => playUiTone('next')}
              className="tap-boost flex items-center justify-between rounded-3xl foru-gradient-button p-5 text-left font-black text-[#1a1a1a] shadow-xl"
            >
              Crear o actualizar mundo digital <ArrowRight size={18} />
            </Link>
          </aside>
        </section>
      </main>
    </div>
  );
}
