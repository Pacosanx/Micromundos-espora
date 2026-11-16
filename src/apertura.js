// Las colonias del JSON original son los puntos de partida de la placa.
function prepararApertura(iniciarMuestras){
  const portada=$('apertura'), nube=$('aperturaColonias');
  const fondoObras=[];
  // Fases distintas y movimiento CSS: no se recalculan las texturas en cada frame.
  document.querySelectorAll('.tinte,.apertura-tinte').forEach((el,i)=>{
    el.style.setProperty('--flotar-tiempo',(32+i%2*7)+'s');
    el.style.setProperty('--flotar-fase',(-i%2*13)+'s');
    el.style.setProperty('--flotar-y',(38+i%2*14)+'px');
  });
  document.querySelectorAll('.elipse,.apertura-arco').forEach((el,i)=>{
    el.style.setProperty('--giro-tiempo',(210+i%3*45)+'s');
    el.style.setProperty('--giro-sentido',i%2?'reverse':'normal');
  });
  const fondo=$('aperturaFondo');
  RECETA_FONDO_APERTURA.items.forEach((it,i)=>{
    const el=document.createElement('div'),cv=document.createElement('canvas');
    el.className='apertura-mancha';
    const lado=it.w*1920/WF;
    Object.assign(el.style,{width:lado+'px',height:lado+'px',left:(it.x*1920-lado/2)+'px',top:(it.y*1279-lado/2)+'px'});
    el.style.setProperty('--flotar-tiempo',(13+i%9)+'s');
    el.style.setProperty('--flotar-fase',(-i*1.73%21)+'s');
    el.style.setProperty('--flotar-y',(12+i%6*3)+'px');
    el.style.setProperty('--flotar-x',((i%5-2)*4)+'px');
    el.appendChild(cv);fondo.appendChild(el);
    fondoObras.push(mountColonias(cv,{recipe:pieza(it.style),maxResolution:96}));
  });
  piezas.filter(p=>p.tipo==='halo').forEach((p,i)=>{
    p.mi.classList.add('mancha-flotante');
    p.mi.style.setProperty('--flotar-tiempo',(14+i%7)+'s');
    p.mi.style.setProperty('--flotar-fase',(-i*2.31%20)+'s');
    p.mi.style.setProperty('--flotar-y',(10+i%5*3)+'px');
    p.mi.style.setProperty('--flotar-x',((i%5-2)*3)+'px');
  });
  const contenido=['centro','cabecera','derecha','leyenda','izqAbajo','seccion'].map($);
  for(const el of contenido)el.inert=true;
  const pendientes=new Set(muestras), particulas=[];
  for(const [i,it] of RECETA_APERTURA.items.entries()){
    if(it.type!=='shape')continue;
    const grupo=PALETA_GRUPO[it.style.c1+it.style.c2+it.style.c3]||
      (it.style.c1.toLowerCase()==='#27633f'?'M':it.style.c1.toLowerCase()==='#ff9c20'?'L':'B');
    const candidatas=[...pendientes];
    const destino=candidatas.find(s=>s.grupo===grupo)||candidatas[0]||muestras[i%muestras.length];
    const principal=pendientes.delete(destino);
    const el=document.createElement('div');el.className='apertura-particula';
    const origen=document.createElement('canvas'), llegada=document.createElement('canvas');
    el.append(origen,llegada);nube.appendChild(el);
    const lado=it.w*1700/WF;
    el.style.width=el.style.height=lado+'px';
    // La palabra permanece quieta hasta que se activa la transición. Al ser puntos
    // pequeños y desenfocados, 64 px alcanzan y evitan rasterizar cientos de sprites grandes.
    const obra=mountColonias(origen,{recipe:pieza(it.style),maxResolution:64});
    llegada.style.opacity=0;
    particulas.push({it,el,origen,llegada,lado,destino,principal,obra,fase:i*.71,periodo:7.8+i%7*.17});
  }
  let progreso=0,iniciado=false,terminado=false,raf=0;
  const movimientoReducido=matchMedia('(prefers-reduced-motion: reduce)');
  const marca=portada.querySelector('.apertura-marca');
  function pintar(ahora=performance.now()){
    const t=progreso,e=t*t*(3-2*t);
    const segundos=ahora/1000;
    const grupoX=movimientoReducido.matches?0:1.4*Math.sin(segundos*Math.PI*2/11);
    const grupoY=movimientoReducido.matches?0:4.5*Math.sin(segundos*Math.PI*2/9.5);
    marca.style.translate=`${(grupoX*.7).toFixed(3)}px ${(grupoY*.85).toFixed(3)}px`;
    // El fondo no se reemplaza: sólo se despejan sus efectos al entrar a Muestras.
    pantalla.style.setProperty('--fondo-blur',(175-50*e).toFixed(2)+'px');
    pantalla.style.setProperty('--fondo-grano',(.14-.10*e).toFixed(3));
    pantalla.style.setProperty('--puntos-blur',(1.75-.40*e).toFixed(2)+'px');
    pantalla.style.setProperty('--tinte-ruido',(1-e).toFixed(3));
    pantalla.style.setProperty('--entrada-interfaz',clamp((t-.55)/.45));
    portada.style.setProperty('--salida-apertura',1-clamp(t/.4));
    for(const p of particulas){
      const pulso=segundos*Math.PI*2/p.periodo+p.fase;
      const puntoX=movimientoReducido.matches?0:.65*Math.sin(pulso*.91);
      const puntoY=movimientoReducido.matches?0:1.65*Math.sin(pulso);
      const x0=110+p.it.x*1700+DX/2+grupoX+puntoX,y0=-49+p.it.y*(1700*2/3)+DY/2+grupoY+puntoY;
      const x1=p.destino.x+DX/2,y1=p.destino.y0+DY/2;
      const lado=p.lado+(p.destino.lado*p.destino.escVista-p.lado)*e;
      const x=x0+(x1-x0)*e,y=y0+(y1-y0)*e;
      const mezcla=suave((t-.2)/.7);
      const opacidad=1+(p.destino.vis-1)*mezcla;
      if(iniciado&&p.principal){
        const destino=p.destino;
        destino.el.style.transform=`translate(${x-DX/2-destino.lado/2}px,${y-DY/2-destino.lado/2}px) scale(${lado/destino.lado})`;
        destino.el.style.opacity=opacidad;
        p.origen.style.opacity=1-mezcla;p.canvasDestino.style.opacity=mezcla;
      }else{
        if(iniciado)p.el.style.width=p.el.style.height=lado+'px';
        p.el.style.transform=`translate(${x-lado/2}px,${y-lado/2}px)`;
        p.origen.style.opacity=1-mezcla;p.llegada.style.opacity=mezcla;
        p.el.style.opacity=opacidad*(1-suave((t-.65)/.35));
      }
    }
  }
  const redimensionar=()=>{if(!terminado)pintar();};
  addEventListener('resize',redimensionar);
  pintar();
  portada.classList.add('apertura-lista');
  // La composición inicial es estática: no hace falta recalcular 173 posiciones
  // mientras la persona decide entrar.
  function comenzar(){
    if(iniciado)return;iniciado=true;
    cancelAnimationFrame(raf);
    portada.setAttribute('aria-busy','true');
    iniciarMuestras();
    for(const p of particulas){
      const cv=p.destino.el.querySelector('canvas');
      if(p.principal){
        p.canvasDestino=cv;
        p.destino.mi.style.position='relative';
        Object.assign(p.origen.style,{position:'absolute',inset:'0',width:'100%',height:'100%'});
        p.destino.mi.appendChild(p.origen);
        cv.style.opacity=0;
      }else{
        p.llegada.width=cv.width;p.llegada.height=cv.height;
        p.llegada.getContext('2d').drawImage(cv,0,0,p.llegada.width,p.llegada.height);
      }
    }
    pintar();pantalla.classList.add('apertura-en-marcha');
    const inicio=performance.now(),reducido=matchMedia('(prefers-reduced-motion: reduce)').matches;
    let ultimoFrame=0;
    const paso=ahora=>{
      if(!reducido&&ahora-ultimoFrame<33){raf=requestAnimationFrame(paso);return;}
      ultimoFrame=ahora;
      progreso=reducido?1:clamp((ahora-inicio)/2300);pintar(ahora);
      if(progreso<1){raf=requestAnimationFrame(paso);return;}
      terminado=true;cancelAnimationFrame(raf);
      for(const p of particulas)if(p.principal){p.origen.remove();p.canvasDestino.style.opacity='';p.destino.mi.style.position='';}
      maquetar();
      pantalla.classList.remove('en-apertura','apertura-en-marcha');
      for(const el of contenido)el.inert=false;
      portada.remove();removeEventListener('resize',redimensionar);
      for(const p of particulas)p.obra.destroy();
      // Las obras del fondo permanecen montadas y conservan su fase de movimiento.
      $('titulo').focus({preventScroll:true});
    };
    raf=requestAnimationFrame(paso);
  }
  portada.addEventListener('click',comenzar);
  portada.addEventListener('keydown',ev=>{
    if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();comenzar();}
  });
  if(portada.dataset.entradaPendiente==='true')comenzar();
}
