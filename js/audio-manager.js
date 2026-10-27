/**
 * Gestor de Audio Ambiental Patagónico (Web Audio API Sintetizado)
 * 100% Procedural — No requiere archivos MP3 externos.
 * - Rumor del Río Aysén (varía según proximidad al cauce)
 * - Viento Austral con ráfagas suaves
 * - Sonido de lluvia sobre asfalto y techos de zinc
 */
export function createAudioManager() {
  let ctx = null;
  let isMuted = true;
  let riverGain = null;
  let windGain = null;
  let rainGain = null;

  function initAudio() {
    if (ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      ctx = new AudioCtx();

      // 1. GENERADOR DE RUIDO DEL RÍO AYSÉN (BROWN NOISE)
      const bufferSize = ctx.sampleRate * 3;
      const riverBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const riverData = riverBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        riverData[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = riverData[i];
        riverData[i] *= 3.5; // Ganancia
      }

      const riverSrc = ctx.createBufferSource();
      riverSrc.buffer = riverBuffer;
      riverSrc.loop = true;

      const riverFilter = ctx.createBiquadFilter();
      riverFilter.type = 'lowpass';
      riverFilter.frequency.value = 420;

      riverGain = ctx.createGain();
      riverGain.gain.value = 0.25;

      riverSrc.connect(riverFilter);
      riverFilter.connect(riverGain);
      riverGain.connect(ctx.destination);
      riverSrc.start();

      // 2. GENERADOR DE VIENTO AUSTRAL (PINK NOISE MODULADO)
      const windBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const windData = windBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        windData[i] = (b0 + b1 + b2) * 0.12;
      }

      const windSrc = ctx.createBufferSource();
      windSrc.buffer = windBuffer;
      windSrc.loop = true;

      const windFilter = ctx.createBiquadFilter();
      windFilter.type = 'bandpass';
      windFilter.frequency.value = 520;
      windFilter.Q.value = 1.2;

      windGain = ctx.createGain();
      windGain.gain.value = 0.15;

      windSrc.connect(windFilter);
      windFilter.connect(windGain);
      windGain.connect(ctx.destination);
      windSrc.start();

      // 3. GENERADOR DE LLUVIA
      const rainBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const rainData = rainBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        rainData[i] = (Math.random() * 2 - 1) * 0.18;
      }

      const rainSrc = ctx.createBufferSource();
      rainSrc.buffer = rainBuffer;
      rainSrc.loop = true;

      const rainFilter = ctx.createBiquadFilter();
      rainFilter.type = 'highpass';
      rainFilter.frequency.value = 1200;

      rainGain = ctx.createGain();
      rainGain.gain.value = 0.0;

      rainSrc.connect(rainFilter);
      rainFilter.connect(rainGain);
      rainGain.connect(ctx.destination);
      rainSrc.start();

      console.log('[AudioManager] Motor de audio ambiental inicializado exitosamente.');
    } catch (e) {
      console.warn('[AudioManager] Web Audio no disponible:', e);
    }
  }

  return {
    toggle: () => {
      initAudio();
      if (!ctx) return false;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      isMuted = !isMuted;
      if (riverGain) riverGain.gain.value = isMuted ? 0 : 0.25;
      if (windGain) windGain.gain.value = isMuted ? 0 : 0.15;
      return !isMuted;
    },
    setRainAudio: (enabled) => {
      if (rainGain && !isMuted) {
        rainGain.gain.setTargetAtTime(enabled ? 0.22 : 0.0, ctx.currentTime, 0.5);
      }
    },
    updatePosition: (cameraPos) => {
      if (!ctx || isMuted || !riverGain) return;
      // El Río Aysén está en Z=0. A mayor cercanía a Z=0, mayor volumen del agua
      const distToRiver = Math.abs(cameraPos.z);
      const vol = Math.max(0.04, Math.min(0.35, 1.0 - (distToRiver / 600)));
      riverGain.gain.setTargetAtTime(vol, ctx.currentTime, 0.2);
    }
  };
}
