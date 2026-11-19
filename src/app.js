// ───────── Placa de la colección · lógica ─────────
// La estructura es la de Paco: las dos recetas (A y B) superpuestas en una caja de 817 px.
// Cada elemento de las recetas se reemplaza por una muestra con la codificación nueva,
// conservando la ubicación de su centro y su tamaño.
// Paco amplía la placa hacia abajo. Se conserva la proporción de la composición original.
const AMPLIACION_PLACA = 1.12;
const ESCALA_FIGMA = 1.25 * AMPLIACION_PLACA;
const S = 817 * ESCALA_FIGMA;
const RADIO_VINCULOS = 345 * AMPLIACION_PLACA;
const C = { x: 860.5, y: 539.5 + RADIO_VINCULOS - 345 }; // mantiene el borde superior y crece hacia abajo
const TAU = 0.6;                             // curvatura de la escala logarítmica (años)
const RADIO_PLACA = 0.76 * 0.85 * S / 2;     // borde verde de la placa (el anillo grande de las recetas)
const R_VISIBLE = RADIO_PLACA - 30, R_FUNDIDO = 40;   // las muestras se desvanecen al llegar al borde de la placa
const N_MAX = 300;                           // techo de colonias ("más de 300")
const WF = 0.6;                              // la pieza ocupa el 60 % de su canvas (aire para halo y desenfoque)
const NOW = HOY.y + (HOY.m - 1) / 12 + HOY.d / 365;
const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const GRUPO_NOMBRE = { B:'Bacterias', L:'Levaduras', M:'Mohos', BL:'Bacterias y levaduras', BM:'Bacterias y mohos', LM:'Levaduras y mohos', BLM:'Bacterias, levaduras y mohos' };
const ESTADO_NOMBRE = { A:'Activa', C:'En conservación', MO:'Montada', R:'Registro digital' };
const ESTADO_NOTA = { MO:'En resina, como objeto de exhibición', R:'Se conservan fotos y notas; la muestra física ya no está' };
const CHIP = { B:'#ff4c52', L:'#ffc21c', M:'#6a983a' };

// azar con semilla: siempre la misma placa
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const rnd = mulberry(20261113);
const R = (a,b) => a + (b-a)*rnd();
const clamp = (x,a=0,b=1) => Math.min(b, Math.max(a, x));
const quitarTildes = s => s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
const barajar = arr => { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rnd()*(i+1)); [a[i],a[j]] = [a[j],a[i]]; } return a; };

// ───────── 1 · leer las recetas de Paco ─────────
// tipos: 'placa' (el anillo grande), 'halo' (manchas difusas de atmósfera),
//        'aro' (anillo concéntrico a una colonia grande), 'muestra' (todo lo demás)
const piezas = [];
for (const capa of ['A','B']) {
  const its = RECETAS[capa].items;
  const grandes = its.filter(it => it.name !== 'Anillo' && it.w > .15 && it.style.blur < 40);
  its.forEach(it => {
    const st = it.style;
    let tipo = 'muestra';
    if (it.w >= .5) tipo = 'placa';
    else if (st.blur >= 40) tipo = 'halo';
    else if (it.name === 'Anillo' && grandes.some(g => Math.hypot(g.x - it.x, g.y - it.y) < .004)) tipo = 'aro';
    const dx = (it.x - .5) * S, dy = (it.y - .5) * S;
    piezas.push({ capa, it, tipo, r0: Math.hypot(dx, dy), ang: Math.atan2(dy, dx),
      w: it.w * S, d: it.w * S * st.size / 100, lado: it.w * S / WF, x:0, y0:0, r:0, vis:1 });
  });
}
const muestras = piezas.filter(p => p.tipo === 'muestra');

// ───────── 2 · deducir los datos de cada muestra desde su lugar y su tamaño ─────────
const R0_MAX = Math.max(...muestras.map(s => s.r0));
const K0 = R0_MAX / Math.log(1 + (NOW - FECHA_MAS_VIEJA) / TAU);   // escala con la que la placa se ve como en la receta
const D_MIN = Math.min(...muestras.map(s => s.d)), D_MAX = Math.max(...muestras.map(s => s.d));

function estadoAlAzar(edad){
  const p = edad < 1 ? [.72,.12,.11,.05] : edad < 3 ? [.42,.26,.20,.12] : edad < 8 ? [.15,.33,.27,.25] : [.05,.30,.30,.35];
  let u = rnd(), k = 0; while (k < 3 && u > p[k]) { u -= p[k]; k++; }
  return ['A','C','MO','R'][k];
}

for (const s of muestras) {
  const st = s.it.style;
  s.grupo = PALETA_GRUPO[st.c1 + st.c2 + st.c3] || 'B';
  // fecha: inversa de r = K · ln(1 + edad / TAU)
  s.edad = Math.max(0.02, TAU * (Math.exp(s.r0 / K0) - 1));
  s.fecha = NOW - s.edad;
  s.y = Math.floor(s.fecha); s.m = Math.min(12, Math.floor((s.fecha - s.y) * 12) + 1);
  // colonias: inversa de d = dMin + (dMax − dMin) · ln(n) / ln(nMax)
  const t = (s.d - D_MIN) / (D_MAX - D_MIN);
  s.colonias = t >= .985 ? N_MAX + 1 : Math.max(1, Math.round(Math.exp(Math.log(N_MAX) * t)));
  // Las muestras mixtas necesitan al menos una colonia de cada grupo.
  if (s.grupo === 'BL' && s.colonias === 1) s.colonias = 2;
  // estado: la forma original como pista, el resto al azar según la antigüedad
  s.estado = s.it.name === 'Anillo' ? 'R' : (st.irregularity >= 20 ? 'C' : estadoAlAzar(s.edad));
  if (s.estado === 'R' && t > .6) s.estado = 'MO';   // las manchas grandes sostienen la estructura: sin anillos gigantes
  s.nota = s.estado === 'C' ? METODOS[Math.floor(rnd() * METODOS.length)] : '';
}

// nombres y códigos (por grupo, sin repetir mientras alcancen)
(function nombrar(){
  const conectores = new Set(['de','del','la','el','en','con','a','y']);
  const sigla = o => {
    const p = quitarTildes(o).toUpperCase().split(/\s+/);
    if (p.length >= 3) return p.slice(0,3).map(x => x[0]).join('');
    if (p.length === 2) return conectores.has(p[0].toLowerCase()) ? p[1].slice(0,3) : p[0][0] + p[1].slice(0,2);
    return p[0].slice(0,3);
  };
  const pilas = {}, usados = new Set();
  for (const s of [...muestras].sort((a,b) => a.fecha - b.fecha)) {
    if (!pilas[s.grupo] || !pilas[s.grupo].length) pilas[s.grupo] = barajar(ORIGENES[s.grupo]);
    s.origen = pilas[s.grupo].pop();
    let n; do { n = Math.floor(R(1, 320)); } while (usados.has(s.grupo + n));
    usados.add(s.grupo + n);
    s.codigo = `${s.grupo}-${String(n).padStart(3,'0')}-${sigla(s.origen)}`;
  }
})();

// ───────── 3 · estilo de cada muestra: el elemento de Paco con el contorno de su estado ─────────
// Aros señalados por Paco en el muestrario: engrosar la forma, conservando su color y textura.
const AROS_REFORZADOS = new Set(['L-284-PDL','B-067-CDD','L-115-CAR','L-175-MOR','L-199-URO',
  'B-038-MAN','L-230-SID','B-199-SDZ','B-046-GDB','L-279-SDJ']);
function estiloMuestra(s){
  const e = { ...s.it.style };          // mismo relleno, desenfoque, grano, opacidad y semilla que en la receta
  e.studyLobes = 0; e.asym = 0;
  if (e.shape === 'pair' || e.shape === 'ring') e.shape = 'disk';
  if (s.estado === 'A')  { e.irregularity = R(0, 4); }
  if (s.estado === 'C')  { e.irregularity = R(48, 72); e.asym = R(.5, 1); }
  if (s.estado === 'MO') { e.studyLobes = Math.round(R(13, 19)); e.studyDepth = R(20, 34); e.studyUneven = R(45, 75); e.irregularity = R(0, 2); }
  if (s.estado === 'R')  { e.shape = 'ring'; e.ringWidth = R(18, 28); e.irregularity = R(4, 12); }
  if (s.estado === 'R' && AROS_REFORZADOS.has(s.codigo)) e.ringWidth = 42;
  return e;
}

// ───────── zoom ─────────
const K_MIN = K0 * 0.8, K_MAX = K0 * 6;
let zoomT = Math.log(K0 / K_MIN) / Math.log(K_MAX / K_MIN);        // arranca exactamente como la receta
const kDe = t => K_MIN * Math.pow(K_MAX / K_MIN, t);
const radio = (edad, K) => K * Math.log(1 + edad / TAU);

// ───────── escenario ─────────
const $ = id => document.getElementById(id);
const stage = $('stage'), pantalla = $('screen');
// El diseño es de 1920 × 1100. Se escala para que entre entero y el marco se estira hasta los bordes de la
// pantalla: DX y DY son lo que sobra en ancho y alto (en px de diseño). La izquierda queda a la izquierda,
// la placa centrada, la columna derecha pegada a la derecha y los títulos de abajo pegados abajo.
let escala = 1, DX = 0, DY = 0;
function ajustar(){
  escala = Math.min(innerWidth/1920, innerHeight/1100);
  DX = Math.max(0, innerWidth/escala - 1920); DY = Math.max(0, innerHeight/escala - 1100);
  stage.style.width = (1920 + DX) + 'px'; stage.style.height = (1100 + DY) + 'px';
  stage.style.transform = `translate(-50%,-50%) scale(${escala})`;
  // la capa de los carteles copia el escenario (tamaño, escala y corrimiento del grupo central)
  const capaC = $('capaCarteles');
  capaC.style.width = stage.style.width; capaC.style.height = stage.style.height; capaC.style.transform = stage.style.transform;
  $('anclaCarteles').style.left = DX/2 + 'px'; $('anclaCarteles').style.top = DY/2 + 'px';
  $('centro').style.left = DX/2 + 'px';  $('centro').style.top = DY/2 + 'px';
  $('derecha').style.left = DX + 'px';
  $('derAbajo').style.top = DY + 'px';   $('izqAbajo').style.top = DY + 'px';
  $('cabecera').style.width = (1841 + DX) + 'px';
  $('lista').style.height = '614px';   // fijo: termina a la altura de CÓMO LEER LA PLACA (no crece con la pantalla)
}
ajustar();

const obras = [];   // todas las instancias de Colonias (para redibujar al cambiar el tamaño)
function receta(items){ return { version:2, mode:'piece', customRatio:1, paper:{ background:'#fffbee', transparent:true }, groups:[], items }; }
function pieza(estilo, w = WF){ return receta([{ id:1, type:'shape', name:'Muestra', x:.5, y:.5, w, style:estilo }]); }

// cada elemento de cada receta, en el mismo orden de capas que en la receta
for (const p of piezas) {
  const el = document.createElement('div'); el.className = 'it ' + p.tipo;
  el.style.width = el.style.height = p.lado + 'px';
  const mi = document.createElement('div'); mi.className = 'mi';
  const cv = document.createElement('canvas');
  mi.appendChild(cv); el.appendChild(mi); $('capa' + p.capa).appendChild(el);
  p.el = el; p.mi = mi; p.capaEl = $('capa' + p.capa);
  if (p.tipo === 'muestra') p.estilo = estiloMuestra(p);
  obras.push(mountColonias(cv, { recipe: pieza(p.tipo === 'muestra' ? p.estilo : p.it.style) }));
}

// íconos de la leyenda (también con Colonias, con el mismo carácter que las muestras)
const BASE = { ...RECETAS.A.items.find(i => i.id === 916)?.style || muestras[0].it.style, opacity:100, blur:12, core:78, irregularity:2, filaments:0, studyLobes:0, asym:0 };
const GRIS = { c1:'#8a7779', c2:'#a89597', c3:'#9c8889' };
const iconos = {
  B: { ...BASE, c1:'#ff4c52', c2:'#f58bc3', c3:'#fffbee', seed:31 },
  M: { ...BASE, c1:'#27633f', c2:'#6a983a', c3:'#dce642', seed:57 },
  L: { ...BASE, c1:'#ff9c20', c2:'#ffc21c', c3:'#fffbee', seed:12 },
  A: { ...BASE, ...GRIS },
  C: { ...BASE, ...GRIS, irregularity:62, asym:.8 },
  MO:{ ...BASE, ...GRIS, studyLobes:16, studyDepth:28, studyUneven:60 },
  R: { ...BASE, ...GRIS, shape:'ring', ringWidth:24, irregularity:7 },
};
document.querySelectorAll('.item').forEach(it => {
  const k = it.dataset.g || it.dataset.e;
  obras.push(mountColonias(it.querySelector('canvas'), { recipe: pieza(iconos[k], .82) }));
});

// aros de años: dos canvas (brillo y línea) que se redibujan con el zoom, hasta el borde de la placa.
// Cada año tiene un rango (cada 50, 10, 5 o 1 año) y aparece con un fundido según el espacio que le queda
// hasta el aro siguiente de su rango: así entran y salen de a uno y de a poco, sin saltos.
const capaAros = $('aros'), capaEtq = $('etqs');
const LADO_AROS = Math.ceil(RADIO_PLACA * 2 + 40), RES_AROS = 2;
const cvGlow = document.createElement('canvas'), cvLinea = document.createElement('canvas');
cvGlow.className = 'aros glow'; cvLinea.className = 'aros linea';
for (const cv of [cvGlow, cvLinea]) {
  cv.width = cv.height = LADO_AROS * RES_AROS;
  cv.style.cssText = `left:${C.x - LADO_AROS/2}px;top:${C.y - LADO_AROS/2}px;width:${LADO_AROS}px;height:${LADO_AROS}px`;
  capaAros.appendChild(cv);
}
const aros = [];
for (let y = HOY.y; y >= 1800; y--) {
  const paso = y % 50 === 0 ? 50 : y % 10 === 0 ? 10 : y % 5 === 0 ? 5 : 1;
  const e = document.createElement('div'); e.className = 'etq'; e.style.display = 'none';
  e.innerHTML = `<div class="pop"></div><div class="txt">${y}</div>`;
  capaEtq.appendChild(e);
  aros.push({ y, paso, edad: NOW - y, e, pop:e.querySelector('.pop'), texto:e.querySelector('.txt') });
}
const suave = x => { x = clamp(x); return x*x*(3-2*x); };
let entradaAros = 0, animEntradaAros = 0;
function animarEntradaAros(){
  cancelAnimationFrame(animEntradaAros);
  const reducido=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const inicio=performance.now();
  const paso=ahora=>{
    entradaAros=reducido?1:clamp((ahora-inicio)/1900);
    dibujarAros(kDe(zoomT));
    if(entradaAros<1)animEntradaAros=requestAnimationFrame(paso);
  };
  paso(inicio);
}
function dibujarAros(K){
  const g = cvGlow.getContext('2d'), l = cvLinea.getContext('2d'), o = LADO_AROS / 2;
  const enc=encuadreEsquema();
  for(const cv of [cvGlow,cvLinea])Object.assign(cv.style,{left:(enc.x-LADO_AROS*enc.k/2)+'px',top:(enc.y-LADO_AROS*enc.k/2)+'px',width:(LADO_AROS*enc.k)+'px',height:(LADO_AROS*enc.k)+'px'});
  for (const c of [g, l]) { c.setTransform(RES_AROS,0,0,RES_AROS,0,0); c.clearRect(0, 0, LADO_AROS, LADO_AROS); c.strokeStyle = '#fff'; }
  g.lineWidth = 3; g.setLineDash([9, 9]);
  l.lineWidth = .7; l.setLineDash([4, 3]);
  for (const a of aros) {
    const r = radio(a.edad, K);
    let op = 0, opE = 0;
    if (r > 18 && r < RADIO_PLACA) {
      const espacio = radio(a.edad + a.paso, K) - r;          // distancia al aro siguiente de su rango
      op  = suave((espacio - 16) / 16) * suave((RADIO_PLACA - 6 - r) / 22);
      opE = op * suave((espacio - 28) / 12) * suave((RADIO_PLACA - 34 - r) / 24);   // la etiqueta pide más aire
    }
    const entrada=suave((entradaAros*1.5-r/RADIO_PLACA*.55)/.95);
    op*=entrada; opE*=entrada;
    const radioEntrada=r*(.12+.88*entrada);
    if (op > .01) {
      for (const c of [g, l]) { c.globalAlpha = op; c.beginPath(); c.arc(o, o, radioEntrada, 0, Math.PI*2); c.stroke(); }
    }
    if (opE > .01) {
      a.e.style.display = ''; a.e.style.opacity = '1';
      // El texto mezcla con el fondo; fundir su padre lo aísla y lo blanquea.
      a.pop.style.opacity = opE.toFixed(3);
      a.texto.style.opacity = (.8*opE).toFixed(3);
      const p=puntoEsquema(C.x+radioEntrada*Math.SQRT1_2,C.y-radioEntrada*Math.SQRT1_2);
      a.e.style.transform = `translate(${p.x.toFixed(1)}px,${p.y.toFixed(1)}px) scale(${enc.k})`;
    } else if (a.e.style.display !== 'none') a.e.style.display = 'none';
  }
}

// arco del zoom (concéntrico con la placa)
const A0 = -35, A1 = 35, RZ = RADIO_PLACA + 55;
const svg = $('zoomSvg');
(function dibujarArco(){
  const p = a => [C.x + RZ*Math.cos(a*Math.PI/180), C.y + RZ*Math.sin(a*Math.PI/180)];
  const [x0,y0] = p(A0), [x1,y1] = p(A1);
  const punta = a => {                      // remate: línea corta perpendicular al arco (cruza el trazo)
    const L = 9, r = a*Math.PI/180, c = Math.cos(r), s = Math.sin(r);
    return `M${C.x + (RZ-L)*c},${C.y + (RZ-L)*s} L${C.x + (RZ+L)*c},${C.y + (RZ+L)*s}`;
  };
  // + y −: del mismo tamaño y trazo que el arco, como continuación del arco más allá de cada remate,
  // girados según la curva (el trazo del − va en la dirección del radio, paralelo al remate)
  const SIG = 6, SEP = 4.2;                 // medio largo del signo (px) y separación desde el remate (grados)
  const [mx, my] = p(A0 - SEP), [nx, ny] = p(A1 + SEP);
  const trazo = (x, y, a, eje) => {         // eje 'r' = dirección del radio, 't' = tangente al arco
    const r = a*Math.PI/180, dx = eje === 'r' ? Math.cos(r) : -Math.sin(r), dy = eje === 'r' ? Math.sin(r) : Math.cos(r);
    return `M${x - dx*SIG},${y - dy*SIG} L${x + dx*SIG},${y + dy*SIG}`;
  };
  const signos = trazo(mx, my, A0 - SEP, 'r') + trazo(mx, my, A0 - SEP, 't') + trazo(nx, ny, A1 + SEP, 'r');
  for (const [id, x, y] of [['zMas', mx, my], ['zMenos', nx, ny]]) { $(id).style.left = x + 'px'; $(id).style.top = y + 'px'; }
  svg.innerHTML = `<circle id="zoomCentro" cx="${C.x+RZ}" cy="${C.y}" r="2" fill="#fff"/>
    <path id="zoomLinea" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
    <g id="zoomRemates" fill="none" stroke="#fff" stroke-width="2"><path d="${punta(A0)}"/><path d="${punta(A1)}"/></g>
    <path id="zoomSignos" d="${signos}" fill="none" stroke="#fff" stroke-width="2"/>
    <circle id="zoomManija" r="8" fill="#fff"/>
    <path id="zoomToque" d="M${x0},${y0} A${RZ},${RZ} 0 0 1 ${x1},${y1}" fill="none" stroke="transparent" stroke-width="80" style="pointer-events:stroke;cursor:grab" data-ui/>`;
})();
const manija = $('zoomManija');
let progresoArco = 0, animArco = 0;
function pintarArcoZoom(){
  const enc=encuadreEsquema();
  svg.style.transform=`translate(${enc.x-C.x*enc.k}px,${enc.y-C.y*enc.k}px) scale(${enc.k})`;
  for(const [id,angulo] of [['zMas',A0-4.2],['zMenos',A1+4.2]]){
    const a=angulo*Math.PI/180;
    $(id).style.left=(enc.x+RZ*enc.k*Math.cos(a))+'px';
    $(id).style.top=(enc.y+RZ*enc.k*Math.sin(a))+'px';
  }
  const abrir=suave((progresoArco-.1)/.6);
  const medio=(A0+A1)/2, semiarco=(A1-A0)/2*abrir;
  const punto=a=>[C.x+RZ*Math.cos(a*Math.PI/180),C.y+RZ*Math.sin(a*Math.PI/180)];
  const [x0,y0]=punto(medio-semiarco),[x1,y1]=punto(medio+semiarco);
  $('zoomLinea').setAttribute('d',abrir>0?`M${x0},${y0} A${RZ},${RZ} 0 0 1 ${x1},${y1}`:`M${x0},${y0} L${x0},${y0}`);
  svg.style.opacity=suave(progresoArco/.1).toFixed(3);
  $('zoomCentro').style.opacity=(1-suave((progresoArco-.22)/.25)).toFixed(3);
  $('zoomRemates').style.opacity=suave((progresoArco-.7)/.1).toFixed(3);
  $('zoomSignos').style.opacity=suave((progresoArco-.8)/.2).toFixed(3);
  manija.style.opacity=suave((progresoArco-.7)/.1).toFixed(3);
  const disponible=vista==='placa'&&progresoArco===1;
  $('zoomToque').style.pointerEvents=disponible?'stroke':'none';
  for(const id of ['zMas','zMenos']){
    $(id).style.pointerEvents=disponible?'auto':'none';
    $(id).setAttribute('aria-disabled',String(!disponible));
  }
}
function animarArcoZoom(mostrar,{demora=0}={}){
  cancelAnimationFrame(animArco);animArco=0;
  const desde=progresoArco,hasta=mostrar?1:0;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches||desde===hasta){
    progresoArco=hasta;pintarArcoZoom();return;
  }
  const inicio=performance.now()+demora,duracion=(mostrar?950:650)*Math.abs(hasta-desde);
  const paso=ahora=>{
    const t=clamp((ahora-inicio)/duracion);
    progresoArco=desde+(hasta-desde)*t;
    pintarArcoZoom();
    if(t<1)animArco=requestAnimationFrame(paso);
    else animArco=0;
  };
  pintarArcoZoom();animArco=requestAnimationFrame(paso);
}
function zoomDisponible(){return vista==='placa'&&progresoArco===1&&!animVista;}

// ───────── estado ─────────
let seleccion = null, filtroG = null, filtroE = null, busqueda = '';
let filtroCodigos = null;   // Set de códigos: lo usa el botón «Ver muestras de este entorno» del Glosario (tabla base/entornos_muestras.csv)
let vista = 'placa';
// filtroG y filtroE pueden ser null, un valor ('B') o un Set de valores: la guía permite elegir varios a la vez
// (por ejemplo mohos y levaduras, o activas y en conservación). Otras pantallas siguen asignando un solo valor.
const conjuntoFiltro = v => !v ? null : v instanceof Set ? (v.size ? v : null) : new Set([v]);
const coincide = s => { const g = conjuntoFiltro(filtroG), e = conjuntoFiltro(filtroE); return (!g || [...g].some(x => s.grupo.includes(x))) && (!e || e.has(s.estado)) &&
  (!busqueda || quitarTildes(s.codigo + ' ' + s.origen).includes(busqueda)) && (!filtroCodigos || filtroCodigos.has(s.codigo)); };
prepararVinculos();

// Al hacer zoom, los centros se alejan del centro de la placa en proporción (r = K · ln(1 + edad/TAU)).
// Las muestras no cambian de tamaño y se desvanecen al llegar al borde. La placa (el borde verde) queda fija;
// los halos de atmósfera crecen y se apagan.
function maquetar(){
  const K = kDe(zoomT), z = K / K0;
  const pesoPlaca=Math.max(0,1-mezclaVista-mezclaMuestrario);
  const enc=encuadreEsquema();
  for (const p of piezas) {
    const r = p.r0 * z; let esc = 1, op;
    if (p.tipo === 'placa')     { op = 1; }
    else if (p.tipo === 'halo') { esc = z; op = clamp(1.6 - z * .6); }   // se apagan antes de salirse de la placa
    else                        { op = clamp((R_VISIBLE + R_FUNDIDO - r) / R_FUNDIDO); }
    p.r = r; p.x = C.x + r * Math.cos(p.ang); p.y0 = C.y + r * Math.sin(p.ang); p.vis = op;
    const placa=puntoEsquema(p.x,p.y0);
    p.x=placa.x;p.y0=placa.y;esc*=enc.k;
    if(p.tipo === 'muestra'){
      const grilla=posicionMuestrario(p);
      const circular=puntoEsquema(p.circular.x,p.circular.y);
      p.x=p.x*pesoPlaca+circular.x*mezclaVista+grilla.x*mezclaMuestrario;
      p.y0=p.y0*pesoPlaca+circular.y*mezclaVista+grilla.y*mezclaMuestrario;
      p.r=Math.hypot(p.x-enc.x,p.y0-enc.y)/enc.k;
      p.vis=op=op*pesoPlaca+mezclaVista+mezclaMuestrario;
      esc=enc.k*(pesoPlaca+p.circular.factor*mezclaVista)+grilla.factor*mezclaMuestrario;
    } else {
      op*=pesoPlaca;
    }
    p.escVista=esc;
    p.el.style.transform = `translate(${(p.x - p.lado/2).toFixed(1)}px,${(p.y0 - p.lado/2).toFixed(1)}px)` + (esc !== 1 ? ` scale(${esc.toFixed(4)})` : '');
    p.el.style.opacity = op.toFixed(3);
    // MUESTRARIO: código debajo de la colonia; aparece al final de la transición y se va primero. Las colonias se apoyan en
    // la línea de base de su fila (muestrario.js), así que el borde inferior de cada una es esa línea: el código va 3 px abajo.
    if(p.codEl){const ver=clamp((mezclaMuestrario-.6)/.4);p.codEl.style.opacity=(ver*.6).toFixed(3);
      if(ver>0){const g=posicionMuestrario(p),r=p.grilla.diametro/2*g.factor/p.grilla.factor;p.codEl.style.transform=`translate(${g.x.toFixed(1)}px,${(g.y+r+3).toFixed(1)}px)`;}}
  }
  dibujarAros(K);
  const am = (A1 - zoomT*(A1-A0)) * Math.PI/180;
  manija.setAttribute('cx', C.x + RZ*Math.cos(am)); manija.setAttribute('cy', C.y + RZ*Math.sin(am));
  pintarArcoZoom();
  ajustarZonaMuestras();
  if (seleccion) ubicarFicha();
  actualizarGeometriaVinculos();
}

let animZoom = 0;
function irAZoom(t, ms = 650){
  t = clamp(t); cancelAnimationFrame(animZoom);
  const de = zoomT, t0 = performance.now();
  const paso = now => { const k = clamp((now - t0)/ms), e = k<.5 ? 4*k*k*k : 1 - Math.pow(-2*k+2,3)/2;
    zoomT = de + (t - de)*e; maquetar(); if (k < 1) animZoom = requestAnimationFrame(paso); };
  animZoom = requestAnimationFrame(paso);
}

// ───────── lista ─────────
// La caja de la lista es más grande que la zona de lectura (aire arriba y a los costados),
// para que el desenfoque de las filas que entran y salen no se corte contra el borde.
const lista = $('lista');
const AIRE_ARRIBA = 80;                                  // la primera fila queda donde estaba (y = 325)
const SUBE_DESDE = AIRE_ARRIBA + 4, SUBE_LARGO = 30;     // arriba: las filas se desenfocan y se apagan antes del rótulo
const BAJA_DESDE = AIRE_ARRIBA + 470, BAJA_LARGO = 200;   // abajo: desenfoque progresivo como en la referencia
lista.insertAdjacentHTML('beforeend', `<div style="height:${AIRE_ARRIBA}px"></div>`);
const porFecha = [...muestras].sort((a,b) => b.fecha - a.fecha);
const flecha = '<svg width="11" height="11" viewBox="0 0 11 11"><path d="M1.5 9.5 L9.5 1.5 M3.5 1.5 H9.5 V7.5" fill="none" stroke="#fff" stroke-width="1.5"/></svg>';
const CICLOS_LISTA = 3, filasPorCiclo = [];
for (let ciclo = 0; ciclo < CICLOS_LISTA; ciclo++) {
  const filas = [];
  porFecha.forEach((s, k) => {
    const f = document.createElement('div'); f.className = 'fila';
    f.innerHTML = `<div class="c">${s.codigo}</div><div class="n"><span>${s.origen}</span>${flecha}</div>`;
    f.addEventListener('click', ev => { ev.stopPropagation(); seleccionar(s, true); });
    lista.appendChild(f); filas.push(f); s.filas ||= []; s.filas.push(f);
    if (ciclo === 1) s.fila = f;
    const fl = document.createElement('div'); fl.className = 'filete';
    lista.appendChild(fl); s.filetes ||= []; s.filetes.push(fl);
  });
  filasPorCiclo.push(filas);
}
lista.insertAdjacentHTML('beforeend', '<div class="pad"></div>');
// Arranca en el ciclo central; al cruzar medio ciclo, recentra el scroll en la copia idéntica.
const ALTO_CICLO_LISTA = filasPorCiclo[1][0].offsetTop - filasPorCiclo[0][0].offsetTop;
lista.scrollTop = ALTO_CICLO_LISTA;
let recentrandoLista = false;
function mantenerListaCircular(){
  if (recentrandoLista || !ALTO_CICLO_LISTA) return;
  const minimo = ALTO_CICLO_LISTA * .5;
  const maximo = ALTO_CICLO_LISTA * 1.5;
  let top = lista.scrollTop, cambio = 0;
  while (top < minimo) { top += ALTO_CICLO_LISTA; cambio++; }
  while (top > maximo) { top -= ALTO_CICLO_LISTA; cambio--; }
  if (!cambio) return;
  recentrandoLista = true; lista.scrollTop = top;
  requestAnimationFrame(() => { recentrandoLista = false; desenfocarLista(); });
}

// desenfoque progresivo arriba (las filas que suben se esfuman) y abajo (como en la referencia)
function desenfocarLista(){
  const top = lista.scrollTop;
  for (const s of porFecha) {
    for (let i = 0; i < s.filas.length; i++) {
      const fila = s.filas[i], filete = s.filetes[i];
      const y = fila.offsetTop - top;
      const baja = BAJA_DESDE + DY, fuera = y < -30 || y > baja + BAJA_LARGO + 260;
      fila.style.visibility = fuera ? 'hidden' : ''; filete.style.visibility = fila.style.visibility;
      if (fuera) { fila.style.opacity = '0'; filete.style.opacity = '0'; continue; }
      const arriba = clamp((SUBE_DESDE - y) / SUBE_LARGO), abajo = clamp((y - baja) / BAJA_LARGO);
      const blur = arriba * 8 + abajo * 9, f = blur > .05 ? `blur(${blur.toFixed(1)}px)` : '';
      fila.style.filter = f; filete.style.filter = f;
      const op = (1 - arriba) * (1 - .55*abajo);
      fila.style.opacity = fila.classList.contains('apagada') ? (.3 * op).toFixed(2) : op.toFixed(2);
      filete.style.opacity = (.4 * op).toFixed(2);
    }
  }
}
lista.addEventListener('scroll', mantenerListaCircular, { passive:true });
lista.addEventListener('scroll', desenfocarLista, { passive:true });

// ───────── selección y ficha ─────────
const ficha = $('ficha'), fichaCo = $('fichaCo'), elegida = $('elegida');
let cancelarDeslizamientoFicha=()=>{};
function fechaTexto(s){ const t = MESES[s.m-1]; return t[0].toUpperCase() + t.slice(1) + ' ' + s.y; }
function chips(g){ return [...g].map(c => `<i class="chip" style="background:${CHIP[c]}"></i>`).join(''); }

// la elegida pasa a una capa propia, arriba de todo; al soltarla vuelve a su lugar en la receta
function devolver(s){ if (s && s.el.parentNode === elegida) s.capaEl.insertBefore(s.el, s.sig); }
function elevar(s){ s.sig = s.el.nextSibling; elegida.appendChild(s.el); }

function seleccionar(s, desdeLista = false){
  cancelarDeslizamientoFicha();
  if (seleccion && seleccion !== s) devolver(seleccion);
  if (s && seleccion !== s) elevar(s);
  seleccion = s;
  pantalla.classList.toggle('sel-on', !!s);
  for (const x of muestras) { x.el.classList.toggle('on', x === s); for (const fila of x.filas) fila.classList.toggle('sel', x === s); }
  dibujarVinculos();
  document.body.classList.toggle('con-cartel', !!s);   // ver "Cartel abierto" en la plantilla
  if (!s) { ficha.classList.remove('vis'); return; }
  fichaManual = null; ficha.classList.remove('saliendo');
  universoCartel(ficha,s.grupo);
  fichaCo.innerHTML=contenidoCartel(s);
  ficha.querySelector('.fi').scrollTop=0;
  ficha.classList.add('vis');
  // si quedó fuera del campo visible por el zoom, acomodar el zoom
  if (vista === 'placa' && mezclaVista === 0 && mezclaMuestrario === 0 && !animVista && s.r > R_VISIBLE - 40) {
    const K = (R_VISIBLE - 90) / Math.log(1 + s.edad / TAU);
    irAZoom(Math.log(K / K_MIN) / Math.log(K_MAX / K_MIN));
  }
  ubicarFicha();
  // la lista acompaña
  const fila = desdeLista
    ? s.filas.reduce((mejor, actual) => Math.abs(actual.offsetTop - lista.scrollTop - lista.clientHeight/2) < Math.abs(mejor.offsetTop - lista.scrollTop - lista.clientHeight/2) ? actual : mejor, s.filas[0])
    : s.fila;
  const objetivo = fila.offsetTop - AIRE_ARRIBA - 40;
  const y = fila.offsetTop - lista.scrollTop;
  if (!desdeLista || y > BAJA_DESDE + DY - 50 || y < SUBE_DESDE) lista.scrollTo({ top: Math.max(0, objetivo), behavior: 'smooth' });
}

let fichaManual = null;   // posición que eligió la persona al arrastrar el cartel (null = automática)
function ubicarFicha(){
  if (fichaManual) {
    const {x,y}=fichaManual,w=ficha.offsetWidth||402,h=ficha.offsetHeight||462;
    const dentroX=Math.max(0,Math.min(x+w,1920+DX/2)-Math.max(x,-DX/2));
    const dentroY=Math.max(0,Math.min(y+h,1100+DY/2)-Math.max(y,-DY/2));
    const fuera=clamp(1-dentroX*dentroY/(w*h));
    // El mismo límite de descarte (50% fuera) guía el desenfoque, que revierte al volver.
    ficha.style.setProperty('--descarte-blur',(32*Math.pow(clamp(fuera/.5),.8)).toFixed(2)+'px');
    ficha.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;
    return;
  }
  ficha.style.setProperty('--descarte-blur','0px');
  const s = seleccion, w = ficha.offsetWidth || 402, h = ficha.offsetHeight || 462;
  const enc=encuadreEsquema();
  const ang = s.r > 6 ? Math.atan2(s.y0 - enc.y, s.x - enc.x) : 0;
  const sep = s.d*(enc.k*(1-mezclaMuestrario)+s.escVista*mezclaMuestrario)*0.62+34;
  const LI=340-DX/2*mezclaMuestrario;
  const LD=(1180+(670+DX/2)*(1-aperturaListado))*(1-mezclaMuestrario)+(1850+DX/2-530*aperturaListado)*mezclaMuestrario;
  let x = Math.cos(ang) >= 0 ? s.x + sep : s.x - sep - w;
  if (x + w > LD) x = s.x - sep - w;
  if (x < LI) x = s.x + sep;
  let y = s.y0 + Math.sin(ang) * sep * 0.6 - h/2;
  x = clamp(x, LI, LD - w); y = clamp(y, 150-DY/2*mezclaMuestrario, 950+DY/2*mezclaMuestrario-h);
  ficha.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;
}
$('fichaX').addEventListener('click', ev => { ev.stopPropagation(); seleccionar(null); });
// ───────── arrastrar el cartel; soltarlo mayormente fuera de la pantalla lo cierra ─────────
cancelarDeslizamientoFicha=activarArrastreCartel(ficha,pos=>{fichaManual=pos;ubicarFicha();},()=>seleccionar(null));

fichaCo.addEventListener('click',ev=>{
  if(ev.target.closest('[data-ficha-completa]')){document.dispatchEvent(new CustomEvent('abrir-ficha-muestra',{detail:seleccion}));return;}
  const boton=ev.target.closest('#fichaMas');if(!boton)return;
  const abrir=boton.getAttribute('aria-expanded')!=='true';
  boton.setAttribute('aria-expanded',String(abrir));
  boton.querySelector('span').textContent=abrir?'Cerrar información':'Leer más al respecto';
  $('fichaDetalle').hidden=!abrir;
  if(seleccion)ubicarFicha();
});

// toque sobre la placa: la muestra más cercana (con un mínimo cómodo para el dedo)
// posición del dedo en coordenadas de la placa (descontando el corrimiento del grupo central)
function aEscena(ev){ const r = pantalla.getBoundingClientRect(); return { x:(ev.clientX - r.left)/escala - DX/2, y:(ev.clientY - r.top)/escala - DY/2 }; }
$('toque').addEventListener('click', ev => {
  ev.stopPropagation();
  const p = aEscena(ev); let mejor = null, mv = 1;
  for (const s of muestras) {
    if (s.vis < .5 || s.el.classList.contains('apagada')) continue;
    const alcance = Math.max(s.d/2 * s.escVista * (s === seleccion ? 1.25 : 1), 18), v = Math.hypot(p.x - s.x, p.y - s.y0) / alcance;
    if (v < mv) { mv = v; mejor = s; }
  }
  seleccionar(mejor);
});
pantalla.addEventListener('click', ev => { if (!ev.target.closest('[data-ui]')) seleccionar(null); });

// ───────── filtros (leyenda y buscador) ─────────
function aplicarFiltros(){
  for (const s of muestras) { const ok = coincide(s); s.el.classList.toggle('apagada', !ok); for (const fila of s.filas) fila.classList.toggle('apagada', !ok); }
  const g = conjuntoFiltro(filtroG), e = conjuntoFiltro(filtroE);
  pantalla.classList.toggle('filtrando', !!(g || e || busqueda || filtroCodigos));
  $('bGrupo').classList.toggle('filtrando', !!g);
  $('bEstado').classList.toggle('filtrando', !!e);
  document.querySelectorAll('.item.grupo').forEach(i => { const on = !!g?.has(i.dataset.g); i.classList.toggle('activo', on); i.setAttribute('aria-pressed', String(on)); });
  document.querySelectorAll('.item.estado').forEach(i => { const on = !!e?.has(i.dataset.e); i.classList.toggle('activo', on); i.setAttribute('aria-pressed', String(on)); });
  actualizarGuia();
  desenfocarLista();
  dibujarVinculos();
}
// Guía «Cómo leer la placa»: empieza cerrada (solo los ejemplos, que siguen filtrando) y se abre o cierra sin tocar los filtros.
function actualizarGuia(){
  const hay = document.querySelector('#leyenda .item.activo');
  $('guiaUso').textContent = hay ? 'Tocá de nuevo un ejemplo para quitarlo del filtro.' : 'Tocá uno o varios ejemplos para ver solo esas muestras.';
}
function abrirGuia(abre){
  $('leyenda').classList.toggle('cerrada', !abre);
  $('guiaBoton').setAttribute('aria-expanded', String(abre));
  $('guiaBoton').setAttribute('aria-label', 'Cómo leer la placa: ' + (abre ? 'cerrar' : 'abrir') + ' la guía');
  actualizarGuia();
}
$('guiaBoton').addEventListener('click', ev => { ev.stopPropagation(); abrirGuia($('leyenda').classList.contains('cerrada')); });
// Cada ejemplo se suma o se quita del filtro (selección múltiple).
const alternarFiltro = (actual, valor) => { const c = new Set(conjuntoFiltro(actual) || []); c.has(valor) ? c.delete(valor) : c.add(valor); return c.size ? c : null; };
document.querySelectorAll('.item.grupo').forEach(i => i.addEventListener('click', ev => { ev.stopPropagation(); filtroG = alternarFiltro(filtroG, i.dataset.g); aplicarFiltros(); }));
document.querySelectorAll('.item.estado').forEach(i => i.addEventListener('click', ev => { ev.stopPropagation(); filtroE = alternarFiltro(filtroE, i.dataset.e); aplicarFiltros(); }));
$('q').addEventListener('input', e => { busqueda = quitarTildes(e.target.value.trim()); filtroCodigos = null; aplicarFiltros(); });
$('buscador').addEventListener('click', ev => ev.stopPropagation());

// ───────── zoom: + / − y arrastre sobre el arco ─────────
$('zMas').addEventListener('click', ev => { ev.stopPropagation(); if(zoomDisponible())irAZoom(zoomT + .16); });
$('zMenos').addEventListener('click', ev => { ev.stopPropagation(); if(zoomDisponible())irAZoom(zoomT - .16); });
const zt = $('zoomToque');
zt.addEventListener('pointerdown', ev => {
  if(!zoomDisponible())return;
  ev.stopPropagation(); zt.setPointerCapture(ev.pointerId); cancelAnimationFrame(animZoom);
  const mover = e => { const p = aEscena(e),c=encuadreEsquema(), a = Math.atan2(p.y - c.y, p.x - c.x) * 180/Math.PI; zoomT = clamp((A1 - a)/(A1 - A0)); maquetar(); };
  mover(ev);
  const fin = () => { zt.removeEventListener('pointermove', mover); zt.removeEventListener('pointerup', fin); zt.removeEventListener('pointercancel', fin); };
  zt.addEventListener('pointermove', mover); zt.addEventListener('pointerup', fin); zt.addEventListener('pointercancel', fin);
});
zt.addEventListener('click', ev => ev.stopPropagation());

// ───────── vistas pendientes ─────────
const aviso = $('aviso'); let avisoT = 0;
function avisar(texto, x, y){ universoCartel(aviso,seleccion?.grupo||'BL'); $('avisoCo').textContent = texto; aviso.style.left = x + 'px'; aviso.style.top = (y + DY) + 'px'; /* las vistas están abajo a la izquierda */ aviso.classList.add('vis'); clearTimeout(avisoT); avisoT = setTimeout(() => aviso.classList.remove('vis'), 3800); }
aviso.addEventListener('click', ev => { ev.stopPropagation(); aviso.classList.remove('vis'); });

// ───────── redibujo al cambiar el tamaño de la ventana ─────────
let rT = 0;
addEventListener('resize', () => { ajustar(); maquetar(); desenfocarLista(); clearTimeout(rT); rT = setTimeout(() => obras.forEach(o => o.draw()), 250); });

// ───────── entrada: primero la placa y la atmósfera, después las muestras en orden cronológico ─────────
prepararListado();
maquetar(); desenfocarLista();
const listo = (document.fonts ? document.fonts.ready : Promise.resolve());
prepararGlosario();
prepararTuPlaca();
listo.then(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))).then(() => {
  animarMenuVistas(menuVistas.activa,false); // ajustar las medidas cuando Arimo ya está disponible
  for(const s of muestras)s.el.classList.add('muestra-apertura');
  prepararApertura(()=>{
  const suave = 'cubic-bezier(.2,.75,.25,1)';
  for (const id of ['capaA','capaB','aros']) $(id).style.visibility = 'visible';
  if(vista==='placa'){animarArcoZoom(true,{demora:2300*.86});animarEntradaAros();}
  piezas.filter(p => p.tipo !== 'muestra').forEach((p, k) => p.mi.animate(
    [{ transform:'scale(.6)', opacity:0 }, { transform:'scale(1)', opacity:1 }],
    { duration: 2200, delay: k * 120, easing: suave, fill:'backwards' }));
  });
});
