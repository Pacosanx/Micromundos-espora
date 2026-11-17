# Micromundos · Auditoría técnica y checklist de trabajo

Fecha de la auditoría: 17/11/2026 · Rama de trabajo: `ccr-0023a5d1-9rvb9o` · Último commit revisado: `73461c6`
Alcance: todo el repositorio (460 archivos versionados, ~224 MB sin `.git`). **No se modificó ningún archivo del proyecto**; este es el único archivo nuevo.

---

## 0. Resumen ejecutivo

**Estado general.** Es un prototipo web de una sola página (`placa.html`, 4 MB, generado desde `src/`) con cuatro zonas: MUESTRAS (placa / vínculos / muestrario), GLOSARIO (bacterias, levaduras, mohos, fichas) y TU PLACA (composición libre). Funciona: carga sin errores de consola, los datos validan (`BASE OK`) y las verificaciones automáticas existentes pasan. Los problemas no son de "se rompe", sino de **comprensión y experiencia de uso** (lo que marcan los docentes), de **legibilidad (blur)** y de **reproducibilidad / documentación** del proyecto.

**Los 5 riesgos principales**
1. 🔴 **El blur aplicado a texto y controles hace que la interfaz se lea borrosa** (la devolución "¡Arreglar blur!"). Medido: 25 textos con blur en la pantalla PLACA y 40 en TU PLACA, hasta 2,1 px en la navegación y 1,8 px en "GUARDAR PLACA". Además contradice la propia escala tipográfica aprobada ("lectura nítida, blur 0").
2. 🔴 **Un evaluador que ejecute `python3 build.py` (el comando que indica la documentación) obtiene un `placa.html` sin la pantalla TU PLACA actual** (1,8 MB en vez de 4 MB, sin menú circular, sin biblioteca, sin generador). Sólo `build.ps1` (Windows/PowerShell) arma lo correcto.
3. 🔴 **No hay `README.md`.** Las instrucciones están en un documento de traspaso entre IAs, desactualizado (habla de 66 muestras; hay 146) y en `base/LEEME.md` (sólo sobre datos). Para un proyecto evaluado por docentes es el hueco de documentación más visible.
4. 🟠 **Falta de onboarding y de pistas de uso** en toda la app (la primera pantalla sólo dice "TOCÁ PARA COMENZAR"; nada explica arrastrar, zoom, tocar círculos del Glosario, etc.) y **TU PLACA no es protagonista** (3.ª pestaña, sin título propio, placa casi invisible cuando está vacía).
5. 🟠 **Verificación no reproducible**: los tests (`src/verificar-*.cjs`) necesitan `linkedom`, que no está en `package.json`, y no hay `npm test`. Además hay riesgos no comprobados acá (Safari/iPad, fuente de Google Fonts sin internet).

**Orden recomendado de ataque** (detalle en §4)
`A` Dejar un único build y un README mínimo que funcione (para poder iterar sin miedo) → `B` Blur → `C` Onboarding + cartelitos → `D` TU PLACA (protagonismo, menú, composiciones, reacciones, simbiosis) → `E` Variedad de colonias → `F` Guion de grabación → `G` Limpieza y documentación final.
El bloque `D` es el más grande; `B` y `C` son rápidos y los docentes los pusieron primero.

---

## 0-bis. Actualización 17/11/2026 · respuestas de Paco

**Decisiones recibidas y su efecto en el plan**
1. **Blur:** el problema es que el blur de la **tipografía** es demasiado fuerte. Decisión: **quitar el 100 % del blur tipográfico por ahora** (B-2). El blur decorativo (colonias, fondos, vidrio de carteles) no se toca.
2. **Herramienta generadora:** es **COLONIAS** (`Pacosanx/colonias-espora`). La leí (ver §3-bis).
3. **Ir primero a TU PLACA:** es sólo el orden del video (F-1). Se descarta el acceso directo por URL (F-2).
4. **"Forzar simbiosis":** ahora significa **unir dos colonias**, ya sea en una más grande o en una forma de 8 / infinito (D-10 redefinido).
5. **Evaluación:** los docentes **no usan la app**; corrigen desde el **video que prepara Paco, grabado con mouse**. El plan final sigue siendo pantalla táctil.

**Cambio de prioridades por (5):** lo que cuenta es lo que **se ve y se entiende en el video**. Suben: blur de texto (B), onboarding/cartelitos (C: el video debe explicarse solo), TU PLACA (D) y el guion (F). Bajan: Safari/iPad (H-11, A-5, B-4), fuente sin internet (H-06, A-3) y las áreas táctiles de 48 px (H-05, A-4; siguen valiendo para la versión táctil final, no para la evaluación). H-01 (README) y H-02 (`build.py`) dejan de ser críticos para los docentes pero se mantienen como 🟠/🟡 por la integridad del repositorio.

**Conflicto nuevo a tener presente:** `RELACIONES.md` de COLONIAS registra que Paco, el 13/11, **rechazó** que la Simbiosis "agregue una tercera forma o agrande el área". La acción UNIR sí hace eso, así que debe ser una **acción distinta y explícita** (botón), no la reacción pasiva de Simbiosis, que sigue siendo intercambio de color sin crecer.

### 3-bis. Qué hay en COLONIAS y qué conviene tomar (respuesta a D-09)

Leí el repositorio (`README.md`, `RELACIONES.md`, `renderer.js`, `relations-renderer.js`, `verify-relations.cjs`, `index.html`). **No lo ejecuté.**
- **Modos:** Elemento, Composición, Micro y **Relaciones** (`#relaciones`). Edición directa y numérica de elementos (`direct-edit.js`, `numeric-edit.js`), exportación PNG/receta JSON/paquete web con `mountColonias`.
- **Catálogo de formas** del renderer: disco, anillo, cápsula, **"Dos colonias" (`pair`)**, banda, arco, fragmento, cotton, hairy, branching, fan, wrinkled, spotted, zoned, patchy, granular, rimmed, smoothcol.
- **Relaciones** (`relations-renderer.js`): Simbiosis, Rechazo, Barrera y Neutro con parámetros (intensidad, ancho, blur, grano, irregularidad, **progreso "desarrollo del encuentro"**), receta v3 y pruebas (`verify-relations.cjs`). Es una versión **mucho más elaborada** que las reacciones de TU PLACA (`tu-placa-v12.js:101-121`: un círculo de gradiente y dos máscaras). Esto responde casi directo a D-10: la base del "efecto notorio" ya existe en tu herramienta.
- **`studyLobes` ya existe en el renderer publicado** (`renderer.js`), mientras que `src/colonias-core.js` lo tiene como parche propio (`[parche Micromundos]`). Es probable que se pueda **reemplazar el core por el actual** y eliminar los parches. No lo comprobé: hay que comparar el resultado visual de las 146 muestras.

**Qué implementar de COLONIAS (propuesta, para que decidas):**
1. **Reacciones de TU PLACA** ← portar `relations-renderer.js` (con `progress` animado al aparecer). Reemplaza H-25. *Esfuerzo L.*
2. **Composiciones sembrables** ← los presets de modo Composición (el generador ya es una copia de ese modo). *Ya cubierto en D-7.*
3. **UNIR en 8/infinito** ← formas `pair`/`capsule` con su control de separación (D-10).
4. **"Momento de diseñar tu propia colonia"** ← versión acotada del modo Elemento (E-3). Respuesta corta a tu pregunta: **sí sirve**, porque convierte a TU PLACA en algo creado por la persona y no sólo ensamblado; conviene hacerlo con pocos controles.
5. **Sincronizar el core** (reemplazo de `colonias-core.js`) como tarea técnica previa (nuevo ítem **Q-9** abajo).

Nuevos ítems de checklist:
- [ ] **Q-9 · M** Comparar `colonias-core.js` con `renderer.js` de COLONIAS; si da igual o mejor, reemplazarlo y borrar los `[parche Micromundos]`. Validar con una captura de las 146 muestras antes/después. *dep:* ninguna.
- [ ] **D-13 · L** Portar `relations-renderer.js` a TU PLACA (Simbiosis/Rechazo/Barrera/Neutro con `progress`), reemplazando `dibujarReacciones`. *dep:* Q-1, Q-9. Sustituye en la práctica el "rediseño" de D-9.
- [ ] **F-4 · S** Verificar en la grabación con mouse: cursor visible, todos los textos nítidos (B-2), cartelitos legibles, nada depende de hover.

---


## 1. Qué se hizo y qué NO se pudo comprobar

### Ejecutado (resultados reales)
| Acción | Resultado |
|---|---|
| `python3 base/validar_base.py` | `BASE OK` (146 muestras, 241 registros, 39 especies, 12 fichas, 21 términos). Un aviso: *Corynebacterium glutamicum* sin muestras (ya documentado como no-error). |
| `node src/verificar-flujos.cjs` (instalando `linkedom` **fuera** del repo) | Pasa. Recorridos con DOM/canvas **simulados**. |
| `node src/verificar-referencias.cjs` | Pasa. |
| Abrir `placa.html` en Chromium real (Playwright) vía `previsualizar.cjs` | Sin errores de consola ni recursos fallidos. Pantalla de apertura visible en ~3,6 s (máquina de pruebas, local). Capturadas: apertura, PLACA, selección con ficha, GLOSARIO, TU PLACA, menú circular (reposo y manteniendo apretado). |
| Medición en el navegador de blur, tamaño de letra y área táctil de cada elemento con texto | Ver H-04 y H-05. |
| ESLint sobre el script ensamblado | 0 errores reales (2 `no-undef` de `removeEventListener` son falsos positivos); 13 avisos de código sin uso (H-12). |
| `python3 build.py` en una **copia** del repo (en el directorio temporal) | Genera 1,8 MB y **sin** `montarMenuTuPlaca`, `montarBibliotecaTuPlaca`, `generarComposicionTuPlaca` (H-02). |
| Comparar `placa.html` con `src/` | Coincide con `build.ps1` (las pequeñas diferencias en `carteles.js`, `glosario.js` y `pantallas-detalle.css` son marcadores `__…__` sustituidos por el build). |

### No comprobado (decirlo explícitamente)
- **Safari / iPad / pantalla táctil real**: sólo se probó Chromium en escritorio. `ctx.filter = blur()` no está soportado en Safari (ver H-11): *riesgo a verificar*, no hecho comprobado.
- **Fuente Arimo sin internet** (la carga es desde Google Fonts, H-06): no se probó offline.
- **Publicación en GitHub Pages / sitio publicado** (`PUBLICACION.md`): no se accedió a la URL.
- **Aspecto visual de las reacciones** (simbiosis/rechazo/barrera): se analizó el código (`src/tu-placa-v12.js:101-121`) pero no se montó una escena con las tres para capturarla.
- **La grabación / la presentación del proyecto**: no existe en el repositorio.
- **Figma** (referencia de diseño): no se consultó; no sé qué dice el diseño original sobre el blur en textos.
- Las citas bibliográficas de `base/fuentes_colonias_propuesta.csv` no se verificaron.

---

## 2. Hallazgos

Leyenda: 🔴 Crítico · 🟠 Alto · 🟡 Medio · 🟢 Bajo. Cada uno con ID para referenciarlo desde el checklist.

### Blur, legibilidad y accesibilidad
| ID | Sev. | Dónde | Problema | Cómo corregirlo |
|---|---|---|---|---|
| H-04 | 🔴 | `src/plantilla.html:73` (`#cabecera .fila` `blur(1.5px)`), `:132` (`#titulo` 3 px), `:138` (`.vista` 2,5 px); `src/tu-placa-v12.css:21` (modo inactivo `blur(1px)`), `:64` (`.tp-guardar` `blur(1.5px)`), `:62` y `:97` (acciones y GENERAR `.6px`), `:82` (botones secundarios del menú `1.5px`), `:58` (texto vacío `.7px`), `:6` (indicación `.4px`) | Medido en el navegador: PLACA 25 textos con blur (nav 2,1 px acumulado con el de los botones, leyenda 0,8, "LISTADO COMPLETO" 0,8); TU PLACA 40 textos (tabs LEVADURAS/MOHOS/MEZCLAS 1,3; "GUARDAR PLACA →" 1,8; navegación 2,1). La escala aprobada (`ESCALA_TIPOGRAFICA_PROPUESTA.md`: "lectura blur 0, máx. 4 valores") no se cumple: hay ≥10 valores distintos (0,3 / 0,4 / 0,5 / 0,6 / 0,7 / 1 / 1,3 / 1,5 / 1,8 / 2,1 / 2,5 / 3). | Definir 4 niveles en variables (`--blur-lectura:0`, etiqueta, navegación, display) y reemplazar los `filter:blur(...)` sueltos. Texto interactivo y de lectura = 0. Reservar blur para fondos, colonias y títulos decorativos. Verificar con el mismo script de medición (ver checklist B-1). |
| H-04b | 🟡 | `src/plantilla.html:139-146` | Comentario del propio código: el vidrio (`backdrop-filter`) no desenfoca lo que está en `mix-blend-mode:difference`; el proyecto lo resuelve con una lista de selectores `body.con-cartel …`. Es frágil: cada texto nuevo con `difference` hay que sumarlo a mano. | Documentarlo en el README técnico y cubrirlo con una prueba visual (captura de referencia). |
| H-05 | 🟠 | Varios (medido en navegador) | **16 controles por debajo de 48×48 px de diseño** (medido en TU PLACA; los 3 de navegación también están en PLACA): navegación (95×20, 91×20, 86×20), modos/tabs de la biblioteca (alto 34–36), `GENERAR COMPOSICIÓN` (24 px de alto), `DESHACER/REHACER/VACIAR` (20), `GUARDAR PLACA` (28), casilla "Mostrar reacciones" (20×20). Pantalla táctil de pie: la propia escala exige 48 px. | Agregar `padding`/`min-height:var(--area-tactil)` sin cambiar la letra; para la casilla, ampliar el `label`. |
| H-17 | 🟡 | `src/tu-placa-v12.css:21,22,58`, `.tp-biblioteca__mode` | Opacidades de .45/.55 sumadas a blur sobre fondo claro: contraste insuficiente (no medido numéricamente; es estimación visual). El estado "Registro digital" y los códigos A-01… quedan casi ilegibles (captura `TU PLACA`). | Medir contraste real (WCAG AA) y subir opacidad mínima a ≥ .6 como pide la escala. |
| H-18 | 🟡 | `src/plantilla.html:288-297` | Sólo una consulta `prefers-reduced-motion`; no hay `aria-live` en el flujo de MUESTRAS. Los canvas de las muestras no tienen texto alternativo propio (la información está en la ficha). | Revisar con lector de pantalla y completar etiquetas; prioridad baja frente al resto. |

### Build, pruebas y dependencias
| ID | Sev. | Dónde | Problema | Cómo corregirlo |
|---|---|---|---|---|
| H-02 | 🔴 | `build.py:13` (sólo inserta `tu-placa.js`), `06_traspaso_placa_claude_code.md:75,132`, `shot.py` | `build.py` quedó desactualizado: no incluye `tu-placa-biblioteca/menu/generador/v12`, `ficha-galeria`, el pie animado ni la lupa. Verificado: `placa.html` resultante = 1,8 MB y sin menú circular/biblioteca/generador (queda el TU PLACA antiguo). `mensaje_para_codex.md` ya lo advertía ("usá `armar.bat`"), pero el documento principal sigue indicando `python3 build.py`. | Opción recomendada: **un solo build**. Portar `build.ps1` a Python (o a Node, que el proyecto ya usa) y borrar el otro; o eliminar `build.py` y documentar sólo uno. Agregar una verificación que compare marcadores `/*…*/` sin reemplazar. |
| H-03 | 🟠 | `src/verificar-flujos.cjs:1,4`, `src/verificar-referencias.cjs:3`, `package.json` | Los tests requieren `linkedom` ("instalado fuera de las fuentes"); no está en `package.json` y no hay script `test`. Hay que instalar a mano y pasar la ruta como argumento. Nadie más puede reproducir el "pasa". | Agregar `linkedom` como `devDependency` y `"test"` en `package.json` que corra validador + ambos verificadores. |
| H-19 | 🟡 | `src/tu-placa-generador.js:32,36` | `generarComposicionTuPlaca(seed)` usa `Math.random()` (default de `seed` y semilla de cada elemento), así que **la misma semilla no da la misma composición**. No se puede testear ni reproducir una composición bonita. Está exportado con `module.exports`, o sea que es testeable en Node. | Usar un PRNG con semilla (como `hash`) para todo; test: misma semilla ⇒ mismo resultado. |
| H-20 | 🟡 | `package.json` | Dependencias (`react`, `react-dom`, `@figma/expressive-components`, `esbuild`) existen en npm (se comprobó con `npm view`), pero sólo sirven para recompilar la lupa (`compilar-lupa.cjs`) y el resultado (`src/assets/lupa-figma.js`) ya está versionado. `node_modules` no está presente, así que `npm run build:lupa` no corre sin `npm install`. | Documentar que son opcionales; moverlas a `devDependencies`. |
| H-21 | 🟢 | `.gitignore` | Comienza con BOM (`EF BB BF`). Verificado con `git check-ignore`: la regla `node_modules/` **sí** funciona, no es un bug. | Re-guardar sin BOM por prolijidad. |

### Código muerto y calidad
| ID | Sev. | Dónde | Problema | Cómo corregirlo |
|---|---|---|---|---|
| H-12 | 🟡 | `src/tu-placa.js` (10 KB, módulo completo anterior), `src/pantallas-detalle.js:74` (`prepararBlurPortadaDetalle`), `:546` (`semillaNombre`), `src/app.js:438` (`chips`), `:561` (`avisar` → deja huérfano `#aviso`/`#avisoCo`, `plantilla.html:419`), `src/tu-placa-v12.js:3,9` (`ns`, `ruta`, `frame` sin usar) | Código que no se ejecuta en el build vigente. `tu-placa.js` sólo lo usa el `build.py` obsoleto y confunde (existen dos `prepararTuPlaca`). | Borrar tras confirmar con búsqueda; mantener un solo módulo de Tu Placa. |
| H-22 | 🟡 | `src/tu-placa-v12.js` (142 líneas, una función `prepararTuPlaca` con ~140 líneas en bloques densos de hasta 600 caracteres por línea), `src/pantallas-detalle.js` (661 líneas), `src/app.js` | Funciones muy largas, estado compartido por cierres, nombres mezclados español/inglés (`sprite`, `crear`, `Simbiosis`, `tamano`/`size`). Dificulta agregar las mejoras pedidas (menú, composiciones, simbiosis). | Antes de ampliar Tu Placa, separar: estado (items/historial), render de reacciones, interacción de siembra, exportación. No es necesario reescribir todo. |
| H-23 | 🟢 | `src/tu-placa-v12.js:25,138`, `src/tu-placa.js` | `catch{}` vacíos al leer/guardar `localStorage`. Es razonable (modo privado), pero no avisa al usuario si no se guardó. | Mantener, pero comentar la intención. |
| H-24 | 🟢 | `src/app.js:194,386`, `src/glosario.js:150`, `src/pantallas-detalle.js:169,461` | `innerHTML` con valores interpolados. Hoy todos salen de datos propios del proyecto (CSV/JSON), no de entradas del usuario → sin riesgo de XSS real; sería un riesgo si en el futuro se muestra texto que escribe el usuario. | Usar `textContent` para cualquier texto escrito por el usuario (ej. un posible nombre de placa). |

### Funcionalidad y consistencia
| ID | Sev. | Dónde | Problema | Cómo corregirlo |
|---|---|---|---|---|
| H-06 | 🟠 | `src/plantilla.html:9-11` | La tipografía Arimo se carga de Google Fonts. Sin internet cae a Arial (otro ancho de letra: puede romper cartelitos medidos al píxel). `06_traspaso` lo reconoce, pero `placa.html` se describe como "autónomo". En una sala o con evaluadores offline, el aspecto cambia. | Incluir Arimo 400/700 como `.woff2` local (`@font-face`); el servidor de `previsualizar.cjs` ya contempla `.woff2`. |
| H-07 | 🟠 | `src/plantilla.html:320-324`, `src/apertura.js` | La portada sólo dice "TOCÁ PARA COMENZAR". No hay ninguna capa de ayuda: ni en la portada, ni en PLACA (zoom por arco, tocar, arrastrar cartel, año), ni en GLOSARIO (círculos tocables), ni en TU PLACA (sólo textos tenues). Búsqueda de "ayuda/onboarding/tutorial/instrucciones" en `src/`: **0 resultados**. | Ver C-1 a C-5 del checklist. |
| H-08 | 🟠 | `src/tu-placa-v12.js:4-7` vs `src/tu-placa.js` (versión anterior con `<h1>TU PLACA</h1>`) | La v12 no tiene título propio de pantalla: "TU PLACA" aparece sólo como etiqueta pequeña y borrosa de navegación (tercera posición). La placa vacía es casi invisible (aros de 1,5 px muy claros) y la biblioteca ocupa la mayor parte visual. | Ver D-1 a D-4. Verificar si el título fue quitado a propósito en Figma `560:20265`. |
| H-09 | 🟡 | `src/tu-placa-v12.js:89-91` | `GENERAR COMPOSICIÓN` **vacía toda la placa** (`items.length=0`) sin confirmar. Hay `DESHACER`, así que es recuperable, pero un visitante puede perder su trabajo. | Pedir confirmación o animar "se guardó la anterior; DESHACER". |
| H-10 | 🟡 | `src/tu-placa-v12.css:87` (`.tp-menu-ajustando .tp-menu-boton{transition:none}`), `src/tu-placa-menu.js:14,46-47` | Al mantener apretado y rotar, los botones **sí** se reubican de inmediato pero **sin transición**: se "teletransportan" y la animación completa queda para después de soltar. Captura con el mouse apretado confirma el menú ya replegado y sin animación entre estados. Afecta directamente a la devolución D-07. | Ver D-6. |
| H-11 | 🟠 (a verificar) | `src/tu-placa-v12.js:129` (`c.filter=blur()` al exportar el recuerdo), `src/colonias-core.js:45` (`bc.filter=blur()` para dibujar cada colonia), `src/fondos-universos.js:30,45` | `CanvasRenderingContext2D.filter` no está soportado por Safari (a confirmar con la versión de los docentes). Si falla, las colonias saldrían con bordes duros y el PNG del "recuerdo" sin desenfoque: **otra posible causa de "blur roto"**. No comprobado: sólo probé Chromium. | Probar en Safari/iPad; si falla, usar fallback (`OffscreenCanvas` + `StackBlur` o dibujar en capas con `shadowBlur`). |
| H-16 | 🟡 | `src/plantilla.html` leyenda de PLACA vs `src/tu-placa-biblioteca.js:6` | La leyenda de PLACA muestra 3 grupos (Bacterias, Mohos, Levaduras) pero hay 34 muestras mixtas (BL) en `base/muestras.csv`; TU PLACA sí ofrece "MEZCLAS". Incoherencia de lectura entre pantallas. | Agregar "Mixtas" a la leyenda (con su degradado) o explicarlo. |
| H-25 | 🟡 | `src/tu-placa-v12.js:101-121` | Las tres reacciones son efectos mínimos: **Simbiosis** = un círculo con gradiente radial (`l.108-109`); **Rechazo** = máscara radial sobre la bacteria (`l.113`); **Barrera** = máscara lineal (`l.116`). Sólo se muestra un rótulo por tipo (`l.118`, `vistos`) y como máximo 10 reacciones. Están estáticas (sin animación ni crecimiento en el tiempo). Esto es lo que los docentes llaman "todavía muy simple". Los textos que las explican dicen "en esta representación…" (`l.93`), correcto. | Ver D-9, D-10. |

### Repositorio y documentación
| ID | Sev. | Dónde | Problema | Cómo corregirlo |
|---|---|---|---|---|
| H-01 | 🔴 | raíz | **No hay `README.md`.** | Ver G-1. |
| H-13 | 🟡 | `base/muestras_png.zip` (1,2 MB) + `base/muestras_png/` (1,4 MB), `src/assets/cartel-colonias.png` = `src/assets/detalles/38083.png` = `src/assets/glosario-cartel.png` (3 copias idénticas de 3,2 MB; el build usa el `.jpg`), `07e12.png`=`micro-47710.png`, `a302c.png`=`lugar-pan.png`, `6d768.png`=`lugar-queso.png`; ~51 archivos de `src/assets` sin referencia **por nombre** (~22 MB; hay falsos positivos: `tp-${k}.svg` se arma dinámicamente) | Duplicados y recursos posiblemente sin uso inflan el repo (224 MB) y la descarga para los docentes. | Hacer un inventario por ejecución (cargar todas las pantallas y listar requests) y borrar lo no usado; quitar el `.zip` o el directorio. No borrar sin que Paco lo confirme. |
| H-14 | 🟡 | `ESCALA_TIPOGRAFICA_PROPUESTA.md` ("**propuesta, sin aplicar**"), `06_traspaso_placa_claude_code.md` (66 muestras, `build.py`, "TU PLACA en preparación"), `base/LEEME.md` ("Todavía no leen la tabla…", "armar.bat y build.py incorporan…") | Documentos que contradicen el estado real: la escala **sí** se aplicó (commits `8f888d4`, `892ab63`, `0991377`), hay 146 muestras, el build vigente es sólo `build.ps1`. | Marcar cada documento con su estado y fecha o moverlos a `docs/historico/`. |
| H-15 | 🟡 | `mensaje_para_codex.md`, `06_traspaso…md`, `prueba_base/`, `prueba_colonias/`, `prueba_docs/`, `prueba_entornos/`, `prueba_fichas/`, `referencia/`, `shot.py` (usa `/usr/bin/google-chrome` y ruta del sistema), `armar.bat`, `build.ps1` | Material de trabajo entre herramientas y pruebas descartadas (`.parcheado`, `.nuevo`, `.sin_descripcion.csv`) mezclado con el entregable. `shot.py` apunta a un navegador fijo (`/usr/bin/google-chrome`). | Mover a `docs/proceso/` o a una rama; dejar en raíz sólo lo que un docente necesita. |
| H-26 | 🟢 | `PUBLICACION.md` | Menciona una carpeta externa (`../micromundos-publico`), un `project_id` y un commit (`39ac48f…`) que **no existe en este repo**. No hay credenciales (comprobado: no hay claves ni tokens en el texto), pero no se puede reproducir el despliegue con lo que hay acá. | Aclarar que el despliegue vive en otro repo o incluir los pasos. |
| H-27 | 🟢 | `src/plantilla.html:369` | El HTML base de `#tuPlaca` dice "Este espacio está en preparación." (texto provisional que se reemplaza al cargar). Si el script fallara, ese texto sería lo único visible. | Quitar o dejar un mensaje de error útil. |

---

## 3. Devoluciones de los docentes, una por una

> Estado: ✅ resuelto · 🟨 parcial · ⬜ pendiente. Impacto = parte del proyecto afectada.

### D-01 · "Arreglar blur!!!!!"
- **(a) Qué piden:** corregir el blur. No dice dónde ni qué está mal. **Ambigua.**
- **(b) Impacto:** transversal (`src/plantilla.html`, `src/*.css`, `src/colonias-core.js`).
- **(c) Estado:** 🟨 La escala tipográfica (commits `8f888d4`…) dejó el blur de lectura en `0` sólo en algunos textos (buscador, ficha), pero el resto sigue borroso (H-04). Además hay un posible fallo de render del blur en Safari (H-11).
- **(d) Qué hacer:** interpretar como **legibilidad: texto y controles nítidos**, y verificar que el blur *decorativo* se vea igual en todos los navegadores. Plan en B-1…B-5.
- **Interpretación propuesta (a confirmar):** "blur" = (1) texto/botones borrosos hoy y (2) cualquier lugar donde el blur se vea roto/inconsistente (carteles, Safari). Si los docentes se referían al blur *decorativo* (colonias, fondo), no hay que quitarlo: es la identidad del sistema gráfico.
- **⚠ Conflicto con otro criterio del proyecto:** `06_traspaso` define "Sistema gráfico: base de blur, grano y color", y hay una nota explícita de Paco de no tocar capas de blur de los carteles. La corrección debe aplicarse a **texto y controles**, no a las capas decorativas.

### D-02 · "La primera pantalla no se entiende por primera vez. Onboarding. Puede ser una capa que explica un poco lo que va a suceder."
- **(a)** Una capa de onboarding al entrar.
- **(b)** `src/apertura.js`, `src/plantilla.html:320-324` y el estado inicial de la app.
- **(c)** ⬜ Pendiente. Confirmado: la portada sólo muestra la palabra y "TOCÁ PARA COMENZAR"; cero textos de ayuda en `src/`.
- **(d)** Una capa breve (2–3 pasos o una sola pantalla) después de tocar la portada: qué es (colección ficticia de muestras de microorganismos), las tres zonas (MUESTRAS / GLOSARIO / TU PLACA) y un gesto clave por zona. Recordar al volver (`localStorage`) y botón "?" para reabrirla. Ver C-1, C-2.

### D-03 · "Experiencia más amable: arrastrá, clickeá, etc. Más cartelitos que explican. El usuario no sabe ni entiende nada."
- **(a)** Más pistas contextuales de interacción.
- **(b)** Todas las pantallas. Hoy hay pistas sólo en TU PLACA ("Arrastrá una forma…", "ELEGÍ UNA FORMA…") y "Deslizá" en el Glosario.
- **(c)** ⬜ Pendiente.
- **(d)** Inventario de gestos por pantalla (PLACA: tocar muestra, zoom con arco, arrastrar/descartar cartel; VÍNCULOS: tocar hilos/muestras; MUESTRARIO; GLOSARIO: tocar círculo/término; fichas: lupa, galería; TU PLACA: arrastrar, tocar para editar, mantener y rotar). Un "cartelito" corto por cada uno, que desaparezca tras el primer uso. **Ojo de vocabulario:** los docentes dicen "clickeá" (mouse) y el diseño original es táctil sin hover (`06_traspaso`): hay que decidir si el texto dice "tocá" o "tocá/clic". Ver C-3…C-5. **No inventé la lista final de gestos**: es la que muestro arriba, extraída del código; Paco debe aprobarla.

### D-04 · "A la hora de grabar pantalla en la presentación de proyecto, saltear lo que es menos importante. Centrarse en TU PLACA, ir a esa sección antes por más que en el proceso tenga sentido que aparezca después."
- **(a)** Es una indicación para el **video/presentación**, no para el código. Orden: TU PLACA primero.
- **(b)** No hay presentación ni grabación en el repo. Impacta en cómo se arma la demo.
- **(c)** ⬜ Pendiente (fuera del repo).
- **(d)** Escribir un guion de grabación de ~2–3 min: portada (sólo un instante) → onboarding → TU PLACA completa (sembrar, menú circular, composición, reacciones, simbiosis, guardar) → *después* un vistazo corto a MUESTRAS/GLOSARIO. Opcional técnico: permitir abrir directo en TU PLACA (ej. `placa.html#tuplaca`, que hoy **no existe**: se buscó `location.hash` y no hay manejo). Ver F-1…F-3.
- **Pregunta abierta:** ¿"ir a esa sección antes" es sólo el orden del video o también querés que la app arranque por TU PLACA? (P-3)

### D-05 · "TU PLACA: más protagonista."
- **(a)** Subir la jerarquía de TU PLACA.
- **(b)** `src/tu-placa-v12.js/.css`, navegación (`src/plantilla.html:372`), portada.
- **(c)** ⬜ Pendiente (H-08). Hoy es la 3.ª pestaña, sin título propio y con la placa casi invisible cuando está vacía.
- **(d)** (i) Título de pantalla visible y nítido; (ii) placa más grande y con más presencia (borde/agar visibles, ya existen `tp-agar.svg` y `tp-borde.svg`, y `tp-superficies` los carga); (iii) reducir peso visual de la biblioteca (hoy ocupa casi la mitad de la pantalla); (iv) mover la pestaña / dar acceso directo desde la portada y desde MUESTRAS. Ver D-1…D-4.

### D-06 · "Tomar más de la herramienta generadora de composiciones. Podés colocar directamente construcciones compositivas de elementos, no solo elementos sueltos."
- **(a)** Que se puedan **sembrar composiciones completas** (grupos armados de varios elementos) además de elementos sueltos.
- **(b)** `src/tu-placa-generador.js`, `src/tu-placa-v12.js:89-91`, `src/tu-placa-biblioteca.js`.
- **(c)** 🟨 Parcial. El generador ya produce una composición compuesta (anclas, halos, anillos, trail, pequeñas), pero **sólo se puede usar reemplazando toda la placa** (`GENERAR COMPOSICIÓN`, `l.89`). La biblioteca incluye "Veladura, Filamentosa, Con halo…" (`biblioteca.js:13-19`), que son **elementos sueltos**, y el modo "En grupo" siembra 6 copias del mismo elemento (`v12.js:69`), no una construcción.
- **(d)** Agregar a la biblioteca una pestaña/fila "COMPOSICIONES" con presets arrastrables (ej. "Colonia madre con satélites", "Cadena", "Anillo con núcleo", "Moho filamentoso con halo"); cada preset es una salida del generador acotada a una zona (parámetro de diámetro/posición) que se **suma** sin vaciar. Cada composición sembrada se comporta como un grupo (mover/escalar/borrar junto). Ver D-7, D-8.

### D-07 · "Menú contextual de colonias: debería poder utilizar cada herramienta manteniendo apretado y rotando directamente, en vez de esperar a soltar para toda la animación."
- **(a)** Gesto único: presionar el botón de la herramienta y rotar sin soltar; la animación debe acompañar durante el gesto, no al soltar.
- **(b)** `src/tu-placa-menu.js` (`pointerdown` en `l.14`, `iniciar/soltar` en `l.46-47`) y `src/tu-placa-v12.css:87`.
- **(c)** 🟨 Parcial. Verificado en el navegador: **sí se puede** apretar el botón y rotar (activa la herramienta y ajusta de inmediato, p. ej. Tamaño 115 %). Pero (1) los botones se reubican **sin transición** mientras se mantiene (`.tp-menu-ajustando{transition:none}`), así que la animación "completa" queda para el soltar; (2) no hay ninguna pista de que el gesto existe; (3) el elegido sólo se calcula respecto de una semicircunferencia que aparece recién al activar.
- **(d)** Mantener el ajuste en vivo, pero con transición corta (≈120–150 ms) del repliegue al presionar y de retorno al soltar; que el valor numérico siga al dedo; agregar pista "mantené y girá". **Esto contradice parcialmente lo que dicen los docentes**: la función existe; lo que falta es que se perciba y que la animación acompañe (ver Conflictos §3.1).

### D-08 · "Especie de menú/herramienta que rodea la placa para las opciones para modificar características de toda la composición."
- **(a)** Un control perimetral a la placa (no a una colonia) que afecte **todo** el conjunto.
- **(b)** `src/tu-placa-v12.js/.css`, `tu-placa-menu.js` (reutilizable).
- **(c)** ⬜ Pendiente. Hoy toda edición es por colonia (`seleccionado`); sólo hay "Mostrar reacciones" y "Vaciar" globales.
- **(d)** Reusar la lógica del menú circular (`montarMenuTuPlaca`) como **anillo exterior** de la placa con parámetros globales. *Propuesta* (a validar): Tamaño global, Opacidad global, Foco global (blur), Rotación del conjunto, Mezcla de color/paleta, Densidad. **No inventar más**: confirmar con Paco cuáles. Ver D-5, D-6.

### D-09 · "¿Cómo y qué puedo implementar de la herramienta generadora de gráfica? ¿Me sirve un momento de mayor atención al diseño de tu propia colonia?"
- **(a)** Es una **pregunta / reflexión**, no una instrucción. **Ambigua**: parece pedir ideas de qué adoptar de la herramienta externa "Colonias" (el renderer `colonias.js` de Paco, base de `src/colonias-core.js`, que tiene parches propios `[parche Micromundos]`) y si conviene un paso aparte para diseñar la propia colonia.
- **(b)** `src/colonias-core.js`, `src/tu-placa-biblioteca.js`, `src/tu-placa-v12.js`.
- **(c)** ⬜ No resuelta.
- **(d)** *Interpretación razonable:* hoy el usuario **sólo elige** entre variantes fijas (4 grupos × 11 "estados" × 4 perfiles) y puede girar/escalar/desenfocar/variar semilla. Podría haber un **"Editor de colonia"** (un paso antes de sembrar) con 4–6 controles clave del renderer (forma: disco/anillo/par/filamentosa; colores: paleta por grupo; granulado; borde irregular; halo; semilla) y que el resultado se **agregue a la biblioteca** del usuario. Respuesta corta a "¿me sirve?": **sí, si se acota** (ver D-11/E-1), y sólo si el tiempo alcanza después de D-1…D-10. **Pregunta P-2.**

### D-10 · "Trabajar más en lo visual de la reacción. Que se entienda bien, que ocurran cosas más notorias, que la reacción sea verdaderamente visual como en las colonias de moho; la reacción entre bacterias y levadura todavía está muy simple. Tal vez sumar un botón para forzar simbiosis entre dos colonias para que aparezcan las colonias combinadas, en vez de hacer una pestaña de combinadas."
- **(a)** (1) Reacciones más visibles y vistosas; (2) en especial bacteria+levadura; (3) un botón "Forzar simbiosis" que fusione dos colonias en una combinada, reemplazando la pestaña MEZCLAS.
- **(b)** `src/tu-placa-v12.js:93-121,122-133`; `src/tu-placa-biblioteca.js:6` (grupo `BL` = MEZCLAS); exportación del recuerdo.
- **(c)** ⬜ Pendiente (H-25). La simbiosis hoy es un círculo con gradiente (`l.108-109`); y las reacciones son estáticas.
- **(d)** (1) Rediseñar cada reacción con efecto propio y notorio (ej. simbiosis: filamentos/puentes y color mezclado que crece; rechazo: halo de inhibición con borde nítido y animación de expansión; barrera: franja con textura), animadas al aparecer y sin pesar en rendimiento (cachear sprites). (2) Botón `FORZAR SIMBIOSIS` activo al seleccionar dos colonias (hoy sólo se selecciona una): genera una colonia combinada (grupo `BL`, paleta mezclada) y la inserta en la placa. (3) **Quitar la pestaña MEZCLAS** de la biblioteca (cambio de `grupos` en `biblioteca.js:6`) — *sólo después* de que el botón funcione. Ver D-9…D-12.
- **Conflicto a decidir:** el modelo de datos de MUESTRAS sí tiene 34 muestras mixtas (BL); la devolución habla de TU PLACA, así que no se tocan esos datos.

### D-11 · "Variedad de formas y colores de colonias: ver bien cuáles van a ser. Tal vez ese menú tiene su propia configuración? Ver si vale la pena."
- **(a)** Definir el catálogo final de formas y colores; evaluar una configuración propia del menú.
- **(b)** `src/tu-placa-biblioteca.js` (4 paletas × 4 perfiles × 11 formas = 176 estilos hoy), `src/tu-placa-menu.js`.
- **(c)** ⬜ Pendiente: no hay un catálogo definido por criterio. La biblioteca es combinatoria (176 estilos; hasta 44 canvas por pestaña), y las paletas de BM/LM/BLM siguen "pendientes de definir con Paco" (`06_traspaso`).
- **(d)** Definir con Paco una lista **cerrada** (ej. 3–4 formas por grupo, no 11), validar si "el menú con su propia configuración" es la herramienta de D-9; evaluar costo (176 canvas hoy). Ver E-1…E-3.

### 3.1 Contradicciones entre las devoluciones y lo que encontré
1. **D-07 vs. código:** el gesto de "mantener y rotar" **ya existe**; el problema es de animación (H-10) y de descubrimiento (H-07). No hay que rehacerlo desde cero.
2. **D-01 vs. sistema gráfico:** quitar el blur sin distinguir texto de capas decorativas entraría en conflicto con el criterio de diseño (blur/grano/color) y con la nota de Paco de no tocar las capas de blur de los carteles.
3. **D-10 vs. D-11:** quitar la pestaña "combinadas" y a la vez ampliar la variedad de colores (las mezclas BL, BM, LM, BLM son hoy paletas propias sin definir). Hay que decidir si el resultado de la simbiosis usa una paleta fija o se calcula de las dos colonias que se fusionan.
4. **D-04:** pide "saltear lo menos importante", mientras el proyecto está organizado alrededor de MUESTRAS (documento de traspaso: "Pantalla de inicio PLACA"); TU PLACA figura como la 4.ª pantalla. Es un cambio de prioridad narrativa, no sólo de video.
5. **D-02/D-03 vs. "sin hover":** el diseño original es táctil de pie; los docentes hablan de "clickeá".

---

## 4. Checklist de lo que falta

Esfuerzo: **S** ≤ 2 h · **M** ½–1 día · **L** > 1 día. `dep:` = depende de.
Reglas a respetar (de `mensaje_para_codex.md`): no cambiar datos de `base/` sin avisar, no cambiar azar/semillas/orden de listas ni `AROS_REFORZADOS`, conservar `filtroCodigos` y `ENTORNOS_MUESTRAS`.

### 1. Correcciones de los docentes (máxima prioridad)

**Blur (D-01)**
- [ ] **B-1 · S** Escribir un script de medición (el de esta auditoría, `src/` o `tools/`) que liste textos/controles con blur > 0 por pantalla y pase como test (objetivo: 0 textos de lectura/botón con blur). *dep:* ninguna.
- [ ] **B-2 · M** *(decisión de Paco 17/11)* Quitar **el 100 % del blur de la tipografía** por ahora: todo texto, rótulo, botón y etiqueta pasa a `blur 0` (`plantilla.html:73,132,138,195,196,230`; `tu-placa-v12.css:6,21,22,58,62,64,82,97`; `tu-placa-biblioteca.css:3,13`; `vinculos.js:37,46,48` y `apertura` para el título animado). Dejar una sola variable `--blur-texto:0px` para poder volver a graduar después. El blur de colonias, fondos y vidrio de los carteles **no se toca**. *dep:* B-1.
- [ ] **B-3 · S** Revisar el contraste con texto nítido sobre `mix-blend-mode:difference` (opacidades < .6) y ajustar. *dep:* B-2.
- [ ] **B-4 · S** *(baja prioridad: los docentes ven un video grabado por Paco)* Probar el blur de colonias/carteles en el navegador con el que se graba; Safari/iPad sólo si el plan táctil final lo usa (`colonias-core.js:45`).
- [ ] **B-5 · S** Capturas "antes/después" de las 5 pantallas para mostrar a los docentes. *dep:* B-2.

**Onboarding y cartelitos (D-02, D-03)**
- [ ] **C-1 · M** Capa de onboarding tras la portada (qué es, 3 zonas, 1 gesto clave), con "Saltear" y botón "?" para reabrir; recordar en `localStorage` con `try/catch`. *dep:* P-4 (texto).
- [ ] **C-2 · S** Texto y diseño del onboarding con la escala tipográfica vigente (nítido, área táctil 48 px). *dep:* B-2.
- [ ] **C-3 · M** Cartelitos de primera vez en PLACA (tocar muestra, arco de zoom, arrastrar/descartar la ficha), VÍNCULOS/MUESTRARIO y GLOSARIO (los círculos son tocables), que desaparecen tras el primer uso.
- [ ] **C-4 · S** Cartelitos de primera vez en TU PLACA: "Arrastrá una forma a la placa", "Tocá una colonia para editarla", "Mantené y girá" (D-07). *dep:* D-6.
- [ ] **C-5 · S** *(resuelto P-5)* Textos con verbos neutros que valgan para mouse y pantalla táctil ("Arrastrá", "Elegí", "Mantené y girá"; "Tocá" sólo donde no haya alternativa) y aplicarlos a `TOCÁ PARA COMENZAR`, "Arrastrá…", "Deslizá". En el video el cursor se ve: los cartelitos deben entenderse con mouse.
- [ ] **C-6 · S** Añadir tests de flujo (`verificar-flujos.cjs`): el onboarding aparece la primera vez y no vuelve a aparecer.

**TU PLACA (D-05 a D-11)**
- [ ] **D-1 · M** Título de pantalla "TU PLACA" visible y nítido; ajustar jerarquía (D-05). *dep:* B-2.
- [ ] **D-2 · M** Placa protagonista: agrandar/centrar la placa, hacer visibles agar/borde (`tp-agar.svg`, `tp-borde.svg`), reducir el peso visual de la biblioteca (agruparla en un panel replegable). Validar con Figma `560:20265` / Paco.
- [ ] **D-3 · S** Acceso directo a TU PLACA desde la portada y desde MUESTRAS (botón/llamado) (D-05, D-04).
- [ ] **D-4 · S** Estado vacío más claro ("Arrastrá una forma acá") con ilustración de la zona de soltado.
- [ ] **D-5 · L** Anillo/menú perimetral para parámetros de **toda** la composición (D-08), reutilizando `montarMenuTuPlaca` (parametrizar `obtener/cambiar`). *dep:* P-6 (qué parámetros), D-6.
- [ ] **D-6 · M** Mantener-y-rotar fluido (D-07): quitar `transition:none` en `.tp-menu-ajustando`, transiciones cortas de repliegue, valor en vivo, pista "mantené y girá"; test de que presionar + mover cambia el valor sin soltar. *dep:* ninguna.
- [ ] **D-7 · L** Composiciones sembrables (D-06): fila "COMPOSICIONES" en la biblioteca con 4–6 presets que **suman** a la placa sin vaciarla; manejo como grupo (mover/borrar/escalar). Parametrizar `generarComposicionTuPlaca` con zona y semilla. *dep:* D-8.
- [ ] **D-8 · M** Volver determinista el generador (H-19: `Math.random` → PRNG con semilla) + test unitario (misma semilla ⇒ misma salida, ≤ 120 elementos, todo dentro de la placa).
- [ ] **D-9 · L** Rediseño visual de las reacciones (simbiosis, rechazo, barrera) con efectos notorios y entrada animada; sin superar el presupuesto de render (medir con 60 elementos). *dep:* H-22 (separar render de reacciones).
- [ ] **D-10 · L** *(redefinido 17/11)* Acción **UNIR** (reemplaza a "forzar simbiosis"): al seleccionar dos colonias, un botón las une en **(a) una colonia más grande** (fusión orgánica) o **(b) una forma de 8 / infinito** (dos lóbulos con cuello). Reemplaza a las dos originales, con DESHACER. Probar primero con las formas `pair` y `capsule` del renderer de COLONIAS y, si no alcanzan, con fusión por umbral sobre los sprites. *dep:* D-9, P-7 (colores).
- [ ] **D-11 · S** Retirar la pestaña MEZCLAS de la biblioteca (`biblioteca.js:6`) cuando D-10 funcione. *dep:* D-10.
- [ ] **D-12 · S** Actualizar el recuerdo PNG (`pintarRecuerdo`, `v12.js:122-133`) para que exporte las nuevas reacciones y el anillo perimetral. *dep:* D-5, D-9.
- [ ] **E-1 · M** Definir con Paco el catálogo final de formas y colores (lista cerrada) (D-11). *dep:* P-8.
- [ ] **E-2 · M** Implementar el catálogo reducido y bajar los montajes de canvas de la biblioteca (hoy 176 estilos; se montan hasta 44 canvas por pestaña). Medir tiempo de apertura de TU PLACA antes/después. *dep:* E-1.
- [ ] **E-3 · L** *(ahora recomendado como versión acotada)* "Diseñá tu colonia": un momento previo a sembrar con 4–6 controles tomados del modo Elemento de COLONIAS (forma, paleta, borde irregular, halo, grano, semilla) y guardado en la biblioteca (D-09). *dep:* E-1, D-1…D-10.

**Presentación / grabación (D-04)**
- [ ] **F-1 · S** Guion de grabación (orden: TU PLACA primero; MUESTRAS/GLOSARIO en 20–30 s al final), con duración objetivo y pasos exactos.
- [ ] **F-2 · S** ~~Parámetro `#tuplaca` para abrir directo~~ *Descartado:* ir primero a TU PLACA es sólo el orden del video (P-3 resuelto). Sólo se aplicaría si resulta cómodo grabar así; no es requisito.
- [ ] **F-3 · S** Grabar una toma de prueba a 1920×1100 y revisar que se lean los textos (post B-2).

### 2. Errores críticos y altos
- [ ] **A-1 · M** (H-02) Dejar **un solo build**: portar `build.ps1` a Python/Node y borrar el otro, o eliminar `build.py`; que falle si queda algún marcador `/*…*/` sin reemplazar. *dep:* ninguna. **Hacerlo primero.**
- [ ] **A-2 · S** (H-03) Agregar `linkedom` a `devDependencies` y script `npm test` (validador + 2 verificadores). *dep:* A-1.
- [ ] **A-3 · S** (H-06) Incluir Arimo 400/700 en local (`@font-face`). Prioridad baja para la evaluación (el video se graba con internet), pero evita que la grabación cambie de tipografía si falla la red.
- [ ] **A-4 · M** (H-05) Áreas táctiles ≥ 48 px en los 16 controles listados (H-05).
- [ ] **A-5 · S** (H-11) Sólo si el plan táctil final usa Safari/iPad; hoy no afecta a la evaluación (ver B-4).
- [ ] **A-6 · S** (H-01) README mínimo que ya funcione (ver G-1). *dep:* A-1.

### 3. Funcionalidades / requisitos faltantes o incompletos
- [ ] **R-1 · S** (H-16) Leyenda de PLACA: explicar o mostrar el grupo "Mixtas" (hay 34 muestras BL).
- [ ] **R-2 · M** (H-09) Confirmación o mensaje claro al usar `GENERAR COMPOSICIÓN` sobre una placa con colonias.
- [ ] **R-3 · S** (H-27) Quitar el texto provisional "en preparación" del HTML base.
- [ ] **R-4 · M** Persistencia: el estado guardado de TU PLACA no incluye el modo/ajustes globales (cuando existan D-5). Versionar la clave (`micromundos-tuplaca-v3`) y migrar la v2. *dep:* D-5.
- [ ] **R-5 · S** Pendiente heredado (de `06_traspaso`): definir paletas BM/LM/BLM con Paco (se cruza con D-10 y E-1).
- [ ] **R-6 · M** Pendiente heredado (de `base/LEEME.md`): 39 muestras con especies "pendientes" y Tempeh sin fuente para *S. thermophilus* (no tocar `base/` sin avisar a Paco).

### 4. Mejoras de calidad, tests y documentación
- [ ] **Q-1 · M** (H-22) Separar `tu-placa-v12.js` en módulos (estado/historial, interacción, reacciones, exportación) antes de D-7/D-9.
- [ ] **Q-2 · S** (H-12) Eliminar código muerto: `src/tu-placa.js`, `prepararBlurPortadaDetalle`, `semillaNombre`, `chips`, `avisar` + `#aviso`, variables sin uso.
- [ ] **Q-3 · M** Pruebas unitarias del generador y de la lógica de reacciones (puras, sin DOM) con `node --test`.
- [ ] **Q-4 · M** Prueba visual automatizada: capturas de las 5 pantallas con Playwright y comparar contra referencia (tolerancia), incluyendo la comprobación de blur (B-1). Reemplaza el supuesto "revisión visual pendiente" de varias notas.
- [ ] **Q-5 · S** Medir rendimiento: tiempo hasta interactivo de la portada (hoy ~3,6 s local, 4 MB de HTML) y de TU PLACA con 60 elementos; fijar un presupuesto.
- [ ] **Q-6 · S** Contraste y lector de pantalla (H-17, H-18): lista corta de arreglos.
- [ ] **Q-7 · S** Usar `textContent` para cualquier texto escrito por el usuario (H-24), por si se agrega nombre a la placa.
- [ ] **Q-8 · S** Re-guardar `.gitignore` sin BOM (H-21).

### 5. Pulido final / entrega
- [ ] **G-1 · M** `README.md` en la raíz: qué es, captura, cómo abrirlo (`armar.bat` o comando único), cómo reconstruir, estructura de carpetas, cómo correr los tests, límites conocidos (navegadores, internet para fuentes si no se resuelve A-3), créditos/fuentes de datos y aclaración de que la colección es ficticia.
- [ ] **G-2 · S** Marcar el estado de `ESCALA_TIPOGRAFICA_PROPUESTA.md`, `06_traspaso…md` y `base/LEEME.md` (H-14) o moverlos a `docs/historico/`.
- [ ] **G-3 · M** (H-13, H-15) Limpiar el repo con confirmación de Paco: quitar `prueba_*`, `.parcheado`, `base/muestras_png.zip` o la carpeta duplicada, duplicados de `src/assets`, recursos no cargados (inventario por ejecución).
- [ ] **G-4 · S** (H-26) Aclarar en `PUBLICACION.md` dónde vive el despliegue y cómo reproducirlo.
- [ ] **G-5 · S** Verificación final: `validar_base.py`, `npm test`, recorrido manual de las 5 pantallas en Chrome y Safari, sin errores de consola.
- [ ] **G-6 · S** Regenerar `placa.html` con el build único y confirmar que corresponde a `src/` (diff del build contra el archivo versionado).
- [ ] **G-7 · S** Tomar capturas finales y grabar la demo (F-1…F-3).
- [ ] **G-8 · S** Lista de cambios para Paco (qué archivos se tocaron) para que actualice `04_decisiones_y_estado.md` (pedido heredado de `mensaje_para_codex.md`).

---

## 5. Preguntas abiertas

1. ~~**P-1 (blur)**~~ **Resuelta:** el problema es el blur demasiado fuerte en la tipografía; se quita el 100 % del blur tipográfico por ahora (B-2).
2. ~~**P-2 (D-09)**~~ **Resuelta:** la "herramienta generadora de gráfica" es COLONIAS (`Pacosanx/colonias-espora`). Ver §3-bis.
3. ~~**P-3 (D-04)**~~ **Resuelta:** ir primero a TU PLACA es sólo el orden del video.
4. **P-4 (D-02)**: ¿Qué debe explicar el onboarding: sólo qué es el proyecto y las tres zonas, o también un mini recorrido interactivo? ¿Quién escribe el texto?
5. ~~**P-5 (D-03)**~~ **Resuelta:** los docentes no usan la herramienta; corrigen desde el video de Paco, grabado con mouse. El plan final es táctil.
6. **P-6 (D-08)**: ¿Qué características globales de la composición debería controlar el anillo perimetral? (Propuesta: tamaño, opacidad, foco, rotación, paleta, densidad.)
7. **P-7 (D-10, ahora "UNIR")**: al unir dos colonias, ¿el resultado toma el color de la mayor, un degradado entre las dos o la paleta mixta del grupo (`BL`)? ¿Qué elegís por defecto entre "más grande" y "8/infinito", o el usuario elige?
8. **P-8 (D-11)**: ¿Cuáles son las formas y los colores definitivos? ¿Hay un máximo (ej. 3–4 formas por grupo)? ¿Se mantiene "Registro digital" y "Montada" como formas de TU PLACA, o son exclusivas de MUESTRAS?
9. ~~**P-9**~~ **Resuelta en gran parte:** los docentes no abren la app. Queda saber con qué navegador grabás (para el blur y la tipografía).
10. **P-10**: ¿Se permite tocar `base/` o los `src/assets` para limpiar duplicados (G-3), dado que `mensaje_para_codex.md` pide avisar a Paco antes?
11. **P-11 (H-04)**: En Figma, ¿los textos de navegación llevan blur a propósito? Esta auditoría no pudo consultar el diseño original.

---

## 6. Orden de trabajo sugerido

1. **A-1, A-2, A-6** (build único + tests + README mínimo) · 1 día.
2. **B-1…B-5** (blur) y **A-3, A-4** (fuente local, áreas táctiles) · 1–1,5 días.
3. **C-1…C-6** (onboarding y cartelitos) · 1 día.
4. **D-6** (mantener y rotar), **D-1…D-4** (protagonismo) · 1 día.
5. **D-8, D-7** (generador determinista y composiciones sembrables) · 1,5 días.
6. **D-9, D-10, D-11, D-12** (reacciones y simbiosis) · 2 días.
7. **D-5** (anillo perimetral) · 1,5 días; **E-1, E-2** (catálogo de formas/colores) · 1 día.
8. **E-3** (sólo si sobra tiempo y P-2 lo confirma).
9. **F-1…F-3** (guion y grabación) · ½ día; **G-1…G-8** (limpieza y cierre) · 1 día.
