// ───────── Modo kiosco (pantalla táctil del museo) ─────────
// Se activa solo con ?kiosco en la dirección (placa.html?kiosco). En la web pública no cambia nada.
// Opciones: ?kiosco&espera=120 (segundos sin tocar antes del aviso) &aviso=15 (segundos del aviso antes de reiniciar).
// Hace tres cosas:
//  1. Reinicio entre visitantes: tras un rato sin tocar avisa y, si nadie responde, vuelve a la portada
//     con la placa en curso, la selección y las fichas abiertas borradas. Las placas ya guardadas (imágenes) no se tocan.
//  2. Bloquea gestos y menús del navegador: pellizco y doble toque para ampliar, Ctrl + rueda, menú contextual,
//     selección de texto, arrastre de imágenes, deslizar para volver atrás y atajos de zoom o navegación.
//  3. Pide pantalla completa al primer toque (el navegador solo lo permite tras un gesto).
(() => {
  const params = new URLSearchParams(location.search);
  if (!params.has('kiosco')) return;
  const ESPERA = Math.max(20, Number(params.get('espera')) || 120) * 1000;
  const AVISO = Math.max(5, Number(params.get('aviso')) || 15);
  const raiz = document.documentElement;
  raiz.classList.add('modo-kiosco');

  const estilo = document.createElement('style');
  estilo.textContent = `
    .modo-kiosco, .modo-kiosco body { touch-action: pan-x pan-y; overscroll-behavior: none; -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; -webkit-tap-highlight-color: transparent; }
    .modo-kiosco input, .modo-kiosco textarea { -webkit-user-select: text; user-select: text; }
    .modo-kiosco img { -webkit-user-drag: none; }
    #kioscoAviso { position: fixed; inset: 0; z-index: 2147483000; display: grid; place-items: center; background: rgb(242 240 232 / 72%); -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px); opacity: 0; transition: opacity .4s; pointer-events: none; }
    #kioscoAviso.visible { opacity: 1; pointer-events: auto; }
    #kioscoAviso div { display: flex; flex-direction: column; align-items: center; gap: 16px; color: #0d0f17; text-align: center; font-family: Arimo, Arial, sans-serif; }
    #kioscoAviso strong { font: 400 var(--t-titulo, 32px)/var(--l-titulo, 36px) Arimo, Arial, sans-serif; text-transform: uppercase; }
    #kioscoAviso p { margin: 0; font: 400 var(--t-lectura, 20px)/var(--l-lectura, 28px) Arimo, Arial, sans-serif; }
    #kioscoAviso button { all: unset; margin-top: 16px; padding: 18px 40px; border-radius: 999px; background: #0d0f17; color: #f2f0e8; font: 700 var(--t-boton, 17px)/var(--l-boton, 20px) Arimo, Arial, sans-serif; cursor: pointer; }
    #kioscoAviso .kiosco-cuenta { font-variant-numeric: tabular-nums; }
    @media (prefers-reduced-motion: reduce) { #kioscoAviso { transition: none; } }`;
  document.head.appendChild(estilo);

  // 1. Reinicio entre visitantes
  const aviso = document.createElement('div');
  aviso.id = 'kioscoAviso';
  aviso.setAttribute('role', 'alertdialog');
  aviso.setAttribute('aria-live', 'assertive');
  aviso.innerHTML = '<div><strong>¿Seguís ahí?</strong><p>En <span class="kiosco-cuenta"></span> segundos el Atlas vuelve al inicio<br>para la próxima persona.</p><button type="button">SEGUIR EXPLORANDO</button></div>';
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

  // 3. Pantalla completa al primer toque
  const completa = () => {
    if (!document.fullscreenElement && raiz.requestFullscreen) raiz.requestFullscreen({ navigationUI: 'hide' }).catch(() => {});
  };
  addEventListener('pointerup', completa, { capture: true });
})();
