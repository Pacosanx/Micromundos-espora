# 06 · Traspaso a Claude Code: prototipo de la pantalla PLACA

> **Pantallas de detalle y revisión real · 14/11, Codex:** quedan integrados BACTERIAS, LEVADURAS y MOHOS desde GLOSARIO, la ficha de Yogur natural B-083-YNA y TU PLACA. `src/pantallas-detalle.json` conserva las composiciones de Figma; `pantallas-detalle.js/.css` agregan navegación, carruseles, archivo de especies, carteles compartidos y relaciones reales. TU PLACA reutiliza el renderer de Colonias, permite componer, contemplar, conservar la composición localmente y generar un recuerdo PNG de 1600 × 1600. Los builders PowerShell/Python incorporan las fuentes.
>
> **Datos:** Yogur A:912 conserva el código B-083-YNA, ocho colonias y fecha febrero de 2024. Se corrigió su composición a cuatro Streptococcus thermophilus y cuatro Lactobacillus delbrueckii subsp. bulgaricus, con catálogo y ficha editorial en los CSV. Las relaciones se calculan desde la base; los demás datos heredados del archivo siguen siendo ilustrativos.
>
> **Comprobación:** se revisaron las pantallas en un navegador real mediante `node previsualizar.cjs` y `http://localhost:4173/placa.html`; el servidor escucha sólo en 127.0.0.1. Comprobados acceso desde Glosario, scroll/márgenes, imágenes y especies, carrusel con flechas de 48 × 44, apertura de Yogur desde una especie, lupa por presión con distorsión GPU visible, composición y vista del recuerdo. Los 112 recursos únicos del inventario existen y los registros de geometría/carga del navegador no encontraron imágenes vacías. `src/verificar-flujos.cjs` comprueba los recorridos con DOM/canvas simulados; no sustituye esta revisión visual.
>
> **Ajustes de esta revisión:** desenfoques progresivos aproximados por superficies enmascaradas para conservar los detalles centrales; recursos correctos de especies e insignias por universo; carteles junto al listado; cierre del cartel de muestra al entrar en una ficha; margen final de la galería más 64 px; `overflow:clip` en la pantalla exterior para impedir su desplazamiento al enfocar controles. Se conservan los gestos y las capas de blur de los carteles. El microscopio usa el shader original y sus recursos; los navegadores sin las APIs necesarias conservan la imagen microscópica sin distorsión. La descarga automática del PNG está bloqueada por la política `data:` del navegador de revisión; se verificó la imagen generada y su vista, sin eludir ese bloqueo. Capturas y registro de geometría en la carpeta de outputs de la revisión visual.

> **Listado opcional y encuadre ampliado · 13/11, Paco:** la pantalla comienza sin listado lateral. El botón «LISTADO COMPLETO» abre/cierra el listado y su buscador en las tres vistas, con aria-expanded, controles ocultos inertes y cierre con Escape. `src/listado.js` conserva el estado al cambiar de vista y anima apertura/inversión en 650 ms. Al abrir, PLACA/VÍNCULOS recuperan su geometría original; al cerrar, crecen 16 % y desplazan el centro a x=1220 (coordenadas de diseño), con aros, etiquetas, arco de zoom, hilos, filtro y zona de toque alineados. Las posiciones se calculan por elemento, sin escalar el contenedor de carteles, para conservar su background blur. El zoom lógico y los datos no cambian. MUESTRARIO ocupa todo el ancho sin listado y comprime su grilla al abrirlo, manteniendo las 146 identidades y posiciones relativas. El buscador aparece debajo del botón cuando se abre el listado. Pruebas con DOM/reloj simulados aprobadas: inicio cerrado, toggle, encuadre abierto original, ampliación, selección/zoom, reversión, tres vistas, grilla compacta, líneas y toque, pantalla ancha y movimiento reducido. Revisión visual real pendiente.

> **Inercia según velocidad · pedido posterior de Paco, 13/11:** se reemplazó el límite de 24 px por una curva progresiva en velocidad real de pantalla: `distancia = 120 × (1 − exp(−rapidez/1,2))`, con duración de `280 + distancia × 2,5` ms y desaceleración cúbica. Un gesto lento se desliza poco; uno rápido llega más lejos, acercándose gradualmente a 120 px como máximo. La pausa de 90 ms, cancelación, interrupción al tocar y movimiento reducido se mantienen. Comprobación con el mismo recorrido de dedo y distintas velocidades: 7,7 / 28,1 / 58,4 / 111,7 px; idénticas distancias físicas en tres escalas de pantalla. En esta iteración no se modificaron el vidrio, las máscaras ni otros estilos: Paco preguntó por el borde desvanecido y pidió implementar únicamente la relación de velocidad/distancia.

> **Deslizamiento breve al soltar · 13/11, pedido posterior de Paco:** se agregó únicamente un remanente de arrastre en app.js: máximo 24 píxeles de pantalla, 380 ms con desaceleración cúbica, proporcional a la velocidad reciente y siguiendo la dirección del gesto. Si el dedo se detuvo más de 90 ms, se cancela el gesto o está activo movimiento reducido, no hay deslizamiento. Volver a tocar o cambiar selección interrumpe el RAF. Se mantienen el arrastre, descarte y flotación previos; no se incorporan resortes de scroll, rotaciones ni animación del vidrio. No se modificó la plantilla ni los efectos gráficos. Pruebas con reloj/puntero simulados aprobadas en tres escalas de pantalla, incluido gesto horizontal sin desplazamiento vertical agregado.

> **Movimiento del ejemplo revertido por Paco · 13/11:** se retiraron el resorte de scroll, la inercia y la animación del contenedor completo porque generaban desplazamiento vertical excesivo e interferían con el background blur. Restaurados app.js (SHA256 c34f31702c95f9ef741e42c20ac3367636a01612649109ac9e7bcbf408b811a4) y los estilos de movimiento anteriores: flotación suave solo del contenido, vidrio quieto y arrastre previo. No reintroducir ese comportamiento sin una nueva indicación de Paco.

> **Corrección de material de los carteles · 13/11, Codex:**
> Lectura directa de Figma `396:8048`: BACKGROUND_BLUR 10,9; LAYER_BLUR 10; NOISE MULTITONE tamaño 0,5, opacidad 25 %, densidad 1; fill degradado al 25 % y radio 24. La imagen `396:8049` tiene blur 8 y opacidad 26 %. El CSS normaliza radios a sigma (5,45 / 5 / 4 px, siguiendo la conversión 8 → blur(4px) del contexto exportado). `.vidrio` concentra backdrop-filter, layer blur y el único fill; se quitaron el fondo extra al 22 %, el inset expandido de −22 px y la máscara de 46 px que alteraban el material. La imagen se recorta antes de aplicar su blur; el grano usa una aproximación SVG multitono fija al 25 %, separada del texto. El contenedor de la ficha mantiene opacidad 1 y el fundido se aplica al vidrio/primer plano para no crear un límite de captura del fondo en el padre. Conservados el portal, flotación, arrastre, descarte al soltar fuera y la textura JPEG optimizada que ya estaban en las fuentes. Sin cambios en app.js. Build PowerShell, sintaxis y comprobaciones de capas/paletas aprobados. **Pendiente comprobación visual real:** el navegador de revisión bloqueó el protocolo file://, incluso para la pestaña ya abierta por Paco.

> **VÍNCULOS activado el 13/11 (Codex, pedido de Paco):**
> - MUESTRARIO implementado según Figma `396:8454`, grilla `396:8524` (17 columnas × 9 filas, caja x=491/y=193/ancho=1359/alto=708). `src/muestrario.json` conserva las 146 posiciones por código; `src/muestrario.js` reutiliza exactamente los mismos canvas de las otras vistas, sin imágenes ni muestras duplicadas. Tamaños de lectura de 26 a 60 px, monotónicos respecto del tamaño original, sin alterar colonias ni datos. La lista lateral desaparece en esta vista; leyenda, buscador y fichas siguen activos. El marco de la grilla aprovecha el espacio adicional de la ventana.
> - Transición generalizada a tres disposiciones mediante los pesos `mezclaVista` (VÍNCULOS), `mezclaMuestrario` y el resto para PLACA. Las seis direcciones duran hasta 1,1 s; pueden interrumpirse hacia cualquier tercera vista desde las posiciones y escalas actuales. Los hilos y sus degradados siguen los centros mientras se desvanecen; la zona de toque, el filtro de textura y los límites de ficha incluyen el área de la grilla. Se retiró el aviso pendiente y su retorno automático del botón MUESTRARIO. Comprobados con DOM y reloj simulados: seis transiciones, cuadros intermedios, interrupciones, identidad de los 146 canvas, correspondencia completa con Figma, selección compartida, filtros sin reordenar, toque en extremo derecho, adaptación de pantalla y movimiento reducido. Revisión visual real pendiente.
> - Carteles actualizados según Figma `396:8047` (Cartelito muestra · KÉFIR): ancho 402 px, radio 24 px, padding 24 px, título Arimo 32 px y código 14,667 px, separación de cabecera 40 px, etiquetas de 112 px y valores de 17 px con interlínea de 24 px. `src/carteles.js` genera la ficha y sus paletas: B #e57dab, L #f2c75e, M #92aa68 y degradados para grupos mixtos. Se conservan la selección, el cierre y la posición junto a la muestra, con altura máxima de 740 px y scroll para contenidos largos. Especies visibles tanto en PLACA como en VÍNCULOS; «Leer más al respecto» expande el catálogo local de especies. El aviso de MUESTRARIO comparte el tratamiento de fondo.
> - Recursos originales del cartel en `src/assets/cartel-*`: textura PNG, línea SVG, colores BL SVG y flecha SVG. Ambos builds los incorporan como data URLs; placa.html sigue siendo autónomo (ahora ~4,6 MB) y no depende de URLs temporales de Figma. El fondo BL usa la textura original; los demás universos neutralizan su color y aplican su degradado propio. Los chips conservan sus colores sin invertirlos con el texto. PowerShell build y pruebas con DOM simulado aprobados (recursos, siete paletas, cobertura de 35 especies, datos, cierre, límites y expansión); revisión visual de la implementación pendiente.
> - Entrada del control de zoom según el dibujo de Paco: `progresoArco`/`animarArcoZoom` en app.js. Primero aparece el punto en el centro geométrico del arco; la línea crece simétricamente hacia sus dos extremos; luego entran los remates y la manija, y por último +/−. Entrada de 950 ms al abrir PLACA (también en la carga inicial); salida inversa de 650 ms al pasar a VÍNCULOS. Se eliminaron los display:none/visibility:hidden que cortaban este control de golpe. Toque desactivado mientras entra, sale o está oculto; reversión desde el progreso actual y movimiento reducido respetados. Comprobados con reloj simulado: orden de las fases, simetría, signos posteriores a la línea completa, salida inversa, reversión sin salto e interacción. Revisión visual real pendiente.
> - Navegación inferior en carrusel, según la grabación y Figma `5WH8mdXfrLFN3qRFQy1X7p`, frames `202:641` y `202:668` dentro de `392:8010`. La reacción `202:644` usa SMART_ANIMATE de 0,3 s con EASE_OUT. `prepararMenuVistas`/`animarMenuVistas` conservan los IDs originales: el elegido pasa a la izquierda y crece a 72 px; los otros quedan a 24 px; una copia decorativa permite que el saliente salga por la izquierda y vuelva por la derecha. La franja inferior se bajó 22 px para dar lugar al título MUESTRARIO. No hay cambios en la cabecera. MUESTRARIO conserva su aviso pendiente y devuelve el carrusel a la vista real al cerrarse; la grilla todavía no está implementada. Comprobados con DOM simulado: orden, animación, selección exclusiva, teclado, interrupciones, temporizadores y movimiento reducido. Revisión visual de la implementación pendiente.
> - Ampliación posterior de Paco: PLACA y VÍNCULOS crecen 12 % (`AMPLIACION_PLACA` en app.js). El centro baja 41,4 px para conservar el borde superior del diagrama circular y aprovechar el espacio inferior. Radio de VÍNCULOS = 386,4 px; arco de zoom = radio + 95 px. Se descartó 16 % por solapamiento geométrico de una muestra seleccionada con MUESTRARIO. La zona de toque y el filtro de textura se calculan desde el nuevo centro/radio; no volver a fijarlos con medidas antiguas.
> - Color y textura (pedido posterior de Paco): cada vínculo toma los grupos de sus especies compartidas usando `GRUPOS_ESPECIES`, incorporado por ambos builds desde `colonias.csv`. B = rosa #f58bc3, L = amarillo #ffc21c, M = verde #6a983a. Si comparten varios grupos se usa un degradado entre esos colores, con extremos sincronizados con las muestras. Seleccionar cambia grosor y opacidad, conserva el color. Toda la red comparte un filtro SVG con blur de 0,35 px y grano fijo recortado a los trazos. Comprobado con datos reales: 265 vínculos B, 508 L, 188 M y 8 BL, incluidos colores y degradados durante la transición. La intensidad visual del efecto queda para revisión de Paco en el navegador.
> - Transición corregida siguiendo `espora/atlas/graficos/superposicion/app.js`: `mezclaVista` interpola con requestAnimationFrame posición, tamaño y opacidad de las muestras. Los extremos de cada hilo se recalculan con esas mismas coordenadas en cada cuadro. No agregar una transición CSS a `.it` porque desincroniza líneas y muestras. Dura 1,1 s, admite invertir el recorrido desde el punto actual y respeta movimiento reducido. Prueba con reloj y DOM simulados: extremos de las 969 líneas durante el recorrido, escala, reversión sin salto, retorno exacto, filtros y movimiento reducido aprobados; sigue pendiente revisión visual real.
> - Es un diagrama circular sin cintas con las mismas 146 muestras (se reutilizan sus canvas), ordenadas por grupo y fecha. Sus tamaños se reducen con un factor común para distribuirlas en la circunferencia.
> - Criterio confirmado por Paco: dos muestras se conectan cuando comparten al menos una especie de bacteria, levadura o moho. La base actual produce 969 conexiones únicas, sin enlaces de una muestra consigo misma.
> - `src/vinculos.js` contiene distribución, conexiones y cambio de vista. `build.ps1` y `build.py` incorporan los CSV de `base/` al HTML; no hay fetch ni servidor requerido. Se vincula por receta + id para conservar la identidad visual.
> - Tocar VÍNCULOS abre la vista; tocar PLACA vuelve. Se conservan selección, ficha, filtros, búsqueda y zoom de PLACA. En VÍNCULOS se ocultan el zoom y los aros temporales. La ficha incluye las especies; la selección destaca las conexiones de esa muestra.
> - Comprobado con DOM simulado: sintaxis del HTML generado, cobertura de las 146 muestras con especies, circunferencia, conexiones, selección, filtros, búsqueda y retorno repetido a PLACA. Pendiente revisión visual en navegador real: el navegador de revisión bloqueó el protocolo file://.

> **Actualización 13/11 (Claude Code), pisa lo que sigue donde choque:**
> - La placa ya no ubica muestras al azar. Cada elemento de las dos recetas de Paco (`src/receta_A.json` = colonias-web, `src/receta_B.json` = colonias-web (1)) es una muestra, con el mismo centro y el mismo tamaño, en la caja de 817 px. Son 146 muestras.
> - Fecha, colonias y grupo se deducen de cada elemento: distancia al centro → fecha (log, presente al centro), tamaño → colonias (log), paleta → grupo. Estado: anillo → registro digital, borde irregular → en conservación, el resto al azar según la antigüedad. El estilo es el del elemento original con el contorno de su estado.
> - Quedan como fondo (no se tocan): el anillo grande de la placa, los 3 halos difusos de cada receta y los anillos concéntricos a las colonias grandes.
> - Cada receta es una capa; las dos se superponen con `darken`. `fondo.json` y `fondoMid` se eliminaron. `datos.js` ahora solo tiene los nombres de origen por grupo.
> - Tamaño en pantalla: la caja de las recetas va a 817 × 1,25 px (`ESCALA_FIGMA` arriba de `app.js`), para que la mancha mida lo mismo que en el Figma. Pedido de Paco.
> - Aros de años: se dibujan en dos canvas (brillo y línea) hasta el borde verde de la placa, que queda fijo al hacer zoom. Cada año entra y sale con un fundido según el espacio que tiene (rangos de 50, 10, 5 y 1 año), en vez de prenderse y apagarse de golpe. Las muestras se desvanecen al llegar al borde.
> - Lista: la caja tiene aire arriba y a los costados, así las filas se esfuman al subir y el desenfoque de abajo no se corta.
> - Pantalla completa: el diseño (1920 × 1100) se escala para entrar entero y el marco se estira hasta los bordes. `ajustar()` calcula lo que sobra (DX, DY) y corre los grupos `#centro` (placa, zoom, ficha: centrado), `#derecha` (buscador, lista y vistas: a la derecha) y los de abajo. Los grupos no usan `transform`, para no romper los modos de fusión.
> - Navegación (Figma de Paco, 13/11): VÍNCULOS y MUESTRARIO van al lado de PLACA, abajo a la izquierda. Arriba a la izquierda, a la altura del buscador: "[01.0] MUESTRAS DE PLACAS".
> - **Pendiente para el Muestrario:** botón "VER POR ESPECIE" abajo a la derecha (donde antes estaba MUESTRARIO). Solo va en el Muestrario, no en Placa ni en Vínculos. Al tocarlo, el muestrario se reorganiza agrupando las muestras por especie (usar `base/colonias.csv` y `base/especies.csv`).
> - Para armar `placa.html` sin Python: doble clic en `armar.bat` (usa `build.ps1`).

Para Claude Code: este documento explica qué hay construido, cómo está armado y qué hay que saber antes de tocarlo. Paco (diseñador gráfico, casi no programa) te va a dar las correcciones directamente. Respondele en español, con lenguaje simple, y dejá el prototipo fácil de abrir.

Lo que diga Paco manda sobre este documento y sobre `05_placa_coleccion.md`. Dos aclaraciones de Paco (13/11) pisan al 05:
- Las recetas de estado (Activa, En conservación, Montada, Registro digital) **no se siguen al pie de la letra**: cada muestra lleva pequeñas variaciones para que no sean idénticas, pero que se lea a qué categoría pertenece. Lo que importa es que quede estéticamente placentero y creíble para público general, no que sea fiel a la realidad.
- El ángulo es **totalmente libre**: no hace falta agrupar por hallazgo.

## 1. Qué es

Pantalla de inicio "PLACA" del proyecto Micromundos (Museo de Ciencias Interactivo, UNC). Pantalla táctil de 27", inclinada, uso de pie, público general, **sin hover**. Es una placa de Petri gráfica: cada colonia es una muestra de la colección ficticia. Tocar una muestra la selecciona (crece ~25 %, el resto baja de opacidad y se desenfoca) y abre una ficha flotante.

Sistema gráfico: base de blur, grano y color. Tipografía Arimo. El blur depende de la capa (lo lejano más desenfocado, lo que se lee, nítido). Las capas decorativas no deben bloquear el toque.

## 2. Los archivos

Todo el prototipo termina en **un solo HTML** (`placa.html`), generado desde `src/`.

| Archivo | Qué contiene |
|---|---|
| `placa.html` | El resultado final. Se abre con doble clic (necesita internet solo para la fuente Arimo de Google Fonts). |
| `src/plantilla.html` | Estructura HTML y todo el CSS. Tiene cuatro marcadores (`/*DATOS*/`, `/*COLONIAS*/`, `/*FONDO*/`, `/*APP*/`) que `build.py` reemplaza. |
| `src/app.js` | Toda la lógica: posiciones, zoom, selección, ficha, filtros, lista, animación de entrada. |
| `src/datos.js` | La colección ficticia: 66 muestras en `MUESTRAS_RAW`. |
| `src/colonias-core.js` | Copia del renderer `colonias.js` de Paco, **con dos parches míos** (ver 4). |
| `src/fondo.json` | Los elementos grandes de las dos composiciones circulares de Paco (`A`, `B`) y los medianos (`mid`). |
| `build.py` | Arma `placa.html` uniendo lo anterior. Correr: `python3 build.py`. |
| `shot.py` | Abre `placa.html` en Chrome sin pantalla y saca capturas (usa Playwright). Ejemplo: `python3 shot.py 'click:870,540' 'shot:s2.png'`. |
| `referencia/` | La imagen de referencia de Paco y su CSS de Figma (`placa_css.txt`), si están en el paquete. |

Los paths dentro de `build.py` y `shot.py` son relativos a la carpeta del proyecto. Si no corren, ajustar la línea de la ruta base.

## 3. Cómo está pensada la pantalla

Escenario fijo de **1920 × 1100** escalado para entrar en cualquier ventana (`ajustar()`). Todas las medidas salen del CSS de Figma que pasó Paco: cabecera, regla con gradiente, leyenda (x=39, y=284), lista (x=1438, y=284), título PLACA (72 px, blur 3), VÍNCULOS y MUESTRARIO, buscador, elipses punteadas de colores y las dos manchas `#08221E` con `mix-blend-mode: difference`. Los textos son `#fff` con `mix-blend-mode: difference` (sobre el fondo claro se ven oscuros), igual que en Figma.

Capas de la placa (de atrás hacia adelante):
1. Dos composiciones circulares de Paco dibujadas en vivo con Colonias (`fondoA`, `fondoB`), con `mix-blend-mode: darken`, que al superponerse forman la placa.
2. Una capa de colonias medianas más desenfocada (`fondoMid`), que da profundidad.
3. Aros de años: línea punteada fina con glow, etiquetas en píldoras blancas.
4. Las 66 muestras, cada una un canvas de Colonias.
5. Una capa transparente de toque (`#toque`) que resuelve qué muestra se tocó.
6. Ficha flotante y avisos.

### Codificación (las cinco variables)
- **Color = grupo.** Rosa bacterias, amarillo levaduras, verde mohos. Las combinaciones mezclan paletas. Las paletas de B, L, M y B+L son las de Paco. **Las de BM, LM y BLM son propuesta mía y siguen pendientes de definir con Paco** (están en `PALETAS`, arriba de `app.js`).
- **Distancia al centro = fecha**, presente al centro, escala **logarítmica**: `r = K · ln(1 + edad / TAU)`. `K` es el zoom. `TAU = 0.6`.
- **Ángulo = libre**, al azar con semilla fija (`mulberry(20261113)`, siempre la misma placa) y una relajación para que las muestras vecinas no se tapen tanto (`relajar()`). Solo se mueve el ángulo, nunca el radio.
- **Tamaño = cantidad de colonias**, escala log: `d = D_MIN + (D_MAX − D_MIN) · ln(n) / ln(N_MAX)`, con `D_MIN=14`, `D_MAX=80`, `N_MAX=300`. Más de 300 se guarda como 301 y la ficha dice "Más de 300".
- **Forma = estado.** Activa: disco liso. En conservación: borde irregular y asimétrico. Montada: festón de ~16 lóbulos. Registro digital: anillo con centro vacío. Cada muestra recibe una variación única en `estiloMuestra()` (desenfoque, halo, grano, núcleo, punto medio, cantidad de anillos, rotación, paleta y forma del borde).

### Zoom
El arco con flecha al lado de la placa controla el zoom: el **+** acerca y el **−** aleja, y se puede arrastrar el dedo sobre el arco (el puntito marca la posición). La variable es `zoomT` (0 a 1), que se convierte en `K` entre `K_MIN=40` y `K_MAX=420`. Las muestras más allá de `R_VISIBLE=360` px se desvanecen (`R_FUNDIDO=50`) y los aros de años aparecen u ocultan solos para no apilarse (años en un arreglo fijo: 2026, 2025, 2024, 2023, 2022, 2020, 2018, 2015, 2010, 2005, 2000).

### Selección
`seleccionar(muestra)`: agrega la clase `sel-on` a la pantalla (baja opacidad y sube blur de las demás, de los fondos y de los aros), marca la elegida (`.m.on`, escala 1.25), abre la ficha y mueve la lista. Se cierra con la × de la ficha o tocando un espacio vacío. Se puede seleccionar tocando la placa o una fila de la lista. Si la muestra queda fuera del campo visible por el zoom, el zoom se acomoda solo.

### Extras que agregué y no estaban en el CSS de Paco (confirmar si los quiere)
- Filtros tocando la leyenda (por grupo y por estado) y buscador que filtra la placa y la lista.
- Ficha flotante (diseño mío): código, origen, grupo, estado, fecha, colonias.
- Aviso flotante al tocar VÍNCULOS y MUESTRARIO ("queda para la próxima etapa").

## 4. Cosas técnicas importantes

- **`colonias-core.js` es una copia parchada.** La versión de `colonias.js` que Paco exportó **no soporta `studyLobes`** (el festón de *Montada*). Yo se lo agregué (y un `studyDepth/studyUneven` aproximado), más dos parámetros propios: `asym` (asimetría del borde de *En conservación*) y `ringFreq` (cantidad de anillos del relleno). Los parches están marcados con el comentario `[parche Micromundos]`. **Lo correcto es pedirle a Paco que exporte un paquete nuevo desde la versión actual de la herramienta Colonias** y reemplazar el core. Mi festón es una aproximación, no es idéntico al de su herramienta.
- Cada muestra es una instancia de `mountColonias` con una receta de un solo elemento (`pieza()`), y el tamaño visible sale de `lado = d / 0.65 / 0.75` (el disco ocupa 65 % del canvas y la pieza el 75 % de la caja).
- El renderer dibuja píxel por píxel con grano y blur, así que 66 muestras tardan unos segundos en pintarse al abrir. Por eso la entrada es una animación. Si hay que ir más rápido: bajar resolución de las instancias o cachear.
- `.m` usa `mix-blend-mode: darken` (como el PNG de la placa en Figma); al seleccionar pasa a `normal` para que la elegida no se opaque.
- Respetar el criterio del proyecto: sin hover, objetivos táctiles cómodos, capas decorativas con `pointer-events:none`.

## 5. Dónde probablemente se aleja de lo que Paco esperaba

Paco dijo que "no quedó como esperaba" sin detallar. Mis hipótesis, para que sepas dónde mirar primero; **confirmá con él antes de cambiar nada**:

1. **Las muestras se ven más duras y más "diana"** (anillos concéntricos nítidos) que en su imagen de referencia, donde las colonias son manchas mucho más blandas, grandes y fundidas entre sí. Probar subir el desenfoque (`s.blur`), bajar la cantidad de anillos (`ringFreq`) y subir `halo`/`core`, o dibujar las muestras más grandes y superpuestas.
2. **La placa de fondo.** En Figma la placa es un PNG exportado de Colonias (`Placa de petri - colonias microbianas.png`, 817×817, `darken`). Yo la rendericé en vivo con los elementos grandes de las dos composiciones y quité los chicos. Puede que el resultado no se parezca a ese PNG. Pedirle a Paco el PNG o la receta exacta de las dos composiciones superpuestas sería lo más fiel.
3. **Los aros.** El CSS tenía aros lineales cada 60 px; Paco pidió escala logarítmica y yo mostré solo una selección de años para que no se apilen.
4. **Detalles de CSS no replicados al píxel:** la lista (Frame 314) tiene `filter: blur(40px)` en Figma; yo hice un desenfoque progresivo por fila. Los íconos de la leyenda son canvas de Colonias, no los PNG de Figma. Falta revisar tamaños, espaciados y pesos de texto contra la referencia.
5. **El arco de zoom** es un arco SVG concéntrico a la placa; en Figma es un trazo de 2 px con flechas, y puede que la posición o curvatura no coincida.

## 6. Cómo trabajar con Paco

- Paco hace referencias en Figma y diseñan juntos; vos tocás el código. Antes de un cambio grande, mostrá una captura (`shot.py`).
- Cada cambio visual: regenerar con `python3 build.py`, abrir `placa.html` y revisar la captura. Comprobar también la selección, el zoom y los filtros, porque tocan casi todo.
- Cuando se decida algo importante, recordarle a Paco actualizar `04_decisiones_y_estado.md`.
- Pendientes abiertos (del 05): orientación del tiempo (hoy: presente al centro), paletas de combinaciones, si los halos de fondo codifican algo o son atmósfera, tamaños mín/máx definitivos y `nMax`, qué es una "relación" para el esquema de conexiones (VÍNCULOS), y cómo se ven los filtros sobre la placa.

## 7. Prototipo publicado (versión de esta sesión)

https://claude.ai/artifact/W28mWm5YrU19ECYshQ4ysB (privado, de Paco).
