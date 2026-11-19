// ───────── Propuesta: «Qué produce o transforma» con «Se ayudan» dentro del esquema ─────────
// Se conserva el esquema de Figma tal cual (estructura rectilínea, círculos punteados, dibujos de las bacterias y flechas rectas).
// Lo que cambia: el párrafo «SE AYUDAN», que estaba aparte a la derecha, pasa a formar parte del esquema, junto a lo que explica:
//  · «SE AYUDAN» rotula el círculo donde están las dos especies juntas.
//  · Cada especie lleva su paso numerado, tomado del párrafo: 1 «crece primero y prepara la leche», 2 «sigue y produce más ácido».
//  · «Juntas trabajan más rápido que solas» acompaña la flecha hacia el RESULTADO, que es lo que se acelera.
// Así el esquema deja de leerse solo como «una cosa después de la otra»: el centro muestra a las dos especies trabajando en relevo.
// No agrega contenido: usa las frases del párrafo. Si el párrafo no tiene esa forma, queda como estaba. Comparar: placa.html?grafico=original
(() => {
  if (new URLSearchParams(location.search).get('grafico') === 'original') return;
  const textos = el => el ? [...el.querySelectorAll('p')].map(p => p.textContent.trim()).filter(Boolean) : [];

  function rehacer() {
    const lienzo = document.getElementById('detalleLienzo');
    if (!lienzo) return;
    const conexiones = lienzo.querySelector('[data-name="conexiones · qué produce"]');
    if (!conexiones || conexiones.dataset.esquema) return;
    const ayudan = lienzo.querySelector('[data-name="paquete · se ayudan"]');
    const anillos = [...lienzo.querySelectorAll('[data-name="anillo · PRODUCE"]')];
    if (!ayudan || anillos.length < 3) return;
    let cont = conexiones.parentElement;
    while (cont && !cont.contains(ayudan)) cont = cont.parentElement;
    if (!cont) return;
    const cr = cont.getBoundingClientRect(), k = cr.width / (cont.offsetWidth || cr.width) || 1;
    if (!cr.width) return;
    const rel = el => { const r = el.getBoundingClientRect(); return { x: (r.left - cr.left) / k, y: (r.top - cr.top) / k, w: r.width / k, h: r.height / k }; };

    const [rotAyuda, ...parrafo] = textos(ayudan);
    const especies = [...cont.querySelectorAll('p')].filter(p => /^[A-Z]\. [a-z]+$/.test(p.textContent.trim()));
    if (!rotAyuda || especies.length < 2) return;
    const nombres = especies.map(e => e.textContent.trim());
    // Frases del párrafo (sin cortar en «S. thermophilus»)
    const frases = parrafo.join(' ').split(/(?<=\p{Ll}\.)\s+(?=\p{Lu})/u).map(f => f.trim()).filter(Boolean);
    const paso = (f, n) => { const i = f ? f.indexOf(n) : -1; return i >= 0 ? f.slice(i + n.length).trim().replace(/\.$/, '') : null; };
    const pasos = [paso(frases[0], nombres[0]), paso(frases[1], nombres[1])];
    const rapidez = frases.find(f => /más rápido que solas/i.test(f));
    if (!pasos[0] || !pasos[1] || !rapidez) return;
    conexiones.dataset.esquema = '1';

    // Anillos: el de las especies es el de más a la izquierda; después PRODUCE (arriba) y RESULTADO (abajo).
    const [centro, , resultado] = anillos.map(rel).sort((a, b) => a.x - b.x || a.y - b.y);
    const caja = document.createElement('div');
    caja.className = 'ficha-esquema';
    caja.style.cssText = `position:absolute;left:0;top:0;width:${cont.offsetWidth}px;height:0`;
    const poner = (clase, x, y, ancho, partes, alinear = 'left') => {
      const d = document.createElement('div'); d.className = clase;
      d.style.cssText = `left:${alinear === 'center' ? x - ancho / 2 : x}px;top:${y}px;width:${ancho}px;text-align:${alinear}`;
      for (const [c, t] of partes) { const s = document.createElement('span'); if (c) s.className = c; s.textContent = t; d.appendChild(s); }
      caja.appendChild(d); return d;
    };
    // «SE AYUDAN» rotula el círculo de las dos especies
    poner('fe-rot', centro.x + centro.w / 2, centro.y - 34, 220, [['', rotAyuda]], 'center');
    // Pasos numerados junto a cada especie: el 1 arriba de su nombre, el 2 debajo
    const [e1, e2] = especies.map(rel);
    poner('fe-paso', e1.x, e1.y - 48, 200, [['fe-num', '1'], ['', pasos[0]]]);
    poner('fe-paso', e2.x, e2.y + e2.h + 8, 200, [['fe-num', '2'], ['', pasos[1]]]);
    // «Juntas…» junto a la flecha que va al RESULTADO (lo que se acelera)
    const xr = (centro.x + centro.w + resultado.x) / 2, yr = (centro.y + centro.h * .7 + resultado.y + resultado.h / 2) / 2;
    poner('fe-paso fe-rapidez', xr - 110, yr + 22, 190, [['', rapidez.replace(/\.$/, '')]]);
    cont.appendChild(caja);
    ayudan.style.visibility = 'hidden'; // su contenido ahora está en el esquema
    caja.setAttribute('role', 'note');
    caja.setAttribute('aria-label', `${rotAyuda}: 1, ${nombres[0]} ${pasos[0]}; 2, ${nombres[1]} ${pasos[1]}. ${rapidez}`);
  }
  // El lienzo de las pantallas de detalle se crea después de este script: se observa todo el documento.
  let pendiente = 0;
  new MutationObserver(() => { if (!pendiente) pendiente = setTimeout(() => { pendiente = 0; rehacer(); }, 60); }).observe(document.body, { childList: true, subtree: true });
})();
