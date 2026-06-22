/* KNB shared testimonials marquee — JS-driven cards, drag, hover-pause,
   speed-on-scroll, tilt, click->quote modal, proof count-up.
   Mirrors the home (#testiWall) implementation; runs on any page that
   includes the #testiWall markup + #tqModal. */
(function () {
  function init() {
    const root = document.getElementById('testiWall');
    if (!root) return;
    const PLAT = { shopify: 'Shopify', webflow: 'Webflow', wordpress: 'WordPress' };
    // NOTE: names below are illustrative placeholders paired with real KNB project brands.
    // Get written permission + a real quote from each client before launch (see handoff).
    const T = [
      { i: 'DC', q: 'Updates that used to take days now take minutes.', n: 'Daniel Cho', m: 'Light My Bricks', p: 'shopify', w: 0, f: 1 },
      { i: 'MP', q: 'Clear scope, clear pricing — and it finally loads fast on mobile.', n: 'Maya Patel', m: 'Feedbird', p: 'webflow', w: 1 },
      { i: 'SO', q: 'They understood what we needed before we could explain it.', n: "Sarah O'Neil", m: 'All Terrain Industries', p: 'wordpress', w: 0 },
      { i: 'RC', q: 'The handoff meant our team could take it from there.', n: 'Renato Cruz', m: 'Cacao Collective', p: 'shopify', w: 0 },
      { i: 'JD', q: 'Refreshingly simple from the first call to launch.', n: 'Julian Drew', m: 'Maestro Labs', p: 'webflow', w: 0 },
      { i: 'AR', q: 'Our new storefront is so much easier to shop.', n: 'Alana Reyes', m: 'Rise Outdoor', p: 'shopify', w: 1 },
      { i: 'KM', q: 'Exactly what we asked for, on time and on scope.', n: 'Kim Mendoza', m: 'Privvy Marketing', p: 'wordpress', w: 0 },
      { i: 'FB', q: 'Fast, communicative, and the result speaks for itself.', n: 'Faith Bautista', m: 'Teamtown', p: 'webflow', w: 1 }
    ];
    const card = (t, dup) => '<a class="talt-qc' + (t.w ? ' wide' : '') + (t.f ? ' feat' : '') + '" data-plat="' + t.p + '" data-idx="' + T.indexOf(t) + '" href="portfolio.html#work=' + t.p + '"' + (dup ? ' aria-hidden="true" tabindex="-1"' : '') + '>' +
      (t.f ? '<span class="talt-feat">★ Featured</span>' : '') +
      '<div class="talt-qc-top"><span class="talt-av sm">' + t.i + '</span><span class="talt-chip ' + t.p + '">' + PLAT[t.p] + '</span></div>' +
      '<div class="talt-stars" aria-hidden="true">★★★★★</div><blockquote>"' + t.q + '"</blockquote>' +
      '<figcaption>' + t.n + ' · ' + t.m + '</figcaption></a>';
    const rows = [...root.querySelectorAll('.talt-mq')];
    const data = [T.slice(0, 4), T.slice(4)];
    rows.forEach((row, ri) => {
      const track = row.querySelector('.talt-mq-track');
      const set = data[ri].map((t) => card(t)).join('');
      track.innerHTML = set + data[ri].map((t) => card(t, true)).join('');
      track.style.animation = 'none';
    });
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let dragging = false; // shared flag so tilt yields to a drag
    const states = rows.map((row) => {
      const track = row.querySelector('.talt-mq-track');
      const dir = parseFloat(row.dataset.dir) || -1;
      const st = { track, dir, half: track.scrollWidth / 2, x: dir < 0 ? 0 : -track.scrollWidth / 2, paused: reduce, dragging: false, lastX: 0, moved: 0, boost: 0 };
      const measure = () => { st.half = track.scrollWidth / 2; };
      window.addEventListener('resize', measure); window.addEventListener('load', measure);
      row.addEventListener('mouseenter', () => { if (!reduce) st.paused = true; });
      row.addEventListener('mouseleave', () => { if (!st.dragging && !reduce) st.paused = false; });
      row.addEventListener('pointerdown', (e) => { st.dragging = true; dragging = true; st.lastX = e.clientX; st.moved = 0; row.classList.add('grabbing'); });
      window.addEventListener('pointermove', (e) => { if (!st.dragging) return; const dx = e.clientX - st.lastX; st.lastX = e.clientX; st.x += dx; st.moved += Math.abs(dx); });
      window.addEventListener('pointerup', () => { if (!st.dragging) return; st.dragging = false; dragging = false; row.classList.remove('grabbing'); if (!reduce) st.paused = false; });
      return st;
    });
    const tick = () => {
      states.forEach((st) => {
        if (!st.paused && !st.dragging) st.x += st.dir * 0.45 * (1 + st.boost);
        if (st.half) { if (st.x <= -st.half) st.x += st.half; else if (st.x >= 0) st.x -= st.half; }
        st.track.style.transform = 'translateX(' + st.x + 'px)';
        st.boost *= 0.9;
      });
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    if (!reduce) window.addEventListener('scroll', () => { states.forEach((st) => { st.boost = 2.5; }); }, { passive: true });

    /* quote modal */
    const modal = document.getElementById('tqModal');
    const openModal = (t) => {
      if (!modal) return;
      const chip = modal.querySelector('#tqChip');
      chip.className = 'talt-chip ' + t.p; chip.textContent = PLAT[t.p];
      modal.querySelector('#tqQuote').textContent = '“' + t.q + '”';
      modal.querySelector('#tqAv').textContent = t.i;
      modal.querySelector('#tqAv').setAttribute('data-plat', t.p);
      modal.querySelector('#tqName').textContent = t.n;
      modal.querySelector('#tqMeta').textContent = ' · ' + t.m + ' · ' + PLAT[t.p];
      const link = modal.querySelector('#tqLink');
      link.href = 'portfolio.html#work=' + t.p;
      link.innerHTML = '<span class="dot"></span>See ' + PLAT[t.p] + ' work';
      modal.hidden = false; document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => modal.classList.add('show'));
    };
    const closeModal = () => {
      if (!modal) return;
      modal.classList.remove('show'); document.body.style.overflow = '';
      setTimeout(() => { modal.hidden = true; }, 240);
    };
    if (modal) {
      modal.querySelectorAll('[data-tqclose]').forEach((b) => b.addEventListener('click', closeModal));
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });
    }

    /* tilt + click wiring on every card */
    const tilt = function (e) {
      if (reduce || dragging) return;
      const r = this.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      this.style.transition = 'transform 0.08s linear';
      this.style.transform = 'perspective(720px) rotateX(' + (-py * 5).toFixed(2) + 'deg) rotateY(' + (px * 7).toFixed(2) + 'deg) scale(1.05)';
    };
    const untilt = function () { this.style.transition = 'transform 0.45s var(--ease)'; this.style.transform = ''; };
    root.querySelectorAll('.talt-qc').forEach((c) => {
      const idx = +c.dataset.idx;
      const ri = rows.indexOf(c.closest('.talt-mq'));
      c.addEventListener('mousemove', tilt);
      c.addEventListener('mouseleave', untilt);
      c.addEventListener('click', (e) => {
        const st = states[ri];
        if (st && st.moved > 6) { e.preventDefault(); return; } // was a drag
        e.preventDefault();
        openModal(T[idx]);
      });
    });

    /* count up the proof figures (4.9 / 18) on first view */
    const nums = root.querySelectorAll('.testi-proof [data-count]');
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target; const target = parseFloat(el.dataset.count); const dec = +(el.dataset.dec || 0);
        if (reduce || typeof gsap === 'undefined') { el.textContent = target.toFixed(dec); }
        else { gsap.to({ v: 0 }, { v: target, duration: 1.4, ease: 'power2.out', onUpdate() { el.textContent = this.targets()[0].v.toFixed(dec); } }); }
        obs.unobserve(el);
      });
    }, { threshold: 0.6 });
    nums.forEach((el) => io.observe(el));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
