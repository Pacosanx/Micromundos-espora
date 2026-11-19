// ───────── Bienvenida de primera visita ─────────
// Cartel que aparece al terminar la apertura, solo la primera vez. Explica qué es Micromundos con el contenido de la pantalla
// MICROMUNDOS (#queEs), en versión breve y sin botones hacia otras secciones. Es un cartel como los de MUESTRAS (mismo material
// y mismo arrastre, src/carteles.js), con el tamaño de un cartel grande: se cierra arrastrándolo fuera de la pantalla, y así
// la persona aprende el gesto que después usa con las fichas. Con teclado se cierra con Escape.
// Las pistas junto a cada control están en src/pistas.js y esperan a que este cartel se cierre.
// Se recuerda que ya se vio (localStorage). En modo kiosco (?kiosco) solo durante la visita (sessionStorage),
// así cada persona nueva la ve. Para probarla: ?bienvenida.
(() => {
  const CLAVE = 'micromundos-bienvenida-vista';
  const params = new URLSearchParams(location.search);
  const almacen = (() => { try { return params.has('kiosco') ? sessionStorage : localStorage; } catch { return null; } })();
  const yaVista = () => { try { return almacen?.getItem(CLAVE) === '1'; } catch { return false; } };
  const marcarVista = () => { try { almacen?.setItem(CLAVE, '1'); } catch {} };
  const pantalla = document.getElementById('screen');
  const plantilla = document.getElementById('plantillaCartelGlosario');
  const ancla = document.getElementById('anclaCarteles');
  if (!pantalla || !plantilla || !ancla) return;
  if (yaVista() && !params.has('bienvenida')) return;

  // Las pistas consultan este estado para no aparecer antes ni encima del cartel.
  pantalla.dataset.bienvenida = 'pendiente';
  const textoQueEs = sel => document.querySelector('#queEs ' + sel)?.textContent.trim() || '';
  // Funciones del cartel (src/carteles.js): el script principal las publica al terminar de prepararse.
  const C = () => window.micromundosCarteles;
  const puntos = g => [...g].map(x => `<i style="background:${C().PALETA_CARTEL[x]}"></i>`).join('');

  let el = null, cancelar = null, agua = null;
  function abrir() {
    if (!C()) { document.addEventListener('micromundos-carteles', abrir, { once: true }); return; }
    el = plantilla.content.firstElementChild.cloneNode(true);
    el.classList.add('cartel-bienvenida'); // conserva .cartel-glosario: mismas reglas de material y arrastre
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'Micromundos: qué es');
    el.tabIndex = -1;
    el.querySelector('.nom').textContent = 'Micromundos';
    el.querySelector('.cod').textContent = 'Primera visita';
    const cuerpo = el.querySelector('.definicionGlosario');
    cuerpo.className = 'bv-bajada';
    cuerpo.textContent = textoQueEs('.qe-bajada');
    const datos = document.createElement('dl');
    datos.className = 'bv-datos';
    const fila = (rotulo, html) => { const dt = document.createElement('dt'); dt.textContent = rotulo; const dd = document.createElement('dd'); dd.innerHTML = html; datos.append(dt, dd); };
    const esc = t => String(t).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
    fila('Colonia', esc(textoQueEs('.qe-claves > div:first-child p')));
    fila('Grupos', `<span class="bv-grupos"><span><span class="coloresCartel">${puntos('B')}</span>Bacterias</span><span><span class="coloresCartel">${puntos('L')}</span>Levaduras</span><span><span class="coloresCartel">${puntos('M')}</span>Mohos</span></span>`);
    for (const li of document.querySelectorAll('#queEs .qe-pasos li')) {
      const tit = li.querySelector('.qe-tit')?.textContent.trim(), txt = li.querySelector('.qe-txt')?.textContent.trim();
      if (tit && txt) fila(tit, esc(txt));
    }
    cuerpo.after(datos);
    const gesto = document.createElement('p');
    gesto.className = 'bv-gesto';
    gesto.innerHTML = `<span class="bv-gesto-dedo" aria-hidden="true"></span><span>Arrastrá este cartel fuera de la pantalla para cerrarlo.</span>`;
    datos.after(gesto);
    C().universoCartel(el, 'BL');
    ancla.appendChild(el);
    const w = el.offsetWidth, h = el.offsetHeight;
    el.style.transform = `translate(${Math.round(960 - w / 2)}px,${Math.round(550 - h / 2)}px)`;
    agua = C().activarOleajeCartel(el, 0);
    cancelar = C().activarArrastreCartel(el, pos => { el.style.transform = `translate(${pos.x.toFixed(1)}px,${pos.y.toFixed(1)}px)`; }, cerrar);
    el.addEventListener('keydown', ev => { if (ev.key === 'Escape') { ev.preventDefault(); el.classList.remove('vis'); setTimeout(cerrar, 350); } });
    pantalla.dataset.bienvenida = 'abierta';
    requestAnimationFrame(() => { el.classList.add('vis'); el.focus({ preventScroll: true }); });
  }
  function cerrar() {
    if (!el) return;
    marcarVista();
    cancelar?.(); agua?.detener(); el.remove(); el = null;
    pantalla.dataset.bienvenida = 'cerrada';
    document.getElementById('titulo')?.focus?.({ preventScroll: true });
  }
  // Si la persona cambia de sección antes de cerrarlo, se retira (como los demás carteles).
  for (const id of ['navGlosario', 'navTuPlaca', 'navQueEs']) document.getElementById(id)?.addEventListener('click', () => el && cerrar());

  // Aparece cuando termina la apertura (cuando #screen deja de tener .en-apertura).
  const mostrarLuego = () => setTimeout(abrir, 700);
  if (!pantalla.classList.contains('en-apertura')) { mostrarLuego(); return; }
  const obs = new MutationObserver(() => {
    if (!pantalla.classList.contains('en-apertura')) { obs.disconnect(); mostrarLuego(); }
  });
  obs.observe(pantalla, { attributes: true, attributeFilter: ['class'] });
})();
