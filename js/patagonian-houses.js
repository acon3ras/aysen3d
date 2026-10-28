import * as THREE from 'three';

/**
 * Generador de Casas y Edificios Patagónicos
 * Convierte huellas poligonales reales de OSM en viviendas con:
 * - Alturas reales de 1 a 2 pisos (3m a 7m)
 * - Techos inclinados a dos aguas para lluvia/nieve
 * - Paleta de colores tradicionales del sur de Chile: maderas, tinglados y techos de zinc.
 */
export function createPatagonianBuildings(geoData) {
  const buildingsGroup = new THREE.Group();
  buildingsGroup.name = 'PatagonianBuildings';

  const buildings = geoData.buildings || [];
  if (buildings.length === 0) return buildingsGroup;

  // Paleta de colores para paredes (tinglados de madera y revoques sureños)
  const wallColors = [
    0x854d0e, // Madera cálida
    0x1e3a8a, // Azul profundo patagónico
    0x14532d, // Verde ciprés
    0x991b1b, // Rojo tejuela
    0xd97706, // Ocre austral
    0x334155, // Gris pizarra
    0xf8fafc, // Blanco invernal
    0x78350f  // Alerce oscuro
  ];

  // Paleta para techos (chapas de zinc acanalado)
  const roofColors = [
    0x64748b, // Zinc galvanizado natural
    0x475569, // Zinc envejecido
    0x991b1b, // Zinc rojo colonial
    0x1e293b, // Zinc negro asfáltico
    0x0f766e  // Zinc verde musgo
  ];

  // Materiales compartidos
  const wallMaterials = wallColors.map((col) => new THREE.MeshStandardMaterial({
    color: col,
    roughness: 0.8,
    metalness: 0.1
  }));

  const roofMaterials = roofColors.map((col) => new THREE.MeshStandardMaterial({
    color: col,
    roughness: 0.45,
    metalness: 0.65
  }));

  // Agrupamos geometrías por material para hacer merge y mantener 60 FPS
  const wallGeometries = wallColors.map(() => []);
  const roofGeometries = roofColors.map(() => []);

  // Función hash determinista para seleccionar color según ID de OSM
  const getHash = (id) => {
    let h = 0;
    const str = String(id);
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
    return h;
  };

  // Edificios que cuentan con modelado Nivel 3 detallado en landmarks.js
  const EXCLUDED_LANDMARK_IDS = new Set([
    836943359, // Oficina de Tierras y Colonización (2ª Comisaría)
    434686872, // Ilustre Municipalidad de Aysén
    625135601, // Hospital de Puerto Aysén (Edificio Principal)
    364383065  // Hospital de Puerto Aysén (Ala de Urgencias / Servicios)
  ]);

  buildings.forEach((b) => {
    if (EXCLUDED_LANDMARK_IDS.has(b.id)) return;
    const ring = b.ring;
    if (ring.length < 6) return;

    const hash = getHash(b.id);
    const wallMatIdx = hash % wallColors.length;
    const roofMatIdx = (hash >> 3) % roofColors.length;

    // Crear forma 2D
    const shape = new THREE.Shape();
    // Invertir Z para orientación en Three.js (+X Este, +Z Sur)
    shape.moveTo(ring[0], ring[1]);
    for (let i = 2; i < ring.length; i += 2) {
      shape.lineTo(ring[i], ring[i + 1]);
    }
    shape.closePath();

    const wallH = b.h || 3.8;
    const roofH = b.levels > 1 ? 2.5 : 1.8;

    // Geometría de los muros
    const extrudeSettings = {
      depth: wallH,
      bevelEnabled: false
    };

    try {
      const wallGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      // Rotar para que la extrusión sea vertical en el eje Y
      wallGeo.rotateX(Math.PI / 2);
      wallGeo.translate(0, wallH, 0);

      // Calcular centroide para el techo
      const cx = b.c ? b.c[0] : 0;
      const cz = b.c ? b.c[1] : 0;

      // Geometría del techo inclinado a 2 aguas (cresta sobre la base)
      // Construimos una cubierta piramidal/a 2 aguas sobre la huella
      const roofPts = [];
      for (let i = 0; i < ring.length; i += 2) {
        roofPts.push(new THREE.Vector2(ring[i], ring[i + 1]));
      }

      const roofShape = new THREE.Shape(roofPts);
      const roofExtrude = {
        depth: 0.3,
        bevelEnabled: true,
        bevelThickness: roofH,
        bevelSize: 0.4,
        bevelSegments: 1
      };
      const roofGeo = new THREE.ExtrudeGeometry(roofShape, roofExtrude);
      roofGeo.rotateX(Math.PI / 2);
      roofGeo.translate(0, wallH + roofH + 0.2, 0);

      wallGeometries[wallMatIdx].push(wallGeo);
      roofGeometries[roofMatIdx].push(roofGeo);
    } catch (e) {
      // Ignorar polígonos complejos o auto-intersectados de OSM
    }
  });

  // Renderizar mallas agrupadas
  wallMaterials.forEach((mat, idx) => {
    const geos = wallGeometries[idx];
    if (geos.length > 0) {
      // Usar BufferGeometryUtils si estuviera disponible, o añadir al grupo
      geos.forEach((g) => {
        const mesh = new THREE.Mesh(g, mat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        buildingsGroup.add(mesh);
      });
    }
  });

  roofMaterials.forEach((mat, idx) => {
    const geos = roofGeometries[idx];
    if (geos.length > 0) {
      geos.forEach((g) => {
        const mesh = new THREE.Mesh(g, mat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        buildingsGroup.add(mesh);
      });
    }
  });

  buildingsGroup.userData.roofMaterials = roofMaterials;
  return buildingsGroup;
}
