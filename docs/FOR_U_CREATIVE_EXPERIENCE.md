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

La usuaria confirmó nivel gratuito en Google AI Studio. El 19 de octubre se desplegó toolkit-ai y se configuraron proveedor Gemini, modelo gemini-3.5-flash-lite, confirmación del nivel gratuito y funciones pagadas desactivadas. Se desactivó el verificador JWT heredado con autorización específica; auth.getUser y propiedad siguen comprobándose en el código. Falta guardar personalmente GEMINI_API_KEY en Supabase y probar respuestas reales. La documentación oficial del modelo y su tabla de precios gratuitos se comprobaron el 19 de octubre. No se ha leído ni mostrado la clave, no se activó facturación y no se simula éxito. La usuaria pidió instrucciones para comprobar AI Studio; se enviaron. El cierre end-to-end Gemini queda pendiente hasta verificarlo.

## Límites que siguen abiertos

- Bandeja personal independiente implementada en foru_account_documents, con RLS por cuenta y revisión. Migración 29 autorizada y tabla remota confirmada el 19 de octubre. Captura, guardado, recarga y asignación explícita al proyecto QA comprobados; queda pendiente aislamiento remoto con segunda cuenta. No usa un proyecto ficticio.
- Verificación completa de todos los rubros, aula de cursos y todas las herramientas: no cerrada por cambiar controles comunes. Validar recorridos específicos.
- Compositor permite borrador guardado o última publicación como fuente; conserva modo y huella de revisión. Selección de fuente publicada, composición Café QA, guardado, recarga y PNG comprobados el 19 de octubre; ver registro.
- Los diseños del carrusel conservan grupo y diapositiva; la exportación actual es por imagen, no un archivo conjunto. Logo como capa gráfica independiente y deshacer/rehacer/variantes están implementados; queda validar todos sus recorridos de interfaz.
- Ayuda preparada no entiende cualquier pregunta libre; búsqueda sin coincidencias ofrece guardar la duda. No se presenta como conversación IA.
- Autoguardado de cada respuesta inicial aún no existe: se guarda explícitamente, manteniendo edición pendiente en la sesión de trabajo. La recarga advierte si hay cambios pendientes.
- No se declara completado todo el plan mientras falten esos recorridos y la prueba externa. No se desplegó Hostinger ni se publicaron negocios reales en esta revisión.

La evidencia de navegador y pruebas se añade al registro al completar las comprobaciones.


El registro del 19 de octubre documenta la recuperación de entorno y las comprobaciones remotas/UI. Gemini Flash-Lite figura con structured outputs y nivel gratuito en la documentación oficial consultada: [modelo](https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite), [precios](https://ai.google.dev/gemini-api/docs/pricing). Esto no sustituye probar la cuota y respuesta de la clave concreta.
