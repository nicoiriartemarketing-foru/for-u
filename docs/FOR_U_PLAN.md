# FOR U: Creator Studio creativo y contextual

## Experiencia principal

Creator Studio será el inicio del proyecto. Reemplazaremos el selector «landing / menú / curso» por una **ruta visual de creación**, con tarjetas ilustradas, muestras del contenido y una acción principal: **Continuar mi creación**.

Ejemplo para tu negocio de alfajores:

1. **Dale personalidad:** nombre, propósito, colores y portada.
2. **Presenta tus alfajores:** productos, fotos, descripciones y precios.
3. **Hazlo tuyo:** editar y previsualizar tu página.
4. **Compártelo:** revisar, publicar y copiar el enlace.

Cada paso mostrará su estado real: pendiente, en proceso o listo. Podrás volver a cualquier paso; no será un asistente rígido.

El lenguaje y los contenidos cambiarán según el rubro ya guardado: productos, habitaciones, experiencias o cursos. Cambiar de proyecto actualizará todo el contexto.

## Diseño y herramientas

- Inicio cálido, colorido y creativo: vista previa del proyecto, mascota guía y una sugerencia breve, sin párrafos extensos ni todas las herramientas abiertas.
- Cada paso incluirá contenido inicial editable y propuestas contextualizadas. No inventaremos precios, testimonios ni resultados.
- Plantillas, creador visual, IA y teleprompter aparecerán donde ayuden a completar el paso, conservando proyecto y sección.
- Las herramientas seguirán accesibles desde un acceso secundario «Herramientas creativas».
- Editor con barra superior compacta, panel de bloques plegable, controles contextuales, escritorio amplio y móvil de 360 px.
- Navegación común, Pomodoro persistente, ayudas breves y estados claros de guardado, carga y error.

## Gestión, publicación y pedidos

Se conserva el resto del plan acordado:

- Tablero de cuatro áreas disponible después de guardar el primer borrador válido; Creator Studio permanece como inicio.
- Áreas en modales con tareas y progreso compartidos con Mi mundo.
- Calendario, conexiones, estadísticas, agentes y mascotas integrados, sin considerar terminados los pendientes por abrir sus pantallas.
- Publicación vinculada a los datos reales del negocio, preservando los cinco rubros y las URLs existentes.
- Restaurante con catálogo real, variantes, extras, carrito y pedidos para mesa, recojo y delivery gestionado por el negocio.
- Seguimiento real, compra como invitado y perfil opcional con favoritos e historial.
- Mercado Pago como primera integración prevista, con cobros a la cuenta de cada negocio y verificación en servidor.

## Datos y reglas de progreso

- El rubro guardado en el proyecto determinará los pasos y las herramientas: no habrá una segunda elección de tipo de negocio.
- Los pasos de creación usarán el contenido y estado de guardado/publicación existentes para indicar avance. Abrir una herramienta no contará como completar un paso.
- Las tareas manuales de las cuatro áreas conservarán su propio estado; no se completarán automáticamente por recorrer el Studio.
- Mantendremos UUID, Supabase, recuperación de borradores y control de conflictos.
- Las ampliaciones de catálogo, pedidos, perfiles y pagos serán aditivas, con permisos por negocio y cliente, y credenciales exclusivamente en servidor.
- Se mantienen Tailwind 3, Vite 4 y Node 18/20, sin añadir librerías de animación.

## Entrega y validación

Orden: **Studio contextual y editor → publicación y catálogo → pedidos y perfiles → pagos → integración de gestión y mundo**.

La primera revisión mostrará tu proyecto de alfajores con su ruta creativa y el editor amplio, sin selector redundante de formatos.

Verificaremos:

- Pasos y etiquetas correctos para los cinco rubros.
- Continuar desde el avance guardado y cambiar de proyecto sin mezclar contenido.
- Crear, editar, guardar, recargar y publicar.
- Pedidos, pagos, seguimiento y aislamiento entre cuentas.
- Calendario, métricas, conexiones y sincronización Tablero/Mundo.
- Accesibilidad y pantallas de 360, 768 y 1440 px.
- TypeScript, build y pruebas funcionales, con commits revisables y comprobación posterior en Hostinger.
- /goal Implementar y verificar el plan completo de FOR U acordado en esta conversación, incluyendo sus correcciones posteriores. No limitar la entrega al último cambio visual.

  Antes de editar:
  1. Consolida los requisitos vigentes en docs/FOR\_U\_PLAN.md.
  2. Crea docs/FOR\_U\_PROGRESS.md con cada requisito, su estado (pendiente, en curso, verificado o bloqueado), evidencia y siguiente acción.
  3. Contrasta el código existente para aprovechar lo que funciona y no repetir trabajo. Las decisiones más recientes prevalecen sobre las anteriores.
  Decisiones obligatorias:
  - Creator Studio es el inicio creativo dentro del proyecto; el rubro ya está elegido. No mostrar otro selector de landing/menú/curso.
  - Mostrar una ruta visual contextual, contenido inicial editable y herramientas por sección.
  - El tablero de cuatro áreas aparece después de guardar el primer borrador válido.
  - Completar el editor amplio, navegación común, publicación real, pedidos, perfiles opcionales, pagos, agentes y los pendientes de Calendario, conexiones, métricas, tareas y Mi mundo descritos en el plan.
  - Conservar datos, UUID, funcionalidades existentes y compatibilidad con Vite 4, Tailwind 3 y Node 18/20.
  Trabaja por entregas completas en el orden acordado y continúa con la siguiente sin pedirme “continúa”. No reduzcas ni elimines requisitos silenciosamente. Si una integración necesita credenciales o intervención mía, registra el bloqueo exacto y avanza con el trabajo independiente.

  No marques algo como verificado solamente porque abre la pantalla o pasa el build. Comprueba sus acciones, datos guardados, recarga, errores y permisos. Revisa la interfaz en 360, 768 y 1440 px y ejecuta TypeScript, build y pruebas pertinentes.

  Mantén el registro actualizado para retomar sin repetir análisis. Optimiza consumo con búsquedas dirigidas, reutilización y comprobaciones proporcionales; evita relecturas y pruebas repetidas sin motivo.

  Prepara commits revisables. Distingue siempre implementación local, validación local y verificación del despliegue. No declares cumplido el objetivo mientras existan requisitos pendientes o bloqueados.

  Empieza por Creator Studio contextual y el editor amplio, mostrando el resultado real de esa primera entrega, y después continúa con las demás.

## Contrato de implementación (2026-10-07)
- Prevalece Creator Studio contextual como inicio. Los cinco rubros no se vuelven a elegir dentro del proyecto.
- Mantener las URLs públicas y los UUID existentes; reparar el esquema solamente tras compararlo con producción.
- Pedidos: precios calculados en servidor, estados de pago separados de preparación, webhooks idempotentes y seguimiento privado. Mercado Pago por negocio; delivery gestionado por cada negocio.
- Mundo: carga diferida, cuatro áreas, mascotas con avanzar/descansar, caricias/snack/búsqueda y decoraciones sin penalizaciones; progreso compartido y sin duplicar premios.
- Calendario: CRUD persistente por proyecto, horario local, semana/mes y exportación; recordatorios internos requieren app abierta.
- Conexiones: distinguir consulta fallida, desconectada, verificada y vencida; reintentos y permisos reales.
- Métricas: visita/clic público hasta resumen privado; cero válido distinto de error; clic no equivale a venta.
- Comprobar contraste, teclado, movimiento reducido, recuperación de borradores y conflictos entre pestañas.

## Actualización visual vigente — 10 de octubre
Sidebar blanca, cabecera translúcida con breadcrumbs y selector de proyecto, contenido gris #F4F4F5. Unificar con tokens FOR U: dorado #fbbf24, rosa #f472b6, violeta #a78bfa y cyan #22d3ee; texto #0A0A0A y secundario #6B6B6B. Reutilizar magic-card y botones pill. Reducir iconografía decorativa y acciones principales; conservar navegación, proyecto, guardado y datos. Esta actualización sustituye la sidebar oscura anterior, no cancela reservas, pedidos, pagos ni verificaciones pendientes.
