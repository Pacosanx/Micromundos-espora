// Composición pública 1:1: independiente del archivo de muestras y sus semillas.
function prepararTuPlaca(){
  const pagina=$('tuPlaca'),ruta='src/assets/tu-placa/',clave='micromundos-tuplaca-v2',ns='http://www.w3.org/2000/svg';
  pagina.innerHTML=`<div class="tp-indicacion"><span>[04.0]</span><div id="tpReacciones"><label class="tp-check"><input id="tpEncuentros" type="checkbox" checked><span class="tp-check__caja" aria-hidden="true"></span><span>Mostrar reacciones</span></label><p>Una interpretación gráfica de cómo conviven las colonias.</p></div></div><aside id="tpBiblioteca"></aside>
    <div id="tpBoard" class="tp-board" aria-label="Tu placa. Tocar o deslizar para sembrar" tabindex="0"><div class="tp-superficies" aria-hidden="true"><canvas id="tpAroPlaca"></canvas></div><div id="tpColonias"></div><svg id="tpLineas" width="784" height="784" viewBox="0 0 784 784" aria-hidden="true"></svg><div id="tpRotulos"></div><svg id="tpTrazo" width="784" height="784" viewBox="0 0 784 784" aria-hidden="true"><path/></svg><p id="tpVacia">ELEGÍ UNA FORMA\nY SEMBRALA EN LA PLACA</p><div id="tpMenu"></div><p id="tpAvisoQuitar" hidden>SOLTÁ PARA QUITAR</p></div>
    <button id="tpGenerar" class="tp-generar" type="button">GENERAR COMPOSICIÓN ↻</button><div class="tp-acciones"><button id="tpDeshacer" type="button">DESHACER</button><i></i><button id="tpRehacer" type="button">REHACER</button><i></i><button id="tpReiniciar" type="button">VACIAR LA PLACA</button></div><button id="tpRecuerdo" class="tp-guardar" type="button">GUARDAR PLACA →</button><span id="tpCuenta" class="tp-solo-lector" aria-live="polite"></span>
    <div class="tp-recuerdo" id="tpVistaRecuerdo" hidden role="dialog" aria-modal="true" aria-label="Recuerdo de tu placa"><div class="tp-recuerdo-interior"><img id="tpImagenRecuerdo" alt="Tu composición de colonias"><div><button id="tpVolver" type="button">VOLVER A COMPONER</button><a id="tpGuardar" download="micromundos-tu-placa.png">GUARDAR IMAGEN ↗</a></div></div></div><div class="tp-sprites" aria-hidden="true"></div>`;
  const board=$('tpBoard'),capa=$('tpColonias'),items=[],elementos=new Map(),sprites=new Map(),historico=[],futuro=[];
  let secuencia=0,seleccionado=null,arrastre=null,siembra=null,antes=null,frame=0,pedido=false;
  const punto=ev=>{const r=board.getBoundingClientRect();return{x:(ev.clientX-r.left)*784/r.width,y:(ev.clientY-r.top)*784/r.height};};
  const dentro=p=>Math.hypot(p.x-392,p.y-392)<386;
  const hash=n=>{let x=Math.imul(n^0x45d9f3b,0x45d9f3b);x=Math.imul(x^(x>>>16),0x45d9f3b);return ((x^(x>>>16))>>>0)/4294967296;};
  const biblioteca=montarBibliotecaTuPlaca($('tpBiblioteca'),{alPresionar:iniciarBiblioteca,alElegir:(e,teclado)=>{if(teclado){iniciarCambio();sembrar({x:392,y:392},e,true);terminarCambio();}},alModo:()=>menu.cerrar()});
  const modelos=new Map(biblioteca.estilos.map(e=>[e.id,e])),modelo=it=>it.estilo?{id:it.modelo,g:it.grupo||'B',codigo:'Composición',style:it.estilo}:modelos.get(it.modelo);
  const estiloAro={...piezas.find(p=>p.tipo==='placa').it.style};
  const aroCanvas=$('tpAroPlaca'),ladoAro=784/(estiloAro.size/100)/WF;aroCanvas.style.width=aroCanvas.style.height=ladoAro+'px';aroCanvas.style.left=aroCanvas.style.top=(784-ladoAro)/2+'px';
  mountColonias(aroCanvas,{recipe:pieza(estiloAro),maxResolution:1100});aroCanvas.style.width=aroCanvas.style.height=ladoAro+'px';
  const snapshot=()=>JSON.stringify({items,contador:secuencia,reacciones:$('tpEncuentros').checked});
  function guardar(){try{localStorage.setItem(clave,snapshot());}catch{}}
  function iniciarCambio(){if(antes===null)antes=snapshot();}
  function terminarCambio(){if(antes!==null&&antes!==snapshot()){historico.push(antes);if(historico.length>60)historico.shift();futuro.length=0;}antes=null;actualizar();guardar();}
  function restaurar(texto){const s=JSON.parse(texto);items.splice(0,items.length,...s.items);secuencia=Math.max(secuencia,s.contador||0);$('tpEncuentros').checked=s.reacciones!==false;seleccionado=null;menu.cerrar();dibujar();actualizar();guardar();}
  function deshacer(){if(historico.length){futuro.push(snapshot());restaurar(historico.pop());}}
  function rehacer(){if(futuro.length){historico.push(snapshot());restaurar(futuro.pop());}}
  function crear(e,x,y,tamano=e.tamano,parent=null){if(items.length>=120)return null;const it={id:++secuencia,modelo:e.id,x,y,tamano,escala:100,rot:0,foco:100,seed:e.style.seed%1000,parent,manual:false,org:0,sinReacciones:!!e.composicion};items.push(it);return it;}
  function quitar(it){if(!it)return;const ids=new Set([it.id]);for(const a of items)if(ids.has(a.parent))ids.add(a.id);for(let i=items.length-1;i>=0;i--)if(ids.has(items[i].id))items.splice(i,1);if(ids.has(seleccionado?.id))seleccionado=null;menu.cerrar();dibujar();}
  const hijos=it=>items.filter(i=>i.parent===it.id);
  function sincronizarHijos(it){const hs=hijos(it),t=(it.org||0)/100,s=it.escala/100;hs.forEach((h,i)=>{
    const ang=hash(h.id*17)*Math.PI*2,dist=(70+hash(h.id*23)*150)*s;let n=i,k=0;const caps=[8,14,20],radios=[95,165,235];while(n>=caps[k]&&k<2){n-=caps[k++];}const oa=2*Math.PI*n/caps[k]+(k%2?Math.PI/caps[k]:0)-Math.PI/2;
    h.seed=it.seed;h.foco=it.foco;h.rot=it.rot+(hash(h.id*13)-.5)*160*(1-t);h.escala=it.escala*((.5+hash(h.id*37)*.4)*.9*(1-t)+.6*t);
    if(!h.manual){h.x=it.x+Math.cos(ang)*dist*(1-t)+Math.cos(oa)*radios[k]*s*t;h.y=it.y+Math.sin(ang)*dist*(1-t)+Math.sin(oa)*radios[k]*s*t;const d=Math.hypot(h.x-392,h.y-392);if(d>340){h.x=392+(h.x-392)*340/d;h.y=392+(h.y-392)*340/d;}}
  });}
  const menu=montarMenuTuPlaca($('tpMenu'),{obtener:()=>seleccionado?{...seleccionado,duplicados:hijos(seleccionado).length}:null,empezar:iniciarCambio,terminar:terminarCambio,
    quitar:()=>{iniciarCambio();quitar(seleccionado);terminarCambio();},cambiar:(k,v)=>{
      const it=seleccionado;if(!it)return;
      if(k==='duplicar'){let hs=hijos(it);while(hs.length<v&&items.length<120){const h=crear(modelo(it),it.x,it.y,it.tamano,it.id);if(!h)break;if(it.estilo){h.estilo={...it.estilo};h.grupo=it.grupo;}hs.push(h);}while(hs.length>v){const h=hs.pop();items.splice(items.indexOf(h),1);}}
      else if(k==='orden'){it.org=v;for(const h of hijos(it))h.manual=false;}
      else it[k==='tamano'?'escala':k==='girar'?'rot':k==='variacion'?'seed':'foco']=v;
      sincronizarHijos(it);solicitarDibujo();menu.actualizar();
    }});
  function sprite(it){const m=modelo(it),key=m.id+'-'+it.seed;if(sprites.has(key))return sprites.get(key).canvas;
    const canvas=document.createElement('canvas');canvas.style.width='280px';pagina.querySelector('.tp-sprites').appendChild(canvas);
    const obra=mountColonias(canvas,{recipe:pieza({...m.style,seed:it.seed}),maxResolution:280});sprites.set(key,{canvas,obra});
    if(sprites.size>90){const [vieja,s]=sprites.entries().next().value;s.obra.destroy();s.canvas.remove();sprites.delete(vieja);}return canvas;
  }
  function dibujar(){
    for(const [id,el]of elementos)if(!items.some(i=>i.id===id)){el.remove();elementos.delete(id);}
    for(const it of items){let el=elementos.get(it.id);
      if(!el){el=document.createElement('button');el.type='button';el.className='tp-colonia';el.dataset.colonia=String(it.id);el.innerHTML='<canvas></canvas>';capa.appendChild(el);elementos.set(it.id,el);const id=it.id;el.addEventListener('pointerdown',ev=>{const actual=items.find(i=>i.id===id);if(actual)iniciarArrastre(ev,actual);});el.addEventListener('keydown',ev=>{const actual=items.find(i=>i.id===id);if(actual)tecladoColonia(ev,actual);});}
      const lado=it.tamano*it.escala/100/WF,primera=!el.dataset.pintado;el.style.width=el.style.height=lado+'px';el.style.transform=`translate(${it.x-lado/2}px,${it.y-lado/2}px) rotate(${it.rot}deg)`;
      if(primera&&it.parent&&!matchMedia('(prefers-reduced-motion: reduce)').matches){const padre=items.find(p=>p.id===it.parent);if(padre)el.animate([{transform:`translate(${padre.x-lado/2}px,${padre.y-lado/2}px) rotate(${it.rot}deg) scale(.1)`,opacity:0},{transform:el.style.transform,opacity:1}],{duration:450,easing:'cubic-bezier(.3,.9,.3,1)'});}el.dataset.pintado='1';
      el.style.filter=`blur(${.4+(100-it.foco)*.06}px)`;el.classList.toggle('tp-arrastrando',arrastre?.it===it);el.classList.toggle('tp-colonia-fuera',arrastre?.it===it&&!dentro(it));
      el.setAttribute('aria-label',GRUPO_NOMBRE[modelo(it).g]+', '+modelo(it).codigo+'. Tocar para editar; arrastrar para mover.');el.setAttribute('aria-expanded',String(seleccionado===it&&!$('tpMenu').hidden));
      const key=it.modelo+'-'+it.seed;if(el.dataset.textura!==key){const fuente=sprite(it),cv=el.querySelector('canvas');cv.width=fuente.width;cv.height=fuente.height;cv.getContext('2d').drawImage(fuente,0,0);el.dataset.textura=key;}
      el.querySelector('canvas').style.maskImage=el.querySelector('canvas').style.webkitMaskImage='none';
    }
    dibujarReacciones();if(seleccionado)menu.situar(seleccionado.x,seleccionado.y);pedido=false;
  }
  function solicitarDibujo(){if(!pedido){pedido=true;frame=requestAnimationFrame(dibujar);}}
  function actualizar(){const n=items.length;$('tpCuenta').textContent=n+(n===1?' colonia':' colonias');$('tpVacia').hidden=!!n;$('tpRecuerdo').disabled=!n;$('tpDeshacer').disabled=!historico.length;$('tpRehacer').disabled=!futuro.length;$('tpReiniciar').disabled=!n;}
  function abrirMenu(it){if(seleccionado===it&&!$('tpMenu').hidden){menu.cerrar();return;}seleccionado=it;menu.abrir(it.x,it.y);dibujar();}
  function iniciarArrastre(ev,it){if(ev.button>0)return;ev.preventDefault();ev.stopPropagation();iniciarCambio();const p=punto(ev);arrastre={it,inicio:p,x:it.x,y:it.y,movido:false};elementos.get(it.id).setPointerCapture?.(ev.pointerId);}
  function tecladoColonia(ev,it){if(['Enter',' '].includes(ev.key)){ev.preventDefault();abrirMenu(it);return;}if(['Delete','Backspace'].includes(ev.key)){ev.preventDefault();iniciarCambio();quitar(it);terminarCambio();return;}
    const d={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[ev.key];if(d){ev.preventDefault();iniciarCambio();it.x+=d[0]*(ev.shiftKey?12:4);it.y+=d[1]*(ev.shiftKey?12:4);if(it.parent)it.manual=true;sincronizarHijos(it);dibujar();terminarCambio();}}
  function sembrar(p,e=biblioteca.seleccionado(),teclado=false){if(!dentro(p))return null;const nuevo=crear(e,p.x,p.y);if(!nuevo)return null;
    if(biblioteca.modo()==='grupo')for(let i=0;i<6;i++){const a=i*Math.PI/3,r=22+hash(nuevo.id+i)*36,q={x:p.x+Math.cos(a)*r,y:p.y+Math.sin(a)*r};if(dentro(q))crear(e,q.x,q.y,e.tamano*(.4+hash(nuevo.id+i*9)*.3));}
    dibujar();actualizar();if(teclado)elementos.get(nuevo.id)?.focus({preventScroll:true});return nuevo;
  }
  function iniciarBiblioteca(ev,e){if(ev.button>0)return;ev.preventDefault();menu.cerrar();siembra={origen:'biblioteca',estilo:e,inicio:{x:ev.clientX,y:ev.clientY},puntos:[],ultimo:null,recorrido:0};const cv=document.createElement('canvas'),origen=ev.currentTarget.querySelector('canvas');cv.width=origen.width;cv.height=origen.height;cv.getContext('2d').drawImage(origen,0,0);cv.className='tp-arrastre-biblioteca';cv.style.width=cv.style.height=e.tamano/WF+'px';pagina.appendChild(cv);siembra.fantasma=cv;moverFantasma(ev);ev.currentTarget.setPointerCapture?.(ev.pointerId);}
  function moverFantasma(ev){const f=siembra?.fantasma;if(!f)return;const r=pagina.getBoundingClientRect(),escala=r.width/pagina.offsetWidth;f.style.left=(ev.clientX-r.left)/escala+'px';f.style.top=(ev.clientY-r.top)/escala+'px';f.hidden=dentro(punto(ev));}
  board.addEventListener('pointerdown',ev=>{if(ev.target.closest('button,.tp-menu')||ev.button>0)return;ev.preventDefault();menu.cerrar();const p=punto(ev);if(!dentro(p))return;iniciarCambio();siembra={origen:'placa',estilo:biblioteca.seleccionado(),inicio:{x:ev.clientX,y:ev.clientY},puntos:[],ultimo:p,recorrido:0};board.setPointerCapture?.(ev.pointerId);sembrar(p);siembra.puntos.push(p);});
  board.addEventListener('keydown',ev=>{if(ev.target===board&&['Enter',' '].includes(ev.key)){ev.preventDefault();iniciarCambio();sembrar({x:392,y:392},biblioteca.seleccionado(),true);terminarCambio();}});
  pagina.addEventListener('pointermove',ev=>{
    if(arrastre){const p=punto(ev),a=arrastre;if(!a.movido&&Math.hypot(p.x-a.inicio.x,p.y-a.inicio.y)<6)return;a.movido=true;menu.cerrar();a.it.x=a.x+p.x-a.inicio.x;a.it.y=a.y+p.y-a.inicio.y;if(a.it.parent)a.it.manual=true;sincronizarHijos(a.it);$('tpAvisoQuitar').hidden=dentro(a.it);solicitarDibujo();return;}
    if(!siembra)return;moverFantasma(ev);const p=punto(ev);if(!dentro(p))return;if(siembra.origen==='biblioteca'&&Math.hypot(ev.clientX-siembra.inicio.x,ev.clientY-siembra.inicio.y)<8)return;
    if(siembra.ultimo===null){iniciarCambio();const cantidad=items.length;sembrar(p,siembra.estilo);siembra.nuevos=items.slice(cantidad);siembra.ultimo=p;siembra.puntos.push(p);}
    if(siembra.origen==='biblioteca'||biblioteca.modo()!=='estria'){
      if(siembra.origen==='biblioteca'){for(const it of siembra.nuevos||[]){it.x+=p.x-siembra.ultimo.x;it.y+=p.y-siembra.ultimo.y;}siembra.ultimo=p;solicitarDibujo();}return;
    }
    const d=Math.hypot(p.x-siembra.ultimo.x,p.y-siembra.ultimo.y),paso=9+24*Math.exp(-siembra.recorrido/100);if(d<paso)return;
    siembra.recorrido+=d;crear(siembra.estilo,p.x,p.y,Math.max(4,siembra.estilo.tamano*.42*Math.exp(-siembra.recorrido/130)));siembra.ultimo=p;siembra.puntos.push(p);$('tpTrazo').querySelector('path').setAttribute('d',siembra.puntos.map((q,i)=>(i?'L':'M')+q.x+','+q.y).join(''));solicitarDibujo();
  });
  function soltar(ev,cancelado=false){if(arrastre){const a=arrastre;arrastre=null;$('tpAvisoQuitar').hidden=true;if(cancelado){a.it.x=a.x;a.it.y=a.y;}else if(!a.movido)abrirMenu(a.it);else if(!dentro(a.it))quitar(a.it);dibujar();terminarCambio();}if(siembra){siembra.fantasma?.remove();if(siembra.origen==='biblioteca'&&(cancelado||!dentro(punto(ev)))){for(const it of siembra.nuevos||[]){const idx=items.indexOf(it);if(idx>=0)items.splice(idx,1);}dibujar();}siembra=null;$('tpTrazo').querySelector('path').setAttribute('d','');terminarCambio();}}
  pagina.addEventListener('pointerup',ev=>soltar(ev));pagina.addEventListener('pointercancel',ev=>soltar(ev,true));pagina.addEventListener('pointerdown',ev=>{if(!ev.target.closest('.tp-colonia,.tp-menu'))menu.cerrar();});
  pagina.addEventListener('keydown',ev=>{if(ev.key==='Escape'){menu.cerrar();cerrarReaccion();}if((ev.ctrlKey||ev.metaKey)&&ev.key.toLowerCase()==='z'){ev.preventDefault();ev.shiftKey?rehacer():deshacer();}});
  $('tpGenerar').addEventListener('click',()=>{iniciarCambio();menu.cerrar();cerrarReaccion();items.length=0;seleccionado=null;const composicion=generarComposicionTuPlaca(),dimension=784/composicion.diametroAro;
    for(const [n,e]of composicion.entries()){const grupo={green:'M',yellow:'L',rose:'B'}[e.familia]||'B',it=crear(modelos.get(grupo+'-A-01'),392+(e.x-.5)*dimension,392+(e.y-.5)*dimension,e.w*dimension);if(it){it.modelo='generada-'+it.id;it.estilo={...e.style};it.grupo=grupo;it.seed=e.style.seed;it.foco=100;it.sinReacciones=true;}}
    dibujar();terminarCambio();});
  $('tpDeshacer').addEventListener('click',deshacer);$('tpRehacer').addEventListener('click',rehacer);$('tpReiniciar').addEventListener('click',()=>{iniciarCambio();items.length=0;seleccionado=null;menu.cerrar();cerrarReaccion();dibujar();terminarCambio();});$('tpEncuentros').addEventListener('change',()=>{menu.cerrar();cerrarReaccion();dibujar();actualizar();guardar();});
  const textosReacciones={Simbiosis:['Bacteria + levadura','Bacterias lácticas y levaduras viven juntas, cada una aprovecha un alimento distinto y, entre las dos, fermentan la masa madre.'],Rechazo:['Moho + bacteria','En esta representación, el moho deja una zona libre a su alrededor y la bacteria queda recortada.'],Barrera:['Moho + otro moho','En esta representación, las colonias conservan una franja libre donde se encuentran.']};
  let popup=null,cancelarPopup=()=>{},relacionesVisibles=[];
  function cerrarReaccion(){cancelarPopup();cancelarPopup=()=>{};popup?.remove();popup=null;}
  function abrirReaccion(tipo){cerrarReaccion();const datos=textosReacciones[tipo];
    popup=$('plantillaCartelGlosario').content.firstElementChild.cloneNode(true);popup.classList.remove('cartel-glosario');popup.classList.add('cartel-especie','cartel-reaccion');popup.style.width='402px';popup.querySelector('.nom').textContent=tipo;popup.querySelector('.nom').style.textTransform='none';popup.querySelector('.cod').textContent='';popup.querySelector('.definicionGlosario').textContent=datos[1];popup.querySelector('.masCartel')?.remove();popup.querySelector('.detalleCartel')?.remove();
    const p=document.createElement('p');p.className='tp-reaccion-combinacion';p.textContent=datos[0];popup.querySelector('.co').appendChild(p);$('anclaCarteles').appendChild(popup);universoCartel(popup,'B');ubicarCartelFlotante(popup);
    const el=popup;cancelarPopup=activarArrastreCartel(el,p=>{el.style.transform=`translate(${p.x}px,${p.y}px)`;},cerrarReaccion);requestAnimationFrame(()=>el.isConnected&&el.classList.add('vis'));
  }
  function dibujarReacciones(){
    const svg=$('tpLineas'),rotulos=$('tpRotulos');svg.replaceChildren();rotulos.replaceChildren();relacionesVisibles=[];if(!$('tpEncuentros').checked)return;
    const vistos=new Set();let numero=0;
    for(let i=0;i<items.length;i++)for(let j=i+1;j<items.length;j++){
      const a=items[i],b=items[j];if(a.sinReacciones||b.sinReacciones)continue;const ga=modelo(a).g,gb=modelo(b).g,ra=a.tamano*a.escala/200,rb=b.tamano*b.escala/200,dist=Math.hypot(a.x-b.x,a.y-b.y);if(dist>ra+rb+14||dist<2)continue;
      const tipo=(ga==='B'&&gb==='L'||ga==='L'&&gb==='B')?'Simbiosis':(ga==='M'&&gb==='B'||ga==='B'&&gb==='M')?'Rechazo':ga==='M'&&gb==='M'?'Barrera':null;if(!tipo)continue;
      const cx=(a.x+b.x)/2,cy=(a.y+b.y)/2,r=Math.max(ra,rb)+35;relacionesVisibles.push({a,b,tipo,cx,cy,r,dist});
      if(tipo==='Simbiosis'){
        const defs=document.createElementNS(ns,'defs'),g=document.createElementNS(ns,'radialGradient');g.id='tp-simbiosis-'+numero;for(const [offset,color,opacity]of [[0,'#ffc21c',.55],[1,'#f58bc3',0]]){const s=document.createElementNS(ns,'stop');s.setAttribute('offset',offset);s.setAttribute('stop-color',color);s.setAttribute('stop-opacity',opacity);g.appendChild(s);}defs.appendChild(g);svg.appendChild(defs);const c=document.createElementNS(ns,'circle');for(const [k,v]of Object.entries({cx,cy,r:r*.65,fill:'url(#'+g.id+')'}))c.setAttribute(k,v);svg.appendChild(c);
      }else if(tipo==='Rechazo'){
        const bacteria=ga==='B'?a:b,moho=ga==='M'?a:b,el=elementos.get(bacteria.id),lado=bacteria.tamano*bacteria.escala/100/WF,mr=moho.tamano*moho.escala/200;
        const ang=-bacteria.rot*Math.PI/180,dx=moho.x-bacteria.x,dy=moho.y-bacteria.y;
        const mask=`radial-gradient(circle at ${lado/2+dx*Math.cos(ang)-dy*Math.sin(ang)}px ${lado/2+dx*Math.sin(ang)+dy*Math.cos(ang)}px,transparent ${mr*.9}px,#000 ${mr+7}px)`;el.querySelector('canvas').style.maskImage=el.querySelector('canvas').style.webkitMaskImage=mask;
      }else{
        const ang=Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI;
        for(const [it,inverso]of [[a,false],[b,true]]){const el=elementos.get(it.id),lado=it.tamano*it.escala/100/WF,limite=lado/2+dist/2-4,mask=`linear-gradient(${ang+(inverso?270:90)-it.rot}deg,#000 ${limite-2}px,transparent ${limite+2}px)`;el.querySelector('canvas').style.maskImage=el.querySelector('canvas').style.webkitMaskImage=mask;}
      }
      if(numero++>=10||vistos.has(tipo))continue;vistos.add(tipo);const ring=document.createElementNS(ns,'circle');for(const [k,v]of Object.entries({cx,cy,r,class:'tp-reaccion-aro'}))ring.setAttribute(k,v);svg.appendChild(ring);
      const bton=document.createElement('button');bton.type='button';bton.textContent=tipo.toUpperCase();bton.style.left=clamp(cx-r,12,620)+'px';bton.style.top=clamp(cy-r*.65,12,740)+'px';bton.setAttribute('aria-label','Acerca de '+tipo);bton.addEventListener('click',ev=>{ev.stopPropagation();abrirReaccion(tipo);});rotulos.appendChild(bton);
    }
  }
  function pintarRecuerdo(){
    dibujar();const cv=document.createElement('canvas');cv.width=cv.height=1600;const c=cv.getContext('2d');c.fillStyle='#f2f0e8';c.fillRect(0,0,1600,1600);c.save();c.scale(1600/860,1600/860);c.translate(38,20);c.drawImage(aroCanvas,(784-ladoAro)/2,(784-ladoAro)/2,ladoAro,ladoAro);c.save();c.beginPath();c.arc(392,392,392,0,Math.PI*2);c.clip();
    for(const it of items){const lado=it.tamano*it.escala/100/WF;c.save();
      for(const rel of relacionesVisibles){const otro=rel.a===it?rel.b:rel.b===it?rel.a:null;if(!otro)continue;
        if(rel.tipo==='Rechazo'&&modelo(it).g==='B'){const r=otro.tamano*otro.escala/200;c.beginPath();c.rect(-1000,-1000,3000,3000);c.arc(otro.x,otro.y,r,0,Math.PI*2,true);c.clip('evenodd');}
        if(rel.tipo==='Barrera'){const nx=(otro.x-it.x)/rel.dist,ny=(otro.y-it.y)/rel.dist,mx=(it.x+otro.x)/2-nx*4,my=(it.y+otro.y)/2-ny*4,t=2000;c.beginPath();c.moveTo(mx-ny*t,my+nx*t);c.lineTo(mx+ny*t,my-nx*t);c.lineTo(mx+ny*t-nx*t,my-nx*t-ny*t);c.lineTo(mx-ny*t-nx*t,my+nx*t-ny*t);c.closePath();c.clip();}
      }
      c.translate(it.x,it.y);c.rotate(it.rot*Math.PI/180);c.filter=`blur(${.4+(100-it.foco)*.06}px)`;c.drawImage(sprite(it),-lado/2,-lado/2,lado,lado);c.restore();
    }
    for(const rel of relacionesVisibles)if(rel.tipo==='Simbiosis'){const g=c.createRadialGradient(rel.cx,rel.cy,0,rel.cx,rel.cy,rel.r*.65);g.addColorStop(0,'#ffc21c88');g.addColorStop(1,'#f58bc300');c.fillStyle=g;c.beginPath();c.arc(rel.cx,rel.cy,rel.r*.65,0,Math.PI*2);c.fill();}
    c.restore();c.restore();c.fillStyle='#26312d';c.font='26px Arimo,Arial,sans-serif';c.fillText('MICROMUNDOS · TU PLACA',70,1550);return cv.toDataURL('image/png');
  }
  $('tpRecuerdo').addEventListener('click',()=>{menu.cerrar();cerrarReaccion();const url=pintarRecuerdo();$('tpImagenRecuerdo').src=url;$('tpGuardar').href=url;$('tpVistaRecuerdo').hidden=false;for(const el of [board,$('tpBiblioteca'),pagina.querySelector('.tp-acciones'),$('tpRecuerdo'),$('tpGenerar')])el.inert=true;$('tpVolver').focus();});
  function cerrarRecuerdo(){$('tpVistaRecuerdo').hidden=true;for(const el of [board,$('tpBiblioteca'),pagina.querySelector('.tp-acciones'),$('tpRecuerdo')])el.inert=false;$('tpRecuerdo').focus();}
  $('tpVolver').addEventListener('click',cerrarRecuerdo);pagina.addEventListener('keydown',ev=>{if(ev.key==='Escape'&&!$('tpVistaRecuerdo').hidden)cerrarRecuerdo();});
  document.addEventListener('cerrar-tuplaca',()=>{menu.cerrar();cerrarReaccion();if(!$('tpVistaRecuerdo').hidden)cerrarRecuerdo();});
  try{const guardado=JSON.parse(localStorage.getItem(clave)||'null');if(guardado&&Array.isArray(guardado.items)){for(const it of guardado.items.slice(0,120))if((modelos.has(it.modelo)||it.estilo)&&[it.x,it.y,it.tamano,it.escala,it.rot,it.foco,it.seed].every(Number.isFinite))items.push(it);secuencia=Math.max(guardado.contador||0,...items.map(i=>i.id));$('tpEncuentros').checked=guardado.reacciones!==false;}
    else{const viejo=JSON.parse(localStorage.getItem('micromundos-tuplaca-v1')||'[]');if(Array.isArray(viejo))for(const it of viejo.slice(0,60)){const grupo=['B','L','M'][Math.floor(it.estilo/4)],estado=it.estilo%4===3?'R':it.estilo%4===2?'C':'A',m=modelos.get(grupo+'-'+estado+'-01');if(m&&[it.x,it.y,it.tamano].every(Number.isFinite))crear(m,it.x*784/720,it.y*784/720,it.tamano);}}
  }catch{}
  dibujar();actualizar();guardar();
}
