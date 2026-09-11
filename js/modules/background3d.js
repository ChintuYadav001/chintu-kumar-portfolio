/* ==========================================================================
   AMBIENT 3D PARTICLE CONSTELLATION BACKGROUND
   Module: background3d.js
   Three.js powered 3D neural particle network with dynamic cursor parallax
   ========================================================================== */

export function initBackground3D() {
  const canvas = document.getElementById('bg-3d-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  // Check prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    canvas.style.display = 'none';
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 2000);
  camera.position.z = 600;

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Particle configuration
  const particleCount = 180;
  const maxDistance = 140;
  const positions = new Float32Array(particleCount * 3);
  const velocities = [];

  const bounds = {
    x: 800,
    y: 500,
    z: 400
  };

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * bounds.x * 2;
    positions[i * 3 + 1] = (Math.random() - 0.5) * bounds.y * 2;
    positions[i * 3 + 2] = (Math.random() - 0.5) * bounds.z * 2;

    velocities.push({
      x: (Math.random() - 0.5) * 0.4,
      y: (Math.random() - 0.5) * 0.4,
      z: (Math.random() - 0.5) * 0.3
    });
  }

  const particlesGeom = new THREE.BufferGeometry();
  particlesGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  // Circular glow texture for particles
  function createParticleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.3, 'rgba(56, 189, 248, 0.8)');
    grad.addColorStop(0.8, 'rgba(56, 189, 248, 0.2)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(canvas);
  }

  const pTexture = createParticleTexture();

  const isDark = () => document.documentElement.getAttribute('data-theme') !== 'light';

  const particleMaterial = new THREE.PointsMaterial({
    color: isDark() ? 0x38bdf8 : 0x0284c7,
    size: 14,
    map: pTexture,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    opacity: 0.75
  });

  const particleSystem = new THREE.Points(particlesGeom, particleMaterial);
  scene.add(particleSystem);

  // Line segments geometry
  const maxLineConnections = particleCount * 6;
  const linePositions = new Float32Array(maxLineConnections * 6);
  const lineColors = new Float32Array(maxLineConnections * 6);

  const linesGeom = new THREE.BufferGeometry();
  linesGeom.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
  linesGeom.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));

  const lineMat = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    opacity: 0.4
  });

  const linesMesh = new THREE.LineSegments(linesGeom, lineMat);
  scene.add(linesMesh);

  // Mouse interactivity
  let targetMouseX = 0;
  let targetMouseY = 0;
  let currentMouseX = 0;
  let currentMouseY = 0;

  window.addEventListener('mousemove', (e) => {
    targetMouseX = (e.clientX - window.innerWidth / 2) * 0.35;
    targetMouseY = (e.clientY - window.innerHeight / 2) * 0.35;
  }, { passive: true });

  // Update theme colors when user toggles dark/light
  const observer = new MutationObserver(() => {
    const dark = isDark();
    particleMaterial.color.setHex(dark ? 0x38bdf8 : 0x0284c7);
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  // Animation loop
  let animationFrameId;
  let isRunning = true;

  document.addEventListener('visibilitychange', () => {
    isRunning = !document.hidden;
    if (isRunning) animate();
  });

  function animate() {
    if (!isRunning) return;
    animationFrameId = requestAnimationFrame(animate);

    // Smooth mouse parallax
    currentMouseX += (targetMouseX - currentMouseX) * 0.05;
    currentMouseY += (targetMouseY - currentMouseY) * 0.05;
    camera.position.x = currentMouseX;
    camera.position.y = -currentMouseY;
    camera.lookAt(scene.position);

    // Update particles position
    const posArray = particlesGeom.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      posArray[idx] += velocities[i].x;
      posArray[idx + 1] += velocities[i].y;
      posArray[idx + 2] += velocities[i].z;

      // Bounce at bounds
      if (Math.abs(posArray[idx]) > bounds.x) velocities[i].x *= -1;
      if (Math.abs(posArray[idx + 1]) > bounds.y) velocities[i].y *= -1;
      if (Math.abs(posArray[idx + 2]) > bounds.z) velocities[i].z *= -1;
    }
    particlesGeom.attributes.position.needsUpdate = true;

    // Connect nearby particles with glowing lines
    let lineIdx = 0;
    let colorIdx = 0;
    const baseR = isDark() ? 0.22 : 0.05;
    const baseG = isDark() ? 0.74 : 0.45;
    const baseB = isDark() ? 0.97 : 0.85;

    for (let i = 0; i < particleCount; i++) {
      const p1x = posArray[i * 3];
      const p1y = posArray[i * 3 + 1];
      const p1z = posArray[i * 3 + 2];

      for (let j = i + 1; j < particleCount; j++) {
        const p2x = posArray[j * 3];
        const p2y = posArray[j * 3 + 1];
        const p2z = posArray[j * 3 + 2];

        const dx = p1x - p2x;
        const dy = p1y - p2y;
        const dz = p1z - p2z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < maxDistance && lineIdx < maxLineConnections * 6 - 6) {
          const alpha = 1.0 - dist / maxDistance;

          linePositions[lineIdx++] = p1x;
          linePositions[lineIdx++] = p1y;
          linePositions[lineIdx++] = p1z;

          linePositions[lineIdx++] = p2x;
          linePositions[lineIdx++] = p2y;
          linePositions[lineIdx++] = p2z;

          lineColors[colorIdx++] = baseR * alpha;
          lineColors[colorIdx++] = baseG * alpha;
          lineColors[colorIdx++] = baseB * alpha;

          lineColors[colorIdx++] = baseR * alpha;
          lineColors[colorIdx++] = baseG * alpha;
          lineColors[colorIdx++] = baseB * alpha;
        }
      }
    }

    linesGeom.setDrawRange(0, lineIdx / 3);
    linesGeom.attributes.position.needsUpdate = true;
    linesGeom.attributes.color.needsUpdate = true;

    // Slow rotation of entire network
    scene.rotation.y += 0.0008;
    scene.rotation.x += 0.0004;

    renderer.render(scene, camera);
  }

  animate();

  // Resize handler
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }, { passive: true });
}
