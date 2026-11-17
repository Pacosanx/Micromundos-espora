# Análisis del muestrario (Codex) · qué poner en TU PLACA

Fecha: 17/11/2026 · Material: `espora/herramientas/muestrario-micromundos/` (`index.html`, `muestrario.js`, `renderer-muestra.js`, `generador-placa.js`, `muestrario.css`, `recursos-menu/*.svg`) contrastado con `TRASPASO_ATLAS_DIGITAL.md`, `COLONIAS_PARA_TU_PLACA.md` y `AUDITORIA_Y_CHECKLIST.md`.
No se modificó nada del muestrario, de `placa.html` ni de `base/`. Este es el único archivo nuevo.

## 0. Qué vi y qué no (leelo primero)

**Lo comprobé (código leído completo + página abierta en un navegador real, servida desde un servidor local de solo lectura y cerrado después):**
- La página carga sin errores de consola. Tiene **7 secciones y 38 tarjetas**, con **209 sliders y 53 selectores** en total.
- Recorrí y miré las 7 secciones; todas las vistas previas se dibujan (algunas tardan en aparecer hasta que se hace scroll: usa carga perezosa).
- Medí en la página: no hay ningún texto con `filter: blur` (cumple la decisión B-2). Tamaños de letra: 11 px, 12 px, 13 px y **18 px en las 38 descripciones** (ver §1.7).
- Calculé a partir del código las paletas y comparé con el generador.

**No lo pude comprobar (no lo afirmo):**
- Arrastrar colonias, Mayús para selección múltiple, girar en el menú contextual y tocar el menú de la placa: **sólo leí el código**, no operé esos gestos.
- Táctil, Safari/iPad, rendimiento medido (no medí tiempos de repintado al mover sliders).
- Cómo se ve cada pieza dentro de la TU PLACA real (con su agar y borde) y cómo se ve el modo Relaciones real de COLONIAS: no lo ejecuté.
- **Capturas:** las miré, pero la herramienta que uso no me permite guardarlas como archivos en el repo. Si las querés versionadas, hay que sacarlas con `shot.py`/Playwright o a mano.

---

## 1. Qué muestra y qué le falta para decidir bien

### 1.1 Qué muestra
| Sección | Tarjetas | Qué hay (visto) |
|---|---|---|
| 01 Formas | 3 | Colonia base, Filamento, Crecimiento unilateral |
| 02 Herramientas | 2 | Anillo (grosor interior) y Recorte (arco/fragmento) |
| 03 Color | 8 | Radial, Lineal, Anillos, Un color, Zonada, Aureolada, Con manchas, Pigmentos irregulares |
| 04 Materia/geometría | 3 | Grano+porosidad, Borde+filamentos, Irregularidad+lóbulos |
| 05 Construcciones | 6 | Núcleo y satélites, Secuencia axial, Racimo, Frente de crecimiento, Placa propuesta, Pequeñas delante/detrás |
| 06 Selección | 3 | Selección circular/grupo, Menú contextual (4 variantes), Menú alrededor de la placa |
| 07 Encuentros | 13 | 5 Simbiosis, 2 Rechazo, 1 Barrera, 2 "Misma especie", 3 "Ciclo propuesto" |

Es un buen **estudio exploratorio**: usa el mismo motor que COLONIAS, cada tarjeta es independiente y todas tienen "Restablecer". El aviso "son propuestas gráficas, no predicciones biológicas" está bien puesto.

### 1.2 Lo que le falta para decidir (lo más importante)
1. **No hay forma de decidir.** Nada permite marcar "esta sí / esta no", guardar una selección ni exportar los valores elegidos. Es una mesa de pruebas, no una herramienta de decisión: cualquier elección hay que anotarla aparte.
2. **No se puede comparar lado a lado.** Cada tarjeta tiene su propio juego de sliders; para comparar dos variantes hay que scrollear entre tarjetas y mover cada una por separado.
3. **Nada se ve a tamaño real sobre la placa.** Las vistas previas ocupan ~230–310 px de ancho y las colonias pequeñas de las composiciones quedan en puntos (visto en "Secuencia axial", "Núcleo y satélites", "Placa propuesta"). No hay forma de ver "una colonia de 40 % de la placa vs. una de 8 %".
4. **Casi todo se ve en rosa.** Cada tarjeta arranca en "Rosas y rojos"; para ver amarillo o verde hay que cambiar el selector tarjeta por tarjeta. No hay una vista de las tres familias juntas.
5. **Las reacciones están siempre iguales:** A a la izquierda, B a la derecha, mismos tamaños, sin animación. No muestran el **progreso** (el "desarrollo del encuentro" que ya tiene COLONIAS) ni el tratamiento **Neutro**.
6. **Faltan en el catálogo las formas figurativas que `COLONIAS_PARA_TU_PLACA.md` marca como candidatas fuertes:** Micelio algodonado (`cotton`), Peluda (`hairy`), Ramificada (`branching`), Plegada (`wrinkled`). El renderer del muestrario las soporta (`renderer-muestra.js`), pero no tienen tarjeta. Tampoco está `pair`/`capsule`, que es la base de UNIR en 8/infinito.
7. **Texto de sección inconsistente:** "01 · Formas" dice "las cuatro formas base" pero muestra **3** (el código mueve Zonada, Aureolada, Con manchas y Pigmentos a la sección Color después de armar la lista).

### 1.3 Demasiadas opciones por tarjeta
209 sliders para ~38 tarjetas son 5–9 controles por tarjeta (visto: en ancho de celular una sola tarjeta ocupa más de una pantalla). Contradice el criterio de `COLONIAS_PARA_TU_PLACA.md` §4: *"¿el visitante entiende qué hace sin leer?"* y la meta de unos 14 controles en total. Para **decidir** no hace falta tocar 9 sliders por forma.

### 1.4 Legibilidad (visto)
- **Menús dibujados en el canvas:** las etiquetas (TAMAÑO, OPACIDAD, MULTIPLICAR, FOCO, VARIACIÓN, GIRAR) están a 8 px sobre un canvas de 400 px que se muestra a ~230–310 px → **~5–6 px reales**. En la captura con zoom apenas se leen. Para un video de 1920×1100 y para evaluar el menú, no sirven.
- **Jerarquía de la tarjeta rota:** el selector CSS `header>p:not(.eyebrow){font-size:18px}` (pensado para la cabecera de la página) también se aplica a la descripción de cada tarjeta: medí **18 px en las 38 descripciones** contra un título de 19 px. La descripción casi tiene el mismo peso que el título y empuja los controles hacia abajo. Debería ser 12 px, como declara `.card p`.
- **Grilla desigual:** `align-items:start` hace que las tarjetas de una misma fila tengan alturas distintas (visto en Encuentros y Construcciones).

### 1.5 Paletas distintas entre muestrario y generador (verificado en el código)
| Familia | `muestrario.js` (`FAMILIES`) | `generador-placa.js` (`familyColors`) |
|---|---|---|
| Rosa | `#ff4c52 #f58bc3 #f06779` | `#ff4c52 #f58bc3 #ff4c52` |
| Amarillo | `#ff9c20 #ffc21c #efcc6d` | `#ff9c20 #ffc21c #dce642` |
| Verde | `#27633f #6a983a #dce642` | igual |

Si se decide con el muestrario y después se programa con el generador, **los colores no van a coincidir** (el borde del amarillo y del rosa cambia). Hay que elegir una sola tabla antes de portar.

### 1.6 Otros hallazgos de código (no vistos, leídos)
- `generador-placa.js:36` usa `Math.random()` para la semilla de cada elemento (y para el aro); es el mismo problema de H-19. El muestrario lo tapa cacheando la receta por semilla (`plateRecipe`), pero la composición no es reproducible. Antes de portarlo, volverlo determinista.
- Los íconos del menú reutilizan `tp-tamano.svg` para "Densidad" y `tp-orden.svg` para "Color": el ícono no corresponde a la función.

### 1.7 Ya cubre bien
Anillo y Recorte como herramientas del menú contextual (idea clara y fácil de ver), el catálogo de reacciones como **matriz por familias** ("Ciclo propuesto"), y la separación entre "formas" y "tratamientos cromáticos".

---

## 2. Qué mejorar o cambiar (contrastado con `COLONIAS_PARA_TU_PLACA.md`)

**Organización.** Reordenar por **decisión**, no por tipo de control: (1) Catálogo de formas, (2) Paleta, (3) Herramientas del menú contextual, (4) Anillo de la placa, (5) Composiciones sembrables, (6) UNIR y reacciones. Hoy "Color" mezcla tratamientos de forma (Zonada, Con manchas) con distribución de color.

**Comparación.** Agregar un modo "comparar": 2–4 variantes de una misma pieza en una fila, con un único control compartido; y en Color, **las tres familias en la misma fila**.

**Interacción.** Cada tarjeta con un botón **Elegir / Descartar** y un resumen exportable ("lo decidido") — es lo que falta para pasar a TU PLACA. Mantener el gesto de menú por arrastre sobre el arco (mantener y rotar), que es el pedido D-07.

**Legibilidad.** Etiquetas de menú en HTML (no en canvas) o dibujadas a ≥ 11 px reales; corregir la descripción de 18 px; vista previa más grande (hoy ~310 px) para las composiciones.

**Cantidad de opciones.** Máximo **3 sliders visibles por tarjeta**; el resto detrás de "Más". Es la regla del §4 de `COLONIAS_PARA_TU_PLACA.md` (parámetro contextual = visible y autoexplicativo).

**Anillo de la placa (sección 06) frente a lo decidido por Paco:**
| Decidido (`TRASPASO`) | Muestrario |
|---|---|
| Foco ✔ | **Falta** |
| Rotación del conjunto ✔ | **Falta** |
| Paleta en % ✔ | Está como "Color" con tres pesos (Rosas/Amarillos/Verdes) ✔ |
| Variación global (formas y tamaños) ✔ | Está como "Variación" ✔ |
| Densidad: por definir | Propone una: **separación ↔ agrupación** (escala las distancias al centro) |
El muestrario aporta una respuesta a la pregunta abierta de "Densidad": mover las colonias hacia/desde el centro, que equivale a la "Compresión↔expansión" de COLONIAS. Es una propuesta razonable, pero **le faltan Foco y Rotación**, que son justamente las decididas.

**Menú contextual (sección 06):** la idea de que **un mismo botón cambie de herramienta** (Tamaño / Anillo / Recorte) evita sumar botones y es buena. Falta decidir si Anillo y Recorte entran o no al primer nivel del menú (hoy son 6 botones fijos).

---

## 3. Formas y colores: qué dejar y qué descartar (según lo que vi)

### 3.1 Formas
| Pieza | Decisión | Por qué (lo visto) |
|---|---|---|
| Colonia base | **Dejar** | Base clara, con blur y grano propios del sistema |
| Filamento | **Dejar** | Radial de trazos, muy reconocible como moho; la más distinta del conjunto |
| Crecimiento unilateral | **Dejar** | Da dirección y asimetría; se combina bien con "Girar" |
| Con manchas | **Dejar** | Es la que más se distingue de las lisas (puntos oscuros) |
| Pigmentos irregulares | **Dejar** | Asimétrica, rompe la simetría radial |
| Anillo / Recorte | **Dejar como herramientas**, no como formas | La lectura es clara y se aplican a cualquier forma |
| Zonada | **Descartar o fusionar** | A tamaño tarjeta se parece a "Anillos de color" y a la Radial; aporta poco |
| Aureolada | **Descartar o fusionar** | Casi indistinguible de la Radial a este tamaño |
| Un color | **Descartar** | Disco plano; pierde la identidad blur/grano |
| Lineal | **Probar con reserva** | Se ve como un disco partido en dos mitades; da dirección pero es muy duro frente a las demás |
| Micelio, Peluda, Ramificada, Plegada | **Agregar a la prueba** | Las propone `COLONIAS_PARA_TU_PLACA.md` §3-#6 y aquí no se muestran |
| Pareja / cápsula | **Agregar a la prueba** | Base de UNIR en 8/infinito |

Resultado orientativo: **~8–10 formas** (5 vistas + Micelio/Ramificada/Peluda a decidir + pareja), de acuerdo con E-1.

### 3.2 Colores
- **Dejar las tres familias** (rosas, amarillos, verdes) y la lógica de paleta cerrada; es lo que usa también el generador.
- **Unificar la tabla** (§1.5) antes de portar.
- **Cuidado con "color mixto" en UNIR:** el muestrario mezcla con un degradado lineal entre el primer color de cada familia. Calculé el punto medio entre rosa (`#ff4c52`) y verde (`#27633f`): da ≈ `#935849`, un marrón rojizo apagado. **No lo vi en pantalla** (el muestrario muestra rosa+verde como *rechazo*, no como mezcla), así que es una advertencia calculada, no observada: conviene probar esa combinación y, si queda turbia, definir un color de unión por par de familias.

---

## 4. Qué agregar para decidir mejor

1. **Comparador lado a lado** de 2–4 variantes con un control compartido.
2. **Vista "sobre la placa":** una placa circular con agar y borde (los que ya usa TU PLACA) donde se coloquen la misma colonia en 3 tamaños (p. ej. 8 %, 20 %, 40 % del diámetro) y 3–5 colonias a la vez, para ver escala real y superposición.
3. **Matriz de reacciones** 3×3 (rosa/amarillo/verde × rosa/amarillo/verde) con **un solo control de "progreso"** que anime el encuentro, y el tratamiento **Neutro**. Hoy sólo hay 3 ejemplos de "ciclo".
4. **Reacción y orientación:** probar A/B en distintos ángulos y tamaños distintos, no siempre A a la izquierda y del mismo tamaño.
5. **Uniones, caso por caso (P-7 abierta):** una fila con los 3–4 casos (mismo grupo, bacteria+levadura, moho+bacteria, tamaños muy distintos) × las 2 formas (más grande / 8-infinito) para que Paco elija cuál aplica a cada caso.
6. **Botones Elegir / Descartar + exportar** (JSON o `.md`) con lo decidido.
7. **Fondo real de la placa** (no el crema plano de las tarjetas) y opción de fondo oscuro, para ver el contraste de los verdes.
8. **Vista de composiciones sembrables a mayor tamaño:** que el preview de cada preset ocupe el ancho disponible, no ~100 px de diámetro.
9. **Foco y Rotación en el anillo** (las dos decididas) y una tarjeta que muestre cómo cambian TODAS las colonias a la vez.

### Reacciones: qué dejar y qué descartar (visto)
| Tarjeta | Decisión | Nota |
|---|---|---|
| Simbiosis · unión de gotas | **Dejar → como UNIR** | Se lee como un 8/cacahuate con degradado; responde a "unir en forma de 8" |
| Simbiosis · forma combinada | **Dejar → como UNIR "más grande"** (probar) | Crea una tercera colonia entre ambas: choca con `RELACIONES.md` si se usa como Simbiosis, por eso debe ser acción explícita |
| Simbiosis · intercambio | **Dejar como Simbiosis pasiva** | Puntos que cruzan el borde: no crece, intercambia color; es lo más "visual" para bacteria+levadura |
| Simbiosis · textura compartida / mezcla de colores | **Dejar sólo una** | Se ven casi iguales (lente anaranjada en la intersección) |
| Rechazo · separación suave | **Dejar** | Entalla limpia y legible |
| Rechazo · colonia comprimida | **Probar** | Deforma una colonia en elipse: se entiende y es distinta, pero es otra idea (aplastar) |
| Barrera · frente compartido | **Dejar, reforzar** | La línea divisoria es muy fina a tamaño tarjeta |
| Misma especie (×2) | **Descartar** | Casi indistinguibles entre sí y de Barrera a este tamaño |
| Ciclo propuesto (×3) | **Dejar la idea**, convertir en matriz | Ya asigna un tratamiento por par de familias |

Ninguna reacción del muestrario es animada ni tiene "progreso": siguen más simples que `relations-renderer.js` de COLONIAS (que no ejecuté; lo digo por su código y `RELACIONES.md`). La devolución "que ocurran cosas más notorias" se cubre mejor **portando el renderer de relaciones** que refinando estos dibujos.

---

## 5. Plan corto para convertir lo decidido en TU PLACA (7 pasos)

1. **Cerrar decisiones con el muestrario mejorado** (comparador + Elegir/Exportar + vista sobre la placa). Salida: lista corta de formas, paleta única y casos de UNIR. *(E-1, P-7)*
2. **Unificar paleta y volver determinista el generador** (misma tabla de colores; PRNG con semilla en lugar de `Math.random`). *(§1.5, D-8, H-19)*
3. **Catálogo reducido en la biblioteca** (≈8–10 formas) y **retirar Mezclas** cuando UNIR funcione; medir apertura de TU PLACA. *(E-2, D-11)*
4. **Portar el renderer de relaciones de COLONIAS** (Simbiosis/Rechazo/Barrera/Neutro con progreso) a las reacciones. *(D-13, Q-9)*
5. **Acción UNIR** (más grande / 8-infinito, color mixto) con `pair`/`capsule`, con DESHACER. *(D-10)*
6. **Composiciones sembrables** (Núcleo y satélites, Secuencia axial, Racimo, Frente) que suman sin vaciar la placa y se mueven como grupo. *(D-7)*
7. **Anillo de la placa** (Foco, Rotación, Paleta en %, Variación; Densidad como separación↔agrupación si Paco la aprueba) y **mantener-y-rotar fluido** en el menú contextual; revisar texto de etiquetas del menú a ≥ 11 px. *(D-5, D-6)*

Después: onboarding y cartelitos para el video (C-1…C-5) y grabación de prueba (F-3).

---

## 6. Preguntas abiertas para Paco
1. ¿Se prueban Micelio algodonado, Ramificada y Peluda antes de cerrar el catálogo?
2. ¿"Densidad" = separación↔agrupación (propuesta del muestrario)? ¿Y se suman Foco y Rotación al anillo?
3. ¿Anillo y Recorte entran al menú contextual como variantes del primer botón?
4. ¿Qué tabla de colores manda (muestrario o generador)?
5. ¿Qué forma toma cada caso de UNIR? (mismo grupo, bacteria+levadura, moho+bacteria, tamaños distintos)
