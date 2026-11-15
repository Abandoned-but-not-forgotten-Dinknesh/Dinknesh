import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { ArtifactInfo } from '../data/artifacts';
import { generateRealMoonAssets } from '../lib/realMoonGenerator';
import { LucyAvatar, type LucyMode } from './LucyAvatar';

interface Moon3DCanvasProps {
  artifacts: ArtifactInfo[];
  selectedArtifact: ArtifactInfo | null;
  onSelectArtifact: (artifact: ArtifactInfo) => void;
  zoomCommand: { seq: number; delta: number } | null;
  resetSeq: number;
}

// Exact real lunar spherical coordinates (~964 km apart)
const ARTIFACT_SPHERICAL: Record<string, { lat: number; lon: number }> = {
  'apollo-11': { lat: 0.674, lon: 23.473 },
  'apollo-15': { lat: 26.132, lon: 3.634 },
};

const BASE_MOON_RADIUS = 2.0;

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
  const u = (lonDeg / 360 + 0.5) % 1;
  const v = THREE.MathUtils.clamp(0.5 - latDeg / 180, 0, 0.999);
  const px = Math.floor(u * width) % width;
  const py = Math.floor(v * height);
  return heightField[py * width + px] ?? 0;
}

function buildMiniLanderGroup(includeRover: boolean): THREE.Group {
  const group = new THREE.Group();
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    roughness: 0.28,
    metalness: 0.86,
  });
  const foilMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    roughness: 0.35,
    metalness: 0.82,
  });
  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.55,
    metalness: 0.55,
  });
  const lightMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.45,
    metalness: 0.35,
  });

  // Octagonal Golden Kapton Descent Stage body
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.088, 0.096, 0.058, 8), goldMat);
  body.position.y = 0.062;
  body.castShadow = true;
  group.add(body);

  // Upper separation deck ring
  const topRing = new THREE.Mesh(new THREE.CylinderGeometry(0.064, 0.068, 0.014, 12), darkMat);
  topRing.position.y = 0.095;
  group.add(topRing);

  // Descent engine bell beneath body
  const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.034, 0.03, 12), darkMat);
  nozzle.position.y = 0.024;
  group.add(nozzle);

  // 4 splayed landing legs + golden footpads
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2 + Math.PI / 4;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.09, 8), lightMat);
    leg.position.set(cos * 0.092, 0.036, sin * 0.092);
    leg.rotation.z = -cos * 0.52;
    leg.rotation.x = sin * 0.52;
    group.add(leg);

    const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.028, 0.009, 10), foilMat);
    pad.position.set(cos * 0.118, 0.005, sin * 0.118);
    group.add(pad);
  }

  if (includeRover) {
    // Apollo 15 Lunar Roving Vehicle (Moon Buggy) parked beside Falcon
    const roverGroup = new THREE.Group();
    roverGroup.position.set(0.18, 0, 0.05);

    const chassis = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.016, 0.052), lightMat);
    chassis.position.y = 0.024;
    roverGroup.add(chassis);

    const dishMast = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.045, 6), darkMat);
    dishMast.position.set(0.028, 0.048, 0);
    roverGroup.add(dishMast);

    const dish = new THREE.Mesh(new THREE.ConeGeometry(0.026, 0.014, 12), goldMat);
    dish.position.set(0.028, 0.072, 0);
    dish.rotation.x = Math.PI;
    roverGroup.add(dish);

    for (const wx of [-0.032, 0.032]) {
      for (const wz of [-0.03, 0.03]) {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.01, 10), darkMat);
        wheel.rotation.x = Math.PI / 2;
        wheel.position.set(wx, 0.016, wz);
        roverGroup.add(wheel);
      }
    }
    group.add(roverGroup);
  } else {
    // Apollo 11 Flag planted beside Eagle Descent Stage
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.11, 6), lightMat);
    pole.position.set(0.15, 0.055, 0.04);
    group.add(pole);

    const flagMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.6 });
    const flag = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.034, 0.004), flagMat);
    flag.position.set(0.178, 0.092, 0.04);
    group.add(flag);
  }

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

export const Moon3DCanvas: React.FC<Moon3DCanvasProps> = ({
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
    renderer.toneMappingExposure = 1.05;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    // Start looking at the Earth-facing near side with Mare Tranquillitatis & Mare Imbrium clearly visible
    camera.position.set(0.55, 0.6, 5.2);

    // Authentic Solar illumination + subtle cool Earthshine fill on the night side
    const earthshineFill = new THREE.HemisphereLight(0x94a3b8, 0x1e293b, 0.28);
    scene.add(earthshineFill);

    const solarKeyLight = new THREE.DirectionalLight(0xfffcf5, 2.85);
    solarKeyLight.position.set(7.5, 3.2, 5.2);
    solarKeyLight.castShadow = !isSoftwareGl;
    solarKeyLight.shadow.mapSize.set(1024, 1024);
    solarKeyLight.shadow.bias = -0.0005;
    solarKeyLight.shadow.normalBias = 0.02;
    scene.add(solarKeyLight);

    // Subtle deep-space background stars (varied brightness & small authentic sizes)
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
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // Generate Real Lunar Textures & 3D Displaced Geometry
    const {
      albedoMap,
      normalMap,
      roughnessMap,
      heightField,
      width: texW,
      height: texH,
    } = generateRealMoonAssets();
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    albedoMap.anisotropy = maxAniso;
    normalMap.anisotropy = maxAniso;
    roughnessMap.anisotropy = maxAniso;

    const moonGeo = new THREE.SphereGeometry(BASE_MOON_RADIUS, 128, 96);
    const posAttr = moonGeo.attributes.position;
    const uvAttr = moonGeo.attributes.uv;
    const displacementScale = 0.036;
    const vPos = new THREE.Vector3();

    for (let i = 0; i < posAttr.count; i++) {
      const u = uvAttr.getX(i);
      const v = 1 - uvAttr.getY(i);
      const px = Math.min(texW - 1, Math.max(0, Math.floor(u * (texW - 1))));
      const py = Math.min(texH - 1, Math.max(0, Math.floor(v * (texH - 1))));
      const h = heightField[py * texW + px] ?? 0;

      vPos.fromBufferAttribute(posAttr, i).normalize();
      vPos.multiplyScalar(BASE_MOON_RADIUS + h * displacementScale);
      posAttr.setXYZ(i, vPos.x, vPos.y, vPos.z);
    }
    posAttr.needsUpdate = true;
    moonGeo.computeVertexNormals();

    const moonMat = new THREE.MeshStandardMaterial({
      map: albedoMap,
      normalMap,
      normalScale: new THREE.Vector2(1.35, 1.35),
      roughnessMap,
      roughness: 0.94,
      metalness: 0.02,
    });

    const moonGroup = new THREE.Group();
    const moonMesh = new THREE.Mesh(moonGeo, moonMat);
    // Align Prime Meridian (u = 0.5, lon = 0°) toward +Z to match latLonToVec3
    moonMesh.rotation.y = -Math.PI / 2;
    moonMesh.castShadow = true;
    moonMesh.receiveShadow = true;
    moonGroup.add(moonMesh);

    // Place tiny proportional 3D Apollo 11 & Apollo 15 mini-artifacts flush on the displaced terrain
    const upVec = new THREE.Vector3(0, 1, 0);
    const a11H = sampleHeightAtLatLon(0.674, 23.473, heightField, texW, texH);
    const a11Radius = BASE_MOON_RADIUS + a11H * displacementScale;
    const a11Pos = latLonToVec3(0.674, 23.473, a11Radius);
    const a11Lander = buildMiniLanderGroup(false);
    a11Lander.position.copy(a11Pos);
    a11Lander.quaternion.setFromUnitVectors(upVec, a11Pos.clone().normalize());
    moonGroup.add(a11Lander);

    const a15H = sampleHeightAtLatLon(26.132, 3.634, heightField, texW, texH);
    const a15Radius = BASE_MOON_RADIUS + a15H * displacementScale;
    const a15Pos = latLonToVec3(26.132, 3.634, a15Radius);
    const a15Lander = buildMiniLanderGroup(true);
    a15Lander.position.copy(a15Pos);
    a15Lander.quaternion.setFromUnitVectors(upVec, a15Pos.clone().normalize());
    moonGroup.add(a15Lander);

    scene.add(moonGroup);

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
      const coord = ARTIFACT_SPHERICAL[a.id] ?? { lat: 0, lon: 0 };
      const h = sampleHeightAtLatLon(coord.lat, coord.lon, heightField, texW, texH);
      spotAnchors.set(
        a.id,
        latLonToVec3(coord.lat, coord.lon, BASE_MOON_RADIUS + h * displacementScale + 0.03)
      );
    }

    const lucySpherical = {
      currentLat: 6,
      currentLon: -8,
      targetLat: 6,
      targetLon: -8,
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

      latLonToVec3(lucySpherical.currentLat, lucySpherical.currentLon, BASE_MOON_RADIUS + 0.04, _projVec);
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

    const coord = ARTIFACT_SPHERICAL[selectedArtifact.id] ?? { lat: 0, lon: 0 };
    const anchor = ctx.spotAnchors.get(selectedArtifact.id) ?? latLonToVec3(coord.lat, coord.lon, BASE_MOON_RADIUS);

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

    ctx.camTransition.desiredPos.set(0.55, 0.6, 5.2);
    ctx.camTransition.desiredTarget.set(0, 0, 0);
    ctx.camTransition.active = true;
    ctx.requestRender();
  }, [resetSeq]);

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-[#040714]">
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
