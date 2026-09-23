import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { AvailabilityManager } from "./Reservations";
import { useToolkit } from "./ToolkitContext";
import { defaultLanding } from "./types";
import { downloadBlob } from "./api";
import { learnPatterns } from "./engine";
import type { Booking, LandingDraft } from "./types";

export function Bookings() {
  const { userId, projectId, business, docs, save, demo } = useToolkit();
  const [fields, setFields] = useState(
    ((docs.landing as LandingDraft) ?? defaultLanding(business)).fields,
  );
  const [extra, setExtra] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [siteId, setSiteId] = useState("");
  const load = useCallback(async () => {
    if (!supabase || demo) return;
    const site = await supabase
      .from("toolkit_sites")
      .select("id")
      .eq("user_id", userId)
      .eq("project_id", projectId)
      .maybeSingle();
    if (site.error) {
      setNotice("No se pudieron cargar las reservas. Reintenta.");
      return;
    }
    if (!site.data) {
      setNotice("Publica tu página para empezar a recibir solicitudes.");
      return;
    }
    setSiteId(site.data.id);
    const result = await supabase
      .from("toolkit_bookings")
      .select("*")
      .eq("user_id", userId)
      .eq("site_id", site.data.id)
      .order("created_at", { ascending: false })
      .limit(200);
    if (result.error) setNotice("No se pudieron cargar las reservas.");
    else {
      setBookings((previous) => {
        if (previous.length && (result.data?.length ?? 0) > previous.length)
          setNotice("Llegó una nueva solicitud.");
        return result.data ?? [];
      });
    }
  }, [demo, projectId, userId]);
  // Loading subscribes this view to remote data and its refresh cycle.
  useEffect(() => {
    // Synchronize the view with its external data or media resource.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
    const timer = window.setInterval(() => {
      if (!document.hidden) void load();
    }, 30_000);
    return () => clearInterval(timer);
  }, [load]);
  async function saveFields() {
    setBusy(true);
    try {
      await save("landing", {
        ...((docs.landing as LandingDraft) ?? defaultLanding(business)),
        fields,
      });
      setNotice(
        "Campos guardados. Publica tu página para que el formulario se actualice.",
      );
    } catch (e) {
      setNotice((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="tk-stack">
      <AvailabilityManager />
      <section className="tk-card tk-stack">
        <div className="tk-eyebrow">DEL INTERÉS A LA CONVERSACIÓN</div>
        <h2>Reservas y pedidos</h2>
        <p>
          Tu formulario siempre solicita nombre y contacto. Estos son los campos
          sugeridos para tu rubro:
        </p>
        <div className="tk-toolbar">
          {fields.map((field) => (
            <button
              key={field}
              onClick={() => setFields(fields.filter((f) => f !== field))}
            >
              {field} ×
            </button>
          ))}
        </div>
        <form
          className="tk-toolbar"
          onSubmit={(e) => {
            e.preventDefault();
            if (
              extra.trim() &&
              !fields.includes(extra.trim()) &&
              fields.length < 8
            ) {
              setFields([...fields, extra.trim()]);
              setExtra("");
            }
          }}
        >
          <label>
            Agregar campo
            <input
              value={extra}
              maxLength={60}
              onChange={(e) => setExtra(e.target.value)}
              placeholder="Ej. Horario preferido"
            />
          </label>
          <button disabled={fields.length >= 8 || !extra.trim()}>
            Agregar
          </button>
        </form>
        <button className="tk-primary" disabled={busy} onClick={saveFields}>
          Guardar formulario
        </button>
        <p className="tk-tip">
          En «Tu página» puedes agregar tu enlace de Calendly. Las solicitudes
          del formulario llegan aquí; los turnos de Calendly se gestionan en tu
          cuenta de Calendly.
        </p>
      </section>
      <section className="tk-card tk-stack">
        <div className="tk-toolbar">
          <h3>Solicitudes recibidas</h3>
          <button onClick={load} disabled={demo}>
            Actualizar
          </button>
        </div>
        <small>
          Se revisan nuevas solicitudes cada 30 segundos mientras esta vista
          está abierta.
        </small>
        {!bookings.length && (
          <div className="tk-empty">
            Aún no hay solicitudes. Cuando alguien complete tu formulario,
            aparecerá aquí.
          </div>
        )}
        {bookings.map((booking) => (
          <article key={booking.id} className="tk-booking">
            <div>
              <strong>{booking.customer_name}</strong>
              <p>{booking.contact}</p>
              <small>
                {new Date(booking.created_at).toLocaleString("es-PE")}
              </small>
              <dl>
                {Object.entries(booking.details).map(([key, value]) => (
                  <div key={key}>
                    <dt>{key}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <label>
              Estado
              <select
                value={booking.status}
                disabled={busy}
                onChange={async (e) => {
                  if (!supabase) return;
                  const status = e.target.value;
                  setBusy(true);
                  const result = await supabase
                    .from("toolkit_bookings")
                    .update({ status })
                    .eq("id", booking.id)
                    .eq("user_id", userId)
                    .eq("site_id", siteId);
                  if (result.error)
                    setNotice("No se guardó el estado. Vuelve a intentar.");
                  else
                    setBookings(
                      bookings.map((b) =>
                        b.id === booking.id ? { ...b, status } : b,
                      ),
                    );
                  setBusy(false);
                }}
              >
                <option value="new">Nueva</option>
                <option value="confirmed">Confirmada</option>
                <option value="completed">Completada</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </label>
          </article>
        ))}
      </section>
      {notice && (
        <p className="tk-notice" role="status">
          {notice}
        </p>
      )}
    </div>
  );
}

export function Analytics({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) {
  const { userId, projectId, demo, business, actions } = useToolkit();
  const [counts, setCounts] = useState<{
    unique_visitors: number;
    page_views: number;
    cta_clicks: number;
    pages: { path: string; views: number }[];
    sources: { source: string; views: number }[];
    updated_at: string;
  } | null>(null);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [revision, setRevision] = useState(0);
  const patterns = learnPatterns(actions);
  useEffect(() => {
    if (!supabase || demo) return;
    let active = true;
    const client = supabase;
    let running = false;
    const load = async () => {
      if (running) return;
      running = true;
      setLoading(true);
      const { data, error } = await client.rpc("site_analytics_summary", {
        project: projectId,
      });
      running = false;
      if (!active) return;
      setLoading(false);
      if (error) {
        setNotice("No pudimos actualizar las métricas. Inténtalo de nuevo.");
        return;
      }
      setCounts(data);
      setNotice(
        data ? "" : "Publica tu página para empezar a medir visitas y clics.",
      );
    };
    void load();
    const channel = client
      .channel("site-metrics-" + userId + "-" + projectId)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "site_analytics",
          filter: "user_id=eq." + userId,
        },
        () => {
          void load();
        },
      )
      .subscribe();
    const timer = window.setInterval(() => {
      if (!document.hidden) void load();
    }, 15_000);
    return () => {
      active = false;
      clearInterval(timer);
      void client.removeChannel(channel);
    };
  }, [demo, projectId, userId, revision]);
  const load = () => setRevision((current) => current + 1);
  const salesFirst = /venta|reserva|pedido|cliente|sales|booking/i.test(
    business.objective,
  );
  const metrics = [
    {
      key: "visits",
      name: "Visitantes únicos",
      value: counts?.unique_visitors,
    },
    { key: "views", name: "Páginas vistas", value: counts?.page_views },
    {
      key: "conversions",
      name: "Conversiones · clics en CTA",
      value: counts?.cta_clicks,
    },
  ].sort((a, b) =>
    salesFirst
      ? Number(b.key === "conversions") - Number(a.key === "conversions")
      : 0,
  );
  return (
    <div className="tk-stack">
      <section className="tk-card">
        <div className="tk-toolbar">
          <div>
            <div className="tk-eyebrow">CADA PASO CUENTA</div>
            <h2>Lo que está funcionando</h2>
            <p>Últimos 30 días · priorizado según tu objetivo.</p>
          </div>
          <button onClick={load} disabled={loading || demo}>
            {loading ? "Actualizando…" : "Actualizar métricas"}
          </button>
        </div>
        <div className="tk-metrics">
          {metrics.map((m) => (
            <article key={m.key}>
              <span>{m.name}</span>
              <strong>
                {m.value === undefined ? "—" : m.value.toLocaleString("es-PE")}
              </strong>
            </article>
          ))}
          <article>
            <span>Clics por página vista</span>
            <strong>
              {counts?.page_views
                ? `${((counts.cta_clicks / counts.page_views) * 100).toFixed(1)}%`
                : "—"}
            </strong>
          </article>
        </div>
        <small>
          Visitantes únicos por navegador durante 30 días. Las conversiones son
          clics en los botones de contacto; no equivalen a ventas. Actualización
          en vivo con revisión adicional cada 15 segundos.
        </small>
        {(demo || notice) && (
          <p role="status" className="tk-notice">
            {demo
              ? "La prueba no contiene métricas inventadas. Publica tu página para ver datos reales."
              : notice}
          </p>
        )}
      </section>
      <div className="tk-two-columns">
        <section className="tk-card tk-stack">
          <h3>Páginas más vistas</h3>
          {counts?.pages.length ? (
            <table>
              <thead>
                <tr>
                  <th>Página</th>
                  <th>Vistas</th>
                </tr>
              </thead>
              <tbody>
                {counts.pages.map((page) => (
                  <tr key={page.path}>
                    <td>{page.path}</td>
                    <td>{page.views}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Aún no hay páginas vistas registradas.</p>
          )}
        </section>
        <section className="tk-card tk-stack">
          <h3>Origen del tráfico</h3>
          {counts?.sources.length ? (
            <table>
              <thead>
                <tr>
                  <th>Origen</th>
                  <th>Vistas</th>
                </tr>
              </thead>
              <tbody>
                {counts.sources.map((source) => (
                  <tr key={source.source}>
                    <td>
                      {source.source === "direct"
                        ? "Directo o sin referencia"
                        : source.source}
                    </td>
                    <td>{source.views}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Aún no hay fuentes de tráfico registradas.</p>
          )}
        </section>
      </div>
      <div className="tk-two-columns">
        <section className="tk-card tk-stack">
          <h3>Tu Ruta Digital</h3>
          <strong className="tk-big-number">
            {total ? Math.round((completed / total) * 100) : 0}%
          </strong>
          <progress value={completed} max={Math.max(1, total)} />
          <p>
            {completed} de {total} pasos completados.
          </p>
          <h3>Redes sociales</h3>
          <p>
            Sin conectar. Las métricas de Instagram y WhatsApp requieren una
            integración autorizada con tu cuenta de negocio.
          </p>
        </section>
        <section className="tk-card tk-stack">
          <h3>Aprendiendo de tu ritmo</h3>
          {patterns.sampleSize < 3 ? (
            <p>
              Necesitamos al menos tres actividades completadas con duración
              para empezar a reconocer tus preferencias.
            </p>
          ) : (
            <>
              <p>{patterns.sampleSize} actividades completadas.</p>
              <p>Hora más frecuente de trabajo: {patterns.preferredHour}:00.</p>
              <p>
                Duración promedio:{" "}
                {Math.round((patterns.averageSeconds ?? 0) / 60)} minutos.
              </p>
              <small>
                Este es tu horario de trabajo, no una predicción del mejor
                horario para publicar.
              </small>
            </>
          )}
          <p>
            Las sugerencias usan tu actividad en FOR U. Puedes desactivar la
            adaptación desde el selector de ritmo.
          </p>
        </section>
      </div>
    </div>
  );
}

export function Automation() {
  const { business, docs, save } = useToolkit();
  const previous = docs.automation as
    | { keywords: string; reply: string; channel: string; steps: boolean[] }
    | undefined;
  const [keywords, setKeywords] = useState(
    previous?.keywords ??
      (business.industry === "gastronomy"
        ? "menú, precio, pedido, delivery"
        : "precio, información, reserva, horario"),
  );
  const [reply, setReply] = useState(
    previous?.reply ??
      `¡Hola! Gracias por escribir a ${business.name}. ¿Quieres conocer ${business.offer}? Cuéntanos qué necesitas y te ayudamos.`,
  );
  const [channel, setChannel] = useState(previous?.channel ?? "Instagram");
  const [steps, setSteps] = useState(previous?.steps ?? [false, false, false]);
  const [test, setTest] = useState("");
  const [notice, setNotice] = useState("");
  const flow = {
    channel,
    keywords: keywords
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    reply,
    handoff:
      "Si el cliente pide hablar con una persona, detener la automatización y avisar al negocio.",
  };
  const match = flow.keywords.some((k) =>
    test.toLowerCase().includes(k.toLowerCase()),
  );
  return (
    <div className="tk-two-columns">
      <section className="tk-card tk-stack">
        <div className="tk-eyebrow">
          UNA BIENVENIDA, INCLUSO CUANDO NO ESTÁS
        </div>
        <h2>Tus respuestas automáticas</h2>
        <span className="tk-badge">
          Configuración guiada · conexión pendiente
        </span>
        <p>
          Prepara y prueba tu flujo aquí. Después configúralo en ManyChat y
          conecta tu cuenta de negocio para activarlo.
        </p>
        <label>
          Canal
          <select value={channel} onChange={(e) => setChannel(e.target.value)}>
            <option>Instagram</option>
            <option>WhatsApp</option>
          </select>
        </label>
        <label>
          Palabras que activan la respuesta
          <input
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            maxLength={300}
          />
        </label>
        <label>
          Mensaje de bienvenida
          <textarea
            rows={6}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            maxLength={2000}
          />
        </label>
        <div className="tk-toolbar">
          <button
            className="tk-primary"
            onClick={async () => {
              try {
                await save("automation", { keywords, reply, channel, steps });
                setNotice("Flujo guardado. Todavía no envía mensajes.");
              } catch (e) {
                setNotice((e as Error).message);
              }
            }}
          >
            Guardar flujo
          </button>
          <button
            onClick={() =>
              downloadBlob(
                new Blob(
                  [
                    `Guía de configuración FOR U\n\nCanal: ${channel}\nKeywords: ${flow.keywords.join(", ")}\n\nRespuesta:\n${reply}\n\n${flow.handoff}`,
                  ],
                  { type: "text/plain;charset=utf-8" },
                ),
                "flujo-manychat.txt",
              )
            }
          >
            Descargar guía
          </button>
        </div>
        {notice && (
          <p role="status" className="tk-notice">
            {notice}
          </p>
        )}
      </section>
      <section className="tk-card tk-stack">
        <h3>De borrador a conexión</h3>
        {[
          "Conecta tu cuenta de negocio en ManyChat.",
          "Crea un disparador de palabras clave y copia la respuesta.",
          "Prueba desde otra cuenta y activa el flujo en ManyChat.",
        ].map((step, i) => (
          <label className="tk-check" key={step}>
            <input
              type="checkbox"
              checked={steps[i]}
              onChange={(e) =>
                setSteps(steps.map((v, j) => (i === j ? e.target.checked : v)))
              }
            />
            {step}
          </label>
        ))}
        <a
          className="tk-link-button"
          href="https://app.manychat.com/"
          target="_blank"
          rel="noreferrer"
        >
          Abrir ManyChat ↗
        </a>
        <h3>Prueba tu respuesta</h3>
        <label>
          Mensaje del cliente
          <input
            value={test}
            onChange={(e) => setTest(e.target.value)}
            placeholder="Hola, ¿me compartes el precio?"
          />
        </label>
        {test && (
          <div className="tk-chat-bubble">
            {match
              ? reply
              : "No coincide con tus palabras clave. Esta conversación necesita una respuesta manual."}
          </div>
        )}
        <small>
          Simulador local. Marcar los pasos no confirma una conexión ni activa
          mensajes en tus redes.
        </small>
      </section>
    </div>
  );
}
