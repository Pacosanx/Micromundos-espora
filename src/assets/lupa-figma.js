(()=>{var w=`attribute vec2 a_pos; varying vec2 v_uv;
void main(){v_uv=a_pos*.5+.5;gl_Position=vec4(a_pos,0.,1.);}`,y=`precision highp float;
varying vec2 v_uv;
uniform sampler2D u_imagen;
uniform vec2 u_centro,u_extension,u_texel;
uniform sampler2D u_densidad;uniform vec3 u_mapa;uniform float u_conMapa;
// 19/11/2026 (Paco): concentraci\xF3n de c\xE9lulas seg\xFAn la placa. Sobre una colonia se suma otra capa de c\xE9lulas; donde no
// hay colonias, las c\xE9lulas se apagan hacia el fondo crema. Es una aproximaci\xF3n, no una lectura real.
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
 // Centro casi uniforme; el vidrio curva y separa colores en el \xFAltimo 28% del radio.
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
}`;function O(T){let m=document.createElement("canvas"),n=document.createElement("canvas");m.width=m.height=n.width=n.height=256;let i=m.getContext("2d",{willReadFrequently:!0}),a=n.getContext("2d",{willReadFrequently:!0});i.drawImage(T,0,0,256,256),a.filter="blur(10px)",a.drawImage(T,0,0,256,256);let c=i.getImageData(0,0,256,256),d=a.getImageData(0,0,256,256),f=new Float32Array(256*256);for(let r=0;r<256*256;r++){let o=r*4;if(c.data[o+3]<40){f[r]=0;continue}f[r]=Math.abs(c.data[o]-d.data[o])+Math.abs(c.data[o+1]-d.data[o+1])+Math.abs(c.data[o+2]-d.data[o+2])}let e=Array.from(f).filter(r=>r>0).sort((r,o)=>r-o),t=e[Math.floor(e.length*.96)]||1;for(let r=0;r<256*256;r++){let o=r*4,v=Math.min(255,Math.round(f[r]/t*255));c.data[o]=c.data[o+1]=c.data[o+2]=v,c.data[o+3]=255}return i.putImageData(c,0,0),a.filter="blur(6px)",a.clearRect(0,0,256,256),a.drawImage(m,0,0),n}function S(T,A={}){let m=document.createElement("div");m.className="lupa-vidrio";let n=document.createElement("canvas");n.className="lupa-superficie",n.setAttribute("role","img"),n.setAttribute("aria-label","Vista microsc\xF3pica con lente de vidrio grueso");let i=Math.round(429*Math.min(devicePixelRatio||1,1.5));n.width=n.height=i,m.appendChild(n),T.appendChild(m);let a={x:460,y:460,ancho:920,alto:920},c=0,d=!1,f=!1,e=n.getContext("webgl",{alpha:!0,premultipliedAlpha:!1,antialias:!1,preserveDrawingBuffer:!0});n.dataset.renderer=e?"webgl":"canvas";let t=null,r=null,o=null,v=()=>{};if(e){let l=(s,b)=>{let g=e.createShader(s);if(e.shaderSource(g,b),e.compileShader(g),!e.getShaderParameter(g,e.COMPILE_STATUS))throw Error(e.getShaderInfoLog(g)||"No se pudo preparar la lente");return g},_=l(e.VERTEX_SHADER,w),p=l(e.FRAGMENT_SHADER,y);if(t=e.createProgram(),e.attachShader(t,_),e.attachShader(t,p),e.linkProgram(t),!e.getProgramParameter(t,e.LINK_STATUS))throw Error(e.getProgramInfoLog(t)||"No se pudo iniciar la lente");e.deleteShader(_),e.deleteShader(p),e.useProgram(t),o=e.createBuffer(),e.bindBuffer(e.ARRAY_BUFFER,o),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),e.STATIC_DRAW);let x=e.getAttribLocation(t,"a_pos");e.enableVertexAttribArray(x),e.vertexAttribPointer(x,2,e.FLOAT,!1,0,0),r=e.createTexture(),e.bindTexture(e.TEXTURE_2D,r),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.MIRRORED_REPEAT),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.MIRRORED_REPEAT),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.uniform1i(e.getUniformLocation(t,"u_imagen"),0);let h=e.getUniformLocation(t,"u_centro"),M=e.getUniformLocation(t,"u_extension"),I=e.getUniformLocation(t,"u_texel"),P=e.getUniformLocation(t,"u_mapa"),N=e.getUniformLocation(t,"u_conMapa");e.uniform1i(e.getUniformLocation(t,"u_densidad"),1);let L=!1,E=A.placa,U=()=>{try{let s=O(E);e.activeTexture(e.TEXTURE1);let b=e.createTexture();e.bindTexture(e.TEXTURE_2D,b);for(let[g,F]of[[e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE],[e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE],[e.TEXTURE_MIN_FILTER,e.LINEAR],[e.TEXTURE_MAG_FILTER,e.LINEAR]])e.texParameteri(e.TEXTURE_2D,g,F);e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!0),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,s),e.activeTexture(e.TEXTURE0),L=!0,R()}catch{L=!1}};E&&(E.complete&&E.naturalWidth?setTimeout(U):E.addEventListener("load",U,{once:!0})),v=()=>{if(!f||d)return;e.useProgram(t),e.viewport(0,0,i,i),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),e.uniform2f(h,.5+(a.x/a.ancho-.5)*.72,.5+(a.y/a.alto-.5)*.72),e.uniform2f(M,.36*429/a.ancho,.36*429/a.alto),e.uniform2f(I,1/u.naturalWidth,1/u.naturalHeight);let s=a.mapa;e.uniform1f(N,L&&s?1:0),s&&e.uniform3f(P,s.u,s.v,s.radio),e.drawArrays(e.TRIANGLES,0,6)}}let u=new Image;u.decoding="async";let R=()=>{!c&&!d&&(c=requestAnimationFrame(()=>{c=0,v()}))};u.onload=()=>{if(!d){if(e)e.bindTexture(e.TEXTURE_2D,r),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!0),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,u);else{let l=document.createElement("canvas");l.className=n.className,l.width=l.height=i,n.replaceWith(l);let _=l.getContext("2d");v=()=>{let p=u.naturalWidth*.36*429/a.ancho,x=u.naturalWidth*(.5+(a.x/a.ancho-.5)*.72),h=u.naturalHeight*(.5+(a.y/a.alto-.5)*.72);_.clearRect(0,0,i,i),_.drawImage(u,x-p/2,h-p/2,p,p,0,0,i,i)}}f=!0,R()}},u.src=window.MICROMUNDOS_MICRO_LOCAL||"src/assets/detalles/lupa-micro.png";let D=()=>{d=!0,cancelAnimationFrame(c),u.onload=null,e&&(e.deleteTexture(r),e.deleteBuffer(o),e.deleteProgram(t)),m.remove()};return D.actualizar=l=>{a=l,R()},D}window.MicromundosLupa={montarLupaFigma:S};})();
