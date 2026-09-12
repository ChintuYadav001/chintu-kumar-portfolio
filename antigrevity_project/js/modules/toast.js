/* ==========================================================================
   TOAST NOTIFICATION MODULE
   Module: toast.js
   Creates and manages temporary floating notification toasts
   ========================================================================== */

import { getIcon } from './icons.js';

let toastContainer = null;

export function initToast() {
  toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }
}

export function showToast(message, type = 'info', duration = 3500) {
  if (!toastContainer) initToast();

  const iconName = type === 'success' ? 'check' : (type === 'error' ? 'close' : 'zap');

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-icon">${getIcon(iconName)}</div>
    <div class="toast-message">${message}</div>
  `;

  toastContainer.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    toast.addEventListener('transitionend', () => {
      toast.remove();
    });
  }, duration);
}
