import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(__dirname, 'data', 'aysen_osm_raw.json');
const raw = JSON.parse(fs.readFileSync(file, 'utf8'));

for (const el of raw.elements) {
  const t = el.tags || {};
  if (t.name && (t.name.toLowerCase().includes('plaza') || t.name.toLowerCase().includes('armas'))) {
    console.log('Plaza:', t.name, el.tags);
    if (el.geometry) {
      console.log('Coords:', el.geometry[0]);
    }
  }
}
