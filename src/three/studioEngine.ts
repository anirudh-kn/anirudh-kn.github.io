import * as THREE from 'three';

/**
 * Detects software WebGL (SwiftShader, llvmpipe, softpipe, WARP) from the GPU renderer string.
 */
export const isSoftwareGl = (() => {
  if (typeof document === 'undefined') return true;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
})();

/**
 * Generates a tileable dark honed basalt & warm travertine architectural museum stone floor texture.
 */
export function createArchitecturalStoneTexture(): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
} {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Deep architectural stone base (#101112)
  ctx.fillStyle = '#101112';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle mineral clouding and honed travertine grain
  for (let i = 0; i < 42; i++) {
    const x = (i * 97) % 512;
    const y = (i * 151) % 512;
    const r = 45 + (i % 5) * 28;
    const grad = ctx.createRadialGradient(x, y, 4, x, y, r);
    grad.addColorStop(0, i % 2 === 0 ? 'rgba(29, 30, 32, 0.35)' : 'rgba(23, 24, 25, 0.35)');
    grad.addColorStop(1, 'rgba(16, 17, 18, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Fine mineral veining
  ctx.strokeStyle = 'rgba(185, 160, 120, 0.05)';
  ctx.lineWidth = 1.1;
  for (let i = 0; i < 12; i++) {
    ctx.beginPath();
    const startY = (i * 43) % 512;
    ctx.moveTo(0, startY);
    ctx.bezierCurveTo(160, startY + 28, 340, startY - 24, 512, startY + 12);
    ctx.stroke();
  }

  // Architectural stone slab joints with subtle champagne inlay hairline
  ctx.strokeStyle = 'rgba(10, 11, 12, 0.8)';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, 254, 254);
  ctx.strokeRect(257, 1, 254, 254);
  ctx.strokeRect(1, 257, 254, 254);
  ctx.strokeRect(257, 257, 254, 254);

  ctx.strokeStyle = 'rgba(185, 160, 120, 0.09)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 256);
  ctx.lineTo(512, 256);
  ctx.moveTo(256, 0);
  ctx.lineTo(256, 512);
  ctx.stroke();

  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(4, 4);

  // Grayscale bump map for stone joints & pore micro-relief
  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = 256;
  bumpCanvas.height = 256;
  const bctx = bumpCanvas.getContext('2d')!;
  bctx.fillStyle = '#888888';
  bctx.fillRect(0, 0, 256, 256);
  bctx.strokeStyle = '#303030';
  bctx.lineWidth = 2;
  bctx.strokeRect(1, 1, 126, 126);
  bctx.strokeRect(129, 1, 126, 126);
  bctx.strokeRect(1, 129, 126, 126);
  bctx.strokeRect(129, 129, 126, 126);

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(4, 4);

  return { map, bumpMap };
}

/**
 * Generates a warm dark American walnut wood grain texture for studio easels, frames, and palette boards.
 */
export function createWalnutWoodTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const baseGrad = ctx.createLinearGradient(0, 0, 512, 512);
  baseGrad.addColorStop(0, '#261A13');
  baseGrad.addColorStop(0.5, '#1E140E');
  baseGrad.addColorStop(1, '#2A1D15');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, 512, 512);

  // Organic wood grain fibers
  for (let i = 0; i < 90; i++) {
    const y = (i / 90) * 512;
    ctx.strokeStyle =
      i % 3 === 0 ? 'rgba(14, 9, 6, 0.38)' : 'rgba(62, 43, 30, 0.22)';
    ctx.lineWidth = 1 + (i % 3);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(
      170,
      y + Math.sin(i * 0.4) * 14,
      340,
      y - Math.cos(i * 0.4) * 14,
      512,
      y + Math.sin(i * 0.2) * 8,
    );
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Generates a matte architectural Venetian plaster texture for museum gallery walls.
 */
export function createPlasterWallTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#171819';
  ctx.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 36; i++) {
    const x = (i * 83) % 512;
    const y = (i * 137) % 512;
    const r = 60 + (i % 4) * 35;
    const grad = ctx.createRadialGradient(x, y, 8, x, y, r);
    grad.addColorStop(0, i % 2 === 0 ? 'rgba(29, 30, 32, 0.35)' : 'rgba(16, 17, 18, 0.35)');
    grad.addColorStop(1, 'rgba(23, 24, 25, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Subtle architectural reveal lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.lineWidth = 1;
  ctx.strokeRect(16, 16, 480, 480);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Generates a procedural woven linen canvas texture with layered oil glaze and impasto paint strokes,
 * plus a matching bump map for physical bristle and linen relief.
 */
export function createLivingCanvasTexture(): THREE.CanvasTexture {
  const albedoCanvas = document.createElement('canvas');
  albedoCanvas.width = 1024;
  albedoCanvas.height = 640;
  const ctx = albedoCanvas.getContext('2d')!;

  // Warm raw Belgian linen & gessoed ivory center
  ctx.fillStyle = '#E5DEC9';
  ctx.fillRect(0, 0, 1024, 640);

  const gessoGrad = ctx.createRadialGradient(512, 300, 50, 512, 320, 540);
  gessoGrad.addColorStop(0, '#F5F0E4');
  gessoGrad.addColorStop(1, '#E6DFCE');
  ctx.fillStyle = gessoGrad;
  ctx.fillRect(28, 28, 968, 584);

  // Fine woven linen thread cross-hatching
  ctx.strokeStyle = 'rgba(36, 30, 24, 0.045)';
  ctx.lineWidth = 1;
  for (let x = 0; x < 1024; x += 5) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 640);
    ctx.stroke();
  }
  for (let y = 0; y < 640; y += 5) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }

  // Subtle architectural golden-ratio under-drawing (charcoal & gold leaf)
  ctx.strokeStyle = 'rgba(201, 165, 106, 0.45)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(48, 48, 928, 544);

  ctx.strokeStyle = 'rgba(28, 25, 23, 0.12)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(48, 424);
  ctx.lineTo(976, 424);
  ctx.moveTo(380, 48);
  ctx.lineTo(380, 424);
  ctx.moveTo(680, 48);
  ctx.lineTo(680, 424);
  ctx.stroke();

  // Atmospheric oil glaze wash behind the main stroke
  const washGrad = ctx.createRadialGradient(520, 250, 20, 520, 250, 340);
  washGrad.addColorStop(0, 'rgba(185, 160, 120, 0.2)');
  washGrad.addColorStop(0.55, 'rgba(107, 132, 196, 0.08)');
  washGrad.addColorStop(1, 'rgba(241, 238, 231, 0)');
  ctx.fillStyle = washGrad;
  ctx.beginPath();
  ctx.arc(520, 250, 340, 0, Math.PI * 2);
  ctx.fill();

  // Deep charcoal & slate underpainting stroke
  ctx.strokeStyle = '#171819';
  ctx.lineWidth = 72;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(135, 305);
  ctx.bezierCurveTo(330, 145, 610, 385, 885, 205);
  ctx.stroke();

  // Primary rich oil impasto stroke (Muted Slate Cobalt -> Terracotta -> Champagne -> Verdigris)
  const grad1 = ctx.createLinearGradient(120, 210, 900, 280);
  grad1.addColorStop(0, '#5B74B4');
  grad1.addColorStop(0.42, '#C7745C');
  grad1.addColorStop(0.76, '#B9A078');
  grad1.addColorStop(1, '#659B93');

  ctx.strokeStyle = grad1;
  ctx.lineWidth = 52;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(140, 295);
  ctx.bezierCurveTo(340, 155, 620, 380, 890, 215);
  ctx.stroke();

  // Fine bristle ridge highlights inside the impasto stroke
  ctx.strokeStyle = 'rgba(241, 238, 231, 0.42)';
  ctx.lineWidth = 2.5;
  for (let offset = -16; offset <= 16; offset += 8) {
    ctx.beginPath();
    ctx.moveTo(145, 295 + offset);
    ctx.bezierCurveTo(340, 155 + offset, 620, 380 + offset, 885, 215 + offset);
    ctx.stroke();
  }

  // Secondary champagne harmonic data spline
  ctx.strokeStyle = '#B9A078';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(160, 355);
  ctx.bezierCurveTo(395, 235, 615, 415, 875, 275);
  ctx.stroke();

  // Curated data nodes embedded as metallic leaf & oil pigment medallions
  const points = [
    [195, 265, '#F1EEE7', '#171819'],
    [315, 232, '#6B84C4', '#F1EEE7'],
    [455, 268, '#C7745C', '#F1EEE7'],
    [590, 304, '#B9A078', '#171819'],
    [735, 282, '#659B93', '#171819'],
    [850, 228, '#171819', '#B9A078'],
  ] as const;

  for (const [px, py, fillCol, ringCol] of points) {
    ctx.fillStyle = fillCol;
    ctx.beginPath();
    ctx.arc(px, py, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = ringCol;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Museum exhibition plate inscription at base of linen canvas
  ctx.fillStyle = '#171819';
  ctx.font = '600 34px "Sora", -apple-system, sans-serif';
  ctx.fillText('Anirudh K N  —  The Data Atelier', 76, 488);

  ctx.fillStyle = 'rgba(23, 24, 25, 0.68)';
  ctx.font = '500 16px "Manrope", -apple-system, sans-serif';
  ctx.fillText('Data Science · Data Analytics · Machine Learning · Business Intelligence', 76, 528);

  const albedoMap = new THREE.CanvasTexture(albedoCanvas);
  albedoMap.colorSpace = THREE.SRGBColorSpace;
  return albedoMap;
}

/**
 * Generates a grayscale bump map matching the linen weave and thick impasto oil ridges.
 */
export function createCanvasBumpTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 320;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#787878';
  ctx.fillRect(0, 0, 512, 320);

  // Woven linen micro-grid
  ctx.strokeStyle = '#686868';
  ctx.lineWidth = 1;
  for (let x = 0; x < 512; x += 4) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 320);
    ctx.stroke();
  }
  for (let y = 0; y < 320; y += 4) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  // High-relief impasto oil ridge
  ctx.strokeStyle = '#EFEFEF';
  ctx.lineWidth = 32;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(70, 148);
  ctx.bezierCurveTo(170, 78, 310, 190, 445, 108);
  ctx.stroke();

  const bump = new THREE.CanvasTexture(canvas);
  return bump;
}

/**
 * Generates a refined museum cartographic & tectonic Earth texture + topographic bump map for Seismos.
 */
export function createTectonicGlobeTexture(): THREE.CanvasTexture {
  const mapCanvas = document.createElement('canvas');
  mapCanvas.width = 1024;
  mapCanvas.height = 512;
  const mctx = mapCanvas.getContext('2d')!;

  // Deep obsidian bathymetrical ocean base
  const oceanGrad = mctx.createLinearGradient(0, 0, 0, 512);
  oceanGrad.addColorStop(0, '#0B0F17');
  oceanGrad.addColorStop(0.5, '#111824');
  oceanGrad.addColorStop(1, '#0B0F17');
  mctx.fillStyle = oceanGrad;
  mctx.fillRect(0, 0, 1024, 512);

  // Subtle brass cartographic graticule lines
  mctx.strokeStyle = 'rgba(201, 165, 106, 0.16)';
  mctx.lineWidth = 1;
  for (let x = 0; x <= 1024; x += 64) {
    mctx.beginPath();
    mctx.moveTo(x, 0);
    mctx.lineTo(x, 512);
    mctx.stroke();
  }
  for (let y = 0; y <= 512; y += 64) {
    mctx.beginPath();
    mctx.moveTo(0, y);
    mctx.lineTo(1024, y);
    mctx.stroke();
  }

  // Equator & Tropics in warm gold
  mctx.strokeStyle = 'rgba(201, 165, 106, 0.38)';
  mctx.lineWidth = 1.5;
  mctx.beginPath();
  mctx.moveTo(0, 256);
  mctx.lineTo(1024, 256);
  mctx.stroke();

  // Detailed multi-polygon continental silhouettes in warm dark bronze-stone (#252322) with gold coast outlines
  mctx.fillStyle = '#252322';
  mctx.strokeStyle = 'rgba(201, 165, 106, 0.62)';
  mctx.lineWidth = 2;

  const drawContinent = (pts: [number, number][]) => {
    mctx.beginPath();
    mctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) {
      mctx.lineTo(pts[i][0], pts[i][1]);
    }
    mctx.closePath();
    mctx.fill();
    mctx.stroke();
  };

  // North America
  drawContinent([
    [110, 95],
    [235, 85],
    [285, 145],
    [245, 215],
    [195, 235],
    [145, 185],
  ]);
  // South America
  drawContinent([
    [240, 255],
    [325, 275],
    [345, 345],
    [295, 435],
    [255, 395],
  ]);
  // Europe
  drawContinent([
    [455, 95],
    [565, 85],
    [585, 155],
    [515, 175],
    [450, 150],
  ]);
  // Africa
  drawContinent([
    [455, 190],
    [575, 195],
    [615, 275],
    [565, 395],
    [505, 375],
    [450, 265],
  ]);
  // Asia
  drawContinent([
    [585, 90],
    [835, 95],
    [875, 185],
    [795, 255],
    [695, 265],
    [615, 205],
  ]);
  // Australia
  drawContinent([
    [765, 320],
    [875, 315],
    [890, 385],
    [795, 405],
  ]);

  // Tectonic fault boundary lines (Circum-Pacific Ring of Fire & Alpide Belt)
  mctx.strokeStyle = 'rgba(255, 89, 62, 0.72)';
  mctx.lineWidth = 2.5;
  mctx.setLineDash([6, 4]);
  mctx.beginPath();
  mctx.moveTo(760, 390);
  mctx.bezierCurveTo(845, 250, 885, 130, 920, 105);
  mctx.moveTo(115, 120);
  mctx.bezierCurveTo(175, 220, 235, 290, 285, 425);
  mctx.moveTo(520, 175);
  mctx.bezierCurveTo(645, 195, 735, 225, 815, 285);
  mctx.stroke();
  mctx.setLineDash([]);

  const globeTex = new THREE.CanvasTexture(mapCanvas);
  globeTex.colorSpace = THREE.SRGBColorSpace;
  return globeTex;
}

/**
 * Generates an archival museum exhibition plate texture for the About space.
 */
export function createGalleryFrameTexture(
  kicker: string,
  headline: string,
  subline: string,
  accentColor: string,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 640;
  const ctx = canvas.getContext('2d')!;

  // Warm museum conservation mat board (#171819)
  ctx.fillStyle = '#171819';
  ctx.fillRect(0, 0, 512, 640);

  // Inner archival paper mount (#1D1E20)
  ctx.fillStyle = '#1D1E20';
  ctx.fillRect(28, 28, 456, 584);

  // Subtle champagne & pigment bevel rule
  ctx.strokeStyle = 'rgba(185, 160, 120, 0.45)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(28, 28, 456, 584);

  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 1;
  ctx.strokeRect(40, 40, 432, 560);

  // Geometric curatorial plate engraving motif
  ctx.strokeStyle = 'rgba(241, 238, 231, 0.12)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(256, 225, 114, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(256, 225, 76, -Math.PI * 0.25, Math.PI * 0.85);
  ctx.stroke();

  const grad = ctx.createRadialGradient(256, 225, 10, 256, 225, 108);
  grad.addColorStop(0, accentColor);
  grad.addColorStop(1, 'rgba(29, 30, 32, 0)');
  ctx.fillStyle = grad;
  ctx.globalAlpha = 0.28;
  ctx.beginPath();
  ctx.arc(256, 225, 108, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Horizontal divider rule
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(56, 396);
  ctx.lineTo(456, 396);
  ctx.stroke();

  ctx.fillStyle = '#B9A078';
  ctx.font = '500 14px "IBM Plex Mono", monospace';
  ctx.fillText(kicker.toUpperCase(), 56, 436);

  ctx.fillStyle = '#F1EEE7';
  ctx.font = '600 30px "Sora", -apple-system, sans-serif';
  ctx.fillText(headline, 56, 484);

  ctx.fillStyle = '#A5A39D';
  ctx.font = '400 17px "Manrope", -apple-system, sans-serif';
  ctx.fillText(subline, 56, 524);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Generates the curated Archive 03 Personal Philosophy exhibition plate texture
 * for the existing right-side rear-wall display in the About room.
 */
export function createPersonalPhilosophyCardTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 960;
  const ctx = canvas.getContext('2d')!;

  // Warm museum conservation mat board (#171819)
  ctx.fillStyle = '#171819';
  ctx.fillRect(0, 0, 768, 960);

  // Inner archival paper mount (#1D1E20)
  ctx.fillStyle = '#1D1E20';
  ctx.fillRect(42, 42, 684, 876);

  // Subtle champagne & pigment bevel rules matching Archive 01 & 02 cards
  ctx.strokeStyle = 'rgba(185, 160, 120, 0.48)';
  ctx.lineWidth = 2.25;
  ctx.strokeRect(42, 42, 684, 876);

  ctx.strokeStyle = '#C9A56A';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(60, 60, 648, 840);

  // Restrained geometric curatorial plate engraving motif in upper register
  const cx = 384;
  const cy = 268;

  const grad = ctx.createRadialGradient(cx, cy, 14, cx, cy, 156);
  grad.addColorStop(0, '#C9A56A');
  grad.addColorStop(1, 'rgba(29, 30, 32, 0)');
  ctx.fillStyle = grad;
  ctx.globalAlpha = 0.25;
  ctx.beginPath();
  ctx.arc(cx, cy, 156, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.strokeStyle = 'rgba(241, 238, 231, 0.13)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, 154, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = '#C9A56A';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, 104, -Math.PI * 0.25, Math.PI * 0.85);
  ctx.stroke();

  // Subtle inner concentric ring & archival registration mark
  ctx.strokeStyle = 'rgba(185, 160, 120, 0.28)';
  ctx.lineWidth = 1.25;
  ctx.beginPath();
  ctx.arc(cx, cy, 52, 0, Math.PI * 2);
  ctx.stroke();

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(Math.PI / 4);
  ctx.strokeStyle = 'rgba(201, 165, 106, 0.65)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(-10, -10, 20, 20);
  ctx.restore();

  // Horizontal divider rule separating engraving motif from typography
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(84, 492);
  ctx.lineTo(684, 492);
  ctx.stroke();

  // 1. Kicker
  ctx.fillStyle = '#B9A078';
  ctx.font = '500 20px "IBM Plex Mono", monospace';
  ctx.fillText('ARCHIVE 03 · PERSONAL PHILOSOPHY', 84, 552);

  // 2. Primary Headline
  ctx.fillStyle = '#F1EEE7';
  ctx.font = '600 44px "Sora", -apple-system, sans-serif';
  ctx.fillText('Data by Profession', 84, 626);

  // 3. Secondary Headline (Champagne-Gold Accent)
  ctx.fillStyle = '#C9A56A';
  ctx.font = '600 40px "Sora", -apple-system, sans-serif';
  ctx.fillText('Artist by Passion', 84, 688);

  // Subtle champagne divider accent before supporting sentence
  ctx.strokeStyle = 'rgba(201, 165, 106, 0.42)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(84, 724);
  ctx.lineTo(174, 724);
  ctx.stroke();

  // 4. Supporting Sentence (wrapped cleanly across two balanced lines)
  ctx.fillStyle = '#B5B2AA';
  ctx.font = '400 24px "Manrope", -apple-system, sans-serif';
  ctx.fillText('Finding patterns in numbers.', 84, 772);
  ctx.fillText('Finding meaning in every stroke.', 84, 810);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Generates a smoked-graphite conservation portrait backing texture for Room 2 (About — The Creator's Space).
 * Combines dark vignette edges (#201F21), main warm graphite (#34302E), a subtle radial warm spotlight (#51473D)
 * behind the head and upper torso, restrained mineral grain, and fine champagne detailing (#B9A078).
 */
export function createSmokedGraphitePortraitTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 960;
  const ctx = canvas.getContext('2d')!;

  // 1. Outer edge dark smoked graphite base (#201F21)
  ctx.fillStyle = '#201F21';
  ctx.fillRect(0, 0, 768, 960);

  // 2. Primary radial warm spotlight behind head & upper body (#51473D -> #34302E -> #201F21)
  const headGlow = ctx.createRadialGradient(384, 380, 28, 384, 410, 520);
  headGlow.addColorStop(0, '#51473D');
  headGlow.addColorStop(0.36, '#423A33');
  headGlow.addColorStop(0.68, '#34302E');
  headGlow.addColorStop(1, '#201F21');
  ctx.fillStyle = headGlow;
  ctx.fillRect(0, 0, 768, 960);

  // 3. Secondary soft warm bronze-graphite lift behind shoulders/navy attire for tonal separation
  const torsoGlow = ctx.createRadialGradient(384, 600, 40, 384, 600, 420);
  torsoGlow.addColorStop(0, 'rgba(81, 71, 61, 0.32)');
  torsoGlow.addColorStop(0.55, 'rgba(52, 48, 46, 0.16)');
  torsoGlow.addColorStop(1, 'rgba(32, 31, 33, 0)');
  ctx.fillStyle = torsoGlow;
  ctx.fillRect(0, 0, 768, 960);

  // 4. Very subtle mineral clouding & brushed-stone micro-texture
  for (let i = 0; i < 40; i++) {
    const x = (i * 131) % 768;
    const y = (i * 197) % 960;
    const r = 70 + (i % 5) * 36;
    const grad = ctx.createRadialGradient(x, y, 6, x, y, r);
    grad.addColorStop(
      0,
      i % 2 === 0 ? 'rgba(81, 71, 61, 0.045)' : 'rgba(22, 21, 23, 0.055)',
    );
    grad.addColorStop(1, 'rgba(32, 31, 33, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = 'rgba(241, 238, 231, 0.014)';
  ctx.lineWidth = 1;
  for (let y = 0; y < 960; y += 4) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(768, y);
    ctx.stroke();
  }

  // 5. Subtle warm bronze architectural halo ring behind the portrait silhouette
  ctx.strokeStyle = 'rgba(185, 160, 120, 0.11)';
  ctx.lineWidth = 1.25;
  ctx.beginPath();
  ctx.arc(384, 390, 236, 0, Math.PI * 2);
  ctx.stroke();

  // 6. Fine champagne conservation detailing along the inner mount perimeter (#B9A078)
  ctx.strokeStyle = 'rgba(185, 160, 120, 0.34)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(18, 18, 732, 924);

  ctx.strokeStyle = 'rgba(16, 17, 18, 0.55)';
  ctx.lineWidth = 1;
  ctx.strokeRect(23, 23, 722, 914);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Generates a textured warm ivory linen signature canvas for Room 6 (Contact — The Final Signature).
 */
export function createSignatureCanvasTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1400;
  canvas.height = 720;
  const ctx = canvas.getContext('2d')!;

  // 1. Warm raw Belgian linen & archival ivory gesso base
  ctx.fillStyle = '#EAE2D0';
  ctx.fillRect(0, 0, 1400, 720);

  const gessoGrad = ctx.createRadialGradient(700, 340, 80, 700, 360, 720);
  gessoGrad.addColorStop(0, '#F6F1E6');
  gessoGrad.addColorStop(0.65, '#EFE8D8');
  gessoGrad.addColorStop(1, '#E3DAC6');
  ctx.fillStyle = gessoGrad;
  ctx.fillRect(28, 28, 1344, 664);

  // 2. Fine woven linen thread cross-hatching
  ctx.strokeStyle = 'rgba(34, 28, 22, 0.036)';
  ctx.lineWidth = 1;
  for (let x = 0; x < 1400; x += 6) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 720);
    ctx.stroke();
  }
  for (let y = 0; y < 720; y += 6) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1400, y);
    ctx.stroke();
  }

  // 3. Soft champagne-gold atmospheric wash behind the central typography
  const auraGrad = ctx.createRadialGradient(700, 290, 20, 700, 290, 440);
  auraGrad.addColorStop(0, 'rgba(185, 160, 120, 0.16)');
  auraGrad.addColorStop(0.55, 'rgba(185, 160, 120, 0.05)');
  auraGrad.addColorStop(1, 'rgba(246, 241, 230, 0)');
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.arc(700, 290, 440, 0, Math.PI * 2);
  ctx.fill();

  // 4. Blind-debossed archival museum border & champagne fillet
  ctx.strokeStyle = 'rgba(185, 160, 120, 0.72)';
  ctx.lineWidth = 2.2;
  ctx.strokeRect(48, 48, 1304, 624);

  ctx.strokeStyle = 'rgba(20, 21, 23, 0.16)';
  ctx.lineWidth = 1;
  ctx.strokeRect(64, 64, 1272, 592);

  // Subtle architectural golden-ratio guide hairlines
  ctx.strokeStyle = 'rgba(20, 21, 23, 0.06)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(64, 152);
  ctx.lineTo(1336, 152);
  ctx.moveTo(64, 548);
  ctx.lineTo(1336, 548);
  ctx.stroke();

  // 5. Top Curatorial Registration Header
  ctx.fillStyle = 'rgba(20, 21, 23, 0.56)';
  ctx.font = '500 16px "IBM Plex Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('THE DATA ATELIER  ·  FINAL EXHIBITION PLATE', 104, 118);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#8A6F44';
  ctx.fillText('ARCHIVE VI  ·  KERALA, INDIA', 1296, 118);

  // 6. Central Editorial Typographic Statement — "ANIRUDH K N"
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(185, 160, 120, 0.28)';
  ctx.font = '600 76px "Sora", -apple-system, sans-serif';
  ctx.fillText('ANIRUDH K N', 702, 286);

  ctx.fillStyle = '#141517';
  ctx.font = '600 76px "Sora", -apple-system, sans-serif';
  ctx.fillText('ANIRUDH K N', 700, 284);

  // 7. Supporting Professional Descriptor — "DATA ANALYTICS · MACHINE LEARNING · AI/ML"
  ctx.fillStyle = '#7E643A';
  ctx.font = '600 21px "IBM Plex Mono", monospace';
  ctx.fillText('DATA ANALYTICS  ·  MACHINE LEARNING  ·  AI/ML', 700, 344);

  // 8. Restrained Calligraphic Horizon Line & Central Champagne Seal on Canvas
  ctx.strokeStyle = 'rgba(20, 21, 23, 0.22)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(220, 468);
  ctx.lineTo(668, 468);
  ctx.moveTo(732, 468);
  ctx.lineTo(1180, 468);
  ctx.stroke();

  // Central diamond registration seal
  ctx.save();
  ctx.translate(700, 468);
  ctx.rotate(Math.PI / 4);
  ctx.strokeStyle = '#9D7F4E';
  ctx.lineWidth = 1.8;
  ctx.strokeRect(-9, -9, 18, 18);
  ctx.fillStyle = '#B9A078';
  ctx.fillRect(-3.5, -3.5, 7, 7);
  ctx.restore();

  // 9. Lower Colophon Inscription
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(20, 21, 23, 0.68)';
  ctx.font = '500 16px "Manrope", -apple-system, sans-serif';
  ctx.fillText('Bachelor of Computer Applications (BCA)  ·  CGPA 8.5 / 10', 104, 604);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#141517';
  ctx.font = '500 16px "IBM Plex Mono", monospace';
  ctx.fillText('theanirudhkn@gmail.com', 1296, 604);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Loads Anirudh K N's transparent cutout portrait ('/assets/anirudh-profile-cutout.webp'),
 * preserves full subject authenticity and alpha channel, and strips tiny isolated background
 * matting speckles outside the main portrait silhouette so the museum mat board shows cleanly.
 */
export function loadCleanTransparentPortraitTexture(
  url: string,
  onLoad: (tex: THREE.Texture, aspectRatio: number) => void,
  onError?: () => void,
): void {
  if (typeof Image === 'undefined' || typeof document === 'undefined') {
    onError?.();
    return;
  }

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    try {
      const w = img.naturalWidth || 1096;
      const h = img.naturalHeight || 1280;
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        const fallback = new THREE.TextureLoader().load(url);
        fallback.colorSpace = THREE.SRGBColorSpace;
        onLoad(fallback, w / h);
        return;
      }

      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);

      // Clean isolated tiny alpha noise dots in the background while keeping the connected central portrait 100% intact.
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;

      // Downsampled flood-fill / connected-component mask from the subject center (w/2, h*0.58)
      const scale = 4;
      const gw = Math.ceil(w / scale);
      const gh = Math.ceil(h / scale);
      const occupied = new Uint8Array(gw * gh);
      const visited = new Uint8Array(gw * gh);

      for (let gy = 0; gy < gh; gy++) {
        for (let gx = 0; gx < gw; gx++) {
          let maxA = 0;
          for (let dy = 0; dy < scale; dy++) {
            const py = Math.min(h - 1, gy * scale + dy);
            for (let dx = 0; dx < scale; dx++) {
              const px = Math.min(w - 1, gx * scale + dx);
              const a = data[(py * w + px) * 4 + 3];
              if (a > maxA) maxA = a;
            }
          }
          if (maxA > 32) {
            occupied[gy * gw + gx] = 1;
          }
        }
      }

      // BFS from the portrait torso/head core to mark the main connected subject silhouette
      const seedX = Math.floor(gw * 0.5);
      const seedY = Math.floor(gh * 0.55);
      const queue = new Int32Array(gw * gh);
      let head = 0;
      let tail = 0;
      const startIdx = seedY * gw + seedX;
      visited[startIdx] = 1;
      queue[tail++] = startIdx;

      while (head < tail) {
        const curr = queue[head++];
        const cx = curr % gw;
        const cy = (curr - cx) / gw;
        for (let ny = Math.max(0, cy - 2); ny <= Math.min(gh - 1, cy + 2); ny++) {
          for (let nx = Math.max(0, cx - 2); nx <= Math.min(gw - 1, cx + 2); nx++) {
            const nIdx = ny * gw + nx;
            if (!visited[nIdx] && occupied[nIdx]) {
              visited[nIdx] = 1;
              queue[tail++] = nIdx;
            }
          }
        }
      }

      // Zero out disconnected background noise pixels outside the main subject component
      for (let py = 0; py < h; py++) {
        const gy = Math.min(gh - 1, Math.floor(py / scale));
        for (let px = 0; px < w; px++) {
          const gx = Math.min(gw - 1, Math.floor(px / scale));
          const idx = (py * w + px) * 4;
          if (!visited[gy * gw + gx] || data[idx + 3] < 24) {
            data[idx + 3] = 0;
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);

      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.needsUpdate = true;
      onLoad(tex, w / h);
    } catch {
      const fallback = new THREE.TextureLoader().load(url);
      fallback.colorSpace = THREE.SRGBColorSpace;
      onLoad(fallback, 1096 / 1280);
    }
  };
  img.onerror = () => {
    onError?.();
  };
  img.src = url;
}

/**
 * Detects whether the current browser environment supports WebGL rendering.
 * Also supports ?webgl=fallback query parameter for deterministic fallback testing.
 */
export function checkWebGLSupport(): { supported: boolean; reason?: string } {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return { supported: true };
  }

  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('webgl') === 'fallback' || params.get('webgl') === '0') {
      return {
        supported: false,
        reason: 'Non-3D museum edition requested via URL parameter.',
      };
    }

    if (!window.WebGLRenderingContext) {
      return {
        supported: false,
        reason: 'WebGLRenderingContext is not available in this browser.',
      };
    }

    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');

    if (!gl) {
      return {
        supported: false,
        reason: 'Unable to initialize a WebGL2 or WebGL1 rendering context.',
      };
    }

    return { supported: true };
  } catch {
    return {
      supported: false,
      reason: 'An exception occurred while probing WebGL support.',
    };
  }
}


