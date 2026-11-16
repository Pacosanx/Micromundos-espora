// Lógica circular del boceto de Claude; superficies e iconos de Figma 560:20341.
function montarMenuTuPlaca(host,{obtener,cambiar,quitar,empezar,terminar}){
  const nombres={tamano:'Tamaño',opacidad:'Opacidad',duplicar:'Multiplicar',foco:'Foco',variacion:'Variación',girar:'Girar'};
  const orden=Object.keys(nombres),angulos={tamano:270,opacidad:330,duplicar:30,foco:90,variacion:150,girar:210};
  const R=94,ns='http://www.w3.org/2000/svg',ruta='src/assets/tu-placa/';let activo=null,geometria=null,arrastre=null;
  host.className='tp-menu';host.hidden=true;
  host.innerHTML=`<img class="tp-menu-circunferencia" src="${ruta}tp-menu-ring.svg" alt=""><svg class="tp-menu-guia" viewBox="-140 -140 280 280" aria-hidden="true"><path class="tp-menu-arco"/><path class="tp-menu-compacto"/><path class="tp-menu-flechas"/><path class="tp-menu-toque"/></svg>`;
  const svg=host.querySelector('svg'),arco=svg.querySelector('.tp-menu-arco'),compacto=svg.querySelector('.tp-menu-compacto'),flechas=svg.querySelector('.tp-menu-flechas'),toque=svg.querySelector('.tp-menu-toque');
  const botones=new Map();
  for(const k of orden){
    const b=document.createElement('button');b.type='button';b.dataset.accion=k;b.className='tp-menu-boton';
    b.innerHTML=`<img class="tp-menu-superficie" alt="" src="${ruta}tp-boton${k==='tamano'?'-tamano':k==='duplicar'?'-duplicar':''}.svg"><img class="tp-menu-icono" alt="" src="${ruta}tp-${k==='opacidad'?'orden':k}.svg"><span>${nombres[k]}</span><output></output>`;
    b.setAttribute('aria-label',nombres[k]);host.appendChild(b);botones.set(k,b);
    b.addEventListener('pointerdown',ev=>{ev.stopPropagation();if(b.disabled)return;const nuevo=activo!==k;if(nuevo)activar(k);iniciar(ev,false);arrastre.recienActivado=nuevo;});
    b.addEventListener('keydown',ev=>{
      if(['Enter',' '].includes(ev.key)){ev.preventDefault();if(b.disabled)return;if(activo===k){activo=null;dibujar();}else activar(k);}
      if(activo===k&&['ArrowLeft','ArrowDown','ArrowRight','ArrowUp','Home','End'].includes(ev.key)){
        ev.preventDefault();empezar();const t=ev.key==='Home'?0:ev.key==='End'?1:normalizado(k)+(ev.key==='ArrowLeft'||ev.key==='ArrowDown'?-.025:.025);asignar(k,t);terminar();dibujar();
      }
    });
  }
  function normalizado(k){const s=obtener();return k==='tamano'?Math.log(s.escala/50)/Math.log(4):k==='girar'?(s.rot+180)/360:k==='foco'?s.foco/100:k==='variacion'?(s.seed%1000)/999:k==='opacidad'?(s.opacidad??100)/100:s.duplicados/24;}
  function asignar(k,t){t=Math.max(0,Math.min(1,t));cambiar(k,k==='tamano'?50*4**t:k==='girar'?-180+360*t:k==='foco'?Math.round(t*100):k==='variacion'?Math.round(t*999):k==='opacidad'?Math.round(t*100):Math.round(t*24));}
  const punto=a=>[Math.cos(a*Math.PI/180)*R,Math.sin(a*Math.PI/180)*R];
  const segmento=(a,b)=>{const p=punto(a),q=punto(b);return `M${p[0]},${p[1]}A${R},${R} 0 ${b-a>180?1:0} 1 ${q[0]},${q[1]}`;};
  function activar(k){activo=k;const a0=angulos[k]-normalizado(k)*180;geometria={a0,comp:a0+270};dibujar();}
  function dibujar(){
    if(!obtener())return;
    host.classList.toggle('tp-menu-activo',!!activo);host.querySelector('.tp-menu-circunferencia').hidden=!!activo;
    if(activo){
      arco.setAttribute('d',segmento(geometria.a0,geometria.a0+180));compacto.setAttribute('d',segmento(geometria.comp-67,geometria.comp+67));toque.setAttribute('d',arco.getAttribute('d'));
      flechas.setAttribute('d',[0,180].map((v,i)=>{const a=geometria.a0+v,p=punto(a),rad=(a+(i?90:-90))*Math.PI/180,dx=Math.cos(rad),dy=Math.sin(rad);return `M${p[0]-dx*10-dy*5},${p[1]-dy*10+dx*5}L${p[0]},${p[1]}L${p[0]-dx*10+dy*5},${p[1]-dy*10-dx*5}`;}).join(''));
    }
    for(const [k,b]of botones){
      b.disabled=false;b.title='';
      let a=angulos[k];if(activo){const j=(orden.indexOf(k)-orden.indexOf(activo)+6)%6;a=k===activo?geometria.a0+normalizado(k)*180:geometria.comp-60+(j-1)*30;}
      const [x,y]=punto(a),replegado=!!activo&&k!==activo;b.style.transform=`translate(${x}px,${y}px) scale(${replegado?.72:1})`;b.classList.toggle('tp-menu-secundario',replegado);
      b.classList.toggle('tp-menu-elegido',k===activo);b.setAttribute('aria-pressed',String(k===activo));
      const texto=b.querySelector('span');texto.style.left=x>23?'55px':x< -23?'auto':'24px';texto.style.right=x< -23?'55px':'auto';texto.style.top=y< -23?'-19px':y>23?'48px':'15px';texto.style.transform=Math.abs(x)<=23?'translateX(-50%)':'none';
      const valor=b.querySelector('output');valor.hidden=k!==activo;
      if(k===activo){const s=obtener();valor.textContent=k==='tamano'?Math.round(s.escala)+'%':k==='girar'?Math.round(s.rot)+'°':k==='foco'?s.foco:k==='variacion'?s.seed:k==='opacidad'?(s.opacidad??100)+'%':'+'+s.duplicados;b.setAttribute('aria-label',nombres[k]+': '+valor.textContent);}
    }
  }
  function mover(ev){if(!arrastre)return;const r=host.getBoundingClientRect(),a=Math.atan2(ev.clientY-r.top,ev.clientX-r.left)*180/Math.PI,c=geometria.a0+90,delta=((a-c+540)%360+360)%360-180;
    if(Math.hypot(ev.clientX-arrastre.x,ev.clientY-arrastre.y)>5)arrastre.movido=true;asignar(activo,(delta+90)/180);dibujar();}
  function iniciar(ev,saltar){ev.preventDefault();ev.stopPropagation();empezar();arrastre={x:ev.clientX,y:ev.clientY,movido:false};host.classList.add('tp-menu-ajustando');if(saltar){mover(ev);arrastre.movido=true;}host.setPointerCapture?.(ev.pointerId);}
  function soltar(){if(!arrastre)return;const movido=arrastre.movido,nuevo=arrastre.recienActivado;arrastre=null;host.classList.remove('tp-menu-ajustando');terminar();if(!movido&&!nuevo)activo=null;dibujar();}
  toque.addEventListener('pointerdown',ev=>iniciar(ev,true));host.addEventListener('pointermove',mover);host.addEventListener('pointerup',soltar);host.addEventListener('pointercancel',soltar);
  function cerrar(){host.hidden=true;activo=null;arrastre=null;host.classList.remove('tp-menu-ajustando');}
  return {abrir(x,y){activo=null;host.hidden=false;this.situar(x,y);dibujar();},situar(x,y){host.style.left=x+'px';host.style.top=y+'px';},cerrar,actualizar:dibujar};
}
