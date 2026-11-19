// ───────── MICROMUNDOS (19/11/2026): más diseño con los mismos textos ─────────
// · «Qué es una colonia» se muestra: en una placa, una colonia crece desde un punto (un solo microbio) hasta verse entera,
//   y vuelve a empezar. Se dibuja con el motor de TU PLACA (MotorMuestrario), el mismo de toda la pieza.
// · «Cada color, un grupo»: cada grupo con una colonia de verdad en vez de un punto de color.
// · Las colonias de la placa se turnan por grupo (bacteria, levadura, moho), así la placa también cuenta la clave de color.
(() => {
  const seccion = document.getElementById('queEs');
  if (!seccion || typeof MotorMuestrario === 'undefined') return;
  const GRUPOS = {
    B: { familia: 'rosa', colores: ['#ff4c52', '#f58bc3', '#ff4c52'], seed: 31 },
    L: { familia: 'amarillo', colores: ['#ff9c20', '#ffc21c', '#dce642'], seed: 12 },
    M: { familia: 'verde', colores: ['#27633f', '#6a983a', '#dce642'], seed: 57 },
  };
  const estilo = (g, extra = {}) => {
    const d = GRUPOS[g];
    return MotorMuestrario.estiloColonia({ ...MotorMuestrario.BASE, size: 100, c1: d.colores[0], c2: d.colores[1], c3: d.colores[2], seed: d.seed,
      opacity: 100, blur: 12, core: 78, grain: 30, irregularity: 8, gradient: 'radial', midpoint: 55, ...extra }, {}, d.familia);
  };
  // Clave de color: una colonia chica por grupo.
  for (const li of seccion.querySelectorAll('.qe-grupos li[data-g]')) {
    const cv = document.createElement('canvas');
    cv.setAttribute('aria-hidden', 'true');
    li.prepend(cv);
    MotorMuestrario.pintar(cv, estilo(li.dataset.g), 64, 10);
  }
  // La colonia que crece: se pinta una por grupo y se turnan.
  const placa = seccion.querySelector('.qe-colonia-placa');
  if (!placa) return;
  const lienzos = ['B', 'L', 'M'].map(g => {
    const cv = document.createElement('canvas');
    cv.className = 'qe-colonia-crece';
    cv.dataset.g = g;
    MotorMuestrario.pintar(cv, estilo(g, { irregularity: 14, porosity: 18, grain: 34 }), 360, 40);
    placa.appendChild(cv);
    return cv;
  });
  let turno = 0;
  const pasar = () => { lienzos.forEach((cv, i) => cv.classList.toggle('activa', i === turno)); turno = (turno + 1) % lienzos.length; };
  pasar();
  // Cada ciclo dura lo mismo que la animación de crecer (que-es.css): 7 s.
  if (typeof setInterval === 'function') setInterval(() => { if (!seccion.hidden) pasar(); }, 7000);
})();
