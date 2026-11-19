// ───────── Propuesta: el nombre de la placa, dictado (diseño de Paco, Figma 621:863 «DICTADO DE NOMBRE») ─────────
// Al tocar GUARDAR PLACA, antes del recuerdo aparece esta pantalla, con lo mínimo:
//   «Placa creada por» · el nombre sobre una línea · el micrófono · «MANTENÉ APRETADO PARA DICTAR TU NOMBRE».
// 19/11/2026 (segunda ronda de Paco):
//  · SIMULACIÓN: mantener apretado el micrófono NO usa el micrófono. Se simula que la persona dice «Paco»: las manchas de atrás
//    se van poniendo de color al ritmo de la voz y el nombre aparece en dos golpes, primero «PA» y después «PACO».
//    El dictado real (reconocimiento de voz del navegador) queda solo con ?dictado en la dirección.
//  · Con el nombre, pregunta si está bien (SÍ, ES MI NOMBRE / DICTAR DE NUEVO).
//  · Después, la página del recuerdo: tu placa con tu nombre, la fecha y la hora, IMPRIMIR RECUERDO (simulado) y la placa
//    se suma a las de los demás (queda guardada en este equipo y aparece primera en VER PLACAS DE OTRAS PERSONAS).
(() => {
  const $ = id => document.getElementById(id);
  const params = new URLSearchParams(location.search);
  const DICTADO_REAL = params.has('dictado');
  const Reconocimiento = window.SpeechRecognition || window.webkitSpeechRecognition;
  const INDICACION = 'MANTENÉ APRETADO PARA DICTAR TU NOMBRE';
  const NOMBRE_SIMULADO = 'Paco';
  let dejarPasar = false, nombre = '';

  // Micrófono del sistema: una cápsula de trazo fino y, debajo, un arco, todo en trazo continuo; el contenedor lleva el contorno punteado.
  const MIC = `<svg class="tpn-mic-glifo" viewBox="0 0 96 96" width="132" height="132" aria-hidden="true">
      <rect x="37" y="18" width="22" height="40" rx="11" fill="none" stroke="#13151b" stroke-width="2"/>
      <path d="M27 50a21 21 0 0 0 42 0" fill="none" stroke="#13151b" stroke-width="2" stroke-linecap="round"/>
      <path d="M48 71v8" stroke="#13151b" stroke-width="2" stroke-linecap="round"/></svg>`;

  // ── Placas compartidas (19/11/2026, Paco): se guardan en Supabase para que se vean desde el link de GitHub ──
  // La clave es la pública («publishable»): solo deja agregar y leer placas (reglas RLS de la tabla public.placas).
  // En el servidor local no se sube nada (para no llenar la tabla con pruebas), salvo con ?nube.
  const NUBE = { url: 'https://pbzugtzeuflyofilpvnr.supabase.co/rest/v1/placas', clave: 'sb_publishable_poNqm-Q6PErdmv2T3w8yQA_Oc02jkfH' };
  const enLocal = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) && !params.has('nube');
  window.MicromundosPlacas = {
    guardar(imagen, nombreDado) {
      if (enLocal || typeof fetch !== 'function' || imagen.length > 200000) return Promise.resolve(false);
      return this.pendiente = fetch(NUBE.url, { method: 'POST', headers: { apikey: NUBE.clave, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({ imagen, nombre: String(nombreDado || '').trim().slice(0, 24) }) }).then(r => r.ok).catch(() => false);
    },
    leer(cuantas = 20) {
      if (typeof fetch !== 'function') return Promise.resolve(null);
      // Espera a que termine de subir la última placa guardada, para que ya aparezca.
      return Promise.resolve(this.pendiente).then(() => fetch(NUBE.url + '?select=nombre,creada,imagen&order=creada.desc&limit=' + cuantas, { headers: { apikey: NUBE.clave } })
        .then(r => r.ok ? r.json() : null).then(l => Array.isArray(l) ? l.filter(p => typeof p?.imagen === 'string' && p.imagen.startsWith('data:image/'))
          .map(p => ({ img: p.imagen, nombre: p.nombre || '', fecha: Date.parse(p.creada) || Date.now() })) : null)).catch(() => null);
    }
  };

  const capa = document.createElement('div');
  capa.id = 'tpNombre';
  capa.hidden = true;
  capa.setAttribute('role', 'dialog');
  capa.setAttribute('aria-modal', 'true');
  capa.setAttribute('aria-label', 'Placa creada por');
  capa.innerHTML = `
    <i class="tpn-mancha tpn-mancha-a" aria-hidden="true"></i>
    <i class="tpn-mancha tpn-mancha-b" aria-hidden="true"></i>
    <p class="tpn-por">Placa creada por</p>
    <p class="tpn-nombre" aria-live="polite"></p>
    <img class="tpn-linea" src="__TPN_LINEA__" width="614" height="10" alt="">
    <div class="tpn-confirmar" hidden><p>¿Está bien así?</p><div><button type="button" class="tpn-si">SÍ, ES MI NOMBRE</button><i></i><button type="button" class="tpn-otra">DICTAR DE NUEVO</button></div></div>
    <button type="button" class="tpn-mic" aria-label="Mantené apretado para dictar tu nombre"><span class="tpn-mic-superficie"></span>${MIC}</button>
    <p class="tpn-indicacion" aria-live="polite">${INDICACION}</p>
    <p class="tpn-aviso">Tu placa y tu nombre se van a ver en PLACAS DE OTRAS PERSONAS.</p>
    <button type="button" class="tpn-omitir" hidden>GUARDAR SIN NOMBRE</button>`;
  const montar = () => { const tp = $('tuPlaca'); if (tp && !capa.isConnected) tp.appendChild(capa); return !!tp; };
  const mic = capa.querySelector('.tpn-mic'), salida = capa.querySelector('.tpn-nombre'), indicacion = capa.querySelector('.tpn-indicacion');
  const confirmar = capa.querySelector('.tpn-confirmar'), omitir = capa.querySelector('.tpn-omitir');
  const manchas = [...capa.querySelectorAll('.tpn-mancha')];
  const decir = t => { indicacion.textContent = t; };
  const fijar = t => { nombre = t.replace(/\s+/g, ' ').trim().slice(0, 24); salida.textContent = nombre.toUpperCase(); };
  const avisar = t => { decir(t); omitir.hidden = false; };
  const preguntar = () => { confirmar.hidden = !nombre; mic.hidden = !!nombre; indicacion.hidden = !!nombre; if (nombre) confirmar.querySelector('.tpn-si').focus({ preventScroll: true }); };
  // Las manchas: grises en reposo; con la voz se ponen de color y crecen.
  const pintarManchas = (nivel, t = performance.now()) => manchas.forEach((m, i) => {
    m.style.scale = String(1 + Math.min(.3, nivel * .7) * (1 + .25 * Math.sin(t / 380 + i * 2)));
    m.style.filter = `grayscale(${Math.max(0, 1 - nivel * 3).toFixed(2)})`; m.style.opacity = String(Math.min(1, .18 + nivel * 2.2));
  });
  const reposarManchas = () => manchas.forEach(m => { m.style.scale = ''; m.style.filter = ''; m.style.opacity = ''; });

  // ── Simulación: «Pa-co». Nivel de voz en el tiempo (ms) y cuándo aparece cada parte del nombre. ──
  let simulando = 0, inicioSim = 0, apretado = false;
  const nivelSimulado = t => {
    const silaba = (c, a) => Math.exp(-(((t - c) / a) ** 2));
    return .05 + .5 * silaba(700, 170) + .42 * silaba(1180, 200) + .03 * Math.sin(t / 37);
  };
  function simular() {
    capa.classList.add('escuchando'); decir('TE ESCUCHO…'); fijar(''); confirmar.hidden = true;
    inicioSim = performance.now();
    const paso = ahora => {
      const t = ahora - inicioSim;
      pintarManchas(Math.max(0, nivelSimulado(t)), ahora);
      if (t > 760 && !salida.textContent) salida.textContent = NOMBRE_SIMULADO.slice(0, 2).toUpperCase();
      if (t > 1260 && salida.textContent.length < NOMBRE_SIMULADO.length) fijar(NOMBRE_SIMULADO);
      if (t < 1700 || apretado) { simulando = requestAnimationFrame(paso); return; }
      terminarSim();
    };
    simulando = requestAnimationFrame(paso);
  }
  function terminarSim() {
    cancelAnimationFrame(simulando); simulando = 0; capa.classList.remove('escuchando'); reposarManchas();
    fijar(NOMBRE_SIMULADO); decir(INDICACION); preguntar();
  }

  // ── Dictado real (solo con ?dictado): mantener apretado = escuchar; las manchas crecen con el volumen ──
  let rec = null, flujo = null, contexto = null, cuadro = 0, parcial = '';
  const pararAudio = () => {
    cancelAnimationFrame(cuadro); cuadro = 0;
    flujo?.getTracks().forEach(t => t.stop()); flujo = null;
    contexto?.close().catch(() => {}); contexto = null;
    reposarManchas();
  };
  const pararTodo = () => { try { rec?.abort(); } catch {} rec = null; pararAudio(); cancelAnimationFrame(simulando); simulando = 0; capa.classList.remove('escuchando'); };
  async function empezarReal() {
    if (!Reconocimiento || !navigator.mediaDevices?.getUserMedia) { apretado = false; avisar('ESTE NAVEGADOR NO PUEDE ESCUCHAR'); return; }
    capa.classList.add('escuchando'); parcial = ''; decir('TE ESCUCHO · SOLTÁ AL TERMINAR');
    try {
      flujo = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!apretado) { pararAudio(); capa.classList.remove('escuchando'); decir(INDICACION); return; }
      contexto = new AudioContext();
      const analizador = contexto.createAnalyser(); analizador.fftSize = 1024;
      contexto.createMediaStreamSource(flujo).connect(analizador);
      const datos = new Uint8Array(analizador.fftSize); let nivel = 0;
      const paso = t => { analizador.getByteTimeDomainData(datos); let s = 0; for (const v of datos) s += ((v - 128) / 128) ** 2; nivel = nivel * .8 + Math.sqrt(s / datos.length) * .2; pintarManchas(nivel * 2.5, t); cuadro = requestAnimationFrame(paso); };
      cuadro = requestAnimationFrame(paso);
    } catch { apretado = false; pararTodo(); avisar('NO HAY MICRÓFONO O NO SE DIO PERMISO'); return; }
    rec = new Reconocimiento(); rec.lang = 'es-AR'; rec.interimResults = true; rec.maxAlternatives = 1;
    rec.onresult = e => { parcial = [...e.results].map(x => x[0].transcript).join(' ').replace(/[^\p{L}\s'-]/gu, ''); salida.textContent = parcial.toUpperCase(); };
    rec.onerror = e => { if (e.error === 'aborted') return; if (e.error === 'network') avisar('SIN CONEXIÓN NO SE PUEDE DICTAR'); else if (e.error === 'not-allowed') avisar('NO SE DIO PERMISO PARA EL MICRÓFONO'); };
    rec.onend = () => { rec = null; pararAudio(); capa.classList.remove('escuchando'); if (parcial.trim()) { fijar(parcial); decir(INDICACION); preguntar(); } else { fijar(nombre); if (omitir.hidden) decir('NO TE ESCUCHÉ · ' + INDICACION); } };
    try { rec.start(); } catch { apretado = false; pararTodo(); decir(INDICACION); }
  }
  function empezar(ev) {
    if (apretado) return;
    apretado = true; if (ev.pointerId != null) try { mic.setPointerCapture(ev.pointerId); } catch {}
    omitir.hidden = true;
    if (DICTADO_REAL) empezarReal(); else simular();
  }
  const soltar = () => { if (!apretado) return; apretado = false; if (DICTADO_REAL) { try { rec?.stop(); } catch {} if (!rec) { pararAudio(); capa.classList.remove('escuchando'); } } };
  mic.addEventListener('pointerdown', ev => { if (ev.button > 0) return; ev.preventDefault(); empezar(ev); });
  for (const t of ['pointerup', 'pointercancel', 'lostpointercapture']) mic.addEventListener(t, soltar);
  mic.addEventListener('contextmenu', ev => ev.preventDefault());
  mic.addEventListener('keydown', ev => { if ((ev.key === ' ' || ev.key === 'Enter') && !ev.repeat) { ev.preventDefault(); empezar({ pointerId: null }); } });
  mic.addEventListener('keyup', ev => { if (ev.key === ' ' || ev.key === 'Enter') soltar(); });

  const cerrarNombre = () => { apretado = false; pararTodo(); capa.hidden = true; };
  const guardar = conNombre => {
    if (!conNombre) fijar('');
    const fecha = new Date();
    cerrarNombre(); dejarPasar = true; $('tpRecuerdo').click(); dejarPasar = false;
    setTimeout(() => despuesDelRecuerdo(fecha), 50);
  };
  confirmar.querySelector('.tpn-si').addEventListener('click', () => guardar(true));
  confirmar.querySelector('.tpn-otra').addEventListener('click', () => { fijar(''); confirmar.hidden = true; mic.hidden = false; indicacion.hidden = false; decir(INDICACION); mic.focus({ preventScroll: true }); });
  omitir.addEventListener('click', () => guardar(false));
  capa.addEventListener('keydown', ev => { if (ev.key === 'Escape') cerrarNombre(); });

  // GUARDAR PLACA → primero el nombre
  document.addEventListener('click', ev => {
    // Solo con toques reales: los clics sintéticos (verificar-flujos) siguen directo al recuerdo.
    if (dejarPasar || !ev.isTrusted || !ev.target.closest?.('#tpRecuerdo') || $('tpRecuerdo')?.disabled || !montar()) return;
    ev.preventDefault(); ev.stopImmediatePropagation();
    $('tuPlaca').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); // cierra menús y carteles de reacción
    fijar(''); decir(INDICACION); omitir.hidden = true; confirmar.hidden = true; mic.hidden = false; indicacion.hidden = false; capa.hidden = false;
    mic.focus({ preventScroll: true });
  }, true);

  // ── La página del recuerdo: tu placa, tu nombre, fecha y hora, IMPRIMIR RECUERDO y la placa se suma a las de los demás ──
  const CLAVE_PLACAS = 'micromundos-placas-guardadas';
  const dos = n => String(n).padStart(2, '0');
  function sumarALasDemas(url, fecha) {
    // La pantalla con las placas de todos todavía no está pensada: por ahora la placa queda guardada en este equipo
    // (miniatura, nombre y fecha), con la misma clave que usa la propuesta «Placas de otras personas».
    if (typeof Image !== 'function') return;
    const img = new Image();
    img.onload = () => {
      const s = 1600 / 860, c = document.createElement('canvas'); c.width = c.height = 360;
      c.getContext('2d').drawImage(img, 20 * s, 2 * s, 820 * s, 820 * s, 0, 0, 360, 360);
      let lista = []; try { lista = JSON.parse(localStorage.getItem(CLAVE_PLACAS) || '[]'); if (!Array.isArray(lista)) lista = []; } catch {}
      // Sin fondo (19/11/2026, Paco): WebP con transparencia; si el navegador no lo arma, PNG.
      let dato = c.toDataURL('image/webp', .86); if (!dato.startsWith('data:image/webp')) dato = c.toDataURL('image/png');
      lista.push({ img: dato, nombre: nombre.trim(), fecha: fecha.getTime() });
      // A la nube: con el dictado simulado el nombre siempre es «Paco», así que sin ?dictado la placa sube sin nombre.
      window.MicromundosPlacas?.guardar(dato, DICTADO_REAL ? nombre : '');
      try { localStorage.setItem(CLAVE_PLACAS, JSON.stringify(lista.slice(-4))); } catch {}
    };
    img.src = url;
  }
  function despuesDelRecuerdo(fecha = new Date()) {
    const vista = $('tpVistaRecuerdo');
    if (!vista || vista.hidden) return;
    vista.classList.add('tpn-recuerdo');
    let ficha = vista.querySelector('.tpn-ficha');
    if (!ficha) {
      ficha = document.createElement('div'); ficha.className = 'tpn-ficha';
      ficha.innerHTML = `<p class="tpn-ficha-rotulo">PLACA CREADA POR</p><p class="tpn-ficha-nombre"></p><p class="tpn-ficha-fecha"></p>
        <p class="tpn-ficha-compartida">Tu placa ya está con las de los demás.</p>
        <div class="tpn-ficha-acciones"><button type="button" class="tpn-imprimir">IMPRIMIR RECUERDO</button><i></i></div>`;
      vista.querySelector('.tp-recuerdo-interior')?.appendChild(ficha);
      const acciones = ficha.querySelector('.tpn-ficha-acciones'), volver = $('tpVolver');
      if (volver) acciones.appendChild(volver);
      const otras = $('tpVerOtras'); if (otras) acciones.appendChild(otras); // «Placas de otras personas» (rama otras-placas)
      const imprimir = ficha.querySelector('.tpn-imprimir');
      imprimir.addEventListener('click', () => {
        // Simulado: en el museo la imprime la impresora de la pantalla. Acá solo cambia el estado del botón.
        if (imprimir.dataset.estado) return;
        imprimir.dataset.estado = 'imprimiendo'; imprimir.textContent = 'IMPRIMIENDO…';
        setTimeout(() => { imprimir.dataset.estado = 'listo'; imprimir.textContent = 'RECUERDO IMPRESO'; }, 2200);
      });
    }
    const imprimir = ficha.querySelector('.tpn-imprimir'); delete imprimir.dataset.estado; imprimir.textContent = 'IMPRIMIR RECUERDO';
    ficha.querySelector('.tpn-ficha-nombre').textContent = (nombre.trim() || 'Sin nombre').toUpperCase();
    ficha.querySelector('.tpn-ficha-fecha').textContent = `${dos(fecha.getDate())}/${dos(fecha.getMonth() + 1)}/${fecha.getFullYear()} · ${dos(fecha.getHours())}:${dos(fecha.getMinutes())}`;
    const url = $('tpImagenRecuerdo')?.dataset.sinFondo || $('tpGuardar')?.href; if (url) sumarALasDemas(url, fecha);
  }
})();
