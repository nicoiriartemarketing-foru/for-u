# Integración de módulos For U

Objetivo: cinco módulos React funcionales, proyectos compartidos, creador de contenido con selector, plantillas por rubro y creación desde cero. El objetivo completo sigue pendiente.

## Referencias recibidas

Los cinco adjuntos se conservaron sin modificaciones en `referencias/`:

- `cursos.html`: Creator Studio.
- `hospedaje-editor.html`: editor de sitio para hospedaje.
- `hospedaje.html`: Stay U, administración de hospedaje.
- `restaurante-editor.html`: editor profesional de restaurante.
- `menu-digital.html`: menú digital, logística y contenido.

No contienen una tienda ni un sistema de turismo. Esos dos módulos se construirán según las funciones del objetivo, siguiendo la estructura visual de estas referencias. No se debe afirmar que son conversiones de HTML recibido.

## Estado comprobado

- Estructura de los cinco módulos, componentes compartidos y archivos de plantillas creada.
- Restaurante: componentes React para portada, carta, edición de platos, orden/visibilidad de seis secciones, historia, ubicación, FAQ y texto de fidelización.
- Restaurante: altas y actualización de ingredientes, recetas con ingredientes y cantidades, cálculo de lotes, bloqueo de stock insuficiente y registro de preparación sin descuento repetido.
- CSS de restaurante extraído de la referencia y limitado a `.restaurant-module`. `index.css` no se modifica.
- Rutas privadas `/modules/restaurant` y `/modules/restaurant/editor`, con `?project=ID`. Acceso desde «Más» del workspace cuando el proyecto es de gastronomía.
- Servicio compartido usa el cliente Supabase existente, tablas `projects` y `toolkit_documents` y documentos `module-restaurant`. No añade una segunda autenticación ni cambia las migraciones.
- Guardado explícito con comparación de `updated_at`: detecta cambios concurrentes en vez de sobrescribir inventario de otra ventana. Fallos de carga bloquean la edición; fallos de guardado conservan el borrador.

## Verificación realizada

- Ocho pruebas de dominio: actualización sin duplicados, precios válidos, stock insuficiente sin mutación, descuento idempotente, ingredientes repetidos, cantidades/recetas inválidas, unidades de ingredientes y pedidos WhatsApp codificados.
- TypeScript pasa con los componentes y las rutas nuevas.
- Compilación Vite pasa sin advertencias.
- Prueba en navegador con componentes reales y datos aislados: crear y editar plato; crear ingrediente; crear receta; cuatro lotes bloqueados por falta de stock; dos lotes confirmados reducen 1 kg a 0,4 kg. Consola sin errores ni advertencias en ese recorrido.
- La prueba de componentes no demuestra guardado autenticado ni aislamiento remoto. Falta verificar esos flujos con Supabase y una sesión de prueba.

## Trabajo pendiente (no reducir el alcance)

1. Completar Restaurante: galería/subida de imágenes, vista pública y QR, pedidos WhatsApp en la interfaz, CTA, fidelización operativa y creador compartido. El texto de fidelización no es un registro de clientes.
2. Hospedaje: preservar editor y secciones; habitaciones, calendario, reservas, limpieza, huéspedes y finanzas con validaciones.
3. Tienda: catálogo, carrito, checkout y pago real mediante proveedor; no simular un cobro exitoso.
4. Turismo: itinerarios, guías, reservas por fecha y mapas.
5. Cursos: módulos/lecciones, alumnos, progreso, ventas, certificados y teleprompter.
6. Creador compartido: selector entre todos los proyectos, seis categorías por rubro, creación desde cero, edición, medios y exportación.
7. Dashboard e islas: creación de los cinco tipos, navegación al módulo correcto, preservación de rutas, monedas, rachas e IA existentes.
8. README con instrucciones; pruebas integradas de navegación, persistencia, aislamiento por usuario/proyecto, consola y diseño móvil; revisión de todos los criterios antes de declarar el objetivo completo.

Los archivos vacíos de otros módulos son estructura, no implementaciones terminadas. Las referencias incluyen botones simulados y cifras de ejemplo que deben reemplazarse con operaciones y datos reales.
