/**
 * Minimapa 2D en tiempo real para Puerto Aysén
 * Muestra el curso del Río Aysén, el Puente Ibáñez, las calles principales
 * y la posición/orientación actual del usuario.
 */
export function createMinimap(canvasId, geoData) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;
  const ctx = canvas.getContext('2d');

  canvas.width = 170;
  canvas.height = 170;

  // Escala: centro en el Puente Ibáñez (0, 0), cubriendo ~2000m x 2000m
  const scale = canvas.width / 2400; // píxeles por metro
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  function toMap(x, z) {
    return [cx + x * scale, cy + z * scale];
  }

  // Pre-render de calles y río a un canvas estático para máximo rendimiento
  const bgCanvas = document.createElement('canvas');
  bgCanvas.width = canvas.width;
  bgCanvas.height = canvas.height;
  const bgCtx = bgCanvas.getContext('2d');

  // Fondo
  bgCtx.fillStyle = '#0f172a';
  bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);

  // Río Aysén (banda azul turquesa)
  bgCtx.strokeStyle = '#1e3a8a';
  bgCtx.lineWidth = 14 * scale * 12;
  bgCtx.beginPath();
  bgCtx.moveTo(0, cy);
  bgCtx.bezierCurveTo(cx * 0.5, cy - 8, cx * 1.5, cy + 8, canvas.width, cy);
  bgCtx.stroke();

  // Calles en gris
  bgCtx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  bgCtx.lineWidth = 1;

  if (geoData.roads) {
    geoData.roads.forEach((road) => {
      const pts = road.pts;
      if (pts.length < 4) return;
      bgCtx.beginPath();
      const [x0, z0] = toMap(pts[0], pts[1]);
      bgCtx.moveTo(x0, z0);
      for (let i = 2; i < pts.length; i += 2) {
        const [x, z] = toMap(pts[i], pts[i + 1]);
        bgCtx.lineTo(x, z);
      }
      bgCtx.stroke();
    });
  }

  // Puente Presidente Ibáñez (marcador rojo destacado en el centro)
  bgCtx.strokeStyle = '#e11d48';
  bgCtx.lineWidth = 3.5;
  const [b1x, b1z] = toMap(0, -95);
  const [b2x, b2z] = toMap(0, 95);
  bgCtx.beginPath();
  bgCtx.moveTo(b1x, b1z);
  bgCtx.lineTo(b2x, b2z);
  bgCtx.stroke();

  // Plaza de Armas
  const [px, pz] = toMap(-1107, 219);
  bgCtx.fillStyle = '#10b981';
  bgCtx.beginPath();
  bgCtx.arc(px, pz, 4, 0, Math.PI * 2);
  bgCtx.fill();

  return {
    draw: (playerX, playerZ, playerAngle) => {
      ctx.drawImage(bgCanvas, 0, 0);

      // Posición del jugador
      const [mx, mz] = toMap(playerX, playerZ);

      // Icono del jugador (flecha de orientación)
      ctx.save();
      ctx.translate(mx, mz);
      ctx.rotate(-playerAngle);

      // Halo
      ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.fill();

      // Flecha
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.lineTo(4, 5);
      ctx.lineTo(0, 3);
      ctx.lineTo(-4, 5);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
  };
}
