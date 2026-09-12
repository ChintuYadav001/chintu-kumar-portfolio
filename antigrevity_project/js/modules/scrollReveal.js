/* ==========================================================================
   SCROLL REVEAL MODULE
   Module: scrollReveal.js
   Uses IntersectionObserver to trigger smooth entrance animations on scroll
   ========================================================================== */

export function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal');

  // Immediately activate any elements currently in viewport or near top
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  revealElements.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top <= windowHeight * 1.1) {
      el.classList.add('active');
    }
  });

  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    revealElements.forEach(el => el.classList.add('active'));
    return;
  }

  const observerOptions = {
    threshold: 0.02,
    rootMargin: '100px 0px 100px 0px'
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(el => {
    if (!el.classList.contains('active')) {
      observer.observe(el);
    }
  });

  // Failsafe: ensure everything is visible after 1.2s even if user doesn't scroll
  setTimeout(() => {
    document.querySelectorAll('.reveal:not(.active)').forEach(el => el.classList.add('active'));
  }, 1200);
}
