import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import type { ArtifactInfo } from '../data/artifacts';
import { generateRealMarsAssets } from '../lib/realMarsGenerator';
import { LucyAvatar, type LucyMode } from './LucyAvatar';

interface Mars3DCanvasProps {
  artifacts: ArtifactInfo[];
  selectedArtifact: ArtifactInfo | null;
  onSelectArtifact: (artifact: ArtifactInfo) => void;
  zoomCommand: { seq: number; delta: number } | null;
  resetSeq: number;
}

// Real Martian spherical coordinates (Viking 1 in Chryse, Twin Rovers at Meridiani, Ingenuity in Jezero)
const MARS_SPHERICAL: Record<string, { lat: number; lon: number }> = {
  'viking-1': { lat: 22.27, lon: -47.95 },
  'spirit-opportunity': { lat: -1.95, lon: -5.53 },
  ingenuity: { lat: 18.38, lon: 77.58 },
};

const BASE_MARS_RADIUS = 2.0;

function latLonToVec3(
  latDeg: number,
  lonDeg: number,
  radius: number,
  out = new THREE.Vector3()
): THREE.Vector3 {
  const lat = THREE.MathUtils.degToRad(latDeg);
  const lon = THREE.MathUtils.degToRad(lonDeg);
  const cosLat = Math.cos(lat);
  out.set(
    radius * cosLat * Math.sin(lon),
    radius * Math.sin(lat),
    radius * cosLat * Math.cos(lon)
  );
  return out;
}

function sampleHeightAtLatLon(
  latDeg: number,
  lonDeg: number,
  heightField: Float32Array,
  width: number,
  height: number
): number {
  const u = (((lonDeg / 360 + 0.5) % 1) + 1) % 1;
  const v = THREE.MathUtils.clamp(0.5 - latDeg / 180, 0, 0.999);
  const px = Math.floor(u * width) % width;
  const py = Math.floor(v * height);
  return heightField[py * width + px] ?? 0;
}

function buildViking1Group(): THREE.Group {
  const group = new THREE.Group();
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.42, metalness: 0.2 });
  const orangeMat = new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.48, metalness: 0.15 });
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.3, metalness: 0.8 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6, metalness: 0.45 });

  // Hexagonal lander deck
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.088, 0.088, 0.036, 6), whiteMat);
  body.position.y = 0.056;
  body.castShadow = true;
  group.add(body);

  // RTG thermal radiator covers
  const rtgL = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.03, 0.044), orangeMat);
  rtgL.position.set(-0.072, 0.072, 0);
  group.add(rtgL);
  const rtgR = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.03, 0.044), orangeMat);
  rtgR.position.set(0.072, 0.072, 0);
  group.add(rtgR);

  // 3 landing legs + circular footpads
  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI * 2) / 3 + Math.PI / 6;
    const cx = Math.cos(a);
    const sz = Math.sin(a);
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.082, 8), metalMat);
    leg.position.set(cx * 0.088, 0.034, sz * 0.088);
    leg.rotation.z = -cx * 0.5;
    leg.rotation.x = sz * 0.5;
    group.add(leg);

    const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.025, 0.008, 10), darkMat);
    pad.position.set(cx * 0.112, 0.004, sz * 0.112);
    group.add(pad);
  }

  // High-gain circular dish antenna on mast
  const dishMast = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.055, 6), metalMat);
  dishMast.position.set(0.02, 0.1, -0.02);
  group.add(dishMast);

  const dish = new THREE.Mesh(new THREE.ConeGeometry(0.042, 0.016, 14), whiteMat);
  dish.position.set(0.02, 0.132, -0.02);
  dish.rotation.x = Math.PI * 0.82;
  group.add(dish);

  // Twin camera turrets
  for (const sx of [-0.026, 0.018]) {
    const cam = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.032, 8), metalMat);
    cam.position.set(sx, 0.09, 0.025);
    group.add(cam);
  }

  // Extended robotic soil-scoop arm
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.095, 6), metalMat);
  arm.position.set(0, 0.05, 0.11);
  arm.rotation.x = Math.PI / 2.4;
  group.add(arm);

  return group;
}

function buildTwinRoverGroup(): THREE.Group {
  const group = new THREE.Group();
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.25, metalness: 0.88 });
  const solarMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.22, metalness: 0.65 });
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.42, metalness: 0.18 });
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.68, metalness: 0.42 });
  const strutMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.35, metalness: 0.78 });

  // Golden warm electronics box
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(0.084, 0.044, 0.105), goldMat);
  chassis.position.y = 0.052;
  chassis.castShadow = true;
  group.add(chassis);

  // Wide blue solar array wings
  const deck = new THREE.Mesh(new THREE.BoxGeometry(0.165, 0.008, 0.125), solarMat);
  deck.position.y = 0.078;
  deck.castShadow = true;
  group.add(deck);

  // 6 wheels on rocker-bogie struts
  const zOffsets = [-0.058, 0, 0.058];
  for (const side of [-1, 1]) {
    for (const wz of zOffsets) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.016, 12), wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(side * 0.068, 0.022, wz);
      group.add(wheel);

      const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.036, 6), strutMat);
      strut.position.set(side * 0.052, 0.038, wz);
      strut.rotation.z = side * 0.55;
      group.add(strut);
    }
  }

  // Tall white Pancam mast & stereo camera head
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.01, 0.088, 8), whiteMat);
  mast.position.set(0, 0.122, 0.035);
  group.add(mast);

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.048, 0.02, 0.024), whiteMat);
  head.position.set(0, 0.168, 0.038);
  group.add(head);

  // High-gain dish on aft deck
  const dish = new THREE.Mesh(new THREE.ConeGeometry(0.028, 0.012, 12), goldMat);
  dish.position.set(-0.03, 0.095, -0.038);
  dish.rotation.x = -Math.PI * 0.78;
  group.add(dish);

  return group;
}

function buildIngenuityGroup(): THREE.Group {
  const group = new THREE.Group();
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.24, metalness: 0.88 });
  const carbonMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.45, metalness: 0.35 });
  const solarMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.22, metalness: 0.65 });
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.32, metalness: 0.78 });

  // Gold Kapton fuselage box
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.054, 0.044, 0.054), goldMat);
  body.position.y = 0.056;
  body.castShadow = true;
  group.add(body);

  // 4 slender splayed carbon-fiber legs
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 + Math.PI / 4;
    const cx = Math.cos(a);
    const sz = Math.sin(a);
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.084, 6), carbonMat);
    leg.position.set(cx * 0.052, 0.036, sz * 0.052);
    leg.rotation.z = -cx * 0.62;
    leg.rotation.x = sz * 0.62;
    group.add(leg);
  }

  // Central rotor mast
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.006, 0.088, 8), metalMat);
  mast.position.y = 0.12;
  group.add(mast);

  // Twin coaxial black carbon-fiber rotor blades
  const lowerBlade = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.004, 0.018), carbonMat);
  lowerBlade.position.y = 0.125;
  lowerBlade.rotation.y = 0.4;
  group.add(lowerBlade);

  const upperBlade = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.004, 0.018), carbonMat);
  upperBlade.position.y = 0.148;
  upperBlade.rotation.y = -0.65;
  group.add(upperBlade);

  // Top solar panel cap
  const solarCap = new THREE.Mesh(new THREE.BoxGeometry(0.072, 0.006, 0.042), solarMat);
  solarCap.position.y = 0.166;
  group.add(solarCap);

  return group;
}

function disposeObject3D(root: THREE.Object3D, skipTextures?: Set<THREE.Texture>) {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.geometry) {
      mesh.geometry.dispose();
    }
    if (mesh.material) {
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const m of mats) {
        const std = m as THREE.MeshStandardMaterial;
        if (std.map && !skipTextures?.has(std.map)) std.map.dispose();
        if (std.normalMap && !skipTextures?.has(std.normalMap)) std.normalMap.dispose();
        if (std.roughnessMap && !skipTextures?.has(std.roughnessMap)) std.roughnessMap.dispose();
        if (std.metalnessMap && !skipTextures?.has(std.metalnessMap)) std.metalnessMap.dispose();
        if (std.bumpMap && !skipTextures?.has(std.bumpMap)) std.bumpMap.dispose();
        m.dispose();
      }
    }
  });
}

// Module-scope reusable math objects (zero GC in render loop)
const _projVec = new THREE.Vector3();
const _camDir = new THREE.Vector3();
const _ptDir = new THREE.Vector3();
const _targetCamPos = new THREE.Vector3();
const _desiredTarget = new THREE.Vector3();

export const Mars3DCanvas: React.FC<Mars3DCanvasProps> = ({
  artifacts,
  selectedArtifact,
  onSelectArtifact,
  zoomCommand,
  resetSeq,
}) => {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [lucyMode, setLucyMode] = useState<LucyMode>('waving');
  const [lucyFacing, setLucyFacing] = useState<'left' | 'right'>('right');
  const [spotScreens, setSpotScreens] = useState<
    Record<string, { x: number; y: number; visible: boolean }>
  >({});
  const [lucyScreen, setLucyScreen] = useState<{
    x: number;
    y: number;
    size: number;
    visible: boolean;
  }>({
    x: 0,
    y: 0,
    size: 112,
    visible: false,
  });

  const sceneRef = useRef<{
    camera: THREE.PerspectiveCamera;
    controls: OrbitControls;
    spotAnchors: Map<string, THREE.Vector3>;
    lucySpherical: { currentLat: number; currentLon: number; targetLat: number; targetLon: number };
    camTransition: { active: boolean; desiredPos: THREE.Vector3; desiredTarget: THREE.Vector3 };
    requestRender: () => void;
  } | null>(null);

  const artifactsRef = useRef<ArtifactInfo[]>(artifacts);
  artifactsRef.current = artifacts;

  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;

    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 560;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.06;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    // Studio environment reflection for metallic solar panels & gold thermal foil
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envTarget.texture;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    // Start facing Meridiani Planum, Chryse Planitia, Valles Marineris, and Syrtis Major
    camera.position.set(0.42, 0.45, 5.2);

    // Warm Solar lighting + subtle cool sky/dust hemisphere fill
    const marsFill = new THREE.HemisphereLight(0xfdba74, 0x2a1410, 0.34);
    scene.add(marsFill);

    const solarKeyLight = new THREE.DirectionalLight(0xfff7ed, 2.75);
    solarKeyLight.position.set(7.5, 3.0, 5.5);
    solarKeyLight.castShadow = !isSoftwareGl;
    solarKeyLight.shadow.mapSize.set(1024, 1024);
    solarKeyLight.shadow.bias = -0.0005;
    solarKeyLight.shadow.normalBias = 0.02;
    scene.add(solarKeyLight);

    // Subtle deep-space background stars
    const starCount = 260;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const theta = (i * 2.399963) % (Math.PI * 2);
      const phi = Math.acos(1 - (2 * (i + 0.5)) / starCount);
      const dist = 22 + (i % 11) * 1.8;
      starPositions[i * 3] = dist * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = dist * Math.cos(phi);
      starPositions[i * 3 + 2] = dist * Math.sin(phi) * Math.sin(theta);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xe2e8f0,
      size: 0.08,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.78,
    });
    scene.add(new THREE.Points(starGeo, starMat));

    // Generate Real Martian Textures & 3D Displaced Terrain
    const {
      albedoMap,
      normalMap,
      roughnessMap,
      heightField,
      width: texW,
      height: texH,
    } = generateRealMarsAssets();
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    albedoMap.anisotropy = maxAniso;
    normalMap.anisotropy = maxAniso;
    roughnessMap.anisotropy = maxAniso;

    const marsGeo = new THREE.SphereGeometry(BASE_MARS_RADIUS, 128, 96);
    const posAttr = marsGeo.attributes.position;
    const uvAttr = marsGeo.attributes.uv;
    const displacementScale = 0.044;
    const vPos = new THREE.Vector3();

    for (let i = 0; i < posAttr.count; i++) {
      const u = uvAttr.getX(i);
      const v = 1 - uvAttr.getY(i);
      const px = Math.min(texW - 1, Math.max(0, Math.floor(u * (texW - 1))));
      const py = Math.min(texH - 1, Math.max(0, Math.floor(v * (texH - 1))));
      const h = heightField[py * texW + px] ?? 0;

      vPos.fromBufferAttribute(posAttr, i).normalize();
      vPos.multiplyScalar(BASE_MARS_RADIUS + h * displacementScale);
      posAttr.setXYZ(i, vPos.x, vPos.y, vPos.z);
    }
    posAttr.needsUpdate = true;
    marsGeo.computeVertexNormals();

    const marsMat = new THREE.MeshStandardMaterial({
      map: albedoMap,
      normalMap,
      normalScale: new THREE.Vector2(1.45, 1.45),
      roughnessMap,
      roughness: 0.92,
      metalness: 0.02,
    });

    const marsGroup = new THREE.Group();
    const marsMesh = new THREE.Mesh(marsGeo, marsMat);
    // Align Prime Meridian (u = 0.5, lon = 0°) toward +Z to match latLonToVec3
    marsMesh.rotation.y = -Math.PI / 2;
    marsMesh.castShadow = true;
    marsMesh.receiveShadow = true;
    marsGroup.add(marsMesh);

    // Thin dusty Martian atmospheric limb scattering halo
    const atmoGeo = new THREE.SphereGeometry(BASE_MARS_RADIUS * 1.036, 64, 48);
    const atmoMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      uniforms: {
        uSunDir: { value: new THREE.Vector3(7.5, 3.0, 5.5).normalize() },
      },
      vertexShader: `
        varying vec3 vNormalWorld;
        varying vec3 vWorldPos;
        void main() {
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPos = worldPos.xyz;
          vNormalWorld = normalize(mat3(modelMatrix) * normal);
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uSunDir;
        varying vec3 vNormalWorld;
        varying vec3 vWorldPos;
        void main() {
          vec3 viewDir = normalize(cameraPosition - vWorldPos);
          float rim = pow(clamp(0.68 - dot(viewDir, -vNormalWorld), 0.0, 1.0), 3.2);
          float sunSide = clamp(dot(vNormalWorld, uSunDir) * 0.65 + 0.45, 0.12, 1.0);
          vec3 marsHaze = vec3(0.95, 0.54, 0.34);
          gl_FragColor = vec4(marsHaze, rim * sunSide * 0.42);
        }
      `,
    });
    const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
    marsGroup.add(atmoMesh);

    // Mount the 3 proportional 3D Martian spacecraft models flush on the displaced terrain
    const upVec = new THREE.Vector3(0, 1, 0);
    const modelConfigs: Array<{ id: string; lat: number; lon: number; build: () => THREE.Group }> = [
      { id: 'viking-1', lat: 22.27, lon: -47.95, build: buildViking1Group },
      { id: 'spirit-opportunity', lat: -1.95, lon: -5.53, build: buildTwinRoverGroup },
      { id: 'ingenuity', lat: 18.38, lon: 77.58, build: buildIngenuityGroup },
    ];

    for (const cfg of modelConfigs) {
      const h = sampleHeightAtLatLon(cfg.lat, cfg.lon, heightField, texW, texH);
      const pos = latLonToVec3(cfg.lat, cfg.lon, BASE_MARS_RADIUS + h * displacementScale);
      const model = cfg.build();
      model.position.copy(pos);
      model.quaternion.setFromUnitVectors(upVec, pos.clone().normalize());
      marsGroup.add(model);
    }

    scene.add(marsGroup);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.enablePan = true;
    controls.minDistance = 2.65;
    controls.maxDistance = 10.5;
    controls.rotateSpeed = 0.72;
    controls.zoomSpeed = 0.9;

    const spotAnchors = new Map<string, THREE.Vector3>();
    for (const a of artifactsRef.current) {
      const coord = MARS_SPHERICAL[a.id] ?? { lat: 0, lon: 0 };
      const h = sampleHeightAtLatLon(coord.lat, coord.lon, heightField, texW, texH);
      spotAnchors.set(
        a.id,
        latLonToVec3(coord.lat, coord.lon, BASE_MARS_RADIUS + h * displacementScale + 0.03)
      );
    }

    const lucySpherical = {
      currentLat: 8,
      currentLon: -18,
      targetLat: 8,
      targetLon: -18,
    };

    const camTransition = {
      active: false,
      desiredPos: new THREE.Vector3().copy(camera.position),
      desiredTarget: new THREE.Vector3(0, 0, 0),
    };

    controls.addEventListener('start', () => {
      camTransition.active = false;
    });

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    let frameId = 0;
    let disposed = false;
    let renderBusy = false;
    let renderDirty = false;
    let lastClock = performance.now();

    function projectOverlays() {
      const w = container?.clientWidth || 800;
      const h = container?.clientHeight || 560;
      const nextSpots: Record<string, { x: number; y: number; visible: boolean }> = {};

      _camDir.copy(camera.position).sub(controls.target).normalize();

      for (const a of artifactsRef.current) {
        const anchor = spotAnchors.get(a.id);
        if (!anchor) continue;

        _ptDir.copy(anchor).normalize();
        const facingDot = _ptDir.dot(_camDir);

        _projVec.copy(anchor).project(camera);
        const sx = ((_projVec.x + 1) / 2) * w;
        const sy = ((-_projVec.y + 1) / 2) * h;

        nextSpots[a.id] = {
          x: sx,
          y: sy,
          visible: facingDot > -0.05 && _projVec.z < 1,
        };
      }
      setSpotScreens(nextSpots);

      latLonToVec3(lucySpherical.currentLat, lucySpherical.currentLon, BASE_MARS_RADIUS + 0.04, _projVec);
      _ptDir.copy(_projVec).normalize();
      const lucyDot = _ptDir.dot(_camDir);
      const distToLucy = camera.position.distanceTo(_projVec);
      const dynamicSize = THREE.MathUtils.clamp(Math.round(430 / Math.max(2.0, distToLucy)), 92, 168);
      _projVec.project(camera);
      setLucyScreen({
        x: ((_projVec.x + 1) / 2) * w,
        y: ((-_projVec.y + 1) / 2) * h,
        size: dynamicSize,
        visible: lucyDot > -0.1 && _projVec.z < 1,
      });
    }

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function requestRender() {
      if (disposed) return;
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = requestAnimationFrame((now) => {
        if (disposed) return;
        const dt = Math.min(0.05, Math.max(0.001, (now - lastClock) / 1000));
        lastClock = now;
        renderDirty = false;

        let needsAnotherFrame = false;

        if (camTransition.active) {
          camera.position.x = THREE.MathUtils.damp(camera.position.x, camTransition.desiredPos.x, 6, dt);
          camera.position.y = THREE.MathUtils.damp(camera.position.y, camTransition.desiredPos.y, 6, dt);
          camera.position.z = THREE.MathUtils.damp(camera.position.z, camTransition.desiredPos.z, 6, dt);

          controls.target.x = THREE.MathUtils.damp(controls.target.x, camTransition.desiredTarget.x, 6, dt);
          controls.target.y = THREE.MathUtils.damp(controls.target.y, camTransition.desiredTarget.y, 6, dt);
          controls.target.z = THREE.MathUtils.damp(controls.target.z, camTransition.desiredTarget.z, 6, dt);

          if (
            camera.position.distanceTo(camTransition.desiredPos) < 0.02 &&
            controls.target.distanceTo(camTransition.desiredTarget) < 0.02
          ) {
            camTransition.active = false;
          } else {
            needsAnotherFrame = true;
          }
        }

        const dLat = lucySpherical.targetLat - lucySpherical.currentLat;
        const dLon = lucySpherical.targetLon - lucySpherical.currentLon;
        if (Math.abs(dLat) > 0.15 || Math.abs(dLon) > 0.15) {
          lucySpherical.currentLat = THREE.MathUtils.damp(lucySpherical.currentLat, lucySpherical.targetLat, 4.5, dt);
          lucySpherical.currentLon = THREE.MathUtils.damp(lucySpherical.currentLon, lucySpherical.targetLon, 4.5, dt);
          needsAnotherFrame = true;
        } else if (
          lucySpherical.currentLat !== lucySpherical.targetLat ||
          lucySpherical.currentLon !== lucySpherical.targetLon
        ) {
          lucySpherical.currentLat = lucySpherical.targetLat;
          lucySpherical.currentLon = lucySpherical.targetLon;
          setLucyMode('idle');
          setLucyFacing('right');
        }

        if (controls.update()) {
          needsAnotherFrame = true;
        }

        renderer.render(scene, camera);
        projectOverlays();

        const done = () => {
          renderBusy = false;
          if (renderDirty || needsAnotherFrame) {
            requestRender();
          }
        };

        if (isSoftwareGl) {
          afterDraw(done);
        } else {
          done();
        }
      });
    }

    controls.addEventListener('change', requestRender);

    const resizeObserver = new ResizeObserver(() => {
      if (disposed || !container) return;
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 560;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      requestRender();
    });
    resizeObserver.observe(container);

    sceneRef.current = {
      camera,
      controls,
      spotAnchors,
      lucySpherical,
      camTransition,
      requestRender,
    };

    requestRender();

    const sharedTextures = new Set<THREE.Texture>([albedoMap, normalMap, roughnessMap]);

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      controls.dispose();
      envTarget.dispose();
      disposeObject3D(scene, sharedTextures);
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    const ctx = sceneRef.current;
    if (!ctx) return;

    if (!selectedArtifact) {
      setLucyMode('waving');
      return;
    }

    const coord = MARS_SPHERICAL[selectedArtifact.id] ?? { lat: 0, lon: 0 };
    const anchor =
      ctx.spotAnchors.get(selectedArtifact.id) ??
      latLonToVec3(coord.lat, coord.lon, BASE_MARS_RADIUS);

    const targetLucyLon = coord.lon - 7;
    const targetLucyLat = coord.lat - 2;
    setLucyFacing(targetLucyLon >= ctx.lucySpherical.currentLon ? 'right' : 'left');
    setLucyMode('walking');
    ctx.lucySpherical.targetLat = targetLucyLat;
    ctx.lucySpherical.targetLon = targetLucyLon;

    _targetCamPos.copy(anchor).normalize().multiplyScalar(3.35);
    _desiredTarget.copy(anchor).multiplyScalar(0.68);

    ctx.camTransition.desiredPos.copy(_targetCamPos);
    ctx.camTransition.desiredTarget.copy(_desiredTarget);
    ctx.camTransition.active = true;
    ctx.requestRender();
  }, [selectedArtifact]);

  useEffect(() => {
    const ctx = sceneRef.current;
    if (!ctx || !zoomCommand) return;

    const currentOffset = ctx.camera.position.clone().sub(ctx.controls.target);
    const currentDist = currentOffset.length();
    const factor = zoomCommand.delta > 0 ? 0.8 : 1.25;
    const nextDist = THREE.MathUtils.clamp(currentDist * factor, 2.55, 10.5);
    currentOffset.normalize().multiplyScalar(nextDist);

    ctx.camTransition.desiredPos.copy(ctx.controls.target).add(currentOffset);
    ctx.camTransition.desiredTarget.copy(ctx.controls.target);
    ctx.camTransition.active = true;
    ctx.requestRender();
  }, [zoomCommand]);

  useEffect(() => {
    const ctx = sceneRef.current;
    if (!ctx || resetSeq === 0) return;

    ctx.camTransition.desiredPos.set(0.42, 0.45, 5.2);
    ctx.camTransition.desiredTarget.set(0, 0, 0);
    ctx.camTransition.active = true;
    ctx.requestRender();
  }, [resetSeq]);

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-[#08040E]">
      <div ref={canvasMountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {artifacts.map((artifact) => {
          const pos = spotScreens[artifact.id];
          if (!pos || !pos.visible) return null;
          const isSelected = selectedArtifact?.id === artifact.id;
          const isHovered = hoveredId === artifact.id;

          return (
            <div
              key={artifact.id}
              style={{
                transform: `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`,
              }}
              className="absolute top-0 left-0 pointer-events-auto z-20"
            >
              {(isHovered || isSelected) && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 rounded-xl bg-[#1E255E] text-white border-2 border-[#FACC15] shadow-lg whitespace-nowrap pointer-events-none">
                  <span className="font-display text-xs sm:text-sm font-bold">
                    {artifact.name}
                  </span>
                </div>
              )}

              <button
                type="button"
                onClick={() => onSelectArtifact(artifact)}
                onMouseEnter={() => setHoveredId(artifact.id)}
                onMouseLeave={() => setHoveredId((cur) => (cur === artifact.id ? null : cur))}
                onFocus={() => setHoveredId(artifact.id)}
                onBlur={() => setHoveredId((cur) => (cur === artifact.id ? null : cur))}
                aria-label={`Visit ${artifact.name}`}
                className="relative flex items-center justify-center w-10 h-10 rounded-full cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#38BDF8]"
              >
                <span
                  className={`absolute w-7 h-7 rounded-full border-2 ${
                    isSelected
                      ? 'border-[#38BDF8] bg-[#38BDF8]/30 scale-125'
                      : 'border-[#FACC15] bg-[#FACC15]/25'
                  } transition-transform`}
                  aria-hidden="true"
                />
                <span
                  className={`relative w-4 h-4 rounded-full border-2 border-[#1E255E] shadow-md transition-transform ${
                    isSelected || isHovered ? 'scale-125 bg-white' : 'bg-[#FACC15]'
                  }`}
                />
              </button>
            </div>
          );
        })}

        {lucyScreen.visible && (
          <div
            style={{
              transform: `translate3d(${lucyScreen.x}px, ${lucyScreen.y}px, 0) translate(-50%, -82%)`,
            }}
            className="absolute top-0 left-0 z-10 pointer-events-none"
          >
            <LucyAvatar
              mode={lucyMode}
              facing={lucyFacing}
              size={lucyScreen.size}
              showSpeechBubble={false}
            />
          </div>
        )}
      </div>
    </div>
  );
};
