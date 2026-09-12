/* ==========================================================================
   ABOUT SECTION INTERACTIVE 3D VISUAL ICONS
   Module: about3dIcons.js
   Replaces static 2D icons in the stats strip with interactive 3D WebGL
   visuals that rotate, tilt with cursor physics, and react to hover & clicks.
   ========================================================================== */

export function initAbout3DIcons() {
  const viewports = document.querySelectorAll('.stat-3d-viewport');
  if (!viewports.length || typeof THREE === 'undefined') return;

  const scenes = [];
  const isDark = () => document.documentElement.getAttribute('data-theme') !== 'light';

  viewports.forEach((vp, idx) => {
    const canvas = vp.querySelector('.stat-3d-canvas');
    if (!canvas) return;

    const width = vp.clientWidth || 90;
    const height = vp.clientHeight || 90;

    // Create scene, camera, renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 5.2);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    } catch (e) {
      console.warn('WebGL init failed for stat-3d-canvas', e);
      return;
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, isDark() ? 0.8 : 1.1);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(3, 4, 5);
    scene.add(dirLight);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Build unique 3D visual object depending on index
    let animUpdate = () => {};

    if (idx === 0) {
      // 1. 3D Database Cylinder with Glowing Rings (SQL Problems Solved)
      const cylMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        roughness: 0.25,
        metalness: 0.75,
        emissive: 0x0369a1,
        emissiveIntensity: 0.4
      });
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        wireframe: true
      });

      const cylGeom = new THREE.CylinderGeometry(0.9, 0.9, 1.4, 20);
      const cyl = new THREE.Mesh(cylGeom, cylMat);
      rootGroup.add(cyl);

      // Grooved separator rings
      const ring1Geom = new THREE.TorusGeometry(0.96, 0.05, 6, 24);
      const ring1 = new THREE.Mesh(ring1Geom, new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
      ring1.rotation.x = Math.PI / 2;
      ring1.position.y = 0.25;
      rootGroup.add(ring1);

      const ring2 = ring1.clone();
      ring2.position.y = -0.25;
      rootGroup.add(ring2);

      // Orbiting dynamic ring
      const orbitGeom = new THREE.TorusGeometry(1.35, 0.035, 6, 32);
      const orbitRing = new THREE.Mesh(orbitGeom, ringMat);
      orbitRing.rotation.x = Math.PI / 3;
      rootGroup.add(orbitRing);

      rootGroup.rotation.x = 0.35;

      animUpdate = (t) => {
        rootGroup.rotation.y += 0.015;
        orbitRing.rotation.z += 0.025;
      };

    } else if (idx === 1) {
      // 2. 3D Volumetric Bar Chart (Records Analyzed)
      const barGroup = new THREE.Group();
      rootGroup.add(barGroup);

      const colors = [0x10b981, 0x34d399, 0x059669];
      const heights = [1.0, 1.8, 1.4];
      const bars = [];

      [-0.6, 0, 0.6].forEach((xPos, bIdx) => {
        const h = heights[bIdx];
        const barGeom = new THREE.BoxGeometry(0.42, h, 0.42);
        const barMat = new THREE.MeshStandardMaterial({
          color: colors[bIdx],
          roughness: 0.3,
          metalness: 0.7,
          emissive: colors[bIdx],
          emissiveIntensity: 0.3
        });
        const bar = new THREE.Mesh(barGeom, barMat);
        bar.position.set(xPos, h / 2 - 0.9, 0);
        barGroup.add(bar);
        bars.push(bar);
      });

      // Base plate
      const baseGeom = new THREE.BoxGeometry(1.9, 0.08, 0.8);
      const baseMat = new THREE.MeshStandardMaterial({
        color: 0x064e3b,
        metalness: 0.8,
        roughness: 0.2
      });
      const base = new THREE.Mesh(baseGeom, baseMat);
      base.position.y = -0.94;
      barGroup.add(base);

      rootGroup.rotation.x = 0.3;
      rootGroup.rotation.y = -0.35;

      animUpdate = (t) => {
        rootGroup.rotation.y += 0.012;
        bars.forEach((b, i) => {
          b.position.y = (heights[i] / 2 - 0.9) + Math.sin(t * 0.003 + i * 1.5) * 0.08;
        });
      };

    } else if (idx === 2) {
      // 3. 3D Isometric Stacked Diamond Matrix (3 End-to-End Analytics Projects)
      const stackGroup = new THREE.Group();
      rootGroup.add(stackGroup);

      const plateGeom = new THREE.BoxGeometry(1.45, 0.12, 1.45);
      const plateMat = new THREE.MeshStandardMaterial({
        color: 0x6366f1,
        metalness: 0.8,
        roughness: 0.2,
        emissive: 0x4f46e5,
        emissiveIntensity: 0.4
      });

      const plates = [];
      [-0.55, 0, 0.55].forEach((yPos) => {
        const plate = new THREE.Mesh(plateGeom, plateMat.clone());
        plate.position.y = yPos;
        plate.rotation.y = Math.PI / 4;
        stackGroup.add(plate);
        plates.push(plate);
      });

      // Glowing central core crystal
      const coreGeom = new THREE.OctahedronGeometry(0.35);
      const coreMat = new THREE.MeshBasicMaterial({
        color: 0xa855f7,
        wireframe: true
      });
      const core = new THREE.Mesh(coreGeom, coreMat);
      stackGroup.add(core);

      // Orbital telemetry ring
      const ringGeom = new THREE.TorusGeometry(1.4, 0.03, 6, 32);
      const orbRing = new THREE.Mesh(ringGeom, new THREE.MeshBasicMaterial({ color: 0xc084fc }));
      orbRing.rotation.x = Math.PI / 2.5;
      stackGroup.add(orbRing);

      rootGroup.rotation.x = 0.4;

      animUpdate = (t) => {
        rootGroup.rotation.y += 0.018;
        core.rotation.x += 0.02;
        core.rotation.y += 0.03;
        orbRing.rotation.z -= 0.02;
        plates.forEach((p, i) => {
          p.rotation.y = (Math.PI / 4) + Math.sin(t * 0.002 + i) * 0.12;
        });
      };

    } else {
      // 4. 3D Holographic Award Medal & Stars (50000+ Raw Rows Preprocessed)
      const medalGroup = new THREE.Group();
      rootGroup.add(medalGroup);

      const torusGeom = new THREE.TorusGeometry(0.9, 0.12, 12, 32);
      const goldMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        metalness: 0.9,
        roughness: 0.2,
        emissive: 0xd97706,
        emissiveIntensity: 0.35
      });
      const torus = new THREE.Mesh(torusGeom, goldMat);
      medalGroup.add(torus);

      // Center faceted star jewel
      const starGeom = new THREE.IcosahedronGeometry(0.55, 0);
      const starMat = new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        metalness: 0.7,
        roughness: 0.3,
        wireframe: false
      });
      const star = new THREE.Mesh(starGeom, starMat);
      medalGroup.add(star);

      // Hanging ribbons
      const ribbonGeom = new THREE.BoxGeometry(0.25, 0.7, 0.05);
      const ribbonMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.5 });
      const r1 = new THREE.Mesh(ribbonGeom, ribbonMat);
      r1.position.set(-0.25, -1.0, -0.05);
      r1.rotation.z = 0.25;
      medalGroup.add(r1);

      const r2 = new THREE.Mesh(ribbonGeom, ribbonMat);
      r2.position.set(0.25, -1.0, -0.05);
      r2.rotation.z = -0.25;
      medalGroup.add(r2);

      rootGroup.rotation.x = 0.15;

      animUpdate = (t) => {
        rootGroup.rotation.y += 0.016;
        star.rotation.y += 0.025;
        star.rotation.z += 0.01;
      };
    }

    // Mouse tracking on parent card
    const card = vp.closest('.stat-card');
    let targetRotX = rootGroup.rotation.x;
    let targetRotY = rootGroup.rotation.y;
    let isHovered = false;

    if (card) {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const nx = (e.clientX - rect.left) / rect.width - 0.5;
        const ny = (e.clientY - rect.top) / rect.height - 0.5;
        targetRotY = nx * 1.8;
        targetRotX = -ny * 1.2;
      });

      card.addEventListener('mouseenter', () => {
        isHovered = true;
      });

      card.addEventListener('mouseleave', () => {
        isHovered = false;
        targetRotX = 0.25;
        targetRotY = 0;
      });

      // Interactive click speed boost
      card.addEventListener('click', () => {
        rootGroup.rotation.y += 0.8;
      });
    }

    scenes.push({
      renderer,
      scene,
      camera,
      rootGroup,
      animUpdate,
      getTargets: () => ({ x: targetRotX, y: targetRotY, hovered: isHovered }),
      dom: vp
    });
  });

  if (!scenes.length) return;

  // Render loop with IntersectionObserver optimization
  let isVisible = false;
  const container = document.getElementById('stats-container');
  if (container) {
    const observer = new IntersectionObserver((entries) => {
      isVisible = entries[0].isIntersecting;
    }, { threshold: 0.1 });
    observer.observe(container);
  } else {
    isVisible = true;
  }

  function animate(now) {
    requestAnimationFrame(animate);
    if (!isVisible) return;

    scenes.forEach(item => {
      item.animUpdate(now);
      const { x, y, hovered } = item.getTargets();
      if (hovered) {
        item.rootGroup.rotation.x += (x - item.rootGroup.rotation.x) * 0.1;
        item.rootGroup.rotation.y += (y - item.rootGroup.rotation.y) * 0.1;
      }
      item.renderer.render(item.scene, item.camera);
    });
  }

  requestAnimationFrame(animate);
}
