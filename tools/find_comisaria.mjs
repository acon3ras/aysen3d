import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const raw = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'aysen_osm_raw.json'), 'utf8'));

console.log('Buscando Comisaría / Carabineros / Tierras / Monumentos en OSM:');
for (const el of raw.elements) {
  const t = el.tags || {};
  const str = JSON.stringify(t).toLowerCase();
  if (str.includes('comisar') || str.includes('carabinero') || str.includes('tierras') || str.includes('historic') || str.includes('heritage') || str.includes('policia') || str.includes('police')) {
    console.log(el.id, t.name || 'Sin nombre', t, el.geometry ? el.geometry[0] : el.nodes);
  }
}
