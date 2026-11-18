// Motor de colonias y de encuentros de TU PLACA (18/11/2026).
// Es el código del "Muestrario de posibilidades" (127.0.0.1:8765), copiado tal cual dentro de este módulo:
//   muestrario.js (líneas 3-9: utilidades, BASE, FAMILIES; sprite y dot), renderer-muestra.js (render completo),
//   reacciones.js (softCut, frentes de reacción), simbiosis-originales.js (grupos que se unen),
//   placa-encuentros.js (siluetas, contactos, fusión, frentes, pigmentos).
// Cambios para TU PLACA, todos marcados con [TU PLACA]: la escena mide lo que mide la placa (RW×RH variables),
// el sprite se dibuja a la resolución que hace falta, y la colonia se gira/desenfoca al dibujarla (menú contextual).
const MotorMuestrario=(()=>{
'use strict';
let RW=784,RH=784;const RCY=392; // [TU PLACA] en el muestrario: const RW=400,RH=276,RCY=138
// ───────── muestrario.js, líneas 3-9 ─────────
let state={};
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const smooth=v=>{v=clamp(v);return v*v*(3-2*v)};
const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
function hash(x,y,seed){let h=Math.imul(x,374761393)^Math.imul(y,668265263)^Math.imul(seed,1274126177);h=Math.imul(h^(h>>>13),1274126177);return ((h^(h>>>16))>>>0)/4294967295}
const BASE={shape:'disk',gradient:'radial',size:65,elongation:65,separation:48,irregularity:8,studyLobes:0,studyDepth:35,studyUneven:35,studyDensity:0,filaments:0,filamentCount:103,filamentSpacing:20,filamentWidth:50,detail:55,zones:4,focusCount:1,focusSpread:45,focusSize:24,focusX:0,focusY:0,featureX:0,featureY:0,featureSize:100,branchSpread:100,branchLength:100,branchDensity:7,branchForks:4,foldBreak:0,foldWidth:100,edgeSoft:0,edgeBlur:0,coreBlur:0,coreRadius:36,grainCenter:0,rotation:0,angle:0,midpoint:55,offset:0,blur:10,halo:14,grain:22,grainSize:1,porosity:0,core:35,ringWidth:5,arc:360,opacity:100,blend:'source-over',c1:'#ff4c52',c2:'#f58bc3',c3:'#ffc21c',background:'#fffbee',transparent:true,seed:125,fiberWeight:100};
const FAMILIES={rosa:['#ff4c52','#f58bc3','#f06779'],amarillo:['#ff9c20','#ffc21c','#efcc6d'],verde:['#27633f','#6a983a','#dce642']};
// ───────── renderer-muestra.js ─────────
function noiseField(x,y,seed){const ix=Math.floor(x),iy=Math.floor(y),u=smooth(x-ix),v=smooth(y-iy);return (hash(ix,iy,seed)*(1-u)+hash(ix+1,iy,seed)*u)*(1-v)+(hash(ix,iy+1,seed)*(1-u)+hash(ix+1,iy+1,seed)*u)*v}
function colonyContour(style,phase=0){
 const figurative=['smoothcol','wrinkled','zoned','cotton','hairy','rimmed','spotted','branching','granular','fan','patchy'].includes(style.shape);
 const irregularity=style.studyLobes&&!figurative?0:style.irregularity/100*.10;
 const depth=style.studyLobes?style.studyDepth/100*.22:0;
 const uneven=style.studyUneven/100, expansion=style.shape==='fan'?(style.detail??70)/100*.65:0;
 return theta=>{
  const irregular=irregularity
   ? (Math.sin(theta*7+phase+style.seed)+.46*Math.sin(theta*13+phase)+.23*Math.sin(theta*29))*irregularity
   : 0;
  const lobes=depth
   ? depth*(Math.cos(theta*style.studyLobes)+uneven*(.65*Math.sin(theta*(style.studyLobes-1)+style.seed)+.35*Math.sin(theta*(style.studyLobes+2)+style.seed*.7)))
   : 0;
  const stretch=expansion?Math.max(0,Math.cos(theta))**2*expansion:0;
  return (1+irregular+lobes)*(1+stretch);
 };
}
function render(target,n,padding=0){
 const full=n+padding*2,out=target.getContext('2d');target.width=target.height=full;
 out.clearRect(0,0,full,full);if(!state.transparent){out.fillStyle=state.background;out.fillRect(0,0,full,full)}
 const colors=[rgb(state.c1),rgb(state.c2),rgb(state.c3)],rot=state.rotation*Math.PI/180,ang=state.angle*Math.PI/180,scale=n/760;
 const independentColor=state.colorTreatment!==undefined;
 const pigment=state.colorTreatment??state.shape;
 const pigmentStrength=independentColor?state.pigmentIntensity/100:(state.detail??55)/100;
 const pigmentSeed=independentColor?state.pigmentSeed:state.seed;
 function element(cx,cy,r,aspect=1,phase=0,palette=colors){
  cx+=padding;cy+=padding;const layer=document.createElement('canvas');layer.width=layer.height=full;
  const focusCount=Math.max(1,Math.min(6,Math.round(state.focusCount??1))),focusSpread=(state.focusSpread??45)/100,focusX=(state.focusX??0)/100,focusY=(state.focusY??0)/100,focusSize=(state.focusSize??24)/100;
  const foci=Array.from({length:focusCount},(_,k)=>{const a=k*2.399963+state.seed*.013,dist=k===0?0:focusSpread*(.7+.3*hash(k,73,state.seed));return{x:focusX+Math.cos(a)*dist,y:focusY+Math.sin(a)*dist}});
  const lc=layer.getContext('2d',{willReadFrequently:true}),im=lc.createImageData(full,full),data=im.data;
  const reach=state.shape==='fan'?1+(state.detail??70)/100*.65:['cotton','hairy','branching'].includes(state.shape)?1.7:1;
  const contour=colonyContour(state,phase);
  const bound=r*Math.max(reach,aspect)+n*(state.halo/100*.5+Math.max(state.blur,state.edgeBlur??0)/760*3)+4;
  const x0=Math.max(0,Math.floor(cx-bound)),x1=Math.min(full,Math.ceil(cx+bound)),y0=Math.max(0,Math.floor(cy-bound)),y1=Math.min(full,Math.ceil(cy+bound));
  for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){
   const dx=(x-cx)/r,dy=(y-cy)/r,xx=dx*Math.cos(rot)+dy*Math.sin(rot),yy=-dx*Math.sin(rot)+dy*Math.cos(rot),theta=Math.atan2(yy,xx);
   let d=aspect>1?Math.hypot(Math.max(Math.abs(xx)-(aspect-1),0),yy):Math.hypot(xx,yy);
   d/=contour(theta);
   if(state.asym)d/=1+(Math.sin(theta*2+state.seed*.37)*.6+Math.sin(theta*3+state.seed*.71)*.4)*state.asym*.07; // [TU PLACA] asimetría de la biblioteca (estado «En conservación»), igual que en colonias-core
   const edgeWidth=.03+(state.edgeSoft??0)/100*.25;
   let alpha=1-smooth((d-(.985-(state.edgeSoft??0)/100*.125))/edgeWidth);
   if(d>1)alpha+=state.halo/100*.25*Math.exp(-(d-1)*16/(.2+state.halo/100));
   const detail=(state.detail??55)/100,zones=state.zones??4;
   if(state.shape==='cotton'||state.shape==='hairy'){
    const patch=noiseField(x/(18*scale+1),y/(18*scale+1),state.seed+191);
    const fil=Math.pow(.5+.5*Math.sin(theta*97+Math.sin(theta*13)*2+d*8),12);
    const soft=(state.edgeSoft??0)/100;alpha=Math.exp(-d*d*(state.shape==='hairy'?1.15:1.75))*(1-smooth((d-(1.04-soft*.1))/(.24+soft*.3)))*(.4+.45*patch+detail*.28*fil);
   }
   if(state.shape==='branching'){
    const soft=(state.edgeSoft??0)/100;alpha=.24*Math.exp(-d*d*3.6)*(1-smooth((d-(1.08-soft*.1))/(.2+soft*.3)));
   }
   if(state.shape==='ring'||state.shape==='arc')alpha*=smooth((d-(1-state.ringWidth/100))/.014);
   if(state.shape==='arc'||state.shape==='fragment'){
    const angle=((theta*180/Math.PI+360)%360),end=state.arc;
    alpha*=end>=360?1:1-smooth((angle-end+1.5)/3);
   }
   // Rayos que atraviesan el cuerpo, con distintas longitudes y una envolvente suave.
   if(state.filaments>0&&d<1.12&&!['cotton','hairy','branching'].includes(state.shape)){const count=state.filamentCount??103,spacing=(state.filamentSpacing??20)/100,width=(state.filamentWidth??50)/100;const rays=Math.pow(.5+.5*Math.sin(theta*count+Math.sin(theta*17)*spacing*10+d*7),30-26*width);const amount=state.filaments/100*smooth((d-.14)/.6);alpha*=1-amount+amount*(.10+.9*rays)}
   if(alpha<.001)continue;
   let t=state.gradient==='solid'?0:state.gradient==='linear'?clamp((xx*Math.cos(ang)+yy*Math.sin(ang)+aspect)/(2*aspect)):clamp(Math.hypot(xx-state.offset/100,yy));
   if(state.shape==='cotton'&&(focusCount>1||focusX||focusY)){let nearest=Infinity;for(const focus of foci)nearest=Math.min(nearest,Math.hypot(xx-focus.x,yy-focus.y));t=clamp(nearest/Math.max(.05,focusSize)*.55)}
   if(state.gradient==='rings')t=clamp(.5+.5*Math.sin(t*9-1));
   const featureX=(state.featureX??0)/100,featureY=(state.featureY??0)/100,featureScale=(state.featureSize??100)/100,featureD=featureX||featureY?Math.hypot(xx-featureX,yy-featureY):d;
   if(pigment==='zoned'){
    const wave=featureD/featureScale+.025*Math.sin(theta*5+state.seed)+.025*Math.sin(theta*9+d*4);
    const rings=.5+.5*Math.cos(wave*(independentColor?state.zoneCount:zones)*Math.PI*2);
    t=clamp((independentColor?t:d)*(1-pigmentStrength)+rings*pigmentStrength);
   }
   if(!independentColor&&pigment==='rimmed'){const rim=Math.exp(-Math.pow((featureD-.76*featureScale+.035*Math.sin(theta*6+state.seed))/.075,2));t=clamp(d*.55+rim*.45*detail)}
   if(!independentColor&&pigment==='spotted')t=clamp(d*state.midpoint/100*.95);
   if(pigment==='patchy'){
    const patch=noiseField(xx*3.4+pigmentSeed*.01,yy*3.4,pigmentSeed+131);
    const mapped=clamp(.12+patch*.85+(xx*.24+yy*.12)*(independentColor?1:(state.detail??75)/100));
    t=independentColor?t*(1-pigmentStrength)+mapped*pigmentStrength:mapped;
   }
   const mid=state.midpoint/100,idx=t<mid?0:1,u=smooth(idx===0?t/mid:(t-mid)/(1-mid)),i=(y*full+x)*4;
   let relief=0;
   if(state.shape==='wrinkled'){
    const w1=xx*18+Math.sin(yy*5+state.seed)*1.6,w2=yy*18+Math.sin(xx*6-state.seed)*1.4;
    const mix=.5+.5*Math.sin(xx*3+yy*4+state.seed),foldWidth=(state.foldWidth??100)/100,lines=Math.exp(-Math.pow(Math.sin(w1)*4/foldWidth,2))*mix+Math.exp(-Math.pow(Math.sin(w2)*4/foldWidth,2))*(1-mix);
    const broken=1-(state.foldBreak??0)/100*smooth((noiseField(xx*3.8+state.seed*.01,yy*3.8,state.seed+955)-.3)/.4);
    relief=(lines-.22)*detail*58*broken*(1-smooth((d-.55)/.4));
   }
   if(state.shape==='granular'){const coarse=noiseField(x/(8*scale+1),y/(8*scale+1),state.seed+392),fine=hash(Math.floor(x/Math.max(1,scale*2)),Math.floor(y/Math.max(1,scale*2)),state.seed+42);relief=(coarse-.5)*detail*45+(fine-.5)*detail*85}
   if(state.shape==='smoothcol')relief=Math.exp(-Math.hypot(xx+.23,yy+.22)*4)*detail*40;
   let spots=0;
   if(pigment==='spotted'&&pigmentStrength>0&&d<.93){
    const grid=3+(independentColor?state.spotCount:zones),spotScale=independentColor?state.spotSize/100:featureScale;
    const px=(xx-featureX+1)*grid,py=(yy-featureY+1)*grid,ix=Math.floor(px),iy=Math.floor(py);
    for(let oy=-1;oy<=1;oy++)for(let ox=-1;ox<=1;ox++){
     const gx=ix+ox,gy=iy+oy;if(hash(gx,gy,pigmentSeed+510)<.48)continue;
     const sx=gx+.15+hash(gx,gy,pigmentSeed+511)*.7,sy=gy+.15+hash(gx,gy,pigmentSeed+512)*.7;
     const rad=(.13+hash(gx,gy,pigmentSeed+513)*.22)*spotScale;
     spots=Math.max(spots,1-smooth((Math.hypot(px-sx,py-sy)-rad)/.18));
    }
   }
   const cottonTint=state.shape==='cotton'?smooth((d-.2)/.45)*detail*(.08+.26*noiseField(x/(35*scale+1),y/(35*scale+1),state.seed+271)):0;
   for(let k=0;k<3;k++){const value=palette[idx][k]*(1-u)+palette[idx+1][k]*u+relief,mixed=value*(1-spots*pigmentStrength)+palette[2][k]*spots*pigmentStrength;data[i+k]=clamp(mixed*(1-cottonTint)+palette[0][k]*cottonTint,0,255)}
   data[i+3]=clamp(alpha)*255;
  }
  lc.putImageData(im,0,0);let finished=layer;
  if(state.blur){finished=document.createElement('canvas');finished.width=finished.height=full;const bc=finished.getContext('2d',{willReadFrequently:true});bc.filter=`blur(${state.blur*scale}px)`;bc.drawImage(layer,0,0);bc.filter='none'}
  let coreData=data,edgeData=null;
  if(state.blur&&state.core&&(state.coreBlur??0)>0){const c=document.createElement('canvas');c.width=c.height=full;const cc=c.getContext('2d');cc.filter=`blur(${state.coreBlur*scale}px)`;cc.drawImage(layer,0,0);cc.filter='none';coreData=cc.getImageData(0,0,full,full).data}
  if((state.edgeBlur??0)>0){const c=document.createElement('canvas');c.width=c.height=full;const cc=c.getContext('2d');cc.filter=`blur(${state.edgeBlur*scale}px)`;cc.drawImage(layer,0,0);cc.filter='none';edgeData=cc.getImageData(0,0,full,full).data}
  if(state.grain||state.porosity||state.blur&&state.core||edgeData||['cotton','hairy','branching'].includes(state.shape)||pigment==='rimmed'&&pigmentStrength>0){
   const fc=finished.getContext('2d'),pixels=fc.getImageData(0,0,full,full),rgba=pixels.data;
   for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){
    const i=(y*full+x)*4;
    if(edgeData){const edge=smooth((Math.hypot(x-cx,y-cy)/r-.5)/.5),a=rgba[i+3]/255,b=edgeData[i+3]/255,alpha=a*(1-edge)+b*edge;if(alpha>0){for(let k=0;k<3;k++)rgba[i+k]=(rgba[i+k]*a*(1-edge)+edgeData[i+k]*b*edge)/alpha;rgba[i+3]=alpha*255}else rgba[i+3]=0}
    if(state.blur&&state.core){const radius=Math.hypot((x-cx)/r-focusX,(y-cy)/r-focusY),src=coreData[i+3]/255*state.core/100*(1-smooth((radius-.1)/Math.max(.05,(state.coreRadius??36)/100))),dst=rgba[i+3]/255,alpha=src+dst*(1-src);if(alpha>0){for(let k=0;k<3;k++)rgba[i+k]=(coreData[i+k]*src+rgba[i+k]*dst*(1-src))/alpha;rgba[i+3]=alpha*255}}
    if(!rgba[i+3])continue;
    // El relieve fino se dibuja después del blur para no perder la estructura.
    if(state.shape==='wrinkled'){
     const xx=(x-cx)/r,yy=(y-cy)/r,dd=Math.hypot(xx,yy),mask=1-smooth((dd-.64)/.31);
     const a=xx*12+Math.sin(yy*4.5+state.seed)*1.8,b=yy*11+Math.sin(xx*5-state.seed)*1.4;
     const mix=.5+.5*Math.sin(xx*2.7+yy*3.5+state.seed),broken=1-(state.foldBreak??0)/100*smooth((noiseField(xx*3.8+state.seed*.01,yy*3.8,state.seed+955)-.3)/.4),fw=(state.foldWidth??100)/100,wrinkle=(Math.exp(-Math.pow(Math.sin(a)*3.8/fw,2))*mix+Math.exp(-Math.pow(Math.sin(b)*3.8/fw,2))*(1-mix)-.18)*(state.detail??55)/100*65*mask*broken;
     for(let k=0;k<3;k++)rgba[i+k]=clamp(rgba[i+k]+wrinkle*(k===2?.7:1),0,255);
    }
    if(state.shape==='granular'){
     const micro=hash(Math.floor(x/Math.max(1,scale*2)),Math.floor(y/Math.max(1,scale*2)),state.seed+402);
     const amount=(micro-.5)*(state.detail??55)/100*64;for(let k=0;k<3;k++)rgba[i+k]=clamp(rgba[i+k]+amount,0,255);
    }
    if(state.shape==='cotton'){
     const dx=(x-cx)/r,dy=(y-cy)/r,dd=Math.hypot(dx,dy),patch=noiseField(dx*5.5+state.seed*.01,dy*5.5,state.seed+721),strength=(state.detail??55)/100;
     const tint=smooth((dd-.18)/.4)*(1-smooth((dd-1)/.27))*strength*(.12+patch*.4);
     for(let k=0;k<3;k++)rgba[i+k]=clamp(rgba[i+k]*(1-tint)+colors[0][k]*tint,0,255);
     if(focusCount>1){const xx=dx*Math.cos(rot)+dy*Math.sin(rot),yy=-dx*Math.sin(rot)+dy*Math.cos(rot);let spot=0;for(const focus of foci){const dist=Math.hypot(xx-focus.x,yy-focus.y)/Math.max(.05,focusSize);spot=Math.max(spot,Math.exp(-dist*dist*1.6))}spot*=.8;for(let k=0;k<3;k++)rgba[i+k]=rgba[i+k]*(1-spot)+colors[0][k]*spot}
     rgba[i+3]*=.78+patch*.22;
    }
    if(pigment==='rimmed'){
     const rimSize=independentColor?state.rimSize:state.featureSize??100;
     const xx=(x-cx)/r-(state.featureX??0)/100,yy=(y-cy)/r-(state.featureY??0)/100,theta=Math.atan2(yy,xx),dd=Math.hypot(xx,yy),rim=Math.exp(-Math.pow((dd-.76*rimSize/100+.035*Math.sin(theta*6+state.seed))/.075,2))*pigmentStrength*.72;
     for(let k=0;k<3;k++)rgba[i+k]=clamp(rgba[i+k]*(1-rim)+colors[2][k]*rim,0,255);
    }
    const gx=Math.floor((x-padding)/Math.max(.5,state.grainSize*scale)),gy=Math.floor((y-padding)/Math.max(.5,state.grainSize*scale));
    const radius=Math.min(1,Math.hypot(x-cx,y-cy)/r),distribution=clamp(1+(state.grainCenter??0)/100*(radius*2-1),0,2),fine=hash(gx,gy,state.seed),grain=(fine-.5)*state.grain/100*175*distribution;
    for(let k=0;k<3;k++)rgba[i+k]=clamp(rgba[i+k]+grain,0,255);
    if(state.porosity){const cell=Math.max(2,scale*22),patch=noiseField((x-padding)/cell,(y-padding)/cell,state.seed+91);const coverage=clamp((fine-.25)*1.8)*(.25+patch*.9),radius=Math.hypot(x-cx,y-cy)/r,distribution=state.studyDensity===undefined?1:clamp(1+(state.studyDensity/100)*(radius*2-1),0,2),p=clamp(state.porosity/100*distribution);rgba[i+3]*=(1-p)+p*coverage}
   }
   fc.putImageData(pixels,0,0);
   if(['cotton','hairy','branching'].includes(state.shape)){
    const strength=clamp((state.detail??55)/100*.55+(state.filaments??0)/100*.65,0,1);
    fc.save();fc.lineCap='round';fc.strokeStyle=state.c1;
    if(state.shape==='cotton'||state.shape==='hairy'){
     const hairy=state.shape==='hairy';
     for(let j=0;j<(hairy?1900:1500);j++){
      const a=hash(j,3,state.seed)*Math.PI*2+rot,dist=hairy?.50+hash(j,7,state.seed)*.53:Math.sqrt(hash(j,7,state.seed)),deform=1+(state.irregularity??0)/100*.15*(Math.sin((a-rot)*7+state.seed)+.4*Math.sin((a-rot)*13));
      const x=cx+Math.cos(a)*r*dist*deform,y=cy+Math.sin(a)*r*dist*deform;
      const dir=a+(hash(j,11,state.seed)-.5)*(hairy?.75:1.7),len=r*((hairy?.035:.015)+hash(j,13,state.seed)*(hairy?.19:.09)),bend=(hash(j,17,state.seed)-.5)*len;
      const fiberWeight=(state.fiberWeight??100)/100;fc.globalAlpha=clamp((.05+hash(j,19,state.seed)*(hairy?.26:.28))*strength*(1-Math.min(dist,1)*.4)*fiberWeight);fc.lineWidth=Math.max(.25,scale*(.18+hash(j,23,state.seed)*.6)*fiberWeight);
      fc.beginPath();fc.moveTo(x,y);fc.quadraticCurveTo(x+Math.cos(dir)*len*.5-Math.sin(dir)*bend,y+Math.sin(dir)*len*.5+Math.cos(dir)*bend,x+Math.cos(dir)*len,y+Math.sin(dir)*len);fc.stroke();
     }
    }else{
     const variation=.15+(state.irregularity??0)/100*.55,spread=(state.branchSpread??100)/100,extension=(state.branchLength??100)/100;
     function twig(x,y,a,len,depth,key){
      const bend=(hash(key,51,state.seed)-.5)*len*variation,ex=x+Math.cos(a)*len,ey=y+Math.sin(a)*len,mx=x+Math.cos(a)*len*.5-Math.sin(a)*bend,my=y+Math.sin(a)*len*.5+Math.cos(a)*bend;
      fc.globalAlpha=(.24+hash(key,53,state.seed)*.25)*strength;fc.lineWidth=Math.max(.25,scale*(.32+depth*.22));fc.beginPath();fc.moveTo(x,y);fc.quadraticCurveTo(mx,my,ex,ey);fc.stroke();
      if(depth<=0)return;const t=.52+hash(key,55,state.seed)*.15,bx=(1-t)*(1-t)*x+2*(1-t)*t*mx+t*t*ex,by=(1-t)*(1-t)*y+2*(1-t)*t*my+t*t*ey,turn=.23+hash(key,57,state.seed)*(.35+variation*.2);
      twig(bx,by,a-turn*spread,len*(.42+hash(key,59,state.seed)*.12),depth-1,key*2+1);twig(ex,ey,a+turn*.65*spread,len*(.43+hash(key,61,state.seed)*.10),depth-1,key*2+2);
     }
     for(let j=0;j<(state.branchDensity??7);j++){const a=Math.PI/2+rot+(hash(j,41,state.seed)-.5)*1.1*spread,len=r*(.28+hash(j,43,state.seed)*.14)*extension;twig(cx,cy,a,len,state.branchForks??4,j+1)}
    }
    fc.restore();
   }
  }
  out.save();out.globalAlpha=state.opacity/100;out.globalCompositeOperation=state.blend;out.drawImage(finished,0,0);out.restore();
 }
 const r=n*state.size/200;
 if(state.shape==='pair'){const sep=r*state.separation/100*1.8;element(n/2-sep/2,n/2,r*.7);element(n/2+sep/2,n/2,r*.7,1,2,[colors[2],colors[2],colors[0]])}
 else if(state.shape==='band'){for(let i=0;i<19;i++)element(n*(.04+i*.051),n*(.5+(hash(i,12,state.seed)-.5)*.10),r*(.08+hash(i,7,state.seed)*.24),i%5===0?1.7:1,i,[colors[i%3],colors[(i+1)%3],colors[(i+2)%3]])}
 else {const aspect=1+state.elongation/50,fit=padding?1:Math.max(1,state.size/100*.53*aspect);element(n/2,n/2,state.shape==='capsule'?r*.53/fit:r,state.shape==='capsule'?aspect:1);}
}
// ───────── reacciones.js, líneas 5-34 y 145-237 ─────────
const wrapPi=x=>((x+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI;
function newLayer(){const c=document.createElement('canvas');c.width=RW;c.height=RH;return c}
function blurLayer(src,px){const c=newLayer(),g=c.getContext('2d');g.filter='blur('+Math.max(.01,px)+'px)';g.drawImage(src,0,0);g.filter='none';return c}
const readPix=c=>c.getContext('2d').getImageData(0,0,RW,RH);
// [TU PLACA] Cuerpos de fusión en un lienzo del tamaño del grupo (no de toda la placa): mismos píxeles, mucho menos trabajo.
function localLayer(w,h){const c=document.createElement('canvas');c.width=Math.max(1,w);c.height=Math.max(1,h);c.getContext('2d',{willReadFrequently:true});return c}
function localBlur(src,px){const c=localLayer(src.width,src.height),g=c.getContext('2d',{willReadFrequently:true});g.filter='blur('+Math.max(.01,px)+'px)';g.drawImage(src,0,0);g.filter='none';return c}
const n2=(x,y,seed,size)=>noiseField(x/size,y/size,seed);

// ───────── herramientas del menú: el borde interior del anillo y los bordes del recorte respetan el blur de la colonia ─────────
function softCut(layer,s,cx){
 const hasCut=Number.isFinite(s.cutOpening)&&s.cutOpening<360,hasRing=Number.isFinite(s.ringThickness)&&s.ringThickness<100;
 if(!hasCut&&!hasRing)return;
 const N=layer.canvas.width,img=layer.getImageData(0,0,N,N),d=img.data;
 const feather=Math.max(3,(s.blur||0)*200/760*1.8+1.5);                    // ancho de la transición, en px del sprite
 const rHole=hasRing?s.size*(1-s.ringThickness/100):0;
 const contour=hasRing?colonyContour(s):null;
 const rotation=s.rotation*Math.PI/180;
 const open=hasCut?s.cutOpening*Math.PI/180:0,start=(-90+(s.cutAngle??0))*Math.PI/180;
 const wedge=(th,from,size,dist)=>{
  const sd1=dist*Math.sin(Math.max(-Math.PI/2,Math.min(Math.PI/2,wrapPi(th-from))));
  const sd2=dist*Math.sin(Math.max(-Math.PI/2,Math.min(Math.PI/2,wrapPi(from+size-th))));
  return smooth(sd1/feather+.5)*smooth(sd2/feather+.5);
 };
 for(let y=0;y<N;y++)for(let x=0;x<N;x++){
  const i=(y*N+x)*4;if(!d[i+3])continue;
  const dx=x-cx,dy=y-cx,dist=Math.hypot(dx,dy),th=Math.atan2(dy,dx)-rotation;let m=1;
  if(hasRing)m*=smooth((dist-rHole*contour(th))/feather+.5);
  if(hasCut)m*=open<=Math.PI?wedge(th,start,open,dist):1-wedge(th,start+open,2*Math.PI-open,dist);
  d[i+3]*=m;
 }
 layer.putImageData(img,0,0);
}
function renderColonyFronts(ctx,members,mode,strength,gap,feather) {
 for(const colony of members) {
  ctx.save();
  ctx.globalCompositeOperation=colony.style.blend??'source-over';
  if(!colony.neighbors.length){
   ctx.drawImage(colony.layer,colony.left??0,colony.top??0);
   ctx.restore();continue;
  }
  const source=colony.pixels;
  const reach=colony.renderRadius??(colony.radius*1.38+feather*3);
  const left=clamp(Math.floor(colony.x-reach),0,RW-1),top=clamp(Math.floor(colony.y-reach),0,RH-1);
  const right=clamp(Math.ceil(colony.x+reach),left+1,RW),bottom=clamp(Math.ceil(colony.y+reach),top+1,RH);
  const width=right-left,height=bottom-top;
  const output=new ImageData(width,height),data=output.data;
  const sourceIndex=colony.indexAt??((x,y)=>y*RW+x);
  const faces=reactionFaces(colony,mode,strength);
  const compressed=faces.some(face=>face.mode==='crush');
  for(let y=top;y<bottom;y++){
   for(let x=left;x<right;x++){
    const index=((y-top)*width+x-left)*4;
    if(!compressed&&!source[sourceIndex(x,y)*4+3])continue;
    const dx=x-colony.x,dy=y-colony.y,ownDistance=Math.hypot(dx,dy);
    let alpha=1,rim=0,strongest=null,pull=0;
    const rough=(n2(x,y,57,13)-.5)*Math.min(3,gap*.24)*strength;
    // Todas las fronteras limitan la misma colonia. La cara con más presión
    // determina de dónde se toma la textura, incluso en cruces de tres frentes.
    for(const face of faces) {
     const boundary=colonyFrontBoundary(colony,face,x,y,ownDistance,strength,gap,feather,rough);
     if(!Number.isFinite(boundary))continue;
     if(face.mode==='crush'){
      if(!face.pressure)continue;
      const axial=dx*face.dx+dy*face.dy;
      const pressure=face.pressure*smooth((axial+colony.radius*.35)/(colony.radius*.9));
      if(pressure>pull){pull=pressure;strongest=face}
     }
     alpha=Math.min(alpha,1-strength*(1-smooth(boundary/feather+.5)));
     rim=Math.max(rim,(1-smooth(boundary/9))*strength*.13);
    }
    if(alpha<.002)continue;
    let sx=x,sy=y;
    if(strongest){
     const side=dx*(-strongest.dy)+dy*strongest.dx;
     const bulge=side*(1-1/(1+pull/colony.radius*.55));
     sx+=strongest.dx*pull+strongest.dy*bulge;
     sy+=strongest.dy*pull-strongest.dx*bulge;
    }
    const ix=clamp(Math.round(sx),0,RW-1),iy=clamp(Math.round(sy),0,RH-1);
    const sample=sourceIndex(ix,iy)*4;
    if(!source[sample+3])continue;
    for(let channel=0;channel<3;channel++)data[index+channel]=source[sample+channel]*(1-rim);
    data[index+3]=source[sample+3]*alpha;
   }
  }
  const layer=document.createElement('canvas');
  layer.width=width;layer.height=height;
  layer.getContext('2d').putImageData(output,0,0);
  ctx.drawImage(layer,left,top);
  ctx.restore();
 }
}

function reactionFaces(colony,mode,strength) {
 return colony.neighbors.map(neighbor=>{
  const {other,overlap}=neighbor;
  const share=other.radius/(colony.radius+other.radius);
  const pressure=Math.max(0,overlap)*share*strength;
  return {...neighbor,mode:neighbor.mode??mode,face:Math.max(0,(neighbor.ownReach??colony.radius)-pressure),pressure};
 });
}

function colonyFrontBoundary(colony,face,x,y,ownDistance,strength,gap,feather,rough) {
 if(face.mode==='crush'){
  if(!face.pressure)return Infinity;
  const axial=(x-colony.x)*face.dx+(y-colony.y)*face.dy;
  return face.face-axial;
 }
 const {other}=face;
 if(other.distanceAt){
  const otherEdge=other.distanceAt(x,y);
  if(otherEdge>gap*strength+feather*2)return Infinity;
  if(face.mode==='repel')return otherEdge-gap*strength+rough;
  const ownEdge=colony.distanceAt(x,y);
  const normalized=(otherEdge/other.radius-ownEdge/colony.radius)/(1/colony.radius+1/other.radius);
  return normalized-gap*strength*.5+rough;
 }
 const distance=Math.hypot(x-other.x,y-other.y);
 if(distance>other.radius+gap*strength+feather*2)return Infinity;
 if(face.mode==='barrier'){
  const normalized=(distance/other.radius-ownDistance/colony.radius)/(1/colony.radius+1/other.radius);
  return normalized-gap*strength*.5+rough;
 }
 return distance-other.radius-gap*strength+rough;
}
// ───────── simbiosis-originales.js, líneas 97-114 ─────────
function joinedColonyGroups(colonies,strength,canJoin=()=>true,withinReach=colonyCentersWithinReach) {
 const pending=new Set(colonies), groups=[];
 for(const first of colonies){
  if(!pending.delete(first))continue;
  const group=[first];
  for(const member of group)for(const other of pending){
   if(!withinReach(member,other,strength)||!canJoin(member,other))continue;
   pending.delete(other);group.push(other);
  }
  groups.push(group);
 }
 return groups;
}

function colonyCentersWithinReach(a,b,strength){
 const gap=Math.hypot(a.x-b.x,a.y-b.y)-a.radius-b.radius;
 return gap<=Math.min(a.radius,b.radius)*.57*strength;
}
// ───────── simbiosis-originales.js, líneas 138-201 (forma combinada) y reacciones.js, línea 37 ─────────
const REACTION_WIDTH=142.8;
function drawJoinedBody(group,strength,values) {
 const meanRadius=group.reduce((sum,colony)=>sum+colony.radius,0)/group.length;
 const rounding=meanRadius*.47*(.3+.7*strength);
 const pigmentFalloff=.38;
 const blur=(values.blur??10)*REACTION_WIDTH/760;
 const margin=rounding*1.4+blur*3+8;
 const x0=Math.max(0,Math.floor(Math.min(...group.map(c=>c.x-c.radius))-margin));
 const x1=Math.min(RW,Math.ceil(Math.max(...group.map(c=>c.x+c.radius))+margin));
 const y0=Math.max(0,Math.floor(Math.min(...group.map(c=>c.y-c.radius))-margin));
 const y1=Math.min(RH,Math.ceil(Math.max(...group.map(c=>c.y+c.radius))+margin));
 const members=group.map(colony=>({
  ...colony, contour:colonyContour({...BASE,...colony.style}),
  colors:[rgb(colony.style.c1),rgb(colony.style.c2),rgb(colony.style.c3)],
  distance:0, signed:0,
 }));
 const W=Math.max(1,x1-x0),H=Math.max(1,y1-y0); // [TU PLACA] lienzo local
 const layer=localLayer(W,H),ctx=layer.getContext('2d',{willReadFrequently:true});
 const image=new ImageData(W,H), pixels=image.data;
 for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){
  let minimum=Infinity, nearestColor=Infinity;
  for(const member of members){
   const dx=x-member.x,dy=y-member.y;
   const distance=Math.hypot(dx,dy);
   member.distance=distance/member.radius;
   member.signed=distance-member.radius*member.contour(Math.atan2(dy,dx));
   minimum=Math.min(minimum,member.signed);
   nearestColor=Math.min(nearestColor,member.distance);
  }
  if(minimum>rounding*1.4+2)continue;
  let field=0;
  for(const member of members)field+=Math.exp((minimum-member.signed)/rounding);
  // Una isocurva para todo el grupo, con radiación acotada en cruces múltiples.
  const limit=rounding*1.35;
  const surface=minimum-limit*Math.tanh(Math.log(field)/1.35);
  const alpha=1-smooth(surface/2+.5);
  if(!alpha)continue;
  let weightSum=0,r=0,g=0,b=0;
  for(const member of members){
   const weight=Math.exp((nearestColor-member.distance)/pigmentFalloff);
   weightSum+=weight;
   const distance=clamp(member.distance);
   const zone=distance<.55?0:1;
   const mix=smooth(zone===0?distance/.55:(distance-.55)/.45);
   const from=member.colors[zone],to=member.colors[zone+1];
   r+=(from[0]+(to[0]-from[0])*mix)*weight;
   g+=(from[1]+(to[1]-from[1])*mix)*weight;
   b+=(from[2]+(to[2]-from[2])*mix)*weight;
  }
  const i=((y-y0)*W+x-x0)*4;
  pixels[i]=r/weightSum;pixels[i+1]=g/weightSum;pixels[i+2]=b/weightSum;pixels[i+3]=alpha*255;
 }
 ctx.putImageData(image,0,0);
 const softened=localBlur(layer,blur);
 const out=softened.getContext('2d',{willReadFrequently:true});
 const result=out.getImageData(0,0,W,H), grain=values.grain*1.38;
 // La misma textura cubre núcleos y encuentros, después del blur del cuerpo.
 for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){
  const i=((y-y0)*W+x-x0)*4;
  if(!result.data[i+3])continue;
  const noise=(hash(x,y,137)-.5)*grain;
  for(let k=0;k<3;k++)result.data[i+k]+=noise;
 }
 out.putImageData(result,0,0);
 return {canvas:softened,left:x0,top:y0};
}
// ───────── placa-encuentros.js, líneas 4-21 y 166-387 ─────────
const meetingSurfaces=new WeakMap();
const meetingTypes={
 moho:{label:'Moho',family:'verde'},
 bacteria:{label:'Bacteria',family:'rosa'},
 levadura:{label:'Levadura',family:'amarillo'},
};
const meetingTypeOrder=Object.keys(meetingTypes);
const meetingTypeByColor={'#27633f':'moho','#ff4c52':'bacteria','#ff9c20':'levadura'};
const meetingTypePair=(a,b)=>meetingTypeOrder.indexOf(a)<=meetingTypeOrder.indexOf(b)?a+':'+b:b+':'+a;
const meetingPairs=[
 ['moho','moho','fusion'],
 ['moho','bacteria','barrier'],
 ['moho','levadura','repel'],
 ['bacteria','levadura','bridge'],
 ['bacteria','bacteria','crush'],
 ['levadura','levadura',''],
];
const meetingRules=Object.fromEntries(meetingPairs.map(([a,b,mode])=>[meetingTypePair(a,b),mode]));
function meetingOutline(layer,opacity,left,top){
 const {width,height}=layer,area=width*height;
 const pixels=layer.getContext('2d').getImageData(0,0,width,height).data;
 const interior=[], outside=new Float32Array(area), inside=new Float32Array(area);
 const threshold=Math.max(1,255*opacity/100*.34);
 for(let i=0;i<area;i++){
  const solid=pixels[i*4+3]>=threshold;
  outside[i]=solid?0:Infinity;
  inside[i]=solid?Infinity:0;
  if(solid)interior.push((top+Math.floor(i/width))*RW+left+i%width);
 }
 // Two passes measure distance to the painted silhouette, including holes and cuts.
 const relax=(i,j,cost)=>{
  outside[i]=Math.min(outside[i],outside[j]+cost);
  inside[i]=Math.min(inside[i],inside[j]+cost);
 };
 const visit=(x,y,direction)=>{
  const i=y*width+x;
  if(direction===1?x>0:x<width-1)relax(i,i-direction,1);
  if(direction===1?y===0:y===height-1)return;
  const row=i-direction*width;
  relax(i,row,1);
  if(x>0)relax(i,row-1,Math.SQRT2);
  if(x<width-1)relax(i,row+1,Math.SQRT2);
 };
 for(let y=0;y<height;y++)for(let x=0;x<width;x++)visit(x,y,1);
 for(let y=height-1;y>=0;y--)for(let x=width-1;x>=0;x--)visit(x,y,-1);
 for(let i=0;i<area;i++)outside[i]-=inside[i];
 const indexAt=(x,y)=>x>=left&&x<left+width&&y>=top&&y<top+height
  ? (y-top)*width+x-left : -1;
 return {
  pixels,interior,indexAt,left,top,
  distanceAt(x,y){return outside[indexAt(x,y)]??Infinity},
 };
}

function meetingContact(a,b){
 const dx=b.x-a.x,dy=b.y-a.y,distance=Math.hypot(dx,dy);
 const ux=distance>.001?dx/distance:1,uy=distance>.001?dy/distance:0;
 let gap=Infinity,reachA=0,reachB=0;
 for(const index of a.interior){
  const x=index%RW,y=Math.floor(index/RW);
  gap=Math.min(gap,b.distanceAt(x,y));
  reachA=Math.max(reachA,(x-a.x)*ux+(y-a.y)*uy);
 }
 for(const index of b.interior){
  const x=index%RW,y=Math.floor(index/RW);
  gap=Math.min(gap,a.distanceAt(x,y));
  reachB=Math.max(reachB,(b.x-x)*ux+(b.y-y)*uy);
 }
 return {gap,distance,ux,uy,reachA,reachB};
}

// [TU PLACA] ¿La silueta ya está calculada para esta posición? (misma clave que meetingSurface)
function surfaceReady(colony,reach){return meetingSurfaces.get(colony.entry)?.key===JSON.stringify([colony.x,colony.y,reach,colony.style,colony.parameters,colony.extra])}
function meetingSurface(colony,reach){
 const key=JSON.stringify([colony.x,colony.y,reach,colony.style,colony.parameters,colony.extra]); // [TU PLACA] + giro y foco
 const previous=meetingSurfaces.get(colony.entry);
 if(previous?.key===key)return previous.surface;
 hechos++; // [TU PLACA]
 const left=clamp(Math.floor(colony.x-reach),0,RW-1),top=clamp(Math.floor(colony.y-reach),0,RH-1);
 const right=clamp(Math.ceil(colony.x+reach),left+1,RW),bottom=clamp(Math.ceil(colony.y+reach),top+1,RH);
 const layer=document.createElement('canvas');
 layer.width=right-left;layer.height=bottom-top;
 const context=layer.getContext('2d',{willReadFrequently:true});
 context.translate(-left,-top);
 drawMeetingColony(context,colony);
 const surface={layer,...meetingOutline(layer,colony.style.opacity,left,top)};
 meetingSurfaces.set(colony.entry,{key,surface});
 return surface;
}

function renderMixedMeetings(colonies,v){
 const scene=newLayer(),ctx=scene.getContext('2d',{willReadFrequently:true});
 const strength=v.strength/100,gap=v.gapWidth,feather=2+v.blur*.12;
 if(strength<=0){
  for(const colony of colonies)drawMeetingColony(ctx,colony,colony.style.blend,true);
  return scene;
 }
 const relation=(a,b)=>meetingRules[meetingTypePair(a.type,b.type)];
 // [TU PLACA] La silueta (distancias píxel a píxel) solo se calcula para las colonias que tienen con quién encontrarse;
 // las demás se dibujan tal cual. Es el mismo descarte por distancia que hace el muestrario más abajo, hecho antes.
 const pairReach=(a,b,mode)=>({fusion:Math.min(a.radius,b.radius)*.57*strength,bridge:18,repel:gap+feather+5,barrier:gap+feather,crush:0})[mode];
 const candidates=new Set();
 for(const [i,a] of colonies.entries())for(const b of colonies.slice(i+1)){const mode=relation(a,b);if(mode&&Math.hypot(b.x-a.x,b.y-a.y)<=a.renderRadius+b.renderRadius+pairReach(a,b,mode)){candidates.add(a);candidates.add(b);}}
 const members=colonies.map(colony=>{
  const reach=colony.renderRadius+Math.max(20,gap+feather*3+6,colony.radius*.57);
  if(!candidates.has(colony))return {...colony,layer:null,neighbors:[],plain:true};
  // [TU PLACA] Con el tiempo del cuadro agotado, la silueta que falta queda para el cuadro siguiente.
  if(!surfaceReady(colony,reach)&&agotado()){pendiente=true;return {...colony,layer:null,neighbors:[],plain:true};}
  return {...colony,...meetingSurface(colony,reach),neighbors:[]};
 });
 const pigments=[], fusions=[];
 for(const [i,a] of members.entries())for(const b of members.slice(i+1)){
  const mode=relation(a,b);
  if(!mode||a.plain||b.plain)continue;
  const reach={
   fusion:Math.min(a.radius,b.radius)*.57*strength,
   bridge:18,repel:gap+feather+5,barrier:gap+feather,crush:0,
  }[mode];
  if(Math.hypot(b.x-a.x,b.y-a.y)>a.renderRadius+b.renderRadius+reach)continue;
  const contactKey=a.sk+'|'+b.sk; // [TU PLACA] el contacto entre dos colonias que no se movieron se reutiliza
  let contact=contactCache.get(contactKey);
  if(!contact&&agotado()){pendiente=true;continue}
  if(!contact){hechos++;contact=meetingContact(a,b);contactCache.set(contactKey,contact);if(contactCache.size>3000)contactCache.delete(contactCache.keys().next().value);}
  if(contact.gap>reach)continue;
  encuentros.push({a:a.entry,b:b.entry,mode,gap:contact.gap,ux:contact.ux,uy:contact.uy}); // [TU PLACA] para los rótulos
  const {ux,uy,reachA,reachB}=contact;
  if(mode==='fusion'){fusions.push({a,b,...contact});continue}
  if(mode==='bridge'){pigments.push({a,b,ux,uy});continue}
  const overlap=-contact.gap;
  const order=meetingTypeOrder.indexOf(a.type)-meetingTypeOrder.indexOf(b.type)||a.id-b.id;
  if(mode!=='repel'||order<0)a.neighbors.push({other:b,dx:ux,dy:uy,overlap,mode,ownReach:reachA});
  if(mode!=='repel'||order>0)b.neighbors.push({other:a,dx:-ux,dy:-uy,overlap,mode,ownReach:reachB});
 }
 const groups=joinedColonyGroups(members,strength,undefined,(a,b)=>fusions.some(pair=>
  pair.a===a&&pair.b===b||pair.a===b&&pair.b===a));
 const vecinos=colony=>colony.neighbors.map(n=>[n.other.sk,n.mode,n.overlap,n.ownReach]);
 for(const group of groups){
  if(group.length===1&&group[0].plain){drawMeetingColony(ctx,group[0],group[0].style.blend,true);continue} // [TU PLACA]
  if(group.length===1){
   // [TU PLACA] El frente de una colonia se guarda grabado: si ni ella ni sus vecinas cambiaron, se vuelve a pegar igual.
   const [colony]=group;
   const frontKey=JSON.stringify([RW,strength,gap,feather,colony.sk,vecinos(colony)]);
   let drawn=frontCache.get(frontKey);
   if(!drawn&&agotado()){pendiente=true;drawMeetingColony(ctx,colony,colony.style.blend,true);continue}
   if(!drawn){
    hechos++;drawn=[];const recorder={save(){},restore(){},globalCompositeOperation:'source-over',drawImage(img,x,y){drawn.push([img,x,y])}};
    renderColonyFronts(recorder,group,null,strength,gap,feather);
    frontCache.set(frontKey,drawn);if(frontCache.size>400)frontCache.delete(frontCache.keys().next().value);
   }
   ctx.save();ctx.globalCompositeOperation=colony.style.blend??'source-over';for(const [img,x,y] of drawn)ctx.drawImage(img,x??0,y??0);ctx.restore();
   continue;
  }
  // [TU PLACA] El cuerpo de un grupo que no cambió se reutiliza, ya recortado por sus frentes si las vecinas tampoco cambiaron.
  const bodyKey=JSON.stringify([RW,strength,v.blur,v.grain,group.map(c=>c.sk)]);
  const clipKey=JSON.stringify([bodyKey,gap,feather,group.map(vecinos)]);
  const clipped=clipCache.get(clipKey);
  if(clipped){ctx.drawImage(clipped.canvas,clipped.left,clipped.top);continue}
  let fresh=bodyCache.get(bodyKey);
  // Mientras se arrastra, un grupo grande que cambió se muestra suelto y se funde al soltar (fundirlo tarda más de un cuadro).
  const pesado=arrastrando&&group.reduce((sum,c)=>sum+c.layer.width*c.layer.height,0)>150000;
  if(agotado()||pesado){pendiente=pendiente||!pesado;for(const colony of group)drawMeetingColony(ctx,colony,colony.style.blend,true);continue}
  if(!fresh){
   fresh=group.some(colony=>colony.parameters||colony.sourceStyle)
    ? fuseStyledColonies(group,strength,fusions.filter(({a,b})=>group.includes(a)&&group.includes(b)))
    : drawJoinedBody(group,strength,v);
   bodyCache.set(bodyKey,fresh);if(bodyCache.size>60)bodyCache.delete(bodyCache.keys().next().value);
  }
  hechos++;
  const copy=localLayer(fresh.canvas.width,fresh.canvas.height);copy.getContext('2d',{willReadFrequently:true}).drawImage(fresh.canvas,0,0);
  const body={canvas:copy,left:fresh.left,top:fresh.top};
  clipMixedUnion(body,group,strength,gap,feather);
  clipCache.set(clipKey,body);if(clipCache.size>60)clipCache.delete(clipCache.keys().next().value);
  ctx.drawImage(body.canvas,body.left,body.top); // [TU PLACA] cuerpo en lienzo local
 }
 if(pigments.length)applyMeetingPigments(ctx,pigments,v);
 return scene;
}
function fuseStyledColonies(group,strength,fusions){
 const contacts=fusions.filter(pair=>pair.distance>=1).map(({a,b,distance,ux,uy,gap})=>{
  const reach=Math.min(a.radius,b.radius)*strength;
  const shift=Math.min(distance/3,Math.max(gap*.58,reach*.33));
  return {a,b,dx:Math.round(ux*shift),dy:Math.round(uy*shift)};
 });
 const left=Math.min(...group.map(c=>c.left)),top=Math.min(...group.map(c=>c.top));
 const right=Math.max(...group.map(c=>c.left+c.layer.width)),bottom=Math.max(...group.map(c=>c.top+c.layer.height));
 const W=right-left,H=bottom-top; // [TU PLACA] lienzo local
 const body=localLayer(W,H),ctx=body.getContext('2d',{willReadFrequently:true});
 const image=ctx.createImageData(Math.max(1,W),Math.max(1,H)),data=image.data;
 for(let y=top;y<bottom;y++)for(let x=left;x<right;x++){
  const index=((y-top)*W+x-left)*4;
  let alpha=0,weight=0,r=0,g=0,b=0;
  for(const member of group){
   const {pixels}=member;
   const offset=member.indexAt(x,y)*4;
   const coverage=pixels[offset+3]??0;
   if(!coverage)continue;
   alpha=Math.max(alpha,coverage);
   weight+=coverage;
   r+=pixels[offset]*coverage;g+=pixels[offset+1]*coverage;b+=pixels[offset+2]*coverage;
  }
  // Prolongar solo el material presente a ambos lados del encuentro.
  for(const contact of contacts){
   const from=contact.a.indexAt(x-contact.dx,y-contact.dy)*4;
   const to=contact.b.indexAt(x+contact.dx,y+contact.dy)*4;
   const left=contact.a.pixels,right=contact.b.pixels;
   const coverage=Math.min(left[from+3]??0,right[to+3]??0)*strength;
   const extra=Math.max(0,coverage-alpha);
   if(!extra)continue;
   weight+=extra;alpha=coverage;
   r+=(left[from]+right[to])*.5*extra;
   g+=(left[from+1]+right[to+1])*.5*extra;
   b+=(left[from+2]+right[to+2])*.5*extra;
  }
  if(weight){
   data[index]=r/weight;data[index+1]=g/weight;data[index+2]=b/weight;data[index+3]=alpha;
  }
 }
 ctx.putImageData(image,0,0);
 return {canvas:body,left,top};
}

function clipMixedUnion(body,group,strength,gap,feather){
 const fronts=group.filter(c=>c.neighbors.length).map(colony=>({colony,faces:reactionFaces(colony,null,strength)}));
 if(!fronts.length)return;
 const W=body.canvas.width,H=body.canvas.height,ox=body.left,oy=body.top; // [TU PLACA] lienzo local
 const ctx=body.canvas.getContext('2d',{willReadFrequently:true}), image=ctx.getImageData(0,0,W,H);
 for(let ly=0;ly<H;ly++)for(let lx=0;lx<W;lx++){
  const x=lx+ox,y=ly+oy;
  const index=(ly*W+lx)*4+3;
  if(!image.data[index])continue;
  let nearest=Infinity,retention=1;
  for(const member of group)nearest=Math.min(nearest,Math.hypot(x-member.x,y-member.y)/member.radius);
  const rough=(n2(x,y,57,13)-.5)*Math.min(3,gap*.24)*strength;
  for(const {colony,faces} of fronts){
   const own=Math.hypot(x-colony.x,y-colony.y);
   const weight=1-smooth((own/colony.radius-nearest)/.36);
   if(weight<=0)continue;
   for(const face of faces){
    const boundary=colonyFrontBoundary(colony,face,x,y,own,strength,gap,feather,rough);
    retention=Math.min(retention,1-weight*strength*(1-smooth(boundary/feather+.5)));
   }
  }
  image.data[index]*=retention;
 }
 ctx.putImageData(image,0,0);
}

function applyMeetingPigments(ctx,pairs,v){
 // [TU PLACA] Solo la zona que ocupan las colonias del intercambio (en el muestrario, toda la placa).
 const ox=Math.min(...pairs.flatMap(({a,b})=>[a.left,b.left])),oy=Math.min(...pairs.flatMap(({a,b})=>[a.top,b.top]));
 const W=Math.max(...pairs.flatMap(({a,b})=>[a.left+a.layer.width,b.left+b.layer.width]))-ox,H=Math.max(...pairs.flatMap(({a,b})=>[a.top+a.layer.height,b.top+b.layer.height]))-oy;
 const image=ctx.getImageData(ox,oy,W,H), data=image.data;
 const tones=new Float32Array(data.length);
 const strength=v.strength/100;
 const transfer=(from,to,dx,dy)=>{
  for(const point of to.interior){
   const x=point%RW,y=Math.floor(point/RW);
   const i=((y-oy)*W+x-ox)*4;
   const edge=from.distanceAt(x,y);
   if(data[i+3]<3||edge>18||edge < -10)continue;
   const cell=7,cx=Math.floor(x/cell),cy=Math.floor(y/cell),seed=from.style.seed;
   const localX=x-cx*cell-cell*(.25+.5*hash(cx,cy,seed));
   const localY=y-cy*cell-cell*(.25+.5*hash(cx,cy,seed+13));
   const fleck=1-smooth((Math.hypot(localX,localY)-1.1)/2.1);
   if(fleck<=0)continue;
   const travel=Math.max(0,edge)+3+7*hash(cx,cy,seed+29);
   const sx=Math.round(x-dx*travel),sy=Math.round(y-dy*travel);
   if(sx<0||sx>=RW||sy<0||sy>=RH)continue;
   const source=from.indexAt(sx,sy)*4;
   const target=to.indexAt(x,y)*4;
   const weight=fleck*strength*(1-smooth(Math.max(0,edge)/18))
    *(from.pixels[source+3]??0)/255*to.pixels[target+3]/255;
   if(!weight)continue;
   for(let k=0;k<3;k++)tones[i+k]+=from.pixels[source+k]*weight;
   tones[i+3]+=weight;
  }
 };
 for(const {a,b,ux,uy} of pairs){
  transfer(a,b,ux,uy);
  transfer(b,a,-ux,-uy);
 }
 for(let i=0;i<data.length;i+=4){
  const total=tones[i+3];
  if(!total)continue;
  for(let k=0;k<3;k++)data[i+k]+=(tones[i+k]/total-data[i+k])*Math.min(.85,total);
 }
 ctx.putImageData(image,ox,oy);
}

// ───────── [TU PLACA] puente entre la placa y el motor ─────────
const MIN_COLONY_BLUR = 10;                                   // muestrario.js, línea 169
const TODOS_LOS_PARAMETROS={                                  // muestrario.js, allColonyParameters.style
  shape:'fan', detail:35, size:58, rotation:-25,
  irregularity:25, studyLobes:5, studyDepth:45,
  filaments:70, filamentCount:48, filamentWidth:40,
  blur:18, grain:22, porosity:20, core:0,
  cutOpening:360, cutAngle:0, ringThickness:100,
  colorTreatment:'none', pigmentIntensity:70, pigmentSeed:125,
  zoneCount:4, spotCount:3, spotSize:150, rimSize:100,
};
const MANCHAS={rosa:'#c93665',amarillo:'#ad6b0d',verde:'#16462e'}; // placa-encuentros.js, meetingStyle
const spriteCache=new Map();
let pixelesPorUnidad=1;
// muestrario.js sprite(): mismo proceso; [TU PLACA] n variable (en el muestrario siempre 200) y softCut escalado a n.
function sprite(style,n=200){const clean={...BASE,...style,opacity:100,transparent:true,blend:'source-over'};clean.blur=Math.max(MIN_COLONY_BLUR,clean.blur??0);const key=n+JSON.stringify(clean);if(spriteCache.has(key))return spriteCache.get(key);hechos++;const c=document.createElement('canvas');state=clean;render(c,n,n/2);const layer=c.getContext('2d',{willReadFrequently:true}),center=n;softCut(layer,{...clean,size:clean.size*n/200,blur:clean.blur*n/200},center);spriteCache.set(key,c);if(spriteCache.size>160)spriteCache.delete(spriteCache.keys().next().value);return c}
function spriteListo(style,n){const clean={...BASE,...style,opacity:100,transparent:true,blend:'source-over'};clean.blur=Math.max(MIN_COLONY_BLUR,clean.blur??0);return spriteCache.has(n+JSON.stringify(clean))}
const resolucion=w=>{const necesario=w*pixelesPorUnidad;return necesario<=90?90:necesario<=140?140:necesario<=200?200:necesario<=280?280:360;};
// muestrario.js dot(): [TU PLACA] sin el editor de muestras (placeSampleColony) y con la resolución elegida.
function dot(ctx,x,y,w,style,blend='source-over'){const c=sprite(style,resolucion(w));ctx.save();ctx.globalCompositeOperation=blend;ctx.globalAlpha=(style.opacity??100)/100;ctx.drawImage(c,x-w,y-w,w*2,w*2);ctx.restore()}
// placa-encuentros.js drawMeetingColony(): [TU PLACA] la colonia se gira y se desenfoca con el menú contextual.
function drawMeetingColony(ctx,colony,blend='source-over',puedeEsperar=false){
 const {x,y,width,style,extra}=colony;
 if(puedeEsperar&&!spriteListo(style,resolucion(width/2))&&agotado()){pendiente=true;return}
 ctx.save();ctx.translate(x,y);if(extra.giro)ctx.rotate(extra.giro*Math.PI/180);
 if(extra.desenfoque>.2)ctx.filter='blur('+extra.desenfoque.toFixed(2)+'px)';
 dot(ctx,0,0,width/2,style,blend);ctx.restore();
}
// placa-encuentros.js meetingColonyDefaults() + meetingStyle(), para una colonia de la biblioteca o de una composición.
function estiloColonia(fuente,ajustes={},familia='rosa'){
 const defaults={...BASE,...TODOS_LOS_PARAMETROS,shape:'fan',detail:0,irregularity:BASE.irregularity,studyLobes:0,rotation:0,filaments:0,porosity:0,core:BASE.core};
 const {shape,arc,ringWidth}=fuente;
 const cut=shape==='arc'||shape==='fragment';
 const style={...defaults,...fuente,
  shape:cut||shape==='ring'?'fan':shape,
  detail:shape==='fan'?fuente.detail:0,
  rotation:fuente.rotation??0,
  cutOpening:cut?arc:360,
  cutAngle:cut?90:0,
  ringThickness:shape==='arc'||shape==='ring'?ringWidth:100,
  ...ajustes};
 if(style.colorTreatment==='spotted')style.c3=MANCHAS[familia]??MANCHAS.rosa;
 if(ajustes.detail>0)style.shape='fan';
 return style;
}
// placa-encuentros.js paintMeetingPlate(): radio y alcance de cada colonia.
// parameters = lo editado en TRANSFORMAR; sourceStyle = colonia de una composición generada. Sin ninguno de los dos,
// dos mohos se funden en una forma combinada (drawJoinedBody); con alguno, se prolonga su material (fuseStyledColonies).
function miembro({id,type,x,y,width,style,giro=0,desenfoque=0,entry,parameters,sourceStyle}){
 const radius=width*style.size/200;
 const shapeReach=style.shape==='pair'?1.55:1;
 const renderRadius=radius*1.38*shapeReach*(1+style.detail*.0065)+style.blur*width/760*3+desenfoque*3;
 return {id,type,x,y,width,style,radius,renderRadius,entry,parameters,sourceStyle,extra:{giro,desenfoque}};
}
let encuentros=[];
const bodyCache=new Map(),clipCache=new Map(),frontCache=new Map(),contactCache=new Map();let ultimaEscena=null;
// Tiempo por cuadro: lo que no entra se calcula en el cuadro siguiente (la placa no se congela con composiciones densas).
let presupuesto=Infinity,inicio=0,pendiente=false,hechos=0,arrastrando=false;const agotado=()=>hechos>0&&performance.now()-inicio>presupuesto; // al menos una tarea nueva por cuadro
return {
 BASE,FAMILIES,TODOS_LOS_PARAMETROS,meetingRules,meetingTypePair,estiloColonia,miembro,
 // Dibuja la placa entera con sus encuentros. valores = {strength,gapWidth,blur,contactBlur,grain} de la Placa de encuentros.
 escena(ancho,alto,colonias,valores,escalaPantalla=1,tiempo=Infinity,moviendo=false){
  // Si nada cambió desde el último dibujo (abrir un menú, tocar la leyenda), se devuelve el mismo.
  for(const c of colonias)c.sk=JSON.stringify([c.id,c.type,c.x,c.y,c.width,c.style,c.extra,c.parameters,!!c.sourceStyle]);
  const clave=JSON.stringify([ancho,alto,escalaPantalla,valores,colonias.map(c=>c.sk)]);
  if(ultimaEscena?.clave===clave)return ultimaEscena.resultado;
  RW=ancho;RH=alto;pixelesPorUnidad=escalaPantalla;encuentros=[];
  presupuesto=tiempo;inicio=performance.now();pendiente=false;hechos=0;arrastrando=moviendo;
  const imagen=renderMixedMeetings(colonias.filter(colony=>colony.style.opacity>0),valores);
  const resultado={imagen,encuentros,pendiente};
  ultimaEscena=pendiente||moviendo?null:{clave,resultado};
  return resultado;
 },
 // Una sola colonia, grande (vista previa del editor y miniaturas de la biblioteca).
 pintar(canvas,style,n,relleno=n/2){
  const fuente=sprite(style,n),lado=n+relleno*2;canvas.width=canvas.height=lado;
  const c=canvas.getContext('2d');c.clearRect(0,0,lado,lado);c.drawImage(fuente,relleno-n/2,relleno-n/2);
 },
};
})();
