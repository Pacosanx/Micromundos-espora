# Base de datos de la colección (placa)

Archivos CSV separados por `;` y en UTF-8: se abren con doble clic en Excel. La colección es **ficticia** (generada el 13/11/2026 a partir del esquema de la placa, con correcciones posteriores): cada muestra es un elemento de las recetas de Paco (`src/receta_A.json` y `src/receta_B.json`).

**Esta carpeta es la fuente de verdad de los datos.** Si una tabla dice algo distinto de lo que está escrito en el código, manda la tabla. Las reglas para tocarla están en `REGLAS_BASE_DE_DATOS.md`. Para comprobar que todo cuadra: `python base/validar_base.py` (solo lee, no modifica nada; debe terminar en `BASE OK`).

Cifras al 15/11/2026: **146 muestras · 241 registros de especies · 39 especies en el catálogo (38 en uso) · 12 fichas · 21 términos de glosario · 1006 vínculos entre muestras · 37 asociaciones lugar→muestra del Glosario**.

## Qué hay en esta carpeta

| Archivo | Qué es | Filas |
|---|---|---|
| `muestras.csv` | Las muestras: una por elemento de las recetas A y B | 146 |
| `colonias.csv` | Qué especies tiene cada muestra y cuántas colonias de cada una | 241 |
| `especies.csv` | Catálogo de especies reales: nombre público, dónde está, definición, qué produce | 39 |
| `fichas.csv` | Textos de trabajo de 12 fichas de muestra | 12 |
| `glosario.csv` | Términos del Glosario | 21 |
| `glosario_muestras.csv` | Muestras asociadas a cada término (hoy solo tiene los títulos de columna) | 0 |
| `entornos.json` | Los 15 lugares de las pantallas Bacterias, Levaduras y Mohos (5 por universo), con texto, imagen y 4 fuentes | — |
| `entornos_muestras.csv` | Qué muestras abre cada lugar con «Ver muestras de este entorno» (universo, entorno, código de muestra, relación directa o cercana) | 37 |
| `cambios_colonias_propuesta.csv` | Registro de la corrección de especies del 15/11/2026: qué se cambió en cada muestra, por qué y con qué fuente | 108 |
| `fuentes_colonias_propuesta.csv` | Las 56 fuentes citadas en ese registro, con título, año y enlace | 56 |
| `colonias_propuesta.csv` | Copia previa de la corrección (con la columna `descripcion`). Quedó solo como registro: el archivo vigente es `colonias.csv` | 241 |
| `muestras_png/` | Una imagen por muestra, con el código como nombre (`B-083-YNA.png`) | 146 |
| `validar_base.py` | Revisa las reglas de integridad | — |
| `REGLAS_BASE_DE_DATOS.md` | Reglas obligatorias para editar los datos | — |

## Cómo se conectan las tablas

- **Muestra → especies:** `muestras.codigo` = `colonias.codigo`.
- **Especie → catálogo:** `colonias.especie` = `especies.especie` (nombre científico).
- **Ficha → muestra:** `fichas.codigo` = `muestras.codigo`.
- **Muestra → dibujo:** `muestras.receta` + `muestras.id` identifican el elemento de la receta que la dibuja. Una muestra nunca se identifica por su posición en la lista ni por una coincidencia de texto en su origen.
- **Término → muestras:** `glosario_muestras.termino_id` = `glosario.id`, y `receta` + `id` = la muestra.
- **Lugar del Glosario → muestras:** `entornos_muestras.universo` + `entorno` = el lugar en `entornos.json`, y `codigo` = `muestras.codigo`.

Cada dato vive en **un solo lugar**: por ejemplo, el nombre para el público de una especie está solo en `especies.nombre_corto` (ya no se repite en `colonias.csv`).

## muestras.csv (146 filas, una por muestra)

| columna | qué es | de dónde sale |
|---|---|---|
| receta, id | receta (A o B) e id del elemento en esa receta | el esquema: ubica la muestra (centro y tamaño) |
| codigo | código único: grupo-número-iniciales | tabla (ver «Estado de la implementación») |
| origen | de dónde se tomó | tabla |
| grupo | B bacterias · L levaduras · M mohos · BL bacterias y levaduras | **el dibujo** (la paleta del elemento) |
| estado | A activa · C en conservación · MO montada · R registro digital | **el dibujo** (anillo = R, borde irregular = C) y, en el resto, azar según la antigüedad |
| metodo | congelada o liofilizada; solo si estado = C | tabla |
| anio, mes | fecha de recolección | **el dibujo** (distancia al centro) |
| colonias | total de colonias en la placa; 301 significa «más de 300» | **el dibujo** (tamaño) |
| hallazgo | `H-001`… Las muestras con el mismo hallazgo se recolectaron juntas (misma salida y mismo mes); hay 103 hallazgos distintos | tabla; hoy el prototipo no lo muestra |
| nota | texto libre, vacío | para completar; hoy no se usa |

Reparto de la colección: 49 muestras activas, 45 en conservación (25 liofilizadas y 20 congeladas), 25 montadas y 27 registros digitales. Por grupo: 32 de bacterias, 39 de levaduras, 41 de mohos y 34 mixtas (bacterias y levaduras).

## colonias.csv (241 filas, una por especie dentro de cada muestra)

| columna | qué es |
|---|---|
| codigo | la muestra a la que pertenece |
| especie | nombre científico (el mismo de `especies.csv`) |
| grupo | B, L o M de esa especie |
| colonias | cuántas colonias de esa especie hay en la placa |

## especies.csv (39 filas, una por especie)

Catálogo de 39 especies: 16 de bacterias, 10 de levaduras y 13 de mohos. Hoy 38 aparecen en `colonias.csv`: *Corynebacterium glutamicum* quedó sin ninguna muestra después de la corrección del 15/11 (el validador lo avisa, no es un error). *Penicillium sp.* es una entrada de género, para las fuentes que no precisan la especie.

| columna | qué es |
|---|---|
| especie | nombre científico (clave) |
| grupo | B, L o M |
| nombre_corto | nombre para el público general (único lugar donde está este dato) |
| donde_esta | dónde se la encuentra |
| definicion | definición breve |
| que_produce_o_transforma | qué produce o transforma |

Las explicaciones sobre organismos reales deben apoyarse en fuentes verificables.

## fichas.csv (12 filas)

Textos de trabajo de doce muestras: tres bacterianas, tres de levaduras, tres de mohos y tres mixtas. Columnas: `receta`, `id`, `codigo`, `titulo`, `descripcion`, `contexto`, `fuente_especies` (enlace que respalda las especies) y `estado` (hoy todas están en «borrador visual»). Sus fuentes respaldan asociaciones posibles entre organismos y entornos; las muestras y los recuentos siguen siendo ficticios, no observaciones ni análisis de laboratorio. La chicha se presenta como ejemplo de chicha de maíz, no como identificación de una receta real.

El archivo de fichas todavía **no genera por sí solo** las pantallas de detalle: el texto de la ficha de Yogur sigue escrito a mano en `src/pantallas-detalle.json`. Las traducciones visuales también están pendientes.

## Reglas que respeta el esquema (no romperlas al editar)

- **La suma de `colonias` por especie de cada muestra = `colonias` de la muestra** en `muestras.csv`.
- Las especies son del grupo de la muestra; una muestra BL tiene al menos una bacteria y una levadura.
- **No cambiar** `grupo`, `estado`, `anio`/`mes` ni `colonias` de una muestra sin cambiar el dibujo, porque salen de él y alterarían la estética.
- Excepción: 24 muestras BL que por su tamaño tendrían 1 colonia quedaron con 2 (una bacteria y una levadura). La diferencia de tamaño es mínima.

## Qué especies tiene cada muestra

Siete composiciones están **revisadas** contra fuentes por separado: B-150-LCR, B-302-SDC, M-189-BDH, M-048-MAB, BL-043-CDN, BL-183-KOM y BL-163-CHI, más Yogur (B-083-YNA, corregido el 14/11).

El 15/11/2026 se revisaron las otras 138. Las especies originales eran reales pero repartidas al azar dentro del grupo (por ejemplo, una bacteria intestinal en una chicha). El resultado, muestra por muestra, está en `cambios_colonias_propuesta.csv`, con sus fuentes en `fuentes_colonias_propuesta.csv`:

- **64 corregidas con fuente.** La columna `solidez` dice si la fuente nombra esa especie en ese sustrato (A, 23 muestras) o respalda el género, un sustrato cercano o es indirecta (B, 41).
- **39 pendientes:** se sospecha que no cuadran, pero no se encontró una fuente que sostenga una alternativa. Siguen con su asignación original.
- **5 se mantienen con respaldo** y **30 sin cambios** (plausibles; no se buscó fuente).

Lo corregido es creíble y consistente con el dibujo (grupo y suma de colonias no cambian), pero **no es observación de laboratorio**: la colección sigue siendo ficticia. Para las asignaciones B y las pendientes conviene seguir buscando fuentes.

## Vínculos

Dos muestras se conectan si comparten al menos una especie. Con los datos actuales hay **1006 vínculos** (234 de bacterias, 566 de levaduras, 179 de mohos y 27 mixtos). Eran 904 antes de la corrección de especies del 15/11. El color de cada hilo sale de los grupos de las especies compartidas. Los carteles muestran las especies de `colonias.csv` en ambas vistas, y «Leer más al respecto» despliega la definición, ubicación y transformaciones desde `especies.csv`. Los dos builds (`armar.bat` y `build.py`) incorporan estos datos al HTML.

## Estado de la implementación (15/11/2026)

- `armar.bat` incorpora al HTML las tablas de especies, vínculos, glosario y entornos (incluida `entornos_muestras.csv`: los botones «Ver muestras de este entorno» del Glosario filtran la Placa por código).
- Todavía **no** leen la tabla: el código, el origen y el método de cada muestra (`app.js` los genera con azar fijo; hoy el resultado es idéntico al CSV, pero es frágil) y los textos de la ficha de Yogur (escritos a mano en `src/pantallas-detalle.json`). Hay una versión de prueba, pendiente de aprobación, para lo primero (`placa_prueba_base.html`); para lo segundo hay una propuesta de diseño en `prueba_fichas/DISENO_FICHAS.md`.
- Para cambiar datos: se edita la tabla y se reconstruye con `armar.bat`. No se edita `placa.html`, que se genera.
