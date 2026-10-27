import * as THREE from 'three';

/**
 * Efectos Climáticos Patagónicos
 * - Sistema de lluvia persistente con viento austral
 * - Charcos reflectantes (puddles) en calles y veredas
 * - Modificador de superficies mojadas (asfalto y techos de zinc)
 */
export function createWeatherEffects(scene) {
  const weatherGroup = new THREE.Group();
  weatherGroup.name = 'WeatherEffects';
  scene.add(weatherGroup);

  // 1. SISTEMA DE PARTÍCULAS DE LLUVIA
  const rainCount = 10000;
  const rainGeo = new THREE.BufferGeometry();
  const rainPositions = new Float32Array(rainCount * 3);
  const rainVelocities = new Float32Array(rainCount);

  const rainBox = { x: 300, y: 120, z: 300 };

  for (let i = 0; i < rainCount; i++) {
    rainPositions[i * 3] = (Math.random() - 0.5) * rainBox.x;
    rainPositions[i * 3 + 1] = Math.random() * rainBox.y;
    rainPositions[i * 3 + 2] = (Math.random() - 0.5) * rainBox.z;
    rainVelocities[i] = 45 + Math.random() * 25; // Velocidad de caída
  }

  rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));

  const rainMat = new THREE.PointsMaterial({
    color: 0x93c5fd,
    size: 0.35,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending
  });

  const rainPoints = new THREE.Points(rainGeo, rainMat);
  rainPoints.visible = false;
  weatherGroup.add(rainPoints);

  // 2. CHARCOS REFLECTANTES (PUDDLES) EN CALLES Y VEREDAS
  const puddleMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.08,
    metalness: 0.9,
    transparent: true,
    opacity: 0.85
  });

  const puddleGeo = new THREE.CircleGeometry(1.8, 16);
  puddleGeo.rotateX(-Math.PI / 2);

  const puddlesGroup = new THREE.Group();
  puddlesGroup.name = 'Puddles';

  // Distribución de charcos en Sargento Aldea y Plaza
  const puddleLocations = [
    [-350, 0.17, 91], [-420, 0.17, 93], [-510, 0.17, 89], [-600, 0.17, 92],
    [-720, 0.17, 90], [-840, 0.17, 94], [-960, 0.17, 91], [-1005, 0.17, 155],
    [-1100, 0.19, 215], [-1115, 0.19, 228], [-1107, 0.19, 240], [-480, 0.19, 118]
  ];

  puddleLocations.forEach(([px, py, pz]) => {
    const puddle = new THREE.Mesh(puddleGeo, puddleMat);
    puddle.position.set(px, py, pz);
    puddle.scale.set(0.8 + Math.random() * 0.7, 1, 0.6 + Math.random() * 0.8);
    puddle.rotation.y = Math.random() * Math.PI;
    puddlesGroup.add(puddle);
  });
  puddlesGroup.visible = false;
  weatherGroup.add(puddlesGroup);

  let isRaining = false;
  const windDir = new THREE.Vector3(-0.35, -1, 0.15).normalize(); // Viento oeste-patagónico

  return {
    setRain: (enabled) => {
      isRaining = enabled;
      rainPoints.visible = enabled;
      puddlesGroup.visible = enabled;
    },
    update: (delta, cameraPos) => {
      if (!isRaining) return;

      // Centrar el volumen de lluvia alrededor de la cámara
      rainPoints.position.set(cameraPos.x, 0, cameraPos.z);

      const pos = rainGeo.attributes.position;
      for (let i = 0; i < rainCount; i++) {
        let y = pos.getY(i) - rainVelocities[i] * delta;
        let x = pos.getX(i) + windDir.x * 25 * delta;
        let z = pos.getZ(i) + windDir.z * 15 * delta;

        // Si la gota toca el suelo, respawn arriba
        if (y < 0) {
          y = rainBox.y;
          x = (Math.random() - 0.5) * rainBox.x;
          z = (Math.random() - 0.5) * rainBox.z;
        }

        pos.setY(i, y);
        pos.setX(i, x);
        pos.setZ(i, z);
      }
      pos.needsUpdate = true;
    }
  };
}
