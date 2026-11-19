// ───────── Pistas en el momento de actuar ─────────
// Un cartelito por vez, junto al control, con una sola acción y un verbo concreto. Se retira cuando la persona hace
// la acción o lo cierra con ×, y no vuelve a aparecer (localStorage; en ?kiosco, solo durante la visita).
// Esperan a que se cierre la bienvenida (y no aparecen en el instante entre la apertura y el cartel). ?pistas las vuelve a mostrar todas.
(() => {
  const CLAVE = 'micromundos-pistas-vistas';
  const params = new URLSearchParams(location.search);
  const almacen = (() => { try { return params.has('kiosco') ? sessionStorage : localStorage; } catch { return null; } })();
  let hechas = new Set();
  try { if (!params.has('pistas')) hechas = new Set(JSON.parse(almacen?.getItem(CLAVE) || '[]')); } catch {}
  const guardar = () => { try { almacen?.setItem(CLAVE, JSON.stringify([...hechas])); } catch {} };
  const pantalla = document.getElementById('screen');
  if (!pantalla) return;

  const $ = id => document.getElementById(id);
  const q = (s, raiz = document) => raiz.querySelector(s);
  const seccion = () => ['navMuestras', 'navGlosario', 'navTuPlaca', 'navQueEs'].find(id => $(id)?.getAttribute('aria-current') === 'page');
  const visible = el => {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return false;
    if (typeof el.tagName !== 'string') return true; // caja calculada (ver union)
    for (let p = el._el || el; p && p !== document.body; p = p.parentElement) {
      if (p.hidden || p.inert) return false;
      const c = getComputedStyle(p);
      if (c.display === 'none' || c.visibility === 'hidden' || +c.opacity < .3) return false;
    }
    return true;
  };
  const union = s => { // caja que abarca todos los elementos visibles del selector (p. ej., el menú hexagonal)
    const rs = [...document.querySelectorAll(s)].filter(visible).map(e => e.getBoundingClientRect());
    if (!rs.length) return null;
    const l = Math.min(...rs.map(r => r.left)), t = Math.min(...rs.map(r => r.top)), rr = Math.max(...rs.map(r => r.right)), bb = Math.max(...rs.map(r => r.bottom));
    return { getBoundingClientRect: () => ({ left: l, top: t, right: rr, bottom: bb, width: rr - l, height: bb - t }) };
  };
  const coloniaChica = () => { // en una composición generada la primera suele ser un fondo enorme: se elige la más chica (≥ 40 px)
    let mejor = null, ancho = Infinity;
    for (const el of document.querySelectorAll('#tuPlaca .tp-colonia')) { const w = el.getBoundingClientRect().width; if (w >= 40 && w < ancho && visible(el)) { ancho = w; mejor = el; } }
    return mejor;
  };
  // Las colonias y las muestras se dibujan con halo y desenfoque: su caja es bastante más grande que el círculo que se ve.
  // Para que la pista apunte al círculo y no al aire, se usa una caja reducida alrededor de su centro.
  const nucleo = (el, f) => el && { tagName: el.tagName, getBoundingClientRect: () => { const r = el.getBoundingClientRect(), w = r.width * f, h = r.height * f, x = r.left + (r.width - w) / 2, y = r.top + (r.height - h) / 2; return { left: x, top: y, right: x + w, bottom: y + h, width: w, height: h }; }, _el: el };
  const primeraVisible = s => [...document.querySelectorAll(s)].find(visible);
  const conFicha = () => document.body.classList.contains('con-cartel');
  const enCentro = () => { // la muestra visible más cercana al centro de la placa
    const c = $('centro')?.getBoundingClientRect(); if (!c) return null;
    const cx = c.left + c.width / 2, cy = c.top + c.height / 2;
    let mejor = null, d = Infinity;
    for (const el of document.querySelectorAll('#centro .muestra')) {
      const r = el.getBoundingClientRect(); if (r.width < 8 || !visible(el)) continue;
      const dd = Math.hypot(r.left + r.width / 2 - cx, r.top + r.height / 2 - cy);
      if (dd < d) { d = dd; mejor = el; }
    }
    return mejor;
  };
  const VER_MUESTRAS = /^\s*ver muestras de /i; // enlace de cada entorno en las pantallas de universo (un <p> interactivo)
  const enlaceEntorno = () => [...document.querySelectorAll('.detalle-interactivo,[role="button"],button')].find(el => VER_MUESTRAS.test(el.textContent) && visible(el));

  // Señales de acciones que no dejan rastro en el DOM.
  const señal = new Set();
  addEventListener('pointerdown', ev => {
    const t = ev.target;
    if (t.closest?.('#zoomToque,#zMas,#zMenos')) señal.add('zoom');
    if (t.closest?.('#navegacionVistas')) señal.add('vista');
    if (t.closest?.('#alternarListado')) señal.add('listado');
    if (t.closest?.('.g-colonia')) señal.add('universo');
    if (t.closest?.('#tpDeshacer')) señal.add('deshacer');
    if (t.closest?.('#tpRecuerdo')) señal.add('guardar');
    const ent = t.closest?.('.detalle-interactivo,[role="button"],button'); if (ent && VER_MUESTRAS.test(ent.textContent)) señal.add('entorno');
  }, { capture: true, passive: true });
  addEventListener('wheel', ev => { if (ev.target.closest?.('#centro')) señal.add('zoom'); }, { capture: true, passive: true });
  new MutationObserver(() => {
    if ($('ficha')?.classList.contains('arrastrando')) señal.add('ficha-movida');
    if (q('.tp-menu-ajustando')) señal.add('funcion');
  }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'] });

  // Orden de aparición: dentro de cada sección, la primera pendiente cuya situación se da.
  const PISTAS = [
    // MUESTRAS
    { id: 'm-muestra', texto: 'Tocá un círculo para abrir su muestra.', donde: 'abajo',
      cuando: () => seccion() === 'navMuestras' && !conFicha(), blanco: () => nucleo(enCentro(), .45), hecha: conFicha },
    { id: 'm-mover', texto: 'Arrastrá la ficha para moverla.', donde: 'izquierda',
      cuando: () => seccion() === 'navMuestras' && conFicha(), blanco: () => $('ficha'), hecha: () => señal.has('ficha-movida') },
    { id: 'm-cerrar', texto: 'Tocá fuera de la ficha para cerrarla.', donde: 'izquierda',
      cuando: () => seccion() === 'navMuestras' && conFicha() && hechas.has('m-mover'), blanco: () => $('ficha'), hecha: () => !conFicha() },
    { id: 'm-zoom', texto: 'Deslizá por el arco para acercar o alejar la placa.', donde: 'izquierda',
      cuando: () => seccion() === 'navMuestras' && !conFicha() && +getComputedStyle($('zoomSvg')).opacity > .5, blanco: () => $('zoomToque'), hecha: () => señal.has('zoom') },
    { id: 'm-vista', texto: 'Elegí otra vista: VÍNCULOS o MUESTRARIO.', donde: 'arriba',
      cuando: () => seccion() === 'navMuestras' && !conFicha(), blanco: () => $('navegacionVistas'), hecha: () => señal.has('vista') },
    { id: 'm-listado', texto: 'Tocá LISTADO COMPLETO para ver todas las muestras.', donde: 'abajo',
      cuando: () => seccion() === 'navMuestras' && !conFicha() && pantalla.classList.contains('listado-cerrado'), blanco: () => $('alternarListado'), hecha: () => señal.has('listado') || !pantalla.classList.contains('listado-cerrado') },
    // GLOSARIO
    // GLOSARIO: sin pistas (se quitaron «Elegí un círculo…» y «Tocá «Ver muestras de…»…», 19/11).
    // TU PLACA
    { id: 't-sembrar', texto: 'Arrastrá una forma al interior de la placa.', donde: 'derecha',
      cuando: () => seccion() === 'navTuPlaca' && !q('#tuPlaca .tp-colonia'), blanco: () => nucleo([...document.querySelectorAll('#tuPlaca .tp-paleta-colonia')].filter(visible)[3] || primeraVisible('#tuPlaca .tp-paleta-colonia'), .8) /* la colonia del extremo derecho de la primera fila: el cartelito queda libre, hacia la placa */, hecha: () => !!q('#tuPlaca .tp-colonia') },
    { id: 't-editar', texto: 'Tocá una colonia para editarla.', donde: 'arriba',
      cuando: () => seccion() === 'navTuPlaca' && $('tpMenu')?.hidden, blanco: () => nucleo(coloniaChica(), .6), hecha: () => $('tpMenu') && !$('tpMenu').hidden },
    { id: 't-funcion', texto: 'Tocá una función y arrastrá para cambiar su valor.', donde: 'derecha',
      cuando: () => seccion() === 'navTuPlaca' && $('tpMenu') && !$('tpMenu').hidden, blanco: () => union('#tpMenu .tp-menu-boton'), hecha: () => señal.has('funcion') },
    { id: 't-guardar', texto: 'Cuando termines, tocá GUARDAR PLACA.', donde: 'arriba',
      cuando: () => seccion() === 'navTuPlaca' && $('tpMenu')?.hidden && !$('tpRecuerdo')?.disabled && document.querySelectorAll('#tuPlaca .tp-colonia').length >= 2, blanco: () => $('tpRecuerdo'), hecha: () => señal.has('guardar') },
  ];

  const globo = document.createElement('div');
  globo.id = 'pista';
  globo.className = 'cartel cartel-neutro pista-ayuda'; // mismo material que los carteles, sin color de universo
  globo.setAttribute('role', 'status');
  globo.hidden = true;
  globo.innerHTML = '<div class="vidrio"></div><div class="flota"><div class="grano"></div><div class="fi"><div class="co"><p></p><button type="button" aria-label="Cerrar pista">×</button></div></div></div>';
  pantalla.appendChild(globo);
  // Línea libre entre el cartelito y lo que señala (19/11/2026): un trazo fino de largo variable, en cualquier dirección,
  // que termina en un punto sobre el borde del control. Reemplaza al trazo corto que siempre salía hacia arriba.
  const linea = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  linea.id = 'pistaLinea'; linea.setAttribute('aria-hidden', 'true');
  linea.innerHTML = '<line/><circle r="4"/>';
  pantalla.appendChild(linea);
  const texto = globo.querySelector('p');
  let actual = null, pausa = 0;

  const terminar = id => { hechas.add(id); guardar(); ocultar(); pausa = performance.now() + 900; };
  const ocultar = () => { actual = null; globo.classList.remove('visible'); globo.hidden = true; linea.classList.remove('visible'); };
  globo.querySelector('button').addEventListener('click', ev => { ev.stopPropagation(); if (actual) terminar(actual.id); });

  const ubicar = (p, el) => {
    // La escena puede ser más ancha o más alta que 1920 × 1100 (pantallas de otra proporción): se mide con su tamaño real.
    const s = pantalla.getBoundingClientRect(), W = pantalla.offsetWidth || 1920, H = pantalla.offsetHeight || 1100, k = s.width / W;
    const r = el.getBoundingClientRect();
    const b = { x: (r.left - s.left) / k, y: (r.top - s.top) / k, w: r.width / k, h: r.height / k };
    const g = { w: globo.offsetWidth, h: globo.offsetHeight }, M = 16, A = 96; // margen y largo de la línea hasta el control
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
    // Direcciones posibles: primero las diagonales de la pedida (la línea queda libre, no siempre vertical), después la pedida y las demás. El cartelito queda lejos y la línea es larga y libre.
    const DIR = { abajo: [0, 1], arriba: [0, -1], izquierda: [-1, 0], derecha: [1, 0] };
    const [dx0, dy0] = DIR[p.donde] || DIR.abajo;
    const giros = [40, -40, 0, 75, -75, 135, -135, 180].map(a => { const t = a * Math.PI / 180; return [dx0 * Math.cos(t) - dy0 * Math.sin(t), dx0 * Math.sin(t) + dy0 * Math.cos(t)]; });
    const posicion = ([dx, dy]) => {
      // Centro del cartelito: fuera de la caja del control, a A de distancia, en la dirección (dx, dy).
      const sx = Math.abs(dx) > 1e-6 ? (b.w / 2 + g.w / 2) / Math.abs(dx) : Infinity, sy = Math.abs(dy) > 1e-6 ? (b.h / 2 + g.h / 2) / Math.abs(dy) : Infinity;
      const t = Math.min(sx, sy) + A;
      return { x: cx + dx * t - g.w / 2, y: cy + dy * t - g.h / 2 };
    };
    const cabe = q => q.x >= M && q.y >= M && q.x + g.w <= W - M && q.y + g.h <= H - M;
    let q = giros.map(posicion).find(cabe);
    if (!q) { q = posicion(giros[0]); q.x = Math.min(Math.max(q.x, M), W - M - g.w); q.y = Math.min(Math.max(q.y, M), H - M - g.h); }
    globo.dataset.donde = 'libre';
    globo.style.transform = `translate(${Math.round(q.x)}px,${Math.round(q.y)}px)`;
    // Línea: del borde del cartelito al borde del control (punto), sobre la recta entre los dos centros.
    const gx = q.x + g.w / 2, gy = q.y + g.h / 2, vx = cx - gx, vy = cy - gy, d = Math.hypot(vx, vy) || 1, ux = vx / d, uy = vy / d;
    const borde = (w, h) => Math.min(Math.abs(ux) > 1e-6 ? w / 2 / Math.abs(ux) : Infinity, Math.abs(uy) > 1e-6 ? h / 2 / Math.abs(uy) : Infinity);
    const redondo = b.w < 240 && b.w / (b.h || 1) > .7 && b.w / (b.h || 1) < 1.4;
    const elipse = redondo ? 1 / Math.hypot(ux / (b.w / 2 || 1), uy / (b.h / 2 || 1)) : borde(b.w, b.h); // en lo redondo el punto cae sobre su contorno; en lo demás, sobre el borde de la caja
    const desde = borde(g.w, g.h) + 6, hasta = d - elipse + 2;
    const [x1, y1, x2, y2] = [gx + ux * desde, gy + uy * desde, gx + ux * Math.max(desde, hasta), gy + uy * Math.max(desde, hasta)];
    const l = linea.querySelector('line'); l.setAttribute('x1', x1); l.setAttribute('y1', y1); l.setAttribute('x2', x2); l.setAttribute('y2', y2);
    const c = linea.querySelector('circle'); c.setAttribute('cx', x2); c.setAttribute('cy', y2);
  };

  const bienvenidaAbierta = () => ['pendiente', 'abierta'].includes(pantalla.dataset.bienvenida);
  const paso = () => {
    // Mientras dura la apertura o la bienvenida, y un momento después, no hay pistas.
    if (pantalla.classList.contains('en-apertura') || bienvenidaAbierta() || document.hidden) { pausa = performance.now() + 1200; return ocultar(); }
    if (actual) {
      if (seccion() !== actual.seccion) return ocultar(); // cambió de sección: queda pendiente
      if (actual.hecha()) return terminar(actual.id);
      const el = actual.cuando() ? actual.blanco() : null;
      if (!el || !visible(el)) return ocultar();
      return ubicar(actual, el);
    }
    if (performance.now() < pausa) return;
    for (const p of PISTAS) {
      if (hechas.has(p.id)) continue;
      if (!p.cuando()) continue;
      if (p.hecha()) { hechas.add(p.id); guardar(); continue; }
      const el = p.blanco();
      if (!el || !visible(el)) continue;
      actual = p; p.seccion = seccion(); texto.textContent = p.texto; globo.hidden = false; ubicar(p, el);
      requestAnimationFrame(() => { globo.classList.add('visible'); linea.classList.add('visible'); });
      return;
    }
  };
  const ciclo = () => { paso(); setTimeout(ciclo, 300); };
  ciclo();

})();
