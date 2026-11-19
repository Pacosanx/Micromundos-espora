// Verificación funcional del HTML generado. Requiere linkedom instalado fuera de las fuentes.
// No sustituye la revisión visual: este entorno simula geometría y dibujo de canvas.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {parseHTML}=require(process.argv[2]||'linkedom');
const base=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(base,'placa.html'),'utf8');
const {document,window:dom}=parseHTML(html);
let reloj=0,n=0;const frames=new Map(),timers=new Map(),memoria=new Map();
const contexto2d=new Proxy({measureText:t=>({width:String(t).length*10}),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}}),getImageData:()=>({data:new Uint8ClampedArray(4)}),createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)})},{get:(obj,k)=>k in obj?obj[k]:()=>{}});
const prototipoCanvas=document.createElement('canvas').constructor.prototype;
prototipoCanvas.getContext=()=>contexto2d;prototipoCanvas.toDataURL=()=> 'data:image/png;base64,iVBORw0KGgo=';
const proto=dom.HTMLElement.prototype;
proto.animate=()=>({cancel(){},finished:Promise.resolve()});proto.setPointerCapture=()=>{};proto.releasePointerCapture=()=>{};proto.focus=function(){document._foco=this;};
Object.defineProperty(proto,'clientWidth',{get(){return this.id==='navegacionPrincipal'?1841:this.id==='tpBoard'?720:parseFloat(this.style.width)||402;}});
Object.defineProperty(proto,'clientHeight',{get(){return parseFloat(this.style.height)||500;}});
Object.defineProperty(proto,'offsetWidth',{get(){return this.clientWidth;}});Object.defineProperty(proto,'offsetHeight',{get(){return this.classList.contains('cartel-especie')?700:this.clientHeight;}});
Object.defineProperty(proto,'offsetTop',{get(){return this.id==='glosarioIndice'?1106:parseFloat(this.style.top)||325;}});
proto.getBoundingClientRect=function(){const board=this.id==='tpBoard';return {left:board?600:0,top:board?190:0,width:board?720:this.id==='screen'?1920:this.clientWidth,height:board?720:this.id==='screen'?1100:this.clientHeight,right:1920,bottom:1100};};
proto.scrollTo=function(o){this.scrollTop=o.top||0;this.dispatchEvent(new dom.Event('scroll'));};
document.fonts={ready:Promise.resolve()};
const context={document,console,Event:dom.Event,CustomEvent:dom.CustomEvent,innerWidth:1920,innerHeight:1100,devicePixelRatio:1,structuredClone,performance:{now:()=>reloj},ResizeObserver:class{observe(){}disconnect(){}},matchMedia:()=>({matches:false,addEventListener(){}}),getComputedStyle:el=>{const values={left:el.style.left||'0px',top:el.style.top||'0px',fontSize:el.style.fontSize||'24px',lineHeight:el.style.lineHeight||'24px',filter:el.style.filter||'none',opacity:el.style.opacity||'1'};return Object.assign(values,{[Symbol.iterator]:()=>Object.keys(values)[Symbol.iterator](),getPropertyValue:k=>values[k]||''});},localStorage:{getItem:k=>memoria.get(k)||null,setItem:(k,v)=>memoria.set(k,v)},sessionStorage:{getItem:()=>null,setItem(){},removeItem(){},clear(){}},URLSearchParams,location:{search:'',pathname:'/placa.html',replace(){}},history:{pushState(){},replaceState(){}},MutationObserver:class{observe(){}disconnect(){}},ImageData:class{constructor(a,b,c){if(typeof a==='number'){this.width=a;this.height=b;this.data=new Uint8ClampedArray(a*b*4);}else{this.data=a;this.width=b;this.height=c||a.length/4/b;}}},requestAnimationFrame:f=>{frames.set(++n,f);return n;},cancelAnimationFrame:id=>frames.delete(id),setTimeout:(f,delay=0)=>{timers.set(++n,{f,cuando:reloj+delay});return n;},clearTimeout:id=>timers.delete(id),addEventListener(){},removeEventListener(){}};
context.window=context;
let montajesLupa=0,limpiezasLupa=0;const posicionesLupa=[];
context.MicromundosLupa={montarLupaFigma:el=>{montajesLupa++;const limpiar=()=>{limpiezasLupa++;};limpiar.actualizar=p=>posicionesLupa.push({...p});return limpiar;}};
vm.createContext(context);
let script=[...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].filter(m=>!m[0].includes('data-lupa-runtime')).map(m=>m[1]).join('\n');
const core=fs.readFileSync(path.join(__dirname,'colonias-core.js'),'utf8');
assert(script.includes(core),'El HTML no contiene el renderer actual');
script=script.replace(core,`function mountColonias(cv){cv.width=cv.height=128;return{draw(){},destroy(){},setProgress(){},play(){},pause(){}}}`);
new vm.Script(script,{filename:'placa.html'}).runInContext(context);
const geometria=vm.runInNewContext("("+fs.readFileSync(path.join(__dirname,'pantallas-detalle.js'),'utf8').match(/function geometriaObjetivos[\s\S]*?\n}/)[0]+")");
const objetivoInicial=geometria(0,1920,1100),objetivoFinal=geometria(1,1920,1100);
assert(Math.hypot(objetivoInicial.centros[0].x-960,objetivoInicial.centros[0].y-550)<1e-8);
assert(Math.hypot(objetivoFinal.centros[1].x-960,objetivoFinal.centros[1].y-550)<1e-8);
const distanciaObjetivos=g=>Math.hypot(g.centros[0].x-g.centros[1].x,g.centros[0].y-g.centros[1].y);
for(let t=0;t<=1;t+=.05){const g=geometria(t,1920,1100);assert.equal(g.radio,objetivoInicial.radio,'El hueco cambia de tamaño durante el giro');assert(Math.abs(distanciaObjetivos(g)-distanciaObjetivos(objetivoInicial))<1e-8,'Los objetivos no giran solidarios');}
for(const c of geometria(.39,1920,1100).centros)assert(Math.hypot(Math.max(0,-c.x,c.x-1920),Math.max(0,-c.y,c.y-1100))>objetivoInicial.radio*1.03,'El cambio no queda oculto entre los objetivos');
const $=id=>document.getElementById(id);
const click=el=>{assert(el,'Falta un destino de click');el.dispatchEvent(new dom.Event('click',{bubbles:true}));};
const evento=(tipo,props={})=>{const ev=new dom.Event(tipo,{bubbles:true});for(const [k,v]of Object.entries(props))Object.defineProperty(ev,k,{value:v});return ev;};
async function avanzar(ms=600){for(let t=0;t<ms;t+=20){reloj+=20;const lote=[...frames.values()];frames.clear();for(const f of lote)f(reloj);for(const [id,timer]of [...timers])if(timer.cuando<=reloj){timers.delete(id);timer.f();}await Promise.resolve();}}
(async()=>{
  await avanzar(160);assert($('apertura'));
  assert($('aperturaPalabra'),'Falta la palabra precalculada para el primer pintado');
  assert(fs.statSync(path.join(base,'src/assets/apertura-palabra.png')).size>0,'Falta el recurso inicial');
  click($('apertura'));await avanzar(1700);
  assert.equal($('zoomSvg').style.opacity,'0.000','El zoom aparece antes del tramo final de la placa');
  await avanzar(500);assert(Number($('zoomSvg').style.opacity)>0,'El zoom no comienza cuando la placa está casi formada');
  await avanzar(300);assert(!$('apertura'),'La apertura no terminó');
  for(const vista of ['vMuestrario','vVinculos']){
    click($(vista));await avanzar(1200);click($('titulo'));await avanzar(700);
    assert.equal($('zoomSvg').style.opacity,'0.000','El zoom se adelanta al volver a PLACA');
    await avanzar(350);assert(Number($('zoomSvg').style.opacity)>0,'El zoom no acompaña el tramo final del regreso a PLACA');await avanzar(1100);
  }
  click($('navGlosario'));await avanzar();assert(document.getElementById('screen').classList.contains('en-glosario'));
  click(document.querySelector('.g-fila'));await avanzar();assert(document.querySelector('.cartel-glosario.vis'),'No abre el popup del glosario');
  click($('navMuestras'));await avanzar();assert(!document.querySelector('.cartel-glosario'),'El popup del glosario permanece al cambiar de pantalla');
  click($('navGlosario'));await avanzar();
  for(const [id,nodo]of [['bacterias','441:10436'],['levaduras','446:5402'],['mohos','446:5748']]){
    click(document.querySelector('[data-glosario-grupo="'+id+'"]'));await avanzar();assert.equal($('detalleLienzo').firstElementChild.dataset.nodeId,nodo);
    assert.equal($('detalleLienzo').firstElementChild.style.width,'100%');assert.equal($('detalleLienzo').firstElementChild.style.overflow,'clip','Los fondos pueden extender el scroll');
    const indicacion=$('detalleLienzo').querySelector('[data-name^="Indicación de pantalla"]');assert.equal(indicacion.style.right,'40px');assert.equal(indicacion.style.width,'auto');
    const filas=[...$('detalleLienzo').querySelectorAll('[data-name^="Fila ·"]')];assert(filas.length>=10,'Falta archivo de especies');click(filas[0]);await avanzar();assert(document.querySelector('.cartel-especie.vis'),'No abre el cartel de especie');
    const cartelUniverso=document.querySelector('.cartel-especie.vis');
    assert(cartelUniverso.querySelector('.detalle-especie-figura img').getAttribute('src').endsWith({bacterias:'20019.png',levaduras:'d5191.png',mohos:'e2884.png'}[id]),'Ilustración equivocada en el cartel');
    const relacionadas=cartelUniverso.querySelector('.detalle-fichas-especie');assert(relacionadas.hidden);click(cartelUniverso.querySelector('.masCartel'));assert(!relacionadas.hidden,'No se despliegan las muestras vinculadas');
    const entornos=JSON.parse(fs.readFileSync(path.join(base,'base/entornos.json'),'utf8'))[id];
    const raiz=$('detalleLienzo').firstElementChild,ilustracion=raiz.querySelector('.detalle-entorno-ilustracion'),campo=raiz.querySelector('[data-name="campo claro"]');
    const placaColonia=raiz.querySelector('.detalle-placa-colonia img');assert.equal(placaColonia.getAttribute('src'),'src/assets/detalles/una-colonia-'+id+'.png');assert(fs.statSync(path.join(base,placaColonia.getAttribute('src'))).size>0,'Falta la placa de Una colonia');
    assert.equal(ilustracion.style.left,campo.style.left,'Ilustración fuera del campo circular');
    assert.equal(ilustracion.style.top,campo.style.top,'Ilustración fuera del campo circular');
    assert.equal(campo.children.length,0,'Queda la superficie SVG con ruido que produce destellos');
    assert.equal(campo.style.backgroundColor,'#efe6dc');
    for(const filete of raiz.querySelectorAll('[data-name="Listado"] [data-name="filete"]'))if(filete.style.height==='1px')assert.equal(filete.style.width,'calc(100% - 300px)','Filete fuera del eje N°');
    assert.equal(raiz.querySelectorAll('[data-name^="Colonia ·"] .universo-titulo').length,2,'Los enlaces del pie no comparten el componente del índice');
    assert.equal(campo.style.maskImage,'var(--mascara-campo-suave)','Máscara dependiente de un archivo local externo');
    for(let i=0;i<entornos.length;i++){
      assert.equal(ilustracion.querySelector('img').getAttribute('src'),entornos[i].imagen,'Ilustración de otro entorno');
      assert(fs.statSync(path.join(base,entornos[i].imagen)).size>0,'Recurso vacío');
      const bloques=[...raiz.querySelector('[data-name^="Columna derecha"]').children].filter(el=>el.tagName==='DIV').slice(0,2);
      for(let j=0;j<2;j++){const p=bloques[j].querySelectorAll('p');assert.equal(p[0].textContent,entornos[i]['titulo'+(j+1)]);assert.equal(p[1].textContent,entornos[i]['parrafo'+(j+1)]);assert.notEqual(bloques[j].style.visibility,'hidden');}
      click(raiz.querySelector('[data-name="siguiente"]'));await avanzar();
    }
    assert.equal(ilustracion.querySelector('img').getAttribute('src'),entornos[0].imagen,'El carrusel no vuelve al primer entorno');
    click($('detalleLienzo').querySelector('[data-name="siguiente"]'));await avanzar();assert.equal([...$('detalleLienzo').querySelectorAll('[data-name="Carrusel · contador"] p button')].findIndex(b=>b.getAttribute('aria-current')==='true'),1,'El circulito actual no corresponde al lugar');
    click($('detalleLienzo').querySelector('[data-name="anterior"]'));await avanzar();assert.equal([...$('detalleLienzo').querySelectorAll('[data-name="Carrusel · contador"] p button')].findIndex(b=>b.getAttribute('aria-current')==='true'),0,'El circulito actual no corresponde al lugar');
    if(id==='bacterias'){
      const yogur=[...document.querySelectorAll('.detalle-fichas-especie button')].find(b=>b.textContent.includes('B-083-YNA'));assert(yogur,'El yogur no está vinculado a S. thermophilus');click(yogur);await avanzar();
      assert.equal($('detalleLienzo').firstElementChild.dataset.nodeId,'500:7020');assert.equal(document.querySelector('[data-node-id="500:7170"]').textContent,'B-083-YNA');assert.equal(document.querySelector('[data-node-id="500:7179"]').textContent,'8 aprox.');
      const tecnica=$('detalleLienzo').querySelector('[data-node-id="500:7205"]');
      const left=/calc\(100% - ([\d.]+)px\)/.exec(tecnica.style.left);assert(left,'Ficha técnica sin anclaje al margen derecho');
      for(const ancho of [1920,2220,2520])assert.equal(ancho-(ancho-Number(left[1])+444),40,'Margen derecho incorrecto');
      assert.equal($('detalleLienzo').querySelector('[data-node-id="500:7186"]').style.left,'39px');
      const galeria=$('detalleLienzo').querySelector('.detalle-galeria'),fin=5817;
      assert.equal($('detalleLienzo').style.height,fin+'px','El scroll no termina según el contenido');
      const mapa=JSON.parse(fs.readFileSync(path.join(base,'src/ficha-colonias.json'),'utf8')).placa;
      const y=mapa.rows.findIndex(f=>f.length),x=mapa.rows[y][0];
      const foto=$('detalleLienzo').querySelector('[data-node-id="500:7153"] img').getBoundingClientRect();
      const tap={pointerId:2,button:0,clientX:foto.left+(x+.5)/mapa.width*foto.width,clientY:foto.top+(y+.5)/mapa.height*foto.height};
      const placaTap=$('detalleLienzo').querySelector('.ficha-placa');placaTap.dispatchEvent(evento('pointerdown',tap));await avanzar(80);placaTap.dispatchEvent(evento('pointerup',tap));await avanzar();
      assert(document.querySelector('.cartel-celula'),'Un toque breve no abre la especie de la colonia');assert.equal(document.querySelectorAll('.cartel-celula .nom').length,1,'Una colonia muestra más de una especie');const tituloPrimero=document.querySelector('.cartel-celula .nom').textContent;placaTap.dispatchEvent(evento('pointerdown',tap));await avanzar(80);placaTap.dispatchEvent(evento('pointerup',tap));await avanzar();assert.equal(document.querySelector('.cartel-celula .nom').textContent,tituloPrimero,'La misma colonia cambia de especie');
      const placa=document.querySelector('[data-node-id="500:7152"]');placa.dispatchEvent(evento('pointerdown',{pointerId:1,clientX:600,clientY:400}));await avanzar(400);assert(!placa.querySelector('.detalle-lupa').hidden);assert.equal(montajesLupa,1,'No montó el componente óptico');assert.equal(placa.getAttribute('aria-expanded'),'true');const antesMover=posicionesLupa.at(-1);placa.dispatchEvent(evento('pointermove',{pointerId:1,clientX:700,clientY:480}));assert.equal(posicionesLupa.at(-1).x,antesMover.x,'La lente debe quedar fija donde apareció aunque el dedo se mueva');assert.equal(posicionesLupa.at(-1).ancho,placa.offsetWidth);placa.dispatchEvent(evento('pointerup',{pointerId:1}));assert(placa.querySelector('.detalle-lupa').hidden);
      placa.dispatchEvent(evento('keydown',{key:' ',repeat:false}));await avanzar(400);assert(!placa.querySelector('.detalle-lupa').hidden);assert.equal(montajesLupa,1,'Recrea la lupa innecesariamente');placa.dispatchEvent(evento('keyup',{key:' '}));assert(placa.querySelector('.detalle-lupa').hidden);
      assert(!document.querySelector('[data-node-id="500:7224"]'),'Quedó el cartel de muestra abierto por defecto');
      click($('detalleLienzo').querySelector('.ficha-colonias'));await avanzar();
      click($('detalleLienzo').querySelector('.ficha-colonias'));await avanzar();
      const nombres=[...document.querySelectorAll('.cartel-celula .nom')].map(e=>e.textContent);assert.equal(nombres.length,2,'No hay un cartel independiente por especie');$('detalleScroll').scrollTop=180;$('detalleScroll').dispatchEvent(evento('scroll'));await avanzar(40);assert([...document.querySelectorAll('.cartel-celula')].some(el=>Math.abs(parseFloat(el.style.getPropertyValue('--oleaje-y')))>0),'El cartel no recibe impulso al desplazar la ficha');assert(nombres.includes('Streptococcus thermophilus'));assert(nombres.includes('Lactobacillus delbrueckii subsp. bulgaricus'));
      const especie=$('detalleLienzo').querySelector('[data-node-id="500:7214"]');click(especie);await avanzar();const cartel=[...document.querySelectorAll('.cartel-ficha-especie')].find(el=>el.querySelector('.nom').textContent==='Streptococcus thermophilus');assert(cartel,'Falta el cartel de la ficha');assert.equal(cartel.querySelector('.cod').textContent,'ST');const leer=cartel.querySelector('.masCartel');click(leer);assert(!cartel.querySelector('.detalleCartel').hidden);click(leer);assert(cartel.querySelector('.detalleCartel').hidden);
      assert($('detalleLienzo').querySelector('.detalle-galeria button'),'Falta galería de relaciones reales');
      const tarjeta=$('detalleLienzo').querySelector('.ficha-galeria__tarjeta[data-ciclo="1"]'),codigoRelacionado=tarjeta.querySelector('.ficha-galeria__codigo').textContent;
      assert.equal(tarjeta.querySelector('button').textContent,'VER FICHA DE MUESTRA');assert(tarjeta.querySelector('button img'),'Falta la flecha de los carteles');click(tarjeta.querySelector('button'));await avanzar();
      assert($('detalleLienzo').querySelector('.detalle-ficha-archivo'),'La tarjeta vuelve al esquema en vez de abrir una ficha');
      assert($('detalleLienzo').textContent.includes(codigoRelacionado),'La ficha corresponde a otra muestra');
      assert(!$('detalleLienzo').textContent.includes('Heladera de una casa'),'La ficha hereda textos del yogur');
      click($('detalleLienzo').querySelector('.ficha-archivo-indicacion button'));await avanzar();
      assert($('detalleLienzo').querySelector('.ficha-placa'),'Volver no regresa a la ficha original');
    }
    const saliendoDeUniverso=$('screen').classList.contains('en-universo');click($('navGlosario'));if(saliendoDeUniverso)assert(document.querySelector('.objetivo-campo'),'La salida del universo no usa el cambio de objetivo');await avanzar(1500);assert(!document.querySelector('.objetivo-transicion'),'Queda una máscara al salir');assert($('pantallasDetalle').hidden,'No vuelve al índice');assert(!document.querySelector('.cartel-especie'),'El popup de especie permanece al salir');
  }
  assert.equal(limpiezasLupa,1,'La lupa no se desmonta al salir de la ficha');
  for(const destino of ['navMuestras','navTuPlaca']){
    click(document.querySelector('[data-glosario-grupo="bacterias"]'));await avanzar(1500);click($(destino));assert(document.querySelector('.objetivo-campo'),'Falta transición al salir hacia '+destino);await avanzar(1500);assert(!document.querySelector('.objetivo-transicion,.objetivo-destino'),'Quedan capas temporales de salida');assert.equal($('centro').parentNode,$('screen'),'No se restauró el esquema después del cambio');click($('navGlosario'));await avanzar();
  }
  click($('navTuPlaca'));await avanzar();assert.equal(document.querySelectorAll('.tp-paleta-colonia').length,36,'La biblioteca de TU PLACA no tiene las 36 formas visibles (MEZCLAS, «Con halo» y «Par» están ocultas desde el 18/11)');
  const opcion=document.querySelector('.tp-paleta-colonia');opcion.dispatchEvent(evento('keydown',{key:'Enter'}));assert.equal($('tpColonias').children.length,1);assert.equal($('tpCuenta').textContent,'1 colonia');
  const colonia=$('tpColonias').firstElementChild,antes=colonia.style.transform;colonia.dispatchEvent(evento('keydown',{key:'ArrowRight',shiftKey:false}));assert.notEqual(colonia.style.transform,antes,'No se mueve con teclado');
  colonia.dispatchEvent(evento('keydown',{key:'Enter'}));assert(!$('tpMenu').hidden,'No abre el menú contextual');
  assert(!$('tpMenu').querySelector('[data-accion="opacidad"]').disabled,'Opacidad debe estar disponible');
  const tamano=$('tpMenu').querySelector('[data-accion="tamano"]');tamano.dispatchEvent(evento('keydown',{key:'Enter'}));
  const valorAnterior=JSON.parse(memoria.get('micromundos-tuplaca-v2')).items[0].escala;
  tamano.dispatchEvent(evento('keydown',{key:'ArrowRight'}));await avanzar();assert(JSON.parse(memoria.get('micromundos-tuplaca-v2')).items[0].escala>valorAnterior,'El arco no cambia el tamaño');
  click($('tpDeshacer'));assert.equal(JSON.parse(memoria.get('micromundos-tuplaca-v2')).items[0].escala,valorAnterior,'No deshace el tamaño');click($('tpRehacer'));
  colonia.dispatchEvent(evento('keydown',{key:'Enter'}));const duplicar=$('tpMenu').querySelector('[data-accion="duplicar"]');duplicar.dispatchEvent(evento('keydown',{key:'Enter'}));duplicar.dispatchEvent(evento('keydown',{key:'End'}));await avanzar();assert.equal($('tpColonias').children.length,25,'No genera los duplicados');const opacidad=$('tpMenu').querySelector('[data-accion="opacidad"]');opacidad.dispatchEvent(evento('keydown',{key:'Enter'}));opacidad.dispatchEvent(evento('keydown',{key:'Home'}));await avanzar();assert(JSON.parse(memoria.get('micromundos-tuplaca-v2')).items.every(i=>i.opacidad===10),'Opacidad no llega a las copias (el mínimo del arco es 10 %)');click($('tpDeshacer'));click($('tpDeshacer'));assert.equal($('tpColonias').children.length,1,'No deshace la duplicación');
  click($('tpRecuerdo'));assert(!$('tpVistaRecuerdo').hidden);assert($('tpGuardar').getAttribute('href').startsWith('data:image/png'));click($('tpVolver'));assert($('tpVistaRecuerdo').hidden);
  assert.equal(JSON.parse(memoria.get('micromundos-tuplaca-v2')).items.length,1);click($('tpReiniciar'));assert.equal($('tpColonias').children.length,0);assert.equal(JSON.parse(memoria.get('micromundos-tuplaca-v2')).items.length,0);click($('tpDeshacer'));assert.equal($('tpColonias').children.length,1,'Vaciar no se puede deshacer');
  const restaurada=$('tpColonias').firstElementChild,posRestaurada=restaurada.style.transform;restaurada.dispatchEvent(evento('keydown',{key:'ArrowLeft'}));assert.notEqual(restaurada.style.transform,posRestaurada,'La colonia restaurada edita una referencia anterior');
  $('tpGenerar').dispatchEvent(evento('keydown',{key:'Enter'}));assert($('tpColonias').children.length>50,'No genera composición por piezas');const generada=$('tpColonias').firstElementChild,pg=generada.style.transform;generada.dispatchEvent(evento('keydown',{key:'ArrowRight'}));assert.notEqual(generada.style.transform,pg,'La pieza generada no se puede mover');assert(JSON.parse(memoria.get('micromundos-tuplaca-v2')).items.every(i=>i.estilo),'Se pierde el estilo original del generador');click($('tpDeshacer'));click($('tpDeshacer'));assert.equal($('tpColonias').children.length,1,'No deshace generar');
  for(const tipo of ['V','F','G','AF','MI']){const opcionNueva=document.querySelector('[data-style-id="B-'+tipo+'-01"]');assert(opcionNueva,'Falta forma manual '+tipo);opcionNueva.dispatchEvent(evento('keydown',{key:'Enter'}));const nueva=JSON.parse(memoria.get('micromundos-tuplaca-v2')).items.at(-1);assert.equal(nueva.modelo,'B-'+tipo+'-01');assert.equal(nueva.sinReacciones,tipo!=='AF',tipo==='AF'?'El anillo fino no reacciona':'La forma de composición se altera por las reacciones');}
  for(const tipo of ['H','P'])assert(!document.querySelector('[data-style-id="B-'+tipo+'-01"]'),'La biblioteca todavía ofrece '+tipo);assert(![...document.querySelectorAll('.tp-biblioteca__tab')].some(t=>t.textContent==='MEZCLAS'),'La biblioteca todavía ofrece MEZCLAS');
  click($('navMuestras'));await avanzar();assert(!$('screen').classList.contains('en-glosario'));assert(!$('screen').classList.contains('en-tuplaca'));
  assert(!/:hover/.test(html),'Quedan estados de hover en la interfaz');
  console.log('Flujos verificados: apertura inmediata y zoom al final de la entrada, márgenes fluidos, fin de scroll, tres universos, especies, yogur y lupa, relaciones, composición, teclado, menú circular, recuerdo y reinicio; sin hover. DOM/canvas simulados; la revisión en navegador se comprueba por separado.');
})().catch(e=>{console.error(e);process.exitCode=1;});
