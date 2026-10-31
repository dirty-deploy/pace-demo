import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

export type SceneHandle = { setTarget: (p: number) => void; dispose: () => void };

type Pose = { x: number; y: number; z: number; rx: number; ry: number; rz: number; sx: number; sy: number; glow: number };
type Chapter = { cam: [number, number, number]; look: [number, number, number]; slabs: Pose[] };

const W = 1.3;
const H = 1.85;
const D = 0.16;

const P = (x: number, y: number, z: number, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, glow = 0.3): Pose => ({ x, y, z, rx, ry, rz, sx, sy, glow });

// Chapter 1: five slabs in a ranked row, the first lifted and glowing gold.
const ch0: Chapter = {
  cam: [0, 1.15, 8.2],
  look: [0, 1.15, 0],
  slabs: [0, 1, 2, 3, 4].map((i) => P((i - 2) * 1.62, i === 0 ? 0.3 : -0.05 - i * 0.02, -Math.abs(i - 2) * 0.3, -0.1, -(i - 2) * 0.1, 0, 1, 1, [1, 0.5, 0.32, 0.2, 0.12][i])),
};
// Chapter 2: one slab comes forward; the ring timer closes around it.
const ch1: Chapter = {
  cam: [0, 0.2, 7.8],
  look: [-1.9, 0.2, 0],
  slabs: [
    P(-2.3, 0.4, -2.2, 0, 0.35, 0, 1, 1, 0.1),
    P(-1.2, -0.5, -1.4, 0, 0.3, 0, 1, 1, 0.1),
    P(0, 0, 0.5, 0, 0, 0, 1.2, 1.2, 0.75),
    P(2.4, 0.5, -1.8, 0, -0.3, 0, 1, 1, 0.1),
    P(3.5, -0.4, -2.6, 0, -0.35, 0, 1, 1, 0.08),
  ],
};
// Chapter 3: slabs lie flat along a horizontal timeline.
const ch2: Chapter = {
  cam: [0, 5.2, 6.4],
  look: [0, -0.3, -1.3],
  slabs: [0, 1, 2, 3, 4].map((i) => P((i - 2) * 1.75, 0, 0, -Math.PI / 2, 0, 0, 1, 1, 0.35)),
};
// Chapter 4: slabs stack into a short checklist.
const ch3: Chapter = {
  cam: [0, 0, 8.4],
  look: [-1.8, 0, 0],
  slabs: [0, 1, 2, 3, 4].map((i) => P(0.05, 1.15 - i * 0.58, 0, 0, -0.12, 0, 1.95, 0.19, i < 2 ? 0.6 : 0.18)),
};
const CHAPTERS = [ch0, ch1, ch2, ch3];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);

function glowTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(247,210,122,1)');
  grad.addColorStop(0.35, 'rgba(233,176,74,0.55)');
  grad.addColorStop(1, 'rgba(233,176,74,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function roundedRectPoints(w: number, h: number, r: number, n = 10): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  const hw = w / 2;
  const hh = h / 2;
  const corner = (cx: number, cy: number, a0: number) => {
    for (let i = 0; i <= n; i++) {
      const a = a0 + (i / n) * (Math.PI / 2);
      pts.push(new THREE.Vector3(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 0));
    }
  };
  corner(hw - r, hh - r, 0);
  corner(-hw + r, hh - r, Math.PI / 2);
  corner(-hw + r, -hh + r, Math.PI);
  corner(hw - r, -hh + r, Math.PI * 1.5);
  return pts;
}

export function createScene(canvas: HTMLCanvasElement, host: HTMLElement): SceneHandle {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60);

  scene.add(new THREE.AmbientLight(0xf3ede4, 0.75));
  const key = new THREE.DirectionalLight(0xfff0d8, 2.1);
  key.position.set(3, 5, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xe9b04a, 1.1);
  rim.position.set(-5, 1, -3);
  scene.add(rim);

  const slabGeo = new RoundedBoxGeometry(W, H, D, 4, 0.1);
  const glowTex = glowTexture();
  const outlinePts = roundedRectPoints(W, H, 0.1);
  const outlineGeo = new THREE.BufferGeometry().setFromPoints(outlinePts);
  const disposables: { dispose: () => void }[] = [slabGeo, glowTex, outlineGeo];

  type Slab = { group: THREE.Group; body: THREE.Mesh; glow: THREE.Mesh; mat: THREE.MeshPhysicalMaterial; glowMat: THREE.MeshBasicMaterial; edgeMats: THREE.LineBasicMaterial[]; scatter: THREE.Vector3; seed: number };
  const slabs: Slab[] = [];
  for (let i = 0; i < 5; i++) {
    const group = new THREE.Group();
    const mat = new THREE.MeshPhysicalMaterial({ color: 0x241c29, transparent: true, opacity: 0.8, roughness: 0.42, metalness: 0.1, clearcoat: 0.5, clearcoatRoughness: 0.4 });
    const body = new THREE.Mesh(slabGeo, mat);
    group.add(body);
    const edgeMats: THREE.LineBasicMaterial[] = [];
    for (const z of [D / 2 + 0.002, -D / 2 - 0.002]) {
      const m = new THREE.LineBasicMaterial({ color: 0xf3ede4, transparent: true, opacity: 0.55 });
      edgeMats.push(m);
      const line = new THREE.LineLoop(outlineGeo, m);
      line.position.z = z;
      group.add(line);
    }
    const glowMat = new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.4 });
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(W * 1.7, 0.95), glowMat);
    glow.position.set(0, -H / 2 - 0.06, 0.02);
    group.add(glow);
    disposables.push(mat, glowMat, glow.geometry, ...edgeMats);
    const rand = (k: number) => Math.sin(i * 12.9898 + k * 78.233) * 43758.5453 % 1;
    slabs.push({ group, body, glow, mat, glowMat, edgeMats, scatter: new THREE.Vector3(rand(1) * 5, rand(2) * 3, rand(3) * 4 - 2), seed: i * 1.7 });
    scene.add(group);
  }

  // Ring timer for chapter 2.
  const SEG = 120;
  const ringTrackMat = new THREE.MeshBasicMaterial({ color: 0xf3ede4, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
  const ringArcMat = new THREE.MeshBasicMaterial({ color: 0xe9b04a, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
  const ringTrackGeo = new THREE.RingGeometry(1.5, 1.515, 128);
  const ringArcGeo = new THREE.RingGeometry(1.49, 1.53, SEG);
  const ringTrack = new THREE.Mesh(ringTrackGeo, ringTrackMat);
  const ringArc = new THREE.Mesh(ringArcGeo, ringArcMat);
  ringArc.rotation.z = Math.PI / 2;
  ringArc.scale.x = -1;
  scene.add(ringTrack, ringArc);
  disposables.push(ringTrackMat, ringArcMat, ringTrackGeo, ringArcGeo);

  // Tick marks for chapter 3.
  const tickPos: number[] = [];
  for (let i = -20; i <= 20; i++) {
    const x = i * 0.22;
    const len = i % 5 === 0 ? 0.32 : 0.15;
    tickPos.push(x, 0, 1.72, x, 0, 1.72 + len);
  }
  tickPos.push(-4.6, 0, 1.72, 4.6, 0, 1.72);
  const tickGeo = new THREE.BufferGeometry();
  tickGeo.setAttribute('position', new THREE.Float32BufferAttribute(tickPos, 3));
  const tickMat = new THREE.LineBasicMaterial({ color: 0xf3ede4, transparent: true, opacity: 0 });
  const ticks = new THREE.LineSegments(tickGeo, tickMat);
  ticks.position.y = -0.02;
  scene.add(ticks);
  disposables.push(tickGeo, tickMat);

  // Check discs for chapter 4.
  const checkGeo = new THREE.RingGeometry(0.1, 0.125, 32);
  const checkFillGeo = new THREE.CircleGeometry(0.1, 32);
  const checks: { ring: THREE.Mesh; fill: THREE.Mesh; mats: THREE.MeshBasicMaterial[] }[] = [];
  for (let i = 0; i < 5; i++) {
    const rm = new THREE.MeshBasicMaterial({ color: i < 2 ? 0xe9b04a : 0xf3ede4, transparent: true, opacity: 0 });
    const fm = new THREE.MeshBasicMaterial({ color: 0xe9b04a, transparent: true, opacity: 0 });
    const ring = new THREE.Mesh(checkGeo, rm);
    const fill = new THREE.Mesh(checkFillGeo, fm);
    ring.position.set(0, 1.15 - i * 0.58, 0.2);
    fill.position.copy(ring.position);
    fill.visible = i < 2;
    scene.add(ring, fill);
    checks.push({ ring, fill, mats: [rm, fm] });
    disposables.push(rm, fm);
  }
  disposables.push(checkGeo, checkFillGeo);

  // ---- state ----
  let target = 0;
  let current = 0;
  let intro = 0;
  let running = true;
  let visible = true;
  let raf = 0;
  let last = performance.now();
  let tAcc = 0;

  const resize = () => {
    const w = host.clientWidth || window.innerWidth;
    const h = host.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(host);

  const io = new IntersectionObserver((es) => {
    visible = es[0]?.isIntersecting ?? true;
    kick();
  });
  io.observe(host);
  const onVis = () => kick();
  document.addEventListener('visibilitychange', onVis);

  const pose = new THREE.Vector3();
  const lookV = new THREE.Vector3();

  function frame(now: number) {
    raf = 0;
    if (!running || !visible || document.hidden) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    tAcc += dt;
    intro = Math.min(1, intro + dt / 2.4);
    current += (target - current) * Math.min(1, dt * 4.5);

    const c = Math.min(CHAPTERS.length - 1, Math.max(0, Math.floor(current)));
    const n = Math.min(CHAPTERS.length - 1, c + 1);
    const f = smooth(Math.min(1, Math.max(0, current - c)));
    const A = CHAPTERS[c];
    const B = CHAPTERS[n];
    const introE = 1 - Math.pow(1 - intro, 3);
    const scatterAmt = (1 - introE) * Math.max(0, 1 - current);

    // camera, with extra distance on narrow viewports so the row still fits
    const fit = Math.max(1, 1.62 / camera.aspect);
    lookV.set(lerp(A.look[0], B.look[0], f), lerp(A.look[1], B.look[1], f), lerp(A.look[2], B.look[2], f));
    pose.set(lerp(A.cam[0], B.cam[0], f), lerp(A.cam[1], B.cam[1], f), lerp(A.cam[2], B.cam[2], f));
    pose.sub(lookV).multiplyScalar(fit).add(lookV);
    camera.position.copy(pose);
    camera.lookAt(lookV);

    slabs.forEach((s, i) => {
      const a = A.slabs[i];
      const b = B.slabs[i];
      const flat = Math.abs(lerp(a.rx, b.rx, f)) > 0.8 ? 0.2 : 1;
      const drift = Math.sin(tAcc * 0.7 + s.seed) * 0.05 * flat;
      s.group.position.set(
        lerp(a.x, b.x, f) + s.scatter.x * scatterAmt,
        lerp(a.y, b.y, f) + drift + s.scatter.y * scatterAmt,
        lerp(a.z, b.z, f) + s.scatter.z * scatterAmt,
      );
      s.group.rotation.set(lerp(a.rx, b.rx, f) + s.scatter.y * 0.3 * scatterAmt, lerp(a.ry, b.ry, f) + Math.sin(tAcc * 0.5 + s.seed) * 0.025 * flat, lerp(a.rz, b.rz, f) + s.scatter.x * 0.12 * scatterAmt);
      const sx = lerp(a.sx, b.sx, f);
      const sy = lerp(a.sy, b.sy, f);
      s.group.scale.set(sx, sy, 1);
      // keep the glow plane's proportions when the slab is stretched
      s.glow.scale.set(Math.max(1, sx * 0.9) / sx, Math.min(1, 0.4 + sy * 0.6) / sy, 1);
      s.glowMat.opacity = lerp(a.glow, b.glow, f) * (0.35 + 0.65 * introE);
      s.mat.opacity = 0.78;
    });

    // ring timer
    const w1 = Math.max(0, 1 - Math.abs(current - 1) * 1.6);
    const cycle = (tAcc % 7) / 6;
    const prog = Math.min(1, cycle);
    const centre = slabs[2].group.position;
    ringTrack.position.set(centre.x, centre.y, centre.z + 0.15);
    ringTrack.scale.setScalar(0.88);
    ringArc.scale.set(-0.88, 0.88, 1);
    ringArc.position.copy(ringTrack.position);
    ringTrackMat.opacity = 0.22 * w1;
    ringArcMat.opacity = 0.95 * w1;
    ringArcMat.color.set(prog > 0.75 ? 0xe36a3c : 0xe9b04a);
    ringArcGeo.setDrawRange(0, Math.floor(SEG * prog) * 6);

    // ticks
    const w2 = Math.max(0, 1 - Math.abs(current - 2) * 1.6);
    tickMat.opacity = 0.45 * w2;

    // checklist marks
    const w3 = Math.max(0, 1 - Math.abs(current - 3) * 2);
    const sx3 = CHAPTERS[3].slabs[0];
    checks.forEach((ck, i) => {
      ck.ring.position.x = sx3.x - (W * sx3.sx) / 2 - 0.22;
      ck.fill.position.x = ck.ring.position.x;
      ck.ring.position.y = slabs[i].group.position.y;
      ck.fill.position.y = ck.ring.position.y;
      ck.ring.position.z = 0.2;
      ck.fill.position.z = 0.2;
      ck.mats[0].opacity = w3;
      ck.mats[1].opacity = w3 * 0.9;
      ck.ring.rotation.y = ck.fill.rotation.y = -0.12;
    });

    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }

  function kick() {
    if (!raf && running && visible && !document.hidden) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  }
  kick();

  return {
    setTarget: (p: number) => {
      target = Math.min(CHAPTERS.length - 1, Math.max(0, p));
      kick();
    },
    dispose: () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
    },
  };
}
