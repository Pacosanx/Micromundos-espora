// Compila sólo el componente óptico; el resto del prototipo conserva HTML/JS nativos.
const path=require('node:path');
require('esbuild').buildSync({
  entryPoints:[path.join(__dirname,'src/shaders/lupa.ts')],
  outfile:path.join(__dirname,'src/assets/lupa-figma.js'),
  bundle:true,format:'iife',target:'es2022',minify:true,
  define:{'process.env.NODE_ENV':'"production"'},legalComments:'eof',
});
console.log('Lupa de vidrio sobre campo continuo compilada.');
