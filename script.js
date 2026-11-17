(() => {
  'use strict';

  /* ---------- CUSTOM CURSOR ---------- */
  const cursorDot = document.getElementById('cursorDot');
  const isCoarsePointer = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  if (cursorDot && !isCoarsePointer) {
    window.addEventListener('mousemove', e => {
      cursorDot.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    });
    document.addEventListener('mouseover', e => {
      if (e.target.closest('a, button, input, textarea')) cursorDot.classList.add('grow');
    });
    document.addEventListener('mouseout', e => {
      if (e.target.closest('a, button, input, textarea')) cursorDot.classList.remove('grow');
    });
  }

  /* ---------- THEME ---------- */
  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const stored = (() => { try { return localStorage.getItem('theme'); } catch { return null; } })();
  if (stored) root.setAttribute('data-theme', stored);

  themeToggle.addEventListener('click', () => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const current = root.getAttribute('data-theme') || (prefersDark ? 'dark' : 'light');
    const next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch {}
  });

  /* ---------- MOBILE MENU ---------- */
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    menuToggle.classList.toggle('open');
  });
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuToggle.classList.remove('open');
  }));

  /* ---------- SCROLL PROGRESS + NAV SPY ---------- */
  const progressBar = document.getElementById('progressBar');
  const navAnchors = document.querySelectorAll('a[data-nav]');
  const sections = [...navAnchors].map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);

  function onScroll() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = docHeight > 0 ? `${(scrollTop / docHeight) * 100}%` : '0%';

    let current = '';
    sections.forEach(sec => {
      if (scrollTop >= sec.offsetTop - 160) current = sec.id;
    });
    navAnchors.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${current}`));
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  document.getElementById('scrollCue').addEventListener('click', () => {
    document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
  });
  document.getElementById('backTop').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- REVEAL ON SCROLL ---------- */
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  /* ---------- COUNT-UP STATS ---------- */
  const countEls = document.querySelectorAll('.stat-num');
  const countObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const duration = 1100;
      const start = performance.now();
      function tick(now) {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target);
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      countObserver.unobserve(el);
    });
  }, { threshold: 0.5 });
  countEls.forEach(el => countObserver.observe(el));

  /* ---------- ROTATING ROLE WORD ---------- */
  const roleWords = ['climate adaptation', 'governance reform', 'locally-led action', 'community resilience', 'climate finance'];
  const roleEl = document.getElementById('roleWord');
  let wi = 0, ci = roleWords[0].length, deleting = false;

  function typeLoop() {
    const word = roleWords[wi];
    ci += deleting ? -1 : 1;
    roleEl.textContent = word.slice(0, ci);

    let delay = deleting ? 35 : 70;
    if (!deleting && ci === word.length) { delay = 1600; deleting = true; }
    else if (deleting && ci === 0) { deleting = false; wi = (wi + 1) % roleWords.length; delay = 300; }

    setTimeout(typeLoop, delay);
  }
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setTimeout(typeLoop, 1600);
  }

  /* ---------- PUBLICATION FILTERS ---------- */
  const filterChips = document.querySelectorAll('.filter-chip');
  const pubCards = document.querySelectorAll('.pub-card');
  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const type = chip.dataset.filter;
      pubCards.forEach(card => {
        const show = type === 'all' || card.dataset.type === type;
        card.classList.toggle('hide', !show);
      });
    });
  });

  /* ---------- CONTACT FORM (mailto) ---------- */
  const form = document.getElementById('contactForm');
  const hint = document.getElementById('formHint');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('cfName').value.trim();
    const email = document.getElementById('cfEmail').value.trim();
    const subject = document.getElementById('cfSubject').value.trim() || `Portfolio enquiry from ${name}`;
    const message = document.getElementById('cfMessage').value.trim();

    if (!name || !email || !message) {
      hint.textContent = 'Please fill in your name, email and message.';
      return;
    }
    const body = `${message}\n\n— ${name} (${email})`;
    const mailto = `mailto:workspaceforankit@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
    hint.textContent = 'Opening your email client…';
  });

  /* ---------- FOOTER YEAR ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- HERO FIELD CANVAS: topographic contour lines ---------- */
  const canvas = document.getElementById('fieldCanvas');
  const ctx = canvas.getContext('2d');
  let w, h, contours = [], t = 0;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function isDark() {
    const t = root.getAttribute('data-theme');
    if (t) return t === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function buildContours() {
    const rows = Math.max(8, Math.min(16, Math.round(h / 90)));
    contours = Array.from({ length: rows }, (_, i) => ({
      baseY: ((i + 0.5) / rows) * h,
      amp1: 16 + Math.random() * 20,
      freq1: 0.0022 + Math.random() * 0.0016,
      amp2: 6 + Math.random() * 10,
      freq2: 0.006 + Math.random() * 0.004,
      phase: Math.random() * 1000,
      speed: 0.12 + Math.random() * 0.14,
      gold: Math.random() < 0.16,
      opacity: 0.08 + Math.random() * 0.14,
    }));
  }

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    buildContours();
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    const lineColor = isDark() ? '159,216,184' : '45,106,79';
    const goldColor = isDark() ? '214,182,103' : '184,149,74';
    const step = 10;

    contours.forEach(c => {
      const phase = c.phase + t * c.speed;
      ctx.beginPath();
      for (let x = 0; x <= w + step; x += step) {
        const y = c.baseY
          + Math.sin((x + phase) * c.freq1) * c.amp1
          + Math.sin((x + phase) * c.freq2 + 1.6) * c.amp2;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(${c.gold ? goldColor : lineColor}, ${c.opacity})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    t += 1;
    if (!reduceMotion) requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  if (reduceMotion) draw(); else requestAnimationFrame(draw);
})();
