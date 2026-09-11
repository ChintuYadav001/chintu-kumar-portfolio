/* ==========================================================================
   AI PORTFOLIO ASSISTANT CHATBOT MODULE
   Module: chatbot.js
   Smart conversational interface answering questions about Chintu Kumar's
   projects, 9 verified certificates, skills, experience, and hiring details.
   Provides deep links and modal launchers for seamless user interaction.
   ========================================================================== */

import { portfolioData } from '../data/portfolioData.js';
import { getIcon } from './icons.js';
import { openProjectModal } from './modal.js';
import { openCertificateModal } from './certificateModal.js';
import { openResumeModal } from './resume.js';
import { showToast } from './toast.js';

export function initChatbot() {
  const toggleBtn = document.getElementById('chatbot-toggle-btn');
  const chatWindow = document.getElementById('chatbot-window');
  const closeBtn = document.getElementById('chatbot-close-btn');
  const resetBtn = document.getElementById('chatbot-reset-btn');
  const voiceToggleBtn = document.getElementById('chatbot-voice-toggle-btn');
  const micBtn = document.getElementById('chatbot-mic-btn');
  const voiceStatus = document.getElementById('chatbot-voice-status');
  const voiceCancelBtn = document.getElementById('chatbot-voice-cancel-btn');
  const messagesContainer = document.getElementById('chatbot-messages');
  const chipsContainer = document.getElementById('chatbot-chips');
  const form = document.getElementById('chatbot-form');
  const input = document.getElementById('chatbot-input');
  const sendBtn = document.getElementById('chatbot-send-btn');
  const tooltipHint = document.getElementById('chatbot-tooltip-hint');

  if (!toggleBtn || !chatWindow || !messagesContainer) return;

  let isOpen = false;
  let isTyping = false;
  let isListening = false;
  let currentSpeakingUtterance = null;

  // Voice output preference (defaults to true if supported)
  let voiceEnabled = localStorage.getItem('chintu_ai_voice_enabled') !== 'false';
  let currentRecognition = null;
  updateVoiceToggleUI();

  // Prime speech synthesis to bypass browser autoplay restrictions
  function primeAudioContext() {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.resume();
      } catch (e) {}
    }
  }

  // --------------------------------------------------------------------------
  // Web Speech Synthesis (Text-to-Speech)
  // --------------------------------------------------------------------------
  function updateVoiceToggleUI() {
    if (!voiceToggleBtn) return;
    const onIcon = voiceToggleBtn.querySelector('.voice-sound-on-icon');
    const offIcon = voiceToggleBtn.querySelector('.voice-sound-off-icon');

    if (voiceEnabled) {
      voiceToggleBtn.classList.add('active');
      voiceToggleBtn.setAttribute('title', 'AI Voice Responses: ON (Click to mute)');
      if (onIcon) onIcon.style.display = 'block';
      if (offIcon) offIcon.style.display = 'none';
    } else {
      voiceToggleBtn.classList.remove('active');
      voiceToggleBtn.setAttribute('title', 'AI Voice Responses: MUTED (Click to turn sound on)');
      if (onIcon) onIcon.style.display = 'none';
      if (offIcon) offIcon.style.display = 'block';
    }
  }

  if (voiceToggleBtn) {
    voiceToggleBtn.addEventListener('click', () => {
      primeAudioContext();
      voiceEnabled = !voiceEnabled;
      localStorage.setItem('chintu_ai_voice_enabled', voiceEnabled.toString());
      updateVoiceToggleUI();
      if (!voiceEnabled) {
        stopSpeaking();
        showToast('AI Voice Responses Muted', 'info');
      } else {
        showToast('AI Voice Responses Enabled 🔊', 'success');
        speakText("Hello! Voice assistant is now active. You can speak or type your question!");
      }
    });
  }

  function stopSpeaking() {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
    document.querySelectorAll('.chat-tts-btn.speaking').forEach(btn => {
      btn.classList.remove('speaking');
      btn.querySelector('span').textContent = 'Listen';
    });
    currentSpeakingUtterance = null;
  }

  function stripMarkdownForSpeech(md) {
    if (!md) return '';
    return md
      .replace(/<[^>]*>/g, ' ')
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '') // strip emojis for clearer speech synthesis
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/#+\s/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[•\-\*\+]\s+/g, '')
      .replace(/[\n\r]+/g, '. ')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function getSpokenSummary(md) {
    if (!md) return '';
    const clean = stripMarkdownForSpeech(md);
    // Speak first 2 sentences (concise & natural like Alexa/Siri)
    const sentences = clean.split(/(?<=[.?!])\s+/);
    if (sentences.length <= 2) {
      return clean.slice(0, 240);
    }
    return (sentences[0] + ' ' + sentences[1]).slice(0, 240);
  }

  function speakText(text, onStart, onEnd, speakFull = false) {
    if (!('speechSynthesis' in window)) return;
    stopSpeaking();

    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();
    } catch (e) {}

    const clean = speakFull ? stripMarkdownForSpeech(text) : getSpokenSummary(text);
    if (!clean) return;

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const selectedVoice = voices.find(v => 
        v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel') || v.name.includes('David') || v.name.includes('India'))
      ) || voices.find(v => v.lang.startsWith('en'));

      if (selectedVoice) utterance.voice = selectedVoice;
    }

    utterance.onstart = () => {
      currentSpeakingUtterance = utterance;
      if (onStart) onStart();
    };

    utterance.onend = () => {
      currentSpeakingUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      currentSpeakingUtterance = null;
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  }

  // Pre-load voices on load
  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => {
      try { window.speechSynthesis.getVoices(); } catch (e) {}
    };
  }

  // --------------------------------------------------------------------------
  // Web Speech Recognition (Speech-to-Text / Microphone Input)
  // Always creates a fresh instance per listen session to prevent InvalidStateError
  // --------------------------------------------------------------------------
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  function startListening() {
    primeAudioContext();

    if (!SpeechRecognition) {
      showToast('Voice speech recognition is not supported in this browser. Please use Google Chrome or Edge.', 'info');
      return;
    }

    // Clean up any stale recognition instance
    if (currentRecognition) {
      try {
        currentRecognition.onstart = null;
        currentRecognition.onresult = null;
        currentRecognition.onerror = null;
        currentRecognition.onend = null;
        currentRecognition.abort();
      } catch (e) {}
      currentRecognition = null;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = navigator.language || 'en-US';

      rec.onstart = () => {
        isListening = true;
        stopSpeaking();
        if (micBtn) micBtn.classList.add('listening');
        if (voiceStatus) voiceStatus.style.display = 'flex';
        if (input) input.placeholder = 'Listening... Speak your question now';
      };

      rec.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += trans;
          } else {
            interimTranscript += trans;
          }
        }

        const currentText = (finalTranscript || interimTranscript).trim();
        if (currentText && input) {
          input.value = currentText;
          if (sendBtn) sendBtn.disabled = false;
        }

        if (finalTranscript) {
          const query = finalTranscript.trim();
          stopListening();
          handleUserMessage(query);
          if (input) input.value = '';
          if (sendBtn) sendBtn.disabled = true;
        }
      };

      rec.onerror = (event) => {
        console.warn('[ChatbotVoice] Recognition error:', event.error);
        stopListening();
        if (event.error === 'not-allowed') {
          showToast('Microphone access blocked. Click the lock icon in your browser URL bar to allow microphone.', 'error');
        } else if (event.error === 'no-speech') {
          showToast('No voice detected. Tap 🎙️ and try speaking again.', 'info');
        } else if (event.error === 'network') {
          showToast('Network error with speech recognition service.', 'error');
        }
      };

      rec.onend = () => {
        stopListening();
      };

      currentRecognition = rec;
      rec.start();
    } catch (err) {
      console.error('[ChatbotVoice] Failed to start speech recognition:', err);
      stopListening();
      showToast('Could not access microphone. Please type your question.', 'info');
    }
  }

  function stopListening() {
    isListening = false;
    if (currentRecognition) {
      try {
        currentRecognition.stop();
      } catch (e) {}
      currentRecognition = null;
    }
    if (micBtn) micBtn.classList.remove('listening');
    if (voiceStatus) voiceStatus.style.display = 'none';
    if (input) input.placeholder = 'Ask or tap 🎙️ to speak...';
  }

  if (micBtn) {
    micBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (isListening) {
        // If already listening, submit whatever was transcribed
        const pendingText = input ? input.value.trim() : '';
        stopListening();
        if (pendingText) {
          handleUserMessage(pendingText);
          if (input) input.value = '';
          if (sendBtn) sendBtn.disabled = true;
        }
      } else {
        startListening();
      }
    });
  }

  if (voiceCancelBtn) {
    voiceCancelBtn.addEventListener('click', () => {
      stopListening();
    });
  }

  // Initial Suggestion Chips
  const suggestionChips = [
    { label: "💼 Why hire Chintu?", query: "Why should we hire Chintu?" },
    { label: "🔗 LinkedIn Profile", query: "Tell me about his LinkedIn profile" },
    { label: "📊 Projects built", query: "Tell me about Chintu's projects" },
    { label: "📜 9 Verified Certs", query: "Show me all verified certificates" },
    { label: "⚡ SQL & Python skills", query: "What are his SQL and Python skills?" },
    { label: "🏢 Alfido Tech Internship", query: "Tell me about his work experience at Alfido Tech" },
    { label: "🎯 Career vision & goals", query: "What are his career goals and 5-year vision?" },
    { label: "📄 Full ATS Resume", query: "Can I view or download his resume?" },
    { label: "💬 Chat on WhatsApp", query: "Can I message Chintu on WhatsApp?" }
  ];

  // 1. Initial Welcome Message
  renderWelcome();
  renderChips(suggestionChips);

  // Show tooltip hint after 2 seconds
  setTimeout(() => {
    if (!isOpen && tooltipHint) {
      tooltipHint.classList.add('visible');
    }
  }, 2200);

  // Auto-hide tooltip after 9 seconds if not opened
  setTimeout(() => {
    if (tooltipHint) {
      tooltipHint.classList.remove('visible');
    }
  }, 9500);

  // 2. Toggle Open/Close handlers
  function toggleChat(openState) {
    isOpen = typeof openState === 'boolean' ? openState : !isOpen;
    if (isOpen) {
      chatWindow.classList.add('open');
      toggleBtn.classList.add('open');
      toggleBtn.setAttribute('aria-expanded', 'true');
      if (tooltipHint) tooltipHint.classList.remove('visible');
      setTimeout(() => input && input.focus(), 150);
      scrollToBottom();
    } else {
      chatWindow.classList.remove('open');
      toggleBtn.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
      stopSpeaking();
      stopListening();
    }
  }

  toggleBtn.addEventListener('click', () => toggleChat());
  if (closeBtn) closeBtn.addEventListener('click', () => toggleChat(false));

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) {
      toggleChat(false);
    }
  });

  // Reset conversation
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      stopSpeaking();
      stopListening();
      messagesContainer.innerHTML = '';
      renderWelcome();
      renderChips(suggestionChips);
      if (input) input.value = '';
      if (sendBtn) sendBtn.disabled = true;
    });
  }

  // 3. Input Validation & Form Submit
  if (input && sendBtn) {
    input.addEventListener('input', () => {
      stopSpeaking();
      sendBtn.disabled = !input.value.trim();
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!input || isTyping) return;
      const query = input.value.trim();
      if (!query) return;

      stopSpeaking();
      stopListening();
      handleUserMessage(query);
      input.value = '';
      sendBtn.disabled = true;
    });
  }

  // Handle Quick Chips
  function renderChips(chips) {
    if (!chipsContainer) return;
    chipsContainer.innerHTML = chips.map(chip => `
      <button type="button" class="chat-chip" data-query="${chip.query}">
        <span>${chip.label}</span>
      </button>
    `).join('');

    chipsContainer.querySelectorAll('.chat-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const query = btn.getAttribute('data-query');
        if (query && !isTyping) {
          stopSpeaking();
          handleUserMessage(query);
        }
      });
    });
  }

  // 4. Message Handling
  function handleUserMessage(text) {
    appendMessage(text, 'user');
    isTyping = true;
    showTypingIndicator();

    const responseDelay = Math.min(700, Math.max(350, text.length * 15));

    setTimeout(() => {
      removeTypingIndicator();
      const botResponse = generateSmartAnswer(text);
      appendMessage(botResponse.text, 'bot', botResponse.actions);
      isTyping = false;
      scrollToBottom();

      // Automatically speak aloud if Voice Assistant output is enabled
      if (voiceEnabled) {
        speakText(botResponse.text);
      }
    }, responseDelay);
  }

  function renderWelcome() {
    const welcomeHtml = `
      <p>👋 <strong>Welcome!</strong> I'm <strong>Chintu's AI Voice &amp; Chat Assistant</strong>.</p>
      <p>I have comprehensive knowledge of Chintu Kumar's <strong>LinkedIn profile</strong>, <strong>career goals</strong>, <strong>3 data analytics projects</strong>, <strong>9 verified certificates</strong> (Google, PW AI/ML, HackerRank, Power BI), <strong>technical skills</strong>, <strong>internship at Alfido Tech</strong>, and <strong>hiring details</strong>!</p>
      <p><em>Tap 🎙️ to speak aloud, type any question, or select a prompt below:</em></p>
    `;
    appendMessage(welcomeHtml, 'bot');
  }

  function appendMessage(content, sender, actions = []) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-msg ${sender}`;

    if (sender === 'bot') {
      const avatarDiv = document.createElement('div');
      avatarDiv.className = 'chat-msg-avatar';
      avatarDiv.innerHTML = getIcon('bot');
      msgDiv.appendChild(avatarDiv);
    }

    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';

    // Format simple markdown into HTML if needed
    if (sender === 'bot' && !content.startsWith('<p>')) {
      bubble.innerHTML = formatMarkdown(content);
    } else {
      bubble.innerHTML = content;
    }

    // Attach Voice TTS Button for Bot Messages
    if (sender === 'bot') {
      const ttsBtn = document.createElement('button');
      ttsBtn.type = 'button';
      ttsBtn.className = 'chat-tts-btn';
      ttsBtn.setAttribute('aria-label', 'Listen to this response');
      ttsBtn.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
        <span>Listen</span>
      `;

      ttsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (ttsBtn.classList.contains('speaking')) {
          stopSpeaking();
          ttsBtn.classList.remove('speaking');
          ttsBtn.querySelector('span').textContent = 'Listen';
        } else {
          document.querySelectorAll('.chat-tts-btn.speaking').forEach(b => {
            b.classList.remove('speaking');
            b.querySelector('span').textContent = 'Listen';
          });
          ttsBtn.classList.add('speaking');
          ttsBtn.querySelector('span').textContent = 'Speaking...';
          speakText(
            content,
            () => {},
            () => {
              ttsBtn.classList.remove('speaking');
              ttsBtn.querySelector('span').textContent = 'Listen';
            }
          );
        }
      });

      bubble.appendChild(ttsBtn);
    }

    // Attach Action Buttons if available
    if (actions && actions.length > 0) {
      const actionGroup = document.createElement('div');
      actionGroup.className = 'chat-action-group';

      actions.forEach(action => {
        const actionBtn = document.createElement('button');
        actionBtn.type = 'button';
        actionBtn.className = 'chat-action-btn';
        actionBtn.innerHTML = `${action.icon ? getIcon(action.icon) : ''}<span>${action.label}</span>`;

        actionBtn.addEventListener('click', (e) => {
          e.preventDefault();
          executeAction(action);
        });

        actionGroup.appendChild(actionBtn);
      });

      bubble.appendChild(actionGroup);
    }

    msgDiv.appendChild(bubble);
    messagesContainer.appendChild(msgDiv);
    scrollToBottom();
  }

  function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.id = 'chat-typing-indicator';
    typingDiv.className = 'chat-msg bot';
    typingDiv.innerHTML = `
      <div class="chat-msg-avatar">${getIcon('bot')}</div>
      <div class="chat-typing-bubble">
        <div class="chat-typing-dot"></div>
        <div class="chat-typing-dot"></div>
        <div class="chat-typing-dot"></div>
      </div>
    `;
    messagesContainer.appendChild(typingDiv);
    scrollToBottom();
  }

  function removeTypingIndicator() {
    const el = document.getElementById('chat-typing-indicator');
    if (el) el.remove();
  }

  function scrollToBottom() {
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  // 5. Action Dispatcher (Interacts seamlessly with existing modals & sections)
  function executeAction(action) {
    switch (action.type) {
      case 'project-modal': {
        const project = portfolioData.projects.find(p => p.id === action.id);
        if (project) openProjectModal(project);
        break;
      }
      case 'cert-modal': {
        const cert = portfolioData.certificates.find(c => c.id === action.id);
        if (cert) openCertificateModal(cert);
        break;
      }
      case 'resume-modal': {
        openResumeModal();
        break;
      }
      case 'scroll': {
        const target = document.querySelector(action.target);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        break;
      }
      case 'external-url': {
        if (action.url) window.open(action.url, '_blank', 'noopener,noreferrer');
        break;
      }
      case 'contact-mail': {
        window.location.href = `mailto:${portfolioData.personalInfo.email}?subject=Job%20Opportunity%20for%20Chintu%20Kumar`;
        break;
      }
      case 'contact-call': {
        window.location.href = `tel:${portfolioData.personalInfo.phone}`;
        break;
      }
      case 'contact-whatsapp': {
        const text = action.text || "Hi Chintu, I saw your data analytics portfolio and would like to connect!";
        window.open(`https://wa.me/917763917713?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
        break;
      }
      default:
        break;
    }
  }

  // 6. Natural Markdown Formatter
  function formatMarkdown(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/^\s*[-•]\s+(.*)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>(\n|$))+/g, '<ul>$&</ul>')
      .replace(/\n{2,}/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^(.+)$/gm, (match) => {
        if (match.startsWith('<ul>') || match.startsWith('<li>') || match.startsWith('</p>') || match.startsWith('<p>')) {
          return match;
        }
        return `<p>${match}</p>`;
      });
  }

  // ------------------------------------------------------------------------
  // 7. Comprehensive Intelligence Engine & Knowledge Base
  // ------------------------------------------------------------------------
  function generateSmartAnswer(query) {
    const rawQ = query || '';
    const q = rawQ.toLowerCase().trim();
    const info = portfolioData.personalInfo;
    const linkedIn = portfolioData.linkedInProfile || {};
    const kb = portfolioData.aiKnowledgeBase || {};

    // Helper: checks if query includes any of the given keywords
    const hasAny = (...words) => words.some(w => q.includes(w));
    // Helper: checks if query includes all of the given keywords
    const hasAll = (...words) => words.every(w => q.includes(w));

    // ----------------------------------------------------------------------
    // 1. LinkedIn Profile & Social Media Presence
    // ----------------------------------------------------------------------
    if (hasAny('linkedin', 'headline', 'connections', 'open to work', 'social media', 'social profile', 'network')) {
      const url = linkedIn.profileUrl || info.socials.linkedin;
      return {
        text: `**Chintu Kumar's Professional LinkedIn Profile**\n\n• **Headline**: *${linkedIn.headline || info.heroBio}*\n• **Connections**: ${linkedIn.connections || '500+ Industry Connections'}\n• **Open to Work**: ${linkedIn.openToWork ? 'Active (Data Analyst, BI Analyst, Python/SQL Specialist)' : 'Available for opportunities'}\n• **Work Mode**: ${linkedIn.workMode || 'Remote Worldwide, Hybrid, or On-Site relocation'}\n• **Notice Period**: ${linkedIn.noticePeriod || 'Immediate Joiner (0 days)'}\n• **Profile URL**: [linkedin.com/in/chintu-yadav-767909190](${url})\n\nChintu actively shares end-to-end analytics project breakdowns, SQL problem-solving techniques, and Power BI dashboard architectures on LinkedIn.`,
        actions: [
          { type: 'external-url', url: url, label: '🔗 Open LinkedIn Profile', icon: 'linkedin' },
          { type: 'resume-modal', label: '📄 View ATS Resume', icon: 'fileText' },
          { type: 'contact-whatsapp', label: '💬 Chat on WhatsApp', icon: 'whatsapp' }
        ]
      };
    }

    // ----------------------------------------------------------------------
    // 2. Who is Chintu / Introduction / Elevator Pitch / About Me
    // ----------------------------------------------------------------------
    if (
      hasAny('who is chintu', 'about chintu', 'tell me about yourself', 'tell me about chintu', 'introduce yourself', 'who are you', 'who is he', 'elevator pitch', 'who is this', 'about him') ||
      (hasAny('about', 'profile', 'bio', 'intro', 'summary') && !hasAny('project', 'cert', 'work', 'job', 'superstore', 'rfm', 'traffic', 'weakness'))
    ) {
      return {
        text: `**About Chintu Kumar (Elevator Pitch)**\n\nChintu Kumar is an enthusiastic and detail-oriented **Data Analyst** pursuing his B.Tech in Computer Science (Artificial Intelligence & Data Science) at **IIMT Engineering College (AKTU)**, Greater Noida (**CGPA: 7.2**).\n\n• **Internship Experience**: Completed a remote Data Analyst Internship at **Alfido Tech**, preprocessing **50,000+ business records** and automating cleaning routines to save **~40% manual time**.\n• **9 Verified Certifications**: Backed by credentials from **Google**, **Physics Wallah AI/ML Bootcamp**, **HackerRank**, **Infosys**, and **Skill Course**.\n• **Core Toolkit**: Python (Pandas, NumPy, Matplotlib, Seaborn), SQL (CTEs, Window Functions, 100+ LeetCode solved), Power BI (DAX, Star Schema), and Excel.\n• **Mission**: Transforming complex, messy multi-source data into reliable metrics, automated ETL pipelines, and executive dashboards.`,
        actions: [
          { type: 'resume-modal', label: '📄 Open ATS Resume', icon: 'fileText' },
          { type: 'project-modal', id: 'project-sales', label: '📊 View Power BI Dashboard', icon: 'chart' },
          { type: 'contact-mail', label: '✉️ Send Email', icon: 'email' }
        ]
      };
    }

    // ----------------------------------------------------------------------
    // 3. Why Hire Chintu / Strengths / Key Value Proposition
    // ----------------------------------------------------------------------
    if (hasAny('why hire', 'why should we hire', 'strength', 'strengths', 'why choose', 'superpower', 'what makes him unique', 'value proposition', 'fit for the role', 'hire him', 'hire chintu')) {
      return {
        text: `**Why Hire Chintu Kumar? (Key Value Proposition)**\n\n1. **Proven Execution at Scale**: Cleaned and preprocessed **50,000+ raw records** and solved **100+ complex SQL queries** across LeetCode & HackerRank.\n2. **9 Verified Industry Certifications**: Backed by authenticated credentials from **Google**, **Physics Wallah & NSDC**, **HackerRank**, **Infosys**, and **Skill Course**.\n3. **Measurable Business ROI**: Slashed manual preprocessing time by **~40%** at Alfido Tech using reusable Python automation scripts.\n4. **End-to-End Analytical Lifecycle**: Handles the entire stack from dirty data extraction, missing value imputation, and EDA to star schema modeling and executive Power BI dashboards.\n5. **Immediate Availability**: Ready for rapid onboarding with **0 days notice period** and 100% adaptability for remote, hybrid, or on-site roles.`,
        actions: [
          { type: 'contact-mail', label: '✉️ Send Hiring Email', icon: 'email' },
          { type: 'resume-modal', label: '📄 View ATS Resume', icon: 'fileText' },
          { type: 'contact-whatsapp', label: '💬 WhatsApp Chintu', icon: 'whatsapp' }
        ]
      };
    }

    // ----------------------------------------------------------------------
    // 4. Weaknesses & Continuous Improvement (Self-Awareness)
    // ----------------------------------------------------------------------
    if (hasAny('weakness', 'weaknesses', 'areas of improvement', 'flaw', 'what are your weaknesses', 'challenges you faced', 'room for growth', 'struggle')) {
      return {
        text: `**Self-Awareness & Areas for Improvement**\n\nChintu maintains a transparent and growth-oriented mindset:\n\n• **Detail Immersion**: He can sometimes spend extra time perfecting visual micro-interactions and pixel-perfect chart formatting. He balances this by utilizing **strict agile timeboxing** and prioritizing high-impact MVP analytical deliverables first.\n• **Cloud Scale Expansion**: While highly proficient in MySQL, PostgreSQL, and local Python pipelines, he is actively expanding into cloud data warehouses like **Snowflake and Google BigQuery** to master distributed analytics at multi-terabyte scale.`,
        actions: [
          { type: 'resume-modal', label: '📄 View ATS Resume', icon: 'fileText' },
          { type: 'scroll', target: '#skills', label: '⚡ View Skills Breakdown', icon: 'arrowRight' }
        ]
      };
    }

    // ----------------------------------------------------------------------
    // 5. Career Goals & 5-Year Vision
    // ----------------------------------------------------------------------
    if (hasAny('career goal', 'career vision', 'where do you see yourself', '5 years', 'five years', 'aspirations', 'future goal', 'long term', 'short term goal', 'vision', 'ambition')) {
      return {
        text: `**Career Vision & Goals**\n\n• **Short-Term Goal (Next 1–2 Years)**: Secure a high-impact Data Analyst or BI Analyst role where he can optimize data ingestion pipelines, uncover revenue-driving patterns, and design self-service Power BI reports for decision-makers.\n• **Long-Term Goal (3–5 Years)**: Grow into a **Lead Data Architect or Business Intelligence Manager**, designing end-to-end enterprise data warehouse architectures and bridging the gap between engineering pipelines and executive business strategy.`,
        actions: [
          { type: 'contact-mail', label: '✉️ Discuss Opportunities', icon: 'email' },
          { type: 'scroll', target: '#experience', label: '🏢 View Experience', icon: 'arrowRight' }
        ]
      };
    }

    // ----------------------------------------------------------------------
    // 6. Availability, Notice Period & Joining Timeline
    // ----------------------------------------------------------------------
    if (hasAny('when can you join', 'when can he join', 'notice period', 'immediate joiner', 'start date', 'joining date', 'how soon', 'availability', 'available to start')) {
      return {
        text: `**Availability & Joining Timeline**\n\n• **Notice Period**: **Immediate Joiner (0 days notice)**.\n• **Current Status**: Actively interviewing and ready for immediate deployment.\n• **Target Roles**: Data Analyst, Junior Data Analyst, Business Intelligence Analyst, SQL/Python Specialist.\n• **Engagement Types**: Full-time, Internship, or High-Impact Contract roles.\n• **Onboarding**: Can complete paperwork, laptop setup, and sprint onboarding immediately without waiting periods.`,
        actions: [
          { type: 'contact-whatsapp', label: '💬 Chat on WhatsApp', icon: 'whatsapp' },
          { type: 'contact-mail', label: '✉️ Send Offer / Email', icon: 'email' },
          { type: 'resume-modal', label: '📄 Open ATS Resume', icon: 'fileText' }
        ]
      };
    }

    // ----------------------------------------------------------------------
    // 7. Location, Relocation & Remote Work
    // ----------------------------------------------------------------------
    if (hasAny('relocate', 'relocation', 'remote', 'work from home', 'wfh', 'hybrid', 'on-site', 'onsite', 'office location', 'city', 'greater noida', 'bangalore', 'delhi', 'pune', 'hyderabad', 'mumbai')) {
      return {
        text: `**Location & Work Flexibility**\n\n• **Current Location**: Greater Noida / Delhi NCR, India.\n• **Relocation Willingness**: **100% Open to Relocate** to major tech hubs including Bangalore, Hyderabad, Pune, Mumbai, Gurgaon, Noida, or other metropolitan cities.\n• **Remote Flexibility**: Fully experienced in remote team collaboration (proven during his remote internship at Alfido Tech). Equipped with dedicated high-speed fiber internet and modern workstation.`,
        actions: [
          { type: 'contact-whatsapp', label: '💬 Contact Chintu', icon: 'whatsapp' },
          { type: 'contact-mail', label: '✉️ Send Email', icon: 'email' }
        ]
      };
    }

    // ----------------------------------------------------------------------
    // 8. Compensation & Salary Expectations
    // ----------------------------------------------------------------------
    if (hasAny('salary', 'compensation', 'ctc', 'expected salary', 'package', 'stipend', 'pay')) {
      return {
        text: `**Compensation & Salary Expectations**\n\nChintu is flexible and open to **competitive industry-standard compensation** commensurate with the role's scope, responsibilities, and long-term learning opportunities.\n\nHis primary focus is joining a high-performing engineering and analytics team where he can solve challenging problems, automate data pipelines, and create measurable business impact.`,
        actions: [
          { type: 'contact-mail', label: '✉️ Discuss Compensation', icon: 'email' },
          { type: 'contact-whatsapp', label: '💬 Chat on WhatsApp', icon: 'whatsapp' }
        ]
      };
    }

    // ----------------------------------------------------------------------
    // 9. GitHub & Code Repositories
    // ----------------------------------------------------------------------
    if (hasAny('github', 'git', 'repository', 'repositories', 'repo', 'repos', 'source code', 'commits', 'codebase')) {
      const gh = info.socials.github;
      return {
        text: `**GitHub Code & Repositories**\n\n• **GitHub Profile**: [github.com/ChintuYadav001](${gh})\n\n**Featured Repositories**:\n1. **Customer RFM Segmentation**: Full Python Pandas script, IQR outlier cleaning, RFM scoring, and Seaborn heatmaps.\n2. **Superstore Sales Performance**: Complex SQL aggregation pipelines with window functions and accompanying Power BI dashboard file.\n3. **Website Traffic Analysis**: Exploratory analysis notebook examining visitor drop-offs and channel conversion funnels.`,
        actions: [
          { type: 'external-url', url: gh, label: '📂 Open GitHub Profile', icon: 'github' },
          { type: 'project-modal', id: 'project-rfm', label: '🔍 View RFM Project', icon: 'code' }
        ]
      };
    }

    // ----------------------------------------------------------------------
    // 10. Work Experience & Alfido Tech Internship
    // ----------------------------------------------------------------------
    if (hasAny('alfido', 'internship', 'intern', 'experience', 'previous company', 'work history', 'job experience', 'work experience', 'what did he do at work')) {
      return {
        text: `**Data Analyst Intern at Alfido Tech** *(Aug 2026 – Oct 2026, Remote)*\n\n• **50,000+ Raw Records Cleaned**: Preprocessed 5+ multi-domain business datasets using Python (Pandas, NumPy), resolving null values, deduplicating records, and handling outliers to lift data quality by an estimated **30%**.\n• **Automated ETL Pipelines**: Engineered reusable, modular Python functions for recurring data cleaning routines, cutting manual preprocessing time by **~40%**.\n• **Exploratory Data Analysis (EDA)**: Built 10+ Matplotlib & Seaborn visualizations uncovering behavioral KPIs and revenue correlations, presenting findings to a 4-person cross-functional team.`,
        actions: [
          { type: 'scroll', target: '#experience', label: '🏢 View Experience Timeline', icon: 'arrowRight' },
          { type: 'resume-modal', label: '📄 Open Full ATS Resume', icon: 'fileText' },
          { type: 'project-modal', id: 'project-rfm', label: '🔍 View RFM Project', icon: 'code' }
        ]
      };
    }

    // ----------------------------------------------------------------------
    // 11. Education, AKTU, IIMT College & Academics
    // ----------------------------------------------------------------------
    if (hasAny('education', 'college', 'iimt', 'aktu', 'degree', 'btech', 'cgpa', 'roll number', 'marks', 'percentage', 'school', 'paramount', '12th', '10th', 'academic', 'qualification')) {
      return {
        text: `**Academic Qualifications**\n\n• 🎓 **B.Tech in Computer Science (Artificial Intelligence & Data Science)**\n  IIMT Engineering College (AKTU), Greater Noida | 2023 – 2027\n  **CGPA: 7.2** | Roll No: \`2302161630036\`\n  *Coursework*: Database Management Systems (DBMS), Relational Databases, Algorithmic Problem Solving, Probability & Statistics, Machine Learning.\n• 🏫 **Class XII (Senior Secondary - CBSE)** | Paramount Academy | 2023 | **67.6%** (Physics, Chemistry, Mathematics)\n• 🏫 **Class X (Secondary School - CBSE)** | Paramount Academy | 2021 | **65.4%**`,
        actions: [
          { type: 'scroll', target: '#experience', label: '🎓 View Education Timeline', icon: 'arrowRight' },
          { type: 'resume-modal', label: '📄 Open ATS Resume', icon: 'fileText' }
        ]
      };
    }

    // ----------------------------------------------------------------------
    // 12. Technical Skills Breakdown
    // ----------------------------------------------------------------------
    // SQL Mastery
    if (hasAny('sql', 'mysql', 'window function', 'cte', 'subqueries', 'queries solved', '100 queries', 'leetcode', 'hackerrank sql', 'rdbms')) {
      return {
        text: `**SQL & Relational Databases (Expertise Level: 92%)**\n\n• **100+ Solved Queries**: Continuously solves complex relational retrieval and transformation problems across LeetCode & HackerRank.\n• **Advanced Techniques**: Common Table Expressions (CTEs), Window Functions (\`ROW_NUMBER()\`, \`RANK()\`, \`DENSE_RANK()\`, \`LEAD()\`, \`LAG()\`), multi-table INNER/LEFT/SELF joins, subqueries, and aggregation optimizations (\`GROUP BY\`, \`HAVING\`).\n• **Credentials**: Official HackerRank SQL (Basic) Certified & Google Data Analytics SQL Specialization.`,
        actions: [
          { type: 'project-modal', id: 'project-sales', label: '📊 View Sales SQL Queries', icon: 'database' },
          { type: 'cert-modal', id: 'cert-hackerrank-sql', label: '📜 View HackerRank Certificate', icon: 'award' }
        ]
      };
    }

    // Python & EDA
    if (hasAny('python', 'pandas', 'numpy', 'matplotlib', 'seaborn', 'data wrangling', 'data cleaning', 'missing values', 'outliers', 'iqr', 'eda', 'exploratory data')) {
      return {
        text: `**Python & Exploratory Data Analysis (Expertise Level: 90%)**\n\n• **Core Libraries**: Pandas, NumPy, Matplotlib, Seaborn.\n• **Data Cleaning & Wrangling**: Assessing missing data mechanisms (MCAR/MAR/MNAR), null imputation (mean/median/mode), deduplication, and Interquartile Range (IQR) outlier clipping.\n• **ETL Automation**: Authored modular Python pipelines reducing manual data prep time by **40%** at Alfido Tech.\n• **Certifications**: Python for Data Science (Infosys Springboard) & Introduction to Python (Infosys).`,
        actions: [
          { type: 'project-modal', id: 'project-rfm', label: '🔍 View RFM Python Code', icon: 'code' },
          { type: 'cert-modal', id: 'cert-infosys-datascience', label: '📜 Infosys Python Cert', icon: 'award' }
        ]
      };
    }

    // Power BI & DAX
    if (hasAny('power bi', 'powerbi', 'dax', 'dashboard', 'star schema', 'calculate', 'sumx', 'rankx', 'kpi', 'bi tool')) {
      return {
        text: `**Power BI & Business Intelligence (Expertise Level: 90%)**\n\n• **Interactive Dashboards**: Multi-page executive dashboards featuring cross-filtering, dynamic slicers, drill-throughs, and bookmarks.\n• **DAX Measures**: Advanced calculations utilizing \`CALCULATE\`, \`SUMX\`, \`RANKX\`, \`DIVIDE\`, and time intelligence functions.\n• **Data Modeling**: Star schema relationships, fact and dimension tables, one-to-many cardinality.\n• **Certification**: Power BI Micro Course (Skill Course - ISO 9001:2015 Certified).`,
        actions: [
          { type: 'project-modal', id: 'project-sales', label: '📊 View Sales Power BI Project', icon: 'chart' },
          { type: 'cert-modal', id: 'cert-skillcourse-powerbi', label: '📜 Power BI Certificate Lightbox', icon: 'award' }
        ]
      };
    }

    // Excel & Spreadsheets
    if (hasAny('excel', 'spreadsheet', 'spreadsheets', 'pivot table', 'vlookup', 'index match', 'xlookup')) {
      return {
        text: `**Microsoft Excel & Spreadsheets (Expertise Level: 92%)**\n\n• **Formulas**: \`INDEX-MATCH\`, \`XLOOKUP\`, \`VLOOKUP\`, nested \`IF\`/\`IFS\`, conditional calculations.\n• **Data Analysis**: Dynamic Pivot Tables, Pivot Charts, Slicers, What-If Analysis, and Data Validation.\n• **Reporting**: Executive KPI scorecards, conditional formatting heatmaps, and clean stakeholder spreadsheets.`,
        actions: [
          { type: 'project-modal', id: 'project-sales', label: '📊 View Superstore Project', icon: 'chart' },
          { type: 'scroll', target: '#skills', label: '⚡ View Skills Section', icon: 'arrowRight' }
        ]
      };
    }

    // AI, Machine Learning & Data Science
    if (hasAny('ai', 'ml', 'machine learning', 'data science', 'physics wallah', 'pw', 'alakh pandey', 'bootcamp', 'predictive')) {
      return {
        text: `**Artificial Intelligence & Machine Learning Expertise**\n\n• **Academic Major**: B.Tech CSE with Artificial Intelligence & Data Science specialization at IIMT (AKTU).\n• **Bootcamp Certification**: AI/ML Launchpad Bootcamp by **Physics Wallah (PW) & NSDC** (Credential ID: \`f88d59a0-c12b-474b-b0e7-092097a0fbd8\`).\n• **Machine Learning Concepts**: Supervised & unsupervised learning, linear/logistic regression, decision trees, k-means clustering, model evaluation (precision, recall, ROC-AUC), and Python AI pipelines.`,
        actions: [
          { type: 'cert-modal', id: 'cert-pw-aiml-bootcamp', label: '🤖 View PW AI/ML Certificate', icon: 'award' },
          { type: 'scroll', target: '#experience', label: '🎓 View Education Section', icon: 'arrowRight' }
        ]
      };
    }

    // General Skills Matrix
    if (hasAny('skill', 'skills', 'tech stack', 'technologies', 'tools', 'proficiencies', 'stack', 'what tools')) {
      return {
        text: `**Chintu's Technical Stack Overview**\n\n• **Languages**: Python, SQL (MySQL, PostgreSQL)\n• **Data Wrangling**: Pandas, NumPy, Data Cleaning, IQR Outlier Detection\n• **BI & Visualization**: Power BI (DAX, Star Schema), Tableau, Excel (Pivot Tables, VLOOKUP, INDEX-MATCH), Matplotlib, Seaborn\n• **Methodologies**: Exploratory Data Analysis (EDA), RFM Customer Segmentation, KPI formulation, ETL Script Automation\n• **Tools & Platforms**: Jupyter Notebook, Git/GitHub, VS Code`,
        actions: [
          { type: 'scroll', target: '#skills', label: '⚡ Browse Full Skills Matrix', icon: 'chart' },
          { type: 'resume-modal', label: '📄 Open Full ATS Resume', icon: 'fileText' }
        ]
      };
    }

    // ----------------------------------------------------------------------
    // 13. Projects Deep Dives
    // ----------------------------------------------------------------------
    // RFM Segmentation
    if (hasAny('rfm', 'segmentation', 'customer behavior', 'champions', 'loyalists', 'customer project', 'recency')) {
      const rfm = portfolioData.projects.find(p => p.id === 'project-rfm');
      return {
        text: `**Customer Behavior & RFM Segmentation Analysis**\n\nChintu analyzed **10,000+ customer transaction rows** using Python (Pandas, NumPy) to segment customers into actionable value tiers.\n\n• **Methodology**: Computed Recency (days since last purchase), Frequency (total orders), and Monetary (total spend) values, assigning quartile scores (1–4) into **5 tiers**: *Champions, Loyalists, Potential Loyalists, At Risk, and Hibernating*.\n• **Key Finding**: Discovered that the top ~20% of customers generated over **60% of total revenue**, surfacing high-ROI retention strategies.\n• **Tech Stack**: Python, Pandas, NumPy, Matplotlib, Seaborn, IQR outlier clipping.`,
        actions: [
          { type: 'project-modal', id: 'project-rfm', label: '🔍 View RFM Project Details', icon: 'external' },
          { type: 'external-url', url: rfm?.githubUrl || info.socials.github, label: '📂 GitHub Repo', icon: 'github' }
        ]
      };
    }

    // Sales Superstore Power BI
    if (hasAny('sales', 'superstore', 'sales dashboard', 'sales project', 'sales analysis')) {
      const sales = portfolioData.projects.find(p => p.id === 'project-sales');
      return {
        text: `**Sales Performance Analysis & Power BI Dashboard**\n\nChintu investigated **9,800+ Superstore transactions** across geographic regions, product categories, and customer segments.\n\n• **SQL Engine**: Wrote complex SQL queries utilizing Window Functions (\`ROW_NUMBER\`, \`RANK\`), subqueries, and multi-table joins to prepare aggregated tables.\n• **Power BI Dashboard**: Created 5+ dynamic KPI visualizations with DAX measures (\`CALCULATE\`, \`SUMX\`, \`RANKX\`).\n• **Business Outcome**: Isolated 3+ actionable areas to eliminate unprofitable product categories and alleviate shipping bottlenecks.`,
        actions: [
          { type: 'project-modal', id: 'project-sales', label: '📊 View Sales Project Details', icon: 'chart' },
          { type: 'external-url', url: sales?.githubUrl || info.socials.github, label: '📂 GitHub Repo', icon: 'github' }
        ]
      };
    }

    // Website Traffic
    if (hasAny('traffic', 'website traffic', 'bounce rate', 'conversion funnel', 'sessions', 'web analytics')) {
      const traffic = portfolioData.projects.find(p => p.id === 'project-traffic');
      return {
        text: `**Website Traffic & Conversion Analysis**\n\nChintu examined digital web analytics data across thousands of visitor sessions to optimize the conversion funnel.\n\n• **Funnel Analysis**: Mapped user session flows, identifying friction points across the top 5 landing and exit pages.\n• **Channel Comparison**: Benchmarked Organic, Direct, Social, and Paid referral channels against bounce rates and average session duration.\n• **Tech Stack**: Python, Pandas, NumPy, Matplotlib, Seaborn, Correlation Heatmaps.`,
        actions: [
          { type: 'project-modal', id: 'project-traffic', label: '🌐 View Traffic Project Details', icon: 'network' },
          { type: 'external-url', url: traffic?.githubUrl || info.socials.github, label: '📂 GitHub Repo', icon: 'github' }
        ]
      };
    }

    // All Projects Overview
    if (hasAny('project', 'projects', 'what did he build', 'portfolio', 'work sample', 'case study', 'what has he built')) {
      return {
        text: `Chintu has completed **3 end-to-end data analytics projects** solving real business challenges:\n\n1. **Customer Behavior & RFM Segmentation** (Python, 10,000+ rows, 5 customer tiers)\n2. **Sales Performance & Power BI Dashboard** (SQL + Power BI DAX, 9,800+ Superstore records, 5+ KPIs)\n3. **Website Traffic & Conversion Analysis** (Python EDA, user funnels, bounce rates & channels)\n\nWhich project would you like to explore?`,
        actions: [
          { type: 'project-modal', id: 'project-rfm', label: '1. RFM Segmentation', icon: 'external' },
          { type: 'project-modal', id: 'project-sales', label: '2. Sales Power BI', icon: 'chart' },
          { type: 'project-modal', id: 'project-traffic', label: '3. Web Traffic', icon: 'network' },
          { type: 'scroll', target: '#projects', label: '📁 View All on Page', icon: 'arrowRight' }
        ]
      };
    }

    // ----------------------------------------------------------------------
    // 14. Verified Certifications
    // ----------------------------------------------------------------------
    // Google Data Analytics
    if (hasAny('google', 'coursera', 'amanda brophy', 'ep3o21xswb7z')) {
      return {
        text: `**Google Data Analytics Professional Certificate** *(#1 Credential)*\n\n• **Issuer**: Google & Coursera\n• **Signer**: Amanda Brophy (Global Director of Google Career Certificates)\n• **Credential ID**: \`EP3O21XSWB7Z\`\n• **Date Issued**: June 30, 2026\n• **Curriculum**: Rigorous 9-course specialization validating end-to-end competencies in data cleaning, SQL querying, spreadsheets, Tableau visualization, Python for analytics, and capstone case study completion.`,
        actions: [
          { type: 'cert-modal', id: 'cert-google-data-analytics', label: '📜 View Google Certificate Lightbox', icon: 'award' },
          { type: 'external-url', url: 'https://coursera.org/verify/professional-cert/EP3O21XSWB7Z', label: '🌐 Verify on Coursera', icon: 'external' }
        ]
      };
    }

    // Physics Wallah AI/ML Bootcamp
    if (hasAny('physics wallah', 'pw', 'alakh pandey', 'f88d59a0')) {
      return {
        text: `**AI/ML Launchpad Bootcamp Certification**\n\n• **Issuer**: Physics Wallah (PW) & NSDC\n• **Signer**: Mr. Alakh Pandey (Founder, Physics Wallah)\n• **Credential ID**: \`f88d59a0-c12b-474b-b0e7-092097a0fbd8\`\n• **Date Issued**: 29th June 2026\n• **Competencies**: Applied machine learning algorithms, statistical learning, AI model pipelines, and Python AI pipeline development.`,
        actions: [
          { type: 'cert-modal', id: 'cert-pw-aiml-bootcamp', label: '🤖 View AI/ML Certificate Lightbox', icon: 'award' }
        ]
      };
    }

    // Power BI Certificate (Skill Course)
    if (hasAny('power bi cert', 'skill course', 'satish dhawale', 'sc-b22a7ddd69')) {
      return {
        text: `**Power BI Micro Course**\n\n• **Issuer**: Skill Course (ISO 9001:2015 Certified)\n• **Signer**: Satish Dhawale (Founder)\n• **Credential ID**: \`SC-B22A7DDD69\`\n• **Skills Validated**: DAX measures (\`CALCULATE\`, \`SUMX\`, \`RANKX\`), Star Schema relational modeling, interactive dashboard design.`,
        actions: [
          { type: 'cert-modal', id: 'cert-skillcourse-powerbi', label: '📊 View Power BI Certificate Lightbox', icon: 'award' }
        ]
      };
    }

    // Infosys Springboard
    if (hasAny('infosys', 'wingspan', 'thirumala arohi')) {
      return {
        text: `Chintu holds **2 verified certificates from Infosys Springboard**:\n\n1. **Python for Data Science** (\`INFOSYS-DS-2025-0427\`, April 2025) – Data wrangling with Pandas/NumPy & statistical analysis.\n2. **Introduction to Python** (\`INFOSYS-PY-2025-0516\`, May 2025) – OOP, control flow, algorithms & modular functions.`,
        actions: [
          { type: 'cert-modal', id: 'cert-infosys-datascience', label: '1. Python Data Science', icon: 'award' },
          { type: 'cert-modal', id: 'cert-infosys-python', label: '2. Python Intro', icon: 'award' }
        ]
      };
    }

    // HackerRank SQL
    if (hasAny('hackerrank', '967bfb00fd4b')) {
      return {
        text: `**SQL (Basic) Skill Certification**\n\n• **Issuer**: HackerRank\n• **Signer**: Harishankaran K (CTO, HackerRank)\n• **Credential ID**: \`967BFB00FD4B\`\n• **Issued**: March 7, 2026\n• **Validation**: Complex database queries, relational joins, aggregations, and query optimization.`,
        actions: [
          { type: 'cert-modal', id: 'cert-hackerrank-sql', label: '📜 View HackerRank SQL Certificate', icon: 'award' }
        ]
      };
    }

    // IoT Certificates
    if (hasAny('iot', 'technoledge', 'internet of things')) {
      return {
        text: `Chintu has earned **2 industrial IoT credentials** from IIMT College of Engineering & Technoledge Eduresearch:\n\n1. **Advance Internet of Things (IoT)** (4-month intensive, Sep 2024 – Jan 2025, ID: \`T/IOT/712613/25\`)\n2. **Advance IoT Centre of Excellence** (Hardware telemetry integration, ID: \`T/IOT/711753/25\`).`,
        actions: [
          { type: 'cert-modal', id: 'cert-iimt-iot', label: '📡 View IoT Certificate', icon: 'award' },
          { type: 'cert-modal', id: 'cert-iimt-iot-coe', label: '🎖️ View IoT CoE Certificate', icon: 'award' }
        ]
      };
    }

    // All Certificates Overview
    if (hasAny('cert', 'certs', 'certificate', 'certificates', 'credential', 'credentials', 'badge', 'badges', 'license', 'licenses')) {
      return {
        text: `Chintu possesses **9 authentic verified credentials**:\n\n1. 🌟 **Google Data Analytics Professional** (Coursera)\n2. 🤖 **AI/ML Launchpad Bootcamp** (Physics Wallah & NSDC)\n3. 📊 **Power BI Micro Course** (Skill Course - ISO 9001:2015)\n4. 🐍 **Python for Data Science** (Infosys Springboard)\n5. 💻 **Introduction to Python** (Infosys Springboard)\n6. 🛡️ **SQL (Basic) Skill Certification** (HackerRank)\n7. 📡 **Advance Internet of Things (IoT)** (IIMT & Technoledge)\n8. 🎖️ **Advance IoT Centre of Excellence** (IIMT CoE)\n9. ⚡ **100+ SQL Queries Solved** (LeetCode & HackerRank)`,
        actions: [
          { type: 'cert-modal', id: 'cert-google-data-analytics', label: 'Google Cert (#1)', icon: 'award' },
          { type: 'cert-modal', id: 'cert-pw-aiml-bootcamp', label: 'AI/ML Bootcamp', icon: 'award' },
          { type: 'scroll', target: '#certificates', label: 'Browse All 9 Credentials', icon: 'arrowRight' }
        ]
      };
    }

    // ----------------------------------------------------------------------
    // 15. Technical Interview Q&A & Core Concepts
    // ----------------------------------------------------------------------
    if (hasAny('how do you clean', 'cleaning process', 'clean data', 'data cleaning workflow', 'missing data', 'outlier detection')) {
      return {
        text: `**Data Cleaning & Preprocessing Methodology**\n\n1. **Assess Missingness**: Distinguish between MCAR, MAR, and MNAR. Impute numerical columns using median (for skewed distributions) or mean; use mode or 'Unknown' for categorical features. Drop columns with >60% missing data unless vital.\n2. **Outlier Detection**: Apply Interquartile Range (IQR) bounds: \`[Q1 - 1.5 * IQR, Q3 + 1.5 * IQR]\`. Clip extreme anomalies to prevent model skew.\n3. **Deduplication & Formatting**: Remove duplicate keys, normalize string casing, and parse ISO standard dates.\n4. **Modular Automation**: Wrap operations in reusable Python functions (cutting manual ETL by 40% at Alfido Tech).`,
        actions: [
          { type: 'project-modal', id: 'project-rfm', label: '🔍 View RFM Cleaning Code', icon: 'code' },
          { type: 'scroll', target: '#skills', label: '⚡ View Skills', icon: 'chart' }
        ]
      };
    }

    if (hasAny('where vs having', 'difference between where and having', 'where and having')) {
      return {
        text: `**Difference between WHERE and HAVING in SQL**\n\n• **WHERE Clause**: Filters rows **before** any grouping or aggregation takes place. Cannot be used with aggregate functions like \`SUM()\`, \`COUNT()\`, or \`AVG()\`.\n• **HAVING Clause**: Filters groups or aggregated results **after** the \`GROUP BY\` clause has executed (e.g., \`HAVING COUNT(order_id) > 10\`).`,
        actions: [
          { type: 'project-modal', id: 'project-sales', label: '📊 View SQL Queries', icon: 'database' },
          { type: 'cert-modal', id: 'cert-hackerrank-sql', label: '📜 HackerRank Cert', icon: 'award' }
        ]
      };
    }

    // ----------------------------------------------------------------------
    // 16. Contact Details, WhatsApp & Phone
    // ----------------------------------------------------------------------
    if (hasAny('whatsapp', 'contact', 'email', 'phone', 'call', 'reach', 'mobile', 'talk', 'connect', 'interview schedule', 'schedule interview', 'how to contact')) {
      return {
        text: `**Get in Touch with Chintu Kumar**\n\n• **Status**: ${info.badge}\n• 💬 **WhatsApp**: \`+91 7763917713\` *(Direct chat & calls)*\n• 📧 **Email**: \`${info.email}\`\n• 📱 **Phone**: \`${info.phone}\`\n• 📍 **Location**: ${info.location}\n• 🌐 **Profiles**: [LinkedIn](${info.socials.linkedin}) • [GitHub](${info.socials.github})`,
        actions: [
          { type: 'contact-whatsapp', label: '💬 Chat on WhatsApp', icon: 'whatsapp' },
          { type: 'contact-mail', label: '✉️ Email Chintu', icon: 'email' },
          { type: 'contact-call', label: '📞 Call +91 7763917713', icon: 'phone' },
          { type: 'scroll', target: '#contact', label: '📋 Open Contact Form', icon: 'arrowRight' }
        ]
      };
    }

    // ----------------------------------------------------------------------
    // 17. Resume & Official PDF Download
    // ----------------------------------------------------------------------
    if (hasAny('resume', 'cv', 'biodata', 'curriculum vitae', 'download resume', 'ats resume', 'pdf resume')) {
      return {
        text: `Chintu's complete **ATS-Optimized Resume** is available to view in high resolution or download directly as an official PDF.\n\nIt features complete details on his Alfido Tech internship, 3 data analytics projects, 9 verified credentials, and technical proficiencies.`,
        actions: [
          { type: 'resume-modal', label: '📄 Open Interactive Resume Modal', icon: 'fileText' },
          { type: 'external-url', url: 'assets/Chintu_Kumar_Data_Analyst_Resume.pdf', label: '⬇️ Download Official PDF', icon: 'download' }
        ]
      };
    }

    // ----------------------------------------------------------------------
    // 18. Conversational Greetings & Pleasantries
    // ----------------------------------------------------------------------
    if (q === 'hi' || q === 'hello' || q === 'hey' || q.startsWith('hi ') || q.startsWith('hello ') || q === 'namaste' || hasAny('good morning', 'good evening', 'good afternoon')) {
      return {
        text: `Hello there! 👋 Glad to connect with you! I can answer questions about Chintu Kumar's **LinkedIn profile**, **data analytics projects**, **9 verified certificates**, **SQL & Python technical skills**, or **how to hire him**. What would you like to explore?`,
        actions: [
          { type: 'project-modal', id: 'project-sales', label: '📊 Superstore Power BI Project', icon: 'chart' },
          { type: 'cert-modal', id: 'cert-google-data-analytics', label: '📜 Google Data Analytics Cert', icon: 'award' },
          { type: 'resume-modal', label: '📄 Open Full Resume', icon: 'fileText' }
        ]
      };
    }

    if (hasAny('who are you', 'what are you', 'your name', 'what can you do', 'voice assistant', 'how do you work')) {
      return {
        text: `I am **Chintu AI**, an intelligent portfolio voice and chat assistant! I have full knowledge of Chintu Kumar's **LinkedIn profile**, **career vision**, **data analytics projects**, **9 verified certificates**, **SQL & Python expertise**, **internship work at Alfido Tech**, and **contact details**! You can speak into your microphone or type any question.`,
        actions: [
          { type: 'project-modal', id: 'project-rfm', label: '🔍 RFM Customer Project', icon: 'external' },
          { type: 'cert-modal', id: 'cert-pw-aiml-bootcamp', label: '🤖 PW AI/ML Bootcamp', icon: 'award' },
          { type: 'scroll', target: '#about', label: '👤 Read About Chintu', icon: 'arrowRight' }
        ]
      };
    }

    if (hasAny('thank', 'thanks', 'great', 'awesome', 'nice', 'cool', 'good job', 'well done')) {
      return {
        text: `You're very welcome! 😊 Feel free to explore more of the 3D portfolio, or reach out to Chintu directly for interviews or project discussions.`,
        actions: [
          { type: 'contact-mail', label: '✉️ Send Chintu an Email', icon: 'email' },
          { type: 'resume-modal', label: '📄 View ATS Resume', icon: 'fileText' }
        ]
      };
    }

    if (hasAny('bye', 'goodbye', 'see you', 'cya', 'exit', 'quit')) {
      return {
        text: `Goodbye! Thank you for visiting Chintu Kumar's portfolio. Have a fantastic day ahead! 🚀`,
        actions: [
          { type: 'scroll', target: '#hero', label: '⬆️ Back to Top', icon: 'arrowUp' }
        ]
      };
    }

    // ----------------------------------------------------------------------
    // 19. Intelligent Fallback with Contextual Recommendations
    // ----------------------------------------------------------------------
    return {
      text: `I specialize in answering questions about **Chintu Kumar's data analytics career and credentials**! Here are some great topics to ask:\n\n• *"Tell me about Chintu's LinkedIn profile and career goals"*\n• *"Why should we hire Chintu for a Data Analyst role?"*\n• *"Show me the Customer RFM segmentation project"*\n• *"What are his 9 verified certifications?"*\n• *"What did he achieve during his internship at Alfido Tech?"*\n• *"What is his notice period and when can he join?"*`,
      actions: [
        { type: 'project-modal', id: 'project-sales', label: '📊 Sales Power BI Project', icon: 'chart' },
        { type: 'cert-modal', id: 'cert-google-data-analytics', label: '📜 Google Certificate', icon: 'award' },
        { type: 'resume-modal', label: '📄 Open Full Resume', icon: 'fileText' },
        { type: 'contact-whatsapp', label: '💬 WhatsApp Chintu', icon: 'whatsapp' }
      ]
    };
  }
}
