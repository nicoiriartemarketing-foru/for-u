import React from 'react';
import { useOnboardingProgress } from '../../hooks/useOnboardingProgress';
import { useNavigate } from 'react-router-dom';

export default function CreatorStudio() {
  const progress = useOnboardingProgress();
  const navigate = useNavigate();

  const handleCardClick = (moduleName: string) => {
    // Navigate to the specific editor, e.g., /modules/restaurant/editor
    navigate(`/modules/${moduleName}/editor`);
  };

  return (
    <div className="min-h-screen bg-[var(--color-fondo)] p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 text-center animate-fade-in">
          <h1 className="text-4xl font-black mb-4" style={{ color: 'var(--color-texto)', fontFamily: 'var(--font-titulos)' }}>
            Creator Studio
          </h1>
          <p className="text-lg mb-8" style={{ color: 'var(--color-texto-suave)' }}>
            Vas genial, ya casi terminamos de conocerte. Tu negocio está {Math.round(progress.porcentajeTotal)}% listo para crear contenido.
          </p>
          
          <div className="w-full max-w-2xl mx-auto h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
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
                  ✅ Datos de Munay listos
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                  ⏳ Completa a Munay
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
                  ✅ Datos de Shippo listos
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                  ⏳ Completa a Shippo
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
                  ✅ Datos de Emma listos
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                  ⏳ Completa a Emma
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
                  ✅ Datos de Oliver listos
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                  ⏳ Completa a Oliver
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

      </div>
    </div>
  );
}
