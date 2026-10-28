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

  // ---------------------------------------------------------------------------
  // GENERADORES PROCEDURALES DE TEXTURAS PARA EL HOSPITAL DE PUERTO AYSÉN
  // Basados 1:1 en las fotos reales y bosquejo arquitectónico:
  // - Listones de madera horizontales con bandas cálidas multicolores (trespa/alerce)
  // - Letrero oficial en burdeo: "HOSPITAL DE PUERTO AYSÉN"
  // - Letrero retroiluminado: "URGENCIAS · SAMU"
  // ---------------------------------------------------------------------------
  function createHospitalTimberTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Paleta fiel extraída de las fotos reales: alerce, cedro, pino oregón, castaño y ocre
    const palette = [
      '#e07a2c', '#d97706', '#b45309', '#c2410c',
      '#9a3412', '#78350f', '#ca8a04', '#854d0e',
      '#ea580c', '#a16207', '#a13b0c', '#713f12'
    ];

    ctx.fillStyle = '#78350f';
    ctx.fillRect(0, 0, 1024, 512);

    const plankCount = 44;
    const plankH = 512 / plankCount;

    for (let i = 0; i < plankCount; i++) {
      const y = i * plankH;
      const color = palette[i % palette.length];
      ctx.fillStyle = color;
      ctx.fillRect(0, y, 1024, plankH);

      // Desfase y juntas verticales de tablones individuales
      const segments = 4 + (i % 3);
      const segW = 1024 / segments;
      for (let s = 0; s < segments; s++) {
        const sx = (s * segW + ((i * 41) % 90)) % 1024;
        const shift = ((s + i) % 5 === 0) ? 0.08 : -0.06;
        ctx.fillStyle = shift > 0 ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
        ctx.fillRect(sx, y, segW * 0.98, plankH);
        // Junta vertical oscura
        ctx.fillStyle = 'rgba(25,12,4,0.45)';
        ctx.fillRect((sx + segW * 0.98) % 1024, y, 2, plankH);
      }

      // Ranura horizontal de sombra (siding machihembrado patagónico)
      ctx.fillStyle = 'rgba(20,10,4,0.55)';
      ctx.fillRect(0, y + plankH - 1.5, 1024, 1.5);
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.fillRect(0, y, 1024, 0.8);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 2);
    return texture;
  }

  function createHospitalSignTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, 1024, 128);

    ctx.font = 'bold 50px "Outfit", "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Sombra suave para relieve
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillText('HOSPITAL DE PUERTO AYSÉN', 514, 66);

    // Tipografía institucional burdeo/carmín
    ctx.fillStyle = '#881337';
    ctx.fillText('HOSPITAL DE PUERTO AYSÉN', 512, 64);

    return new THREE.CanvasTexture(canvas);
  }

  function createUrgenciasSignTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 512, 128);

    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 6;
    ctx.strokeRect(4, 4, 504, 120);

    ctx.font = '900 44px "Outfit", "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ef4444';
    ctx.fillText('URGENCIAS · SAMU', 256, 64);

    return new THREE.CanvasTexture(canvas);
  }

  const hospitalTimberTexture = createHospitalTimberTexture();
  const hospitalSignTexture = createHospitalSignTexture();
  const urgenciasSignTexture = createUrgenciasSignTexture();

  // Materiales característicos del Hospital
  const hospitalBaseMat = new THREE.MeshStandardMaterial({
    color: 0x556345, // Verde oliva / salvia patagónico del 1er piso
    roughness: 0.82,
    metalness: 0.05
  });

  const hospitalWoodMat = new THREE.MeshStandardMaterial({
    map: hospitalTimberTexture,
    roughness: 0.65,
    metalness: 0.05
  });

  const hospitalEmergencyMat = new THREE.MeshStandardMaterial({
    color: 0x242c38, // Gris grafito moderno del ala de urgencias
    roughness: 0.55,
    metalness: 0.25
  });

  const hospitalWhiteTrimMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc, // Perfilería y marcos blancos de los ventanales
    roughness: 0.4,
    metalness: 0.1
  });

  const hospitalPaveMat = new THREE.MeshStandardMaterial({
    color: 0xcbd5e1, // Adoquines de la plaza de acceso
    roughness: 0.88
  });

  const canopyArchMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9, // Acero tubular blanco/plateado de la estructura
    metalness: 0.85,
    roughness: 0.25
  });

  const canopyGlassMat = new THREE.MeshStandardMaterial({
    color: 0xbae6fd, // Policarbonato / vidrio translúcido abovedado
    transparent: true,
    opacity: 0.58,
    roughness: 0.15
  });

  const redCrossMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    emissive: 0xef4444,
    emissiveIntensity: 2.2
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
  // 3. HOSPITAL DE PUERTO AYSÉN
  // Ubicación OSM Oficial: Camino a Chacabuco / Av. Eusebio Ibar (X: 15.0m, Z: 430.0m)
  // Recreación 1:1 basada en las fotos reales y bosquejo arquitectónico del usuario:
  // - Zócalo de hormigón verde oliva / salvia patagónico (Piso 1)
  // - Revestimiento superior en listones horizontales de madera cálida multicolor (Pisos 2 y 3)
  // - Letrero frontal oficial en burdeo: "HOSPITAL DE PUERTO AYSÉN"
  // - Marquesina curva abovedada de policarbonato translúcido con cerchas tubulares e iluminación LED
  // - Ala de Urgencias y bahía cubierta SAMU en gris grafito con cruz roja luminosa
  // - Ambulancia SAMU 131 estacionada bajo el alero
  // - Penthouse técnico en azotea con escala de gato exterior (cat-ladder)
  // - Explanada de acceso pavimentada con murete verde y reja blanca perimetral
  // - Estacionamiento con vehículos civiles y paisajismo patagónico (Notros con flores rojas)
  // - Encuadre escénico: Fondo montañoso del Cerro Marchant elevándose detrás
  // ---------------------------------------------------------------------------
  function buildParkedCar(colorHex, type = 'sedan') {
    const car = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      metalness: 0.65,
      roughness: 0.28
    });
    const glassDarkMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.9,
      roughness: 0.1
    });
    const wheelMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.9
    });

    // Chasis inferior
    const baseMesh = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.6, 1.9), bodyMat);
    baseMesh.position.y = 0.55;
    baseMesh.castShadow = true;
    car.add(baseMesh);

    // Cabina / Habitáculo
    const cabL = type === 'pickup' ? 2.2 : (type === 'suv' ? 2.8 : 2.5);
    const cabX = type === 'pickup' ? -0.4 : 0;
    const cabH = type === 'suv' ? 0.95 : 0.8;
    const cabMesh = new THREE.Mesh(new THREE.BoxGeometry(cabL, cabH, 1.7), glassDarkMat);
    cabMesh.position.set(cabX, 1.15, 0);
    cabMesh.castShadow = true;
    car.add(cabMesh);

    // Ruedas
    [[-1.3, 0.35, -0.95], [1.3, 0.35, -0.95], [-1.3, 0.35, 0.95], [1.3, 0.35, 0.95]].forEach(([wx, wy, wz]) => {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.24, 10), wheelMat);
      w.rotation.x = Math.PI / 2;
      w.position.set(wx, wy, wz);
      w.castShadow = true;
      car.add(w);
    });

    return car;
  }

  function buildHospital() {
    const building = new THREE.Group();
    building.name = 'HospitalDePuertoAysen';
    building.position.set(15.0, 0.2, 430.0);
    building.rotation.y = 0.0; // Fachada mira al Norte (-Z) hacia el acceso

    const mainW = 70;    // Frente principal
    const mainD = 22;    // Fondo
    const groundH = 3.8; // Piso 1 (zócalo verde oliva)
    const upperH = 7.2;  // Pisos 2 y 3 (madera cálida)
    const totalH = groundH + upperH; // 11.0m
    const frontZ = -mainD / 2; // -11.0m

    // 1. Zócalo / Primer Piso en verde oliva patagónico
    const groundGeo = new THREE.BoxGeometry(mainW, groundH, mainD);
    const groundMesh = new THREE.Mesh(groundGeo, hospitalBaseMat);
    groundMesh.position.y = groundH / 2;
    groundMesh.castShadow = true;
    groundMesh.receiveShadow = true;
    building.add(groundMesh);

    // Zócalo de cimiento / hormigón visto en la base
    const plinthGeo = new THREE.BoxGeometry(mainW + 0.4, 0.4, mainD + 0.4);
    const plinthMesh = new THREE.Mesh(plinthGeo, stonePlinthMat);
    plinthMesh.position.y = 0.2;
    building.add(plinthMesh);

    // Moldura divisoria perimetral blanca entre piso 1 y 2
    const moldGeo = new THREE.BoxGeometry(mainW + 0.3, 0.25, mainD + 0.3);
    const moldMesh = new THREE.Mesh(moldGeo, hospitalWhiteTrimMat);
    moldMesh.position.y = groundH;
    building.add(moldMesh);

    // 2. Pisos Superiores (2 y 3) en listones de madera cálida
    const upperGeo = new THREE.BoxGeometry(mainW, upperH, mainD);
    const upperMesh = new THREE.Mesh(upperGeo, hospitalWoodMat);
    upperMesh.position.y = groundH + upperH / 2;
    upperMesh.castShadow = true;
    upperMesh.receiveShadow = true;
    building.add(upperMesh);

    // Franja divisoria horizontal entre pisos 2 y 3
    const midBandGeo = new THREE.BoxGeometry(mainW + 0.1, 0.15, mainD + 0.1);
    const midBandMesh = new THREE.Mesh(midBandGeo, hospitalWhiteTrimMat);
    midBandMesh.position.y = groundH + 3.6;
    building.add(midBandMesh);

    // Antepecho de remate en cubierta (parapeto)
    const parapetGeo = new THREE.BoxGeometry(mainW + 0.3, 0.6, mainD + 0.3);
    const parapet = new THREE.Mesh(parapetGeo, hospitalEmergencyMat);
    parapet.position.y = totalH + 0.3;
    building.add(parapet);

    // Caja de máquinas / Penthouse en Azotea (visto en Foto 2)
    const phW = 20, phH = 3.2, phD = 14;
    const phGeo = new THREE.BoxGeometry(phW, phH, phD);
    const phMesh = new THREE.Mesh(phGeo, hospitalWoodMat);
    phMesh.position.set(-12, totalH + phH / 2, 2);
    phMesh.castShadow = true;
    building.add(phMesh);

    // Rejillas de ventilación oscuras en el penthouse
    const louverGeo = new THREE.BoxGeometry(6, 1.8, 0.1);
    const louver = new THREE.Mesh(louverGeo, hospitalEmergencyMat);
    louver.position.set(-12, totalH + phH / 2, 2 - phD / 2 - 0.06);
    building.add(louver);

    // Escala de gato exterior (cat-ladder) de acero galvanizado en pared lateral izquierda
    const ladderX = -mainW / 2 - 0.2;
    const ladderZ = -2;
    for (let ly = 1.0; ly <= totalH + 0.5; ly += 0.4) {
      const rung = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.6, 6), canopyArchMat);
      rung.rotation.z = Math.PI / 2;
      rung.position.set(ladderX, ly, ladderZ);
      building.add(rung);
    }
    // Rieles verticales y aros de seguridad
    [-0.3, 0.3].forEach(offZ => {
      const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, totalH, 6), canopyArchMat);
      rail.position.set(ladderX, totalH / 2, ladderZ + offZ);
      building.add(rail);
    });

    // 3. Marquesina Curva Abovedada de Acceso (Canopy de Fotos 1 y 3)
    const canopyW = 32;  // Ancho frontal
    const canopyD = 7.0; // Vuelo hacia adelante
    const canopyH = 1.6;

    // Bóveda semicilíndrica translúcida
    const canopyGeo = new THREE.CylinderGeometry(canopyD / 1.05, canopyD / 1.05, canopyW, 24, 1, false, 0, Math.PI);
    canopyGeo.rotateZ(Math.PI / 2);
    const canopyMesh = new THREE.Mesh(canopyGeo, canopyGlassMat);
    canopyMesh.position.set(0, groundH + 0.9, frontZ - canopyD / 2 + 0.5);
    canopyMesh.scale.set(1, 0.35, 1);
    building.add(canopyMesh);

    // Costillas / Cerchas tubulares arqueadas blancas
    for (let cx = -canopyW / 2 + 2; cx <= canopyW / 2 - 2; cx += 4) {
      const ribGeo = new THREE.TorusGeometry(canopyD / 1.05, 0.06, 6, 24, Math.PI);
      ribGeo.rotateY(Math.PI / 2);
      const rib = new THREE.Mesh(ribGeo, canopyArchMat);
      rib.position.set(cx, groundH + 0.9, frontZ - canopyD / 2 + 0.5);
      rib.scale.set(1, 0.35, 1);
      building.add(rib);
    }

    // Columnas metálicas esbeltas de soporte en el borde frontal
    [-14, -9.5, -5, 0, 5, 9.5, 14].forEach((px) => {
      const poleGeo = new THREE.CylinderGeometry(0.09, 0.09, groundH + 0.6, 8);
      const pole = new THREE.Mesh(poleGeo, canopyArchMat);
      pole.position.set(px, (groundH + 0.6) / 2, frontZ - canopyD + 0.6);
      pole.castShadow = true;
      building.add(pole);

      // Placa base empernada
      const baseGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.06, 8);
      const baseMesh = new THREE.Mesh(baseGeo, hospitalEmergencyMat);
      baseMesh.position.set(px, 0.03, frontZ - canopyD + 0.6);
      building.add(baseMesh);

      // Foco LED cálido bajo el techo de la marquesina
      const lampGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.08, 8);
      const lamp = new THREE.Mesh(lampGeo, warmLampMat);
      lamp.position.set(px, groundH + 0.55, frontZ - canopyD / 2);
      building.add(lamp);
    });

    // Puerta de acceso vidriada / Mampara
    const lobbyW = 8.0, lobbyH = 2.8, lobbyD = 2.0;
    const lobbyGeo = new THREE.BoxGeometry(lobbyW, lobbyH, lobbyD);
    const lobby = new THREE.Mesh(lobbyGeo, glassMat);
    lobby.position.set(0, lobbyH / 2, frontZ - lobbyD / 2 + 0.2);
    building.add(lobby);

    // Marco blanco de mampara
    const lobbyFrameGeo = new THREE.BoxGeometry(lobbyW + 0.1, 0.1, lobbyD + 0.1);
    const lobbyFrame = new THREE.Mesh(lobbyFrameGeo, hospitalWhiteTrimMat);
    lobbyFrame.position.set(0, lobbyH, frontZ - lobbyD / 2 + 0.2);
    building.add(lobbyFrame);

    // 4. Letrero Frontal Oficial "HOSPITAL DE PUERTO AYSÉN" (Fotos 1 y 3)
    const signBoardMat = new THREE.MeshBasicMaterial({
      map: hospitalSignTexture,
      transparent: true
    });
    const signBoardGeo = new THREE.PlaneGeometry(26, 3.25);
    const signBoard = new THREE.Mesh(signBoardGeo, signBoardMat);
    signBoard.position.set(0, groundH + 5.2, frontZ - 0.08);
    signBoard.rotation.y = Math.PI; // Mira al Norte
    building.add(signBoard);

    // 5. Ala de Urgencias y Bahía de Ambulancias (SAMU 131)
    const urgW = 24, urgH = 7.6, urgD = 20;
    const urgGeo = new THREE.BoxGeometry(urgW, urgH, urgD);
    const urgMesh = new THREE.Mesh(urgGeo, hospitalEmergencyMat);
    urgMesh.position.set(-mainW / 2 - urgW / 2 + 1, urgH / 2, 0);
    urgMesh.castShadow = true;
    building.add(urgMesh);

    // Alero voladizo de Urgencias
    const bayRoofW = 16, bayRoofH = 0.5, bayRoofD = 10;
    const bayRoofGeo = new THREE.BoxGeometry(bayRoofW, bayRoofH, bayRoofD);
    const bayRoof = new THREE.Mesh(bayRoofGeo, hospitalEmergencyMat);
    bayRoof.position.set(-mainW / 2 - 10, 4.4, frontZ - bayRoofD / 2 + 2);
    building.add(bayRoof);

    // Columnas de la bahía de ambulancias
    [-mainW / 2 - 17, -mainW / 2 - 3].forEach((bx) => {
      const colGeo = new THREE.CylinderGeometry(0.18, 0.18, 4.4, 8);
      const col = new THREE.Mesh(colGeo, canopyArchMat);
      col.position.set(bx, 2.2, frontZ - bayRoofD + 2.5);
      col.castShadow = true;
      building.add(col);
    });

    // Cartel URGENCIAS · SAMU
    const urgSignMat = new THREE.MeshBasicMaterial({
      map: urgenciasSignTexture
    });
    const urgSignGeo = new THREE.PlaneGeometry(12, 3.0);
    const urgSign = new THREE.Mesh(urgSignGeo, urgSignMat);
    urgSign.position.set(-mainW / 2 - 10, 4.4, frontZ - bayRoofD + 1.9);
    urgSign.rotation.y = Math.PI;
    building.add(urgSign);

    // Cruz roja médica luminosa (+) en Urgencias
    const crossGroup = new THREE.Group();
    const cBarH = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.8, 0.15), redCrossMat);
    const cBarV = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2.6, 0.15), redCrossMat);
    crossGroup.add(cBarH, cBarV);
    crossGroup.position.set(-mainW / 2 - 10, 6.2, frontZ - 0.1);
    building.add(crossGroup);

    // Luz puntual roja de emergencia
    const urgLight = new THREE.PointLight(0xef4444, 1.8, 18);
    urgLight.position.set(-mainW / 2 - 10, 6.0, frontZ - 2);
    building.add(urgLight);

    // Ambulancia SAMU 131 estacionada bajo el alero
    const ambGroup = new THREE.Group();
    ambGroup.position.set(-mainW / 2 - 10, 0, frontZ - 4.5);
    ambGroup.rotation.y = -0.15; // Ligeramente perfilada

    // Carrocería van blanca
    const ambBodyMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
    const ambBody = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.1, 5.2), ambBodyMat);
    ambBody.position.y = 1.3;
    ambBody.castShadow = true;

    // Franjas reflectantes rojas laterales
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0xdc2626 });
    const stripeL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.25, 4.6), stripeMat);
    stripeL.position.set(-1.12, 1.25, 0);
    const stripeR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.25, 4.6), stripeMat);
    stripeR.position.set(1.12, 1.25, 0);

    // Cabina y parabrisas polarizado
    const cabWinMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.1, metalness: 0.8 });
    const cabWin = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.8, 0.1), cabWinMat);
    cabWin.position.set(0, 1.6, -2.55);

    // Baliza de emergencia en el techo (roja y azul)
    const beaconBar = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.18, 0.4), hospitalEmergencyMat);
    beaconBar.position.set(0, 2.45, -0.6);
    const beaconR = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.16, 0.35), redCrossMat);
    beaconR.position.set(-0.35, 2.48, -0.6);
    const beaconB = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.16, 0.35), new THREE.MeshStandardMaterial({
      color: 0x3b82f6, emissive: 0x3b82f6, emissiveIntensity: 2.2
    }));
    beaconB.position.set(0.35, 2.48, -0.6);

    // Ruedas de ambulancia
    const ambWheelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
    [[-1.0, 0.4, -1.6], [1.0, 0.4, -1.6], [-1.0, 0.4, 1.6], [1.0, 0.4, 1.6]].forEach(([wx, wy, wz]) => {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.28, 12), ambWheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(wx, wy, wz);
      wheel.castShadow = true;
      ambGroup.add(wheel);
    });

    ambGroup.add(ambBody, stripeL, stripeR, cabWin, beaconBar, beaconR, beaconB);
    building.add(ambGroup);

    // 6. Fenestración Arquitectónica (Ventanales con marcos blancos de Fotos 2 y 3)
    // Nivel 3 (Piso Superior): 4 grupos de 4 ventanas con marcos blancos
    const clusterPositions = [-24, -10, 10, 24];
    clusterPositions.forEach((cx) => {
      const clusterFrame = new THREE.Mesh(new THREE.BoxGeometry(9.6, 2.2, 0.12), hospitalWhiteTrimMat);
      clusterFrame.position.set(cx, groundH + 5.2, frontZ - 0.05);
      building.add(clusterFrame);

      // Vidrios cuádruples
      for (let w = 0; w < 4; w++) {
        const wx = cx - 3.6 + w * 2.4;
        const win = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.9, 0.06), glassMat);
        win.position.set(wx, groundH + 5.2, frontZ - 0.1);
        building.add(win);
      }
    });

    // Nivel 2 (Piso Medio): Ribbon windows corridos con montantes blancos
    for (let wx = -mainW / 2 + 5; wx <= mainW / 2 - 5; wx += 4.5) {
      const mFrame = new THREE.Mesh(new THREE.BoxGeometry(4.0, 1.8, 0.12), hospitalWhiteTrimMat);
      mFrame.position.set(wx, groundH + 1.8, frontZ - 0.05);
      building.add(mFrame);

      const win = new THREE.Mesh(new THREE.BoxGeometry(3.7, 1.5, 0.06), glassMat);
      win.position.set(wx, groundH + 1.8, frontZ - 0.1);
      building.add(win);
    }

    // Nivel 1 (Piso 1, Zócalo verde oliva): Ventanales modulares
    for (let wx = -mainW / 2 + 6; wx <= mainW / 2 - 6; wx += 5.5) {
      if (Math.abs(wx) < 6) continue; // Despejar lobby central
      const gFrame = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.6, 0.12), hospitalWhiteTrimMat);
      gFrame.position.set(wx, 2.0, frontZ - 0.05);
      building.add(gFrame);

      const win = new THREE.Mesh(new THREE.BoxGeometry(3.3, 1.3, 0.06), glassMat);
      win.position.set(wx, 2.0, frontZ - 0.1);
      building.add(win);
    }

    // 7. Explanada de Acceso, Plaza y Estacionamiento (Fotos 2 y 3)
    const plazaW = 90;
    const plazaD = 42;
    const plazaZ = frontZ - plazaD / 2; // -11 - 21 = -32m

    const plazaGeo = new THREE.PlaneGeometry(plazaW, plazaD);
    plazaGeo.rotateX(-Math.PI / 2);
    const plazaMesh = new THREE.Mesh(plazaGeo, hospitalPaveMat);
    plazaMesh.position.set(0, 0.05, plazaZ);
    plazaMesh.receiveShadow = true;
    building.add(plazaMesh);

    // Cierre perimetral frontal (murete verde + reja blanca, visto en Foto 2)
    const fenceZ = frontZ - plazaD + 2; // -51m
    const wallH = 0.9;
    const railH = 0.8;

    [[-mainW / 2 - 10, -14], [14, mainW / 2 + 10]].forEach(([x1, x2]) => {
      const len = x2 - x1;
      const wallMesh = new THREE.Mesh(new THREE.BoxGeometry(len, wallH, 0.35), hospitalBaseMat);
      wallMesh.position.set(x1 + len / 2, wallH / 2, fenceZ);
      wallMesh.castShadow = true;
      building.add(wallMesh);

      const railMesh = new THREE.Mesh(new THREE.BoxGeometry(len, railH, 0.1), hospitalWhiteTrimMat);
      railMesh.position.set(x1 + len / 2, wallH + railH / 2, fenceZ);
      building.add(railMesh);
    });

    // 8. Vehículos Estacionados (Autos civiles de la Foto 2)
    const car1 = buildParkedCar(0xffffff, 'pickup');
    car1.position.set(20, 0.05, frontZ - 24);
    car1.rotation.y = Math.PI / 2;
    building.add(car1);

    const car2 = buildParkedCar(0x94a3b8, 'sedan');
    car2.position.set(26, 0.05, frontZ - 24);
    car2.rotation.y = Math.PI / 2;
    building.add(car2);

    const car3 = buildParkedCar(0x991b1b, 'suv');
    car3.position.set(32, 0.05, frontZ - 24);
    car3.rotation.y = Math.PI / 2;
    building.add(car3);

    // 9. Luminarias de Jardín (Postes modernos con globo cálido)
    [-18, -6, 6, 18].forEach((lx) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.4, 8), hospitalEmergencyMat);
      post.position.set(lx, 1.2, frontZ - 18);
      post.castShadow = true;

      const globe = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), warmLampMat);
      globe.position.set(lx, 2.4, frontZ - 18);

      building.add(post, globe);
    });

    // 10. Arbustos Patagónicos y Flores (Notro / Ciruelillo con detalles rojos de Foto 3)
    const shrubGeo = new THREE.SphereGeometry(1.2, 8, 8);
    const shrubMat = new THREE.MeshStandardMaterial({ color: 0x2d4a22, roughness: 0.85 });
    const berryMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.6 });
    [-22, -16, 16, 22].forEach((sx) => {
      const shrub = new THREE.Mesh(shrubGeo, shrubMat);
      shrub.position.set(sx, 0.9, frontZ - 12);
      shrub.scale.set(1.3, 0.8, 1.0);
      shrub.castShadow = true;

      const flower = new THREE.Mesh(new THREE.SphereGeometry(0.35, 6, 6), berryMat);
      flower.position.set(sx + 0.3, 1.3, frontZ - 12.3);

      building.add(shrub, flower);
    });

    return building;
  }

  // Instanciar hitos patrimoniales
  landmarksGroup.add(buildOficinaTierras());
  landmarksGroup.add(buildMunicipalidad());
  landmarksGroup.add(buildHospital());

  return landmarksGroup;
}
