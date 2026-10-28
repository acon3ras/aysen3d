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

    // Pintura vial discontinua (línea blanca central) en avenidas principales
    if ((road.w && road.w >= 7.5) || (road.name && (road.name.includes('Aldea') || road.name.includes('Ibar') || road.name.includes('O\'Higgins')))) {
      const stripeGeom = new THREE.BufferGeometry();
      const sVerts = [];
      const sIndices = [];
      const stripeW = 0.16;
      let sIdx = 0;

      for (let i = 0; i < numPts - 1; i++) {
        const x1 = pts[i * 2], z1 = pts[i * 2 + 1];
        const x2 = pts[(i + 1) * 2], z2 = pts[(i + 1) * 2 + 1];
        const segLen = Math.hypot(x2 - x1, z2 - z1);
        if (segLen < 2) continue;

        const dirX = (x2 - x1) / segLen;
        const dirZ = (z2 - z1) / segLen;
        const normX = -dirZ;
        const normZ = dirX;

        const dashL = 3.5;
        const gapL = 3.5;
        let d = 0;
        while (d + dashL <= segLen) {
          const sx1 = x1 + dirX * d;
          const sz1 = z1 + dirZ * d;
          const sx2 = x1 + dirX * (d + dashL);
          const sz2 = z1 + dirZ * (d + dashL);

          const yStripe = 0.16; // Apenas sobre el asfalto (0.15)
          sVerts.push(
            sx1 - normX * stripeW, yStripe, sz1 - normZ * stripeW,
            sx1 + normX * stripeW, yStripe, sz1 + normZ * stripeW,
            sx2 - normX * stripeW, yStripe, sz2 - normZ * stripeW,
            sx2 + normX * stripeW, yStripe, sz2 + normZ * stripeW
          );

          sIndices.push(sIdx, sIdx + 1, sIdx + 2, sIdx + 1, sIdx + 3, sIdx + 2);
          sIdx += 4;
          d += dashL + gapL;
        }
      }

      if (sVerts.length > 0) {
        stripeGeom.setAttribute('position', new THREE.Float32BufferAttribute(sVerts, 3));
        stripeGeom.setIndex(sIndices);
        const stripeMesh = new THREE.Mesh(stripeGeom, new THREE.MeshBasicMaterial({ color: 0xf1f5f9 }));
        roadGroup.add(stripeMesh);
      }
    }
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
