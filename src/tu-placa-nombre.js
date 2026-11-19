// ───────── Propuesta: el nombre de la placa (dictado o escrito) y las placas de otros visitantes ─────────
// Al tocar GUARDAR PLACA, antes del recuerdo aparece una pantalla para poner el nombre:
//  · HABLAR: dictado con el reconocimiento de voz del navegador. Mientras habla, unas manchas de color siguen el volumen
//    de la voz. El audio no se guarda ni se envía a ningún lado desde el Atlas (solo queda el texto).
//    Ojo: en Chrome el dictado usa un servicio de Google, así que necesita internet. Sin conexión o sin micrófono, se escribe.
//  · ESCRIBIR: teclado en pantalla (no hace falta teclado físico).
//  · OMITIR: se guarda sin nombre.
// Después del recuerdo se ven las últimas placas guardadas en esta pantalla (como miniatura, con su nombre), incluida la nueva.
// Se guardan en este navegador (localStorage), hasta 12: al llegar a 12 se borra la más vieja. El reinicio del kiosco no las borra.
(() => {
  const CLAVE = 'micromundos-galeria-placas', MAX = 12;
  const $ = id => document.getElementById(id);
  const leer = () => { try { return JSON.parse(localStorage.getItem(CLAVE) || '[]'); } catch { return []; } };
  const escribir = l => { try { localStorage.setItem(CLAVE, JSON.stringify(l.slice(-MAX))); } catch {} };
  const Reconocimiento = window.SpeechRecognition || window.webkitSpeechRecognition;
  let dejarPasar = false, nombre = '';

  // ── Pantalla del nombre ──
  const capa = document.createElement('div');
  capa.id = 'tpNombre';
  capa.hidden = true;
  capa.setAttribute('role', 'dialog');
  capa.setAttribute('aria-modal', 'true');
  capa.setAttribute('aria-labelledby', 'tpNombreTitulo');
  const TECLAS = ['QWERTYUIOP', 'ASDFGHJKLÑ', 'ZXCVBNM'];
  capa.innerHTML = `
    <canvas class="tpn-voz" aria-hidden="true"></canvas>
    <div class="tpn-caja">
      <h2 id="tpNombreTitulo">¿CÓMO TE LLAMÁS?</h2>
      <p class="tpn-bajada">Tu nombre acompaña a tu placa. Decilo en voz alta o escribilo.</p>
      <output class="tpn-nombre" aria-live="polite"></output>
      <p class="tpn-estado" aria-live="polite"></p>
      <div class="tpn-teclado" hidden>${TECLAS.map(f => `<div>${[...f].map(t => `<button type="button" data-t="${t}">${t}</button>`).join('')}</div>`).join('')}
        <div><button type="button" data-t=" " class="tpn-ancha">ESPACIO</button><button type="button" data-t="borrar" class="tpn-media">BORRAR</button></div></div>
      <div class="tpn-acciones">
        <button type="button" class="tpn-hablar">HABLAR</button>
        <button type="button" class="tpn-escribir">ESCRIBIR</button>
        <button type="button" class="tpn-ok" disabled>OK</button>
      </div>
      <button type="button" class="tpn-omitir">GUARDAR SIN NOMBRE</button>
      <p class="tpn-privacidad">Usamos el micrófono solo para escribir tu nombre. El audio no se guarda.</p>
    </div>`;
  const montar = () => { const tp = $('tuPlaca'); if (tp && !capa.isConnected) tp.appendChild(capa); return !!tp; };
  const salida = capa.querySelector('.tpn-nombre'), estado = capa.querySelector('.tpn-estado'), ok = capa.querySelector('.tpn-ok');
  const teclado = capa.querySelector('.tpn-teclado'), hablar = capa.querySelector('.tpn-hablar');
  const fijar = t => { nombre = t.replace(/\s+/g, ' ').trimStart().slice(0, 24); salida.textContent = nombre; ok.disabled = !nombre.trim(); };

  // ── Voz: reconocimiento + manchas que siguen el volumen ──
  const lienzo = capa.querySelector('.tpn-voz');
  let rec = null, flujo = null, contexto = null, cuadro = 0;
  const pararVoz = () => {
    try { rec?.stop(); } catch {}
    rec = null; cancelAnimationFrame(cuadro);
    flujo?.getTracks().forEach(t => t.stop()); flujo = null;
    contexto?.close().catch(() => {}); contexto = null;
    capa.classList.remove('escuchando'); hablar.textContent = 'HABLAR';
  };
  const dibujarVoz = analizador => {
    const g = lienzo.getContext('2d'), datos = new Uint8Array(analizador.fftSize);
    lienzo.width = 1920; lienzo.height = 1100;
    const manchas = [['#ff4c52', 760, 520], ['#ffa600', 1160, 480], ['#92aa68', 960, 640], ['#f58bc3', 980, 400]];
    let nivelSuave = 0;
    const paso = t => {
      analizador.getByteTimeDomainData(datos);
      let s = 0; for (const v of datos) s += ((v - 128) / 128) ** 2;
      nivelSuave = nivelSuave * .8 + Math.sqrt(s / datos.length) * .2;
      g.clearRect(0, 0, 1920, 1100);
      manchas.forEach(([c, x, y], i) => {
        const r = 180 + nivelSuave * 2600 * (1 + .3 * Math.sin(t / 400 + i * 1.7));
        const gr = g.createRadialGradient(x + Math.sin(t / 900 + i) * 40, y + Math.cos(t / 1100 + i) * 30, 0, x, y, r);
        gr.addColorStop(0, c + 'aa'); gr.addColorStop(1, c + '00');
        g.fillStyle = gr; g.fillRect(0, 0, 1920, 1100);
      });
      cuadro = requestAnimationFrame(paso);
    };
    cuadro = requestAnimationFrame(paso);
  };
  async function empezarVoz() {
    if (rec) { pararVoz(); return; }
    if (!Reconocimiento || !navigator.mediaDevices?.getUserMedia) { estado.textContent = 'Este navegador no puede dictar. Escribilo con el teclado.'; mostrarTeclado(); return; }
    try {
      flujo = await navigator.mediaDevices.getUserMedia({ audio: true });
      contexto = new AudioContext();
      const analizador = contexto.createAnalyser(); analizador.fftSize = 1024;
      contexto.createMediaStreamSource(flujo).connect(analizador);
      dibujarVoz(analizador);
    } catch { estado.textContent = 'No hay micrófono o no se dio permiso. Escribilo con el teclado.'; pararVoz(); mostrarTeclado(); return; }
    rec = new Reconocimiento(); rec.lang = 'es-AR'; rec.interimResults = true; rec.maxAlternatives = 1;
    rec.onresult = ev => { const r = [...ev.results].map(x => x[0].transcript).join(' '); fijar(r.replace(/[^\p{L}\s'-]/gu, '').replace(/\b\p{L}/gu, l => l.toUpperCase())); };
    rec.onerror = ev => { estado.textContent = ev.error === 'network' ? 'Sin conexión no se puede dictar. Escribilo con el teclado.' : 'No te entendí. Probá otra vez o escribilo.'; if (ev.error === 'network') mostrarTeclado(); };
    rec.onend = () => { const habia = !!rec; pararVoz(); if (habia && nombre) estado.textContent = '¿Está bien? Tocá OK, volvé a hablar o escribilo.'; };
    capa.classList.add('escuchando'); hablar.textContent = 'LISTO'; estado.textContent = 'Te escucho…';
    try { rec.start(); } catch { pararVoz(); }
  }
  const mostrarTeclado = () => { teclado.hidden = false; };
  hablar.addEventListener('click', empezarVoz);
  capa.querySelector('.tpn-escribir').addEventListener('click', () => { pararVoz(); teclado.hidden = !teclado.hidden; });
  teclado.addEventListener('click', ev => {
    const t = ev.target.closest('[data-t]')?.dataset.t; if (!t) return;
    if (t === 'borrar') return fijar(nombre.slice(0, -1));
    if (t === ' ') return fijar(nombre + ' ');
    const mayuscula = !nombre || nombre.endsWith(' '); // primera letra de cada palabra
    fijar(nombre + (mayuscula ? t : t.toLowerCase()));
  });

  const cerrarNombre = () => { pararVoz(); capa.hidden = true; };
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
    fijar(''); estado.textContent = ''; teclado.hidden = true; capa.hidden = false;
    hablar.focus({ preventScroll: true });
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
