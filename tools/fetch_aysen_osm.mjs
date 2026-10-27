import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_FILE = path.join(__dirname, 'data', 'aysen_osm_raw.json');

// Bounding box para Puerto Aysén:
// Sur: -45.420, Oeste: -72.720, Norte: -45.390, Este: -72.670
const BBOX = '-45.420,-72.720,-45.390,-72.670';

const QUERY = `[out:json][timeout:90];
(
  // Vías (calles, avenidas, pasajes, puentes)
  way["highway"](${BBOX});
  
  // Huellas de edificios
  way["building"](${BBOX});
  relation["building"](${BBOX});
  
  // Cuerpos de agua (Río Aysén, orillas)
  way["waterway"](${BBOX});
  relation["waterway"](${BBOX});
  way["natural"="water"](${BBOX});
  relation["natural"="water"](${BBOX});
  
  // Parques, plazas y áreas verdes
  way["leisure"="park"](${BBOX});
  way["leisure"="pitch"](${BBOX});
  way["landuse"="grass"](${BBOX});
  way["landuse"="recreation_ground"](${BBOX});

  // Puentes y estructuras
  way["bridge"](${BBOX});
);
out body geom;
`;

const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter'
];

async function tryFetch(endpoint) {
  console.log(`[fetch-osm] Intentando con: ${endpoint}...`);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'SlopPuertoAysen/1.0 (ThreeJS City Sim; contact@aysen3d.local)'
    },
    body: 'data=' + encodeURIComponent(QUERY),
    signal: controller.signal
  });
  clearTimeout(timeout);

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }

  const data = await res.json();
  if (!data || !Array.isArray(data.elements)) {
    throw new Error('Respuesta inválida de Overpass (sin elementos)');
  }

  return data;
}

async function main() {
  console.log('[fetch-osm] Iniciando descarga de OpenStreetMap para Puerto Aysén...');
  console.log(`[fetch-osm] BBox: ${BBOX}`);

  let success = false;
  for (const ep of ENDPOINTS) {
    try {
      const data = await tryFetch(ep);
      fs.writeFileSync(OUT_FILE, JSON.stringify(data, null, 2), 'utf8');
      const sizeMb = (fs.statSync(OUT_FILE).size / (1024 * 1024)).toFixed(2);
      console.log(`[fetch-osm] Exito! Datos guardados en: ${OUT_FILE}`);
      console.log(`[fetch-osm] Elementos recibidos: ${data.elements.length} (${sizeMb} MB)`);

      // Conteo de categorias
      let highways = 0, buildings = 0, water = 0, parks = 0;
      for (const el of data.elements) {
        const t = el.tags || {};
        if (t.highway) highways++;
        if (t.building) buildings++;
        if (t.waterway || t.natural === 'water') water++;
        if (t.leisure === 'park' || t.landuse === 'grass') parks++;
      }
      console.log(`[fetch-osm] Desglose:`);
      console.log(`  - Calles/vías (highways): ${highways}`);
      console.log(`  - Edificios (buildings): ${buildings}`);
      console.log(`  - Agua/Río Aysén: ${water}`);
      console.log(`  - Parques/Plazas: ${parks}`);

      success = true;
      break;
    } catch (err) {
      console.warn(`[fetch-osm] Fallo con ${ep}: ${err.message}`);
    }
  }

  if (!success) {
    console.error('[fetch-osm] Error: Ninguno de los endpoints respondió.');
    process.exit(1);
  }
}

main();
