// ───────── Bienvenida de primera visita ─────────
// Capa breve que aparece al terminar la apertura, solo la primera vez. Textos tomados de «Micromundos» (#queEs), sin contenido nuevo.
// Las pistas junto a cada control están en src/pistas.js. Se recuerda que ya se vio (localStorage). En modo kiosco (?kiosco) se recuerda solo durante la visita (sessionStorage),
// así cada persona nueva la ve. Para volver a verla: botón «VER LA INTRODUCCIÓN» en MICROMUNDOS. Para probarla: ?bienvenida.
(() => {
  const CLAVE = 'micromundos-bienvenida-vista';
  const params = new URLSearchParams(location.search);
  const almacen = (() => { try { return params.has('kiosco') ? sessionStorage : localStorage; } catch { return null; } })();
  const yaVista = () => { try { return almacen?.getItem(CLAVE) === '1'; } catch { return false; } };
  const marcarVista = () => { try { almacen?.setItem(CLAVE, '1'); } catch {} };
  const pantalla = document.getElementById('screen');
  if (!pantalla) return;

  const capa = document.createElement('div');
  capa.id = 'bienvenida';
  capa.hidden = true;
  capa.innerHTML = `
    <div class="bv-cartel" role="dialog" aria-modal="true" aria-labelledby="bvTitulo" aria-describedby="bvBajada">
      <div class="bv-vidrio" aria-hidden="true"></div>
      <p class="bv-etiqueta">Primera visita</p>
      <h2 id="bvTitulo">Micromundos</h2>
      <p id="bvBajada" class="bv-bajada">Es una colección de vida que no se ve a simple vista: bacterias, levaduras y mohos que viven en la comida, en la tierra, en las casas y en nuestro propio cuerpo.</p>
      <ol class="bv-secciones">
        <li style="--c:#DD82AB"><button type="button" data-bv-ir="navMuestras"><span class="bv-tit">Muestras</span><span class="bv-txt">Cada círculo de la placa es una muestra. Tocalo para saber de dónde viene y qué creció en ella.</span></button></li>
        <li style="--c:#FFA600"><button type="button" data-bv-ir="navGlosario"><span class="bv-tit">Glosario</span><span class="bv-txt">Conocé a las bacterias, las levaduras y los mohos, y los lugares donde viven.</span></button></li>
        <li style="--c:#92AA68"><button type="button" data-bv-ir="navTuPlaca"><span class="bv-tit">Tu placa</span><span class="bv-txt">Sembrá colonias en una placa vacía y armá tu propio micromundo.</span></button></li>
      </ol>
      <div class="bv-pie">
        <p class="bv-empezar"><strong>Para empezar,</strong> tocá un círculo de la placa.</p>
        <button type="button" class="bv-boton" data-bv-cerrar>EMPEZAR</button>
      </div>
      <p class="bv-nota">Podés volver a ver esta introducción desde MICROMUNDOS.</p>
    </div>`;
  pantalla.appendChild(capa);

  let foco = null;
  const abrir = () => {
    if (!capa.hidden) return;
    foco = document.activeElement;
    capa.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => capa.classList.add('visible')));
    capa.querySelector('[data-bv-cerrar]').focus({ preventScroll: true });
  };
  const cerrar = (destino) => {
    if (capa.hidden) return;
    marcarVista();
    capa.classList.remove('visible');
    const fin = () => { capa.hidden = true; };
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) fin(); else setTimeout(fin, 350);
    if (destino) document.getElementById(destino)?.click();
    else (foco && foco.isConnected ? foco : document.getElementById('titulo'))?.focus?.({ preventScroll: true });
  };

  capa.addEventListener('click', ev => {
    const ir = ev.target.closest('[data-bv-ir]');
    if (ir) return cerrar(ir.dataset.bvIr);
    if (ev.target.closest('[data-bv-cerrar]') || !ev.target.closest('.bv-cartel')) cerrar();
  });
  capa.addEventListener('keydown', ev => {
    if (ev.key === 'Escape') { ev.preventDefault(); cerrar(); }
    if (ev.key === 'Tab') { // el foco queda dentro de la capa
      const b = [...capa.querySelectorAll('button')], i = b.indexOf(document.activeElement);
      if (ev.shiftKey && i <= 0) { ev.preventDefault(); b.at(-1).focus(); }
      else if (!ev.shiftKey && i === b.length - 1) { ev.preventDefault(); b[0].focus(); }
    }
  });

  // Volver a consultarla: botón en MICROMUNDOS.
  const queEs = document.querySelector('#queEs .qe-intro');
  if (queEs) {
    const otraVez = document.createElement('button');
    otraVez.type = 'button';
    otraVez.className = 'qe-ver-bienvenida';
    otraVez.textContent = 'VER LA INTRODUCCIÓN';
    otraVez.addEventListener('click', () => { document.getElementById('navMuestras')?.click(); setTimeout(abrir, 450); });
    queEs.appendChild(otraVez);
  }

  // Primera visita: aparece cuando termina la apertura (cuando #screen deja de tener .en-apertura).
  if (yaVista() && !params.has('bienvenida')) return;
  const mostrarLuego = () => setTimeout(abrir, 700);
  if (!pantalla.classList.contains('en-apertura')) { mostrarLuego(); return; }
  const obs = new MutationObserver(() => {
    if (!pantalla.classList.contains('en-apertura')) { obs.disconnect(); mostrarLuego(); }
  });
  obs.observe(pantalla, { attributes: true, attributeFilter: ['class'] });
})();
