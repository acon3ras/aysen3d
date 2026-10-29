import { setupHospitalGLBLoader } from './hospital-loader.js';
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

    ctx.font = 'bold 52px "Outfit", "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Sombra de relieve metálico (letras individuales montadas en fachada)
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillText('HOSPITAL DE PUERTO AYSEN', 515, 68);

    // Letras en acero inoxidable / aluminio plateado brillante (fieles a la foto real del frontis)
    ctx.fillStyle = '#f1f5f9';
    ctx.fillText('HOSPITAL DE PUERTO AYSEN', 512, 64);

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

  // Texturas de señalética interior (Planos DWG: SOME, Triage, Sala de Espera)
  function createAdmisionSignTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0284c7'; // Azul institucional de salud
    ctx.fillRect(0, 0, 512, 128);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.strokeRect(6, 6, 500, 116);
    ctx.font = 'bold 36px "Outfit", "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('ADMISIÓN · SOME · OIRS', 256, 64);
    return new THREE.CanvasTexture(canvas);
  }

  function createQueueScreenTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 512, 256);
    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 32px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('HOSPITAL DE PUERTO AYSÉN', 256, 42);
    ctx.fillStyle = '#f8fafc';
    ctx.font = '22px "Inter", sans-serif';
    ctx.fillText('SALA DE ESPERA · ATENCIÓN', 256, 78);
    ctx.fillStyle = '#facc15';
    ctx.font = '900 68px "Outfit", monospace';
    ctx.fillText('A - 0 4 2', 256, 160);
    ctx.fillStyle = '#38bdf8';
    ctx.font = '22px "Inter", sans-serif';
    ctx.fillText('MÓDULO 3 · BOX 1', 256, 218);
    return new THREE.CanvasTexture(canvas);
  }

  function createDoorPlateTexture(label) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 256, 64);
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, 252, 60);
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 19px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, 128, 32);
    return new THREE.CanvasTexture(canvas);
  }

  function createCultureTruckTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 512, 256);
    // Encabezado institucional oficial
    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 15px "Inter", sans-serif';
    ctx.fillText('Ministerio de las Culturas, las Artes y el Patrimonio', 30, 36);
    ctx.fillStyle = '#0284c7';
    ctx.font = 'bold 24px "Outfit", sans-serif';
    ctx.fillText('Región de Aysén', 30, 70);
    // Mosaico geométrico colorido inferior (como foto real VH-SJ-31)
    const blockW = 28;
    const blockH = 22;
    const colors = ['#dc2626', '#2563eb', '#facc15', '#0284c7', '#ea580c', '#ffffff', '#1e293b'];
    for (let y = 105; y < 246; y += blockH + 3) {
      for (let x = 20; x < 490; x += blockW + 3) {
        const c = colors[Math.abs(Math.sin(x * 13.7 + y * 9.1) * 100) % colors.length | 0];
        ctx.fillStyle = c;
        ctx.fillRect(x, y, blockW, blockH);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, y, blockW, blockH);
      }
    }
    return new THREE.CanvasTexture(canvas);
  }

  function createPlateTexture(plateText) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 48;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 128, 48);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;
    ctx.strokeRect(2, 2, 124, 44);
    ctx.fillStyle = '#0f172a';
    ctx.font = '900 24px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(plateText, 64, 24);
    return new THREE.CanvasTexture(canvas);
  }

  function createTactilePaveTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#facc15';
    ctx.fillRect(0, 0, 64, 64);
    ctx.fillStyle = '#ca8a04';
    for (let x = 4; x < 64; x += 16) {
      ctx.fillRect(x, 0, 6, 64);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 16);
    return tex;
  }

  const hospitalTimberTexture = createHospitalTimberTexture();
  const hospitalSignTexture = createHospitalSignTexture();
  const urgenciasSignTexture = createUrgenciasSignTexture();
  const admisionSignTexture = createAdmisionSignTexture();
  const queueScreenTexture = createQueueScreenTexture();
  const cultureTruckTexture = createCultureTruckTexture();
  const truckPlateTexture = createPlateTexture('VH·SJ·31');
  const tactilePaveTexture = createTactilePaveTexture();

  // Placas de puertas clínicas (según planos DWG)
  const doorPlateTriageTex = createDoorPlateTexture('TRIAGE / EVALUACIÓN');
  const doorPlateGinecoTex = createDoorPlateTexture('BOX GINECOLÓGICO');
  const doorPlateReaniTex = createDoorPlateTexture('BOX REANIMACIÓN');
  const doorPlateFarmaTex = createDoorPlateTexture('FARMACIA Y RECETAS');
  const doorPlateArchivoTex = createDoorPlateTexture('ARCHIVO CLÍNICO');
  const doorPlateWcTex = createDoorPlateTexture('BAÑOS PÚBLICOS');
  const doorPlateElevTex = createDoorPlateTexture('ASCENSORES MONTACAMA');

  // Materiales exteriores e interiores característicos del Hospital
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

  // Materiales interiores (según planos DWG)
  const interiorFloorMat = new THREE.MeshStandardMaterial({
    color: 0xf8f4ec, // Pavimento vinílico sanitario hospitalario beige claro
    roughness: 0.3,
    metalness: 0.05,
    emissive: 0x64748b,
    emissiveIntensity: 0.22,
    side: THREE.DoubleSide
  });

  const interiorWallMat = new THREE.MeshStandardMaterial({
    color: 0xffffff, // Paredes blancas lavables
    roughness: 0.45,
    metalness: 0.02,
    emissive: 0x94a3b8,
    emissiveIntensity: 0.3,
    side: THREE.DoubleSide
  });

  const bumperMat = new THREE.MeshStandardMaterial({
    color: 0x334155, // Zócalo guardacamillas gris
    roughness: 0.5
  });

  const deskWoodMat = new THREE.MeshStandardMaterial({
    color: 0xb45309, // Mesón de atención en madera cálida
    roughness: 0.5
  });

  const chairBlueMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7, // Sillas azul institucional
    roughness: 0.55
  });

  const stainlessDoorMat = new THREE.MeshStandardMaterial({
    color: 0xd4d4d8, // Acero inoxidable cepillado (ascensores y barandas)
    metalness: 0.9,
    roughness: 0.2
  });

  const ceilingTileMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.35,
    emissive: 0xdbeafe,
    emissiveIntensity: 0.65,
    side: THREE.DoubleSide
  });

  const ledPanelMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 4.5 // Iluminación interior en cielo falso
  });

  const tactileYellowMat = new THREE.MeshStandardMaterial({
    map: tactilePaveTexture,
    roughness: 0.45
  });

  const doorPlateTriageMat = new THREE.MeshBasicMaterial({ map: doorPlateTriageTex, side: THREE.DoubleSide });
  const doorPlateGinecoMat = new THREE.MeshBasicMaterial({ map: doorPlateGinecoTex, side: THREE.DoubleSide });
  const doorPlateReaniMat = new THREE.MeshBasicMaterial({ map: doorPlateReaniTex, side: THREE.DoubleSide });
  const doorPlateFarmaMat = new THREE.MeshBasicMaterial({ map: doorPlateFarmaTex, side: THREE.DoubleSide });
  const doorPlateArchivoMat = new THREE.MeshBasicMaterial({ map: doorPlateArchivoTex, side: THREE.DoubleSide });
  const doorPlateWcMat = new THREE.MeshBasicMaterial({ map: doorPlateWcTex, side: THREE.DoubleSide });
  const doorPlateElevMat = new THREE.MeshBasicMaterial({ map: doorPlateElevTex, side: THREE.DoubleSide });
  const cultureTruckMat = new THREE.MeshStandardMaterial({ map: cultureTruckTexture, roughness: 0.3 });
  const truckPlateMat = new THREE.MeshBasicMaterial({ map: truckPlateTexture });

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

  // ---------------------------------------------------------------------------
  // MODELADO DE ELEMENTOS HOSPITALARIOS INTERIORES Y EXTERIORES
  // ---------------------------------------------------------------------------
  function buildBicycle(color) {
    const bike = new THREE.Group();
    const frameMat = new THREE.MeshStandardMaterial({ color, roughness: 0.35, metalness: 0.6 });
    const rubberMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
    const spokeMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.9, roughness: 0.3 });

    // Ruedas delantera y trasera con llanta y neumático
    [-0.55, 0.55].forEach(wx => {
      const tire = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.03, 8, 16), rubberMat);
      tire.position.set(wx, 0.3, 0);
      bike.add(tire);
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.06, 8), spokeMat);
      hub.rotation.x = Math.PI / 2;
      hub.position.set(wx, 0.3, 0);
      bike.add(hub);
    });

    // Cuadro tubular de bicicleta
    const topTube = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.75, 6), frameMat);
    topTube.rotation.z = Math.PI / 2;
    topTube.position.set(0, 0.65, 0);
    bike.add(topTube);

    const downTube = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.8, 6), frameMat);
    downTube.rotation.z = 0.82;
    downTube.position.set(-0.12, 0.48, 0);
    bike.add(downTube);

    const seatTube = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.6, 6), frameMat);
    seatTube.rotation.z = -0.3;
    seatTube.position.set(-0.22, 0.52, 0);
    bike.add(seatTube);

    // Asiento
    const saddle = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.04, 0.1), rubberMat);
    saddle.position.set(-0.28, 0.74, 0);
    bike.add(saddle);

    // Horquilla y manubrio
    const fork = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.5, 6), spokeMat);
    fork.rotation.z = 0.25;
    fork.position.set(0.48, 0.52, 0);
    bike.add(fork);

    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.5), frameMat);
    bar.position.set(0.45, 0.76, 0);
    bike.add(bar);

    return bike;
  }

  function buildCultureTruck() {
    const truck = new THREE.Group();
    const whiteCabMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
    const bumperDarkMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.2 });
    const glassDarkMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.85, roughness: 0.1 });
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });

    // Cabina blanca del camión (Isuzu / Mitsubishi Canter de la foto)
    const cabMesh = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.85, 1.7), whiteCabMat);
    cabMesh.position.set(0, 1.35, -1.8);
    cabMesh.castShadow = true;
    truck.add(cabMesh);

    // Parabrisas
    const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.8, 0.08), glassDarkMat);
    windshield.position.set(0, 1.6, -2.66);
    truck.add(windshield);

    // Ventanas laterales de cabina
    [-1.06, 1.06].forEach(wx => {
      const sideWin = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.65, 0.9), glassDarkMat);
      sideWin.position.set(wx, 1.6, -1.8);
      truck.add(sideWin);
    });

    // Deflector aerodinámico sobre el techo de la cabina
    const deflectorGeo = new THREE.BoxGeometry(1.9, 0.65, 1.4);
    const deflector = new THREE.Mesh(deflectorGeo, whiteCabMat);
    deflector.position.set(0, 2.45, -1.7);
    deflector.rotation.x = -0.22;
    truck.add(deflector);

    // Paragolpes delantero con patente VH-SJ-31
    const bumper = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.35, 0.3), bumperDarkMat);
    bumper.position.set(0, 0.55, -2.7);
    truck.add(bumper);

    const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.2), truckPlateMat);
    plate.position.set(0, 0.55, -2.86);
    truck.add(plate);

    // Focos delanteros
    [-0.8, 0.8].forEach(hx => {
      const headL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.22, 0.06), chromeMat);
      headL.position.set(hx, 0.68, -2.72);
      truck.add(headL);
    });

    // Furgón / Carrocería de carga con gráficos culturales oficiales
    const boxGeo = new THREE.BoxGeometry(2.28, 2.35, 4.4);
    const boxMesh = new THREE.Mesh(boxGeo, cultureTruckMat);
    boxMesh.position.set(0, 1.7, 1.25);
    boxMesh.castShadow = true;
    truck.add(boxMesh);

    // Ruedas (Eje delantero y dual trasero)
    [
      [-0.95, 0.42, -1.8], [0.95, 0.42, -1.8],
      [-0.98, 0.42, 2.2], [0.98, 0.42, 2.2]
    ].forEach(([wx, wy, wz]) => {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.28, 12), wheelMat);
      w.rotation.z = Math.PI / 2;
      w.position.set(wx, wy, wz);
      w.castShadow = true;
      truck.add(w);
    });

    return truck;
  }

  function buildGurney() {
    const gurney = new THREE.Group();
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.9, roughness: 0.2 });
    const blueVinylMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 });
    const whitePillowMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.7 });
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });

    // Chasis metálico inferior
    const frame = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.1, 0.8), chromeMat);
    frame.position.y = 0.5;
    gurney.add(frame);

    // 4 Ruedas giratorias
    [[-0.9, 0.12, -0.32], [0.9, 0.12, -0.32], [-0.9, 0.12, 0.32], [0.9, 0.12, 0.32]].forEach(([wx, wy, wz]) => {
      const caster = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 8), wheelMat);
      caster.rotation.x = Math.PI / 2;
      caster.position.set(wx, wy, wz);
      gurney.add(caster);
    });

    // Columnas hidráulicas
    [-0.5, 0.5].forEach(cx => {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.45, 6), chromeMat);
      col.position.set(cx, 0.28, 0);
      gurney.add(col);
    });

    // Colchón clínico azul
    const pad = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.15, 0.76), blueVinylMat);
    pad.position.y = 0.62;
    gurney.add(pad);

    // Almohada blanca
    const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.08, 0.6), whitePillowMat);
    pillow.position.set(-0.72, 0.72, 0);
    gurney.add(pillow);

    // Barandas laterales de protección
    [-0.4, 0.4].forEach(bz => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.22, 0.03), chromeMat);
      rail.position.set(0.1, 0.78, bz);
      gurney.add(rail);
    });

    // Atril portasuero (IV Pole) con matraz de suero salino
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.4, 6), chromeMat);
    pole.position.set(-0.95, 1.15, 0.36);
    gurney.add(pole);

    const hook = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.02, 0.02), chromeMat);
    hook.position.set(-0.95, 1.82, 0.36);
    gurney.add(hook);

    // Bolsa de suero
    const dripBag = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.2, 0.04), new THREE.MeshStandardMaterial({
      color: 0xbae6fd, transparent: true, opacity: 0.75, roughness: 0.1
    }));
    dripBag.position.set(-0.9, 1.7, 0.36);
    gurney.add(dripBag);

    return gurney;
  }

  function buildWheelchair() {
    const chair = new THREE.Group();
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.9, roughness: 0.2 });
    const blackMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });

    // Ruedas grandes traseras con aros de propulsión
    [-0.32, 0.32].forEach(wz => {
      const tire = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.025, 8, 16), blackMat);
      tire.rotation.y = Math.PI / 2;
      tire.position.set(-0.1, 0.34, wz);
      chair.add(tire);
    });

    // Rueditas delanteras
    [-0.26, 0.26].forEach(wz => {
      const frontCaster = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.04, 8), blackMat);
      frontCaster.rotation.x = Math.PI / 2;
      frontCaster.position.set(0.3, 0.08, wz);
      chair.add(frontCaster);
    });

    // Chasis y asiento
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.04, 0.44), blackMat);
    seat.position.set(0.08, 0.42, 0);
    chair.add(seat);

    const back = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.44, 0.44), blackMat);
    back.position.set(-0.14, 0.66, 0);
    chair.add(back);

    // Apoyabrazos
    [-0.23, 0.23].forEach(az => {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.04, 0.05), blackMat);
      arm.position.set(0.08, 0.6, az);
      chair.add(arm);
    });

    // Manillas de empuje traseras
    [-0.18, 0.18].forEach(hz => {
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.12, 6), blackMat);
      handle.rotation.x = Math.PI / 2;
      handle.position.set(-0.2, 0.86, hz);
      chair.add(handle);
    });

    return chair;
  }

  function buildWaitingBench(seatsCount = 4) {
    const bench = new THREE.Group();
    const beamMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.3 });
    const seatMat = chairBlueMat;

    const totalLen = seatsCount * 0.65;
    const beam = new THREE.Mesh(new THREE.BoxGeometry(totalLen, 0.06, 0.06), beamMat);
    beam.position.y = 0.38;
    bench.add(beam);

    // Patas metálicas en arco
    [-totalLen / 2 + 0.3, totalLen / 2 - 0.3].forEach(lx => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.38, 8), beamMat);
      leg.position.set(lx, 0.19, 0);
      bench.add(leg);
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.03, 0.4), beamMat);
      foot.position.set(lx, 0.02, 0);
      bench.add(foot);
    });

    // Asientos individuales plásticos anatómicos
    for (let i = 0; i < seatsCount; i++) {
      const sx = -totalLen / 2 + 0.32 + i * 0.65;
      const seatBottom = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.04, 0.44), seatMat);
      seatBottom.position.set(sx, 0.42, 0.05);
      bench.add(seatBottom);

      const seatBack = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.42, 0.04), seatMat);
      seatBack.position.set(sx, 0.64, -0.16);
      seatBack.rotation.x = -0.12;
      bench.add(seatBack);
    }

    return bench;
  }

  // ---------------------------------------------------------------------------
  // 3. HOSPITAL DE PUERTO AYSÉN
  // Ubicación OSM Oficial: Camino a Chacabuco / Av. Eusebio Ibar (X: 15.0m, Z: 430.0m)
  // Interior completamente recorrible (Planta Baja según Planos DWG oficiales)
  // Exterior fiel a la foto real (Camión cultural VH-SJ-31, bicicletero, rampa)


function createUtiMonitorTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 384;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#050c14';
    ctx.fillRect(0, 0, 512, 384);

    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 20px "Inter", sans-serif';
    ctx.fillText('MONITOR MULTIPARÁMETRO · UTI-03', 20, 32);

    // Trazo ECG (Verde brillante)
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(20, 100);
    for (let x = 20; x < 330; x += 30) {
      ctx.lineTo(x + 10, 100);
      ctx.lineTo(x + 14, 75);
      ctx.lineTo(x + 18, 130);
      ctx.lineTo(x + 22, 90);
      ctx.lineTo(x + 30, 100);
    }
    ctx.stroke();

    // Trazo SpO2 (Cian)
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(20, 200);
    for (let x = 20; x < 330; x += 40) {
      ctx.bezierCurveTo(x + 10, 170, x + 25, 170, x + 35, 200);
      ctx.lineTo(x + 40, 200);
    }
    ctx.stroke();

    // Trazo Respiración (Amarillo)
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(20, 300);
    for (let x = 20; x < 330; x += 60) {
      ctx.bezierCurveTo(x + 20, 275, x + 40, 275, x + 60, 300);
    }
    ctx.stroke();

    // Panel numérico lateral
    ctx.textAlign = 'right';
    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 18px "Inter", sans-serif';
    ctx.fillText('FC / BPM', 490, 70);
    ctx.font = '900 64px "Outfit", monospace';
    ctx.fillText('72', 490, 128);

    ctx.fillStyle = '#06b6d4';
    ctx.font = 'bold 18px "Inter", sans-serif';
    ctx.fillText('SpO2 %', 490, 175);
    ctx.font = '900 64px "Outfit", monospace';
    ctx.fillText('98', 490, 230);

    ctx.fillStyle = '#eab308';
    ctx.font = 'bold 18px "Inter", sans-serif';
    ctx.fillText('P. ARTERIAL', 490, 280);
    ctx.font = 'bold 36px "Outfit", monospace';
    ctx.fillText('120 / 80', 490, 330);

    return new THREE.CanvasTexture(canvas);
  }

  function createXRayFilmTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0b1120';
    ctx.fillRect(0, 0, 512, 512);

    const radGrd = ctx.createRadialGradient(256, 256, 30, 256, 256, 210);
    radGrd.addColorStop(0, '#e2e8f0');
    radGrd.addColorStop(0.35, '#94a3b8');
    radGrd.addColorStop(0.75, '#334155');
    radGrd.addColorStop(1, '#0b1120');
    ctx.fillStyle = radGrd;
    ctx.fillRect(35, 35, 442, 442);

    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.55;
    ctx.fillRect(248, 70, 16, 340);
    ctx.fillRect(140, 110, 232, 12);
    for (let r = 0; r < 8; r++) {
      const ry = 140 + r * 28;
      ctx.beginPath();
      ctx.arc(256, ry, 70 + r * 11, Math.PI * 0.15, Math.PI * 0.85);
      ctx.lineWidth = 9;
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.ellipse(280, 260, 48, 58, Math.PI * 0.2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fill();

    ctx.globalAlpha = 1.0;
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('HPA · TÓRAX PA · RX-01', 45, 60);

    return new THREE.CanvasTexture(canvas);
  }

  function createFloorPlateTexture(floorName, floorNum, dept) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 512, 160);
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 6;
    ctx.strokeRect(6, 6, 500, 148);

    ctx.fillStyle = '#0284c7';
    ctx.fillRect(18, 18, 90, 124);
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 68px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(floorNum, 63, 80);

    ctx.textAlign = 'left';
    ctx.font = 'bold 26px "Outfit", "Inter", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(floorName, 126, 52);

    ctx.font = '18px "Inter", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(dept, 126, 102);

    return new THREE.CanvasTexture(canvas);
  }

// ---------------------------------------------------------------------------
  // MODELADO DE EQUIPAMIENTO MÉDICO Y TÉCNICO SEGÚN PLANOS DWG (4 PISOS)
  // ---------------------------------------------------------------------------
  function buildBoiler() {
    const boiler = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.35, metalness: 0.6 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.9, roughness: 0.2 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });

    // Bancadas de soporte inferiores
    [-0.8, 0.8].forEach(bx => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.45, 1.4), darkMat);
      leg.position.set(bx, 0.22, 0);
      boiler.add(leg);
    });

    // Cuerpo cilíndrico horizontal
    const cylinderGeo = new THREE.CylinderGeometry(0.7, 0.7, 2.2, 16);
    cylinderGeo.rotateZ(Math.PI / 2);
    const body = new THREE.Mesh(cylinderGeo, bodyMat);
    body.position.y = 1.0;
    boiler.add(body);

    // Quemador frontal cilíndrico y manómetros
    const burner = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.45, 12), darkMat);
    burner.rotation.z = Math.PI / 2;
    burner.position.set(1.25, 1.0, 0);
    boiler.add(burner);

    // Tubería de vapor superior con válvula volante
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.9, 10), chromeMat);
    pipe.position.set(-0.5, 1.9, 0);
    boiler.add(pipe);

    const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.025, 8, 16), new THREE.MeshStandardMaterial({ color: 0xfacc15 }));
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(-0.5, 2.35, 0);
    boiler.add(wheel);

    return boiler;
  }

  function buildGasCylinderBank(count = 8) {
    const bank = new THREE.Group();
    const gasGreenMat = new THREE.MeshStandardMaterial({ color: 0x15803d, metalness: 0.4, roughness: 0.35 });
    const copperMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.8, roughness: 0.3 });
    const rackMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6, roughness: 0.4 });

    const totalW = count * 0.35;
    // Rack perimetral de acero
    const rail = new THREE.Mesh(new THREE.BoxGeometry(totalW, 0.06, 0.35), rackMat);
    rail.position.set(0, 0.9, 0);
    bank.add(rail);

    // Manifold de cobre superior
    const manifold = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, totalW, 8), copperMat);
    manifold.rotation.z = Math.PI / 2;
    manifold.position.set(0, 1.45, 0);
    bank.add(manifold);

    for (let i = 0; i < count; i++) {
      const cx = -totalW / 2 + 0.18 + i * 0.35;
      const cylBody = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.1, 12), gasGreenMat);
      cylBody.position.set(cx, 0.58, 0);
      bank.add(cylBody);

      const cylDome = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), gasGreenMat);
      cylDome.position.set(cx, 1.13, 0);
      bank.add(cylDome);

      const valve = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.12, 8), copperMat);
      valve.position.set(cx, 1.3, 0);
      bank.add(valve);
    }

    return bank;
  }

  function buildElectricPanel() {
    const panel = new THREE.Group();
    const boxMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.5, roughness: 0.4 });
    const redLed = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const yellowLed = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const greenLed = new THREE.MeshBasicMaterial({ color: 0x22c55e });

    const box = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.6, 0.35), boxMat);
    box.position.y = 1.2;
    panel.add(box);

    // Luces piloto superiores
    [[-0.3, redLed], [0, yellowLed], [0.3, greenLed]].forEach(([lx, mat]) => {
      const led = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), mat);
      led.position.set(lx, 1.85, 0.18);
      panel.add(led);
    });

    // Manilla de corte
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.25, 0.08), new THREE.MeshStandardMaterial({ color: 0xdc2626 }));
    handle.position.set(0.4, 1.2, 0.2);
    panel.add(handle);

    return panel;
  }

  function buildDieselGenerator() {
    const gen = new THREE.Group();
    const caseMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4, metalness: 0.5 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.3, 1.1), caseMat);
    body.position.y = 0.65;
    gen.add(body);

    // Rejilla de radiador frontal
    const grill = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.8, 0.8), darkMat);
    grill.position.set(1.02, 0.65, 0);
    gen.add(grill);

    // Escape con silenciador superior
    const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.8, 8), darkMat);
    exhaust.position.set(-0.6, 1.6, 0);
    gen.add(exhaust);

    return gen;
  }

  function buildDentalStation() {
    const station = new THREE.Group();
    const blueVinyl = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3, metalness: 0.1 });
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.9, roughness: 0.2 });

    // Base del sillón con elevador hidráulico
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.1, 0.6), whiteMat);
    base.position.y = 0.05;
    station.add(base);

    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.45, 10), chromeMat);
    post.position.set(-0.1, 0.28, 0);
    station.add(post);

    // Asiento anatómico reclinable
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.12, 0.55), blueVinyl);
    seat.position.set(0.15, 0.52, 0);
    station.add(seat);

    // Respaldo articulado
    const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.1, 0.5), blueVinyl);
    backrest.position.set(-0.35, 0.72, 0);
    backrest.rotation.z = 0.45;
    station.add(backrest);

    // Cabezal ajustable
    const headrest = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.08, 0.26), blueVinyl);
    headrest.position.set(-0.62, 0.94, 0);
    headrest.rotation.z = 0.45;
    station.add(headrest);

    // Apoyapiernas
    const legrest = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.1, 0.5), blueVinyl);
    legrest.position.set(0.65, 0.42, 0);
    legrest.rotation.z = -0.35;
    station.add(legrest);

    // Columna de lámpara scialítica focal articulada
    const lampCol = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.4, 8), whiteMat);
    lampCol.position.set(-0.4, 1.1, -0.45);
    station.add(lampCol);

    const lampArm = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.8, 8), chromeMat);
    lampArm.rotation.z = Math.PI / 4;
    lampArm.position.set(-0.15, 1.9, -0.45);
    station.add(lampArm);

    const lampHead = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.15, 0.2), whiteMat);
    lampHead.position.set(0.15, 2.15, -0.45);
    station.add(lampHead);

    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    bulb.position.set(0.15, 2.08, -0.45);
    station.add(bulb);

    // Escupidera / Salivadera cerámica
    const spit = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.08, 0.14, 12), whiteMat);
    spit.position.set(0.1, 0.75, -0.45);
    station.add(spit);

    // Mueble dental de apoyo lateral con encimera de acero
    const cart = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.85, 0.45), whiteMat);
    cart.position.set(0.2, 0.42, 0.85);
    station.add(cart);

    const top = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.04, 0.49), chromeMat);
    top.position.set(0.2, 0.86, 0.85);
    station.add(top);

    return station;
  }

  function buildKinesiologyGym() {
    const gym = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.5 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.9, roughness: 0.2 });
    const matBlue = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.7 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });

    // 1. Espaldera Sueca de madera (Wall bars)
    [-0.5, 0.5].forEach(postX => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.4, 0.1), woodMat);
      post.position.set(postX, 1.2, -0.05);
      gym.add(post);
    });
    for (let r = 0; r < 11; r++) {
      const rung = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1.0, 8), woodMat);
      rung.rotation.z = Math.PI / 2;
      rung.position.set(0, 0.3 + r * 0.19, -0.05);
      gym.add(rung);
    }

    // 2. Plataforma de Barras Paralelas de marcha
    const platform = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.06, 3.2), woodMat);
    platform.position.set(2.0, 0.03, 0.8);
    gym.add(platform);

    [-0.35, 0.35].forEach(bx => {
      // Pasamanos tubular
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 3.1, 10), chromeMat);
      bar.rotation.x = Math.PI / 2;
      bar.position.set(2.0 + bx, 0.88, 0.8);
      gym.add(bar);
      // Pilares de soporte
      [-1.2, 0, 1.2].forEach(bz => {
        const p = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.85, 8), chromeMat);
        p.position.set(2.0 + bx, 0.45, 0.8 + bz);
        gym.add(p);
      });
    });

    // 3. Trotadora eléctrica de rehabilitación
    const tmBase = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.18, 1.6), darkMat);
    tmBase.position.set(-1.8, 0.12, 0.5);
    gym.add(tmBase);

    const tmConsole = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.25, 0.15), darkMat);
    tmConsole.position.set(-1.8, 1.1, -0.2);
    gym.add(tmConsole);

    // 4. Colchoneta azul de suelo
    const floorMat = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.05, 2.0), matBlue);
    floorMat.position.set(0, 0.025, 1.8);
    gym.add(floorMat);

    return gym;
  }

  function buildClinicalBed() {
    const bed = new THREE.Group();
    const frameWhite = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.3 });
    const blueMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.6 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.9, roughness: 0.2 });

    // Bastidor rectangular con ruedas
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.12, 2.1), frameWhite);
    frame.position.y = 0.45;
    bed.add(frame);

    [[-0.45, -0.9], [0.45, -0.9], [-0.45, 0.9], [0.45, 0.9]].forEach(([wx, wz]) => {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 8), chromeMat);
      wheel.position.set(wx, 0.12, wz);
      bed.add(wheel);
    });

    // Cabecero y piecero
    const headboard = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.55, 0.05), frameWhite);
    headboard.position.set(0, 0.72, -1.02);
    bed.add(headboard);

    const footboard = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.42, 0.05), frameWhite);
    footboard.position.set(0, 0.65, 1.02);
    bed.add(footboard);

    // Barandillas laterales abatibles
    [-0.49, 0.49].forEach(rx => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.22, 1.2), chromeMat);
      rail.position.set(rx, 0.72, -0.1);
      bed.add(rail);
    });

    // Colchón articulado hospitalario
    const mattress = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.18, 1.95), blueMat);
    mattress.position.set(0, 0.58, 0);
    bed.add(mattress);

    // Almohada médica
    const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.1, 0.35), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 }));
    pillow.position.set(0, 0.72, -0.75);
    bed.add(pillow);

    // Atril portasuero cromado con bolsa IV
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.8, 8), chromeMat);
    pole.position.set(-0.62, 0.9, -0.85);
    bed.add(pole);

    const ivBag = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.22, 0.04), new THREE.MeshStandardMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.7 }));
    ivBag.position.set(-0.62, 1.7, -0.85);
    bed.add(ivBag);

    // Panel cabecero mural con tomas de gases clínicos
    const headwall = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.22, 0.05), frameWhite);
    headwall.position.set(0, 1.25, -1.1);
    bed.add(headwall);

    const o2Socket = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.03, 8), new THREE.MeshBasicMaterial({ color: 0x16a34a }));
    o2Socket.rotation.x = Math.PI / 2;
    o2Socket.position.set(-0.2, 1.25, -1.07);
    bed.add(o2Socket);

    const vacSocket = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.03, 8), new THREE.MeshBasicMaterial({ color: 0xeab308 }));
    vacSocket.rotation.x = Math.PI / 2;
    vacSocket.position.set(0.2, 1.25, -1.07);
    bed.add(vacSocket);

    return bed;
  }

  function buildUtiBed() {
    const uti = buildClinicalBed();

    // Brazo articulado con monitor multiparámetro encendido
    const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.5, 8), new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.9 }));
    stand.position.set(0.65, 0.9, -0.6);
    uti.add(stand);

    const monBox = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.32, 0.08), new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 }));
    monBox.position.set(0.65, 1.55, -0.6);
    uti.add(monBox);

    const monScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 0.28), new THREE.MeshBasicMaterial({ map: createUtiMonitorTexture(), side: THREE.DoubleSide }));
    monScreen.position.set(0.65, 1.55, -0.55);
    uti.add(monScreen);

    // Bomba de infusión volumétrica
    const pump = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.24, 0.14), new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.4 }));
    pump.position.set(0.65, 1.15, -0.6);
    uti.add(pump);

    return uti;
  }

  function buildIncubatorStation() {
    const inc = new THREE.Group();
    const cartMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.9 });
    const acrylicMat = new THREE.MeshStandardMaterial({ color: 0xbae6fd, transparent: true, opacity: 0.4, roughness: 0.1 });

    // Carro rodante móvil
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.65, 1.0), cartMat);
    base.position.y = 0.45;
    inc.add(base);

    // Cúpula abovedada acrílica
    const dome = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.42, 0.92), acrylicMat);
    dome.position.y = 0.98;
    inc.add(dome);

    // Colchón térmico interior
    const pad = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.06, 0.78), new THREE.MeshStandardMaterial({ color: 0xfde047 }));
    pad.position.y = 0.8;
    inc.add(pad);

    // Panel de control digital con luz verde
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.1), new THREE.MeshBasicMaterial({ color: 0x22c55e }));
    screen.position.set(0, 0.58, 0.51);
    inc.add(screen);

    return inc;
  }

  function buildAutoclaveStation() {
    const auto = new THREE.Group();
    const steelMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.92, roughness: 0.18 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });

    // Gabinete cilíndrico de acero inoxidable
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.4, 0.9), steelMat);
    body.position.y = 0.7;
    auto.add(body);

    // Compuerta circular con volante hermético
    const door = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.06, 16), steelMat);
    door.rotation.x = Math.PI / 2;
    door.position.set(0, 0.85, 0.48);
    auto.add(door);

    const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.025, 8, 16), steelMat);
    wheel.position.set(0, 0.85, 0.52);
    auto.add(wheel);

    // Manómetros superiores
    const gauge = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 12), darkMat);
    gauge.rotation.x = Math.PI / 2;
    gauge.position.set(0.38, 1.25, 0.47);
    auto.add(gauge);

    return auto;
  }

  function buildXRayUnit() {
    const xray = new THREE.Group();
    const frameWhite = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.3 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.9, roughness: 0.2 });
    const carbonMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });

    // Columna vertical de techo a suelo
    const column = new THREE.Mesh(new THREE.BoxGeometry(0.25, 3.2, 0.25), frameWhite);
    column.position.set(-1.2, 1.6, -1.0);
    xray.add(column);

    // Brazo telescópico horizontal
    const arm = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.18, 0.18), chromeMat);
    arm.position.set(-0.5, 2.2, -1.0);
    xray.add(arm);

    // Tubo de Rayos X con colimador cilíndrico
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.16, 0.45, 12), frameWhite);
    tube.position.set(0.2, 2.05, -1.0);
    xray.add(tube);

    // Mesa de exploración radiográfica basculante
    const table = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.72, 2.1), frameWhite);
    table.position.set(0.2, 0.36, 0.2);
    xray.add(table);

    const tableTop = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.05, 2.2), carbonMat);
    tableTop.position.set(0.2, 0.74, 0.2);
    xray.add(tableTop);

    // Biombo plomado con ventana de vidrio de plomo
    const leadShield = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.0, 0.08), frameWhite);
    leadShield.position.set(-2.2, 1.0, 1.0);
    xray.add(leadShield);

    const leadWindow = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.45), new THREE.MeshStandardMaterial({ color: 0xfacc15, transparent: true, opacity: 0.55 }));
    leadWindow.position.set(-2.2, 1.45, 1.05);
    xray.add(leadWindow);

    // Negatoscopio mural encendido con radiografía de tórax
    const viewbox = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.08), frameWhite);
    viewbox.position.set(1.4, 1.5, -1.8);
    xray.add(viewbox);

    const film = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.72), new THREE.MeshBasicMaterial({ map: createXRayFilmTexture(), side: THREE.DoubleSide }));
    film.position.set(1.4, 1.5, -1.75);
    xray.add(film);

    return xray;
  }

  function buildStairFlight(fromY, toY) {
    const flight = new THREE.Group();
    const concreteMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.6 });
    const railMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.9, roughness: 0.2 });

    const totalH = toY - fromY;
    const stepCount = 18;
    const stepH = totalH / stepCount;
    const stepD = 0.26;
    const stepW = 1.6;

    for (let s = 0; s < stepCount; s++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(stepW, stepH, stepD), concreteMat);
      step.position.set(0, fromY + s * stepH + stepH / 2, s * stepD);
      flight.add(step);
    }

    // Pasamanos tubular lateral
    [-stepW / 2 + 0.05, stepW / 2 - 0.05].forEach(rx => {
      const railLen = Math.hypot(totalH, stepCount * stepD);
      const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, railLen, 8), railMat);
      rail.rotation.x = Math.atan2(totalH, stepCount * stepD) - Math.PI / 2;
      rail.position.set(rx, fromY + totalH / 2 + 0.85, (stepCount * stepD) / 2);
      flight.add(rail);
    });

    return flight;
  }

function buildHospital() {
    const building = new THREE.Group();
    building.name = 'HospitalDePuertoAysen';
    building.position.set(15.0, 0.2, 430.0);
    building.rotation.y = 0.0; // Fachada mira al Norte (-Z) hacia el acceso

    // Inicializar lista global de colisionadores
    window.HOSPITAL_COLLIDERS = window.HOSPITAL_COLLIDERS || [];
    function registerCollider(mesh) {
      if (mesh && !window.HOSPITAL_COLLIDERS.includes(mesh)) {
        window.HOSPITAL_COLLIDERS.push(mesh);
      }
      return mesh;
    }

    const mainW = 70;    // Frente principal
    const mainD = 22;    // Fondo
    const groundH = 3.8; // Piso 1 (zócalo verde oliva)
    const upperH = 7.2;  // Pisos 2 y 3 (madera cálida)
    const totalH = groundH + upperH; // 11.0m
    const frontZ = -mainD / 2; // -11.0m
    const subH = 3.4;    // Altura subterráneo

    // =========================================================================
    // ESTRUCTURA EXTERIOR: ENVOLVENTE EN MADERA PATAGÓNICA Y REMATES
    // =========================================================================
    // Muro exterior posterior (Sur, Z = +11.0m)
    const backWallUpper = registerCollider(new THREE.Mesh(new THREE.BoxGeometry(mainW, upperH, 0.35), hospitalWoodMat));
    backWallUpper.position.set(0, groundH + upperH / 2, -frontZ);
    backWallUpper.castShadow = true;
    backWallUpper.receiveShadow = true;
    building.add(backWallUpper);

    // Muros exteriores laterales (Oriente y Poniente)
    const eastWallUpper = registerCollider(new THREE.Mesh(new THREE.BoxGeometry(0.35, upperH, mainD), hospitalWoodMat));
    eastWallUpper.position.set(mainW / 2, groundH + upperH / 2, 0);
    eastWallUpper.castShadow = true;
    building.add(eastWallUpper);

    const westWallUpper = registerCollider(new THREE.Mesh(new THREE.BoxGeometry(0.35, upperH, mainD), hospitalWoodMat));
    westWallUpper.position.set(-mainW / 2, groundH + upperH / 2, 0);
    westWallUpper.castShadow = true;
    building.add(westWallUpper);

    // Frontis frontal superior en madera patagónica (respetando vanos de ventanas)
    const frontWallUpper = registerCollider(new THREE.Mesh(new THREE.BoxGeometry(mainW, upperH, 0.35), hospitalWoodMat));
    frontWallUpper.position.set(0, groundH + upperH / 2, frontZ);
    frontWallUpper.castShadow = true;
    building.add(frontWallUpper);

    // Zócalo de cimiento perimetral exterior
    const plinthGeo = new THREE.BoxGeometry(mainW + 0.4, 0.35, mainD + 0.4);
    const plinthMesh = new THREE.Mesh(plinthGeo, stonePlinthMat);
    plinthMesh.position.y = 0.17;
    building.add(plinthMesh);

    // Moldura divisoria perimetral blanca entre piso 1 y 2
    const moldGeo = new THREE.BoxGeometry(mainW + 0.3, 0.25, mainD + 0.3);
    const moldMesh = new THREE.Mesh(moldGeo, hospitalWhiteTrimMat);
    moldMesh.position.y = groundH;
    building.add(moldMesh);

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

    // Azotea / Techo exterior
    const roofSlab = registerCollider(new THREE.Mesh(new THREE.BoxGeometry(mainW + 0.4, 0.3, mainD + 0.4), hospitalEmergencyMat));
    roofSlab.position.set(0, totalH + 0.15, 0);
    building.add(roofSlab);

    // Caja de máquinas / Penthouse en Azotea
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
    [-0.3, 0.3].forEach(offZ => {
      const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, totalH, 6), canopyArchMat);
      rail.position.set(ladderX, totalH / 2, ladderZ + offZ);
      building.add(rail);
    });

    // =========================================================================
    // LOSAS DE PISO DE LOS 4 NIVELES (SUBTERRÁNEO, PISO 1, PISO 2 Y PISO 3)
    // Con hueco para escalera continua (X: 28 a 34, Z: -2 a 4)
    // =========================================================================
    function createHospitalSlab(yLevel, mat) {
      const g = new THREE.Group();
      // Sector Principal Oeste (X: -35 a 28)
      const slabMain = new THREE.Mesh(new THREE.BoxGeometry(63, 0.22, mainD), mat);
      slabMain.position.set(-3.5, yLevel - 0.11, 0);
      slabMain.receiveShadow = true;
      g.add(slabMain);

      // Sector Este tras la escalera (X: 34 a 35)
      const slabEast = new THREE.Mesh(new THREE.BoxGeometry(1, 0.22, mainD), mat);
      slabEast.position.set(34.5, yLevel - 0.11, 0);
      g.add(slabEast);

      // Sector Sur tras el hueco (Z: 4 a 11)
      const slabSouth = new THREE.Mesh(new THREE.BoxGeometry(6, 0.22, 7), mat);
      slabSouth.position.set(31.0, yLevel - 0.11, 7.5);
      g.add(slabSouth);

      // Sector Norte delante del hueco (Z: -11 a -2)
      const slabNorth = new THREE.Mesh(new THREE.BoxGeometry(6, 0.22, 9), mat);
      slabNorth.position.set(31.0, yLevel - 0.11, -6.5);
      g.add(slabNorth);

      return g;
    }

    building.add(createHospitalSlab(-subH, interiorFloorMat)); // Subterráneo (-3.4m)
    building.add(createHospitalSlab(0.0, interiorFloorMat));   // Piso 1 (0.0m)
    building.add(createHospitalSlab(3.6, interiorFloorMat));   // Piso 2 (3.6m)
    building.add(createHospitalSlab(7.2, interiorFloorMat));   // Piso 3 (7.2m)

    // Cielos falsos suspendidos con luminarias LED empotradas
    [0.0, 3.6, 7.2].forEach(levelY => {
      const ceilMesh = new THREE.Mesh(new THREE.PlaneGeometry(mainW, mainD), ceilingTileMat);
      ceilMesh.rotateX(Math.PI / 2);
      ceilMesh.position.set(0, levelY + 3.58, 0);
      building.add(ceilMesh);
    });

    // =========================================================================
    // CIRCULACIÓN VERTICAL: ESCALERA CONTINUA Y 2 ASCENSORES MONTACAMA (4 PISOS)
    // =========================================================================
    const stair1 = buildStairFlight(-subH, 0.0);
    stair1.position.set(31.0, 0, 1.0);
    building.add(stair1);

    const stair2 = buildStairFlight(0.0, 3.6);
    stair2.position.set(31.0, 0, 1.0);
    building.add(stair2);

    const stair3 = buildStairFlight(3.6, 7.2);
    stair3.position.set(31.0, 0, 1.0);
    building.add(stair3);

    // Muros divisorios de la caja de escala
    const stairWall = registerCollider(new THREE.Mesh(new THREE.BoxGeometry(0.2, totalH + subH, 7.0), interiorWallMat));
    stairWall.position.set(28.0, (totalH - subH) / 2, 1.0);
    building.add(stairWall);

    // Batería de 2 Ascensores en cada piso con puertas correderas inox y carteles
    const elevatorLevels = [
      { y: -subH, name: 'NIVEL -1 · SERVICIOS TÉCNICOS' },
      { y: 0.0,   name: 'PISO 1 · ACCESO PRINCIPAL' },
      { y: 3.6,   name: 'PISO 2 · ESPECIALIDADES' },
      { y: 7.2,   name: 'PISO 3 · HOSPITALIZACIÓN' }
    ];

    elevatorLevels.forEach(lvl => {
      [-2.0, 2.0].forEach(ex => {
        const eFrame = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.5, 0.25), hospitalEmergencyMat);
        eFrame.position.set(24.0 + ex, lvl.y + 1.25, 2.4);
        building.add(eFrame);

        const eDoor = new THREE.Mesh(new THREE.BoxGeometry(1.9, 2.3, 0.05), stainlessDoorMat);
        eDoor.position.set(24.0 + ex, lvl.y + 1.25, 2.35);
        building.add(eDoor);

        const eDisplay = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 0.18), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
        eDisplay.position.set(24.0 + ex, lvl.y + 2.55, 2.22);
        building.add(eDisplay);
      });

      const eSign = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.4), new THREE.MeshBasicMaterial({
        map: createDoorPlateTexture(lvl.name),
        side: THREE.DoubleSide
      }));
      eSign.position.set(24.0, lvl.y + 2.9, 2.22);
      building.add(eSign);
    });

    // =========================================================================
    // ILUMINACIÓN INTERIOR ARTIFICIAL (PUNTO LUZ CÁLIDO/CLÍNICO EN CADA PISO)
    // =========================================================================
    const lightFloors = [
      { y: -subH + 2.2, color: 0xf8fafc, int: 1.8 },
      { y: 2.2,         color: 0xfff7ed, int: 2.6 },
      { y: 3.6 + 2.2,   color: 0xf0fdf4, int: 2.2 },
      { y: 7.2 + 2.2,   color: 0xf0f9ff, int: 2.2 }
    ];
    lightFloors.forEach(fl => {
      [-18, 0, 18].forEach(lx => {
        const pl = new THREE.PointLight(fl.color, fl.int, 28);
        pl.position.set(lx, fl.y, 0);
        building.add(pl);
      });
    });

    // =========================================================================
    // RECINTOS DEL SUBTERRÁNEO (Y = -3.4m, PLANO DWG 67)
    // =========================================================================
    const subY = -subH;
    // Central Térmica / Calderas
    const boiler1 = buildBoiler();
    boiler1.position.set(-24.0, subY, 4.0);
    building.add(boiler1);

    const boiler2 = buildBoiler();
    boiler2.position.set(-18.0, subY, 4.0);
    building.add(boiler2);

    // Banco de Cilindros de Gases Clínicos
    const gasBank = buildGasCylinderBank(8);
    gasBank.position.set(-8.0, subY, 4.0);
    building.add(gasBank);

    // Tablero Eléctrico General y Grupo Electrógeno Diésel
    const elPanel = buildElectricPanel();
    elPanel.position.set(4.0, subY + 1.1, 9.8);
    building.add(elPanel);

    const generator = buildDieselGenerator();
    generator.position.set(12.0, subY, 4.0);
    building.add(generator);

    // Letrero Identificatorio de Servicios Técnicos Subterráneo
    const subSign = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 0.6), new THREE.MeshBasicMaterial({
      map: createDoorPlateTexture('CENTRAL TÉRMICA · GASES · GENERADOR'),
      side: THREE.DoubleSide
    }));
    subSign.position.set(-15.0, subY + 2.6, 0.0);
    building.add(subSign);

    // =========================================================================
    // PRIMER PISO INTERIOR HUECO Y RECORRIBLE (PLANOS OFICIALES DWG 68)
    // =========================================================================
    // Muros Perimetrales del Piso 1 (Huecos con vano frontal de acceso)
    const wallThick = 0.4;
    const frontWallL = registerCollider(new THREE.Mesh(new THREE.BoxGeometry(mainW / 2 - 6, groundH, wallThick), hospitalBaseMat));
    frontWallL.position.set(-mainW / 4 - 3, groundH / 2, frontZ);
    frontWallL.castShadow = true;
    building.add(frontWallL);

    const frontWallR = registerCollider(new THREE.Mesh(new THREE.BoxGeometry(mainW / 2 - 6, groundH, wallThick), hospitalBaseMat));
    frontWallR.position.set(mainW / 4 + 3, groundH / 2, frontZ);
    frontWallR.castShadow = true;
    building.add(frontWallR);

    const backWallP1 = registerCollider(new THREE.Mesh(new THREE.BoxGeometry(mainW, groundH, wallThick), hospitalBaseMat));
    backWallP1.position.set(0, groundH / 2, -frontZ);
    backWallP1.castShadow = true;
    building.add(backWallP1);

    const eastWallP1 = registerCollider(new THREE.Mesh(new THREE.BoxGeometry(wallThick, groundH, mainD), hospitalBaseMat));
    eastWallP1.position.set(mainW / 2, groundH / 2, 0);
    building.add(eastWallP1);

    const westWallP1 = registerCollider(new THREE.Mesh(new THREE.BoxGeometry(wallThick, groundH, mainD), hospitalBaseMat));
    westWallP1.position.set(-mainW / 2, groundH / 2, 0);
    building.add(westWallP1);

    // Puerta doble cortafuego hacia Urgencias SAMU en pared Oeste
    const samuDoorFrame = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.6, 2.2), hospitalWhiteTrimMat);
    samuDoorFrame.position.set(-mainW / 2 + 0.1, 1.3, 1.3);
    building.add(samuDoorFrame);

    const samuDoorSign = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.4), new THREE.MeshBasicMaterial({
      map: createDoorPlateTexture('ACCESO SAMU / URGENCIAS')
    }));
    samuDoorSign.position.set(-mainW / 2 + 0.18, 2.3, 1.3);
    samuDoorSign.rotation.y = Math.PI / 2;
    building.add(samuDoorSign);

    // Gatera de Acceso / Vestíbulo Cortaviento
    const lobbyW = 10.0, lobbyH = 3.2, lobbyD = 3.6;
    const lobbyZ = frontZ + lobbyD / 2; // -11 + 1.8 = -9.2m

    [-lobbyW / 2, lobbyW / 2].forEach(lx => {
      const gSide = registerCollider(new THREE.Mesh(new THREE.BoxGeometry(0.08, lobbyH, lobbyD), glassMat));
      gSide.position.set(lx, lobbyH / 2, lobbyZ);
      building.add(gSide);
    });

    const gFrameOuter = new THREE.Mesh(new THREE.BoxGeometry(lobbyW, 0.15, 0.15), hospitalWhiteTrimMat);
    gFrameOuter.position.set(0, lobbyH, frontZ);
    building.add(gFrameOuter);

    const gFrameInner = new THREE.Mesh(new THREE.BoxGeometry(lobbyW, 0.15, 0.15), hospitalWhiteTrimMat);
    gFrameInner.position.set(0, lobbyH, frontZ + lobbyD);
    building.add(gFrameInner);

    [-3.2, 3.2].forEach(px => {
      const doorMesh = new THREE.Mesh(new THREE.BoxGeometry(2.0, lobbyH - 0.2, 0.06), glassMat);
      doorMesh.position.set(px, lobbyH / 2, frontZ);
      building.add(doorMesh);
    });

    [-3.2, 3.2].forEach(px => {
      const doorMesh = new THREE.Mesh(new THREE.BoxGeometry(2.0, lobbyH - 0.2, 0.06), glassMat);
      doorMesh.position.set(px, lobbyH / 2, frontZ + lobbyD);
      building.add(doorMesh);
    });

    const lobbyTactile = new THREE.Mesh(new THREE.PlaneGeometry(0.45, lobbyD + 4), tactileYellowMat);
    lobbyTactile.rotateX(-Math.PI / 2);
    lobbyTactile.position.set(0, 0.03, lobbyZ + 2);
    building.add(lobbyTactile);

    // Hall Central y Mesón de Atención SOME · OIRS · Admisión
    const deskGroup = new THREE.Group();
    deskGroup.position.set(7.5, 0, -4.5);

    const deskFront = registerCollider(new THREE.Mesh(new THREE.BoxGeometry(9.0, 1.15, 0.7), deskWoodMat));
    deskFront.position.set(0, 0.58, 0);
    deskFront.castShadow = true;
    deskGroup.add(deskFront);

    const deskTop = new THREE.Mesh(new THREE.BoxGeometry(9.2, 0.08, 0.95), hospitalWhiteTrimMat);
    deskTop.position.set(0, 1.18, 0);
    deskGroup.add(deskTop);

    [-3.0, -1.0, 1.0, 3.0].forEach(sx => {
      const acrylic = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.6, 0.8), glassMat);
      acrylic.position.set(sx, 1.5, 0);
      deskGroup.add(acrylic);
    });

    [-3.3, -1.1, 1.1, 3.3].forEach(px => {
      const monBase = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.02, 0.18), hospitalEmergencyMat);
      monBase.position.set(px, 1.23, 0.1);
      const monScreen = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.34, 0.04), hospitalEmergencyMat);
      monScreen.position.set(px, 1.42, 0.1);
      const screenFace = new THREE.Mesh(new THREE.PlaneGeometry(0.48, 0.3), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
      screenFace.position.set(px, 1.42, 0.13);
      deskGroup.add(monBase, monScreen, screenFace);

      const chairBase = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.04, 8), hospitalEmergencyMat);
      chairBase.position.set(px, 0.02, -0.7);
      const chairStem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.45, 6), stainlessDoorMat);
      chairStem.position.set(px, 0.25, -0.7);
      const chairSeat = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.08, 0.45), chairBlueMat);
      chairSeat.position.set(px, 0.5, -0.7);
      const chairBack = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 0.06), chairBlueMat);
      chairBack.position.set(px, 0.78, -0.9);
      deskGroup.add(chairBase, chairStem, chairSeat, chairBack);
    });

    const admisionSignMesh = new THREE.Mesh(new THREE.PlaneGeometry(5.0, 1.2), new THREE.MeshBasicMaterial({
      map: admisionSignTexture,
      side: THREE.DoubleSide
    }));
    admisionSignMesh.position.set(0, 2.6, 0.5);
    deskGroup.add(admisionSignMesh);
    building.add(deskGroup);

    // Sala de Espera de Pacientes
    const waitGroup = new THREE.Group();
    waitGroup.position.set(-8.5, 0, -4.5);

    [-1.6, -0.2, 1.2].forEach((bz) => {
      const bench = registerCollider(buildWaitingBench(4));
      bench.position.set(0, 0, bz);
      bench.rotation.y = Math.PI;
      waitGroup.add(bench);
    });

    const tvScreen = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.2), new THREE.MeshBasicMaterial({
      map: queueScreenTexture,
      side: THREE.DoubleSide
    }));
    tvScreen.position.set(0, 2.4, -2.8);
    waitGroup.add(tvScreen);

    const totemBase = registerCollider(new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.35, 0.35), hospitalEmergencyMat));
    totemBase.position.set(3.5, 0.68, -1.8);
    const totemScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.35), new THREE.MeshBasicMaterial({ color: 0x0284c7 }));
    totemScreen.position.set(3.5, 1.15, -1.62);
    waitGroup.add(totemBase, totemScreen);

    const waterDisp = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.95, 0.35), hospitalWhiteTrimMat);
    waterDisp.position.set(-3.8, 0.48, -2.6);
    const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.42, 12), new THREE.MeshStandardMaterial({
      color: 0x0284c7, transparent: true, opacity: 0.8
    }));
    bottle.position.set(-3.8, 1.15, -2.6);
    waitGroup.add(waterDisp, bottle);
    building.add(waitGroup);

    // Pasillo Clínico Longitudinal y Tabiques de Boxes
    const midWallZ = 2.4;
    const clinicWallGeo = new THREE.BoxGeometry(mainW - 4, groundH, 0.25);
    const clinicWall = registerCollider(new THREE.Mesh(clinicWallGeo, interiorWallMat));
    clinicWall.position.set(0, groundH / 2, midWallZ);
    building.add(clinicWall);

    const bumperStrip = new THREE.Mesh(new THREE.BoxGeometry(mainW - 4, 0.2, 0.29), bumperMat);
    bumperStrip.position.set(0, 0.9, midWallZ - 0.02);
    building.add(bumperStrip);

    const gurney = buildGurney();
    gurney.position.set(-5.0, 0, 0.8);
    gurney.rotation.y = 0.2;
    building.add(gurney);

    const wheelchair = buildWheelchair();
    wheelchair.position.set(2.8, 0, 0.6);
    wheelchair.rotation.y = -0.4;
    building.add(wheelchair);

    const clinicBoxes = [
      { x: -22, mat: doorPlateWcMat, name: 'BAÑOS PÚBLICOS' },
      { x: -14, mat: doorPlateGinecoMat, name: 'BOX GINECOLÓGICO' },
      { x: -6, mat: doorPlateTriageMat, name: 'TRIAGE / EVALUACIÓN' },
      { x: 2, mat: doorPlateReaniMat, name: 'BOX REANIMACIÓN' },
      { x: 10, mat: doorPlateFarmaMat, name: 'FARMACIA Y RECETAS' },
      { x: 18, mat: doorPlateArchivoMat, name: 'ARCHIVO CLÍNICO' }
    ];

    clinicBoxes.forEach(box => {
      const dFrame = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.4, 0.3), hospitalWhiteTrimMat);
      dFrame.position.set(box.x, 1.2, midWallZ);
      building.add(dFrame);

      const dLeaf = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.2, 0.08), deskWoodMat);
      dLeaf.position.set(box.x, 1.2, midWallZ);
      building.add(dLeaf);

      const porthole = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.1, 16), glassMat);
      porthole.rotation.x = Math.PI / 2;
      porthole.position.set(box.x, 1.5, midWallZ);
      building.add(porthole);

      const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.35), box.mat);
      signMesh.position.set(box.x, 2.55, midWallZ - 0.16);
      building.add(signMesh);

      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.3, 6), stainlessDoorMat);
      handle.position.set(box.x + 0.55, 1.05, midWallZ - 0.06);
      building.add(handle);
    });

    // Sala de Rayos X (Piso 1, X: -26, Z: 5.0)
    const xray = buildXRayUnit();
    xray.position.set(-26.0, 0.0, 6.0);
    building.add(xray);

    const xraySign = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 0.4), new THREE.MeshBasicMaterial({
      map: createDoorPlateTexture('IMAGENOLOGÍA · RAYOS X'),
      side: THREE.DoubleSide
    }));
    xraySign.position.set(-26.0, 2.4, 2.5);
    building.add(xraySign);

    // =========================================================================
    // SEGUNDO PISO: CONSULTAS MÉDICAS, DENTAL Y KINESIOLOGÍA (DWG 69)
    // =========================================================================
    const p2Y = 3.6;
    const p2RailN = new THREE.Mesh(new THREE.BoxGeometry(50, 0.18, 0.06), bumperMat);
    p2RailN.position.set(-5.0, p2Y + 0.9, -1.2);
    building.add(p2RailN);

    const p2RailS = new THREE.Mesh(new THREE.BoxGeometry(50, 0.18, 0.06), bumperMat);
    p2RailS.position.set(-5.0, p2Y + 0.9, 1.2);
    building.add(p2RailS);

    // 14 Consultas Médicas en Piso 2
    for (let b = 1; b <= 7; b++) {
      const bx = -30.0 + (b - 1) * 7.5;
      const dsk = registerCollider(new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.75, 0.8), deskWoodMat));
      dsk.position.set(bx - 0.4, p2Y + 0.38, -6.0);
      building.add(dsk);

      const couch = registerCollider(new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.65, 1.9), new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 })));
      couch.position.set(bx + 1.2, p2Y + 0.32, -6.0);
      building.add(couch);

      const plate = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.3), new THREE.MeshBasicMaterial({
        map: createDoorPlateTexture(`BOX CONSULTA ${b}`),
        side: THREE.DoubleSide
      }));
      plate.position.set(bx, p2Y + 2.2, -1.3);
      building.add(plate);
    }

    // Clínica Dental Odontológica (X: 10 a 20, Z: 5.0)
    const dental1 = buildDentalStation();
    dental1.position.set(12.0, p2Y, 5.0);
    building.add(dental1);

    const dentalSign = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.5), new THREE.MeshBasicMaterial({
      map: createDoorPlateTexture('CLÍNICA DENTAL · ODONTOLOGÍA'),
      side: THREE.DoubleSide
    }));
    dentalSign.position.set(12.0, p2Y + 2.4, 1.3);
    building.add(dentalSign);

    // Gimnasio de Rehabilitación y Kinesiología (X: -26 a -10, Z: 5.0)
    const gym = buildKinesiologyGym();
    gym.position.set(-18.0, p2Y, 5.0);
    building.add(gym);

    const gymSign = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.5), new THREE.MeshBasicMaterial({
      map: createDoorPlateTexture('SALA KINESIOLOGÍA Y REHABILITACIÓN'),
      side: THREE.DoubleSide
    }));
    gymSign.position.set(-18.0, p2Y + 2.4, 1.3);
    building.add(gymSign);

    // =========================================================================
    // TERCER PISO: HOSPITALIZACIÓN, UTI, NEONATOLOGÍA Y ESTERILIZACIÓN (DWG 70)
    // =========================================================================
    const p3Y = 7.2;

    // Salas de Hospitalización Indiferenciada (Camas articuladas y paneles O2)
    for (let c = 0; c < 4; c++) {
      const bed1 = registerCollider(buildClinicalBed());
      bed1.position.set(-28.0 + c * 4.5, p3Y, -5.5);
      building.add(bed1);

      const bed2 = registerCollider(buildClinicalBed());
      bed2.position.set(-28.0 + c * 4.5, p3Y, 5.5);
      building.add(bed2);
    }

    const hospSign = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.5), new THREE.MeshBasicMaterial({
      map: createDoorPlateTexture('HOSPITALIZACIÓN INDIFERENCIADA'),
      side: THREE.DoubleSide
    }));
    hospSign.position.set(-20.0, p3Y + 2.4, -1.3);
    building.add(hospSign);

    // Unidad UTI / UCI (Camas críticas con monitores de signos vitales)
    for (let u = 0; u < 3; u++) {
      const utiBed = registerCollider(buildUtiBed());
      utiBed.position.set(-5.0 + u * 4.5, p3Y, 5.5);
      building.add(utiBed);
    }

    const utiSign = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.5), new THREE.MeshBasicMaterial({
      map: createDoorPlateTexture('TRATAMIENTO INTERMEDIO · UTI'),
      side: THREE.DoubleSide
    }));
    utiSign.position.set(0.0, p3Y + 2.4, 1.3);
    building.add(utiSign);

    // Neonatología y Cunas con incubadoras
    const inc1 = buildIncubatorStation();
    inc1.position.set(12.0, p3Y, -5.5);
    building.add(inc1);

    const neoSign = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.45), new THREE.MeshBasicMaterial({
      map: createDoorPlateTexture('NEONATOLOGÍA Y MATERNIDAD'),
      side: THREE.DoubleSide
    }));
    neoSign.position.set(12.0, p3Y + 2.2, -1.3);
    building.add(neoSign);

    // Central de Esterilización y Reutilización
    const auto1 = buildAutoclaveStation();
    auto1.position.set(18.0, p3Y, 5.5);
    building.add(auto1);

    const sterilSign = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.5), new THREE.MeshBasicMaterial({
      map: createDoorPlateTexture('CENTRAL DE ESTERILIZACIÓN'),
      side: THREE.DoubleSide
    }));
    sterilSign.position.set(18.0, p3Y + 2.4, 1.3);
    building.add(sterilSign);

    // =========================================================================
    // EXTERIOR: MARQUESINA CURVA, BICICLETERO, CAMIÓN CULTURAL Y RAMPA (FOTOS REALES)
    // =========================================================================
    // 1. Marquesina Curva Abovedada de Acceso
    const canopyW = 32;
    const canopyD = 7.0;

    const canopyGeo = new THREE.CylinderGeometry(canopyD / 1.05, canopyD / 1.05, canopyW, 24, 1, false, 0, Math.PI);
    canopyGeo.rotateZ(Math.PI / 2);
    const canopyMesh = new THREE.Mesh(canopyGeo, canopyGlassMat);
    canopyMesh.position.set(0, groundH + 0.9, frontZ - canopyD / 2 + 0.5);
    canopyMesh.scale.set(1, 0.35, 1);
    building.add(canopyMesh);

    // Cerchas tubulares arqueadas blancas
    for (let cx = -canopyW / 2 + 2; cx <= canopyW / 2 - 2; cx += 4) {
      const ribGeo = new THREE.TorusGeometry(canopyD / 1.05, 0.06, 6, 24, Math.PI);
      ribGeo.rotateY(Math.PI / 2);
      const rib = new THREE.Mesh(ribGeo, canopyArchMat);
      rib.position.set(cx, groundH + 0.9, frontZ - canopyD / 2 + 0.5);
      rib.scale.set(1, 0.35, 1);
      building.add(rib);
    }

    // Columnas metálicas esbeltas de soporte
    [-14, -9.5, -5, 0, 5, 9.5, 14].forEach((px) => {
      const poleGeo = new THREE.CylinderGeometry(0.09, 0.09, groundH + 0.6, 8);
      const pole = registerCollider(new THREE.Mesh(poleGeo, canopyArchMat));
      pole.position.set(px, (groundH + 0.6) / 2, frontZ - canopyD + 0.6);
      pole.castShadow = true;
      building.add(pole);

      const baseGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.06, 8);
      const baseMesh = new THREE.Mesh(baseGeo, hospitalEmergencyMat);
      baseMesh.position.set(px, 0.03, frontZ - canopyD + 0.6);
      building.add(baseMesh);

      const lampGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.08, 8);
      const lamp = new THREE.Mesh(lampGeo, warmLampMat);
      lamp.position.set(px, groundH + 0.55, frontZ - canopyD / 2);
      building.add(lamp);
    });

    // 2. Compresor exterior de Aire Acondicionado
    const acUnit = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.7, 0.35), hospitalWhiteTrimMat);
    acUnit.position.set(5.5, 1.15, frontZ - 0.2);
    building.add(acUnit);

    const acGrille = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.02, 12), hospitalEmergencyMat);
    acGrille.rotation.x = Math.PI / 2;
    acGrille.position.set(5.5, 1.15, frontZ - 0.38);
    building.add(acGrille);

    // 3. Soporte Bicicletero con Bicicletas Estacionadas
    const bikeRackGroup = new THREE.Group();
    bikeRackGroup.position.set(10.5, 0, frontZ - 3.2);

    for (let rx = -2.5; rx <= 2.5; rx += 1.0) {
      const uGeo = new THREE.TorusGeometry(0.4, 0.025, 6, 16, Math.PI);
      const uBar = new THREE.Mesh(uGeo, stainlessDoorMat);
      uBar.position.set(rx, 0.45, 0);
      bikeRackGroup.add(uBar);
    }

    const bikeColors = [0xdc2626, 0x0284c7, 0x1e293b, 0xfacc15, 0x16a34a, 0x9333ea];
    [-2.2, -1.3, -0.4, 0.5, 1.4, 2.3].forEach((bx, idx) => {
      const bike = buildBicycle(bikeColors[idx % bikeColors.length]);
      bike.position.set(bx, 0, (idx % 2 === 0 ? 0.1 : -0.1));
      bike.rotation.y = (idx % 2 === 0 ? 0.05 : -0.05);
      bikeRackGroup.add(bike);
    });
    building.add(bikeRackGroup);

    // 4. Camión Cultural / Móvil Parked (VH·SJ·31)
    const cultureTruck = buildCultureTruck();
    cultureTruck.position.set(-9.5, 0.05, frontZ - 10.5);
    cultureTruck.rotation.y = 0.18;
    building.add(cultureTruck);

    // 5. Paseo Peatonal y Guía Podotáctil Amarilla continua
    const walkwayGeo = new THREE.PlaneGeometry(5.2, 32);
    walkwayGeo.rotateX(-Math.PI / 2);
    const walkway = new THREE.Mesh(walkwayGeo, hospitalPaveMat);
    walkway.position.set(0, 0.03, frontZ - 16);
    building.add(walkway);

    const tactileStrip = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 30), tactileYellowMat);
    tactileStrip.rotateX(-Math.PI / 2);
    tactileStrip.position.set(0.6, 0.04, frontZ - 15);
    building.add(tactileStrip);

    // Rampa lateral derecha con muro y baranda tubular inox
    const rampWall = registerCollider(new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.85, 16), hospitalBaseMat));
    rampWall.position.set(-3.2, 0.42, frontZ - 14);
    building.add(rampWall);

    const rampRail = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 16, 8), stainlessDoorMat);
    rampRail.rotation.x = Math.PI / 2;
    rampRail.position.set(-3.2, 0.95, frontZ - 14);
    building.add(rampRail);

    // 6. Letrero Frontal Oficial en Letras 3D "HOSPITAL DE PUERTO AYSEN"
    const signBoardMat = new THREE.MeshBasicMaterial({
      map: hospitalSignTexture,
      transparent: true
    });
    const signBoardGeo = new THREE.PlaneGeometry(24, 3.0);
    const signBoard = new THREE.Mesh(signBoardGeo, signBoardMat);
    signBoard.position.set(0, groundH + 5.5, frontZ - 0.22);
    signBoard.rotation.y = Math.PI; // Mira al Norte hacia la calle
    building.add(signBoard);

    // 7. Ala de Urgencias y Bahía de Ambulancias (SAMU 131)
    const urgW = 24, urgH = 7.6, urgD = 20;
    const urgGeo = new THREE.BoxGeometry(urgW, urgH, urgD);
    const urgMesh = registerCollider(new THREE.Mesh(urgGeo, hospitalEmergencyMat));
    urgMesh.position.set(-mainW / 2 - urgW / 2 + 1, urgH / 2, 0);
    urgMesh.castShadow = true;
    building.add(urgMesh);

    // Alero voladizo de Urgencias
    const bayRoofW = 16, bayRoofH = 0.5, bayRoofD = 10;
    const bayRoof = new THREE.Mesh(new THREE.BoxGeometry(bayRoofW, bayRoofH, bayRoofD), hospitalEmergencyMat);
    bayRoof.position.set(-mainW / 2 - 10, 4.4, frontZ - bayRoofD / 2 + 2);
    building.add(bayRoof);

    // Columnas de Urgencias
    [-mainW / 2 - 17, -mainW / 2 - 3].forEach((bx) => {
      const col = registerCollider(new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 4.4, 8), canopyArchMat));
      col.position.set(bx, 2.2, frontZ - bayRoofD + 2.5);
      col.castShadow = true;
      building.add(col);
    });

    // Cartel URGENCIAS · SAMU
    const urgSign = new THREE.Mesh(new THREE.PlaneGeometry(12, 3.0), new THREE.MeshBasicMaterial({
      map: urgenciasSignTexture
    }));
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

    const urgLight = new THREE.PointLight(0xef4444, 1.8, 18);
    urgLight.position.set(-mainW / 2 - 10, 6.0, frontZ - 2);
    building.add(urgLight);

    // Ambulancia SAMU 131 detallada
    const ambGroup = new THREE.Group();
    ambGroup.position.set(-mainW / 2 - 10, 0, frontZ - 4.5);
    ambGroup.rotation.y = -0.15;

    const ambBody = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.1, 5.2), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 }));
    ambBody.position.y = 1.3;
    ambBody.castShadow = true;

    const stripeMat = new THREE.MeshBasicMaterial({ color: 0xdc2626 });
    const stripeL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.25, 4.6), stripeMat);
    stripeL.position.set(-1.12, 1.25, 0);
    const stripeR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.25, 4.6), stripeMat);
    stripeR.position.set(1.12, 1.25, 0);

    const cabWin = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.8, 0.1), new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.1, metalness: 0.8 }));
    cabWin.position.set(0, 1.6, -2.55);

    const beaconBar = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.18, 0.4), hospitalEmergencyMat);
    beaconBar.position.set(0, 2.45, -0.6);
    const beaconR = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.16, 0.35), redCrossMat);
    beaconR.position.set(-0.35, 2.48, -0.6);
    const beaconB = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.16, 0.35), new THREE.MeshStandardMaterial({
      color: 0x3b82f6, emissive: 0x3b82f6, emissiveIntensity: 2.2
    }));
    beaconB.position.set(0.35, 2.48, -0.6);

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

    // 8. Fenestración Arquitectónica de Fachada (Grupos y Ribbon Windows)
    // Piso 3: Grupos de ventanas despejando el letrero central
    const clusterPositions = [-26, -16, 16, 26];
    clusterPositions.forEach((cx) => {
      const clusterFrame = new THREE.Mesh(new THREE.BoxGeometry(9.6, 2.2, 0.12), hospitalWhiteTrimMat);
      clusterFrame.position.set(cx, groundH + 5.2, frontZ - 0.2);
      building.add(clusterFrame);

      for (let w = 0; w < 4; w++) {
        const wx = cx - 3.6 + w * 2.4;
        const win = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.9, 0.08), glassMat);
        win.position.set(wx, groundH + 5.2, frontZ - 0.22);
        building.add(win);
      }
    });

    // Piso 2: Ribbon windows corridos con montantes blancos
    for (let wx = -mainW / 2 + 5; wx <= mainW / 2 - 5; wx += 4.5) {
      const mFrame = new THREE.Mesh(new THREE.BoxGeometry(4.0, 1.8, 0.12), hospitalWhiteTrimMat);
      mFrame.position.set(wx, groundH + 1.8, frontZ - 0.2);
      building.add(mFrame);

      const win = new THREE.Mesh(new THREE.BoxGeometry(3.7, 1.5, 0.08), glassMat);
      win.position.set(wx, groundH + 1.8, frontZ - 0.22);
      building.add(win);
    }

    // Piso 1 (Zócalo verde oliva): Ventanales modulares con vistas hacia el exterior
    for (let wx = -mainW / 2 + 6; wx <= mainW / 2 - 6; wx += 5.5) {
      if (Math.abs(wx) < 6) continue;
      const gFrame = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.6, 0.12), hospitalWhiteTrimMat);
      gFrame.position.set(wx, 2.0, frontZ - 0.2);
      building.add(gFrame);

      const win = new THREE.Mesh(new THREE.BoxGeometry(3.3, 1.3, 0.08), glassMat);
      win.position.set(wx, 2.0, frontZ - 0.22);
      building.add(win);
    }

    // 9. Explanada de Acceso, Plaza y Estacionamiento
    const plazaW = 96;
    const plazaD = 44;
    const plazaZ = frontZ - plazaD / 2;

    const plazaGeo = new THREE.PlaneGeometry(plazaW, plazaD);
    plazaGeo.rotateX(-Math.PI / 2);
    const plazaMesh = new THREE.Mesh(plazaGeo, hospitalPaveMat);
    plazaMesh.position.set(0, 0.04, plazaZ);
    plazaMesh.receiveShadow = true;
    building.add(plazaMesh);

    // Cierre perimetral frontal (murete verde + reja blanca)
    const fenceZ = frontZ - plazaD + 2;
    const wallH = 0.9;
    const railH = 0.8;

    [[-mainW / 2 - 10, -14], [14, mainW / 2 + 10]].forEach(([x1, x2]) => {
      const len = x2 - x1;
      const wallMesh = registerCollider(new THREE.Mesh(new THREE.BoxGeometry(len, wallH, 0.35), hospitalBaseMat));
      wallMesh.position.set(x1 + len / 2, wallH / 2, fenceZ);
      wallMesh.castShadow = true;
      building.add(wallMesh);

      const railMesh = new THREE.Mesh(new THREE.BoxGeometry(len, railH, 0.1), hospitalWhiteTrimMat);
      railMesh.position.set(x1 + len / 2, wallH + railH / 2, fenceZ);
      building.add(railMesh);
    });

    // Vehículos Estacionados Civiles
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

    // Farolas y Notros con flores rojas
    [-18, -6, 6, 18].forEach((lx) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.4, 8), hospitalEmergencyMat);
      post.position.set(lx, 1.2, frontZ - 18);
      post.castShadow = true;

      const globe = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), warmLampMat);
      globe.position.set(lx, 2.4, frontZ - 18);
      building.add(post, globe);
    });

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

    // =========================================================================
    // INICIALIZACIÓN DEL CARGADOR EXTERNO GLTF/GLB Y SOPORTE DRAG & DROP
    // =========================================================================
    if (typeof setupHospitalGLBLoader === 'function') {
      try {
        setupHospitalGLBLoader(building.parent || building, building);
      } catch (err) {
        console.warn('[Hospital] No se pudo inicializar setupHospitalGLBLoader:', err);
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
