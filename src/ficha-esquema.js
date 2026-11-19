// ───────── Propuesta: «Qué produce o transforma» como recorrido ─────────
// En el diseño actual PRODUCE y RESULTADO salen en paralelo de las especies y «SE AYUDAN» queda en la columna derecha, como párrafo.
// Esta propuesta lo dibuja: COME → la 1.ª especie → relevo a la 2.ª → PRODUCE → RESULTADO, en zigzag; lo que hace cada especie
// va junto a ella (numerado) y «juntas, más rápido que solas» se ve en dos barras de duración.
// No agrega contenido: toma rótulos, valores, especies y las frases del párrafo de «SE AYUDAN» de la ficha ya armada.
// Para comparar con el original: placa.html?grafico=original
(() => {
  if (new URLSearchParams(location.search).get('grafico') === 'original') return;
  const ns = 'http://www.w3.org/2000/svg';
  const textos = el => el ? [...el.querySelectorAll('p')].map(p => p.textContent.trim()).filter(Boolean) : [];

  function rehacer() {
    const lienzo = document.getElementById('detalleLienzo');
    if (!lienzo) return;
    const conexiones = lienzo.querySelector('[data-name="conexiones · qué produce"]');
    if (!conexiones || conexiones.dataset.esquema) return;
    const por = nombre => [...lienzo.querySelectorAll(`[data-name="${nombre}"]`)];
    const come = por('anillo · COME')[0], ayudan = por('paquete · se ayudan')[0];
    if (!come || !ayudan) return;
    let cont = come.parentElement;
    while (cont && !cont.contains(ayudan)) cont = cont.parentElement;
    if (!cont) return;
    const cr = cont.getBoundingClientRect(), k = cr.width / (cont.offsetWidth || cr.width) || 1;
    const rel = el => { const r = el.getBoundingClientRect(); return { x: (r.left - cr.left) / k, y: (r.top - cr.top) / k, w: r.width / k, h: r.height / k }; };

    const [rotCome, valCome] = textos(por('etiqueta · Come')[0]);
    const [rotProd, valProd] = textos(por('etiqueta · Produce')[0]);
    const [rotRes, valRes] = textos(por('etiqueta · Resultado')[0]);
    const [rotAyuda, ...parrafo] = textos(ayudan);
    const especies = [...cont.querySelectorAll('p')].filter(p => /^[A-Z]\. [a-z]+$/.test(p.textContent.trim()));
    if (!valCome || !valProd || !valRes || especies.length < 1) return;

    // Lo que se reemplaza: anillos, etiquetas, conexiones, dibujos de especies y el paquete de la derecha.
    const viejos = [come, ...por('anillo · PRODUCE'), ...por('etiqueta · Come'), ...por('etiqueta · Produce'), ...por('etiqueta · Resultado'),
      conexiones, ayudan, ...especies, ...[...cont.querySelectorAll('[data-name]')].filter(e => /^(micro|colonias-piece)/.test(e.dataset.name))];
    const cajaCome = rel(come);
    const cajas = viejos.map(rel);
    const arriba = Math.min(...cajas.map(c => c.y)), abajo = Math.max(...cajas.map(c => c.y + c.h));
    for (const v of viejos) v.style.visibility = 'hidden';
    conexiones.dataset.esquema = '1';

    const W = cont.offsetWidth || 1920, H = Math.max(420, abajo - arriba), cy = cajaCome.y + cajaCome.h / 2 - arriba; // a la altura del COME original
    const caja = document.createElement('div');
    caja.className = 'ficha-esquema';
    caja.style.cssText = `position:absolute;left:0;top:${arriba}px;width:${W}px;height:${H}px`;
    caja.setAttribute('role', 'img');
    caja.setAttribute('aria-label', `${rotCome} ${valCome}; ${especies.map(e => e.textContent.trim()).join(' y ')}, ${rotAyuda.toLowerCase()}; ${rotProd} ${valProd}; ${rotRes} ${valRes}.`);
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('width', W); svg.setAttribute('height', H); svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = `<defs><marker id="feFlecha" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto"><path d="M0 0L10 5L0 10" fill="none" stroke="#0d0f17" stroke-width="1.5"/></marker>
      <radialGradient id="feBacteria"><stop offset="0" stop-color="#ff4c52" stop-opacity=".55"/><stop offset=".55" stop-color="#f58bc3" stop-opacity=".45"/><stop offset="1" stop-color="#f58bc3" stop-opacity="0"/></radialGradient>
      <radialGradient id="feBacteria2"><stop offset="0" stop-color="#e57dab" stop-opacity=".6"/><stop offset=".55" stop-color="#ffa600" stop-opacity=".28"/><stop offset="1" stop-color="#ffa600" stop-opacity="0"/></radialGradient>
      <linearGradient id="feJuntas" x1="0" x2="1"><stop offset="0" stop-color="#ff4c52" stop-opacity=".7"/><stop offset="1" stop-color="#ffa600" stop-opacity=".7"/></linearGradient></defs>`;
    caja.appendChild(svg);
    const el = (tag, attrs) => { const n = document.createElementNS(ns, tag); for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v); svg.appendChild(n); return n; };
    const circulo = (x, y, r, relleno) => el('circle', relleno ? { cx: x, cy: y, r, fill: relleno, style: 'mix-blend-mode:multiply' } : { cx: x, cy: y, r, fill: 'none', stroke: '#0d0f17', 'stroke-opacity': .3, 'stroke-width': 1.5 });
    const flecha = (x1, y1, x2, y2, curva = 0) => { const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 - curva; el('path', { d: `M${x1} ${y1}Q${mx} ${my} ${x2} ${y2}`, fill: 'none', stroke: '#0d0f17', 'stroke-width': 1.5, 'marker-end': 'url(#feFlecha)' }); };
    const texto = (x, y, ancho, clase, partes, alinear = 'center') => { const d = document.createElement('div'); d.className = clase; d.style.cssText = `left:${alinear === 'center' ? x - ancho / 2 : x}px;top:${y}px;width:${ancho}px;text-align:${alinear}`; for (const [c, t] of partes) { const sp = document.createElement('span'); sp.className = c; sp.textContent = t; d.appendChild(sp); } caja.appendChild(d); return d; };
    const nodo = (x, y, rot, val) => { circulo(x, y, R); const d = texto(x, y - 26, 170, 'fe-nodo', [['fe-rot', rot], ['fe-val', val]]); return d; };

    // «Se ayudan» en dibujo, a partir de su propio párrafo: una frase por especie (en orden) y una comparación de rapidez.
    // Si el párrafo no tiene esa forma, se muestra como texto, como antes.
    const nombres = especies.map(e => e.textContent.trim());
    const frases = parrafo.join(' ').split(/(?<=\p{Ll}\.)\s+(?=\p{Lu})/u).map(f => f.trim()).filter(Boolean);
    const sinNombre = (f, n) => { const k = f.indexOf(n); return k < 0 ? null : f.slice(k + n.length).replace(/^\s*/, '').replace(/\.$/, ''); };
    const pasos = nombres.length > 1 && frases.length >= 2 ? [sinNombre(frases[0], nombres[0]), sinNombre(frases[1], nombres[1])] : null;
    const rapidez = frases.find(f => /más rápido que solas/i.test(f));

    // Recorrido en zigzag (no en línea): COME → 1.ª especie (arriba) → 2.ª especie (abajo) → PRODUCE (arriba) → RESULTADO (abajo).
    const R = 84, RE = 96, d = 50, xCome = 140, x1 = 520, x2 = 670, xProd = 1110, xRes = 1470; // las dos especies se superponen: trabajan juntas
    nodo(xCome, cy, rotCome, valCome);
    const pos = [[x1, cy - d], [x2, cy + d]];
    especies.slice(0, 2).forEach((e, i) => {
      const [x, y] = nombres.length > 1 ? pos[i] : [630, cy];
      circulo(x, y, RE, i ? 'url(#feBacteria2)' : 'url(#feBacteria)');
      texto(x, y - 12, 180, 'fe-especie', [['', nombres[i]]]);
      if (pasos?.[i]) {
        // número del paso y lo que hace cada una, del lado de afuera del par
        const arriba = i === 0;
        texto(x, arriba ? y - RE - 64 : y + RE + 14, 300, 'fe-paso', [['fe-num', String(i + 1)], ['fe-que', pasos[i]]]);
      }
    });
    if (nombres.length > 1) {
      flecha(xCome + R + 12, cy, x1 - RE - 6, cy - d + 10, -10);
      // relevo de la 1.ª a la 2.ª: una curva por arriba, de un borde al otro
      flecha(x1 + RE * .87, cy - d - RE * .5, x2 + RE * .55, cy + d - RE * .83, 36);
      flecha(x2 + RE + 6, cy + d - 10, xProd - R - 10, cy - d + 10, 10);
    } else {
      flecha(xCome + R + 12, cy, 630 - RE - 10, cy); flecha(630 + RE + 10, cy, xProd - R - 10, cy - d + 10);
    }
    nodo(xProd, cy - d, rotProd, valProd);
    flecha(xProd + R + 10, cy - d + 10, xRes - R - 10, cy + d - 10, -10);
    nodo(xRes, cy + d, rotRes, valRes);

    // Juntas, más rápido: dos barras de duración. La de «solas» es larga y gris; la de «juntas», corta y con los dos colores.
    if (rotAyuda && rapidez && pasos) {
      const bx = x1 - 120, by = cy + d + RE + 150, largo = 360;
      texto(bx, by - 40, 640, 'fe-rot fe-rapidez', [['', (rotAyuda + ' · ' + rapidez.replace(/\.$/, '')).toUpperCase()]], 'left');
      el('rect', { x: bx + 76, y: by + 4, width: largo, height: 6, rx: 3, fill: '#0d0f17', 'fill-opacity': .18 });
      el('rect', { x: bx + 76, y: by + 34, width: largo * .45, height: 6, rx: 3, fill: 'url(#feJuntas)' });
      texto(bx, by - 4, 70, 'fe-barra', [['', 'Solas']], 'left');
      texto(bx, by + 26, 70, 'fe-barra', [['', 'Juntas']], 'left');
    } else if (rotAyuda) {
      const dd = texto(630, cy + d + RE + 40, 400, 'fe-ayudan', [['fe-rot', rotAyuda]]);
      const pp = document.createElement('p'); pp.textContent = parrafo.join(' '); dd.appendChild(pp);
    }
    cont.appendChild(caja);
  }
  // El lienzo de las pantallas de detalle se crea después de este script: se observa todo el documento.
  let pendiente = 0;
  new MutationObserver(() => { if (!pendiente) pendiente = requestAnimationFrame(() => { pendiente = 0; rehacer(); }); }).observe(document.body, { childList: true, subtree: true });
})();
