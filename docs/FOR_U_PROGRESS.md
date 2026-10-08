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
