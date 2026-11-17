(() => {
  'use strict';

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

  /* ---------- HERO FIELD CANVAS: drifting leaves ---------- */
  const canvas = document.getElementById('fieldCanvas');
  const ctx = canvas.getContext('2d');
  let w, h, leaves = [];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const LIGHT_PALETTE = ['rgba(45,106,79,0.4)', 'rgba(92,138,116,0.38)', 'rgba(184,149,74,0.42)'];
  const DARK_PALETTE  = ['rgba(159,216,184,0.4)', 'rgba(143,179,157,0.35)', 'rgba(214,182,103,0.45)'];

  function isDark() {
    const t = root.getAttribute('data-theme');
    if (t) return t === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function makeLeaf(randomY) {
    return {
      x: Math.random() * w,
      y: randomY ? Math.random() * h : h + 30 + Math.random() * 60,
      size: 10 + Math.random() * 16,
      speed: 0.25 + Math.random() * 0.45,
      swayAmp: 18 + Math.random() * 26,
      swayFreq: 0.004 + Math.random() * 0.006,
      swaySeed: Math.random() * 1000,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.01,
      paletteIdx: Math.floor(Math.random() * 3),
    };
  }

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    const count = Math.min(34, Math.floor((w * h) / 42000));
    leaves = Array.from({ length: count }, () => makeLeaf(true));
  }

  function drawLeaf(leaf, color) {
    const sway = Math.sin(leaf.y * leaf.swayFreq + leaf.swaySeed) * leaf.swayAmp;
    ctx.save();
    ctx.translate(leaf.x + sway, leaf.y);
    ctx.rotate(leaf.rotation);
    const s = leaf.size;
    ctx.beginPath();
    ctx.moveTo(0, s / 2);
    ctx.quadraticCurveTo(s / 2, s / 5, 0, -s / 2);
    ctx.quadraticCurveTo(-s / 2, s / 5, 0, s / 2);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, s / 2.2);
    ctx.lineTo(0, -s / 2.2);
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(0.6, s * 0.035);
    ctx.stroke();
    ctx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    const palette = isDark() ? DARK_PALETTE : LIGHT_PALETTE;

    leaves.forEach(leaf => {
      leaf.y -= leaf.speed;
      leaf.rotation += leaf.rotationSpeed;
      if (leaf.y < -30) Object.assign(leaf, makeLeaf(false));
      drawLeaf(leaf, palette[leaf.paletteIdx]);
    });

    if (!reduceMotion) requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  if (reduceMotion) draw(); else requestAnimationFrame(draw);
})();
