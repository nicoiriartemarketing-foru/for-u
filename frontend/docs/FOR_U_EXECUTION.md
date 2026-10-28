

### 2026-10-27 · Bloque aprobado: idea sobre un lienzo
- StudioCanvas reemplaza las preguntas sucesivas de intención/formato por idea escrita, conversión local, texto directo, proporciones permanentes y controles contextuales. La entrada se recoge tras convertir para mostrar la pieza en móvil.
- Guardado QA comprobado: pieza a45b67d4-083d-4433-9c18-e9252bcf679d; cambio 1:1, recarga/regreso y video hacia el mismo UUID. El teleprompter recuperó el texto del post como guion inicial, sin sustituir guiones existentes. No se activó cámara ni publicación.
- Exportación de tres imágenes generada desde la UI. Sin comprobación de los tres archivos descargados en disco. Ancho real 361 px sin desbordamiento, controles de proporción de 44 px.
- TypeScript y build correctos; suite de 320 pruebas y prueba adicional de guion inicial correctas. IA por clic con revisión: sin llamada remota durante QA. Audio se adjunta como material privado; transcripción en el lienzo pendiente. Teleprompter/redimensionado de video pendiente de su próximo bloque y aprobación visual.
- Captura: docs/evidence/2026-10-27/studio-lienzo.png. Objetivo general incompleto. Esperar revisión de la usuaria antes del siguiente bloque.


### 2026-10-27 · Teleprompter aprobado y enlace móvil temporal
- Preparar / ensayar / grabar / revisar separados; ensayo sin elementos de cámara, proporciones 1:1, 4:5 y 9:16, cuenta regresiva, recorte compartido entre vista y archivo, toma anterior retenida hasta aceptar la nueva, portada por fotograma tras guardar. Guion IA por clic con revisión; no se llamó a Gemini durante QA.
- Overlay persistente con logo original y «Haciendo magia…» desde post a teleprompter, más alternativa de movimiento reducido.
- UI real a 360 px sin desbordamiento; lectura avanzó y pausó. Marco 276.04 × 490.73 px (9:16). 323 pruebas, TypeScript y build correctos. Captura/audio/Safari y subida de toma real aún requieren prueba física de la usuaria.
- Con autorización explícita se abrió Cloudflare Quick Tunnel para frontend compilado, proceso cloudflared sesión 75267, preview Vite sesión 49519 (127.0.0.1:4176). Dominio temporal removing-chain-benefits-mixer.trycloudflare.com. Inicio de sesión comprobado desde HTTPS; no se enviaron credenciales. No se cambió producción. Mantener procesos durante la prueba; el enlace depende de esta computadora.
- Captura docs/evidence/2026-10-27/teleprompter-ensayo.png. No se declara objetivo general completo. Esperar revisión antes del próximo bloque.


### 2026-10-27 · Guías y editor de video aprobados
- Guía del teleprompter por momento, un mensaje cada vez, Siguiente/Omitir/Ver guía; resalta el control correspondiente, permite Escape y recuerda la visita por cuenta/proyecto. Acciones Ensayar sin cámara e Ir a grabar antes del guion, con barra fija al desplazarse.
- Editor: toma → pausas → subtítulos → exportación. Detección local separada de aplicar; propuesta reproducible; controles de fragmentos recogidos; subtítulos de una frase por vez e importación SRT; encuadres 1:1,4:5,9:16 con vista previa y exportación real. Original intacto. Transcripción IA no presentada como activa porque su conexión de pago no está verificada.
- UI con archivo sintético: original 480×270, 2.966 s; detectó una pausa, se aplicó propuesta, se escribió subtítulo y se exportó 720×720. Archivo descargado y reabierto: 2.174 s, subtítulo visible. No se vinculó el archivo sintético a la pieza comercial editada por la usuaria.
- Vista móvil real 360 px sin desbordamiento. Pruebas 325/325, TypeScript, build y diff check correctos; correcciones finales de vista previa y guía verificadas en UI. HTTPS temporal sigue sirviendo la última compilación en removing-chain-benefits-mixer.trycloudflare.com, con login; no se cambió producción.
- Guardado de toma real/iPhone, prueba física de cámara y transcripción automática siguen pendientes. Capturas teleprompter-guia-inicial.jpg y video-editor-guia-movil.jpg en docs/evidence/2026-10-27. Esperar aceptación visual antes de otro bloque. Objetivo general incompleto.

### 2026-10-28 — Subtítulos automáticos y magia de Studio (bloque aprobado)
- Gemini conectado en toolkit-ai: audio WAV mono preparado localmente, hasta 180 s; propiedad de proyecto, cuota y caché antes de generar. No se activó otro proveedor ni se cambiaron secretos. Respaldo remoto en /tmp/foru-toolkit-ai-before.ts; despliegue descargado y SHA-256 idéntico al bundle local.
- Prueba real con voz sintética: cuatro frases temporizadas; propuesta → aceptar → corrección individual → exportación 9:16 descargada, 720×1280. No se guardó la toma sintética en la pieza del usuario.
- Logo original, partículas y onda perlada durante creación IA, guion y subtítulos; sin demora artificial ni sonido obligatorio; movimiento reducido.
- 330 pruebas pasan; TypeScript, build y diff check correctos. Ancho real 360 px sin overflow; controles de 44 px. Preview compilada actualizada.
- Pendientes: aceptación visual humana y prueba con voz real/iPhone. El objetivo global continúa incompleto; esperar revisión antes de otro bloque.
- Enlace HTTPS temporal renovado y login comprobado: https://standard-expressions-wrapped-demonstrated.trycloudflare.com . Cloudflared sesión 88846; preview existente puerto 4176. Depende de la computadora encendida.

### 2026-10-28 — Editor con línea de tiempo (bloque aprobado)
- Sustituida navegación por frases/pasos por vista previa, pistas VIDEO/SUBTÍTULOS, cursor, zoom y herramientas Recortar/Subtítulos/Formato. Miniaturas reales; toque para texto; arrastre de bloques y bordes con alternativa de teclado. Dividir/quitar/restaurar clips mantiene tiempos de la fuente y exportación existente.
- Descarga arriba, guardado privado opcional después; descargar finaliza cambios pendientes, editar de nuevo los activa. Sin cambio de proveedor, pago, publicación ni escritura en piezas reales. Planes S/49/99/199 son propuestas comerciales sin activar.
- QA real en toma sintética: transcribir → aceptar → corregir texto → arrastrar borde (2.8→2.5 s) → dividir en 3.4 s → quitar clip → exportar vertical. UI confirma descarga. Anchos reales 300 y 359 px sin overflow; seis miniaturas. Preview compilada actualizada.
- 333 pruebas pasan, TypeScript/build/diff check correctos. Pendiente aprobación visual e interacción en iPhone real. Objetivo global incompleto; no continuar otro bloque sin aprobación.

### Ampliación solicitada — plantillas y guía visual (pendiente de implementar)
Cuatro recorridos creativos: Conóceme, Mira cómo lo hago, Esta es mi oferta y Mi primera transición. Añadir 20 estilos visuales de texto reutilizables con colores/tipografía de la marca, elección inicial de tres recomendados y exploración opcional; vista previa sobre la pieza antes de aplicar. Tu marca compartirá logo/colores/fuentes entre post, portada y video, conservando originales. Guías de grabación superpuestas con flechas, trayectoria y una instrucción por toma; capa de ayuda excluida del lienzo grabado/exportado. No confundir animación de texto con sincronización palabra por palabra: hoy solo existen tiempos por segmento. Propuestas complementarias: favoritos, recordar estilo por proyecto, comparación antes/después y márgenes orientativos. No se consideran implementadas estas funciones por haberlas añadido al acuerdo.
