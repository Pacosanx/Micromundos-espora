// Fondo en dos planos. Los filtros se componen una vez, antes de mover sus superficies.
// Figma expresa el diámetro del blur; canvas/CSS utiliza su desviación (la mitad).
function prepararFondoUniverso(raiz,id){
  const datos=FONDOS_UNIVERSOS[id];if(!datos)return ()=>{};
  for(const nodo of datos.nodos)raiz.querySelector(`[data-node-id="${nodo}"]`)?.remove();
  const grupo=document.createElement('div');grupo.className='detalle-fondos';grupo.setAttribute('aria-hidden','true');
  const atras=document.createElement('div');atras.className='detalle-fondo-atras';atras.dataset.velocidad='.32';
  const imagen=document.createElement('img');imagen.src='src/assets/detalles/'+datos.fondo;imagen.alt='';atras.appendChild(imagen);grupo.appendChild(atras);
  const oscuro=document.createElement('canvas'),claro=document.createElement('canvas');
  for(const [canvas,mezcla]of [[oscuro,'darken'],[claro,'lighten']]){
    canvas.className='detalle-fondo-adelante';canvas.dataset.velocidad='.72';canvas.style.mixBlendMode=mezcla;grupo.appendChild(canvas);
  }
  raiz.prepend(grupo);
  let vigente=true;const escalaFondo=.5,ancho=1920,alto=3500;
  const lienzo=(w=ancho,h=alto)=>{const c=document.createElement('canvas');c.width=Math.round(w*escalaFondo);c.height=Math.round(h*escalaFondo);return c;};
  const cargar=nombre=>new Promise((resolve,reject)=>{
    const img=document.createElement('img');img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('No se pudo cargar '+nombre));img.src='src/assets/detalles/'+nombre;
  });
  function cubrir(ctx,img,w,h,invertir=false){
    const factor=Math.max(w/img.naturalWidth,h/img.naturalHeight),sw=w/factor,sh=h/factor;
    ctx.save();if(invertir){ctx.translate(0,h);ctx.scale(1,-1);}
    ctx.drawImage(img,(img.naturalWidth-sw)/2,(img.naturalHeight-sh)/2,sw,sh,0,0,w,h);ctx.restore();
  }
  // Pesos triangulares suman uno: ningún salto de brillo entre bandas de desenfoque.
  function progresivo(origen,puntos,eje){
    const salida=lienzo(origen.width/escalaFondo,origen.height/escalaFondo),ctx=salida.getContext('2d');
    const copia=lienzo(origen.width/escalaFondo,origen.height/escalaFondo),c=copia.getContext('2d');
    const largo=eje==='x'?salida.width:salida.height;
    puntos.forEach(([pos,radio],i)=>{
      c.clearRect(0,0,copia.width,copia.height);c.globalCompositeOperation='source-over';c.filter=`blur(${radio*escalaFondo*(window.MicromundosAjustes?.valor('fondo')??1)}px)`;c.drawImage(origen,0,0);c.filter='none';
      const grad=c.createLinearGradient(0,0,eje==='x'?largo:0,eje==='y'?largo:0);
      if(i===0){grad.addColorStop(0,'white');grad.addColorStop(pos,'white');}else{grad.addColorStop(0,'transparent');grad.addColorStop(puntos[i-1][0],'transparent');grad.addColorStop(pos,'white');}
      if(i===puntos.length-1){grad.addColorStop(1,'white');}else{grad.addColorStop(puntos[i+1][0],'transparent');grad.addColorStop(1,'transparent');}
      c.globalCompositeOperation='destination-in';c.fillStyle=grad;c.fillRect(0,0,copia.width,copia.height);
      ctx.globalCompositeOperation='lighter';ctx.drawImage(copia,0,0);
    });
    copia.width=copia.height=1;return salida;
  }
  function celulas(img,{gradiente=false,radios=[[.71481484,1.5],[.85740742,3.25],[1,5]],invertir=false,mascara=false}={}){
    const c=lienzo(1920,1080),ctx=c.getContext('2d');cubrir(ctx,img,c.width,c.height,invertir);
    if(gradiente){const g=ctx.createLinearGradient(0,0,0,c.height*1.5972);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(1,'white');ctx.fillStyle=g;ctx.fillRect(0,0,c.width,c.height);}
    let filtrada=progresivo(c,radios,'y');c.width=c.height=1;
    if(mascara){
      // La máscara rectangular difuminada del diseño se conserva como alfa, nunca como una capa gris visible.
      const m=lienzo(1920,1080),mctx=m.getContext('2d');mctx.filter=`blur(${50*escalaFondo}px)`;mctx.fillStyle='white';mctx.fillRect(-881*escalaFondo,19*escalaFondo,3682*escalaFondo,1041*escalaFondo);
      const f=filtrada.getContext('2d');f.globalCompositeOperation='destination-in';f.drawImage(m,0,0);m.width=m.height=1;
    }
    return filtrada;
  }
  Promise.all([datos.oscuro,datos.cercano,datos.medio,datos.lejano].map(cargar)).then(([imgOscuro,imgCerca,imgMedio,imgLejos])=>{
    if(!vigente)return;
    const baseOscura=celulas(imgOscuro,{gradiente:true});oscuro.width=baseOscura.width;oscuro.height=baseOscura.height;oscuro.style.height='1080px';oscuro.getContext('2d').drawImage(baseOscura,0,0);baseOscura.width=baseOscura.height=1;
    let composicion=lienzo();const ctx=composicion.getContext('2d');
    for(const [img,y,opciones]of [[imgCerca,0,{}],[imgMedio,951,{radios:[[0,5],[.25,16.25],[.5,27.5],[.75,38.75],[1,50]],mascara:true}],[imgLejos,1908,{radios:[[0,200],[1,200]],mascara:true,invertir:true}]]){
      const capa=celulas(img,opciones);ctx.drawImage(capa,0,y*escalaFondo);capa.width=capa.height=1;
    }
    const vertical=progresivo(composicion,[[0,2],[551/alto,2],[2676/alto,0],[1,0]],'y');composicion.width=composicion.height=1;
    composicion=progresivo(vertical,[[0,10],[.25,5],[.5,0],[.75,5],[1,10]],'x');vertical.width=vertical.height=1;
    claro.width=composicion.width;claro.height=composicion.height;claro.style.height=alto+'px';claro.getContext('2d').drawImage(composicion,0,0);composicion.width=composicion.height=1;
    grupo.dataset.listo='true';
  }).catch(error=>{if(vigente){grupo.dataset.error='true';console.error(error);}});
  return ()=>{vigente=false;oscuro.width=oscuro.height=claro.width=claro.height=1;grupo.remove();};
}
