// Lente circular sobre un campo microscópico continuo, anclado a la placa.
// mapa (opcional): dónde está la lente sobre la imagen de la placa (u, v y radio en fracciones de esa imagen).
type Posicion = {x:number;y:number;ancho:number;alto:number;mapa?:{u:number;v:number;radio:number}};
const diametro=429;
// 19/11/2026 (Paco): la imagen microscópica es el doble de grande que la placa (antes .72, ahora .36 de extensión):
// la lente muestra la mitad de campo y, al mover el dedo, el campo corre el doble de rápido.
const AUMENTO=.36;
const vertex=`attribute vec2 a_pos; varying vec2 v_uv;
void main(){v_uv=a_pos*.5+.5;gl_Position=vec4(a_pos,0.,1.);}`;
const fragment=`precision highp float;
varying vec2 v_uv;
uniform sampler2D u_imagen;
uniform vec2 u_centro,u_extension,u_texel;
uniform sampler2D u_densidad;uniform vec3 u_mapa;uniform float u_conMapa;
// 19/11/2026 (Paco): concentración de células según la placa. Sobre una colonia se suma otra capa de células; donde no
// hay colonias, las células se apagan hacia el fondo crema. Es una aproximación, no una lectura real.
const vec3 FONDO=vec3(.949,.902,.851);
float celula(vec3 c){return clamp((length(c-FONDO)-.04)*4.,0.,1.);}
vec2 campo(vec2 p){vec2 uv=u_centro+p*.5*u_extension;return vec2(uv.y,1.-uv.x);}
vec3 muestra(vec2 p,float desenfoque){
 vec2 uv=campo(p),d=u_texel*desenfoque;
 return texture2D(u_imagen,uv).rgb*.4+
 (texture2D(u_imagen,uv+vec2(d.x,0.)).rgb+texture2D(u_imagen,uv-vec2(d.x,0.)).rgb+
 texture2D(u_imagen,uv+vec2(0.,d.y)).rgb+texture2D(u_imagen,uv-vec2(0.,d.y)).rgb)*.15;
}
void main(){
 vec2 p=vec2(v_uv.x,1.-v_uv.y)*2.-1.;float r=length(p);
 if(r>1.)discard;
 // Centro casi uniforme; el vidrio curva y separa colores en el último 28% del radio.
 float borde=smoothstep(.72,1.,r);
 float curvatura=.72+.012*r*r+.18*borde*borde;
 float dispersion=.028*borde*borde;
 float desenfoque=.35+4.*borde*borde;
 vec3 rojo=muestra(p*(curvatura+dispersion),desenfoque);
 vec3 verde=muestra(p*curvatura,desenfoque);
 vec3 azul=muestra(p*(curvatura-dispersion),desenfoque);
 vec3 color=vec3(rojo.r,verde.g,azul.b);
 if(u_conMapa>.5){
  vec2 m=u_mapa.xy+p*u_mapa.z;float d=texture2D(u_densidad,vec2(m.x,1.-m.y)).r;
  vec3 extra=texture2D(u_imagen,campo(p*curvatura*1.31)+vec2(.37,.23)).rgb;
  vec3 extra2=texture2D(u_imagen,campo(-p*curvatura*.87)+vec2(.61,.12)).rgb;
  float mucho=smoothstep(.35,.9,d);
  color=mix(color,extra,celula(extra)*mucho*.9);
  color=mix(color,extra2,celula(extra2)*smoothstep(.65,1.,d)*.85);
  color=mix(color,FONDO,celula(color)*(1.-smoothstep(.08,.45,d))*.85);
 }
 float reflejo=pow(r,8.)*(.5+.5*dot(p/max(r,.001),normalize(vec2(-.7,-1.))));
 color=mix(color,vec3(.96,.98,1.),reflejo*.12);
 color*=1.-pow(r,10.)*.08;
 float grano=fract(sin(dot(floor(gl_FragCoord.xy),vec2(12.9898,78.233)))*43758.5453)-.5;
 color+=grano*.07*smoothstep(.80,1.,r);
 gl_FragColor=vec4(color,1.);
}`;

// Mapa de densidad a partir de la imagen de la placa: contraste local (colonia contra agar), suavizado y normalizado.
function mapaDensidad(img:HTMLImageElement):HTMLCanvasElement{
 const L=256,a=document.createElement('canvas'),b=document.createElement('canvas');a.width=a.height=b.width=b.height=L;
 const ca=a.getContext('2d',{willReadFrequently:true})!,cb=b.getContext('2d',{willReadFrequently:true})!;
 ca.drawImage(img,0,0,L,L);cb.filter='blur(10px)';cb.drawImage(img,0,0,L,L);
 const p=ca.getImageData(0,0,L,L),q=cb.getImageData(0,0,L,L),v=new Float32Array(L*L);
 for(let i=0;i<L*L;i++){const k=i*4;if(p.data[k+3]<40){v[i]=0;continue;}v[i]=Math.abs(p.data[k]-q.data[k])+Math.abs(p.data[k+1]-q.data[k+1])+Math.abs(p.data[k+2]-q.data[k+2]);}
 const orden=Array.from(v).filter(x=>x>0).sort((x,y)=>x-y),tope=orden[Math.floor(orden.length*.96)]||1;
 for(let i=0;i<L*L;i++){const k=i*4,n=Math.min(255,Math.round(v[i]/tope*255));p.data[k]=p.data[k+1]=p.data[k+2]=n;p.data[k+3]=255;}
 ca.putImageData(p,0,0);cb.filter='blur(6px)';cb.clearRect(0,0,L,L);cb.drawImage(a,0,0);return b;
}
export function montarLupaFigma(contenedor:HTMLElement,opciones:{placa?:HTMLImageElement|null}={}){
 const lente=document.createElement('div');lente.className='lupa-vidrio';
 const canvas=document.createElement('canvas');canvas.className='lupa-superficie';
 canvas.setAttribute('role','img');canvas.setAttribute('aria-label','Vista microscópica con lente de vidrio grueso');
 const resolucion=Math.round(diametro*Math.min(devicePixelRatio||1,1.5));canvas.width=canvas.height=resolucion;
 lente.appendChild(canvas);contenedor.appendChild(lente);
 let posicion:Posicion={x:460,y:460,ancho:920,alto:920},frame=0,terminado=false,listo=false;
 const gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:false,antialias:false,preserveDrawingBuffer:true});
 canvas.dataset.renderer=gl?'webgl':'canvas';
 let programa:WebGLProgram|null=null,textura:WebGLTexture|null=null,buffer:WebGLBuffer|null=null;
 let dibujar=()=>{};
 if(gl){
  const compilar=(tipo:number,codigo:string)=>{const s=gl.createShader(tipo)!;gl.shaderSource(s,codigo);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s)||'No se pudo preparar la lente');return s;};
  const vs=compilar(gl.VERTEX_SHADER,vertex),fs=compilar(gl.FRAGMENT_SHADER,fragment);
  programa=gl.createProgram()!;gl.attachShader(programa,vs);gl.attachShader(programa,fs);gl.linkProgram(programa);
  if(!gl.getProgramParameter(programa,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(programa)||'No se pudo iniciar la lente');
  gl.deleteShader(vs);gl.deleteShader(fs);gl.useProgram(programa);
  buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  const atributo=gl.getAttribLocation(programa,'a_pos');gl.enableVertexAttribArray(atributo);gl.vertexAttribPointer(atributo,2,gl.FLOAT,false,0,0);
  textura=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,textura);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.MIRRORED_REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.MIRRORED_REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.uniform1i(gl.getUniformLocation(programa,'u_imagen'),0);
  const centro=gl.getUniformLocation(programa,'u_centro'),extension=gl.getUniformLocation(programa,'u_extension'),texel=gl.getUniformLocation(programa,'u_texel');
  const ubMapa=gl.getUniformLocation(programa,'u_mapa'),ubConMapa=gl.getUniformLocation(programa,'u_conMapa');gl.uniform1i(gl.getUniformLocation(programa,'u_densidad'),1);
  let conMapa=false;
  const placa=opciones.placa;
  const cargarMapa=()=>{try{const mapa=mapaDensidad(placa!);gl.activeTexture(gl.TEXTURE1);const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);
   for(const [k,v] of [[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE],[gl.TEXTURE_MIN_FILTER,gl.LINEAR],[gl.TEXTURE_MAG_FILTER,gl.LINEAR]])gl.texParameteri(gl.TEXTURE_2D,k,v);
   gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,mapa);gl.activeTexture(gl.TEXTURE0);conMapa=true;solicitar();}catch{conMapa=false;}};
  if(placa){if(placa.complete&&placa.naturalWidth)setTimeout(cargarMapa);else placa.addEventListener('load',cargarMapa,{once:true});}
  dibujar=()=>{if(!listo||terminado)return;gl.useProgram(programa);gl.viewport(0,0,resolucion,resolucion);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
   gl.uniform2f(centro,.5+(posicion.x/posicion.ancho-.5)*.72,.5+(posicion.y/posicion.alto-.5)*.72);
   gl.uniform2f(extension,AUMENTO*diametro/posicion.ancho,AUMENTO*diametro/posicion.alto);gl.uniform2f(texel,1/imagen.naturalWidth,1/imagen.naturalHeight);
   const m=posicion.mapa;gl.uniform1f(ubConMapa,conMapa&&m?1:0);if(m)gl.uniform3f(ubMapa,m.u,m.v,m.radio);
   gl.drawArrays(gl.TRIANGLES,0,6);
  };
 }
 const imagen=new Image();imagen.decoding='async';
 const solicitar=()=>{if(!frame&&!terminado)frame=requestAnimationFrame(()=>{frame=0;dibujar();});};
 imagen.onload=()=>{if(terminado)return;
  if(gl){gl.bindTexture(gl.TEXTURE_2D,textura);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,imagen);}
  else{
   const reemplazo=document.createElement('canvas');reemplazo.className=canvas.className;reemplazo.width=reemplazo.height=resolucion;canvas.replaceWith(reemplazo);
   const ctx=reemplazo.getContext('2d')!;
   dibujar=()=>{const lado=imagen.naturalWidth*AUMENTO*diametro/posicion.ancho,cx=imagen.naturalWidth*(.5+(posicion.x/posicion.ancho-.5)*.72),cy=imagen.naturalHeight*(.5+(posicion.y/posicion.alto-.5)*.72);ctx.clearRect(0,0,resolucion,resolucion);ctx.drawImage(imagen,cx-lado/2,cy-lado/2,lado,lado,0,0,resolucion,resolucion);};
  }
  listo=true;solicitar();
 };
 // En file:// una imagen externa no puede subirse como textura WebGL.
 // El build incluye una copia local para que la lente funcione sin servidor.
 imagen.src=window.MICROMUNDOS_MICRO_LOCAL||'src/assets/detalles/lupa-micro.png';
 const limpiar=()=>{terminado=true;cancelAnimationFrame(frame);imagen.onload=null;if(gl){gl.deleteTexture(textura);gl.deleteBuffer(buffer);gl.deleteProgram(programa);}lente.remove();};
 limpiar.actualizar=(nueva:Posicion)=>{posicion=nueva;solicitar();};
 return limpiar;
}
declare global {interface Window {MICROMUNDOS_MICRO_LOCAL?:string;MicromundosLupa?:{montarLupaFigma:typeof montarLupaFigma}}}
window.MicromundosLupa={montarLupaFigma};
