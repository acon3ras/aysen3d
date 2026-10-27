import * as THREE from 'three';

/**
 * Hitos Arquitectónicos Notables de Puerto Aysén (Nivel 3)
 * Incluye la recreación de la emblemática:
 * Oficina de Tierras y Colonización de Puerto Aysén (1932)
 * Actualmente 2ª Comisaría de Carabineros de Puerto Aysén (Monumento Histórico Nacional)
 * Ubicación real: Calle Bernardo O'Higgins #553 (X: -1005.4m, Z: 149.4m)
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
    color: 0x64748b, // Zócalo elevado de piedra
    roughness: 0.95
  });

  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    roughness: 0.1,
    metalness: 0.9,
    transparent: true,
    opacity: 0.75
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

  landmarksGroup.add(buildOficinaTierras());

  return landmarksGroup;
}
