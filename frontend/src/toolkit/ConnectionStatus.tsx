import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useToolkit } from "./ToolkitContext";
const providers = [
  {
    id: "google_calendar",
    name: "Google Calendar",
    url: "https://calendar.google.com/",
    help: "Autoriza acceso de lectura a tus calendarios. Renueva la autorización cuando venza.",
  },
  {
    id: "calendly",
    name: "Calendly",
    url: "https://calendly.com/integrations/api_webhooks",
    help: "En Calendly, crea un token personal con permiso para leer tu usuario.",
  },
  {
    id: "manychat",
    name: "ManyChat",
    url: "https://app.manychat.com/",
    help: "Copia la clave de API de Configuración → API en tu cuenta ManyChat.",
  },
  {
    id: "meta_ads",
    name: "Meta Ads",
    url: "https://business.facebook.com/",
    help: "Usa una autorización con ads_read y acceso a una cuenta publicitaria.",
  },
];
type Connection = {
  provider: string;
  connected: boolean;
  checked_at: string;
  account_label?: string;
};
export default function ConnectionStatus() {
  const { userId, demo } = useToolkit();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState("");
  const [clock, setClock] = useState(() => Date.now());
  useEffect(() => {
    if (!supabase || demo) return;
    let active = true;
    const client = supabase;
    const load = async () => {
      const { data, error } = await client
        .from("integration_connections")
        .select("provider,connected,checked_at,account_label")
        .eq("user_id", userId);
      if (!active) return;
      if (error) setNotice("No se pudo consultar el estado de tus conexiones.");
      else {
        setConnections(data ?? []);
        setClock(Date.now());
      }
    };
    void load();
    const timer = window.setInterval(() => {
      if (!document.hidden) void load();
    }, 30_000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [userId, demo]);
  async function update(
    provider: string,
    action: string,
    accessToken?: string,
  ) {
    if (!supabase || demo) return;
    setBusy(provider);
    setNotice("");
    try {
      const { data, error } = await supabase.functions.invoke("integrations", {
        body: { provider, action, accessToken },
      });
      if (error)
        throw new Error(
          "No se pudo verificar la conexión. Revisa tu sesión y vuelve a intentar.",
        );
      // This function runs only from explicit form/click handlers.
      // eslint-disable-next-line react-hooks/purity
      setClock(Date.now());
      setConnections((current) => [
        ...current.filter((c) => c.provider !== provider),
        {
          provider,
          connected: Boolean(data?.connected),
          checked_at: data?.checked_at ?? new Date().toISOString(),
          account_label: data?.account_label,
        },
      ]);
      setNotice(
        data?.error ??
          (action === "disconnect"
            ? "Cuenta desconectada."
            : "Estado verificado con el servicio."),
      );
    } catch (error) {
      setNotice((error as Error).message);
    } finally {
      setBusy("");
    }
  }
  return (
    <section className="tk-card tk-stack">
      <h3>Tus conexiones</h3>
      <p>
        El estado conectado requiere una verificación válida durante los últimos
        15 minutos.
      </p>
      <div className="tk-connection-grid">
        {providers.map((provider) => {
          const row = connections.find((c) => c.provider === provider.id);
          const fresh = Boolean(
            row?.connected && clock - Date.parse(row.checked_at) < 900_000,
          );
          return (
            <article className="tk-stack" key={provider.id}>
              <strong>{provider.name}</strong>
              <span className="tk-connection-status">
                <i className={fresh ? "is-connected" : ""} aria-hidden="true" />
                {fresh ? "Conectado" : "No conectado"}
              </span>
              {row?.account_label && <small>{row.account_label}</small>}
              {row?.checked_at && (
                <small>
                  Última verificación:{" "}
                  {new Date(row.checked_at).toLocaleString("es-PE")}
                </small>
              )}
              <details>
                <summary>Gestionar conexión</summary>
                <p>{provider.help}</p>
                <a href={provider.url} target="_blank" rel="noreferrer">
                  Abrir {provider.name} ↗
                </a>
                <form
                  className="tk-stack"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const token = String(new FormData(form).get("token") ?? "");
                    void update(provider.id, "connect", token);
                    form.reset();
                  }}
                >
                  <label>
                    Autorización del servicio
                    <input
                      name="token"
                      type="password"
                      autoComplete="off"
                      required
                      maxLength={5000}
                      disabled={demo || Boolean(busy)}
                    />
                  </label>
                  <small>
                    Se guarda en el servidor y nunca en el almacenamiento del
                    navegador. Verifica acceso; no activa envíos ni
                    sincronización automática.
                  </small>
                  <button disabled={demo || Boolean(busy)}>
                    Conectar y verificar
                  </button>
                </form>
                {row && (
                  <div className="tk-toolbar">
                    <button
                      disabled={Boolean(busy)}
                      onClick={() => void update(provider.id, "verify")}
                    >
                      Verificar estado
                    </button>
                    <button
                      disabled={Boolean(busy)}
                      onClick={() => void update(provider.id, "disconnect")}
                    >
                      Desconectar
                    </button>
                  </div>
                )}
              </details>
            </article>
          );
        })}
      </div>
      {demo && <p>Las conexiones están desactivadas en la prueba.</p>}
      {notice && <p role="status">{notice}</p>}
    </section>
  );
}
