// ───────── Propuesta: el nombre de la placa, dictado (diseño de Paco, Figma 621:863 «DICTADO DE NOMBRE») ─────────
// Al tocar GUARDAR PLACA, antes del recuerdo aparece esta pantalla, con lo mínimo:
//   «Placa creada por» · el nombre sobre una línea · el micrófono · «MANTENÉ APRETADO PARA DICTAR TU NOMBRE».
// Se mantiene apretado el micrófono para hablar: mientras tanto escucha el reconocimiento de voz del navegador y las dos manchas
// de color del diseño crecen con el volumen. Al soltar aparece el nombre; OK lo confirma y para corregirlo se vuelve a mantener.
// Sin micrófono, sin permiso o sin conexión (en Chrome el dictado usa un servicio de Google) se avisa abajo y se puede guardar sin nombre.
// El audio no se guarda ni se envía desde el Atlas: solo queda el texto. La pantalla con las placas de otras personas va aparte (CHECKLIST).
(() => {
  const $ = id => document.getElementById(id);
  const Reconocimiento = window.SpeechRecognition || window.webkitSpeechRecognition;
  const INDICACION = 'MANTENÉ APRETADO PARA DICTAR TU NOMBRE';
  let dejarPasar = false, nombre = '';

  const capa = document.createElement('div');
  capa.id = 'tpNombre';
  capa.hidden = true;
  capa.setAttribute('role', 'dialog');
  capa.setAttribute('aria-modal', 'true');
  capa.setAttribute('aria-label', 'Placa creada por');
  capa.innerHTML = `
    <img class="tpn-mancha tpn-mancha-a" src="__TPN_ELIPSE__" width="763" height="763" alt="">
    <img class="tpn-mancha tpn-mancha-b" src="__TPN_ELIPSE__" width="763" height="763" alt="">
    <p class="tpn-por">Placa creada por</p>
    <p class="tpn-nombre" aria-live="polite"></p>
    <img class="tpn-linea" src="__TPN_LINEA__" width="614" height="10" alt="">
    <button type="button" class="tpn-ok" hidden>OK</button>
    <button type="button" class="tpn-mic" aria-label="Mantené apretado para dictar tu nombre"><img src="__TPN_MICROFONO__" width="233" height="233" alt=""></button>
    <p class="tpn-indicacion" aria-live="polite">${INDICACION}</p>
    <button type="button" class="tpn-omitir" hidden>GUARDAR SIN NOMBRE</button>`;
  const montar = () => { const tp = $('tuPlaca'); if (tp && !capa.isConnected) tp.appendChild(capa); return !!tp; };
  const mic = capa.querySelector('.tpn-mic'), salida = capa.querySelector('.tpn-nombre'), indicacion = capa.querySelector('.tpn-indicacion');
  const ok = capa.querySelector('.tpn-ok'), omitir = capa.querySelector('.tpn-omitir');
  const manchas = [...capa.querySelectorAll('.tpn-mancha')];
  const decir = t => { indicacion.textContent = t; };
  const fijar = t => { nombre = t.replace(/\s+/g, ' ').trim().slice(0, 24); salida.textContent = nombre.toUpperCase(); ok.hidden = !nombre; };
  const avisar = t => { decir(t); omitir.hidden = false; };

  // ── Voz: mantener apretado = escuchar; las manchas crecen con el volumen ──
  let rec = null, flujo = null, contexto = null, cuadro = 0, apretado = false, parcial = '';
  const pararAudio = () => {
    cancelAnimationFrame(cuadro); cuadro = 0;
    flujo?.getTracks().forEach(t => t.stop()); flujo = null;
    contexto?.close().catch(() => {}); contexto = null;
    manchas.forEach(m => { m.style.scale = ''; });
  };
  const pararTodo = () => { try { rec?.abort(); } catch {} rec = null; pararAudio(); capa.classList.remove('escuchando'); };
  const seguirVoz = analizador => {
    const datos = new Uint8Array(analizador.fftSize);
    let nivel = 0;
    const paso = t => {
      analizador.getByteTimeDomainData(datos);
      let s = 0; for (const v of datos) s += ((v - 128) / 128) ** 2;
      nivel = nivel * .8 + Math.sqrt(s / datos.length) * .2;
      manchas.forEach((m, i) => { m.style.scale = String(1 + Math.min(.6, nivel * 4) * (1 + .25 * Math.sin(t / 380 + i * 2))); });
      cuadro = requestAnimationFrame(paso);
    };
    cuadro = requestAnimationFrame(paso);
  };
  async function empezar(ev) {
    if (apretado) return;
    apretado = true; if (ev.pointerId != null) try { mic.setPointerCapture(ev.pointerId); } catch {}
    omitir.hidden = true;
    if (!Reconocimiento || !navigator.mediaDevices?.getUserMedia) { apretado = false; avisar('ESTE NAVEGADOR NO PUEDE ESCUCHAR'); return; }
    capa.classList.add('escuchando'); parcial = ''; decir('TE ESCUCHO · SOLTÁ AL TERMINAR');
    try {
      flujo = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!apretado) { pararAudio(); capa.classList.remove('escuchando'); decir(INDICACION); return; } // se soltó mientras se pedía permiso
      contexto = new AudioContext();
      const analizador = contexto.createAnalyser(); analizador.fftSize = 1024;
      contexto.createMediaStreamSource(flujo).connect(analizador);
      seguirVoz(analizador);
    } catch { apretado = false; pararTodo(); avisar('NO HAY MICRÓFONO O NO SE DIO PERMISO'); return; }
    rec = new Reconocimiento(); rec.lang = 'es-AR'; rec.interimResults = true; rec.maxAlternatives = 1;
    rec.onresult = e => { parcial = [...e.results].map(x => x[0].transcript).join(' ').replace(/[^\p{L}\s'-]/gu, ''); salida.textContent = parcial.toUpperCase(); };
    rec.onerror = e => { if (e.error === 'aborted') return; if (e.error === 'network') avisar('SIN CONEXIÓN NO SE PUEDE DICTAR'); else if (e.error === 'not-allowed') avisar('NO SE DIO PERMISO PARA EL MICRÓFONO'); };
    rec.onend = () => {
      rec = null; pararAudio(); capa.classList.remove('escuchando');
      if (parcial.trim()) { fijar(parcial); decir('MANTENÉ APRETADO PARA CORREGIRLO'); }
      else { fijar(nombre); if (omitir.hidden) decir('NO TE ESCUCHÉ · ' + INDICACION); }
    };
    try { rec.start(); } catch { apretado = false; pararTodo(); decir(INDICACION); }
  }
  const soltar = () => { if (!apretado) return; apretado = false; try { rec?.stop(); } catch {} if (!rec) { pararAudio(); capa.classList.remove('escuchando'); } };
  mic.addEventListener('pointerdown', ev => { if (ev.button > 0) return; ev.preventDefault(); empezar(ev); });
  for (const t of ['pointerup', 'pointercancel', 'lostpointercapture']) mic.addEventListener(t, soltar);
  mic.addEventListener('contextmenu', ev => ev.preventDefault());
  mic.addEventListener('keydown', ev => { if ((ev.key === ' ' || ev.key === 'Enter') && !ev.repeat) { ev.preventDefault(); empezar({ pointerId: null }); } });
  mic.addEventListener('keyup', ev => { if (ev.key === ' ' || ev.key === 'Enter') soltar(); });

  const cerrarNombre = () => { apretado = false; pararTodo(); capa.hidden = true; };
  const guardar = conNombre => {
    if (!conNombre) fijar('');
    cerrarNombre(); dejarPasar = true; $('tpRecuerdo').click(); dejarPasar = false;
    setTimeout(despuesDelRecuerdo, 50);
  };
  ok.addEventListener('click', () => guardar(true));
  omitir.addEventListener('click', () => guardar(false));
  capa.addEventListener('keydown', ev => { if (ev.key === 'Escape') cerrarNombre(); });

  // GUARDAR PLACA → primero el nombre
  document.addEventListener('click', ev => {
    // Solo con toques reales: los clics sintéticos (verificar-flujos) siguen directo al recuerdo.
    if (dejarPasar || !ev.isTrusted || !ev.target.closest?.('#tpRecuerdo') || $('tpRecuerdo')?.disabled || !montar()) return;
    ev.preventDefault(); ev.stopImmediatePropagation();
    $('tuPlaca').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); // cierra menús y carteles de reacción
    fijar(''); decir(INDICACION); omitir.hidden = true; capa.hidden = false;
    mic.focus({ preventScroll: true });
  }, true);

  // El recuerdo lleva el nombre: «Placa de …».
  function despuesDelRecuerdo() {
    const vista = $('tpVistaRecuerdo');
    if (!vista || vista.hidden) return;
    let pie = vista.querySelector('.tpn-pie');
    if (!pie) { pie = document.createElement('p'); pie.className = 'tpn-pie'; vista.querySelector('.tp-recuerdo-interior')?.prepend(pie); }
    pie.textContent = nombre.trim() ? `Placa de ${nombre.trim()}` : 'Tu placa';
  }
})();
