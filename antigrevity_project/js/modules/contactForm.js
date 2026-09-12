/* ==========================================================================
   CONTACT FORM MODULE
   Module: contactForm.js
   Handles real-time validation, multi-channel dispatch (ntfy.sh instant phone push,
   email via FormSubmit, Telegram, and direct WhatsApp sync), and feedback toasts.
   ========================================================================== */

import { showToast } from './toast.js';
import { portfolioData } from '../data/portfolioData.js';

export function initContactForm() {
  const form = document.getElementById('contact-form');
  const copyEmailBtn = document.getElementById('copy-email-card');
  const copyPhoneBtn = document.getElementById('copy-phone-card');

  const ownerEmail = portfolioData?.personalInfo?.email || 'yadavchintu0012@gmail.com';
  const ownerPhone = portfolioData?.personalInfo?.phone || '+91 7763917713';
  const cleanPhone = ownerPhone.replace(/[^\d]/g, ''); // e.g. 917763917713
  const ntfyTopic = portfolioData?.visitorAlert?.ntfy?.topic || 'chintu_portfolio_alerts_7763';
  const telegramConfig = portfolioData?.visitorAlert?.telegram;

  // Copy Email to clipboard
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', () => {
      const email = copyEmailBtn.getAttribute('data-email') || ownerEmail;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(email).then(() => {
          showToast('Email address copied to clipboard!', 'success');
        }).catch(() => {
          showToast(`Direct email: ${email}`, 'info');
        });
      } else {
        showToast(`Direct email: ${email}`, 'info');
      }
    });
  }

  // Copy Phone to clipboard
  if (copyPhoneBtn) {
    copyPhoneBtn.addEventListener('click', () => {
      const phone = copyPhoneBtn.getAttribute('data-phone') || ownerPhone;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(phone).then(() => {
          showToast('Phone number copied to clipboard!', 'success');
        }).catch(() => {
          showToast(`Phone: ${phone}`, 'info');
        });
      } else {
        showToast(`Phone: ${phone}`, 'info');
      }
    });
  }

  if (!form) return;

  const nameInput = document.getElementById('contact-name');
  const emailInput = document.getElementById('contact-email');
  const subjectInput = document.getElementById('contact-subject');
  const messageInput = document.getElementById('contact-message');
  const submitBtn = document.getElementById('contact-submit-btn');

  // Clear errors on input
  [nameInput, emailInput, subjectInput, messageInput].forEach(input => {
    if (input) {
      input.addEventListener('input', () => {
        clearError(input);
      });
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault(); // Take controlled action so all delivery channels fire

    const rawName = nameInput ? nameInput.value.trim() : '';
    const rawEmail = emailInput ? emailInput.value.trim() : '';
    const rawSubject = subjectInput ? subjectInput.value.trim() : '';
    const rawMessage = messageInput ? messageInput.value.trim() : '';

    // Graceful smart defaults
    const name = rawName || 'Portfolio Visitor';
    const email = rawEmail || 'Not specified';
    const subject = rawSubject || 'Data Analyst Inquiry / Collaboration';
    const message = rawMessage || 'Hi Chintu, I reviewed your data analytics portfolio and would like to connect with you regarding an opportunity.';

    const now = new Date();
    const timeIST = now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'medium' });

    // 1. Structured WhatsApp Message
    const formattedWhatsAppMessage = 
`👋 *New Inquiry from Portfolio Visitor*
━━━━━━━━━━━━━━━━━━━━
👤 *Name:* ${name}
📧 *Email:* ${email}
📌 *Subject:* ${subject}
━━━━━━━━━━━━━━━━━━━━
💬 *Message:*
${message}

🌐 _Sent via Chintu Kumar's 3D Portfolio_
⏰ _Time: ${timeIST}_`;

    // 2. Structured Notification for ntfy.sh (Instant phone push!)
    const formattedNtfyText = 
`📩 NEW PORTFOLIO CONTACT INQUIRY!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Sender: ${name}
📧 Email: ${email}
📌 Subject: ${subject}
💬 Message:
${message}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 Sent via Portfolio Contact Form
⏰ Time (IST): ${timeIST}
📄 Source: ${window.location.href}`;

    // A. DISPATCH TO NTFY.SH (Chintu receives instant mobile push alert with sound!)
    try {
      const cleanSender = name.replace(/[^\x00-\x7F]/g, '') || 'Visitor';
      fetch(`https://ntfy.sh/${ntfyTopic}`, {
        method: 'POST',
        headers: {
          'Title': `New Inquiry from ${cleanSender}`,
          'Priority': 'urgent',
          'Tags': 'incoming_envelope,briefcase',
          'Click': email && email !== 'Not specified' ? `mailto:${email}` : window.location.href
        },
        body: formattedNtfyText,
        keepalive: true
      }).catch(err => console.warn('[ContactForm] ntfy push error:', err));
    } catch (err) {
      console.warn('[ContactForm] ntfy catch:', err);
    }

    // B. DISPATCH TO FORMSUBMIT (Direct background email to ownerEmail)
    try {
      fetch(`https://formsubmit.co/ajax/${ownerEmail}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: name,
          email: email,
          subject: subject,
          message: message,
          _subject: `📩 Portfolio Inquiry: ${name} (${subject})`,
          _replyto: email !== 'Not specified' ? email : ownerEmail,
          Submission_Time_IST: timeIST,
          _template: 'table'
        }),
        keepalive: true
      }).catch(err => console.warn('[ContactForm] email dispatch error:', err));
    } catch (e) {}

    // C. DISPATCH TO TELEGRAM BOT (if enabled)
    if (telegramConfig && telegramConfig.enabled && telegramConfig.botToken && telegramConfig.chatId) {
      try {
        const tgText = encodeURIComponent(
`<b>📩 NEW PORTFOLIO CONTACT INQUIRY!</b>
━━━━━━━━━━━━━━━━━━━━
<b>👤 Sender:</b> ${name}
<b>📧 Email:</b> ${email}
<b>📌 Subject:</b> ${subject}
<b>💬 Message:</b>
${message}
━━━━━━━━━━━━━━━━━━━━
<b>⏰ Time:</b> ${timeIST}`
        );
        fetch(`https://api.telegram.org/bot${telegramConfig.botToken}/sendMessage?chat_id=${telegramConfig.chatId}&text=${tgText}&parse_mode=HTML`, {
          method: 'GET',
          keepalive: true
        }).catch(() => {});
      } catch (e) {}
    }

    // D. PREPARE WHATSAPP URL & LAUNCH
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(formattedWhatsAppMessage)}`;
    
    // Update reopen button with exact direct link
    const reopenBtn = document.getElementById('whatsapp-reopen-btn');
    if (reopenBtn) {
      reopenBtn.href = whatsappUrl;
    }

    // Reveal helpful confirmation status card
    const statusCard = document.getElementById('contact-status-card');
    if (statusCard) {
      statusCard.style.display = 'block';
      statusCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Launch WhatsApp in new window/tab
    try {
      window.open(whatsappUrl, '_blank');
    } catch (e) {
      console.warn('[ContactForm] popup blocked, use button:', e);
    }

    showToast('Inquiry dispatched direct to Chintu! WhatsApp also opened.', 'success');

    // Visual button state feedback
    const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
      submitBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
        <span>Message Dispatched Direct to Chintu!</span>
      `;
      submitBtn.classList.add('btn-success');
    }

    // Clear form inputs
    if (nameInput) nameInput.value = '';
    if (emailInput) emailInput.value = '';
    if (subjectInput) subjectInput.value = '';
    if (messageInput) messageInput.value = '';

    // Reset button after 5 seconds
    setTimeout(() => {
      if (submitBtn) {
        submitBtn.innerHTML = originalBtnHtml;
        submitBtn.classList.remove('btn-success');
      }
    }, 5000);
  });
}

function clearError(inputElement) {
  inputElement.classList.remove('input-error');
  const errorContainer = document.getElementById(`${inputElement.id}-error`);
  if (errorContainer) {
    errorContainer.textContent = '';
  }
}
