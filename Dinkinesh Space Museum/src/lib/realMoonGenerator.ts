import * as THREE from 'three';

export interface RealMoonAssets {
  albedoMap: THREE.CanvasTexture;
  normalMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
  heightField: Float32Array;
  width: number;
  height: number;
}

// Fast deterministic 3D integer hash noise (avoids millions of Math.sin calls)
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

function fbm3D(x: number, y: number, z: number, octaves = 5): number {
  let value = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < octaves; i++) {
    value += amp * noise3D(x * freq, y * freq, z * freq);
    freq *= 2.05;
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

// Real lunar maria basins (lat, lon, angular radius in rad, depth/darkness)
const LUNAR_MARIA = [
  // Oceanus Procellarum (large western mare complex)
  { lat: 18, lon: -56, r: 0.48, dark: 0.85 },
  { lat: 2, lon: -42, r: 0.34, dark: 0.78 },
  // Mare Imbrium (bordering Apollo 15 to the SE)
  { lat: 33, lon: -16, r: 0.32, dark: 0.88 },
  // Mare Serenitatis
  { lat: 28, lon: 18, r: 0.22, dark: 0.82 },
  // Mare Tranquillitatis (Apollo 11 site at 0.67N, 23.47E)
  { lat: 9, lon: 29, r: 0.24, dark: 0.9 },
  // Mare Vaporum & Sinus Medii
  { lat: 13, lon: 4, r: 0.13, dark: 0.72 },
  // Mare Fecunditatis
  { lat: -8, lon: 51, r: 0.21, dark: 0.82 },
  // Mare Nectaris
  { lat: -15, lon: 35, r: 0.14, dark: 0.78 },
  // Mare Crisium
  { lat: 17, lon: 59, r: 0.14, dark: 0.92 },
  // Mare Nubium
  { lat: -21, lon: -17, r: 0.22, dark: 0.76 },
  // Mare Humorum
  { lat: -24, lon: -39, r: 0.13, dark: 0.8 },
  // Mare Frigoris
  { lat: 56, lon: -4, r: 0.22, dark: 0.74 },
  // Mare Orientale (western limb)
  { lat: -19, lon: -93, r: 0.18, dark: 0.7 },
  // Mare Moscoviense (far side)
  { lat: 27, lon: 147, r: 0.16, dark: 0.78 },
].map((m) => ({
  ...m,
  dir: degToUnitVec(m.lat, m.lon),
  cosBound: Math.cos(m.r + 0.2),
}));

interface CraterDef {
  dir: [number, number, number];
  r: number;
  cosMaxRange: number;
  depth: number;
  rays: boolean;
  darkFloor: boolean;
}

function makeCrater(
  dir: [number, number, number],
  r: number,
  depth: number,
  rays: boolean,
  darkFloor: boolean
): CraterDef {
  const maxRange = rays ? r * 5.0 : r * 1.45;
  return { dir, r, cosMaxRange: Math.cos(maxRange), depth, rays, darkFloor };
}

function buildCraterList(): CraterDef[] {
  const list: CraterDef[] = [
    // Iconic real named lunar craters
    makeCrater(degToUnitVec(-43.3, -11.2), 0.055, 1.0, true, false),   // Tycho
    makeCrater(degToUnitVec(9.6, -20.1), 0.06, 0.95, true, false),     // Copernicus
    makeCrater(degToUnitVec(8.1, -38.0), 0.03, 0.8, true, false),      // Kepler
    makeCrater(degToUnitVec(23.7, -47.4), 0.034, 0.85, true, false),   // Aristarchus
    makeCrater(degToUnitVec(51.6, -9.3), 0.052, 0.75, false, true),    // Plato
    makeCrater(degToUnitVec(-58.4, -14.4), 0.08, 0.9, false, false),   // Clavius
    makeCrater(degToUnitVec(-29.7, 36.6), 0.065, 0.82, false, false),  // Petavius
    makeCrater(degToUnitVec(20.1, 14.8), 0.036, 0.72, false, false),   // Bessel / Menelaus area
    makeCrater(degToUnitVec(-8.9, -15.5), 0.07, 0.85, false, false),   // Ptolemaeus
    makeCrater(degToUnitVec(14.5, -11.3), 0.045, 0.78, false, false),  // Eratosthenes
  ];

  // Add 240 realistic procedural craters distributed across near & far sides
  for (let i = 0; i < 240; i++) {
    const u = hash3(i, 13, 47);
    const v = hash3(i, 91, 23);
    const lon = u * 360 - 180;
    const lat = Math.asin(2 * v - 1) * (180 / Math.PI);
    const sizeRand = Math.pow(hash3(i, 55, 82), 2.4);
    const r = 0.015 + sizeRand * 0.085;
    list.push(
      makeCrater(
        degToUnitVec(lat, lon),
        r,
        0.45 + hash3(i, 33, 61) * 0.5,
        i % 29 === 0,
        false
      )
    );
  }
  return list;
}

const CRATERS = buildCraterList();

let cachedMoonAssets: RealMoonAssets | null = null;

export function generateRealMoonAssets(): RealMoonAssets {
  if (cachedMoonAssets) {
    return cachedMoonAssets;
  }

  const width = 1024;
  const height = 512;
  const total = width * height;
  const heightField = new Float32Array(total);
  const mareMaskField = new Float32Array(total);
  const rayMaskField = new Float32Array(total);

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
    const lat = (0.5 - v) * Math.PI; // +pi/2 at north pole (top), -pi/2 at south pole
    const cosLat = Math.cos(lat);
    const sinLat = Math.sin(lat);

    for (let px = 0; px < width; px++) {
      const u = (px + 0.5) / width;
      const lon = (u - 0.5) * Math.PI * 2; // -pi..+pi, 0 at center
      const nx = cosLat * Math.sin(lon);
      const ny = sinLat;
      const nz = cosLat * Math.cos(lon);

      const idx = py * width + px;

      // Multi-octave 3D noise for rugged highland crust
      const fbmLarge = fbm3D(nx * 2.8 + 4.1, ny * 2.8 - 1.7, nz * 2.8 + 2.3, 4);
      const fbmFine = fbm3D(nx * 14.0 - 2.2, ny * 14.0 + 3.4, nz * 14.0 - 0.8, 3);
      let h = (fbmLarge - 0.5) * 0.62 + (fbmFine - 0.5) * 0.22;

      // Evaluate lunar maria coverage (warped by fractal noise for natural coastlines)
      let mareMask = 0;
      const warp = (fbmLarge - 0.5) * 0.24 + (fbmFine - 0.5) * 0.08;
      for (let m = 0; m < LUNAR_MARIA.length; m++) {
        const mare = LUNAR_MARIA[m];
        const dot = nx * mare.dir[0] + ny * mare.dir[1] + nz * mare.dir[2];
        if (dot < mare.cosBound) continue;
        const clampedDot = dot > 1 ? 1 : dot < -1 ? -1 : dot;
        const dist = Math.acos(clampedDot) + warp;
        if (dist < mare.r) {
          const t = 1 - dist / mare.r;
          const smooth = t * t * (3 - 2 * t) * mare.dark;
          if (smooth > mareMask) mareMask = smooth;
        }
      }

      // Maria are flatter, lower-elevation flooded basalt plains
      h = h * (1 - mareMask * 0.65) - mareMask * 0.28;

      // Evaluate impact craters (skip craters that fall outside precomputed bounding cosine)
      let ejectaBright = 0;
      for (let c = 0; c < CRATERS.length; c++) {
        const cr = CRATERS[c];
        const dot = nx * cr.dir[0] + ny * cr.dir[1] + nz * cr.dir[2];
        if (dot < cr.cosMaxRange) continue;

        const d = Math.acos(Math.min(1, dot));
        const q = d / cr.r;

        if (q < 1.38) {
          if (q < 0.85) {
            // Parabolic bowl
            const bowl = -1.0 + Math.pow(q / 0.85, 2) * 1.08;
            // Subtle central peak on large craters
            const peak = cr.r > 0.05 && q < 0.2 ? (1 - q / 0.2) * 0.35 : 0;
            h += (bowl + peak) * cr.depth * 0.36;
          } else {
            // Sharp raised crater rim tapering smoothly outward
            const rimT = 1 - (q - 0.85) / 0.53;
            const rim = Math.sin(rimT * Math.PI * 0.5) * 0.22;
            h += rim * cr.depth * 0.36;
          }
          if (cr.darkFloor && q < 0.78) {
            mareMask = Math.max(mareMask, 0.75);
          }
        }

        if (cr.rays && q > 0.85 && q < 5.0) {
          // Radial ray pattern using angular noise around crater center
          const angle = Math.atan2(ny - cr.dir[1], nx - cr.dir[0] + (nz - cr.dir[2]) * 0.5);
          const rayWave = Math.pow(0.5 + 0.5 * Math.sin(angle * 11 + fbmFine * 8), 3);
          const falloff = Math.max(0, 1 - (q - 0.85) / 4.15);
          ejectaBright = Math.max(ejectaBright, rayWave * falloff * 0.55);
        } else if (q >= 0.8 && q < 1.35) {
          ejectaBright = Math.max(ejectaBright, (1 - (q - 0.8) / 0.55) * 0.18);
        }
      }

      heightField[idx] = h;
      mareMaskField[idx] = mareMask;
      rayMaskField[idx] = ejectaBright;

      // Photorealistic lunar surface coloration:
      // Highlands: cool pale neutral gray (#C8CCD4 to #E5E7EB)
      // Maria: darker basalt slate-gray (#5A606B to #767D8A)
      const microTone = (fbmFine - 0.5) * 28 + (fbmLarge - 0.5) * 20;
      const highlandVal = 202 + microTone + h * 26;
      const mareVal = 96 + microTone * 0.7;
      let lum = highlandVal * (1 - mareMask) + mareVal * mareMask + ejectaBright * 52;
      lum = Math.max(58, Math.min(242, lum));

      // Subtle mineral tint (maria slightly cooler slate-blue, highlands slightly warmer neutral)
      const rCol = Math.max(0, Math.min(255, lum + (1 - mareMask) * 3 - mareMask * 3));
      const gCol = Math.max(0, Math.min(255, lum + (1 - mareMask) * 1));
      const bCol = Math.max(0, Math.min(255, lum + mareMask * 4));

      const p4 = idx * 4;
      colorImg.data[p4] = rCol;
      colorImg.data[p4 + 1] = gCol;
      colorImg.data[p4 + 2] = bCol;
      colorImg.data[p4 + 3] = 255;

      // Regolith is very matte/dusty (roughness 0.86 - 0.96)
      const roughByte = Math.round(224 + (1 - mareMask) * 20 - ejectaBright * 10);
      roughImg.data[p4] = roughByte;
      roughImg.data[p4 + 1] = roughByte;
      roughImg.data[p4 + 2] = roughByte;
      roughImg.data[p4 + 3] = 255;
    }
  }

  colorCtx.putImageData(colorImg, 0, 0);
  roughCtx.putImageData(roughImg, 0, 0);

  // Build Tangent-Space Normal Map from HeightField
  const normalCanvas = document.createElement('canvas');
  normalCanvas.width = width;
  normalCanvas.height = height;
  const normalCtx = normalCanvas.getContext('2d')!;
  const normalImg = normalCtx.createImageData(width, height);
  const strength = 7.5;

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

  cachedMoonAssets = { albedoMap, normalMap, roughnessMap, heightField, width, height };
  return cachedMoonAssets;
}
