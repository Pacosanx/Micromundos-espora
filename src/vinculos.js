// Vista circular. Las relaciones se calculan desde las tablas; no se inventan enlaces.
let redVinculos;
// Un solo progreso controla posición, escala, opacidad y extremos de las líneas.
let mezclaVista = 0, mezclaMuestrario = 0, animVista = 0;
let menuVistas;
// Carrusel del prototipo Figma 202:641 → 202:668: 300 ms, ease-out y copia del saliente.
function prepararMenuVistas(){
  menuVistas={orden:['placa','vinculos','muestrario'],activa:null,animaciones:[],copias:[],espera:0,
    botones:{placa:$('titulo'),vinculos:$('vVinculos'),muestrario:$('vMuestrario')},
    medidor:document.createElement('canvas').getContext('2d')};
  for(const [v,boton] of Object.entries(menuVistas.botones)){
    boton.setAttribute('role','button');boton.setAttribute('data-ui','');boton.tabIndex=0;
    const activar=()=>cambiarVista(v);
    boton.addEventListener('click',ev=>{ev.stopPropagation();activar();});
    boton.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();ev.stopPropagation();activar();}});
  }
  animarMenuVistas('placa',false);
}
function animarMenuVistas(activa,animar=true){
  clearTimeout(menuVistas.espera);
  if(activa===menuVistas.activa && animar) return;
  const anteriores={};
  for(const [v,el] of Object.entries(menuVistas.botones)){
    const css=getComputedStyle(el);
    anteriores[v]={left:css.left,top:css.top,fontSize:css.fontSize,lineHeight:css.lineHeight,filter:css.filter,opacity:css.opacity};
  }
  for(const a of menuVistas.animaciones)a.cancel();
  for(const c of menuVistas.copias)c.remove();
  menuVistas.animaciones=[];menuVistas.copias=[];
  const salto=menuVistas.orden.indexOf(activa), envuelven=new Set(menuVistas.orden.slice(0,salto));
  menuVistas.orden=[...menuVistas.orden.slice(salto),...menuVistas.orden.slice(0,salto)];
  menuVistas.activa=activa;
  const mover=animar&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let x=40;
  for(const [i,v] of menuVistas.orden.entries()){
    const el=menuVistas.botones[v],tam=i===0?72:24;
    const destino={left:x+'px',top:(i===0?33:73)+'px',fontSize:tam+'px',lineHeight:tam+'px',filter:`blur(${i===0?3:2.5}px)`,opacity:i===0?'1':'.68'};
    Object.assign(el.style,destino);
    el.setAttribute('aria-pressed',String(v===activa));
    if(mover){
      let inicio=anteriores[v];
      if(envuelven.has(v)){
        const copia=document.createElement('div');copia.className='abs copiaVista';copia.textContent=el.textContent;
        copia.setAttribute('aria-hidden','true');Object.assign(copia.style,inicio);
        $('navegacionVistas').appendChild(copia);menuVistas.copias.push(copia);
        const salida=copia.animate([inicio,{...inicio,left:(parseFloat(inicio.left)-1000)+'px',opacity:0,filter:'blur(5px)'}],{duration:300,easing:'ease-out'});
        salida.finished.then(()=>copia.remove(),()=>copia.remove());menuVistas.animaciones.push(salida);
        inicio={...destino,left:(x+1000)+'px',opacity:0,filter:'blur(5px)'};
      }
      menuVistas.animaciones.push(el.animate([inicio,destino],{duration:300,easing:'ease-out'}));
    }
    menuVistas.medidor.font=`400 ${tam}px Arimo, Arial, sans-serif`;
    x+=menuVistas.medidor.measureText(el.textContent).width+60;
  }
}
// Paleta de las colonias: bacteria rosa, levadura amarilla, moho verde.
const COLORES_VINCULOS = {B:'#f58bc3', L:'#ffc21c', M:'#6a983a'};
function pintarVinculo(el, grupos, id){
  const colores=grupos.map(g=>COLORES_VINCULOS[g]);
  if(colores.length===1){el.style.stroke=colores[0];return null;}
  const gradiente=document.createElementNS('http://www.w3.org/2000/svg','linearGradient');
  gradiente.setAttribute('id',id);
  gradiente.setAttribute('gradientUnits','userSpaceOnUse');
  colores.forEach((color,i)=>{
    const stop=document.createElementNS('http://www.w3.org/2000/svg','stop');
    stop.setAttribute('offset',`${i/(colores.length-1)*100}%`);
    stop.setAttribute('stop-color',color);gradiente.appendChild(stop);
  });
  $('defVinculos').appendChild(gradiente);
  el.style.stroke=`url(#${id})`;
  return gradiente;
}
function prepararVinculos(){
  const orden = [...muestras].sort((a,b) => a.grupo.localeCompare(b.grupo) || a.fecha-b.fecha);
  const radio = RADIO_VINCULOS, margen = 5;
  // La zona de toque y el recorte del filtro crecen con la visualización.
  const alcance=radio+60, lado=alcance*2;
  const limites={x:C.x-alcance,y:C.y-alcance,width:lado,height:lado};
  Object.assign($('toque').style,{left:limites.x+'px',top:limites.y+'px',width:lado+'px',height:lado+'px'});
  const factor = Math.min(1, (2*Math.PI*radio-margen*orden.length) / orden.reduce((n,s)=>n+s.d,0));
  const total = orden.reduce((n,s)=>n+s.d*factor+margen,0);
  let avance = 0;
  for (const s of orden){
    const ancho = s.d*factor+margen;
    const ang = -Math.PI/2 + (avance+ancho/2)/total*Math.PI*2;
    s.circular = {x:C.x+radio*Math.cos(ang),y:C.y+radio*Math.sin(ang),factor};
    s.vinculosDatos = DATOS_VINCULOS[s.capa+':'+s.it.id] || {especies:[],hallazgo:''};
    avance += ancho;
  }
  const enlaces = [];
  for(let i=0;i<orden.length;i++) for(let j=i+1;j<orden.length;j++){
    const a=orden[i], b=orden[j];
    const especies=a.vinculosDatos.especies.filter(e=>b.vinculosDatos.especies.includes(e));
    if(!especies.length) continue;
    // El color describe únicamente las especies compartidas, no todos los grupos de los extremos.
    const grupos=['B','L','M'].filter(g=>especies.some(e=>GRUPOS_ESPECIES[e]===g));
    const p=document.createElementNS('http://www.w3.org/2000/svg','path');
    const gradiente=pintarVinculo(p,grupos,'vinculo-color-'+enlaces.length);
    $('trazosVinculos').appendChild(p);
    enlaces.push({a,b,especies,grupos,gradiente,el:p});
  }
  redVinculos={orden,enlaces};
  prepararMuestrario();
  prepararMenuVistas();
}
function cambiarVista(nueva){
  animarMenuVistas(nueva);
  $('aviso').classList.remove('vis');
  if(vista===nueva) return;
  cancelAnimationFrame(animZoom);
  cancelAnimationFrame(animVista);
  vista=nueva;
  if(vista==='placa')animarEntradaAros();
  pantalla.classList.toggle('vista-vinculos',vista==='vinculos');
  pantalla.classList.toggle('vista-muestrario',vista==='muestrario');
  $('hilos').removeAttribute('hidden');
  $('aviso').classList.remove('vis');
  const desde=mezclaVista, hasta=vista==='vinculos'?1:0;
  const desdeGrilla=mezclaMuestrario,hastaGrilla=vista==='muestrario'?1:0;
  const duracion=1100*Math.max(Math.abs(hasta-desde),Math.abs(hastaGrilla-desdeGrilla)), inicio=performance.now();
  animarArcoZoom(vista==='placa',{demora:vista==='placa'?duracion*.86:0});
  const terminar=()=>{
    animVista=0;
    pantalla.classList.remove('transicion-vista');
    $('hilos').toggleAttribute('hidden',mezclaVista===0);
  };
  const paso=ahora=>{
    const t=duracion ? clamp((ahora-inicio)/duracion) : 1;
    const e=t*t*(3-2*t);
    mezclaVista=desde+(hasta-desde)*e;
    mezclaMuestrario=desdeGrilla+(hastaGrilla-desdeGrilla)*e;
    maquetar();
    if(t<1) animVista=requestAnimationFrame(paso);
    else terminar();
  };
  pantalla.classList.add('transicion-vista');
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    mezclaVista=hasta; mezclaMuestrario=hastaGrilla; maquetar(); terminar();
  } else {
    maquetar();
    animVista=requestAnimationFrame(paso);
  }
  if(seleccion) seleccionar(seleccion,true);
  else dibujarVinculos();
}
function actualizarGeometriaVinculos(){
  if(!redVinculos) return;
  const enc=encuadreEsquema();
  $('hilos').style.opacity=mezclaVista.toFixed(3);
  if(mezclaVista===0) return;
  const mascara=$('huecosMuestras');
  if(!mascara.children.length)for(const s of muestras){
    mascara.appendChild(document.createElementNS('http://www.w3.org/2000/svg','circle'));
  }
  muestras.forEach((s,i)=>{
    const hueco=mascara.children[i];
    hueco.setAttribute('cx',s.x);hueco.setAttribute('cy',s.y0);
    hueco.setAttribute('r',Math.max(0,s.d*s.escVista*.29));
  });
  for(const {a,b,el,gradiente} of redVinculos.enlaces){
    el.setAttribute('d',`M${a.x.toFixed(1)},${a.y0.toFixed(1)} Q${enc.x},${enc.y} ${b.x.toFixed(1)},${b.y0.toFixed(1)}`);
    if(gradiente){
      gradiente.setAttribute('x1',a.x.toFixed(1));gradiente.setAttribute('y1',a.y0.toFixed(1));
      gradiente.setAttribute('x2',b.x.toFixed(1));gradiente.setAttribute('y2',b.y0.toFixed(1));
    }
  }
}
function enlacesActuales(){
  return redVinculos.enlaces.filter(e => coincide(e.a) && coincide(e.b));
}
function dibujarVinculos(){
  if(!redVinculos) return;
  if(vista!=='vinculos'){
    for(const s of muestras){s.el.classList.remove('sin-vinculo','relacionada');}
    return;
  }
  const activos=new Set(enlacesActuales()), vecinas=new Set();
  for(const e of activos) if(e.a===seleccion||e.b===seleccion){vecinas.add(e.a);vecinas.add(e.b);}
  for(const e of redVinculos.enlaces){
    const destacada=e.a===seleccion||e.b===seleccion;
    e.el.style.opacity=activos.has(e)?(seleccion?(destacada ? .85 : .02):.24):0;
    e.el.style.strokeWidth=seleccion&&destacada?'2':'1.2';
  }
  for(const s of muestras){
    s.el.classList.toggle('sin-vinculo',vista==='vinculos'&&!!seleccion&&s!==seleccion&&!vecinas.has(s));
    s.el.classList.toggle('relacionada',vista==='vinculos'&&s!==seleccion&&vecinas.has(s));
  }
}
