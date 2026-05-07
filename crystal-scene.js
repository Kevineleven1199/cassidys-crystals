import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.184.0/build/three.module.js";

const canvas = document.querySelector("#crystal-stage");
const hero = document.querySelector(".hero");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (canvas && hero) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
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

  const crystalWorld = new THREE.Group();
  scene.add(crystalWorld);

  const mouse = new THREE.Vector2(0, 0);
  const target = new THREE.Vector2(0, 0);
  const startedAt = performance.now();

  scene.add(new THREE.AmbientLight(0xffffff, 1.8));

  const keyLight = new THREE.PointLight(0xffffff, 42, 30);
  keyLight.position.set(-3.5, 4, 5);
  scene.add(keyLight);

  const roseLight = new THREE.PointLight(0xff4fa3, 34, 28);
  roseLight.position.set(4.5, -1.5, 4);
  scene.add(roseLight);

  const tealLight = new THREE.PointLight(0x57f3ff, 30, 28);
  tealLight.position.set(0, 3, -2);
  scene.add(tealLight);

  const crystalMaterials = [
    new THREE.MeshPhysicalMaterial({
      color: 0x9b5cf6,
      emissive: 0x24104c,
      roughness: 0.18,
      metalness: 0.08,
      transmission: 0.22,
      thickness: 0.55,
      transparent: true,
      opacity: 0.78,
      clearcoat: 1,
    }),
    new THREE.MeshPhysicalMaterial({
      color: 0x59d6d6,
      emissive: 0x06333b,
      roughness: 0.16,
      metalness: 0.04,
      transmission: 0.25,
      thickness: 0.5,
      transparent: true,
      opacity: 0.72,
      clearcoat: 1,
    }),
    new THREE.MeshPhysicalMaterial({
      color: 0xffc45c,
      emissive: 0x422800,
      roughness: 0.2,
      metalness: 0.08,
      transmission: 0.16,
      thickness: 0.45,
      transparent: true,
      opacity: 0.78,
      clearcoat: 1,
    }),
    new THREE.MeshPhysicalMaterial({
      color: 0xff8ac7,
      emissive: 0x431126,
      roughness: 0.19,
      metalness: 0.06,
      transmission: 0.2,
      thickness: 0.5,
      transparent: true,
      opacity: 0.74,
      clearcoat: 1,
    }),
  ];

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
        opacity: 0.22,
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
    makeCrystal(crystalMaterials[0], 1.1, { x: 2.8, y: 0.05, z: -1.2 }, { x: -0.2, y: 0.4, z: -0.28 }),
    makeCrystal(crystalMaterials[1], 0.76, { x: -3.2, y: -0.7, z: -0.2 }, { x: 0.1, y: -0.65, z: 0.24 }),
    makeCrystal(crystalMaterials[2], 0.56, { x: 0.7, y: 1.12, z: -1.7 }, { x: 0.36, y: -0.18, z: 0.12 }),
    makeCrystal(crystalMaterials[3], 0.48, { x: -0.8, y: -1.15, z: 0.7 }, { x: -0.12, y: 0.45, z: -0.12 }),
  ];

  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0x85f7ff,
    transparent: true,
    opacity: 0.18,
    side: THREE.DoubleSide,
  });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.9, 0.012, 12, 160), ringMaterial);
  ring.rotation.x = Math.PI / 2.65;
  ring.position.z = -0.75;
  crystalWorld.add(ring);

  const particleCount = 260;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i += 1) {
    positions[i * 3] = (Math.random() - 0.5) * 13;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 7;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
  }

  const particles = new THREE.Points(
    new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(positions, 3)),
    new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.045,
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
    }),
  );
  scene.add(particles);

  function resize() {
    const rect = hero.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    const isCompact = width < 720;

    crystalWorld.scale.setScalar(isCompact ? 0.76 : 1);
    crystalWorld.position.set(isCompact ? 1.35 : 0, isCompact ? -0.22 : 0, 0);
    camera.position.z = isCompact ? 9.4 : 8.5;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }

  function render() {
    const elapsed = (performance.now() - startedAt) / 1000;

    mouse.lerp(target, 0.045);
    crystalWorld.rotation.y = mouse.x * 0.22 + elapsed * 0.06;
    crystalWorld.rotation.x = mouse.y * 0.1;
    ring.rotation.z = elapsed * 0.22;
    particles.rotation.y = elapsed * 0.018;

    crystals.forEach((crystal, index) => {
      crystal.position.y += Math.sin(elapsed * (0.7 + index * 0.08) + crystal.userData.floatSeed) * 0.0025;
      crystal.rotation.y += 0.0035 + index * 0.001;
    });

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

  resize();
  render();
}
