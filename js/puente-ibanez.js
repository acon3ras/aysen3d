import * as THREE from 'three';

/**
 * Puente Presidente Ibáñez — Nivel 3 de Fidelidad Estructural
 * Monumento Histórico Nacional sobre el Río Aysén (Chile)
 *
 * Mejoras estructurales de ingeniería:
 * 1. Torres gemelas con celosía reticulada en X de 5 niveles (truss pattern en doble diagonal).
 * 2. Macizos de anclaje de hormigón masivos en las riberas (Z = ±125m).
 * 3. Cables en catenaria con abrazaderas y tensores en cada péndola.
 * 4. Luminarias colgantes a lo largo del tablero con farolas cálidas.
 * 5. Tablero bicromático: calzada vehicular con guardarraíles metálicos y pasarelas peatonales protegidas.
 */
export function createPuenteIbanez() {
  const bridgeGroup = new THREE.Group();
  bridgeGroup.name = 'PuentePresidenteIbanez_Nivel3';

  // ---------------------------------------------------------------------------
  // MATERIALES
  // ---------------------------------------------------------------------------
  // Acero bermellón patagónico del Puente Ibáñez
  const steelRed = new THREE.MeshStandardMaterial({
    color: 0xb91c1c, // Rojo bermellón característico
    roughness: 0.42,
    metalness: 0.82
  });

  const steelCable = new THREE.MeshStandardMaterial({
    color: 0x475569, // Acero trenzado galvanizado
    roughness: 0.28,
    metalness: 0.92
  });

  const steelHardware = new THREE.MeshStandardMaterial({
    color: 0x334155, // Abrazaderas y herrajes oscuros
    roughness: 0.35,
    metalness: 0.88
  });

  const guardRailMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8, // Acero galvanizado de defensas camineras
    roughness: 0.4,
    metalness: 0.85
  });

  const asphaltMat = new THREE.MeshStandardMaterial({
    color: 0x18181b, // Asfalto vehicular oscuro
    roughness: 0.92,
    metalness: 0.08
  });

  const concreteMat = new THREE.MeshStandardMaterial({
    color: 0x9ca3af, // Hormigón patagónico con humedad
    roughness: 0.96,
    metalness: 0.04
  });

  const sidewalkMat = new THREE.MeshStandardMaterial({
    color: 0x78716c, // Pavimento de pasarela peatonal
    roughness: 0.88
  });

  const lampGlowMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xfef08a,
    emissiveIntensity: 1.2,
    roughness: 0.2
  });

  // Dimensiones
  const spanZ = 210;      // 210m de luz entre estribos
  const deckWidth = 10.2; // Ancho total del tablero
  const deckY = 6.2;      // Altura del tablero sobre el nivel del río
  const towerHeight = 27; // Altura de las torres sobre el tablero
  const towerTopY = deckY + towerHeight;
  const towerPositionsZ = [85, -85]; // Ribera Sur (+85) y Ribera Norte (-85)

  // ---------------------------------------------------------------------------
  // 1. TABLERO BICROMÁTICO Y GUARDARRAÍLES
  // ---------------------------------------------------------------------------
  // Calzada vehicular asfaltada central
  const roadWidth = 6.8;
  const roadGeo = new THREE.BoxGeometry(roadWidth, 0.4, spanZ);
  const roadMesh = new THREE.Mesh(roadGeo, asphaltMat);
  roadMesh.position.set(0, deckY, 0);
  roadMesh.receiveShadow = true;
  bridgeGroup.add(roadMesh);

  // Línea continua amarilla reflectante en el eje central
  const lineGeo = new THREE.PlaneGeometry(0.2, spanZ);
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
  const lineMesh = new THREE.Mesh(lineGeo, lineMat);
  lineMesh.rotation.x = -Math.PI / 2;
  lineMesh.position.set(0, deckY + 0.21, 0);
  bridgeGroup.add(lineMesh);

  // Pasarelas peatonales laterales elevadas (15cm sobre calzada)
  const walkWidth = 1.6;
  [-deckWidth / 2 + walkWidth / 2, deckWidth / 2 - walkWidth / 2].forEach((wx) => {
    const walkGeo = new THREE.BoxGeometry(walkWidth, 0.55, spanZ);
    const walkMesh = new THREE.Mesh(walkGeo, sidewalkMat);
    walkMesh.position.set(wx, deckY + 0.08, 0);
    walkMesh.receiveShadow = true;
    bridgeGroup.add(walkMesh);
  });

  // Guardarraíles metálicos tipo bionda que protegen a los peatones de los autos
  [-roadWidth / 2, roadWidth / 2].forEach((gx) => {
    const biondaGeo = new THREE.BoxGeometry(0.12, 0.45, spanZ);
    const bionda = new THREE.Mesh(biondaGeo, guardRailMat);
    bionda.position.set(gx, deckY + 0.45, 0);
    bridgeGroup.add(bionda);
  });

  // Barandas exteriores de seguridad de color rojo
  [-deckWidth / 2, deckWidth / 2].forEach((rx) => {
    // Pasamanos superior
    const railTopGeo = new THREE.BoxGeometry(0.1, 0.1, spanZ);
    const railTop = new THREE.Mesh(railTopGeo, steelRed);
    railTop.position.set(rx, deckY + 1.15, 0);
    bridgeGroup.add(railTop);

    // Barandillas intermedias
    [0.4, 0.75].forEach((rh) => {
      const subRailGeo = new THREE.BoxGeometry(0.06, 0.06, spanZ);
      const subRail = new THREE.Mesh(subRailGeo, steelRed);
      subRail.position.set(rx, deckY + rh, 0);
      bridgeGroup.add(subRail);
    });

    // Balaustres verticales cada 2.5m
    const numPosts = Math.floor(spanZ / 2.5);
    for (let i = 0; i <= numPosts; i++) {
      const z = -spanZ / 2 + i * 2.5;
      const bPostGeo = new THREE.BoxGeometry(0.08, 1.15, 0.08);
      const bPost = new THREE.Mesh(bPostGeo, steelRed);
      bPost.position.set(rx, deckY + 0.58, z);
      bridgeGroup.add(bPost);
    }
  });

  // Vigas longitudinales maestras en I bajo el tablero
  [-roadWidth / 2 - 0.4, roadWidth / 2 + 0.4].forEach((gx) => {
    const girderGeo = new THREE.BoxGeometry(0.45, 1.9, spanZ);
    const girder = new THREE.Mesh(girderGeo, steelRed);
    girder.position.set(gx, deckY - 0.95, 0);
    bridgeGroup.add(girder);
  });

  // ---------------------------------------------------------------------------
  // 2. TORRES GEMELAS CON CELOSÍA RETICULADA EN X (TRUSS TOWERS)
  // ---------------------------------------------------------------------------
  towerPositionsZ.forEach((tz) => {
    // Cepas/Pilares macizos de concreto armado con tajamar en la orilla
    const pierGeo = new THREE.BoxGeometry(deckWidth + 3.8, 11, 6.5);
    const pier = new THREE.Mesh(pierGeo, concreteMat);
    pier.position.set(0, deckY - 4.8, tz);
    pier.receiveShadow = true;
    bridgeGroup.add(pier);

    const legSpacing = deckWidth + 1.2;
    const colXOffsets = [-legSpacing / 2, legSpacing / 2];

    // Columnas verticales cajón de acero remachado
    colXOffsets.forEach((cx) => {
      const colGeo = new THREE.BoxGeometry(1.4, towerHeight + 2, 1.4);
      const col = new THREE.Mesh(colGeo, steelRed);
      col.position.set(cx, deckY + towerHeight / 2, tz);
      col.castShadow = true;
      bridgeGroup.add(col);

      // Montura superior curva del cable (Cable Saddle)
      const saddleGeo = new THREE.CylinderGeometry(0.8, 1.0, 1.2, 8);
      const saddle = new THREE.Mesh(saddleGeo, steelHardware);
      saddle.position.set(cx, towerTopY + 0.6, tz);
      saddle.rotation.z = Math.PI / 2;
      bridgeGroup.add(saddle);
    });

    // ENTRAMADO RETICULADO EN X (5 PISOS / TIERS POR TORRE)
    const tiers = 5;
    const tierH = towerHeight / tiers;

    for (let t = 0; t < tiers; t++) {
      const bottomY = deckY + t * tierH;
      const topY = bottomY + tierH;
      const midY = (bottomY + topY) / 2;

      // Vigas transversales horizontales en cada entrepiso
      const crossBeamGeo = new THREE.BoxGeometry(legSpacing + 1.4, 0.65, 0.85);
      const crossBeam = new THREE.Mesh(crossBeamGeo, steelRed);
      crossBeam.position.set(0, topY, tz);
      crossBeam.castShadow = true;
      bridgeGroup.add(crossBeam);

      // Doble diagonal cruzada en X
      const diagLen = Math.hypot(legSpacing, tierH);
      const diagAngle = Math.atan2(tierH, legSpacing);

      // Diagonal 1
      const d1Geo = new THREE.BoxGeometry(diagLen, 0.35, 0.35);
      const d1 = new THREE.Mesh(d1Geo, steelRed);
      d1.position.set(0, midY, tz - 0.15);
      d1.rotation.z = diagAngle;
      d1.castShadow = true;

      // Diagonal 2
      const d2Geo = new THREE.BoxGeometry(diagLen, 0.35, 0.35);
      const d2 = new THREE.Mesh(d2Geo, steelRed);
      d2.position.set(0, midY, tz + 0.15);
      d2.rotation.z = -diagAngle;
      d2.castShadow = true;

      bridgeGroup.add(d1, d2);
    }

    // Arco portal superior ornamental del Puente Ibáñez
    const portalArchGeo = new THREE.BoxGeometry(legSpacing + 1.8, 1.4, 1.1);
    const portalArch = new THREE.Mesh(portalArchGeo, steelRed);
    portalArch.position.set(0, towerTopY + 0.2, tz);
    bridgeGroup.add(portalArch);

    // Luces de balizamiento aéreo en la cima de cada torre
    colXOffsets.forEach((cx) => {
      const beaconGeo = new THREE.SphereGeometry(0.35, 8, 8);
      const beaconMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.set(cx, towerTopY + 1.8, tz);
      bridgeGroup.add(beacon);
    });
  });

  // ---------------------------------------------------------------------------
  // 3. MACIZOS DE ANCLAJE DE HORMIGÓN EN TIERRA (Z = ±125m)
  // ---------------------------------------------------------------------------
  [-125, 125].forEach((az) => {
    // Bloque masivo de anclaje de hormigón que soporta la tensión del cable
    const anchorBlockGeo = new THREE.BoxGeometry(deckWidth + 4, 6.5, 9);
    const anchorBlock = new THREE.Mesh(anchorBlockGeo, concreteMat);
    anchorBlock.position.set(0, deckY - 1.2, az);
    anchorBlock.receiveShadow = true;
    bridgeGroup.add(anchorBlock);

    // Collarines metálicos donde los cables ingresan al macizo de anclaje
    const colSpacing = deckWidth + 1.2;
    [-colSpacing / 2, colSpacing / 2].forEach((cx) => {
      const collarGeo = new THREE.CylinderGeometry(0.6, 0.6, 1.5, 8);
      const collar = new THREE.Mesh(collarGeo, steelHardware);
      collar.position.set(cx, deckY + 1.2, az);
      collar.rotation.x = Math.PI / 4;
      bridgeGroup.add(collar);
    });
  });

  // ---------------------------------------------------------------------------
  // 4. CABLES PRINCIPALES EN CATENARIA Y PÉNDOLAS CON ABRAZADERAS
  // ---------------------------------------------------------------------------
  const cableXOffsets = [-(deckWidth + 1.2) / 2, (deckWidth + 1.2) / 2];
  const numHangers = 42;
  const hangerStep = 170 / numHangers; // Espacio entre péndolas (170m luz central)

  cableXOffsets.forEach((cx) => {
    // Trayectoria del cable maestro
    const curvePoints = [];
    curvePoints.push(new THREE.Vector3(cx, deckY + 1.2, 125));  // Anclaje sur
    curvePoints.push(new THREE.Vector3(cx, towerTopY + 0.8, 85)); // Montura torre sur

    // Catenaria parabólica entre torres
    const samples = 40;
    for (let i = 0; i <= samples; i++) {
      const t = i / samples;
      const z = THREE.MathUtils.lerp(85, -85, t);
      const u = z / 85; // de 1 a -1
      // El centro baja hasta deckY + 2.2m
      const y = deckY + 2.2 + (towerHeight - 1.8) * (u * u);
      curvePoints.push(new THREE.Vector3(cx, y, z));
    }

    curvePoints.push(new THREE.Vector3(cx, towerTopY + 0.8, -85)); // Montura torre norte
    curvePoints.push(new THREE.Vector3(cx, deckY + 1.2, -125));  // Anclaje norte

    const catenaryCurve = new THREE.CatmullRomCurve3(curvePoints);
    const mainCableGeo = new THREE.TubeGeometry(catenaryCurve, 90, 0.18, 8, false);
    const mainCable = new THREE.Mesh(mainCableGeo, steelCable);
    mainCable.castShadow = true;
    bridgeGroup.add(mainCable);

    // Péndolas verticales con manguitos tensores
    for (let i = 1; i < numHangers; i++) {
      const hz = 85 - i * hangerStep;
      const u = hz / 85;
      const cableY = deckY + 2.2 + (towerHeight - 1.8) * (u * u);
      const hangerHeight = cableY - (deckY + 0.35);

      if (hangerHeight > 0.4) {
        // Varilla de la péndola
        const hGeo = new THREE.CylinderGeometry(0.045, 0.045, hangerHeight, 4);
        const hanger = new THREE.Mesh(hGeo, steelCable);
        hanger.position.set(cx, deckY + 0.35 + hangerHeight / 2, hz);
        bridgeGroup.add(hanger);

        // Abrazadera cilíndrica superior sobre el cable principal
        const clampGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.3, 6);
        const clamp = new THREE.Mesh(clampGeo, steelHardware);
        clamp.position.set(cx, cableY, hz);
        bridgeGroup.add(clamp);

        // Grapa inferior de anclaje al tablero
        const baseClampGeo = new THREE.BoxGeometry(0.2, 0.25, 0.2);
        const baseClamp = new THREE.Mesh(baseClampGeo, steelHardware);
        baseClamp.position.set(cx, deckY + 0.35, hz);
        bridgeGroup.add(baseClamp);
      }
    }
  });

  // ---------------------------------------------------------------------------
  // 5. LUMINARIAS COLGANTES SOBRE EL TABLERO DEL PUENTE
  // ---------------------------------------------------------------------------
  const numLamps = 12;
  const lampSpan = 150;
  for (let i = 0; i <= numLamps; i++) {
    const lz = -lampSpan / 2 + i * (lampSpan / numLamps);

    [-roadWidth / 2 - 0.2, roadWidth / 2 + 0.2].forEach((lx) => {
      // Poste arqueado
      const postGeo = new THREE.CylinderGeometry(0.06, 0.08, 4.2, 6);
      postGeo.translate(0, 2.1, 0);
      const post = new THREE.Mesh(postGeo, steelRed);
      post.position.set(lx, deckY + 0.4, lz);
      bridgeGroup.add(post);

      // Farol esférico cálido
      const lanternGeo = new THREE.SphereGeometry(0.25, 8, 8);
      const lantern = new THREE.Mesh(lanternGeo, lampGlowMat);
      lantern.position.set(lx + (lx > 0 ? -0.3 : 0.3), deckY + 4.3, lz);
      bridgeGroup.add(lantern);
    });
  }

  return bridgeGroup;
}
