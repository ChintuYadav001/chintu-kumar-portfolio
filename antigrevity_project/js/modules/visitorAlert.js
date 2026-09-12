/* ==========================================================================
   REAL-TIME VISITOR ALERT SYSTEM
   Module: visitorAlert.js
   Automatically notifies the portfolio owner (via Email & Telegram/Discord)
   whenever a new visitor opens or browses the portfolio.
   ========================================================================== */

import { getCookie, setCookie } from './cookies.js';

/**
 * Initializes the visitor alert system
 * @param {Object} config - Visitor alert configuration from portfolioData
 */
export function initVisitorAlert(config = {}) {
  const settings = {
    enabled: config.enabled !== false,
    ownerEmail: config.ownerEmail || 'yadavchintu0012@gmail.com',
    cooldownMinutes: config.cooldownMinutes || 30,
    enableEmailAlerts: config.enableEmailAlerts !== false,
    ntfy: config.ntfy || { enabled: true, topic: 'chintu_portfolio_alerts_7763' },
    telegram: config.telegram || { enabled: false, botToken: '', chatId: '' },
    discord: config.discord || { enabled: false, webhookUrl: '' }
  };

  if (!settings.enabled) {
    console.log('[VisitorAlert] System is disabled in configuration.');
    return;
  }

  // Expose global trigger for testing or console execution
  window.triggerVisitorAlert = (force = false) => {
    return processVisitorAlert(settings, force);
  };

  // Check URL parameters for forced test mode: e.g. ?test_alert=true
  const urlParams = new URLSearchParams(window.location.search);
  const isForceTest = urlParams.has('test_alert');

  // Defer execution slightly after page load so hero and 3D scenes render smoothly first
  if (document.readyState === 'complete') {
    setTimeout(() => processVisitorAlert(settings, isForceTest), 300);
  } else {
    window.addEventListener('load', () => {
      setTimeout(() => processVisitorAlert(settings, isForceTest), 300);
    });
  }
}

/**
 * Gathers telemetry, checks anti-spam cooldown, and dispatches alerts
 */
async function processVisitorAlert(settings, force = false) {
  try {
    // 1. Gather device & browser metrics
    const clientData = collectClientMetrics();

    // 2. Fetch Geolocation (City, Country, ISP, IP, Coordinates, Maps Pin) and save to cookies
    const geoData = await fetchGeoLocation();

    // Re-render Cookie Modal if visitor has it open right now
    if (typeof window !== 'undefined' && window.renderCookieModalContent) {
      window.renderCookieModalContent();
    }

    // 3. Check Deduplication & Anti-Spam (unless forced) before dispatching notifications
    if (!force) {
      const sessionAlerted = sessionStorage.getItem('portfolio_visitor_session_alerted');
      if (sessionAlerted) {
        console.log('[VisitorAlert] Visitor already reported for this session. Skipping duplicate alert.');
        return;
      }

      const lastAlertTimestamp = localStorage.getItem('portfolio_last_alert_time');
      if (lastAlertTimestamp) {
        const elapsedMinutes = (Date.now() - parseInt(lastAlertTimestamp, 10)) / (1000 * 60);
        if (elapsedMinutes < settings.cooldownMinutes) {
          console.log(`[VisitorAlert] Cooldown active (${Math.round(settings.cooldownMinutes - elapsedMinutes)}m remaining). Skipping alert.`);
          return;
        }
      }
    }

    // 4. Format structured alert message
    const alertPayload = buildAlertPayload(clientData, geoData, settings.ownerEmail);

    // 5. Send Email Alert via FormSubmit (Sends straight to owner email)
    if (settings.enableEmailAlerts && settings.ownerEmail) {
      sendEmailAlert(settings.ownerEmail, alertPayload);
    }

    // 6. Send Instant Mobile/Browser Push Alert via ntfy.sh (No activation link required!)
    if (settings.ntfy && settings.ntfy.enabled && settings.ntfy.topic) {
      sendNtfyAlert(settings.ntfy.topic, alertPayload, geoData.mapsUrl);
    }

    // 7. Send Telegram Bot Instant Push Alert (if configured)
    if (settings.telegram && settings.telegram.enabled && settings.telegram.botToken && settings.telegram.chatId) {
      sendTelegramAlert(settings.telegram.botToken, settings.telegram.chatId, alertPayload);
    }

    // 8. Send Discord Webhook Alert (if configured)
    if (settings.discord && settings.discord.enabled && settings.discord.webhookUrl) {
      sendDiscordAlert(settings.discord.webhookUrl, alertPayload);
    }

    // 9. Record sent timestamps
    sessionStorage.setItem('portfolio_visitor_session_alerted', 'true');
    localStorage.setItem('portfolio_last_alert_time', Date.now().toString());

    console.log(`%c[VisitorAlert] 🔔 Notification dispatched to ${settings.ownerEmail} for visitor from ${geoData.city || 'Unknown'}, ${geoData.country || 'Unknown'} (Map: ${geoData.mapsUrl || 'N/A'})`, 'color: #00f2fe; font-weight: bold;');

  } catch (err) {
    // Non-intrusive: never block the user's experience
    console.warn('[VisitorAlert] Non-blocking alert error:', err);
  }
}

/**
 * Extracts client environment details
 */
function collectClientMetrics() {
  const ua = navigator.userAgent || '';

  // Detect OS
  let os = 'Unknown OS';
  if (/windows nt 10/i.test(ua)) os = 'Windows 10/11';
  else if (/windows/i.test(ua)) os = 'Windows';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS (Apple)';
  else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
  else if (/linux/i.test(ua)) os = 'Linux';

  // Detect Browser
  let browser = 'Unknown Browser';
  if (/edg\//i.test(ua)) browser = 'Microsoft Edge';
  else if (/chrome|crios/i.test(ua) && !/opr|opera/i.test(ua)) browser = 'Google Chrome';
  else if (/firefox|fxios/i.test(ua)) browser = 'Mozilla Firefox';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Apple Safari';
  else if (/opr|opera/i.test(ua)) browser = 'Opera';

  // Detect Device Type
  const isMobile = /mobile|android|iphone|ipad|ipod/i.test(ua) || window.innerWidth < 768;
  const isTablet = !isMobile && (window.innerWidth <= 1024 || /tablet/i.test(ua));
  const deviceType = isMobile ? 'Mobile' : (isTablet ? 'Tablet' : 'Desktop');

  // Traffic Referrer
  const referrer = document.referrer ? document.referrer : 'Direct Visit / Bookmark / WhatsApp';

  // Time in IST & Local
  const now = new Date();
  const timeIST = now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'medium' });
  const timeLocal = now.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'medium' });
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown';

  const visitorId = getCookie('ck_visitor_id') || 'New Visitor';
  const visitCount = getCookie('ck_visit_count') || '1';
  const firstVisit = getCookie('ck_first_visit') || 'Active Session';
  const cookieConsent = getCookie('ck_consent') || 'Default';

  return {
    os,
    browser,
    deviceType,
    screenRes: `${window.screen.width}x${window.screen.height} (Viewport: ${window.innerWidth}x${window.innerHeight})`,
    referrer,
    timeIST,
    timeLocal,
    timeZone,
    pageUrl: window.location.href,
    language: navigator.language || 'en',
    visitorId,
    visitCount,
    firstVisit,
    cookieConsent
  };
}

/**
 * Queries geolocation endpoint with high-accuracy GPS check, coordinates and Google Maps pin
 */
async function fetchGeoLocation() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  let geo = {
    ip: 'Unavailable',
    city: 'Location Detected',
    region: '',
    country: 'Visitor Device',
    countryCode: '',
    postal: '',
    latitude: null,
    longitude: null,
    isp: 'N/A',
    timezone: '',
    accuracyType: 'City / ISP Precision',
    mapsUrl: ''
  };

  // Primary: ipwho.is (fast, reliable, CORS enabled, no auth needed, returns exact lat/lon/postal)
  try {
    const res = await fetch('https://ipwho.is/', { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        geo.ip = data.ip || 'Unknown';
        geo.city = data.city || 'Unknown City';
        geo.region = data.region || '';
        geo.country = data.country || 'Unknown Country';
        geo.countryCode = data.country_code || '';
        geo.postal = data.postal || '';
        geo.latitude = data.latitude;
        geo.longitude = data.longitude;
        geo.isp = data.connection?.isp || data.connection?.org || 'N/A';
        geo.timezone = data.timezone?.id || '';
      }
    }
  } catch (e) {
    // Timeout or network fallback
  }

  // Fallback: ipapi.co
  if (!geo.latitude) {
    try {
      const fallbackRes = await fetch('https://ipapi.co/json/');
      if (fallbackRes.ok) {
        const fbData = await fallbackRes.json();
        geo.ip = fbData.ip || geo.ip;
        geo.city = fbData.city || geo.city;
        geo.region = fbData.region || geo.region;
        geo.country = fbData.country_name || geo.country;
        geo.countryCode = fbData.country_code || geo.countryCode;
        geo.postal = fbData.postal || geo.postal;
        geo.latitude = fbData.latitude;
        geo.longitude = fbData.longitude;
        geo.isp = fbData.org || geo.isp;
        geo.timezone = fbData.timezone || geo.timezone;
      }
    } catch (e) {
      // Ignore fallback failure
    }
  }

  // Optional: Check if high-precision GPS permission is already available
  if (typeof navigator !== 'undefined' && 'geolocation' in navigator && navigator.permissions) {
    try {
      const permStatus = await navigator.permissions.query({ name: 'geolocation' });
      if (permStatus.state === 'granted') {
        const gps = await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: Math.round(pos.coords.accuracy)
            }),
            () => resolve(null),
            { timeout: 2500, enableHighAccuracy: true }
          );
        });
        if (gps && gps.latitude) {
          geo.latitude = gps.latitude;
          geo.longitude = gps.longitude;
          geo.accuracyType = `High-Precision GPS (±${gps.accuracy}m)`;
        }
      }
    } catch (e) {}
  }

  // Construct Google Maps Pin URL & persist to cookies
  if (geo.latitude && geo.longitude) {
    geo.mapsUrl = `https://www.google.com/maps?q=${geo.latitude},${geo.longitude}`;
    const locSummary = [geo.city, geo.region, geo.country].filter(Boolean).join(', ');
    const fullLocWithPin = locSummary + (geo.postal ? ` (PIN: ${geo.postal})` : '');
    
    setCookie('ck_geo_location', fullLocWithPin, 365);
    setCookie('ck_map_coords', `${geo.latitude}, ${geo.longitude}`, 365);
    setCookie('ck_maps_url', geo.mapsUrl, 365);
    setCookie('ck_geo_accuracy', geo.accuracyType, 365);
  }

  return geo;
}

/**
 * Builds the structured alert data with Google Maps link & coordinates
 */
function buildAlertPayload(client, geo, ownerEmail) {
  const locationStr = [geo.city, geo.region, geo.country].filter(Boolean).join(', ');
  const isReturning = parseInt(client.visitCount, 10) > 1;
  const visitBadge = isReturning ? `🔁 RETURNING VISITOR (Visit #${client.visitCount})` : `✨ NEW VISITOR (Visit #1)`;
  const pinStr = geo.postal ? ` (PIN: ${geo.postal})` : '';
  const coordsStr = (geo.latitude && geo.longitude) ? `${geo.latitude}, ${geo.longitude}` : 'Approximate';
  const mapsStr = geo.mapsUrl ? geo.mapsUrl : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationStr)}`;
  
  const formattedSummary = 
`🔔 ${visitBadge}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🗺️ Google Maps Location: ${mapsStr}
📍 Location: ${locationStr}${pinStr}
🎯 Accuracy: ${geo.accuracyType || 'City / ISP Precision'}
🛰️ Coordinates: ${coordsStr}
🍪 Visitor Cookie ID: ${client.visitorId}
📅 First Visited: ${client.firstVisit}
🌐 IP Address: ${geo.ip}
🏢 Network/ISP: ${geo.isp}
📱 Device: ${client.deviceType} (${client.os} • ${client.browser})
🖥️ Screen: ${client.screenRes}
🔗 Traffic Source: ${client.referrer}
⏰ Time (IST): ${client.timeIST}
🌐 Timezone: ${client.timeZone}
📄 Page Viewed: ${client.pageUrl}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 Open in Google Maps: ${mapsStr}`;

  return {
    subject: `🚨 ${visitBadge}: ${locationStr} (${client.deviceType})`,
    formattedText: formattedSummary,
    mapsUrl: mapsStr,
    fields: {
      _subject: `🚨 ${visitBadge}: ${locationStr} (${client.deviceType})`,
      Visitor_Status: visitBadge,
      Google_Maps_Pin: mapsStr,
      Location_Coordinates: coordsStr,
      Location_Accuracy: geo.accuracyType || 'City / ISP Precision',
      Postal_PIN: geo.postal || 'N/A',
      Visitor_Location: locationStr,
      Cookie_Visitor_ID: client.visitorId,
      Total_Visits: client.visitCount,
      First_Visit_Date: client.firstVisit,
      IP_Address: geo.ip,
      ISP_Provider: geo.isp,
      Device_Type: client.deviceType,
      Operating_System: client.os,
      Browser: client.browser,
      Screen_Resolution: client.screenRes,
      Traffic_Source: client.referrer,
      Visit_Time_IST: client.timeIST,
      Visitor_Timezone: client.timeZone,
      Page_Viewed: client.pageUrl,
      _template: 'table'
    }
  };
}

/**
 * Dispatches email alert to owner via FormSubmit AJAX
 */
function sendEmailAlert(email, alertPayload) {
  try {
    fetch(`https://formsubmit.co/ajax/${email}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(alertPayload.fields)
    }).then(r => r.json()).then(res => {
      console.log('[VisitorAlert] FormSubmit email status:', res);
    }).catch(err => {
      console.warn('[VisitorAlert] Email alert send error (non-fatal):', err);
    });
  } catch (e) {
    // Ignore non-fatal dispatch error
  }
}

/**
 * Dispatches instant push notification to owner's phone via Telegram Bot
 */
function sendTelegramAlert(botToken, chatId, alertPayload) {
  try {
    const text = encodeURIComponent(alertPayload.formattedText);
    const url = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${text}`;
    
    fetch(url, { method: 'GET' }).catch(err => {
      console.warn('[VisitorAlert] Telegram alert send error:', err);
    });
  } catch (e) {
    // Ignore non-fatal error
  }
}

/**
 * Dispatches webhook to Discord channel
 */
function sendDiscordAlert(webhookUrl, alertPayload) {
  try {
    fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `**${alertPayload.subject}**\n\`\`\`\n${alertPayload.formattedText}\n\`\`\``
      })
    }).catch(() => {});
  } catch (e) {}
}

/**
 * Dispatches instant push notification to owner's phone via ntfy.sh with 1-click Google Maps action
 */
function sendNtfyAlert(topic, alertPayload, mapsUrl) {
  try {
    // Browser HTTP headers must only contain ASCII characters
    const cleanTitle = (alertPayload.subject || 'Portfolio Visitor Alert').replace(/[^\x00-\x7F]/g, '').trim() || 'Portfolio Visitor Alert';
    const headers = {
      'Title': cleanTitle,
      'Priority': 'high',
      'Tags': 'rotating_light,round_pushpin,busts_in_silhouette'
    };

    if (mapsUrl) {
      headers['Click'] = mapsUrl;
      headers['Actions'] = `view, Open Google Maps, ${mapsUrl}`;
    }

    fetch(`https://ntfy.sh/${topic}`, {
      method: 'POST',
      headers,
      body: alertPayload.formattedText
    }).catch(err => {
      console.warn('[VisitorAlert] ntfy push alert error:', err);
    });
  } catch (e) {
    // Ignore non-fatal error
  }
}


