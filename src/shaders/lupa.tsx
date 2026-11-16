import React from 'react';
import { createRoot } from 'react-dom/client';
import { ShaderEffect, type Shader } from '@figma/expressive-components';
import { setup, render, manifest } from './lens-distortion';

// Módulo y parámetros exportados del nodo Figma 463:5631.
const shaders: Shader[] = [{
  setup, render, manifest,
  params: {
    chromaticMode: 0,
    distortionStrength: 0.5,
    aberrationStrength: 0.07000000029802322,
    centre: { x: 50, y: 50 },
    quality: 1,
  },
}];

const bordeSuave='radial-gradient(circle closest-side,#000 calc(100% - 9px),rgba(0,0,0,.88) calc(100% - 6px),transparent 100%)';
const franjaGrano='radial-gradient(circle closest-side,transparent calc(100% - 20px),#000 calc(100% - 10px),#000 100%)';
const ruidoBorde=`url("data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="3" seed="13" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>')}")`;

function Lupa(){
  // El recorte circular se aplica después del efecto: la lente deforma el
  // contenido, no su silueta. El margen de 85,5 px evita muestrear transparencia.
  return <div style={{position:'relative',width:429,height:429,borderRadius:'50%',overflow:'hidden',clipPath:'circle(50% at 50% 50%)',maskImage:bordeSuave,WebkitMaskImage:bordeSuave,isolation:'isolate'}}>
    <div style={{position:'absolute',left:-85.5,top:-85.5,width:600,height:600}}>
    <ShaderEffect width={600} height={600} shaders={shaders}>
    <div style={{position:'relative',width:600,height:600,overflow:'hidden',background:'#f1efe7'}}>
      <div style={{position:'absolute',width:852,height:852,left:-205.5,top:-.5,transform:'rotate(90deg)'}}>
        <div style={{position:'absolute',inset:0,background:'#f1efe7'}}/>
        <img src="src/assets/detalles/lupa-micro.png" alt="Vista microscópica ilustrada del yogur" style={{position:'absolute',inset:0,width:852,height:852,objectFit:'cover'}}/>
      </div>
    </div>
  </ShaderEffect>
    </div>
    <div aria-hidden="true" style={{position:'absolute',inset:0,pointerEvents:'none',backgroundImage:ruidoBorde,backgroundSize:'160px 160px',opacity:.3,mixBlendMode:'soft-light',maskImage:franjaGrano,WebkitMaskImage:franjaGrano}}/>
  </div>;
}

export function montarLupaFigma(contenedor: HTMLElement){
  const root=createRoot(contenedor);
  root.render(<Lupa/>);
  return ()=>root.unmount();
}

declare global { interface Window { MicromundosLupa?: { montarLupaFigma: typeof montarLupaFigma }; } }
window.MicromundosLupa={montarLupaFigma};
