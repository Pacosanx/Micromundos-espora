// Composición gráfica libre: reutiliza las colonias del sistema, no predice cultivos.
function prepararTuPlaca(){
  const pagina=$('tuPlaca'),esc=escaparCartel;
  pagina.innerHTML=`<div class="tp-leyenda"><h2>UNIVERSOS</h2><p><i style="background:#e57dab"></i>Bacterias</p><p><i style="background:#f2c75e"></i>Levaduras</p><p><i style="background:#92aa68"></i>Mohos</p><label class="tp-opcion"><input id="tpEncuentros" type="checkbox" checked>Mostrar encuentros</label><small>Las líneas unen las formas que se superponen.</small><h2>TU COMPOSICIÓN</h2><p id="tpCuenta" aria-live="polite">0 colonias</p><button id="tpReiniciar" type="button">EMPEZAR DE NUEVO</button></div>
    <div class="tp-board" id="tpBoard"><div class="tp-agar"></div><svg id="tpLineas" width="720" height="720" aria-hidden="true"></svg><div id="tpColonias"></div><p id="tpVacia">ARRASTRÁ UNA COLONIA\nPARA EMPEZAR</p></div>
    <div class="tp-paleta"><h2>ARRASTRÁ HACIA LA PLACA</h2><div id="tpPaleta"></div><p>También podés tocar una forma para sumarla.</p></div>
    <div class="tp-pie"><h1>TU PLACA</h1><button id="tpContemplar" type="button">CONTEMPLAR</button><button id="tpRecuerdo" type="button">VER RECUERDO</button></div>
    <div class="tp-recuerdo" id="tpVistaRecuerdo" hidden role="dialog" aria-modal="true" aria-label="Recuerdo de tu placa"><div class="tp-recuerdo-interior"><img id="tpImagenRecuerdo" alt="Tu composición de colonias"><div><button id="tpVolver" type="button">VOLVER A COMPONER</button><a id="tpGuardar" download="micromundos-tu-placa.png">GUARDAR IMAGEN ↗</a></div></div></div>`;
  const board=$('tpBoard'),capa=$('tpColonias'),paleta=$('tpPaleta');
  const items=[],obras=new Map(),clave='micromundos-tuplaca-v1';let secuencia=0,contemplando=false;
  const colores={B:['#ff4c52','#f58bc3','#fffbee'],L:['#ff9c20','#ffc21c','#fffbee'],M:['#27633f','#6a983a','#dce642']};
  const estilos=[];
  for(const [g,cs]of Object.entries(colores))for(let i=0;i<4;i++)estilos.push({g,style:{...BASE,c1:cs[0],c2:cs[1],c3:cs[2],seed:71+i*139+g.charCodeAt(0),shape:i===3?'ring':'disk',ringWidth:28,irregularity:i===2?58:3,studyLobes:i===1?14:0,studyDepth:26,studyUneven:52,opacity:92,blur:16,grain:30}});
  const punto=ev=>{const r=board.getBoundingClientRect();return{x:(ev.clientX-r.left)*720/r.width,y:(ev.clientY-r.top)*720/r.height};};
  const guardar=()=>{try{localStorage.setItem(clave,JSON.stringify(items.map(({id,estilo,x,y,tamano})=>({id,estilo,x,y,tamano}))));localStorage.setItem(clave+'-encuentros',String($('tpEncuentros').checked));}catch{}};
  function dibujarEncuentros(){
    const lineas=$('tpLineas');lineas.replaceChildren();
    if(!$('tpEncuentros').checked)return;
    const ns='http://www.w3.org/2000/svg',defs=document.createElementNS(ns,'defs');lineas.appendChild(defs);
    for(let i=0;i<items.length;i++)for(let j=i+1;j<items.length;j++){
      const a=items[i],b=items[j];if(Math.hypot(a.x-b.x,a.y-b.y)>(a.tamano+b.tamano)*.55)continue;
      const colorA=PALETA_CARTEL[estilos[a.estilo].g],colorB=PALETA_CARTEL[estilos[b.estilo].g];
      const grad=document.createElementNS(ns,'linearGradient'),id='tp-g-'+i+'-'+j;grad.id=id;grad.setAttribute('gradientUnits','userSpaceOnUse');
      for(const [k,v]of Object.entries({x1:a.x,y1:a.y,x2:b.x,y2:b.y}))grad.setAttribute(k,v);
      for(const [pos,color]of [[0,colorA],[1,colorB]]){const stop=document.createElementNS(ns,'stop');stop.setAttribute('offset',pos);stop.setAttribute('stop-color',color);grad.appendChild(stop);}defs.appendChild(grad);
      const linea=document.createElementNS(ns,'line');for(const [k,v]of Object.entries({x1:a.x,y1:a.y,x2:b.x,y2:b.y}))linea.setAttribute(k,v);linea.setAttribute('stroke','url(#'+id+')');lineas.appendChild(linea);
    }
  }
  function situar(it){const lado=it.tamano/WF;it.el.style.transform=`translate(${it.x-lado/2}px,${it.y-lado/2}px)`;dibujarEncuentros();}
  function actualizar(){
    $('tpCuenta').textContent=items.length+' '+(items.length===1?'colonia':'colonias');$('tpVacia').hidden=!!items.length;
    $('tpRecuerdo').disabled=!items.length;dibujarEncuentros();guardar();
  }
  function quitar(it){const i=items.indexOf(it);if(i<0)return;items.splice(i,1);obras.get(it.id)?.destroy();obras.delete(it.id);it.el.remove();actualizar();}
  function crear(estilo,x=360,y=360,tamano=76){
    if(!estilos[estilo]||items.length>=60)return null;
    const it={id:++secuencia,estilo,x,y,tamano},el=document.createElement('button'),cv=document.createElement('canvas');it.el=el;
    el.type='button';el.className='tp-colonia';el.setAttribute('aria-label',GRUPO_NOMBRE[estilos[estilo].g]+'. Arrastrar para mover; Suprimir para quitar.');
    const lado=tamano/WF;el.style.width=el.style.height=lado+'px';el.appendChild(cv);capa.appendChild(el);items.push(it);
    obras.set(it.id,mountColonias(cv,{recipe:pieza(estilos[estilo].style),maxResolution:300}));situar(it);
    let arrastre=null;
    el.addEventListener('pointerdown',ev=>{if(ev.button>0)return;ev.preventDefault();el.setPointerCapture(ev.pointerId);arrastre={p:punto(ev),x:it.x,y:it.y};el.classList.add('tp-arrastrando');});
    el.addEventListener('pointermove',ev=>{if(!arrastre)return;const p=punto(ev);it.x=arrastre.x+p.x-arrastre.p.x;it.y=arrastre.y+p.y-arrastre.p.y;situar(it);});
    const fin=()=>{if(!arrastre)return;arrastre=null;el.classList.remove('tp-arrastrando');
      const d=Math.hypot(it.x-360,it.y-360),limite=350-tamano*.35;if(d>390){quitar(it);return;}
      if(d>limite){it.x=360+(it.x-360)*limite/d;it.y=360+(it.y-360)*limite/d;situar(it);}actualizar();};
    el.addEventListener('pointerup',fin);el.addEventListener('pointercancel',fin);
    el.addEventListener('keydown',ev=>{const pasos={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
      if(ev.key==='Delete'||ev.key==='Backspace'){ev.preventDefault();quitar(it);return;}
      if(pasos[ev.key]){ev.preventDefault();const [dx,dy]=pasos[ev.key],paso=ev.shiftKey?12:4;it.x+=dx*paso;it.y+=dy*paso;const d=Math.hypot(it.x-360,it.y-360),r=350-tamano*.35;if(d>r){it.x=360+(it.x-360)*r/d;it.y=360+(it.y-360)*r/d;}situar(it);guardar();}});
    actualizar();return it;
  }
  estilos.forEach((e,i)=>{
    const b=document.createElement('button'),cv=document.createElement('canvas');b.type='button';b.className='tp-paleta-colonia';b.setAttribute('aria-label','Agregar '+GRUPO_NOMBRE[e.g].toLowerCase());b.appendChild(cv);paleta.appendChild(b);mountColonias(cv,{recipe:pieza(e.style),maxResolution:150});
    let nuevo=null,movido=false,inicio=null;
    b.addEventListener('pointerdown',ev=>{if(ev.button>0)return;ev.preventDefault();b.setPointerCapture(ev.pointerId);inicio={x:ev.clientX,y:ev.clientY};movido=false;});
    b.addEventListener('pointermove',ev=>{if(!inicio)return;if(!movido&&Math.hypot(ev.clientX-inicio.x,ev.clientY-inicio.y)<6)return;movido=true;const p=punto(ev);if(!nuevo)nuevo=crear(i,p.x,p.y,70+i%4*12);if(nuevo){nuevo.x=p.x;nuevo.y=p.y;situar(nuevo);}});
    b.addEventListener('pointerup',ev=>{if(!inicio)return;inicio=null;if(nuevo){if(Math.hypot(nuevo.x-360,nuevo.y-360)>340)quitar(nuevo);else actualizar();nuevo=null;}else{const a=items.length*2.4,r=40+items.length%5*28;crear(i,360+Math.cos(a)*r,360+Math.sin(a)*r,70+i%4*12);}});
    b.addEventListener('pointercancel',()=>{inicio=null;if(nuevo)quitar(nuevo);nuevo=null;});
    b.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();crear(i,360,360,70+i%4*12);}});
  });
  let guardado=[];try{guardado=JSON.parse(localStorage.getItem(clave)||'[]');const encuentros=localStorage.getItem(clave+'-encuentros');if(encuentros!==null)$('tpEncuentros').checked=encuentros==='true';}catch{}
  if(Array.isArray(guardado))for(const it of guardado.slice(0,60))if(Number.isFinite(it.x)&&Number.isFinite(it.y)&&Number.isFinite(it.tamano)&&it.tamano>=40&&it.tamano<=140)crear(it.estilo,it.x,it.y,it.tamano);
  $('tpReiniciar').addEventListener('click',()=>{for(const it of [...items])quitar(it);});
  $('tpEncuentros').addEventListener('change',()=>{dibujarEncuentros();guardar();});
  $('tpContemplar').addEventListener('click',()=>{contemplando=!contemplando;pagina.classList.toggle('tp-contemplando',contemplando);$('tpContemplar').textContent=contemplando?'VOLVER A COMPONER':'CONTEMPLAR';});
  $('tpRecuerdo').addEventListener('click',()=>{
    const cv=document.createElement('canvas');cv.width=cv.height=1600;const c=cv.getContext('2d'),k=1600/800;c.scale(k,k);c.fillStyle='#f2f0e8';c.fillRect(0,0,800,800);c.translate(40,20);
    const fondo=c.createRadialGradient(360,360,0,360,360,360);fondo.addColorStop(0,'#f2edd8');fondo.addColorStop(1,'#e6e8d4');c.fillStyle=fondo;c.beginPath();c.arc(360,360,360,0,Math.PI*2);c.fill();
    c.save();c.clip();
    if($('tpEncuentros').checked)for(let i=0;i<items.length;i++)for(let j=i+1;j<items.length;j++){const a=items[i],b=items[j];if(Math.hypot(a.x-b.x,a.y-b.y)>(a.tamano+b.tamano)*.55)continue;const grad=c.createLinearGradient(a.x,a.y,b.x,b.y);grad.addColorStop(0,PALETA_CARTEL[estilos[a.estilo].g]);grad.addColorStop(1,PALETA_CARTEL[estilos[b.estilo].g]);c.strokeStyle=grad;c.lineWidth=2;c.globalAlpha=.6;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();}c.globalAlpha=1;
    for(const it of items){const lado=it.tamano/WF;c.drawImage(it.el.querySelector('canvas'),it.x-lado/2,it.y-lado/2,lado,lado);}c.restore();c.strokeStyle='rgba(73,84,55,.3)';c.lineWidth=1;c.beginPath();c.arc(360,360,360,0,Math.PI*2);c.stroke();c.fillStyle='#26312d';c.font='18px Arimo,Arial,sans-serif';c.fillText('MICROMUNDOS · TU PLACA',0,760);c.font='14px Arimo,Arial,sans-serif';c.fillText(items.length+(items.length===1?' colonia':' colonias'),590,760);
    const url=cv.toDataURL('image/png');$('tpImagenRecuerdo').src=url;$('tpGuardar').href=url;$('tpVistaRecuerdo').hidden=false;
    for(const el of [board,pagina.querySelector('.tp-leyenda'),pagina.querySelector('.tp-paleta'),pagina.querySelector('.tp-pie')])el.inert=true;$('tpVolver').focus();
  });
  const cerrar=()=>{$('tpVistaRecuerdo').hidden=true;for(const el of [board,pagina.querySelector('.tp-leyenda'),pagina.querySelector('.tp-paleta'),pagina.querySelector('.tp-pie')])el.inert=false;$('tpRecuerdo').focus();};
  $('tpVolver').addEventListener('click',cerrar);pagina.addEventListener('keydown',ev=>{if(ev.key==='Escape'&&!$('tpVistaRecuerdo').hidden){ev.preventDefault();cerrar();}});
  actualizar();
}
