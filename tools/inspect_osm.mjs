import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(__dirname, 'data', 'aysen_osm_raw.json');
const raw = JSON.parse(fs.readFileSync(file, 'utf8'));

console.log(`Total elements: ${raw.elements.length}`);

// Buscar calles con nombre
const streets = new Set();
const buildings = [];
const namedWater = [];
let puente = null;

for (const el of raw.elements) {
  const t = el.tags || {};
  if (t.highway && t.name) {
    streets.add(`${t.name} (${t.highway})`);
  }
  if (t.name && (t.name.toLowerCase().includes('ibáñez') || t.name.toLowerCase().includes('ibanez') || t.bridge)) {
    console.log('Puente o estructura encontrada:', t.name, t);
    puente = el;
  }
  if (t.name && (t.waterway || t.natural === 'water')) {
    namedWater.push(`${t.name} (${t.waterway || t.natural})`);
  }
  if (t.building && t.name) {
    buildings.push(`${t.name} [levels: ${t['building:levels'] || '1'}]`);
  }
}

console.log('\n--- Puentes / Estructuras ---');
console.log(puente ? `Puente encontrado: ${puente.tags.name || 'Sin nombre'}` : 'No encontrado directamente con ese tag');

console.log('\n--- Calles principales encontradas (Muestra de 15) ---');
console.log([...streets].slice(0, 15).join('\n'));

console.log('\n--- Edificios con nombre (Muestra de 15) ---');
console.log(buildings.slice(0, 15).join('\n'));

console.log('\n--- Cuerpos de agua con nombre ---');
console.log([...new Set(namedWater)].join('\n'));
