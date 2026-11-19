function prepararGaleriaFicha(galeria, relacionadas, muestra, alAbrir) {
  const originales = [...relacionadas];
  if (!galeria || !originales.length) return () => {};

  galeria.replaceChildren();
  galeria.classList.add('ficha-galeria');
  galeria.setAttribute('role', 'region');
  galeria.setAttribute('aria-label', `Muestras que comparten especies con ${muestra.origen}`);
  galeria.tabIndex = 0;

  const track = document.createElement('div');
  track.className = 'ficha-galeria__track';
  const tarjetas = [];
  // Hay ciclos suficientes a cada lado del central para llenar la pantalla aunque haya pocas muestras relacionadas:
  // así el recorrido nunca termina (antes, con 1 o 2 relacionadas, el scroll se acababa).
  const paso = 402 + 64, anchoPantalla = Math.max(1920, (galeria.closest('.detalle-composicion')?.offsetWidth) || 0);
  const lado = Math.ceil(anchoPantalla / (originales.length * paso)) + 1, ciclos = lado * 2 + 1;
  for (let ciclo = 0; ciclo < ciclos; ciclo++) {
    for (const otra of originales) {
      const tarjeta = document.createElement('article');
      tarjeta.className = 'ficha-galeria__tarjeta';
      tarjeta.setAttribute('aria-label', `${otra.origen}, ${otra.codigo}`);
      if (ciclo !== lado) tarjeta.setAttribute('aria-hidden', 'true');
      tarjeta.dataset.ciclo = String(ciclo);

      const encabezado = document.createElement('header');
      encabezado.className = 'ficha-galeria__encabezado';
      const origen = document.createElement('h2');
      origen.className = 'ficha-galeria__origen';
      origen.textContent = otra.origen;
      const codigo = document.createElement('p');
      codigo.className = 'ficha-galeria__codigo';
      codigo.textContent = otra.codigo;
      encabezado.append(origen, codigo);

      // Pendiente (CHECKLIST): acá va la placa figurativa de cada muestra. Todavía no existen; mientras tanto, la forma de la muestra en la PLACA.
      const marco = document.createElement('div');
      marco.className = 'ficha-galeria__marco';
      const fuente = otra.el?.querySelector('canvas');
      if (fuente) {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 354;
        canvas.className = 'ficha-galeria__canvas';
        canvas.setAttribute('role', 'img');
        canvas.setAttribute('aria-label', `Ilustración de la muestra ${otra.codigo}`);
        canvas.getContext('2d')?.drawImage(fuente, 0, 0, 354, 354);
        marco.appendChild(canvas);
      }

      // GRUPO y COMPARTE como pares rótulo / valor en una misma grilla, con la misma jerarquía y alineación.
      const datos = document.createElement('dl');
      datos.className = 'ficha-galeria__datos';
      const fila = (rotulo, valores, clase) => {
        const dt = document.createElement('dt');
        dt.textContent = rotulo;
        const dd = document.createElement('dd');
        if (clase) dd.className = clase;
        for (const v of valores) { const linea = document.createElement('span'); linea.textContent = v; dd.appendChild(linea); }
        datos.append(dt, dd);
        return dd;
      };
      // GRUPO con los mismos circulitos de color que el cartel de la muestra en MUESTRAS (coloresCartel, carteles.js).
      const grupo = fila('GRUPO', [GRUPO_NOMBRE[otra.grupo] || otra.grupo], 'ficha-galeria__grupo');
      const puntos = document.createElement('span');
      puntos.className = 'coloresCartel'; puntos.setAttribute('aria-hidden', 'true');
      puntos.innerHTML = coloresCartel(otra.grupo);
      grupo.firstChild.prepend(puntos);
      const compartidas = otra.vinculosDatos.especies.filter(e => muestra.vinculosDatos.especies.includes(e));
      const especies = fila('COMPARTE', compartidas.slice(0, 2), 'ficha-galeria__especie');
      if (compartidas.length > 2) {
        const mas = document.createElement('span');
        mas.className = 'ficha-galeria__mas';
        mas.textContent = 'y ' + (compartidas.length - 2) + ' más';
        especies.appendChild(mas);
      }

      const boton = document.createElement('button');
      boton.className = 'ficha-galeria__cta';
      boton.type = 'button';
      // Misma flecha que «Ver ficha de muestra» del cartel de MUESTRAS (cartel-flecha.svg girada 45°).
      boton.innerHTML = `<span>VER FICHA DE MUESTRA</span><img src="${RECURSOS_CARTEL.flecha}" width="11.3995" height="11.0459" alt="">`;
      if (ciclo !== lado) boton.tabIndex = -1;
      boton.addEventListener('click', () => alAbrir(otra));
      tarjeta.append(encabezado, marco, datos, boton);
      track.appendChild(tarjeta);
      tarjetas.push(tarjeta);
    }
  }
  galeria.appendChild(track);

  // El único recorte horizontal coincide con los bordes de la pantalla.
  const raiz=galeria.closest('.detalle-composicion');
  // Desenfoque progresivo en ambos márgenes: capas superpuestas de ancho completo, cada una con una máscara suave, para que el aumento
  // sea continuo (antes eran 8 bandas con bordes de 8 px: se veían "por bloques" y a la izquierda faltaba).
  const nieblas=['izq','der'].map(lado=>{
    const niebla=document.createElement('div');niebla.className='ficha-galeria-niebla ficha-galeria-niebla--'+lado;niebla.setAttribute('aria-hidden','true');
    const BLURS=[.4,.8,1.6,3,5.5,9,14,22],N=BLURS.length,s=100/(N-1);
    BLURS.forEach((px,i)=>{
      const capa=document.createElement('i'),p=n=>(n*s).toFixed(2)+'%';
      const mascara=`linear-gradient(to ${lado==='der'?'right':'left'},transparent ${p(i-1)},#000 ${p(i)},#000 ${p(i+1)},transparent ${p(i+2)})`;
      capa.style.backdropFilter=capa.style.webkitBackdropFilter=`blur(${px}px)`;
      capa.style.maskImage=capa.style.webkitMaskImage=i===N-1?`linear-gradient(to ${lado==='der'?'right':'left'},transparent ${p(i-1)},#000 ${p(i)})`:mascara;
      niebla.appendChild(capa);
    });
    raiz.appendChild(niebla);return niebla;
  });
  let margen=0;

  let anchoCiclo = 0;
  let ajustando = false;
  let raf = 0;
  const medir = () => {
    const primero = tarjetas[0], inicioSegundo = tarjetas[originales.length];
    if (primero && inicioSegundo) anchoCiclo = inicioSegundo.offsetLeft - primero.offsetLeft;
  };
  const posicionar = () => {
    const r=raiz.getBoundingClientRect(),p=galeria.parentElement.getBoundingClientRect(),factor=r.width/raiz.offsetWidth||1;
    margen=(p.left-r.left)/factor;
    galeria.style.marginLeft=-margen+'px';galeria.style.width=raiz.offsetWidth+'px';
    const arriba=((galeria.getBoundingClientRect().top-r.top)/factor)+'px';
    for(const n of nieblas)n.style.top=arriba;
    medir();
    // Empieza desde la segunda tarjeta del ciclo central; la primera queda antes (se llega a ella desplazando hacia atrás).
    if(anchoCiclo){const a=tarjetas[originales.length*lado],b=tarjetas[originales.length*lado+1];galeria.scrollLeft=anchoCiclo*lado-margen+(a&&b?b.offsetLeft-a.offsetLeft:0);}
  };
  const enScroll = () => {
    if (ajustando || !anchoCiclo) return;
    const piso = anchoCiclo * (lado - .5) - margen, techo = anchoCiclo * (lado + .5) - margen;
    if (galeria.scrollLeft < piso || galeria.scrollLeft >= techo) {
      ajustando = true;
      galeria.scrollLeft += galeria.scrollLeft < piso ? anchoCiclo : -anchoCiclo;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => { ajustando = false; });
    }
  };
  const enWheel = ev => {
    if (Math.abs(ev.deltaY) > Math.abs(ev.deltaX) && !ev.shiftKey) return;
    const delta = ev.deltaX || (ev.shiftKey ? ev.deltaY : 0);
    if (delta) { ev.preventDefault(); galeria.scrollLeft += delta; }
  };
  const enTecla = ev => {
    if (ev.target !== galeria) return;
    const paso = Math.min(galeria.clientWidth * .8, 402 + 64);
    if (ev.key === 'ArrowRight' || ev.key === 'ArrowLeft') {
      ev.preventDefault(); galeria.scrollLeft += ev.key === 'ArrowRight' ? paso : -paso;
    }
  };
  galeria.addEventListener('scroll', enScroll, { passive: true });
  galeria.addEventListener('wheel', enWheel, { passive: false });
  galeria.addEventListener('keydown', enTecla);
  const observer = new ResizeObserver(posicionar);
  observer.observe(galeria);
  raf = requestAnimationFrame(posicionar);
  return () => {
    observer.disconnect();
    cancelAnimationFrame(raf);
    galeria.removeEventListener('scroll', enScroll);
    galeria.removeEventListener('wheel', enWheel);
    galeria.removeEventListener('keydown', enTecla);
    galeria.replaceChildren();
    for(const n of nieblas)n.remove();
    galeria.classList.remove('ficha-galeria');
    galeria.removeAttribute('role');
    galeria.removeAttribute('aria-label');
    galeria.removeAttribute('tabindex');
  };
}
