import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useToolkit } from "./ToolkitContext";
import { localDate } from "./engine";
type Slot = {
  id: string;
  starts_at: string;
  ends_at: string;
  remaining: number;
  capacity?: number;
  enabled?: boolean;
};
type Reservation = {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  status: string;
  created_at: string;
  slot_id: string;
  reservation_notifications?: { status: string } | { status: string }[];
};
const zone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;
const timeLabel = (value: string) =>
  new Date(value).toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
  });

export function ReservationForm({ slug }: { slug: string }) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [date, setDate] = useState(localDate(new Date()));
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [receipt, setReceipt] = useState("");
  const request = useRef(crypto.randomUUID());
  useEffect(() => {
    let active = true;
    const refresh = async () => {
      if (!supabase) {
        if (active) {
          setLoading(false);
          setNotice("No se pudo conectar con la agenda.");
        }
        return;
      }
      const { data, error } = await supabase.rpc("public_reservation_slots", {
        site_slug: slug,
      });
      if (!active) return;
      setLoading(false);
      if (error)
        setNotice("No se pudo cargar la disponibilidad. Revisa la conexión.");
      else {
        setSlots(data ?? []);
        setNotice("");
      }
    };
    void refresh();
    const timer = window.setInterval(() => {
      if (!document.hidden) void refresh();
    }, 15_000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [slug]);
  const todaySlots = slots.filter(
    (slot) =>
      localDate(new Date(slot.starts_at)) === date && slot.remaining > 0,
  );
  return (
    <section className="tk-stack" aria-label="Agenda de reservas">
      <h2>Elige tu horario</h2>
      <p>
        Horarios en {zone()}. La disponibilidad se actualiza automáticamente.
      </p>
      {receipt ? (
        <p role="status" className="tk-notice">
          {receipt}
        </p>
      ) : (
        <form
          className="tk-stack"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!supabase || busy || !selected) return;
            setBusy(true);
            setNotice("");
            const form = new FormData(e.currentTarget);
            try {
              const { data, error } = await supabase.functions.invoke(
                "reservations",
                {
                  body: {
                    action: "create",
                    slug,
                    slotId: selected,
                    name: form.get("name"),
                    email: form.get("email"),
                    phone: form.get("phone"),
                    website: form.get("website"),
                    requestId: request.current,
                  },
                },
              );
              if (error || !data?.id)
                throw new Error(
                  data?.error ??
                    "No pudimos confirmar la reserva. El horario puede haberse ocupado. Inténtalo de nuevo.",
                );
              setReceipt(
                data.emailStatus === "sent"
                  ? "Reserva confirmada. Enviamos los detalles a tu correo. Referencia: " +
                      data.id
                  : "Reserva guardada. El envío del correo está pendiente. Conserva esta referencia: " +
                      data.id,
              );
            } catch (error) {
              setNotice((error as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <label>
            Fecha
            <input
              type="date"
              required
              min={localDate(new Date())}
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setSelected("");
                request.current = crypto.randomUUID();
              }}
            />
          </label>
          {loading ? (
            <p role="status">Consultando horarios…</p>
          ) : todaySlots.length ? (
            <fieldset className="tk-slot-list">
              <legend>Horarios disponibles</legend>
              {todaySlots.map((slot) => (
                <label className="tk-check" key={slot.id}>
                  <input
                    type="radio"
                    name="slot"
                    required
                    value={slot.id}
                    checked={selected === slot.id}
                    onChange={() => {
                      setSelected(slot.id);
                      request.current = crypto.randomUUID();
                    }}
                  />
                  {timeLabel(slot.starts_at)} – {timeLabel(slot.ends_at)} ·{" "}
                  {slot.remaining} cupos
                </label>
              ))}
            </fieldset>
          ) : (
            <p>No hay horarios disponibles este día.</p>
          )}
          {!loading && slots.length > 0 && !todaySlots.length && (
            <button
              type="button"
              onClick={() => {
                const next = slots.find((slot) => slot.remaining > 0);
                if (next) setDate(localDate(new Date(next.starts_at)));
              }}
            >
              Ver el próximo día disponible
            </button>
          )}
          <label>
            Nombre
            <input
              name="name"
              required
              minLength={2}
              maxLength={120}
              autoComplete="name"
            />
          </label>
          <label>
            Email
            <input
              name="email"
              type="email"
              required
              maxLength={254}
              autoComplete="email"
            />
          </label>
          <label>
            Teléfono
            <input
              name="phone"
              type="tel"
              required
              minLength={7}
              maxLength={30}
              autoComplete="tel"
            />
          </label>
          <label style={{ display: "none" }} aria-hidden="true">
            Sitio web
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
          <label className="tk-check">
            <input required type="checkbox" /> Acepto que el negocio use estos
            datos para gestionar mi reserva y enviarme su confirmación.
          </label>
          <button
            type="submit"
            className="tk-primary"
            disabled={busy || !todaySlots.some((slot) => slot.id === selected)}
          >
            {busy ? "Confirmando…" : "Confirmar reserva"}
          </button>
        </form>
      )}
      {notice && (
        <p role="alert" className="tk-notice">
          {notice}
        </p>
      )}
    </section>
  );
}

export function AvailabilityManager() {
  const { userId, projectId, demo } = useToolkit();
  const [siteId, setSiteId] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [start, setStart] = useState("");
  const [minutes, setMinutes] = useState(60);
  const [capacity, setCapacity] = useState(1);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    if (!supabase || demo) return;
    let active = true;
    const client = supabase;
    const refresh = async () => {
      const site = await client
        .from("toolkit_sites")
        .select("id")
        .eq("user_id", userId)
        .eq("project_id", projectId)
        .maybeSingle();
      if (!active) return;
      if (site.error) {
        setNotice("No se pudo consultar la agenda.");
        return;
      }
      if (!site.data) {
        setNotice("Publica tu página para abrir horarios de reserva.");
        return;
      }
      setSiteId(site.data.id);
      const [available, booked] = await Promise.all([
        client
          .from("reservation_slots")
          .select("*")
          .eq("user_id", userId)
          .eq("site_id", site.data.id)
          .gt("starts_at", new Date().toISOString())
          .order("starts_at")
          .limit(200),
        client
          .from("reservations")
          .select("*,reservation_notifications(status)")
          .eq("user_id", userId)
          .eq("site_id", site.data.id)
          .order("created_at", { ascending: false })
          .limit(100),
      ]);
      if (!active) return;
      if (available.error || booked.error)
        setNotice("No se pudo actualizar la agenda.");
      else {
        setSlots(available.data ?? []);
        setReservations(booked.data ?? []);
      }
    };
    void refresh();
    const timer = window.setInterval(() => {
      if (!document.hidden) void refresh();
    }, 15_000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [demo, projectId, userId]);
  return (
    <section className="tk-card tk-stack">
      <h2>Tu disponibilidad real</h2>
      <p>Crea los horarios que quieres ofrecer. Zona horaria: {zone()}.</p>
      <form
        className="tk-toolbar"
        onSubmit={async (e) => {
          e.preventDefault();
          if (busy || !start) return;
          const from = new Date(start);
          if (from.getTime() <= Date.now()) {
            setNotice("Elige un horario futuro.");
            return;
          }
          setBusy(true);
          try {
            const slot = {
              id: crypto.randomUUID(),
              user_id: userId,
              site_id: siteId,
              starts_at: from.toISOString(),
              ends_at: new Date(
                from.getTime() + minutes * 60_000,
              ).toISOString(),
              capacity,
              enabled: true,
            };
            if (!demo) {
              if (!supabase || !siteId)
                throw new Error("Publica tu página primero.");
              const { error } = await supabase
                .from("reservation_slots")
                .insert(slot);
              if (error)
                throw new Error(
                  error.code === "23505"
                    ? "Este horario ya existe."
                    : "No se pudo guardar el horario.",
                );
            }
            setSlots((current) => [
              ...current,
              { ...slot, remaining: capacity },
            ]);
            setNotice(
              demo
                ? "Horario de prueba añadido a esta sesión."
                : "Horario abierto para reservas.",
            );
          } catch (error) {
            setNotice((error as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <label>
          Inicio
          <input
            type="datetime-local"
            required
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </label>
        <label>
          Duración (minutos)
          <input
            type="number"
            min={15}
            max={480}
            step={15}
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))}
          />
        </label>
        <label>
          Cupos
          <input
            type="number"
            min={1}
            max={100}
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
          />
        </label>
        <button disabled={busy}>Abrir horario</button>
      </form>
      <div className="tk-stack">
        {slots.map((slot) => (
          <article className="tk-booking" key={slot.id}>
            <div>
              <strong>
                {new Date(slot.starts_at).toLocaleString("es-PE")}
              </strong>
              <p>
                {slot.capacity} cupos · {slot.enabled ? "Abierto" : "Cerrado"}
              </p>
            </div>
            <button
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                const enabled = !slot.enabled;
                if (!demo && supabase) {
                  const { error } = await supabase
                    .from("reservation_slots")
                    .update({ enabled })
                    .eq("id", slot.id)
                    .eq("user_id", userId);
                  if (error) {
                    setNotice("No se pudo cambiar el horario.");
                    setBusy(false);
                    return;
                  }
                }
                setSlots(
                  slots.map((s) => (s.id === slot.id ? { ...s, enabled } : s)),
                );
                setBusy(false);
              }}
            >
              {slot.enabled ? "Cerrar nuevas reservas" : "Abrir reservas"}
            </button>
          </article>
        ))}
      </div>
      <h3>Reservas confirmadas</h3>
      {!reservations.length && <p>No hay reservas confirmadas todavía.</p>}
      {reservations.map((reservation) => {
        const mail = Array.isArray(reservation.reservation_notifications)
          ? reservation.reservation_notifications[0]
          : reservation.reservation_notifications;
        return (
          <article className="tk-booking" key={reservation.id}>
            <div>
              <strong>{reservation.customer_name}</strong>
              <p>
                {reservation.customer_email} · {reservation.customer_phone}
              </p>
              <small>
                Correo: {mail?.status === "sent" ? "enviado" : "pendiente"}
              </small>
            </div>
            <div className="tk-stack">
              <label>
                Estado
                <select
                  value={reservation.status}
                  disabled={busy}
                  onChange={async (e) => {
                    if (!supabase) return;
                    const status = e.target.value;
                    const { error } = await supabase
                      .from("reservations")
                      .update({ status })
                      .eq("id", reservation.id)
                      .eq("user_id", userId);
                    if (error) setNotice("No se pudo guardar el estado.");
                    else
                      setReservations((current) =>
                        current.map((r) =>
                          r.id === reservation.id ? { ...r, status } : r,
                        ),
                      );
                  }}
                >
                  <option value="confirmed">Confirmada</option>
                  <option value="completed">Completada</option>
                  <option value="cancelled">Cancelada</option>
                </select>
              </label>
              {mail?.status !== "sent" && (
                <button
                  disabled={busy}
                  onClick={async () => {
                    if (!supabase) return;
                    setBusy(true);
                    const { data, error } = await supabase.functions.invoke(
                      "reservations",
                      { body: { action: "retry-email", id: reservation.id } },
                    );
                    setNotice(
                      !error && data?.emailStatus === "sent"
                        ? "Confirmación enviada."
                        : "El envío sigue pendiente. Revisa la configuración de correo.",
                    );
                    setBusy(false);
                  }}
                >
                  Reintentar confirmación
                </button>
              )}
            </div>
          </article>
        );
      })}
      {notice && (
        <p role="status" className="tk-notice">
          {notice}
        </p>
      )}
    </section>
  );
}
