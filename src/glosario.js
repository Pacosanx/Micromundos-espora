// Datos editoriales separados de la interfaz; las asociaciones usan receta + id.
function muestrasDeTermino(termino, catalogo=muestras, relaciones=VINCULOS_GLOSARIO){
  const ids=new Set(relaciones.filter(r=>r.termino_id===termino.id).map(r=>r.receta+':'+r.id));
  return catalogo.filter(s=>ids.has(s.capa+':'+s.it.id)||
    (termino.criterio_grupo&&s.grupo.includes(termino.criterio_grupo)));
}
function prepararNavegacionPrincipal(cambiar){
  const contenedor=$('navegacionPrincipal');
  const botones={muestras:$('navMuestras'),glosario:$('navGlosario'),tuplaca:$('navTuPlaca'),quees:$('navQueEs')};
  let orden=['muestras','glosario','tuplaca','quees'],animaciones=[],copias=[];
  const medidor=document.createElement('canvas').getContext('2d');
  function mover(activa,animar=true){
    const antes={};
    for(const [id,el]of Object.entries(botones))antes[id]={left:getComputedStyle(el).left,opacity:getComputedStyle(el).opacity};
    for(const a of animaciones)a.cancel();for(const el of copias)el.remove();
    animaciones=[];copias=[];
    const salto=orden.indexOf(activa),envuelven=new Set(orden.slice(0,salto));
    orden=[...orden.slice(salto),...orden.slice(0,salto)];
    medidor.font='700 17px Arimo,Arial,sans-serif';
    const ancho=contenedor.clientWidth;
    const medir=id=>medidor.measureText(botones[id].textContent).width;
    // La sección activa va a la izquierda; las demás quedan alineadas a la derecha, separadas 61 px.
    const posiciones=[0];
    for(let i=orden.length-1,x=ancho;i>0;i--){x-=medir(orden[i]);posiciones[i]=x;x-=61;}
    orden.forEach((id,i)=>{
      const el=botones[id],fin={left:posiciones[i]+'px',opacity:1};
      Object.assign(el.style,fin);el.setAttribute('aria-current',i===0?'page':'false');
      if(!animar||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
      let inicio=antes[id];
      if(envuelven.has(id)){
        const copia=document.createElement('span');copia.className='g-nav-copia';copia.textContent=el.textContent;
        copia.setAttribute('aria-hidden','true');Object.assign(copia.style,inicio);contenedor.appendChild(copia);copias.push(copia);
        const a=copia.animate([inicio,{left:(parseFloat(inicio.left)-ancho)+'px',opacity:0}],{duration:420,easing:'ease-out'});
        a.finished.then(()=>copia.remove(),()=>copia.remove());animaciones.push(a);
        inicio={left:(posiciones[i]+ancho)+'px',opacity:0};
      }
      animaciones.push(el.animate([inicio,fin],{duration:420,easing:'ease-out'}));
    });
  }
  for(const [id,el]of Object.entries(botones))el.addEventListener('click',()=>cambiar(id));
  mover('muestras',false);
  addEventListener('resize',()=>mover(orden[0],false));
  document.fonts?.ready.then(()=>mover(orden[0],false));
  return mover;
}
function contenidoUniverso(id){
  const datos={bacterias:['Bacterias','01'],levaduras:['Levaduras','02'],mohos:['Mohos','03']}[id];
  return '<span aria-hidden="true" class="universo-circulo"></span><span class="universo-titulo">'+datos[0]+'<sup class="indice-glosario">('+datos[1]+')</sup></span>';
}
let ultimoSitioCartel=null;
function ubicarCartelFlotante(el){
  const w=el.offsetWidth||577,h=el.offsetHeight||500;
  const minX=32-DX/2,maxX=Math.max(minX,1888+DX/2-w),minY=156-DY/2,maxY=Math.max(minY,1068+DY/2-h);
  const marco=pantalla.getBoundingClientRect();
  const ocupados=[...$('anclaCarteles').querySelectorAll('.cartel.vis')].filter(e=>e!==el).map(e=>{const r=e.getBoundingClientRect();return{x:(r.left-marco.left)/escala-DX/2,y:(r.top-marco.top)/escala-DY/2,w:r.width/escala,h:r.height/escala};});
  let mejor=null;
  for(let i=0;i<18;i++){
    const x=minX+Math.random()*(maxX-minX),y=minY+Math.random()*(maxY-minY);
    const solapamiento=ocupados.reduce((total,r)=>total+Math.max(0,Math.min(x+w,r.x+r.w)-Math.max(x,r.x))*Math.max(0,Math.min(y+h,r.y+r.h)-Math.max(y,r.y)),0);
    const distancia=ultimoSitioCartel?Math.hypot(x-ultimoSitioCartel.x,y-ultimoSitioCartel.y):0;
    const puntuacion=-solapamiento+distancia*24;
    if(!mejor||puntuacion>mejor.puntuacion)mejor={x,y,puntuacion};
  }
  ultimoSitioCartel=mejor;el.style.transform=`translate(${mejor.x.toFixed(1)}px,${mejor.y.toFixed(1)}px)`;
}
function prepararGlosario(){
  const pagina=$('glosario'),scroll=$('glosarioScroll'),tabla=$('glosarioTabla');
  const esc=escaparCartel,carteles=new Map(),abiertos=new Set();
  const filas=new Map();let seccion='muestras',nivelCarteles=6,detalles,seccionTimer=0;
  const menu=prepararNavegacionPrincipal(cambiarSeccion);
  const numero=t=>'('+String(t.numero).padStart(2,'0')+')';
  const colorGrupo=g=>`<span class="g-chips" aria-label="${esc(GRUPO_NOMBRE[g]||g)}">${[...g].map(c=>`<i style="background:${PALETA_CARTEL[c]}"></i>`).join('')}</span>`;
  function crearFila(t,primera){
    const caja=document.createElement('section');caja.className='g-entrada';caja.dataset.termino=t.id;
    const relacionadas=muestrasDeTermino(t);
    caja.innerHTML=`<button type="button" class="g-fila" aria-expanded="false" aria-controls="g-detalle-${esc(t.id)}"><span class="g-bloque">${primera?esc(t.bloque):''}</span><span class="g-numero">${numero(t)}</span><span class="g-termino">${esc(t.termino)}</span><span class="g-cuenta">${String(relacionadas.length).padStart(2,'0')} <span class="g-indicador">+</span></span>${colorGrupo(t.grupo)}</button><div class="g-desplegable" id="g-detalle-${esc(t.id)}" inert><div class="g-desplegable-interior"><div class="g-muestras"></div></div></div>`;
    const lista=caja.querySelector('.g-muestras');
    if(!relacionadas.length){const p=document.createElement('p');p.className='g-vacio';p.textContent='Todavía no hay muestras vinculadas a este término.';lista.appendChild(p);}
    for(const s of relacionadas){
      const b=document.createElement('button');b.type='button';b.className='g-muestra';
      b.innerHTML=`<span>${esc(s.codigo)}</span><span>${esc(s.origen)} <img src="__G_ENLACE__" alt=""/></span>`;
      b.addEventListener('click',()=>{cambiarSeccion('muestras');seleccionar(s);});lista.appendChild(b);
    }
    caja.querySelector('.g-fila').addEventListener('click',()=>abrirTermino(t.id));
    filas.set(t.id,{caja,t});return caja;
  }
  function renderizar(){
    tabla.replaceChildren();filas.clear();let bloque='';
    for(const t of TERMINOS_GLOSARIO){
      if(t.tipo!=='termino')continue;
      const primera=t.bloque!==bloque,caja=crearFila(t,primera);
      if(primera)caja.classList.add('g-inicio-bloque');
      tabla.appendChild(caja);bloque=t.bloque;
    }
  }
  function actualizarFilas(){
    for(const [id,{caja}]of filas){
      const abierto=abiertos.has(id);caja.classList.toggle('g-abierta',abierto);
      caja.querySelector('.g-fila').setAttribute('aria-expanded',String(abierto));
      caja.querySelector('.g-indicador').textContent=abierto?'↑':'+';
      caja.querySelector('.g-desplegable').inert=!abierto;
    }
  }
  function abrirTermino(id,forzar=false,origen=null){
    const t=TERMINOS_GLOSARIO.find(t=>t.id===id);if(!t)return;
    const caja=origen||filas.get(id)?.caja||pagina;
    if(abiertos.has(id)&&!forzar)abiertos.delete(id);else abiertos.add(id);
    actualizarFilas();
    if(carteles.has(id))return;
    const el=$('plantillaCartelGlosario').content.firstElementChild.cloneNode(true);
    if(origen)el.classList.add('cartel-referencia');
    el.querySelector('.nom').textContent=t.termino;
    el.querySelector('.cod').textContent=numero(t);
    el.querySelector('.definicionGlosario').textContent=t.definicion||'Contenido en preparación.';
    el.setAttribute('aria-label',t.termino);universoCartel(el,t.grupo);
    $('anclaCarteles').appendChild(el);
    const r=caja.getBoundingClientRect(),marco=pantalla.getBoundingClientRect();
    const i=carteles.size;
    const y=clamp((r.top-marco.top)/escala-DY/2-110,180-DY/2,1100+DY/2-el.offsetHeight-24);
    el.style.transform='translate('+(923+(i%4)*22)+'px,'+clamp(y+(i%3)*16,180-DY/2,1100+DY/2-el.offsetHeight-24)+'px)';
    if(origen&&pantalla.classList.contains('en-universo'))ubicarCartelFlotante(el);
    const agua=activarOleajeCartel(el,i);
    const cancelar=activarArrastreCartel(el,pos=>{
      el.style.transform='translate('+pos.x.toFixed(1)+'px,'+pos.y.toFixed(1)+'px)';
    },()=>{
      agua.detener();carteles.delete(id);abiertos.delete(id);actualizarFilas();el.remove();
    });
    carteles.set(id,{el,cancelar,agua});
    el.addEventListener('pointerdown',()=>{el.style.zIndex=++nivelCarteles;});
    requestAnimationFrame(()=>el.classList.add('vis'));
  }
  function cambiarSeccion(nueva,interna=false){
    document.dispatchEvent(new Event('cerrar-tuplaca'));
    if(!interna&&detalles?.salir(nueva,()=>cambiarSeccion(nueva,true)))return;
    detalles?.cerrar();
    for(const {el,cancelar,agua}of carteles.values()){cancelar();agua.detener();el.remove();}
    carteles.clear();abiertos.clear();actualizarFilas();
    seleccionar(null);
    if(nueva===seccion)return;
    const anterior=seccion;seccion=nueva;seleccionar(null);
    menu(nueva);
    const glosario=nueva==='glosario',propia=nueva==='tuplaca',quees=nueva==='quees';
    clearTimeout(seccionTimer);pantalla.classList.add('transicion-seccion');
    if(glosario)pagina.hidden=false;if(propia)$('tuPlaca').hidden=false;if(quees)$('queEs').hidden=false;
    pantalla.classList.toggle('en-glosario',glosario);
    pantalla.classList.toggle('en-tuplaca',propia);
    pantalla.classList.toggle('en-quees',quees);
    document.body.classList.toggle('seccion-glosario',glosario);
    for(const {agua}of carteles.values())agua.detener();
    actualizarScroll();
    pagina.inert=!glosario;$('tuPlaca').inert=!propia;$('queEs').inert=!quees;
    for(const id of ['centro','derecha','leyenda','izqAbajo'])$(id).inert=nueva!=='muestras';
    $('seccion').innerHTML=glosario?'<span>[03.0]</span>ÍNDICE DEL GLOSARIO':propia?'<span>[04.1]</span>COMPONER':quees?'<span>[00.1]</span>PRESENTACIÓN':'<span>[01.0]</span>';
    const grupos={muestras:['centro','derecha','leyenda','izqAbajo'],glosario:['glosario'],tuplaca:['tuPlaca'],quees:['queEs']};
    if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
      for(const id of grupos[anterior])$(id).animate([{translate:'0 0',opacity:1},{translate:'-140px 0',opacity:0}],{duration:420,easing:'ease-in-out'});
      for(const id of grupos[nueva])$(id).animate([{translate:'180px 0',opacity:0},{translate:'0 0',opacity:1}],{duration:420,easing:'ease-out'});
    }
    seccionTimer=setTimeout(()=>{
      if(seccion!=='glosario')pagina.hidden=true;
      if(seccion!=='tuplaca')$('tuPlaca').hidden=true;
      if(seccion!=='quees')$('queEs').hidden=true;
      pantalla.classList.remove('transicion-seccion');
    },450);
  }
  document.querySelectorAll('[data-ir-seccion]').forEach(b=>b.addEventListener('click',()=>cambiarSeccion(b.dataset.irSeccion)));
  $('glosarioVolver').addEventListener('click',()=>cambiarSeccion('muestras'));
  $('glosarioBajar').addEventListener('click',()=>scroll.scrollTo({top:$('glosarioIndice').offsetTop-96-200,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}));
  document.querySelectorAll('[data-glosario-grupo]').forEach(b=>{
    b.innerHTML=contenidoUniverso(b.dataset.glosarioGrupo);b.classList.add('universo-enlace','universo-'+b.dataset.glosarioGrupo);
    b.disabled=false;b.addEventListener('click',()=>detalles.abrirUniverso(b.dataset.glosarioGrupo,b));
  });
  let frameScroll=0,ultimoScroll=scroll.scrollTop;
  const actualizarScroll=()=>{
    frameScroll=0;
    const avance=Math.max(0,scroll.scrollTop);
    const delta=avance-ultimoScroll;ultimoScroll=avance;
    const movimiento=seccion==='glosario'&&!matchMedia('(prefers-reduced-motion: reduce)').matches;
    pantalla.style.setProperty('--paralaje-lento',(-avance*(movimiento ? .12 : 0)).toFixed(2)+'px');
    pantalla.style.setProperty('--paralaje-aros',(-avance*(movimiento ? .28 : 0)).toFixed(2)+'px');
    if(movimiento&&delta)for(const {agua}of carteles.values())agua.impulsar(delta);
    const fundido=1-suave(clamp(avance/80));
    pagina.style.setProperty('--indicacion-deslizar',fundido.toFixed(3));
    pagina.style.setProperty('--adelanto-indice',(-96*suave(clamp(avance/180))).toFixed(2)+'px');
    $('glosarioBajar').inert=avance>8;
  };
  scroll.addEventListener('scroll',()=>{if(!frameScroll)frameScroll=requestAnimationFrame(actualizarScroll);},{passive:true});
  actualizarScroll();
  renderizar();
  detalles=prepararPantallasDetalle({irSeccion:cambiarSeccion,abrirTermino,
    impulsarReferencias:delta=>{for(const {agua}of carteles.values())agua.impulsar(delta);}});
  document.addEventListener('abrir-ficha-muestra',()=>detalles.abrirFicha());
}
