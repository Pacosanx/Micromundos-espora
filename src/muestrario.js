// Posiciones de Figma 396:8524. Se reutilizan los canvas y la identidad de cada muestra.
function prepararMuestrario(){
  const porCodigo=new Map(GUIA_MUESTRARIO.items.map(it=>[it.codigo,it]));
  const cron=[...muestras].sort((a,b)=>a.fecha-b.fecha);
  cron.forEach((s,i)=>{
    const it=porCodigo.get(s.codigo);
    const celda=it||{x:4+(i%17)*79.470588,y:Math.floor(i/17)*78.666667,width:79.470588,height:78.666667};
    // Comprimir la amplitud de tamaños permite leer las pequeñas dentro de una celda de ~80 px.
    // 19/11/2026 (Paco): las colonias se apoyan en una línea de base común a cada fila (como letras en un renglón) y el
    // código va debajo de esa línea. La mayor baja de 60 a 48 px para que el código quede siempre más cerca de su colonia
    // que de la fila de abajo. BASE: la línea, 22 px bajo el centro de la celda.
    const diametro=24+24*clamp((s.d-D_MIN)/(D_MAX-D_MIN)),BASE=22;
    s.grilla={x:celda.x+celda.width/2,y:celda.y+celda.height/2+BASE-diametro/2,factor:diametro/s.d,diametro};
    const cod=document.createElement('span');cod.textContent=s.codigo;$('codigosMuestrario').appendChild(cod);s.codEl=cod;
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
}
