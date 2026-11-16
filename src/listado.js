// Listado optativo. El estado inicial deja todo el espacio disponible para el esquema.
let listadoAbierto=false,aperturaListado=0,animListado=0;
function encuadreEsquema(){
  const libre=1-aperturaListado;
  return {x:C.x+(1220-C.x)*libre,y:C.y,k:1+.16*libre};
}
function puntoEsquema(x,y){
  const e=encuadreEsquema();
  return {x:e.x+(x-C.x)*e.k,y:e.y+(y-C.y)*e.k};
}
function marcoMuestrario(){
  const g=GUIA_MUESTRARIO;
  return {x:g.x-DX/2,y:g.y-DY/2,width:g.width+DX-530*aperturaListado,height:g.height+DY};
}
function prepararListado(){
  const boton=$('alternarListado');
  boton.addEventListener('click',()=>cambiarListado(!listadoAbierto));
  const cerrarConEscape=ev=>{if(ev.key==='Escape'&&listadoAbierto){ev.preventDefault();cambiarListado(false);}};
  boton.addEventListener('keydown',cerrarConEscape);
  $('buscador').addEventListener('keydown',cerrarConEscape);
  actualizarEstadoListado();
}
function actualizarEstadoListado(){
  pantalla.classList.toggle('listado-cerrado',!listadoAbierto);
  const boton=$('alternarListado');
  boton.setAttribute('aria-expanded',String(listadoAbierto));
  boton.setAttribute('aria-label',listadoAbierto?'Cerrar listado completo':'Abrir listado completo');
  for(const id of ['lista','listaCab','buscador']){
    $(id).inert=!listadoAbierto;
    $(id).setAttribute('aria-hidden',String(!listadoAbierto));
  }
}
function cambiarListado(abierto){
  if(abierto===listadoAbierto)return;
  cancelAnimationFrame(animListado);
  const devolverFoco=!abierto&&document.activeElement?.closest('#buscador,#lista');
  listadoAbierto=abierto;actualizarEstadoListado();
  if(devolverFoco)$('alternarListado').focus({preventScroll:true});
  const desde=aperturaListado,hasta=abierto?1:0,inicio=performance.now();
  const duracion=650*Math.abs(hasta-desde);
  const paso=ahora=>{
    const t=duracion?clamp((ahora-inicio)/duracion):1,e=t*t*(3-2*t);
    aperturaListado=desde+(hasta-desde)*e;
    maquetar();
    if(t<1)animListado=requestAnimationFrame(paso);
    else{animListado=0;desenfocarLista();}
  };
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    aperturaListado=hasta;animListado=0;maquetar();desenfocarLista();
  }else animListado=requestAnimationFrame(paso);
}
