# FOR U: registro de entrega

Registro consolidado: 2026-10-13. La tabla histórica de octubre 7 se conserva abajo; prevalece este resumen vigente. Ningún requisito se considera verificado por abrir una pantalla o compilar.

## Estado vigente — 13 de octubre

| Entrega | Estado | Evidencia y siguiente acción |
|---|---|---|
| 1. Espacio de trabajo y Hoy | implementada; validación remota entre cuentas pendiente | Base en c9111a6 y cierre separado: Continuar por proyecto, Hoy directo a herramienta, rechazo de proyecto inaccesible y revisiones conservadas. Pruebas controladas de transporte y conflicto real entre pestañas pasan. Segunda sesión autorizada no disponible; tablet comprobada a 767/769 por zoom, no 768 exactos. Ver cierre del 13 de octubre. |
| 2. Propuesta y servicios | pendiente | No existe flujo completo; catálogo por rubro reutilizable. Añadir después de cerrar entrega 1. |
| 3. Propuesta a página | pendiente | Editor amplio y catálogo Restaurante vinculados, publicación QA comprobada (octubre 9); vínculo limita ID/nombre/precio. Falta propuesta y catálogo completo. |
| 4. Perfil y piezas | pendiente | Contenido y guion por sección existentes; falta recorrido de perfil/pieza. |
| 5. Widgets publicados | pendiente | Falta autorización y lectura pública de secciones en servidor. |
| Gestión fiable | pendiente | Calendario/conexiones/métricas requieren recorrido real; reservas RPC ausente (PGRST202), diagnóstico remoto pendiente. |
| Pedidos, clientes, pagos y Meta | pendiente | Variantes/extras/carrito local verificados en QA (96 pruebas); no equivalen a pedidos/cobros internos. Cambios anteriores preparados en Git. |
| Mundo y experiencia emocional | pendiente | Componentes existentes, validación integral pendiente. |
| Hostinger | pendiente | No se ha verificado allí esta nueva entrega. |

La condición «tablero tras borrador» queda sustituida por gestión desde el inicio. Las comprobaciones de octubre 8–10 abajo actualizan la antigua tabla, sin convertir verificaciones parciales en entregas completas. Se conserva el historial y todo trabajo anterior.

## Tabla histórica — octubre 7

| Requisito | Estado | Evidencia actual | Siguiente acción |
|---|---|---|---|
| Studio contextual y rutas | en curso | Implementado Studio por proyecto, pasos contextuales y ruta canónica; 3 pruebas unitarias pasan | Validar sesión real, cambios de proyecto y tamaños |
| Editor amplio y contextual | en curso | Corregidos max-width/margin; accesos contextuales y apertura por paso | Corregir estilos y medir escritorio/móvil |
| Contenido inicial, propuestas y herramientas por sección | en curso | Conectados enlaces por sección; contenido y guion se guardan con claves por sección; prueba de aislamiento local pasa | Conectar contexto y comprobar guardado |
| Tablero tras borrador válido y navegación común | pendiente | Dashboard actualmente muestra CreatorStudio | Añadir condición basada en datos persistidos |
| Cinco rubros: crear/editar/guardar/recargar/publicar | pendiente | Hay módulos existentes; no revalidado en esta entrega | Probar cada recorrido sin cambiar datos del usuario |
| Catálogo público real | pendiente | PublicRestaurant ahora usa RestaurantMenu con site.menu validado | Validar catálogo real y adaptar diseño/pedidos internos |
| Pedidos mesa/recojo/delivery | pendiente | No hay evidencia de backend completo | Modelo aditivo, precios servidor, administración y seguimiento |
| Perfiles opcionales, favoritos e historial | pendiente | Sin evidencia de recorrido completo | Implementar permisos y compra invitado |
| Mercado Pago por negocio | pendiente | Proveedor elegido; credenciales no verificadas | Implementar sandbox y registrar requisitos de activación |
| Agentes y conversaciones | pendiente | Existen componentes y personalidades | Conectar proveedor real y persistencia por proyecto/área |
| Calendario completo | pendiente | Existe herramienta; falta validación funcional vigente | CRUD, zona local, vistas y exportación |
| Conexiones | pendiente | Dependencias remotas no verificadas | Revisar tabla, función, permisos y estados |
| Estadísticas | pendiente | Depende de RPC y eventos | Comprobar evento público hasta resumen privado |
| Tareas compartidas y conflictos | pendiente | Existe AreaDocuments | Validar CRUD, aislamiento y concurrencia |
| Mi mundo y mascotas | pendiente | Existe WorldPage | Auditar navegación, juego, premios, fallback y rendimiento |
| Diseño, brújula, Pomodoro y Pro | pendiente | Implementación previa parcial | Unificar y verificar comportamiento accesible |
| Compatibilidad y pruebas | pendiente | Mantener Vite4/Tailwind3/Node18-20 | TypeScript, build, pruebas funcionales y 360/768/1440 |
| Commits y Hostinger | pendiente | No hay despliegue verificado de esta entrega | Commits revisables y comprobar versión remota |

## Validación
- Implementación local: en curso.
- TypeScript: pasa tras las últimas modificaciones en Node 20, snapshot sincronizado /tmp/foru-step1-build.YxpVxL/frontend.
- Build Vite 4.5.3: pasa (7.88 s), sin errores GLIBC.
- Pruebas: 86/86 pasan, incluidas 3 nuevas del Studio y 1 de contexto por sección. No equivalen a validación end-to-end.
- Navegador: al recargar la versión nueva redirige a Login; se solicitó iniciar sesión sin compartir credenciales. Comprobación privada y responsive pendiente.
- La última validación incluye PublicRestaurant conectado al catálogo real, validación del borrador y herramientas por sección.
- Git diff --check sobre los archivos cambiados: pasa.
- No se ha verificado aún el diseño en navegador autenticado ni realizado cambios de datos del usuario.
- Despliegue Hostinger de esta entrega: no verificado.
- No se han aplicado migraciones remotas ni realizado cobros.

## Incidente de vista previa — 2026-10-08
- Causa confirmada: el snapshot temporal se compiló sin `.env`, por lo que el cliente Supabase era null. La redirección a Login no probaba que la sesión hubiera vencido.
- El `.env` del frontend real contiene URL y clave anon. No se mostraron valores ni se copiaron secretos de servidor.
- Restaurada configuración pública en el snapshot; recompilación desde el frontend real en curso.
- Añadida validación Vite para rechazar builds sin URL/clave pública.
- Validación visual, login reparado y build con esta protección: pendientes de comprobar.

### Supabase restaurado y primera revisión real
- Build con variables Supabase y TypeScript pasan (2026-10-08; build 7.98 s).
- Al recargar Login se restaura la sesión y carga el proyecto QA Restaurante MVP, sus tareas y su estado publicado desde Supabase.
- Editor medido a viewport 1440 px: iframe de escritorio 939 px frente a móvil 360 px.
- Studio sin desbordamiento a 360 y 1440 px; detectado desbordamiento a 767/769 px debido al mínimo de la sidebar. Corregido min-width; revalidación pendiente.
- La vista del navegador está a zoom 80%: los tamaños enteros de viewport dan 767/769 px alrededor de 768. No se afirma haber medido 768 exactos.

### Verificación final del incidente local
- Protección de build probada desde un directorio sin variables: rechaza la compilación con mensaje explícito antes de generar assets.
- Studio cargado con cuatro pasos: scrollWidth == innerWidth en 360, 767, 769 y 1440 px; corregido el desbordamiento de tablet.
- La sesión y los datos reales se recuperan automáticamente al cargar la compilación configurada. No hizo falta cambiar credenciales.
- Continúan pendientes la validación completa de cada rubro, edición persistente de esta entrega, pedidos/pagos y los demás requisitos del registro.

## 2026-10-09: conexión del editor Restaurante
- Detectado: RestaurantAdmin carga `module-restaurant` pero EditorCarta usa el contexto de ejemplo independiente; los cambios de platos no llegan al documento guardado.
- RestaurantWorkspace vuelve a utilizar ModuleWorkspace con RestaurantEditor, RestaurantDashboard y RestaurantPublishing, compartiendo un único documento, revisión y protección de formularios. Los componentes visuales anteriores se conservan.
- Añadida validación del documento: datos incompatibles muestran error sin sustituirlos por un restaurante vacío.
- Validación funcional de guardado/recarga: pendiente.

### Evidencia del recorrido Restaurante — 2026-10-09
- TypeScript y build pasan; 89/89 pruebas, incluidas validación de documento y progreso desde catálogo por rubro.
- En QA Restaurante MVP se cargó la demo (el catálogo estaba vacío), se guardó en Supabase y se recargó: permanecen clásico S/5, chocolate S/7 y coco S/6.
- Se editó chocolate a S/7.50, se aplicó el formulario, se guardó y se recargó: permanece S/7.50, sin duplicar el producto. Estos son datos QA; no se publicó el menú ni se cambiaron proyectos comerciales.
- El paso Presenta tu menú abre el editor correcto conservando el UUID. Ya no cuenta los textos de plantilla como oferta completa.
- Pendiente: unir explícitamente el catálogo del módulo con la landing visual; el catálogo guardado y `landing.menuItems` siguen siendo documentos distintos y no se declara resuelto.

### Catálogo vinculado a la landing
- Añadido un vínculo explícito en el editor visual: usar el catálogo guardado del proyecto, conservando el contenido anterior hasta que la usuaria elija reemplazarlo.
- El borrador conserva `catalogSource: module`. Publicar vuelve a consultar el catálogo guardado de la cuenta/proyecto y usa solo ID, nombre y precio; excluye datos de clientes, stock y costos.
- Si falla la consulta o el catálogo es inválido, la publicación no cambia. Límite actual explícito: 30 ofertas en landing, sin truncado silencioso.
- Pendiente de comprobar en navegador: importar, guardar, recargar y publicar la landing con el catálogo vinculado.

### Prueba integrada de catálogo y landing
- 91/91 pruebas, TypeScript y build (7.35 s) pasan tras conectar el catálogo.
- QA Restaurante MVP: se vinculó el catálogo (3 ofertas), se guardó, se recargó y se comprobó que la vinculación y los alfajores siguen en el iframe.
- Se publicó exclusivamente la landing QA `/s/qa-restaurante-mvp`; la página pública muestra clásico S/5.00, chocolate S/7.50 y coco S/6.00. No se alteraron textos previos ni datos de contacto.
- Pendiente detectado al revisar esa página: el componente público de reservas devuelve «No se pudo cargar la disponibilidad». No se considera resuelto por la publicación del catálogo; requiere revisar RPC/configuración de reservas y cuándo debe mostrarse.
- La conexión de catálogo está verificada para Restaurante; los demás rubros cuentan con pruebas del adaptador, pero todavía requieren recorrido real de publicación.

## 10 de octubre — contenedor visual claro
- Implementado: sidebar blanca, navegación activa con borde iridiscente, cabecera sticky translúcida con ubicación y selector, fondo gris suave y botones de marca con texto oscuro para contraste. Tokens encapsulados en el workspace para respetar el diseño de páginas públicas.
- Creator Studio reutiliza magic-card y magic-button-primary; cuatro iconos de pasos y un icono de orientación activo. Se eliminaron adornos repetidos, sin cambiar estados ni datos del proyecto.
- Verificación local: TypeScript, 91/91 pruebas y build pasan. En navegador, sidebar computada blanca y gradiente de acción correcto; Studio sin desbordamiento a 360/1440 px y ambos lados del breakpoint (767/769). El zoom actual del navegador impide medir 768 exactos con el control entero de viewport; no se afirma esa comprobación exacta.
- Acción comprobada: menú móvil → Calendario conserva UUID, cierra menú y actualiza ubicación; regreso a Mi proyecto conserva contexto.
- Alcance pendiente: revisión completa del resto de herramientas, tipografía y estados visuales; reservas públicas, pedidos, perfiles, pagos y demás verificaciones del plan siguen pendientes. Sin despliegue Hostinger en esta entrega.

## 10 de octubre — diagnóstico de reservas
- Evidencia remota de solo lectura: `public_reservation_slots(site_slug)` responde HTTP 404 / PGRST202: la función no está en el schema cache. No se afirma que exista ni que sea solo un problema de permisos.
- Agenda del negocio: se separaron carga, error y vacío válido, con reintento; no muestra cero reservas ante error, bloquea mutaciones con consulta fallida y limpia errores de carga tras éxito. Cambiar proyecto reinicia los datos visibles. Validación de fecha/cupos/duración antes de insertar.
- Disponibilidad pública: limpia horarios y selección al cambiar slug o fallar; sigue mostrando el error real, sin fabricar horarios.
- Comprobado con la cuenta QA: error real visible, reintento operativo, cero mensajes falsos de agenda vacía y botón Abrir horario deshabilitado. TypeScript/build pasan antes del ajuste final de breadcrumbs; se repiten tras ese ajuste.
- Próxima acción para servidor: ejecutar `supabase/diagnostics/reservations_schema.sql` (solo lectura) y comparar columnas, restricciones, RPC y políticas reales antes de preparar reparación. No se ejecutó la migración antigua 13 ni se cambió ningún permiso remoto. La confirmación de reservas y el correo permanecen sin verificar.
- Validación final de esta entrega: TypeScript y build vuelven a pasar con breadcrumbs corregidos para reservas y herramientas. Las 91 pruebas anteriores corresponden a la entrega visual; no se usan como prueba del backend remoto de reservas.

## 10 de octubre — presentaciones, extras y carrito de restaurante
- Estado: en curso hacia pedidos internos. El catálogo guardado admite presentaciones (precio absoluto) y extras (precio adicional por unidad), con UUID por opción. Los documentos antiguos sin opciones siguen siendo válidos.
- Editor: opciones plegables, nombres/precios/disponibilidad, guardado mediante el servicio existente con control de revisión. Publicación del módulo conserva las opciones y excluye campos privados arbitrarios.
- Carrito: líneas separadas por selección, notas, cantidades, retirada de líneas y total en céntimos desde el catálogo. Opciones desconocidas/duplicadas/no disponibles o cantidades inválidas impiden continuar. Se conserva explícitamente el canal WhatsApp; no se afirma que esto registre un pedido interno ni efectúe cobros.
- Evidencia: TypeScript, build y 96/96 pruebas pasan. Pruebas monetarias cubren sustitución de precio por presentación, extras por unidad, precios manipulados, cambios del catálogo, opciones inválidas y filtrado público.
- Navegador QA Restaurante MVP: añadido al Alfajor clásico «Caja de seis (demo)» S/28.10 y «Empaque (demo)» S/1.20; aplicar → guardar en cuenta → recargar → ambas opciones persisten. Carrito 3 unidades + extra + nota muestra S/87.90. Quitar elimina la línea. Sin desbordamiento a 360 px. No se publicó ni se envió mensaje/pedido.
- Pendiente: integrar catálogo completo con la landing /s (actualmente su vínculo usa ID/nombre/precio), backend de pedidos y cálculo autoritativo, modalidades mesa/recojo/delivery, seguimiento, perfiles y pagos. La cotización frontend no sustituye validación de servidor.
- El commit pendiente de reservas terminó: 099702b. Diagnóstico remoto de reservas sigue esperando resultados del SQL de solo lectura solicitado a la usuaria.

## 13 de octubre — entrega 1: proyectos y enfoque

- Implementación local: dashboard general con tarjetas de proyectos, progreso y continuar; Hoy guarda hasta tres referencias a tareas existentes, sin copiar títulos/estados. Las áreas abren el modal existente; el agente queda como ayuda secundaria. Creator Studio mantiene su ruta y ya no exige una landing para entrar en gestión.
- Tareas personalizadas: herramienta opcional, edición, selección para Hoy después de guardar. El resumen y los enlaces conservan proyecto, área y tarea. Navegar no completa pasos; el avance sigue calculándose desde las tareas compartidas.
- Preferencias privadas: formato versionado `module-workspace-focus` en toolkit_documents, filtrado por cuenta y con revisión. Se anclan a un proyecto propio guardado; futuros flujos de eliminación deberán preservar/migrar ese documento antes de eliminar su proyecto ancla. Formatos desconocidos o documentos duplicados muestran recuperación, sin reemplazarlos por valores vacíos. Errores conservan cambios y ofrecen guardar/reintentar o recargar explícitamente.
- Último trabajo: destinos internos validados; recordar área, tarea, Studio o herramientas de sidebar. Un segundo destino durante una escritura se conserva y guarda tras recibir la revisión; errores no producen reintentos automáticos infinitos.
- Consulta de proyectos: error explícito y reintento; proyecto solicitado ajeno/inexistente no se sustituye silenciosamente por otro. Borradores antiguos/pending permanecen en recuperación descargable. No se cambiaron UUID, publicaciones, catálogos ni esquema remoto.
- QA real: Tienda MVP añadió `Validar mi enfoque (QA entrega 1)` con Calendario; guardar → elegir para Hoy → abrir Calendario → cambiar a Hospedaje → inicio → recargar mantuvo selección. Completar reflejó el mismo paso en Hoy, sin duplicarlo. Edición posterior `Validar enfoque y recarga (QA entrega 1)` persistió tras recargar.
- Conflicto real: dos pestañas cargaron la tarea; una guardó la edición, otra intentó guardar una revisión anterior. La segunda mostró el conflicto y retuvo `Edición de pestaña anterior (QA)` en pantalla; recuperar trajo la versión válida. No se sobrescribió la nube.
- Creación real: `QA Enfoque sin página`, Hospedaje, UUID `eaabb4e2-e8e5-4253-a18e-a7264b73c9bd`; crear → tablero correcto → recargar → abrir Finanzas, sin landing. Escape cerró el modal y devolvió foco. URL con UUID no disponible mostró error y regreso a proyectos.
- TypeScript, 100/100 pruebas y build Vite 4.5.3 (9.96 s) pasan en Node 20.19.5. Validación en `/tmp/foru-delivery1/frontend`; versiones de dependencias existentes iguales al lock original, sin modificar dependencias del repositorio. El runtime del equipo es Node 24; no se usa como evidencia de compatibilidad Node 20.
- Responsive del inicio: scrollWidth == innerWidth en 360, 767, 769 y 1440 px. Limitación conocida: zoom del navegador 80% y viewport físico entero impiden 768 exactos. Se restauró el tamaño al terminar. Evidencia: `/tmp/foru-delivery1/dashboard-delivery1.jpg`.
- Pendientes de cierre de validación: 768 exactos, fallo de red controlado y aislamiento remoto entre dos cuentas (solo hay una sesión autorizada en esta prueba). La comprobación del UUID ajeno/inexistente no sustituye probar RLS con otra cuenta. El control de revisión sí fue comprobado contra Supabase real.
- Estado de entrega 1: implementación y recorrido principal verificados localmente; continúa en curso por las comprobaciones anteriores. Hostinger no desplegado/verificado. Entregas 2–5 y posteriores conservadas, sin implementarlas en esta instrucción.
- Commit anterior de opciones/carrito cerrado por separado: `f322d98`. No se publicaron páginas ni se enviaron pedidos/mensajes en estas pruebas.
- Comprobación final del último trabajo: sidebar móvil → Calendario del nuevo Hospedaje → inicio; Continuar recupera `/dashboard/tools/calendar?project=eaabb4e2-e8e5-4253-a18e-a7264b73c9bd`. Validado sobre la compilación final, después de recargar.

## Cierre de entrega 1 — 13 de octubre de 2026

- Se reutiliza c9111a6 sin sustituir archivos ni reescribir commits. Git estaba limpio al empezar. No se modificaron dependencias, SQL, URLs, borradores ni publicaciones.
- Preferencias v2: destinos por UUID de proyecto. La lectura v1 conserva el formato; solo un cambio explícito traslada su último destino y conserva las referencias de Hoy. Los formatos inválidos se rechazan sin reemplazarlos.
- Hoy abre directamente una herramienta vinculada; los pasos sin herramienta abren el detalle para editar/asignar. No completa tareas al navegar. El proyecto activo se sincroniza en las rutas privadas, incluido el creador visual.
- Una URL de proyecto no disponible impide montar una herramienta de otro proyecto. Error visible y regreso al inicio; reintento de consulta si falló la carga.
- Guardado mantiene CAS por usuario/proyecto/tipo/revisión. Las pruebas usan la misma frontera de persistencia de producción con transporte controlado: fallo de lectura, fallo de escritura, reintento, revisión obsoleta y duplicado inicial; no equivalen a desconectar la red del navegador ni a verificar RLS entre cuentas.
- Sesión real Supabase: Hoy abre Calendario de QA Tienda MVP; el selector cambia al proyecto correcto. Tras trabajar en QA Enfoque sin página y recargar, Continuar conserva Calendario para Tienda y Creator Studio para Hospedaje. Su página sigue sin crearse.
- Se reabrió la tarea original «Validar enfoque y recarga (QA entrega 1)», se guardó y tras recarga Hoy muestra Pendiente con la misma referencia (1/3). Su creación, edición, vínculo y selección están documentados en la prueba previa de esta entrega.
- Conflicto repetido en dos pestañas reales: la primera guardó Calendario; la segunda intentó Creator Studio con una revisión anterior, mostró error y conservó su enfoque pendiente. Al recargar la primera, Continuar seguía en Calendario. La segunda recuperó explícitamente el enfoque guardado y se cerró.
- Inicio y modal de Marketing: sin desbordamiento horizontal a 360, 767, 769 y 1440 px. El zoom 80% y el requisito de dimensiones enteras del navegador impiden obtener 768 exactos; no se declara esa medición.
- Entorno: Node 20.19.5, configuración pública Supabase comprobada por build protegido y sesión real. Snapshot temporal sincronizado desde el repositorio para evitar lecturas lentas de iCloud. Vista previa 127.0.0.1:4173 sirve su build nuevo.
- Validación final: TypeScript, suite 104/104, build Vite 4.5.3 y diff --check. La compilación macOS no demuestra compatibilidad GLIBC del servidor Hostinger.
- Límites: aislamiento remoto entre cuentas pendiente por falta de segunda sesión autorizada; despliegue Hostinger pendiente. No se avanzó a entregas posteriores. El documento de enfoque sigue anclado a un proyecto propio: cualquier futura eliminación de ese proyecto deberá proteger/trasladar las preferencias antes de borrar.

## Entrega 2 — Mi propuesta y publicación — 13 de octubre de 2026

- Mi propuesta accesible desde tablero, Marketing, sidebar y Creator Studio, con proyecto activo y gestión sin landing. Tres pasos revisables; no se solicita cambiar el rubro. Producto, servicio y paquete pueden coexistir; cotización usa precio null, campo vacío no equivale a cero y Gratis es explícito.
- Documento privado `module-proposal` v1 con referencias a catálogos originales y ofertas complementarias guardadas una sola vez. Productos nuevos representables en restaurante/tienda se guardan mediante sus modelos existentes. Editar su precio modifica el catálogo original; una operación parcial distingue catálogo guardado de selección pendiente. Formatos desconocidos se rechazan, sin conversión automática.
- Preparación selectiva: título, descripción, contacto, condiciones y ofertas. Conserva dirección, imágenes, bloques y textos no elegidos. Guarda revisiones de propuesta/catálogo; cambios señalan revisión. El editor no mantiene un segundo precio editable para ofertas vinculadas.
- Publicación: consulta las fuentes guardadas antes de publicar, revisión explícita si cambiaron, instantánea pública con fotos/descripciones/tipos/condiciones/presentaciones/extras. Excluye costos, stock, propuestas privadas y metadatos de revisión. Reutiliza preparación de imágenes con validación de propiedad; el borrador conserva referencias privadas.
- Comparación condicional de publicación mediante columnas existentes (slug, published, content), cuenta y proyecto. Conflicto o resultado incierto exige consultar estado antes de reintentar. No SQL, no migraciones, no cambios de UUID ni dependencias. Páginas antiguas siguen leyendo menuItems. Agenda de reservas opcional en páginas nuevas; backend de reservas sigue pendiente y no se declara reparado.
- QA Studio4U · Propuesta: UUID `135fcc67-e2e5-4d2d-be7e-d290caf98605`, slug `qa-studio4u-propuesta`. Café/alfajor con fotos placeholder y precios técnicos; presentación Caja QA de 6 y extra Empaque QA. Guardar → preparar → editar título manual → guardar/recargar → publicar. Cambiar café 5 a 6 en catálogo y mensaje privado conservó publicación anterior en 5 y título manual. Aplicar solo ofertas mantuvo título; Publicar actualizó a 6 mediante CAS real.
- QA Marketing4U · Propuesta: UUID `46d5279b-bcd6-4929-acc6-b09e616f11da`, slug `qa-marketing4u-propuesta`. Rubro orientativo Tienda conservado; servicio y paquete por cotizar, sin inventar precio ni forzar nuevo rubro. Propuesta/página guardadas y publicadas; recarga conserva contexto separado. Studio4U/Marketing4U reales no se modificaron.
- Lectura anónima real de ambos slugs con RPC toolkit_public_site y clave pública, sin sesión de usuario: dos ofertas, precios correctos, servicio/paquete null, título manual y opciones preservados, sin propuestaSource privado. No equivale a despliegue Hostinger.
- Conflicto real de propuesta: dos pestañas cargaron revisión; una guardó, la antigua mostró “Esta herramienta cambió en otra pestaña” y conservó su texto pendiente. La confirmación nativa de recuperación bloqueó el control del navegador; la recuperación de esa pestaña antigua sigue sin verificar. Se sustituyó la confirmación nativa en Mi propuesta por un aviso dentro de la página, con conservar cambios o descartar explícitamente; el aviso antiguo sigue bloqueando interacciones de prueba.
- TypeScript, 115/115 pruebas y build final Vite 4.5.3 (8.04 s) en Node 20.19.5. Pruebas relevantes de formato, precio explícito, catálogo original, ofertas públicas, preparación selectiva, JSONB con distinto orden de claves, lectura/escritura fallidas, reintento y conflicto de publicación sobre fronteras de persistencia de producción con transporte controlado. No equivalen a desconectar red real.
- Límites: segunda cuenta autorizada ausente (RLS entre cuentas remoto pendiente); Hostinger fuera de esta entrega. Para negocios reales faltan fotos, contacto, precios y condiciones confirmados por la propietaria. No perfil social, widgets ni pagos.

- Responsive final del formulario inicial: sin desbordamiento horizontal en 360, 767, 769 y 1440 px (scrollWidth igual a innerWidth). Zoom 80% impide 768 exactos. Los pasos de ofertas y preparación funcionaron en escritorio antes del aviso nativo bloqueado; la revisión interactiva final de esos pasos en móvil permanece pendiente. Se restaurará el viewport; evidencia de publicación de servicios en `/tmp/foru-delivery1/proposal-public-proof.jpg`.
- Estado: implementación, dos recorridos de publicación QA y lectura anónima terminados; cierre de validación parcial por confirmación antigua bloqueada, responsive interactivo restante y segunda cuenta. Vista previa sirve la compilación final. Hostinger no desplegado.

## Cierre de validación interactiva de entrega 2 — 13 de octubre de 2026

- Tras la respuesta de la propietaria, el navegador volvió a responder en una sesión nueva. Se comprobó edición de servicio por cotizar en 360 px, cancelación sin guardar y preparación selectiva de la página. Sin desbordamiento horizontal del panel de revisión en 360, 767, 769 y 1440 px; 768 exactos sigue limitado por zoom 80%. Viewport restaurado.
- Recuperación real con el aviso interno de la compilación final: dos pestañas cargaron QA Marketing4U; la primera guardó «Versión recuperable QA. Solo prueba técnica.». La segunda conservó su texto antiguo después del conflicto; Recuperar mostró opciones dentro de la página. Descartar pendientes y recuperar trajo exactamente la versión válida y volvió a permitir preparar página, sin confirmación nativa ni bloqueo. Ningún cambio fue publicado.
- Quedan cerrados el bloqueo operativo y el responsive interactivo que figuraban pendientes en la entrada anterior. Se conserva la limitación de tamaño exacto y el aislamiento remoto entre cuentas pendiente por falta de segunda sesión autorizada. El despliegue Hostinger sigue fuera de esta entrega.
- Implementación: commit `e77a7cb`; este cierre añade evidencia, sin cambios de código ni repetición innecesaria del build/suite ya aprobados. Vista previa final disponible. Evidencia: `/tmp/foru-delivery1/proposal-final-proof.jpg`.

## Entrega 3 — Mi perfil y piezas de contenido — 13 de octubre de 2026

- Mi perfil accesible desde sidebar, Marketing y Creator Studio, sin landing previa. Maqueta editable de foto, nombre, bio y enlace, destacados con portada y tres publicaciones principales; el contenido orgánico aparece después. Editor de datos del perfil plegable para mantener visible la maqueta. Se puede reordenar principales y pasarlas a orgánico sin eliminar la pieza.
- Documento privado `module-social-profile` v1 por usuario/proyecto, mediante toolkit_documents y CAS existentes. Contiene perfil y piezas con UUID, objetivo, texto, guion, lista de tomas, fecha local, estado y referencias de archivos. Rechaza formatos desconocidos, referencias ajenas, principales duplicadas y piezas inexistentes; no migra documentos antiguos. Fallos conservan campos visibles; recuperación explícita dentro de la página.
- Diseño guardado una sola vez en module-content-creator con el UUID de la pieza. El creador y las plantillas respetan esa identidad; el texto de la publicación permanece en la pieza (lectura de referencia en el creador). Un cambio de proyecto limpia el identificador de pieza en el creador; herramientas de guion se montan por pieza para no heredar estado anterior. Los diseños anteriores sin pieza se conservan.
- Teleprompter carga y guarda el guion en la pieza original; conserva enlaces de regreso con project/piece, protege cambios pendientes y mantiene lectura/velocidad existentes. No activa cámara ni micrófono automáticamente.
- Biblioteca agrupada por proyecto/pieza; adjuntos referencian rutas de user-uploads bajo cuenta/proyecto y no URLs firmadas persistidas. Fotos existentes reutilizables mediante MediaGallery. Subir y guardar vínculo son operaciones distintas con estados explícitos. Desvincular no borra el archivo. Fotos, MP4/WebM, MP3/WAV y PDF hasta 20 MB sujetos a permisos/capacidad del bucket existente; solo JPEG comprobado remotamente en este recorrido. No se anuncia cuota Pro nueva ni se aplica SQL.
- Instagram no conectado: los estados son de planificación; “Marcada publicada por mí” es manual y sin verificación. No se publica en Meta ni se afirma que guardar bio actualiza el perfil externo. Se ocultan sugerencias genéricas de agentes al diseñar una pieza vinculada.
- QA remoto en QA Marketing4U · Propuesta (`46d5279b-bcd6-4929-acc6-b09e616f11da`), pieza `c3887e05-fd38-439d-b3fc-d3e7783aac49`: guardar bio, nombre, enlace, foto placeholder y destacado; publicación con objetivo/texto/guion/tomas/estado; adjuntar imagen de prueba del repositorio. Guardar → teleprompter carga guion correcto → editar/guardar → regresar → creador guarda diseño → regresar/recargar conserva guion, material y diseño. Elegir plantilla reutiliza misma pieza y permite guardar/regresar. No se modificaron negocios reales ni páginas publicadas.
- Separación real entre proyectos: cambiar a QA Studio4U muestra perfil vacío, sin datos ni piezas de Marketing4U; volver recupera su publicación. Pruebas de modelo verifican cuenta/proyecto, material, lectura compatible versionada, referencias inválidas y conservación de otras piezas al editar un guion. Segunda cuenta remota sigue pendiente.
- Validación: TypeScript y suite 120/120 en Node 20.19.5; Vite 4/Tailwind 3 sin nuevas dependencias. Responsive del perfil y pieza sin desbordamiento a 360, 767, 769 y 1440 px; 768 exactos sigue limitado por zoom 80%. Build final y evidencia visual registrados al cerrar.
- Límites: no publicación real Instagram, sincronización con Meta, nueva cuota de almacenamiento, despliegue Hostinger ni prueba remota de todos los MIME. Los formatos rechazados por el bucket muestran error, sin anunciar archivo guardado.

- Cierre técnico: TypeScript, 120/120 pruebas, diff --check y build final Vite 4.5.3 (7.51 s) pasan en Node 20.19.5 sobre snapshot temporal sincronizado. La vista previa 127.0.0.1:4173 sirve esa compilación. Edición plegable del perfil comprobada a 360 px en compilación final; viewport restaurado. Evidencia: `/tmp/foru-delivery1/social-profile-proof.jpg`.

## Entrega 4 — Widgets de proyectos publicados — 13 de octubre de 2026

- Editor visual: bloque “Mostrar otro proyecto”, selección de oferta o sección, previsualización, contenido con CTA o tarjeta con enlace, reordenación y retirada de referencias. Máximo ocho widgets v1. Se guardan referencias por UUID, no copias de ofertas ni precios. No cambia identidad, menú, fotos, textos ni dirección del anfitrión. Los CTA de previsualización abren otra pestaña para conservar el editor.
- Actualización: lectura de última publicación fuente al cargar y cada 30 segundos con página visible, además de al recuperar foco. Borradores no afectan widgets. Fuente retirada, sección eliminada o permiso revocado devuelve contenido no disponible, sin CTA ni contenido almacenado anterior. Fallo de consulta muestra error/reintento, sin fingir ausencia de fuentes ni conexión exitosa.
- Server: migración aditiva UUID 22_project_widgets_uuid.sql con comprobación inicial de tipos reales, sin convertir IDs ni borrar datos. Funciones autenticadas de descubrimiento/previsualización comprueban propietario del anfitrión; función pública resuelve referencias de una página publicada y solo devuelve campos públicos seleccionados. Nunca lee propuestas, catálogo privado, clientes ni costos. Rechaza URLs privadas temporales de Supabase.
- Permisos: proyectos del mismo propietario pueden conectarse; otra cuenta requiere grant explícito fuente/destinatario, creado y revocado por propietario de la fuente con RLS. El editor incluye gestión por UUID del destinatario. Publicación REST protegida con trigger que comprueba propietario, autorización, fuente publicada y ciclos, con bloqueo transaccional para serializar cambios del grafo. No renderiza widgets anidados. Conserva CAS de publicación y revisiones existentes; retirada del vínculo no borra fuente ni su permiso.
- PostgreSQL aislado: 6/6 pruebas ejecutan la migración real con dos cuentas y roles anon/authenticated. Verifican permisos de RPC/tabla/helper, rechazo de referencias ajenas y anfitrión falsificado incluso con FK permisiva, grant/revocación, ausencia de datos privados, independencia del borrador, actualización por publicación, retirada de fuente/sección, conservación de fuente tras quitar conexión y ciclos. No equivalen a RLS remoto ni a concurrencia real de varias conexiones.
- Frontend: TypeScript, 124/124 pruebas y build Vite 4.5.3 (6.79 s) en Node 20.19.5. Pruebas nuevas de referencias versionadas, conservación de identidad, precio por cotizar, whitelist, enlaces seguros, fuentes ausentes, compatibilidad antigua y exclusión de widgets anidados. Sin nuevas dependencias de la app; PostgreSQL/WASM instalado solo en carpeta temporal para pruebas.
- Vista previa real QA Studio4U (`135fcc67-e2e5-4d2d-be7e-d290caf98605`): bloque visible, error recuperable al consultar el servicio remoto, recarga conserva título manual y café/alfajor/opciones originales. Formulario sin desbordamiento a 360, 767, 769 y 1440 px; 768 exactos limitado por zoom 80%. Viewport restaurado. No se guardaron conexiones ni se alteraron publicaciones reales o QA en esta prueba.
- Activación remota pendiente: no hay CLI/sesión de despliegue Supabase disponible. Se preparó diagnóstico solo lectura project_widgets_schema.sql y se solicitó a la propietaria ejecutar el archivo UUID completo. La consulta del editor sigue fallando; no se declara activo ni completado el recorrido público Studio4U → Marketing4U. Tras confirmar activación: añadir widget en QA, guardar/recargar/publicar, lectura anónima, cambiar publicación de fuente, retirarla temporalmente/restaurarla y quitar vínculo sin borrar fuente.
- Estado: código y validación local preparados; entrega en curso por activación y QA remotos. Hostinger permanece pendiente. Evidencia del editor: `/tmp/foru-delivery1/widgets-editor-pending.jpg`.
