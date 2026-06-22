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

    /* #10 mobile work strip — clone a few thumbnails into the fullscreen menu */
    const mob = document.getElementById('mobileMenu');
    const src = document.querySelector('.nm-thumbs');
    if (mob && src && !mob.querySelector('.mm-work')) {
      const strip = document.createElement('div');
      strip.className = 'mm-work';
      [...src.querySelectorAll('.nm-item')].slice(0, 5).forEach((t) => {
        const c = t.cloneNode(true);
        const th = c.querySelector('.nm-th'); if (th) th.classList.remove('is-loaded');
        strip.appendChild(c);
      });
      const anchor = mob.querySelector('.mm-plats') || mob.firstElementChild;
      if (anchor) anchor.insertAdjacentElement('afterend', strip);
    }

    /* #7 loading shimmer — reveal each screenshot once it loads (covers clones too) */
    document.querySelectorAll('.nm-th img').forEach((img) => {
      const th = img.closest('.nm-th');
      if (!th) return;
      const done = () => th.classList.add('is-loaded');
      if (img.complete && img.naturalWidth) done();
      else { img.addEventListener('load', done, { once: true }); img.addEventListener('error', done, { once: true }); }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
