# COLONIAS → TU PLACA · inventario de funciones y qué sumar

Fecha: 17/11/2026. Fuente: lectura del código de `Pacosanx/colonias-espora` (`index.html`, `app.js`, `composition.js`, `direct-edit.js`, `numeric-edit.js`, `micro.js`, `renderer.js`, `relations*.js`, `RELACIONES.md`) y de `src/tu-placa-*.js/.css` de este repo.
**Aclaración:** leí el código de COLONIAS pero **no lo ejecuté**; cómo se ven Micro y Relaciones lo infiero del código y de `RELACIONES.md`, no de capturas. Lo que digo de TU PLACA sí lo comprobé en el navegador.

---

## 1. Inventario de funciones de COLONIAS

COLONIAS tiene **cuatro modos**: Elemento, Composición, Micro y Relaciones (`#relaciones`).

### 1.1 Modo ELEMENTO (diseñar una colonia)
**Catálogo de formas — 18** (selector `Forma`): Disco, Cápsula, Dos colonias (`pair`), Anillo, Arco, Fragmento, Banda de elementos, y las **figurativas**: Colonia lisa, plegada, zonada, aureolada, con manchas, Micelio algodonado, Colonia peluda, Expansión ramificada, Colonia granular, Crecimiento unilateral, Pigmentos irregulares. Hay además un preset "Filamentos" (`mold`) y "Halo". En total **19 botones de preset** para empezar.

**43 parámetros numéricos** (`ranges` en `app.js:19-20`), en tres grupos:

| Grupo | Parámetros |
|---|---|
| **Geometría (25)** | Escala · Alargamiento · Separación (de la pareja) · Irregularidad · Lóbulos · Profundidad y Desigualdad de lóbulos · Detalle interno · Cantidad de zonas · Centros (cantidad, separación, tamaño, posición X/Y) · Zona (X, Y, tamaño) · Ramas (apertura, extensión, troncos, niveles de bifurcación) · Pliegues (interrupción, grosor) · Filamentos · Grosor del anillo · Apertura del arco · Rotación |
| **Color (3 + selectores)** | Posición del color medio · Descentrar gradiente · Ángulo del gradiente · Tipo de gradiente (Radial / Lineal / Anillos cromáticos) · 3 colores (Centro, Medio, Borde) de una **paleta cerrada** |
| **Materia (13)** | Blur · Suavidad de periferia · Tamaño y Definición del núcleo · Blur del núcleo · Blur periférico · Grano hacia centro/borde · Halo · Ruido · Tamaño del grano · Porosidad · Porosidad centro↔borde · Opacidad · Superposición (Normal / Multiplicar / Trama) |

Otros: **Otra variación ↻** (nueva semilla), **Restablecer este estudio**, **Crecimiento** (línea de tiempo ▶ que reproduce el desarrollo y **exporta MP4**).

### 1.2 Modo COMPOSICIÓN (armar una placa)
- **Generar composición** con **7 estructuras**: Núcleos orgánicos, Constelación, Distribución radial, Campo, Grilla, Banda, Placa de Petri. **4 formatos** (vertical 4:5, cuadrado, horizontal 3:2, personalizado).
- **Proporción de color:** Verdes / Amarillos / Rosas en %, que **siempre suman 100** (al mover una barra se reajustan las otras).
- **Ajustes globales de la composición:** Compresión↔expansión · Aire entre elementos · Densidad al generar · Rotación general · Desplazamiento general.
- **Añadir elementos:** cualquier forma del catálogo, + **Secuencia axial**, + **Grupo radial**, + **Texto**.
- **Grupos paramétricos** (secuencia axial / radial): Cantidad (3–24), Separación/radio, Dispersión, Ángulo, Interrupciones, Recorrido radial, "Mover el grupo al arrastrar", Desvincular grupo, Tamaño del elemento.
- **Texto con colonias:** una palabra escrita con círculos-colonia (tamaño del conjunto, tamaño de círculos, separación, tipo de módulo, tratamiento de color, variación, blur, grano, opacidad).
- **Texto normal** con cápsula de fondo (tipografía, colores, margen, redondez, blur de fondo y de texto).
- **Capas:** lista ordenada, selección múltiple (Ctrl/Mayús), **Agrupar / Desvincular**, Duplicar, Eliminar, Subir/Bajar capa.
- **Recrear placa de referencia** y **Nueva placa figurativa** (ejemplos precargados).
- **Edición directa:** arrastrar, selección por **marquesina** (rectángulo), tiradores para redimensionar el lienzo, doble clic para editar texto, **flechas del teclado**, edición **numérica** haciendo clic sobre el valor de cada deslizador (`numeric-edit.js`).

### 1.3 Modo MICRO (campo microscópico)
Células interpretativas por grupo: **bacterias** (bastones, esferas sueltas, en cadena, en racimo, espirales), **levaduras** (con brote, en cadena), **mohos** (filamentos/hifas, esporas). Parámetros: cantidad (0–140), tamaño y variación, **planos de foco (1–3)**, blur del plano lejano y cercano, anillos de desenfoque, grosor del borde, manchas de fondo, grano, "interior de la célula" (5 modos), fondo (9 colores), formato, **recorte circular tipo lente**. Exporta PNG, receta y página web.

### 1.4 Modo RELACIONES (contacto entre dos colonias)
Cuatro tratamientos: **Simbiosis** (intercambio de color dentro del material compartido, sin crecer), **Rechazo** (halo de exclusión que recorta a la otra), **Barrera** (frentes recortados con frontera difusa y grano), **Neutro** (se multiplican colores). Parámetros: Intensidad, Ancho, Blur, Grano, Irregularidad, **Progreso ("desarrollo del encuentro")**, separación entre A y B, radios, familias de color; vista **comparar las cuatro**. Se arrastra cada colonia; A/B + flechas.

### 1.5 Exportación y recetas
PNG a 1024/2048/3072 px, fondo transparente o color, **receta JSON** guardable/abrible (v1–v3), **paquete web** reproducible (`mountColonias`, `play`, `pause`, `setProgress`, `getRecipe`, `destroy`), MP4 del crecimiento.

---

## 2. Qué tiene hoy TU PLACA (comprobado)

| Pieza | Qué hace hoy |
|---|---|
| **Biblioteca** | 4 grupos (Bacterias, Levaduras, Mohos, **Mezclas**) × 11 "estados" (Activa, En conservación, Montada, Registro digital + 7 composicionales: Veladura, Filamentosa, Con halo, Granulada, Anillo fino, Par, Microcolonia) × 4 perfiles de color = **176 estilos**, todos **fijos**. |
| **Siembra** | 3 modos: En estría, Una, En grupo (6 copias del mismo elemento). Arrastrar desde la biblioteca o tocar la placa. |
| **Menú contextual** (circular) | 6 parámetros por colonia: Tamaño, Opacidad, Multiplicar (hijas), Foco, Variación (semilla), Girar. |
| **Generador** | Un botón `GENERAR COMPOSICIÓN` que **reemplaza toda la placa** (copia simplificada del modo Composición). |
| **Reacciones** | Simbiosis (círculo de gradiente), Rechazo (máscara radial), Barrera (máscara lineal). Estáticas. |
| **Otros** | Deshacer/Rehacer, Vaciar, Guardar placa (PNG), persistencia local, límite de 120 elementos. |

**Lo que TU PLACA tiene mejor que COLONIAS:** interacción directa en un solo gesto (arrastrar/sembrar/tocar-para-editar), menú circular compacto, sembrado en estría, jerarquía visual y lenguaje gráfico.
**Lo que le falta frente a COLONIAS:** repertorio de formas (11 contra 18+), casi todos los parámetros de materia y geometría, composiciones sembrables, grupos paramétricos, capas/selección múltiple, proporción de color, ajustes globales, relaciones elaboradas, crecimiento/animación, texto, recetas.

---

## 3. Matriz: qué sumar a TU PLACA y cómo

Criterio de cada fila: **Base fija** (se elige de un catálogo) · **Parámetro** (se ajusta con un control) · **Global** (afecta toda la composición, anillo alrededor de la placa) · **Contextual** (menú de la colonia).

Prioridad: **A** = responde directo a las correcciones · **B** = muy valiosa · **C** = más adelante / descartable.

| # | Función de COLONIAS | ¿En TU PLACA? | Cómo incorporarla | Tipo | Prior. | Corrección que cubre |
|---|---|---|---|---|---|---|
| 1 | **Modo Relaciones** completo (4 tratamientos con intensidad, ancho, grano, irregularidad, progreso) | Versión muy simple | Portar `relations-renderer.js` para reemplazar las reacciones; el **progreso** anima la reacción al aparecer | Automática al tocarse; parámetro Intensidad contextual | **A** | Reacción más visual y notoria |
| 2 | **Estructuras de composición** (7) | Sólo 1 (reemplaza la placa) | Sembrar una estructura **como grupo** sin vaciar la placa: Núcleos, Constelación, Radial, Banda… | Base fija (catálogo de estructuras) | **A** | Composiciones sembrables |
| 3 | **Grupos paramétricos** (axial/radial: cantidad, separación, dispersión, ángulo, interrupciones) | "En grupo" = 6 copias fijas | Que "En grupo" y "En estría" tengan sus parámetros (cantidad, dispersión, ángulo) tras sembrar; el grupo se mueve junto | Contextual del grupo | **A** | Composiciones / construcciones |
| 4 | **Ajustes globales** (compresión↔expansión, aire, rotación general, desplazamiento) | No | **Anillo alrededor de la placa:** Rotación y Foco (definidos), Paleta en %, Variación; evaluar Compresión/Aire | Global | **A** | Menú que rodea la placa |
| 5 | **Proporción de color** (verdes/amarillos/rosas que suman 100) | No (el generador usa 33/33/34 fijo) | Control de 3 vías en el anillo (triángulo o 3 barras ligadas) que **reasigna colores** de las colonias existentes | Global | **A** | Anillo / paleta por % |
| 6 | **Formas** del catálogo (18) | 11 | Elegir un subconjunto (ver §4) y agregar las figurativas más fuertes (Micelio algodonado, Colonia peluda, Ramificada, Zonada, Plegada) | Base fija | **A** | Variedad de formas |
| 7 | **Pareja / Cápsula** (`pair`, `capsule`) y Alargamiento/Separación | "Par" fijo | Base para **UNIR** en 8/infinito: parámetros Alargamiento y Separación | Base + parámetro | **A** | Unir colonias |
| 8 | **Parámetros de materia** (Blur, Halo, Ruido, Porosidad, Núcleo, Opacidad…) | Sólo Foco y Opacidad | Un **segundo nivel** del menú contextual ("Más") con 3–4 parámetros: Halo, Grano, Porosidad, Irregularidad | Contextual (parámetro) | B | Menú contextual |
| 9 | **Lóbulos / Irregularidad / Filamentos / Ramas** (geometría) | Las formas fijas ya los usan, no editables | Un parámetro único tipo **"Carácter"** que combina irregularidad y detalle (en vez de 25 sliders) | Contextual | B | Menú contextual |
| 10 | **Colores: 3 colores + gradiente** (paleta cerrada) | 4 perfiles fijos por grupo | **Elegir el perfil** (Núcleo/Borde/Lateral/Descentrada ya existen) y un selector de color dentro de la paleta de COLONIAS | Base fija (paleta cerrada) | B | Variedad de colores |
| 11 | **Otra variación ↻** | `Variación` (semilla) | Ya existe; hacerlo **también global** (cambiar forma/tamaño de todas) | Global | **A** | Anillo (idea de Paco) |
| 12 | **Capas y selección múltiple** (marquesina, Agrupar, Duplicar, Subir/Bajar) | Selección de 1; sólo Multiplicar | Marquesina + mover/rotar/escalar varias; Agrupar; Subir/Bajar en el menú | Contextual / selección | B | Composiciones |
| 13 | **Edición numérica** (clic en el valor para escribir) | No | En el valor que aparece al mantener apretado (ej. "115 %"), permitir tocarlo para tipear | Contextual | C | — |
| 14 | **Flechas / teclado** | Sí, parcial | Mantener | — | C | — |
| 15 | **Crecimiento ▶ (línea de tiempo)** | No | "Ver crecer" la placa: reproduce la aparición de colonias. Muy visual para un video | Botón | B | Más visual |
| 16 | **Modo MICRO** (células, planos de foco, lente circular) | No | Como **vista final**: "Mirar por el microscopio" sobre la placa o formas como bastones/espirales/levaduras con brote como nuevas formas | Base fija o vista | B/C | Variedad y lectura visual |
| 17 | **Texto con colonias / Texto** | No | Poner un nombre a la placa con colonias en el recuerdo PNG | Opcional | C | — |
| 18 | **Recetas JSON / exportar web / MP4** | PNG + localStorage | Guardar/abrir la placa como archivo | Botón | C | — |
| 19 | **Fondo y formato** (transparente, colores, tamaños PNG) | Fondo único | Opciones de fondo en el recuerdo (crema/carbón/transparente) | Global | C | — |
| 20 | **Modos de superposición** (Normal/Multiplicar/Trama) | No (el CSS usa `darken`/`multiply` fijos) | Un parámetro global de mezcla | Global | C | — |

---

## 4. Cómo decidir "parámetro" vs "base fija" (propuesta)

Reglas simples para no copiar los 43 deslizadores:

1. **Se elige de un catálogo (base fija)** lo que define *qué es* la colonia: **forma** (≈8–10 formas), **grupo/familia de color**, **estructura de composición**. Es una decisión de una vez, no un gradiente continuo. Esto es lo que hoy hace la biblioteca.
2. **Es parámetro contextual** lo que cambia *cómo se ve esa colonia* y se puede explorar con el gesto "mantener y girar": hoy Tamaño, Opacidad, Foco, Girar, Variación. Sumar sólo los que **cambian de forma visible y no necesitan explicación**: Halo, Grano, Irregularidad, Alargamiento (sólo en cápsulas/pares).
3. **Es global (anillo)** lo que afecta *a toda la composición a la vez*: Foco, Rotación, % de paleta, Variación (todas las formas y tamaños), y opcionalmente Compresión/Aire.
4. **Queda fuera de TU PLACA** lo "técnico" de COLONIAS: coordenadas de centros y zonas, niveles de bifurcación, tamaño del grano, blur del núcleo, formatos de exportación, texto tipográfico. Pertenecen a una herramienta de laboratorio, no a un juego público.
5. **Una pregunta útil para cada parámetro:** *¿el visitante entiende qué hace sin leer?* Si no, se junta con otro (ej. "Carácter") o queda afuera.

Número orientativo: el menú contextual hoy tiene **6** parámetros; podría tener **6 + 4** (segundo nivel) y el anillo **4**. Es decir, unos **14** controles de los 43 de COLONIAS.

---

## 5. Menúes e interacciones (propuesta para pensar)

1. **Menú contextual de la colonia** (círculo actual, ya existe)
   - Primer nivel: Tamaño, Opacidad, Foco, Girar, Variación, Multiplicar.
   - Gesto único: **presionar el botón y rotar sin soltar** ajusta de inmediato, con animación continua y valor en vivo (hoy se reubican sin transición mientras se mantiene).
   - Segundo nivel ("Más"): Halo, Grano, Irregularidad. Sólo si el primer nivel no queda saturado.
   - Para colonias elegidas **de a dos**: botón **UNIR** (más grande / 8-infinito, color mixto).
2. **Anillo perimetral de la placa** (nuevo)
   - Rotación (gira todo), Foco, Paleta (reparto % de verde/amarillo/rosa), Variación global (formas y tamaños de todas a la vez). *Tamaño y Opacidad quedan afuera. "Densidad" queda por definir.*
3. **Biblioteca (base fija)**
   - Pasar de 176 estilos a una lista corta de formas por grupo y, en una fila aparte, **COMPOSICIONES** (estructuras de §3-#2) que se siembran de una vez.
   - Eliminar la pestaña **Mezclas** cuando exista UNIR.
4. **Reacciones**
   - Aparecen solas al tocarse y se animan (progreso); se puede ajustar la Intensidad desde el menú contextual de cualquiera de las dos colonias.
5. **"Diseñar tu colonia"** (respuesta a "¿me sirve un momento de mayor atención al diseño?")
   - Un paso opcional previo a sembrar con **4–6 controles** (Forma, Paleta, Irregularidad, Halo, Grano, Variación) y vista previa grande. El resultado entra a una fila "Mis colonias" de la biblioteca.
   - Es la manera de darle a TU PLACA algo de lo mejor de COLONIAS (Elemento) sin trasladar sus 43 deslizadores.

---

## 6. Orden sugerido de incorporación

1. **Relaciones** (§3-#1) y **UNIR** (#7): son lo más visible y lo más pedido.
2. **Composiciones sembrables** (#2, #3).
3. **Anillo perimetral** (#4, #5, #11) y **mantener-y-rotar fluido** en el menú.
4. **Catálogo de formas y colores** (#6, #10) y limpieza de la biblioteca.
5. **Diseñar tu colonia** (§5-5) y segundo nivel del menú (#8, #9).
6. Extras para el video: **Crecimiento** (#15), fondo del recuerdo (#19).

## 7. Preguntas

1. ¿Qué formas de las 18 usás realmente en COLONIAS? (Con eso se arma la lista corta de §3-#6.) Por el código, la composición automática usa sobre todo `band`, `ring`, `arc`, `cotton`, `hairy`, `branching`, `fan` y `fragment`.
2. ¿"Densidad" del anillo sería la cantidad de colonias pequeñas de la composición, o preferís sacarlo?
3. Para UNIR: ¿qué forma toma cada caso (mismo grupo, bacteria+levadura, moho+bacteria, tamaños distintos)?
4. ¿Querés mantener el **Modo Micro** como idea de vista final ("mirar por el microscopio") o se deja fuera?
5. ¿Las colonias que diseñe el visitante en "Diseñar tu colonia" se guardan en el navegador o sólo viven en la placa actual?
