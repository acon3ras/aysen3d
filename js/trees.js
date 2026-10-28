import * as THREE from 'three';

/**
 * Vegetación Patagónica Instanciada
 * Distribuye árboles autóctonos (coihues, lengas, álamos sureños) a lo largo
 * de las orillas del Río Aysén, plazas y áreas residenciales.
 */
export function createPatagonianFoliage(geoData) {
  const foliageGroup = new THREE.Group();
  foliageGroup.name = 'PatagonianFoliage';

  const count = 1200;

  // Geometría del tronco
  const trunkGeo = new THREE.CylinderGeometry(0.2, 0.4, 3.5, 5);
  trunkGeo.translate(0, 1.75, 0);
  const trunkMat = new THREE.MeshStandardMaterial({
    color: 0x4a2e1b,
    roughness: 0.9
  });

  // Geometría de la copa (cono o elipsoide verde bosque)
  const foliageGeo = new THREE.ConeGeometry(2.2, 6, 6);
  foliageGeo.translate(0, 5.5, 0);
  const foliageMat = new THREE.MeshStandardMaterial({
    color: 0x1b4332,
    roughness: 0.8,
    flatShading: true
  });

  const instancedTrunk = new THREE.InstancedMesh(trunkGeo, trunkMat, count);
  const instancedFoliage = new THREE.InstancedMesh(foliageGeo, foliageMat, count);

  const dummy = new THREE.Object3D();
  let idx = 0;

  // 1. Árboles a lo largo de las orillas del Río Aysén
  for (let x = -1800; x < 1500; x += 18) {
    if (idx >= count - 200) break;
    // Orilla norte y sur del río
    [-125 + (Math.sin(x * 0.05) * 8), 125 + (Math.cos(x * 0.05) * 8)].forEach((z) => {
      // Dejar completamente despejada la calzada del Puente Presidente Ibáñez y accesos
      if (Math.abs(x) < 18 && Math.abs(z) < 220) return;

      const scale = 0.75 + Math.sin(x * 0.3) * 0.35;
      dummy.position.set(x + (Math.sin(z) * 6), 0.5, z);
      dummy.scale.set(scale, scale * (0.9 + Math.random() * 0.3), scale);
      dummy.rotation.y = Math.random() * Math.PI * 2;
      dummy.updateMatrix();

      instancedTrunk.setMatrixAt(idx, dummy.matrix);
      instancedFoliage.setMatrixAt(idx, dummy.matrix);
      idx++;
    });
  }

  // 2. Árboles en la Plaza de Armas y alrededores
  const plazaX = -1107;
  const plazaZ = 219;
  for (let i = 0; i < 45; i++) {
    if (idx >= count) break;
    const ang = Math.random() * Math.PI * 2;
    const rad = 8 + Math.random() * 45;
    const x = plazaX + Math.cos(ang) * rad;
    const z = plazaZ + Math.sin(ang) * rad;

    // Despejar la huella y explanada cívica de la Municipalidad
    if (Math.abs(x - (-1113.7)) < 20 && Math.abs(z - 187.1) < 20) continue;

    const scale = 0.85 + Math.random() * 0.4;
    dummy.position.set(x, 0.2, z);
    dummy.scale.set(scale, scale, scale);
    dummy.rotation.y = Math.random() * Math.PI * 2;
    dummy.updateMatrix();

    instancedTrunk.setMatrixAt(idx, dummy.matrix);
    instancedFoliage.setMatrixAt(idx, dummy.matrix);
    idx++;
  }

  instancedTrunk.instanceMatrix.needsUpdate = true;
  instancedFoliage.instanceMatrix.needsUpdate = true;
  instancedTrunk.castShadow = true;
  instancedFoliage.castShadow = true;

  foliageGroup.add(instancedTrunk, instancedFoliage);
  return foliageGroup;
}
