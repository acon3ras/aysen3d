import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { SSAOPass } from 'three/addons/postprocessing/SSAOPass.js';

/**
 * Gestor del Pipeline de Post-Procesado Cinematográfico
 * Cadena: RenderPass -> SSAOPass (Oclusión Ambiental) -> UnrealBloomPass (Resplandor cálido) -> OutputPass (ACES Filmic)
 */
export function setupPostProcessing(renderer, scene, camera) {
  const composer = new EffectComposer(renderer);

  // 1. Pase de Renderizado Base
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  // 2. SSAO (Screen Space Ambient Occlusion) para profundidad en esquinas y aleros
  // Renderizado a 1.5x de reducción para suavizar el gradiente y mantener 60 FPS constantes
  let ssaoPass = null;
  try {
    const ssaoW = Math.max(320, Math.floor(window.innerWidth / 1.5));
    const ssaoH = Math.max(240, Math.floor(window.innerHeight / 1.5));
    ssaoPass = new SSAOPass(scene, camera, ssaoW, ssaoH);
    ssaoPass.kernelRadius = 8;
    ssaoPass.minDistance = 0.002;
    ssaoPass.maxDistance = 0.15;
    ssaoPass.output = SSAOPass.OUTPUT.Default;
    composer.addPass(ssaoPass);
  } catch (err) {
    console.warn('[PostProcessing] SSAOPass no soportado en este dispositivo, continuando sin SSAO:', err);
  }

  // 3. UnrealBloomPass: brillo sutil en farolas, luminarias del puente y reflejos
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.35, // strength (sutil, no cegador)
    0.45, // radius
    0.82  // threshold (solo brillan elementos emisivos y reflejos intensos)
  );
  composer.addPass(bloomPass);

  // 4. OutputPass (Aplica mapeo tonal ACES Filmic y codificación sRGB)
  const outputPass = new OutputPass();
  composer.addPass(outputPass);

  return {
    composer,
    bloomPass,
    ssaoPass,
    resize: (width, height) => {
      composer.setSize(width, height);
      if (ssaoPass) {
        const sw = Math.max(320, Math.floor(width / 1.5));
        const sh = Math.max(240, Math.floor(height / 1.5));
        ssaoPass.setSize(sw, sh);
      }
      bloomPass.setSize(width, height);
    },
    render: () => {
      composer.render();
    }
  };
}
