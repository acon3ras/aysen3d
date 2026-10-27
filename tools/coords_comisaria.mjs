import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const LAT0 = -45.4046975;
const LON0 = -72.6844030;
const A = 6378137.0;
const E2 = 6.69437999014e-3;
const PHI0 = (LAT0 * Math.PI) / 180;
const SIN0 = Math.sin(PHI0);
const NRAD = A / Math.sqrt(1 - E2 * SIN0 * SIN0);
const MRAD = (A * (1 - E2)) / Math.pow(1 - E2 * SIN0 * SIN0, 1.5);
const KX = (Math.PI / 180) * NRAD * Math.cos(PHI0);
const KY = (Math.PI / 180) * MRAD;

const lat = -45.4060422;
const lon = -72.6972448;
const x = Math.round((lon - LON0) * KX * 10) / 10;
const z = Math.round(-(lat - LAT0) * KY * 10) / 10;

console.log(`Oficina de Tierras y Colonización (2ª Comisaría):`);
console.log(`X: ${x} m, Z: ${z} m`);
