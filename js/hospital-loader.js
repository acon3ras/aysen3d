import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Lista global de colisionadores hospitalarios para el sistema de físicas/raycasting
window.HOSPITAL_COLLIDERS = window.HOSPITAL_COLLIDERS || [];

/**
 * Inicializa el cargador de modelos GLTF/GLB para el Hospital de Puerto Aysén
 * @param {THREE.Scene} scene - Escena principal
 * @param {THREE.Group} hospitalGroup - Grupo del hospital donde se integrará el modelo
 */
export function setupHospitalGLBLoader(scene, hospitalGroup) {
  const loader = new GLTFLoader();

  console.log('[HospitalLoader] Sistema de carga GLB/GLTF arquitectónico inicializado.');

  // Materiales PBR optimizados para arquitectura hospitalaria
  const pbrMaterials = {
    wall: new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.85,
      metalness: 0.05,
      name: 'PBR_Hospital_Wall'
    }),
    floorClinical: new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.25,
      metalness: 0.1,
      name: 'PBR_Hospital_Floor_Clinical'
    }),
    floorWood: new THREE.MeshStandardMaterial({
      color: 0xb45309,
      roughness: 0.45,
      metalness: 0.05,
      name: 'PBR_Hospital_Floor_Wood'
    }),
    glass: new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.3,
      roughness: 0.05,
      metalness: 0.05,
      transmission: 0.92,
      thickness: 0.08,
      name: 'PBR_Hospital_Glass'
    }),
    metal: new THREE.MeshStandardMaterial({
      color: 0xd4d4d8,
      metalness: 0.9,
      roughness: 0.2,
      name: 'PBR_Hospital_StainlessSteel'
    })
  };

  /**
   * Procesa un modelo GLTF/GLB cargado asignando PBR, sombras y colisionadores
   */
  function processLoadedModel(gltf, modelName = 'Modelo Hospital') {
    const root = gltf.scene || gltf.scenes[0];
    root.name = `GLB_${modelName}`;

    console.log(`[HospitalLoader] Procesando ${modelName}...`);

    root.traverse((node) => {
      if (node.isMesh) {
        // 1. Sombras dinámicas reales
        node.castShadow = true;
        node.receiveShadow = true;

        // 2. Detección y aplicación de materiales PBR según nomenclatura
        const matName = (node.material && node.material.name ? node.material.name.toLowerCase() : '') + ' ' + (node.name ? node.name.toLowerCase() : '');

        if (matName.includes('vidrio') || matName.includes('glass') || matName.includes('cristal') || matName.includes('ventana')) {
          node.material = pbrMaterials.glass;
        } else if (matName.includes('piso') || matName.includes('floor') || matName.includes('suelo')) {
          if (matName.includes('madera') || matName.includes('wood')) {
            node.material = pbrMaterials.floorWood;
          } else {
            node.material = pbrMaterials.floorClinical;
          }
        } else if (matName.includes('muro') || matName.includes('wall') || matName.includes('pared') || matName.includes('tabique')) {
          node.material = pbrMaterials.wall;
          // Agregar a colisionadores para evitar atravesar paredes
          window.HOSPITAL_COLLIDERS.push(node);
        } else if (matName.includes('metal') || matName.includes('acero') || matName.includes('inox')) {
          node.material = pbrMaterials.metal;
        }

        // Si es un objeto colisionable por nombre genérico
        if (matName.includes('col') || matName.includes('door') || matName.includes('puerta') || matName.includes('wall')) {
          if (!window.HOSPITAL_COLLIDERS.includes(node)) {
            window.HOSPITAL_COLLIDERS.push(node);
          }
        }
      }
    });

    hospitalGroup.add(root);
    console.log(`[HospitalLoader] ${modelName} integrado con éxito. Colisionadores activos: ${window.HOSPITAL_COLLIDERS.length}`);
  }

  // Lista de archivos GLB a buscar automáticamente
  const candidateModels = [
    { url: './models/hospital/hospital.glb', name: 'Hospital General Completo' },
    { url: './models/hospital/subterraneo.glb', name: 'Piso Subterráneo (-1)' },
    { url: './models/hospital/piso1.glb', name: 'Primer Piso' },
    { url: './models/hospital/piso2.glb', name: 'Segundo Piso' },
    { url: './models/hospital/piso3.glb', name: 'Tercer Piso' }
  ];

  candidateModels.forEach((candidate) => {
    fetch(candidate.url, { method: 'HEAD' })
      .then((res) => {
        if (res.ok) {
          console.log(`[HospitalLoader] Archivo detectado: ${candidate.url}. Iniciando carga...`);
          loader.load(
            candidate.url,
            (gltf) => processLoadedModel(gltf, candidate.name),
            (xhr) => {
              if (xhr.lengthComputable) {
                const percent = Math.round((xhr.loaded / xhr.total) * 100);
                console.log(`[HospitalLoader] Cargando ${candidate.name}: ${percent}%`);
              }
            },
            (err) => {
              console.warn(`[HospitalLoader] No se pudo cargar ${candidate.url}:`, err);
            }
          );
        }
      })
      .catch(() => {
        // Archivo no existe aún, se mantiene el interior base
      });
  });

  // Soporte de Drag & Drop para que el usuario arrastre un archivo .glb directo a la ventana
  window.addEventListener('dragover', (e) => {
    e.preventDefault();
  });

  window.addEventListener('drop', (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.name.toLowerCase().endsWith('.glb') || file.name.toLowerCase().endsWith('.gltf')) {
        console.log('[HospitalLoader] Archivo GLB arrastrado por el usuario:', file.name);
        const reader = new FileReader();
        reader.onload = function(evt) {
          loader.parse(
            evt.target.result,
            '',
            (gltf) => {
              processLoadedModel(gltf, file.name);
              alert(`¡Modelo 3D "${file.name}" cargado exitosamente en el Hospital de Puerto Aysén!`);
            },
            (err) => {
              console.error('[HospitalLoader] Error parseando GLB arrastrado:', err);
              alert('Error al procesar el archivo GLB. Verifica que sea un formato glTF 2.0 válido.');
            }
          );
        };
        reader.readAsArrayBuffer(file);
      }
    }
  });

  // Función pública en window para cargar por código
  window.loadHospitalGLB = function(urlPath) {
    loader.load(
      urlPath,
      (gltf) => processLoadedModel(gltf, urlPath),
      undefined,
      (err) => console.error('[HospitalLoader] Error cargando URL GLB:', err)
    );
  };
}
