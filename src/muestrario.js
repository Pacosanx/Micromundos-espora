// Posiciones de Figma 396:8524. Se reutilizan los canvas y la identidad de cada muestra.
function prepararMuestrario(){
  const porCodigo=new Map(GUIA_MUESTRARIO.items.map(it=>[it.codigo,it]));
  const cron=[...muestras].sort((a,b)=>a.fecha-b.fecha);
  cron.forEach((s,i)=>{
    const it=porCodigo.get(s.codigo);
    const celda=it||{x:4+(i%17)*79.470588,y:Math.floor(i/17)*78.666667,width:79.470588,height:78.666667};
    // Comprimir la amplitud de tamaños permite leer las pequeñas dentro de una celda de ~80 px.
    const diametro=26+34*clamp((s.d-D_MIN)/(D_MAX-D_MIN));
    s.grilla={x:celda.x+celda.width/2,y:celda.y+celda.height/2,factor:diametro/s.d};
  });
}
function posicionMuestrario(s){
  const g=GUIA_MUESTRARIO,m=marcoMuestrario();
  return {x:m.x+s.grilla.x*m.width/g.width,y:m.y+s.grilla.y*m.height/g.height,
    factor:s.grilla.factor*Math.min(1,m.width/g.width,m.height/g.height)};
}
function ajustarZonaMuestras(){
  const enc=encuadreEsquema(),alcance=(RADIO_VINCULOS+60)*enc.k;
  let x=enc.x-alcance,y=enc.y-alcance,derecha=enc.x+alcance,abajo=enc.y+alcance;
  if(mezclaMuestrario>0||vista==='muestrario'){
    const m=marcoMuestrario();
    x=Math.min(x,m.x);y=Math.min(y,m.y);
    derecha=Math.max(derecha,m.x+m.width);abajo=Math.max(abajo,m.y+m.height);
  }
  Object.assign($('toque').style,{left:x+'px',top:y+'px',width:(derecha-x)+'px',height:(abajo-y)+'px'});
  const filtro=$('texturaVinculos'),firma=[x,y,derecha,abajo].join(',');
  if(filtro.dataset.zona!==firma){
    for(const [k,v] of Object.entries({x,y,width:derecha-x,height:abajo-y}))filtro.setAttribute(k,v);
    filtro.dataset.zona=firma;
  }
}
