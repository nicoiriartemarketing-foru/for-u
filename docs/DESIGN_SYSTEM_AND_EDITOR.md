# Sistema de diseño y editor por rubro

Solicitud vigente: adjunto `0d3914b6-ab32-4839-a668-083adf8a0f12/pasted-text-1.txt` más referencia explícita a Inti Churín.

## Referencia inspeccionada (solo lectura)

`/Users/nicoleiriartegomez/Documents/INTI CHURIN/inti-churin-web/admin.html` y `assets/js/admin.js`, `app.js`, `popup-editor.js`.

La referencia tiene barra superior con deshacer/rehacer y estado de guardado, biblioteca lateral de imágenes, vista previa en iframe, selección de contenido directamente sobre la página, edición contextual de secciones/botones y controles de reordenación. La parte inspeccionada de reordenación utiliza controles subir/bajar; no se debe confundir esto con una validación completa de drag and drop de Inti. Sus mensajes de iframe usan destino `*`; FOR U debe conservar validación de origen, ventana y canal, sin copiar ese patrón.

## Cambios en curso

- DesignSystem tipado: botones con atributos nativos y refs conservados; ayudas en portal, foco/hover/Escape; InfoIcon por toque; inputs con labels asociados; tarjetas semánticas e indicador de pasos.
- Migración de botones/input/textarea en 91 archivos. No quedan etiquetas nativas de estos controles fuera de DesignSystem en los TSX examinados. Las tarjetas existentes se migraron en 33 archivos.
- Ayudas concretas en sidebar, áreas, guardado/exportación y Pomodoro. El guardado del creador no se anuncia como automático porque actualmente es manual.
- Restaurante: navegación por anclas reales Datos básicos / Menú / Publicar. Wizard: mismo StepIndicator de cinco pasos.
- TypeScript, build y 78 pruebas pasan después de la migración inicial. Aún falta QA visual y funcional ampliada y resolver estilos anteriores que puedan prevalecer sobre la jerarquía de botones.

## Trabajo pendiente explícito

Auditar ayudas específicas en todos los enlaces, selectores y campos, migrar secciones restantes apropiadas al sistema y revisar todos los flujos con varios pasos. No considerar el alcance completo resuelto por el cambio mecánico de etiquetas.

Editor profesional: consolidar selección contextual, historial, reordenación por arrastre y teclado, imágenes y previsualización móvil/escritorio. Adaptar bloques a restaurante, tienda, hospedaje, turismo y cursos; conservar UUID, documentos existentes y control de revisiones. Validar guardado, recarga y publicación por rubro. No reescribir los datos de Inti Churín.

Primer avance del editor basado en la referencia: historial de 40 estados con deshacer/rehacer, conservando objetos completos y eliminando la rama de rehacer cuando se introduce otro cambio. Se integra en el editor de páginas existente; no publica ni retira páginas por sí solo. TypeScript/build y 80 pruebas pasan. La adaptación profesional a los cinco rubros y la validación visual ampliada continúan pendientes.
