import { lazy, Suspense, useRef, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Camera,
  ChartNoAxesCombined,
  Check,
  Images,
  LayoutTemplate,
  MessageCircle,
  Scissors,
  Sparkles,
  WandSparkles,
  X,
  Menu,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { type ForUActiveProject } from "../stores/useActiveProjectsStore";
import { ToolkitProvider, useToolkit } from "./ToolkitContext";
import { businessFromProject, type ToolId } from "./types";
import { type FocusState, type Segment } from "./engine";
import { useDialogFocus } from "./useDialogFocus";
import TodayView from "./TodayView";
import { todayRoute, type TodayProgress } from "./todayModel";
import "./toolkit.css";
const TemplateLibrary = lazy(() => import("./TemplateLibrary"));
const ConnectionStatus = lazy(() => import("./ConnectionStatus"));
const ContentStudio = lazy(() => import("./ContentStudio"));
const Teleprompter = lazy(() => import("./Teleprompter"));
const VideoEditor = lazy(() => import("./VideoEditor"));
const ImageLibrary = lazy(() => import("./ImageLibrary"));
const Calendar = lazy(() => import("./Calendar"));
const LandingBuilder = lazy(() => import("./LandingBuilder"));
const ContextAssistant = lazy(() => import("./ContextAssistant"));
const Bookings = lazy(() =>
  import("./BusinessTools").then((module) => ({ default: module.Bookings })),
);
const Analytics = lazy(() =>
  import("./BusinessTools").then((module) => ({ default: module.Analytics })),
);
const Automation = lazy(() =>
  import("./BusinessTools").then((module) => ({ default: module.Automation })),
);

const tools = [
  {
    id: "content",
    name: "Contenido con IA",
    description: "Dale palabras a tus ideas. Captions, guiones y hashtags.",
    Icon: WandSparkles,
    color: "lilac",
    label: "CREA",
    minutes: 5,
  },
  {
    id: "teleprompter",
    name: "Teleprompter",
    description: "Tu guion cerca. Tu mirada en la cámara.",
    Icon: Camera,
    color: "rose",
    label: "GRABA",
    minutes: 5,
  },
  {
    id: "video",
    name: "Editor de video",
    description: "Recorta pausas y agrega subtítulos a tu historia.",
    Icon: Scissors,
    color: "peach",
    label: "DALE FORMA",
    minutes: 10,
  },
  {
    id: "images",
    name: "Tus imágenes",
    description: "Un lugar para las fotos que cuentan quién eres.",
    Icon: Images,
    color: "sage",
    label: "ORGANIZA",
    minutes: 3,
  },
  {
    id: "calendar",
    name: "Calendario",
    description: "Haz espacio para tu próxima publicación.",
    Icon: CalendarDays,
    color: "blue",
    label: "PLANIFICA",
    minutes: 5,
  },
  {
    id: "analytics",
    name: "Tus resultados",
    description: "Mira tus avances y encuentra tu siguiente paso.",
    Icon: ChartNoAxesCombined,
    color: "yellow",
    label: "APRENDE",
    minutes: 3,
  },
  {
    id: "assistant",
    name: "Asistente FOR U",
    description: "Una guía que conoce el paso en el que estás.",
    Icon: Sparkles,
    color: "lilac",
    label: "CONVERSEMOS",
    minutes: 2,
  },
  {
    id: "landing",
    name: "Tu página",
    description: "Un espacio propio para presentar tu negocio.",
    Icon: LayoutTemplate,
    color: "sage",
    label: "COMPARTE",
    minutes: 15,
  },
  {
    id: "bookings",
    name: "Reservas y pedidos",
    description: "Convierte un «me interesa» en una conversación.",
    Icon: Check,
    color: "rose",
    label: "RECIBE",
    minutes: 5,
  },
  {
    id: "automation",
    name: "Respuestas automáticas",
    description: "Prepara tu bienvenida de WhatsApp e Instagram.",
    Icon: MessageCircle,
    color: "blue",
    label: "CONECTA",
    minutes: 10,
  },
] as const;
const demoProject: ForUActiveProject = {
  id: "demo",
  name: "Mi pequeño negocio",
  industryKey: "gastronomy",
  tangibleGoal: "Conseguir mis primeros pedidos",
  strategyProfile: {
    offerType: "postres artesanales",
    idealTraveler: "personas que disfrutan compartir",
    objective: "ventas",
    location: "Lima",
  },
  status: "active",
  targetFeelings: [],
  tasks: [],
  nodes: [],
  edges: [],
  digitalRoute: [],
  currentRouteIndex: 0,
  createdAt: "",
  updatedAt: "",
};
export default function Toolkit({
  project,
  onBack,
  demo = false,
}: {
  project: ForUActiveProject;
  onBack?: () => void;
  demo?: boolean;
}) {
  const { user } = useAuth();
  const userId = demo ? "demo" : user?.id;
  if (!userId) return <p>Inicia sesión para abrir tus herramientas.</p>;
  return (
    <ToolkitProvider
      key={`${userId}:${project.id}`}
      userId={userId}
      projectId={project.id}
      business={businessFromProject(project)}
      demo={demo}
    >
      <ToolkitShell project={project} onBack={onBack} />
    </ToolkitProvider>
  );
}
export function ToolkitDemo() {
  return <Toolkit project={demoProject} demo />;
}
function ToolkitShell({
  project,
  onBack,
}: {
  project: ForUActiveProject;
  onBack?: () => void;
}) {
  const { user, signOut } = useAuth();
  const {
    state,
    chooseState,
    adaptive,
    setAdaptive,
    loading,
    business,
    demo,
    docs,
  } = useToolkit();
  const [tool, setTool] = useState<ToolId | null>(null);
  const [page, setPage] = useState<"today" | "tool" | "templates">("today");
  const [menu, setMenu] = useState(false);
  const [menuPage, setMenuPage] = useState("root");
  const menuRef = useRef<HTMLElement>(null);
  useDialogFocus(menuRef, menu, () => setMenu(false));
  const [script, setScript] = useState("");
  const [captions, setCaptions] = useState<Segment[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const current = tools.find((item) => item.id === tool);
  const tasks = project.nodes.filter((node) => node.kind === "task");
  const completed = tasks.filter(
    (node) => node.completedAt || node.taskStatus === "done",
  ).length;
  const nextTask = todayRoute(
    project,
    (docs.today as TodayProgress | undefined) ?? { completed: [] },
  ).task.title;
  function open(next: ToolId) {
    setTool(next);
    setPage("tool");
    setMenu(false);
    setChatOpen(false);
  }
  function home() {
    setTool(null);
    setPage("today");
    setMenu(false);
    setChatOpen(false);
  }
  const group = (ids: ToolId[]) =>
    ids.map((id) => {
      const item = tools.find((t) => t.id === id)!;
      return (
        <button key={id} onClick={() => open(id)}>
          <item.Icon size={20} />
          <span>{item.name}</span>
        </button>
      );
    });
  return (
    <div className="tk-app hoy-shell" data-focus={state}>
      <header className="hoy-topbar" inert={menu}>
        <button
          className="hoy-menu-toggle"
          onClick={() => {
            setMenuPage("root");
            setMenu(true);
          }}
          aria-label="Abrir menú"
          aria-expanded={menu}
        >
          <Menu size={22} />
        </button>
        {page !== "today" && (
          <button className="hoy-home" onClick={home}>
            <ArrowLeft size={16} /> Hoy
          </button>
        )}
        <span className="hoy-wordmark" aria-label="FOR U">
          for u
        </span>
      </header>
      <main
        className={"hoy-main" + (page === "today" ? " is-today" : "")}
        inert={menu}
      >
        {loading ? (
          <p className="hoy-loading" role="status">
            Preparando tu siguiente paso…
          </p>
        ) : page === "today" ? (
          <TodayView project={project} onHelp={() => setChatOpen(true)} />
        ) : page === "templates" ? (
          <Suspense fallback={<p>Cargando plantillas…</p>}>
            <TemplateLibrary />
          </Suspense>
        ) : (
          <>
            <header className="hoy-tool-heading">
              <h1>{current?.name}</h1>
              <p>{current?.description}</p>
            </header>
            <Suspense fallback={<p role="status">Abriendo tu herramienta…</p>}>
              {tool === "content" && (
                <ContentStudio
                  onScript={(text) => {
                    setScript(text);
                    open("teleprompter");
                  }}
                />
              )}
              {tool === "teleprompter" && (
                <Teleprompter
                  initialScript={script}
                  onEdit={(file, subtitles) => {
                    setVideo(file);
                    setCaptions(subtitles);
                    open("video");
                  }}
                />
              )}
              {tool === "video" && (
                <VideoEditor initialFile={video} initialSubtitles={captions} />
              )}
              {tool === "images" && <ImageLibrary />}
              {tool === "calendar" && (
                <>
                  <Calendar />
                  <ConnectionStatus />
                </>
              )}
              {tool === "landing" && <LandingBuilder />}
              {tool === "bookings" && (
                <>
                  <Bookings />
                  <ConnectionStatus />
                </>
              )}
              {tool === "analytics" && (
                <>
                  <Analytics completed={completed} total={tasks.length} />
                  <ConnectionStatus />
                </>
              )}
              {tool === "automation" && (
                <>
                  <Automation />
                  <ConnectionStatus />
                </>
              )}
              {tool === "assistant" && (
                <ContextAssistant currentTool="Hoy" currentTask={nextTask} />
              )}
            </Suspense>
          </>
        )}
      </main>
      {menu && (
        <div className="hoy-menu-backdrop">
          <aside
            ref={menuRef}
            className="hoy-menu"
            role="dialog"
            aria-modal="true"
            aria-labelledby="hoy-menu-title"
          >
            <button
              autoFocus
              className="hoy-close"
              aria-label="Cerrar menú"
              onClick={() => setMenu(false)}
            >
              <X size={20} />
            </button>
            <h2 id="hoy-menu-title">
              {menuPage === "root"
                ? "A tu ritmo"
                : menuPage === "rhythm"
                  ? "Mi ritmo"
                  : menuPage === "account"
                    ? "Mi espacio"
                    : "Herramientas"}
            </h2>
            {menuPage !== "root" && (
              <button
                className="hoy-menu-back"
                onClick={() => setMenuPage("root")}
              >
                ← Volver
              </button>
            )}
            <nav className="hoy-menu-options">
              {menuPage === "root" && (
                <>
                  <button onClick={() => setMenuPage("tools")}>
                    Herramientas
                  </button>
                  <button onClick={() => setMenuPage("rhythm")}>
                    Mi ritmo
                  </button>
                  <button onClick={() => setMenuPage("account")}>
                    Mi espacio
                  </button>
                </>
              )}
              {menuPage === "tools" && (
                <>
                  <button onClick={() => setMenuPage("create")}>
                    Crear contenido
                  </button>
                  <button onClick={() => setMenuPage("manage")}>
                    Gestionar mi negocio
                  </button>
                  <button onClick={() => setMenuPage("plan")}>
                    Organizarme y pedir ayuda
                  </button>
                </>
              )}
              {menuPage === "create" && (
                <>
                  {group(["content", "images"])}
                  <button onClick={() => setMenuPage("video")}>
                    Grabar o editar video
                  </button>
                </>
              )}
              {menuPage === "video" && group(["teleprompter", "video"])}
              {menuPage === "manage" &&
                group(["landing", "bookings", "automation"])}
              {menuPage === "plan" &&
                group(["calendar", "analytics", "assistant"])}
              {menuPage === "account" && (
                <>
                  <button
                    onClick={() => {
                      setPage("templates");
                      setMenu(false);
                    }}
                  >
                    Plantillas de mi rubro
                  </button>
                  {onBack ? (
                    <button onClick={onBack}>Mis proyectos</button>
                  ) : (
                    <Link to="/login">Iniciar sesión</Link>
                  )}
                  {!demo && (
                    <button
                      onClick={async () => {
                        await signOut();
                        window.location.assign("/login");
                      }}
                    >
                      Salir de mi cuenta
                    </button>
                  )}
                </>
              )}
            </nav>
            {menuPage === "rhythm" && (
              <div className="hoy-rhythm-settings">
                <label>
                  ¿Cómo quieres avanzar?
                  <select
                    aria-label="Mi ritmo"
                    value={state}
                    onChange={(event) => {
                      chooseState(event.target.value as FocusState);
                      setMenu(false);
                    }}
                  >
                    <option value="focused">A mi ritmo</option>
                    <option value="exhausted">Solo cinco minutos</option>
                    <option value="anxious">Una cosa a la vez</option>
                    <option value="low-motivation">Pasos pequeños</option>
                    <option value="high-energy">Tengo energía</option>
                    <option value="confused">Quiero orientación</option>
                  </select>
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={adaptive}
                    onChange={(event) => setAdaptive(event.target.checked)}
                  />{" "}
                  Adaptar con mi actividad
                </label>
                <p>Puedes cambiarlo cuando quieras.</p>
              </div>
            )}
            <small>
              {demo
                ? "Espacio de prueba"
                : user?.user_metadata?.display_name || business.name}
            </small>
          </aside>
        </div>
      )}
      {chatOpen && (
        <aside
          className="tk-chat-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Asistente contextual"
        >
          <button
            className="tk-drawer-close"
            aria-label="Cerrar ayuda"
            onClick={() => setChatOpen(false)}
          >
            <X size={20} />
          </button>
          <Suspense fallback={<p>Cargando ayuda…</p>}>
            <ContextAssistant
              currentTool={current?.name ?? "Hoy"}
              currentTask={nextTask}
            />
          </Suspense>
        </aside>
      )}
    </div>
  );
}
