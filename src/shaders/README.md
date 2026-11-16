# Lupa de la ficha de Yogur natural

La implementación activa es `lupa.ts`. Se compila con `node compilar-lupa.cjs` en `src/assets/lupa-figma.js`; el nombre del asset conserva el contrato de carga del prototipo. `lupa.tsx` y `lens-distortion.ts` conservan la referencia anterior de Figma y no se incluyen en el build activo.

El círculo visible mide 429 px y mantiene una máscara exterior independiente del shader, con transición suave de 9 px. El shader WebGL aplica aumento central casi uniforme, curvatura radial concentrada en el último 28% del radio, aberración cromática lateral, desenfoque periférico, reflejo leve y grano en la franja exterior. La silueta del círculo no se deforma.

El campo microscópico es `src/assets/detalles/lupa-micro.png`, anclado a las coordenadas de la placa. `montarLupaFigma(contenedor)` devuelve una función de limpieza con método `actualizar({x,y,ancho,alto})`; mover la lupa cambia la región muestreada del campo, sin trasladar todo el patrón junto con la lente. El render se agrupa por frame y se actualiza al moverla, sin bucle permanente.

Un toque breve abre la información de la colonia. Mantener 350 ms o comenzar a arrastrar muestra la lupa; soltar la oculta. Con teclado se mantiene Enter/Espacio y se recorre el campo con flechas. La placa captura el gesto táctil de la lente; el resto de la ficha conserva su scroll vertical.

WebGL usa APIs habituales del navegador y no requiere HTML-in-Canvas ni opciones experimentales. Cuando no está disponible, el fallback 2D mantiene el recorrido del campo y el recorte circular, sin la refracción del shader. La prueba con DOM simulado valida el gesto, las coordenadas del campo y el desmontaje; la ejecución óptica requiere revisión en navegador.

Revisión real del 15/11/2026: en el navegador local se verificó WebGL activo, presión sostenida, movimiento a dos puntos del campo y ocultamiento al soltar. Captura: D:/BACK UP/Chat GPT/Espora/outputs/micromundos/lupa-vidrio/lupa-vidrio-verificada.png.
