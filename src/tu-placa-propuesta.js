// ───────── Propuesta: protagonismo de la placa y estados de la biblioteca (TU PLACA) ─────────
// Marca en #tuPlaca dos situaciones para que el CSS (tu-placa-propuesta.css) las muestre:
//  · tp-vacia: la placa no tiene colonias → borde punteado que late y una marca «+» en el centro (dónde soltar).
//  · tp-sembrando: se está arrastrando una forma desde la biblioteca → el borde de la placa se resalta.
// No cambia la lógica de TU PLACA: solo observa el DOM.
(() => {
  const revisar = () => {
    const tp = document.getElementById('tuPlaca');
    if (!tp) return;
    const vacia = document.getElementById('tpVacia');
    tp.classList.toggle('tp-vacia', !!vacia && !vacia.hidden);
    tp.classList.toggle('tp-sembrando', !!tp.querySelector('.tp-arrastre-biblioteca'));
  };
  new MutationObserver(revisar) // los cambios ya llegan agrupados; la revisión es liviana
    .observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });
})();
