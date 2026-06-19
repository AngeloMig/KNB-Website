/* ===== KNB shared JS for Portfolio + work pages ===== */
(function () {
  // nav scroll background
  const nav = document.getElementById('nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll); onScroll();
  }

  // mobile menu
  const burger = document.getElementById('burger');
  const menu = document.getElementById('mobileMenu');
  if (burger && menu) {
    burger.addEventListener('click', () => { burger.classList.toggle('open'); menu.classList.toggle('open'); });
    menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => { burger.classList.remove('open'); menu.classList.remove('open'); }));
  }

  // scroll reveal
  const els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && els.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.15 });
    els.forEach((el, i) => { el.style.transitionDelay = (Math.min(i, 6) * 0.05) + 's'; io.observe(el); });
  } else {
    els.forEach((el) => el.classList.add('in'));
  }

  // stat count-up
  const counters = document.querySelectorAll('[data-count]');
  const animateCount = (el) => {
    const target = parseFloat(el.dataset.count) || 0;
    const suffix = el.dataset.suffix || '';
    const dur = 1200, start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if (counters.length && 'IntersectionObserver' in window) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { animateCount(e.target); cio.unobserve(e.target); } });
    }, { threshold: 0.5 });
    counters.forEach((c) => cio.observe(c));
  } else {
    counters.forEach((c) => { c.textContent = (c.dataset.count || '') + (c.dataset.suffix || ''); });
  }

  // project filter tabs
  const filters = document.querySelectorAll('.proj-filter');
  const grid = document.querySelector('.pf-grid');
  const filterStatus = document.getElementById('filterStatus');
  const FILTER_LABELS = { all: 'all', shopify: 'Shopify', webflow: 'Webflow', wordpress: 'WordPress' };
  if (filters.length && grid) {
    filters.forEach((btn) => btn.addEventListener('click', () => {
      const f = btn.dataset.filter;
      filters.forEach((b) => {
        const on = b === btn;
        b.classList.toggle('active', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      grid.classList.toggle('is-filtering', f !== 'all');
      grid.querySelectorAll('.proj-card').forEach((card) => {
        card.hidden = !(f === 'all' || card.dataset.plat === f);
      });
      if (filterStatus) {
        const visible = grid.querySelectorAll('.proj-card:not([hidden])').length;
        filterStatus.textContent = f === 'all'
          ? `Showing all ${visible} projects.`
          : `Showing ${visible} ${FILTER_LABELS[f]} projects.`;
      }
    }));
  }

  // before / after comparison slider
  const ba = document.getElementById('ba');
  if (ba) {
    const handle = ba.querySelector('.ba-handle');
    const syncWidth = () => ba.style.setProperty('--baw', ba.offsetWidth + 'px');
    const setSplit = (clientX) => {
      const rect = ba.getBoundingClientRect();
      const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
      ba.style.setProperty('--split', pct + '%');
      if (handle) handle.setAttribute('aria-valuenow', Math.round(pct));
    };
    const getX = (e) => (e.touches && e.touches[0] ? e.touches[0].clientX : e.clientX);
    let dragging = false;
    const start = (e) => { dragging = true; setSplit(getX(e)); };
    const move = (e) => { if (dragging) setSplit(getX(e)); };
    const end = () => { dragging = false; };
    ba.addEventListener('mousedown', start);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);
    ba.addEventListener('touchstart', start, { passive: true });
    window.addEventListener('touchmove', move, { passive: true });
    window.addEventListener('touchend', end);
    handle.addEventListener('keydown', (e) => {
      const cur = parseFloat(getComputedStyle(ba).getPropertyValue('--split')) || 50;
      let next = null;
      if (e.key === 'ArrowLeft') next = Math.max(0, cur - 4);
      if (e.key === 'ArrowRight') next = Math.min(100, cur + 4);
      if (next !== null) {
        e.preventDefault();
        ba.style.setProperty('--split', next + '%');
        handle.setAttribute('aria-valuenow', Math.round(next));
      }
    });
    syncWidth();
    window.addEventListener('resize', syncWidth);
  }
})();
