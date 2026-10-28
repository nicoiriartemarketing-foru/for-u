

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
