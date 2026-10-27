import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(__dirname, 'data', 'aysen_osm_raw.json');
const raw = JSON.parse(fs.readFileSync(file, 'utf8'));

for (const el of raw.elements) {
  const t = el.tags || {};
  if (t.name === 'Puente Presidente Ibáñez') {
    console.log('Puente geometry nodes:', el.geometry.length);
    console.log('First node:', el.geometry[0]);
    console.log('Last node:', el.geometry[el.geometry.length - 1]);
    
    // Midpoint
    const midIdx = Math.floor(el.geometry.length / 2);
    console.log('Midpoint node:', el.geometry[midIdx]);
    break;
  }
}
