# Escala tipográfica de Micromundos · propuesta

Estado: **propuesta, sin aplicar**. No se tocó ningún archivo de `src/`. Los valores salen de lo que ya está en el prototipo (frame 1920×1100), no del brief; hay que validarlos con Paco.

Familia: Arimo, pesos 400 y 700 (los únicos que carga Google Fonts). No usar 600.

## 1. Roles

| Rol | Variable | Tamaño / interlineado | Peso | Mayúsculas | Blur de texto |
|---|---|---|---|---|---|
| Display | `--t-display` | 72 / 72 | 400 | no | 3 px (capa lejana) |
| Título | `--t-titulo` | 32 / 36 | 400 | sí | .75 px |
| Subtítulo / navegación | `--t-sub` | 24 / 28 | 400 | no | 2.5 px en vistas, .7 px en pies |
| Lectura | `--t-lectura` | 20 / 28 | 400 | no | **0** (nítido) |
| Cuerpo y dato | `--t-cuerpo` | 17 / 24 | 400 | no | **0** (nítido) |
| Botón | `--t-boton` | 17 / 20 | 700 | no | 0 |
| Etiqueta | `--t-etiqueta` | 14.667 / 18 | 400 | sí | .5 px |
| Micro (solo dentro de muestras) | `--t-micro` | 12 / 14 | 400 | no | n/a |

Reglas:
- Un rol = un tamaño. Prohibido `font-size` suelto y `!important` de tamaño.
- Mínimo de legibilidad fuera de muestras: 14.667 px. El 12 queda solo para `.etq .txt`.
- Etiquetas con opacidad: no bajar de .6 y medir contraste real sobre `mix-blend-mode: difference`.
- Botón: área táctil mínima 48 × 48 px (padding, no tamaño de letra). Hoy "volver" tiene 32 px.
- `letter-spacing`: 0 en todo, salvo etiquetas en mayúsculas (.05em) si se decide.
- Blur: máximo 4 valores por capa (0 lectura, .5 etiqueta, 2.5 navegación, 3 display). Hoy hay 7.

## 2. Bloque CSS (para `plantilla.html`, en `:root`)

```css
:root{
  --f: 'Arimo', Arial, sans-serif;
  --t-display: 72px;   --l-display: 72px;
  --t-titulo: 32px;    --l-titulo: 36px;
  --t-sub: 24px;       --l-sub: 28px;
  --t-lectura: 20px;   --l-lectura: 28px;
  --t-cuerpo: 17px;    --l-cuerpo: 24px;
  --t-boton: 17px;     --l-boton: 20px;
  --t-etiqueta: 14.667px; --l-etiqueta: 18px;
  --t-micro: 12px;     --l-micro: 14px;
  --area-tactil: 48px;
  --blur-lectura: 0px; --blur-etiqueta: .5px; --blur-nav: 2.5px; --blur-display: 3px;
}
```

## 3. Mapa de reemplazo (hoy → rol)

| Hoy | Dónde | Pasa a |
|---|---|---|
| 72 | `#titulo`, `#tuPlaca h1` | display |
| 48 | `.g-colonia .g-rotulo` | decisión: display o título (ver §4) |
| 32 | `.nom` (ficha, glosario, especie, reacción) | título |
| 28 | `.cartel-composicion .nom` | título (32) |
| 24 | `.vista`, `.signo`, `.tp-pie button` | subtítulo |
| 20 | `.g-termino`, `#tuPlaca p` | lectura |
| 17 / 17.33 / 17.3333 | `dd`, `.fila .n`, `.item span`, `.tam span`, `#buscador input`, `.g-muestra`, `.g-vacio`, `.definicionGlosario`, `.g-cuenta`, `.ficha-archivo-datos dd`, `#tpReacciones`, `.tp-biblioteca__mode/tab`, `.tp-biblioteca__top p` | cuerpo |
| 17.3333 en cabecera y botones de cabecera | `#cabecera button`, `#cabecera .fila b` | botón |
| 16 | `.g-bajar`, `.cartel-especie .cod`, `.tp-biblioteca__hint` | botón (bajar, hint) / etiqueta (cod) |
| 15 / 15.5 | `#aviso`, `.especieDetalle`, `.ficha-relacion-especie` | cuerpo |
| 14 | `#tpReacciones p`, `#tpAvisoQuitar`, `.ficha-galeria__cta` | etiqueta (cta: botón) |
| 14.667 / 14.67 | `dt`, `.cod`, `.rotulo`, `#seccion`, `.g-encabezado`, `.g-volver`, `.tp-leyenda`, `.tp-paleta p`, `.fila .c`, `#listaCab`, indicaciones | etiqueta (`.g-volver`: botón) |
| 12 | `.etq .txt` | micro |
| 12 | `.especieDetalle b`, `.tp-menu-secundario span` | etiqueta (14.667) |

Interlineado: reemplazar los 14 valores actuales por los 7 pares de la tabla.

## 4. Decisiones que necesito de Paco

1. `.g-rotulo` (48 px): ¿es un segundo Display o se baja a Título?
2. Botón en 17 / 700 o en 20: para tocar sin hover en 27", 20 puede leerse mejor.
3. ¿Se aceptan 14.667 px como piso, o se sube a 16?
4. ¿La lectura nítida (blur 0) contradice algo del Figma? Hoy el Figma pone .5 px en la mayoría.

## 5. Para aplicar

Tocar `plantilla.html`, `glosario.css`, `pantallas-detalle.css`, `tu-placa-v12.css`, `tu-placa-biblioteca.css`, `ficha-galeria.css`; regenerar con `armar.bat`. Canvas de exportación (`tu-placa-v12.js:129`, `tu-placa.js:72`): 26/18/14 px, sacarlos de variables propias.
