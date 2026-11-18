// Copia de composition-generator.js del Muestrario de posibilidades (127.0.0.1:8765), 18/11/2026. Estructuras para GENERAR de TU PLACA.
// Adaptación del generador de COLONIAS para las composiciones del muestrario.
const composicionColonias = (() => {
const base={shape:'disk',gradient:'radial',size:65,elongation:65,separation:48,irregularity:8,studyLobes:0,studyDepth:35,studyUneven:35,studyDensity:0,filaments:0,detail:55,zones:4,focusCount:1,focusSpread:45,focusSize:24,focusX:0,focusY:0,featureX:0,featureY:0,featureSize:100,branchSpread:100,branchLength:100,branchDensity:7,branchForks:4,foldBreak:0,foldWidth:100,edgeSoft:0,edgeBlur:0,coreBlur:0,coreRadius:36,grainCenter:0,rotation:0,angle:0,midpoint:55,offset:0,blur:10,halo:14,grain:22,grainSize:1,porosity:0,core:35,ringWidth:5,arc:360,opacity:100,blend:'source-over',c1:'#ffc21c',c2:'#ff4c52',c3:'#f58bc3',background:'#fffbee',transparent:false,seed:125};
base.fiberWeight=100;
const presets={halo:{blur:35,core:65},capsule:{shape:'capsule',gradient:'linear',size:40,elongation:82,c1:'#27633f',c2:'#6a983a',c3:'#dce642',halo:5,irregularity:0,blur:0},pair:{shape:'pair',gradient:'linear',size:48,c1:'#ff4c52',c2:'#f58bc3',c3:'#dce642',halo:0,blur:0,irregularity:3,blend:'multiply'},ring:{shape:'ring',gradient:'linear',size:70,c1:'#ffc21c',c2:'#ff9c20',c3:'#ffc21c',blur:0,halo:0,ringWidth:3,porosity:12},arc:{shape:'arc',gradient:'linear',size:70,arc:240,ringWidth:4,c1:'#27633f',c2:'#6a983a',c3:'#dce642',blur:0,halo:0},fragment:{shape:'fragment',size:65,arc:105,blur:0,halo:0,porosity:30},mold:{shape:'disk',size:65,c1:'#27633f',c2:'#6a983a',c3:'#dce642',irregularity:20,filaments:70,grain:28,porosity:28,halo:12,core:65,blur:12},band:{shape:'band',gradient:'linear',size:43,c1:'#ff4c52',c2:'#f58bc3',c3:'#dce642',irregularity:4,halo:2,blur:0,grain:18}};
function hash(x,y,seed){let h=Math.imul(x,374761393)^Math.imul(y,668265263)^Math.imul(seed,1274126177);h=Math.imul(h^(h>>>13),1274126177);return ((h^(h>>>16))>>>0)/4294967295}
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const colorFamilies={green:['#27633f','#6a983a','#dce642'],yellow:['#ff9c20','#ffc21c','#dce642'],rose:['#ff4c52','#f58bc3','#ff4c52']};
function texturePaddingFraction(i){const s=i.style,size=(s.size??70)/200;let reach=1;if(s.shape==='capsule')reach=1+(s.elongation??0)/50;else if(s.shape==='pair')reach=.7+.9*(s.separation??50)/100;else if(s.shape==='band')reach=.5;else if(s.shape==='hairy')reach=1.5;else if(s.shape==='fan')reach=1+(s.detail??70)/100*.65;else if(s.shape==='branching')reach=1.3*Math.max(1,(s.branchLength??100)/100);else if(s.shape==='cotton')reach=1.3;return Math.max(0,size*reach-.5)+(s.halo??0)/200+Math.max(s.blur??10,s.edgeBlur??0)*3/760+4/64}

function generar({ structure, aspectRatio = 1, density = 55, seed, weights, random = Math.random,
                   nextItemId = 0, nextGroupId = 0 }) {
 const items = [], groups = [], sceneSeed = seed;
 const ratio = () => aspectRatio;
 const colorWeights = weights;
 let idCounter = nextItemId, groupCounter = nextGroupId, bandAngle = 0, bandPosition = 0;

function applyColorMix(){
 const targets=items.filter(i=>i.type==='shape'&&i.role!=='petri-rim');if(!targets.length)return;
 const keys=['green','yellow','rose'],sum=keys.reduce((n,k)=>n+Math.max(0,Number(colorWeights[k])||0),0);if(!sum)return;
 const quotas=keys.map(k=>{const exact=targets.length*Math.max(0,Number(colorWeights[k])||0)/sum;return{key:k,count:Math.floor(exact),fraction:exact-Math.floor(exact)}});
 let remainder=targets.length-quotas.reduce((n,q)=>n+q.count,0);for(const q of [...quotas].sort((a,b)=>b.fraction-a.fraction).slice(0,remainder))q.count++;
 const order=[...targets].sort((a,b)=>hash(a.id,510,sceneSeed)-hash(b.id,510,sceneSeed));let cursor=0;
 for(const q of quotas){const colors=colorFamilies[q.key];for(let n=0;n<q.count;n++){const item=order[cursor++];item.style.c1=colors[0];item.style.c2=colors[1];item.style.c3=colors[2]}}
}

function footprint(i){const margin=i.w*(.5+texturePaddingFraction(i));return{x:margin,y:margin/ratio()}}

function groupMembers(g){return g.type==='manual'?items.filter(i=>g.memberIds?.includes(i.id)):items.filter(i=>i.groupId===g.id||i.id===g.anchorId)}
function containGroup(g){
 const members=groupMembers(g);if(!members.length)return;
 const extent=()=>members.reduce((v,i)=>{const m=footprint(i);return {l:Math.min(v.l,i.x-m.x),r:Math.max(v.r,i.x+m.x),t:Math.min(v.t,i.y-m.y),b:Math.max(v.b,i.y+m.y)}},{l:Infinity,r:-Infinity,t:Infinity,b:-Infinity});
 let box=extent(),scale=Math.min(1,.96/(box.r-box.l),.96/(box.b-box.t));
 if(scale<1){for(const i of members){i.x=g.cx+(i.x-g.cx)*scale;i.y=g.cy+(i.y-g.cy)*scale;i.w*=scale}g.spacing*=scale;g.memberSize=(g.memberSize??.025)*scale;box=extent()}
 const dx=clamp(0,.02-box.l,.98-box.r),dy=clamp(0,.02-box.t,.98-box.b);g.cx+=dx;g.cy+=dy;for(const i of members){i.x+=dx;i.y+=dy}
}
function fitWholeScene(keepOffset=false){
 if(!items.length)return;
 const box=items.reduce((v,i)=>{const m=footprint(i);return {l:Math.min(v.l,i.x-m.x),r:Math.max(v.r,i.x+m.x),t:Math.min(v.t,i.y-m.y),b:Math.max(v.b,i.y+m.y)}},{l:Infinity,r:-Infinity,t:Infinity,b:-Infinity});
 const cx=keepOffset?.5:(box.l+box.r)/2,cy=keepOffset?.5:(box.t+box.b)/2,k=keepOffset?Math.min(1,.46/Math.max(Math.abs(box.l-.5),Math.abs(box.r-.5)),.46/Math.max(Math.abs(box.t-.5),Math.abs(box.b-.5))):Math.min(1,.92/(box.r-box.l),.92/(box.b-box.t));
 for(const i of items){i.x=.5+(i.x-cx)*k;i.y=.5+(i.y-cy)*k;i.w*=k}
 for(const g of groups){g.cx=.5+(g.cx-cx)*k;g.cy=.5+(g.cy-cy)*k;g.spacing*=k;g.memberSize=(g.memberSize??.025)*k}
}

function layoutGroup(g){
 const members=items.filter(i=>i.groupId===g.id),a=g.angle*Math.PI/180,r=ratio(),seed=g.seed??g.id,breaks=(g.breaks??50)/100;
 let offsets=[0];for(let k=1;k<members.length;k++){const h=hash(k,37,seed),gap=h>.7?1+breaks*(1.5+h*2):1-breaks*.45;offsets.push(offsets.at(-1)+gap)}
 const total=offsets.at(-1)||1;
 members.forEach((item,k)=>{const u=offsets[k]/total,jitter=(hash(k,9,seed)-.5)*g.scatter/100;let dx,dy;
 if(g.type==='axis'){dx=(offsets[k]-total/2)*g.spacing/100;dy=0;item.w=(g.memberSize??.028)*(.38+.62*(1-u))*(.72+.45*hash(k,5,seed))}
 else{const angle=u*(g.sweep??250)*Math.PI/180,radius=g.spacing/100*(1+jitter*.85);dx=Math.cos(angle)*radius;dy=Math.sin(angle)*radius;item.w=(g.memberSize??.025)*(.28+.72*hash(k,5,seed))}
 item.x=g.cx+dx*Math.cos(a)-dy*Math.sin(a);item.y=g.cy+(dx*Math.sin(a)+dy*Math.cos(a))/r;
 });containGroup(g)
}
function addGroup(type,cx=.5,cy=.5,count=9,spacing=type==='axis'?2.4:7){
 const g={id:++groupCounter,type,cx,cy,count,spacing,scatter:type==='axis'?20:38,angle:0,breaks:55,sweep:245,seed:sceneSeed+groupCounter*47,anchorId:null};
 if(type==='radial'){const anchor=newItem('mold',cx,cy,.15);Object.assign(anchor.style,{blur:48,porosity:40,core:75,filaments:38});items.push(anchor);g.anchorId=anchor.id}
 groups.push(g);const colors=type==='axis'?['#ff4c52','#ff9c20','#ffc21c']:['#27633f','#6a983a','#dce642'];
 for(let k=0;k<count;k++){const item=newItem(k%7===0?'ring':'halo');item.groupId=g.id;const col=colors[Math.floor(hash(k,4,g.seed)*colors.length)];Object.assign(item.style,{c1:col,c2:col,c3:col,size:82,blur:k%6===0?35:10,core:0,halo:0,grain:22,porosity:k%3===0?38:8,opacity:72+hash(k,3,g.seed)*24});items.push(item)}
 layoutGroup(g);return g;
}

function newItem(preset,x=.5,y=.5,w=.28){return {id:++idCounter,type:'shape',name:({halo:'Halo',capsule:'Cápsula',pair:'Pareja',ring:'Anillo',arc:'Arco',fragment:'Fragmento',mold:'Filamentos',band:'Banda',smoothcol:'Colonia lisa',wrinkled:'Colonia plegada',zoned:'Colonia zonada',cotton:'Cobertura algodonosa',hairy:'Colonia peluda',rimmed:'Colonia aureolada',spotted:'Colonia con manchas',branching:'Expansión ramificada',granular:'Colonia granular',fan:'Crecimiento unilateral',patchy:'Pigmentos irregulares'})[preset],x,y,w,style:{...base,...presets[preset],seed:Math.floor(random()*100000),blur:Math.max(10,presets[preset]?.blur??base.blur),transparent:true,blend:'source-over'}}}

function placeBand(angle,position){const r=ratio(),a=bandAngle*Math.PI/180,b=angle*Math.PI/180,d=b-a;const oldOffset=bandPosition/100,newOffset=position/100;for(const item of items){const x=item.x-.5+Math.sin(a)*oldOffset,y=(item.y-.5)*r-Math.cos(a)*oldOffset;item.x=.5+x*Math.cos(d)-y*Math.sin(d)-Math.sin(b)*newOffset;item.y=.5+(x*Math.sin(d)+y*Math.cos(d)+Math.cos(b)*newOffset)/r;if(item.type==='shape')item.style.rotation=((item.style.rotation+angle-bandAngle+540)%360)-180;}for(const g of groups){const x=g.cx-.5+Math.sin(a)*oldOffset,y=(g.cy-.5)*r-Math.cos(a)*oldOffset;g.cx=.5+x*Math.cos(d)-y*Math.sin(d)-Math.sin(b)*newOffset;g.cy=.5+(x*Math.sin(d)+y*Math.cos(d)+Math.cos(b)*newOffset)/r;g.angle=((g.angle+angle-bandAngle+540)%360)-180;}bandAngle=angle;bandPosition=position;fitWholeScene()}

function arrangeComposition(logic){
 if(logic==='grid'){
  // Retícula proporcional: cruces para cuerpos principales y ejes ortogonales para secuencias.
  const cols=6,rows=6,stepX=.72/(cols-1),stepY=stepX/ratio(),grouped=new Set();
  const cells=[];for(let row=1;row<rows-1;row++)for(let col=1;col<cols-1;col++)cells.push({col,row});
  cells.sort((a,b)=>hash(a.col,a.row,sceneSeed)-hash(b.col,b.row,sceneSeed));
  const firstVertical=hash(23,79,sceneSeed)<.5;
  for(const [n,g]of groups.filter(g=>g.type!=='manual').entries()){
   const cell=cells[n%cells.length];g.type='axis';g.angle=(n%2===0)===firstVertical?90:0;g.breaks=0;g.scatter=0;
   g.cx=.14+cell.col*stepX;g.cy=.14+cell.row*stepY;
   const room=g.angle===0?Math.min(g.cx,1-g.cx):Math.min(g.cy,1-g.cy)*ratio();
   g.spacing=Math.min(Math.min(stepX,stepY*ratio())*100*(.16+hash(n,83,sceneSeed)*.16),Math.max(.25,(room-.08)*200/Math.max(1,g.count-1)));
   if(g.anchorId){const anchor=items.find(i=>i.id===g.anchorId);if(anchor){anchor.x=g.cx;anchor.y=g.cy;grouped.add(anchor.id)}}
   layoutGroup(g);for(const i of items.filter(i=>i.groupId===g.id))grouped.add(i.id);
  }
  const gridSites=(columns,lines)=>{
   const sites=[];
   for(let row=0;row<lines;row++)for(let col=0;col<columns;col++){
    sites.push({x:.14+.72*col/(columns-1),y:.14+.72*row/(lines-1)/ratio(),rank:hash(col+63,row+71,sceneSeed)});
   }
   return sites.sort((a,b)=>a.rank-b.rank);
  };
  const anchors=gridSites(cols,rows),satellites=gridSites(16,16);
  let nextAnchor=0;
  for(const item of items){if(grouped.has(item.id))continue;
   const site=item.densityIndex===undefined?anchors[nextAnchor++%anchors.length]:satellites[item.densityIndex];
   item.x=site.x;item.y=site.y;
  }
  return;
 }

 const r=ratio(),seed=sceneSeed,centers=logic==='constellation'?[[.22,.23],[.72,.30],[.40,.70],[.80,.80]]:[[.25,.28],[.73,.40],[.42,.76]];
 const locate=(n,spread=.12)=>{const a=hash(n,31,seed)*Math.PI*2,t=Math.sqrt(hash(n,39,seed));if(logic==='radial')return [.5+Math.cos(a)*(.15+t*.24),.5+Math.sin(a)*(.15+t*.24)];if(logic==='field')return [.09+hash(n,43,seed)*.82,.09+hash(n,47,seed)*.82];const c=centers[n%centers.length];return [c[0]+Math.cos(a)*t*spread,c[1]+Math.sin(a)*t*spread]};
 const grouped=new Set();for(const [n,g]of groups.filter(g=>g.type!=='manual').entries()){const [x,y]=locate(n,0);const dx=x-g.cx,dy=y-g.cy;g.cx=x;g.cy=y;for(const i of items.filter(i=>i.groupId===g.id||i.id===g.anchorId)){i.x+=dx;i.y+=dy;grouped.add(i.id)}}
 let n=0;for(const i of items){if(grouped.has(i.id))continue;const [x,y]=locate(n++,i.role==='mass'?.03:logic==='constellation'?.08:.18);i.x=x;i.y=y;}
}

 const rnd = k => hash(k, sceneSeed, sceneSeed), r = ratio();
 // Tres concentraciones desiguales dentro de una sola banda; sus extremos se disuelven.
 const centers=[{x:.16+rnd(1)*.07,y:.5+(rnd(2)-.5)*.06/r},{x:.48+rnd(3)*.10,y:.5+(rnd(4)-.5)*.1/r},{x:.87+rnd(5)*.05,y:.5+(rnd(6)-.5)*.07/r}];
 const families={rose:['#ff4c52','#f58bc3','#f58bc3'],amber:['#ff9c20','#ffc21c','#ffc21c'],green:['#27633f','#6a983a','#dce642']};
 let variationIndex=0;
 function put(preset,x,y,w,family,extra={}){const n=variationIndex++,v=k=>rnd(3000+n*17+k);if(w>.035&&preset==='halo'&&v(1)<.28)preset=v(2)<.5?'pair':'capsule';if(w>.035&&families[family]&&v(3)<.38)family=['rose','amber','green'][Math.floor(v(4)*3)];w*=w>.035?.65+v(5)*.75:.75+v(5)*.5;x+=(v(6)-.5)*.09;y+=(v(7)-.5)*.12/r;const item=newItem(preset,x,y,w),cs=families[family]??[family,family,family];Object.assign(item.style,{c1:cs[0],c2:cs[1],c3:cs[2],seed:Math.floor(v(8)*100000),size:78,blur:10,core:0,grain:28,porosity:20,halo:0,opacity:75,irregularity:2},extra);if(item.style.shape==='capsule')Object.assign(item.style,{shape:'fan',detail:Math.round(75+item.style.elongation*1.15)});item.role=w>.16?'mass':w>.035?'body':'satellite';items.push(item);return item}
 // Pocas masas amplias, tratadas de modo distinto y separadas por aperturas.
 put('halo',centers[0].x-.045,centers[0].y-.035/r,.24,'rose',{opacity:62,porosity:42,blur:13});
 put('halo',centers[1].x+.01,centers[1].y+.035/r,.20,'amber',{opacity:53,porosity:45});
 put('halo',centers[2].x+.065,centers[2].y-.065/r,.28,'rose',{opacity:52,porosity:64,blur:15});
 // Cuerpos que conectan las concentraciones, alternando por encima y debajo del eje.
 const bridges=[{x:.32,y:-.035,w:.13,f:'rose'},{x:.43,y:.065,w:.115,f:'amber'},{x:.49,y:-.060,w:.16,f:'rose'},{x:.66,y:.025,w:.12,f:'green'},{x:.77,y:-.010,w:.105,f:'rose'}];
 bridges.forEach((b,k)=>{if(rnd(k+710)<.72)put('halo',b.x+(rnd(k+700)-.5)*.10,.5+b.y/r,b.w,b.f,{opacity:k===2?57:72,porosity:k%2?12:28,blur:10,blend:k===3?'multiply':'source-over'})});
 // Cuerpos medianos y cápsulas que atraviesan la dirección principal.
 centers.forEach((center,k)=>{
  for(let j=0;j<3+Math.floor(rnd(k+820)*4);j++){const u=k*100+j,x=center.x+(rnd(u+120)-.5)*.24,y=center.y+(rnd(u+150)-.5)*.24/r;
   const family=['rose','amber','green'][(j+k)%3],preset=j===3?'capsule':j===4?'pair':'halo';
   put(preset,x,y,.055+rnd(u+180)*.075,family,{opacity:62+rnd(u+220)*28,blur:j===1?40:10,porosity:j===2?46:10,blend:j%3===0?'multiply':'source-over'});
  }
  put('capsule',center.x+.04,center.y+.045/r,.18,'green',{size:48,opacity:80,elongation:92,porosity:27,gradient:'linear'});
 });
 // Anillos finos, fragmentos y arcos: acentos discretos que dejan ver el fondo.
 put('ring',.70,.5-.105/r,.105,'#ff9c20',{ringWidth:2,porosity:22,opacity:90});
 put('arc',.32,.5+.11/r,.085,'#dce642',{arc:265,ringWidth:4,rotation:22,porosity:32});
 put('fragment',.81,.5+.06/r,.09,'rose',{arc:115,rotation:40,porosity:45,opacity:58});
 // La densidad revela satélites de una reserva fija. Los cuerpos y las secuencias
 // conservan su identidad y su posición cuando cambia la cantidad de satélites.
 const capacity=132;
 const visibleCount=Math.round(8+(capacity-8)*clamp((density-15)/85));
 for(let j=0;j<capacity;j++){const k=1000+j,cluster=Math.floor(rnd(k)*3),center=centers[cluster];const a=rnd(k+300)*Math.PI*2,dist=Math.pow(rnd(k+600),.8),x=center.x+Math.cos(a)*dist*.17,y=center.y+Math.sin(a)*dist*.125/r;
  const w=.011+Math.pow(rnd(k+900),1.65)*.040,family=['#ff4c52','#f58bc3','#ffc21c','#dce642','#27633f'][Math.floor(rnd(k+1500)*5)];
  const item=put(j%19===0?'pair':'halo',x,y,w,family,{porosity:j%6===0?50:5,opacity:60+rnd(k+1200)*35,grain:18});
  item.densityIndex=j;
 }
 // Secuencias pequeñas con pausas; arcos radiales incompletos alrededor de dos centros.
 const axis1=addGroup('axis',.12+rnd(881)*.2,.5-.095/r,7+Math.floor(rnd(882)*9),1.1+rnd(883));axis1.angle=0;axis1.memberSize=.016+rnd(884)*.015;axis1.breaks=72;layoutGroup(axis1);
 if(rnd(885)>.3){const axis2=addGroup('axis',.65+rnd(886)*.2,.5+.10/r,7+Math.floor(rnd(887)*9),1+rnd(888));axis2.angle=0;axis2.memberSize=.018+rnd(889)*.015;axis2.breaks=60;layoutGroup(axis2)}
 const radial1=addGroup('radial',.25+rnd(890)*.2,.5+.045/r,7+Math.floor(rnd(891)*9),4+rnd(892)*4);radial1.sweep=150+rnd(893)*130;radial1.angle=18;radial1.memberSize=.021;layoutGroup(radial1);
 if(rnd(894)>.3){const radial2=addGroup('radial',.7+rnd(895)*.2,.5-.025/r,7+Math.floor(rnd(896)*9),4+rnd(897)*3);radial2.sweep=130+rnd(898)*120;radial2.angle=-125;radial2.memberSize=.018;layoutGroup(radial2)}
 // Envolventes desenfocadas con núcleo independiente, por detrás del texto.
 put('mold',.35,.5+.045/r,.15,'green',{filaments:70,core:72,blur:38,porosity:35,opacity:88});
 put('halo',.63,.5-.08/r,.14,'rose',{core:80,blur:90,porosity:14,opacity:84});
 // Acentos de la composición en las posiciones que flanqueaban el título.
 put('halo',.414,.481,.036,'#f58bc3',{opacity:65,porosity:12});
 put('ring',.53,.517,.027,'#dce642',{ringWidth:8,opacity:60});
 if (structure !== "band") arrangeComposition(structure);
 if (structure!=='grid') placeBand(0, 0);
 applyColorMix();
 const visible=items.filter(item=>item.densityIndex===undefined||item.densityIndex<visibleCount);
 return { items:visible, extentItems:items, groups, idCounter, groupCounter, bandAngle, bandPosition, selected: null };
}

return { generar, texturePaddingFraction };
})();
