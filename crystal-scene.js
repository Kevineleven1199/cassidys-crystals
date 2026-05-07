import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.184.0/build/three.module.js";

const canvas = document.querySelector("#crystal-stage");
const hero = document.querySelector(".hero");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const palettes = {
  calm: { primary: 0x9b5cf6, secondary: 0x57f3ff, accent: 0xffd166 },
  love: { primary: 0xff74b8, secondary: 0xffc1dc, accent: 0x82f7ff },
  focus: { primary: 0x6ee7ff, secondary: 0xffffff, accent: 0x8b5cf6 },
  protect: { primary: 0x5b4a72, secondary: 0x2bd4bd, accent: 0xffb703 },
};

if (canvas && hero) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 120);
  camera.position.set(0, 0.25, 8.5);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    preserveDrawingBuffer: true,
    powerPreference: "high-performance",
  });

  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const crystalWorld = new THREE.Group();
  const stormWorld = new THREE.Group();
  scene.add(crystalWorld, stormWorld);

  const mouse = new THREE.Vector2(0, 0);
  const target = new THREE.Vector2(0, 0);
  const startedAt = performance.now();
  const dummy = new THREE.Object3D();
  let activePalette = palettes.calm;
  let shockwave = 0;

  scene.add(new THREE.AmbientLight(0xffffff, 1.35));

  const keyLight = new THREE.PointLight(0xffffff, 48, 34);
  keyLight.position.set(-3.5, 4, 5);
  scene.add(keyLight);

  const roseLight = new THREE.PointLight(activePalette.primary, 42, 32);
  roseLight.position.set(4.5, -1.5, 4);
  scene.add(roseLight);

  const tealLight = new THREE.PointLight(activePalette.secondary, 36, 30);
  tealLight.position.set(0, 3, -2);
  scene.add(tealLight);

  const crystalMaterials = [
    makeCrystalMaterial(0x9b5cf6, 0x24104c, 0.8),
    makeCrystalMaterial(0x59d6d6, 0x06333b, 0.74),
    makeCrystalMaterial(0xffc45c, 0x422800, 0.8),
    makeCrystalMaterial(0xff8ac7, 0x431126, 0.78),
  ];

  function makeCrystalMaterial(color, emissive, opacity) {
    return new THREE.MeshPhysicalMaterial({
      color,
      emissive,
      roughness: 0.14,
      metalness: 0.08,
      transmission: 0.22,
      thickness: 0.58,
      transparent: true,
      opacity,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
    });
  }

  function makeCrystal(material, scale, position, rotation) {
    const group = new THREE.Group();
    const body = new THREE.CylinderGeometry(0.62, 0.82, 2.45, 6, 1);
    const cap = new THREE.ConeGeometry(0.62, 0.9, 6, 1);
    const base = new THREE.ConeGeometry(0.82, 0.55, 6, 1);

    const bodyMesh = new THREE.Mesh(body, material);
    const topMesh = new THREE.Mesh(cap, material);
    const baseMesh = new THREE.Mesh(base, material);

    topMesh.position.y = 1.67;
    baseMesh.position.y = -1.5;
    baseMesh.rotation.x = Math.PI;

    group.add(bodyMesh, topMesh, baseMesh);

    const edges = new THREE.EdgesGeometry(body);
    const line = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.28,
        blending: THREE.AdditiveBlending,
      }),
    );
    group.add(line);

    group.scale.setScalar(scale);
    group.position.set(position.x, position.y, position.z);
    group.rotation.set(rotation.x, rotation.y, rotation.z);
    group.userData.floatSeed = Math.random() * 100;
    crystalWorld.add(group);
    return group;
  }

  const crystals = [
    makeCrystal(crystalMaterials[0], 1.12, { x: 2.8, y: 0.05, z: -1.2 }, { x: -0.2, y: 0.4, z: -0.28 }),
    makeCrystal(crystalMaterials[1], 0.78, { x: -3.2, y: -0.7, z: -0.2 }, { x: 0.1, y: -0.65, z: 0.24 }),
    makeCrystal(crystalMaterials[2], 0.58, { x: 0.7, y: 1.12, z: -1.7 }, { x: 0.36, y: -0.18, z: 0.12 }),
    makeCrystal(crystalMaterials[3], 0.5, { x: -0.8, y: -1.15, z: 0.7 }, { x: -0.12, y: 0.45, z: -0.12 }),
    makeCrystal(crystalMaterials[1], 0.38, { x: 3.95, y: 1.18, z: 0.4 }, { x: 0.22, y: -0.24, z: 0.34 }),
    makeCrystal(crystalMaterials[0], 0.32, { x: -4.2, y: 1.22, z: -1.1 }, { x: -0.18, y: 0.35, z: -0.18 }),
  ];

  const portalMaterials = [
    makeGlowMaterial(activePalette.secondary, 0.22),
    makeGlowMaterial(activePalette.primary, 0.16),
    makeGlowMaterial(activePalette.accent, 0.12),
  ];

  function makeGlowMaterial(color, opacity) {
    return new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }

  const portalRings = [
    makeRing(2.9, 0.012, 0, Math.PI / 2.65, -0.75, portalMaterials[0]),
    makeRing(3.75, 0.008, 0.12, Math.PI / 2.72, -1.15, portalMaterials[1]),
    makeRing(4.8, 0.006, -0.08, Math.PI / 2.58, -1.7, portalMaterials[2]),
  ];

  function makeRing(radius, tube, y, xRotation, z, material) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 12, 220), material);
    ring.rotation.x = xRotation;
    ring.position.set(0, y, z);
    crystalWorld.add(ring);
    return ring;
  }

  const ribbons = [
    makeRibbon(0.018, activePalette.secondary, 0.32, 0),
    makeRibbon(0.012, activePalette.primary, 0.22, 1.8),
    makeRibbon(0.009, activePalette.accent, 0.18, 3.2),
  ];

  function makeRibbon(radius, color, opacity, seed) {
    const points = [];
    for (let i = 0; i <= 9; i += 1) {
      const t = i / 9;
      const angle = t * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(angle) * (3.2 + Math.sin(i) * 0.32), Math.sin(angle * 1.7 + seed) * 0.58, Math.sin(angle) * 0.95 - 0.85));
    }

    const curve = new THREE.CatmullRomCurve3(points, true);
    const mesh = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 180, radius, 8, true),
      makeGlowMaterial(color, opacity),
    );
    mesh.userData.seed = seed;
    crystalWorld.add(mesh);
    return mesh;
  }

  const particleCount = 680;
  const particlePositions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i += 1) {
    particlePositions[i * 3] = (Math.random() - 0.5) * 15;
    particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 8.4;
    particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 7.5;
  }

  const particles = new THREE.Points(
    new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(particlePositions, 3)),
    new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.052,
      transparent: true,
      opacity: 0.78,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  stormWorld.add(particles);

  const shardCount = 72;
  const shardGeometry = new THREE.OctahedronGeometry(0.13, 0);
  const shardMaterial = new THREE.MeshPhysicalMaterial({
    color: activePalette.primary,
    emissive: activePalette.primary,
    emissiveIntensity: 0.3,
    roughness: 0.18,
    metalness: 0.08,
    transparent: true,
    opacity: 0.68,
    clearcoat: 1,
  });
  const shards = new THREE.InstancedMesh(shardGeometry, shardMaterial, shardCount);
  const shardData = Array.from({ length: shardCount }, () => ({
    radius: 2.7 + Math.random() * 4.6,
    angle: Math.random() * Math.PI * 2,
    height: (Math.random() - 0.5) * 4.2,
    speed: 0.08 + Math.random() * 0.26,
    scale: 0.55 + Math.random() * 1.45,
    seed: Math.random() * 50,
  }));
  stormWorld.add(shards);

  const auraCore = new THREE.Mesh(
    new THREE.SphereGeometry(1.18, 32, 32),
    makeGlowMaterial(activePalette.primary, 0.08),
  );
  auraCore.scale.set(2.9, 0.68, 0.46);
  auraCore.position.z = -1.6;
  crystalWorld.add(auraCore);

  function setMood(mood) {
    activePalette = palettes[mood] || palettes.calm;
    shockwave = 1;
    roseLight.color.setHex(activePalette.primary);
    tealLight.color.setHex(activePalette.secondary);
    shardMaterial.color.setHex(activePalette.primary);
    shardMaterial.emissive.setHex(activePalette.primary);
    portalMaterials[0].color.setHex(activePalette.secondary);
    portalMaterials[1].color.setHex(activePalette.primary);
    portalMaterials[2].color.setHex(activePalette.accent);
    ribbons[0].material.color.setHex(activePalette.secondary);
    ribbons[1].material.color.setHex(activePalette.primary);
    ribbons[2].material.color.setHex(activePalette.accent);
    auraCore.material.color.setHex(activePalette.primary);
  }

  function resize() {
    const rect = hero.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    const isCompact = width < 720;

    crystalWorld.scale.setScalar(isCompact ? 0.66 : 1);
    stormWorld.scale.setScalar(isCompact ? 0.76 : 1);
    crystalWorld.position.set(isCompact ? 1.55 : 0, isCompact ? -0.7 : 0, 0);
    stormWorld.position.set(isCompact ? 0.9 : 0, isCompact ? -0.25 : 0, 0);
    camera.position.z = isCompact ? 9.8 : 8.5;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }

  function render() {
    const elapsed = (performance.now() - startedAt) / 1000;
    const scrollInfluence = Math.min(window.scrollY / Math.max(hero.offsetHeight, 1), 1);
    const pulse = 1 + Math.sin(elapsed * 2.6) * 0.03 + shockwave * 0.22;

    mouse.lerp(target, 0.05);
    crystalWorld.rotation.y = mouse.x * 0.3 + elapsed * 0.075;
    crystalWorld.rotation.x = mouse.y * 0.12 - scrollInfluence * 0.12;
    stormWorld.rotation.y = elapsed * 0.035 - mouse.x * 0.08;
    stormWorld.rotation.x = mouse.y * 0.04;
    auraCore.scale.set(2.9 * pulse, 0.68 * pulse, 0.46 * pulse);

    portalRings.forEach((ring, index) => {
      ring.rotation.z = elapsed * (0.16 + index * 0.08) * (index % 2 === 0 ? 1 : -1);
      ring.scale.setScalar(1 + Math.sin(elapsed * 1.7 + index) * 0.035 + shockwave * (0.2 - index * 0.04));
    });

    ribbons.forEach((ribbon, index) => {
      ribbon.rotation.z = elapsed * (0.08 + index * 0.04);
      ribbon.rotation.y = Math.sin(elapsed * 0.5 + ribbon.userData.seed) * 0.14 + mouse.x * 0.08;
      ribbon.material.opacity = 0.16 + Math.sin(elapsed * 1.4 + index) * 0.05 + shockwave * 0.16;
    });

    particles.rotation.y = elapsed * 0.022;
    particles.rotation.x = Math.sin(elapsed * 0.18) * 0.05;
    particles.material.size = 0.046 + Math.sin(elapsed * 2.2) * 0.01 + shockwave * 0.024;

    crystals.forEach((crystal, index) => {
      crystal.position.y += Math.sin(elapsed * (0.72 + index * 0.08) + crystal.userData.floatSeed) * 0.0028;
      crystal.rotation.y += 0.0045 + index * 0.0009 + shockwave * 0.002;
      crystal.rotation.z += Math.sin(elapsed + index) * 0.0004;
    });

    shardData.forEach((shard, index) => {
      const angle = shard.angle + elapsed * shard.speed;
      const breathe = 1 + Math.sin(elapsed * 1.8 + shard.seed) * 0.18 + shockwave * 0.8;
      dummy.position.set(Math.cos(angle) * shard.radius * breathe, shard.height + Math.sin(elapsed * 1.4 + shard.seed) * 0.38, Math.sin(angle) * 1.45 - 1.1);
      dummy.rotation.set(elapsed * shard.speed + shard.seed, angle * 0.7, elapsed * 0.45 + shard.seed);
      dummy.scale.setScalar(shard.scale * (0.72 + shockwave * 0.28));
      dummy.updateMatrix();
      shards.setMatrixAt(index, dummy.matrix);
    });
    shards.instanceMatrix.needsUpdate = true;

    roseLight.intensity = 42 + Math.sin(elapsed * 2.4) * 7 + shockwave * 38;
    tealLight.intensity = 36 + Math.cos(elapsed * 2) * 6 + shockwave * 32;
    shockwave *= 0.92;

    renderer.render(scene, camera);

    if (!prefersReducedMotion) {
      window.requestAnimationFrame(render);
    }
  }

  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", (event) => {
    target.x = (event.clientX / window.innerWidth - 0.5) * 2;
    target.y = (event.clientY / window.innerHeight - 0.5) * 2;
  });
  window.addEventListener("crystal:mood", (event) => setMood(event.detail));

  resize();
  setMood("calm");
  render();
}
