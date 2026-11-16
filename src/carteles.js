// Cartel de muestra: referencia Figma 396:8047, con datos y universo cromático propios.
const RECURSOS_CARTEL={coloresBL:'__CARTEL_COLORES__',flecha:'__CARTEL_FLECHA__'};
const PALETA_CARTEL={B:'#e57dab',L:'#f2c75e',M:'#92aa68'};
const escaparCartel=valor=>String(valor??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function universoCartel(el,grupo='BL'){
  const colores=[...grupo].map(g=>PALETA_CARTEL[g]).filter(Boolean);
  const rgba=h=>`rgba(${[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)).join(',')},.25)`;
  const stops=colores.length===1?[colores[0],colores[0]]:colores;
  el.dataset.universo=grupo;
  // Cada cartel recorta y refleja la textura de fondo de otra manera (semilla = su nombre y código).
  const clave=(el.querySelector('.nom')?.textContent||'')+'|'+(el.querySelector('.cod')?.textContent||'');
  let h=2166136261;for(const c of clave+grupo)h=Math.imul(h^c.charCodeAt(0),16777619)>>>0;
  if(clave==='|')h=(h+Math.imul(++universoCartel.n,2654435761))>>>0;
  const azar=()=>{h=(Math.imul(h,1664525)+1013904223)>>>0;return h/4294967296;};
  el.style.setProperty('--tx-ox',Math.round(azar()*100)+'%');/* oy ≤ 80 %: la capa de textura termina al 95 % del alto del cartel; con el origen más abajo, el zoom la deja corta y asoma un corte horizontal. */
  el.style.setProperty('--tx-oy',Math.round(azar()*80)+'%');
  el.style.setProperty('--tx-s',(1.35+azar()*.9).toFixed(2));el.style.setProperty('--tx-f',azar()<.5?'-1':'1');
  el.style.setProperty('--cartel-fondo',`linear-gradient(90deg,${stops.map(rgba).join(',')})`);
  el.style.setProperty('--cartel-linea',`linear-gradient(90deg,${stops.join(',')})`);
}
universoCartel.n=0;
function coloresCartel(grupo){
  if(grupo==='BL')return `<img src="${RECURSOS_CARTEL.coloresBL}" width="24" height="10" alt="">`;
  return [...grupo].map(g=>`<i style="background:${PALETA_CARTEL[g]}"></i>`).join('');
}
function contenidoCartel(s){
  const esc=escaparCartel,especies=s.vinculosDatos.especies;
  const nota=s.estado==='C'?`Reserva física, ${s.nota}`:(ESTADO_NOTA[s.estado]||'');
  const detalles=especies.map(nombre=>{
    const e=CATALOGO_ESPECIES[nombre];if(!e)return '';
    return `<section class="especieDetalle"><h3>${esc(nombre)}</h3><p>${esc(e.definicion)}</p><p><b>Dónde se encuentra</b>${esc(e.donde_esta)}</p><p><b>Qué produce o transforma</b>${esc(e.que_produce_o_transforma)}</p></section>`;
  }).join('');
  return `<header class="cabCartel"><div class="nom">${esc(s.origen)}</div><div class="cod">${esc(s.codigo)}</div></header>
    <div class="reglaCartel" aria-hidden="true"></div>
    <dl><dt>Grupo</dt><dd class="valorGrupo"><span class="grupoCartel"><span class="coloresCartel" aria-hidden="true">${coloresCartel(s.grupo)}</span><span>${esc(GRUPO_NOMBRE[s.grupo])}</span></span></dd>
    <dt>Estado</dt><dd>${esc(ESTADO_NOMBRE[s.estado])}${nota?`<small>${esc(nota)}</small>`:''}</dd>
    <dt>Recolección</dt><dd>${esc(fechaTexto(s))}</dd>
    <dt>Colonias</dt><dd>${s.colonias>N_MAX?'Más de 300':s.colonias}</dd>
    <dt>Especies</dt><dd>${especies.map(e=>`<small>${esc(e)}</small>`).join('')}</dd></dl>
    ${esFichaPreparada(s)?`<button class="masCartel" data-ficha-completa><span>Ver ficha de muestra</span><img src="${RECURSOS_CARTEL.flecha}" width="11.3995" height="11.0459" alt=""></button>`:''}`;
}

// Arrastre común para muestras y términos: blur de borde, retorno e inercia.
function actualizarBlurCartel(el,pos){
  const w=el.offsetWidth||402,h=el.offsetHeight||462,{x,y}=pos;
  const vx=Math.max(0,Math.min(x+w,1920+DX/2)-Math.max(x,-DX/2));
  const vy=Math.max(0,Math.min(y+h,1100+DY/2)-Math.max(y,-DY/2));
  const fuera=clamp(1-vx*vy/(w*h));
  el.style.setProperty('--descarte-blur',(32*Math.pow(clamp(fuera/.5),.8)).toFixed(2)+'px');
}
// Impulso amortiguado por el scroll, independiente de la posición elegida al arrastrar.
function activarOleajeCartel(el,indice=0){
  let y=0,v=0,frame=0,anterior=0,agarrado=false;
  const reducido=matchMedia('(prefers-reduced-motion: reduce)');
  const pintar=()=>el.style.setProperty('--oleaje-y',y.toFixed(3)+'px');
  const detener=()=>{cancelAnimationFrame(frame);frame=0;y=v=0;pintar();};
  const paso=ahora=>{
    frame=0;
    if(agarrado||reducido.matches||!el.isConnected){detener();return;}
    const dt=Math.min(1/30,Math.max(.001,(ahora-anterior)/1000));anterior=ahora;
    v+=(-55*y-12*v)*dt;y+=v*dt;
    const pos=/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/.exec(el.style.transform);
    const base=pos?+pos[2]:0,h=el.offsetHeight||265;
    const minimo=Math.max(-12,-DY/2+4-base),maximo=Math.min(12,1100+DY/2-h-4-base);
    if(minimo<=maximo){const limite=clamp(y,minimo,maximo);if(limite!==y)v=0;y=limite;}
    else{y=v=0;}
    pintar();
    if(Math.abs(y)>.02||Math.abs(v)>.04)frame=requestAnimationFrame(paso);
    else detener();
  };
  const impulsar=delta=>{
    if(agarrado||reducido.matches||!el.classList.contains('vis')||el.classList.contains('saliendo'))return;
    v=clamp(v-delta*(.3+indice%4*.035),-65,65);
    if(!frame){anterior=performance.now();frame=requestAnimationFrame(paso);}
  };
  el.addEventListener('pointerdown',()=>{
    // Absorbe el desplazamiento visible para que tomar el cartel no produzca un salto.
    const pos=/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/.exec(el.style.transform);
    if(pos&&y)el.style.transform=`translate(${pos[1]}px,${(+pos[2]+y).toFixed(3)}px)`;
    agarrado=true;detener();
  });
  for(const evento of ['pointerup','pointercancel'])el.addEventListener(evento,()=>{agarrado=false;});
  return {impulsar,detener};
}
function activarArrastreCartel(ficha,alMover,alCerrar){
  let fichaManual=null,cancelarDeslizamientoFicha;
  const ubicarFicha=()=>{alMover(fichaManual);actualizarBlurCartel(ficha,fichaManual);};
  let ini = null, movido = false, deslizamiento = 0;
  const movimientoReducido=window.matchMedia('(prefers-reduced-motion: reduce)');
  cancelarDeslizamientoFicha=()=>{cancelAnimationFrame(deslizamiento);deslizamiento=0;};
  const posActual = () => { const m = /translate\(([-\d.]+)px,\s*([-\d.]+)px\)/.exec(ficha.style.transform); return m ? { x:+m[1], y:+m[2] } : { x:0, y:0 }; };
  ficha.addEventListener('pointerdown', ev => {
    if(ini)return;
    movido=false;
    cancelarDeslizamientoFicha();
    if (ev.button > 0 || ev.target.closest('button')) return;
    const fi = ficha.querySelector('.fi');
    // si el contenido es largo (detalle abierto), se arrastra desde el encabezado y el resto queda para desplazar
    if (fi.scrollHeight > fi.clientHeight + 2 && !ev.target.closest('.cabCartel')) return;
    const p = aEscena(ev), o = posActual();
    ini = { id:ev.pointerId,px:p.x,py:p.y,x:o.x,y:o.y,ultimaX:p.x,ultimaY:p.y,tiempo:ev.timeStamp,vx:0,vy:0 }; movido = false;
    ficha.setPointerCapture(ev.pointerId);
  });
  ficha.addEventListener('pointermove', ev => {
    if (!ini || ev.pointerId!==ini.id) return;
    const p = aEscena(ev), dx = p.x - ini.px, dy = p.y - ini.py;
    if (!movido && Math.hypot(dx, dy) < 6) return;
    movido = true; ficha.classList.add('arrastrando');
    const dt=Math.max(1,ev.timeStamp-ini.tiempo);
    ini.vx=.6*ini.vx+.4*(p.x-ini.ultimaX)/dt;
    ini.vy=.6*ini.vy+.4*(p.y-ini.ultimaY)/dt;
    ini.ultimaX=p.x;ini.ultimaY=p.y;ini.tiempo=ev.timeStamp;
    fichaManual = { x: ini.x + dx, y: ini.y + dy }; ubicarFicha();
  });
  const soltar = ev => {
    if (!ini || ev.pointerId!==ini.id) return;
    const velocidad=ev.timeStamp-ini.tiempo>90?{x:0,y:0}:{x:ini.vx,y:ini.vy};
    ini = null; ficha.classList.remove('arrastrando');
    if (!movido) return;
    // qué parte del cartel quedó dentro de la pantalla (en coordenadas del grupo central)
    const w = ficha.offsetWidth, h = ficha.offsetHeight, { x, y } = fichaManual;
    const vx = Math.max(0, Math.min(x + w, 1920 + DX/2) - Math.max(x, -DX/2));
    const vy = Math.max(0, Math.min(y + h, 1100 + DY/2) - Math.max(y, -DY/2));
    if (vx * vy < w * h * 0.5) {
      const cx = x + w/2 - (960), cy = y + h/2 - 550, L = Math.hypot(cx, cy) || 1;
      ficha.classList.add('saliendo');
      fichaManual = { x: x + cx/L*500, y: y + cy/L*500 }; ubicarFicha();   // sigue de largo hacia afuera
      ficha.classList.remove('vis');
      setTimeout(() => { if (!ficha.classList.contains('vis')) alCerrar(); ficha.classList.remove('saliendo'); }, 600);
      return;
    }
    // Si sólo asoma una parte, vuelve al campo visible antes de aplicar la inercia.
    if(vx < w-.05 || vy < h-.05){
      const margen=24;
      const finX=clamp(x,-DX/2+margen,1920+DX/2-w-margen);
      const finY=clamp(y,-DY/2+margen,1100+DY/2-h-margen);
      const inicio=performance.now(),recorrido=Math.max(1,Math.hypot(finX-x,finY-y));
      const volver=ahora=>{
        deslizamiento=0;
        if(!ficha.classList.contains('vis'))return;
        const t=movimientoReducido.matches?1:clamp((ahora-inicio)/520),u=t-1;
        const e=Math.min(1+2.1*u*u*u+1.1*u*u,1+6/recorrido);
        fichaManual={x:x+(finX-x)*e,y:y+(finY-y)*e};ubicarFicha();
        if(t<1)deslizamiento=requestAnimationFrame(volver);
        else ficha.style.setProperty('--descarte-blur','0px');
      };
      if(movimientoReducido.matches)volver(inicio);
      else deslizamiento=requestAnimationFrame(volver);
      return;
    }
    if(ev.type!=='pointerup'||movimientoReducido.matches)return;
    // La rapidez se mide en píxeles de pantalla por ms, independientemente de la escala del escenario.
    // Curva progresiva: los gestos rápidos viajan más, sin saturar todos en el antiguo límite de 24 px.
    const rapidez=Math.hypot(velocidad.x,velocidad.y),rapidezPantalla=rapidez*escala;
    const distanciaPantalla=120*(1-Math.exp(-rapidezPantalla/1.2));
    if(distanciaPantalla<.5)return;
    const distancia=distanciaPantalla/escala;
    const dx=velocidad.x/rapidez*distancia,dy=velocidad.y/rapidez*distancia;
    const finX=clamp(x+dx,Math.min(x,-DX/2),Math.max(x,1920+DX/2-w));
    const finY=clamp(y+dy,Math.min(y,-DY/2),Math.max(y,1100+DY/2-h));
    const inicio=performance.now(),duracion=280+distanciaPantalla*2.5;
    const continuar=ahora=>{
      deslizamiento=0;
      if(!ficha.classList.contains('vis')||movimientoReducido.matches)return;
      const t=clamp((ahora-inicio)/duracion),e=1-Math.pow(1-t,3);
      fichaManual={x:x+(finX-x)*e,y:y+(finY-y)*e};ubicarFicha();
      if(t<1)deslizamiento=requestAnimationFrame(continuar);
    };
    deslizamiento=requestAnimationFrame(continuar);
  };
  ficha.addEventListener('pointerup', soltar);
  ficha.addEventListener('pointercancel', soltar);
  // que un arrastre no cuente como toque (ni sobre "Leer más" ni sobre la pantalla)
  ficha.addEventListener('click', ev => { if (movido) { ev.stopPropagation(); ev.preventDefault(); movido = false; } }, true);
  return ()=>cancelarDeslizamientoFicha();
}
