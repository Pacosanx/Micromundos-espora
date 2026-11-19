// ───────── Placa figurativa de cada muestra (19/11/2026, simulación) ─────────
// Mientras no existan las placas figurativas reales (hoy solo está la del yogur, hecha en Colonias), cada muestra
// se dibuja como la del yogur: medio de cultivo crema, borde de placa y sus colonias, con datos de la base:
//  · cuántas colonias (columna «colonias», hasta 160 a la vista) y de qué grupo (color y textura de las colonias);
//  · la ubicación es azarosa pero fija para cada código (siempre la misma placa para la misma muestra).
// No agrega contenido: es una interpretación gráfica, como la del yogur. Se reemplaza por la imagen real cuando exista.
function placaFigurativa(canvas, muestra, lado = 354) {
  const escalaPx = Math.min(2, Math.max(1, window.devicePixelRatio || 1)), n = Math.round(lado * escalaPx);
  canvas.width = canvas.height = n;
  const c = canvas.getContext('2d'), R = n / 2;
  let h = 2166136261; for (const ch of String(muestra.codigo || 'X')) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  const azar = () => { h = (Math.imul(h, 1664525) + 1013904223) >>> 0; return h / 4294967296; };
  // Medio de cultivo y borde (los de la placa figurativa del yogur).
  const medio = c.createRadialGradient(R, R, 0, R, R, R * .9);
  medio.addColorStop(0, '#e2c898'); medio.addColorStop(.75, '#ead8b6'); medio.addColorStop(1, '#efe6d2');
  c.save(); c.beginPath(); c.arc(R, R, R * .9, 0, Math.PI * 2); c.fillStyle = medio; c.fill(); c.restore();
  c.save(); c.filter = `blur(${n * .012}px)`; c.lineWidth = n * .045;
  const borde = c.createLinearGradient(0, 0, n, n); borde.addColorStop(0, '#4f8a5e'); borde.addColorStop(.55, '#9fbf66'); borde.addColorStop(1, '#d9e05a');
  c.strokeStyle = borde; c.globalAlpha = .75; c.beginPath(); c.arc(R, R, R * .88, 0, Math.PI * 2); c.stroke(); c.restore();
  // Colonias según el grupo: bacterias y levaduras lisas y cremosas; mohos algodonosos y verdes.
  const COLONIA = {
    B: { relleno: ['#fbf3e4', '#ead1a6'], borde: '#c99a5b', tam: [.01, .028] },
    L: { relleno: ['#fdf6e6', '#f0dca0'], borde: '#d0a64e', tam: [.014, .036] },
    M: { relleno: ['#eef2e4', '#8fae6c'], borde: '#5d7f45', tam: [.03, .09], moho: true },
  };
  const grupos = muestra.grupo === 'BL' ? ['B', 'L'] : [muestra.grupo in COLONIA ? muestra.grupo : 'B'];
  const total = Math.max(1, Math.min(160, Number(muestra.colonias) || 1));
  // Muchas colonias: una estría (como al sembrar con asa) y algunas sueltas; pocas: sueltas y de a pares.
  const enEstria = total > 24 ? Math.round(total * .75) : 0;
  const a0 = azar() * Math.PI * 2, largo = R * .9, cx0 = R + Math.cos(a0) * R * .25, cy0 = R + Math.sin(a0) * R * .25;
  const puntos = [];
  for (let i = 0; i < total; i++) {
    let x, y;
    if (i < enEstria) { const t = azar() - .5, ancho = (azar() - .5) * R * .22; x = cx0 + Math.cos(a0 + Math.PI / 2) * t * largo + Math.cos(a0) * ancho; y = cy0 + Math.sin(a0 + Math.PI / 2) * t * largo + Math.sin(a0) * ancho; }
    else { const ang = azar() * Math.PI * 2, d = Math.sqrt(azar()) * R * .66; x = R + Math.cos(ang) * d; y = R + Math.sin(ang) * d; }
    if (Math.hypot(x - R, y - R) > R * .74) continue;
    puntos.push([x, y, grupos[Math.floor(azar() * grupos.length)], azar()]);
  }
  for (const [x, y, g, k] of puntos) {
    const d = COLONIA[g], rr = n * (d.tam[0] + (d.tam[1] - d.tam[0]) * k * k) * (total > 60 ? .7 : total <= 5 ? 2.2 : 1);
    if (d.moho) { const r = Math.min(rr, n * .075);
      c.save(); c.filter = `blur(${r * .25}px)`; const halo = c.createRadialGradient(x, y, 0, x, y, r * 1.3);
      halo.addColorStop(0, d.relleno[1]); halo.addColorStop(.55, d.relleno[0]); halo.addColorStop(1, 'rgba(238,242,228,0)');
      c.fillStyle = halo; c.beginPath(); c.arc(x, y, r * 1.3, 0, Math.PI * 2); c.fill(); c.restore();
      c.save(); c.globalAlpha = .5; c.strokeStyle = d.borde; c.lineWidth = Math.max(.6, r * .03);
      for (let j = 0; j < 40; j++) { const ang = j / 40 * Math.PI * 2 + k, l = r * (1 + .25 * Math.sin(j * 3.1 + k * 9)); c.beginPath(); c.moveTo(x + Math.cos(ang) * r * .5, y + Math.sin(ang) * r * .5); c.lineTo(x + Math.cos(ang) * l, y + Math.sin(ang) * l); c.stroke(); }
      c.restore();
    } else { const r = rr;
      const f = c.createRadialGradient(x - r * .3, y - r * .3, 0, x, y, r);
      f.addColorStop(0, d.relleno[0]); f.addColorStop(1, d.relleno[1]);
      c.fillStyle = f; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
      if (r > 2.5) { c.strokeStyle = d.borde; c.globalAlpha = .8; c.lineWidth = Math.max(.6, r * .14); c.stroke(); c.globalAlpha = 1; }
    }
  }
  // Grano, como en la imagen del yogur.
  c.save(); c.beginPath(); c.arc(R, R, R * .9, 0, Math.PI * 2); c.clip();
  for (let i = 0; i < n * 18; i++) { c.fillStyle = azar() < .5 ? 'rgba(255,255,255,.18)' : 'rgba(120,90,50,.08)'; c.fillRect(azar() * n, azar() * n, 1, 1); }
  c.restore();
  return canvas;
}
