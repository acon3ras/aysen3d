import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

// Cargador GLTF/Draco preparado para modelos externos de fotogrametría (.glb)
let dracoLoader = null;
let gltfLoader = null;

export function loadGLB(path, position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], onLoad, onError) {
  if (!gltfLoader) {
    dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://unpkg.com/three@0.169.0/examples/jsm/libs/draco/');
    gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);
  }

  gltfLoader.load(
    path,
    (gltf) => {
      const model = gltf.scene;
      model.position.set(...position);
      model.rotation.set(...rotation);
      model.scale.set(...scale);
      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      if (onLoad) onLoad(model);
    },
    undefined,
    (err) => {
      console.warn(`[Landmarks] loadGLB no pudo cargar ${path}:`, err);
      if (onError) onError(err);
    }
  );
}

/**
 * Hitos Arquitectónicos Notables de Puerto Aysén (Nivel 3)
 * Incluye:
 * 1. Oficina de Tierras y Colonización (1932) / 2ª Comisaría de Carabineros (Monumento Histórico)
 * 2. Ilustre Municipalidad de Puerto Aysén (Edificio Consistorial, Esmeralda #607)
 */
export function createLandmarks(geoData) {
  const landmarksGroup = new THREE.Group();
  landmarksGroup.name = 'HistoricLandmarks';

  // Materiales característicos
  const lengaWoodMat = new THREE.MeshStandardMaterial({
    color: 0x78350f, // Madera de lenga machihembrada
    roughness: 0.75,
    metalness: 0.05
  });

  const trimWhiteMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc, // Molduras y marcos blancos
    roughness: 0.6
  });

  const roofZincRedMat = new THREE.MeshStandardMaterial({
    color: 0x991b1b, // Cubierta de zinc rojo colonial
    roughness: 0.45,
    metalness: 0.65
  });

  const stonePlinthMat = new THREE.MeshStandardMaterial({
    color: 0x64748b, // Zócalo elevado de piedra / fundación
    roughness: 0.95
  });

  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    roughness: 0.1,
    metalness: 0.9,
    transparent: true,
    opacity: 0.75
  });

  // Materiales de la Ilustre Municipalidad
  const muniWallMat = new THREE.MeshStandardMaterial({
    color: 0xf3f2ea, // Crema institucional patagónico
    roughness: 0.78,
    metalness: 0.05
  });

  const muniRoofMat = new THREE.MeshStandardMaterial({
    color: 0x334155, // Zinc gris pizarra patagónico
    roughness: 0.45,
    metalness: 0.65
  });

  const pillarMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0, // Hormigón claro del pórtico
    roughness: 0.55
  });

  const goldEmblemMat = new THREE.MeshStandardMaterial({
    color: 0xd97706, // Escudo y placas doradas
    metalness: 0.85,
    roughness: 0.25
  });

  const warmLampMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xfef08a,
    emissiveIntensity: 1.8 // Brilla cálido en Bloom
  });

  // Materiales del Hospital de Puerto Aysén (basados en fotos reales)
  const hospitalBaseMat = new THREE.MeshStandardMaterial({
    color: 0x606c38, // Verde oliva / salvia patagónico del 1er piso
    roughness: 0.85,
    metalness: 0.05
  });

  const hospitalWoodMat = new THREE.MeshStandardMaterial({
    color: 0xd97706, // Listones horizontales de madera cálida (cedro / alerce)
    roughness: 0.65,
    metalness: 0.1
  });

  const hospitalWoodAccentMat = new THREE.MeshStandardMaterial({
    color: 0x78350f, // Franjas de contraste en madera oscura
    roughness: 0.6,
    metalness: 0.1
  });

  const hospitalEmergencyMat = new THREE.MeshStandardMaterial({
    color: 0x334155, // Gris grafito moderno del ala de urgencias
    roughness: 0.55,
    metalness: 0.3
  });

  const canopyArchMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0, // Estructura metálica plateada de la marquesina
    metalness: 0.85,
    roughness: 0.25
  });

  const canopyGlassMat = new THREE.MeshStandardMaterial({
    color: 0xa5f3fc, // Vidrio / policarbonato translúcido abovedado
    transparent: true,
    opacity: 0.6,
    roughness: 0.15
  });

  const hospitalLettersMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b, // Letras metálicas oscuras "HOSPITAL DE PUERTO AYSÉN"
    metalness: 0.8,
    roughness: 0.3
  });

  // ---------------------------------------------------------------------------
  // 1. OFICINA DE TIERRAS Y COLONIZACIÓN (1932)
  // ---------------------------------------------------------------------------
  function buildOficinaTierras() {
    const building = new THREE.Group();
    building.name = 'OficinaDeTierrasYColonizacion';
    // Coordenadas calculadas a partir de OSM
    building.position.set(-1005.4, 0.2, 149.4);
    building.rotation.y = -0.32; // Alineado con Calle O'Higgins

    const width = 22;  // Fachada
    const depth = 14;  // Fondo
    const height = 7.5; // 2 pisos de altura

    // 1. Zócalo elevado de piedra / fundación patagónica
    const plinthGeo = new THREE.BoxGeometry(width + 0.6, 0.8, depth + 0.6);
    const plinth = new THREE.Mesh(plinthGeo, stonePlinthMat);
    plinth.position.y = 0.4;
    plinth.receiveShadow = true;
    building.add(plinth);

    // 2. Cuerpo principal de 2 pisos (madera de lenga)
    const bodyGeo = new THREE.BoxGeometry(width, height, depth);
    const body = new THREE.Mesh(bodyGeo, lengaWoodMat);
    body.position.y = 0.8 + height / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    building.add(body);

    // 3. Moldura blanca de cintura entre primer y segundo piso
    const beltGeo = new THREE.BoxGeometry(width + 0.2, 0.15, depth + 0.2);
    const belt = new THREE.Mesh(beltGeo, trimWhiteMat);
    belt.position.y = 0.8 + height / 2;
    building.add(belt);

    // 4. Techo a cuatro aguas (cubierta piramidal con mansarda)
    const roofH = 4.2;
    const roofGeo = new THREE.ConeGeometry(Math.hypot(width, depth) / 1.75, roofH, 4);
    roofGeo.rotateY(Math.PI / 4);
    const roof = new THREE.Mesh(roofGeo, roofZincRedMat);
    roof.position.y = 0.8 + height + roofH / 2;
    roof.scale.set(width / 16, 1, depth / 16);
    roof.castShadow = true;
    building.add(roof);

    // 5. Torreón Mirador / Linterna Central Histórica
    const towerW = 3.8;
    const towerH = 3.2;
    const towerGeo = new THREE.BoxGeometry(towerW, towerH, towerW);
    const tower = new THREE.Mesh(towerGeo, lengaWoodMat);
    tower.position.y = 0.8 + height + roofH - 0.5;
    building.add(tower);

    // Techo en punta del torreón mirador
    const towerRoofGeo = new THREE.ConeGeometry(towerW * 0.85, 2.5, 4);
    towerRoofGeo.rotateY(Math.PI / 4);
    const towerRoof = new THREE.Mesh(towerRoofGeo, roofZincRedMat);
    towerRoof.position.y = 0.8 + height + roofH + towerH / 2 + 0.8;
    building.add(towerRoof);

    // Ventanas del torreón mirador (4 caras)
    [0, Math.PI / 2, Math.PI, -Math.PI / 2].forEach((rot) => {
      const wGeo = new THREE.PlaneGeometry(1.6, 1.4);
      const win = new THREE.Mesh(wGeo, glassMat);
      win.rotation.y = rot;
      win.translateZ(towerW / 2 + 0.05);
      win.position.y = 0.8 + height + roofH - 0.5;
      building.add(win);
    });

    // 6. Pórtico de Acceso Principal con Escalinata
    const porchW = 4.5;
    const porchH = 4.0;
    const porchD = 2.5;

    // Escalinata de madera
    for (let step = 0; step < 4; step++) {
      const sGeo = new THREE.BoxGeometry(porchW + 0.4 - step * 0.2, 0.2, 0.6);
      const sMesh = new THREE.Mesh(sGeo, lengaWoodMat);
      sMesh.position.set(0, 0.1 + step * 0.2, depth / 2 + 1.8 - step * 0.5);
      building.add(sMesh);
    }

    // Pilares del pórtico
    [-porchW / 2 + 0.3, porchW / 2 - 0.3].forEach((px) => {
      const colGeo = new THREE.BoxGeometry(0.35, porchH, 0.35);
      const col = new THREE.Mesh(colGeo, trimWhiteMat);
      col.position.set(px, 0.8 + porchH / 2, depth / 2 + porchD);
      building.add(col);
    });

    // Tejadillo del pórtico
    const porchRoofGeo = new THREE.BoxGeometry(porchW + 0.4, 0.3, porchD + 0.5);
    const porchRoof = new THREE.Mesh(porchRoofGeo, roofZincRedMat);
    porchRoof.position.set(0, 0.8 + porchH, depth / 2 + porchD / 2 + 0.4);
    porchRoof.rotation.x = 0.12;
    building.add(porchRoof);

    // 7. Placa de Monumento Histórico Nacional
    const badgeGeo = new THREE.BoxGeometry(1.2, 0.8, 0.06);
    const badgeMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8, roughness: 0.3 });
    const badge = new THREE.Mesh(badgeGeo, badgeMat);
    badge.position.set(0, 2.8, depth / 2 + 0.1);
    building.add(badge);

    // Ventanales ritmados con marcos blancos en ambos pisos
    for (let floor = 0; floor < 2; floor++) {
      const wy = 2.2 + floor * 3.4;
      for (let w = -3; w <= 3; w++) {
        if (floor === 0 && Math.abs(w) <= 1) continue; // Puerta central
        const wx = w * 2.8;

        // Marco blanco
        const fGeo = new THREE.BoxGeometry(1.4, 1.8, 0.08);
        const fMesh = new THREE.Mesh(fGeo, trimWhiteMat);
        fMesh.position.set(wx, wy, depth / 2 + 0.06);
        building.add(fMesh);

        // Vidrio
        const gGeo = new THREE.PlaneGeometry(1.1, 1.5);
        const gMesh = new THREE.Mesh(gGeo, glassMat);
        gMesh.position.set(wx, wy, depth / 2 + 0.12);
        building.add(gMesh);
      }
    }

    return building;
  }

  // ---------------------------------------------------------------------------
  // 2. ILUSTRE MUNICIPALIDAD DE PUERTO AYSÉN (EDIFICIO CONSISTORIAL)
  // Ubicación OSM: Calle Esmeralda #607 (X: -1113.7m, Z: 187.1m)
  // ---------------------------------------------------------------------------
  function buildMunicipalidad() {
    const building = new THREE.Group();
    building.name = 'MunicipalidadDeAysen';
    building.position.set(-1113.7, 0.2, 187.1);
    building.rotation.y = -0.35; // Alineado a Calle Esmeralda y Plaza de Armas

    const width = 30;   // Frente sobre Esmeralda
    const depth = 22;   // Fondo hacia la Plaza
    const height = 7.6; // 2 plantas de 3.8m

    // 1. Zócalo cívico elevado
    const plinthGeo = new THREE.BoxGeometry(width + 0.8, 0.6, depth + 0.8);
    const plinth = new THREE.Mesh(plinthGeo, stonePlinthMat);
    plinth.position.y = 0.3;
    plinth.receiveShadow = true;
    building.add(plinth);

    // 2. Volumen Principal de Dos Plantas
    const bodyGeo = new THREE.BoxGeometry(width, height, depth);
    const body = new THREE.Mesh(bodyGeo, muniWallMat);
    body.position.y = 0.6 + height / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    building.add(body);

    // 3. Moldura divisoria entre pisos (cornisa perimetral)
    const beltGeo = new THREE.BoxGeometry(width + 0.3, 0.2, depth + 0.3);
    const belt = new THREE.Mesh(beltGeo, trimWhiteMat);
    belt.position.y = 0.6 + height / 2;
    building.add(belt);

    // 4. Cubierta a Cuatro Aguas de Zinc Pizarra con Aleros
    const roofH = 4.5;
    const roofGeo = new THREE.ConeGeometry(Math.hypot(width, depth) / 1.78, roofH, 4);
    roofGeo.rotateY(Math.PI / 4);
    const roof = new THREE.Mesh(roofGeo, muniRoofMat);
    roof.position.y = 0.6 + height + roofH / 2;
    roof.scale.set(width / 18, 1, depth / 18);
    roof.castShadow = true;
    building.add(roof);

    // 5. Buhardillas / Lucarnas en el ático (mirando a Plaza y Esmeralda)
    [-6, 0, 6].forEach((bx) => {
      // Cara Sur (Esmeralda)
      const dormerGeo = new THREE.BoxGeometry(2.2, 1.8, 1.8);
      const dormer = new THREE.Mesh(dormerGeo, muniWallMat);
      dormer.position.set(bx, 0.6 + height + 1.2, depth / 2 - 0.5);
      building.add(dormer);

      const dormerRoofGeo = new THREE.ConeGeometry(1.8, 1.2, 4);
      dormerRoofGeo.rotateY(Math.PI / 4);
      const dormerRoof = new THREE.Mesh(dormerRoofGeo, muniRoofMat);
      dormerRoof.position.set(bx, 0.6 + height + 2.3, depth / 2 - 0.5);
      building.add(dormerRoof);

      // Ventana de la buhardilla
      const dWin = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.2), glassMat);
      dWin.position.set(bx, 0.6 + height + 1.2, depth / 2 + 0.42);
      building.add(dWin);
    });

    // 6. Pórtico de Acceso Principal (Frontis Esmeralda)
    const porchW = 8.0;
    const porchH = 4.8;
    const porchD = 3.0;

    // Rampa y escalinata de acceso
    const rampGeo = new THREE.BoxGeometry(porchW + 1.2, 0.4, 2.0);
    const ramp = new THREE.Mesh(rampGeo, stonePlinthMat);
    ramp.position.set(0, 0.2, depth / 2 + 1.8);
    building.add(ramp);

    // 4 Columnas del Pórtico Institucional
    [-3.2, -1.1, 1.1, 3.2].forEach((cx) => {
      const colGeo = new THREE.CylinderGeometry(0.3, 0.35, porchH, 12);
      const col = new THREE.Mesh(colGeo, pillarMat);
      col.position.set(cx, 0.4 + porchH / 2, depth / 2 + porchD);
      col.castShadow = true;
      building.add(col);
    });

    // Entablamento / Marquesina del Pórtico
    const archGeo = new THREE.BoxGeometry(porchW + 0.8, 0.7, porchD + 0.6);
    const arch = new THREE.Mesh(archGeo, muniWallMat);
    arch.position.set(0, 0.4 + porchH + 0.35, depth / 2 + porchD / 2 + 0.2);
    building.add(arch);

    // Frontón Triangular Superior sobre el Pórtico
    const pedimentGeo = new THREE.ConeGeometry(porchW / 1.7, 2.0, 4);
    pedimentGeo.rotateY(Math.PI / 4);
    const pediment = new THREE.Mesh(pedimentGeo, muniWallMat);
    pediment.position.set(0, 0.4 + porchH + 1.7, depth / 2 + porchD - 0.2);
    pediment.scale.set(1, 1, 0.25);
    building.add(pediment);

    // Escudo Municipal de Aysén en el tímpano del frontón
    const crestGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.1, 16);
    crestGeo.rotateX(Math.PI / 2);
    const crest = new THREE.Mesh(crestGeo, goldEmblemMat);
    crest.position.set(0, 0.4 + porchH + 1.5, depth / 2 + porchD + 0.05);
    building.add(crest);

    // Letrero: MUNICIPALIDAD DE AYSÉN
    const signGeo = new THREE.BoxGeometry(porchW - 0.8, 0.45, 0.08);
    const signMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.5 }); // Azul institucional
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(0, 0.4 + porchH + 0.35, depth / 2 + porchD + 0.32);
    building.add(sign);

    // Mástiles de Banderas Cívicas (Chile y Aysén) sobre el pórtico
    [-2.2, 2.2].forEach((fx, idx) => {
      const poleGeo = new THREE.CylinderGeometry(0.04, 0.05, 4.5, 8);
      const pole = new THREE.Mesh(poleGeo, new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.9 }));
      pole.position.set(fx, 0.4 + porchH + 2.8, depth / 2 + porchD + 0.1);
      building.add(pole);

      // Bandera (Plano ondeante)
      const flagGeo = new THREE.PlaneGeometry(1.6, 1.0);
      const flagMat = new THREE.MeshStandardMaterial({
        color: idx === 0 ? 0x0284c7 : 0xdc2626, // Azul/Rojo institucional
        side: THREE.DoubleSide
      });
      const flag = new THREE.Mesh(flagGeo, flagMat);
      flag.position.set(fx + 0.8, 0.4 + porchH + 4.2, depth / 2 + porchD + 0.1);
      building.add(flag);
    });

    // Faroles de entrada con emisión Bloom
    [-porchW / 2 + 0.2, porchW / 2 - 0.2].forEach((lx) => {
      const lampGeo = new THREE.SphereGeometry(0.22, 12, 12);
      const lamp = new THREE.Mesh(lampGeo, warmLampMat);
      lamp.position.set(lx, 0.4 + porchH * 0.7, depth / 2 + porchD + 0.2);
      building.add(lamp);
    });

    // 7. Ventanales Ritmados en Fachadas (Esmeralda y Plaza de Armas)
    for (let floor = 0; floor < 2; floor++) {
      const wy = 2.4 + floor * 3.4;
      // Ventanas frontales Esmeralda
      for (let w = -4; w <= 4; w++) {
        if (floor === 0 && Math.abs(w) <= 1) continue; // Puerta principal
        const wx = w * 3.0;

        const fGeo = new THREE.BoxGeometry(1.5, 2.0, 0.08);
        const fMesh = new THREE.Mesh(fGeo, trimWhiteMat);
        fMesh.position.set(wx, wy, depth / 2 + 0.05);
        building.add(fMesh);

        const gGeo = new THREE.PlaneGeometry(1.2, 1.7);
        const gMesh = new THREE.Mesh(gGeo, glassMat);
        gMesh.position.set(wx, wy, depth / 2 + 0.1);
        building.add(gMesh);
      }

      // Ventanas traseras (hacia Plaza de Armas)
      for (let w = -4; w <= 4; w++) {
        const wx = w * 3.0;
        const fGeo = new THREE.BoxGeometry(1.5, 2.0, 0.08);
        const fMesh = new THREE.Mesh(fGeo, trimWhiteMat);
        fMesh.position.set(wx, wy, -depth / 2 - 0.05);
        fMesh.rotation.y = Math.PI;
        building.add(fMesh);

        const gGeo = new THREE.PlaneGeometry(1.2, 1.7);
        const gMesh = new THREE.Mesh(gGeo, glassMat);
        gMesh.position.set(wx, wy, -depth / 2 - 0.1);
        gMesh.rotation.y = Math.PI;
        building.add(gMesh);
      }
    }

    return building;
  }

  // ---------------------------------------------------------------------------
  // 3. HOSPITAL DR. JORGE IBAR DE PUERTO AYSÉN
  // Ubicación OSM: Camino a Chacabuco / Eusebio Ibar (X: 15.0m, Z: 444.5m)
  // Recreación fiel basada en las fotos reales y bosquejo arquitectónico:
  // - Zócalo de hormigón verde oliva / salvia (piso 1)
  // - Revestimiento superior en listones horizontales de madera cálida (pisos 2 y 3)
  // - Marquesina curva abovedada de policarbonato translúcido sobre el acceso
  // - Letrero frontal: "HOSPITAL DE PUERTO AYSÉN"
  // - Ala de Urgencias y ambulancias en gris grafito con cruz roja
  // ---------------------------------------------------------------------------
  function buildHospital() {
    const building = new THREE.Group();
    building.name = 'HospitalDePuertoAysen';
    building.position.set(15.0, 0.2, 444.5);
    building.rotation.y = 0.08;

    const mainW = 54;    // Frente principal
    const mainD = 22;    // Fondo
    const groundH = 3.6; // Piso 1 (zócalo verde oliva)
    const upperH = 7.0;  // Pisos 2 y 3 (madera cálida)
    const totalH = groundH + upperH;

    // 1. Zócalo / Primer Piso en verde oliva patagónico
    const groundGeo = new THREE.BoxGeometry(mainW, groundH, mainD);
    const groundMesh = new THREE.Mesh(groundGeo, hospitalBaseMat);
    groundMesh.position.y = groundH / 2;
    groundMesh.castShadow = true;
    groundMesh.receiveShadow = true;
    building.add(groundMesh);

    // 2. Pisos Superiores (2 y 3) en listones de madera cálida
    const upperGeo = new THREE.BoxGeometry(mainW, upperH, mainD);
    const upperMesh = new THREE.Mesh(upperGeo, hospitalWoodMat);
    upperMesh.position.y = groundH + upperH / 2;
    upperMesh.castShadow = true;
    upperMesh.receiveShadow = true;
    building.add(upperMesh);

    // Franjas de acento horizontal de madera oscura
    for (let h = 0; h < 2; h++) {
      const bandGeo = new THREE.BoxGeometry(mainW + 0.1, 0.25, mainD + 0.1);
      const band = new THREE.Mesh(bandGeo, hospitalWoodAccentMat);
      band.position.y = groundH + 3.4 * (h + 1);
      building.add(band);
    }

    // Cubierta plana institucional con antepecho
    const parapetGeo = new THREE.BoxGeometry(mainW + 0.2, 0.6, mainD + 0.2);
    const parapet = new THREE.Mesh(parapetGeo, hospitalEmergencyMat);
    parapet.position.y = totalH + 0.3;
    building.add(parapet);

    // 3. Marquesina Curva Abovedada de Acceso (Canopy de las fotos)
    const canopyW = 28;
    const canopyD = 6.0;

    // Bóveda semicilíndrica translúcida
    const canopyGeo = new THREE.CylinderGeometry(canopyD / 1.1, canopyD / 1.1, canopyW, 16, 1, false, 0, Math.PI);
    canopyGeo.rotateZ(Math.PI / 2);
    const canopyMesh = new THREE.Mesh(canopyGeo, canopyGlassMat);
    canopyMesh.position.set(0, groundH + 0.8, mainD / 2 + canopyD / 2 - 0.5);
    canopyMesh.scale.set(1, 0.35, 1);
    building.add(canopyMesh);

    // Pilares metálicos plateados de la marquesina
    [-12, -4, 4, 12].forEach((px) => {
      const poleGeo = new THREE.CylinderGeometry(0.08, 0.08, groundH + 0.6, 8);
      const pole = new THREE.Mesh(poleGeo, canopyArchMat);
      pole.position.set(px, (groundH + 0.6) / 2, mainD / 2 + canopyD - 0.8);
      pole.castShadow = true;
      building.add(pole);
    });

    // Puerta de acceso vidriada
    const doorGeo = new THREE.BoxGeometry(5.0, 2.6, 1.2);
    const door = new THREE.Mesh(doorGeo, glassMat);
    door.position.set(0, 1.3, mainD / 2 + 0.6);
    building.add(door);

    // Letrero Frontal: HOSPITAL DE PUERTO AYSÉN
    const signBoardGeo = new THREE.BoxGeometry(22, 0.9, 0.1);
    const signBoard = new THREE.Mesh(signBoardGeo, hospitalLettersMat);
    signBoard.position.set(0, groundH + 4.2, mainD / 2 + 0.1);
    building.add(signBoard);

    // 4. Ala de Urgencias y Ambulancias (Izquierda, gris grafito moderno)
    const urgW = 20;
    const urgH = 7.2;
    const urgD = 18;
    const urgGeo = new THREE.BoxGeometry(urgW, urgH, urgD);
    const urgMesh = new THREE.Mesh(urgGeo, hospitalEmergencyMat);
    urgMesh.position.set(-mainW / 2 - urgW / 2 + 2, urgH / 2, -1);
    urgMesh.castShadow = true;
    building.add(urgMesh);

    // Bahía cubierta de ambulancias
    const bayRoofGeo = new THREE.BoxGeometry(12, 0.5, 8);
    const bayRoof = new THREE.Mesh(bayRoofGeo, hospitalEmergencyMat);
    bayRoof.position.set(-mainW / 2 - 6, 4.2, urgD / 2 + 2);
    building.add(bayRoof);

    // Columnas de la bahía de ambulancias
    [-mainW / 2 - 11, -mainW / 2 - 1].forEach((bx) => {
      const colGeo = new THREE.CylinderGeometry(0.2, 0.2, 4.2, 8);
      const col = new THREE.Mesh(colGeo, canopyArchMat);
      col.position.set(bx, 2.1, urgD / 2 + 5.5);
      building.add(col);
    });

    // Cruz roja luminosa de urgencias
    const crossMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 1.5 });
    const crossH = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.7, 0.1), crossMat);
    crossH.position.set(-mainW / 2 - 6, 5.8, urgD / 2 + 0.1);
    const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.7, 2.4, 0.1), crossMat);
    crossV.position.set(-mainW / 2 - 6, 5.8, urgD / 2 + 0.1);
    building.add(crossH, crossV);

    // 5. Ventanales corridos (Ribbon Windows en los 3 niveles)
    for (let f = 0; f < 3; f++) {
      const wy = 1.8 + f * 3.4;
      for (let w = -6; w <= 6; w++) {
        if (f === 0 && Math.abs(w) <= 1) continue; // Acceso principal
        const wx = w * 3.8;
        const winGeo = new THREE.BoxGeometry(2.8, 1.6, 0.1);
        const win = new THREE.Mesh(winGeo, glassMat);
        win.position.set(wx, wy, mainD / 2 + 0.06);
        building.add(win);
      }
    }

    return building;
  }

  // Instanciar hitos patrimoniales
  landmarksGroup.add(buildOficinaTierras());
  landmarksGroup.add(buildMunicipalidad());
  landmarksGroup.add(buildHospital());

  return landmarksGroup;
}
