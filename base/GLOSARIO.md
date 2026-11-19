# Contenido del glosario

`glosario.csv` contiene los **21 términos** del Glosario. Los nombres iniciales provienen del boceto de Figma; las definiciones se fueron redactando con apoyo en fuentes. CSV separado por `;`, en UTF-8. Los campos que contengan punto y coma o saltos de línea deben ir entre comillas dobles.

## Columnas

`id` (estable, no se cambia), `numero`, `termino`, `grupo` (B, L, M o combinaciones), `bloque`, `definicion`, `estado`, `criterio_grupo`, `fuente` y `tipo`.

## Tipos de entrada

- `tipo=termino` (17): aparece en el índice inferior del Glosario.
- `tipo=universo` (3): Bacterias, Levaduras y Mohos. Aparecen únicamente en la portada del Glosario y abren sus pantallas propias (BACTERIAS, LEVADURAS y MOHOS). No llevan definición en esta tabla: el contenido de esas pantallas está en `src/pantallas-detalle.json` y en `base/entornos.json`.
- `tipo=taxon` (1): Saccharomyces. Conserva una referencia del boceto fuera del índice de términos.

No se renumeran los identificadores existentes al retirar una entrada del índice.

## Estado de las definiciones

- **13 redactadas** (`estado=redactado`), con la fuente en la columna `fuente`: Bacilo, Coco, Espiral, Fisión binaria, Gemación, Saccharomyces, Hifa, Micelio, Esporangio, Penicilina, Fermentación, Espora y Colonia.
- **8 en borrador** (`estado=borrador`): los tres universos (que no llevan definición, ver arriba) y **cinco términos todavía sin definir**: Flagelo, Biofilm, Masa madre, Agar y Crecimiento.

Una definición vacía se muestra como «Contenido en preparación». No se incorporan definiciones científicas sin revisión; se redactan con apoyo en la fuente indicada.

## Criterio de grupo

`criterio_grupo` vincula automáticamente una entrada general con **todas** las muestras que incluyen ese grupo. Se usa únicamente para las tres entradas generales (Bacterias, Levaduras y Mohos). No deduce morfología ni procesos de una muestra.

## Muestras asociadas a un término

`glosario_muestras.csv` contiene asociaciones editoriales explícitas, una por fila: `termino_id;receta;id;nota`. La combinación `receta` + `id` identifica una muestra en `muestras.csv` y en las recetas; no depende de su nombre ni del orden de la tabla. **Hoy el archivo está vacío** (solo tiene los títulos de columna): no se inventaron asociaciones para los términos del boceto. Los contadores de «fichas» del índice se calculan a partir de las asociaciones reales, sin duplicados.

## Lugares de las pantallas Bacterias, Levaduras y Mohos

Cada universo tiene 5 lugares (por ejemplo «Mano», «Pan viejo»), definidos en `base/entornos.json` con su imagen, textos y encuadre. El botón «Ver muestras de este entorno» abre la Placa filtrada con las muestras que indica la tabla **`base/entornos_muestras.csv`** (columnas `universo;entorno;codigo;relacion`). Una fila por muestra; `relacion` es `directa` (el origen de la muestra ES ese lugar) o `cercana` (un lugar parecido, para que ningún lugar quede sin muestras). Para agregar o quitar una muestra de un lugar se edita esa tabla; no se busca texto dentro del origen de las muestras (así «Mano» ya no lleva a «Pasamanos de escalera» ni «Pan» a «Panal de abejas»). El validador comprueba que cada fila apunte a un lugar de `entornos.json` y a una muestra que exista, de un grupo que pertenezca a ese universo.

Casos sin muestra propia: «Mano» (bacterias) no tiene una muestra de bacterias que sea una mano (*Mano de infante* es de levaduras y está en «Piel»); «Naranja» (mohos) no tiene un moho de naranja (*Cáscara de naranja* es de bacterias y levaduras). Quedan con muestras `cercana`.

## Cómo agregar un término

1. Agregar una fila a `glosario.csv` con un `id` nuevo, `grupo`, `bloque` y `tipo=termino`.
2. Para asociarlo a muestras, agregar filas en `glosario_muestras.csv`.
3. Ejecutar `armar.bat` (o `build.ps1`) para regenerar `placa.html`. `build.py` quedó retirado: solo llama a `build.ps1`.
4. Correr `python base/validar_base.py`: debe terminar en `BASE OK`.
