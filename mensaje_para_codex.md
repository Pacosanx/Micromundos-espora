Hola Codex. Antes de seguir con la revisión visual y la publicación, ojo: el 15/11/2026 (~22:30) Claude aplicó cambios en la carpeta del prototipo, con el visto bueno de Paco. Leé esto antes de tocar nada.

## Qué cambió

**Datos (`base/`)**
- `colonias.csv`: 241 filas (eran 254). Se corrigieron con fuente las especies de 64 muestras. Ya no tiene la columna `descripcion` (el nombre público sale de `especies.nombre_corto`).
- `especies.csv`: solo cambia el nombre público de *Brettanomyces bruxellensis*.
- `entornos_muestras.csv` (nuevo): qué muestras abre cada lugar del Glosario, por código.
- `validar_base.py`: ahora también revisa `entornos_muestras.csv`.
- `LEEME.md`, `GLOSARIO.md` y `REGLAS_BASE_DE_DATOS.md` actualizados. **Leé `REGLAS_BASE_DE_DATOS.md` de nuevo: cambiaron las cifras y las reglas.**
- Registro de la corrección: `cambios_colonias_propuesta.csv` y `fuentes_colonias_propuesta.csv`.

**Código**
- `src/app.js`: agrega `filtroCodigos` (filtro por lista de códigos).
- `src/pantallas-detalle.js`: el botón «Ver muestras de este entorno» usa `ENTORNOS_MUESTRAS` (ya no busca texto en el origen).
- `build.ps1` y `build.py`: incorporan `entornos_muestras.csv`.
- `placa.html`: regenerado con `build.ps1`.
- Tus cambios de la ficha (frame `560:13843`, galería, pie, lupa) **quedaron intactos**: las modificaciones se hicieron sobre tus versiones.

**Copia de seguridad** de todo lo reemplazado: `respaldo_antes_de_aplicar_2026-11-15/`.

## Qué falta (en este orden)

1. Correr `python base/validar_base.py` (debe dar `BASE OK`) y **`node src/verificar-flujos.cjs`**. Claude no tiene Node y no pudo correrlo. Contale a Paco el resultado, y si falla algo, si es por estos cambios (por ejemplo, el botón de entornos del Glosario).
2. Terminar la revisión visual de las tarjetas, los popups y el pie animado, ya con los datos nuevos.
3. **No publiques todavía.** Cuando termines, avisale a Paco y él decide si se publica y qué se sube (la carpeta pesa más de 200 MB de recursos).

## Cosas que NO son errores

- La galería de la ficha de Yogur ahora muestra **Tempeh, Manteca y Crema agria** (antes mostraba Cajero automático y Bebedero de plaza). Se calcula con los datos: está bien.
- *Corynebacterium glutamicum* quedó sin muestras: el validador lo avisa, no es un error.
- Tempeh (BL-231-TEM) todavía tiene *S. thermophilus* sin fuente: está en la lista de pendientes.

## Reglas que siguen valiendo

- No toques `base/` sin avisarle a Paco. No cambies datos de muestras (grupo, estado, fecha, colonias) ni los códigos de `AROS_REFORZADOS`.
- No cambies azar, orden de listas ni semillas.
- Si editás `src/app.js`, `src/pantallas-detalle.js` o `build.ps1`, **conservá** lo de entornos (`filtroCodigos` y `ENTORNOS_MUESTRAS`).
- `build.py` quedó desactualizado respecto de `build.ps1` (no incluye tu galería ni el pie). Usá `armar.bat` o `build.ps1`.
- Al terminar, listá los archivos que tocaste, para que Paco actualice `04_decisiones_y_estado.md`.
