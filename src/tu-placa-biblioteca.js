// Cartelito de ayuda de TU PLACA (19/11/2026): material de los carteles en versión neutra, con un punto que señala a qué se refiere.
// Se va solo, o al tocar en cualquier lado. Uno por vez.
function ayudaTuPlaca(partes,{x,y,ancho=360,donde='abajo',flecha=24,duracion=6000}={}){
  const tp=document.getElementById('tuPlaca');if(!tp)return null;
  ayudaTuPlaca.cerrar?.();
  const el=document.createElement('div');el.className='cartel cartel-neutro tp-ayuda';el.dataset.donde=donde;el.setAttribute('role','status');
  el.style.cssText=`left:${x}px;top:${y}px;max-width:${ancho}px;--flecha-x:${flecha}px`;
  el.innerHTML='<div class="vidrio"></div><div class="flota"><div class="grano"></div><div class="fi"><div class="co"></div></div></div>';
  const co=el.querySelector('.co');for(const [clase,texto] of partes){const p=document.createElement('p');if(clase)p.className=clase;p.textContent=texto;co.appendChild(p);}
  tp.appendChild(el);requestAnimationFrame(()=>el.classList.add('visible'));
  let reloj=0;const cerrar=()=>{clearTimeout(reloj);removeEventListener('pointerdown',alTocar,true);el.classList.remove('visible');setTimeout(()=>el.remove(),300);if(ayudaTuPlaca.cerrar===cerrar)ayudaTuPlaca.cerrar=null;};
  const alTocar=ev=>{if(!el.contains(ev.target))cerrar();};
  setTimeout(()=>addEventListener('pointerdown',alTocar,true),0);reloj=setTimeout(cerrar,duracion);
  ayudaTuPlaca.cerrar=cerrar;return el;
}
function montarBibliotecaTuPlaca(host, { alPresionar = () => {}, alElegir = () => {}, alModo = () => {} } = {}) {
  const grupos = [
    { id:'B', nombre:'BACTERIAS', colores:['#ff4c52','#f58bc3','#fffbee'], seed:31 },
    { id:'L', nombre:'LEVADURAS', colores:['#ff9c20','#ffc21c','#fffbee'], seed:12 },
    { id:'M', nombre:'MOHOS', colores:['#27633f','#6a983a','#dce642'], seed:57 },
    // 18/11/2026: MEZCLAS, «Con halo» y «Par» ya no se ofrecen en la biblioteca. Siguen definidas (oculta:true)
    // para que las colonias de esos tipos que ya están en una placa guardada no se pierdan al cargarla.
    { id:'BL', nombre:'MEZCLAS', colores:['#f58bc3','#ffc21c','#fffbee'], seed:83, oculta:true },
  ];
  const estados = [
    { id:'A', nombre:'Activa', style:{ shape:'disk', irregularity:2, asym:0 } },
    { id:'C', nombre:'En conservación', style:{ shape:'disk', irregularity:62, asym:.8 } },
    { id:'MO', nombre:'Montada', style:{ shape:'disk', studyLobes:16, studyDepth:28, studyUneven:60 } },
    { id:'R', nombre:'Registro digital', style:{ shape:'ring', ringWidth:24, irregularity:7 } },
    { id:'V', nombre:'Veladura', tamano:220, composicion:true, style:{shape:'disk',size:78,halo:12,core:0,blur:55,porosity:20,opacity:30} },
    { id:'F', nombre:'Filamentosa', tamano:140, composicion:true, style:{shape:'disk',size:78,filaments:70,irregularity:22,grain:36,porosity:48,halo:2,core:78,blur:14} },
    { id:'H', nombre:'Con halo', tamano:110, composicion:true, style:{shape:'disk',size:78,halo:12,core:65,blur:20,porosity:12}, oculta:true },
    { id:'G', nombre:'Granulada', tamano:100, composicion:true, style:{shape:'disk',size:78,grain:40,porosity:60,irregularity:22,core:78,blur:12} },
    { id:'AF', nombre:'Anillo fino', tamano:120, composicion:true, style:{shape:'ring',size:78,gradient:'linear',ringWidth:5,core:0,halo:2,blur:10,opacity:48,porosity:12} },
    { id:'P', nombre:'Par', tamano:34, composicion:true, style:{shape:'pair',size:68,gradient:'linear',separation:48,halo:2,blur:12,core:78,porosity:12}, oculta:true },
    { id:'MI', nombre:'Microcolonia', tamano:12, composicion:true, style:{shape:'disk',size:68,halo:2,blur:12,core:78,grain:32,porosity:12} },

  ];
  // Paletas originales de COLONIAS: los colores se redistribuyen dentro de la pieza.
  // Cada columna modifica el gradiente y el reparto centro/periferia, sin filtros.
  const paletas={B:['#ff4c52','#f58bc3','#ff4c52'],L:['#ff9c20','#ffc21c','#dce642'],M:['#27633f','#6a983a','#dce642'],BL:['#f58bc3','#ff4c52','#ffc21c']};
  const perfiles=[
    {nombre:'Núcleo',orden:[0,1,2],gradient:'radial',midpoint:55,offset:0,angle:0},
    {nombre:'Borde',orden:[2,1,0],gradient:'radial',midpoint:32,offset:0,angle:0},
    {nombre:'Lateral',orden:[0,1,2],gradient:'linear',midpoint:55,offset:0,angle:-35},
    {nombre:'Descentrada',orden:[1,2,0],gradient:'radial',midpoint:72,offset:38,angle:0}
  ];
  // En bacterias la paleta coral/rosa/coral es simétrica: invertirla no genera
  // otra distribución. El segundo perfil lleva rosa al núcleo y coral al borde.
  const variantes=perfiles.map((perfil,i)=>({id:String(i+1).padStart(2,'0'),nombre:perfil.nombre,tamano:84,style:{},columna:i}));
  const estilos = [];
  for (const g of grupos) for (const estado of estados) for (const variante of variantes) {
    const perfil=perfiles[variante.columna],colores=paletas[g.id],orden=g.id==='B'&&variante.columna===1?[1,0,1]:perfil.orden;
    const style = { ...BASE, size:100, c1:colores[orden[0]], c2:colores[orden[1]], c3:colores[orden[2]], seed:g.seed,
      opacity:100, blur:12, core:78, grain:30, irregularity:2, filaments:0, studyLobes:0, asym:0,
      ...estado.style, ...variante.style,gradient:perfil.gradient,midpoint:perfil.midpoint,offset:perfil.offset,angle:perfil.angle };
    estilos.push({ id:`${g.id}-${estado.id}-${variante.id}`, g:g.id, estado:estado.id, variante:variante.id,
      codigo:`${estado.id==='MO'?'M':estado.id}-${variante.id}`, tamano:estado.tamano||variante.tamano, composicion:!!estado.composicion, style });
  }

  host.replaceChildren();
  host.classList.add('tp-biblioteca');
  const top = document.createElement('div'); top.className='tp-biblioteca__top';
  const heading = document.createElement('h2'); heading.textContent='BIBLIOTECA DE COLONIAS';
  // 19/11/2026 · Qué va fijo y qué como cartelito de ayuda:
  //  fijo: el título y las pestañas por grupo; debajo, solo las colonias (sin rótulos ni nombres de fila: Paco, 19/11);
  //  cartelito: «arrastrá sobre la placa para elegir varias» (tu-placa-v12.js).
  //  «Arrastrá una colonia al interior de la placa» se quita: lo dice la placa vacía.
  top.append(heading);
  const modes = document.createElement('div'); modes.className='tp-biblioteca__modes';
  const tabs=document.createElement('div');tabs.className='tp-biblioteca__tabs';tabs.setAttribute('role','tablist');
  const content=document.createElement('div');content.className='tp-biblioteca__content';
  const labels=document.createElement('div');labels.className='tp-biblioteca__labels';
  const viewport=document.createElement('div');viewport.id='tpPaleta';viewport.className='tp-biblioteca__viewport';viewport.tabIndex=0;viewport.setAttribute('aria-label','Variantes de colonias');
  const track=document.createElement('div');track.className='tp-biblioteca__track';viewport.appendChild(track);
  content.append(labels,viewport);
  host.append(top,modes,tabs,content);

  const gruposVisibles=grupos.filter(g=>!g.oculta),estadosVisibles=estados.filter(e=>!e.oculta);
  let grupoActual='B', elegido=estilos[0], montajes=[], destruido=false;
  const limpiarMontajes=()=>{for(const m of montajes)m?.destroy?.();montajes=[]};
  function drawGroup(){
    limpiarMontajes();tabs.replaceChildren();labels.replaceChildren();track.replaceChildren();
    for(const g of gruposVisibles){
    const tab=document.createElement('button');tab.type='button';tab.role='tab';tab.className='tp-biblioteca__tab';tab.textContent=g.nombre;
      tab.setAttribute('aria-selected',g.id===grupoActual?'true':'false');tab.tabIndex=g.id===grupoActual?0:-1;
      tab.addEventListener('click',()=>{grupoActual=g.id;drawGroup()});
      tab.addEventListener('keydown',ev=>{
        const current=gruposVisibles.findIndex(x=>x.id===g.id);let next=null;
        if(ev.key==='ArrowRight')next=(current+1)%gruposVisibles.length;
        else if(ev.key==='ArrowLeft')next=(current+gruposVisibles.length-1)%gruposVisibles.length;
        else if(ev.key==='Home')next=0;
        else if(ev.key==='End')next=gruposVisibles.length-1;
        if(next!==null){ev.preventDefault();grupoActual=gruposVisibles[next].id;drawGroup();tabs.querySelectorAll('[role="tab"]')[next]?.focus();}
      });tabs.appendChild(tab);
    }
    const scrolled=()=>{labels.style.transform=`translateY(${-viewport.scrollTop}px)`;host.style.setProperty('--tp-last-fade',String(Math.min(1,viewport.scrollTop/40)));};
    viewport.onscroll=scrolled;scrolled();
    for(const estado of estadosVisibles){
      for(const variante of variantes){
        const estilo=estilos.find(s=>s.g===grupoActual&&s.estado===estado.id&&s.variante===variante.id);
        const button=document.createElement('button');button.type='button';button.className='tp-paleta-colonia';button.dataset.styleId=estilo.id;button.dataset.codigo=estilo.codigo;
        button.setAttribute('aria-label',`${estilo.g} · ${estado.nombre} · ${variante.nombre} · ${estilo.codigo}`);
        const canvas=document.createElement('canvas');canvas.width=canvas.height=100;canvas.setAttribute('aria-hidden','true');button.appendChild(canvas);
        // Ya no queda una forma «elegida» a la vista: se siembra arrastrando. «elegido» solo sirve para Enter con teclado.
        const seleccionar=(teclado,notificar=true)=>{elegido=estilo;if(notificar)alElegir(estilo,teclado)};
        button.addEventListener('pointerdown',ev=>{seleccionar(false,false);alPresionar(ev,estilo)});
        button.addEventListener('click',()=>seleccionar(false));
        button.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();seleccionar(true)}});
        track.appendChild(button);
        const diametroPreview=estado.id==='MI'?22:estado.id==='P'?46:84;
        // Misma colonia que se siembra: el motor del muestrario (tu-placa-motor.js), con la colonia al 84 % del lienzo.
        MotorMuestrario.pintar(canvas,MotorMuestrario.estiloColonia({...estilo.style,size:100},{},{B:'rosa',L:'amarillo',M:'verde'}[estilo.g]||'rosa'),126,12);
        canvas.style.width=canvas.style.height=(diametroPreview/.84)+'px';
      }
    }
  }
  drawGroup();
  return { estilos, seleccionado:()=>elegido, modo:()=>'una', destroy(){if(destruido)return;destruido=true;limpiarMontajes();host.replaceChildren();host.classList.remove('tp-biblioteca')} };
}
