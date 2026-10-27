import * as THREE from 'three';

/**
 * Sistema y shader del Río Aysén
 * Color característico: verde turquesa glaciar de la Patagonia.
 * Fluye de Este a Oeste bajo el Puente Presidente Ibáñez hacia el fiordo.
 */
export function createRiverSystem(geoData) {
  const riverGroup = new THREE.Group();
  riverGroup.name = 'RioAysen';

  // Material de agua con shader animado o estándar reflectante
  const waterColor = 0x1a535c; // Turquesa glaciar patagónico
  const riverMat = new THREE.MeshStandardMaterial({
    color: waterColor,
    roughness: 0.15,
    metalness: 0.85,
    transparent: true,
    opacity: 0.88,
    envMapIntensity: 1.5
  });

  // Si tenemos polígonos de agua en geodata, renderizamos las formas reales
  if (geoData.waterAreas && geoData.waterAreas.length > 0) {
    geoData.waterAreas.forEach((area) => {
      const ring = area.ring;
      if (ring.length >= 6) {
        const shape = new THREE.Shape();
        shape.moveTo(ring[0], -ring[1]);
        for (let i = 2; i < ring.length; i += 2) {
          shape.lineTo(ring[i], -ring[i + 1]);
        }
        const geom = new THREE.ShapeGeometry(shape);
        geom.rotateX(-Math.PI / 2);
        const mesh = new THREE.Mesh(geom, riverMat);
        mesh.position.y = 0.2;
        mesh.receiveShadow = true;
        riverGroup.add(mesh);
      }
    });
  }

  // Plano fluvial principal continuo que asegura que el cauce del Río Aysén
  // cubra todo el tramo bajo el puente (Este-Oeste de -2200m a +1800m, ancho 260m)
  const riverPlaneGeo = new THREE.PlaneGeometry(4200, 240, 64, 16);
  riverPlaneGeo.rotateX(-Math.PI / 2);

  // Deformación suave de meandros naturales
  const pos = riverPlaneGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    // Curvatura del meandro del Río Aysén hacia el oeste
    const meander = Math.sin(x * 0.0018) * 45 + Math.cos(x * 0.0008) * 30;
    pos.setZ(i, pos.getZ(i) + meander);
  }
  riverPlaneGeo.computeVertexNormals();

  const mainRiver = new THREE.Mesh(riverPlaneGeo, riverMat);
  mainRiver.position.set(-200, 0.2, 0);
  mainRiver.receiveShadow = true;
  riverGroup.add(mainRiver);

  // Orillas del río (riverbanks de grava/vegetación)
  const bankMat = new THREE.MeshStandardMaterial({
    color: 0x2e4033, // Vegetación ribereña húmeda
    roughness: 0.95
  });

  [-130, 130].forEach((sideZ) => {
    const bankGeo = new THREE.BoxGeometry(4200, 1.2, 35);
    const bank = new THREE.Mesh(bankGeo, bankMat);
    bank.position.set(-200, 0.6, sideZ);
    bank.receiveShadow = true;
    riverGroup.add(bank);
  });

  return {
    mesh: riverGroup,
    update: (time) => {
      // Simulación de ondas suaves en la superficie
      const t = time * 1.5;
      riverMat.roughness = 0.15 + Math.sin(t) * 0.03;
    }
  };
}
