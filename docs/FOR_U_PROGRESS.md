# FOR U: registro de entrega

Actualizado: 2026-10-07. Ningún requisito se considera verificado por abrir una pantalla o compilar.

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
