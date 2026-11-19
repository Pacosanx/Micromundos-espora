// ───────── CONTENIDO SIMULADO (19/11/2026) ─────────
// Pedido de Paco: completar de forma simulada todo lo que decía «en proceso», para entregar ahora con algo creíble a simple
// vista. NADA DE ESTO ESTÁ REVISADO NI TIENE FUENTE: hay que reemplazarlo por el contenido definitivo. Para encontrar todo lo
// simulado, buscar «SIMULADO» o este archivo. Lo que está en base/ (fichas.csv, especies.csv, glosario.csv) manda sobre esto.

// Fichas simuladas: lo que la base todavía no tiene (dónde se tomó, curiosidad, esquema y «Se ayudan»).
const CONTENIDO_FICHAS_SIMULADO = {
  'B-150-LCR': {
    lugar: 'Tanque de frío de un tambo',
    curiosidad: 'Algunas bacterias de la leche siguen creciendo dentro de la heladera: por eso la leche cruda cambia aunque esté fría.',
    come: 'Proteínas', produce: 'Enzimas', resultado: 'Leche amarga',
    seAyudan: 'Pseudomonas fluorescens trabaja sola en esta muestra: sus enzimas resisten el frío y siguen actuando aunque la leche esté refrigerada.'
  },
  'B-302-SDC': {
    lugar: 'Campo sembrado, a diez centímetros de profundidad',
    curiosidad: 'En una cucharadita de suelo puede haber más bacterias que personas en todo el planeta.',
    come: 'Restos de plantas', produce: 'Sustancias protectoras', resultado: 'Raíces más sanas',
    seAyudan: 'Bacillus subtilis y Pseudomonas fluorescens rodean las raíces: compiten con microbios que enferman a las plantas y así las protegen.'
  },
  'M-189-BDH': {
    lugar: 'Burlete de la heladera de una cocina',
    curiosidad: 'El moho crece en el burlete porque ahí se junta humedad y restos de comida, aunque adentro de la heladera haga frío.',
    come: 'Restos de comida', produce: 'Esporas', resultado: 'Manchas verdes',
    seAyudan: 'Penicillium crece solo en esta muestra: sus esporas viajan por el aire de la cocina y vuelven a aparecer si la humedad sigue ahí.'
  },
  'M-048-MAB': {
    lugar: 'Frasco de mermelada abierto en la heladera',
    curiosidad: 'El azúcar conserva la mermelada, pero una vez abierto el frasco algunos mohos pueden crecer en la superficie.',
    come: 'Azúcar de la fruta', produce: 'Micelio y esporas', resultado: 'Capa de moho',
    seAyudan: 'Penicillium verrucosum crece solo en esta muestra: empieza en la superficie, donde hay aire, y desde ahí se extiende.'
  },
  'BL-043-CDN': {
    lugar: 'Cáscara de una naranja de feria',
    curiosidad: 'La cáscara de los cítricos tiene aceites que frenan a muchos microbios; los que viven ahí están acostumbrados a ellos.',
    come: 'Azúcares de la cáscara', produce: 'Sustancias protectoras', resultado: 'Fruta que dura más',
    seAyudan: 'Bacillus subtilis y Debaryomyces hansenii ocupan la superficie de la fruta y les dejan menos lugar a los mohos que la pudren.'
  },
  'BL-183-KOM': {
    lugar: 'Frasco de kombucha casera',
    curiosidad: 'La capa gelatinosa que flota en la kombucha está hecha de celulosa que fabrican las bacterias.',
    come: 'Té azucarado', produce: 'Ácidos y celulosa', resultado: 'Bebida ácida',
    seAyudan: 'Brettanomyces transforma el azúcar en alcohol; Komagataeibacter lo convierte en ácido y teje la capa de celulosa donde viven las dos.'
  },
  'BL-163-CHI': {
    lugar: 'Olla de chicha de maíz en fermentación',
    curiosidad: 'La chicha de maíz se prepara en los Andes desde hace siglos y cada familia tiene su manera de hacerla.',
    come: 'Almidón del maíz', produce: 'Ácido láctico y alcohol', resultado: 'Bebida fermentada',
    seAyudan: 'Lactobacillus plantarum acidifica la chicha y frena a otros microbios; Saccharomyces cerevisiae transforma el azúcar en alcohol y burbujas.'
  }
};

// Especies del Glosario que todavía no están en base/especies.csv (12): definición breve y general.
const ESPECIES_SIMULADAS = {
  'Lactococcus lactis': 'Bacteria láctica que fermenta la leche: se usa para hacer quesos y manteca.',
  'Lactiplantibacillus plantarum': 'Bacteria láctica de los vegetales fermentados, como el chucrut, las aceitunas y la masa madre.',
  'Fructilactobacillus sanfranciscensis': 'Bacteria láctica de la masa madre: le da al pan su sabor ácido.',
  'Streptomyces coelicolor': 'Bacteria del suelo que crece en filamentos y fabrica antibióticos de colores.',
  'Saccharomyces pastorianus': 'Levadura de la cerveza tipo lager: fermenta en frío.',
  'Kazachstania humilis': 'Levadura de la masa madre: vive junto a las bacterias lácticas y hace crecer el pan.',
  'Kluyveromyces lactis': 'Levadura de los lácteos que puede alimentarse de la lactosa de la leche.',
  'Metschnikowia pulcherrima': 'Levadura de la uva y de las flores: produce un pigmento rojizo y frena a otros microbios.',
  'Malassezia restricta': 'Levadura de la piel humana, sobre todo del cuero cabelludo: se alimenta de grasas.',
  'Penicillium digitatum': 'Moho verde de los cítricos: es el que pudre las naranjas y los limones.',
  'Aspergillus oryzae': 'Moho que se usa en Japón para fermentar el arroz y la soja: con él se hacen el miso, la salsa de soja y el sake.',
  'Penicillium camemberti': 'Moho blanco que forma la corteza de quesos como el camembert y el brie.'
};

// Términos del Glosario sin definición en base/glosario.csv (5).
const TERMINOS_SIMULADOS = {
  flagelo: 'Filamento largo que algunas bacterias mueven como una hélice para desplazarse.',
  biofilm: 'Comunidad de microbios pegados a una superficie y envueltos en una capa que fabrican ellos mismos.',
  'masa-madre': 'Mezcla de harina y agua donde conviven levaduras y bacterias lácticas; se usa para hacer crecer el pan.',
  agar: 'Gelatina hecha con algas sobre la que se cultivan microbios en una placa.',
  crecimiento: 'Aumento de la cantidad de células: una colonia crece cuando sus células se multiplican.'
};
