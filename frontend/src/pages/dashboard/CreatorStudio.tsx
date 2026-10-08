import React, { useEffect } from 'react';
import { useOnboardingProgress } from '../../hooks/useOnboardingProgress';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useActiveProjectsStore } from '../../stores/useActiveProjectsStore';
import { projectModuleType, moduleLabels } from '../../modules/moduleProjects';
import { isSavedProject } from './areaModel';
import PizarraAgent from '../../components/PizarraAgent';

export default function CreatorStudio() {
  const progress = useOnboardingProgress();
  const navigate = useNavigate();
  const { user } = useAuth();
  const store = useActiveProjectsStore();
  
  const [chatOpen, setChatOpen] = React.useState(false);

  useEffect(() => {
    if (user) void store.hydrateFromSupabase(user.id);
  }, [user?.id]);

  const owned = store.cloudUserId === user?.id ? Object.values(store.projectsById) : [];
  const projects = owned.filter(p => isSavedProject(p.id) && !p.cloudPending && projectModuleType(p));

  const handleCardClick = (moduleName: string) => {
    navigate(`/modules/${moduleName}/editor`);
  };

  return (
    <div className="min-h-screen bg-[var(--color-fondo)] p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 text-center animate-fade-in">
          <h1 className="text-4xl font-black mb-4" style={{ color: 'var(--color-texto)', fontFamily: 'var(--font-titulos)' }}>
            Tablero FOR U
          </h1>
          <p className="text-lg mb-8" style={{ color: 'var(--color-texto-suave)' }}>
            Vas genial, ya casi terminamos de conocerte. Tu negocio está {Math.round(progress.porcentajeTotal)}% listo para crear contenido.
          </p>
          
          <div className="w-full max-w-2xl mx-auto h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner flex">
            <div 
              className="h-full transition-all duration-1000 ease-out" 
              style={{ 
                width: `${progress.porcentajeTotal}%`, 
                background: 'var(--gradient-iridiscente)' 
              }}
            ></div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Super Card: Landing */}
          <div 
            onClick={() => handleCardClick('ecommerce')}
            className="magic-card p-6 cursor-pointer hover:shadow-lg transition-all relative flex flex-col items-center text-center group"
            style={{ animation: 'foru-focus-step-in 0.4s ease-out 0.1s both' }}
          >
            <div className="absolute top-4 right-4">
              {progress.marketing ? (
                <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-green-100 text-green-700 border border-green-200 shadow-sm">
                  ✅ Datos de Marketing
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                  ⏳ Completar Marketing
                </span>
              )}
            </div>
            <div className="w-16 h-16 rounded-full bg-pink-50 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
              🛍️
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-texto)' }}>Landing</h3>
            <p className="text-sm" style={{ color: 'var(--color-texto-suave)' }}>Crea la página web para tu tienda online.</p>
          </div>

          {/* Super Card: Menú */}
          <div 
            onClick={() => handleCardClick('restaurant')}
            className="magic-card p-6 cursor-pointer hover:shadow-lg transition-all relative flex flex-col items-center text-center group"
            style={{ animation: 'foru-focus-step-in 0.4s ease-out 0.2s both' }}
          >
            <div className="absolute top-4 right-4">
              {progress.finanzas ? (
                <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-green-100 text-green-700 border border-green-200 shadow-sm">
                  ✅ Datos de Finanzas
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                  ⏳ Completar Finanzas
                </span>
              )}
            </div>
            <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
              🍔
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-texto)' }}>Menú Digital</h3>
            <p className="text-sm" style={{ color: 'var(--color-texto-suave)' }}>El menú más atractivo para tus comensales.</p>
          </div>

          {/* Super Card: Reservas */}
          <div 
            onClick={() => handleCardClick('hospitality')}
            className="magic-card p-6 cursor-pointer hover:shadow-lg transition-all relative flex flex-col items-center text-center group"
            style={{ animation: 'foru-focus-step-in 0.4s ease-out 0.3s both' }}
          >
            <div className="absolute top-4 right-4">
              {progress.operaciones ? (
                <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-green-100 text-green-700 border border-green-200 shadow-sm">
                  ✅ Datos de Operaciones
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                  ⏳ Completar Operaciones
                </span>
              )}
            </div>
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
              🏡
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-texto)' }}>Reservas</h3>
            <p className="text-sm" style={{ color: 'var(--color-texto-suave)' }}>Gestiona tu hospedaje o servicios.</p>
          </div>

          {/* Super Card: Cursos */}
          <div 
            onClick={() => handleCardClick('courses')}
            className="magic-card p-6 cursor-pointer hover:shadow-lg transition-all relative flex flex-col items-center text-center group"
            style={{ animation: 'foru-focus-step-in 0.4s ease-out 0.4s both' }}
          >
            <div className="absolute top-4 right-4">
              {progress.logistica ? (
                <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-green-100 text-green-700 border border-green-200 shadow-sm">
                  ✅ Datos de Logística
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                  ⏳ Completar Logística
                </span>
              )}
            </div>
            <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
              🎓
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-texto)' }}>Cursos</h3>
            <p className="text-sm" style={{ color: 'var(--color-texto-suave)' }}>Vende tu conocimiento fácilmente.</p>
          </div>
        </div>

        <div className="mt-16 bg-white rounded-2xl p-8 border border-gray-100 shadow-sm max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--color-texto)', fontFamily: 'var(--font-titulos)' }}>Mis Proyectos</h2>
            <button 
              onClick={() => navigate('/dashboard?create=1')}
              className="px-4 py-2 text-sm font-bold rounded-full bg-gray-50 hover:bg-gray-100 transition border border-gray-200 text-gray-700"
            >
              + Nuevo Proyecto
            </button>
          </div>
          
          {projects.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {projects.map(p => (
                <div key={p.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition group cursor-pointer" onClick={() => {
                  store.switchProject(p.id);
                  navigate(`/modules/${projectModuleType(p)}/editor?project=${encodeURIComponent(p.id)}`);
                }}>
                  <div>
                    <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition">{p.name}</h4>
                    <span className="text-xs text-gray-500 uppercase font-black tracking-wide">{moduleLabels[projectModuleType(p)!]}</span>
                  </div>
                  <span className="material-symbols-outlined text-gray-400 group-hover:text-blue-600 transition">arrow_forward</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-6">No tienes proyectos activos aún. ¡Crea uno para empezar!</p>
          )}
        </div>

        <div className="mt-16 text-center border-t border-gray-100 pt-12">
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-texto)', fontFamily: 'var(--font-titulos)' }}>Pasos a seguir</h2>
          <div className="flex justify-center gap-4 flex-wrap">
            <button 
              onClick={() => navigate('/creator-studio')}
              className="magic-button magic-button-primary px-8 py-4 text-lg rounded-full"
            >
              <span className="material-symbols-outlined text-[24px]">video_camera_front</span>
              Entrar al Creator Studio
            </button>
            <button 
              onClick={() => setChatOpen(true)}
              className="magic-button magic-button-soft px-8 py-4 text-lg rounded-full"
            >
              <span className="material-symbols-outlined text-[24px]">chat_spark</span>
              Chat de IA Unificado
            </button>
          </div>
        </div>
      </div>
      {chatOpen && (
        <PizarraAgent 
          area="marketing" 
          userName={user?.user_metadata?.display_name || "Emprendedora"} 
          isOpen={chatOpen} 
          onClose={() => setChatOpen(false)} 
        />
      )}
    </div>
  );
}
