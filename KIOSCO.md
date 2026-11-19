# Micromundos en el kiosco del museo

El modo kiosco se activa abriendo `placa.html?kiosco`. En la web pública (sin `?kiosco`) no cambia nada.

## Qué hace

- **Reinicio entre visitantes.** Tras 15 s sin tocar muestra «¿Seguís ahí?» con una cuenta de 5 s. Si nadie toca, vuelve a la portada y borra la placa de TU PLACA a medio hacer, la selección y las fichas abiertas. En la portada no reinicia (ya es la pantalla de reposo).
- **Bloqueo de gestos del navegador.** Sin pellizco ni doble toque para ampliar, sin Ctrl + rueda, sin menú contextual, sin selección de texto (salvo en el buscador), sin arrastrar imágenes, sin «atrás» por gesto o tecla, y sin atajos de recarga, impresión o pestañas.
- **Pantalla completa** al primer toque.
- **Áreas de toque más grandes.** Varios controles miden menos de 48 px de alto (la navegación, DESHACER, REHACER, VACIAR LA PLACA, GUARDAR PLACA, las pestañas de TU PLACA y los enlaces de la ficha). Un toque quieto que cae a menos de 48 px de uno de ellos, fuera de cualquier otro control, lo activa. No cambia cómo se ven y no afecta a los arrastres.

## Opciones

| Dirección | Efecto |
|---|---|
| `placa.html?kiosco` | Valores por defecto (15 s + 5 s de aviso) |
| `placa.html?kiosco&espera=30` | Aviso tras 30 s sin tocar (mínimo 5) |
| `placa.html?kiosco&espera=30&aviso=10` | Cuenta del aviso de 10 s (mínimo 3) |

## Cómo abrirlo en la pantalla

Alcanza con abrir `placa.html?kiosco` en Chrome o Edge y ponerlo en pantalla completa: F11, o el primer toque, que la pide solo. No hace falta el modo kiosco del navegador (`--kiosk`). Para salir de pantalla completa: F11 o Esc con un teclado.

## Pendiente de definir con el museo

- Tiempo de inactividad real (hoy 15 s + 5 s) y si el aviso se ve bien a la distancia de uso.
- ~~Fuente Arimo sin conexión~~: resuelto. Arimo va incrustada en placa.html (ver src/assets/fuentes/LEEME.md).
- Quién enciende y apaga la pantalla, y si conviene reiniciar el navegador una vez por día.
