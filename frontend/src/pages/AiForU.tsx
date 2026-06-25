import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, Bot, CalendarDays, CheckCircle2, Clapperboard, Clock, Edit3, Mic2, Send, Sparkles } from '../lib/icons';
import { loadLocalDraft } from '../lib/digitalWorldDraft';
import {
  getLearningPhaseFromDraft,
  getRecommendedMaterials,
  phaseLabels,
  type LearningPhase,
} from '../lib/learningMaterials';
import { playUiTone } from '../lib/sound';
import { supabase } from '../lib/supabase';

const quickQuestions = [
  'No sé por dónde empezar',
  'Organiza mi semana de contenido',
  'Ayúdame con un guion',
  'Quiero mejorar mi web',
];

export default function AiForU() {
  const draft = loadLocalDraft();
  const detectedPhase = getLearningPhaseFromDraft(draft);
  const [phase, setPhase] = useState<LearningPhase>(detectedPhase);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(
    `Hola. Ya tengo los datos básicos de ${draft.businessName}. Dime qué te está trabando y te recomendaré una sola acción y el contenido exacto para resolverla.`,
  );
  const [hasAsked, setHasAsked] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [aiStatus, setAiStatus] = useState<'guided' | 'live'>('guided');
  const recommendations = useMemo(() => getRecommendedMaterials(phase, draft), [phase, draft]);
  const primaryMaterial = recommendations[0];

  function inferPhase(text: string): LearningPhase {
    const normalized = text.toLowerCase();
    if (normalized.includes('contenido') || normalized.includes('post') || normalized.includes('redes')) return 'contenido';
    if (normalized.includes('landing') || normalized.includes('web') || normalized.includes('página')) return 'landing';
    if (normalized.includes('oferta') || normalized.includes('vender') || normalized.includes('precio')) return 'oferta';
    if (normalized.includes('confianza') || normalized.includes('testimonio')) return 'confianza';
    if (normalized.includes('lanzar') || normalized.includes('publicar')) return 'lanzamiento';
    return 'base';
  }

  function guidedAnswer(text: string, nextPrimary: typeof primaryMaterial) {
    const normalized = text.toLowerCase();
    if (normalized.includes('semana') || normalized.includes('calendario')) {
      return 'Esta semana haremos solo 3 piezas: lunes una idea que explique tu oferta, miércoles una respuesta a una duda frecuente y viernes una prueba o resultado. Entra al Calendario del panel y muévelas al día que realmente puedas grabar.';
    }
    if (normalized.includes('guion') || normalized.includes('grabar')) {
      return `Usa este guion corto: 1) “Si te pasa [problema], escucha esto”. 2) Explica una sola idea. 3) Cierra con “${draft.primaryCta}”. Escríbelo como hablas y grábalo en menos de 45 segundos.`;
    }
    if (normalized.includes('web') || normalized.includes('landing')) {
      return `Abre el editor y revisa solo la portada: nombre, promesa y botón “${draft.primaryCta}”. No cambies el resto todavía.`;
    }
    if (normalized.includes('contenido')) {
      return `Convierte una pregunta real de tu cliente en una pieza. Empieza con: “${draft.questions[0] || '¿Qué necesita saber alguien antes de comprarte?'}”.`;
    }
    return `Empieza por ${nextPrimary.title}. Tu única tarea ahora es: ${nextPrimary.deliverable}`;
  }

  async function askAiForU(nextQuestion = question) {
    const cleanQuestion = nextQuestion.trim();
    if (!cleanQuestion) return;

    const nextPhase = inferPhase(cleanQuestion);
    const nextRecommendations = getRecommendedMaterials(nextPhase, draft);
    const nextPrimary = nextRecommendations[0];
    setQuestion(cleanQuestion);
    setPhase(nextPhase);
    setHasAsked(true);
    setIsThinking(true);
    setAnswer('');
    playUiTone('success');

    if (!supabase) {
      setAnswer(guidedAnswer(cleanQuestion, nextPrimary));
      setAiStatus('guided');
      setIsThinking(false);
      return;
    }

    const { data, error } = await supabase.functions.invoke('chat', {
      body: {
        question: cleanQuestion,
        context: {
          business: draft,
          selectedPhase: phaseLabels[nextPhase],
          recommendedMaterials: nextRecommendations.map((material) => ({
            title: material.title,
            format: material.format,
            deliverable: material.deliverable,
            aiUse: material.aiUse,
          })),
        },
      },
    });

    if (error || !data?.text) {
      setAnswer(guidedAnswer(cleanQuestion, nextPrimary));
      setAiStatus('guided');
    } else if (data.error === 'missing_gemini_key') {
      setAnswer(guidedAnswer(cleanQuestion, nextPrimary));
      setAiStatus('guided');
    } else {
      setAnswer(data.text);
      setAiStatus('live');
    }

    setIsThinking(false);
  }

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-[#171717]">
      <header className="border-b border-black/8 bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-black">
            <ArrowLeft size={17} /> Inicio
          </Link>
          <p className="font-serif text-xl font-bold">IA For U</p>
          <Link to="/editor" className="inline-flex items-center gap-2 text-sm font-black">
            Editor <Edit3 size={16} />
          </Link>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-5xl flex-col px-4 py-6">
        <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col">
          <div className="mb-5 text-center">
            <span className="pulse-soft inline-flex h-14 w-14 items-center justify-center rounded-2xl foru-gradient-button">
              <Bot size={23} />
            </span>
            <h1 className="mt-3 font-serif text-3xl font-bold md:text-4xl">¿Qué necesitas resolver?</h1>
            <p className="mt-2 text-sm font-semibold text-gray-500">Pregunta como hablarías con una persona. For U te dará un paso y un contenido.</p>
          </div>

          {!hasAsked && (
            <div className="mb-4 grid grid-cols-2 gap-2">
              {quickQuestions.map((prompt, index) => {
                const icons = [Sparkles, CalendarDays, Mic2, Edit3];
                const Icon = icons[index];
                const colors = ['#FDE68A', '#93C5FD', '#F9A8D4', '#6EE7B7'];
                return (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => askAiForU(prompt)}
                  className="tap-boost flex min-h-24 flex-col justify-between rounded-xl border border-black/10 bg-white p-4 text-left text-sm font-black shadow-sm"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: colors[index] }}><Icon size={17} /></span>
                  <span>{prompt}</span>
                </button>
                );
              })}
            </div>
          )}

          {hasAsked && (
            <div className="mb-3 ml-auto max-w-[86%] rounded-2xl rounded-br-sm foru-dark-gradient px-4 py-3 text-sm font-bold text-white">
              {question}
            </div>
          )}

          <div className="rounded-2xl border border-black/8 bg-white p-5 shadow-sm">
            <div className="flex gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F3F0FF] text-[#6D4AFF]">
                <Sparkles size={17} />
              </span>
              <div>
                <p className="text-xs font-black uppercase text-[#6D4AFF]">For U recomienda</p>
                <p className="mt-2 text-base font-semibold leading-7 text-gray-800">
                  {isThinking ? 'Pensando en el siguiente paso más útil...' : answer}
                </p>
                <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-[11px] font-black text-gray-500">
                  <span className={`h-2 w-2 rounded-full ${aiStatus === 'live' ? 'bg-emerald-400' : 'bg-amber-300'}`} />
                  {aiStatus === 'live' ? 'IA conectada' : 'Guía For U'}
                </span>
              </div>
            </div>
          </div>

          {hasAsked && !isThinking && (
            <section className="mt-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-black">Contenido recomendado</p>
                <span className="text-xs font-bold text-gray-500">{phaseLabels[phase]}</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {recommendations.map((material, index) => (
                  <Link
                    key={material.id}
                    to="/metodologia"
                    onClick={() => playUiTone('tap')}
                    className={`tap-boost flex min-h-48 flex-col rounded-xl border p-4 ${
                      index === 0 ? 'border-[#7C5CFF] bg-[#F5F2FF]' : 'border-black/8 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-black text-gray-500">
                      <span>{index === 0 ? 'EMPIEZA AQUÍ' : material.format.toUpperCase()}</span>
                      <span className="inline-flex items-center gap-1"><Clock size={13} /> {material.minutes} min</span>
                    </div>
                    <BookOpen className="mt-5 text-[#7C5CFF]" size={22} />
                    <h2 className="mt-3 font-serif text-xl font-bold leading-tight">{material.title}</h2>
                    <p className="mt-2 line-clamp-3 text-xs font-semibold leading-5 text-gray-600">{material.summary}</p>
                    <span className="mt-auto pt-4 text-xs font-black text-[#6D4AFF]">Abrir contenido →</span>
                  </Link>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-[#ECFDF5] p-3 text-sm font-bold text-[#087F5B]">
                <CheckCircle2 size={17} /> Haz primero: {primaryMaterial.deliverable}
              </div>
            </section>
          )}

          <div className="sticky bottom-0 mt-auto bg-[#f7f7f5] pb-2 pt-5">
            <div className="flex items-end gap-2 rounded-2xl border border-black/10 bg-white p-2 shadow-xl">
              <textarea
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    askAiForU();
                  }
                }}
                className="min-h-12 max-h-28 flex-1 resize-none bg-transparent px-3 py-3 text-sm font-semibold outline-none"
                placeholder="Escribe aquí lo que no sabes cómo resolver..."
              />
              <button
                type="button"
                onClick={() => askAiForU()}
                disabled={!question.trim() || isThinking}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl foru-dark-gradient text-white disabled:opacity-30"
                title="Enviar"
              >
                <Send size={18} />
              </button>
            </div>
            <div className="mt-2 flex justify-center">
              <div className="flex gap-4">
                <Link to="/dashboard" className="inline-flex items-center gap-2 text-xs font-black text-gray-500">Abrir estudio <Clapperboard size={13} /></Link>
                <Link to="/metodologia" className="inline-flex items-center gap-2 text-xs font-black text-gray-500">Metodología <ArrowRight size={13} /></Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
