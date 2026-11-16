# Reglas para respetar la base de datos (para ChatGPT / Codex)

Proyecto Micromundos (MCI, UNC). Respondé en español, en lenguaje simple: Paco es diseñador gráfico y casi no programa. Usá «pantallas, piezas, muestras, recorrido»; no «editorial».

**La carpeta `base/` es la fuente de verdad de los datos. Lo que diga una tabla manda sobre cualquier dato escrito en el código.** Si falta un dato, agregalo a la tabla; no lo escribas dentro del código.

## 1. Qué hay en `base/`

| Archivo | Qué es | Clave |
|---|---|---|
| `muestras.csv` | 146 muestras (una por elemento de las recetas A/B) | `receta` + `id`, y `codigo` (único) |
| `colonias.csv` | 241 registros: qué especies hay en cada muestra y cuántas colonias (sin columna de nombre público: sale de `especies.nombre_corto`) | `codigo` + `especie` |
| `especies.csv` | Catálogo de 39 especies reales: dónde está, definición, qué produce | `especie` |
| `fichas.csv` | Textos de trabajo de 12 fichas de muestra | `codigo` (y `receta` + `id`) |
| `glosario.csv` | 21 términos del Glosario | `id` |
| `glosario_muestras.csv` | Muestras asociadas a cada término (hoy vacío) | `termino_id` + `receta` + `id` |
| `entornos.json` | Lugares de los universos Bacterias, Levaduras y Mohos, y sus fuentes | — |
| `entornos_muestras.csv` | Qué muestras abre cada lugar del Glosario («Ver muestras de este entorno»), por código | `universo` + `entorno` + `codigo` |
| `cambios_colonias_propuesta.csv`, `fuentes_colonias_propuesta.csv` | Registro de la corrección de especies del 15/11/2026 (qué, por qué y con qué fuente). Solo se leen; no alimentan el prototipo | — |
| `muestras_png/` | Una imagen por muestra, nombrada con su código | `codigo.png` |

Detalle de columnas: `LEEME.md` y `GLOSARIO.md`. Estos CSV usan `;` como separador y UTF-8.

## 2. Qué sale del dibujo y qué sale de la tabla

- **Del dibujo (recetas A/B):** `grupo`, `estado`, `anio`, `mes` y `colonias` de cada muestra. No se cambian en la tabla sin cambiar el dibujo.
- **De la tabla (`muestras.csv`):** `codigo`, `origen`, `metodo`. El prototipo debe leerlos de acá y no generarlos.
- **De la tabla (`colonias.csv`, `especies.csv`):** qué especies tiene cada muestra y todos los textos de especies.
- **Estado actual de la implementación:** hoy `app.js` todavía genera `codigo`, `origen` y `metodo` con azar fijo. Hay una versión de prueba (`placa_prueba_base.html`) que los lee del CSV. Hasta que Paco la apruebe, no migres nada más sin que lo pida.

## 3. Reglas de oro

1. **No inventes datos en el código.** Nada de códigos, orígenes, especies, fechas, cantidades ni textos de muestras escritos a mano ni generados al azar.
2. **No pongas ids, códigos ni nombres de una muestra concreta dentro del código** (por ejemplo «si el id es 912…»). Que dependa de una columna o de una fila de la tabla.
3. **Una muestra se identifica por `receta` + `id`** (así se une con el dibujo) **y por `codigo`**. Nunca por su posición en la lista ni por coincidencia de texto en el origen.
4. **Las especies se unen por el nombre científico** de `especies.csv`.
5. **Un solo lugar por dato.** No dupliques la misma información en dos columnas ni en dos archivos.
6. **Si cambiás los datos, cambiás la tabla y reconstruís** (`armar.bat`). No edites `placa.html`: se genera.
7. **No cambies azar, orden de listas ni semillas** (`mulberry`, `ORIGENES`, orden de las recetas) sin avisar: mover una pieza cambia el resto.
8. **No borres filas ni archivos.** Para sacar algo, marcalo y avisá.

## 4. Reglas de integridad (se pueden comprobar)

- `codigo` y `receta` + `id` son únicos en `muestras.csv`. El prefijo del código es el grupo (B, L, M, BL).
- Cada muestra tiene al menos una fila en `colonias.csv`.
- **La suma de `colonias` por especie de una muestra = `colonias` de la muestra** (301 significa «más de 300»).
- Las especies son del grupo de la muestra. Una muestra BL tiene al menos una bacteria y una levadura.
- Toda especie de `colonias.csv` está en `especies.csv`, con el mismo grupo.
- `metodo` está completo solo si `estado` = C. Estados válidos: A, C, MO, R.
- Cada `codigo` de `fichas.csv` existe en `muestras.csv`, con la misma `receta` + `id`.
- Cada fila de `glosario_muestras.csv` apunta a un término y a una muestra que existen.
- Cada fila de `entornos_muestras.csv` apunta a un lugar de `entornos.json` y a una muestra que existe, cuyo grupo incluye el del universo (B, L o M). Todo lugar debería tener al menos una muestra (si no, el validador avisa).

**Comprobación automática:** `python base/validar_base.py`. Solo lee, no modifica nada. Debe terminar en `BASE OK`.

## 5. Cómo agregar o cambiar contenido

- **Corregir una especie de una muestra:** editá `colonias.csv`. Mantené la suma de colonias y el grupo. Si la especie es nueva, agregala antes a `especies.csv`.
- **Texto de una especie:** `especies.csv` (`definicion`, `donde_esta`, `que_produce_o_transforma`).
- **Término de glosario:** fila nueva en `glosario.csv` con un `id` nuevo (no renumerar los existentes). Para asociarlo a muestras, filas en `glosario_muestras.csv`.
- **Muestras de un lugar del Glosario** (botón «Ver muestras de este entorno»): filas en `entornos_muestras.csv` (`universo;entorno;codigo;relacion`), con el nombre del lugar tal como está en `entornos.json`. No se busca texto en el origen de las muestras.
- **Nueva ficha de muestra:** una fila en `fichas.csv`. El texto de la ficha va en la tabla, no en el diseño de Figma. La ficha de una muestra aparece solo si su fila tiene estado `lista`.
- **Datos sensibles de contenido científico:** son ficticios como colección, pero las explicaciones sobre organismos reales deben apoyarse en fuentes verificables (columna `fuente`). No incorpores definiciones sin revisión.

## 6. Cosas que hoy están escritas a mano (no las copies como modelo)

Se migrarán a las tablas cuando Paco lo decida. No agregues más de este estilo:

- En la ficha de Yogur: «Qué es», «Dónde se tomó», «Origen», curiosidad, come/produce/resultado, «se ayudan» y abreviaturas de especies (`pantallas-detalle.json`), el id 912 (`esFichaPreparada`), la imagen de *S. thermophilus* y la lista de tres especies «ilustradas».
- `glosario_muestras.csv` está vacío.
- `hallazgo` y `nota` en `muestras.csv` no se usan.

## 7. Antes de entregar un cambio

1. `python base/validar_base.py` → `BASE OK`.
2. Reconstruir con `armar.bat`.
3. Abrir `placa.html` y revisar la consola: no debe aparecer `[base]` con diferencias entre CSV y dibujo.
4. `node src/verificar-flujos.cjs` (necesita `linkedom`): sin errores.
5. Decirle a Paco qué archivos de `base/` tocaste y por qué, para que actualice `04_decisiones_y_estado.md`.

## 8. Cifras actuales (15/11/2026)

146 muestras · 241 registros de especies · 39 especies (38 en uso: *Corynebacterium glutamicum* quedó sin muestras) · 12 fichas · 21 términos · 1006 vínculos (dos muestras se conectan si comparten al menos una especie) · 37 filas en `entornos_muestras.csv`.

Siete composiciones están revisadas por separado: B-150-LCR, B-302-SDC, M-189-BDH, M-048-MAB, BL-043-CDN, BL-183-KOM y BL-163-CHI (más Yogur, corregido el 14/11). **No las toques.** El 15/11 se corrigieron con fuente 64 de las otras 138 (ver `cambios_colonias_propuesta.csv`); 39 quedan pendientes de fuente y 35 sin cambios. Para seguir corrigiendo especies: editá `colonias.csv`, mantené grupo y suma, y verificá cada fuente abriéndola (no alcanza con el resumen de una búsqueda).
