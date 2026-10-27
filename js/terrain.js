import * as THREE from 'three';

/**
 * Terreno y Relieve Patagónico de Puerto Aysén
 * Recrea el encajonamiento característico del valle fluvial:
 * - Suelo urbano plano (valle del Río Aysén a ~9 msnm)
 * - Cerros y cordones montañosos al Norte y Sur (Cordón Porteño, Cerro Marchant)
 * - Cumbres con cumbres nevadas / rocosas en el horizonte
 */
export function createPatagonianTerrain() {
  const terrainGroup = new THREE.Group();
  terrainGroup.name = 'PatagonianTerrain';

  const size = 7000;
  const segments = 90;
  const terrainGeo = new THREE.PlaneGeometry(size, size, segments, segments);
  terrainGeo.rotateX(-Math.PI / 2);

  // Material del terreno con vertex colors (valle verde, laderas boscosas, cumbres nevadas)
  const colors = [];
  const pos = terrainGeo.attributes.position;

  const colorValle = new THREE.Color(0x2d4a22);   // Verde pradera húmeda
  const colorBosque = new THREE.Color(0x1b3b1a);  // Verde bosque denso de coihues
  const colorRoca = new THREE.Color(0x475569);    // Roca andina
  const colorNieve = new THREE.Color(0xf1f5f9);   // Nieve de cumbre

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);

    // Distancia al centro del valle urbano
    const distToRiver = Math.abs(z); // Río Aysén está en Z=0
    let elevation = 0;

    // Zona urbana plana (desde Z = -600m a Z = +700m se mantiene plana para calles y casas)
    if (distToRiver > 600) {
      const distFromValley = distToRiver - 600;
      // Pendiente montañosa pronunciada tipo fiordo
      const baseSlope = Math.pow(distFromValley / 1200, 1.8) * 450;
      // Ruido armónico para aristas de cerros
      const ridgeNoise = Math.sin(x * 0.002) * Math.cos(z * 0.0015) * 120
                       + Math.sin(x * 0.005 + z * 0.003) * 40;
      elevation = Math.max(0, baseSlope + ridgeNoise);
    } else {
      // Suelo del valle con leves ondulaciones
      elevation = Math.sin(x * 0.005) * 1.5 + Math.cos(z * 0.005) * 1.5;
    }

    pos.setY(i, elevation);

    // Coloración según altitud (biomas patagónicos)
    let c = new THREE.Color();
    if (elevation < 20) {
      c.copy(colorValle);
    } else if (elevation < 300) {
      const t = (elevation - 20) / 280;
      c.copy(colorValle).lerp(colorBosque, t);
    } else if (elevation < 550) {
      const t = (elevation - 300) / 250;
      c.copy(colorBosque).lerp(colorRoca, t);
    } else {
      const t = Math.min(1, (elevation - 550) / 200);
      c.copy(colorRoca).lerp(colorNieve, t);
    }
    colors.push(c.r, c.g, c.b);
  }

  terrainGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  terrainGeo.computeVertexNormals();

  const terrainMat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.9,
    metalness: 0.1,
    flatShading: true
  });

  const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
  terrainMesh.receiveShadow = true;
  terrainGroup.add(terrainMesh);

  return terrainGroup;
}
