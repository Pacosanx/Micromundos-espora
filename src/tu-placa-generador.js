const generarComposicionTuPlaca=(()=>{

// Generador independiente de la composición Placa de herramientas/colonias.
// No accede al DOM. Las coordenadas y anchuras de salida están normalizadas.
const BASE = {
  shape:'disk', gradient:'radial', size:65, elongation:65, separation:48,
  irregularity:8, studyLobes:0, studyDepth:35, studyUneven:35, studyDensity:0,
  filaments:0, detail:55, zones:4, focusCount:1, focusSpread:45, focusSize:24,
  focusX:0, focusY:0, featureX:0, featureY:0, featureSize:100,
  branchSpread:100, branchLength:100, branchDensity:7, branchForks:4,
  foldBreak:0, foldWidth:100, edgeSoft:0, edgeBlur:0, coreBlur:0, coreRadius:36,
  grainCenter:0, rotation:0, angle:0, midpoint:55, offset:0, blur:10, halo:14,
  grain:22, grainSize:1, porosity:0, core:35, ringWidth:5, arc:360, opacity:100,
  blend:'source-over', c1:'#ffc21c', c2:'#ff4c52', c3:'#f58bc3',
  background:'#fffbee', transparent:false, seed:125, fiberWeight:100
};
const PRESETS = {
  halo:{blur:35,core:65},
  ring:{shape:'ring',gradient:'linear',size:70,c1:'#ffc21c',c2:'#ff9c20',c3:'#ffc21c',blur:0,halo:0,ringWidth:3,porosity:12},
  mold:{shape:'disk',size:65,c1:'#27633f',c2:'#6a983a',c3:'#dce642',irregularity:20,filaments:70,grain:28,porosity:28,halo:12,core:65,blur:12},
  pair:{shape:'pair',gradient:'linear',size:48,c1:'#ff4c52',c2:'#f58bc3',c3:'#dce642',halo:0,blur:0,irregularity:3,blend:'multiply'}
};
const COLORS = [
  ['#ff4c52','#f58bc3','#fffbee'], ['#ff9c20','#ffc21c','#fffbee'],
  ['#27633f','#6a983a','#dce642'], ['#f58bc3','#ff4c52','#ffc21c']
];
function hash(x,y,seed){let h=Math.imul(x,374761393)^Math.imul(y,668265263)^Math.imul(seed,1274126177);h=Math.imul(h^(h>>>13),1274126177);return ((h^(h>>>16))>>>0)/4294967295}
function clamp(x,a,b){return Math.min(b,Math.max(a,x))}
function texturePaddingFraction(i){const s=i.style,size=(s.size??70)/200;let reach=1;if(s.shape==='capsule')reach=1+(s.elongation??0)/50;else if(s.shape==='pair')reach=.7+.9*(s.separation??50)/100;else if(s.shape==='band')reach=.5;else if(s.shape==='hairy')reach=1.5;else if(s.shape==='fan')reach=1.7;else if(s.shape==='branching')reach=1.3*Math.max(1,(s.branchLength??100)/100);else if(s.shape==='cotton')reach=1.3;return Math.max(0,size*reach-.5)+(s.halo??0)/200+Math.max(s.blur??10,s.edgeBlur??0)*3/760+4/64}
function footprint(i){const margin=i.w*(.5+texturePaddingFraction(i));return{x:margin,y:margin}}

function generarComposicionTuPlaca(seed=Math.floor(Math.random()*1e9)){
  const density=55, diameter=.76, rnd=k=>hash(k,seed,seed), rotation=rnd(10)*Math.PI*2, turn=rnd(11)<.5?1:-1;
  let nextId=0, serial=0;
  const items=[];
  function newItem(preset,x,y,w){return {id:++nextId,type:'shape',x,y,w,style:{...BASE,...PRESETS[preset],seed:Math.floor(Math.random()*100000),blur:Math.max(10,PRESETS[preset]?.blur??BASE.blur),transparent:true,blend:'source-over'}}}
  function colony(x,y,w,preset,family,kind){
    const k=serial++,limit=Math.max(0,diameter*.38-w*.48),dist=Math.hypot(x,y);if(dist>limit){x*=limit/dist;y*=limit/dist}
    const item=newItem(preset,.5+x,.5+y,w),c=COLORS[family%COLORS.length];
    Object.assign(item.style,{c1:c[0],c2:c[1],c3:c[2],size:kind==='fine'?68:78,blur:kind==='soft'?32+rnd(k+90)*20:10+rnd(k+90)*8,halo:kind==='soft'?12:2,core:kind==='soft'?25:65+rnd(k+180)*25,grain:18+rnd(k+280)*25,porosity:kind==='rough'?35+rnd(k+380)*30:5+rnd(k+380)*18,irregularity:kind==='rough'?22:3,opacity:65+rnd(k+480)*30,seed:Math.floor(rnd(k+580)*100000)});
    item.familia=family;items.push(item);return item;
  }
  const rim=newItem('ring',.5,.5,diameter);rim.role='petri-rim';Object.assign(rim.style,{size:85,ringWidth:2,blur:10,halo:0,grain:18,opacity:48,c1:'#27633f',c2:'#6a983a',c3:'#dce642'});items.push(rim);
  const family0=Math.floor(rnd(32)*COLORS.length),anchors=[];
  for(let j=0;j<3;j++){const angle=rotation+j*2.1,rad=diameter*.12,wash=colony(Math.cos(angle)*rad,Math.sin(angle)*rad,diameter*(.38+rnd(40+j)*.1),'halo',(family0+j)%COLORS.length,'soft');Object.assign(wash.style,{opacity:30,core:0,blur:55,porosity:20})}
  for(let j=0;j<4;j++){
    const w=diameter*(.29+rnd(60+j)*.09),angle=rotation+turn*(j*1.8+.2),prev=anchors[j-1];
    let x=j===0?Math.cos(angle)*diameter*.10:prev.x+Math.cos(angle)*(prev.w+w)*.26;
    let y=j===0?Math.sin(angle)*diameter*.10:prev.y+Math.sin(angle)*(prev.w+w)*.26;
    const limit=diameter*.38-w*.48,d=Math.hypot(x,y);if(d>limit){x*=limit/d;y*=limit/d}
    const item=colony(x,y,w,j%2?'halo':'mold',(family0+j)%COLORS.length,j%2?'smooth':'rough');anchors.push({x,y,w,family:(family0+j)%COLORS.length,item});
  }
  for(let j=0;j<anchors.length;j++)if(rnd(850+j)>.35){const a=anchors[j],rimItem=colony(a.x,a.y,a.w*(.70+rnd(860+j)*.16),'ring',a.family,'smooth');Object.assign(rimItem.style,{ringWidth:3+rnd(870+j)*4,blur:10,opacity:48,core:0})}
  const medium=12+Math.round(density*.13);
  for(let j=0;j<medium;j++){const a=anchors[j%anchors.length],angle=rotation+turn*(j*2.4+rnd(100+j)*.6),w=diameter*(.075+rnd(200+j)*.075),rad=(a.w+w)*(.25+rnd(300+j)*.12);colony(a.x+Math.cos(angle)*rad,a.y+Math.sin(angle)*rad,w,j%6===0?'ring':'halo',j%3===0?(a.family+1)%COLORS.length:a.family,j%5===0?'rough':'smooth')}
  const first=anchors[Math.floor(rnd(880)*anchors.length)],second=anchors[(anchors.indexOf(first)+1)%anchors.length],trail=9+Math.round(density/12),joinAngle=Math.atan2(second.y-first.y,second.x-first.x);
  const smallLogic=Math.min(2,Math.floor(rnd(1200)*3));
  function behind(item,anchor){const pos=items.indexOf(item),before=items.indexOf(anchor.item);if(pos>=0&&before>=0&&pos>before){items.splice(pos,1);items.splice(before,0,item)}}
  if(smallLogic!==1)for(let j=0;j<trail;j++){const angle=joinAngle+(j/(trail-1)-.5)*1.35,rad=first.w*(.39+(rnd(900+j)-.5)*.10),w=diameter*(.014+rnd(930+j)*.024),item=colony(first.x+Math.cos(angle)*rad,first.y+Math.sin(angle)*rad,w,'halo',j%3===0?second.family:first.family,'fine');if(j%3!==0)behind(item,first)}
  const small=18+Math.round(density*.32);
  for(let j=0;j<small;j++){const n=Math.floor(rnd(1250+j)*anchors.length),a=anchors[n],next=anchors[(n+1)%anchors.length],onEdge=smallLogic===0||(smallLogic===2&&rnd(1350+j)<.5),baseAngle=Math.atan2(next.y-a.y,next.x-a.x),angle=onEdge?baseAngle+(rnd(500+j)-.5)*2.3:rnd(500+j)*Math.PI*2,rad=onEdge?a.w*(.39+(rnd(600+j)-.5)*.17):a.w*.32*Math.sqrt(rnd(600+j)),w=diameter*(.012+Math.pow(rnd(700+j),2)*.028),item=colony(a.x+Math.cos(angle)*rad,a.y+Math.sin(angle)*rad,w,j%11===0?'pair':'halo',j%4===0?(a.family+1)%COLORS.length:a.family,'fine');if(onEdge&&j%4!==0)behind(item,a)}

  // Misma distribución entera de applyColorMix; IDs contiguos incluyen el aro omitido.
  const targets=items.filter(i=>i.role!=='petri-rim'),weights={green:33,yellow:33,rose:34},keys=['green','yellow','rose'];
  const quotas=keys.map(k=>{const exact=targets.length*weights[k]/100;return{key:k,count:Math.floor(exact),fraction:exact-Math.floor(exact)}});
  let remainder=targets.length-quotas.reduce((n,q)=>n+q.count,0);for(const q of [...quotas].sort((a,b)=>b.fraction-a.fraction).slice(0,remainder))q.count++;
  const familyColors={green:['#27633f','#6a983a','#dce642'],yellow:['#ff9c20','#ffc21c','#dce642'],rose:['#ff4c52','#f58bc3','#ff4c52']};
  const order=[...targets].sort((a,b)=>hash(a.id,510,seed)-hash(b.id,510,seed));let cursor=0;
  for(const q of quotas)for(let n=0;n<q.count;n++){const item=order[cursor++],c=familyColors[q.key];item.style.c1=c[0];item.style.c2=c[1];item.style.c3=c[2];item.familia=q.key}

  // Replica fitWholeScene(): el aro participa en el encuadre y se quita del resultado.
  const box=items.reduce((v,i)=>{const m=footprint(i);return{l:Math.min(v.l,i.x-m.x),r:Math.max(v.r,i.x+m.x),t:Math.min(v.t,i.y-m.y),b:Math.max(v.b,i.y+m.y)}},{l:Infinity,r:-Infinity,t:Infinity,b:-Infinity});
  const cx=(box.l+box.r)/2,cy=(box.t+box.b)/2,k=Math.min(1,.92/(box.r-box.l),.92/(box.b-box.t));
  for(const i of items){i.x=.5+(i.x-cx)*k;i.y=.5+(i.y-cy)*k;i.w*=k}
  const resultado=items.filter(i=>i.role!=='petri-rim').map(({x,y,w,style,familia})=>({x,y,w,style,familia}));resultado.diametroAro=rim.w*rim.style.size/100;return resultado;
}

return generarComposicionTuPlaca;})();
if(typeof module!=='undefined'&&module.exports)module.exports={generarComposicionTuPlaca};
