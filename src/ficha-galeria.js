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
  for (let ciclo = 0; ciclo < 3; ciclo++) {
    for (const otra of originales) {
      const tarjeta = document.createElement('article');
      tarjeta.className = 'ficha-galeria__tarjeta';
      tarjeta.setAttribute('aria-label', `${otra.origen}, ${otra.codigo}`);
      if (ciclo !== 1) tarjeta.setAttribute('aria-hidden', 'true');
      tarjeta.dataset.ciclo = String(ciclo);

      const encabezado = document.createElement('header');
      encabezado.className = 'ficha-galeria__encabezado';
      const origen = document.createElement('h2');
      origen.className = 'ficha-galeria__origen';
      origen.textContent = otra.origen;
      origen.style.fontSize = Math.min(32, 430 / Math.max(1, otra.origen.length)) + 'px';
      const codigo = document.createElement('p');
      codigo.className = 'ficha-galeria__codigo';
      codigo.textContent = otra.codigo;
      encabezado.append(origen, codigo);

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

      const grupo = document.createElement('p');
      grupo.className = 'ficha-galeria__grupo';
      const etiqueta = document.createElement('span');
      etiqueta.textContent = 'GRUPO';
      const valor = document.createElement('span');
      valor.textContent = GRUPO_NOMBRE[otra.grupo] || otra.grupo;
      grupo.append(etiqueta, valor);

      const especies = document.createElement('div');
      especies.className = 'ficha-galeria__especies';
      const compartidas = otra.vinculosDatos.especies.filter(e => muestra.vinculosDatos.especies.includes(e));
      const comparte = document.createElement('span');
      comparte.className = 'ficha-galeria__comparte';
      comparte.textContent = 'COMPARTE';
      especies.appendChild(comparte);
      for (const nombre of compartidas.slice(0, 2)) {
        const especie = document.createElement('p');
        especie.textContent = nombre;
        especies.appendChild(especie);
      }

      const boton = document.createElement('button');
      boton.className = 'ficha-galeria__cta';
      boton.type = 'button';
      boton.textContent = 'VER FICHA DE MUESTRA ↗';
      if (ciclo !== 1) boton.tabIndex = -1;
      boton.addEventListener('click', () => alAbrir(otra));
      tarjeta.append(encabezado, marco, grupo, especies, boton);
      track.appendChild(tarjeta);
      tarjetas.push(tarjeta);
    }
  }
  galeria.appendChild(track);

  // El único recorte horizontal coincide con los bordes de la pantalla.
  const raiz=galeria.closest('.detalle-composicion');
  const niebla=document.createElement('div');niebla.className='ficha-galeria-niebla';niebla.setAttribute('aria-hidden','true');
  for(let i=0;i<8;i++){const banda=document.createElement('i');banda.style.left=(i*12.5)+'%';banda.style.backdropFilter=`blur(${[.5,1,2,4,8,14,24,40][i]}px)`;banda.style.webkitBackdropFilter=banda.style.backdropFilter;niebla.appendChild(banda);}
  raiz.appendChild(niebla);
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
    niebla.style.top=((galeria.getBoundingClientRect().top-r.top)/factor)+'px';
    medir();if(anchoCiclo)galeria.scrollLeft=anchoCiclo-margen;
  };
  const enScroll = () => {
    if (ajustando || !anchoCiclo) return;
    if (galeria.scrollLeft < anchoCiclo * .5-margen || galeria.scrollLeft >= anchoCiclo * 1.5-margen) {
      ajustando = true;
      galeria.scrollLeft += galeria.scrollLeft < anchoCiclo * .5-margen ? anchoCiclo : -anchoCiclo;
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
    niebla.remove();
    galeria.classList.remove('ficha-galeria');
    galeria.removeAttribute('role');
    galeria.removeAttribute('aria-label');
    galeria.removeAttribute('tabindex');
  };
}
