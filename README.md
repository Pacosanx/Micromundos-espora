# Micromundos

## [▶ Abrir Micromundos](https://pacosanx.github.io/Micromundos-espora/)

**https://pacosanx.github.io/Micromundos-espora/**

Prototipo de Micromundos para Espora. Se usa en el navegador, sin instalar nada.

## Qué es

Micromundos es un atlas interactivo de una colección de microorganismos (bacterias, levaduras y mohos) que viven en alimentos, en el cuerpo y en la casa. Tiene cuatro zonas:

- **MUESTRAS**: la placa con las 146 muestras de la colección, en tres vistas (PLACA, VÍNCULOS y MUESTRARIO), con la guía «Cómo leer la placa», el buscador y el listado.
- **GLOSARIO**: los términos y los tres universos (bacterias, levaduras y mohos), con «Dónde están» y el acceso a las muestras de cada entorno.
- **Ficha de muestra**: hoy, la del yogur, con su microscopio, sus especies y las muestras que comparten especies con ella.
- **TU PLACA**: un espacio para sembrar y componer una placa propia y guardarla como imagen.

La colección es ficticia y las reacciones de TU PLACA son interpretaciones gráficas.

## Cómo abrirlo

- **En línea:** el enlace de arriba (GitHub Pages, siempre con la última versión de `main`).
- **En esta computadora:** abrir `placa.html` con el navegador. Es un único archivo que ya trae los datos y los estilos; las imágenes las toma de `src/assets/`.
- Si el navegador bloquea algo al abrirlo como archivo, servir la carpeta con cualquier servidor local (por ejemplo, el Python de TouchDesigner: `python -m http.server 5520`) y abrir `http://127.0.0.1:5520/placa.html`.

## Cómo está armado

| Carpeta o archivo | Qué tiene |
|---|---|
| `src/` | Las fuentes: `plantilla.html` (estructura y CSS), los `.js` de cada pantalla, los `.json` de diseño y recetas, y `assets/` con imágenes y tipografías. |
| `base/` | La base de datos de la colección en CSV (muestras, colonias, especies, fichas, glosario y entornos). Ver `base/LEEME.md`. |
| `build.ps1` / `armar.bat` | El armado: une `src/` y `base/` en `placa.html`. |
| `placa.html` | El resultado armado. **No se edita a mano.** |
| `index.html` | Redirige a `placa.html` (para GitHub Pages). |
| `prueba_*` | Pruebas y propuestas que todavía no pasaron al Atlas. |

## Cómo reconstruirlo

1. Editar las fuentes en `src/` o los datos en `base/`.
2. Doble clic en **`armar.bat`** (o, en PowerShell: `powershell -ExecutionPolicy Bypass -File build.ps1`).
3. Abrir `placa.html` y revisar el cambio. Si el navegador muestra la versión anterior, recargar con `?v=2` al final de la dirección.

`armar.bat` es el **único comando de armado vigente**. `build.py` quedó retirado porque producía un HTML incompleto; ahora solo llama a `build.ps1`.

## Cómo probarlo

| Prueba | Qué revisa | Cómo correrla | Necesita |
|---|---|---|---|
| Armado | Que `placa.html` coincida con sus fuentes | Doble clic en `verificar-armado.bat` | Nada (PowerShell de Windows) |
| Base de datos | Que los CSV respeten sus reglas | `python base/validar_base.py` → debe terminar en `BASE OK` | Python 3 (sirve el de TouchDesigner: `"C:\Program Files\Derivative\TouchDesigner\bin\python.exe" -X utf8 base/validar_base.py`) |
| Flujos | Que las pantallas se abran y respondan (simulado, sin dibujo real) | `node src/verificar-flujos.cjs` | Node.js 18 o más y `linkedom` (`npm install`) |
| Referencias | Que las palabras enlazadas al glosario existan | `node src/verificar-referencias.cjs` | Node.js 18 o más y `linkedom` (`npm install`) |

Para instalar lo de Node: instalar Node.js desde nodejs.org, abrir PowerShell en esta carpeta y correr `npm install` una vez. Las pruebas de Node no sustituyen la revisión visual: siempre abrir `placa.html` y mirar las pantallas tocadas.

## Cómo publicarlo

1. Rearmar `placa.html` con `armar.bat` y comprobarlo con `verificar-armado.bat`.
2. Confirmar los cambios y hacer `git push` desde `main`.
3. GitHub Pages se reconstruye solo en uno o dos minutos.

El repositorio es https://github.com/Pacosanx/Micromundos-espora. `PUBLICACION.md` resume cómo se publica y guarda los datos de una copia anterior (Sites, en `micromundos-publico`) que ya no se actualiza.

## Créditos y fuentes

- Diseño y dirección: Paco, para Espora (Diseño Gráfico 4, etapa 3).
- Datos de la colección y sus reglas: `base/LEEME.md` y `base/REGLAS_BASE_DE_DATOS.md`.
- Fuentes de las asignaciones de especies: `base/fuentes_colonias_propuesta.csv` y `base/cambios_colonias_propuesta.csv`.
- Términos del glosario: `base/GLOSARIO.md` y `base/glosario.csv`.
- Tipografía: Arimo (Google Fonts, licencia Apache 2.0). Escala tipográfica: `ESCALA_TIPOGRAFICA_PROPUESTA.md`.
- Traspaso técnico para quien siga el trabajo: `06_traspaso_placa_claude_code.md`.
