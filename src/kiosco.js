// ───────── Modo kiosco (pantalla táctil del museo) ─────────
// Se activa solo con ?kiosco en la dirección (placa.html?kiosco). En la web pública no cambia nada.
// Opciones: ?kiosco&espera=15 (segundos sin tocar antes del aviso) &aviso=5 (segundos del aviso antes de reiniciar).
// Hace tres cosas:
//  1. Reinicio entre visitantes: tras un rato sin tocar avisa y, si nadie responde, vuelve a la portada
//     con la placa en curso, la selección y las fichas abiertas borradas. Las placas ya guardadas (imágenes) no se tocan.
//  2. Bloquea gestos y menús del navegador: pellizco y doble toque para ampliar, Ctrl + rueda, menú contextual,
//     selección de texto, arrastre de imágenes, deslizar para volver atrás y atajos de zoom o navegación.
//  3. Pide pantalla completa al primer toque (el navegador solo lo permite tras un gesto).
(() => {
  const params = new URLSearchParams(location.search);
  if (!params.has('kiosco')) return;
  const ESPERA = Math.max(5, Number(params.get('espera')) || 15) * 1000;
  const AVISO = Math.max(3, Number(params.get('aviso')) || 5);
  const raiz = document.documentElement;
  raiz.classList.add('modo-kiosco');

  const estilo = document.createElement('style');
  estilo.textContent = `
    .modo-kiosco, .modo-kiosco body { touch-action: pan-x pan-y; overscroll-behavior: none; -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; -webkit-tap-highlight-color: transparent; }
    .modo-kiosco input, .modo-kiosco textarea { -webkit-user-select: text; user-select: text; }
    .modo-kiosco img { -webkit-user-drag: none; }
    /* Aviso con el material de los carteles (vidrio con borde desenfocado y grano), sin color de universo; la acción como texto-botón. */
    #kioscoAviso { position: fixed; inset: 0; z-index: 2147483000; display: grid; place-items: center; background: rgb(242 240 232 / 45%); opacity: 0; transition: opacity .4s; pointer-events: none; }
    #kioscoAviso.visible { opacity: 1; pointer-events: auto; }
    #kioscoAviso .cartel { --cartel-fondo: rgb(205 198 186 / 42%); --cartel-noise-opacity: .35; position: relative; width: 520px; color: #13151b; font-family: Arimo, Arial, sans-serif; }
    #kioscoAviso .fi { padding: 32px 36px 20px; max-height: none; overflow: visible; }
    #kioscoAviso .cabCartel { margin-bottom: 20px; }
    #kioscoAviso .reglaCartel::before { width: calc(100% + 4px); -webkit-mask-size: 100% 5px; mask-size: 100% 5px; }
    #kioscoAviso .nom { font: 400 var(--t-titulo, 32px)/var(--l-titulo, 36px) Arimo, Arial, sans-serif; text-transform: uppercase; }
    #kioscoAviso .cod { font: 400 var(--t-etiqueta, 14.67px)/var(--l-etiqueta, 18px) Arimo, Arial, sans-serif; padding-top: 3px; font-variant-numeric: tabular-nums; }
    #kioscoAviso p { margin: 18px 0 0; font: 400 var(--t-lectura, 20px)/var(--l-lectura, 28px) Arimo, Arial, sans-serif; }
    #kioscoAviso button { all: unset; display: inline-flex; align-items: center; min-height: var(--area-tactil, 48px); margin-top: 16px; font: 700 var(--t-boton, 17px)/var(--l-boton, 20px) Arimo, Arial, sans-serif; text-transform: uppercase; cursor: pointer; }
    #kioscoAviso button:focus-visible { outline: 2px solid #13151b; outline-offset: 4px; border-radius: 8px; }
    @media (prefers-reduced-motion: reduce) { #kioscoAviso { transition: none; } }`;
  document.head.appendChild(estilo);

  // 1. Reinicio entre visitantes
  const aviso = document.createElement('div');
  aviso.id = 'kioscoAviso';
  aviso.setAttribute('role', 'alertdialog');
  aviso.setAttribute('aria-live', 'assertive');
  aviso.innerHTML = '<div class="cartel"><div class="vidrio"></div><div class="flota"><div class="grano"></div><div class="fi"><div class="co">'
    + '<header class="cabCartel"><div class="nom">¿Seguís ahí?</div><div class="cod"><span class="kiosco-cuenta"></span> s</div></header><div class="reglaCartel"></div>'
    + '<p>En unos segundos el Atlas vuelve al inicio para la próxima persona.</p><button type="button">SEGUIR EXPLORANDO</button></div></div></div></div>';
  document.body.appendChild(aviso);
  const cuenta = aviso.querySelector('.kiosco-cuenta');
  let espera = 0, reloj = 0, restan = 0;
  const reiniciar = () => {
    // Se borra solo lo de la visita en curso (placa de TU PLACA a medio hacer). No hay otros datos guardados.
    try { for (const k of Object.keys(localStorage)) if (k.startsWith('micromundos-tuplaca')) localStorage.removeItem(k); } catch {}
    try { sessionStorage.clear(); } catch {}
    location.replace(location.pathname + location.search);
  };
  const mostrarAviso = () => {
    restan = AVISO; cuenta.textContent = restan;
    aviso.classList.add('visible'); aviso.querySelector('button').focus({ preventScroll: true });
    clearInterval(reloj);
    reloj = setInterval(() => { restan--; cuenta.textContent = Math.max(0, restan); if (restan <= 0) { clearInterval(reloj); reiniciar(); } }, 1000);
  };
  const enPortada = () => document.querySelector('.en-apertura') !== null;
  const actividad = () => {
    if (aviso.classList.contains('visible')) { aviso.classList.remove('visible'); clearInterval(reloj); }
    clearTimeout(espera);
    // En la portada no hace falta reiniciar: ya es la pantalla de reposo.
    espera = setTimeout(() => { if (!enPortada()) mostrarAviso(); else actividad(); }, ESPERA);
  };
  for (const tipo of ['pointerdown', 'pointermove', 'wheel', 'keydown', 'touchstart'])
    addEventListener(tipo, actividad, { capture: true, passive: true });
  aviso.addEventListener('click', ev => { ev.stopPropagation(); actividad(); });
  actividad();

  // 2. Gestos y menús del navegador
  const bloquear = ev => ev.preventDefault();
  addEventListener('contextmenu', bloquear, { capture: true });
  addEventListener('dragstart', ev => { if (ev.target instanceof HTMLImageElement || ev.target instanceof HTMLAnchorElement) ev.preventDefault(); }, { capture: true });
  addEventListener('selectstart', ev => { if (!ev.target.closest?.('input,textarea')) ev.preventDefault(); }, { capture: true });
  addEventListener('wheel', ev => { if (ev.ctrlKey) ev.preventDefault(); }, { capture: true, passive: false }); // pellizco en trackpad = Ctrl + rueda
  for (const tipo of ['gesturestart', 'gesturechange', 'gestureend']) addEventListener(tipo, bloquear, { capture: true, passive: false }); // Safari
  addEventListener('touchmove', ev => { if (ev.touches.length > 1) ev.preventDefault(); }, { capture: true, passive: false });
  addEventListener('keydown', ev => {
    const k = ev.key.toLowerCase(), mod = ev.ctrlKey || ev.metaKey;
    const zoom = mod && ['+', '-', '=', '0'].includes(k);
    const navegar = (ev.altKey && (k === 'arrowleft' || k === 'arrowright')) || ['browserback', 'browserforward', 'f5', 'f12'].includes(k) || (mod && ['r', 'p', 's', 'o', 'u', 'l', 'n', 't', 'j', 'h'].includes(k));
    const atras = k === 'backspace' && !ev.target.closest?.('input,textarea,[contenteditable]');
    if (zoom || navegar || atras) ev.preventDefault();
  }, { capture: true });
  // Deslizar desde el borde o el botón «atrás» del sistema: se queda en la misma página.
  history.pushState({ kiosco: true }, '');
  addEventListener('popstate', () => history.pushState({ kiosco: true }, ''));

  // 4. Áreas de toque: varios controles miden menos de 48 px de alto (navegación, DESHACER, GUARDAR PLACA, enlaces de la ficha…).
  //    Sin cambiar cómo se ven: un toque que cae fuera de todo control, pero a menos de 48 px de uno chico, lo activa.
  //    Solo para toques quietos (no arrastres), así no interfiere con sembrar ni mover fichas.
  const MIN = 48, INTERACTIVO = 'button,a[href],[role="button"],[role="tab"],input,select,textarea,label,summary,[tabindex="0"]';
  let inicioToque = null;
  addEventListener('pointerdown', ev => { inicioToque = { x: ev.clientX, y: ev.clientY }; }, { capture: true, passive: true });
  const visible = el => {
    for (let p = el; p && p !== document.body; p = p.parentElement) {
      const c = getComputedStyle(p);
      if (c.display === 'none' || c.visibility === 'hidden' || +c.opacity < .05 || p.inert || p.hidden) return false;
    }
    return getComputedStyle(el).pointerEvents !== 'none' && !el.disabled;
  };
  addEventListener('click', ev => {
    if (!ev.isTrusted || ev.target.closest?.(INTERACTIVO) || aviso.contains(ev.target)) return;
    if (inicioToque && Math.hypot(ev.clientX - inicioToque.x, ev.clientY - inicioToque.y) > 10) return;
    const escala = (document.getElementById('stage')?.getBoundingClientRect().width || 1920) / 1920;
    const min = MIN * escala;
    let mejor = null, distMejor = Infinity;
    for (const el of document.querySelectorAll(INTERACTIVO)) {
      const r = el.getBoundingClientRect();
      if (!r.width || (r.width >= min && r.height >= min)) continue;
      const ex = Math.max(0, (min - r.width) / 2), ey = Math.max(0, (min - r.height) / 2);
      if (ev.clientX < r.left - ex || ev.clientX > r.right + ex || ev.clientY < r.top - ey || ev.clientY > r.bottom + ey) continue;
      const d = Math.hypot(ev.clientX - (r.left + r.right) / 2, ev.clientY - (r.top + r.bottom) / 2);
      if (d < distMejor && visible(el)) { mejor = el; distMejor = d; }
    }
    if (!mejor) return;
    ev.preventDefault(); ev.stopPropagation();
    mejor.click();
  }, { capture: true });

  // 3. Pantalla completa al primer toque
  const completa = () => {
    if (!document.fullscreenElement && raiz.requestFullscreen) raiz.requestFullscreen({ navigationUI: 'hide' }).catch(() => {});
  };
  addEventListener('pointerup', completa, { capture: true });
})();
