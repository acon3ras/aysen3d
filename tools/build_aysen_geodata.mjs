import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inFile = path.join(__dirname, 'data', 'aysen_osm_raw.json');
const outFile = path.join(__dirname, '..', 'js', 'aysen-geodata.js');

const raw = JSON.parse(fs.readFileSync(inFile, 'utf8'));

// Origen del mundo 3D (0, 0, 0): Centro del Puente Presidente Ibáñez
const LAT0 = -45.4046975;
const LON0 = -72.6844030;

// Proyección Tangente Local WGS84 a metros:
// +X = Este (m), +Z = Sur (m) -> Norte es -Z, Arriba es +Y en Three.js
const A = 6378137.0;
const E2 = 6.69437999014e-3;
const PHI0 = (LAT0 * Math.PI) / 180;
const SIN0 = Math.sin(PHI0);
const NRAD = A / Math.sqrt(1 - E2 * SIN0 * SIN0);
const MRAD = (A * (1 - E2)) / Math.pow(1 - E2 * SIN0 * SIN0, 1.5);
const KX = (Math.PI / 180) * NRAD * Math.cos(PHI0); // m por grado lon
const KY = (Math.PI / 180) * MRAD;                  // m por grado lat

const q = (v) => Math.round(v * 10) / 10;
const toWorld = (lon, lat) => [q((lon - LON0) * KX), q(-(lat - LAT0) * KY)];

function ringArea(ring) {
  let a = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    a += (ring[j][0] * ring[i][1]) - (ring[i][0] * ring[j][1]);
  }
  return a / 2;
}

function centroid(ring) {
  let sx = 0, sz = 0;
  for (const [x, z] of ring) { sx += x; sz += z; }
  return [q(sx / ring.length), q(sz / ring.length)];
}

function flat(pts) {
  const res = [];
  for (const [x, z] of pts) { res.push(x, z); }
  return res;
}

const roads = [];
const buildings = [];
const waterAreas = [];
const waterLines = [];
const parks = [];
let bridgeIbanez = null;

// Ancho de calles estimado según tipo OSM
const ROAD_WIDTHS = {
  primary: 13,
  secondary: 11,
  tertiary: 9,
  residential: 7.5,
  living_street: 6,
  unclassified: 7,
  service: 5,
  footway: 3,
  pedestrian: 6,
  path: 2.5,
  track: 4
};

console.log('[build-geodata] Procesando elementos de OSM...');

for (const el of raw.elements) {
  const t = el.tags || {};
  const geom = el.geometry || [];
  if (geom.length < 2) continue;

  const pts = geom.map((g) => toWorld(g.lon, g.lat));

  // 1. PUENTE PRESIDENTE IBÁÑEZ
  if (t.name === 'Puente Presidente Ibáñez' || (t.bridge && t.name && t.name.includes('Ibáñez'))) {
    bridgeIbanez = {
      id: el.id,
      name: t.name,
      structure: t['bridge:structure'] || 'suspension',
      lanes: parseInt(t.lanes, 10) || 2,
      start: pts[0],
      end: pts[pts.length - 1],
      length: q(Math.hypot(pts[pts.length - 1][0] - pts[0][0], pts[pts.length - 1][1] - pts[0][1])),
      pts: flat(pts),
      surface: t.surface || 'asphalt'
    };
  }

  // 2. CALLES Y VÍAS (highways)
  if (t.highway) {
    const w = ROAD_WIDTHS[t.highway] || 7;
    const isBridge = !!t.bridge;
    roads.push({
      id: el.id,
      name: t.name || '',
      type: t.highway,
      w,
      lanes: parseInt(t.lanes, 10) || (w > 8 ? 2 : 1),
      oneway: t.oneway === 'yes' || t.oneway === '1',
      bridge: isBridge,
      pts: flat(pts)
    });
  }

  // 3. EDIFICIOS (buildings)
  if (t.building && pts.length >= 3) {
    const area = Math.abs(ringArea(pts));
    if (area >= 15) { // Filtrar cobertizos microscópicos menores a 15 m2
      const [cx, cz] = centroid(pts);
      let levels = 1;
      if (t['building:levels']) {
        levels = parseFloat(t['building:levels']) || 1;
      } else if (area > 350) {
        levels = 2; // Construcciones de mayor porte
      }
      const height = q(levels * 3.2);

      buildings.push({
        id: el.id,
        name: t.name || '',
        levels,
        h: height,
        area: q(area),
        c: [cx, cz],
        ring: flat(pts)
      });
    }
  }

  // 4. AGUA Y RÍO AYSÉN (waterway / natural=water)
  if (t.waterway || t.natural === 'water') {
    const isClosed = pts.length >= 3 && pts[0][0] === pts[pts.length - 1][0] && pts[0][1] === pts[pts.length - 1][1];
    if (isClosed || t.natural === 'water') {
      waterAreas.push({
        id: el.id,
        name: t.name || 'Río Aysén',
        ring: flat(pts)
      });
    } else {
      waterLines.push({
        id: el.id,
        name: t.name || 'Río Aysén',
        type: t.waterway,
        pts: flat(pts)
      });
    }
  }

  // 5. PARQUES Y PLAZAS
  if (t.leisure === 'park' || t.landuse === 'grass' || t.leisure === 'pitch') {
    if (pts.length >= 3) {
      parks.push({
        id: el.id,
        name: t.name || 'Área Verde',
        ring: flat(pts)
      });
    }
  }
}

// 6. HITOS NOTABLES (LANDMARKS)
const landmarks = [
  { name: 'Puente Presidente Ibáñez', c: [0, 0], desc: 'Monumento Histórico Nacional (210 m)' },
  { name: 'Plaza de Armas Puerto Aysén', c: [-1107, 219], desc: 'Centro cívico de Ribera Sur' },
  { name: 'Polideportivo 21 de Abril', c: [-1350, 480], desc: 'Complejo deportivo principal' },
  { name: 'Ilustre Municipalidad de Aysén', c: [-1050, 180], desc: 'Edificio consistorial' },
  { name: 'Hospital de Puerto Aysén', c: [15, 430], desc: 'Hospital de Puerto Aysén' },
  { name: 'Ribera Norte (Acceso Coyhaique)', c: [50, -220], desc: 'Ruta 240 hacia Coyhaique' },
  { name: 'Confluencia Río Los Palos', c: [-450, -900], desc: 'Unión de ríos patagónicos' }
];

// 7. PUNTOS DE APARICIÓN (SPAWN POINTS)
const spawnPoints = [
  { id: 'puente', name: 'Sobre el Puente Ibáñez', pos: [0, 8.5, 30], lookAt: [0, 8.5, -90] },
  { id: 'plaza', name: 'Plaza de Armas', pos: [-1100, 14, 260], lookAt: [-1107, 3, 219] },
  { id: 'costanera', name: 'Costanera Río Aysén', pos: [-500, 12, 120], lookAt: [-500, 2, 0] },
  { id: 'ribera_norte', name: 'Ribera Norte', pos: [30, 8, -170], lookAt: [0, 7, 0] }
];

const GEO = {
  city: 'Puerto Aysén',
  region: 'Región de Aysén del General Carlos Ibáñez del Campo, Chile',
  datum: 'WGS84 Tangent Plane (1 unit = 1 meter)',
  origin: { lat: LAT0, lon: LON0, name: 'Puente Presidente Ibáñez' },
  bridge: bridgeIbanez,
  roads,
  buildings,
  waterAreas,
  waterLines,
  parks,
  landmarks,
  spawnPoints,
  stats: {
    totalRoads: roads.length,
    totalBuildings: buildings.length,
    totalParks: parks.length,
    waterPolys: waterAreas.length,
    waterWays: waterLines.length
  }
};

const outputContent = `// js/aysen-geodata.js — GENERADO AUTOMÁTICAMENTE para Slop Puerto Aysén
// No editar manualmente. Regenerar con: node tools/build_aysen_geodata.mjs
// Origen (0, 0, 0): Puente Presidente Ibáñez (-45.4046975, -72.6844030)
// Unidades: 1 unidad = 1 metro. +X = Este, +Z = Sur, -Z = Norte, +Y = Arriba.

export const AYSEN_GEO = ${JSON.stringify(GEO)};
export default AYSEN_GEO;
`;

fs.writeFileSync(outFile, outputContent, 'utf8');
const sizeKb = (fs.statSync(outFile).size / 1024).toFixed(1);

console.log(`[build-geodata] ¡Geodata generada exitosamente en ${outFile}! (${sizeKb} KB)`);
console.log(`[build-geodata] Estadísticas consolidadas:`);
console.log(`  - Calles compiladas: ${roads.length}`);
console.log(`  - Huellas de edificios: ${buildings.length}`);
console.log(`  - Áreas verdes/parques: ${parks.length}`);
console.log(`  - Geometrías de río/agua: ${waterAreas.length} polígonos, ${waterLines.length} ejes`);
if (bridgeIbanez) {
  console.log(`  - Puente Ibáñez: detectado con longitud de ${bridgeIbanez.length} metros`);
}
