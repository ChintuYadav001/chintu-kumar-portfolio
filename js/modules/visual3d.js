/* ==========================================================================
   INTERACTIVE 3D DATA CONSTELLATION & MESH VISUAL
   Module: visual3d.js
   Full-section high-performance 3D canvas constellation network.
   Features:
   - 75+ dynamic nodes drifting in 3D perspective space
   - Distance-based neural connection lines with depth gradient
   - Subtle geometric facet fills between adjacent node triplets
   - Floating glowing blue diamond/square particles matching reference
   - Interactive mouse attraction and parallax orbit physics
   - Zero CPU waste: pause render loop when off-screen via IntersectionObserver
   ========================================================================== */

export function initVisual3D(canvasId = 'about-constellation-canvas') {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const section = canvas.closest('#about') || canvas.parentElement;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = 0;
  let height = 0;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  // 1. Constellation Nodes Configuration
  const NODE_COUNT = 72;
  const nodes = [];

  // Generate 3D nodes inside a wide volumetric bounding box
  for (let i = 0; i < NODE_COUNT; i++) {
    nodes.push({
      x: (Math.random() - 0.5) * 1600,
      y: (Math.random() - 0.5) * 900,
      z: (Math.random() - 0.5) * 600,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      vz: (Math.random() - 0.5) * 0.35,
      radius: Math.random() * 2 + 1.8,
      projX: 0,
      projY: 0,
      scale: 1,
      alpha: 1,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.02 + Math.random() * 0.02
    });
  }

  // 2. Floating Geometric Accent Particles (Squares/Diamonds matching reference)
  const FLOATING_SQUARES = [
    { x: -350, y: -120, z: -50, size: 14, rot: 0.2, rotSpeed: 0.006, vx: 0.15, vy: -0.1 },
    { x: -120, y: 80, z: 80, size: 10, rot: -0.4, rotSpeed: -0.008, vx: -0.12, vy: 0.12 },
    { x: 180, y: -180, z: -100, size: 16, rot: 0.5, rotSpeed: 0.005, vx: 0.08, vy: 0.14 },
    { x: 420, y: 140, z: 40, size: 12, rot: -0.3, rotSpeed: -0.007, vx: -0.14, vy: -0.08 },
    { x: -500, y: 160, z: -80, size: 15, rot: 0.8, rotSpeed: 0.009, vx: 0.1, vy: -0.12 }
  ];

  // Mouse & View Tracking
  const mouse = {
    x: -9999,
    y: -9999,
    targetX: 0,
    targetY: 0,
    rotX: 0,
    rotY: 0,
    targetRotX: 0,
    targetRotY: 0,
    isHovered: false
  };

  let isRunning = false;
  let animId = null;

  function resize() {
    const rect = section ? section.getBoundingClientRect() : canvas.getBoundingClientRect();
    width = Math.max(rect.width, 320);
    height = Math.max(rect.height, 450);

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  }

  // Event Listeners on Section for Interactive Mouse Parallax
  if (section) {
    section.addEventListener('mousemove', (e) => {
      const rect = section.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      mouse.targetRotY = nx * 0.45;
      mouse.targetRotX = -ny * 0.35;
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.isHovered = true;
    });

    section.addEventListener('mouseleave', () => {
      mouse.isHovered = false;
      mouse.x = -9999;
      mouse.y = -9999;
    });

    section.addEventListener('touchmove', (e) => {
      if (!e.touches[0]) return;
      const rect = section.getBoundingClientRect();
      const nx = ((e.touches[0].clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.touches[0].clientY - rect.top) / rect.height) * 2 - 1;
      mouse.targetRotY = nx * 0.45;
      mouse.targetRotX = -ny * 0.35;
      mouse.x = e.touches[0].clientX - rect.left;
      mouse.y = e.touches[0].clientY - rect.top;
    }, { passive: true });
  }

  const FOCAL_LENGTH = 650;
  const BOUND_X = 850;
  const BOUND_Y = 500;
  const BOUND_Z = 350;

  function render() {
    if (!isRunning) return;

    // Smooth inertia interpolation
    if (!mouse.isHovered) {
      mouse.targetRotY += 0.0015;
      mouse.targetRotX = Math.sin(Date.now() * 0.0006) * 0.12;
    }

    mouse.rotX += (mouse.targetRotX - mouse.rotX) * 0.05;
    mouse.rotY += (mouse.targetRotY - mouse.rotY) * 0.05;

    const cosX = Math.cos(mouse.rotX);
    const sinX = Math.sin(mouse.rotX);
    const cosY = Math.cos(mouse.rotY);
    const sinY = Math.sin(mouse.rotY);

    ctx.clearRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;

    // 1. Update and Project 3D Nodes
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];

      // Drift in 3D space
      node.x += node.vx;
      node.y += node.vy;
      node.z += node.vz;

      // Wrap around bounds softly
      if (node.x > BOUND_X) node.x = -BOUND_X;
      else if (node.x < -BOUND_X) node.x = BOUND_X;
      if (node.y > BOUND_Y) node.y = -BOUND_Y;
      else if (node.y < -BOUND_Y) node.y = BOUND_Y;
      if (node.z > BOUND_Z) node.z = -BOUND_Z;
      else if (node.z < -BOUND_Z) node.z = BOUND_Z;

      // 3D rotation transform
      const x1 = node.x * cosY + node.z * sinY;
      const z1 = -node.x * sinY + node.z * cosY;
      const y1 = node.y * cosX - z1 * sinX;
      const z2 = node.y * sinX + z1 * cosX;

      const depth = FOCAL_LENGTH + z2;
      const scale = FOCAL_LENGTH / Math.max(depth, 100);

      node.projX = cx + x1 * scale;
      node.projY = cy + y1 * scale;
      node.scale = scale;
      node.alpha = Math.max(0.15, Math.min(0.9, (z2 + BOUND_Z) / (BOUND_Z * 2)));

      // Subtle pulse
      node.pulse += node.pulseSpeed;
    }

    // 2. Draw Connection Lines between Nearby Nodes
    const MAX_LINE_DIST = 160;
    const linePairs = [];

    for (let i = 0; i < nodes.length; i++) {
      const p1 = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const p2 = nodes[j];

        const dx = p1.projX - p2.projX;
        const dy = p1.projY - p2.projY;
        const dist = Math.hypot(dx, dy);

        if (dist < MAX_LINE_DIST) {
          const edgeAlpha = (1 - dist / MAX_LINE_DIST) * Math.min(p1.alpha, p2.alpha) * 0.45;
          ctx.beginPath();
          ctx.moveTo(p1.projX, p1.projY);
          ctx.lineTo(p2.projX, p2.projY);
          ctx.strokeStyle = `rgba(59, 130, 246, ${edgeAlpha.toFixed(3)})`;
          ctx.lineWidth = 1 * Math.min(p1.scale, p2.scale);
          ctx.stroke();

          linePairs.push({ i, j, dist });
        }
      }
    }

    // 3. Subtle Delaunay Facet Fills (between tight triangular triplets)
    for (let k = 0; k < Math.min(linePairs.length, 30); k++) {
      const pair1 = linePairs[k];
      for (let m = k + 1; m < Math.min(linePairs.length, 30); m++) {
        const pair2 = linePairs[m];
        let shared = -1, a = -1, b = -1;
        if (pair1.i === pair2.i) { shared = pair1.i; a = pair1.j; b = pair2.j; }
        else if (pair1.i === pair2.j) { shared = pair1.i; a = pair1.j; b = pair2.i; }
        else if (pair1.j === pair2.i) { shared = pair1.j; a = pair1.i; b = pair2.j; }
        else if (pair1.j === pair2.j) { shared = pair1.j; a = pair1.i; b = pair2.i; }

        if (shared !== -1) {
          const pA = nodes[a], pB = nodes[b];
          const dAB = Math.hypot(pA.projX - pB.projX, pA.projY - pB.projY);
          if (dAB < MAX_LINE_DIST * 0.8) {
            const triAlpha = Math.min(nodes[shared].alpha, pA.alpha, pB.alpha) * 0.04;
            ctx.beginPath();
            ctx.moveTo(nodes[shared].projX, nodes[shared].projY);
            ctx.lineTo(pA.projX, pA.projY);
            ctx.lineTo(pB.projX, pB.projY);
            ctx.closePath();
            ctx.fillStyle = `rgba(37, 99, 235, ${triAlpha.toFixed(3)})`;
            ctx.fill();
          }
        }
      }
    }

    // 4. Mouse Proximity Interactive Glow Lines
    if (mouse.isHovered && mouse.x > 0 && mouse.y > 0) {
      for (let i = 0; i < nodes.length; i++) {
        const p = nodes[i];
        const mDist = Math.hypot(p.projX - mouse.x, p.projY - mouse.y);
        if (mDist < 200) {
          const mAlpha = (1 - mDist / 200) * 0.6;
          ctx.beginPath();
          ctx.moveTo(mouse.x, mouse.y);
          ctx.lineTo(p.projX, p.projY);
          ctx.strokeStyle = `rgba(96, 165, 250, ${mAlpha.toFixed(3)})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
      }
    }

    // 5. Draw Constellation Nodes (Electric Blue Luminous Dots)
    for (let i = 0; i < nodes.length; i++) {
      const p = nodes[i];
      const r = Math.max(1.5, p.radius * p.scale * (1 + 0.2 * Math.sin(p.pulse)));

      // Outer radial glow
      const glowGrad = ctx.createRadialGradient(p.projX, p.projY, 0, p.projX, p.projY, r * 3.5);
      glowGrad.addColorStop(0, `rgba(59, 130, 246, ${(p.alpha * 0.7).toFixed(3)})`);
      glowGrad.addColorStop(1, 'rgba(59, 130, 246, 0)');

      ctx.beginPath();
      ctx.arc(p.projX, p.projY, r * 3.5, 0, Math.PI * 2);
      ctx.fillStyle = glowGrad;
      ctx.fill();

      // Bright core dot
      ctx.beginPath();
      ctx.arc(p.projX, p.projY, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(147, 197, 253, ${p.alpha.toFixed(3)})`;
      ctx.fill();
    }

    // 6. Draw Floating Blue Accent Squares / Diamonds (Matching screenshot reference)
    for (let i = 0; i < FLOATING_SQUARES.length; i++) {
      const sq = FLOATING_SQUARES[i];
      sq.x += sq.vx;
      sq.y += sq.vy;
      sq.rot += sq.rotSpeed;

      if (sq.x > BOUND_X) sq.x = -BOUND_X;
      else if (sq.x < -BOUND_X) sq.x = BOUND_X;
      if (sq.y > BOUND_Y) sq.y = -BOUND_Y;
      else if (sq.y < -BOUND_Y) sq.y = BOUND_Y;

      const x1 = sq.x * cosY + sq.z * sinY;
      const z1 = -sq.x * sinY + sq.z * cosY;
      const y1 = sq.y * cosX - z1 * sinX;
      const z2 = sq.y * sinX + z1 * cosX;

      const scale = FOCAL_LENGTH / Math.max(FOCAL_LENGTH + z2, 100);
      const px = cx + x1 * scale;
      const py = cy + y1 * scale;
      const size = sq.size * scale;
      const sqAlpha = Math.max(0.2, Math.min(0.65, (z2 + BOUND_Z) / (BOUND_Z * 2)));

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(sq.rot);

      ctx.fillStyle = `rgba(37, 99, 235, ${(sqAlpha * 0.65).toFixed(3)})`;
      ctx.fillRect(-size / 2, -size / 2, size, size);

      ctx.strokeStyle = `rgba(96, 165, 250, ${(sqAlpha * 0.9).toFixed(3)})`;
      ctx.lineWidth = 1.2;
      ctx.strokeRect(-size / 2, -size / 2, size, size);

      ctx.restore();
    }

    animId = requestAnimationFrame(render);
  }

  // IntersectionObserver: Run only when the section is in view
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        if (!isRunning) {
          isRunning = true;
          resize();
          render();
        }
      } else {
        isRunning = false;
        if (animId) cancelAnimationFrame(animId);
      }
    });
  }, { threshold: 0.05 });

  observer.observe(section || canvas);

  window.addEventListener('resize', () => {
    if (isRunning) resize();
  });
}
