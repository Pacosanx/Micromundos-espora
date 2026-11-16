const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const {parseHTML}=require(process.argv[2]||'linkedom');
const base=path.join(__dirname,'..');
const terms=fs.readFileSync(path.join(base,'base/glosario.csv'),'utf8').trim().split(/\r?\n/).slice(1).map(l=>{const r=l.split(';');return{id:r[0],numero:r[1],termino:r[2],definicion:r[5]};});
const source=fs.readFileSync(path.join(__dirname,'pantallas-detalle.js'),'utf8');
const helper='function prepararReferenciasGlosario'+source.split('function prepararReferenciasGlosario')[1].split('function prepararPantallasDetalle')[0];
const designs=JSON.parse(fs.readFileSync(path.join(__dirname,'pantallas-detalle.json'),'utf8'));
for(const key of ['441:10436','446:5402','446:5748']){
  const {document}=parseHTML('<html><body>'+designs[key].html+'</body></html>'),calls=[];
  vm.runInNewContext(helper+';prepararReferenciasGlosario(document.body,abrir);',{document,TERMINOS_GLOSARIO:terms,abrir:(...args)=>calls.push(args)});
  const buttons=[...document.querySelectorAll('.referencia-glosario')];assert(buttons.length>=4);
  for(const button of buttons){
    const term=terms.find(t=>t.id===button.dataset.termino);assert(term?.definicion);
    assert(!button.closest('[data-name^="Fila ·"]'),'Los números del listado de especies no son referencias.');
    button.click();assert.equal(calls.at(-1)[0],term.id);assert.equal(calls.at(-1)[2],button);
  }
  assert.equal(calls.length,buttons.length);
  for(const b of buttons){assert(b.querySelector('sup.indice-glosario'),'Falta el indicador elevado');assert(!/\s\(/.test(b.textContent),'Queda un espacio entre el término y su indicador');}
  if(key==='441:10436')assert(buttons.some(b=>b.dataset.termino==='espiral'&&b.querySelector('sup').textContent==='(21)'));
}
console.log('Referencias verificadas: tres universos, definiciones completas, destino por término y números de especies intactos.');
