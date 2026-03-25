/* ============================================================
   CraftApply – JavaScript
   ============================================================ */

'use strict';

// ─── Year in footer ──────────────────────────────────────────
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ─── Floating particles ───────────────────────────────────────
(function spawnParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  const COLORS = ['#5c8a2e', '#7ac943', '#3d5c1e', '#f5c518', '#5ae4e4', '#8b6340'];
  const COUNT = 30;

  for (let i = 0; i < COUNT; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.setProperty('--left',  `${Math.random() * 100}%`);
    p.style.setProperty('--dur',   `${6 + Math.random() * 10}s`);
    p.style.setProperty('--delay', `${Math.random() * 8}s`);
    p.style.background = COLORS[Math.floor(Math.random() * COLORS.length)];
    p.style.width  = `${4 + Math.floor(Math.random() * 3) * 4}px`;
    p.style.height = p.style.width;
    container.appendChild(p);
  }
})();

// ─── Mobile navigation toggle ─────────────────────────────────
const navToggle = document.getElementById('navToggle');
const navLinks  = document.querySelector('.nav-links');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen);
  });

  // Close menu when a link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// ─── Character counter ────────────────────────────────────────
const messageArea = document.getElementById('message');
const charCount   = document.getElementById('charCount');

if (messageArea && charCount) {
  messageArea.addEventListener('input', () => {
    const len = messageArea.value.length;
    charCount.textContent = len;
    charCount.style.color = len > 900 ? '#c0392b' : len > 800 ? '#f5c518' : '';
  });
}

// ─── Contact form ─────────────────────────────────────────────
const form        = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');

/**
 * Show a status message below the form.
 * @param {'success'|'error'} type
 * @param {string} text
 */
function showMessage(type, text) {
  if (!formMessage) return;
  formMessage.className = `form-message ${type}`;
  formMessage.textContent = text;
  formMessage.hidden = false;
  formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Simple client-side validation that returns a human-readable error string
 * or null when the form is valid.
 * @param {FormData} data
 * @returns {string|null}
 */
function validate(data) {
  const username = data.get('username')?.trim() ?? '';
  const email    = data.get('email')?.trim()    ?? '';
  const age      = parseInt(data.get('age') ?? '', 10);
  const message  = data.get('message')?.trim()  ?? '';

  if (!username || username.length < 3) return 'Bitte gib deinen Minecraft-Username ein (min. 3 Zeichen).';
  if (!/^[a-zA-Z0-9_]+$/.test(username))  return 'Der Username darf nur Buchstaben, Zahlen und _ enthalten.';
  if (username.length > 16) return 'Der Username darf maximal 16 Zeichen lang sein.';
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Bitte gib eine gültige E-Mail-Adresse ein.';
  if (isNaN(age) || age < 10 || age > 99) return 'Bitte gib ein gültiges Alter zwischen 10 und 99 ein.';
  if (!message || message.length < 30) return 'Bitte erkläre uns kurz, warum du mitspielen möchtest (min. 30 Zeichen).';
  if (message.length > 1000) return 'Deine Nachricht ist zu lang (max. 1000 Zeichen).';
  return null;
}

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn  = form.querySelector('[type="submit"]');
    const btnText    = submitBtn?.querySelector('.btn-text');
    const btnLoader  = submitBtn?.querySelector('.btn-loader');

    // Disable button and show loader
    if (submitBtn) submitBtn.disabled = true;
    if (btnText)   btnText.hidden   = true;
    if (btnLoader) btnLoader.hidden = false;
    if (formMessage) formMessage.hidden = true;

    const data = new FormData(form);
    const error = validate(data);

    if (error) {
      showMessage('error', error);
      if (submitBtn) submitBtn.disabled = false;
      if (btnText)   btnText.hidden   = false;
      if (btnLoader) btnLoader.hidden = true;
      return;
    }

    // Build mailto: URL as a reliable, serverless fallback
    const subject = encodeURIComponent(`Bewerbung von ${data.get('username')}`);
    const body = encodeURIComponent(
      `Minecraft Username: ${data.get('username')}\n` +
      `E-Mail: ${data.get('email')}\n` +
      (data.get('discord') ? `Discord: ${data.get('discord')}\n` : '') +
      `Alter: ${data.get('age')}\n\n` +
      `Nachricht:\n${data.get('message')}`
    );

    const emailCard = document.getElementById('emailCard');
    const rawEmail  = emailCard ? emailCard.getAttribute('href').replace('mailto:', '') : 'contact@craftapply.example';
    const mailtoUrl = `mailto:${rawEmail}?subject=${subject}&body=${body}`;

    // Try to open mailto
    try {
      window.location.href = mailtoUrl;
      showMessage(
        'success',
        '✅ Dein E-Mail-Programm sollte sich geöffnet haben. ' +
        'Sende die vorausgefüllte E-Mail ab, um deine Bewerbung zu übermitteln.'
      );
      form.reset();
      if (charCount) charCount.textContent = '0';
    } catch {
      showMessage('error', '❌ Es ist ein Fehler aufgetreten. Bitte schreib uns direkt per E-Mail oder Discord.');
    } finally {
      if (submitBtn) submitBtn.disabled = false;
      if (btnText)   btnText.hidden   = false;
      if (btnLoader) btnLoader.hidden = true;
    }
  });
}

// ─── Intersection Observer – subtle fade-in on scroll ────────
(function initScrollAnimations() {
  const targets = document.querySelectorAll('.about-card, .server-info, .contact-form-box, .contact-options, .contact-card');
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  targets.forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
  });
})();
