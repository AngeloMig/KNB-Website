/* KNB nav mega-menu — click/touch toggle + keyboard a11y + thumbnail filters.
   Desktop hover is CSS; this adds click-to-open (touch/keyboard), Esc /
   outside-click close, aria-expanded, platform filters, a featured tile,
   active-page awareness, loading-state handling, and a mobile work strip. */
(function () {
  function init() {
    const items = document.querySelectorAll('.nav-item.nm');
    if (!items.length) return;
    // normalise to a bare page name so it matches whether URLs are "/shopify"
    // (clean) or "/shopify.html"
    const slug = (p) => (p || '').split('/').pop().toLowerCase().replace(/\.html$/, '') || 'index';
    const here = slug(location.pathname);

    items.forEach((item) => {
      const trigger = item.querySelector('.nm-trigger');
      if (!trigger) return;
      trigger.setAttribute('aria-expanded', 'false');
      let timer;
      const close = () => { clearTimeout(timer); item.classList.remove('open'); trigger.setAttribute('aria-expanded', 'false'); };
      const open = () => { clearTimeout(timer); item.classList.add('open'); trigger.setAttribute('aria-expanded', 'true'); };
      const delayedClose = () => { clearTimeout(timer); timer = setTimeout(close, 220); };
      if (window.matchMedia('(hover: hover)').matches) {
        item.addEventListener('mouseenter', open);
        item.addEventListener('mouseleave', delayedClose);
      }
      trigger.addEventListener('click', (e) => { e.preventDefault(); item.classList.contains('open') ? close() : open(); });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
      document.addEventListener('click', (e) => { if (!item.contains(e.target)) close(); });

      /* #9 active-page awareness — dark-pill the rail link for the current page,
         defaulting to "All work" when we're not on a platform page */
      const rail = [...item.querySelectorAll('.nm-side > a')];
      if (rail.length) {
        let active = rail.find((a) => slug(a.getAttribute('href')) === here);
        if (!active) active = rail[0];
        rail.forEach((a) => a.classList.toggle('nm-active', a === active));
      }

      /* platform filter chips -> show/hide thumbnails (uniform grid, no spotlight) */
      const tiles = [...item.querySelectorAll('.nm-thumbs .nm-item')];
      const chips = item.querySelectorAll('.nm-filters button');
      chips.forEach((chip) => {
        chip.addEventListener('click', (e) => {
          e.preventDefault();
          const f = chip.dataset.f;
          chips.forEach((c) => c.classList.toggle('on', c === chip));
          tiles.forEach((t) => t.classList.toggle('hide', f !== 'all' && t.dataset.plat !== f));
        });
      });
    });

    /* #7 loading shimmer — reveal each screenshot once it loads */
    document.querySelectorAll('.nm-th img').forEach((img) => {
      const th = img.closest('.nm-th');
      if (!th) return;
      const done = () => th.classList.add('is-loaded');
      if (img.complete && img.naturalWidth) done();
      else { img.addEventListener('load', done, { once: true }); img.addEventListener('error', done, { once: true }); }
    });

    /* ---- Mobile nav: bottom sheet (single source of truth; loads on every page) ----
       Burger opens a bottom sheet with Work/Packages accordions + CTA. Includes
       a11y state, robust body scroll lock (holds on iOS Safari), and drag-to-dismiss.
       (Replaces the old full-screen .mobile-menu; duplicates in main.js/work.js
       were already removed.) */
    const burger = document.getElementById('burger');
    const sheet = document.getElementById('mnavSheet');
    const scrim = document.getElementById('mnavScrim');
    if (burger && sheet && scrim && !burger.dataset.mmBound) {
      burger.dataset.mmBound = '1';
      const grab = document.getElementById('mnavGrab');
      const closeBtn = document.getElementById('mnavX');
      let savedY = 0;
      const isOpen = () => document.body.classList.contains('mnav-open');
      const setOpen = (open) => {
        burger.classList.toggle('open', open);
        document.body.classList.toggle('mnav-open', open);
        burger.setAttribute('aria-expanded', String(open));
        burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        sheet.setAttribute('aria-hidden', String(!open));
        sheet.style.transform = ''; // clear any drag offset
        if (open) {
          savedY = window.scrollY || window.pageYOffset || 0;
          document.documentElement.classList.add('menu-open');
          document.body.classList.add('menu-open');
          document.body.style.top = -savedY + 'px';
        } else {
          document.documentElement.classList.remove('menu-open');
          document.body.classList.remove('menu-open');
          document.body.style.top = '';
          window.scrollTo(0, savedY);
        }
      };
      burger.addEventListener('click', () => setOpen(!isOpen()));
      scrim.addEventListener('click', () => setOpen(false));
      if (closeBtn) closeBtn.addEventListener('click', () => setOpen(false));
      sheet.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && isOpen()) setOpen(false); });

      /* Work / Packages accordions */
      sheet.querySelectorAll('[data-mnav-acc]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const acc = document.getElementById(btn.getAttribute('aria-controls'));
          if (!acc) return;
          const open = acc.classList.toggle('open');
          btn.setAttribute('aria-expanded', String(open));
        });
      });

      /* drag the grab handle down to dismiss */
      if (grab && window.PointerEvent) {
        let startY = 0, dy = 0, dragging = false;
        grab.addEventListener('pointerdown', (e) => {
          dragging = true; startY = e.clientY; dy = 0;
          sheet.classList.add('mnav-dragging');
          try { grab.setPointerCapture(e.pointerId); } catch (err) {}
        });
        grab.addEventListener('pointermove', (e) => {
          if (!dragging) return;
          dy = Math.max(0, e.clientY - startY);
          sheet.style.transform = 'translateY(' + dy + 'px)';
        });
        const end = () => {
          if (!dragging) return;
          dragging = false; sheet.classList.remove('mnav-dragging');
          if (dy > 110) setOpen(false); else sheet.style.transform = '';
          dy = 0;
        };
        grab.addEventListener('pointerup', end);
        grab.addEventListener('pointercancel', end);
      }
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
