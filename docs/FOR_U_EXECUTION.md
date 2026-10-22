# FOR U — Registro de ejecución de los 16 objetivos

Actualizado: 22 de octubre de 2026. **Autorización vigente: ejecutar tres entregas completas; una pregunta a la vez. Entrega 1 en curso.** La autorización vigente permite continuar las tres entregas; los 16 objetivos son la lista interna, sin nuevos permisos entre avances. Especificación: [maestra](FOR_U_MASTER_SPEC.md); detalle de aceptación: [155 requisitos](FOR_U_REQUIREMENTS.csv); diagnóstico: [base](FOR_U_BASELINE.md).

## Estados y criterio de cierre

- `pendiente`: destino aceptado pero no trabajado/cerrado en esta secuencia.
- `en curso`: trabajo del objetivo activo, todavía sin cierre.
- `implementado`: código o documentos preparados; falta su verificación completa.
- `comprobado`: la aceptación de ese requisito/objetivo está probada con evidencia de alcance suficiente. Documentación comprobada no significa producto comprobado.
- `pendiente de aprobación visual`: recorrido técnico/muestra listo, se necesita decisión explícita de la propietaria.
- `bloqueado externamente`: falta una condición externa concreta, su evidencia, responsable y acción. Usar por subrecorrido; seguir trabajo independiente.

Registrar además evidencia de código, prueba local, transporte controlado, SQL aislado, sesión remota, teléfono físico, versión desplegada y aprobación visual por separado. No convertir un dato histórico en prueba actual. Un objetivo puede tener comprobaciones técnicas y revisión visual pendiente: se informa ambas y no se llama acabado globalmente.

## Orden, dependencias y estado actual

| Objetivo | Resultado | Dependencia | Estado de esta secuencia | Prueba/cierre |
| --- | --- | --- | --- | --- |
| 01 | Acuerdo, matriz, base y registro persistentes | Instrucción actual | comprobado | Auditoría documental A01–A10 y FOR_U_AGREEMENT_AUDIT.json |
| 02 | Maqueta actualizada y recorrido aprobado | 01 | comprobado | Base aprobada explícitamente el 21 octubre: «Sí, apruebo la base; continúa». No aprobación global del producto. |
| 03 | Datos compartidos y navegación | 02 **aprobado explícitamente** | comprobado | FOR_U_OBJECTIVE_03_AUDIT.md: dos proyectos QA, recarga, referencias, 360/768/1440, TypeScript y build. Alcances posteriores y prueba física separados. |
| 04 | Bienvenida, persona y proyecto | 03 | pendiente | Omitir/manual/retomar y audio privado |
| 05 | Diagnóstico adaptativo de cuatro áreas | 04 | pendiente | Respuestas cambian recomendaciones sin bloqueos |
| 06 | Ruta y resultados derivados | 05 y contratos03 | pendiente | Síntesis, diferencias, idempotencia y vistas compartidas |
| 07 | Páginas/editores de seis rubros | 03,06; diseño02 | pendiente | Edición directa, recursos, guardado/publicación separada |
| 08 | Ofertas y landings específicas | 07,contratos03 | pendiente | Oferta→landing propia sin duplicar catálogo |
| 09 | Campañas, plantillas, piezas | 08 | en curso | Tres composiciones, variantes, exportación real |
| 10 | Perfil, destacados, organización | 09 | pendiente | Referencias/grid/calendario/biblioteca sin duplicación |
| 11 | Guion, grabación y portada | 09,10 | pendiente | Medios reales vinculados a pieza; físico pendiente separado |
| 12 | Gemini real y material interpretado | Contratos03,flujos04/09/11; X01 para proveedor | pendiente | Respuesta real y aceptación sin mutación automática |
| 13 | Operación especializada | 07,08; X04/X06 solo donde aplique | pendiente | Resultado disponible por cada rubro, costos/pedidos reales QA |
| 14 | Resto de herramientas integrado | 03–13 según herramienta | pendiente | Matriz de accesos recorrida, estados y retorno |
| 15 | Validación transversal | Implementación anterior; X02/X03 para remota/física | pendiente | Seguridad, red, conflictos, móvil, teléfono y renderer |
| 16 | Demostración/cierre integral | 01–15 | pendiente | Auditoría de matriz, aceptación técnica/visual y externos |

La base ya existente NO vuelve estos objetivos completos. No volver a implementar lo que pueda conservarse; cada entrega empieza por sus IDs y B de la matriz, adapta y comprueba el nuevo destino.

## Contratos copiables de trabajo

### 01 — Acuerdo completo y trazabilidad

Guardar especificación, fuente íntegra, matriz requisito/objetivo/pantalla/datos/prueba, registro e inventario de base/discrepancias. Conservar todos los requisitos compatibles del plan integral y personalización. Solo documentos; sin aplicación/Supabase.

Aceptación: cobertura de todas las secciones, fuentes identificables, estados honestos y auditoría de archivos/enlaces; siguiente trabajo objetivo02, no implementación real.

### 02 — Actualizar la maqueta integrada

Actualizar la maqueta existente, no empezar otra inconexa: tres entradas, persona/proyecto, preguntas adaptativas de cuatro áreas, resumen corregible, preparación real ilustrada y resultados diferenciados. Página y oferta con landing propia; campaña→intención/oferta→tres propuestas→pieza→guion/video→perfil/destacados; cuatro vistas visibles y seis rubros. Probar sin materiales, principiante y negocio existente en360/768/1440.

Aceptación: cada recomendación entendible y derivada de elecciones; simulaciones identificadas; entregar para revisión de la propietaria. **Detener extensión a app hasta aprobación explícita.** Base aprobada explícitamente el 21 octubre: «Sí, apruebo la base; continúa». No aprobación global de la aplicación.

### 03 — Datos compartidos y navegación

Tras02aprobado, definir contratos/versiones para cuenta/diagnóstico/ruta/propuesta/oferta/página/campaña/pieza/perfil/materiales/costos, reutilizando repositorios. Separar cuenta/proyecto y conservarUUID/URLs/histórico; lectura compatible y mutación explícita. Implementar cuatro vistas, cinco espacios, retorno, Hoy/Continuar; estados/revisiones/guardado parcial y recuperación. No crear segundo catálogo/sesión.

Aceptación: dos proyectos sin mezcla, recarga y referencias correctas, formatos desconocidos rechazados; acceso sin página/guía. B02/B04/B13/B18 expresan ampliaciones necesarias, no permiso de migración automática.

### 04 — Bienvenida y persona

Recursos originales saltable/carga paralela/una apertura/sonido opcional/reduced-motion. Entradas ruta/explorar/manual. Una pregunta con explicación, opciones y texto/audio voluntarios; nombre/trato separados de proyecto/rubro/momento/equipo/antigüedad/origen/propósito/horizonte/público/objetivo. Guardar al continuar, omitir/volver/retomar. Audio privado90s, escuchar/descartar/reintentar por clic; no IA automática ni material obligatorio.

Aceptación: completar, omitir, error, reintentar y recargar sin duplicar ni perder; preferencias no inferidas. La guía no duplica datos comerciales canónicos.

### 05 — Diagnóstico adaptativo

Implementar todas las preguntas/opciones de secciones5–6 del maestro y situación existente de4. Marketing primero; otras áreas opcionales después. Selección múltiple cuando aporte. Adaptar recomendaciones a comodidad, límites, recursos, herramientas, tiempo, fricción y canal. Orgánico/anuncios sin gasto; presupuesto/periodo opcionales, ejemploS/10 sin garantía; recordatorios opt-in.

Aceptación: los cinco casos de personalización M12 y variantes por rubro cambian ruta; ingresos no fijan nivel/acceso, omisión no insiste ni inventa.

### 06 — Preparación, mapa y vistas

Resumen corregible→Preparar mi espacio mediante reglas versionadas. Ruta/etapa, estructura de página, tareas con motivo y aceptación/posponer/quitar, Studio/perfil/operación pertinentes; fechas solo aceptadas. Progreso real sin espera ni IA automática. Mapas hechos/tareas/resultados; foco móvil; Kanban/Mundo/Calendario mismas referencias. Cambios posteriores muestran diferencias y no borran trabajo aceptado.

Aceptación: dos diagnósticos generan resultados distintos; repetir no duplica; responder no completa. Acceso manual conservado y Hoy hasta3. Medir después objetivo de primera estrategia en10min sin promesa comercial.

### 07 — Editores y páginas profesionales

Página como superficie directa en seis rubros; barra/selección/textos/imágenes/ofertas/CTA/secciones/miniaturas/orden/historial. Fotos por biblioteca/subir/encuadrar, URL secundaria, drag por destino y alternativa táctil. Propuesta canónica y diferencias selectivas. Sin fotos composición tipográfica; orientaciones no publicables, ningún dato inventado. Conservar catálogos/variantes/extras/widgets/URLs y puente validado. Comparación/presentación pública versionada/republicación explícita.

Aceptación: cada rubro edita texto/foto/CTA/oferta/sección, ordena, guarda y recarga; mantiene publicación anterior y datos privados; móvil real. No basta profesionalizar el editor genérico dejando otros intactos.

### 08 — Oferta y landing específica

Oferta de beneficio/paquete/descuento ligada a catálogo: precio/condiciones/vigencia/modalidad/público/mensaje/CTA/límite confirmado. Página principal y múltiples landings de oferta independientes, borrador/publicación y campaña/piezas relacionadas. Precios validados en servidor y sin activar por diagnóstico.

Aceptación:2x1caféQA y otra oferta con landings propias, recarga/cambio/publicaciónQA explícita sin sustituir principal o duplicar productos; términos válidos y sin publicidad real.

### 09 — Creator Studio conectado

Campañas/Crear/Perfil/Biblioteca. Campaña con objetivo/oferta/periodo/referencias, pieza suelta permitida. Seis momentos comerciales; intención/oferta/comodidad/campaña antes del formato. Tres composiciones distintas desde idea/sección/oferta/página por reglas y recursos confirmados. Capas/logo/CTA, variantes/historial/deshacer, carrusel/grupo, formatos1:1/4:5/9:16 y exportación real con desbordamiento. Fuente/revisión/cambios sin sobrescribir.

Aceptación: campaña→oferta→plantilla→pieza→guardar/recargar/exportar; repetir sin fotos/campaña y comprobar misma fuente/UUID. Ningún texto de orientación termina como oferta real por error.

### 10 — Perfil y organización

Identidad editable; tres principales Conóceme/Conversemos/Oferta recomendadas sin bloqueo. Miniaturas reales y portadas reel; encuadregrid independiente. Destacados por rubro con nombres/portadas/material. Cuadrícula/lista/calendario y filtros campaña/momento/estado; ordenar por drag/botones sin modificar fechas; biblioteca multimedios por proyecto/pieza.

Aceptación: reordenar/guardar/recargar/abrir pieza conserva referencias; datos iguales en calendario; nada afirma modificarInstagram. No exigir diez contenidos antes de trabajar.

### 11 — Video de este post

Misma pieza: guion/tomas manuales o IA explícita→ensayo/teleprompter→grabación por acción/permisos→revisión/repetición→portada vertical o fotograma→archivo/formato real/biblioteca. Cropgrid separado. Reutilizar recorte/subtítulos/exportación comprobados; no mantener solo estado en memoria.

Aceptación: post/guion/video/portada sobreviven recarga y cambio de herramienta; permisos denegados/interrupción/reintento sin pérdida. FísicoSafari por separado. Montajes/video generativo/transiciones avanzadas quedan futuros.

### 12 — Gemini real y materiales

Revalidar configuración/secreto/cuota/modelo sin exponer claves. toolkit-ai autenticado y referencias/revisión autorizadas; operaciones separadas/schemaJSON/validación para ideas/contenido/layout/guion/página/tarea/material y transcripción revisable. Hasta10ideas, tarea<=3pasos/icono permitido/estimación explícita/sinXP. Contexto acotado, cuota/caché5min y exclusión de duplicados; no llamada al navegar/escribir/adjuntar/grabar; aceptación antes de aplicar.

Aceptación: respuesta del proveedor real y pruebas de permisos/contextoajeno/JSON/promptmalicioso/cuota/reintento; manual sigue funcionando. Logs solo uso, no texto/secretos; sin facturación/fallbackpagado/imagen/cachépagada. SiX01 falta, cerrar solo partes comprobadas y continuar independiente, sin declarar IA funcional.

### 13 — Operación por rubro

Restaurante menú→carrito/pedido→preparación/entrega/seguimiento; modalidades/horarios/zonas/tarifas y precio servidor. Compras de insumos/costos privados ligados a plato/receta/ingrediente/unidad/rendimiento; directo confirmado, incompleto visible, margen no utilidad, compra idempotente y preparación existente conservada. No confundir compra de insumos con commerce_orders.

Tienda pedidos/clientes/entrega; turismo salidas/cupos/reservas; hospedaje solicitudes/disponibilidad; cursos materiales/acceso real; servicios cotización/seguimiento. Preservar MercadoPago separado de ejecución, cotizaciones/versiones, política del negocio, anonimato/token y reintento. Correo separado de reserva.

Aceptación: resultadoQAporseisrutas y controles de precio/permisos/duplicado; capacidad incompleta reparada o identificada; sin proveedor inventado ni cobro real. X04/X06 no bloquean interfaz/operación manual independiente.

### 14 — Toda herramienta integrada

Recorrer la cobertura de App y herramientas y extender el patrón aprobado a registro/login/legacy/públicas/proyectos/propuesta/calendario/resultados/conexiones/cobros/automatizaciones/configuración/ayuda/Pomodoro/Mundo. Contexto, guardado y retorno en cada una; URLs antiguas siguen válidas. Ayuda preparada sinIA; ideas separadas y conversión explícita; recordatorios con consentimiento. Datos de métricas y conexiones tienen carga/vacío/error/pending/vencido diferentes. No fakezero/autoconexión/autopublicación.

Aceptación: cada fila de cobertura tiene ubicación nueva y prueba; sin acceso huérfano ni rubro incorrecto. Carita/timer no cubren contenido y operación de descanso no modifica tareas.

### 15 — Validación transversal

Comprobar teclado/foco/modales/contraste>=4.5/targets44/reduced-motion/alternativasdrag, safeareas/teclado/zoom/orientación; anchosCSS360/768/1440. FísicoiPhone16Safari enHTTPS para audio/cámara/video/exportación. Dos proyectos, cambioscuenta/red/reintento/parcial/conflicto real/formatos/compatibilidad/permiso/preciomanipulado/públicoanónimo; segunda sesión autorizada para aislamiento remoto. Mi mundo alternativo/renderer60s si cambia, preservar recompensas/logros/timer.

Aceptación: evidencia por alcance y fallos corregidos; fixtures y emulación etiquetados, no sustituyen proveedor/físico/remoto. Checks TypeScript/pruebas/build proporcionales con Vite4Tailwind3Node18/20. SQL nuevo solo diagnóstico y ensayo aislado antes de autorización aplicable.

### 16 — Cierre del recorrido y auditoría completa

Revisar matriz y resolver omisiones. Recorrido de extremo a extremo: bienvenida→diagnóstico corregible→espacio/mapa/tarea→página→oferta/landingpropia→campaña/trespropuestas→pieza/guardar/recargar/exportar→guion/grabar/portada→perfil/destacados/biblioteca/calendario→operación/resultados. Repetir sinmateriales/existente/manual y cambiarproyecto. Edición de borrador no modifica publicación/piezas.

Aceptación: tiempos observados para primera estrategia; checks pertinentes, commits revisables, previewactualizada y versión local/dominio diferenciadas. Informe separado de funcionamiento, aprobación visual y externos. No declarar appoptimizada con filas sin comprobar. SinHostinger/INTICHURIN/publicaciónreal/cobroproductivo/facturación; imágenes/Meta/cuotas/transicionesfuturas no se pierden del registro.

## Sesión documental — 21 octubre 2026

Cambios autorizados: solo documentación. No acceso remoto, no secretos, no SQL, no pruebas de app ni despliegue. Se inspeccionaron contratos y pantallas registradas en B01–B26, se archivó el adjunto íntegro y se consolidaron155requisitos. Se conservarán los documentos antiguos con aviso de precedencia.

### Auditoría de aceptación del objetivo1

| Auditoría | Requisito | Evidencia necesaria | Resultado |
| --- | --- | --- | --- |
| A01 | Fuente íntegra sin pérdida | Igualdad de bytes/SHA256 adjunto y copia | comprobado; hash en auditoríaJSON |
| A02 | Todos los apartados del adjunto | Trazabilidad de sus12apartados a IDs | comprobado; tabla por apartado, referencias validadas |
| A03 | Plan integral y requisitos compatibles | Tabla integral en trazabilidad y secciones2–19maestra | comprobado documentalmente; contraste manual, no prueba de app |
| A04 | Matriz completa usable | IDs únicos, columnas completas, objetivos1–16, sección válida y B resolubles | comprobado;155filas válidas y26bases |
| A05 | Cobertura sin herramientas/rutas olvidadas | Comparar App.tsx y ToolId con filas de pantalla | comprobado;52rutas+12herramientas+10accesos=74filas pendientes de QA |
| A06 | Base reutilizable y límites reales | B01–B26 y D01–D20 con archivos y huecos concretos | comprobado por inspección; ninguna base declarada funcional solo por código |
| A07 | Estados y aprobaciones honestos | Objetivos2–16pendientes y no considerar aprobado el prototipo | comprobado; soloG01–G04 documentales cerrados en matriz |
| A08 | Persistencia de documentación y enlaces | Todos los enlaces internos y CSV legibles | comprobado; enlaces resuelven, fuente copiada al proyecto |
| A09 | No aplicación ni Supabase | Gitdiff solo docs/README; ninguna llamada remota o mutación externa | comprobado; diff frontend/supabase/scripts vacío, herramientas solo locales |
| A10 | Retomar sin repetir análisis | Objetivo02/dependencias/bloqueos/futuros y fuente identificados | comprobado; siguiente objetivo02 requiere su instrucción, no se inició |

Evidencia estructural: [FOR_U_AGREEMENT_AUDIT.json](FOR_U_AGREEMENT_AUDIT.json). Se comprobó igualdad de fuente,12apartados,19secciones maestras,16contratos de objetivo, referencias/IDs/estados, rutas exactas frente a App.tsx, expansión de ToolId, enlaces locales y conservación del cuerpo de README/plan/registro históricos. La cobertura semántica se contrastó manualmente en FOR_U_SOURCE_TRACEABILITY.md; el validador estructural no pretende probarla automáticamente. No se ejecutaron TypeScript/build/pruebas de app porque no cambió su código. No hubo acceso remoto. La aprobación visual pendiente del producto no impide completar esta consolidación documental.

## Protocolo al retomar cualquier objetivo

1. Leer sección propia, IDs de matriz y B pertinentes; no releer todo el historial ni repetir QA sin motivo.
2. Contrastar git y código actual; si cambió desde esta inspección, actualizar base y conservar requisito.
3. Trabajar solo alcance autorizado y reutilizar bases. Registrar discrepancias, no resolverlas borrando funciones.
4. Mantener evidencia de cambios/pruebas/versión y estado por requisito. No marcar producto comprobado por documentación.
5. Si hace falta intervención externa, indicar acción concreta sin claves por chat y avanzar partes independientes.
6. Entregar recorrido revisable; conservar gate visual y futuras instrucciones por objetivo. No comenzar otro automáticamente por tenerlo documentado.

## 21 octubre — Objetivo 2: muestra personalizada y corrección de preguntas

Actualizada la maqueta independiente existente. Evidencia, límites y recorridos: [FOR_U_MOCKUP_REVIEW.md](FOR_U_MOCKUP_REVIEW.md). La propietaria rechazó la campaña con cuatro campos simultáneos: la regla ahora es global, una pregunta o decisión de edición por momento, también en paneles secundarios. Campaña, producto, promoción, perfil y calendario se recorrieron con controles progresivos y resumen revisable; el fondo se recoge mientras se responde.

La muestra está lista para revisar, **sin aprobación visual y sin autorización para objetivo 3**. Ningún resultado del prototipo cierra requisitos de la aplicación. No se modificaron frontend, Supabase, INTI CHURIN ni negocios reales. No se ejecutaron build/TypeScript de la app porque esta entrega no cambia su código.

## Agrupación autorizada: tres entregas utilizables

La propietaria autorizó el 21 octubre: «Ejecuta estas tres entregas usando el acuerdo guardado. Empieza por el recorrido completo de entrada a página editable; corrige también la pantalla actual. No cierres la entrega por pruebas técnicas si el recorrido sigue siendo confuso». Sustituye la obligación de copiar objetivos uno por uno; los 16 y sus requisitos se conservan como lista interna. No autoriza publicar negocios reales, activar facturación ni modificar INTI CHURIN.

1. **Mi negocio toma forma — en curso:** entrada/proyectos actual, bienvenida, tres entradas, preguntas de cuenta/proyecto, diagnóstico, revisión/preparación, mapas y página editable especializada. Objetivos 04–08 y partes pertinentes de 14–15; reutiliza 01–03.
2. **Creo y organizo contenido — pendiente:** ofertas/campañas/plantillas/composición, biblioteca/perfil/cuadrícula, guion/teleprompter/video/portada/calendario. Objetivos 08–11 y capacidades de 12 pertinentes.
3. **Gestiono y compruebo mi negocio — pendiente:** operación y resultados de seis rubros, herramientas restantes y cierre integrado. Objetivos 13–16.

Persistencia, móvil, accesibilidad e IA por acción acompañan cada entrega. El cierre visual exige recorrido real entendible, no solo TypeScript/build. No se eliminan requisitos por esta agrupación.

## Avance de la entrega 1 — entrada y página editable (21 octubre)

Estado: **en curso; sin cierre visual**. Se implementaron la bienvenida con tres entradas, preguntas progresivas, diagnóstico seleccionable, resumen revisable y preparación idempotente de ruta, tareas y borrador por rubro. Se conservan los documentos históricos y la publicación existente. El acceso Mi página converge en el editor compartido; los catálogos originales siguen disponibles.

QA autenticado: proyecto `aa420f8a-2267-4fbf-b1bb-e756278fd352`, «QA Ruta visual · 21 octubre». Crear → responder → revisar → preparar guardó dos tareas y un borrador. Editar título directamente → esperar «Borrador guardado» → recargar conservó «Un café para encontrarnos · QA». No se publicó la página. Una respuesta comercial requirió reintento; se conservó y luego guardó, sin diagnóstico definitivo de causa remota.

Inicio: corregidos enlace de Hoy y accesos de recuperación que conservaban azul/subrayado nativo. Vista compilada de 4175 actualizada; comprobación DOM: sin enlaces visibles azules subrayados; ancho CSS360 con documento360. Carita/timer compactados. Cabecera del editor compactada; resumen muestra primero elecciones esenciales.

Verificación: 25 pruebas pertinentes aprobadas, build aprobado; TypeScript aprobado también después de la última compactación. Evidencia local: `/tmp/foru-delivery-evidence/inicio-actual.png`, `/tmp/foru-delivery-evidence/inicio-360.png`. No equivale a aprobación visual ni prueba física iPhone.

Pendientes de esta entrega: edición contextual de una decisión por momento, ofertas/catálogo y navegación completa por seis rubros, mapa/Kanban/calendario con resultados reales, recuperación/conflictos, móvil integral. Entregas 2 y 3 siguen pendientes. Gemini real, audio interpretado, publicación de presentación3, aislamiento con segunda cuenta y pruebas físicas no verificados en esta sesión. Sin cambios en negocios reales, INTI CHURIN, Hostinger ni facturación.

## Avance de la entrega 1 — edición por decisión (22 octubre)

Estado: **implementación parcial, QA visual pendiente; entrega no cerrada**.

- Panel contextual de la landing: elegir un ajuste antes de mostrar su control; texto, destino, alineación y color de CTA separados. Fotos y descripción accesible separadas. Configuración agrupada por identidad, contacto, publicación y ayuda.
- Añadir sección separado de ordenar; composiciones con miniaturas y sección libre insertada en el destino elegido, conservando arrastre, flechas e historial.
- Oferta nueva: tipo → nombre → descripción → modalidad de precio → importe cuando corresponde → revisión. Fotos, condiciones, presentaciones y extras opcionales después. Los productos confirmados siguen usando el catálogo original; no se cambia el contrato de precios ni de IDs.
- Presentaciones y extras: nombre, precio y disponibilidad por momentos. Una opción nueva usa precio pendiente, sin asumir cero.
- Paneles portados fuera del contenido: fondo inerte, foco contenido y devolución al cerrar, bloqueo de scroll con recuento de paneles y áreas seguras. Conservan la clase de identidad para evitar botones negros fuera del contenedor principal. Este comportamiento todavía requiere comprobación visual/teclado real.
- Sugerencia textual antigua de configuración ahora requiere revisión y aceptación; no se aplica automáticamente. No se probó proveedor real.
- Mapa/Kanban: motivos de tareas leídos de la ruta, información del diagnóstico nuevo con lectura compatible anterior. Reparado `studio` como herramienta reconocida: los pasos generados pueden abrir Creator Studio y conservar el destino desde Hoy.

Validación local con Node20.20.2 en copia temporal y dependencias del lockfile: suite completa 199/199; tras añadir regresión de destinos, 12/12 pruebas de ruta/enfoque; TypeScript aprobado. Build aprobado también después del ajuste de devolución de foco. Se respeta «Marketing más adelante» sin añadir la sugerencia de contenido. No se modificaron Vite4/Tailwind3/dependencias del proyecto. La carpeta original de dependencias bloqueaba las comprobaciones; no se reemplazó.

Vista local restablecida en `http://127.0.0.1:4175/dashboard`. La pestaña del usuario seguía en 50118 sin servidor. El control del navegador rechazó adquirir la pestaña por política de URL; no se intentó eludirlo. Se pidió al usuario abrir 4175 manualmente. Sin captura nueva ni recorrido visual de este avance: no sustituirlos por las capturas del 21. Continúan pendientes las pruebas integradas y físicas indicadas en el acuerdo.

### Continuación de QA y corrección de densidad — 22 octubre

La usuaria abrió 4175 y se retomó el navegador autorizado. Verificado en `aa420f8a-2267-4fbf-b1bb-e756278fd352`: CTA → un único input visible en panel → cambio a «Ver mi propuesta QA» → «Borrador guardado» → recarga conserva el texto. En CSS360, documento360 y raíz de fondo con atributo inert. Evidencia `/tmp/foru-o22-evidence/editor-one-question-360.png`.

Nueva oferta QA por preguntas: producto → nombre «Café de prueba QA · no comercial» → descripción de prueba → precio confirmado S/6 → revisión → guardado en catálogo → guardado de selección en propuesta. Recarga y vuelta a Tus ofertas muestra una sola oferta con el precio confirmado. No se publicó ni se completó una tarea. Evidencia del paso de precio `/tmp/foru-o22-evidence/oferta-precio-360.png`.

La usuaria rechazó la cantidad de botones de la pantalla de propuesta durante QA. Se redujo la navegación permanente dentro de herramientas a Mapa, proyecto y menú; las cuatro vistas siguen visibles al estar en el mapa y disponibles en el menú de herramientas. Eliminados títulos duplicados y tres pestañas grandes de propuesta; selector compacto de vistas. Acciones de ajustes/catálogo recogidas, una acción principal, sin foto vacía en oferta. Foto/condiciones/opciones de la revisión recogidas explícitamente. La aprobación visual final sigue pendiente. Evidencia `/tmp/foru-o22-evidence/propuesta-simplificada-360.png`.

Añadida lectura del catálogo confirmado en un borrador vinculado al módulo para que la oferta recién guardada aparezca al abrir la página; conserva textos y documentos guardados, y no cambia publicaciones. Regresión comprueba aislamiento respecto a páginas vinculadas a propuesta e inmutabilidad de snapshot. Suite final 201/201, TypeScript y build aprobados; comprobar actualización final de la vista al cerrar. La vista se actualiza conservando los assets anteriores para evitar fallos de carga de pestañas abiertas durante una compilación.

Pendientes conservados: prueba de reemplazo/subida/encuadre real de foto, recorrido de CTA/secciones completo y recuperación bajo conflicto, QA móvil integral de cada rubro, proveedor real/audio e iPhone físico, contenido y operación de las entregas 2–3. Este registro no declara completa la entrega 1 por tener checks técnicos.

Cierre de este avance parcial: verificado producto QA visible en la landing vinculada, FAQ insertada antes de Historia, subida con flecha, deshacer, texto de dos párrafos, guardado y recarga conservando orden/contenido. La barra de tablet desbordaba30px; corregida y medidos documento/viewport iguales en360/768/1440. La barra de edición contextual se recoge hasta seleccionar. Evidencia persistente en `docs/evidence/2026-10-22/`, en especial `ofertas-sin-navegacion-duplicada-360.png`. No se trata de una prueba física de Safari ni de aprobación final del diseño.


## Entrega 2 — Studio por intención y piezas conectadas (22 octubre)

**Avance parcial, sin cierre técnico integral ni aprobación visual.** Se continúa el objetivo global; no se han dado por terminadas las entregas 1–3.

Studio ahora comienza por intención → información confirmada/idea → formato → tres composiciones revisables → editar. Las seis intenciones son opciones de una pregunta; no seis formularios. Campañas, Crear, Mi perfil y Biblioteca se reúnen en un selector. Las capacidades anteriores siguen disponibles en controles secundarios. No se exige foto, página ni campaña para crear.

Tres composiciones tienen geometría propia y comparten el renderer del editor, miniatura, pieza y exportador. Sin fotografías usan texto confirmado. El editor muestra Guardar como acción principal, edición directa y ajustes de un campo por momento. Exportación, variantes, historial y guion quedan en el menú. La planificación de una pieza también abre un ajuste por momento.

Fuentes con proyecto/revisión y comprobación de existencia al guardar; rechaza origen ajeno, enlaces temporales y rutas inválidas. Guardado ordenado diseño → pieza → campaña, identifica guardado parcial y conserva UUID al reintentar. Pruebas cubren fallo intermedio, duplicados, fuente retirada/cambiada y contexto inválido. Ideas escritas se conservan en sessionStorage por cuenta/proyecto durante la sesión. Sin IA ni cambios comerciales automáticos.

QA real autenticado en `aa420f8a-2267-4fbf-b1bb-e756278fd352`:
- Oferta S/6 existente → propuesta → diseño `73e11fd0-7f96-4411-b123-c745728757bb` → título directo «Café para conversar · QA» → guardar y recargar conserva edición.
- Exportación produjo PNG real 1080×1350, inspeccionado. Archivo recibido en Downloads, sin publicación.
- Abrir guion conserva el UUID. Guion manual QA guardado y presente en teleprompter. No se activaron cámara ni micrófono.
- Campaña `275fd383-a338-4e29-9097-685c3a759ce6`, «Café y conversación · prueba QA», con objetivo/oferta; crear diseño `e129e1bd-a6f3-4f81-80d5-d624792bf6cb`; recarga muestra una pieza y su miniatura enlazada. Biblioteca recupera ambos diseños.
- Viewport/documento iguales en CSS360/768/1440 para superficies comprobadas de Studio. Se corrigieron miniaturas móviles inicialmente demasiado pequeñas y cabecera del editor que estrechaba el estado. No equivale a prueba física Safari/iPhone ni a comprobación de todas las pantallas.

Verificación local con dependencias del lockfile en snapshot temporal: 209 pruebas aprobadas (8 nuevas de composición/guardado), TypeScript y build aprobados. Sin cambios de dependencias ni Vite/Tailwind/Node soportados. Vista4175 actualizada conservando chunks anteriores.

Evidencia persistente en `docs/evidence/2026-10-22/`: `studio-editor-360.png`, `studio-campana-360.png`, `studio-intencion-360.png`, `studio-intencion-1440.png`.

**Pendientes explícitos de Studio:** adaptar composiciones/plantillas por rubro y momento comercial, filtros completos de comodidad y ofertas específicas, fuente publicada y aviso integral de revisión, carrusel progresivo, organización del perfil/grid/destacados/calendario, biblioteca unificada de todos los tipos de material, grabación/portada/exportación real y Safari físico. La biblioteca integrada de este avance muestra diseños y la biblioteca de fotos existente; no se declara completa la biblioteca multimedia. Continuar además las entregas 1 y 3 y la matriz de todas las herramientas. Gemini real/audio, aislamiento remoto con segunda cuenta e integraciones externas siguen sin prueba de cierre.
