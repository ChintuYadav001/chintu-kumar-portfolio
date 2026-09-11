/* ==========================================================================
   HERO 3D CYBER DATA CORE
   Module: scene3d.js
   Interactive WebGL 3D Data Crystal, Orbiting Telemetry Rings & Physics Drag
   ========================================================================== */

export function initHero3DScene() {
  const container = document.getElementById('hero-3d-stage');
  const canvas = document.getElementById('hero-3d-canvas');
  if (!container || !canvas || typeof THREE === 'undefined') return;

  const width = container.clientWidth || 450;
  const height = container.clientHeight || 380;

  // Scene, Camera, Renderer
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.set(0, 0, 8.5);

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const isDark = () => document.documentElement.getAttribute('data-theme') !== 'light';

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, isDark() ? 0.7 : 0.9);
  scene.add(ambientLight);

  const pointLightCyan = new THREE.PointLight(0x38bdf8, 2.5, 20);
  pointLightCyan.position.set(5, 5, 5);
  scene.add(pointLightCyan);

  const pointLightPurple = new THREE.PointLight(0x818cf8, 2.0, 20);
  pointLightPurple.position.set(-5, -5, 3);
  scene.add(pointLightPurple);

  const pointLightEmerald = new THREE.PointLight(0x34d399, 1.8, 15);
  pointLightEmerald.position.set(0, 6, -4);
  scene.add(pointLightEmerald);

  // Group that holds all rotating 3D objects
  const coreGroup = new THREE.Group();
  scene.add(coreGroup);

  // 1. Inner Glowing Data Nucleus
  const innerGeom = new THREE.IcosahedronGeometry(1.4, 1);
  const innerMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.2,
    metalness: 0.8,
    emissive: 0x0369a1,
    emissiveIntensity: 0.6,
    wireframe: false,
    transparent: true,
    opacity: 0.85
  });
  const innerMesh = new THREE.Mesh(innerGeom, innerMat);
  coreGroup.add(innerMesh);

  // 2. Outer Faceted Wireframe Cage
  const outerGeom = new THREE.IcosahedronGeometry(2.3, 1);
  const outerMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    wireframe: true,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.5,
    transparent: true,
    opacity: 0.75
  });
  const outerMesh = new THREE.Mesh(outerGeom, outerMat);
  coreGroup.add(outerMesh);

  // 3. Orbiting Telemetry Rings (Representing SQL, Python, Power BI)
  function createOrbitRing(radius, tube, color, rotX, rotY) {
    const ringGeom = new THREE.TorusGeometry(radius, tube, 16, 80);
    const ringMat = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.8,
      roughness: 0.3,
      metalness: 0.9,
      transparent: true,
      opacity: 0.7
    });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.rotation.x = rotX;
    ring.rotation.y = rotY;
    return ring;
  }

  const ringSQL = createOrbitRing(3.0, 0.035, 0x38bdf8, Math.PI / 4, 0); // Cyan - SQL
  const ringPython = createOrbitRing(3.3, 0.035, 0x818cf8, -Math.PI / 3, Math.PI / 6); // Purple - Python
  const ringPowerBI = createOrbitRing(3.6, 0.035, 0x34d399, Math.PI / 6, -Math.PI / 4); // Emerald - Power BI

  coreGroup.add(ringSQL);
  coreGroup.add(ringPython);
  coreGroup.add(ringPowerBI);

  // 4. Orbiting Satellites (Data Packets)
  const satellites = [];
  const satelliteColors = [0x38bdf8, 0x818cf8, 0x34d399, 0xf59e0b];

  for (let i = 0; i < 6; i++) {
    const satGeom = new THREE.SphereGeometry(0.09, 12, 12);
    const satMat = new THREE.MeshBasicMaterial({
      color: satelliteColors[i % satelliteColors.length]
    });
    const satMesh = new THREE.Mesh(satGeom, satMat);
    coreGroup.add(satMesh);
    satellites.push({
      mesh: satMesh,
      radius: 2.8 + (i % 3) * 0.4,
      speed: 0.8 + (i * 0.2),
      angle: (i * Math.PI) / 3,
      axisY: (i % 2 === 0 ? 1 : -1) * (0.4 + i * 0.1)
    });
  }

  // 5. Floating Node Particles
  const nodeCount = 45;
  const nodeGeom = new THREE.BufferGeometry();
  const nodePositions = new Float32Array(nodeCount * 3);
  for (let i = 0; i < nodeCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    const r = 2.4 + Math.random() * 1.5;
    nodePositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    nodePositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    nodePositions[i * 3 + 2] = r * Math.cos(phi);
  }
  nodeGeom.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));
  const nodeMat = new THREE.PointsMaterial({
    color: 0x38bdf8,
    size: 0.08,
    transparent: true,
    opacity: 0.9
  });
  const nodePoints = new THREE.Points(nodeGeom, nodeMat);
  coreGroup.add(nodePoints);

  // Interactive mouse rotation with inertia
  let isDragging = false;
  let prevMouseX = 0;
  let prevMouseY = 0;
  let velX = 0;
  let velY = 0;
  let autoRotate = true;
  let wireframeOnly = false;

  const canvasWrapper = container.querySelector('.hero-3d-canvas-wrapper') || container;

  canvasWrapper.addEventListener('mousedown', (e) => {
    isDragging = true;
    prevMouseX = e.clientX;
    prevMouseY = e.clientY;
    velX = 0;
    velY = 0;
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - prevMouseX;
    const deltaY = e.clientY - prevMouseY;
    prevMouseX = e.clientX;
    prevMouseY = e.clientY;

    velX = deltaX * 0.005;
    velY = deltaY * 0.005;

    coreGroup.rotation.y += velX;
    coreGroup.rotation.x += velY;
  });

  // Touch controls for mobile
  canvasWrapper.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      prevMouseX = e.touches[0].clientX;
      prevMouseY = e.touches[0].clientY;
      velX = 0;
      velY = 0;
    }
  }, { passive: true });

  window.addEventListener('touchend', () => {
    isDragging = false;
  });

  window.addEventListener('touchmove', (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - prevMouseX;
    const deltaY = e.touches[0].clientY - prevMouseY;
    prevMouseX = e.touches[0].clientX;
    prevMouseY = e.touches[0].clientY;

    velX = deltaX * 0.006;
    velY = deltaY * 0.006;

    coreGroup.rotation.y += velX;
    coreGroup.rotation.x += velY;
  }, { passive: true });

  // HUD Control Buttons
  const rotateBtn = document.getElementById('btn-3d-rotate');
  const wireframeBtn = document.getElementById('btn-3d-wireframe');
  const pulseBtn = document.getElementById('btn-3d-pulse');
  const resetBtn = document.getElementById('btn-3d-reset');

  if (rotateBtn) {
    rotateBtn.addEventListener('click', () => {
      autoRotate = !autoRotate;
      rotateBtn.classList.toggle('active', autoRotate);
      const text = rotateBtn.querySelector('span');
      if (text) text.textContent = autoRotate ? 'Auto-Spin: ON' : 'Auto-Spin: OFF';
    });
  }

  if (wireframeBtn) {
    wireframeBtn.addEventListener('click', () => {
      wireframeOnly = !wireframeOnly;
      innerMat.wireframe = wireframeOnly;
      wireframeBtn.classList.toggle('active', wireframeOnly);
    });
  }

  let pulseScale = 1.0;
  if (pulseBtn) {
    pulseBtn.addEventListener('click', () => {
      pulseScale = 1.35;
      innerMat.emissiveIntensity = 1.8;
      pointLightCyan.intensity = 4.5;
      setTimeout(() => {
        innerMat.emissiveIntensity = 0.6;
        pointLightCyan.intensity = 2.5;
      }, 500);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      coreGroup.rotation.set(0, 0, 0);
      velX = 0;
      velY = 0;
      autoRotate = true;
      if (rotateBtn) {
        rotateBtn.classList.add('active');
        const text = rotateBtn.querySelector('span');
        if (text) text.textContent = 'Auto-Spin: ON';
      }
    });
  }

  // Animation Loop
  let clock = new THREE.Clock();
  let animId;

  function animate() {
    animId = requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Inertia decay when not dragging
    if (!isDragging) {
      velX *= 0.95;
      velY *= 0.95;
      coreGroup.rotation.y += velX;
      coreGroup.rotation.x += velY;

      if (autoRotate) {
        coreGroup.rotation.y += 0.007;
        coreGroup.rotation.x += 0.002;
      }
    }

    // Inner core gentle breathing & counter-rotation
    innerMesh.rotation.y -= 0.01;
    innerMesh.rotation.z += 0.005;

    // Smooth pulse recovery
    if (pulseScale > 1.0) {
      pulseScale += (1.0 - pulseScale) * 0.08;
    }
    const breathing = 1.0 + Math.sin(elapsedTime * 2.5) * 0.04;
    innerMesh.scale.set(pulseScale * breathing, pulseScale * breathing, pulseScale * breathing);

    // Animate orbiting rings
    ringSQL.rotation.z += 0.012;
    ringPython.rotation.z -= 0.014;
    ringPowerBI.rotation.z += 0.009;

    // Animate satellites
    satellites.forEach(sat => {
      sat.angle += sat.speed * 0.015;
      sat.mesh.position.x = Math.cos(sat.angle) * sat.radius;
      sat.mesh.position.z = Math.sin(sat.angle) * sat.radius;
      sat.mesh.position.y = Math.sin(sat.angle * 2) * sat.axisY;
    });

    renderer.render(scene, camera);
  }

  animate();

  // Resize handler
  function handleResize() {
    if (!container) return;
    const newWidth = container.clientWidth;
    const newHeight = container.clientHeight || 380;
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
  }

  window.addEventListener('resize', handleResize, { passive: true });
}
