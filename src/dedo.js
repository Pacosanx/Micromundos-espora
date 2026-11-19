// ───────── Modo dedo: el mouse se comporta como un dedo ─────────
// Siempre activo (Paco, 19/11/2026): con mouse, el Atlas se usa como en la pantalla táctil. Para trabajar con el
// mouse común, agregar ?mouse a la dirección (placa.html?mouse). Con un dedo de verdad no cambia nada.
//  1. El cursor se reemplaza por una yema: un círculo suave que se marca al apretar y deja una estela corta al arrastrar.
//  2. Arrastrar con el botón apretado desplaza el listado, las fichas largas y el glosario, con inercia (como el dedo).
//  3. La rueda del mouse no hace nada: con el dedo no existe.
(() => {
  if (new URLSearchParams(location.search).has('mouse')) return;
  document.documentElement.classList.add('modo-dedo');

  const estilo = document.createElement('style');
  estilo.textContent = `
    .modo-dedo, .modo-dedo * { cursor: none !important; }
    .modo-dedo, .modo-dedo body { -webkit-user-select: none; user-select: none; }
    #dedoYema, .dedo-rastro { position: fixed; left: 0; top: 0; z-index: 2147483600; pointer-events: none; border-radius: 50%; }
    #dedoYema { width: 36px; height: 36px; margin: -18px 0 0 -18px; background: rgb(13 15 23 / 14%); box-shadow: 0 0 0 1.5px rgb(255 255 255 / 70%), 0 0 0 3px rgb(13 15 23 / 18%);
      transition: transform .12s, background-color .12s, opacity .25s; opacity: 0; }
    #dedoYema.visible { opacity: 1; }
    #dedoYema.apretado { transform: scale(.82); background: rgb(13 15 23 / 32%); }
    .dedo-rastro { width: 20px; height: 20px; margin: -10px 0 0 -10px; background: rgb(13 15 23 / 18%); animation: dedoRastro .45s ease-out forwards; }
    @keyframes dedoRastro { to { transform: scale(.3); opacity: 0; } }
    @media (prefers-reduced-motion: reduce) { #dedoYema { transition: none; } .dedo-rastro { display: none; } }`;
  document.head.appendChild(estilo);

  // 1. Yema
  const yema = document.createElement('div');
  yema.id = 'dedoYema';
  yema.setAttribute('aria-hidden', 'true');
  document.body.appendChild(yema);
  let apretado = false, ultimoRastro = 0;
  const mover = ev => {
    if (ev.pointerType !== 'mouse') return;
    yema.style.translate = `${ev.clientX}px ${ev.clientY}px`;
    yema.classList.add('visible');
    if (apretado && ev.timeStamp - ultimoRastro > 28) {
      ultimoRastro = ev.timeStamp;
      const r = document.createElement('div');
      r.className = 'dedo-rastro';
      r.style.translate = `${ev.clientX}px ${ev.clientY}px`;
      document.body.appendChild(r);
      r.addEventListener('animationend', () => r.remove());
    }
  };
  addEventListener('pointermove', mover, { capture: true, passive: true });
  addEventListener('pointerdown', ev => { if (ev.pointerType === 'mouse') { apretado = true; yema.classList.add('apretado'); mover(ev); } }, { capture: true, passive: true });
  addEventListener('pointerup', ev => { if (ev.pointerType === 'mouse') { apretado = false; yema.classList.remove('apretado'); } }, { capture: true, passive: true });
  document.documentElement.addEventListener('pointerleave', () => yema.classList.remove('visible'));

  // 2. Arrastrar para desplazar (solo si el gesto no lo toma otro control: fichas, colonias, perillas, arcos…)
  const desplazable = el => {
    for (let p = el; p && p !== document.documentElement; p = p.parentElement) {
      const c = getComputedStyle(p);
      if (/(auto|scroll)/.test(c.overflowY) && p.scrollHeight > p.clientHeight + 2) return p;
    }
    return null;
  };
  let toma = null, arrastro = false, inercia = 0;
  addEventListener('pointerdown', ev => {
    cancelAnimationFrame(inercia);
    if (ev.pointerType !== 'mouse' || ev.button !== 0) return;
    // Lo que maneja su propio gesto y su propio desplazamiento (la placa del microscopio, marcada con data-gesto-propio) no
    // desplaza la pantalla (19/11/2026, Paco). Antes se miraba touch-action:none, pero todo TU PLACA lo tiene y eso
    // dejaba sin desplazamiento a la biblioteca de colonias.
    if (ev.target.closest?.('[data-gesto-propio]')) { toma = null; return; }
    const caja = desplazable(ev.target);
    toma = caja && { caja, y: ev.clientY, x: ev.clientX, scroll: caja.scrollTop, t: ev.timeStamp, v: 0, ultY: ev.clientY, ultT: ev.timeStamp, id: ev.pointerId };
    arrastro = false;
  }, { passive: true }); // en burbuja: si un control ya capturó el puntero (arrastre propio), se respeta
  addEventListener('pointermove', ev => {
    if (!toma || ev.pointerId !== toma.id) return;
    const dy = ev.clientY - toma.y;
    if (!arrastro) {
      if (Math.abs(dy) < 8 || Math.abs(dy) < Math.abs(ev.clientX - toma.x)) return;
      if (ev.target.hasPointerCapture?.(ev.pointerId) && !toma.caja.contains(ev.target)) { toma = null; return; }
      arrastro = true;
    }
    toma.caja.scrollTop = toma.scroll - dy;
    const dt = Math.max(1, ev.timeStamp - toma.ultT);
    toma.v = .7 * toma.v + .3 * (ev.clientY - toma.ultY) / dt;
    toma.ultY = ev.clientY; toma.ultT = ev.timeStamp;
  }, { passive: true });
  const soltar = ev => {
    if (!toma || ev.pointerId !== toma.id) return;
    const { caja } = toma; let v = ev.timeStamp - toma.ultT > 80 ? 0 : toma.v * 16;
    toma = null;
    const paso = () => { if (Math.abs(v) < .3) return; caja.scrollTop -= v; v *= .94; inercia = requestAnimationFrame(paso); };
    if (arrastro) inercia = requestAnimationFrame(paso);
  };
  addEventListener('pointerup', soltar, { passive: true });
  addEventListener('pointercancel', soltar, { passive: true });
  // un arrastre para desplazar no debe terminar en un toque sobre lo que quedó debajo
  addEventListener('click', ev => { if (arrastro) { ev.preventDefault(); ev.stopPropagation(); arrastro = false; } }, { capture: true });

  // 3. Sin rueda
  addEventListener('wheel', ev => { ev.preventDefault(); ev.stopPropagation(); }, { capture: true, passive: false });
})();
