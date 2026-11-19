// ───────── Propuesta: «Qué produce o transforma» como cadena ─────────
// En el diseño actual PRODUCE y RESULTADO salen en paralelo de las especies y «SE AYUDAN» queda en la columna derecha.
// Esta propuesta lo lee en una sola línea, de izquierda a derecha: COME → especies (que se ayudan) → PRODUCE → RESULTADO.
// No agrega texto: toma rótulos, valores, especies y el párrafo de «SE AYUDAN» de la ficha ya armada y oculta el dibujo original.
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
      <radialGradient id="feBacteria"><stop offset="0" stop-color="#ff4c52" stop-opacity=".55"/><stop offset=".55" stop-color="#f58bc3" stop-opacity=".45"/><stop offset="1" stop-color="#f58bc3" stop-opacity="0"/></radialGradient></defs>`;
    caja.appendChild(svg);
    const circulo = (x, r, extra = '') => { const c = document.createElementNS(ns, 'circle'); c.setAttribute('cx', x); c.setAttribute('cy', cy); c.setAttribute('r', r); c.setAttribute('fill', 'none'); c.setAttribute('stroke', '#0d0f17'); c.setAttribute('stroke-opacity', '.3'); c.setAttribute('stroke-width', '1.5'); if (extra) c.setAttribute('fill', extra), c.removeAttribute('stroke'); svg.appendChild(c); };
    const flecha = (x1, x2) => { const l = document.createElementNS(ns, 'line'); l.setAttribute('x1', x1); l.setAttribute('y1', cy); l.setAttribute('x2', x2); l.setAttribute('y2', cy); l.setAttribute('stroke', '#0d0f17'); l.setAttribute('stroke-width', '1.5'); l.setAttribute('marker-end', 'url(#feFlecha)'); svg.appendChild(l); };
    const rotulo = (x, rot, val, ancho = 170) => { const d = document.createElement('div'); d.className = 'fe-nodo'; d.style.cssText = `left:${x - ancho / 2}px;top:${cy - 26}px;width:${ancho}px`; d.innerHTML = `<span class="fe-rot"></span><span class="fe-val"></span>`; d.children[0].textContent = rot; d.children[1].textContent = val; caja.appendChild(d); };

    // Posiciones en la grilla de 1920: COME | especies | PRODUCE | RESULTADO
    const xCome = 140, xPar = 600, sep = especies.length > 1 ? 92 : 0, xProd = 1090, xRes = 1470, R = 84, RE = 96;
    circulo(xCome, R); rotulo(xCome, rotCome, valCome);
    especies.slice(0, 2).forEach((e, i) => {
      const x = xPar + (i ? sep : -sep);
      circulo(x, RE, 'url(#feBacteria)');
      const d = document.createElement('div'); d.className = 'fe-especie'; d.style.cssText = `left:${x - 80}px;top:${cy - 12}px;width:160px`; d.textContent = e.textContent.trim(); caja.appendChild(d);
    });
    flecha(xCome + R + 12, xPar - sep - RE - 10);
    flecha(xPar + sep + RE + 10, xProd - R - 12);
    circulo(xProd, R); rotulo(xProd, rotProd, valProd);
    flecha(xProd + R + 12, xRes - R - 12);
    circulo(xRes, R); rotulo(xRes, rotRes, valRes);
    // «Se ayudan» entre las dos especies
    if (rotAyuda) {
      const d = document.createElement('div'); d.className = 'fe-ayudan'; d.style.cssText = `left:${xPar - 200}px;top:${cy + RE + 28}px;width:400px`;
      d.innerHTML = '<span class="fe-rot"></span><p></p>'; d.children[0].textContent = (especies.length > 1 ? '⇄  ' : '') + rotAyuda; d.children[1].textContent = parrafo.join(' ');
      caja.appendChild(d);
    }
    cont.appendChild(caja);
  }
  // El lienzo de las pantallas de detalle se crea después de este script: se observa todo el documento.
  let pendiente = 0;
  new MutationObserver(() => { if (!pendiente) pendiente = requestAnimationFrame(() => { pendiente = 0; rehacer(); }); }).observe(document.body, { childList: true, subtree: true });
})();
