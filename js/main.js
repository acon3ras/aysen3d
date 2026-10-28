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
import { createVehicleController } from './vehicle-controller.js';

// Configuración del motor y renderizador
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

// Controlador del Vehículo (Drive Mode en 3ª Persona)
const vehicle = createVehicleController(scene, camera);

// Presets de Clima y Atmósfera Patagónica
const weatherPresets = {
  sol: {
    name: 'Sol Andino',
    icon: '☀️',
    fogColor: 0xbae6fd,
    fogDensity: 0.00045,
    skyColor: 0x0284c7,
    sunColor: 0xffedd5,
    sunIntensity: 1.8,
    sunPos: [300, 600, 200],
    ambient: 0.65,
    isRain: false
  },
  niebla: {
    name: 'Niebla Patagónica',
    icon: '🌫️',
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
    icon: '🌧️',
    fogColor: 0x475569,
    fogDensity: 0.0024,
    skyColor: 0x334155,
    sunColor: 0x94a3b8,
    sunIntensity: 0.75,
    sunPos: [100, 350, 100],
    ambient: 0.65,
    isRain: true
  },
  dorado: {
    name: 'Atardecer Dorado',
    icon: '🌅',
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
    icon: '🌙',
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

// Referencias a mallas con materiales dinámicos
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

  // Actualizar etiqueta del botón superior
  const weatherIconEl = document.getElementById('weather-icon');
  const weatherLabelEl = document.getElementById('weather-label');
  if (weatherIconEl) weatherIconEl.textContent = p.icon;
  if (weatherLabelEl) weatherLabelEl.textContent = p.name;

  document.querySelectorAll('#weather-dropdown-menu .menu-item').forEach((item) => {
    item.classList.toggle('active', item.dataset.weather === presetKey);
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

// Aplicar preset inicial
applyWeather('sol');

const foliageMesh = createPatagonianFoliage(AYSEN_GEO);
scene.add(foliageMesh);

const furnitureMesh = createUrbanFurniture(AYSEN_GEO);
scene.add(furnitureMesh);

const streetDetailsMesh = createStreetDetails(AYSEN_GEO);
scene.add(streetDetailsMesh);

const landmarksMesh = createLandmarks(AYSEN_GEO);
scene.add(landmarksMesh);

// Minimapa 2D
const minimap = createMinimap('minimap-canvas', AYSEN_GEO);

// Miradores peatonales y vehiculares calibrados
const SPAWN_PRESETS = {
  puente: { pos: [0, 7.8, 35], lookAt: [0, 8.0, 100], yaw: Math.PI, label: 'Puente Presidente Ibáñez' },
  plaza: { pos: [-1107, 0.4, 236], lookAt: [-1107, 1.5, 219], yaw: 0, label: 'Plaza de Armas' },
  muni: { pos: [-1113.7, 0.4, 216], lookAt: [-1113.7, 4.5, 187.1], yaw: 0, label: 'Ilustre Municipalidad' },
  hospital: { pos: [15.0, 0.4, 355], lookAt: [15.0, 5.5, 420], yaw: 0, label: 'Hospital de Puerto Aysén' },
  comisaria: { pos: [-1005, 0.4, 172], lookAt: [-1005.4, 4.5, 149.4], yaw: 0, label: '2ª Comisaría (Tierras y Colonización)' },
  costanera: { pos: [-480, 0.4, 122], lookAt: [-480, 2.0, 50], yaw: -Math.PI / 2, label: 'Costanera Río Aysén' },
  ribera_norte: { pos: [30, 0.4, -170], lookAt: [0, 7.5, 0], yaw: 0, label: 'Ribera Norte' }
};

// =========================================================================
// SISTEMA DE MODOS DE JUEGO (1: Walk | 2: Drive | 3: Cycle | 4: Fly)
// =========================================================================
let currentMode = 'drive'; // Por defecto inicia en Conducción (como Slop New York)
const keys = {};

const modeLabels = {
  walk: 'PASEO PEATONAL',
  drive: 'CAMIONETA PATAGÓNICA 4X4',
  cycle: 'BICICLETA AUSTRAL',
  fly: 'DRON / VUELO LIBRE'
};

const modeHints = {
  walk: '<kbd>W</kbd><kbd>S</kbd> Caminar &nbsp;•&nbsp; <kbd>A</kbd><kbd>D</kbd> Girar &nbsp;•&nbsp; <kbd>Shift</kbd> Correr &nbsp;•&nbsp; Clic para Mirar',
  drive: '<kbd>W</kbd><kbd>S</kbd> Acelerar / Reversa &nbsp;•&nbsp; <kbd>A</kbd><kbd>D</kbd> Girar &nbsp;•&nbsp; <kbd>Espacio</kbd> Freno &nbsp;•&nbsp; <kbd>B</kbd> Bocina',
  cycle: '<kbd>W</kbd><kbd>S</kbd> Pedalear &nbsp;•&nbsp; <kbd>A</kbd><kbd>D</kbd> Manubrio &nbsp;•&nbsp; <kbd>Espacio</kbd> Freno',
  fly: '<kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> Desplazar &nbsp;•&nbsp; <kbd>Espacio</kbd>/<kbd>C</kbd> Subir/Bajar &nbsp;•&nbsp; <kbd>Shift</kbd> Turbo'
};

function setGameMode(mode) {
  currentMode = mode;

  // Actualizar botones de modo
  document.querySelectorAll('#mode-selector-pill .mode-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });

  // Actualizar etiqueta del vehículo / modo
  const vehLabel = document.getElementById('vehicle-name-label');
  if (vehLabel) vehLabel.textContent = modeLabels[mode] || 'SIMULADOR 3D';

  // Actualizar hints
  const hintEl = document.getElementById('hint-text');
  if (hintEl) hintEl.innerHTML = modeHints[mode] || '';

  // Activar o desactivar vehículo
  const isVehicleMode = (mode === 'drive' || mode === 'cycle');
  vehicle.setActive(isVehicleMode);

  // Crosshair solo para caminata
  const crosshair = document.getElementById('crosshair');
  if (crosshair) crosshair.style.opacity = (mode === 'walk' && isPointerLocked) ? '1' : '0';
}

// Inicializar en Drive Mode
setGameMode('drive');

// =========================================================================
// CÁMARA LIBRE / PEATONAL (Walk & Fly)
// =========================================================================
let yaw = Math.PI;
let pitch = 0;
const walkSpeed = 6.0; // m/s
const runMultiplier = 2.4;
const flySpeed = 30.0;
let isPointerLocked = false;

container.addEventListener('click', () => {
  if (currentMode === 'walk' || currentMode === 'fly') {
    container.requestPointerLock();
  }
});

document.addEventListener('pointerlockchange', () => {
  isPointerLocked = (document.pointerLockElement === container);
  const crosshair = document.getElementById('crosshair');
  if (crosshair) crosshair.style.opacity = (isPointerLocked && currentMode === 'walk') ? '1' : '0';
});

document.addEventListener('mousemove', (e) => {
  if (!isPointerLocked) return;
  const sens = 0.0022;
  yaw -= e.movementX * sens;
  pitch -= e.movementY * sens;
  pitch = Math.max(-Math.PI / 2.1, Math.min(Math.PI / 2.1, pitch));
});

// Teletransporte
window.teleportTo = function(id) {
  const spawn = SPAWN_PRESETS[id];
  if (!spawn) return;

  if (currentMode === 'drive' || currentMode === 'cycle') {
    vehicle.teleport(spawn.pos[0], spawn.pos[2], spawn.yaw !== undefined ? spawn.yaw : Math.PI);
  } else {
    camera.position.set(spawn.pos[0], spawn.pos[1] + 1.8, spawn.pos[2]);
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

// =========================================================================
// EVENTOS DE TECLADO Y ATAJOS (1, 2, 3, 4, M, V, B)
// =========================================================================
window.addEventListener('keydown', (e) => {
  keys[e.code] = true;

  // Atajos de modos de juego
  if (e.code === 'Digit1') setGameMode('walk');
  if (e.code === 'Digit2') setGameMode('drive');
  if (e.code === 'Digit3') setGameMode('cycle');
  if (e.code === 'Digit4') setGameMode('fly');

  // Alternar minimapa
  if (e.code === 'KeyM') toggleMinimap();

  // Cambiar modo con V
  if (e.code === 'KeyV') {
    const nextModes = { drive: 'walk', walk: 'fly', fly: 'cycle', cycle: 'drive' };
    setGameMode(nextModes[currentMode] || 'drive');
  }

  // Bocina con B
  if (e.code === 'KeyB') {
    console.log('[Vehicle] Beep! Bocina patagónica activada.');
  }
});

window.addEventListener('keyup', (e) => {
  keys[e.code] = false;
});

// Botones de Selector de Modo (HUD Inferior)
document.querySelectorAll('#mode-selector-pill .mode-btn').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    setGameMode(btn.dataset.mode);
  });
});

// Botón de cámara (V)
const camToggleBtn = document.getElementById('cam-toggle-btn');
if (camToggleBtn) {
  camToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const nextModes = { drive: 'walk', walk: 'fly', fly: 'cycle', cycle: 'drive' };
    setGameMode(nextModes[currentMode] || 'drive');
  });
}

// =========================================================================
// DROPDOWNS DE LA BARRA SUPERIOR (Clima y Teleport)
// =========================================================================
const weatherDropdownBtn = document.getElementById('weather-dropdown-btn');
const weatherMenu = document.getElementById('weather-dropdown-menu');

const teleportDropdownBtn = document.getElementById('teleport-dropdown-btn');
const teleportMenu = document.getElementById('teleport-dropdown-menu');

// Alternar dropdown de Clima
if (weatherDropdownBtn && weatherMenu) {
  weatherDropdownBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    weatherMenu.classList.toggle('hidden');
    if (teleportMenu) teleportMenu.classList.add('hidden');
  });
}

// Alternar dropdown de Teleport
if (teleportDropdownBtn && teleportMenu) {
  teleportDropdownBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    teleportMenu.classList.toggle('hidden');
    if (weatherMenu) weatherMenu.classList.add('hidden');
  });
}

// Cerrar menús al hacer clic afuera
document.addEventListener('click', () => {
  if (weatherMenu) weatherMenu.classList.add('hidden');
  if (teleportMenu) teleportMenu.classList.add('hidden');
});

// Acciones de Clima
document.querySelectorAll('#weather-dropdown-menu .menu-item').forEach((item) => {
  item.addEventListener('click', (e) => {
    e.stopPropagation();
    applyWeather(item.dataset.weather);
    if (weatherMenu) weatherMenu.classList.add('hidden');
  });
});

// Acciones de Teleport
document.querySelectorAll('#teleport-dropdown-menu .menu-item').forEach((item) => {
  item.addEventListener('click', (e) => {
    e.stopPropagation();
    window.teleportTo(item.dataset.spawn);
    if (teleportMenu) teleportMenu.classList.add('hidden');
  });
});

// Botón Minimapa
const minimapToggleBtn = document.getElementById('minimap-toggle-btn');
const minimapContainer = document.getElementById('minimap-container');
let minimapVisible = true;

function toggleMinimap() {
  minimapVisible = !minimapVisible;
  if (minimapContainer) minimapContainer.classList.toggle('hidden', !minimapVisible);
  if (minimapToggleBtn) minimapToggleBtn.classList.toggle('active', minimapVisible);
}

if (minimapToggleBtn) {
  minimapToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMinimap();
  });
}

// Botón de Audio
const audioToggleBtn = document.getElementById('audio-toggle-btn');
if (audioToggleBtn) {
  audioToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isPlaying = audioManager.toggle();
    audioToggleBtn.textContent = isPlaying ? '🔊 Audio' : '🔇 Audio';
    audioToggleBtn.classList.toggle('active', isPlaying);
  });
}

// =========================================================================
// DETECCIÓN DINÁMICA DE CALLES CHILENAS (Placas Verdes)
// =========================================================================
const currentStreetPlate = document.getElementById('current-street-plate');
const crossStreetPlate = document.getElementById('cross-street-plate');
let lastStreetCheck = 0;

function updateStreetNames(playerX, playerZ) {
  const roads = AYSEN_GEO.roads || [];
  let closestDist = Infinity;
  let closestName = 'SARGENTO ALDEA';
  let secondClosestName = 'ESMERALDA';

  for (let i = 0; i < roads.length; i++) {
    const road = roads[i];
    if (!road.name || road.name.length < 3) continue;

    const pts = road.pts;
    for (let p = 0; p < pts.length; p += 2) {
      const dist = Math.hypot(pts[p] - playerX, pts[p + 1] - playerZ);
      if (dist < closestDist) {
        if (road.name.toUpperCase() !== closestName) {
          secondClosestName = closestName;
        }
        closestDist = dist;
        closestName = road.name.toUpperCase();
      }
    }
  }

  if (currentStreetPlate && closestDist < 120) {
    currentStreetPlate.textContent = closestName;
    if (crossStreetPlate) {
      crossStreetPlate.textContent = secondClosestName !== closestName ? secondClosestName : 'P. AYSÉN';
    }
  }
}

// =========================================================================
// BUCLE PRINCIPAL DE ANIMACIÓN Y TELEMETRÍA
// =========================================================================
const speedNumEl = document.getElementById('speed-display-number');
const speedGaugeFill = document.getElementById('speed-gauge-fill');
const fpsEl = document.getElementById('fps-display');
let frameCount = 0;
let lastFpsTime = performance.now();

// Ocultar pantalla de carga
setTimeout(() => {
  const loader = document.getElementById('loader-overlay');
  if (loader) {
    loader.style.opacity = '0';
    setTimeout(() => { loader.style.display = 'none'; }, 800);
  }
}, 600);

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.1);
  const time = clock.getElapsedTime();

  let playerX = 0;
  let playerZ = 0;
  let playerYaw = 0;

  // 1. Lógica según el modo activo
  if (currentMode === 'drive' || currentMode === 'cycle') {
    vehicle.update(delta, keys);

    const carPos = vehicle.getPosition();
    playerX = carPos.x;
    playerZ = carPos.z;
    playerYaw = vehicle.getYaw();

    // Actualizar velocímetro en KM/H
    const kmh = vehicle.getSpeedKmh();
    if (speedNumEl) speedNumEl.textContent = String(kmh);
    if (speedGaugeFill) speedGaugeFill.style.width = (vehicle.getSpeedFraction() * 100) + '%';
  } else {
    // Modo Caminata o Dron (Vuelo libre)
    camera.up.set(0, 1, 0);
    const cosP = Math.cos(pitch);
    const forward = new THREE.Vector3(-Math.sin(yaw) * cosP, Math.sin(pitch), -Math.cos(yaw) * cosP).normalize();
    const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw)).normalize();
    const up = new THREE.Vector3(0, 1, 0);

    const moveSpeed = (currentMode === 'fly' ? flySpeed : walkSpeed) * (keys['ShiftLeft'] || keys['ShiftRight'] ? runMultiplier : 1.0) * delta;
    const moveDir = new THREE.Vector3();

    if (keys['KeyW'] || keys['ArrowUp']) moveDir.add(currentMode === 'fly' ? forward : new THREE.Vector3(forward.x, 0, forward.z).normalize());
    if (keys['KeyS'] || keys['ArrowDown']) moveDir.sub(currentMode === 'fly' ? forward : new THREE.Vector3(forward.x, 0, forward.z).normalize());
    if (keys['KeyD'] || keys['ArrowRight']) moveDir.add(right);
    if (keys['KeyA'] || keys['ArrowLeft']) moveDir.sub(right);
    if (currentMode === 'fly') {
      if (keys['Space']) moveDir.add(up);
      if (keys['KeyC']) moveDir.sub(up);
    }

    if (moveDir.lengthSq() > 0) {
      moveDir.normalize();
      camera.position.addScaledVector(moveDir, moveSpeed);
    }

    if (currentMode === 'walk') {
      const onBridge = Math.abs(camera.position.x) < 5.5 && Math.abs(camera.position.z) < 115;
      camera.position.y = onBridge ? 7.8 : 2.0;
    } else {
      camera.position.y = Math.max(camera.position.y, 2.0);
    }

    camera.lookAt(camera.position.clone().add(forward));

    playerX = camera.position.x;
    playerZ = camera.position.z;
    playerYaw = yaw;

    // Velocímetro peatonal / vuelo
    const simSpeed = moveDir.lengthSq() > 0 ? (currentMode === 'fly' ? 55 : 5) : 0;
    if (speedNumEl) speedNumEl.textContent = String(simSpeed);
    if (speedGaugeFill) speedGaugeFill.style.width = (simSpeed / 60 * 100) + '%';
  }

  // 2. Actualizar nombre de calles cada 0.6s
  if (time - lastStreetCheck > 0.6) {
    updateStreetNames(playerX, playerZ);
    lastStreetCheck = time;
  }

  // 3. Sistemas ambientales
  riverSystem.update(time);
  weatherEffects.update(delta, camera.position);
  audioManager.updatePosition(camera.position);

  // 4. Minimapa
  if (minimap && minimapVisible) {
    minimap.draw(playerX, playerZ, playerYaw);
  }

  // 5. FPS Counter
  frameCount++;
  const now = performance.now();
  if (now - lastFpsTime >= 1000) {
    if (fpsEl) fpsEl.textContent = String(frameCount);
    frameCount = 0;
    lastFpsTime = now;
  }

  // 6. Post-Procesado Cinematográfico
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
