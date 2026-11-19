# Micromundos en el kiosco del museo

El modo kiosco se activa abriendo `placa.html?kiosco`. En la web pública (sin `?kiosco`) no cambia nada.

## Qué hace

- **Reinicio entre visitantes.** Tras 120 s sin tocar muestra «¿Seguís ahí?» con una cuenta de 15 s. Si nadie toca, vuelve a la portada y borra la placa de TU PLACA a medio hacer, la selección y las fichas abiertas. En la portada no reinicia (ya es la pantalla de reposo).
- **Bloqueo de gestos del navegador.** Sin pellizco ni doble toque para ampliar, sin Ctrl + rueda, sin menú contextual, sin selección de texto (salvo en el buscador), sin arrastrar imágenes, sin «atrás» por gesto o tecla, y sin atajos de recarga, impresión o pestañas.
- **Pantalla completa** al primer toque.
- **Áreas de toque más grandes.** Varios controles miden menos de 48 px de alto (la navegación, DESHACER, REHACER, VACIAR LA PLACA, GUARDAR PLACA, las pestañas de TU PLACA y los enlaces de la ficha). Un toque quieto que cae a menos de 48 px de uno de ellos, fuera de cualquier otro control, lo activa. No cambia cómo se ven y no afecta a los arrastres.

## Opciones

| Dirección | Efecto |
|---|---|
| `placa.html?kiosco` | Valores por defecto (120 s + 15 s de aviso) |
| `placa.html?kiosco&espera=90` | Aviso tras 90 s sin tocar (mínimo 20) |
| `placa.html?kiosco&espera=90&aviso=10` | Cuenta del aviso de 10 s (mínimo 5) |

## Cómo abrirlo en la pantalla (Chrome o Edge en Windows)

Crear un acceso directo con:

```
"C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk --overscroll-history-navigation=0 --disable-pinch --no-first-run --noerrdialogs --disable-translate "file:///C:/Micromundos/placa.html?kiosco"
```

`--kiosk` oculta la barra de direcciones y no deja salir con el mouse. Para cerrar: Alt + F4 con un teclado.

## Pendiente de definir con el museo

- Tiempo de inactividad real (hoy 120 s) y si el aviso se ve bien a la distancia de uso.
- Fuente Arimo sin conexión (hoy se carga de Google Fonts).
- Quién enciende y apaga la pantalla, y si conviene reiniciar el navegador una vez por día.
