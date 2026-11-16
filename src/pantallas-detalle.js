// Tres objetivos solidarios: mismo radio, órbita fija y un giro de 120 grados.
function geometriaObjetivos(t,ancho,alto){
  const u=Math.max(0,Math.min(1,t/.78)),giro=u*u*(3-2*u)*Math.PI*2/3;
  const diagonal=Math.hypot(ancho,alto),orbita=diagonal*1.3,angulo=Math.atan2(.67,-.74);
  const px=ancho/2-Math.cos(angulo)*orbita,py=alto/2-Math.sin(angulo)*orbita;
  return {radio:diagonal*.60,giro,centros:[0,-1,1].map(i=>({x:px+Math.cos(angulo+i*Math.PI*2/3+giro)*orbita,y:py+Math.sin(angulo+i*Math.PI*2/3+giro)*orbita}))};
}
// Restricciones del lienzo de Figma: márgenes fijos, ilustraciones centradas y marcos fluidos.
function longitudDetalle(valor){
  if(/^[-+]?0(?:\.0+)?$/.test(valor))return 0;
  if(/^-?[\d.]+px$/.test(valor))return parseFloat(valor);
  const calc=/^calc\(\s*([\d.]+)%\s*([+-])\s*([\d.]+)px\s*\)$/.exec(valor);
  return calc?Number(calc[1])*19.2+(calc[2]==='-'?-1:1)*Number(calc[3]):null;
}
function adaptarMargenesDetalle(raiz){
  raiz.style.width='100%';
  const recorrer=(padre,marcoAmplio)=>{
    for(const el of padre.children){
      const estilo=el.style,pos=estilo.position||'',contenido=estilo.display==='contents';
      const x=longitudDetalle(estilo.left||''),w=longitudDetalle(estilo.width||'');
      const marcoCompleto=marcoAmplio&&pos==='absolute'&&x===0&&w===1920&&el.tagName!=='IMG';
      if(marcoCompleto)estilo.width='100%';
      else if(marcoAmplio&&pos==='absolute'&&!contenido&&x!==null&&!el.dataset.anclaCentro){
        if(x>=0&&x<=40&&w>=1800){estilo.right='40px';estilo.width='auto';}
        else if(x>=1434)estilo.left=`calc(100% - ${(1920-x).toFixed(3)}px)`;
        else if(x>=320||(el.dataset.name||'').startsWith('Colonia ·')){
          estilo.left=`calc(50% ${x<960?'-':'+'} ${Math.abs(x-960).toFixed(3)}px)`;
          if(w>700&&Math.abs(x+w-1880)<3){estilo.width='auto';estilo.right='40px';}
        }
      }
      const estableceMarco=pos&&pos!=='static'&&!contenido;
      const siguiente=marcoCompleto||(!estableceMarco&&marcoAmplio)||(marcoAmplio&&pos==='relative'&&estilo.width==='100%');
      recorrer(el,siguiente);
    }
  };
  recorrer(raiz,true);
}

// Figma exporta los desenfoques progresivos como un blur uniforme. Se interpolan
// superficies con los mismos recursos para conservar la zona nítida del centro.
function desenfoqueProgresivoDetalle(el,puntos,eje='x'){
  if(!el)return;
  const contenido=[...el.childNodes];el.replaceChildren();el.style.filter='none';
  const superficie=document.createElement('div');
  Object.assign(superficie.style,{position:'absolute',inset:'0',isolation:'isolate',pointerEvents:'none'});
  superficie.dataset.blurProgresivo=eje;
  puntos.forEach(([pos,radio],i)=>{
    const anterior=puntos[i-1]?.[0]??0,siguiente=puntos[i+1]?.[0]??1;
    const capas=document.createElement('div'),copia=document.createElement('div');
    const paradas=i===0?`white 0%,white ${pos*100}%,transparent ${siguiente*100}%`:
      i===puntos.length-1?`transparent ${anterior*100}%,white ${pos*100}%,white 100%`:
      `transparent ${anterior*100}%,white ${pos*100}%,transparent ${siguiente*100}%`;
    const mascara=`linear-gradient(to ${eje==='x'?'right':'bottom'},${paradas})`;
    Object.assign(capas.style,{position:'absolute',inset:'0',maskImage:mascara,webkitMaskImage:mascara,mixBlendMode:'plus-lighter'});
    Object.assign(copia.style,{position:'absolute',inset:'0',filter:`blur(${radio}px)`});
    for(const hijo of contenido)copia.appendChild(hijo.cloneNode(true));
    capas.appendChild(copia);superficie.appendChild(capas);
  });
  el.appendChild(superficie);
}
function prepararBlurPortadaDetalle(raiz,id){
  const ids={bacterias:['441:10441','441:10442','441:10443','441:10445','441:10447'],
    levaduras:['446:5407','446:5408','446:5409','446:5411','446:5413'],
    mohos:['446:5753','446:5754','446:5755','446:5757','446:5759']}[id];
  if(!ids)return;
  const nodos=ids.map(id=>raiz.querySelector(`[data-node-id="${id}"]`));
  const vertical=[[.71481484,1.5],[.85740742,3.25],[1,5]];
  desenfoqueProgresivoDetalle(nodos[0],vertical,'y');
  desenfoqueProgresivoDetalle(nodos[3],vertical,'y');
  desenfoqueProgresivoDetalle(nodos[4],[[0,5],[.25,16.25],[.5,27.5],[.75,38.75],[1,50]],'y');
  nodos[2].style.filter='none';
  desenfoqueProgresivoDetalle(nodos[1],[[0,10],[1/6,20/3],[1/3,10/3],[.5,0],[2/3,10/3],[5/6,20/3],[1,10]]);
}

// Pantallas extensas: composiciones de Figma adaptadas a HTML nativo y datos del archivo.
function prepararReferenciasGlosario(raiz,abrirTermino){
  const normalizar=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const palabras={colonia:'colonia',colonias:'colonia',hifas:'hifa',hifa:'hifa',micelio:'micelio',esporas:'espora',espora:'espora',esporangios:'esporangio',esporangio:'esporangio',gemacion:'gemacion',fermentacion:'fermentacion',coco:'coco',bacilo:'bacilo',espiral:'espiral'};
  for(const p of raiz.querySelectorAll('p')){
    if(p.closest('[data-name^="Fila ·"],.universo-enlace,[role="button"],.cartel'))continue;
    const walker=document.createTreeWalker(p,4),nodos=[];while(walker.nextNode())nodos.push(walker.currentNode);
    for(const nodo of nodos){
      const original=nodo.textContent;if(!/\(\d{2}\)/.test(original))continue;
      const fragmento=document.createDocumentFragment();let inicio=0;
      for(const m of original.matchAll(/\((\d{2})\)/g)){
        const previo=original.slice(inicio,m.index),anterior=previo.trim()||nodo.parentElement.previousElementSibling?.textContent.trim()||'';
        const limpio=normalizar(anterior),palabra=limpio.match(/([a-z]+)\s*$/)?.[1];
        const id=/fision binaria$/.test(limpio)?'fision-binaria':palabras[palabra];
        const t=id?TERMINOS_GLOSARIO.find(t=>t.id===id):TERMINOS_GLOSARIO.find(t=>Number(t.numero)===Number(m[1])&&Number(t.numero)>3);
        if(!t){fragmento.appendChild(document.createTextNode(previo+m[0]));inicio=m.index+m[0].length;continue;}
        const b=document.createElement('button');b.type='button';b.className='referencia-glosario';b.dataset.termino=t.id;
        b.setAttribute('aria-label','Definición de '+t.termino+' ('+String(t.numero).padStart(2,'0')+')');
        // El número es un superíndice del término, incluso si Figma lo separó en otro span.
        const terminoEnTexto=previo.match(/(?:fisión binaria|colonia|hifas?|micelio|esporas?|esporangios?|gemación|fermentación|Coco|Bacilo|Espiral)\s*$/i);
        if(terminoEnTexto){fragmento.appendChild(document.createTextNode(previo.slice(0,terminoEnTexto.index)));b.textContent=terminoEnTexto[0].trimEnd();}
        else {
          fragmento.appendChild(document.createTextNode(previo.trimEnd()));
          const contenedor=nodo.parentElement,terminoSeparado=contenedor!==p&&/^\s*\(\d{2}\)\s*$/.test(original)?contenedor.previousElementSibling:null;
          if(terminoSeparado&&normalizar(terminoSeparado.textContent.trim())===limpio){
            b.textContent=terminoSeparado.textContent.trim();terminoSeparado.remove();contenedor.style.fontSize='inherit';
            while(contenedor.previousSibling?.nodeType===3&&!contenedor.previousSibling.textContent.trim())contenedor.previousSibling.remove();
          }
        }
        const indice=document.createElement('sup');indice.className='indice-glosario';indice.textContent='('+String(t.numero).padStart(2,'0')+')';b.appendChild(indice);
        b.addEventListener('click',ev=>{ev.stopPropagation();abrirTermino(t.id,true,b);});fragmento.appendChild(b);inicio=m.index+m[0].length;
      }
      fragmento.appendChild(document.createTextNode(original.slice(inicio)));nodo.replaceWith(fragmento);
    }
  }
  for(const titulo of [...raiz.children]){
    if(titulo.tagName!=='P'||! /^(Bacterias|Levaduras|Mohos)$/i.test(titulo.textContent.trim()))continue;
    const marcador=titulo.nextElementSibling;if(!marcador||!/^\s*\(0[123]\)\s*$/.test(marcador.textContent))continue;
    const indice=document.createElement('sup');indice.className='indice-glosario';indice.textContent=marcador.textContent.trim();
    titulo.textContent=titulo.textContent.trim();titulo.appendChild(indice);marcador.remove();
  }
}
function prepararPantallasDetalle({irSeccion,abrirTermino,impulsarReferencias=()=>{}}){
  const claves={bacterias:'441:10436',levaduras:'446:5402',mohos:'446:5748',ficha:'ficha'};
  const grupos={bacterias:'B',levaduras:'L',mohos:'M'};
  const marco=document.createElement('section');marco.id='pantallasDetalle';marco.hidden=true;marco.inert=true;marco.dataset.ui='';
  marco.innerHTML='<div id="detalleScroll"><div id="detalleLienzo"></div></div>';
  pantalla.appendChild(marco);
  const scroll=marco.firstElementChild,lienzo=scroll.firstElementChild,carteles=new Map(),limpiezasVista=new Set();
  let actual=null,retorno='glosario',animacion=0,limpiarLupa=()=>{},limpiarObjetivo=()=>{},muestraFicha=null;
  const esc=escaparCartel;
  const texto=el=>el.textContent.trim().replace(/\s+/g,' ');
  const interactivo=(el,accion,nombre)=>{
    if(!el)return;el.tabIndex=0;el.setAttribute('role','button');el.setAttribute('aria-label',nombre||texto(el));el.classList.add('detalle-interactivo');
    el.addEventListener('click',ev=>{ev.stopPropagation();accion(ev);});
    el.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();accion(ev);}});
  };
  function cerrar(){
    limpiarObjetivo();limpiarObjetivo=()=>{};
    if(!actual)return;
    limpiarLupa();limpiarLupa=()=>{};
    for(const {el,cancelar,agua,limpiarGrafico}of carteles.values()){cancelar();agua.detener();limpiarGrafico();el.remove();}carteles.clear();
    for(const limpiar of limpiezasVista)limpiar();limpiezasVista.clear();
    actual=null;marco.hidden=true;marco.inert=true;cancelAnimationFrame(animacion);
    pantalla.classList.remove('en-detalle','en-universo','entrando-universo');
    $('glosario').inert=!pantalla.classList.contains('en-glosario');
    for(const nombre of ['centro','derecha','leyenda','izqAbajo'])$(nombre).inert=pantalla.classList.contains('en-glosario')||pantalla.classList.contains('en-tuplaca');
  }
  function abrir(id,desde){
    const fichaAnterior=actual==='ficha'?muestraFicha:null,regresoAnterior=retorno;
    if(id==='ficha')muestraFicha=desde&&typeof desde==='object'?desde:muestras.find(esFichaPreparada);
    const anterior=id!=='ficha'&&!movimientoReducido()?congelarObjetivo():null;
    const origen=actual;retorno=id==='ficha'?(origen||'muestras'):'glosario';
    irSeccion(id==='ficha'?'muestras':'glosario',true);
    seleccionar(null);
    actual=id;marco.hidden=false;marco.inert=false;
    if(id!=='ficha'&&!movimientoReducido())pantalla.classList.add('entrando-universo');
    pantalla.classList.add('en-detalle');pantalla.classList.toggle('en-universo',id!=='ficha');
    $('glosario').inert=true;
    for(const nombre of ['centro','derecha','leyenda','izqAbajo'])$(nombre).inert=true;
    const fichaArchivo=id==='ficha'&&!esFichaPreparada(muestraFicha);
    lienzo.innerHTML=fichaArchivo?htmlFichaArchivo(muestraFicha):DISENOS_DETALLE[claves[id]].html;
    lienzo.style.height=fichaArchivo?'1900px':id==='ficha'?(DISENOS_DETALLE.ficha.height||4400)+'px':'5500px';
    const raiz=lienzo.firstElementChild;
    Object.assign(raiz.style,{width:'100%',height:lienzo.style.height,filter:'none',borderRadius:'0',overflow:'clip'});
    raiz.classList.add('detalle-composicion');
    raiz.querySelector('[data-name="Cabecera"]')?.remove();
    raiz.querySelector('[data-name^="Cartel grande"]')?.remove();
    raiz.querySelector('[data-name^="Cartelito abierto"]')?.remove();
    // El mismo marco de navegación queda visible sobre el contenido, sin crear otra cabecera.
    const volver=[...raiz.querySelectorAll('p')].find(el=>texto(el).toLowerCase()==='volver');
    interactivo(volver?.parentElement,()=>{
      const destino=retorno;if(destino==='ficha'&&fichaAnterior){abrir('ficha',fichaAnterior);retorno=regresoAnterior;}else if(grupos[destino])abrir(destino);else irSeccion(destino);
    },'Volver');
    const desliza=id==='ficha'?raiz.querySelector('[data-node-id="500:7158"]'):[...raiz.querySelectorAll('p')].find(el=>texto(el)==='Deslizá');
    interactivo(desliza?.parentElement,()=>scroll.scrollTo({top:1100,behavior:movimientoReducido()?'instant':'smooth'}),'Continuar hacia abajo');
    if(id==='ficha')prepararFicha(raiz);else prepararUniverso(raiz,id);
    prepararReferenciasGlosario(raiz,abrirTermino);
    adaptarMargenesDetalle(raiz);
    if(id!=='ficha')limpiezasVista.add(prepararFondoUniverso(raiz,id));
    if(id==='ficha')ajustarFinFicha(raiz);
    scroll.scrollTop=0;ultimaY=0;actualizarParalajeDetalle();
    if(!movimientoReducido()){
      if(id!=='ficha')cambiarObjetivo(id,raiz,anterior);
      else {
        const entrada=raiz.animate([{translate:'120px 0',opacity:0},{translate:'0 0',opacity:1}],{duration:550,easing:'ease-out'});
        if(id!=='ficha')entrada.finished.then(()=>{if(actual===id)pantalla.classList.remove('entrando-universo');},()=>{});
      }
    }
  }
  function congelarObjetivo(){
    const copiarEstilo=(original,clon)=>{
      const css=getComputedStyle(original);
      // Copiar geometría y tinta, sin fijar propiedades heredadas como text-fill-color.
      for(const propiedad of ['position','inset','left','top','right','bottom','width','height','z-index','overflow','display','visibility','opacity','color','font-family','font-size','font-weight','line-height','filter','mix-blend-mode','transform','translate','padding','margin','box-sizing','background','border-radius','align-items','justify-content','gap'])clon.style.setProperty(propiedad,css.getPropertyValue(propiedad));
    };
    const vista=document.createElement('div');vista.className='objetivo-anterior';
    const fuente=actual?lienzo.firstElementChild:$('glosario');
    const copia=fuente.cloneNode(true),originales=[fuente,...fuente.querySelectorAll('*')],copias=[copia,...copia.querySelectorAll('*')];
    let scrollCopia=null;
    for(let i=0;i<originales.length;i++){
      const original=originales[i],clon=copias[i];
      // Los IDs desaparecen de la copia visual; la navegación conserva una sola instancia real.
      if(original.id){
        copiarEstilo(original,clon);
        if(original.id==='glosarioScroll')scrollCopia={el:clon,y:original.scrollTop};
        clon.removeAttribute('id');
      }
      if(original.classList.contains('g-colonia')){copiarEstilo(original,clon);clon.style.animation='none';}
      if(original.tagName==='CANVAS'){clon.getContext('2d')?.drawImage(original,0,0);}
    }
    copia.hidden=false;copia.inert=true;Object.assign(copia.style,{visibility:'visible',opacity:'1',pointerEvents:'none'});
    if(actual)copia.style.translate='0 '+(-scroll.scrollTop)+'px';
    vista.appendChild(copia);
    const cabecera=$('cabecera'),cabeceraCopia=cabecera.cloneNode(true);
    const a=[cabecera,...cabecera.querySelectorAll('*')],b=[cabeceraCopia,...cabeceraCopia.querySelectorAll('*')];
    for(let i=0;i<a.length;i++){copiarEstilo(a[i],b[i]);b[i].removeAttribute('id');}
    vista.appendChild(cabeceraCopia);
    return {el:vista,iniciar:()=>{if(scrollCopia)scrollCopia.el.scrollTop=scrollCopia.y;}};
  }
  function salir(nueva,ejecutar){
    if(!grupos[actual]||movimientoReducido())return false;
    const anterior=congelarObjetivo();ejecutar();
    let destino=nueva==='glosario'?$('glosario'):nueva==='tuplaca'?$('tuPlaca'):null,restaurar=()=>{};
    if(!destino){
      const envoltura=document.createElement('div');envoltura.className='objetivo-destino';
      const nodos=['centro','derecha','leyenda','izqAbajo'].map(nombre=>$(nombre));
      const posiciones=nodos.map(el=>({el,padre:el.parentNode,siguiente:el.nextSibling}));
      pantalla.appendChild(envoltura);nodos.forEach(el=>envoltura.appendChild(el));destino=envoltura;
      restaurar=()=>{for(const {el,padre,siguiente}of posiciones)padre.insertBefore(el,siguiente?.parentNode===padre?siguiente:null);envoltura.remove();};
    }
    cambiarObjetivo(null,null,anterior,{destino,alTerminar:restaurar,reiniciarScroll:false});return true;
  }
  function cambiarObjetivo(id,raiz,anterior,{destino=scroll,alTerminar=()=>{},reiniciarScroll=true}={}){
    const duracion=1400,velo=document.createElement('div');velo.className='objetivo-transicion';velo.setAttribute('aria-hidden','true');
    const obturador=document.createElement('canvas');obturador.className='objetivo-campo';
    const caja=pantalla.getBoundingClientRect(),ancho=caja.width/escala,alto=caja.height/escala;
    obturador.width=760;obturador.height=Math.round(760*alto/ancho);
    const ctx=obturador.getContext('2d'),w=obturador.width,h=obturador.height;
    // Mapa radial de refracción: el centro conserva la imagen y el anillo exterior la desvía.
    const mapa=document.createElement('canvas');mapa.width=mapa.height=128;
    const mc=mapa.getContext('2d'),pixels=mc.createImageData(128,128);
    for(let y=0;y<128;y++)for(let x=0;x<128;x++){
      const nx=(x-63.5)/63.5,ny=(y-63.5)/63.5,r2=nx*nx+ny*ny,f=r2<1?r2*(1-r2)*210:0,k=(y*128+x)*4;
      pixels.data[k]=128+nx*f;pixels.data[k+1]=128+ny*f;pixels.data[k+2]=128;pixels.data[k+3]=255;
    }
    mc.putImageData(pixels,0,0);const textura=mapa.toDataURL();
    const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');
    svg.setAttribute('width','0');svg.setAttribute('height','0');svg.style.position='absolute';
    const prefijo='objetivo-'+id+'-'+Math.round(performance.now());
    svg.innerHTML='<defs>'+['salida','entrada'].map(nombre=>`<filter id="${prefijo}-${nombre}" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB"><feFlood flood-color="#808080" result="neutro"/><feImage href="${textura}" preserveAspectRatio="none" result="mapa"/><feComposite in="mapa" in2="neutro" operator="over" result="desvio"/><feDisplacementMap in="SourceGraphic" in2="desvio" scale="0" xChannelSelector="R" yChannelSelector="G"/></filter>`).join('')+'</defs>';
    const lentes=[...svg.querySelectorAll('filter')].map(f=>({mapa:f.querySelector('feImage'),desvio:f.querySelector('feDisplacementMap')}));
    const filtroSalida=`url(#${prefijo}-salida)`,filtroEntrada=`url(#${prefijo}-entrada)`;
    let frame=0;
    function campo(t){
      ctx.clearRect(0,0,w,h);
      const geometria=geometriaObjetivos(t,ancho,alto),radio=geometria.radio,esc=w/ancho;
      obturador.style.opacity=String(clamp(Math.min(geometria.giro,Math.PI*2/3-geometria.giro)/.12));
      ctx.fillStyle='#030707';ctx.fillRect(0,0,w,h);ctx.globalCompositeOperation='destination-out';
      for(const {x,y}of geometria.centros){
        const g=ctx.createRadialGradient(x*esc,y*esc,radio*.72*esc,x*esc,y*esc,radio*1.12*esc);
        g.addColorStop(0,'#000');g.addColorStop(.25,'rgba(0,0,0,.94)');g.addColorStop(.55,'rgba(0,0,0,.50)');g.addColorStop(.82,'rgba(0,0,0,.08)');g.addColorStop(1,'transparent');
        ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
      }
      ctx.globalCompositeOperation='source-over';
      for(let i=0;i<2;i++){
        const {x,y}=geometria.centros[i],lente=lentes[i],descentrado=Math.min(1,Math.hypot(x-ancho/2,y-alto/2)/radio);
        for(const [nombre,valor]of Object.entries({x:x-radio,y:y-radio,width:radio*2,height:radio*2}))lente.mapa.setAttribute(nombre,String(valor));
        lente.desvio.setAttribute('scale',String(descentrado*100));
      }
    }
    campo(0);
    velo.appendChild(svg);if(anterior)velo.appendChild(anterior.el);velo.appendChild(obturador);pantalla.appendChild(velo);anterior?.iniciar();
    const salida=anterior?.el.animate([{opacity:1,filter:filtroSalida+' blur(0px) brightness(1)',offset:0},{opacity:1,filter:filtroSalida+' blur(5px) brightness(.65)',offset:.37},{opacity:0,offset:.39},{opacity:0,offset:1}],{duration:duracion,fill:'both'});
    // El salto de aumento sucede bajo el objetivo; sólo el pequeño ajuste de foco queda visible.
    const foco=destino.animate([
      {opacity:0,filter:filtroEntrada+' blur(16px) brightness(.7)',offset:0},
      {opacity:0,filter:filtroEntrada+' blur(16px) brightness(.7)',offset:.39},
      {opacity:1,filter:filtroEntrada+' blur(16px) brightness(.7)',offset:.40},
      {opacity:1,filter:filtroEntrada+' blur(4px) brightness(.95)',offset:.78},
      {opacity:1,filter:filtroEntrada+' blur(0px) brightness(1)',offset:1}
    ].map(frame=>({...frame,transformOrigin:'50% '+((1100+DY)/2)+'px'})),{duration:duracion,easing:'ease-out',fill:'both'});
    const limpiar=()=>{cancelAnimationFrame(frame);salida?.cancel();foco.cancel();velo.remove();alTerminar();if(actual===id)pantalla.classList.remove('entrando-universo');};
    limpiarObjetivo=limpiar;
    const inicio=performance.now();
    const pintar=ahora=>{const t=clamp((ahora-inicio)/duracion);if(reiniciarScroll)scroll.scrollTop=0;campo(t);if(t>=.70&&actual===id)pantalla.classList.remove('entrando-universo');if(t<1)frame=requestAnimationFrame(pintar);else{limpiar();limpiarObjetivo=()=>{};}};
    frame=requestAnimationFrame(pintar);
  }
  function movimientoReducido(){return matchMedia('(prefers-reduced-motion: reduce)').matches;}
  function ajustarFinFicha(raiz){
    const galeria=raiz.querySelector('.detalle-galeria');if(!galeria)return;
    let frame=0;
    const medir=()=>{
      frame=0;if(actual!=='ficha'||lienzo.firstElementChild!==raiz)return;
      const fin=Math.ceil(Math.max(DISENOS_DETALLE.ficha.height||4400,galeria.getBoundingClientRect().bottom-raiz.getBoundingClientRect().top+64));
      raiz.style.height=lienzo.style.height=fin+'px';
    };
    const solicitar=()=>{if(!frame)frame=requestAnimationFrame(medir);};
    const observer=new ResizeObserver(solicitar);observer.observe(galeria);
    addEventListener('resize',solicitar);document.fonts?.ready.then(solicitar);solicitar();
    limpiezasVista.add(()=>{cancelAnimationFrame(frame);observer.disconnect();removeEventListener('resize',solicitar);});
  }
  function dibujoProcedural(cv,recipe,maxResolution){
    let obra=null;
    const frame=requestAnimationFrame(()=>{if(cv.isConnected)obra=mountColonias(cv,{recipe,maxResolution});});
    return ()=>{cancelAnimationFrame(frame);obra?.destroy();};
  }
  function cartelEspecie(nombre,numero,grupo,imagen,evento){
    if(carteles.has(nombre))return;
    const datos=CATALOGO_ESPECIES[nombre],el=$('plantillaCartelGlosario').content.firstElementChild.cloneNode(true);
    el.classList.remove('cartel-glosario');el.classList.add('cartel-especie');el.style.width='577px';
    el.querySelector('.nom').textContent=nombre;el.querySelector('.nom').style.textTransform='none';universoCartel(el,grupo);
    el.querySelector('.cod').textContent=nombre.split(/\s+/).slice(0,2).map(s=>s[0]).join('').toUpperCase();
    const recursosEspecie={B:['40b92.svg','38083.png'],L:['de682.svg','8cf50.png'],M:['63451.svg','e15a7.png']}[grupo];
    el.style.setProperty('--cartel-fondo','rgba(255,251,238,.42)');
    el.style.setProperty('--especie-insignia',`url("src/assets/detalles/${recursosEspecie[0]}")`);
    el.style.setProperty('--especie-textura',`url("src/assets/detalles/${recursosEspecie[1]}")`);
    const enFicha=actual==='ficha';
    if(enFicha){
      el.classList.add('cartel-ficha-especie');
      el.querySelector('.cod').textContent=nombre.split(/\s+/).slice(0,2).map(s=>s[0]).join('').toUpperCase();
    }
    const co=el.querySelector('.co'),p=el.querySelector('.definicionGlosario');
    const figura=document.createElement('div');figura.className='detalle-especie-figura';let limpiarGrafico=()=>{};
    if(imagen?.html){figura.innerHTML=imagen.html;}
    else if(imagen){const img=document.createElement('img');img.src=imagen;img.alt='';figura.appendChild(img);}
    else{
      const cv=document.createElement('canvas');figura.appendChild(cv);
      const estilo={...BASE,shape:nombre.startsWith('Lactobacillus')?'capsule':'disk',elongation:65,c1:grupo==='B'?'#ed74a0':grupo==='L'?'#efcc6d':'#92aa68',c2:grupo==='B'?'#f06779':grupo==='L'?'#ffc21c':'#6a983a',c3:'#fffbee',seed:nombre.length*17};
      limpiarGrafico=dibujoProcedural(cv,pieza(estilo),350);
    }
    co.insertBefore(figura,el.querySelector('.reglaCartel'));p.textContent=datos?.definicion||'Contenido en preparación.';
    const relacionadas=muestras.filter(s=>s.vinculosDatos.especies.includes(nombre));
    const lista=document.createElement('div');lista.className='detalle-fichas-especie';
    for(const s of relacionadas){
      const b=document.createElement('button');b.type='button';b.textContent=s.codigo+' · '+s.origen+' ↗';
      b.addEventListener('click',()=>{if(esFichaPreparada(s))abrir('ficha');else{irSeccion('muestras');seleccionar(s);}});lista.appendChild(b);
    }
    if(!relacionadas.length)lista.textContent='No hay muestras vinculadas en el archivo actual.';
    if(enFicha){
      const boton=document.createElement('button');boton.type='button';boton.className='masCartel';boton.setAttribute('aria-expanded','false');boton.textContent='LEER MÁS AL RESPECTO ↗';
      const detalle=document.createElement('section');detalle.className='detalleCartel';detalle.hidden=true;
      for(const [etiqueta,valor]of [['Dónde se encuentra',datos?.donde_esta],['Qué produce o transforma',datos?.que_produce_o_transforma]])if(valor){const h=document.createElement('h3'),p=document.createElement('p');h.textContent=etiqueta;p.textContent=valor;detalle.append(h,p);}
      boton.addEventListener('click',()=>{detalle.hidden=!detalle.hidden;boton.setAttribute('aria-expanded',String(!detalle.hidden));boton.textContent=detalle.hidden?'LEER MÁS AL RESPECTO ↗':'CERRAR INFORMACIÓN ↑';});co.append(boton,detalle);
    }else{
      const boton=document.createElement('button');boton.type='button';boton.className='masCartel';boton.setAttribute('aria-expanded','false');
      boton.textContent='VER MUESTRAS VINCULADAS ↗';lista.hidden=true;
      boton.addEventListener('click',()=>{lista.hidden=!lista.hidden;boton.setAttribute('aria-expanded',String(!lista.hidden));});co.append(boton,lista);
    }
    montarCartelDetalle(el,nombre,evento,limpiarGrafico);
  }
  function montarCartelDetalle(el,clave,evento,limpiarGrafico=()=>{}){
    $('anclaCarteles').appendChild(el);
    const x=Math.min(1131+DX/2+carteles.size%4*24,1880+DX/2-577);
    const y=Number.isFinite(evento?.clientY)?(evento.clientY-pantalla.getBoundingClientRect().top)/escala-DY/2-24:180-DY/2;
    el.style.transform=`translate(${x}px,${clamp(y,150-DY/2,1060+DY/2-(el.offsetHeight||621))}px)`;
    if(grupos[actual])ubicarCartelFlotante(el);
    const agua=activarOleajeCartel(el,carteles.size);
    const cancelar=activarArrastreCartel(el,pos=>el.style.transform=`translate(${pos.x}px,${pos.y}px)`,()=>{agua.detener();limpiarGrafico();carteles.delete(clave);el.remove();});
    carteles.set(clave,{el,agua,cancelar,limpiarGrafico});el.addEventListener('pointerdown',()=>el.style.zIndex=20+Date.now()%100000);
    requestAnimationFrame(()=>el.classList.add('vis'));
  }
  function prepararUniverso(raiz,id){
    const etapa=raiz.querySelector('[data-name="Etapa 5 · Una colonia (18)"]'),placa=etapa?.querySelector('[data-name="placa · agar"]');
    if(placa){
      const img=placa.querySelector('img');img.src='src/assets/detalles/una-colonia-'+id+'.png';img.alt='Una colonia de '+id;
      placa.classList.add('detalle-placa-colonia');placa.style.opacity='1';
      Object.assign(img.style,{inset:'auto',left:'-20%',top:'-20%',width:'140%',height:'140%',objectFit:'contain'});
      etapa.querySelector('[data-name="contorno etapa"]')?.remove();
    }
    // Cada etapa centra sus textos (número, nombre, tiempo) sobre su guía vertical.
    for(const et of raiz.querySelectorAll('[data-name^="Etapa"]')){
      // En Figma la última guía iba anclada al borde derecho y el resto al centro: en ventanas más anchas que 1920 se separaban.
      // Todo el eje de la etapa (guía, marca y textos) se ancla al centro del círculo de la etapa.
      const guia=et.querySelector(':scope > [data-name="guía al tiempo"]'),circulo=et.querySelector(':scope > [data-name^="Colonias"],:scope > [data-name="placa · agar"]');
      if(!guia||!circulo)continue;
      // El círculo puede traer su posición en px (marco de 1920) o ya como calc(50% ± Npx).
      const crudo=circulo.style.left,m=crudo.match(/^calc\(\s*50%\s*([+-])\s*([\d.]+)px\s*\)$/),ancho=parseFloat(circulo.style.width);
      const desde=m?(m[1]==='-'?-1:1)*parseFloat(m[2]):parseFloat(crudo)-960;
      if(!Number.isFinite(desde)||!Number.isFinite(ancho))continue;
      const centro='calc(50% + '+(desde+ancho/2)+'px)';
      guia.style.left=centro;guia.dataset.anclaCentro='1';
      const marca=et.querySelector(':scope > [data-name="marca"]');if(marca){marca.style.left='calc('+centro+' - 3.5px)';marca.dataset.anclaCentro='1';}
      for(const t of et.children){if(t.dataset.name||!t.textContent.trim())continue;t.style.left=centro;t.style.translate='-50% 0';t.style.textAlign='center';t.dataset.anclaCentro='1';}
    }
    // Listados de una sola línea con puntos medios ("Redonda · Ovalada · En cadena"): un ítem por línea, sin puntos.
    for(const p of raiz.querySelectorAll('p')){
      if(!/^[^·\[]+(?:\s·\s[^·]+)+$/.test(p.textContent.trim().replace(/\s+/g,' '))||/\d{2}\s·\s\d{2}/.test(p.textContent))continue;
      const nodos=[];const caminante=document.createTreeWalker(p,4);while(caminante.nextNode())nodos.push(caminante.currentNode);
      for(const n of nodos)n.textContent=n.textContent.replace(/\s*·\s*/g,'\n');
      if(nodos[0])nodos[0].textContent=nodos[0].textContent.replace(/^\s+/,'');
      if(nodos.length)nodos[nodos.length-1].textContent=nodos[nodos.length-1].textContent.replace(/\s+$/,'');
      p.style.whiteSpace='pre-line';
    }
    const ejeTiempo=raiz.querySelector('[data-name="eje · tiempo"]');
    if(ejeTiempo&&/^tiempo$/i.test(ejeTiempo.nextElementSibling?.textContent.trim()||''))ejeTiempo.nextElementSibling.remove();
    const grupo=grupos[id],base=DISENOS_DETALLE[claves[id]];
    const imagen={html:base.especieVisual};
    const listado=raiz.querySelector('[data-name="Listado"]');
    // Las filas desplegadas empujan hacia abajo lo que sigue a la tabla.
    const envoltura=listado?.parentElement,abiertasU=new Set();let ajusteU=null;
    const iniciarAjusteU=()=>{
      if(ajusteU||!listado||!envoltura)return ajusteU;
      const fin=(parseFloat(getComputedStyle(envoltura).top)||0)+envoltura.offsetHeight,mover=[];
      const visitar=padre=>{for(const ch of padre.children){const cs=getComputedStyle(ch);if(cs.display==='contents'){visitar(ch);continue;}if(ch===envoltura||ch.contains(listado))continue;if(cs.position==='absolute'&&parseFloat(cs.top)>=fin-1)mover.push(ch);}};
      visitar(raiz);
      envoltura.classList.add('u-anima');listado.classList.add('u-anima');for(const m of mover)m.classList.add('u-anima-mov');
      ajusteU={altoEnv:envoltura.offsetHeight,altoLis:listado.offsetHeight,altoRaiz:raiz.offsetHeight,mover};return ajusteU;
    };
    const reacomodarU=()=>{
      const a=iniciarAjusteU();if(!a)return;
      let extra=0;for(const d of abiertasU)extra+=d.firstElementChild.scrollHeight;
      envoltura.style.height=(a.altoEnv+extra)+'px';listado.style.height=(a.altoLis+extra)+'px';
      for(const m of a.mover)m.style.translate='0 '+extra+'px';
      raiz.style.height=lienzo.style.height=(a.altoRaiz+extra)+'px';
    };
    for(const fila of listado?.querySelectorAll('[data-name^="Fila ·"]')||[]){
      const textos=[...fila.querySelectorAll('p')];
      const nombre=texto(textos[2]);const n=texto(textos[1]);
      const cuenta=fila.querySelector('[data-name="Fichas"] p');
      const relacionadas=muestras.filter(s=>s.vinculosDatos.especies.includes(nombre));
      if(cuenta)cuenta.textContent=String(relacionadas.length).padStart(2,'0');
      const ilustrada=['Streptococcus thermophilus','Saccharomyces cerevisiae','Penicillium roqueforti'].includes(nombre);
      interactivo(fila,ev=>cartelEspecie(nombre,n,grupo,ilustrada?imagen:null,ev),nombre);
      const celda=fila.querySelector('[data-name="Fichas"]');
      if(celda){
        const desp=document.createElement('div');desp.className='u-desplegable';desp.inert=true;
        desp.innerHTML='<div class="u-interior"><div class="u-muestras"></div></div>';
        const listaU=desp.querySelector('.u-muestras');
        if(!relacionadas.length){const vacio=document.createElement('p');vacio.className='g-vacio';vacio.textContent='Todavía no hay muestras vinculadas a esta especie.';listaU.appendChild(vacio);}
        for(const s of relacionadas){
          const b=document.createElement('button');b.type='button';b.className='g-muestra';
          b.innerHTML='<span>'+esc(s.codigo)+'</span><span>'+esc(s.origen)+' ↗</span>';
          b.addEventListener('click',ev=>{ev.stopPropagation();if(esFichaPreparada(s))abrir('ficha');else{irSeccion('muestras');seleccionar(s);}});listaU.appendChild(b);
        }
        fila.after(desp);
        const indicador=[...celda.querySelectorAll('p')].pop();
        celda.classList.add('u-fichas');celda.tabIndex=0;celda.setAttribute('role','button');celda.setAttribute('aria-expanded','false');celda.setAttribute('aria-label','Muestras de '+nombre);
        const alternar=ev=>{
          ev.stopPropagation();const abre=!desp.classList.contains('abierta');
          desp.classList.toggle('abierta',abre);desp.inert=!abre;celda.setAttribute('aria-expanded',String(abre));
          if(indicador)indicador.textContent=abre?'↑':'+';
          if(abre)abiertasU.add(desp);else abiertasU.delete(desp);reacomodarU();
        };
        celda.addEventListener('click',alternar);
        celda.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();alternar(ev);}});
      }
    }
    for(const tarjeta of raiz.querySelectorAll('[data-name^="Colonia ·"]')){
      const nombre=texto(tarjeta).toLowerCase();
      const destino=/bacteria/.test(nombre)?'bacterias':/levadura/.test(nombre)?'levaduras':/moho/.test(nombre)?'mohos':null;
      if(!destino)continue;
      tarjeta.innerHTML=contenidoUniverso(destino);tarjeta.classList.add('universo-enlace','universo-'+destino);
      tarjeta.style.height='700px';
      interactivo(tarjeta,()=>abrir(destino,tarjeta),'Explorar '+destino);
    }
    for(const filete of listado?.querySelectorAll('[data-name="filete"]')||[]){
      if(filete.style.height==='1px')filete.style.width='calc(100% - 300px)';
    }
    for(const p of raiz.querySelectorAll('p'))if(/ver.*(simul|crecim)/i.test(texto(p)))interactivo(p,()=>irSeccion('tuplaca'),'Explorar en Tu placa');
    prepararCarrusel(raiz,id);
  }
  function prepararCarrusel(raiz,universo){
    const filas=[...raiz.querySelectorAll('[data-name^="lugar ·"]')];
    const marco=raiz.querySelector('[data-name^="Ilustración"]');if(!filas.length||!marco)return;
    const contador=raiz.querySelector('[data-name="Carrusel · contador"] p');
    const panel=raiz.querySelector('[data-name^="Columna derecha"]');
    const bloques=panel?[...panel.children].filter(el=>el.tagName==='DIV').slice(0,2):[];
    const enlace=[...raiz.querySelectorAll('p')].find(p=>/^VER MUESTRAS DE /i.test(texto(p)));
    const entornos=ENTORNOS_DETALLE[universo];
    marco.classList.add('detalle-entorno-ilustracion');
    const campo=raiz.querySelector('[data-name="campo claro"]');
    if(campo){campo.replaceChildren();campo.style.backgroundColor='#efe6dc';campo.classList.add('detalle-entorno-campo');}
    let indice=0,limpiarLugar=()=>{};
    limpiezasVista.add(()=>limpiarLugar());
    interactivo(enlace,()=>{
      // Las muestras de cada entorno salen de la tabla base/entornos_muestras.csv (por código); ya no se busca texto dentro del origen.
      const lugar=entornos[indice].nombre;
      const codigos=new Set((ENTORNOS_MUESTRAS[universo]||{})[lugar]||[]);
      const relacionadas=muestras.filter(s=>s.grupo.includes(grupos[universo])&&codigos.has(s.codigo));
      irSeccion('muestras');filtroG=grupos[universo];filtroE=null;busqueda='';
      filtroCodigos=relacionadas.length?new Set(relacionadas.map(s=>s.codigo)):null;
      $('q').value=relacionadas.length?lugar:'';aplicarFiltros();cambiarListado(true);
      if(relacionadas.length)seleccionar(relacionadas[0]);
    },'Ver muestras de este entorno');
    function cambiar(i){
      indice=(i+filas.length)%filas.length;
      limpiarLugar();limpiarLugar=()=>{};
      const entorno=entornos[indice],nombre=entorno.nombre;
      if(enlace)enlace.textContent='VER MUESTRAS DE '+nombre.toUpperCase()+' →';
      for(const [n,fila]of filas.entries()){fila.style.opacity=n===indice?'1':'.45';fila.setAttribute('aria-pressed',String(n===indice));}
      if(contador)contador.textContent=String(indice+1).padStart(2,'0')+' / '+String(filas.length).padStart(2,'0');
      marco.replaceChildren();
      const img=document.createElement('img');img.src=entorno.imagen;img.alt=nombre;
      const encuadre=entorno.encuadre||{escala:1,x:0,y:0};
      Object.assign(img.style,{position:'absolute',inset:'0',display:'block',width:'100%',height:'100%',objectFit:'contain',objectPosition:'center',transformOrigin:'50% 50%',transform:`translate(${encuadre.x*100}%,${encuadre.y*100}%) scale(${encuadre.escala})`});marco.appendChild(img);
      for(const [i,bloque]of bloques.entries()){
        const textos=bloque.querySelectorAll('p');
        if(textos[0])textos[0].textContent=entorno['titulo'+(i+1)];
        if(textos[1])textos[1].textContent=entorno['parrafo'+(i+1)];
        bloque.style.visibility='visible';
      }
      if(!movimientoReducido())marco.animate([{opacity:0},{opacity:1}],{duration:350,easing:'ease-out'});
    }
    filas.forEach((fila,i)=>interactivo(fila,()=>cambiar(i),'Explorar '+texto(fila.querySelectorAll('p')[1])));
    for(const [nombre,delta]of [['anterior',-1],['siguiente',1]]){
      const flecha=raiz.querySelector(`[data-name="${nombre}"]`);if(!flecha)continue;
      const dibujo=document.createElement('div');
      Object.assign(dibujo.style,{position:'absolute',left:'12px',top:'22px',width:flecha.style.width,height:flecha.style.height});
      dibujo.append(...flecha.childNodes);flecha.appendChild(dibujo);
      Object.assign(flecha.style,{width:'48px',height:'44px',translate:'-12px -22px'});
      interactivo(flecha,()=>cambiar(indice+delta),'Lugar '+nombre);
    }
    cambiar(0);
  }
  function semillaNombre(s){return [...s].reduce((a,c)=>a+c.charCodeAt(0),1);}
  function prepararFicha(raiz){
    const muestra=muestraFicha;if(!muestra)return;
    if(!esFichaPreparada(muestra)){
      const cv=raiz.querySelector('.ficha-archivo-dibujo');cv.width=cv.height=800;cv.getContext('2d').drawImage(muestra.el.querySelector('canvas'),0,0,800,800);
      for(const b of raiz.querySelectorAll('[data-especie]'))interactivo(b,ev=>cartelEspecie(b.dataset.especie,'',muestra.grupo.includes('B')?'B':muestra.grupo,null,ev),b.dataset.especie);
      return;
    }
    const precargaMicro=document.createElement('img');precargaMicro.decoding='async';precargaMicro.src='src/assets/detalles/lupa-micro.png';
    raiz.classList.add('detalle-ficha-nueva');
    const nodo=id=>raiz.querySelector('[data-node-id="'+id+'"]');
    const cambiar=(id,t)=>{const e=nodo(id);if(e)e.textContent=t;};
    cambiar('500:7170',muestra.codigo);cambiar('500:7179',muestra.colonias+' aprox.');cambiar('500:7182',String(muestra.vinculosDatos.especies.length));
    cambiar('500:7160','Tocá una colonia para ver sus células. Mantené el dedo para usar el microscopio.');
    cambiar('500:7191',fechaTexto(muestra));cambiar('500:7173',GRUPO_NOMBRE[muestra.grupo]);cambiar('500:7176',ESTADO_NOMBRE[muestra.estado]);
    nodo('500:7158').style.mixBlendMode='normal';nodo('500:7158').style.color='#0d0f17';nodo('500:7158').parentElement.style.mixBlendMode='normal';
    const aviso=nodo('500:7158').parentElement;aviso.classList.add('ficha-aviso-desliza');
    const flecha=aviso.querySelector('img');if(flecha){flecha.style.filter='brightness(0)';let p=flecha.parentElement;while(p&&p!==aviso){p.style.mixBlendMode='normal';p=p.parentElement;}}
    const miniatura=nodo('500:7166');miniatura.replaceChildren();const cv=document.createElement('canvas');cv.width=cv.height=116;cv.style.width=cv.style.height='100%';cv.getContext('2d').drawImage(muestra.el.querySelector('canvas'),0,0,116,116);miniatura.appendChild(cv);
    const compuesto=ev=>cartelComposicion(muestra,ev);
    const tocaCirculo=(img,ev,tipo)=>{
      if(!Number.isFinite(ev?.clientX)||ev.type==='keydown')return true;
      const mapa=CELULAS_FICHA[tipo],r=img.getBoundingClientRect();
      const x=Math.floor((ev.clientX-r.left)/r.width*mapa.width),y=Math.floor((ev.clientY-r.top)/r.height*mapa.height);
      const fila=mapa.rows[y]||[];for(let i=0;i<fila.length;i+=2)if(x>=fila[i]-1&&x<=fila[i+1]+1)return true;return false;
    };
    const placa=nodo('500:7152');placa.classList.add('ficha-placa');
    prepararLupa(raiz,ev=>{if(tocaCirculo(nodo('500:7153').querySelector('img'),ev,'placa'))compuesto(ev);});
    const colonias=nodo('500:7198');colonias.classList.add('ficha-colonias');
    interactivo(colonias,ev=>{if(tocaCirculo(colonias.querySelector('img'),ev,'especies'))compuesto(ev);},'Ver las dos especies de las colonias');
    for(const nombre of muestra.vinculosDatos.especies){
      const p=[...raiz.querySelectorAll('p')].find(p=>texto(p)===nombre);
      interactivo(p,ev=>cartelEspecie(nombre,'','B',nombre==='Streptococcus thermophilus'?'src/assets/detalles/bfb61.png':null,ev),nombre);
    }
    const mascara=nodo('500:7046');mascara.style.maskImage=mascara.style.webkitMaskImage='var(--mascara-ficha-transformacion)';
    // Los paquetes conservan sus coordenadas del frame y flotan por separado.
    for(const [i,id]of ['500:7168','500:7171','500:7174','500:7177','500:7180','500:7183','500:7186','500:7189','500:7192'].entries()){
      const el=nodo(id);el.classList.add('ficha-paquete-flotante');el.style.setProperty('--flotar-duracion',(8+i*.57)+'s');el.style.setProperty('--flotar-demora',(-i*1.37)+'s');
    }
    prepararPieFicha(nodo('500:7243'));
    const galeria=raiz.querySelector('[data-name="Galería · muestras que comparten especies"]');
    if(galeria){
      galeria.classList.add('detalle-galeria');galeria.style.width='100%';
      nodo('500:7089').style.width='calc(100% - 466px)';nodo('500:7090').style.width='100%';
      Object.assign(galeria.style,{display:'block',width:'100%',height:'664px',flexShrink:'0'});
      const relacionadas=muestras.filter(o=>o!==muestra&&o.vinculosDatos.especies.some(e=>muestra.vinculosDatos.especies.includes(e)));
      limpiezasVista.add(prepararGaleriaFicha(galeria,relacionadas,muestra,otra=>abrir('ficha',otra)));
    }
  }
  function htmlFichaArchivo(s){
    // Ficha de lectura: exclusivamente los datos disponibles en el archivo.
    const dato=(nombre,valor)=>`<div><dt>${nombre}</dt><dd>${esc(String(valor))}</dd></div>`;
    return `<div class="detalle-ficha-archivo" data-node-id="ficha-archivo" style="position:relative;width:100%;height:1900px;background:#f2f0e8;color:#0d0f17">
      <div class="ficha-archivo-indicacion"><p>[02.1] FICHA DE MUESTRA</p><button type="button"><p>VOLVER</p></button></div>
      <canvas class="ficha-archivo-dibujo" role="img" aria-label="${esc(s.origen)}"></canvas>
      <h1>${esc(s.origen)}</h1><dl class="ficha-archivo-datos">${dato('CÓDIGO',s.codigo)+dato('GRUPO',GRUPO_NOMBRE[s.grupo])+dato('ESTADO',ESTADO_NOMBRE[s.estado])+dato('RECOLECCIÓN',fechaTexto(s))+dato('COLONIAS',s.colonias)}</dl>
      <section class="ficha-archivo-especies"><h2>ESPECIES EN LA MUESTRA</h2>${s.vinculosDatos.especies.map(nombre=>`<button type="button" data-especie="${esc(nombre)}">${esc(nombre)}</button>`).join('')}</section></div>`;
  }
  function prepararPieFicha(contenedor){
    contenedor.classList.add('ficha-pie-vivo');contenedor.setAttribute('aria-hidden','true');
    const modelos=RECETA_PIE_FICHA.items.filter(p=>p.type==='shape'&&p.style),limpiezas=[];
    // Una nueva distribución por visita: las colonias mayores descansan abajo.
    for(let i=0;i<35;i++){
      const profundidad=Math.random(),tam=20+Math.pow(profundidad,2)*550;
      const modelo=modelos[Math.floor(Math.random()*modelos.length)],el=document.createElement('div'),cv=document.createElement('canvas');
      el.className='ficha-pie-colonia';Object.assign(el.style,{left:(Math.random()*106-3)+'%',top:(70+profundidad*670)+'px',width:tam+'px',height:tam+'px',filter:`blur(${1+profundidad*11}px)`});
      el.style.setProperty('--flotar-duracion',(6+Math.random()*7)+'s');el.style.setProperty('--flotar-demora',(-Math.random()*15)+'s');
      cv.style.width=cv.style.height='100%';el.appendChild(cv);contenedor.appendChild(el);
      limpiezas.push(dibujoProcedural(cv,pieza({...modelo.style,transparent:true},.8),Math.min(320,Math.max(48,Math.round(tam)))));
    }
    limpiezasVista.add(()=>limpiezas.forEach(l=>l()));
  }
  function cartelComposicion(muestra,evento){
    const clave='composicion-'+muestra.codigo;if(carteles.has(clave))return;
    const el=$('plantillaCartelGlosario').content.firstElementChild.cloneNode(true),limpiezas=[];
    el.classList.remove('cartel-glosario');el.classList.add('cartel-especie','cartel-composicion');el.style.width='577px';universoCartel(el,muestra.grupo);
    el.querySelector('.nom').textContent='Células de esta colonia';el.querySelector('.cod').textContent=muestra.grupo;
    const co=el.querySelector('.co');el.querySelector('.reglaCartel').remove();
    el.querySelector('.definicionGlosario').textContent='Las dos especies registradas en '+muestra.origen.toLowerCase()+':';
    for(const nombre of muestra.vinculosDatos.especies){
      const seccion=document.createElement('section');seccion.className='ficha-celula';
      const figura=document.createElement('div');figura.className='ficha-celula-figura';
      if(nombre==='Streptococcus thermophilus'){const img=document.createElement('img');img.src='src/assets/detalles/bfb61.png';img.alt='';figura.appendChild(img);}
      else{const cv=document.createElement('canvas');figura.appendChild(cv);limpiezas.push(dibujoProcedural(cv,pieza({...BASE,size:100,halo:8,blur:4,core:85,irregularity:0,shape:'capsule',elongation:80,c1:'#ed74a0',c2:'#f06779',c3:'#fffbee',seed:nombre.length*17}),160));}
      const textos=document.createElement('div'),h=document.createElement('h3'),p=document.createElement('p');h.textContent=nombre;p.textContent=CATALOGO_ESPECIES[nombre]?.definicion||'';textos.append(h,p);seccion.append(figura,textos);co.appendChild(seccion);
    }
    montarCartelDetalle(el,clave,evento,()=>limpiezas.forEach(f=>f()));
  }
  function prepararLupa(raiz,alTocar){
    const placa=raiz.querySelector('.ficha-placa');if(!placa)return;
    const lupa=document.createElement('div');lupa.className='detalle-lupa';lupa.hidden=true;placa.appendChild(lupa);
    placa.tabIndex=0;placa.setAttribute('role','button');placa.setAttribute('aria-label','Mantener presionado y arrastrar para explorar la vista microscópica');placa.setAttribute('aria-expanded','false');
    let espera=0,presionando=false,desmontar=null,inicioToque=null,arrastrando=false;
    let posicion={x:placa.offsetWidth/2,y:placa.offsetHeight/2,ancho:placa.offsetWidth,alto:placa.offsetHeight};
    const actualizar=()=>{lupa.style.left=(posicion.x-214.5)+'px';lupa.style.top=(posicion.y-214.5)+'px';desmontar?.actualizar?.(posicion);};
    const mostrar=()=>{if(!presionando)return;lupa.hidden=false;placa.setAttribute('aria-expanded','true');if(!desmontar&&window.MicromundosLupa)desmontar=window.MicromundosLupa.montarLupaFigma(lupa);actualizar();};
    const ocultar=()=>{clearTimeout(espera);presionando=false;lupa.hidden=true;placa.setAttribute('aria-expanded','false');};
    const mover=e=>{if(!presionando)return;const r=placa.getBoundingClientRect();posicion={x:(e.clientX-r.left)/escala,y:(e.clientY-r.top)/escala,ancho:placa.offsetWidth,alto:placa.offsetHeight};
      if(inicioToque&&Math.hypot(e.clientX-inicioToque.x,e.clientY-inicioToque.y)>10){arrastrando=true;clearTimeout(espera);mostrar();}actualizar();};
    placa.addEventListener('pointerdown',e=>{if(e.button>0)return;presionando=true;arrastrando=false;inicioToque={x:e.clientX,y:e.clientY,t:performance.now()};placa.setPointerCapture(e.pointerId);mover(e);espera=setTimeout(mostrar,350);});
    placa.addEventListener('pointermove',mover);
    placa.addEventListener('contextmenu',e=>e.preventDefault());
    placa.addEventListener('pointerup',e=>{if(presionando&&!arrastrando&&inicioToque&&performance.now()-inicioToque.t<350&&Math.hypot(e.clientX-inicioToque.x,e.clientY-inicioToque.y)<10)alTocar?.(e);ocultar();});
    for(const tipo of ['pointercancel','lostpointercapture'])placa.addEventListener(tipo,ocultar);
    placa.addEventListener('keydown',e=>{if(!e.repeat&&(e.key==='Enter'||e.key===' ')){e.preventDefault();presionando=true;posicion={x:placa.offsetWidth/2,y:placa.offsetHeight/2,ancho:placa.offsetWidth,alto:placa.offsetHeight};actualizar();espera=setTimeout(mostrar,350);}
      if(presionando&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();posicion={...posicion,x:clamp(posicion.x+(e.key==='ArrowLeft'?-24:e.key==='ArrowRight'?24:0),0,posicion.ancho),y:clamp(posicion.y+(e.key==='ArrowUp'?-24:e.key==='ArrowDown'?24:0),0,posicion.alto)};mostrar();}
    });
    placa.addEventListener('keyup',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();ocultar();}});
    placa.addEventListener('blur',ocultar);
    limpiarLupa=()=>{ocultar();desmontar?.();};
  }
  function actualizarParalajeDetalle(){
    const aviso=lienzo.querySelector('.ficha-aviso-desliza');if(aviso){aviso.style.opacity=String(1-clamp(scroll.scrollTop/90));aviso.style.visibility=scroll.scrollTop>=90?'hidden':'visible';}
    const y=movimientoReducido()?0:scroll.scrollTop;
    for(const capa of lienzo.querySelectorAll('[data-velocidad]')){
      // El scroll ya desplaza el lienzo a velocidad 1; esta compensación conserva la velocidad absoluta de cada plano.
      capa.style.transform='translate3d(0,'+(y*(1-Number(capa.dataset.velocidad))).toFixed(2)+'px,0)';
    }
  }
  let frameScroll=0,ultimaY=0;
  scroll.addEventListener('scroll',()=>{if(frameScroll)return;frameScroll=requestAnimationFrame(()=>{
    frameScroll=0;const delta=scroll.scrollTop-ultimaY;ultimaY=scroll.scrollTop;actualizarParalajeDetalle();
    for(const {agua}of carteles.values())agua.impulsar(delta);
    impulsarReferencias(delta);
  });},{passive:true});
  return {abrirUniverso:abrir,abrirFicha:()=>abrir('ficha'),cerrar,salir};
}
function esFichaPreparada(s){return s.capa==='A'&&Number(s.it.id)===912;}
