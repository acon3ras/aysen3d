import * as THREE from 'three';

/**
 * Detalles Urbanos y Callejeros de Puerto Aysén
 * Nivel 2 de Fidelidad Callejera:
 * 1. Postes de luz de hormigón y madera con crucetas y transformadores
 * 2. Cableado eléctrico aéreo colgante (catenarias sobre las calles)
 * 3. Toldos y marquesinas comerciales a lo largo de Calle Sargento Aldea
 * 4. Letreros de locales y comercios típicos ayseninos
 * 5. Paraderos de locomoción colectiva
 */
export function createStreetDetails(geoData) {
  const detailsGroup = new THREE.Group();
  detailsGroup.name = 'StreetDetails';

  // Materiales
  const concretePoleMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8, // Hormigón gris claro
    roughness: 0.92
  });

  const transformerMat = new THREE.MeshStandardMaterial({
    color: 0x475569, // Metal oscuro de transformador
    metalness: 0.8,
    roughness: 0.35
  });

  const cableMat = new THREE.LineBasicMaterial({
    color: 0x0f172a, // Cable negro grafito
    linewidth: 1.5
  });

  const busStopGlass = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.45,
    roughness: 0.1
  });

  const signColors = [
    0x1e3a8a, // Azul almacén
    0x991b1b, // Rojo ferretería
    0x15803d, // Verde botillería
    0xb45309, // Ocre panadería
    0x4338ca  // Índigo farmacia
  ];

  const signMaterials = signColors.map((c) => new THREE.MeshStandardMaterial({
    color: c,
    roughness: 0.4,
    metalness: 0.1
  }));

  // ---------------------------------------------------------------------------
  // 1. POSTES ELÉCTRICOS Y CABLEADO AÉREO (SARGENTO ALDEA Y CENTRO)
  // ---------------------------------------------------------------------------
  const polePositions = [];
  // Postes a lo largo de Sargento Aldea (de X = -1050 hasta X = -100) cada 40 metros
  for (let x = -1050; x <= -100; x += 38) {
    polePositions.push([x, 0.2, 90]);
  }

  // Postes por Calle Bernardo O'Higgins hacia la Plaza
  for (let z = 50; z <= 260; z += 35) {
    polePositions.push([-1005, 0.2, z]);
  }

  const poleHeight = 7.5;
  const poleCount = polePositions.length;

  // Postes verticales
  const poleGeo = new THREE.CylinderGeometry(0.12, 0.18, poleHeight, 6);
  poleGeo.translate(0, poleHeight / 2, 0);
  const instancedPoles = new THREE.InstancedMesh(poleGeo, concretePoleMat, poleCount);

  // Crucetas de madera/acero en la parte alta
  const crossarmGeo = new THREE.BoxGeometry(1.6, 0.12, 0.12);
  crossarmGeo.translate(0, poleHeight - 0.4, 0);
  const instancedCrossarms = new THREE.InstancedMesh(crossarmGeo, concretePoleMat, poleCount);

  // Transformadores de distribución en cada 3er poste
  const transGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.85, 8);
  transGeo.translate(0.35, poleHeight - 1.2, 0);
  const transCount = Math.ceil(poleCount / 3);
  const instancedTrans = new THREE.InstancedMesh(transGeo, transformerMat, transCount);

  const dummy = new THREE.Object3D();
  let tIdx = 0;

  polePositions.forEach((pos, idx) => {
    dummy.position.set(pos[0], pos[1], pos[2]);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();

    instancedPoles.setMatrixAt(idx, dummy.matrix);
    instancedCrossarms.setMatrixAt(idx, dummy.matrix);

    if (idx % 3 === 0 && tIdx < transCount) {
      instancedTrans.setMatrixAt(tIdx++, dummy.matrix);
    }
  });

  instancedPoles.instanceMatrix.needsUpdate = true;
  instancedCrossarms.instanceMatrix.needsUpdate = true;
  instancedTrans.instanceMatrix.needsUpdate = true;
  instancedPoles.castShadow = true;

  detailsGroup.add(instancedPoles, instancedCrossarms, instancedTrans);

  // CABLES ELÉCTRICOS COLGANTES (CATENARIAS ENTRE POSTES)
  const cablePositions = [];
  for (let i = 0; i < polePositions.length - 1; i++) {
    const p1 = polePositions[i];
    const p2 = polePositions[i + 1];
    const dist = Math.hypot(p2[0] - p1[0], p2[2] - p1[2]);

    // Conectar solo postes consecutivos razonablemente cercanos (< 50m)
    if (dist < 50) {
      [-0.6, 0.6].forEach((wireOffset) => {
        const pA = new THREE.Vector3(p1[0], p1[1] + poleHeight - 0.35, p1[2] + wireOffset);
        const pB = new THREE.Vector3(p2[0], p2[1] + poleHeight - 0.35, p2[2] + wireOffset);

        // Curva catenaria con flecha de caída de 40 cm
        const mid = pA.clone().lerp(pB, 0.5);
        mid.y -= 0.42;

        const curve = new THREE.QuadraticBezierCurve3(pA, mid, pB);
        const pts = curve.getPoints(12);
        for (let j = 0; j < pts.length - 1; j++) {
          cablePositions.push(pts[j].x, pts[j].y, pts[j].z);
          cablePositions.push(pts[j + 1].x, pts[j + 1].y, pts[j + 1].z);
        }
      });
    }
  }

  const cableGeo = new THREE.BufferGeometry();
  cableGeo.setAttribute('position', new THREE.Float32BufferAttribute(cablePositions, 3));
  const cableLines = new THREE.LineSegments(cableGeo, cableMat);
  detailsGroup.add(cableLines);

  // ---------------------------------------------------------------------------
  // 2. LETREROS COMERCIALES Y TOLDOS EN SARGENTO ALDEA
  // ---------------------------------------------------------------------------
  const commercialShops = [
    { name: 'Ferretería El Puente', x: -350, z: 92, matIdx: 1 },
    { name: 'Panadería La Porteña', x: -440, z: 92, matIdx: 3 },
    { name: 'Almacén San Sebastián', x: -530, z: 92, matIdx: 0 },
    { name: 'Librería Patagonia Austral', x: -620, z: 92, matIdx: 4 },
    { name: 'Botillería Los Glaciares', x: -710, z: 92, matIdx: 2 },
    { name: 'Carnicería San Cristóbal', x: -800, z: 92, matIdx: 1 },
    { name: 'Café & Pastelería Aysén', x: -890, z: 92, matIdx: 3 },
    { name: 'Farmacia Cruz del Sur', x: -980, z: 92, matIdx: 4 }
  ];

  commercialShops.forEach((shop) => {
    // Letrero marquesina sobresaliente
    const signGeo = new THREE.BoxGeometry(2.4, 0.65, 0.1);
    const signMesh = new THREE.Mesh(signGeo, signMaterials[shop.matIdx]);
    signMesh.position.set(shop.x, 3.8, shop.z);
    signMesh.castShadow = true;
    detailsGroup.add(signMesh);

    // Toldo / Alero para la lluvia
    const awningGeo = new THREE.BoxGeometry(3.2, 0.08, 1.4);
    const awningMesh = new THREE.Mesh(awningGeo, signMaterials[shop.matIdx]);
    awningMesh.position.set(shop.x, 3.2, shop.z + 0.6);
    awningMesh.rotation.x = 0.15; // Inclinación para escurrimiento de agua
    awningMesh.castShadow = true;
    detailsGroup.add(awningMesh);
  });

  // ---------------------------------------------------------------------------
  // 3. PARADEROS DE COLECTIVOS Y MICROS
  // ---------------------------------------------------------------------------
  const busStopLocations = [
    { x: -320, z: 94 }, // Entrada al puente
    { x: -650, z: 94 }, // Eje intermedio Sargento Aldea
    { x: -1020, z: 94 } // Llegada a Plaza de Armas
  ];

  busStopLocations.forEach((loc) => {
    const stopGroup = new THREE.Group();
    stopGroup.position.set(loc.x, 0.2, loc.z);

    // Pilares de acero
    [-1.2, 1.2].forEach((px) => {
      const pGeo = new THREE.BoxGeometry(0.08, 2.4, 0.08);
      const post = new THREE.Mesh(pGeo, transformerMat);
      post.position.set(px, 1.2, 0);
      stopGroup.add(post);
    });

    // Techo curvo de policarbonato
    const roofGeo = new THREE.BoxGeometry(2.8, 0.06, 1.5);
    const roof = new THREE.Mesh(roofGeo, busStopGlass);
    roof.position.set(0, 2.4, 0.4);
    roof.rotation.x = 0.08;
    stopGroup.add(roof);

    // Panel trasero de vidrio
    const glassGeo = new THREE.BoxGeometry(2.4, 1.8, 0.04);
    const glass = new THREE.Mesh(glassGeo, busStopGlass);
    glass.position.set(0, 1.2, 0);
    stopGroup.add(glass);

    detailsGroup.add(stopGroup);
  });

  return detailsGroup;
}
