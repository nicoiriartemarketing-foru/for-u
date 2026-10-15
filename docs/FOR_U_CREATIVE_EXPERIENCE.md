# FOR U — Tu negocio toma forma

Plan aprobado el 15 de octubre de 2026: bienvenida original, creación por preguntas, mapa/Kanban/calendario/mundo sobre tareas compartidas, compañía local, editores contextuales y composiciones desde la landing. Sustituye la muestra visual anterior rechazada. No confundir implementación con aprobación visual de la propietaria.

## Implementación de esta revisión

- Logo PNG original en componente compartido, acceso y navegación; se encuadra con CSS sin modificar el archivo. Animación MP4 original en bienvenida saltable por sesión de pestaña, muda inicialmente, sin bloquear la carga de proyectos. Archivo comprobado en navegador: 960×960, 5.062 segundos, sin error de decodificación.
- Creación nueva y onboarding utilizan la misma secuencia de rubro inicial y nombre. Borrador inicial conservado en sessionStorage por cuenta. Las preguntas posteriores se guardan en `module-project-journey` mediante revisión. Opciones de equipo, omitir, volver, recuperar y adjuntar material. No inventar respuestas ni completar tareas por responder.
- Mapa con cuatro ramas, tareas y foco por área; Kanban con estados; calendario existente integrado y tareas fechadas por referencia; mundo existente. Las tareas v1 se leen sin conversión y una edición explícita de estado/fecha produce v2. Los nodos antiguos no se cambian. Conserva recompensas permanentes al reabrir.
- Navegación horizontal, selector de proyecto, menú de herramientas y cuenta; Pomodoro global y carita. La ayuda de la carita es búsqueda de guía preparada, sin llamadas a IA. Ideas por proyecto en `module-idea-inbox`, con categorías manuales, adjuntos, guardado con revisión y conversión explícita a tarea usando el UUID de idea para evitar duplicarla. La clasificación solo acepta resultados revisados y nunca crea tareas.
- Fotos: biblioteca/subida principal y enlace avanzado en todos los consumidores de ProjectImageField. Encuadre opcional guarda un archivo nuevo; conserva el original. Fallos de CORS/almacenamiento se muestran como errores.
- Creator Studio presenta Portada/Publicación/Carrusel/Historia, conserva ruta y herramientas. Compositor determinista desde hero, bloques y ofertas del borrador guardado: 1:1,4:5,9:16, identidad y CTA editables. Lote de hasta doce diseños con grupo de carrusel; revisión antes de guardar. Sin llamadas a IA ni imágenes inventadas.
- Cada diseño conserva fuente y revisión; un cambio posterior señala revisión necesaria sin regenerar ni sobrescribir. Se excluyen enlaces firmados temporales de la instantánea. Exportación PNG con comprobación de desbordamiento y errores de imagen.
- Creador visual dentro del contenedor común, diseño protagonista, título/texto editables directamente, imagen seleccionable y ajustes recogidos. Guiones, piezas y teleprompter existentes conservan su documento común.
- Respuestas iniciales pueden incorporarse selectivamente a Mi propuesta: no reemplaza datos automáticamente ni duplica catálogo. El editor de landing enlaza a la sección correspondiente del compositor.

## Gemini: preparado en código, no dar por conectado

Nuevas operaciones autenticadas en toolkit-ai: `classify` y `studio` (`content`, `layout`, `script`, `landing`). El servidor verifica propietario, lee documento/revisión guardados, limita contexto y devuelve JSON validado con esquema específico. No ejecuta acciones. Las instrucciones de usuario se envían como datos; no reemplazan instrucciones de sistema.

Se conserva cuota de 30/h, caché de cinco minutos por revisión/operación, exclusión de duplicados entre instancias y logs solo de uso. La operación forma parte de la clave de caché para no confundir composición y texto. Sin llamadas al abrir pantallas, fallback de pago, caché explícita de pago o generación de imágenes. La clave local no configura Supabase.

Falta completar la activación externa: confirmar proyecto Google sin facturación y cuota disponible; configurar personalmente secreto en Supabase, comprobar modelo real, desplegar función completa y probar respuestas reales. No se ha leído ni mostrado la clave, no se activó facturación y no se simula éxito. La usuaria pidió instrucciones para comprobar AI Studio; se enviaron. El cierre end-to-end Gemini queda pendiente hasta verificarlo.

## Límites que siguen abiertos

- Bandeja personal independiente de proyectos: no implementada todavía. toolkit_documents exige proyecto UUID no nulo y FK de propietario; no se usará un UUID ficticio ni se ligará ocultamente una bandeja personal a un proyecto que pueda borrarse. Hace falta confirmar almacenamiento por cuenta y preparar un cambio acotado si procede.
- Verificación completa de todos los rubros, aula de cursos y todas las herramientas: no cerrada por cambiar controles comunes. Validar recorridos específicos.
- Compositor utiliza borrador guardado; todavía no ofrece elegir la publicación como fuente alternativa. No afirmar que incluye esa selección.
- Los diseños del carrusel conservan grupo y diapositiva; la exportación actual es por imagen, no un archivo conjunto. Logo como capa gráfica independiente y variantes visuales adicionales siguen pendientes.
- Ayuda preparada no entiende cualquier pregunta libre; búsqueda sin coincidencias ofrece guardar la duda. No se presenta como conversación IA.
- Autoguardado de cada respuesta inicial aún no existe: se guarda explícitamente, manteniendo edición pendiente en la sesión de trabajo. La recarga advierte si hay cambios pendientes.
- No se declara completado todo el plan mientras falten esos recorridos y la prueba externa. No se desplegó Hostinger ni se publicaron negocios reales en esta revisión.

La evidencia de navegador y pruebas se añade al registro al completar las comprobaciones.
