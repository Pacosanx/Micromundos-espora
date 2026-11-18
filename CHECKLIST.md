# Micromundos · Checklist de lo que falta

Actualizado el 18/11/2026. Versión en `main`: commit `73461c6`.
Sitio: https://pacosanx.github.io/Micromundos-espora/ · Repositorio: https://github.com/Pacosanx/Micromundos-espora

## Primera visita y ayudas durante el recorrido

- [ ] **Onboarding en la primera visita.** Diseñar una capa breve al salir de la portada que explique qué es Micromundos, qué se puede hacer en MUESTRAS, GLOSARIO y TU PLACA, y cómo empezar. Revisar qué reutilizar del borrador local de «¿Qué es Micromundos?».
- [ ] Definir cómo saltar la introducción y volver a consultarla. Recordar que ya se vio y comprobar el recorrido en una primera visita, al volver y al abrir la ayuda manualmente.
- [ ] **Pistas en el momento de actuar.** En MUESTRAS, señalar cómo elegir una muestra, usar el zoom, mover y cerrar una ficha, cambiar de vista y abrir el listado. En GLOSARIO, indicar qué círculos se pueden elegir y cómo volver a las muestras de un entorno. En TU PLACA, mostrar cómo sembrar, editar una colonia, mantener y girar, deshacer y guardar.
- [ ] Escribir los cartelitos con una acción por vez y verbos concretos («Arrastrá», «Elegí», «Mantené apretado y girá»). Mostrarlos cerca del control, retirarlos al completar la acción o cerrarlos, y hacer que se entiendan con mouse y tacto.
- [ ] Probar la primera visita con alguien que no conozca el Atlas. Observar si entiende qué está viendo, logra abrir una muestra y puede empezar una placa propia sin explicación externa.

## MUESTRAS · Lectura de la placa

- [ ] **Rediseñar la leyenda con jerarquías tipográficas claras.** Diferenciar el título de la guía, los rótulos Color / Forma / Tamaño, los ejemplos y las indicaciones de uso. Revisar tamaños, pesos, alineación, espaciado y contraste junto con los estados de los filtros.
- [ ] **Permitir abrir y cerrar la leyenda.** Probar «Cómo leer la placa» como nombre del control, con «Ver guía» y «Cerrar guía» como textos de acción. Definir el estado inicial y comprobar que se pueda volver a abrir, que el control indique su estado y que los filtros sigan activos al cerrarla.
- [ ] Explicar cómo se leen las muestras mixtas en la guía de color. Revisar con Paco las paletas pendientes de bacteria + moho, levadura + moho y los tres grupos juntos.
- [ ] Revisar PLACA, VÍNCULOS y MUESTRARIO con el listado abierto y cerrado. Comprobar que se entiendan la selección, los filtros y la vuelta desde una ficha o un entorno.

## Legibilidad y contraste

- [ ] Quitar el desenfoque de la tipografía y los controles en todo el Atlas, de acuerdo con lo definido el 17/11. Conservar el tratamiento visual de las colonias, los fondos y el vidrio de los carteles.
- [ ] Revisar que la leyenda, la navegación, los cartelitos, los rótulos y los estados inactivos mantengan buen contraste sobre fondos variables. Comparar capturas antes y después en las pantallas principales.

## Para revisar en tu pantalla (F11)
- [ ] Galería de la ficha del yogur: bordes de las tarjetas, desenfoque de los dos márgenes y scroll que arranca en la segunda tarjeta. (No se pudo ver a tamaño real.)
- [ ] Cartelitos de los universos: sin corte vertical en la textura.
- [ ] Ficha del yogur: "fermentada" y "colonia" abren su definición del glosario.
- [ ] Fluidez de la apertura, la transición a PLACA y la transición a VÍNCULOS.
  - Si sigue lenta: aplanar las 195 manchas del fondo en una sola imagen.

## Que dijiste que vendrían
- [ ] Problemas de blureo: pasar capturas. (Los márgenes de la galería ya están rehechos; falta saber si hay más.)
- [ ] Optimización para 1920×1080: auditar pantalla por pantalla (textos chicos, cortes abajo, ejes). Sin hacer.

## TU PLACA · Diseño e integración

El muestrario de prueba permite comparar variantes. Queda pendiente elegir cuáles pasan a TU PLACA e integrarlas en su recorrido.

- [ ] **Diseñar bien la interfaz de la pantalla TU PLACA.** El menú para seleccionar las muestras está muy flojo. Rediseñarlo con jerarquía, tamaños y estados claros (normal, sobre, elegida), y revisar cómo se ve la selección y cómo se pasa de elegir a sembrar. Probar con mouse y pantalla táctil a tamaño real.
- [ ] Darle más protagonismo a TU PLACA. Revisar el título, la presencia del borde de la placa vacía, el peso de la biblioteca y la indicación de dónde soltar la primera colonia.
- [ ] Afinar el menú contextual para ajustar desde el primer gesto. Al mantener apretado y girar, el valor y la colonia deben cambiar en vivo mientras los otros botones se repliegan con una animación breve. Probar con mouse y pantalla táctil.
- [ ] Llevar a la biblioteca estructuras de COLONIAS como Banda, Retícula, Campo disperso y Campo radial. Elegir cuáles ofrecer y probar que cada una se pueda sembrar como conjunto en una placa que ya tiene colonias, mover, editar y deshacer.
- [ ] Adaptar el arco de MUESTRAS a los controles generales de TU PLACA. Incluir Foco, Giro, Paleta por porcentajes y Variación de las formas y tamaños individuales. Tamaño y Opacidad siguen siendo ajustes de cada colonia.
- [ ] Decidir si sumar Densidad al menú de composición. En el muestrario, la versión más reciente revela satélites sin reubicar las colonias ya puestas. Comprobar si se entiende y sirve al componer.
- [ ] Cerrar una selección de formas, tamaños y colores con el muestrario. Acordar una paleta coherente entre biblioteca y generador y definir qué queda como variante lista para sembrar y qué conviene ajustar.
- [ ] Definir si habrá un momento opcional de «Diseñá tu colonia». Elegir pocos controles de COLONIAS, decidir si el diseño puede volver a la biblioteca y si queda guardado para otra visita.
- [ ] Hacer más legible el encuentro entre colonias, en particular entre bacterias y levaduras. Comparar las variantes gráficas del muestrario a tamaño real, con distintos tamaños y separaciones, y resolver cuáles pasan a TU PLACA, cómo aparecen y cómo se comportan cuando coinciden varios encuentros.
- [ ] Definir **UNIR** como acción explícita sobre dos colonias. Probar una silueta mayor o en forma de 8 con pigmentos mezclados y decidir qué resultado corresponde a cada caso. Permitir deshacer y decidir si se retira MEZCLAS una vez que UNIR funcione. La simbiosis durante el contacto conserva la huella de las colonias.
- [ ] Aclarar qué pasa al generar otra composición sobre una placa ya armada y cómo recuperar la anterior.
- [ ] Verificar selección, movimiento, deshacer y recuperación tras recargar, incluidos los ajustes de toda la placa. Revisar que el PNG conserve la composición, el borde y las reacciones visibles al guardar.
- [ ] Sustituir el texto provisional «Este espacio está en preparación» por una indicación útil si TU PLACA falla al cargar.

## Decisiones pendientes
- [ ] Opacidad del menú de Tu Placa:
  - Usa el ícono de Orden (no existe `tp-opacidad.svg`).
  - Puede llegar a 0 % y la colonia queda invisible (¿mínimo de 10 %?).
  - Se perdió la función de ordenar copias en anillos.
- [ ] Enlace oficial: hay dos.
  - GitHub Pages (al día).
  - Copia de Codex en `micromundos-publico` (versión 19 de `PUBLICACION.md`, desactualizada).
- [ ] Repositorio público. Si se pasa a privado, GitHub Pages deja de funcionar en el plan gratuito.

## Limpieza (sin apuro)
- [ ] Borrar ramas ya incorporadas: `tipografia`, `correcciones`, `menu-ruido`, `ruido-colonias`, `publicar/2026-11-16-ultima-version`, `ajustes/cartel-celula-especie`.
- [ ] Borrar copias de prueba en `placa`: `placa_prueba_original.html`, `placa_prueba_colonias.html`, `placa_prueba_entornos.html`.
- [ ] Configurar el email real en git (hoy los commits salen como `paco@local.invalid`).
- [ ] Encontrar la imagen del sitio publicado que carga sin dirección (aparece en la consola; no rompe nada visible).

## Contenido
- [ ] Glosario: cinco términos siguen en borrador, sin definición: Flagelo, Biofilm, Masa madre, Agar, Crecimiento.
- [ ] Más conceptos del glosario en la ficha (por ejemplo Coco y Bacilo para las dos especies del yogur): hay que redactar frases nuevas.
- [ ] Decidir cuáles fichas sumar después de Yogur. Para cada una, preparar los textos, sus imágenes de placa, colonias y microscopio, y el esquema que explica qué sucede en esa muestra. Evaluar la plantilla común alimentada desde las tablas.
- [ ] Validar la lectura de código, origen y método desde la base antes de llevar al Atlas la prueba que reemplaza las asignaciones generadas.
- [ ] Completar la revisión de fuentes de las asignaciones de especies pendientes, incluido el caso de Tempeh, y revisar los respaldos indirectos. Aclarar al público que la colección es ficticia y que las reacciones de TU PLACA son interpretaciones gráficas.
- [ ] Resolver qué explicaciones de las reacciones llevan entrada o referencia en el Glosario y cómo se vinculan sin renumerar términos existentes.

## Pruebas, mantenimiento y entrega

- [ ] Probar con pantalla táctil física y revisar áreas de toque, arrastre, mantener y girar, cierre de carteles y guardado. Si se usa Safari o iPad, comprobar allí el desenfoque de colonias y del PNG.
- [ ] Revisar teclado, foco, lector de pantalla y preferencia de movimiento reducido en las ayudas, la guía, los controles y las vistas principales.
- [ ] Medir apertura, fluidez de TU PLACA con muchas colonias y reacciones simultáneas. Revisar también el funcionamiento sin conexión si el montaje lo necesita, en especial la carga de Arimo.
- [ ] Hacer reproducible la reconstrucción. Definir un comando vigente y corregir o retirar de la documentación el uso de `build.py` mientras produzca un HTML incompleto. Comprobar que `placa.html` coincida con sus fuentes.
- [ ] Documentar e instalar las dependencias de los verificadores para que otra persona pueda repetir la validación de la base, los flujos y las referencias. Sumar comprobaciones de primera visita, guía, gesto continuo y exportación al integrar esos cambios.
- [ ] Hacer que el generador reproduzca el mismo resultado con la misma semilla. Comparar el motor de COLONIAS con el del Atlas antes de compartirlo y comprobar que las 146 muestras conservan su apariencia.
- [ ] Al integrar las reacciones y las composiciones, revisar si conviene separar sus cambios de la lógica de siembra, historial y exportación. Inventariar módulos antiguos, recursos duplicados y pruebas antes de archivar o quitar lo que ya no usa el Atlas.
- [ ] Escribir un README con qué es Micromundos, cómo abrirlo, reconstruirlo, probarlo y publicarlo, y dónde consultar créditos y fuentes. Poner al día el traspaso, la escala tipográfica, la documentación de la base y `PUBLICACION.md` según el estado real.
- [ ] Hacer el recorrido final en la versión publicada y verificar navegación, legibilidad, carga de recursos y claridad de las acciones en cada pantalla.
- [ ] Para el video que prepara Paco, mostrar TU PLACA temprano y abreviar el resto del recorrido. Revisar una toma con mouse para comprobar que el cursor, los gestos y los cartelitos se lean y se entiendan.

## Cómo actualizar el sitio
1. Rearmar `placa.html` con `armar.bat`.
2. Confirmar los cambios y `git push` desde `main`.
3. Pages se reconstruye solo en uno o dos minutos.

Para ampliar los pendientes, consultar la [auditoría](../../Micromundos-espora/AUDITORIA_Y_CHECKLIST.md), las [decisiones y devoluciones](../../Micromundos-espora/TRASPASO_ATLAS_DIGITAL.md) y la [propuesta de fichas](prueba_fichas/DISENO_FICHAS.md).
