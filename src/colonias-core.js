function mountColonias(canvas, options = {}) {
 const scene=structuredClone(options.recipe),items=scene.items,paper=scene.paper;
 const ratio=()=>scene.customRatio,cache=new Map(),textMeasure=document.createElement('canvas').getContext('2d');
 const fontFamilies=["Clamofte","Sentient","Arial","Verdana","Trebuchet MS","Georgia","Times New Roman","Courier New"];
 let state={},inlineEditingId=null;const active=()=>null;
 const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x)},rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
 function hash(x,y,seed){let h=Math.imul(x,374761393)^Math.imul(y,668265263)^Math.imul(seed,1274126177);h=Math.imul(h^(h>>>13),1274126177);return ((h^(h>>>16))>>>0)/4294967295}
function noiseField(x,y,seed){const ix=Math.floor(x),iy=Math.floor(y),u=smooth(x-ix),v=smooth(y-iy);return (hash(ix,iy,seed)*(1-u)+hash(ix+1,iy,seed)*u)*(1-v)+(hash(ix,iy+1,seed)*(1-u)+hash(ix+1,iy+1,seed)*u)*v}
function render(target,n,padding=0){
 const full=n+padding*2,out=target.getContext('2d');target.width=target.height=full;
 out.clearRect(0,0,full,full);if(!state.transparent){out.fillStyle=state.background;out.fillRect(0,0,full,full)}
 const colors=[rgb(state.c1),rgb(state.c2),rgb(state.c3)],rot=state.rotation*Math.PI/180,ang=state.angle*Math.PI/180,scale=n/760;
 function element(cx,cy,r,aspect=1,phase=0,palette=colors){
  cx+=padding;cy+=padding;const layer=document.createElement('canvas');layer.width=layer.height=full;
  // willReadFrequently: las capas intermedias se leen y escriben píxel a píxel; en memoria de CPU es mucho más rápido que en GPU.
  const lc=layer.getContext('2d',{willReadFrequently:true}),im=lc.createImageData(full,full),data=im.data;
  const bound=r*Math.max(1,aspect)+n*(state.halo/100*.5+state.blur/760*3)+4;
  const x0=Math.max(0,Math.floor(cx-bound)),x1=Math.min(full,Math.ceil(cx+bound)),y0=Math.max(0,Math.floor(cy-bound)),y1=Math.min(full,Math.ceil(cy+bound));
  for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){
   const dx=(x-cx)/r,dy=(y-cy)/r,xx=dx*Math.cos(rot)+dy*Math.sin(rot),yy=-dx*Math.sin(rot)+dy*Math.cos(rot),theta=Math.atan2(yy,xx);
   let d=aspect>1?Math.hypot(Math.max(Math.abs(xx)-(aspect-1),0),yy):Math.hypot(xx,yy);
   const irregular=(Math.sin(theta*7+phase+state.seed)+.46*Math.sin(theta*13+phase)+.23*Math.sin(theta*29))*state.irregularity/100*.10;
   d/=1+irregular;
   // [parche Micromundos] asimetría suave para bordes irregulares (asym=0 deja el borde original)
   if(state.asym)d/=1+(Math.sin(theta*2+state.seed*.37)*.6+Math.sin(theta*3+state.seed*.71)*.4)*state.asym*.07;
   // [parche Micromundos] festón regular (studyLobes de la versión actual de Colonias)
   if(state.studyLobes>0){const L=Math.round(state.studyLobes),k=(theta+Math.PI)/(2*Math.PI)*L,li=Math.floor(k)%L,f=k-Math.floor(k),amp=1-(state.studyUneven??0)/100*.75*hash(li,3,state.seed);d/=1+(state.studyDepth??25)/100*.2*(Math.sin(Math.PI*f)*amp-.6)}
   let alpha=1-smooth((d-.985)/.03);
   if(d>1)alpha+=state.halo/100*.25*Math.exp(-(d-1)*16/(.2+state.halo/100));
   if(state.shape==='ring'||state.shape==='arc')alpha*=smooth((d-(1-state.ringWidth/100))/.014);
   if(state.shape==='arc'||state.shape==='fragment'){
    const angle=((theta*180/Math.PI+360)%360),end=state.arc;
    alpha*=end>=360?1:1-smooth((angle-end+1.5)/3);
   }
   // Rayos que atraviesan el cuerpo, con distintas longitudes y una envolvente suave.
   if(state.filaments>0&&d<1.12){const rays=Math.pow(.5+.5*Math.sin(theta*103+Math.sin(theta*17)*2+d*7),12);const amount=state.filaments/100*smooth((d-.14)/.6);alpha*=1-amount+amount*(.10+.9*rays)}
   if(alpha<.001)continue;
   let t=state.gradient==='linear'?clamp((xx*Math.cos(ang)+yy*Math.sin(ang)+aspect)/(2*aspect)):clamp(Math.hypot(xx-state.offset/100,yy));
   if(state.gradient==='rings')t=clamp(.5+.5*Math.sin(t*(state.ringFreq||9)-1));
   const mid=state.midpoint/100,idx=t<mid?0:1,u=smooth(idx===0?t/mid:(t-mid)/(1-mid)),i=(y*full+x)*4;
   for(let k=0;k<3;k++)data[i+k]=palette[idx][k]*(1-u)+palette[idx+1][k]*u;
   data[i+3]=clamp(alpha)*255;
  }
  lc.putImageData(im,0,0);let finished=layer;
  if(state.blur){finished=document.createElement('canvas');finished.width=finished.height=full;const bc=finished.getContext('2d',{willReadFrequently:true});bc.filter=`blur(${state.blur*scale*(window.MicromundosAjustes?.valor('colonias')??1)}px)`;bc.drawImage(layer,0,0);bc.filter='none'}
  if(state.grain||state.porosity||state.blur&&state.core){
   const fc=finished.getContext('2d'),pixels=fc.getImageData(0,0,full,full),rgba=pixels.data;
   for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){
    const i=(y*full+x)*4;
    if(state.blur&&state.core){const radius=Math.hypot(x-cx,y-cy)/r,src=data[i+3]/255*state.core/100*(1-smooth((radius-.1)/.36)),dst=rgba[i+3]/255,alpha=src+dst*(1-src);if(alpha>0){for(let k=0;k<3;k++)rgba[i+k]=(data[i+k]*src+rgba[i+k]*dst*(1-src))/alpha;rgba[i+3]=alpha*255}}
    if(!rgba[i+3])continue;
    const gx=Math.floor((x-padding)/Math.max(.5,state.grainSize*scale)),gy=Math.floor((y-padding)/Math.max(.5,state.grainSize*scale));
    const fine=hash(gx,gy,state.seed),grain=(fine-.5)*state.grain*(window.MicromundosAjustes?.valor('grano-colonias')??1)/100*175;
    for(let k=0;k<3;k++)rgba[i+k]=clamp(rgba[i+k]+grain,0,255);
    if(state.porosity){const cell=Math.max(2,scale*22),patch=noiseField((x-padding)/cell,(y-padding)/cell,state.seed+91);const coverage=clamp((fine-.25)*1.8)*(.25+patch*.9),p=state.porosity/100;rgba[i+3]*=(1-p)+p*coverage}
   }
   fc.putImageData(pixels,0,0);
  }
  out.save();out.globalAlpha=state.opacity/100;out.globalCompositeOperation=state.blend;out.drawImage(finished,0,0);out.restore();
 }
 const r=n*state.size/200;
 if(state.shape==='pair'){const sep=r*state.separation/100*1.8;element(n/2-sep/2,n/2,r*.7);element(n/2+sep/2,n/2,r*.7,1,2,[colors[2],colors[2],colors[0]])}
 else if(state.shape==='band'){for(let i=0;i<19;i++)element(n*(.04+i*.051),n*(.5+(hash(i,12,state.seed)-.5)*.10),r*(.08+hash(i,7,state.seed)*.24),i%5===0?1.7:1,i,[colors[i%3],colors[(i+1)%3],colors[(i+2)%3]])}
 else {const aspect=1+state.elongation/50,fit=padding?1:Math.max(1,state.size/100*.53*aspect);element(n/2,n/2,state.shape==='capsule'?r*.53/fit:r,state.shape==='capsule'?aspect:1);}
}
function fontStack(i){return `"${fontFamilies.includes(i.fontFamily)?i.fontFamily:'Clamofte'}", Arial, sans-serif`}
function textWidth(i){textMeasure.font=`normal ${i.fontSize}px ${fontStack(i)}`;const metrics=textMeasure.measureText?.(i.text||'');const width=metrics?Math.max(metrics.width,(metrics.actualBoundingBoxLeft||0)+(metrics.actualBoundingBoxRight||0)):(i.text||'').length*i.fontSize*.53;return Math.max(4,width+(i.container?i.fontSize*(i.containerPadding??45)/50:4))}
function texturePaddingFraction(i){const s=i.style,size=(s.size??70)/200;let reach=1;if(s.shape==='capsule')reach=1+(s.elongation??0)/50;else if(s.shape==='pair')reach=.7+.9*(s.separation??50)/100;else if(s.shape==='band')reach=.5;return Math.max(0,size*reach-.5)+(s.halo??0)/200+(s.blur??10)*3/760+4/64}
function sprite(item,res){const key=JSON.stringify([item.style,res]);if(cache.has(key))return cache.get(key);const old=state;state={...item.style,transparent:true,opacity:100,blend:'source-over'};const c=document.createElement('canvas');const pad=Math.ceil(res*texturePaddingFraction(item));c.texturePadding=pad;try{singleRender(c,res,pad)}finally{state=old}if(cache.size>350)cache.clear();cache.set(key,c);return c;}
function bounds(i,w,h){const width=i.type==='text'?textWidth(i)*w/760:i.w*w,height=i.type==='text'?(i.fontSize*1.25+8)*w/760:i.w*w;return{x:i.x*w-width/2,y:i.y*h-height/2,w:width,h:height}}
function paintScene(target,width,guide=false,progress=1){const h=Math.round(width*ratio()),c=target.getContext('2d');target.width=width;target.height=h;if(!paper.transparent){c.fillStyle=paper.background;c.fillRect(0,0,width,h)}const step=.82/Math.max(1,items.length);for(const [index,item]of items.entries()){const phase=clamp((progress-index*step)/.18,0,1);if(phase<=0)continue;const growth=.04+.96*(phase*phase*(3-2*phase));let b=bounds(item,width,h);c.save();c.globalAlpha*=phase;c.translate(item.x*width,item.y*h);c.scale(growth,growth);c.translate(-item.x*width,-item.y*h);if(item.type==='shape'){c.globalAlpha*=item.style.opacity/100;c.globalCompositeOperation=item.style.blend;const res=Math.max(64,Math.ceil(b.w));const image=sprite(item,res),pad=(image.texturePadding||0)*b.w/res;c.drawImage(image,b.x-pad,b.y-pad,b.w+pad*2,b.h+pad*2)}else{if(item.container){c.fillStyle=item.containerColor??'#202c2e';c.globalAlpha=(item.containerOpacity??88)/100*phase;c.filter='blur('+((item.containerBlur??0)*width/760)+'px)';c.beginPath();c.roundRect(b.x,b.y,b.w,b.h,b.h/2*(item.containerRadius??100)/100);c.fill();c.filter='none'}c.globalAlpha=(item.opacity??100)/100*phase;c.filter='blur('+((item.blur??0)*width/760)+'px)';const px=item.fontSize*width/760;c.font=`normal ${px}px ${fontStack(item)}`;c.fillStyle=item.container?(item.textColor??'#fffbee'):'#202c2e';c.textAlign='center';c.textBaseline='middle';if(!guide||item.id!==inlineEditingId)c.fillText(item.text,item.x*width,item.y*h)}c.restore()}
 if(guide&&active()){const b=bounds(active(),width,h);c.save();c.strokeStyle='#668947';c.lineWidth=1;c.setLineDash([4,5]);c.strokeRect(b.x,b.y,b.w,b.h);c.restore()}}
 const singleRender=render;
 let progress=1,playing=false,raf=0,destroyed=false;
 canvas.style.width='100%';canvas.style.height='auto';canvas.style.aspectRatio=String(1/ratio());
 // Dibujar es caro (cada píxel se calcula en CPU): no se repite si el tamaño y el progreso no cambiaron.
 // Antes cada obra se dibujaba 3 veces al montarse (directo, ResizeObserver y fonts.ready).
 let dibujadoAncho=0,dibujadoProgreso=-1;
 function draw(forzar=false){if(destroyed)return;const width=Math.max(64,Math.min(options.maxResolution||1600,Math.round(canvas.getBoundingClientRect().width*(devicePixelRatio||1))));if(!forzar&&width===dibujadoAncho&&progress===dibujadoProgreso)return;dibujadoAncho=width;dibujadoProgreso=progress;paintScene(canvas,width,false,progress)}
 function setProgress(value){progress=clamp(Number(value)||0);draw()}
 function pause(){playing=false;cancelAnimationFrame(raf)}
 function play({duration=9000,loop=false}={}){pause();playing=true;const start=performance.now();function tick(now){if(!playing||destroyed)return;const t=(now-start)/Math.max(100,duration);setProgress(loop?t%1:Math.min(1,t));if(t<1||loop)raf=requestAnimationFrame(tick);else playing=false}raf=requestAnimationFrame(tick)}
 function hit(event){const rect=canvas.getBoundingClientRect(),x=(event.clientX-rect.left)/rect.width*canvas.width,y=(event.clientY-rect.top)/rect.height*canvas.height;for(let n=items.length-1;n>=0;n--){const item=items[n],phase=clamp((progress-n*.82/Math.max(1,items.length))/.18),growth=.04+.96*(phase*phase*(3-2*phase));if(!phase)continue;const b=bounds(item,canvas.width,canvas.height),px=(x-item.x*canvas.width)/growth+b.w/2,py=(y-item.y*canvas.height)/growth+b.h/2;if(item.type==='text'){if(px>=0&&py>=0&&px<=b.w&&py<=b.h)return item;continue}if(item.style.opacity<=0)continue;const res=Math.max(64,Math.ceil(b.w)),image=sprite(item,res),pad=image.texturePadding||0,ix=Math.floor(px/b.w*res)+pad,iy=Math.floor(py/b.h*res)+pad;if(ix>=0&&iy>=0&&ix<image.width&&iy<image.height&&image.getContext('2d').getImageData(ix,iy,1,1).data[3]>10)return item}return null}
 const click=event=>options.onClick?.(hit(event),event);
 canvas.addEventListener('click',click);
 const observer=new ResizeObserver(()=>draw());observer.observe(canvas);draw();
 // Las fuentes sólo cambian el resultado si la obra tiene texto.
 if(items.some(i=>i.type==='text'))document.fonts?.ready.then(()=>draw(true));
 return {setProgress,play,pause,draw,getRecipe:()=>structuredClone(scene),destroy(){destroyed=true;pause();observer.disconnect();canvas.removeEventListener('click',click)}};
}
