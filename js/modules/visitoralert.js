/* ==========================================================================
   REAL-TIME VISITOR ALERT SYSTEM
   Module: visitorAlert.js
   Automatically notifies the portfolio owner (via Email & Telegram/Discord)
   whenever a new visitor opens or browses the portfolio.
   ========================================================================== */

/**
 * Initializes the visitor alert system
 * @param {Object} config - Visitor alert configuration from portfolioData
 */
export function initVisitorAlert(config = {}) {
  const settings = {
    enabled: config.enabled !== false,
    ownerEmail: config.ownerEmail || 'chintukumaredu00@gmail.com',
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
    setTimeout(() => processVisitorAlert(settings, isForceTest), 1500);
  } else {
    window.addEventListener('load', () => {
      setTimeout(() => processVisitorAlert(settings, isForceTest), 1500);
    });
  }
}

/**
 * Gathers telemetry, checks anti-spam cooldown, and dispatches alerts
 */
async function processVisitorAlert(settings, force = false) {
  try {
    // 1. Check Deduplication & Anti-Spam (unless forced)
    if (!force) {
      const sessionAlerted = sessionStorage.getItem('portfolio_visitor_session_alerted');
      if (sessionAlerted) {
        console.log('[VisitorAlert] Visitor already reported for this session. Skipping duplicate.');
        return;
      }

      const lastAlertTimestamp = localStorage.getItem('portfolio_last_alert_time');
      if (lastAlertTimestamp) {
        const elapsedMinutes = (Date.now() - parseInt(lastAlertTimestamp, 10)) / (1000 * 60);
        if (elapsedMinutes < settings.cooldownMinutes) {
          console.log(`[VisitorAlert] Cooldown active (${Math.round(settings.cooldownMinutes - elapsedMinutes)}m remaining). Skipping.`);
          return;
        }
      }
    }

    // 2. Gather device & browser metrics
    const clientData = collectClientMetrics();

    // 3. Fetch Geolocation (City, Country, ISP, IP) asynchronously
    const geoData = await fetchGeoLocation();

    // 4. Format structured alert message
    const alertPayload = buildAlertPayload(clientData, geoData, settings.ownerEmail);

    // 5. Send Email Alert via FormSubmit (Sends straight to owner email)
    if (settings.enableEmailAlerts && settings.ownerEmail) {
      sendEmailAlert(settings.ownerEmail, alertPayload);
    }

    // 6. Send Instant Mobile/Browser Push Alert via ntfy.sh (No activation link required!)
    if (settings.ntfy && settings.ntfy.enabled && settings.ntfy.topic) {
      sendNtfyAlert(settings.ntfy.topic, alertPayload);
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

    console.log(`%c[VisitorAlert] 🔔 Notification dispatched to ${settings.ownerEmail} for visitor from ${geoData.city || 'Unknown'}, ${geoData.country || 'Unknown'}`, 'color: #00f2fe; font-weight: bold;');

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
    language: navigator.language || 'en'
  };
}

/**
 * Queries free geolocation endpoint with fallback
 */
async function fetchGeoLocation() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  // Primary: ipwho.is (fast, reliable, CORS enabled, no auth needed)
  try {
    const res = await fetch('https://ipwho.is/', { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        return {
          ip: data.ip || 'Unknown',
          city: data.city || 'Unknown City',
          region: data.region || 'Unknown Region',
          country: data.country || 'Unknown Country',
          countryCode: data.country_code || '',
          isp: data.connection?.isp || data.connection?.org || 'N/A',
          timezone: data.timezone?.id || ''
        };
      }
    }
  } catch (e) {
    // Timeout or network fallback
  }

  // Fallback: ipapi.co
  try {
    const fallbackRes = await fetch('https://ipapi.co/json/');
    if (fallbackRes.ok) {
      const fbData = await fallbackRes.json();
      return {
        ip: fbData.ip || 'Unknown',
        city: fbData.city || 'Unknown City',
        region: fbData.region || 'Unknown Region',
        country: fbData.country_name || 'Unknown Country',
        countryCode: fbData.country_code || '',
        isp: fbData.org || 'N/A',
        timezone: fbData.timezone || ''
      };
    }
  } catch (e) {
    // Ignore fallback failure
  }

  return {
    ip: 'Unavailable',
    city: 'Location Detected',
    region: '',
    country: 'Visitor Device',
    countryCode: '',
    isp: 'N/A',
    timezone: ''
  };
}

/**
 * Builds the structured alert data
 */
function buildAlertPayload(client, geo, ownerEmail) {
  const locationStr = [geo.city, geo.region, geo.country].filter(Boolean).join(', ');
  
  const formattedSummary = 
`🔔 NEW PORTFOLIO VISITOR ALERT!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Location: ${locationStr}
🌐 IP Address: ${geo.ip}
🏢 Network/ISP: ${geo.isp}
📱 Device: ${client.deviceType} (${client.os} • ${client.browser})
🖥️ Screen: ${client.screenRes}
🔗 Traffic Source: ${client.referrer}
⏰ Time (IST): ${client.timeIST}
🌐 Timezone: ${client.timeZone}
📄 Page Viewed: ${client.pageUrl}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 View your portfolio anytime at: ${client.pageUrl}`;

  return {
    subject: `🚨 Portfolio Visitor Alert: ${locationStr} (${client.deviceType})`,
    formattedText: formattedSummary,
    fields: {
      _subject: `🚨 Portfolio Visitor Alert: ${locationStr} (${client.deviceType})`,
      Visitor_Location: locationStr,
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
 * Dispatches instant push notification to owner's phone via ntfy.sh (No activation links needed)
 */
function sendNtfyAlert(topic, alertPayload) {
  try {
    // Browser HTTP headers must only contain ASCII characters
    const cleanTitle = (alertPayload.subject || 'Portfolio Visitor Alert').replace(/[^\x00-\x7F]/g, '').trim() || 'Portfolio Visitor Alert';
    fetch(`https://ntfy.sh/${topic}`, {
      method: 'POST',
      headers: {
        'Title': cleanTitle,
        'Priority': 'high',
        'Tags': 'rotating_light,busts_in_silhouette'
      },
      body: alertPayload.formattedText
    }).catch(err => {
      console.warn('[VisitorAlert] ntfy push alert error:', err);
    });
  } catch (e) {
    // Ignore non-fatal error
  }
}

