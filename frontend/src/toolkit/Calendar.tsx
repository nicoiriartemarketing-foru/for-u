import type {Piece} from '../social/model';
import type {AreaTask} from '../pages/dashboard/areaModel';
import TaskSuggestion from '../ai/TaskSuggestion';
import { Card as DSCard } from '../components/ui/DesignSystem';
import { ButtonSecondary as DSButtonSecondary, Input as DSInput, ButtonPrimary as DSButtonPrimary } from '../components/ui/DesignSystem';
import toast from 'react-hot-toast';
import { useEffect, useRef, useState } from "react";
import { useToolkit } from "./ToolkitContext";
import { localDate } from "./engine";
import { downloadBlob } from "./api";
import type { CalendarEntry } from "./types";
import { useUnsavedNavigation } from '../lib/useUnsavedNavigation';
import { calendarDateTime, calendarICS, readCalendar } from './calendarModel';
export default function Calendar({linkedTasks=[],onOpenTask,linkedPieces=[],onOpenPiece}:{linkedTasks?:AreaTask[];onOpenTask?:(task:AreaTask)=>void;linkedPieces?:Piece[];onOpenPiece?:(id:string)=>void}={}) {
  const { docs, save, track, reload, projectId } = useToolkit();
  let initial: CalendarEntry[] = [], formatError = '';
  try { initial = readCalendar(docs.calendar); } catch(e) { formatError = (e as Error).message; }
  const [entries, setEntries] = useState<CalendarEntry[]>(
    initial,
  );
  const [anchor, setAnchor] = useState(new Date());
  const [view, setView] = useState("week");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(localDate(new Date()));
  const [time, setTime] = useState("10:00");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [pending, setPending] = useState<CalendarEntry[] | null>(null);
  const [saveError, setSaveError] = useState('');
  const [recovery, setRecovery] = useState(false);
  const conflict = saveError.includes('otra pestaña');
  const blocked = busy || conflict || Boolean(formatError);
  const savingRef = useRef(false);
  const [notifications, setNotifications] = useState(false);
  const reminded = useRef(new Set<string>());
  const original = entries.find(entry => entry.id === editing);
  useUnsavedNavigation(pending !== null || (editing ? Boolean(original && (original.title !== title || original.date !== date || original.time !== time)) : Boolean(title.trim())));
  const start = new Date(
    anchor.getFullYear(),
    anchor.getMonth(),
    view === "month" ? 1 : anchor.getDate(),
  );
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const days = Array.from({ length: view === "month" ? 42 : 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
  useEffect(() => {
    const timer = window.setInterval(() => {
      for (const entry of entries) {
        const due = new Date(`${entry.date}T${entry.time}`).getTime();
        if (
          !entry.done &&
          Date.now() >= due &&
          Date.now() - due < 15 * 60_000 &&
          !reminded.current.has(entry.id)
        ) {
          reminded.current.add(entry.id);
          setNotice(`Es momento de: ${entry.title}`);
          if (
            notifications &&
            "Notification" in window &&
            Notification.permission === "granted"
          )
            new Notification("FOR U · Tu próximo paso", {
              body: entry.title,
              tag: entry.id,
            });
        }
      }
    }, 15_000);
    return () => clearInterval(timer);
  }, [entries, notifications]);
  async function update(next: CalendarEntry[]) {
    if (savingRef.current || formatError || conflict) return false;
    readCalendar(next);
    setEntries(next);
    setPending(next);
    setSaveError('');
    setNotice('');
    savingRef.current = true;
    setBusy(true);
    try {
      await save("calendar", next);
      setPending(null);
      setNotice('Agenda guardada en tu cuenta.');
      toast.success('Agenda guardada', { id: `calendar-saved` });
      return true;
    } catch (e) {
      setSaveError((e as Error).message);
      setNotice('Cambios pendientes de guardar.');
      return false;
    } finally {
      setBusy(false);
      savingRef.current = false;
    }
  }
  function shift(direction: number) {
    const next = new Date(anchor);
    if (view === "month") {
      next.setDate(1);
      next.setMonth(next.getMonth() + direction);
    } else next.setDate(next.getDate() + 7 * direction);
    setAnchor(next);
  }
  function moveEntry(entry: CalendarEntry, value: string) {
    if(blocked || !value) return;
    try { calendarDateTime(value,entry.time); } catch { setNotice('Revisa la fecha.'); return; }
    void update(entries.map(item=>item.id===entry.id?{...item,date:value}:item));
  }
  function exportCalendar() {
    downloadBlob(
      new Blob([calendarICS(entries,new Date(),linkedTasks.flatMap(t=>t.date?[{id:t.id,title:t.title,date:t.date,done:t.done}]:[]))], { type: "text/calendar;charset=utf-8" }),
      "agenda-for-u.ics",
    );
  }
  return (
    <div className="tk-stack magic-card">
      {formatError && <p role="alert">{formatError}</p>}
      {pending !== null && <div><p role="status">{busy ? 'Guardando agenda…' : 'Cambios pendientes de guardar en tu cuenta.'}</p><DSButtonPrimary disabled={blocked} onClick={()=>void update(pending)}>Guardar cambios de agenda</DSButtonPrimary></div>}
      {saveError && <div role="alert"><p>{saveError}</p>{!conflict && <DSButtonSecondary disabled={busy} onClick={() => pending && void update(pending)}>Reintentar guardado</DSButtonSecondary>}<DSButtonSecondary disabled={busy} onClick={() => setRecovery(true)}>Recuperar agenda guardada</DSButtonSecondary><DSButtonSecondary onClick={() => downloadBlob(new Blob([JSON.stringify({projectId,entries},null,2)],{type:'application/json'}),'agenda-pendiente.json')}>Descargar mis cambios pendientes</DSButtonSecondary></div>}
      {recovery && <section aria-label="Recuperar agenda"><p>Recuperar descartará los cambios pendientes de esta pantalla. Puedes descargarlos primero.</p><DSButtonSecondary onClick={() => setRecovery(false)}>Conservar mis cambios</DSButtonSecondary><DSButtonSecondary onClick={() => { setPending(null); setSaveError(''); void reload(); }}>Descartar pendientes y recuperar</DSButtonSecondary></section>}
      <style>{`
        .tk-stack.magic-card {
           border: 1px solid rgba(212, 212, 212, 0.76);
           border-radius: var(--border-radius-grande);
           background: var(--color-superficie);
           box-shadow: var(--sombra-magica);
           padding: 1rem;
        }
        .tk-calendar .tk-day, .tk-calendar .tk-event {
           background: rgba(250, 250, 250, 0.86);
           border-radius: 12px;
           box-shadow: var(--sombra-suave);
        }
        .tk-calendar .tk-day.is-today {
           background: var(--gradient-iridiscente);
           font-weight: 900;
        }
        .tk-calendar .tk-event {
           animation: fadeIn 0.4s ease-out forwards;
        }
        .tk-stack .magic-button-soft {
           background: rgba(212, 212, 212, 0.16); color: var(--color-texto); border-radius: 999px; padding: 0.5rem 1rem; font-weight: 600; border: none;
        }
      `}</style>
      <DSCard as="section" className="tk-card tk-stack">
        <div className="tk-toolbar">
          <div>
            <div className="tk-eyebrow">ESPACIO PARA LO QUE IMPORTA</div>
            <h2>Tu calendario</h2>
          </div>
          <DSButtonSecondary onClick={() => setView(view === "week" ? "month" : "week")}>
            {view === "week" ? "Ver mes" : "Ver semana"}
          </DSButtonSecondary>
          <DSButtonSecondary onClick={exportCalendar} disabled={!entries.length}>
            Exportar agenda
          </DSButtonSecondary>
          <DSButtonSecondary
            onClick={async () => {
              if (!("Notification" in window)) {
                setNotice("Este navegador no admite notificaciones.");
                return;
              }
              const permission = await Notification.requestPermission();
              setNotifications(permission === "granted");
              setNotice(
                permission === "granted"
                  ? "Recordatorios activos mientras FOR U esté abierto."
                  : "Puedes importar la agenda para recibir recordatorios.",
              );
            }}
          >
            Activar recordatorios
          </DSButtonSecondary>
        </div>
        <small>
          Los avisos de FOR U funcionan con la app abierta. Importa la agenda en
          tu calendario para recibirlos cuando la cierres. La exportación es una
          copia de tu agenda; no sincroniza cambios posteriores.
        </small>
        <form
          className="tk-toolbar"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            const nextTitle = String(form.get('title') ?? '').trim();
            const nextDate = String(form.get('date') ?? '');
            const nextTime = String(form.get('time') ?? '');
            if (blocked || !nextTitle) return;
            try { calendarDateTime(nextDate,nextTime); } catch { setNotice('Revisa el título, la fecha y la hora.'); return; }
            const success = await update(editing ? entries.map(entry => entry.id === editing ? { ...entry, title: nextTitle, date: nextDate, time: nextTime } : entry) : [
                ...entries,
                {
                  id: crypto.randomUUID(),
                  title: nextTitle,
                  date: nextDate,
                  time: nextTime,
                  format: "contenido",
                  done: false,
                },
              ]);
              setTitle("");
              setEditing(null);
              if (success) track("calendar", true);
          }}
        >
          <label>
            Publicación o tarea
            <DSInput
              required
              name="title"
              value={title}
              maxLength={200}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Mostrar mi producto estrella"
            />
          </label>
          <label>
            Fecha
            <DSInput
              required
              type="date"
              name="date"
              value={date}
              onInput={(e) => setDate(e.currentTarget.value)}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <label>
            Hora
            <DSInput
              required
              type="time"
              name="time"
              value={time}
              onInput={(e) => setTime(e.currentTarget.value)}
              onChange={(e) => setTime(e.target.value)}
            />
          </label>
          <DSButtonPrimary className="tk-primary" disabled={blocked}>
            {editing ? 'Guardar actividad' : 'Agregar'}
          </DSButtonPrimary>
          {editing && <DSButtonSecondary type="button" onClick={() => { setEditing(null); setTitle(''); }}>Cancelar edición</DSButtonSecondary>}
        </form>
        <p className="tk-tip">
          Aún no hay datos suficientes para recomendar una hora de publicación.
          Prueba horarios y compara tus resultados.
        </p>
      </DSCard>
      <DSCard as="section" className="tk-card tk-stack">
        <div className="tk-toolbar">
          <DSButtonSecondary className="magic-button magic-button-soft" aria-label="Periodo anterior" onClick={() => shift(-1)}>
            ←
          </DSButtonSecondary>
          <h3>
            {anchor.toLocaleDateString("es-PE", {
              month: "long",
              year: "numeric",
            })}
          </h3>
          <DSButtonSecondary className="magic-button magic-button-soft" aria-label="Periodo siguiente" onClick={() => shift(1)}>
            →
          </DSButtonSecondary>
          <DSButtonSecondary className="magic-button magic-button-soft" onClick={() => setAnchor(new Date())}>Hoy</DSButtonSecondary>
        </div>
        {original&&<TaskSuggestion key={original.id} projectId={projectId} sourceId={original.id} title={original.title} kind="calendar" disabled={blocked||Boolean(pending)} onApply={(nextTitle,guidance)=>{const next=entries.map(item=>item.id===original.id?{...item,title:nextTitle,guidance}:item);setEntries(next);setPending(next);setTitle(nextTitle);}}/>}
        <div className="tk-calendar">
          {days.map((day) => {
            const key = localDate(day);
            return (
              <div
                key={key}
                className={`tk-day ${key === localDate(new Date()) ? "is-today" : ""}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const id = e.dataTransfer.getData("text/foru-event");
                  if (!blocked && entries.some((item) => item.id === id))
                    void update(
                      entries.map((item) =>
                        item.id === id ? { ...item, date: key } : item,
                      ),
                    );
                }}
              >
                <time dateTime={key}>
                  {day.toLocaleDateString("es-PE", {
                    weekday: "short",
                    day: "numeric",
                  })}
                </time>
                {linkedPieces.filter(piece=>piece.date===key).map(piece=><DSButtonSecondary key={`piece:${piece.id}`} className="calendar-linked-task" onClick={()=>onOpenPiece?.(piece.id)}>{piece.title||'Pieza sin título'}<small>Contenido planificado · abre la pieza original</small></DSButtonSecondary>)}
                {linkedTasks.filter(task=>task.date===key).map(task=><DSButtonSecondary key={`task:${task.id}`} className="calendar-linked-task" onClick={()=>onOpenTask?.(task)}>{task.done?'✓':'○'} {task.title}<small>Tarea · sin hora</small></DSButtonSecondary>)}
                {entries
                  .filter((item) => item.date === key)
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((entry) => (
                    <div
                      className={`tk-event animate-fade-in ${entry.done ? "is-done" : ""}`}
                      key={entry.id}
                      draggable={!blocked}
                      onDragStart={(e) =>
                        e.dataTransfer.setData("text/foru-event", entry.id)
                      }
                    >
                      <span>{entry.time}</span>
                      <strong>{entry.title}</strong>
                      <DSButtonSecondary disabled={blocked} onClick={() => { setEditing(entry.id); setTitle(entry.title); setDate(entry.date); setTime(entry.time); }}>Editar actividad</DSButtonSecondary>
                      <label className="tk-check">
                        <DSInput
                          type="checkbox"
                          checked={entry.done}
                          disabled={blocked}
                          onChange={() => {
                            void update(
                              entries.map((item) =>
                                item.id === entry.id
                                  ? { ...item, done: !item.done }
                                  : item,
                              ),
                            );
                          }}
                        />{" "}
                        Hecho
                      </label>
                      <label>
                        Mover a
                        <DSInput
                          type="date"
                          value={entry.date}
                          disabled={blocked}
                          onInput={e=>moveEntry(entry,e.currentTarget.value)}
                          onChange={e=>moveEntry(entry,e.target.value)}
                        />
                      </label>
                      <a
                        target="_blank"
                        rel="noreferrer"
                        href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(entry.title)}&dates=${new Date(
                          `${entry.date}T${entry.time}`,
                        )
                          .toISOString()
                          .replace(/[-:]/g, "")
                          .replace(/\.\d{3}/, "")}/${new Date(
                          new Date(`${entry.date}T${entry.time}`).getTime() +
                            30 * 60_000,
                        )
                          .toISOString()
                          .replace(/[-:]/g, "")
                          .replace(/\.\d{3}/, "")}`}
                      >
                        Agregar a Google Calendar ↗
                      </a>
                      <DSButtonSecondary
                        disabled={blocked}
                        onClick={() =>
                          update(entries.filter((item) => item.id !== entry.id))
                        }
                      >
                        Eliminar
                      </DSButtonSecondary>
                    </div>
                  ))}
              </div>
            );
          })}
        </div>
      </DSCard>
      {notice && (
        <p role="status" className="tk-notice">
          {notice}
        </p>
      )}
    </div>
  );
}
