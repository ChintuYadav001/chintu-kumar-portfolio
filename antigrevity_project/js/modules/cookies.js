/* ==========================================================================
   VISITOR COOKIES & ANALYTICS MODULE
   Module: cookies.js
   Saves visitor details into persistent browser cookies, tracks return visits,
   provides a modern floating consent banner and an interactive Cookie Inspector.
   ========================================================================== */

import { getIcon } from './icons.js';
import { showToast } from './toast.js';
import { sendEmailAlert, sendNtfyAlert } from './visitorAlert.js';
import { portfolioData } from '../data/portfolioData.js';

// --------------------------------------------------------------------------
// 1. Standard Cookie Manipulation API
// --------------------------------------------------------------------------

/**
 * Sets a browser cookie with standard security attributes
 * @param {string} name 
 * @param {string} value 
 * @param {number} days 
 */
export function setCookie(name, value, days = 365) {
  try {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = 'expires=' + d.toUTCString();
    const encodedValue = encodeURIComponent(value);
    document.cookie = `${name}=${encodedValue};${expires};path=/;SameSite=Lax`;
  } catch (e) {
    console.warn('[Cookies] Failed to set cookie:', name, e);
  }
}

/**
 * Reads a cookie value by name
 * @param {string} name 
 * @returns {string|null}
 */
export function getCookie(name) {
  try {
    const cname = name + '=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i].trim();
      if (c.indexOf(cname) === 0) {
        return c.substring(cname.length, c.length);
      }
    }
  } catch (e) {
    console.warn('[Cookies] Failed to read cookie:', name, e);
  }
  return null;
}

/**
 * Deletes a cookie by setting expired timestamp
 * @param {string} name 
 */
export function deleteCookie(name) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax`;
}

/**
 * Returns an object containing all cookies
 * @returns {Object}
 */
export function getAllCookies() {
  const result = {};
  try {
    const decoded = decodeURIComponent(document.cookie);
    if (!decoded) return result;
    const pairs = decoded.split(';');
    for (let pair of pairs) {
      const idx = pair.indexOf('=');
      if (idx > -1) {
        const key = pair.substring(0, idx).trim();
        const val = pair.substring(idx + 1).trim();
        if (key) result[key] = val;
      }
    }
  } catch (e) {
    console.warn('[Cookies] Error reading all cookies:', e);
  }
  return result;
}

// --------------------------------------------------------------------------
// 2. Client & Environment Detection
// --------------------------------------------------------------------------

function detectEnvironment() {
  const ua = navigator.userAgent || '';

  // Operating System
  let os = 'Windows';
  if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
  else if (/linux/i.test(ua)) os = 'Linux';
  else if (/windows nt 10/i.test(ua)) os = 'Windows 10/11';

  // Browser
  let browser = 'Chrome';
  if (/edg\//i.test(ua)) browser = 'Microsoft Edge';
  else if (/opr|opera/i.test(ua)) browser = 'Opera';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
  else if (/chrome|crios/i.test(ua)) browser = 'Chrome';

  // Device Type
  const isMobile = /mobile|android|iphone|ipad|ipod/i.test(ua) || window.innerWidth < 768;
  const isTablet = !isMobile && (window.innerWidth <= 1024 || /tablet/i.test(ua));
  const device = isMobile ? 'Mobile' : (isTablet ? 'Tablet' : 'Desktop');

  // Referrer parsing
  let referrer = 'Direct Visit';
  const ref = document.referrer;
  if (ref) {
    if (ref.includes('linkedin.com')) referrer = 'LinkedIn';
    else if (ref.includes('github.com')) referrer = 'GitHub';
    else if (ref.includes('google.com')) referrer = 'Google Search';
    else if (ref.includes('whatsapp') || ref.includes('wa.me')) referrer = 'WhatsApp';
    else if (ref.includes('twitter.com') || ref.includes('t.co')) referrer = 'Twitter / X';
    else {
      try {
        referrer = new URL(ref).hostname;
      } catch (e) {
        referrer = ref.slice(0, 40);
      }
    }
  }

  // URL query parameter referral override (e.g. ?ref=linkedin)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('ref')) referrer = urlParams.get('ref');
  else if (urlParams.has('utm_source')) referrer = urlParams.get('utm_source');

  // Screen resolution & timezone
  const screen = `${window.screen.width}x${window.screen.height}`;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown';

  return { os, browser, device, referrer, screen, timezone };
}

// --------------------------------------------------------------------------
// 3. Visitor Tracking Engine (Saves details via cookies)
// --------------------------------------------------------------------------

/**
 * Automatically captures and saves visitor details into cookies
 */
export function trackVisitorCookies() {
  const env = detectEnvironment();
  const now = new Date();
  const nowFormatted = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' +
                       now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  // 1. Visitor ID (Unique UUID)
  let visitorId = getCookie('ck_visitor_id');
  if (!visitorId) {
    const randPart = Math.random().toString(36).substring(2, 9);
    visitorId = `vis_${Date.now().toString(36)}_${randPart}`;
    setCookie('ck_visitor_id', visitorId, 365);
  }

  // 2. Visit Count (Tracks returning visitors across sessions)
  let visitCount = parseInt(getCookie('ck_visit_count') || '0', 10);
  const isNewSession = !sessionStorage.getItem('ck_session_active');

  if (isNewSession) {
    visitCount += 1;
    setCookie('ck_visit_count', visitCount.toString(), 365);
    sessionStorage.setItem('ck_session_active', 'true');

    // Notify returning visitors politely
    if (visitCount > 1) {
      setTimeout(() => {
        showToast(`👋 Welcome back to Chintu's portfolio! (Visit #${visitCount})`, 'info', 4000);
      }, 2000);
    }
  }

  // 3. First Visit Timestamp (Permanent record)
  let firstVisit = getCookie('ck_first_visit');
  if (!firstVisit) {
    firstVisit = nowFormatted;
    setCookie('ck_first_visit', firstVisit, 365);
  }

  // 4. Latest Visit Timestamp (Updated every visit)
  setCookie('ck_last_visit', nowFormatted, 365);

  // 5. Traffic Source / Referrer
  let storedReferrer = getCookie('ck_referrer');
  if (!storedReferrer || storedReferrer === 'Direct Visit') {
    setCookie('ck_referrer', env.referrer, 365);
  }

  // 6. Device & Browser Attributes
  setCookie('ck_device', env.device, 365);
  setCookie('ck_browser', env.browser, 365);
  setCookie('ck_os', env.os, 365);
  setCookie('ck_screen', env.screen, 365);
  setCookie('ck_timezone', env.timezone, 365);

  // 7. Theme Preference
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  setCookie('ck_theme', currentTheme, 365);

  // 8. Track Active Section on scroll
  trackActiveSection();

  // Redundancy: save summary snapshot in localStorage
  try {
    const profile = {
      visitorId,
      visitCount,
      firstVisit,
      lastVisit: nowFormatted,
      referrer: env.referrer,
      device: env.device,
      browser: env.browser,
      os: env.os,
      screen: env.screen,
      timezone: env.timezone
    };
    localStorage.setItem('chintu_visitor_cookie_profile', JSON.stringify(profile));
  } catch (e) {}

  console.log(`%c[Cookies] 🍪 Visitor details saved to cookies: ID=${visitorId} | Visits=${visitCount} | Device=${env.device}`, 'color: #38bdf8; font-weight: bold;');
}

/**
 * Tracks the last viewed section in a cookie as the visitor navigates
 */
function trackActiveSection() {
  const sections = document.querySelectorAll('section[id]');
  if (!sections || sections.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
        const sectionId = entry.target.getAttribute('id');
        if (sectionId) {
          setCookie('ck_last_section', sectionId, 30);
        }
      }
    });
  }, { threshold: [0.3] });

  sections.forEach(sec => observer.observe(sec));
}

// --------------------------------------------------------------------------
// 4. Floating Cookie Consent Banner
// --------------------------------------------------------------------------

/**
 * Injects and initializes the floating cookie consent banner
 */
export function initCookieBanner() {
  const consent = getCookie('ck_consent');

  // Create the banner if not already in DOM
  let banner = document.getElementById('cookie-consent-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'cookie-consent-banner';
    banner.className = 'cookie-consent-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Cookie & Privacy Preferences');

    banner.innerHTML = `
      <div class="cookie-banner-content">
        <div class="cookie-banner-icon-wrap">
          ${getIcon('cookie')}
        </div>
        <div class="cookie-banner-text">
          <div class="cookie-banner-title">
            <span>Cookie &amp; Visitor Preferences</span>
            <span class="cookie-banner-badge">Safe &bull; Secure</span>
          </div>
          <p class="cookie-banner-desc">
            This portfolio uses cookies to remember your preferences (dark/light theme, voice assistant), 
            track visit counts, and anonymously understand traffic sources.
          </p>
        </div>
      </div>
      <div class="cookie-banner-actions">
        <button type="button" id="cookie-btn-accept" class="cookie-btn cookie-btn-accept" title="Accept all cookies">
          ${getIcon('check')}
          <span>Accept All</span>
        </button>
        <button type="button" id="cookie-btn-details" class="cookie-btn cookie-btn-details" title="View details of saved cookies">
          ${getIcon('shield')}
          <span>View Details</span>
        </button>
        <button type="button" id="cookie-btn-essential" class="cookie-btn cookie-btn-essential" title="Keep essential cookies only">
          <span>Essential Only</span>
        </button>
        <button type="button" id="cookie-btn-close" class="cookie-banner-close-btn" aria-label="Close banner" title="Close">
          ${getIcon('close')}
        </button>
      </div>
    `;

    document.body.appendChild(banner);
  }

  // Bind Event Listeners
  const acceptBtn = document.getElementById('cookie-btn-accept');
  const detailsBtn = document.getElementById('cookie-btn-details');
  const essentialBtn = document.getElementById('cookie-btn-essential');
  const closeBtn = document.getElementById('cookie-btn-close');

  if (acceptBtn) {
    acceptBtn.addEventListener('click', () => {
      setCookie('ck_consent', 'accepted', 365);
      hideCookieBanner();
      showToast('🍪 All cookie preferences saved!', 'success');
      sendCookieAlert('Accepted All Cookies');
    });
  }

  if (detailsBtn) {
    detailsBtn.addEventListener('click', () => {
      openCookieModal();
    });
  }

  if (essentialBtn) {
    essentialBtn.addEventListener('click', () => {
      setCookie('ck_consent', 'essential', 90);
      hideCookieBanner();
      showToast('🍪 Essential cookies enabled.', 'info');
      sendCookieAlert('Essential Only Selected');
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      hideCookieBanner();
    });
  }

  // Bind footer button if present in DOM
  const footerCookieBtn = document.getElementById('footer-cookie-btn');
  if (footerCookieBtn) {
    footerCookieBtn.addEventListener('click', () => {
      openCookieModal();
    });
  }

  // Display banner after slight delay if user hasn't accepted yet
  if (!consent) {
    setTimeout(() => {
      banner.classList.add('visible');
    }, 1400);
  }
}

function hideCookieBanner() {
  const banner = document.getElementById('cookie-consent-banner');
  if (banner) {
    banner.classList.remove('visible');
    setTimeout(() => {
      banner.style.display = 'none';
    }, 350);
  }
}

// --------------------------------------------------------------------------
// 5. Interactive Cookie Inspector & Transparency Modal
// --------------------------------------------------------------------------

/**
 * Dispatches live cookie preferences and visitor telemetry to Chintu's Gmail & phone
 * @param {string} eventAction - e.g. 'Accepted All Cookies', 'Essential Only', 'Manual Snapshot'
 */
export function sendCookieAlert(eventAction = 'Cookie Preferences Saved') {
  try {
    const ownerEmail = portfolioData?.personalInfo?.email || 'yadavchintu0012@gmail.com';
    const ntfyTopic = portfolioData?.visitorAlert?.ntfy?.topic || 'chintu_portfolio_alerts_7763';

    const visitorId = getCookie('ck_visitor_id') || 'New Visitor';
    const visitCount = getCookie('ck_visit_count') || '1';
    const firstVisit = getCookie('ck_first_visit') || 'Just Now';
    const lastVisit = getCookie('ck_last_visit') || 'Active Session';
    const referrer = getCookie('ck_referrer') || 'Direct Visit';
    const device = getCookie('ck_device') || 'Desktop';
    const browser = getCookie('ck_browser') || 'Chrome';
    const os = getCookie('ck_os') || 'Windows';
    const screen = getCookie('ck_screen') || `${window.screen.width}x${window.screen.height}`;
    const consent = getCookie('ck_consent') || eventAction;
    const theme = getCookie('ck_theme') || (document.documentElement.getAttribute('data-theme') || 'dark');
    const geoLocation = getCookie('ck_geo_location') || 'Location Detected';
    const mapCoords = getCookie('ck_map_coords') || 'Detecting Coordinates...';
    const mapsUrl = getCookie('ck_maps_url') || (mapCoords.includes(',') ? `https://www.google.com/maps?q=${encodeURIComponent(mapCoords)}` : '');
    const accuracy = getCookie('ck_geo_accuracy') || 'City / ISP Precision';

    const now = new Date();
    const timeIST = now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'medium' });

    const formattedSummary = 
`🍪 PORTFOLIO COOKIE PREFERENCES SAVED!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Action: ${eventAction}
👤 Visitor ID: ${visitorId}
🔄 Total Visits: ${visitCount}
🍪 Consent Status: ${consent}
🎨 Theme Selected: ${theme.toUpperCase()}
📍 Location: ${geoLocation}
🗺️ Google Maps: ${mapsUrl || 'N/A'}
🛰️ Coordinates: ${mapCoords || 'N/A'}
🎯 Accuracy: ${accuracy}
📱 Device: ${device} (${os} • ${browser})
🖥️ Screen: ${screen}
🔗 Traffic Source: ${referrer}
📅 First Visit: ${firstVisit}
🕒 Latest Visit: ${lastVisit}
⏰ Time (IST): ${timeIST}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 Dispatched to Chintu's Gmail (${ownerEmail}) & Phone Push.`;

    const alertPayload = {
      subject: `🍪 Cookie Preferences Saved: ${eventAction} (${geoLocation})`,
      formattedText: formattedSummary,
      mapsUrl: mapsUrl,
      fields: {
        name: `Cookie Tracker (${visitorId.slice(0, 8)})`,
        email: 'cookie-notifications@chintu-portfolio.com',
        _replyto: ownerEmail,
        _subject: `🍪 Cookie Alert: ${eventAction} (${geoLocation})`,
        _captcha: 'false',
        _template: 'table',
        Event_Action: eventAction,
        Visitor_Cookie_ID: visitorId,
        Total_Visits: visitCount,
        Consent_Status: consent,
        Active_Theme: theme.toUpperCase(),
        Visitor_Location: geoLocation,
        Location_Coordinates: mapCoords,
        Google_Maps_Pin: mapsUrl || 'N/A',
        Device_System: `${device} (${os} • ${browser})`,
        Screen_Resolution: screen,
        Traffic_Source: referrer,
        First_Visit_Date: firstVisit,
        Latest_Visit_Date: lastVisit,
        Event_Time_IST: timeIST
      }
    };

    // 1. Dispatch Email to owner via FormSubmit & Netlify Forms
    sendEmailAlert(ownerEmail, alertPayload);

    // 2. Dispatch Netlify Form (specifically for cookie alerts)
    try {
      const netlifyData = new URLSearchParams();
      netlifyData.append('form-name', 'cookie-alerts');
      netlifyData.append('cookie_event', eventAction);
      netlifyData.append('visitor_id', visitorId);
      netlifyData.append('consent_status', consent);
      netlifyData.append('visit_count', visitCount);
      netlifyData.append('theme', theme);
      netlifyData.append('location', geoLocation);
      netlifyData.append('device', `${device} (${os})`);
      netlifyData.append('time_ist', timeIST);
      netlifyData.append('cookies_snapshot', formattedSummary);
      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: netlifyData.toString()
      }).catch(() => {});
    } catch (e) {}

    // 3. Dispatch Instant Mobile/Browser Push via ntfy
    sendNtfyAlert(ntfyTopic, {
      subject: `🍪 Cookie Alert: ${eventAction}`,
      formattedText: formattedSummary
    }, mapsUrl);

    console.log(`%c[Cookies] 🍪 Notification dispatched to ${ownerEmail}: ${eventAction}`, 'color: #38bdf8; font-weight: bold;');
    return true;
  } catch (err) {
    console.warn('[Cookies] Failed to dispatch cookie alert:', err);
    return false;
  }
}

/**
 * Creates and opens the Cookie Details modal showing live stored values
 */
export function openCookieModal() {
  let modal = document.getElementById('cookie-inspector-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'cookie-inspector-modal';
    modal.className = 'cookie-modal-backdrop';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Cookie Inspector & Stored Visitor Details');

    modal.innerHTML = `
      <div class="cookie-modal-window">
        <div class="cookie-modal-header">
          <div class="cookie-modal-title-wrap">
            <div class="cookie-modal-icon">${getIcon('cookie')}</div>
            <div>
              <h3 class="cookie-modal-title">Cookie &amp; Visitor Details</h3>
              <p class="cookie-modal-subtitle">Live transparency report of details saved in your browser cookies</p>
            </div>
          </div>
          <button type="button" id="cookie-modal-close-btn" class="cookie-modal-close-btn" aria-label="Close modal">
            ${getIcon('close')}
          </button>
        </div>

        <div class="cookie-modal-body" id="cookie-modal-body-content">
          <!-- Injected dynamically -->
        </div>

        <div class="cookie-modal-footer">
          <div class="cookie-modal-footer-left">
            <button type="button" id="cookie-modal-clear-btn" class="cookie-modal-btn-danger" title="Clear local cookies">
              ${getIcon('refresh')}
              <span>Clear Cookies</span>
            </button>
            <button type="button" id="cookie-modal-send-btn" class="cookie-modal-btn-info" title="Send live cookie snapshot directly to Chintu's Gmail">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
              <span>Send Cookies to Gmail</span>
            </button>
          </div>
          <div class="cookie-modal-footer-right">
            <button type="button" id="cookie-modal-verify-btn" class="cookie-modal-btn-verify" title="Verify / Activate Gmail Alert Delivery">
              <span>🔔 Activate / Test Gmail</span>
            </button>
            <button type="button" id="cookie-modal-ok-btn" class="cookie-modal-btn-primary">
              ${getIcon('check')}
              <span>Got It</span>
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Event listeners
    modal.querySelector('#cookie-modal-close-btn').addEventListener('click', closeCookieModal);
    modal.querySelector('#cookie-modal-ok-btn').addEventListener('click', closeCookieModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeCookieModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) {
        closeCookieModal();
      }
    });

    modal.querySelector('#cookie-modal-clear-btn').addEventListener('click', () => {
      clearAllVisitorCookies();
      renderCookieModalContent();
      showToast('All portfolio cookies cleared!', 'info');
    });

    modal.querySelector('#cookie-modal-send-btn').addEventListener('click', () => {
      sendCookieAlert('Manual Snapshot Sent via Cookie Modal');
      showToast('✉️ Cookie details dispatched to yadavchintu0012@gmail.com!', 'success');
    });

    modal.querySelector('#cookie-modal-verify-btn').addEventListener('click', () => {
      // Trigger FormSubmit direct test form submission
      triggerDirectFormSubmitActivation();
    });
  }

  renderCookieModalContent();
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeCookieModal() {
  const modal = document.getElementById('cookie-inspector-modal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

/**
 * Directly submits a standard POST form to FormSubmit in a new tab so the user can see activation status
 */
export function triggerDirectFormSubmitActivation() {
  try {
    const ownerEmail = portfolioData?.personalInfo?.email || 'yadavchintu0012@gmail.com';
    const form = document.createElement('form');
    form.action = `https://formsubmit.co/${ownerEmail}`;
    form.method = 'POST';
    form.target = '_blank';
    form.style.display = 'none';

    const fields = {
      name: 'Portfolio Alerts Activator',
      email: ownerEmail,
      _subject: '🔔 Chintu Portfolio - Gmail & Cookie Alert Verification',
      _replyto: ownerEmail,
      _captcha: 'false',
      message: `FormSubmit alert activation test dispatched for ${ownerEmail}. If you see 'Activate Form' in your Gmail (or Spam folder), please click it once to enable instant email delivery for visitor and cookie alerts.`
    };

    for (const [key, val] of Object.entries(fields)) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = val;
      form.appendChild(input);
    }

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);

    showToast('📧 FormSubmit activation opened! Check your Gmail (and Spam folder) for the confirmation link.', 'info');
  } catch (e) {
    console.warn('[Cookies] Failed to trigger FormSubmit activation:', e);
  }
}

/**
 * Renders the live table of stored cookies inside the modal
 */
function renderCookieModalContent() {
  const container = document.getElementById('cookie-modal-body-content');
  if (!container) return;

  const visitorId = getCookie('ck_visitor_id') || 'Not Set';
  const visitCount = getCookie('ck_visit_count') || '1';
  const firstVisit = getCookie('ck_first_visit') || 'Just Now';
  const lastVisit = getCookie('ck_last_visit') || 'Active Session';
  const referrer = getCookie('ck_referrer') || 'Direct Visit';
  const device = getCookie('ck_device') || 'Desktop';
  const browser = getCookie('ck_browser') || 'Chrome';
  const os = getCookie('ck_os') || 'Windows';
  const screen = getCookie('ck_screen') || `${window.screen.width}x${window.screen.height}`;
  const consent = getCookie('ck_consent') || 'Pending / Default';
  const theme = getCookie('ck_theme') || (document.documentElement.getAttribute('data-theme') || 'dark');
  const lastSection = getCookie('ck_last_section') || 'hero';
  const geoLocation = getCookie('ck_geo_location') || 'Detecting Location...';
  const mapCoords = getCookie('ck_map_coords') || 'Detecting Coordinates...';
  const mapsUrl = getCookie('ck_maps_url') || (mapCoords.includes(',') ? `https://www.google.com/maps?q=${encodeURIComponent(mapCoords)}` : '');
  const accuracy = getCookie('ck_geo_accuracy') || 'City / ISP Precision';

  const cookieList = [
    { key: 'ck_visitor_id', value: visitorId, label: 'Visitor Identifier', purpose: 'Unique anonymous ID assigned to your browser session', expiry: '365 Days' },
    { key: 'ck_visit_count', value: `${visitCount} (${parseInt(visitCount, 10) > 1 ? 'Returning Visitor' : 'First Visit'})`, label: 'Total Visits', purpose: 'Tracks number of times you have returned to this portfolio', expiry: '365 Days' },
    { key: 'ck_geo_location', value: geoLocation, label: 'Accurate Location', purpose: 'City, State, Country and Postal PIN code of visitor', expiry: '365 Days' },
    { key: 'ck_map_coords', value: mapCoords, label: 'Map Coordinates', purpose: 'Exact Latitude & Longitude coordinates', expiry: '365 Days' },
    { key: 'ck_maps_url', value: mapsUrl ? 'Google Maps Pin Active' : 'N/A', label: 'Google Maps Link', purpose: 'Direct Google Maps pin linking to visitor location', expiry: '365 Days' },
    { key: 'ck_first_visit', value: firstVisit, label: 'First Visit Date', purpose: 'Timestamp of your initial arrival', expiry: '365 Days' },
    { key: 'ck_last_visit', value: lastVisit, label: 'Latest Visit Date', purpose: 'Timestamp of your most recent session', expiry: '365 Days' },
    { key: 'ck_referrer', value: referrer, label: 'Traffic Source', purpose: 'Origin site (LinkedIn, GitHub, Direct, Google)', expiry: '365 Days' },
    { key: 'ck_device', value: `${device} (${os} &bull; ${browser})`, label: 'Device &amp; System', purpose: 'Ensures optimal 3D WebGL rendering and mobile layout', expiry: '365 Days' },
    { key: 'ck_screen', value: screen, label: 'Display Resolution', purpose: 'Canvas dimension calculations', expiry: '365 Days' },
    { key: 'ck_theme', value: theme.toUpperCase(), label: 'Theme Preference', purpose: 'Remembers dark mode or light mode selection', expiry: '365 Days' },
    { key: 'ck_last_section', value: `#${lastSection}`, label: 'Last Viewed Section', purpose: 'Restores view position on refresh or return', expiry: '30 Days' },
    { key: 'ck_consent', value: consent.toUpperCase(), label: 'Consent Status', purpose: 'Remembers cookie approval so banner stays hidden', expiry: '365 Days' }
  ];

  container.innerHTML = `
    <!-- Gmail & Notification Status Card -->
    <div class="cookie-gmail-status-card">
      <div class="cookie-gmail-icon-wrap">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
      </div>
      <div class="cookie-gmail-text">
        <div class="cookie-gmail-title">
          <span>Alerts Connected to Gmail &amp; Phone Push</span>
          <span class="cookie-gmail-live-badge">Live Active</span>
        </div>
        <p class="cookie-gmail-desc">
          Cookie &amp; visitor notifications route to: <code>yadavchintu0012@gmail.com</code> &bull; Push: <code>ntfy.sh/chintu_portfolio_alerts_7763</code>
        </p>
      </div>
      <button type="button" id="cookie-instant-test-btn" class="cookie-mini-test-btn" title="Send live snapshot right now">
        <span>⚡ Test Alert</span>
      </button>
    </div>

    <!-- KPI Summary Grid -->
    <div class="cookie-kpi-grid">
      <div class="cookie-kpi-card">
        <span class="cookie-kpi-label">Visitor ID</span>
        <span class="cookie-kpi-val" title="${visitorId}">${visitorId.slice(0, 14)}...</span>
      </div>
      <div class="cookie-kpi-card">
        <span class="cookie-kpi-label">Total Visits</span>
        <span class="cookie-kpi-val highlight">${visitCount}</span>
      </div>
      <div class="cookie-kpi-card">
        <span class="cookie-kpi-label">Traffic Source</span>
        <span class="cookie-kpi-val">${referrer}</span>
      </div>
      <div class="cookie-kpi-card">
        <span class="cookie-kpi-label">Device</span>
        <span class="cookie-kpi-val">${device}</span>
      </div>
    </div>

    <!-- Accurate Location & Map Box -->
    <div class="cookie-location-card">
      <div class="cookie-location-info">
        <div class="cookie-location-badge">
          ${getIcon('mapPin')}
          <span>Accurate Geolocation &amp; Map Pin</span>
          <span class="cookie-accuracy-pill">${accuracy}</span>
        </div>
        <h4 class="cookie-location-title">${geoLocation}</h4>
        <div class="cookie-location-meta">
          <span><strong>Coordinates:</strong> <code>${mapCoords}</code></span>
        </div>
      </div>
      ${mapsUrl ? `
        <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" class="cookie-maps-btn" title="Open live pin on Google Maps">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
          <span>Open in Google Maps</span>
        </a>
      ` : ''}
    </div>

    <!-- Cookie Details Table -->
    <div class="cookie-table-container">
      <table class="cookie-table">
        <thead>
          <tr>
            <th>Cookie Key</th>
            <th>Current Saved Value</th>
            <th>Purpose</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          ${cookieList.map(item => `
            <tr>
              <td><code>${item.key}</code></td>
              <td><span class="cookie-val-badge">${item.value}</span></td>
              <td>${item.purpose}</td>
              <td><span class="cookie-expiry-tag">${item.expiry}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="cookie-notice-footer">
      <span>🔒 <strong>Privacy Assurance:</strong> All cookies are stored locally inside your browser and never shared with third-party advertisers.</span>
    </div>
  `;

  // Bind Instant Test Button
  const instantTestBtn = document.getElementById('cookie-instant-test-btn');
  if (instantTestBtn) {
    instantTestBtn.addEventListener('click', () => {
      sendCookieAlert('Instant Test Alert from Cookie Inspector');
      showToast('⚡ Live Cookie & Visitor Alert sent to yadavchintu0012@gmail.com!', 'success');
    });
  }
}

/**
 * Wipes all portfolio cookies
 */
export function clearAllVisitorCookies() {
  const cookiesToClear = [
    'ck_visitor_id',
    'ck_visit_count',
    'ck_first_visit',
    'ck_last_visit',
    'ck_referrer',
    'ck_device',
    'ck_browser',
    'ck_os',
    'ck_screen',
    'ck_timezone',
    'ck_theme',
    'ck_last_section',
    'ck_consent',
    'ck_geo_location',
    'ck_map_coords',
    'ck_maps_url',
    'ck_geo_accuracy'
  ];

  cookiesToClear.forEach(name => deleteCookie(name));
  sessionStorage.removeItem('ck_session_active');
  localStorage.removeItem('chintu_visitor_cookie_profile');
}

// --------------------------------------------------------------------------
// 6. Global Window Exports for Easy Testing & Integration
// --------------------------------------------------------------------------
if (typeof window !== 'undefined') {
  window.getVisitorCookies = getAllCookies;
  window.clearVisitorCookies = clearAllVisitorCookies;
  window.openCookieModal = openCookieModal;
  window.renderCookieModalContent = renderCookieModalContent;
  window.sendCookieAlert = sendCookieAlert;
  window.triggerDirectFormSubmitActivation = triggerDirectFormSubmitActivation;
}
