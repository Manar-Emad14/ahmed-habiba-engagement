/**
 * LUXURY ARABIC RTL ENGAGEMENT INVITATION - CLIENT INTERACTION LOGIC
 * Ahmed & Habiba (أحمد & حبيبة)
 * 
 * Features:
 * 1. Audio autoplay unlock via Opening Gate overlay
 * 2. Floating equalized audio controller
 * 3. Live countdown timer to 2026-11-25T19:00:00
 * 4. iCalendar (.ics) generator and address copy with toast
 * 5. Interactive blessings wall with localStorage & like reactions
 * 6. Floating gold sparkles background canvas
 * 7. Celebratory confetti effect
 * 8. IntersectionObserver scroll reveals
 */

(function () {
  'use strict';

  // ==========================================
  // CONFIGURATION & CONSTANTS
  // ==========================================
  const TARGET_DATE = new Date('2026-11-25T19:00:00');
  const VENUE_NAME = 'قاعة كنوز';
  const VENUE_ADDRESS = 'قاعة كنوز - المسبك البحري، وراق العرب، الوراق';
  const MAPS_URL = 'https://maps.app.goo.gl/VuAW5H2RXTXyENbi7?g_st=iwb';
  const STORAGE_KEY_BLESSINGS = 'ahmed_habiba_blessings_v2';
  const STORAGE_KEY_LIKES = 'ahmed_habiba_liked_ids_v2';

  // DOM Elements
  const gateOverlay = document.getElementById('gate-overlay');
  const openGateBtn = document.getElementById('open-gate-btn');
  const bgAudio = document.getElementById('bg-audio');
  const audioPillBtn = document.getElementById('audio-pill-btn');
  const audioPillText = document.getElementById('audio-pill-text');
  const toastContainer = document.getElementById('toast-container');
  const guestbookForm = document.getElementById('guestbook-form');
  const guestNameInput = document.getElementById('guest-name');
  const guestMessageInput = document.getElementById('guest-message');
  const blessingsList = document.getElementById('blessings-list');
  const blessingsCounter = document.getElementById('blessings-counter');
  const addToCalendarBtn = document.getElementById('add-to-calendar-btn');
  const copyAddressBtn = document.getElementById('copy-address-btn');
  const whatsappShareBtn = document.getElementById('whatsapp-share-btn');

  // Lock scroll while gate is visible
  document.body.classList.add('gate-locked');

  // ==========================================
  // 1. OPENING GATE & AUDIO AUTOPLAY UNLOCK
  // ==========================================
  function startBackgroundMusic() {
    if (!bgAudio) return;
    
    // Set volume and play
    bgAudio.volume = 0.85;
    const playPromise = bgAudio.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          updateAudioPillState(true);
        })
        .catch((err) => {
          console.warn('Audio play restricted or waiting for interaction:', err);
          updateAudioPillState(false);
        });
    }
  }

  function handleOpenGate() {
    // 1. Immediately trigger audio on user gesture
    startBackgroundMusic();

    // 2. Play celebratory confetti burst
    triggerConfetti();

    // 3. Part the royal gate doors
    if (gateOverlay) {
      gateOverlay.classList.add('gate-opened');
      document.body.classList.remove('gate-locked');

      // Remove overlay completely after animation completes
      setTimeout(() => {
        gateOverlay.classList.add('gate-hidden');
      }, 1000);
    }
  }

  if (openGateBtn) {
    openGateBtn.addEventListener('click', handleOpenGate);
  }

  // ==========================================
  // 2. FLOATING AUDIO CONTROLLER
  // ==========================================
  function updateAudioPillState(isPlaying) {
    if (!audioPillBtn) return;
    if (isPlaying) {
      audioPillBtn.classList.add('playing');
      audioPillBtn.classList.remove('paused');
      if (audioPillText) audioPillText.textContent = 'موسيقى الفرح';
    } else {
      audioPillBtn.classList.remove('playing');
      audioPillBtn.classList.add('paused');
      if (audioPillText) audioPillText.textContent = 'تشغيل الموسيقى';
    }
  }

  function toggleAudio() {
    if (!bgAudio) return;
    if (bgAudio.paused) {
      bgAudio.play().then(() => {
        updateAudioPillState(true);
        showToast('تم تشغيل الموسيقى 🎶');
      }).catch(err => {
        console.warn('Playback error:', err);
      });
    } else {
      bgAudio.pause();
      updateAudioPillState(false);
      showToast('تم إيقاف الموسيقى مؤقتاً ⏸️');
    }
  }

  if (audioPillBtn) {
    audioPillBtn.addEventListener('click', toggleAudio);
  }

  if (bgAudio) {
    bgAudio.addEventListener('play', () => updateAudioPillState(true));
    bgAudio.addEventListener('pause', () => updateAudioPillState(false));
    bgAudio.addEventListener('ended', () => {
      // Loop smoothly
      bgAudio.currentTime = 0;
      bgAudio.play().catch(() => {});
    });
  }

  // ==========================================
  // 3. LIVE COUNTDOWN TIMER
  // ==========================================
  const daysEl = document.getElementById('timer-days');
  const hoursEl = document.getElementById('timer-hours');
  const minutesEl = document.getElementById('timer-minutes');
  const secondsEl = document.getElementById('timer-seconds');
  const finishedMsgEl = document.getElementById('countdown-finished-msg');
  const timerGridEl = document.getElementById('timer-grid');

  function updateCountdown() {
    const now = new Date();
    const diff = TARGET_DATE - now;

    if (diff <= 0) {
      if (timerGridEl) timerGridEl.style.display = 'none';
      if (finishedMsgEl) finishedMsgEl.style.display = 'block';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    if (daysEl) daysEl.textContent = formatDigit(days);
    if (hoursEl) hoursEl.textContent = formatDigit(hours);
    if (minutesEl) minutesEl.textContent = formatDigit(minutes);
    if (secondsEl) secondsEl.textContent = formatDigit(seconds);
  }

  function formatDigit(num) {
    return num < 10 ? `0${num}` : `${num}`;
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // ==========================================
  // 4. CALENDAR (.ICS) GENERATOR & ADDRESS COPY
  // ==========================================
  function generateICSFile() {
    // 25 Nov 2026, 19:00 Cairo time (UTC+2) -> 17:00:00Z to 22:00:00Z
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Engagement Ahmed & Habiba//AR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:engagement-ahmed-habiba-20261125@invitation.local',
      'DTSTAMP:20261120T190000Z',
      'DTSTART:20261125T170000Z',
      'DTEND:20261125T220000Z',
      'SUMMARY:حفل خطوبة أحمد & حبيبة 💍✨',
      'DESCRIPTION:بقلوب ملؤها الحب والبهجة، يسرنا دعوتكم لمشاركتنا فرحة العمر بمناسبة خطوبتنا في قاعة كنوز. حضوركم يسعدنا ويشرفنا!',
      'LOCATION:' + VENUE_ADDRESS,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-PT3H',
      'ACTION:DISPLAY',
      'DESCRIPTION:تذكير بحفل خطوبة أحمد وحبيبة اليوم في قاعة كنوز',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'خطوبة_أحمد_وحبيبة_25_نوفمبر.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('تم تحميل موعد الحفل إلى تقويمك! 📅✨');
  }

  if (addToCalendarBtn) {
    addToCalendarBtn.addEventListener('click', generateICSFile);
  }

  function copyAddressToClipboard() {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(VENUE_ADDRESS)
        .then(() => {
          showToast('تم نسخ عنوان القاعة بنجاح! 📋✨');
        })
        .catch(() => {
          fallbackCopyText(VENUE_ADDRESS);
        });
    } else {
      fallbackCopyText(VENUE_ADDRESS);
    }
  }

  function fallbackCopyText(text) {
    const tempInput = document.createElement('input');
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    try {
      document.execCommand('copy');
      showToast('تم نسخ عنوان القاعة بنجاح! 📋✨');
    } catch (e) {
      showToast(text);
    }
    document.body.removeChild(tempInput);
  }

  if (copyAddressBtn) {
    copyAddressBtn.addEventListener('click', copyAddressToClipboard);
  }

  // ==========================================
  // 5. INTERACTIVE GUESTBOOK / BLESSINGS WALL
  // ==========================================
  // Clean up any legacy dummy blessings from previous versions
  (function cleanupLegacyDummyBlessings() {
    try {
      localStorage.removeItem('ahmed_habiba_blessings_v1');
      localStorage.removeItem('ahmed_habiba_liked_ids_v1');
      const stored = localStorage.getItem(STORAGE_KEY_BLESSINGS);
      if (stored) {
        const list = JSON.parse(stored);
        if (Array.isArray(list)) {
          const cleaned = list.filter(item => !item.id.startsWith('blessing-seed'));
          localStorage.setItem(STORAGE_KEY_BLESSINGS, JSON.stringify(cleaned));
        }
      }
    } catch (e) {
      // ignore
    }
  })();

  function getStoredBlessings() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_BLESSINGS);
      if (!data) return [];
      const list = JSON.parse(data);
      return Array.isArray(list) ? list.filter(item => !item.id.startsWith('blessing-seed')) : [];
    } catch (e) {
      return [];
    }
  }

  function saveStoredBlessings(blessings) {
    try {
      localStorage.setItem(STORAGE_KEY_BLESSINGS, JSON.stringify(blessings));
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }
  }

  function getLikedIds() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_LIKES);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  function saveLikedIds(ids) {
    try {
      localStorage.setItem(STORAGE_KEY_LIKES, JSON.stringify(ids));
    } catch (e) {
      console.warn('Could not save liked IDs', e);
    }
  }

  function renderBlessings() {
    if (!blessingsList) return;
    const blessings = getStoredBlessings();
    const likedIds = getLikedIds();

    if (blessingsCounter) {
      blessingsCounter.textContent = blessings.length;
    }

    blessingsList.innerHTML = '';

    if (blessings.length === 0) {
      blessingsList.innerHTML = `
        <div class="empty-blessings-msg" id="empty-blessings-msg">
          <div class="empty-blessings-icon">💌</div>
          <p class="empty-blessings-text">لا توجد تهاني بعد.. كن أول من يبارك لأحمد وحبيبة! ✨</p>
        </div>
      `;
      return;
    }

    blessings.forEach(item => {
      const firstLetter = item.name.trim().charAt(0) || '✨';
      const isLiked = likedIds.includes(item.id);

      const card = document.createElement('div');
      card.className = 'blessing-card';
      card.innerHTML = `
        <div class="blessing-top">
          <div class="blessing-author-wrap">
            <div class="author-avatar">${escapeHtml(firstLetter)}</div>
            <div>
              <div class="author-name">${escapeHtml(item.name)}</div>
              <div class="blessing-date">${escapeHtml(item.date)}</div>
            </div>
          </div>
        </div>
        <p class="blessing-text">${escapeHtml(item.message)}</p>
        <div class="blessing-actions">
          <button class="btn-like ${isLiked ? 'liked' : ''}" data-id="${item.id}" type="button">
            <span class="like-heart">${isLiked ? '❤️' : '🤍'}</span>
            <span class="like-count">${item.likes || 0}</span>
          </button>
        </div>
      `;

      blessingsList.appendChild(card);
    });

    // Attach like event listeners
    const likeButtons = blessingsList.querySelectorAll('.btn-like');
    likeButtons.forEach(btn => {
      btn.addEventListener('click', handleLikeBlessing);
    });
  }

  function handleLikeBlessing(e) {
    const btn = e.currentTarget;
    const blessingId = btn.getAttribute('data-id');
    const blessings = getStoredBlessings();
    let likedIds = getLikedIds();

    const targetIndex = blessings.findIndex(b => b.id === blessingId);
    if (targetIndex === -1) return;

    if (likedIds.includes(blessingId)) {
      // Unlike
      likedIds = likedIds.filter(id => id !== blessingId);
      blessings[targetIndex].likes = Math.max(0, (blessings[targetIndex].likes || 1) - 1);
    } else {
      // Like
      likedIds.push(blessingId);
      blessings[targetIndex].likes = (blessings[targetIndex].likes || 0) + 1;
    }

    saveStoredBlessings(blessings);
    saveLikedIds(likedIds);
    renderBlessings();
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    const name = guestNameInput.value.trim();
    const message = guestMessageInput.value.trim();

    if (!name || !message) {
      showToast('يرجى ملء جميع الحقول لكتابة التهنئة ✨');
      return;
    }

    const newBlessing = {
      id: 'blessing-' + Date.now(),
      name: name,
      message: message,
      date: 'الآن',
      likes: 1
    };

    const blessings = getStoredBlessings();
    blessings.unshift(newBlessing);
    saveStoredBlessings(blessings);

    // Auto mark as liked by author
    const likedIds = getLikedIds();
    likedIds.push(newBlessing.id);
    saveLikedIds(likedIds);

    renderBlessings();

    // Reset form
    guestbookForm.reset();

    // Trigger celebration
    showToast('شكراً لك! تم إرسال تهنئتكم الكريمة بنجاح 💖');
    triggerConfetti();
  }

  if (guestbookForm) {
    guestbookForm.addEventListener('submit', handleFormSubmit);
  }

  // ==========================================
  // 6. WHATSAPP SHARE
  // ==========================================
  function setupWhatsAppShare() {
    if (!whatsappShareBtn) return;
    const pageUrl = window.location.href;
    const shareText = encodeURIComponent(
      `💍 يسعدنا ويشرفنا دعوتكم لحضور حفل خطوبة أحمد & حبيبة 💖\n\n` +
      `📅 الموعد: يوم الأربعاء، 25 نوفمبر 2026 - الساعة 7:00 مساءً\n` +
      `📍 المكان: قاعة كنوز - المسبك البحري، وراق العرب\n\n` +
      `✨ لمشاهدة تفاصيل الدعوة والاستماع لموسيقى الحفل:\n${pageUrl}`
    );
    whatsappShareBtn.href = `https://api.whatsapp.com/send?text=${shareText}`;
  }

  setupWhatsAppShare();

  // ==========================================
  // 7. TOAST NOTIFICATION UTILITY
  // ==========================================
  function showToast(message) {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
      toast.style.transition = 'all 0.4s ease';
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 400);
    }, 3200);
  }

  function escapeHtml(string) {
    const div = document.createElement('div');
    div.textContent = string;
    return div.innerHTML;
  }

  // ==========================================
  // 8. SCROLL REVEAL ANIMATIONS
  // ==========================================
  function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      reveals.forEach(el => el.classList.add('active'));
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          obs.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    reveals.forEach(el => observer.observe(el));
  }

  // ==========================================
  // 9. FLOATING GOLD SPARKLES CANVAS
  // ==========================================
  function initSparklesCanvas() {
    const canvas = document.getElementById('sparkles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const particleCount = Math.min(38, Math.floor(window.innerWidth / 28));

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.2 + 0.8,
        speedY: Math.random() * 0.45 + 0.15,
        speedX: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.7 + 0.2,
        alphaSpeed: Math.random() * 0.015 + 0.005,
        color: Math.random() > 0.3 ? '#c59d5f' : '#dfba73'
      });
    }

    function render() {
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.y -= p.speedY;
        p.x += p.speedX;
        p.alpha += p.alphaSpeed;

        if (p.alpha >= 0.85 || p.alpha <= 0.15) {
          p.alphaSpeed = -p.alphaSpeed;
        }

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#dfba73';
        ctx.fill();
        ctx.restore();
      });

      requestAnimationFrame(render);
    }

    render();
  }

  // ==========================================
  // 10. CELEBRATORY CONFETTI SYSTEM
  // ==========================================
  function triggerConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const confettiList = [];
    const colors = ['#dfba73', '#c59d5f', '#f4e6e6', '#d85c6c', '#fff2d6', '#ffffff'];
    const totalCount = 90;

    for (let i = 0; i < totalCount; i++) {
      confettiList.push({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        w: Math.random() * 10 + 6,
        h: Math.random() * 8 + 4,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.8) * 16,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: 1,
        gravity: 0.35,
        friction: 0.98
      });
    }

    let animationFrame;
    function animateConfetti() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let activeCount = 0;

      confettiList.forEach(p => {
        p.vx *= p.friction;
        p.vy *= p.friction;
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.opacity -= 0.009;

        if (p.opacity > 0) {
          activeCount++;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        }
      });

      if (activeCount > 0) {
        animationFrame = requestAnimationFrame(animateConfetti);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        cancelAnimationFrame(animationFrame);
      }
    }

    animateConfetti();
  }

  // ==========================================
  // INITIALIZE ON LOAD
  // ==========================================
  document.addEventListener('DOMContentLoaded', () => {
    renderBlessings();
    initScrollReveal();
    initSparklesCanvas();
  });

})();
