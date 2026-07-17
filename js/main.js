'use strict';

/* ═══════════════════════════════════════════════════════════════
   ZENITH HR — main.js  (Professional Edition)
   ═══════════════════════════════════════════════════════════════ */

/* ── SCROLL PROGRESS BAR ────────────────────────────────────────
   Thin champagne line that grows across the very top of the page.
   Inject once; update on every scroll tick.
────────────────────────────────────────────────────────────────── */
(function initScrollProgress() {
  const bar = document.createElement('div');
  bar.id = 'scroll-progress';
  Object.assign(bar.style, {
    position:   'fixed',
    top:        '0',
    left:       '0',
    height:     '2px',
    width:      '0%',
    background: 'var(--gold)',
    zIndex:     '9999',
    transition: 'width 0.1s linear',
    pointerEvents: 'none',
  });
  document.body.prepend(bar);

  window.addEventListener('scroll', () => {
    const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    const progress   = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
    bar.style.width  = progress.toFixed(2) + '%';
  }, { passive: true });
})();

/* ── NAVBAR: COMPACT ON SCROLL ──────────────────────────────────
   Adds .is-scrolled to <header class="navbar"> after 60px.
   CSS picks this up: shrink height, add stronger shadow.
────────────────────────────────────────────────────────────────── */
(function initNavbarShrink() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  // Inject companion styles once (avoids requiring CSS edits)
  const style = document.createElement('style');
  style.textContent = `
    .navbar { transition: box-shadow 0.3s ease, background 0.3s ease; }
    .navbar.is-scrolled {
      box-shadow: 0 4px 24px rgba(30,11,20,0.12);
      background: rgba(255,255,255,0.995);
    }
    .navbar.is-scrolled .navbar-inner { height: 60px; transition: height 0.3s ease; }
    .navbar-inner { transition: height 0.3s ease; }
  `;
  document.head.appendChild(style);

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        navbar.classList.toggle('is-scrolled', window.scrollY > 60);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();

/* ── MOBILE MENU ────────────────────────────────────────────────
   Open/close with keyboard, Escape, and outside-click support.
────────────────────────────────────────────────────────────────── */
(function initMobileMenu() {
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const closeBtn   = document.getElementById('mobileClose');
  if (!hamburger || !mobileMenu || !closeBtn) return;

  function openMenu() {
    mobileMenu.classList.add('is-open');
    hamburger.classList.add('is-active');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    // Stagger menu links in
    mobileMenu.querySelectorAll('a').forEach((link, i) => {
      link.style.opacity   = '0';
      link.style.transform = 'translateY(10px)';
      link.style.transition = `opacity 0.3s ease ${i * 0.06 + 0.1}s, transform 0.3s ease ${i * 0.06 + 0.1}s`;
      requestAnimationFrame(() => {
        link.style.opacity   = '1';
        link.style.transform = 'translateY(0)';
      });
    });
  }

  function closeMenu() {
    mobileMenu.classList.remove('is-open');
    hamburger.classList.remove('is-active');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', openMenu);
  closeBtn.addEventListener('click', closeMenu);

  mobileMenu.querySelectorAll('a').forEach(link =>
    link.addEventListener('click', closeMenu)
  );

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });

  // Close on outside click
  mobileMenu.addEventListener('click', e => {
    if (e.target === mobileMenu) closeMenu();
  });
})();

/* ── ACTIVE NAV LINK ON SCROLL ──────────────────────────────────
   Highlights the nav link matching the section currently in view.
────────────────────────────────────────────────────────────────── */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  let ticking = false;
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY + 120;
        let activeId  = null;

        sections.forEach(section => {
          if (scrollY >= section.offsetTop) {
            activeId = section.getAttribute('id');
          }
        });

        navLinks.forEach(a => {
          const matches = a.getAttribute('href') === `#${activeId}`;
          a.classList.toggle('active', matches);
        });

        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ── SCROLL TO TOP ──────────────────────────────────────────────── */
(function initScrollTop() {
  const btn = document.getElementById('scrollTopBtn');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ── STAGGERED SCROLL REVEAL ────────────────────────────────────
   Elements with .reveal animate in on intersection.
   Children inside .reveal-group stagger by index automatically.
────────────────────────────────────────────────────────────────── */
(function initReveal() {
  // Inject stagger delay vars via style
  const style = document.createElement('style');
  style.textContent = `
    .reveal {
      opacity: 0;
      transform: translateY(22px);
      transition: opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1),
                  transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .reveal.is-visible { opacity: 1; transform: translateY(0); }
  `;
  document.head.appendChild(style);

  const io = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const delay = el.dataset.delay || 0;
        el.style.transitionDelay = delay + 'ms';
        el.classList.add('is-visible');
        obs.unobserve(el);
      });
    },
    { threshold: 0.07, rootMargin: '0px 0px -40px 0px' }
  );

  // Auto-assign stagger delays to reveal elements inside grid/flex containers
  document.querySelectorAll(
    '.services-grid, .sectors-grid, .why-grid, .testi-grid, .vm-grid, .process-steps, .about-pillars, .about-metrics'
  ).forEach(parent => {
    parent.querySelectorAll('.reveal').forEach((child, i) => {
      child.dataset.delay = i * 80; // 80 ms per item
    });
  });

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();

/* ── ANIMATED NUMBER COUNTERS ───────────────────────────────────
   Any element with data-count="N" counts up from 0 → N on first
   intersection.  Supports optional data-suffix="+"  or "%".
   Uses an ease-out quad curve for a polished deceleration.
────────────────────────────────────────────────────────────────── */
(function initCounters() {
  const DURATION = 1800; // ms

  function easeOutQuad(t) { return t * (2 - t); }

  function animateCounter(el) {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
    const start = performance.now();

    function tick(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / DURATION, 1);
      const eased    = easeOutQuad(progress);
      const current  = target * eased;
      el.textContent = (decimals ? current.toFixed(decimals) : Math.round(current)) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  const io = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.5 }
  );

  document.querySelectorAll('[data-count]').forEach(el => io.observe(el));
})();

/* ── HERO PARALLAX (subtle) ─────────────────────────────────────
   Shifts the hero text container very slightly on mousemove for
   a premium depth feel. Capped at ±12px. Disabled on touch.
────────────────────────────────────────────────────────────────── */
(function initHeroParallax() {
  const hero  = document.querySelector('.hero');
  const inner = document.querySelector('.hero-inner');
  if (!hero || !inner) return;
  if (window.matchMedia('(pointer: coarse)').matches) return; // skip touch

  const MAX = 12;
  let rafId = null;

  hero.addEventListener('mousemove', e => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      const rect  = hero.getBoundingClientRect();
      const cx    = rect.left + rect.width  / 2;
      const cy    = rect.top  + rect.height / 2;
      const dx    = ((e.clientX - cx) / (rect.width  / 2)) * MAX;
      const dy    = ((e.clientY - cy) / (rect.height / 2)) * MAX;
      inner.style.transform = `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px)`;
      rafId = null;
    });
  });

  hero.addEventListener('mouseleave', () => {
    inner.style.transition = 'transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)';
    inner.style.transform  = 'translate(0, 0)';
    setTimeout(() => { inner.style.transition = ''; }, 800);
  });
})();

/* ── SERVICE CARD TILT (micro) ──────────────────────────────────
   Adds a very subtle 3-D tilt to service/why/vm cards on hover.
   Feels tactile without being gimmicky.
────────────────────────────────────────────────────────────────── */
(function initCardTilt() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const TILT = 4; // max degrees

  document.querySelectorAll('.service-card, .why-card, .vm-card, .testi-card').forEach(card => {
    card.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
    card.style.willChange = 'transform';

    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x    = (e.clientX - rect.left) / rect.width  - 0.5;
      const y    = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${(x * TILT).toFixed(2)}deg) rotateX(${(-y * TILT).toFixed(2)}deg) translateZ(4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg) translateZ(0)';
    });
  });
})();