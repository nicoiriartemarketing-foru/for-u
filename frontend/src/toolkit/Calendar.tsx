import { useEffect, useRef, useState } from "react";
import { useToolkit } from "./ToolkitContext";
import { localDate } from "./engine";
import { downloadBlob } from "./api";
import type { CalendarEntry } from "./types";
export default function Calendar() {
  const { docs, save, track } = useToolkit();
  const [entries, setEntries] = useState<CalendarEntry[]>(
    (docs.calendar as CalendarEntry[]) ?? [],
  );
  const [anchor, setAnchor] = useState(new Date());
  const [view, setView] = useState("week");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(localDate(new Date()));
  const [time, setTime] = useState("10:00");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const reminded = useRef(new Set<string>());
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
    setBusy(true);
    try {
      await save("calendar", next);
      setEntries(next);
      return true;
    } catch (e) {
      setNotice((e as Error).message);
      return false;
    } finally {
      setBusy(false);
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
  function exportCalendar() {
    const escape = (s: string) =>
      s
        .replace(/\\/g, "\\\\")
        .replace(/\r?\n/g, "\\n")
        .replace(/,/g, "\\,")
        .replace(/;/g, "\\;");
    const utc = (d: Date) =>
      d
        .toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.\d{3}/, "");
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//FOR U//Agenda//ES",
      ...entries.flatMap((e) => {
        const start = new Date(`${e.date}T${e.time}`);
        return [
          "BEGIN:VEVENT",
          `UID:${e.id}@foru`,
          `DTSTAMP:${utc(new Date())}`,
          `DTSTART:${utc(start)}`,
          `DTEND:${utc(new Date(start.getTime() + 30 * 60_000))}`,
          `SUMMARY:${escape(e.title)}`,
          "BEGIN:VALARM",
          "TRIGGER:-PT10M",
          "ACTION:DISPLAY",
          `DESCRIPTION:${escape(e.title)}`,
          "END:VALARM",
          "END:VEVENT",
        ];
      }),
      "END:VCALENDAR",
    ];
    downloadBlob(
      new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" }),
      "agenda-for-u.ics",
    );
  }
  return (
    <div className="tk-stack">
      <section className="tk-card tk-stack">
        <div className="tk-toolbar">
          <div>
            <div className="tk-eyebrow">ESPACIO PARA LO QUE IMPORTA</div>
            <h2>Tu calendario</h2>
          </div>
          <button onClick={() => setView(view === "week" ? "month" : "week")}>
            {view === "week" ? "Ver mes" : "Ver semana"}
          </button>
          <button onClick={exportCalendar} disabled={!entries.length}>
            Exportar agenda
          </button>
          <button
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
          </button>
        </div>
        <small>
          Los avisos de FOR U funcionan con la app abierta. Importa la agenda en
          tu calendario para recibirlos cuando la cierres.
        </small>
        <form
          className="tk-toolbar"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!title.trim()) return;
            if (
              await update([
                ...entries,
                {
                  id: crypto.randomUUID(),
                  title: title.trim(),
                  date,
                  time,
                  format: "contenido",
                  done: false,
                },
              ])
            ) {
              setTitle("");
              track("calendar", true);
            }
          }}
        >
          <label>
            Publicación o tarea
            <input
              required
              value={title}
              maxLength={200}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Mostrar mi producto estrella"
            />
          </label>
          <label>
            Fecha
            <input
              required
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <label>
            Hora
            <input
              required
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </label>
          <button className="tk-primary" disabled={busy}>
            Agregar
          </button>
        </form>
        <p className="tk-tip">
          Aún no hay datos suficientes para recomendar una hora de publicación.
          Prueba horarios y compara tus resultados.
        </p>
      </section>
      <section className="tk-card tk-stack">
        <div className="tk-toolbar">
          <button aria-label="Periodo anterior" onClick={() => shift(-1)}>
            ←
          </button>
          <h3>
            {anchor.toLocaleDateString("es-PE", {
              month: "long",
              year: "numeric",
            })}
          </h3>
          <button aria-label="Periodo siguiente" onClick={() => shift(1)}>
            →
          </button>
          <button onClick={() => setAnchor(new Date())}>Hoy</button>
        </div>
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
                  if (!busy && entries.some((item) => item.id === id))
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
                {entries
                  .filter((item) => item.date === key)
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((entry) => (
                    <div
                      className={`tk-event ${entry.done ? "is-done" : ""}`}
                      key={entry.id}
                      draggable={!busy}
                      onDragStart={(e) =>
                        e.dataTransfer.setData("text/foru-event", entry.id)
                      }
                    >
                      <span>{entry.time}</span>
                      <strong>{entry.title}</strong>
                      <label className="tk-check">
                        <input
                          type="checkbox"
                          checked={entry.done}
                          disabled={busy}
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
                        <input
                          type="date"
                          value={entry.date}
                          disabled={busy}
                          onChange={(e) => {
                            if (e.target.value)
                              void update(
                                entries.map((item) =>
                                  item.id === entry.id
                                    ? { ...item, date: e.target.value }
                                    : item,
                                ),
                              );
                          }}
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
                      <button
                        disabled={busy}
                        onClick={() =>
                          update(entries.filter((item) => item.id !== entry.id))
                        }
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
              </div>
            );
          })}
        </div>
      </section>
      {notice && (
        <p role="status" className="tk-notice">
          {notice}
        </p>
      )}
    </div>
  );
}
