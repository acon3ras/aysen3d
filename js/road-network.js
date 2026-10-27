import * as THREE from 'three';

/**
 * Generador de la Red Vial y Plazas de Puerto Aysén
 * Dibuja las 817 calles reales obtenidas de OSM como cintas de asfalto con aceras,
 * y los polígonos de plazas (como la Plaza de Armas).
 */
export function createRoadNetwork(geoData) {
  const roadGroup = new THREE.Group();
  roadGroup.name = 'RoadNetwork';

  const asphaltMat = new THREE.MeshStandardMaterial({
    color: 0x1f2937,
    roughness: 0.9,
    metalness: 0.1
  });

  const parkMat = new THREE.MeshStandardMaterial({
    color: 0x2d6a4f, // Verde césped patagónico
    roughness: 0.85
  });

  // 1. CALLES (RIBBONS ASFALTADOS)
  const roads = geoData.roads || [];
  roads.forEach((road) => {
    // Si es el Puente Ibáñez, ya tiene su propio modelo detallado
    if (road.name === 'Puente Presidente Ibáñez') return;

    const pts = road.pts;
    if (pts.length < 4) return;

    const halfW = (road.w || 7) / 2;
    const vertices = [];
    const indices = [];

    // Construir cinta de carretera a partir de la polilínea central
    const numPts = pts.length / 2;
    for (let i = 0; i < numPts; i++) {
      const x = pts[i * 2];
      const z = pts[i * 2 + 1];

      // Vector tangente a la calle
      let dx = 0, dz = 1;
      if (i < numPts - 1) {
        dx = pts[(i + 1) * 2] - x;
        dz = pts[(i + 1) * 2 + 1] - z;
      } else if (i > 0) {
        dx = x - pts[(i - 1) * 2];
        dz = z - pts[(i - 1) * 2 + 1];
      }
      const len = Math.hypot(dx, dz) || 1;
      const nx = -dz / len;
      const nz = dx / len;

      // Vértice izquierdo y derecho
      const y = 0.15; // Ligeramente sobre el terreno
      vertices.push(x - nx * halfW, y, z - nz * halfW);
      vertices.push(x + nx * halfW, y, z + nz * halfW);

      if (i < numPts - 1) {
        const base = i * 2;
        indices.push(base, base + 1, base + 2);
        indices.push(base + 1, base + 3, base + 2);
      }
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geom.setIndex(indices);
    geom.computeVertexNormals();

    const roadMesh = new THREE.Mesh(geom, asphaltMat);
    roadMesh.receiveShadow = true;
    roadGroup.add(roadMesh);
  });

  // 2. PARQUES Y PLAZAS (PLAZA DE ARMAS, ETC.)
  const parks = geoData.parks || [];
  parks.forEach((park) => {
    const ring = park.ring;
    if (ring.length < 6) return;

    const shape = new THREE.Shape();
    shape.moveTo(ring[0], ring[1]);
    for (let i = 2; i < ring.length; i += 2) {
      shape.lineTo(ring[i], ring[i + 1]);
    }

    try {
      const geom = new THREE.ShapeGeometry(shape);
      geom.rotateX(Math.PI / 2);
      const mesh = new THREE.Mesh(geom, parkMat);
      mesh.position.y = 0.18;
      mesh.receiveShadow = true;
      roadGroup.add(mesh);
    } catch (e) {
      // Ignorar formas no válidas
    }
  });

  roadGroup.userData.asphaltMat = asphaltMat;
  return roadGroup;
}
