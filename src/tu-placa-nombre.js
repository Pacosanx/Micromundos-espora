// ───────── Propuesta: el nombre de la placa (por micrófono) y las placas de otros visitantes ─────────
// Al tocar GUARDAR PLACA, antes del recuerdo aparece la pantalla del nombre. Solo con micrófono:
//  · La protagonista es la placa que hay que MANTENER APRETADA para hablar. Mientras se mantiene, el reconocimiento de voz
//    del navegador escucha y unas manchas de color crecen dentro de la placa siguiendo el volumen de la voz.
//  · Al soltar, «carga» un segundo y aparece el nombre escrito. OK lo confirma; para corregirlo se vuelve a mantener apretado.
//  · Sin micrófono, sin permiso o sin conexión (en Chrome el dictado usa un servicio de Google), se avisa y se puede
//    guardar sin nombre. El audio no se guarda ni se envía a ningún lado desde el Atlas: solo queda el texto.
// Después del recuerdo se ven las últimas placas guardadas en esta pantalla (miniatura y nombre), incluida la nueva.
// Se guardan en este navegador (localStorage), hasta 12: al llegar a 12 se borra la más vieja. El reinicio del kiosco no las borra.
(() => {
  const CLAVE = 'micromundos-galeria-placas', MAX = 12;
  const $ = id => document.getElementById(id);
  const leer = () => { try { return JSON.parse(localStorage.getItem(CLAVE) || '[]'); } catch { return []; } };
  const escribir = l => { try { localStorage.setItem(CLAVE, JSON.stringify(l.slice(-MAX))); } catch {} };
  const Reconocimiento = window.SpeechRecognition || window.webkitSpeechRecognition;
  const flecha = '<img src="__CARTEL_FLECHA__" width="11.3995" height="11.0459" alt="">';
  let dejarPasar = false, nombre = '';

  // ── Pantalla del nombre ──
  const capa = document.createElement('div');
  capa.id = 'tpNombre';
  capa.hidden = true;
  capa.setAttribute('role', 'dialog');
  capa.setAttribute('aria-modal', 'true');
  capa.setAttribute('aria-labelledby', 'tpNombreTitulo');
  capa.innerHTML = `
    <div class="tpn-texto">
      <p class="tpn-rotulo">TU PLACA</p>
      <h2 id="tpNombreTitulo">¿Cómo te llamás?</h2>
      <p class="tpn-bajada">Tu nombre acompaña a tu placa. Mantené apretado el círculo, decí tu nombre y soltalo.</p>
      <p class="tpn-privacidad">Usamos el micrófono solo para escribir tu nombre. El audio no se guarda.</p>
    </div>
    <button type="button" class="tpn-placa" aria-describedby="tpNombreEstado">
      <canvas class="tpn-voz" width="784" height="784" aria-hidden="true"></canvas>
      <span class="tpn-anillo" aria-hidden="true"></span>
      <span class="tpn-centro">
        <span class="tpn-nombre" aria-live="polite"></span>
        <span class="tpn-indicacion">MANTENÉ APRETADO<br>PARA HABLAR</span>
      </span>
    </button>
    <p class="tpn-estado" id="tpNombreEstado" aria-live="polite"></p>
    <div class="tpn-acciones">
      <button type="button" class="tpn-ok" hidden><span>OK, GUARDAR CON ESTE NOMBRE</span>${flecha}</button>
      <button type="button" class="tpn-omitir"><span>GUARDAR SIN NOMBRE</span>${flecha}</button>
    </div>`;
  const montar = () => { const tp = $('tuPlaca'); if (tp && !capa.isConnected) tp.appendChild(capa); return !!tp; };
  const placa = capa.querySelector('.tpn-placa'), salida = capa.querySelector('.tpn-nombre'), estado = capa.querySelector('.tpn-estado');
  const ok = capa.querySelector('.tpn-ok'), indicacion = capa.querySelector('.tpn-indicacion');
  const fijar = t => {
    nombre = t.replace(/\s+/g, ' ').trim().slice(0, 24);
    salida.textContent = nombre; ok.hidden = !nombre;
    capa.classList.toggle('con-nombre', !!nombre);
    indicacion.innerHTML = nombre ? 'MANTENÉ APRETADO<br>PARA DECIRLO DE NUEVO' : 'MANTENÉ APRETADO<br>PARA HABLAR';
  };

  // ── Voz: mantener apretado = escuchar; las manchas siguen el volumen ──
  const lienzo = capa.querySelector('.tpn-voz');
  let rec = null, flujo = null, contexto = null, cuadro = 0, apretado = false, parcial = '', carga = 0;
  const pararAudio = () => {
    cancelAnimationFrame(cuadro); cuadro = 0;
    flujo?.getTracks().forEach(t => t.stop()); flujo = null;
    contexto?.close().catch(() => {}); contexto = null;
  };
  const pararTodo = () => { try { rec?.abort(); } catch {} rec = null; pararAudio(); clearTimeout(carga); capa.classList.remove('escuchando', 'cargando'); fijar(nombre); };
  const dibujarVoz = analizador => {
    const g = lienzo.getContext('2d'), datos = new Uint8Array(analizador.fftSize);
    const manchas = [['#e57dab', 330, 360], ['#f2c75e', 460, 330], ['#92aa68', 390, 470], ['#ffa600', 420, 300]];
    let nivelSuave = 0;
    const paso = t => {
      analizador.getByteTimeDomainData(datos);
      let s = 0; for (const v of datos) s += ((v - 128) / 128) ** 2;
      nivelSuave = nivelSuave * .8 + Math.sqrt(s / datos.length) * .2;
      g.clearRect(0, 0, 784, 784);
      manchas.forEach(([c, x, y], i) => {
        const r = 120 + nivelSuave * 1700 * (1 + .3 * Math.sin(t / 400 + i * 1.7));
        const gr = g.createRadialGradient(x + Math.sin(t / 900 + i) * 30, y + Math.cos(t / 1100 + i) * 24, 0, x, y, r);
        gr.addColorStop(0, c + 'cc'); gr.addColorStop(1, c + '00');
        g.fillStyle = gr; g.fillRect(0, 0, 784, 784);
      });
      cuadro = requestAnimationFrame(paso);
    };
    cuadro = requestAnimationFrame(paso);
  };
  const avisar = texto => { estado.textContent = texto; capa.classList.add('con-aviso'); };
  async function empezar(ev) {
    if (apretado) return;
    apretado = true; if (ev.pointerId != null) try { placa.setPointerCapture(ev.pointerId); } catch {}
    estado.textContent = ''; capa.classList.remove('con-aviso');
    if (!Reconocimiento || !navigator.mediaDevices?.getUserMedia) { apretado = false; avisar('Este navegador no puede escuchar. Podés guardar sin nombre.'); return; }
    capa.classList.add('escuchando'); parcial = ''; indicacion.textContent = 'TE ESCUCHO · SOLTÁ AL TERMINAR';
    try {
      flujo = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!apretado) { pararAudio(); capa.classList.remove('escuchando'); return; } // se soltó mientras se pedía permiso
      contexto = new AudioContext();
      const analizador = contexto.createAnalyser(); analizador.fftSize = 1024;
      contexto.createMediaStreamSource(flujo).connect(analizador);
      dibujarVoz(analizador);
    } catch { apretado = false; pararTodo(); avisar('No hay micrófono o no se dio permiso. Podés guardar sin nombre.'); return; }
    rec = new Reconocimiento(); rec.lang = 'es-AR'; rec.interimResults = true; rec.maxAlternatives = 1;
    rec.onresult = e => { parcial = [...e.results].map(x => x[0].transcript).join(' ').replace(/[^\p{L}\s'-]/gu, '').replace(/(^|\s)(\p{L})/gu, (m, a, l) => a + l.toUpperCase()); salida.textContent = parcial; };
    rec.onerror = e => { if (e.error === 'aborted') return; avisar(e.error === 'network' ? 'Sin conexión no se puede escuchar. Podés guardar sin nombre.' : e.error === 'not-allowed' ? 'No se dio permiso para el micrófono. Podés guardar sin nombre.' : 'No te escuché bien. Mantené apretado y probá otra vez.'); };
    rec.onend = () => {
      rec = null; pararAudio(); capa.classList.remove('escuchando'); fijar(nombre);
      if (!parcial.trim()) { if (!capa.classList.contains('con-aviso')) avisar('No te escuché. Mantené apretado mientras decís tu nombre.'); fijar(nombre); return; }
      // Un segundo de «carga» antes de mostrar el nombre escrito.
      capa.classList.add('cargando'); salida.textContent = '';
      carga = setTimeout(() => { capa.classList.remove('cargando'); fijar(parcial); estado.textContent = '¿Está bien? Tocá OK o volvé a decirlo.'; }, 1000);
    };
    try { rec.start(); } catch { apretado = false; pararTodo(); }
  }
  const soltar = () => { if (!apretado) return; apretado = false; try { rec?.stop(); } catch {} if (!rec) { pararAudio(); capa.classList.remove('escuchando'); } };
  placa.addEventListener('pointerdown', ev => { if (ev.button > 0) return; ev.preventDefault(); empezar(ev); });
  for (const t of ['pointerup', 'pointercancel', 'lostpointercapture']) placa.addEventListener(t, soltar);
  placa.addEventListener('contextmenu', ev => ev.preventDefault()); // mantener apretado en pantallas táctiles no abre menús
  placa.addEventListener('keydown', ev => { if ((ev.key === ' ' || ev.key === 'Enter') && !ev.repeat) { ev.preventDefault(); empezar({ pointerId: null }); } });
  placa.addEventListener('keyup', ev => { if (ev.key === ' ' || ev.key === 'Enter') soltar(); });

  const cerrarNombre = () => { apretado = false; pararTodo(); capa.hidden = true; };
  const guardar = conNombre => {
    if (!conNombre) fijar('');
    cerrarNombre(); dejarPasar = true; $('tpRecuerdo').click(); dejarPasar = false;
    setTimeout(despuesDelRecuerdo, 50);
  };
  ok.addEventListener('click', () => guardar(true));
  capa.querySelector('.tpn-omitir').addEventListener('click', () => guardar(false));
  capa.addEventListener('keydown', ev => { if (ev.key === 'Escape') cerrarNombre(); });

  // GUARDAR PLACA → primero el nombre
  document.addEventListener('click', ev => {
    // Solo con toques reales: los clics sintéticos (verificar-flujos) siguen directo al recuerdo.
    if (dejarPasar || !ev.isTrusted || !ev.target.closest?.('#tpRecuerdo') || $('tpRecuerdo')?.disabled || !montar()) return;
    ev.preventDefault(); ev.stopImmediatePropagation();
    $('tuPlaca').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); // cierra menús y carteles de reacción
    fijar(''); estado.textContent = ''; capa.classList.remove('con-aviso'); lienzo.getContext('2d').clearRect(0, 0, 784, 784); capa.hidden = false;
    placa.focus({ preventScroll: true });
  }, true);

  // ── Después del recuerdo: guardar miniatura y mostrar la galería ──
  function miniatura(url) {
    return new Promise(res => { const img = new Image(); img.onload = () => { const c = document.createElement('canvas'); c.width = c.height = 220; const g = c.getContext('2d'); const k = Math.min(220 / img.width, 220 / img.height); g.drawImage(img, (220 - img.width * k) / 2, (220 - img.height * k) / 2, img.width * k, img.height * k); res(c.toDataURL('image/webp', .8)); }; img.onerror = () => res(null); img.src = url; });
  }
  async function despuesDelRecuerdo() {
    const vista = $('tpVistaRecuerdo'), url = $('tpGuardar')?.href;
    if (!vista || vista.hidden || !url) return;
    const chica = await miniatura(url);
    const lista = leer();
    if (chica) { lista.push({ nombre: nombre.trim(), img: chica, fecha: Date.now() }); escribir(lista); }
    let pie = vista.querySelector('.tpn-pie');
    if (!pie) { pie = document.createElement('p'); pie.className = 'tpn-pie'; vista.querySelector('.tp-recuerdo-interior')?.prepend(pie); }
    pie.textContent = nombre.trim() ? `Placa de ${nombre.trim()}` : 'Tu placa';
    let galeria = vista.querySelector('.tpn-galeria');
    if (!galeria) { galeria = document.createElement('aside'); galeria.className = 'tpn-galeria'; galeria.setAttribute('aria-label', 'Placas de otros visitantes'); vista.appendChild(galeria); vista.classList.add('con-galeria'); }
    const ultimas = leer().slice().reverse();
    galeria.innerHTML = '<h3>PLACAS DE OTROS VISITANTES</h3><ol></ol>';
    const ol = galeria.querySelector('ol');
    ultimas.forEach((p, i) => { const li = document.createElement('li'); if (i === 0 && chica) li.className = 'tpn-nueva'; const im = document.createElement('img'); im.src = p.img; im.alt = ''; const s = document.createElement('span'); s.textContent = p.nombre || 'Sin nombre'; li.append(im, s); ol.appendChild(li); });
  }
})();
