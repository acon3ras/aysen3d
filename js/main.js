import * as THREE from 'three';
import { AYSEN_GEO } from './aysen-geodata.js';
import { createPuenteIbanez } from './puente-ibanez.js';
import { createRiverSystem } from './river-system.js';
import { createPatagonianBuildings } from './patagonian-houses.js';
import { createPatagonianFoliage } from './trees.js';
import { createUrbanFurniture } from './urban-furniture.js';
import { createRoadNetwork } from './road-network.js';
import { createPatagonianTerrain } from './terrain.js';
import { createMinimap } from './minimap.js';
import { createStreetDetails } from './street-details.js';
import { createLandmarks } from './landmarks.js';
import { setupPostProcessing } from './postprocessing.js';
import { createWeatherEffects } from './weather-effects.js';
import { createAudioManager } from './audio-manager.js';

// Configuración de escena
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.5, 9000);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
container.appendChild(renderer.domElement);

// Post-Processing Pipeline (SSAO + Bloom sutil + ACES Filmic)
const postProcessing = setupPostProcessing(renderer, scene, camera);

// Iluminación
const ambientLight = new THREE.HemisphereLight(0xb1e1ff, 0x223322, 0.6);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xfff7ed, 1.6);
sunLight.position.set(300, 600, 200);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.camera.near = 10;
sunLight.shadow.camera.far = 1500;
const d = 350;
sunLight.shadow.camera.left = -d;
sunLight.shadow.camera.right = d;
sunLight.shadow.camera.top = d;
sunLight.shadow.camera.bottom = -d;
sunLight.shadow.bias = -0.0005;
scene.add(sunLight);

// Audio Ambiental y Efectos Climáticos
const weatherEffects = createWeatherEffects(scene);
const audioManager = createAudioManager();

// Presets de Clima y Atmósfera Patagónica
const weatherPresets = {
  niebla: {
    name: 'Niebla Patagónica',
    fogColor: 0x94a3b8,
    fogDensity: 0.0018,
    skyColor: 0x64748b,
    sunColor: 0xf1f5f9,
    sunIntensity: 0.9,
    sunPos: [150, 300, 100],
    ambient: 0.75,
    isRain: false
  },
  lluvia: {
    name: 'Lluvia Patagónica',
    fogColor: 0x475569,
    fogDensity: 0.0024,
    skyColor: 0x334155,
    sunColor: 0x94a3b8,
    sunIntensity: 0.75,
    sunPos: [100, 350, 100],
    ambient: 0.65,
    isRain: true
  },
  sol: {
    name: 'Sol Andino',
    fogColor: 0xbae6fd,
    fogDensity: 0.00045,
    skyColor: 0x0284c7,
    sunColor: 0xffedd5,
    sunIntensity: 1.8,
    sunPos: [300, 600, 200],
    ambient: 0.65,
    isRain: false
  },
  dorado: {
    name: 'Atardecer Dorado',
    fogColor: 0xfdba74,
    fogDensity: 0.0008,
    skyColor: 0xc2410c,
    sunColor: 0xfb923c,
    sunIntensity: 2.1,
    sunPos: [-700, 150, 400],
    ambient: 0.55,
    isRain: false
  },
  noche: {
    name: 'Noche Austral',
    fogColor: 0x090d16,
    fogDensity: 0.0014,
    skyColor: 0x020617,
    sunColor: 0x38bdf8,
    sunIntensity: 0.15,
    sunPos: [0, -400, 0],
    ambient: 0.25,
    isRain: false
  }
};

// Referencias globales a mallas con materiales dinámicos
let roadsMesh = null;
let buildingsMesh = null;

let currentPreset = 'sol';
function applyWeather(presetKey) {
  const p = weatherPresets[presetKey] || weatherPresets.sol;
  currentPreset = presetKey;

  scene.background = new THREE.Color(p.skyColor);
  scene.fog = new THREE.FogExp2(p.fogColor, p.fogDensity);

  sunLight.color.setHex(p.sunColor);
  sunLight.intensity = p.sunIntensity;
  sunLight.position.set(...p.sunPos);
  ambientLight.intensity = p.ambient;

  // Actualizar lluvia y audio
  const isRain = !!p.isRain;
  weatherEffects.setRain(isRain);
  audioManager.setRainAudio(isRain);

  // Superficies mojadas patagónicas (asfalto reflectante y techos de zinc brillantes)
  if (roadsMesh && roadsMesh.userData.asphaltMat) {
    roadsMesh.userData.asphaltMat.roughness = isRain ? 0.22 : 0.9;
    roadsMesh.userData.asphaltMat.metalness = isRain ? 0.35 : 0.1;
  }
  if (buildingsMesh && buildingsMesh.userData.roofMaterials) {
    buildingsMesh.userData.roofMaterials.forEach((rm) => {
      rm.roughness = isRain ? 0.18 : 0.45;
      rm.metalness = isRain ? 0.82 : 0.65;
    });
  }

  document.querySelectorAll('.weather-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.weather === presetKey);
  });
}

// Botón de activación de Audio
const audioBtn = document.getElementById('audio-toggle-btn');
if (audioBtn) {
  audioBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isPlaying = audioManager.toggle();
    audioBtn.textContent = isPlaying ? '🔊 Audio' : '🔇 Audio';
    audioBtn.classList.toggle('active', isPlaying);
  });
}

// Instanciar Sistemas del Mundo 3D
console.log('[Aysen3D] Construyendo mundo de Puerto Aysén...');
const terrainMesh = createPatagonianTerrain();
scene.add(terrainMesh);

const riverSystem = createRiverSystem(AYSEN_GEO);
scene.add(riverSystem.mesh);

roadsMesh = createRoadNetwork(AYSEN_GEO);
scene.add(roadsMesh);

const puenteMesh = createPuenteIbanez();
scene.add(puenteMesh);

buildingsMesh = createPatagonianBuildings(AYSEN_GEO);
scene.add(buildingsMesh);

// Aplicar preset inicial una vez creadas las mallas
applyWeather('sol');

const foliageMesh = createPatagonianFoliage(AYSEN_GEO);
scene.add(foliageMesh);

const furnitureMesh = createUrbanFurniture(AYSEN_GEO);
scene.add(furnitureMesh);

const streetDetailsMesh = createStreetDetails(AYSEN_GEO);
scene.add(streetDetailsMesh);

const landmarksMesh = createLandmarks(AYSEN_GEO);
scene.add(landmarksMesh);

// Minimapa
const minimap = createMinimap('minimap-canvas', AYSEN_GEO);

// Miradores peatonales y panorámicos calibrados
const SPAWN_PRESETS = {
  puente: { pos: [0, 8.5, 45], lookAt: [0, 8.5, -80], label: 'Puente Presidente Ibáñez' },
  plaza: { pos: [-1107, 2.4, 236], lookAt: [-1107, 2.5, 219], label: 'Plaza de Armas' },
  muni: { pos: [-1113.7, 4.2, 218], lookAt: [-1113.7, 5.0, 187.1], label: 'Municipalidad de Aysén' },
  costanera: { pos: [-480, 2.2, 122], lookAt: [-480, 2.0, 50], label: 'Costanera Río Aysén' },
  comisaria: { pos: [-1005, 3.2, 172], lookAt: [-1005.4, 4.5, 149.4], label: '2ª Comisaría (Tierras y Colonización)' },
  ribera_norte: { pos: [30, 8.5, -170], lookAt: [0, 7.5, 0], label: 'Ribera Norte' }
};

// Estado de la Cámara y Movimiento
// Posición inicial: Sobre el Puente Presidente Ibáñez, mirando hacia la Ribera Sur y el Río
camera.position.set(0, 8.5, 45);
let targetLookAt = new THREE.Vector3(0, 8.5, -80);
camera.lookAt(targetLookAt);

let yaw = 0;
let pitch = 0;
const speed = 25; // m/s
const runMultiplier = 2.8;

const keys = {};
window.addEventListener('keydown', (e) => {
  keys[e.code] = true;
  if (e.code === 'KeyV') {
    isFlyMode = !isFlyMode;
    const modeLabel = document.getElementById('mode-indicator');
    if (modeLabel) modeLabel.textContent = isFlyMode ? 'Drone / Vuelo' : 'Paseo Peatonal';
  }
});
window.addEventListener('keyup', (e) => { keys[e.code] = false; });

let isFlyMode = true;
let isPointerLocked = false;

// Control por ratón (Pointer Lock)
container.addEventListener('click', () => {
  container.requestPointerLock();
});

document.addEventListener('pointerlockchange', () => {
  isPointerLocked = (document.pointerLockElement === container);
  const crosshair = document.getElementById('crosshair');
  if (crosshair) crosshair.style.opacity = isPointerLocked ? '1' : '0.3';
});

document.addEventListener('mousemove', (e) => {
  if (!isPointerLocked) return;
  const sens = 0.0022;
  yaw -= e.movementX * sens;
  pitch -= e.movementY * sens;
  pitch = Math.max(-Math.PI / 2.1, Math.min(Math.PI / 2.1, pitch));
});

// Teletransporte a Hitos
window.teleportTo = function(id) {
  const spawn = SPAWN_PRESETS[id] || (AYSEN_GEO.spawnPoints && AYSEN_GEO.spawnPoints.find((s) => s.id === id));
  if (spawn) {
    camera.position.set(spawn.pos[0], spawn.pos[1], spawn.pos[2]);
    camera.up.set(0, 1, 0);
    if (spawn.lookAt) {
      const dx = spawn.lookAt[0] - spawn.pos[0];
      const dy = spawn.lookAt[1] - spawn.pos[1];
      const dz = spawn.lookAt[2] - spawn.pos[2];
      const distXZ = Math.hypot(dx, dz) || 1;
      yaw = Math.atan2(-dx, -dz);
      pitch = Math.atan2(dy, distXZ);
    }
  }
};

// Eventos de botones UI
document.querySelectorAll('.weather-btn').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    applyWeather(btn.dataset.weather);
  });
});

document.querySelectorAll('.teleport-btn').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    window.teleportTo(btn.dataset.spawn);
  });
});

// HUD & Medidor de Rendimiento
const coordsEl = document.getElementById('coords-display');
const fpsEl = document.getElementById('fps-display');
let frameCount = 0;
let lastFpsTime = performance.now();

// Ocultar pantalla de carga una vez inicializada la escena
setTimeout(() => {
  const loader = document.getElementById('loader-overlay');
  if (loader) {
    loader.style.opacity = '0';
    setTimeout(() => { loader.style.display = 'none'; }, 800);
  }
}, 600);

// Bucle de Animación
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.1);
  const time = clock.getElapsedTime();

  // Actualizar rotación de cámara con vector UP constante
  camera.up.set(0, 1, 0);
  const cosP = Math.cos(pitch);
  const forward = new THREE.Vector3(-Math.sin(yaw) * cosP, Math.sin(pitch), -Math.cos(yaw) * cosP).normalize();
  const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw)).normalize();
  const up = new THREE.Vector3(0, 1, 0);

  // Movimiento
  const currentSpeed = (keys['ShiftLeft'] || keys['ShiftRight'] ? speed * runMultiplier : speed) * delta;
  const moveDir = new THREE.Vector3();

  if (keys['KeyW'] || keys['ArrowUp']) moveDir.add(isFlyMode ? forward : new THREE.Vector3(forward.x, 0, forward.z).normalize());
  if (keys['KeyS'] || keys['ArrowDown']) moveDir.sub(isFlyMode ? forward : new THREE.Vector3(forward.x, 0, forward.z).normalize());
  if (keys['KeyD'] || keys['ArrowRight']) moveDir.add(right);
  if (keys['KeyA'] || keys['ArrowLeft']) moveDir.sub(right);
  if (isFlyMode) {
    if (keys['Space']) moveDir.add(up);
    if (keys['KeyC']) moveDir.sub(up);
  }

  if (moveDir.lengthSq() > 0) {
    moveDir.normalize();
    camera.position.addScaledVector(moveDir, currentSpeed);
  }

  // Límite de altura mínimo sobre el suelo en modo peatón
  if (!isFlyMode) {
    // Si estamos sobre el puente (X entre -6 y +6, Z entre -105 y 105), la altura es deckY (6m) + 1.8m
    const onBridge = Math.abs(camera.position.x) < 5.5 && Math.abs(camera.position.z) < 105;
    const groundMinY = onBridge ? 7.8 : 2.0;
    camera.position.y = Math.max(camera.position.y, groundMinY);
  } else {
    camera.position.y = Math.max(camera.position.y, 2.0);
  }

  camera.lookAt(camera.position.clone().add(forward));

  // Actualizar agua del río
  riverSystem.update(time);

  // Actualizar efectos de clima (lluvia patagónica centrada en la cámara)
  weatherEffects.update(delta, camera.position);

  // Actualizar audio ambiental posicional (volumen del río según proximidad)
  audioManager.updatePosition(camera.position);

  // Actualizar minimapa
  if (minimap) {
    minimap.draw(camera.position.x, camera.position.z, yaw);
  }

  // HUD
  if (coordsEl) {
    coordsEl.textContent = `X: ${Math.round(camera.position.x)} m | Z: ${Math.round(camera.position.z)} m | Y: ${Math.round(camera.position.y)} m`;
  }

  // FPS
  frameCount++;
  const now = performance.now();
  if (now - lastFpsTime >= 1000) {
    if (fpsEl) fpsEl.textContent = `${frameCount} FPS`;
    frameCount = 0;
    lastFpsTime = now;
  }

  // Renderizado a través del pipeline cinematográfico de Post-Procesado (o fallback a renderer)
  if (postProcessing && postProcessing.render) {
    postProcessing.render();
  } else {
    renderer.render(scene, camera);
  }
}

animate();

// Resize con ajuste de cámara y buffers de post-procesado
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  if (postProcessing && postProcessing.resize) {
    postProcessing.resize(window.innerWidth, window.innerHeight);
  }
});
