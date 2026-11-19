// ───────── Propuesta: protagonismo de la placa y estados de la biblioteca (TU PLACA) ─────────
// Marca en #tuPlaca dos situaciones para que el CSS (tu-placa-propuesta.css) las muestre:
//  · tp-vacia: la placa no tiene colonias → borde punteado que late y una marca «+» en el centro (dónde soltar).
//  · tp-sembrando: se está arrastrando una forma desde la biblioteca → el borde de la placa se resalta con el color de su grupo.
//  · Con colonias, el borde punteado queda muy tenue.
// No cambia la lógica de TU PLACA: solo observa el DOM.
(() => {
  const revisar = () => {
    const tp = document.getElementById('tuPlaca');
    if (!tp) return;
    const vacia = document.getElementById('tpVacia');
    tp.classList.toggle('tp-vacia', !!vacia && !vacia.hidden);
    tp.classList.toggle('tp-sembrando', !!tp.querySelector('.tp-arrastre-biblioteca'));
  };
  // Color del grupo de la forma que se lleva (el código empieza con B, L o M), para el resaltado de la placa.
  const COLORES = { B: '#e57dab', L: '#f2c75e', M: '#92aa68' };
  addEventListener('pointerdown', ev => {
    const forma = ev.target.closest?.('#tpBiblioteca .tp-paleta-colonia'); if (!forma) return;
    document.getElementById('tuPlaca')?.style.setProperty('--tp-siembra-color', COLORES[(forma.dataset.styleId || 'B')[0]] || COLORES.B);
  }, { capture: true, passive: true });
  new MutationObserver(revisar) // los cambios ya llegan agrupados; la revisión es liviana
    .observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });
})();
