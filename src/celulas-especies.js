// Células de cada especie para los carteles (19/11/2026, Paco: «tiene que tener la imagen de la célula, no de la colonia»).
// Mismo lenguaje que las tres ilustradas del diseño (cadena de cocos, levadura con brote, hifa): formas planas de un color,
// borde suave y grano. La disposición es la típica de cada especie al microscopio (cocos en cadena, en racimo o en tétradas,
// bacilos, levaduras con brote, estructuras de los mohos). Son interpretaciones gráficas para revisar, no fotografías.
const CELULAS_ESPECIES = {
  // Bacterias
  'Streptococcus thermophilus': 'cocosCadena',
  'Staphylococcus epidermidis': 'cocosRacimo',
  'Lactococcus lactis': 'cocosPares',
  'Enterococcus faecalis': 'cocosPares',
  'Leuconostoc mesenteroides': 'cocosPares',
  'Micrococcus luteus': 'cocosTetradas',
  'Lactobacillus delbrueckii subsp. bulgaricus': 'bacilosCadena',
  'Lactobacillus acidophilus': 'bacilosCadena',
  'Bacillus subtilis': 'bacilosCadena',
  'Lactiplantibacillus plantarum': 'bacilosPares',
  'Lactobacillus plantarum': 'bacilosPares',
  'Fructilactobacillus sanfranciscensis': 'bacilosPares',
  'Escherichia coli': 'bacilosSueltos',
  'Serratia marcescens': 'bacilosSueltos',
  'Acetobacter aceti': 'bacilosSueltos',
  'Komagataeibacter rhaeticus': 'bacilosSueltos',
  'Pseudomonas fluorescens': 'bacilosFlagelo',
  'Corynebacterium glutamicum': 'bacilosV',
  'Streptomyces coelicolor': 'filamentos',
  'Streptomyces griseus': 'filamentos',
  // Levaduras
  'Saccharomyces cerevisiae': 'ovoideBrote',
  'Saccharomyces pastorianus': 'ovoideBrote',
  'Kazachstania humilis': 'ovoideBrote',
  'Kluyveromyces lactis': 'ovoideBrote',
  'Kluyveromyces marxianus': 'ovoideBrote',
  'Rhodotorula mucilaginosa': 'ovoideBrote',
  'Torulaspora delbrueckii': 'redondaBrote',
  'Debaryomyces hansenii': 'redondaBrote',
  'Metschnikowia pulcherrima': 'redondaBrote',
  'Zygosaccharomyces rouxii': 'redondaBrote',
  'Pichia kudriavzevii': 'alargada',
  'Candida parapsilosis': 'alargada',
  'Brettanomyces bruxellensis': 'ojival',
  'Hanseniaspora uvarum': 'apiculada',
  'Malassezia restricta': 'botella',
  // Mohos
  'Penicillium roqueforti': 'penicilio',
  'Penicillium chrysogenum': 'penicilio',
  'Penicillium digitatum': 'penicilio',
  'Penicillium camemberti': 'penicilio',
  'Penicillium verrucosum': 'penicilio',
  'Penicillium sp.': 'penicilio',
  'Aspergillus oryzae': 'aspergilo',
  'Aspergillus niger': 'aspergilo',
  'Rhizopus stolonifer': 'esporangioRizoides',
  'Mucor racemosus': 'esporangioRamificado',
  'Alternaria alternata': 'alternaria',
  'Cladosporium herbarum': 'cladosporio',
  'Botrytis cinerea': 'botritis',
  'Trichoderma viride': 'trichoderma',
  'Fusarium oxysporum': 'fusarium',
  'Geotrichum candidum': 'artroconidios'
};
const COLOR_CELULAS = { B: '#ec6ea6', L: '#e7ae2c', M: '#a8b88f' };

function dibujarCelulaEspecie(canvas, nombre, grupo) {
  const W = 1140, H = 708; canvas.width = W; canvas.height = H;
  const c = canvas.getContext('2d'); if (!c) return;
  const g = grupo === 'L' || grupo === 'M' ? grupo : 'B';
  const forma = CELULAS_ESPECIES[nombre] || { B: 'bacilosSueltos', L: 'ovoideBrote', M: 'penicilio' }[g];
  let semilla = [...nombre].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) >>> 0, 7);
  const azar = () => ((semilla = (Math.imul(1664525, semilla) + 1013904223) >>> 0) / 4294967296);
  const cx = W / 2, cy = H / 2;
  c.fillStyle = c.strokeStyle = COLOR_CELULAS[g];
  c.lineCap = 'round'; c.lineJoin = 'round';
  const circulo = (x, y, r) => { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); };
  const ovalo = (x, y, rx, ry, a = 0) => { c.beginPath(); c.ellipse(x, y, rx, ry, a, 0, Math.PI * 2); c.fill(); };
  const tubo = (pts, ancho) => { c.lineWidth = ancho; c.beginPath(); c.moveTo(...pts[0]); for (const p of pts.slice(1)) c.lineTo(...p); c.stroke(); };
  const bacilo = (x, y, largo, ancho, a) => { const dx = Math.cos(a) * (largo - ancho) / 2, dy = Math.sin(a) * (largo - ancho) / 2; tubo([[x - dx, y - dy], [x + dx, y + dy]], ancho); };
  const linea = (pts, ancho = 4) => tubo(pts, ancho);
  const cadenaEsporas = (x, y, a, n, r) => { for (let i = 0; i < n; i++) circulo(x + Math.cos(a) * i * r * 1.9, y + Math.sin(a) * i * r * 1.9, r * (1 - i * .06)); };
  const dibujos = {
    cocosCadena() { for (let i = 0; i < 9; i++) { const t = i / 8; circulo(cx - 40 + Math.sin(t * 2.2) * 90, cy - 190 + t * 380, 33); } },
    cocosRacimo() { const r = 34; const pos = [[0, 0], [1, 0], [-1, 0], [.5, .87], [-.5, .87], [.5, -.87], [-.5, -.87], [1.5, .87], [0, 1.74], [-1.5, -.87], [1, -1.74]];
      for (const [x, y] of pos) if (azar() > .08) circulo(cx + x * r * 2 + (azar() - .5) * 8, cy + y * r * 2 * .98 + (azar() - .5) * 8, r); },
    cocosPares() { const grupos = [[cx - 220, cy - 90, .4, 2], [cx + 30, cy - 40, -.3, 4], [cx - 120, cy + 140, 1.2, 2], [cx + 250, cy + 120, .2, 3]];
      for (const [x, y, a, n] of grupos) for (let i = 0; i < n; i++) ovalo(x + Math.cos(a) * i * 66, y + Math.sin(a) * i * 66, 36, 31, a); },
    cocosTetradas() { const r = 33; for (const [x, y] of [[cx - 150, cy - 50], [cx + 140, cy + 60]]) for (const [i, j] of [[0, 0], [1, 0], [0, 1], [1, 1]]) circulo(x + i * r * 2, y + j * r * 2, r); },
    bacilosCadena() { const a = -.35; for (let i = 0; i < 4; i++) bacilo(cx - 300 * Math.cos(a) + i * 200 * Math.cos(a), cy - 300 * Math.sin(a) + i * 200 * Math.sin(a), 188, 46, a); },
    bacilosPares() { for (const [x, y, a] of [[cx - 200, cy - 110, .5], [cx + 120, cy - 40, -.4], [cx - 40, cy + 150, .1]]) for (let i = 0; i < 2; i++) bacilo(x + Math.cos(a) * i * 112, y + Math.sin(a) * i * 112, 106, 44, a); },
    bacilosSueltos() { for (const [x, y, a] of [[cx - 220, cy - 100, .6], [cx + 140, cy - 140, -.2], [cx + 30, cy + 130, 1.1], [cx - 260, cy + 160, -.5]]) bacilo(x, y, 128, 52, a); },
    bacilosFlagelo() { for (const [x, y, a] of [[cx - 170, cy - 60, .3], [cx + 160, cy + 80, -.5]]) { bacilo(x, y, 150, 50, a);
      const ex = x + Math.cos(a) * 75, ey = y + Math.sin(a) * 75, pts = []; for (let k = 0; k <= 30; k++) { const s = k * 7; pts.push([ex + Math.cos(a) * s - Math.sin(a) * Math.sin(k * .7) * 12, ey + Math.sin(a) * s + Math.cos(a) * Math.sin(k * .7) * 12]); } linea(pts, 5); } },
    bacilosV() { for (const [x, y, a] of [[cx - 150, cy, .5], [cx + 140, cy - 20, -.6]]) { bacilo(x - Math.cos(a + .55) * 55, y - Math.sin(a + .55) * 55, 120, 44, a + .55); bacilo(x - Math.cos(a - .55) * 55, y - Math.sin(a - .55) * 55, 120, 44, a - .55); } },
    filamentos() { const rama = (x, y, a, largo, nivel) => { const x2 = x + Math.cos(a) * largo, y2 = y + Math.sin(a) * largo; linea([[x, y], [(x + x2) / 2 + Math.sin(a) * 10, (y + y2) / 2 - Math.cos(a) * 10], [x2, y2]], 18);
      if (nivel > 0) { rama(x + Math.cos(a) * largo * .55, y + Math.sin(a) * largo * .55, a - .7, largo * .6, nivel - 1); rama(x2, y2, a + .35, largo * .55, nivel - 1); } else cadenaEsporas(x2 + Math.cos(a) * 18, y2 + Math.sin(a) * 18, a, 4, 13); };
      rama(cx - 340, cy + 150, -.35, 300, 2); },
    ovoideBrote() { ovalo(cx - 20, cy - 10, 120, 150, -.5); ovalo(cx + 105, cy + 135, 62, 70, -.5); },
    redondaBrote() { circulo(cx - 20, cy - 10, 130); circulo(cx + 120, cy + 120, 58); },
    alargada() { ovalo(cx - 60, cy, 80, 185, .9); ovalo(cx + 165, cy + 125, 42, 80, .9); },
    ojival() { c.beginPath(); const x = cx - 30, y = cy, l = 200, a = 85; c.moveTo(x - l, y); c.quadraticCurveTo(x, y - a * 2, x + l, y); c.quadraticCurveTo(x, y + a * 2, x - l, y); c.fill(); ovalo(x + 190, y + 80, 45, 38, .4); },
    apiculada() { ovalo(cx, cy, 175, 112, 0); ovalo(cx - 180, cy, 32, 28, 0); ovalo(cx + 180, cy, 32, 28, 0); },
    botella() { circulo(cx - 40, cy + 20, 130); ovalo(cx + 105, cy - 80, 70, 58, -.6); },
    penicilio() { const bx = cx - 40, by = cy + 230, tope = cy - 30; linea([[bx - 220, by + 20], [bx, by], [bx, tope]], 26);
      for (const a of [-1.95, -1.57, -1.2]) { const mx = bx + Math.cos(a) * 70, my = tope + Math.sin(a) * 70; linea([[bx, tope], [mx, my]], 20);
        for (const b of [-.25, .25]) { const fx = mx + Math.cos(a + b) * 50, fy = my + Math.sin(a + b) * 50; linea([[mx, my], [fx, fy]], 14); cadenaEsporas(fx + Math.cos(a + b) * 20, fy + Math.sin(a + b) * 20, a + b, 4, 14); } } },
    aspergilo() { const bx = cx - 20, by = cy + 250, vx = cx - 20, vy = cy - 40; linea([[bx - 180, by + 30], [bx, by], [vx, vy + 60]], 26); circulo(vx, vy, 66);
      for (let k = 0; k < 11; k++) { const a = -Math.PI + .25 + k * (Math.PI - .5) / 10; cadenaEsporas(vx + Math.cos(a) * 82, vy + Math.sin(a) * 82, a, 4, 13); } },
    esporangioRizoides() { const bx = cx, by = cy + 220; linea([[bx, by], [bx + 10, cy - 60]], 22); circulo(bx + 10, cy - 130, 100);
      for (const a of [2.1, 2.6, 1.6, 1.1]) linea([[bx, by], [bx + Math.cos(a) * 70, by + Math.sin(a) * 50], [bx + Math.cos(a) * 110, by + Math.sin(a) * 80 + 10]], 10);
      linea([[bx, by], [bx - 320, by - 30]], 18); },
    esporangioRamificado() { const bx = cx - 60, by = cy + 260; linea([[bx, by], [bx, cy - 40]], 22); circulo(bx, cy - 105, 82);
      linea([[bx, cy + 110], [bx + 150, cy - 10]], 18); circulo(bx + 175, cy - 60, 60); linea([[bx, cy + 30], [bx - 130, cy - 40]], 16); circulo(bx - 150, cy - 80, 46); },
    alternaria() { const a = -.9; let x = cx - 150, y = cy + 190; linea([[x - 120, y + 60], [x, y]], 20);
      for (let i = 0; i < 4; i++) { const largo = 100 - i * 8; c.save(); c.translate(x + Math.cos(a) * largo / 2, y + Math.sin(a) * largo / 2); c.rotate(a); c.beginPath(); c.moveTo(-largo / 2, 0);
        c.quadraticCurveTo(-largo / 2, -30, 0, -32); c.quadraticCurveTo(largo / 2, -26, largo / 2 + 14, 0); c.quadraticCurveTo(largo / 2, 26, 0, 32); c.quadraticCurveTo(-largo / 2, 30, -largo / 2, 0); c.fill(); c.restore();
        x += Math.cos(a) * (largo + 22); y += Math.sin(a) * (largo + 22); if (i < 3) linea([[x - Math.cos(a) * 22, y - Math.sin(a) * 22], [x, y]], 9); } },
    cladosporio() { const bx = cx - 40, by = cy + 240; linea([[bx - 200, by + 20], [bx, by], [bx + 10, cy]], 20);
      const cadena = (x, y, a, n) => { for (let i = 0; i < n; i++) { x += Math.cos(a) * 44; y += Math.sin(a) * 44; ovalo(x, y, 24, 15, a); } return [x, y]; };
      const [x1, y1] = cadena(bx + 10, cy, -1.7, 3); cadena(x1, y1, -2.3, 3); cadena(x1, y1, -1.1, 3); cadena(bx + 10, cy, -1.05, 2); },
    botritis() { const bx = cx - 40, by = cy + 260; linea([[bx - 200, by + 20], [bx, by], [bx, cy - 20]], 22);
      for (const [a, l] of [[-2.3, 130], [-1.57, 110], [-.8, 130]]) { const x = bx + Math.cos(a) * l, y = cy - 20 + Math.sin(a) * l; linea([[bx, cy - 20], [x, y]], 14);
        for (let k = 0; k < 7; k++) { const b = a + (k - 3) * .38; ovalo(x + Math.cos(b) * 42, y + Math.sin(b) * 42, 22, 16, b); } } },
    trichoderma() { const bx = cx - 20, by = cy + 260; linea([[bx - 200, by + 20], [bx, by], [bx, cy - 160]], 20);
      for (const [h, lado] of [[cy + 120, 1], [cy + 30, -1], [cy - 60, 1], [cy - 140, -1]]) { const x = bx + lado * 110, y = h - 70; linea([[bx, h], [x, y]], 13); circulo(x + lado * 22, y - 18, 30); }
      circulo(bx, cy - 190, 32); },
    fusarium() { for (const [x, y, a] of [[cx - 160, cy - 80, .2], [cx + 140, cy + 40, -.3], [cx - 60, cy + 170, .5]]) { c.save(); c.translate(x, y); c.rotate(a); c.beginPath();
      c.moveTo(-170, 10); c.quadraticCurveTo(0, -95, 170, 10); c.quadraticCurveTo(0, -40, -170, 10); c.fill(); c.restore(); } },
    artroconidios() { const a = -.25; for (let i = 0; i < 5; i++) { const x = cx - 360 + i * 150 * Math.cos(a), y = cy + 60 + i * 150 * Math.sin(a); c.save(); c.translate(x, y); c.rotate(a);
      c.beginPath(); c.roundRect(-65, -40, 130, 80, 22); c.fill(); c.restore(); } }
  };
  (dibujos[forma] || dibujos.bacilosSueltos)();
  // Grano: puntos claros y oscuros muy tenues sobre lo pintado. El borde suave lo da el desenfoque del canvas.
  const datos = c.getImageData(0, 0, W, H), d = datos.data;
  for (let i = 0; i < d.length; i += 4) if (d[i + 3]) { const n = (azar() - .5) * 26; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
  c.putImageData(datos, 0, 0);
  canvas.style.filter = 'blur(1.6px)';
}
// Para revisar todas juntas desde la consola o una hoja de prueba.
window.MicromundosCelulas = { formas: CELULAS_ESPECIES, dibujar: dibujarCelulaEspecie };
