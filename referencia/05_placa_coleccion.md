# 05 · Placa de la colección: codificación

Documento de traspaso para construir el gráfico principal de la pantalla de inicio: la placa de Petri gráfica donde cada colonia es una muestra de la colección. Decidido con Paco el 11 y 12/11/2026. Lo que diga Paco en el chat manda sobre este documento.

## Qué es

Una placa de Petri gráfica, con aros concéntricos de años. Cada elemento es **una muestra** (una placa de la colección). Al tocarlo se abre su ficha breve. Más adelante este esquema muta a un **esquema de conexiones** (diagrama circular con hilos entre muestras, como en la referencia de Paco); eso queda para después.

**Regla de producción:** todos los elementos gráficos se dibujan con **la herramienta Colonias de Paco** (su renderer `colonias.js` y sus recetas `.json`). No se recrean a mano ni con otro dibujo.

## Codificación (las cinco variables)

| Variable | Qué indica | Estado |
|---|---|---|
| **Color** | Grupo: bacterias, levaduras, mohos o combinación | Decidido |
| **Distancia al centro** | Fecha de recolección, continua (año + mes) | Decidido |
| **Ubicación en el aro (ángulo)** | Libre; las muestras de un mismo hallazgo quedan vecinas | Propuesta aceptada para probar |
| **Tamaño** | Cantidad de colonias que tiene la muestra, en escala logarítmica | Decidido |
| **Forma (morfología)** | Estado de la muestra en la colección (4 estados) | Decidido |

### 1 · Color = grupo
- Rosa = bacterias, amarillo = levaduras, verde = mohos.
- Muestra combinada = mezcla de las paletas de sus grupos.
- Paletas que usa Paco en las recetas de Colonias (c1 / c2 / c3):
  - Bacterias: `#ff4c52` / `#f58bc3` / `#ff4c52` (las fichas de estado usan `#ff4c52` / `#f06779` / `#ed74a0`)
  - Levaduras: `#ff9c20` / `#ffc21c` / `#dce642`
  - Mohos: `#27633f` / `#6a983a` / `#dce642`
  - Bacterias + levaduras (receta anterior): `#f58bc3` / `#ff4c52` / `#ffc21c`
- **Pendiente:** definir con Paco las paletas de las combinaciones con moho y la de tres grupos.

### 2 · Distancia al centro = fecha
- Cada aro marca el **1 de enero** de ese año. Una muestra de julio queda a mitad de camino entre su aro y el siguiente.
- Rango de prueba: 2000 a hoy.
- **Pendiente: orientación del tiempo.** Hay dos versiones prototipadas:
  - *Presente al centro* (como la imagen original de Paco): lo reciente se amontona en el medio y forma la mancha central; los aros viejos quedan casi vacíos. Contra: el centro se satura y cuesta tocar.
  - *Presente al borde*: la colección crece hacia afuera como una colonia real; queda un anillo poblado y el centro despejado. Facilita la transición al esquema de conexiones (las muestras ya están cerca del borde).
- La colección ficticia debe crecer con los años (pocas muestras viejas, muchas recientes).

### 3 · Ángulo = libre, con hallazgos agrupados
- El ángulo **no es un eje temático**. Se descartaron: campos (medicina, ambiente, tecnología, eran de la etapa de papers), origen cotidiano, recorrido de hábitats, parentesco, mes (ya está en la distancia) y rumbo geográfico (sin distancia no aporta).
- Argumento: en una placa real, la dirección donde aparece una colonia es azar.
- Única regla: las muestras de **un mismo hallazgo** (la misma toma, el mismo alimento, la misma salida) quedan vecinas. La ficha lo explica: "Recolectada junto a otras 3 muestras".

### 4 · Tamaño = cantidad de colonias en la placa
- Muchas colonias = elemento grande; pocas = chico.
- **Escala logarítmica con mínimo y máximo:** cada vez que la cantidad se multiplica por 10, el diámetro suma un paso fijo. Fórmula: `d = dMin + (dMax − dMin) · log(n) / log(nMax)`.
- Referencia con nMax = 300 y diámetro de 1 a 5: 1 → 1 · 10 → 2,6 · 30 → 3,4 · 100 → 4,2 · 300 → 5.
- Techo: más de 300 colonias = "incontable" en laboratorio. Queda en el tamaño máximo y la ficha dice "más de 300 colonias".
- En *registro digital*, la cantidad es la que se contó cuando la muestra existía.
- La relación dMax / dMin (5 en la referencia) se ajusta a ojo.
- No es necesario que la forma se lea en las colonias más chicas (dicho por Paco).

### 5 · Forma = estado de la muestra
Las cuatro comparten relleno: disco con anillos concéntricos de color (`gradient: rings`), mismo grano, blur y halo. **Solo cambia el contorno, y si el centro está lleno o vacío.**

| Estado | Definición (de Paco) | Forma | Parámetros clave en Colonias |
|---|---|---|---|
| **Activa** | Hay un cultivo vivo creciendo en una placa. | Disco lleno, borde circular liso | `shape: disk`, `irregularity: 0`, `studyLobes: 0` |
| **En conservación** | Se guarda como reserva física para intentar recuperarla después. El método (congelación, liofilización…) es dato de la ficha. | Disco lleno, borde irregular y asimétrico | `shape: disk`, `irregularity: 69`, `studyLobes: 0`, `studyDepth: 0`, `studyUneven: 0` |
| **Montada** | Preparada como objeto de exhibición (resina, epoxy). Registrar aparte si su inactivación fue comprobada. | Disco lleno, borde festoneado regular (~16 lóbulos) | `shape: disk`, `irregularity: 0`, `studyLobes: 16`, `studyDepth: 25`, `studyUneven: 64` |
| **Registro digital** | Se conserva la documentación (fotos, fecha, procedencia, notas) aunque la muestra física ya no esté. | Anillo grueso, centro vacío | `shape: ring`, `ringWidth: 22`, `irregularity: 7` |

Parámetros comunes a los cuatro: `gradient: rings`, `core: 66`, `blur: 9`, `halo: 18`, `grain: 13`, `grainSize: 1`, `porosity: 0`, `midpoint: 55`, `size: 65`, `opacity: 100`.

Lectura de conjunto: de más presente a más ausente (activa, montada, en conservación, registro digital).

Recetas fuente: `Activa.json`, `En_conservación.json`, `Montada.json`, `Registro_digital.json` (las tiene Paco; adjuntarlas en el chat nuevo).

## Interacción ya definida
- **Al tocar una muestra:** crece un poco (~25 %) y todas las demás bajan su opacidad. **Sin círculos ni trazos vectoriales** alrededor.
- Tocar un espacio vacío o la × cierra la selección.
- Ficha breve: código, grupo, fecha (mes y año), estado, cantidad de colonias, hallazgo y "recolectada junto a…".
- Animación de crecimiento de Colonias: las muestras aparecen en orden cronológico.
- Pantalla táctil, sin hover.

## Elementos de fondo (de la receta original de Paco)
- Anillo grande de la placa (`shape: ring`, `w: 0.76`, verdes, opacidad 48).
- Halos grandes difusos (`blur: 55`, opacidad 30). En la prueba se usaron uno por grupo, ubicados donde se concentran sus muestras y con tamaño según el peso del grupo. Es una propuesta, no está decidido.
- Aros de años: línea punteada fina; años con etiqueta cada 5 y "HOY".

## Prototipo de prueba (12/11)
- Artifact "Placa de la colección" en claude.ai (dibujado con `colonias.js` del paquete `colonias-web`). Sirve de referencia para la lógica de posición, la selección y la ficha.
- **Desactualizado en dos puntos:** el tamaño ahí era "relaciones" (al azar) y las formas de estado eran una propuesta vieja de 5 estados. Hay que reemplazarlos por lo de este documento.
- **Ojo técnico:** el `colonias.js` de ese paquete **no soporta `studyLobes`** (el festón de *Montada*). Antes de empezar, Paco tiene que exportar un paquete nuevo desde la versión actual de la herramienta Colonias.

## Para arrancar el chat nuevo
1. Adjuntar el export web actual de Colonias (`colonias.js` + `receta.json`) y las 4 recetas de estado.
2. Decidir la orientación del tiempo (presente al centro o al borde).
3. Definir las paletas de combinaciones que faltan.
4. Armar la colección ficticia: unas 60 a 80 muestras, distribuidas en hallazgos, con fecha, grupo, estado y cantidad de colonias. Creíble: crece con los años; las viejas tienden a estar en conservación, montadas o solo en registro.
5. Construir la placa a 1920 × 1100 dentro de la estructura base del Inicio (ver 04).

## Abierto (de esta placa)
- Orientación del tiempo.
- Paletas de combinaciones.
- Si los halos de fondo codifican algo o son solo atmósfera.
- Tamaño mínimo y máximo definitivos, y nMax.
- Qué es una "relación" para el esquema de conexiones. Propuesta: mismo organismo en otra muestra, o que conviven, entre hallazgos distintos.
- Cómo se ven los filtros (por grupo, por estado) sobre la placa.