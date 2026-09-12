/* ==========================================================================
   TYPEWRITER EFFECT MODULE
   Module: typing.js
   Creates a smooth typewriter animation cycling through roles
   ========================================================================== */

export function initTypewriter(words, targetElementId, options = {}) {
  const target = document.getElementById(targetElementId);
  if (!target || !words || !words.length) return;

  const typeSpeed = options.typeSpeed || 75;
  const backSpeed = options.backSpeed || 40;
  const holdDelay = options.holdDelay || 1800;

  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function type() {
    const currentWord = words[wordIndex];

    if (isDeleting) {
      charIndex--;
      target.textContent = currentWord.substring(0, charIndex);
    } else {
      charIndex++;
      target.textContent = currentWord.substring(0, charIndex);
    }

    let delay = isDeleting ? backSpeed : typeSpeed;

    if (!isDeleting && charIndex === currentWord.length) {
      delay = holdDelay;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      delay = 400;
    }

    setTimeout(type, delay);
  }

  type();
}
