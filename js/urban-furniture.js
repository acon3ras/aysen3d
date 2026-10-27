import * as THREE from 'three';
import { CITY_CONFIG } from './city-config.js';

/**
 * Generador e Instanciador de Mobiliario Urbano de Puerto Aysén
 * Nivel 2 de Fidelidad:
 * - Pérgola central de madera de la Plaza de Armas
 * - Bancas de madera de lenga con soportes de fierro fundido
 * - Farolas coloniales patagónicas con luminaria cálida
 * - Barandas protectoras de la Costanera Condell frente al Río Aysén
 * - Letreros de esquinas de calles reales
 */
export function createUrbanFurniture(geoData) {
  const furnitureGroup = new THREE.Group();
  furnitureGroup.name = 'UrbanFurniture';

  const cfg = CITY_CONFIG;
  const p = cfg.palette;

  // Materiales compartidos para instanciación
  const woodMat = new THREE.MeshStandardMaterial({
    color: p.lengaWood,
    roughness: 0.75,
    metalness: 0.05
  });

  const ironMat = new THREE.MeshStandardMaterial({
    color: p.castIron,
    roughness: 0.5,
    metalness: 0.8
  });

  const stoneMat = new THREE.MeshStandardMaterial({
    color: p.stonePlinth,
    roughness: 0.95
  });

  const lampGlassMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: p.lampGlow,
    emissiveIntensity: 0.9,
    roughness: 0.2
  });

  const signGreenMat = new THREE.MeshStandardMaterial({
    color: p.streetSignGreen,
    roughness: 0.4
  });

  // ---------------------------------------------------------------------------
  // 1. PÉRGOLA CENTRAL DE LA PLAZA DE ARMAS
  // ---------------------------------------------------------------------------
  function buildPergola() {
    const pergola = new THREE.Group();
    pergola.name = 'PergolaPlazaDeArmas';
    const [px, py, pz] = cfg.furniture.pergola.position;
    pergola.position.set(px, py, pz);

    // Plataforma base octogonal de piedra
    const baseGeo = new THREE.CylinderGeometry(7.5, 8.0, 0.4, 8);
    const baseMesh = new THREE.Mesh(baseGeo, stoneMat);
    baseMesh.position.y = 0.2;
    baseMesh.receiveShadow = true;
    pergola.add(baseMesh);

    // 8 Columnas perimetrales de madera con bases de piedra
    const colCount = 8;
    const colRadius = 6.2;
    const colHeight = 3.6;

    for (let i = 0; i < colCount; i++) {
      const angle = (i / colCount) * Math.PI * 2;
      const cx = Math.cos(angle) * colRadius;
      const cz = Math.sin(angle) * colRadius;

      // Base de piedra
      const plinthGeo = new THREE.BoxGeometry(0.7, 0.6, 0.7);
      const plinth = new THREE.Mesh(plinthGeo, stoneMat);
      plinth.position.set(cx, 0.5, cz);
      pergola.add(plinth);

      // Columna de madera
      const colGeo = new THREE.BoxGeometry(0.35, colHeight, 0.35);
      const col = new THREE.Mesh(colGeo, woodMat);
      col.position.set(cx, 0.6 + colHeight / 2, cz);
      col.castShadow = true;
      pergola.add(col);
    }

    // Anillo de vigas superiores
    for (let i = 0; i < colCount; i++) {
      const a1 = (i / colCount) * Math.PI * 2;
      const a2 = ((i + 1) / colCount) * Math.PI * 2;
      const x1 = Math.cos(a1) * colRadius;
      const z1 = Math.sin(a1) * colRadius;
      const x2 = Math.cos(a2) * colRadius;
      const z2 = Math.sin(a2) * colRadius;

      const beamLen = Math.hypot(x2 - x1, z2 - z1);
      const beamGeo = new THREE.BoxGeometry(0.3, 0.4, beamLen);
      const beam = new THREE.Mesh(beamGeo, woodMat);
      beam.position.set((x1 + x2) / 2, 0.6 + colHeight, (z1 + z2) / 2);
      beam.lookAt(new THREE.Vector3(x2, 0.6 + colHeight, z2));
      beam.castShadow = true;
      pergola.add(beam);
    }

    // Techo cónico de vigas de madera a 8 aguas
    const roofPoles = 8;
    for (let i = 0; i < roofPoles; i++) {
      const angle = (i / roofPoles) * Math.PI * 2;
      const edgeX = Math.cos(angle) * colRadius;
      const edgeZ = Math.sin(angle) * colRadius;

      const poleLen = Math.hypot(edgeX, 1.8, edgeZ);
      const poleGeo = new THREE.CylinderGeometry(0.08, 0.12, poleLen, 6);
      const pole = new THREE.Mesh(poleGeo, woodMat);
      pole.position.set(edgeX / 2, 0.6 + colHeight + 0.9, edgeZ / 2);
      pole.lookAt(new THREE.Vector3(edgeX, 0.6 + colHeight, edgeZ));
      pole.rotateX(Math.PI / 2);
      pergola.add(pole);
    }

    // Farola colgante en el centro de la pérgola
    const lampGlobe = new THREE.SphereGeometry(0.35, 12, 12);
    const centerLamp = new THREE.Mesh(lampGlobe, lampGlassMat);
    centerLamp.position.set(0, 0.6 + colHeight - 0.4, 0);
    pergola.add(centerLamp);

    return pergola;
  }

  furnitureGroup.add(buildPergola());

  // ---------------------------------------------------------------------------
  // 2. BANCAS DE MADERA Y FIERRO (PLAZA + COSTANERA)
  // ---------------------------------------------------------------------------
  // Lista de posiciones y rotaciones de bancas
  const benchTransforms = [];

  // Alrededor de la pérgola y jardines de la Plaza de Armas
  const plazaCenter = cfg.furniture.pergola.position;
  const numPlazaBenches = 16;
  for (let i = 0; i < numPlazaBenches; i++) {
    const angle = (i / numPlazaBenches) * Math.PI * 2;
    const dist = 14 + (i % 2 === 0 ? 0 : 8);
    const bx = plazaCenter[0] + Math.cos(angle) * dist;
    const bz = plazaCenter[2] + Math.sin(angle) * dist;
    // Mirando hacia el centro de la plaza
    const rotY = Math.atan2(plazaCenter[0] - bx, plazaCenter[2] - bz) + Math.PI;
    benchTransforms.push({ pos: [bx, 0.2, bz], rotY });
  }

  // A lo largo de la Costanera Condell mirando al Río Aysén
  for (let x = -850; x <= -220; x += 35) {
    // Mirando hacia el río (Norte, hacia el agua en Z < 112)
    benchTransforms.push({ pos: [x, 0.6, 116], rotY: Math.PI });
  }

  // Construir geometría de banca combinada
  function buildBenchMesh() {
    const group = new THREE.Group();
    const bCount = benchTransforms.length;

    // Asiento: 4 listones de madera
    const slatGeo = new THREE.BoxGeometry(1.8, 0.04, 0.12);
    const instancedWood = new THREE.InstancedMesh(slatGeo, woodMat, bCount * 7);

    // Soportes de hierro (2 patas laterales)
    const legGeo = new THREE.BoxGeometry(0.08, 0.45, 0.55);
    const instancedIron = new THREE.InstancedMesh(legGeo, ironMat, bCount * 2);

    const dummy = new THREE.Object3D();
    let woodIdx = 0;
    let ironIdx = 0;

    benchTransforms.forEach((bt) => {
      const [bx, by, bz] = bt.pos;

      // 2 Patas de hierro
      [-0.75, 0.75].forEach((lx) => {
        dummy.position.set(bx, by + 0.22, bz);
        dummy.rotation.set(0, bt.rotY, 0);
        dummy.translateX(lx);
        dummy.updateMatrix();
        instancedIron.setMatrixAt(ironIdx++, dummy.matrix);
      });

      // 4 Listones de asiento
      for (let s = 0; s < 4; s++) {
        dummy.position.set(bx, by + 0.44, bz);
        dummy.rotation.set(0, bt.rotY, 0);
        dummy.translateZ(-0.2 + s * 0.13);
        dummy.updateMatrix();
        instancedWood.setMatrixAt(woodIdx++, dummy.matrix);
      }

      // 3 Listones de respaldo
      for (let r = 0; r < 3; r++) {
        dummy.position.set(bx, by + 0.55 + r * 0.12, bz);
        dummy.rotation.set(0, bt.rotY, 0);
        dummy.translateZ(0.25);
        dummy.updateMatrix();
        instancedWood.setMatrixAt(woodIdx++, dummy.matrix);
      }
    });

    instancedWood.instanceMatrix.needsUpdate = true;
    instancedIron.instanceMatrix.needsUpdate = true;
    instancedWood.castShadow = true;
    instancedIron.castShadow = true;

    group.add(instancedIron, instancedWood);
    return group;
  }

  furnitureGroup.add(buildBenchMesh());

  // ---------------------------------------------------------------------------
  // 3. FAROLAS COLONIALES PATAGÓNICAS (PLAZA + SARGENTO ALDEA + COSTANERA)
  // ---------------------------------------------------------------------------
  const lampTransforms = [];

  // Farolas en la Plaza de Armas
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const dist = 18;
    lampTransforms.push({
      pos: [plazaCenter[0] + Math.cos(angle) * dist, 0.2, plazaCenter[2] + Math.sin(angle) * dist]
    });
  }

  // Farolas a lo largo de Calle Sargento Aldea (eje principal este-oeste)
  for (let x = -1050; x <= -200; x += 45) {
    // Orilla norte y sur de la calle
    lampTransforms.push({ pos: [x, 0.2, 85] });
    lampTransforms.push({ pos: [x, 0.2, 105] });
  }

  // Farolas en la Costanera Condell
  for (let x = -880; x <= -200; x += 40) {
    lampTransforms.push({ pos: [x, 0.6, 118] });
  }

  function buildStreetLampsMesh() {
    const group = new THREE.Group();
    const lCount = lampTransforms.length;

    // Poste vertical de hierro (4.0m)
    const postGeo = new THREE.CylinderGeometry(0.08, 0.14, 4.0, 6);
    postGeo.translate(0, 2.0, 0);
    const instancedPost = new THREE.InstancedMesh(postGeo, ironMat, lCount);

    // Farol superior (globo de luz)
    const lanternGeo = new THREE.BoxGeometry(0.45, 0.55, 0.45);
    lanternGeo.translate(0, 4.15, 0);
    const instancedLantern = new THREE.InstancedMesh(lanternGeo, lampGlassMat, lCount);

    const dummy = new THREE.Object3D();

    lampTransforms.forEach((lt, idx) => {
      dummy.position.set(lt.pos[0], lt.pos[1], lt.pos[2]);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();

      instancedPost.setMatrixAt(idx, dummy.matrix);
      instancedLantern.setMatrixAt(idx, dummy.matrix);
    });

    instancedPost.instanceMatrix.needsUpdate = true;
    instancedLantern.instanceMatrix.needsUpdate = true;
    instancedPost.castShadow = true;

    group.add(instancedPost, instancedLantern);
    return group;
  }

  furnitureGroup.add(buildStreetLampsMesh());

  // ---------------------------------------------------------------------------
  // 4. BARANDAS DE LA COSTANERA CONDELL (FRENTE AL RÍO AYSÉN)
  // ---------------------------------------------------------------------------
  function buildCostaneraRailings() {
    const group = new THREE.Group();
    const startX = cfg.furniture.costanera.startX;
    const endX = cfg.furniture.costanera.endX;
    const z = cfg.furniture.costanera.z;
    const len = endX - startX;
    const postStep = cfg.furniture.costanera.postSpacing;
    const pCount = Math.floor(len / postStep);

    // Postes verticales de acero
    const postGeo = new THREE.BoxGeometry(0.1, 1.15, 0.1);
    postGeo.translate(0, 0.57, 0);
    const instancedPosts = new THREE.InstancedMesh(postGeo, ironMat, pCount);

    const dummy = new THREE.Object3D();
    for (let i = 0; i < pCount; i++) {
      dummy.position.set(startX + i * postStep, 0.6, z);
      dummy.updateMatrix();
      instancedPosts.setMatrixAt(i, dummy.matrix);
    }
    instancedPosts.instanceMatrix.needsUpdate = true;
    instancedPosts.castShadow = true;
    group.add(instancedPosts);

    // Pasamanos superior de madera continuo
    const handrailGeo = new THREE.BoxGeometry(len, 0.08, 0.2);
    const handrail = new THREE.Mesh(handrailGeo, woodMat);
    handrail.position.set(startX + len / 2, 0.6 + 1.15, z);
    handrail.castShadow = true;
    group.add(handrail);

    // Tubos intermedios de protección
    [0.4, 0.75].forEach((h) => {
      const railGeo = new THREE.BoxGeometry(len, 0.05, 0.05);
      const rail = new THREE.Mesh(railGeo, ironMat);
      rail.position.set(startX + len / 2, 0.6 + h, z);
      group.add(rail);
    });

    return group;
  }

  furnitureGroup.add(buildCostaneraRailings());

  // ---------------------------------------------------------------------------
  // 5. LETREROS ESQUINEROS DE CALLES REALES
  // ---------------------------------------------------------------------------
  function buildStreetSigns() {
    const group = new THREE.Group();
    cfg.streetSigns.forEach((sign) => {
      const [sx, sy, sz] = sign.pos;

      // Poste metálico
      const poleGeo = new THREE.CylinderGeometry(0.05, 0.05, sy, 6);
      poleGeo.translate(0, sy / 2, 0);
      const pole = new THREE.Mesh(poleGeo, ironMat);
      pole.position.set(sx, 0.2, sz);
      group.add(pole);

      // Placa verde con bordes
      const plateGeo = new THREE.BoxGeometry(1.2, 0.35, 0.04);
      const plate = new THREE.Mesh(plateGeo, signGreenMat);
      plate.position.set(sx, sy, sz);
      plate.castShadow = true;
      group.add(plate);
    });
    return group;
  }

  furnitureGroup.add(buildStreetSigns());

  return furnitureGroup;
}
