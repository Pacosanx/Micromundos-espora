// Composición pública 1:1: independiente del archivo de muestras y sus semillas.
// 18/11/2026: la lógica de la Placa de encuentros del muestrario pasa a ser el motor de TU PLACA.
//   Fijo: biblioteca (tipo), perilla de reacciones en el borde de la placa, leyenda de encuentros, GENERAR (tocar / mantener).
//   Contextual 1: tocar una colonia (Tamaño, Girar, Foco, Opacidad, Multiplicar, Variación y TRANSFORMAR, marcado).
//   Contextual 2: Transformar (tu-placa-editor.js).
//   Sin menú: tocar el fondo = sembrar; arrastrar por el fondo = lazo; acercar colonias = encuentro; sacarlas = quitar.
// Dibujo y encuentros: MotorMuestrario (tu-placa-motor.js), el mismo código del muestrario.
function prepararTuPlaca(){
  const pagina=$('tuPlaca'),ruta='src/assets/tu-placa/',clave='micromundos-tuplaca-v2',ns='http://www.w3.org/2000/svg';
  pagina.innerHTML=`<div class="tp-indicacion"><span>[04.0]</span><div id="tpReacciones" hidden></div></div><aside id="tpBiblioteca"></aside>
    <div id="tpBoard" class="tp-board" aria-label="Tu placa. Arrastrá una forma de la biblioteca para sembrarla; arrastrá sobre la placa para elegir varias" tabindex="0"><div class="tp-superficies" aria-hidden="true"><canvas id="tpAroPlaca"></canvas></div><canvas id="tpEscena" class="tp-escena" aria-hidden="true"></canvas><div id="tpColonias"></div><svg id="tpLineas" width="784" height="784" viewBox="0 0 784 784" aria-hidden="true"></svg><div id="tpRotulos"></div><svg id="tpTrazo" width="784" height="784" viewBox="0 0 784 784" aria-hidden="true"><path/></svg><svg id="tpPerilla" class="tp-perilla" width="784" height="784" viewBox="0 0 784 784"></svg><p id="tpVacia">ARRASTRÁ UNA COLONIA\nHASTA LA PLACA</p><div id="tpMenu"></div><div id="tpEditor"></div><p id="tpAvisoQuitar" hidden>SOLTÁ PARA QUITAR</p></div>
    <button id="tpGenerar" class="tp-generar" type="button" aria-haspopup="true">GENERAR COMPOSICIÓN ↻</button><p class="tp-generar-ayuda" id="tpGenerarAyuda">MANTENÉ APRETADO PARA ELEGIR LA ESTRUCTURA</p><div id="tpEstructuras" class="tp-menu tp-menu-estructuras tp-estructuras" hidden role="menu" aria-label="Estructura de la composición"><i class="tp-estructuras-eje" aria-hidden="true"></i></div><div class="tp-acciones"><button id="tpDeshacer" type="button">DESHACER</button><i></i><button id="tpRehacer" type="button">REHACER</button><i></i><button id="tpReiniciar" type="button">VACIAR LA PLACA</button></div><button id="tpRecuerdo" class="tp-guardar" type="button">GUARDAR PLACA ${FLECHA_DIAGONAL}</button><span id="tpCuenta" class="tp-solo-lector" aria-live="polite"></span>
    <div class="tp-recuerdo" id="tpVistaRecuerdo" hidden role="dialog" aria-modal="true" aria-label="Recuerdo de tu placa"><div class="tp-recuerdo-interior"><img id="tpImagenRecuerdo" alt="Tu composición de colonias"><div><button id="tpVolver" type="button">VOLVER A COMPONER</button><a id="tpGuardar" download="micromundos-tu-placa.png">GUARDAR IMAGEN ${FLECHA_DIAGONAL}</a><button id="tpVerOtras" type="button">VER PLACAS DE OTRAS PERSONAS</button></div></div></div><section class="tp-otras" id="tpOtras" hidden role="dialog" aria-modal="true" aria-labelledby="tpOtrasTitulo"><header class="tp-otras-cabeza"><span>[04.2]</span><h2 id="tpOtrasTitulo">Placas de otras personas</h2><p>Las placas que guardaron las personas que pasaron por Micromundos.</p></header><ol class="tp-otras-grilla" data-gesto-propio tabindex="0" aria-label="Placas de otras personas: arrastrá para recorrerlas"></ol><div class="tp-otras-acciones"><button id="tpOtrasVolver" type="button">VOLVER A COMPONER</button></div></section>`;
  const board=$('tpBoard'),capa=$('tpColonias'),items=[],elementos=new Map(),historico=[],futuro=[];
  let zoom=100,giro=0,secuencia=0,seleccionado=null,seleccion=[],arrastre=null,siembra=null,lazo=null,antes=null,frame=0,pedido=false,intensidad=85,estructura='propuesta';
  const punto=ev=>{const r=board.getBoundingClientRect();return{x:(ev.clientX-r.left)*784/r.width,y:(ev.clientY-r.top)*784/r.height};};
  const dentro=p=>Math.hypot(p.x-392,p.y-392)<386;
  const hash=n=>{let x=Math.imul(n^0x45d9f3b,0x45d9f3b);x=Math.imul(x^(x>>>16),0x45d9f3b);return ((x^(x>>>16))>>>0)/4294967296;};
  const biblioteca=montarBibliotecaTuPlaca($('tpBiblioteca'),{alPresionar:iniciarBiblioteca,alElegir:(e,teclado)=>{if(teclado){iniciarCambio();sembrar({x:392,y:392},e,true);terminarCambio();}},alModo:()=>cerrarMenus()});
  const modelos=new Map(biblioteca.estilos.map(e=>[e.id,e])),modelo=it=>it.estilo?{id:it.modelo,g:it.grupo||'B',codigo:'Composición',style:it.estilo}:modelos.get(it.modelo);
  const estiloBase=it=>({...modelo(it).style,seed:it.seed});
  const FAMILIA={B:'rosa',L:'amarillo',M:'verde',BL:'rosa'},familiaDe=it=>FAMILIA[modelo(it).g]||'rosa';
  // Ajustes del primer editor (18/11, con el motor viejo) → parámetros del motor del muestrario.
  function migrarAjustes(a){if(!a||!['expansion','expansionDir','arc','ringWidth'].some(k=>k in a))return a;const m={};
    for(const [k,v] of Object.entries(a)){if(k==='expansion')m.detail=Math.round(v*2.2);else if(k==='expansionDir')m.rotation=v;else if(k==='arc')m.cutOpening=v;else if(k==='ringWidth')m.ringThickness=v;else m[k]=v;}return m;}
  // Estilo con el que el motor dibuja la colonia: biblioteca o composición + lo editado en TRANSFORMAR + la opacidad del menú.
  const estiloItem=it=>{const s=MotorMuestrario.estiloColonia(estiloBase(it),it.ajustes||{},familiaDe(it));s.opacity=(s.opacity??100)*(it.opacidad??100)/100;return s;};
  const estiloAro={...piezas.find(p=>p.tipo==='placa').it.style};
  const aroCanvas=$('tpAroPlaca'),ladoAro=784/(estiloAro.size/100)/WF;aroCanvas.style.width=aroCanvas.style.height=ladoAro+'px';aroCanvas.style.left=aroCanvas.style.top=(784-ladoAro)/2+'px';
  mountColonias(aroCanvas,{recipe:pieza(estiloAro),maxResolution:1100});aroCanvas.style.width=aroCanvas.style.height=ladoAro+'px';
  const snapshot=()=>JSON.stringify({items,contador:secuencia,intensidad,estructura,zoom,giro});
  function guardar(){try{localStorage.setItem(clave,snapshot());}catch{}}
  function iniciarCambio(){if(antes===null)antes=snapshot();}
  // Interruptor de REACCIONES (19/11/2026, Paco): círculo negro y palabra en negrita = activas; círculo en trazo y palabra
  // regular más clara = apagadas. Apagadas, las colonias no reaccionan entre sí (intensidad 0). Entra en el historial.
  const INTENSIDAD_REACCIONES=85;
  const interruptor=document.createElement('button');interruptor.type='button';interruptor.id='tpInterruptorReacciones';
  interruptor.innerHTML='<i aria-hidden="true"></i><span>REACCIONES</span>';pagina.appendChild(interruptor);
  const pintarInterruptor=()=>{const activas=intensidad>0;interruptor.classList.toggle('activas',activas);interruptor.setAttribute('aria-pressed',String(activas));
    interruptor.setAttribute('aria-label','Reacciones '+(activas?'activas: tocar para apagarlas':'apagadas: tocar para activarlas'));};
  interruptor.addEventListener('click',()=>{iniciarCambio();intensidad=intensidad>0?0:INTENSIDAD_REACCIONES;dibujar();terminarCambio();});
  function terminarCambio(){if(antes!==null&&antes!==snapshot()){historico.push(antes);if(historico.length>60)historico.shift();futuro.length=0;}antes=null;actualizar();guardar();}
  function restaurar(texto){const s=JSON.parse(texto);zoom=Number.isFinite(s.zoom)?s.zoom:100;giro=Number.isFinite(s.giro)?s.giro:0;items.splice(0,items.length,...s.items);secuencia=Math.max(secuencia,s.contador||0);intensidad=Number.isFinite(s.intensidad)?s.intensidad:85;estructura=s.estructura||estructura;seleccionado=null;seleccion=[];cerrarMenus();dibujar();actualizar();guardar();}
  function deshacer(){if(historico.length){futuro.push(snapshot());restaurar(historico.pop());}}
  function rehacer(){if(futuro.length){historico.push(snapshot());restaurar(futuro.pop());}}
  function crear(e,x,y,tamano=e.tamano,parent=null){if(items.length>=120)return null;const it={id:++secuencia,modelo:e.id,x,y,tamano,escala:100,rot:0,foco:100,opacidad:100,seed:e.style.seed%1000,parent,manual:false,org:0,sinReacciones:!!e.composicion&&e.estado!=='AF'};items.push(it);return it;}
  function quitar(it){if(!it)return;const ids=new Set([it.id]);for(const a of items)if(ids.has(a.parent))ids.add(a.id);for(let i=items.length-1;i>=0;i--)if(ids.has(items[i].id))items.splice(i,1);if(ids.has(seleccionado?.id))seleccionado=null;seleccion=seleccion.filter(s=>!ids.has(s.id));cerrarMenus();dibujar();}
  const hijos=it=>items.filter(i=>i.parent===it.id);
  // MULTIPLICAR (19/11/2026): las copias van pegadas a la colonia madre, en anillos que se tocan (uno alrededor del otro),
  // todas del mismo tamaño aproximado. Antes quedaban dispersas lejos de la madre.
  function sincronizarHijos(it){const hs=hijos(it);if(!hs.length)return;const s=it.escala/100,fs=(estiloBase(it).size??100)/100,ESC=.6;
    const rp=it.tamano*s/2*fs,rc=it.tamano*s*ESC/2*fs;let k=0,n=0,cap=0,r=0;
    const anillo=()=>{r=rp+rc*(1+2*k)*.92;cap=Math.max(6,Math.floor(2*Math.PI*r/(2*rc*.96)));};anillo();
    hs.forEach(h=>{if(n>=cap){k++;n=0;anillo();}const a=2*Math.PI*n/cap+(k%2?Math.PI/cap:0)-Math.PI/2;n++;
      h.seed=it.seed;h.foco=it.foco;h.opacidad=it.opacidad??100;h.ajustes=it.ajustes?{...it.ajustes}:undefined;h.rot=it.rot+(hash(h.id*13)-.5)*40;h.escala=it.escala*ESC*(.94+hash(h.id*37)*.12);
      if(!h.manual){h.x=it.x+Math.cos(a)*r;h.y=it.y+Math.sin(a)*r;const d=Math.hypot(h.x-392,h.y-392);if(d>340){h.x=392+(h.x-392)*340/d;h.y=392+(h.y-392)*340/d;}}
    });}

  // Selección: una colonia (tocar) o varias (lazo). El menú y el editor actúan sobre todas.
  const elegidas=()=>seleccion.length?seleccion.filter(s=>items.includes(s)):seleccionado?[seleccionado]:[];
  function centro(){const g=elegidas();if(!g.length)return null;return {x:g.reduce((n,i)=>n+i.x,0)/g.length,y:g.reduce((n,i)=>n+i.y,0)/g.length};}
  function cerrarMenus(){menu.cerrar();editor?.cerrar();cerrarEstructuras();}
  const menu=montarMenuTuPlaca($('tpMenu'),{obtener:()=>seleccionado?{...seleccionado,duplicados:hijos(seleccionado).length}:null,empezar:iniciarCambio,terminar:terminarCambio,
    quitar:()=>{iniciarCambio();quitar(seleccionado);terminarCambio();},
    variar:()=>{for(const it of elegidas()){it.seed=Math.floor(Math.random()*1000);sincronizarHijos(it);}dibujar();},
    transformar:()=>{if(!seleccionado)return;menu.cerrar();editor.abrir();animarPerilla(false);},
    // 19/11/2026: GIRAR solo cuando la forma no es simétrica: más de 50 % de irregularidad, dos lóbulos o más, recorte o expansión (Paco).
    girable:()=>{if(!seleccionado)return false;const st=MotorMuestrario.estiloColonia(estiloBase(seleccionado),migrarAjustes(seleccionado.ajustes)||{},familiaDe(seleccionado));
      const recortable=!['pair','band','capsule'].includes(st.shape);
      return st.irregularity>50||st.studyLobes>=2||(recortable&&st.cutOpening<360)||(st.shape==='fan'&&(st.detail||0)>0);},
    cambiar:(k,v)=>{
      for(const it of elegidas()){
        if(k==='duplicar'){let hs=hijos(it);while(hs.length<v&&items.length<120){const h=crear(modelo(it),it.x,it.y,it.tamano,it.id);if(!h)break;if(it.estilo){h.estilo={...it.estilo};h.grupo=it.grupo;}h.sinReacciones=it.sinReacciones;hs.push(h);}while(hs.length>v){const h=hs.pop();items.splice(items.indexOf(h),1);}}
        else it[k==='tamano'?'escala':k==='girar'?'rot':k==='opacidad'?'opacidad':'foco']=v;
        sincronizarHijos(it);
      }
      solicitarDibujo();menu.actualizar();
    }});
  const editor=montarEditorTuPlaca($('tpEditor'),{
    base:()=>({fuente:estiloBase(seleccionado),ajustes:migrarAjustes(seleccionado.ajustes),familia:familiaDe(seleccionado),rot:seleccionado.rot,foco:seleccionado.foco,opacidad:seleccionado.opacidad??100,radio:radioDibujo(seleccionado)}),
    cambiar:parcial=>{for(const it of elegidas()){it.ajustes={...migrarAjustes(it.ajustes),...parcial};sincronizarHijos(it);}},
    empezar:iniciarCambio,terminar:()=>{dibujar();terminarCambio();},
    alCerrar:()=>{animarPerilla(true);if(seleccionado&&items.includes(seleccionado)){const c=centro();menu.abrir(c.x,c.y);}dibujar();},
  });

  function dibujar(){
    for(const [id,el]of elementos)if(!items.some(i=>i.id===id)){el.remove();elementos.delete(id);}
    const varias=elegidas().length>1;
    for(const it of items){let el=elementos.get(it.id);
      if(!el){el=document.createElement('button');el.type='button';el.className='tp-colonia';el.dataset.colonia=String(it.id);capa.appendChild(el);elementos.set(it.id,el);const id=it.id;el.addEventListener('pointerdown',ev=>{const actual=items.find(i=>i.id===id);if(actual)iniciarArrastre(ev,actual);});el.addEventListener('keydown',ev=>{const actual=items.find(i=>i.id===id);if(actual)tecladoColonia(ev,actual);});}
      const lado=it.tamano*it.escala/100/WF,primera=!el.dataset.pintado;el.style.width=el.style.height=lado+'px';el.style.transform=`translate(${it.x-lado/2}px,${it.y-lado/2}px) rotate(${it.rot}deg)`;
      if(primera&&it.parent&&!matchMedia('(prefers-reduced-motion: reduce)').matches){const padre=items.find(p=>p.id===it.parent);if(padre)el.animate([{transform:`translate(${padre.x-lado/2}px,${padre.y-lado/2}px) rotate(${it.rot}deg) scale(.1)`,opacity:0},{transform:el.style.transform,opacity:1}],{duration:450,easing:'cubic-bezier(.3,.9,.3,1)'});}el.dataset.pintado='1';
      el.classList.toggle('tp-arrastrando',arrastre?.it===it||!!arrastre?.grupo?.includes(it));el.classList.toggle('tp-colonia-fuera',arrastre?.it===it&&!dentro(it));
      el.classList.toggle('tp-seleccionada',varias&&seleccion.includes(it));
      el.setAttribute('aria-label',GRUPO_NOMBRE[modelo(it).g]+', '+modelo(it).codigo+'. Tocar para editar; arrastrar para mover.');el.setAttribute('aria-expanded',String(seleccionado===it&&!$('tpMenu').hidden));
    }
    pintarEscena();dibujarReacciones();dibujarPerilla();if(seleccionado&&!$('tpMenu').hidden){const c=centro();if(c)menu.situar(c.x,c.y);}pedido=false;
  }
  function solicitarDibujo(){if(!pedido){pedido=true;frame=requestAnimationFrame(dibujar);}}
  let ayudaLazo=false;try{ayudaLazo=sessionStorage.getItem('micromundos-ayuda-lazo')==='1';}catch{}
  function actualizar(){pintarInterruptor();const n=items.length;if(n>=2&&!ayudaLazo&&!lazo){ayudaLazo=true;try{sessionStorage.setItem('micromundos-ayuda-lazo','1');}catch{}setTimeout(()=>{if(!$('tpVistaRecuerdo').hidden)return;ayudaTuPlaca([['','Arrastrá sobre la placa para elegir varias colonias a la vez.']],{x:1320-190,y:952,ancho:380,donde:'arriba',flecha:190,duracion:7000});},700);}$('tpCuenta').textContent=n+(n===1?' colonia':' colonias');$('tpVacia').hidden=!!n;$('tpRecuerdo').disabled=!n;$('tpDeshacer').disabled=!historico.length;$('tpRehacer').disabled=!futuro.length;$('tpReiniciar').disabled=!n;}
  function abrirMenu(it){
    const enGrupo=seleccion.length>1&&seleccion.includes(it);
    if(seleccionado===it&&!$('tpMenu').hidden){menu.cerrar();if(!enGrupo)seleccion=[];dibujar();return;}
    if(!enGrupo)seleccion=[it];seleccionado=it;const c=centro();menu.abrir(c.x,c.y);dibujar();
  }
  function iniciarArrastre(ev,it){if(ev.button>0)return;ev.preventDefault();ev.stopPropagation();editor.cerrar();cerrarEstructuras();iniciarCambio();const p=punto(ev),grupo=seleccion.length>1&&seleccion.includes(it)?seleccion.filter(s=>items.includes(s)):[it];
    arrastre={it,grupo,inicio:p,origen:grupo.map(g=>({g,x:g.x,y:g.y})),movido:false};elementos.get(it.id).setPointerCapture?.(ev.pointerId);}
  function tecladoColonia(ev,it){if(['Enter',' '].includes(ev.key)){ev.preventDefault();abrirMenu(it);return;}if(['Delete','Backspace'].includes(ev.key)){ev.preventDefault();iniciarCambio();quitar(it);terminarCambio();return;}
    const d={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[ev.key];if(d){ev.preventDefault();iniciarCambio();it.x+=d[0]*(ev.shiftKey?12:4);it.y+=d[1]*(ev.shiftKey?12:4);if(it.parent)it.manual=true;sincronizarHijos(it);dibujar();terminarCambio();}}
  function sembrar(p,e=biblioteca.seleccionado(),teclado=false){if(!dentro(p))return null;const nuevo=crear(e,p.x,p.y);if(!nuevo)return null;
    dibujar();actualizar();if(teclado)elementos.get(nuevo.id)?.focus({preventScroll:true});return nuevo;
  }
  function iniciarBiblioteca(ev,e){if(ev.button>0)return;ev.preventDefault();cerrarMenus();siembra={origen:'biblioteca',estilo:e,inicio:{x:ev.clientX,y:ev.clientY},puntos:[],ultimo:null,recorrido:0};const cv=document.createElement('canvas'),origen=ev.currentTarget.querySelector('canvas');cv.width=origen.width;cv.height=origen.height;cv.getContext('2d').drawImage(origen,0,0);cv.className='tp-arrastre-biblioteca';cv.style.width=cv.style.height=e.tamano/WF+'px';pagina.appendChild(cv);siembra.fantasma=cv;moverFantasma(ev);ev.currentTarget.setPointerCapture?.(ev.pointerId);}
  function moverFantasma(ev){const f=siembra?.fantasma;if(!f)return;const r=pagina.getBoundingClientRect(),escala=r.width/pagina.offsetWidth;f.style.left=(ev.clientX-r.left)/escala+'px';f.style.top=(ev.clientY-r.top)/escala+'px';f.hidden=dentro(punto(ev));}

  // Fondo de la placa: tocar siembra una colonia al soltar; arrastrar dibuja un lazo que elige varias.
  let toque=null;
  function iniciarLazo(p){ayudaTuPlaca.cerrar?.();lazo={puntos:[toque.inicio,p]};toque=null;seleccion=[];seleccionado=null;board.classList.add('tp-lazando');dibujar();}
  function dentroDelLazo(p,poli){let adentro=false;for(let i=0,j=poli.length-1;i<poli.length;j=i++){const a=poli[i],b=poli[j];if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)adentro=!adentro;}return adentro;}
  function cerrarLazo(){
    const poli=lazo.puntos;lazo=null;board.classList.remove('tp-lazando');$('tpTrazo').querySelector('path').setAttribute('d','');
    const tomadas=poli.length>2?items.filter(it=>dentroDelLazo(it,poli)):[];
    if(tomadas.length){seleccion=tomadas;seleccionado=tomadas[0];const c=centro();menu.abrir(c.x,c.y);}
    dibujar();
  }
  board.addEventListener('pointerdown',ev=>{if(ev.target.closest('button,.tp-menu,.tp-editor,.tp-perilla-control')||ev.button>0)return;ev.preventDefault();cerrarMenus();seleccion=[];seleccionado=null;const p=punto(ev);if(!dentro(p)){dibujar();return;}
    toque={inicio:p,cliente:{x:ev.clientX,y:ev.clientY}};board.setPointerCapture?.(ev.pointerId);dibujar();});
  board.addEventListener('keydown',ev=>{if(ev.target===board&&['Enter',' '].includes(ev.key)){ev.preventDefault();iniciarCambio();sembrar({x:392,y:392},biblioteca.seleccionado(),true);terminarCambio();}});
  pagina.addEventListener('pointermove',ev=>{
    if(toque){if(Math.hypot(ev.clientX-toque.cliente.x,ev.clientY-toque.cliente.y)>8)iniciarLazo(punto(ev));else return;}
    if(lazo){const p=punto(ev),u=lazo.puntos[lazo.puntos.length-1];if(Math.hypot(p.x-u.x,p.y-u.y)>4){lazo.puntos.push(p);$('tpTrazo').querySelector('path').setAttribute('d',lazo.puntos.map((q,i)=>(i?'L':'M')+q.x.toFixed(1)+','+q.y.toFixed(1)).join('')+'Z');}return;}
    if(arrastre){const p=punto(ev),a=arrastre;if(!a.movido&&Math.hypot(p.x-a.inicio.x,p.y-a.inicio.y)<6)return;a.movido=true;menu.cerrar();
      for(const o of a.origen){o.g.x=o.x+p.x-a.inicio.x;o.g.y=o.y+p.y-a.inicio.y;if(o.g.parent)o.g.manual=true;sincronizarHijos(o.g);}
      $('tpAvisoQuitar').hidden=a.grupo.length>1||dentro(a.it);solicitarDibujo();return;}
    if(!siembra)return;moverFantasma(ev);
    const p=punto(ev);if(!dentro(p))return;if(siembra.origen==='biblioteca'&&Math.hypot(ev.clientX-siembra.inicio.x,ev.clientY-siembra.inicio.y)<8)return;
    if(siembra.ultimo===null){iniciarCambio();const cantidad=items.length;sembrar(p,siembra.estilo);siembra.nuevos=items.slice(cantidad);siembra.ultimo=p;siembra.puntos.push(p);}
    for(const it of siembra.nuevos||[]){it.x+=p.x-siembra.ultimo.x;it.y+=p.y-siembra.ultimo.y;}siembra.ultimo=p;solicitarDibujo();
  });
  function soltar(ev,cancelado=false){
    // Tocar la placa vacía ya no siembra la forma elegida: se siembra solo arrastrando desde la biblioteca (o con Enter, por teclado).
    if(toque){toque=null;return;}
    if(lazo){if(cancelado){lazo=null;board.classList.remove('tp-lazando');$('tpTrazo').querySelector('path').setAttribute('d','');}else cerrarLazo();terminarCambio();return;}
    if(arrastre){const a=arrastre;arrastre=null;$('tpAvisoQuitar').hidden=true;if(cancelado){for(const o of a.origen){o.g.x=o.x;o.g.y=o.y;}}else if(!a.movido)abrirMenu(a.it);else if(a.grupo.length===1&&!dentro(a.it))quitar(a.it);else if(a.grupo.length>1){for(const g of a.grupo)if(!dentro(g)){const d=Math.hypot(g.x-392,g.y-392);g.x=392+(g.x-392)*370/d;g.y=392+(g.y-392)*370/d;}}dibujar();terminarCambio();}
    // Al soltar siempre se vuelve a dibujar: el último cuadro del arrastre muestra suelto el grupo que se estaba moviendo.
    if(siembra){siembra.fantasma?.remove();if((cancelado||!dentro(punto(ev)))){for(const it of siembra.nuevos||[]){const idx=items.indexOf(it);if(idx>=0)items.splice(idx,1);}}siembra=null;dibujar();$('tpTrazo').querySelector('path').setAttribute('d','');terminarCambio();}
  }
  pagina.addEventListener('pointerup',ev=>soltar(ev));pagina.addEventListener('pointercancel',ev=>soltar(ev,true));
  pagina.addEventListener('pointerdown',ev=>{if(!ev.target.closest('.tp-colonia,.tp-menu,.tp-editor,.tp-estructuras,#tpGenerar'))cerrarMenus();});
  pagina.addEventListener('keydown',ev=>{if(ev.key==='Escape'){cerrarMenus();cerrarReaccion();}if((ev.ctrlKey||ev.metaKey)&&ev.key.toLowerCase()==='z'){ev.preventDefault();ev.shiftKey?rehacer():deshacer();}});

  // GENERAR: tocar = otra semilla de la estructura actual; mantener = abanico de estructuras.
  const ESTRUCTURAS=[['propuesta','Placa propuesta'],['band','Banda'],['grid','Retícula'],['field','Campo disperso'],['radial','Campo radial']];
  const iconoEstructura={
    propuesta:'<circle cx="21" cy="24" r="9"/><circle cx="33" cy="19" r="6"/><circle cx="31" cy="33" r="5"/><circle cx="17" cy="36" r="2.5"/><circle cx="40" cy="28" r="2"/><circle cx="25" cy="12" r="2"/>',
    band:'<circle cx="12" cy="36" r="3"/><circle cx="19" cy="31" r="4.5"/><circle cx="27" cy="25" r="6"/><circle cx="35" cy="18" r="4"/><circle cx="41" cy="13" r="2.5"/>',
    grid:'<circle cx="15" cy="15" r="3.5"/><circle cx="26" cy="15" r="2"/><circle cx="37" cy="15" r="3.5"/><circle cx="15" cy="26" r="2"/><circle cx="26" cy="26" r="5"/><circle cx="37" cy="26" r="2"/><circle cx="15" cy="37" r="3.5"/><circle cx="26" cy="37" r="2"/><circle cx="37" cy="37" r="3.5"/>',
    field:'<circle cx="14" cy="16" r="4"/><circle cx="34" cy="13" r="2.5"/><circle cx="39" cy="30" r="5"/><circle cx="22" cy="34" r="3"/><circle cx="27" cy="22" r="2"/><circle cx="12" cy="38" r="2"/>',
    radial:'<circle cx="26" cy="26" r="5"/><circle cx="26" cy="11" r="2.5"/><circle cx="39" cy="19" r="2.5"/><circle cx="39" cy="34" r="2.5"/><circle cx="26" cy="41" r="2.5"/><circle cx="13" cy="34" r="2.5"/><circle cx="13" cy="19" r="2.5"/>',
  };
  const abanico=$('tpEstructuras'),listaEstructuras=abanico;
  // 19/11/2026: con la lógica del menú contextual de las colonias: un aro con las cinco estructuras alrededor de GENERAR,
  // cada una en la superficie redonda de los botones del aro, con su nombre afuera. La que está en uso va rellena.
  // 19/11/2026: en un eje horizontal, a la derecha de GENERAR (antes, en aro).
  const PASO_ESTR=124;
  ESTRUCTURAS.forEach(([id,nombre],i)=>{const b=document.createElement('button');b.type='button';b.role='menuitemradio';b.dataset.estructura=id;b.className='tp-menu-boton';
    const x=i*PASO_ESTR;b.style.transform=`translate(${x}px,0px)`;b.style.setProperty('--i',i);
    b.innerHTML=`<img class="tp-menu-superficie" alt="" src="src/assets/tu-placa/tp-boton.svg"><svg class="tp-menu-icono" viewBox="0 0 52 52" aria-hidden="true">${iconoEstructura[id]}</svg><span>${nombre}</span>`;b.addEventListener('click',ev=>{ev.stopPropagation();estructura=id;cerrarEstructuras();generar();});listaEstructuras.appendChild(b);});
  // Flechas arriba y abajo para recorrer las estructuras con teclado.
  listaEstructuras.addEventListener('keydown',ev=>{const d={ArrowDown:1,ArrowUp:-1,ArrowRight:1,ArrowLeft:-1}[ev.key];if(!d)return;ev.preventDefault();const bs=[...listaEstructuras.querySelectorAll('button')],i=bs.indexOf(document.activeElement);bs[(i+d+bs.length)%bs.length].focus({preventScroll:true});});
  function abrirEstructuras(){menu.cerrar();editor.cerrar();abanico.hidden=false;requestAnimationFrame(()=>abanico.classList.add('vis'));for(const b of listaEstructuras.querySelectorAll('button'))b.setAttribute('aria-checked',String(b.dataset.estructura===estructura));abanico.querySelector('[aria-checked="true"]')?.focus({preventScroll:true});$('tpGenerar').setAttribute('aria-expanded','true');}
  function cerrarEstructuras(){if(abanico.hidden)return;abanico.hidden=true;abanico.classList.remove('vis');$('tpGenerar').setAttribute('aria-expanded','false');}
  function generar(){
    const habia=items.length;
    iniciarCambio();cerrarMenus();cerrarReaccion();items.length=0;zoom=100;giro=0;seleccionado=null;seleccion=[];
    if(estructura==='propuesta'){
      const composicion=generarComposicionTuPlaca(),dimension=784/composicion.diametroAro;
      for(const e of composicion)agregarGenerada(e.style,392+(e.x-.5)*dimension,392+(e.y-.5)*dimension,e.w*dimension,{green:'M',yellow:'L',rose:'B'}[e.familia]);
    }else{
      const semilla=Math.floor(Math.random()*1000);let a=semilla*7919+1;const azar=()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return ((t^(t>>>14))>>>0)/4294967296;};
      const escena=composicionColonias.generar({structure:estructura,seed:semilla,density:35,weights:{green:33,yellow:33,rose:34},random:azar});
      let alcance=.5;for(const it of escena.extentItems){const m=it.w*(.5+composicionColonias.texturePaddingFraction(it));alcance=Math.max(alcance,Math.hypot(Math.abs(it.x-.5)+m,Math.abs(it.y-.5)+m));}
      const ancho=estructura==='grid'?596:366/alcance,giro=azar()*Math.PI*2,sen=Math.sin(giro),cos=Math.cos(giro);
      for(const it of escena.items){if(it.type!=='shape')continue;const x=(it.x-.5)*ancho,y=(it.y-.5)*ancho;agregarGenerada(it.style,392+x*cos-y*sen,392+x*sen+y*cos,it.w*ancho,null,giro*180/Math.PI);}
    }
    dibujar();terminarCambio();if(habia)avisarGenerada(habia);
  }
  // Generar sobre una placa armada reemplaza todo: se avisa y se ofrece recuperar la anterior (es un DESHACER).
  let relojAvisoGenerar=0,cuadroAvisoGenerar=0;
  function avisarGenerada(cuantas){
    let aviso=$('tpAvisoGenerar');
    if(!aviso){aviso=document.createElement('div');aviso.id='tpAvisoGenerar';aviso.className='tp-aviso-generar cartel cartel-neutro';aviso.setAttribute('role','status');
      aviso.innerHTML='<div class="vidrio"></div><div class="flota"><div class="grano"></div><div class="fi"><div class="co"><p></p><button type="button"><img src="__CARTEL_FLECHA__" width="11.3995" height="11.0459" alt=""><span>RECUPERAR LA ANTERIOR</span></button></div></div></div>';pagina.appendChild(aviso);
      aviso.querySelector('button').addEventListener('click',ev=>{ev.stopPropagation();cerrarAvisoGenerar();deshacer();});}
    aviso.querySelector('p').textContent=`Composición nueva. La anterior tenía ${cuantas} ${cuantas===1?'colonia':'colonias'}.`;
    aviso.hidden=false;cancelAnimationFrame(cuadroAvisoGenerar);cuadroAvisoGenerar=requestAnimationFrame(()=>aviso.classList.add('visible'));
    clearTimeout(relojAvisoGenerar);relojAvisoGenerar=setTimeout(cerrarAvisoGenerar,7000);
  }
  function cerrarAvisoGenerar(){const aviso=$('tpAvisoGenerar');if(!aviso)return;cancelAnimationFrame(cuadroAvisoGenerar);aviso.classList.remove('visible');clearTimeout(relojAvisoGenerar);setTimeout(()=>{if(!aviso.classList.contains('visible'))aviso.hidden=true;},300);}
  function agregarGenerada(estilo,x,y,ancho,grupoFamilia,giro=0){
    const grupo=grupoFamilia||{'#27633f':'M','#ff4c52':'B','#ff9c20':'L'}[estilo.c1];
    const it=crear(modelos.get((grupo||'B')+'-A-01'),x,y,ancho);if(!it)return;
    it.modelo='generada-'+it.id;it.estilo={...estilo};it.grupo=grupo||'BL';it.seed=estilo.seed%1000;it.foco=100;it.rot=Math.round(giro);
    // Los cuerpos de fondo (veladuras, aros, bandas) no reaccionan: son el campo de la composición, no colonias.
    it.sinReacciones=!grupo||['ring','arc','band','pair'].includes(estilo.shape)||estilo.opacity<50||estilo.blur>=30;
  }
  {const b=$('tpGenerar');let reloj=0,largo=false;
    b.addEventListener('pointerdown',ev=>{if(ev.button>0)return;largo=false;clearTimeout(reloj);reloj=setTimeout(()=>{largo=true;abrirEstructuras();},450);});
    const cortar=()=>{clearTimeout(reloj);};b.addEventListener('pointerleave',cortar);b.addEventListener('pointercancel',cortar);
    b.addEventListener('pointerup',ev=>{clearTimeout(reloj);if(!largo&&abanico.hidden)generar();});
    b.addEventListener('keydown',ev=>{if(['Enter',' '].includes(ev.key)){ev.preventDefault();generar();}if(ev.key==='ArrowUp'||ev.key==='ContextMenu'){ev.preventDefault();abrirEstructuras();}});
    b.addEventListener('contextmenu',ev=>ev.preventDefault());
    abanico.addEventListener('keydown',ev=>{if(ev.key==='Escape'){cerrarEstructuras();b.focus();}});}
  $('tpDeshacer').addEventListener('click',deshacer);$('tpRehacer').addEventListener('click',rehacer);$('tpReiniciar').addEventListener('click',()=>{iniciarCambio();items.length=0;zoom=100;giro=0;seleccionado=null;seleccion=[];cerrarMenus();cerrarReaccion();dibujar();terminarCambio();});

  // Encuentros: reglas y dibujo del motor de la Placa de encuentros del muestrario (MotorMuestrario.escena).
  const TIPOS={M:'moho',B:'bacteria',L:'levadura'},ORDEN=['moho','bacteria','levadura'],COLOR_TIPO={moho:'#27633f',bacteria:'#ff4c52',levadura:'#ff9c20'};
  const par=MotorMuestrario.meetingTypePair;
  const MODO={fusion:'fusion',barrier:'barrera',repel:'separacion',bridge:'intercambio',crush:'comprimida'};
  const REGLAS=Object.fromEntries(Object.entries(MotorMuestrario.meetingRules).map(([k,m])=>[k,MODO[m]||'ninguna']));
  // 19/11/2026: ningún término se repite (antes había dos Simbiosis y dos Rechazo): moho + moho es Fusión y bacteria + bacteria, Compresión.
  const REACCIONES={
    fusion:{nombre:'Fusión',detalle:'forma combinada',pareja:'Moho + moho',texto:'En esta representación, dos mohos que se tocan forman un solo cuerpo: sus bordes se funden en una transición amplia entre los dos núcleos.'},
    barrera:{nombre:'Barrera',detalle:'frente compartido',pareja:'Moho + bacteria',texto:'En esta representación, los dos frentes de crecimiento se frenan donde se encuentran. La frontera queda más cerca de la colonia más chica.'},
    separacion:{nombre:'Rechazo',detalle:'separación suave',pareja:'Moho + levadura',texto:'En esta representación, el moho interrumpe su borde antes de llegar a la levadura y deja una franja libre alrededor.'},
    intercambio:{nombre:'Simbiosis',detalle:'intercambio',pareja:'Bacteria + levadura',texto:'Bacterias lácticas y levaduras viven juntas, cada una aprovecha un alimento distinto y, entre las dos, fermentan la masa madre. En la placa, fragmentos de color pasan de una colonia a la otra.'},
    comprimida:{nombre:'Compresión',detalle:'colonia comprimida',pareja:'Bacteria + bacteria',texto:'En esta representación, dos colonias de bacterias sólo se deforman cuando se empujan: se aplastan contra la cara de encuentro.'},
    ninguna:{nombre:'Sin reacción',detalle:'',pareja:'Levadura + levadura',texto:'En esta representación, dos levaduras pueden tocarse sin cambiar su forma.'},
  };
  // Qué colonias reaccionan (Paco, 18/11/2026):
  // - de las formas de composición de la biblioteca, solo «Anillo fino»; Veladura, Filamentosa, Granulada y Microcolonia no
  //   (también «Con halo» y «Par», que ya no se ofrecen). Se decide por el tipo, no por la marca guardada, para que las
  //   placas guardadas antes del cambio también lo sigan;
  // - las piezas de GENERAR siguen su propia regla (agregarGenerada);
  // - ninguna colonia reacciona si es muy chica o muy transparente, contando el tamaño y la opacidad del menú.
  const SIN_REACCION=new Set(['V','F','G','MI','H','P']),RADIO_MINIMO=12,OPACIDAD_MINIMA=40;
  const reacciona=it=>{
    if(it.estilo?it.sinReacciones:SIN_REACCION.has(modelo(it)?.estado))return false;
    const opacidad=(estiloBase(it).opacity??100)*(it.opacidad??100)/100;
    return opacidad>=OPACIDAD_MINIMA&&radioDibujo(it)>=RADIO_MINIMO;
  };
  const tipoDe=it=>reacciona(it)?TIPOS[modelo(it).g]||null:null;
  const radioDibujo=it=>it.tamano*it.escala/200*(estiloBase(it).size??100)/100;
  let popup=null,cancelarPopup=()=>{},relaciones=[],escalaEscena=1,leyendo=null;
  function marcarLeida(modo){leyendo=modo;dibujarReacciones();}
  function cerrarReaccion(){cancelarPopup();cancelarPopup=()=>{};popup?.remove();popup=null;if(leyendo)marcarLeida(null);}
  function abrirReaccion(modo){cerrarReaccion();marcarLeida(modo);const datos=REACCIONES[modo];
    popup=$('plantillaCartelGlosario').content.firstElementChild.cloneNode(true);popup.classList.remove('cartel-glosario');popup.classList.add('cartel-especie','cartel-reaccion');popup.style.width='402px';popup.querySelector('.nom').textContent=datos.nombre;popup.querySelector('.nom').style.textTransform='none';popup.querySelector('.cod').textContent='';popup.querySelector('.definicionGlosario').textContent=datos.texto;popup.querySelector('.masCartel')?.remove();popup.querySelector('.detalleCartel')?.remove();
    const figura=figuraReaccion(modo);if(figura){const def=popup.querySelector('.definicionGlosario');def.parentNode.insertBefore(figura,def);}const p=document.createElement('p');p.className='tp-reaccion-combinacion';p.textContent=datos.pareja+(datos.detalle?' · '+datos.detalle:'');popup.querySelector('.co').appendChild(p);$('anclaCarteles').appendChild(popup);universoCartel(popup,letrasReaccion(modo));ubicarCartelFlotante(popup);
    const el=popup;cancelarPopup=activarArrastreCartel(el,p=>{el.style.transform=`translate(${p.x}px,${p.y}px)`;},cerrarReaccion);requestAnimationFrame(()=>el.isConnected&&el.classList.add('vis'));
  }
  // La placa entera se dibuja en un solo lienzo: cada colonia es un sprite del motor y los encuentros operan sobre sus píxeles.
  // Mientras se arrastra un grupo grande se dibuja sin encuentros y se calculan al soltar.
  const escenaCv=$('tpEscena');
  function pintarEscena(){
    const esc=pagina.getBoundingClientRect().width/pagina.offsetWidth||1,pantalla=esc*Math.max(1,devicePixelRatio||1),K=Math.min(1.5,Math.max(1,pantalla)),lado=Math.round(784*K);
    escalaEscena=K;
    const liviano=!!arrastre?.movido&&arrastre.grupo.length>3;
    const colonias=items.map(it=>MotorMuestrario.miembro({id:it.id,type:tipoDe(it),x:it.x*K,y:it.y*K,width:2*it.tamano*it.escala/100*K,style:estiloItem(it),giro:it.rot,desenfoque:(100-it.foco)*.06*K,entry:it,
      parameters:it.ajustes&&Object.keys(it.ajustes).length?it.ajustes:undefined,sourceStyle:it.estilo?true:undefined}));
    // Hasta 40 ms por cuadro: si una composición densa no entra, lo que falta aparece en los cuadros siguientes.
    const {imagen,encuentros,pendiente}=MotorMuestrario.escena(lado,lado,colonias,{strength:liviano?0:intensidad,gapWidth:7*K,blur:10,contactBlur:3,grain:24},pantalla/K,40,arrastre?.movido?arrastre.grupo:siembra?.nuevos||[]);
    if(pendiente)requestAnimationFrame(()=>solicitarDibujo());
    if(escenaCv.width!==lado)escenaCv.width=escenaCv.height=lado;
    const c=escenaCv.getContext('2d');c.clearRect(0,0,lado,lado);c.save();c.beginPath();c.arc(lado/2,lado/2,392*K,0,Math.PI*2);c.clip();c.drawImage(imagen,0,0);c.restore();
    relaciones=liviano?relaciones:encuentros.map(e=>{const ra=radioDibujo(e.a),rb=radioDibujo(e.b),d=Math.hypot(e.b.x-e.a.x,e.b.y-e.a.y),hueco=d-ra-rb;
      return {a:e.a,b:e.b,modo:MODO[e.mode],ra,rb,cx:e.a.x+e.ux*(ra+Math.max(hueco,-Math.min(ra,rb))/2),cy:e.a.y+e.uy*(ra+Math.max(hueco,-Math.min(ra,rb))/2)};});
  }
  function dibujarReacciones(){
    const svg=$('tpLineas'),rotulos=$('tpRotulos');svg.replaceChildren();rotulos.replaceChildren();
    const vistos=new Set(),lugares=[];
    for(const r of relaciones){
      // Un rótulo por tipo de reacción, y nunca encimado con otro.
      if(!r.modo||vistos.has(r.modo)||lugares.some(p=>Math.hypot(p.x-r.cx,p.y-r.cy)<90))continue;vistos.add(r.modo);lugares.push({x:r.cx,y:r.cy});const radioAro=Math.max(r.ra,r.rb)+35;
      const otra=leyendo&&leyendo!==r.modo?' tp-reaccion-otra':leyendo?' tp-reaccion-leida':'';const ring=document.createElementNS(ns,'circle');for(const [k,v]of Object.entries({cx:r.cx,cy:r.cy,r:radioAro,class:'tp-reaccion-aro'+otra}))ring.setAttribute(k,v);svg.appendChild(ring);
      const bton=document.createElement('button');bton.type='button';bton.textContent=REACCIONES[r.modo].nombre.toUpperCase();if(otra)bton.className=otra.trim();bton.style.left=clamp(r.cx-radioAro,12,620)+'px';bton.style.top=clamp(r.cy-radioAro*.65,12,740)+'px';bton.setAttribute('aria-label','Acerca de '+REACCIONES[r.modo].nombre+', '+REACCIONES[r.modo].detalle);bton.addEventListener('click',ev=>{ev.stopPropagation();abrirReaccion(r.modo);});rotulos.appendChild(bton);
    }
  }

  // 19/11/2026: sin leyenda fija (Paco: los nombres de las reacciones ya aparecen en la placa). El cartel de cada reacción
  // la muestra: dos colonias de la pareja que la produce, dibujadas y encontrándose con el mismo motor de la placa.
  // Color del cartel de cada reacción: el de los universos de la pareja que la produce (moho = M, bacteria = B, levadura = L).
  function letrasReaccion(modo){const letra={moho:'M',bacteria:'B',levadura:'L'};for(const a of ORDEN)for(const b of ORDEN)if(REGLAS[par(a,b)]===modo)return [...new Set([letra[a],letra[b]])].join('');return 'B';}
  function figuraReaccion(modo){
    const letra={moho:'M',bacteria:'B',levadura:'L'};let pareja=null;
    for(const a of ORDEN)for(const b of ORDEN)if(!pareja&&REGLAS[par(a,b)]===modo)pareja=[a,b];
    if(!pareja)return null;
    const W=354,H=200,base=Date.now()%100000*10;
    const its=pareja.map((t,i)=>({id:-(base+i+1),modelo:letra[t]+'-A-01',tamano:150,escala:100,rot:0,foco:100,opacidad:100,seed:(i*37+11)%1000}));
    const pos=[[W/2-58,H/2],[W/2+58,H/2]];
    const col=its.map((it,i)=>MotorMuestrario.miembro({id:it.id,type:pareja[i],x:pos[i][0],y:pos[i][1],width:2*it.tamano,style:estiloItem(it),giro:0,desenfoque:0,entry:it}));
    const {imagen}=MotorMuestrario.escena(W,H,col,{strength:100,gapWidth:7,blur:10,contactBlur:3,grain:24},1,Infinity,[]);
    const cv=document.createElement('canvas');cv.width=W;cv.height=H;cv.className='tp-reaccion-figura';cv.setAttribute('role','img');cv.setAttribute('aria-label',REACCIONES[modo].pareja+': '+REACCIONES[modo].nombre);
    cv.getContext('2d').drawImage(imagen,0,0);return cv;
  }

  // Zoom y giro de la placa entera (19/11/2026), como el slider de zoom de MUESTRAS:
  //  · DENSIDAD (antes ZOOM; Paco, 19/11: lo que hace es juntar o separar la composición), a la derecha (+ arriba, − abajo): igual que en MUESTRAS, los centros de las colonias se alejan o acercan al centro
  //    de la placa y las colonias NO cambian de tamaño (se separan). 50 % a 200 %.
  //  · GIRAR, a la izquierda, mismo arco sin + ni −: gira toda la composición alrededor del centro (−180° a 180°).
  // Reemplazan a la perilla de REACCIONES (Paco: «priorizo este»); las reacciones quedan fijas en 85 %.
  const perilla=$('tpPerilla'),R_ARCO=432,SEP=4.6;let girandoPerilla=null,arcoActivo=null;
  const ARCOS={zoom:{a0:-30,a1:30,lado:1},giro:{a0:210,a1:150,lado:-1}}; // a0 = arriba
  const pp=(a,r=R_ARCO)=>[392+Math.cos(a*Math.PI/180)*r,392+Math.sin(a*Math.PI/180)*r];
  const arco=(a0,a1)=>{const [x0,y0]=pp(a0),[x1,y1]=pp(a1);return `M${x0},${y0}A${R_ARCO},${R_ARCO} 0 0 ${a1>a0?1:0} ${x1},${y1}`;};
  const tDe=k=>k==='zoom'?Math.max(0,Math.min(1,Math.log(zoom/50)/Math.log(4))):(giro+180)/360; // 1 = arriba
  const angDe=(k,t)=>{const A=ARCOS[k];return A.a1+(A.a0-A.a1)*t;};
  // 19/11/2026: al abrir TRANSFORMAR, GIRAR y DENSIDAD se van con la misma transición que el arco de zoom de MUESTRAS:
  // primero se apagan manija, remates, signos y nombres; después cada arco se recoge hacia su centro y queda un punto que se apaga.
  let progresoPerilla=1,animPerilla=0;
  const suaveP=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
  function animarPerilla(mostrar){
    cancelAnimationFrame(animPerilla);animPerilla=0;const desde=progresoPerilla,hasta=mostrar?1:0;
    if(matchMedia('(prefers-reduced-motion: reduce)').matches||desde===hasta){progresoPerilla=hasta;dibujarPerilla();return;}
    const inicio=performance.now(),duracion=(mostrar?950:650)*Math.abs(hasta-desde);
    const paso=ahora=>{const t=Math.max(0,Math.min(1,(ahora-inicio)/duracion));progresoPerilla=desde+(hasta-desde)*t;dibujarPerilla();animPerilla=t<1?requestAnimationFrame(paso):0;};
    animPerilla=requestAnimationFrame(paso);
  }
  function dibujarPerilla(){
    const P=progresoPerilla;if(P<=0){perilla.innerHTML='';return;}
    const abrir=suaveP((P-.1)/.6),detalle=suaveP((P-.7)/.1).toFixed(3),signos=suaveP((P-.8)/.2).toFixed(3),punto=(1-suaveP((P-.22)/.25)).toFixed(3),listo=P===1;
    perilla.style.opacity=suaveP(P/.1).toFixed(3);
    const remate=a=>{const [x0,y0]=pp(a,R_ARCO-9),[x1,y1]=pp(a,R_ARCO+9);return `M${x0},${y0}L${x1},${y1}`;};
    const signo=(a,mas)=>{const [cx,cy]=pp(a),r=a*Math.PI/180,rx=Math.cos(r),ry=Math.sin(r),tx=-ry,ty=rx,L=6;
      return `M${cx-rx*L},${cy-ry*L}L${cx+rx*L},${cy+ry*L}`+(mas?`M${cx-tx*L},${cy-ty*L}L${cx+tx*L},${cy+ty*L}`:'');};
    let h='';
    for(const k of ['zoom','giro']){const A=ARCOS[k],[x,y]=pp(angDe(k,tDe(k))),[lx,ly]=pp((A.a0+A.a1)/2,R_ARCO+36); // rótulo y valor a la altura del centro del arco (Paco, 19/11)
      const am=(A.a0+A.a1)/2,semi=Math.abs(A.a1-A.a0)/2*abrir,[cx0,cy0]=pp(am);
      h+=`<g style="pointer-events:${listo?'auto':'none'}">`;
      if(abrir>0)h+=`<path class="tp-zoom-linea" d="${arco(am-semi,am+semi)}"/>`;
      h+=`<circle cx="${cx0}" cy="${cy0}" r="2" class="tp-zoom-manija" opacity="${punto}"/><path class="tp-zoom-linea" opacity="${detalle}" d="${remate(A.a0)+remate(A.a1)}"/>`;
      if(k==='zoom'){const [mx,my]=pp(A.a0-SEP),[nx,ny]=pp(A.a1+SEP);h+=`<path class="tp-zoom-linea" opacity="${signos}" d="${signo(A.a0-SEP,true)+signo(A.a1+SEP,false)}"/><circle class="tp-perilla-control tp-zoom-paso" data-arco="zoom" data-paso="1" cx="${mx}" cy="${my}" r="18"/><circle class="tp-perilla-control tp-zoom-paso" data-arco="zoom" data-paso="-1" cx="${nx}" cy="${ny}" r="18"/>`;}
      const valor=k==='zoom'?Math.round(zoom)+' %':Math.round(giro)+'°';
      h+=`<g opacity="${detalle}"><text class="tp-zoom-rotulo" x="${lx}" y="${ly-4}" text-anchor="${A.lado>0?'start':'end'}">${k==='zoom'?'DENSIDAD':'GIRAR'}</text><text class="tp-zoom-valor" x="${lx}" y="${ly+16}" text-anchor="${A.lado>0?'start':'end'}">${valor}</text>
        <path class="tp-perilla-control tp-perilla-toque" data-arco="${k}" d="${arco(Math.min(A.a0,A.a1),Math.max(A.a0,A.a1))}"/>
        <g class="tp-perilla-control" data-arco="${k}" role="slider" tabindex="0" aria-label="${k==='zoom'?'Densidad de la composición':'Girar la placa'}" aria-valuemin="${k==='zoom'?50:-180}" aria-valuemax="${k==='zoom'?200:180}" aria-valuenow="${Math.round(k==='zoom'?zoom:giro)}" aria-valuetext="${valor}"><circle cx="${x}" cy="${y}" r="24" class="tp-perilla-zona"/><circle cx="${x}" cy="${y}" r="8" class="tp-zoom-manija"/></g></g></g>`;}
    perilla.innerHTML=h;
    if(girandoPerilla!==null)perilla.querySelector(`g[data-arco="${arcoActivo}"]`)?.focus?.({preventScroll:true});
  }
  // Zoom: solo se mueven los centros (las colonias conservan su tamaño), como en MUESTRAS.
  function aplicarZoom(z){z=Math.max(50,Math.min(200,z));const f=z/zoom;if(Math.abs(f-1)<1e-4)return;
    for(const it of items){it.x=392+(it.x-392)*f;it.y=392+(it.y-392)*f;}zoom=z;solicitarDibujo();}
  function aplicarGiro(g){g=Math.max(-180,Math.min(180,g));const d=g-giro;if(Math.abs(d)<.01)return;const a=d*Math.PI/180,c=Math.cos(a),s=Math.sin(a);
    for(const it of items){const x=it.x-392,y=it.y-392;it.x=392+x*c-y*s;it.y=392+x*s+y*c;it.rot+=d;}giro=g;solicitarDibujo();}
  function ponerIntensidad(ev){const p=punto(ev);let a=Math.atan2(p.y-392,p.x-392)*180/Math.PI;const A=ARCOS[arcoActivo];
    if(arcoActivo==='giro'&&a<0)a+=360;const t=Math.max(0,Math.min(1,(a-A.a1)/(A.a0-A.a1)));
    if(arcoActivo==='zoom')aplicarZoom(50*4**t);else aplicarGiro(-180+360*t);}
  perilla.addEventListener('pointerdown',ev=>{const c=ev.target.closest('.tp-perilla-control');if(!c)return;ev.preventDefault();ev.stopPropagation();cerrarMenus();cerrarReaccion();iniciarCambio();
    if(c.dataset.paso){aplicarZoom(zoom*(c.dataset.paso==='1'?1.25:.8));dibujar();terminarCambio();return;}
    arcoActivo=c.dataset.arco||'zoom';girandoPerilla=ev.pointerId;perilla.setPointerCapture?.(ev.pointerId);ponerIntensidad(ev);});
  perilla.addEventListener('pointermove',ev=>{if(girandoPerilla!==null)ponerIntensidad(ev);});
  const soltarPerilla=()=>{if(girandoPerilla===null)return;girandoPerilla=null;dibujar();terminarCambio();};perilla.addEventListener('pointerup',soltarPerilla);perilla.addEventListener('pointercancel',soltarPerilla);
  perilla.addEventListener('keydown',ev=>{const g=ev.target.closest('g[data-arco]');if(!g)return;const k=g.dataset.arco,arriba=['ArrowUp','ArrowRight'].includes(ev.key),abajo=['ArrowDown','ArrowLeft'].includes(ev.key);
    if(!arriba&&!abajo&&!['Home','End'].includes(ev.key))return;ev.preventDefault();iniciarCambio();
    if(k==='zoom')aplicarZoom(ev.key==='Home'?50:ev.key==='End'?200:zoom*(arriba?1.1:1/1.1));else aplicarGiro(ev.key==='Home'?-180:ev.key==='End'?180:giro+(arriba?10:-10));
    dibujar();terminarCambio();perilla.querySelector(`g[data-arco="${k}"]`)?.focus({preventScroll:true});});

  // conFondo=false: la misma placa sin fondo ni pie (19/11/2026, Paco): es la que se guarda para PLACAS DE OTRAS PERSONAS.
  function pintarRecuerdo(conFondo=true){
    if(conFondo)dibujar();const cv=document.createElement('canvas');cv.width=cv.height=1600;const c=cv.getContext('2d');if(conFondo){c.fillStyle='#f2f0e8';c.fillRect(0,0,1600,1600);}c.save();c.scale(1600/860,1600/860);c.translate(38,20);c.drawImage(aroCanvas,(784-ladoAro)/2,(784-ladoAro)/2,ladoAro,ladoAro);c.save();c.beginPath();c.arc(392,392,392,0,Math.PI*2);c.clip();
    c.drawImage(escenaCv,0,0,784,784);
    c.restore();c.restore();if(!conFondo)return cv.toDataURL('image/png');c.fillStyle='#26312d';c.font='26px Arimo,Arial,sans-serif';c.fillText('MICROMUNDOS · TU PLACA',70,1550);return cv.toDataURL('image/png');
  }
  $('tpRecuerdo').addEventListener('click',()=>{cerrarMenus();cerrarReaccion();const url=pintarRecuerdo(),sinFondo=pintarRecuerdo(false);$('tpImagenRecuerdo').src=sinFondo;$('tpImagenRecuerdo').dataset.sinFondo=sinFondo;$('tpGuardar').href=url;$('tpVistaRecuerdo').hidden=false;for(const el of [board,$('tpBiblioteca'),pagina.querySelector('.tp-acciones'),$('tpRecuerdo'),$('tpGenerar'),$('tpReacciones')])el.inert=true;$('tpVolver').focus();});
  function cerrarRecuerdo(){$('tpVistaRecuerdo').hidden=true;for(const el of [board,$('tpBiblioteca'),pagina.querySelector('.tp-acciones'),$('tpRecuerdo'),$('tpGenerar'),$('tpReacciones')])el.inert=false;$('tpRecuerdo').focus();}
  // ── Placas de otras personas (19/11/2026, Paco): solo las reales, las que la gente guarda desde el link (Supabase,
  // window.MicromundosPlacas en tu-placa-nombre.js). Ya no hay placas simuladas ni se muestran las guardadas en este equipo.
  const CLAVE_PROPIAS='micromundos-placas-guardadas',TOTAL_OTRAS=30;
  // 19/11/2026 (Paco): se sacan una vez las placas de prueba guardadas a nombre de PACO; las que se guarden después quedan.
  try{if(!localStorage.getItem('micromundos-limpieza-paco-2026-11-19')){const l=JSON.parse(localStorage.getItem(CLAVE_PROPIAS)||'[]');
    if(Array.isArray(l))localStorage.setItem(CLAVE_PROPIAS,JSON.stringify(l.filter(p=>String(p?.nombre||'').trim().toUpperCase()!=='PACO')));
    localStorage.setItem('micromundos-limpieza-paco-2026-11-19','1');}}catch{}
  // Epígrafe: nombre, día y hora (19/11/2026, Paco); si no hay nombre, «Guardada el …».
  const hora=(f,n)=>{const d=new Date(f),dd=v=>String(v).padStart(2,'0'),cuando=dd(d.getDate())+'/'+dd(d.getMonth()+1)+' · '+dd(d.getHours())+':'+dd(d.getMinutes());return n?n.toUpperCase()+' · '+cuando:'Guardada el '+cuando;};
  let compartidas=null,carrusel=null;
  // Con suficientes placas para pasar el ancho de la pantalla, una fila con desplazamiento horizontal infinito (arrastre con
  // inercia, rueda y flechas); con pocas, quietas y centradas. Sin placas, un aviso.
  function armarOtras(estado){
    const ol=$('tpOtras').querySelector('.tp-otras-grilla');ol.replaceChildren();carrusel?.parar();carrusel=null;
    const avisar=t=>{const p=document.createElement('p');p.className='tp-otras-vacio';p.textContent=t;ol.appendChild(p);};
    if(estado==='cargando'){avisar('Cargando las placas…');return;}
    if(!Array.isArray(estado)){avisar('No se pudieron cargar las placas. Revisá la conexión.');return;}
    if(!estado.length){avisar('Todavía no hay placas. Guardá la tuya y va a aparecer acá.');return;}
    const pista=document.createElement('div');pista.className='tp-otras-pista';ol.appendChild(pista);
    const PASO=480,ANCHO=estado.length*PASO,infinita=ANCHO>1920,copias=infinita?2:1;
    if(!infinita)pista.style.paddingLeft=Math.round((1920-ANCHO+80)/2)+'px';
    for(let c=0;c<copias;c++)estado.forEach(f=>{
      const li=document.createElement('li');if(c>0)li.setAttribute('aria-hidden','true');
      const im=document.createElement('img');im.src=f.img;im.alt=c?'':(f.nombre?'Placa de '+f.nombre:'Placa guardada');im.draggable=false;
      const t=document.createElement('p');t.textContent=hora(f.fecha,f.nombre);li.append(im,t);pista.appendChild(li);});
    if(infinita)carrusel=moverCarrusel(ol,pista,ANCHO);
  }
  function moverCarrusel(caja,pista,ancho){
    let pos=0,vel=0,cuadro=0,toque=null,ultimo=0;
    const pintar=()=>{const x=((pos%ancho)+ancho)%ancho;pista.style.transform=`translateX(${-x}px)`;};
    const escalaDe=()=>caja.getBoundingClientRect().width/caja.offsetWidth||1;
    const inercia=t=>{const dt=Math.min(48,t-(ultimo||t));ultimo=t;pos+=vel*dt;vel*=Math.pow(.94,dt/16);pintar();cuadro=Math.abs(vel)>.01?requestAnimationFrame(inercia):0;};
    const lanzar=()=>{cancelAnimationFrame(cuadro);ultimo=0;if(Math.abs(vel)>.01&&!(typeof movimientoReducido==='function'&&movimientoReducido()))cuadro=requestAnimationFrame(inercia);};
    const abajo=e=>{if(e.button>0)return;cancelAnimationFrame(cuadro);cuadro=0;vel=0;toque={x:e.clientX,t:performance.now(),k:escalaDe()};caja.classList.add('arrastrando');try{caja.setPointerCapture(e.pointerId);}catch{}};
    const mover=e=>{if(!toque)return;const ahora=performance.now(),dx=(e.clientX-toque.x)/toque.k,dt=Math.max(1,ahora-toque.t);pos-=dx;vel=vel*.5+(-dx/dt)*.5;toque.x=e.clientX;toque.t=ahora;pintar();};
    const arriba=()=>{if(!toque)return;if(performance.now()-toque.t>80)vel=0;toque=null;caja.classList.remove('arrastrando');lanzar();};
    const rueda=e=>{e.preventDefault();cancelAnimationFrame(cuadro);cuadro=0;pos+=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;pintar();};
    const tecla=e=>{if(e.key!=='ArrowRight'&&e.key!=='ArrowLeft')return;e.preventDefault();vel=(e.key==='ArrowRight'?1:-1)*1.6;lanzar();};
    caja.addEventListener('pointerdown',abajo);caja.addEventListener('pointermove',mover);
    for(const t of ['pointerup','pointercancel','lostpointercapture'])caja.addEventListener(t,arriba);
    caja.addEventListener('wheel',rueda,{passive:false});caja.addEventListener('keydown',tecla);
    pintar();
    return {parar(){cancelAnimationFrame(cuadro);caja.removeEventListener('pointerdown',abajo);caja.removeEventListener('pointermove',mover);
      for(const t of ['pointerup','pointercancel','lostpointercapture'])caja.removeEventListener(t,arriba);caja.removeEventListener('wheel',rueda);caja.removeEventListener('keydown',tecla);}};
  }
  function abrirOtras(){$('tpVistaRecuerdo').hidden=true;$('tpOtras').hidden=false;armarOtras(compartidas||'cargando');$('tpOtrasVolver').focus({preventScroll:true});
    const leer=window.MicromundosPlacas?.leer(TOTAL_OTRAS)||Promise.resolve(null);
    leer.then(l=>{if($('tpOtras').hidden)return;if(!l){if(!compartidas)armarOtras('error');return;}const antes=JSON.stringify(compartidas?.map(p=>p.fecha));compartidas=l;if(JSON.stringify(l.map(p=>p.fecha))!==antes)armarOtras(l);});}
  function cerrarOtras(){if($('tpOtras').hidden)return;$('tpOtras').hidden=true;cerrarRecuerdo();}
  $('tpVerOtras').addEventListener('click',abrirOtras);$('tpOtrasVolver').addEventListener('click',cerrarOtras);
  pagina.addEventListener('keydown',ev=>{if(ev.key==='Escape'&&!$('tpOtras').hidden)cerrarOtras();});
  document.addEventListener('cerrar-tuplaca',()=>{if(!$('tpOtras').hidden){$('tpOtras').hidden=true;}});
  $('tpVolver').addEventListener('click',cerrarRecuerdo);pagina.addEventListener('keydown',ev=>{if(ev.key==='Escape'&&!$('tpVistaRecuerdo').hidden)cerrarRecuerdo();});
  document.addEventListener('cerrar-tuplaca',()=>{cerrarMenus();cerrarReaccion();if(!$('tpVistaRecuerdo').hidden)cerrarRecuerdo();});
  try{const guardado=JSON.parse(localStorage.getItem(clave)||'null');if(guardado&&Array.isArray(guardado.items)){for(const it of guardado.items.slice(0,120))if((modelos.has(it.modelo)||it.estilo)&&[it.x,it.y,it.tamano,it.escala,it.rot,it.foco,it.seed].every(Number.isFinite))items.push(it);secuencia=Math.max(guardado.contador||0,...items.map(i=>i.id));
      intensidad=Number.isFinite(guardado.intensidad)?guardado.intensidad:guardado.reacciones===false?0:85;zoom=Number.isFinite(guardado.zoom)?guardado.zoom:100;giro=Number.isFinite(guardado.giro)?guardado.giro:0;if(ESTRUCTURAS.some(([id])=>id===guardado.estructura))estructura=guardado.estructura;}
    else{const viejo=JSON.parse(localStorage.getItem('micromundos-tuplaca-v1')||'[]');if(Array.isArray(viejo))for(const it of viejo.slice(0,60)){const grupo=['B','L','M'][Math.floor(it.estilo/4)],estado=it.estilo%4===3?'R':it.estilo%4===2?'C':'A',m=modelos.get(grupo+'-'+estado+'-01');if(m&&[it.x,it.y,it.tamano].every(Number.isFinite))crear(m,it.x*784/720,it.y*784/720,it.tamano);}}
  }catch{}
  dibujar();actualizar();guardar();
}
