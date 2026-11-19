// ───────── Niveles de BLUR y GRANO (19/11/2026) ─────────
// Todo el desenfoque y el grano del proyecto pasan por nueve niveles (variables CSS en :root y un multiplicador que leen los
// motores de canvas). Con los valores por defecto, todo se ve exactamente como antes.
// Con ?ajustes en la dirección aparece un panel para regularlos en la pantalla real; lo regulado se recuerda en este
// navegador (solo con ?ajustes) y se copia con «Copiar valores» para dejarlo fijo en el código (NIVELES_BASE de acá).
(() => {
  const NIVELES = [
    { id: 'blur-texto', nombre: 'Desenfoque · texto', min: 0, max: 3, paso: .05, unidad: 'px', base: 0, ayuda: 'Toda la tipografía (títulos, rótulos, párrafos, carteles).' },
    { id: 'blur-controles', nombre: 'Desenfoque · controles', min: 0, max: 3, paso: .05, unidad: 'px', base: 0, ayuda: 'Botones, pestañas y rótulos de TU PLACA y del menú.' },
    { id: 'vidrio', nombre: 'Desenfoque · vidrio de carteles', min: 0, max: 3, paso: .05, unidad: '×', base: 1, ayuda: 'Lo que se ve borroso detrás de cada cartel y su borde.' },
    { id: 'velos', nombre: 'Desenfoque · velos', min: 0, max: 3, paso: .05, unidad: '×', base: 1, ayuda: 'Barra de arriba, recuerdo, nombre, placas de otras personas, galería.' },
    { id: 'fondo', nombre: 'Desenfoque · fondos', min: 0, max: 2, paso: .05, unidad: '×', base: 1, ayuda: 'Apertura y fondos de los universos.', recarga: true },
    { id: 'colonias', nombre: 'Desenfoque · colonias', min: .2, max: 2.5, paso: .05, unidad: '×', base: 1, ayuda: 'Todas las colonias dibujadas (MUESTRAS, TU PLACA, fichas).', recarga: true },
    { id: 'grano-vidrio', nombre: 'Grano · carteles', min: 0, max: 3, paso: .05, unidad: '×', base: 1, ayuda: 'El grano del vidrio de los carteles y las pistas.' },
    { id: 'grano-fondo', nombre: 'Grano · fondos', min: 0, max: 3, paso: .05, unidad: '×', base: 1, ayuda: 'El grano de la apertura.' },
    { id: 'grano-colonias', nombre: 'Grano · colonias', min: 0, max: 3, paso: .05, unidad: '×', base: 1, ayuda: 'El grano dentro de cada colonia.', recarga: true }
  ];
  const CLAVE = 'micromundos-ajustes-blur-grano';
  const conPanel = new URLSearchParams(location.search).has('ajustes');
  const valores = Object.fromEntries(NIVELES.map(n => [n.id, n.base]));
  if (conPanel) { try { Object.assign(valores, JSON.parse(localStorage.getItem(CLAVE) || '{}')); } catch {} }
  const raiz = document.documentElement;
  const aplicar = id => { const n = NIVELES.find(x => x.id === id); raiz.style.setProperty('--nivel-' + id, n.unidad === 'px' ? valores[id] + 'px' : String(valores[id])); };
  NIVELES.forEach(n => aplicar(n.id));
  window.MicromundosAjustes = { valor: id => valores[id] ?? 1, niveles: NIVELES };
  if (!conPanel) return;

  const guardar = () => { try { localStorage.setItem(CLAVE, JSON.stringify(valores)); } catch {} };
  const armar = () => {
    const panel = document.createElement('aside'); panel.id = 'panelAjustes'; panel.setAttribute('aria-label', 'Ajustes de desenfoque y grano');
    panel.innerHTML = '<header><strong>BLUR Y GRANO</strong><button type="button" data-plegar aria-label="Plegar o desplegar el panel">–</button></header><div class="pa-cuerpo"></div>' +
      '<footer><button type="button" data-copiar>Copiar valores</button><button type="button" data-base>Restablecer</button><button type="button" data-recargar>Recargar</button></footer><p class="pa-nota" hidden></p>';
    const cuerpo = panel.querySelector('.pa-cuerpo'), nota = panel.querySelector('.pa-nota');
    for (const n of NIVELES) {
      const fila = document.createElement('label'); fila.className = 'pa-fila'; fila.title = n.ayuda;
      fila.innerHTML = `<span class="pa-nombre">${n.nombre}${n.recarga ? ' <i>↻</i>' : ''}</span><span class="pa-valor"></span><input type="range" min="${n.min}" max="${n.max}" step="${n.paso}">`;
      const rango = fila.querySelector('input'), salida = fila.querySelector('.pa-valor');
      const pintar = () => { rango.value = valores[n.id]; salida.textContent = (+valores[n.id]).toFixed(2) + ' ' + n.unidad; fila.classList.toggle('pa-cambiado', +valores[n.id] !== n.base); };
      rango.addEventListener('input', () => { valores[n.id] = +rango.value; aplicar(n.id); pintar(); guardar(); if (n.recarga) { nota.hidden = false; nota.textContent = '↻ Los niveles marcados se ven al tocar «Recargar».'; } });
      pintar(); fila._pintar = pintar; cuerpo.appendChild(fila);
    }
    panel.querySelector('[data-plegar]').addEventListener('click', () => panel.classList.toggle('plegado'));
    panel.querySelector('[data-recargar]').addEventListener('click', () => location.reload());
    panel.querySelector('[data-base]').addEventListener('click', () => { NIVELES.forEach(n => { valores[n.id] = n.base; aplicar(n.id); }); guardar(); cuerpo.querySelectorAll('.pa-fila').forEach(f => f._pintar()); });
    panel.querySelector('[data-copiar]').addEventListener('click', async () => {
      const texto = 'Niveles de blur y grano: ' + NIVELES.map(n => `${n.nombre} = ${(+valores[n.id]).toFixed(2)} ${n.unidad}`).join(' · ');
      try { await navigator.clipboard.writeText(texto); nota.textContent = 'Copiado. Pegámelo en el chat y lo dejo fijo.'; } catch { nota.textContent = texto; }
      nota.hidden = false;
    });
    // El panel no deja pasar toques a la pantalla (ni al modo dedo).
    for (const t of ['pointerdown', 'click', 'wheel']) panel.addEventListener(t, ev => ev.stopPropagation());
    document.body.appendChild(panel);
  };
  if (document.body) armar(); else document.addEventListener('DOMContentLoaded', armar);
})();
