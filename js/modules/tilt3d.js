/* ==========================================================================
   INTERACTIVE 3D TILT PHYSICS MODULE
   Module: tilt3d.js
   Smooth, zero-dependency cursor-following 3D perspective tilt & specular glare.
   Supports initial DOM attachment and dynamic re-binding for filtered cards.
   ========================================================================== */

export function attachTiltToCard(card) {
  if (!card || card.hasAttribute('data-tilt-attached')) return;
  card.setAttribute('data-tilt-attached', 'true');
  card.classList.add('tilt-card');

  // Create dynamic specular glare layer if not present
  let glareContainer = card.querySelector('.tilt-glare');
  if (!glareContainer) {
    glareContainer = document.createElement('div');
    glareContainer.className = 'tilt-glare';
    const glareInner = document.createElement('div');
    glareInner.className = 'tilt-glare-inner';
    glareContainer.appendChild(glareInner);
    card.appendChild(glareContainer);
  }

  const glareInner = glareContainer.querySelector('.tilt-glare-inner');
  const maxTilt = parseFloat(card.getAttribute('data-tilt-max')) || 8; // degrees
  const scale = parseFloat(card.getAttribute('data-tilt-scale')) || 1.02;

  let isHovered = false;

  card.addEventListener('mouseenter', () => {
    isHovered = true;
    card.style.transition = 'transform 120ms ease-out, box-shadow 250ms ease';
    if (glareInner) glareInner.style.opacity = '1';
  });

  card.addEventListener('mousemove', (e) => {
    if (!isHovered) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const normX = (x - centerX) / centerX;
    const normY = (y - centerY) / centerY;

    const rotateX = (-normY * maxTilt).toFixed(2);
    const rotateY = (normX * maxTilt).toFixed(2);

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`;

    if (glareInner) {
      const glareX = (normX * 50 + 50).toFixed(1);
      const glareY = (normY * 50 + 50).toFixed(1);
      glareInner.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0) 65%)`;
    }
  });

  card.addEventListener('mouseleave', () => {
    isHovered = false;
    card.style.transition = 'transform 500ms cubic-bezier(0.25, 1, 0.5, 1), box-shadow 400ms ease';
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    if (glareInner) glareInner.style.opacity = '0';
  });
}

export function initTilt3D(container = document) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.matchMedia('(pointer: coarse)').matches) {
    return;
  }

  const elements = container.querySelectorAll('[data-tilt]');
  elements.forEach(attachTiltToCard);
}
