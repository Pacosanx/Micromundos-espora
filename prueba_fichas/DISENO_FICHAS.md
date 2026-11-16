# Propuesta v2: fichas de muestra desde la base, con esquema (solo diseño, nada implementado)

Fecha: 15/11/2026. Reemplaza a la v1. Objetivo: pasar de **1 ficha escrita a mano** (Yogur) a **varias fichas armadas desde las tablas**, con una plantilla única, un estado por ficha (solo aparece si está en `lista`) y un **esquema** propio de cada muestra que explique qué pasa en su placa.

## 0. Tus decisiones y lo que cambian

| Decisión | Efecto en el diseño |
|---|---|
| «Qué es» = `descripcion` | Se usa la columna que ya existe y se acorta a ~90 caracteres al preparar cada ficha. |
| Tantas especies como tenga cada muestra | No hay máximo de 3. El esquema y la lista de especies se arman con **las especies reales de la muestra** (1 a 5 en la colección actual). Se agrega un tope práctico solo si el diseño lo exige (ver pregunta 1). |
| Cada ficha tiene su propia placa figurativa | Cada ficha lleva sus **tres imágenes propias**: placa, colonias y vista del microscopio. |
| «Come, produce…» es un **esquema**, no tres campos | Se reemplazan las columnas `come`, `produce`, `resultado`, `relacion_*` de la v1 por una **tabla de esquemas** (ver 2). |

## 1. Qué es el bloque «Qué produce o transforma»

Es el esquema de la captura que mandaste. Hoy está dibujado en el diseño de Figma con texto fijo. Sus partes:

```
 [ COME ]  ──▶  ( especies de la muestra )  ──▶  [ PRODUCE ]
 Lactosa         S. thermophilus  L. bulgaricus  ──▶  [ RESULTADO ]
                                                     Leche espesa
                                                          [ SE AYUDAN ]  párrafo a la derecha
```

| Parte del esquema | Qué es | ¿De dónde sale? |
|---|---|---|
| Círculo de **entrada** («COME») | qué consumen o aprovechan las especies | **dato nuevo**, tabla de esquemas |
| **Especies** del centro y sus rótulos | las especies de la muestra, con su dibujo y su abreviatura | **ya existe**: `colonias.csv` (cuáles y cuántas colonias) + `especies.csv` (abreviatura y forma, ver 3) |
| Círculos de **salida** («PRODUCE») y **resultado** | qué producen y qué se observa | **dato nuevo**, tabla de esquemas |
| **Relación** entre especies («SE AYUDAN») | cómo se vinculan las colonias | **dato nuevo**, tabla de esquemas |

Lo bueno: el centro del esquema **no se escribe a mano**; se arma con los mismos datos que la placa (las especies y su cantidad de colonias), así que el esquema siempre coincide con la muestra.

## 2. Modelo de datos del esquema: tabla nueva `esquemas.csv`

Una fila por **elemento** del esquema. Una ficha puede tener los que necesite: 1 o 2 entradas, 1 o 3 salidas, ninguna o varias relaciones.

| Columna | Qué es |
|---|---|
| `codigo` | la muestra (clave, une con `muestras.csv`) |
| `orden` | número para ordenar los elementos del mismo tipo |
| `rol` | `entra` · `sale` · `resultado` · `relacion` |
| `texto` | frase corta que va en el círculo («Lactosa», «Ácido láctico», «Leche espesa»). En una `relacion`, es el párrafo explicativo |
| `etiqueta` | opcional. Rótulo del círculo; si está vacía se usa el de siempre (COME / PRODUCE / RESULTADO). Sirve para mohos u otras fichas («CRECE EN», «DEJA»…) |
| `especie` | opcional. Qué especie lo hace; vacío = el conjunto de la muestra |
| `con_especie` | solo para `relacion`: la otra especie |
| `tipo_relacion` | solo para `relacion`: `ayuda` · `prepara` · `compite` · `convive` (el título del panel sale de acá: «SE AYUDAN», «COMPITEN»…) |
| `fuente` | enlace que respalda esa fila |

### Ejemplo: Yogur en este modelo (la captura que mandaste)

```
codigo;orden;rol;texto;etiqueta;especie;con_especie;tipo_relacion;fuente
B-083-YNA;1;entra;Lactosa;;;;;(pendiente)
B-083-YNA;1;sale;Ácido láctico;;;;;(pendiente)
B-083-YNA;1;resultado;Leche espesa;;;;;(pendiente)
B-083-YNA;1;relacion;S. thermophilus crece primero y prepara la leche. Después L. bulgaricus sigue y produce más ácido. Juntas trabajan más rápido que solas.;;Streptococcus thermophilus;Lactobacillus delbrueckii subsp. bulgaricus;ayuda;(pendiente)
```

### Ejemplos ilustrativos de otras fichas (borradores míos, **sin fuente verificada todavía**)

| Muestra | entra | especies | sale | resultado | relación |
|---|---|---|---|---|---|
| BL-183-KOM · Kombucha | té con azúcar | *Brettanomyces* + *Komagataeibacter* | alcohol, ácidos, celulosa | bebida ácida con una película encima | la levadura transforma el azúcar y la bacteria aprovecha el resultado (`ayuda`) |
| M-048-MAB · Mermelada abierta | azúcar de la mermelada | *Penicillium verrucosum* | toxinas (micotoxinas) | mermelada con moho: no se come | (1 sola especie: sin relación) |
| B-150-LCR · Leche cruda | grasas y proteínas de la leche | *Pseudomonas fluorescens* | sustancias que alteran la leche | leche que se arruina en la heladera | (sin relación) |

Si una ficha no tiene filas de `relacion`, el panel de la derecha no se muestra.

## 3. Datos que hay que completar en la base

| Dónde | Qué | Cuánto |
|---|---|---|
| `especies.csv` | `abreviatura` («S. thermophilus») | 39 filas: se puede generar y corregir excepciones |
| `especies.csv` | `forma`: cómo se dibuja la célula (coco, cocos en cadena, bacilo, levadura con brote, hifa de moho…). Reusa los nombres del Glosario (Coco, Bacilo, Hifa…) | 39 filas, cada una con fuente |
| `especies.csv` | `imagen` (opcional): dibujo propio de una especie, como el de *S. thermophilus* | solo donde haga falta |
| `esquemas.csv` | los elementos del esquema de cada ficha | ~4 a 6 filas por ficha, cada una con fuente |
| `fichas.csv` | las columnas nuevas de la sección 4 | 1 fila por ficha |
| archivos | 3 imágenes por ficha (placa, colonias, microscopio) | ver 6 |

Orden sugerido: empezar por las **8 fichas con composición revisada** (B-083, B-150, B-302, M-189, M-048, BL-043, BL-183, BL-163). Las 4 sin revisar (L-108, L-115, L-230, M-259) esperan a que se revise su composición.

## 4. `fichas.csv`: columnas propuestas

`●` obligatoria para `lista` · `○` opcional.

| Columna | | Qué es |
|---|---|---|
| `codigo`, `receta`, `id` | ● | clave y verificación contra `muestras.csv` (ya existen) |
| `estado` | ● | `borrador` · `en_revision` · `lista` (ya existe; cambian sus valores) |
| `composicion` | ● | `revisada` o `provisoria` (**nueva**) |
| `titulo` | ○ | título grande; si está vacío usa el origen (ya existe) |
| `descripcion` | ● | «QUÉ ES», ~90 caracteres (ya existe) |
| `contexto` | ● | «ORIGEN», categoría corta (ya existe) |
| `donde_se_tomo` | ● | «DÓNDE SE TOMÓ» (**nueva**) |
| `curiosidad` | ○ | cuadro «Curiosidad» (**nueva**) |
| `fuente_especies` | ● | enlaces que respaldan las especies (ya existe) |
| `fuente_textos` | ● si hay `curiosidad` | enlaces que respaldan los textos de la ficha (**nueva**) |
| `imagen_placa` | ● | placa figurativa de esa muestra (**nueva**) |
| `imagen_colonias` | ● | imagen de las colonias (**nueva**) |
| `imagen_micro` | ● | vista del microscopio de esa muestra (**nueva**) |

Rutas relativas a `src/assets/`. Para Yogur ya existen (`detalles/ficha-yogur-crema.png`, `detalles/ficha-yogur-abstracta.png`, `detalles/lupa-micro.png`).

## 5. Estados y reglas del validador

| Estado | Significa | ¿Se ve? |
|---|---|---|
| `borrador` | incompleta o sin revisar | no |
| `en_revision` | completa, falta tu visto bueno | no |
| `lista` | aprobada | **sí**: botón «Ver ficha de muestra» en el cartel y enlaces desde las especies |

Migración: Yogur pasa a `lista`; las otras 11 a `borrador`.

Una ficha `lista` debe cumplir:

1. Existe la muestra y coinciden `receta` + `id`.
2. `composicion` = `revisada` y `fuente_especies` completa.
3. Tiene **al menos una entrada y al menos una salida o resultado** en `esquemas.csv`, cada fila con fuente.
4. Si hay `relacion`, nombra dos especies que **sí están en la muestra** y son distintas.
5. Cada especie de la muestra tiene `abreviatura` y `forma`.
6. Están llenas las columnas ●; si hay `curiosidad`, hay `fuente_textos`.
7. Existen las tres imágenes.
8. Los textos no superan un largo máximo (a definir con el diseño; hoy: «Qué es» 90, relación 136, curiosidad 92 caracteres).

## 6. Imágenes y peso

Las tres imágenes de Yogur pesan 4,0 + 1,5 + 7,4 MB. Con 12 fichas, `src/assets/` crece **~155 MB**. No engordan `placa.html` (se cargan aparte), pero sí el paquete que se copia a la pantalla del museo. Se puede bajar mucho optimizando las imágenes (por ejemplo, la del microscopio).

El **mapa de toque** (qué parte de la imagen es una colonia) hoy está hecho a mano para Yogur. Propongo generarlo una vez por imagen a partir de su transparencia, con un script aparte, y guardarlo junto a ella.

## 7. Plantilla única y cambios de código previstos (cuando lo apruebes)

- Una sola pantalla (la de Figma). Un archivo chico `src/ficha-campos.json` dice qué nodo recibe cada campo. Es mapa de diseño, no datos.
- El esquema se **dibuja desde los datos**: una entrada a la izquierda, las especies al centro (cada una con su dibujo según `forma`, y con tamaño proporcional a su cantidad de colonias), salidas a la derecha, y una línea entre las dos especies de cada relación. Esto necesita un diseño de Figma que admita 1, 2 o 3 círculos por lado y 1 a 5 especies.
- Los bloques opcionales (relación, curiosidad) se ocultan si no hay datos.
- `armar.bat` y `build.py` incorporan `fichas.csv`, `esquemas.csv` y las columnas nuevas de `especies.csv`.
- `esFichaPreparada(s)` pasa a «la ficha de `s.codigo` está `lista`» (se va el id 912), y `prepararFicha` recibe la muestra elegida.
- Se retiran del código las abreviaturas, la imagen fija de *S. thermophilus* y la lista fija de «especies ilustradas».

## 8. Preguntas que quedan (actualizadas)

1. **Diseño del esquema:** ¿cuántos círculos como máximo de entrada y de salida? ¿Cómo se acomodan 4 o 5 especies en el centro? Esto es una decisión de diseño en Figma antes que de datos.
2. **Mohos y mixtas:** ¿el esquema vale igual (entra → especie → sale)? ¿Te sirve la columna `etiqueta` para cambiar los rótulos («CRECE EN», «DEJA»)?
3. **Relaciones:** ¿alcanzan `ayuda`, `prepara`, `compite` y `convive`? ¿Se dibuja como una línea entre las dos especies del centro?
4. **Rigor del esquema:** es «sintético», pero ¿cada fila lleva fuente (lo que propongo, porque son afirmaciones sobre organismos reales) o alcanza con las de la ficha?
5. **Imágenes:** de cada muestra tenés varias variantes (por ejemplo, tres de Yogur). ¿Cuál es la oficial? ¿La vista del microscopio se genera con la herramienta Colonias para cada ficha?
6. **«Dónde se tomó»:** es un dato inventado por ficha (colección ficticia). ¿Está bien?
7. **Fuentes de Yogur:** los textos de «Come/Produce», «Se ayudan» y «Curiosidad» hoy no tienen fuente registrada. En `entornos.json` hay un enlace de Yogur (extension.usu.edu) que podría servir; no lo verifiqué.
8. **Estados y orden de trabajo:** ¿`borrador` / `en_revision` / `lista` te sirven? ¿Arrancamos por las 8 fichas con composición revisada?
