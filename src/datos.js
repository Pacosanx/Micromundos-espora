// Colección ficticia de Micromundos (conceptual, no es un inventario real).
//
// Las muestras NO se listan a mano: salen de las dos recetas de Paco (receta_A.json y receta_B.json).
// Cada elemento de esas recetas es una muestra, en el mismo lugar y con el mismo tamaño. De ahí se deduce:
//   · grupo     ← la paleta del elemento
//   · fecha     ← la distancia al centro (escala logarítmica, presente al centro)
//   · colonias  ← el tamaño (escala logarítmica, 1 a más de 300)
//   · estado    ← la forma original como pista (anillo → registro digital, borde irregular → en conservación),
//                 el resto al azar, más conservadas o en registro cuanto más viejas
// Acá solo están los nombres de origen que se reparten por grupo, y la fecha de hoy.

const HOY = { y: 2026, m: 11, d: 13 };
const FECHA_MAS_VIEJA = 2000.4;   // la muestra más alejada del centro queda en esta fecha

// grupo según la paleta del elemento en las recetas (c1 + c2 + c3)
const PALETA_GRUPO = {
  '#ff4c52#f58bc3#fffbee': 'B',
  '#ff9c20#ffc21c#fffbee': 'L',
  '#27633f#6a983a#dce642': 'M',
  '#f58bc3#ff4c52#ffc21c': 'BL',
};

const ORIGENES = {
  B: ['Pantalla de celular','Yogur natural','Agua de charco','Teclado de computadora','Suela de zapatilla','Picaporte',
      'Mostrador de cocina','Esponja de cocina','Moneda','Cepillo de dientes','Baranda de colectivo','Barbijo',
      'Pileta de natación','Aire de aula','Leche cruda','Manteca','Suelo de campo','Control remoto','Billete',
      'Tabla de picar','Botón de ascensor','Mouse','Rejilla de pileta','Piel de antebrazo','Saliva','Mochila escolar',
      'Pasamanos de escalera','Carrito de supermercado','Bebedero de plaza','Lavarropas','Tarjeta de colectivo',
      'Auriculares','Almohada','Cajero automático','Agua de florero','Grifo de baño','Collar de mascota','Joystick'],
  L: ['Uvas de mesa','Mano de infante','Suelo de jardín','Miel cruda','Cerveza artesanal','Vino casero','Flor de jazmín',
      'Jugo de manzana','Pan dulce','Aceitunas','Sidra','Mosto','Ciruelas','Néctar de flor','Corteza de roble','Hidromiel',
      'Masa de pizza','Higos frescos','Dátiles','Piel de durazno','Rosa del jardín','Hojas de parra','Kiwi','Melón',
      'Frutilla silvestre','Caña de azúcar','Chicha de maíz','Arándanos','Mosto de malbec','Guindas','Panal de abejas',
      'Pétalos de lavanda','Uva chinche','Mango maduro','Pomelo','Sandía','Membrillo','Corcho de vino','Jarabe de arce',
      'Damascos','Flor de cerezo','Uva rosada','Moras','Licor casero'],
  M: ['Queso de campo','Frutillas','Hoja de árbol','Tomate maduro','Borra de café','Queso azul','Mandarina','Papel húmedo',
      'Pera','Limón','Cebolla','Pan casero','Cuero viejo','Libro antiguo','Pared húmeda','Maíz guardado','Pan de molde',
      'Cortina de baño','Junta de azulejos','Zapato guardado','Maní','Nueces','Salame','Mermelada abierta','Cartón mojado',
      'Cajón de madera','Alfombra','Burlete de heladera','Rodaja de manzana','Zanahoria','Frambuesas','Arroz cocido',
      'Polenta','Tapa de frasco','Corteza de pino','Semillas de girasol','Paja','Fruta de feria','Batata','Higo seco',
      'Ananá','Durazno','Pimiento','Papa','Choclo','Alfajor vencido','Naranja','Pan rallado','Hojarasca','Compost'],
  BL:['Masa madre','Kéfir','Kombucha','Chucrut','Pasas de uva','Yerba mate','Cáscara de naranja','Kimchi',
      'Vinagre de manzana','Pickles caseros','Kéfir de agua','Tepache','Miso','Salsa de soja','Queso de cabra',
      'Pan de centeno','Boza','Aceitunas en salmuera','Kvas','Jengibre fermentado','Leche de cabra','Masa de empanadas',
      'Queso de oveja','Ricota casera','Crema agria','Hojas de té','Cacao fermentado','Granos de café',
      'Pepinos en vinagre','Remolacha fermentada','Ajo negro','Mostaza casera','Yogur griego','Chocolate amargo',
      'Natto','Tempeh','Pulque','Chicha','Masa de arroz','Fainá'],
};

// método de conservación (dato de la ficha para las muestras "En conservación")
const METODOS = ['congelada','liofilizada'];
