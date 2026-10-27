/**
 * Catálogo y Configuración de Mobiliario Urbano y Lugares de Puerto Aysén
 * Define dimensiones, materiales, colores y ubicaciones de elementos repetitivos:
 * - Bancas de madera de lenga con soporte de hierro forjado
 * - Farolas coloniales patagónicas con luz cálida
 * - Pérgola central de la Plaza de Armas
 * - Barandas protectoras de la Costanera Condell frente al Río Aysén
 * - Letreros de esquinas con nombres de calles emblemáticas
 */

export const CITY_CONFIG = {
  name: 'Puerto Aysén',
  region: 'Patagonia Chilena',

  // Colores característicos de la arquitectura y mobiliario aysenino
  palette: {
    lengaWood: 0x78350f,      // Madera de lenga tratada
    alerceWood: 0x92400e,     // Alerce patagónico
    castIron: 0x1e293b,       // Hierro fundido negro/grafito
    riverRailing: 0x334155,   // Acero galvanizado gris oscuro
    lampGlow: 0xfef08a,       // Luminaria cálida 3000K
    streetSignGreen: 0x14532d,// Verde vial clásico chileno
    stonePlinth: 0x64748b     // Piedra rodada de río
  },

  // Especificaciones del mobiliario
  furniture: {
    // Banca de Plaza (Madera de lenga + hierro negro)
    bench: {
      width: 1.8,
      depth: 0.65,
      height: 0.8,
      seatHeight: 0.42
    },
    // Farola colonial patagónica (Poste ornamental de 4.2m)
    streetLamp: {
      height: 4.2,
      lanternSize: 0.55,
      postRadius: 0.08,
      lightColor: 0xffedd5,
      lightIntensity: 1.8,
      lightDistance: 22
    },
    // Pérgola central de la Plaza de Armas
    pergola: {
      position: [-1107, 0.2, 219],
      width: 12,
      length: 12,
      height: 3.8,
      pillars: 8
    },
    // Baranda protectora de la Costanera Condell (Borde sur del Río Aysén)
    costanera: {
      startX: -900,
      endX: -200,
      z: 112, // Borde de la costanera hacia el agua
      railingHeight: 1.15,
      postSpacing: 2.5
    }
  },

  // Letreros esquineros de calles reales
  streetSigns: [
    { name: 'Sgto. Aldea / Prat', pos: [-1119, 2.8, 223] },
    { name: 'Sgto. Aldea / Carrera', pos: [-997, 2.8, 203] },
    { name: 'Sgto. Aldea / O\'Higgins', pos: [-1050, 2.8, 100] },
    { name: 'Eusebio Ibar / Sargento Aldea', pos: [-321, 2.8, -605] },
    { name: 'Costanera Condell', pos: [-480, 2.8, 115] }
  ]
};

export default CITY_CONFIG;
