(()=>{var U=`attribute vec2 a_pos; varying vec2 v_uv;
void main(){v_uv=a_pos*.5+.5;gl_Position=vec4(a_pos,0.,1.);}`,P=`precision highp float;
varying vec2 v_uv;
uniform sampler2D u_imagen;
uniform vec2 u_centro,u_extension,u_texel;
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
 float reflejo=pow(r,8.)*(.5+.5*dot(p/max(r,.001),normalize(vec2(-.7,-1.))));
 color=mix(color,vec3(.96,.98,1.),reflejo*.12);
 color*=1.-pow(r,10.)*.08;
 float grano=fract(sin(dot(floor(gl_FragCoord.xy),vec2(12.9898,78.233)))*43758.5453)-.5;
 color+=grano*.07*smoothstep(.80,1.,r);
 gl_FragColor=vec4(color,1.);
}`;function D(x){let s=document.createElement("div");s.className="lupa-vidrio";let o=document.createElement("canvas");o.className="lupa-superficie",o.setAttribute("role","img"),o.setAttribute("aria-label","Vista microsc\xF3pica con lente de vidrio grueso");let i=Math.round(429*Math.min(devicePixelRatio||1,1.5));o.width=o.height=i,s.appendChild(o),x.appendChild(s);let t={x:460,y:460,ancho:920,alto:920},m=0,d=!1,E=!1,e=o.getContext("webgl",{alpha:!0,premultipliedAlpha:!1,antialias:!1,preserveDrawingBuffer:!0});o.dataset.renderer=e?"webgl":"canvas";let r=null,v=null,g=null,p=()=>{};if(e){let n=(b,L)=>{let l=e.createShader(b);if(e.shaderSource(l,L),e.compileShader(l),!e.getShaderParameter(l,e.COMPILE_STATUS))throw Error(e.getShaderInfoLog(l)||"No se pudo preparar la lente");return l},u=n(e.VERTEX_SHADER,U),c=n(e.FRAGMENT_SHADER,P);if(r=e.createProgram(),e.attachShader(r,u),e.attachShader(r,c),e.linkProgram(r),!e.getProgramParameter(r,e.LINK_STATUS))throw Error(e.getProgramInfoLog(r)||"No se pudo iniciar la lente");e.deleteShader(u),e.deleteShader(c),e.useProgram(r),g=e.createBuffer(),e.bindBuffer(e.ARRAY_BUFFER,g),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),e.STATIC_DRAW);let f=e.getAttribLocation(r,"a_pos");e.enableVertexAttribArray(f),e.vertexAttribPointer(f,2,e.FLOAT,!1,0,0),v=e.createTexture(),e.bindTexture(e.TEXTURE_2D,v),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.MIRRORED_REPEAT),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.MIRRORED_REPEAT),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.uniform1i(e.getUniformLocation(r,"u_imagen"),0);let _=e.getUniformLocation(r,"u_centro"),h=e.getUniformLocation(r,"u_extension"),A=e.getUniformLocation(r,"u_texel");p=()=>{!E||d||(e.useProgram(r),e.viewport(0,0,i,i),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),e.uniform2f(_,.5+(t.x/t.ancho-.5)*.72,.5+(t.y/t.alto-.5)*.72),e.uniform2f(h,.36*429/t.ancho,.36*429/t.alto),e.uniform2f(A,1/a.naturalWidth,1/a.naturalHeight),e.drawArrays(e.TRIANGLES,0,6))}}let a=new Image;a.decoding="async";let T=()=>{!m&&!d&&(m=requestAnimationFrame(()=>{m=0,p()}))};a.onload=()=>{if(!d){if(e)e.bindTexture(e.TEXTURE_2D,v),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!0),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,a);else{let n=document.createElement("canvas");n.className=o.className,n.width=n.height=i,o.replaceWith(n);let u=n.getContext("2d");p=()=>{let c=a.naturalWidth*.36*429/t.ancho,f=a.naturalWidth*(.5+(t.x/t.ancho-.5)*.72),_=a.naturalHeight*(.5+(t.y/t.alto-.5)*.72);u.clearRect(0,0,i,i),u.drawImage(a,f-c/2,_-c/2,c,c,0,0,i,i)}}E=!0,T()}},a.src=window.MICROMUNDOS_MICRO_LOCAL||"src/assets/detalles/lupa-micro.png";let R=()=>{d=!0,cancelAnimationFrame(m),a.onload=null,e&&(e.deleteTexture(v),e.deleteBuffer(g),e.deleteProgram(r)),s.remove()};return R.actualizar=n=>{t=n,T()},R}window.MicromundosLupa={montarLupaFigma:D};})();
