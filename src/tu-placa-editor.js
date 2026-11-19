// Nivel 2 del menú contextual de TU PLACA: TRANSFORMAR (18/11/2026). Cómo ES la colonia.
// Parámetros: "Todos los parámetros" de la Placa de encuentros del muestrario, dibujados con el mismo motor
// (MotorMuestrario, tu-placa-motor.js). Nada de barras: la colonia se agranda en el centro y se edita con tiradores.
//   giro        → porcentajes (arco con perilla)
//   muescas     → cantidades (arco con marcas)
//   radial      → lo que crece desde el centro (filamentos, anillo, profundidad, manchas)
//   2D          → dirección y cantidad juntas (expansión, color medio lineal)
//   tocar       → opciones (distribución y tratamiento del color); tocar de nuevo MANCHAS o PIGMENTOS da otra variante
// Lo que cambia cómo ESTÁ la colonia en la placa (tamaño, giro, foco, opacidad) queda en el aro del nivel 1.

function montarEditorTuPlaca(host,{base,cambiar,empezar,terminar,alCerrar=()=>{}}){
  const C=392,R0=140,RD=300,ns='http://www.w3.org/2000/svg';
  const rad=a=>a*Math.PI/180,norm=a=>((a%360)+540)%360-180,clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
  const pt=(a,r)=>[C+Math.cos(rad(a))*r,C+Math.sin(rad(a))*r];
  // 19/11/2026: COLOR y MATERIA son una sola, MATERIA, con el ícono de color (Paco).
  const pestanas=[['forma','FORMA'],['borde','BORDE Y CORTE'],['materia','MATERIA']];
  host.className='tp-editor';host.hidden=true;
  host.innerHTML=`<div class="tp-editor-velo"></div><div class="tp-editor-colonia"><canvas></canvas></div><svg class="tp-editor-guias" viewBox="0 0 784 784" aria-hidden="true"></svg><div class="tp-editor-pestanas" role="tablist" aria-label="Transformar"></div><div class="tp-editor-opciones"></div><button type="button" class="tp-editor-listo">LISTO</button>`;
  const caja=host.querySelector('.tp-editor-colonia'),svg=host.querySelector('svg'),tabs=host.querySelector('.tp-editor-pestanas'),opciones=host.querySelector('.tp-editor-opciones');
  let pestana='forma',arrastre=null,pedido=0,estado=null,estilo=null;
  // 19/11/2026: los títulos salen del círculo. Van afuera, a la izquierda de la placa, uno debajo del otro,
  // cada uno con su ícono en la misma superficie redonda que los botones del aro (menú contextual).
  const ICONOS_PESTANA={forma:'<path d="M12 4.2c1.6 0 2.2 1.6 3.6 1.9 1.5.3 3-.4 3.6 1 .6 1.4-.7 2.4-.5 3.9.2 1.5 1.6 2.4.9 3.8-.7 1.4-2.3.9-3.6 1.7-1.3.8-1.4 2.6-3 2.8-1.5.2-2.1-1.4-3.5-1.9-1.4-.5-3 .3-3.7-1-.7-1.4.6-2.5.4-4-.2-1.5-1.6-2.4-.9-3.8.7-1.4 2.3-.8 3.6-1.6C10.1 6.2 10.4 4.2 12 4.2Z"/>',borde:'<path d="M18.2 15.6A7.2 7.2 0 1 1 18.6 9"/><path d="M15 12a3 3 0 1 1-.9-2.1" stroke-dasharray="1.2 2.2"/>',materia:'<circle cx="12" cy="12" r="7.2"/><path d="M12 4.8a7.2 7.2 0 0 0 0 14.4Z" fill="#212121"/>'};
  pestanas.forEach(([id,texto],i)=>{const b=document.createElement('button');b.type='button';b.role='tab';b.dataset.pestana=id;b.setAttribute('aria-label',texto);
    b.innerHTML=`<span class="tp-editor-pestana-texto">${texto}</span><span class="tp-editor-pestana-icono"><img class="tp-editor-pestana-superficie" src="src/assets/tu-placa/tp-boton.svg" alt=""><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#212121" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONOS_PESTANA[id]||''}</svg></span>`;
    { const a=(180-(i-(pestanas.length-1)/2)*13)*Math.PI/180; b.style.left=(C+Math.cos(a)*452)+'px'; b.style.top=(C+Math.sin(a)*452)+'px'; } // siguen el arco del círculo mayor
    b.addEventListener('pointerdown',ev=>{ev.stopPropagation();pestana=id;dibujar();});b.addEventListener('keydown',ev=>{if(['Enter',' '].includes(ev.key)){ev.preventDefault();pestana=id;dibujar();}const d={ArrowDown:1,ArrowUp:-1}[ev.key];if(d){ev.preventDefault();const ids=pestanas.map(p=>p[0]);pestana=ids[(ids.indexOf(id)+d+ids.length)%ids.length];dibujar();tabs.querySelector('[aria-selected="true"]')?.focus({preventScroll:true});}});tabs.appendChild(b);});
  host.querySelector('.tp-editor-listo').addEventListener('click',ev=>{ev.stopPropagation();cerrar();});
  // 19/11/2026: tocar dentro del contenedor no lo cierra; tocar afuera, sí (Paco).
  host.querySelector('.tp-editor-velo').addEventListener('pointerdown',ev=>ev.stopPropagation());
  host.addEventListener('pointerdown',ev=>{if(ev.target===host&&!arrastre)cerrar();}); // las esquinas del cuadro, fuera del círculo
  document.addEventListener('pointerdown',ev=>{if(!host.hidden&&!arrastre&&!host.contains(ev.target))cerrar();},true);

  // Valor efectivo: el que usa el motor (estilo de la biblioteca o composición + lo editado).
  const valor=k=>estilo[k];
  const giroMarco=()=>estado.rot+(valor('rotation')||0);
  const porcentaje=v=>Math.round(v)+'%';
  const tratamiento=()=>valor('colorTreatment')||'none';
  const conTratamiento=(...modos)=>()=>modos.includes(tratamiento())&&valor('pigmentIntensity')>0;
  const recortable=()=>!['pair','band','capsule'].includes(valor('shape'));

  const TRATAMIENTOS=[['none','Sin'],['zoned','Zonada'],['rimmed','Aureolada'],['spotted','Manchas'],['patchy','Pigmentos']];
  const controles={
    forma:[
      {tipo:'vector',etiqueta:'Expansión',mostrar:v=>porcentaje(v/2)},
      {tipo:'dial',key:'studyLobes',etiqueta:'Lóbulos',min:0,max:16,paso:1,a0:196,a1:236,mostrar:v=>String(v)},
      {tipo:'radial',key:'studyDepth',etiqueta:'Profundidad',min:10,max:100,angulo:()=>135,r0:R0*.72,r1:R0*1.38,visible:()=>valor('studyLobes')>0,mostrar:porcentaje},
      {tipo:'dial',key:'irregularity',etiqueta:'Irregularidad',min:0,max:100,paso:1,a0:-56,a1:-16,mostrar:porcentaje},
    ],
    borde:[
      {tipo:'radial',key:'filaments',etiqueta:'Filamentos',min:0,max:100,angulo:()=>158,r0:R0+14,r1:R0+104,mostrar:porcentaje},
      {tipo:'dial',key:'filamentCount',etiqueta:'Cantidad',min:10,max:180,paso:1,a0:194,a1:236,visible:()=>valor('filaments')>0,mostrar:v=>String(v)},
      {tipo:'dial',key:'filamentSpacing',etiqueta:'Separación',min:0,max:100,paso:1,a0:100,a1:124,visible:()=>valor('filaments')>0,mostrar:porcentaje},
      {tipo:'dial',key:'filamentWidth',etiqueta:'Grosor',min:0,max:100,paso:1,a0:56,a1:80,visible:()=>valor('filaments')>0,mostrar:porcentaje},
      {tipo:'corte',etiqueta:'Recorte',visible:recortable},
      {tipo:'radial',key:'ringThickness',etiqueta:'Anillo',min:1,max:100,invertido:true,angulo:()=>giroMarco()-90+(valor('cutAngle')||0)+valor('cutOpening')/2,r0:0,r1:R0*.94,visible:recortable,mostrar:porcentaje},
    ],
    materia:[
      {tipo:'miniaturas',key:'gradient',etiqueta:'Distribución',opciones:[['radial','Radial'],['linear','Lineal'],['rings','Anillos'],['solid','Un color']],a0:199.5,paso:17},
      {tipo:'miniaturas',key:'colorTreatment',etiqueta:'Tratamiento',opciones:TRATAMIENTOS,a0:-79,paso:17},
      {tipo:'medio',etiqueta:'Color medio',visible:()=>valor('gradient')!=='solid'||conTratamiento('zoned','patchy')()},
      {tipo:'dial',key:'pigmentIntensity',etiqueta:'Intensidad',min:0,max:100,paso:1,a0:20,a1:46,visible:()=>tratamiento()!=='none',mostrar:porcentaje},
      {tipo:'dial',key:'zoneCount',etiqueta:'Zonas',min:1,max:8,paso:1,a0:134,a1:160,visible:conTratamiento('zoned'),mostrar:v=>String(v)},
      {tipo:'dial',key:'rimSize',etiqueta:'Borde',min:40,max:180,paso:1,a0:134,a1:160,visible:conTratamiento('rimmed'),mostrar:porcentaje},
      {tipo:'dial',key:'spotCount',etiqueta:'Manchas',min:1,max:8,paso:1,a0:134,a1:160,visible:conTratamiento('spotted'),mostrar:v=>String(v)},
      {tipo:'radial',key:'spotSize',etiqueta:'Tamaño de manchas',min:40,max:180,angulo:()=>90,r0:R0*.3,r1:R0*1.05,visible:conTratamiento('spotted'),mostrar:porcentaje},
      {tipo:'dial',key:'grain',etiqueta:'Grano',min:0,max:70,paso:1,a0:56,a1:80,mostrar:porcentaje},
      {tipo:'dial',key:'porosity',etiqueta:'Porosidad',min:0,max:100,paso:1,a0:100,a1:124,mostrar:porcentaje},
    ],
  };

  // Dónde van los nombres (19/11/2026, igual en las tres ventanas):
  //  · diales: el nombre curvado por dentro del arco, en su centro; el valor por fuera, junto a la perilla (así no cae sobre
  //    la colonia, el recorte ni otras líneas);
  //  · grupos de opciones: el nombre curvado por fuera, en el centro del grupo;
  //  · líneas que salen del centro (y EXPANSIÓN): nombre y valor juntos en la punta, el valor del lado de afuera;
  //  · lo que se arrastra suelto (expansión, color medio, recorte): el nombre junto a su perilla.
  // Los pares de arcos van espejados respecto del eje vertical.
  const el=(tag,attrs,padre=svg)=>{const n=document.createElementNS(ns,tag);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,v);padre.appendChild(n);return n;};
  const arcoD=(a0,a1,r)=>{const [x0,y0]=pt(a0,r),[x1,y1]=pt(a1,r);return `M${x0},${y0}A${r},${r} 0 ${Math.abs(a1-a0)>180?1:0} 1 ${x1},${y1}`;};
  function texto(x,y,t,clase='tp-editor-texto',ancla='middle'){const n=el('text',{x,y,class:clase,'text-anchor':ancla,'dominant-baseline':'middle'});n.textContent=t;return n;}
  function tirador(x,y,id,parte='',activo=false){
    const g=el('g',{class:'tp-editor-tirador'+(activo?' tp-editor-tirador-activo':''),'data-control':id,'data-parte':parte});
    el('circle',{cx:x,cy:y,r:26,class:'tp-editor-toque'},g);el('circle',{cx:x,cy:y,r:11,class:'tp-editor-perilla'},g);return g;
  }
  // Nombre curvo: sigue la circunferencia de radio r, centrado en el ángulo a, y se lee siempre de izquierda a derecha.
  let nArco=0;
  function textoArco(a,r,t,clase='tp-editor-etiqueta'){
    const abajo=Math.sin(rad(a))>.05,span=70,id='tpEdArco'+(nArco++);
    const [x0,y0]=pt(abajo?a+span:a-span,r),[x1,y1]=pt(abajo?a-span:a+span,r);
    el('path',{id,d:`M${x0},${y0}A${r},${r} 0 0 ${abajo?0:1} ${x1},${y1}`,fill:'none',stroke:'none'});
    const n=el('text',{class:clase,'dominant-baseline':'middle'}),tp=document.createElementNS(ns,'textPath');
    tp.setAttribute('href','#'+id);tp.setAttribute('startOffset','50%');tp.setAttribute('text-anchor','middle');tp.textContent=t;n.appendChild(tp);return n;
  }
  const ladoEtiqueta=a=>{const c=Math.cos(rad(a));return c>.5?'start':c<-.5?'end':'middle';}; // 19/11: TAMAÑO DE MANCHAS centrado
  function boton(x,y,html,etiqueta,alTocar,presionado){
    const b=document.createElement('button');b.type='button';b.className='tp-editor-miniatura';b.setAttribute('aria-label',etiqueta);if(presionado!==undefined)b.setAttribute('aria-pressed',String(presionado));
    b.style.left=x+'px';b.style.top=y+'px';b.innerHTML=html;b.addEventListener('pointerdown',ev=>{ev.stopPropagation();alTocar();});
    b.addEventListener('keydown',ev=>{if(['Enter',' '].includes(ev.key)){ev.preventDefault();alTocar();}});opciones.appendChild(b);return b;
  }
  function elegir(cambio){empezar();cambiar(cambio);terminar();refrescarEstado();pedirPintura(false);dibujar();}
  function fondoMiniatura(op){
    const {c1,c2,c3}=estilo;
    return {radial:`radial-gradient(circle,${c1},${c2} 55%,${c3})`,linear:`linear-gradient(90deg,${c1},${c2},${c3})`,rings:`repeating-radial-gradient(circle,${c1} 0 3px,${c2} 3px 6px,${c3} 6px 9px)`,solid:c1,
      none:`radial-gradient(circle,${c1},${c2})`,zoned:`repeating-radial-gradient(circle,${c1} 0 4px,${c2} 4px 8px)`,rimmed:`radial-gradient(circle,${c1} 52%,${c3} 62%,${c2} 74%)`,
      spotted:`radial-gradient(circle at 34% 38%,${c3} 0 3px,transparent 4px),radial-gradient(circle at 66% 62%,${c3} 0 4px,transparent 5px),radial-gradient(circle at 62% 30%,${c3} 0 2px,transparent 3px),${c2}`,
      patchy:`conic-gradient(from 40deg,${c1},${c2},${c1} 30%,${c3},${c2} 70%,${c1})`}[op];
  }

  function dibujarGuias(){
    svg.replaceChildren();opciones.replaceChildren();nArco=0;
    controles[pestana].forEach((c,i)=>{
      if(c.visible&&!c.visible())return;
      const id=String(i),activo=arrastre?.id===id;
      if(c.tipo==='dial'){
        const v=valor(c.key),t=(v-c.min)/(c.max-c.min),a=c.a0+(c.a1-c.a0)*t;
        el('path',{d:arcoD(c.a0,c.a1,RD),class:'tp-editor-carril'});
        if(t>0)el('path',{d:arcoD(c.a0,a,RD),class:'tp-editor-lleno'});
        if(c.paso>=1&&c.max-c.min<=20)for(let n=0;n<=c.max-c.min;n++){const b=c.a0+(c.a1-c.a0)*n/(c.max-c.min),[x0,y0]=pt(b,RD-5),[x1,y1]=pt(b,RD+5);el('line',{x1:x0,y1:y0,x2:x1,y2:y1,class:'tp-editor-muesca'});}
        const toque=el('path',{d:arcoD(c.a0,c.a1,RD),class:'tp-editor-carril-toque','data-control':id});toque.dataset.parte='carril';
        textoArco((c.a0+c.a1)/2,RD-20,c.etiqueta.toUpperCase());
        const [x,y]=pt(a,RD);tirador(x,y,id,'',activo);const [vx,vy]=pt(a,RD+28);texto(vx,vy,c.mostrar(v),'tp-editor-valor');
      }else if(c.tipo==='radial'){
        const v=valor(c.key),a=c.angulo(),t=(v-c.min)/(c.max-c.min),r=c.r0+(c.r1-c.r0)*(c.invertido?1-t:t);
        const [x0,y0]=pt(a,c.r0),[x1,y1]=pt(a,c.r1),[x,y]=pt(a,r);
        el('line',{x1:x0,y1:y0,x2:x1,y2:y1,class:'tp-editor-carril'});
        if(c.key==='filaments')for(let n=-3;n<=3;n++){const b=a+n*5,[p0x,p0y]=pt(b,R0-4),[p1x,p1y]=pt(b,R0-4+(r-R0+4)*(1-Math.abs(n)*.18));el('line',{x1:p0x,y1:p0y,x2:p1x,y2:p1y,class:'tp-editor-lleno'});}
        if(c.key==='ringThickness')el('circle',{cx:C,cy:C,r:Math.max(1,R0*(1-v/100)),class:'tp-editor-borde-interior'});
        tirador(x,y,id,'',activo);const [lx,ly]=pt(a,c.r1+22),abajo=Math.sin(rad(a))>.3;texto(lx,ly,c.etiqueta.toUpperCase(),'tp-editor-etiqueta',ladoEtiqueta(a));
        texto(lx,ly+(abajo?20:-20),c.mostrar(v),'tp-editor-valor',ladoEtiqueta(a));
      }else if(c.tipo==='vector'){
        // Expansión (forma «abanico» del motor): la colonia crece hacia un lado. Distancia = cuánto, ángulo = hacia dónde.
        const e=valor('shape')==='fan'?valor('detail')||0:0,a=giroMarco(),r=R0+26+e/200*R0*.75,[x,y]=pt(a,r),[x0,y0]=pt(a,R0*.6);
        el('circle',{cx:C,cy:C,r:R0+26,class:'tp-editor-carril'});
        el('line',{x1:x0,y1:y0,x2:x,y2:y,class:'tp-editor-lleno'});
        const ux=Math.cos(rad(a)),uy=Math.sin(rad(a)),[ax,ay]=pt(a,r-16),bx=ax-ux*9-uy*6,by=ay-uy*9+ux*6,cx=ax-ux*9+uy*6,cy=ay-uy*9-ux*6;el('path',{d:`M${bx},${by}L${ax},${ay}L${cx},${cy}`,class:'tp-editor-lleno'});
        tirador(x,y,id,'',activo);if(activo||!e){const [lx,ly]=pt(a,r+30);texto(lx,ly,'EXPANSIÓN','tp-editor-etiqueta',ladoEtiqueta(a));if(e){texto(lx,ly+(Math.sin(rad(a))>.3?20:-20),c.mostrar(e),'tp-editor-valor',ladoEtiqueta(a));}}
      }else if(c.tipo==='corte'){
        // Recorte del motor (softCut): «Dirección del recorte» = dónde empieza, «Parte visible» = cuánto se ve.
        const rc=R0+122,a0=giroMarco()-90+(valor('cutAngle')||0),arc=valor('cutOpening');
        el('circle',{cx:C,cy:C,r:rc,class:'tp-editor-carril'});
        if(arc<360)el('path',{d:arcoD(a0,a0+arc,rc),class:'tp-editor-lleno'});else el('circle',{cx:C,cy:C,r:rc,class:'tp-editor-lleno'});
        const [x0,y0]=pt(a0,rc),[x1,y1]=pt(a0+arc-(arc>=360?8:0),rc);
        tirador(x0,y0,id,'inicio',activo&&arrastre.parte==='inicio');tirador(x1,y1,id,'fin',activo&&arrastre.parte==='fin');
        const af=a0+arc-(arc>=360?8:0);textoArco(af,rc+24,arc>=360?'RECORTE':'RECORTE · '+Math.round(arc)+'°');
      }else if(c.tipo==='medio'){
        const lineal=valor('gradient')==='linear',v=valor('midpoint'),a=lineal?valor('angle')+giroMarco():-40,r=v/100*R0,[x,y]=pt(a,r);
        if(lineal){const [p0x,p0y]=pt(a+180,R0),[p1x,p1y]=pt(a,R0);el('line',{x1:p0x,y1:p0y,x2:p1x,y2:p1y,class:'tp-editor-carril'});}
        else{const [p1x,p1y]=pt(a,R0);el('line',{x1:C,y1:C,x2:p1x,y2:p1y,class:'tp-editor-carril'});el('circle',{cx:C,cy:C,r:Math.max(1,r),class:'tp-editor-borde-interior'});}
        tirador(x,y,id,'',activo);const [lx,ly]=pt(a,r+24);texto(lx,ly,'COLOR MEDIO','tp-editor-etiqueta',ladoEtiqueta(a));
      }else if(c.tipo==='miniaturas'){
        const actual=valor(c.key)??'none';
        c.opciones.forEach(([op,nombre],n)=>{const [x,y]=pt(c.a0+n*c.paso,RD);
          const conVariante=c.key==='colorTreatment'&&['spotted','patchy'].includes(op);
          // 19/11/2026: sin botón VARIANTE; volver a tocar MANCHAS o PIGMENTOS ya elegidos genera otra variante (Paco).
          const b=boton(x,y,`<i style="background:${fondoMiniatura(op)}"></i><span>${nombre}</span>`,c.etiqueta+': '+nombre+(conVariante&&op===actual?' (tocar de nuevo para otra variante)':''),()=>{
            if(op!==valor(c.key))elegir({[c.key]:op});
            else if(conVariante){elegir({pigmentSeed:Math.floor(Math.random()*1000)});const i=opciones.querySelector(`[data-op="${op}"] i`);if(i&&!matchMedia('(prefers-reduced-motion: reduce)').matches)i.animate([{transform:'rotate(0)'},{transform:'rotate(360deg)'}],{duration:420,easing:'cubic-bezier(.3,.9,.3,1)'});}
          },op===actual);b.dataset.op=op;});
        textoArco(c.a0+(c.opciones.length-1)*c.paso/2,RD+40,c.etiqueta.toUpperCase());
      }
    });
  }

  // Vista previa grande: el mismo sprite del motor que se dibuja en la placa, con menos resolución mientras se arrastra.
  function pintar(rapido){
    const viejos=[...caja.querySelectorAll('canvas')],nuevo=document.createElement('canvas');
    // Con una expansión grande el lienzo del motor crece (factor > 1): la caja crece igual para que la colonia no cambie de tamaño ni se corte.
    const factor=MotorMuestrario.pintar(nuevo,{...estilo,opacity:100},rapido?160:340)||1;
    const {rot,foco,opacidad,radio}=estado,L=400*R0/estilo.size*factor;
    caja.style.width=caja.style.height=L+'px';caja.style.left=caja.style.top=(C-L/2)+'px';caja.style.transform=`rotate(${rot}deg)`;
    caja.style.opacity=opacidad/100;caja.style.filter=`blur(${((100-foco)*.06*R0/Math.max(1,radio)).toFixed(2)}px)`;
    caja.appendChild(nuevo);for(const v of viejos)v.remove();
  }
  function pedirPintura(rapido){cancelAnimationFrame(pedido);pedido=requestAnimationFrame(()=>pintar(rapido));}
  function refrescarEstado(){estado=base();estilo=MotorMuestrario.estiloColonia(estado.fuente,estado.ajustes||{},estado.familia);}
  function dibujar(){
    if(!estado)return;
    for(const b of tabs.children){const si=b.dataset.pestana===pestana;b.setAttribute('aria-selected',String(si));b.tabIndex=si?0:-1;}
    dibujarGuias();
  }

  function puntoDe(ev){const r=svg.getBoundingClientRect();return {x:(ev.clientX-r.left)*784/r.width,y:(ev.clientY-r.top)*784/r.height};}
  function aplicar(ev){
    const c=controles[pestana][Number(arrastre.id)],p=puntoDe(ev),dx=p.x-C,dy=p.y-C,a=Math.atan2(dy,dx)*180/Math.PI,d=Math.hypot(dx,dy),cambio={};
    if(c.tipo==='dial'){const m=(c.a0+c.a1)/2,ancho=c.a1-c.a0,t=clamp((norm(a-m)+ancho/2)/ancho,0,1);cambio[c.key]=Math.round((c.min+t*(c.max-c.min))/c.paso)*c.paso;}
    else if(c.tipo==='radial'){const proy=dx*Math.cos(rad(c.angulo()))+dy*Math.sin(rad(c.angulo()));let t=clamp((proy-c.r0)/(c.r1-c.r0),0,1);if(c.invertido)t=1-t;cambio[c.key]=Math.round(c.min+t*(c.max-c.min));}
    else if(c.tipo==='vector'){cambio.detail=Math.round(clamp((d-R0-26)/(R0*.75)*200,0,200));cambio.rotation=Math.round(norm(a-estado.rot));}
    else if(c.tipo==='corte'){
      if(arrastre.parte==='inicio')cambio.cutAngle=Math.round(norm(a-giroMarco()+90));
      else{const a0=giroMarco()-90+(valor('cutAngle')||0);let arc=((a-a0)%360+360)%360;if(arc<12||arc>350)arc=360;cambio.cutOpening=Math.round(clamp(arc,15,360));}
    }
    else if(c.tipo==='medio'){const lineal=valor('gradient')==='linear';if(lineal){cambio.angle=Math.round(norm(a-giroMarco()));cambio.midpoint=Math.round(clamp(d/R0*100,10,90));}
      else{const proy=dx*Math.cos(rad(-40))+dy*Math.sin(rad(-40));cambio.midpoint=Math.round(clamp(proy/R0*100,10,90));}}
    const real=Object.fromEntries(Object.entries(cambio).filter(([k,v])=>valor(k)!==v));
    if(Object.keys(real).length){cambiar(real);refrescarEstado();pedirPintura(true);}
    dibujar();
  }
  svg.addEventListener('pointerdown',ev=>{
    const blanco=ev.target.closest('[data-control]');if(!blanco)return;ev.preventDefault();ev.stopPropagation();
    arrastre={id:blanco.dataset.control,parte:blanco.dataset.parte||''};
    if(arrastre.parte==='carril')arrastre.parte='';
    empezar();host.setPointerCapture?.(ev.pointerId);aplicar(ev);
  });
  host.addEventListener('pointermove',ev=>{if(arrastre)aplicar(ev);});
  function soltar(){if(!arrastre)return;arrastre=null;terminar();refrescarEstado();pedirPintura(false);dibujar();}
  host.addEventListener('pointerup',soltar);host.addEventListener('pointercancel',soltar);
  host.addEventListener('pointerdown',ev=>ev.stopPropagation());
  host.addEventListener('keydown',ev=>{if(ev.key==='Escape'){ev.stopPropagation();cerrar();}});
  function cerrar(){if(host.hidden)return;host.hidden=true;arrastre=null;estado=null;estilo=null;alCerrar();}
  return {
    abrir(){pestana='forma';refrescarEstado();host.hidden=false;pintar(false);dibujar();tabs.querySelector('[aria-selected="true"]')?.focus({preventScroll:true});},
    cerrar,abierto:()=>!host.hidden,
  };
}
