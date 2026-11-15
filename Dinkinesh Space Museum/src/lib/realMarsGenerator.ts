import * as THREE from 'three';

export interface RealMarsAssets {
  albedoMap: THREE.CanvasTexture;
  normalMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
  heightField: Float32Array;
  width: number;
  height: number;
}

function hash3(x: number, y: number, z: number): number {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(z | 0, 2147483647);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function noise3D(x: number, y: number, z: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const iz = Math.floor(z);
  const fx = x - ix;
  const fy = y - iy;
  const fz = z - iz;

  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const uz = fz * fz * (3 - 2 * fz);

  const n000 = hash3(ix, iy, iz);
  const n100 = hash3(ix + 1, iy, iz);
  const n010 = hash3(ix, iy + 1, iz);
  const n110 = hash3(ix + 1, iy + 1, iz);
  const n001 = hash3(ix, iy, iz + 1);
  const n101 = hash3(ix + 1, iy, iz + 1);
  const n011 = hash3(ix, iy + 1, iz + 1);
  const n111 = hash3(ix + 1, iy + 1, iz + 1);

  const nx00 = n000 + (n100 - n000) * ux;
  const nx10 = n010 + (n110 - n010) * ux;
  const nx01 = n001 + (n101 - n001) * ux;
  const nx11 = n011 + (n111 - n011) * ux;

  const nxy0 = nx00 + (nx10 - nx00) * uy;
  const nxy1 = nx01 + (nx11 - nx01) * uy;

  return nxy0 + (nxy1 - nxy0) * uz;
}

function fbm3D(x: number, y: number, z: number, octaves = 4): number {
  let value = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < octaves; i++) {
    value += amp * noise3D(x * freq, y * freq, z * freq);
    freq *= 2.08;
    amp *= 0.5;
  }
  return value;
}

function degToUnitVec(latDeg: number, lonDeg: number): [number, number, number] {
  const lat = (latDeg * Math.PI) / 180;
  const lon = (lonDeg * Math.PI) / 180;
  const c = Math.cos(lat);
  return [c * Math.sin(lon), Math.sin(lat), c * Math.cos(lon)];
}

// Major real dark basaltic Martian albedo features
const MARS_DARK_REGIONS = [
  // Syrtis Major Planum (iconic dark triangular volcanic shield west of Jezero)
  { lat: 8.5, lon: 68.5, r: 0.25, dark: 0.92 },
  { lat: 15.0, lon: 64.0, r: 0.16, dark: 0.78 },
  // Acidalia Planitia
  { lat: 46.0, lon: -22.0, r: 0.34, dark: 0.82 },
  // Chryse Planitia (Viking 1 landing basin)
  { lat: 21.5, lon: -46.0, r: 0.22, dark: 0.62 },
  // Meridiani Planum & Sinus Meridiani (Opportunity site)
  { lat: -3.0, lon: -4.0, r: 0.22, dark: 0.86 },
  { lat: -6.0, lon: 14.0, r: 0.2, dark: 0.78 },
  // Margaritifer Terra & Mare Erythraeum
  { lat: -20.0, lon: -30.0, r: 0.3, dark: 0.78 },
  { lat: -26.0, lon: -62.0, r: 0.22, dark: 0.72 },
  // Mare Tyrrhenum & Hesperia Planum
  { lat: -18.0, lon: 105.0, r: 0.28, dark: 0.76 },
  // Mare Sirenum & Cimmerium
  { lat: -26.0, lon: -148.0, r: 0.32, dark: 0.8 },
  { lat: -20.0, lon: 145.0, r: 0.28, dark: 0.76 },
  // Utopia Planitia
  { lat: 44.0, lon: 112.0, r: 0.32, dark: 0.56 },
  // Vastitas Borealis dark collar
  { lat: 63.0, lon: 40.0, r: 0.36, dark: 0.62 },
  { lat: 64.0, lon: -115.0, r: 0.38, dark: 0.6 },
].map((m) => ({
  ...m,
  dir: degToUnitVec(m.lat, m.lon),
  cosBound: Math.cos(m.r + 0.16),
}));

// Giant Martian shield volcanoes
const MARS_VOLCANOES = [
  // Olympus Mons (huge shield + caldera)
  { dir: degToUnitVec(18.6, -133.8), r: 0.145, cosBound: Math.cos(0.145 * 1.15), height: 1.05, calderaR: 0.022 },
  // Tharsis Montes chain
  { dir: degToUnitVec(11.9, -104.1), r: 0.095, cosBound: Math.cos(0.095 * 1.15), height: 0.82, calderaR: 0.016 },
  { dir: degToUnitVec(1.5, -112.9), r: 0.09, cosBound: Math.cos(0.09 * 1.15), height: 0.76, calderaR: 0.015 },
  { dir: degToUnitVec(-8.3, -120.1), r: 0.105, cosBound: Math.cos(0.105 * 1.15), height: 0.84, calderaR: 0.019 },
  // Elysium Mons
  { dir: degToUnitVec(25.0, 147.2), r: 0.095, cosBound: Math.cos(0.095 * 1.15), height: 0.72, calderaR: 0.014 },
];

// Huge dust-filled southern impact basins
const MARS_BASINS = [
  { dir: degToUnitVec(-42.4, 70.5), r: 0.34, cosBound: Math.cos(0.34 * 1.2), depth: 0.75 },
  { dir: degToUnitVec(-49.7, -44.0), r: 0.18, cosBound: Math.cos(0.18 * 1.2), depth: 0.52 },
  { dir: degToUnitVec(12.9, 87.0), r: 0.18, cosBound: Math.cos(0.18 * 1.2), depth: 0.42 },
];

interface MarsCraterDef {
  dir: [number, number, number];
  r: number;
  cosBound: number;
  depth: number;
  darkFloor: boolean;
}

function makeMarsCrater(
  dir: [number, number, number],
  r: number,
  depth: number,
  darkFloor: boolean
): MarsCraterDef {
  return { dir, r, cosBound: Math.cos(r * 1.45), depth, darkFloor };
}

function buildMarsCraters(): MarsCraterDef[] {
  const list: MarsCraterDef[] = [
    // Real named craters
    makeMarsCrater(degToUnitVec(18.38, 77.58), 0.024, 0.68, false), // Jezero Crater
    makeMarsCrater(degToUnitVec(-5.4, 137.8), 0.036, 0.78, true),   // Gale Crater
    makeMarsCrater(degToUnitVec(-2.7, 16.8), 0.068, 0.72, true),    // Schiaparelli
    makeMarsCrater(degToUnitVec(-13.8, 55.6), 0.068, 0.75, false),  // Huygens
    makeMarsCrater(degToUnitVec(23.8, 32.1), 0.062, 0.7, true),     // Cassini
    makeMarsCrater(degToUnitVec(-31.8, -15.8), 0.048, 0.66, true),  // Holden / Eberswalde area
    makeMarsCrater(degToUnitVec(38.0, 42.0), 0.042, 0.65, false),
  ];

  // Eroded southern highlands & scattered northern craters
  for (let i = 0; i < 210; i++) {
    const u = hash3(i, 27, 81);
    const v = hash3(i, 64, 39);
    const lon = u * 360 - 180;
    let lat = Math.asin(2 * v - 1) * (180 / Math.PI);
    if (lat > 10 && i % 3 !== 0) {
      lat = -lat * 0.85;
    }
    const sizeRand = Math.pow(hash3(i, 41, 93), 2.3);
    const r = 0.014 + sizeRand * 0.062;
    list.push(
      makeMarsCrater(degToUnitVec(lat, lon), r, 0.36 + hash3(i, 72, 19) * 0.42, i % 7 === 0)
    );
  }
  return list;
}

const MARS_CRATERS = buildMarsCraters();

let cachedMarsAssets: RealMarsAssets | null = null;

export function generateRealMarsAssets(): RealMarsAssets {
  if (cachedMarsAssets) {
    return cachedMarsAssets;
  }
  const width = 1024;
  const height = 512;
  const total = width * height;
  const heightField = new Float32Array(total);

  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = width;
  colorCanvas.height = height;
  const colorCtx = colorCanvas.getContext('2d')!;
  const colorImg = colorCtx.createImageData(width, height);

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = width;
  roughCanvas.height = height;
  const roughCtx = roughCanvas.getContext('2d')!;
  const roughImg = roughCtx.createImageData(width, height);

  for (let py = 0; py < height; py++) {
    const v = (py + 0.5) / height;
    const lat = (0.5 - v) * Math.PI;
    const latDeg = (lat * 180) / Math.PI;
    const cosLat = Math.cos(lat);
    const sinLat = Math.sin(lat);

    for (let px = 0; px < width; px++) {
      const u = (px + 0.5) / width;
      const lon = (u - 0.5) * Math.PI * 2;
      const lonDeg = (lon * 180) / Math.PI;
      const nx = cosLat * Math.sin(lon);
      const ny = sinLat;
      const nz = cosLat * Math.cos(lon);

      const idx = py * width + px;

      // Multi-scale fractal planetary terrain + wind-streaked domain warp
      const warpX = fbm3D(nx * 4.5 + 1.1, ny * 4.5 - 2.3, nz * 4.5 + 0.7, 3) - 0.5;
      const warpY = fbm3D(nx * 4.5 - 3.2, ny * 4.5 + 1.8, nz * 4.5 - 1.4, 3) - 0.5;
      const fbmLarge = fbm3D(
        (nx + warpX * 0.14) * 3.1 + 5.2,
        (ny + warpY * 0.1) * 3.1 - 1.4,
        (nz + warpX * 0.14) * 3.1 + 3.8,
        4
      );
      const fbmMed = fbm3D(nx * 10.5 - 1.9, ny * 10.5 + 4.1, nz * 10.5 - 2.6, 3);
      const fbmFine = fbm3D(nx * 24.0 + 2.3, ny * 24.0 - 0.9, nz * 24.0 + 1.7, 2);

      // Global Martian Dichotomy: southern highlands higher & rougher than northern lowlands
      const dichotomyT = Math.max(0, Math.min(1, (10 - latDeg + (fbmLarge - 0.5) * 28) / 36));
      let h = (dichotomyT - 0.45) * 0.32 + (fbmLarge - 0.5) * 0.44 + (fbmMed - 0.5) * 0.18 + (fbmFine - 0.5) * 0.08;

      // Tharsis broad volcanic plateau bulge
      const tharsisDot = nx * -0.88 + ny * 0.05 + nz * -0.47;
      if (tharsisDot > 0.35) {
        const t = (tharsisDot - 0.35) / 0.65;
        h += t * t * 0.28;
      }

      // Dark basaltic albedo mask
      let darkMask = 0;
      const albedoWarp = (fbmLarge - 0.5) * 0.18 + (fbmMed - 0.5) * 0.07;
      for (let m = 0; m < MARS_DARK_REGIONS.length; m++) {
        const reg = MARS_DARK_REGIONS[m];
        const dot = nx * reg.dir[0] + ny * reg.dir[1] + nz * reg.dir[2];
        if (dot < reg.cosBound) continue;
        const clampedDot = dot > 1 ? 1 : dot < -1 ? -1 : dot;
        const dist = Math.acos(clampedDot) + albedoWarp;
        if (dist < reg.r) {
          const t = 1 - dist / reg.r;
          const s = t * t * (3 - 2 * t) * reg.dark;
          if (s > darkMask) darkMask = s;
        }
      }

      // Giant impact basins (Hellas, Argyre, Isidis)
      let basinDust = 0;
      for (let b = 0; b < MARS_BASINS.length; b++) {
        const basin = MARS_BASINS[b];
        const dot = nx * basin.dir[0] + ny * basin.dir[1] + nz * basin.dir[2];
        if (dot < basin.cosBound) continue;
        const dist = Math.acos(Math.min(1, dot)) + (fbmMed - 0.5) * 0.05;
        if (dist < basin.r) {
          const t = 1 - dist / basin.r;
          const bowl = t * t * (3 - 2 * t);
          h -= bowl * basin.depth * 0.55;
          basinDust = Math.max(basinDust, bowl * 0.72);
        }
      }

      // Valles Marineris tectonic canyon system (lon -95° to -36°, lat around -11° ± 6°)
      let canyonMask = 0;
      if (lonDeg > -98 && lonDeg < -34 && latDeg > -24 && latDeg < 4) {
        const lonT = (lonDeg + 95) / 59; // 0..1 west to east
        const centerLat =
          -7.5 - lonT * 7.0 + Math.sin(lonT * Math.PI * 2.2) * 1.8 + (fbmMed - 0.5) * 3.8;
        const halfWidth =
          (1.8 + Math.sin(Math.max(0, Math.min(1, lonT)) * Math.PI) * 2.8) *
          (0.75 + fbmFine * 0.55);
        const endFade =
          Math.min(1, Math.max(0, (lonDeg + 95) / 8)) *
          Math.min(1, Math.max(0, (-36 - lonDeg) / 9));
        const dLat = Math.abs(latDeg - centerLat);
        if (dLat < halfWidth && endFade > 0) {
          const wall = 1 - dLat / halfWidth;
          const trench = Math.pow(wall, 0.75) * endFade;
          h -= trench * 0.68;
          canyonMask = trench;
        }
      }

      // Shield Volcanoes (Olympus Mons, Tharsis Montes, Elysium Mons)
      let volcanoGlow = 0;
      for (let vIdx = 0; vIdx < MARS_VOLCANOES.length; vIdx++) {
        const vol = MARS_VOLCANOES[vIdx];
        const dot = nx * vol.dir[0] + ny * vol.dir[1] + nz * vol.dir[2];
        if (dot < vol.cosBound) continue;
        const dist = Math.acos(Math.min(1, dot));
        if (dist < vol.r) {
          const t = 1 - dist / vol.r;
          let cone = Math.pow(t, 1.35) * vol.height * 0.85;
          if (dist < vol.calderaR) {
            cone -= (1 - dist / vol.calderaR) * 0.16;
          }
          h += cone;
          volcanoGlow = Math.max(volcanoGlow, t * 0.45);
        }
      }

      // Martian Impact Craters (softer weathered rims + occasional dark dune floors)
      for (let c = 0; c < MARS_CRATERS.length; c++) {
        const cr = MARS_CRATERS[c];
        const dot = nx * cr.dir[0] + ny * cr.dir[1] + nz * cr.dir[2];
        if (dot < cr.cosBound) continue;
        const d = Math.acos(Math.min(1, dot));
        const q = d / cr.r;
        if (q < 1.35) {
          if (q < 0.85) {
            const bowl = -1.0 + Math.pow(q / 0.85, 2) * 1.06;
            h += bowl * cr.depth * 0.28;
            if (cr.darkFloor && q < 0.65) {
              darkMask = Math.max(darkMask, 0.55 * (1 - q / 0.65));
            }
          } else {
            const rimT = 1 - (q - 0.85) / 0.5;
            h += Math.sin(rimT * Math.PI * 0.5) * 0.16 * cr.depth * 0.28;
          }
        }
      }

      // Polar Ice Caps (Planum Boreum & Planum Australe) with spiral wind-carved troughs
      let iceMask = 0;
      const absLat = Math.abs(latDeg);
      if (absLat > 69) {
        const capThreshold = latDeg > 0 ? 75.5 : 79.0;
        const edgeJitter = (fbmMed - 0.5) * 6.5 + (fbmFine - 0.5) * 3.0;
        const spiral = Math.sin(lon * 3.0 + (90 - absLat) * 0.85 + fbmMed * 3.2);
        const capFactor = (absLat + edgeJitter - capThreshold) / 4.5;
        if (capFactor > 0) {
          const smoothCap = Math.min(1, capFactor * capFactor * (3 - 2 * Math.min(1, capFactor)));
          const troughCut = spiral < -0.42 && absLat < 87 ? 0.35 : 1.0;
          iceMask = Math.min(1, smoothCap * troughCut);
          h += iceMask * 0.09;
        }
      }

      heightField[idx] = h;

      // Authentic Martian Mineral Palette:
      // 1) Bright ferric dust uplands (warm ochre / butterscotch #DE8B52)
      // 2) Standard rusty regolith (#B85630)
      // 3) Dark basaltic plains like Syrtis Major (#5B3D34)
      // 4) Bright dusty Hellas basin / Tharsis dust (#E89E68)
      // 5) Shadowed deep Valles Marineris floor (#4A281E)
      // 6) Crisp polar CO2/H2O ice (#F3F5F7)
      const grain = (fbmFine - 0.5) * 26 + (fbmMed - 0.5) * 22 + (fbmLarge - 0.5) * 18;
      const dustRichness = Math.max(0, Math.min(1, 0.45 + fbmLarge * 0.35 + basinDust * 0.5 + volcanoGlow * 0.4 - darkMask * 0.7));

      // Base terracotta rust + bright ochre dust blend
      let rCol = 178 + dustRichness * 42 + grain + h * 20;
      let gCol = 82 + dustRichness * 52 + grain * 0.72 + h * 14;
      let bCol = 46 + dustRichness * 32 + grain * 0.45 + h * 8;

      // Dark basaltic bedrock regions (Syrtis Major, Meridiani, Acidalia)
      const basaltR = 92 + grain * 0.55;
      const basaltG = 62 + grain * 0.48;
      const basaltB = 54 + grain * 0.45;

      const dMix = darkMask * 0.82;
      rCol = rCol * (1 - dMix) + basaltR * dMix;
      gCol = gCol * (1 - dMix) + basaltG * dMix;
      bCol = bCol * (1 - dMix) + basaltB * dMix;

      // Darken Valles Marineris canyon walls/floor for dramatic depth
      if (canyonMask > 0) {
        const cMix = canyonMask * 0.55;
        rCol = rCol * (1 - cMix) + 74 * cMix;
        gCol = gCol * (1 - cMix) + 38 * cMix;
        bCol = bCol * (1 - cMix) + 28 * cMix;
      }

      // Blend polar ice caps
      if (iceMask > 0) {
        rCol = rCol * (1 - iceMask) + 244 * iceMask;
        gCol = gCol * (1 - iceMask) + 245 * iceMask;
        bCol = bCol * (1 - iceMask) + 248 * iceMask;
      }

      const p4 = idx * 4;
      colorImg.data[p4] = Math.max(24, Math.min(252, rCol));
      colorImg.data[p4 + 1] = Math.max(20, Math.min(250, gCol));
      colorImg.data[p4 + 2] = Math.max(18, Math.min(252, bCol));
      colorImg.data[p4 + 3] = 255;

      // Matte dusty regolith (0.86-0.96), slightly smoother basalt (0.78), glossy polar ice (0.38)
      const roughFloat = (0.91 - darkMask * 0.1 + dustRichness * 0.05) * (1 - iceMask) + 0.38 * iceMask;
      const roughByte = Math.round(Math.max(85, Math.min(248, roughFloat * 255)));
      roughImg.data[p4] = roughByte;
      roughImg.data[p4 + 1] = roughByte;
      roughImg.data[p4 + 2] = roughByte;
      roughImg.data[p4 + 3] = 255;
    }
  }

  colorCtx.putImageData(colorImg, 0, 0);
  roughCtx.putImageData(roughImg, 0, 0);

  // Tangent-Space Normal Map from Martian HeightField
  const normalCanvas = document.createElement('canvas');
  normalCanvas.width = width;
  normalCanvas.height = height;
  const normalCtx = normalCanvas.getContext('2d')!;
  const normalImg = normalCtx.createImageData(width, height);
  const strength = 8.5;

  for (let py = 0; py < height; py++) {
    const yUp = Math.max(0, py - 1);
    const yDn = Math.min(height - 1, py + 1);
    for (let px = 0; px < width; px++) {
      const xLt = (px - 1 + width) % width;
      const xRt = (px + 1) % width;

      const hL = heightField[py * width + xLt];
      const hR = heightField[py * width + xRt];
      const hU = heightField[yUp * width + px];
      const hD = heightField[yDn * width + px];

      const dx = (hR - hL) * strength;
      const dy = (hD - hU) * strength;
      const dz = 1.0;
      const invLen = 1 / Math.sqrt(dx * dx + dy * dy + dz * dz);

      const p4 = (py * width + px) * 4;
      normalImg.data[p4] = Math.round((-dx * invLen * 0.5 + 0.5) * 255);
      normalImg.data[p4 + 1] = Math.round((dy * invLen * 0.5 + 0.5) * 255);
      normalImg.data[p4 + 2] = Math.round((dz * invLen * 0.5 + 0.5) * 255);
      normalImg.data[p4 + 3] = 255;
    }
  }
  normalCtx.putImageData(normalImg, 0, 0);

  const albedoMap = new THREE.CanvasTexture(colorCanvas);
  albedoMap.colorSpace = THREE.SRGBColorSpace;
  albedoMap.wrapS = THREE.RepeatWrapping;
  albedoMap.wrapT = THREE.ClampToEdgeWrapping;

  const normalMap = new THREE.CanvasTexture(normalCanvas);
  normalMap.wrapS = THREE.RepeatWrapping;
  normalMap.wrapT = THREE.ClampToEdgeWrapping;

  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.ClampToEdgeWrapping;

  cachedMarsAssets = { albedoMap, normalMap, roughnessMap, heightField, width, height };
  return cachedMarsAssets;
}
