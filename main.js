gsap.registerPlugin(ScrollTrigger);

    /* ---- Hero floating dust particles (drift up + parallax depth + cursor) ---- */
    (function () {
      const canvas = document.getElementById('heroParticles');
      if (!canvas || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const ctx = canvas.getContext('2d');
      const hero = canvas.parentElement;
      const DPR = Math.min(window.devicePixelRatio || 1, 2);
      let w = 0, h = 0, particles = [], mx = 0, my = 0, rafId;

      // pink-forward palette (pink weighted, plus a few neutrals/accents)
      const palette = [
        '232,63,160', '232,63,160', '232,63,160',  // pink (weighted)
        '17,17,16',                                  // neutral ink
        '96,132,255', '39,196,153', '255,168,84'     // blue / teal / amber accents
      ];
      const spawn = (anywhere) => {
        const depth = Math.random();                 // 0 = far/slow/faint, 1 = near/fast/bold
        return {
          x: Math.random() * w,
          y: anywhere ? Math.random() * h : h + 12,
          r: 0.6 + depth * 2.2,
          vy: 0.15 + depth * 0.65,
          drift: (Math.random() - 0.5) * 0.3,
          alpha: 0.10 + depth * 0.34,
          rgb: palette[Math.floor(Math.random() * palette.length)],
          depth
        };
      };

      function resize() {
        w = hero.clientWidth; h = hero.clientHeight;
        canvas.width = w * DPR; canvas.height = h * DPR;
        canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        const count = Math.round(Math.min(75, w / 18));
        particles = Array.from({ length: count }, () => spawn(true));
      }

      function tick() {
        ctx.clearRect(0, 0, w, h);
        for (const p of particles) {
          p.y -= p.vy;
          p.x += p.drift;
          if (p.y < -12) Object.assign(p, spawn(false));
          const px = p.x + mx * p.depth * 28;        // nearer particles react more to cursor
          const py = p.y + my * p.depth * 16;
          ctx.beginPath();
          ctx.arc(px, py, p.r, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(' + p.rgb + ',' + p.alpha + ')';
          ctx.fill();
        }
        rafId = requestAnimationFrame(tick);
      }

      hero.addEventListener('mousemove', (e) => {
        const r = hero.getBoundingClientRect();
        mx = (e.clientX - r.left) / r.width - 0.5;
        my = (e.clientY - r.top) / r.height - 0.5;
      });
      hero.addEventListener('mouseleave', () => { mx = 0; my = 0; });
      let rt;
      window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 200); });

      // decorative — start after the browser is idle so it doesn't compete with first paint / LCP
      const start = () => { resize(); cancelAnimationFrame(rafId); tick(); };
      if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 900 });
      else setTimeout(start, 250);
    })();

    /* ---- Hero grid cursor spotlight (#4) ---- */
    (function () {
      const spot = document.getElementById('gridSpot');
      const heroEl = document.querySelector('.hero');
      if (!spot || !heroEl || matchMedia('(hover: none)').matches) return;
      heroEl.addEventListener('mousemove', (e) => {
        const r = heroEl.getBoundingClientRect();
        spot.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        spot.style.setProperty('--my', (e.clientY - r.top) + 'px');
        spot.classList.add('active');
      });
      heroEl.addEventListener('mouseleave', () => spot.classList.remove('active'));
    })();

    /* ---- Magnetic buttons (pull toward cursor + scale) ---- */
    if (!matchMedia('(hover: none)').matches) {
      document.querySelectorAll('.btn, .nav-cta, .btn-ghost').forEach((btn) => {
        // Buttons inside a card are full-width, so use a gentler pull and clamp
        // the travel to keep them within the card's padding.
        const inCard = !!btn.closest('.plan');
        const strength = inCard ? 0.18 : 0.32;
        const maxMove = inCard ? 8 : 60;
        const hoverScale = inCard ? 1.03 : 1.05;
        const clamp = (v) => Math.max(-maxMove, Math.min(maxMove, v));
        // Drive x, y AND scale through persistent quickTo tweens. These are
        // reusable and never kill one another, so the magnetic effect keeps
        // working on every hover — and it won't clash with the reveal tween
        // that some buttons (e.g. in .services) run on their y transform.
        const xTo = gsap.quickTo(btn, 'x', { duration: 0.5, ease: 'power3' });
        const yTo = gsap.quickTo(btn, 'y', { duration: 0.5, ease: 'power3' });
        const sTo = gsap.quickTo(btn, 'scale', { duration: 0.45, ease: 'power3' });
        btn.addEventListener('mouseenter', () => sTo(hoverScale));
        btn.addEventListener('mousemove', (e) => {
          const r = btn.getBoundingClientRect();
          xTo(clamp((e.clientX - (r.left + r.width / 2)) * strength));
          yTo(clamp((e.clientY - (r.top + r.height / 2)) * strength));
        });
        btn.addEventListener('mouseleave', () => {
          xTo(0); yTo(0); sTo(1);
        });
      });
    }

    /* ---- NAV scroll bg ---- */
    const nav = document.getElementById('nav');
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll); onScroll();

    /* ---- Mobile menu ---- */
    const burger = document.getElementById('burger');
    const menu = document.getElementById('mobileMenu');
    burger.addEventListener('click', () => {
      burger.classList.toggle('open');
      menu.classList.toggle('open');
    });
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      burger.classList.remove('open'); menu.classList.remove('open');
    }));

    /* ---- Hero polaroids: centered fanned stack, load-in + parallax ---- */
    const isMobile = window.innerWidth <= 860;
    // base resting position per id: x offset from centre, rotation
    const layout = { p3: { x: -370, rot: -3 }, p1: { x: 0, rot: 0 }, p2: { x: 370, rot: 3 } };
    if (!isMobile) {
      const cards = {};
      Object.entries(layout).forEach(([id, { x, rot }]) => {
        const el = document.querySelector('.' + id);
        cards[id] = el;
        gsap.set(el, { xPercent: -50, x: x, rotation: rot, transformOrigin: '50% 100%' });
        // load-in: centre card appears first, then the side cards spread outward from it
        gsap.from(el, {
          x: 0, scale: 0.88, autoAlpha: 0, rotation: 0,
          duration: 1.0, ease: 'back.out(1.3)', delay: id === 'p1' ? 0.2 : 0.5
        });
        // subtle scroll parallax (separate tween so it won't fight the base transform)
        // p3 (left/first card) opts out — no scroll parallax on it
        if (id !== 'p3') {
          gsap.to(el, {
            y: (rot < 0 ? -1 : 1) * 26 + (id === 'p1' ? -34 : 0),
            ease: 'none',
            scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 }
          });
        }
      });

      /* ---- Idle: float + tilt + dynamic shadow on the inner card (floating-on-water) ---- */
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const idle = {
          p3: { amp: -6, tilt:  2.2, dur: 3.4, delay: 0.0 },
          p1: { amp: -9, tilt:  1.6, dur: 3.0, delay: 0.4 },
          p2: { amp: -7, tilt: -2.4, dur: 3.7, delay: 0.2 }
        };
        gsap.delayedCall(1.4, () => {
          Object.entries(idle).forEach(([id, { amp, tilt, dur, delay }]) => {
            const inner = cards[id].querySelector('.polaroid');
            // float up / down (yPercent — composes with outer y parallax + hover lift)
            gsap.to(inner, { yPercent: amp, duration: dur, delay, ease: 'sine.inOut', repeat: -1, yoyo: true });
            // gentle tilt sway, slower & offset so it never syncs with the bob
            gsap.to(inner, { rotation: tilt, duration: dur * 1.35, delay: delay + 0.5, ease: 'sine.inOut', repeat: -1, yoyo: true });
          });
        });
      }

      /* ---- Hover: hovered card grows, jumps to the front ---- */
      const stack = document.querySelector('.hero-photos');
      Object.keys(cards).forEach(id => {
        const el = cards[id];
        const inner = el.querySelector('.polaroid');
        el.addEventListener('mouseenter', () => {
          stack.style.zIndex = 50;         // lift the whole stack above the headline (but below the nav)
          el.style.zIndex = 99999;         // hovered card on top within the stack
          gsap.to(el, { scale: 1.12, y: -16, duration: 0.45, ease: 'power3.out', overwrite: 'auto' });
        });
        el.addEventListener('mouseleave', () => {
          stack.style.zIndex = '';         // restore stack below the headline
          el.style.zIndex = '';            // restore natural stacking
          gsap.to(el, { scale: 1, y: 0, duration: 0.5, ease: 'power3.out', overwrite: 'auto' });
        });
        // cursor-reactive sheen — light follows the pointer across the card
        el.addEventListener('mousemove', (e) => {
          const r = inner.getBoundingClientRect();
          inner.style.setProperty('--sx', ((e.clientX - r.left) / r.width * 100) + '%');
          inner.style.setProperty('--sy', ((e.clientY - r.top) / r.height * 100) + '%');
        });
      });

      /* ---- Cursor parallax: the whole stack drifts toward the pointer ---- */
      const heroEl = document.querySelector('.hero');
      const xTo = gsap.quickTo(stack, 'x', { duration: 0.7, ease: 'power3' });
      const yTo = gsap.quickTo(stack, 'y', { duration: 0.7, ease: 'power3' });
      heroEl.addEventListener('mousemove', (e) => {
        const r = heroEl.getBoundingClientRect();
        const dx = (e.clientX - r.left) / r.width - 0.5;
        const dy = (e.clientY - r.top) / r.height - 0.5;
        xTo(dx * 34);
        yTo(dy * 22);
      });
      heroEl.addEventListener('mouseleave', () => { xTo(0); yTo(0); });

    }

    /* ---- Headline: split into letters → load reveal + cursor-reactive lift (#5) ---- */
    (function () {
      const title = document.getElementById('heroTitle');
      if (!title) return;
      // The H1 is the LCP element: skip the JS split entirely for reduced-motion users
      // (plain text paints instantly), and never gate first paint on the reveal.
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      requestAnimationFrame(function build() {
      const text = title.textContent;
      title.textContent = '';
      const letters = [];
      [...text].forEach((ch) => {
        // keep spaces as real text nodes so the headline wraps between words on mobile
        // (a chain of inline-block letter spans never breaks -> can overflow narrow screens)
        if (ch === ' ') { title.appendChild(document.createTextNode(' ')); return; }
        const s = document.createElement('span');
        s.className = 'hch';
        s.textContent = ch === ' ' ? ' ' : ch;
        title.appendChild(s);
        letters.push(s);
      });

      // load reveal — letters rise + fade in, staggered (uses yPercent so cursor can own y)
      gsap.from(letters, {
        yPercent: 120, autoAlpha: 0, duration: 0.85, ease: 'power4.out', stagger: 0.035
      });

      // cursor-reactive — letters lift / scale toward the pointer
      if (!matchMedia('(hover: none)').matches) {
        const heroEl = document.querySelector('.hero');
        const yqt = letters.map((s) => gsap.quickTo(s, 'y', { duration: 0.45, ease: 'power3' }));
        const sqt = letters.map((s) => gsap.quickTo(s, 'scale', { duration: 0.45, ease: 'power3' }));
        const MAX = 150;
        heroEl.addEventListener('mousemove', (e) => {
          letters.forEach((s, i) => {
            const r = s.getBoundingClientRect();
            const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
            const f = Math.max(0, 1 - Math.hypot(e.clientX - cx, e.clientY - cy) / MAX);
            yqt[i](-f * 22);
            sqt[i](1 + f * 0.16);
          });
        });
        heroEl.addEventListener('mouseleave', () => {
          letters.forEach((_, i) => { yqt[i](0); sqt[i](1); });
        });
      }
      });
    })();

    /* ---- Hero rotating service word (#4) ---- */
    (function () {
      const rot = document.getElementById('heroRotator');
      if (!rot) return;
      const word = rot.querySelector('.rot-word');
      if (!word) return;
      const words = ['Shopify stores', 'Webflow sites', 'WooCommerce shops', 'custom web apps'];
      let i = 0;
      setInterval(() => {
        word.classList.add('out');
        setTimeout(() => {
          i = (i + 1) % words.length;
          word.textContent = words[i];
          word.classList.remove('out');
        }, 320);
      }, 2600);
    })();

    /* ---- Hero reveals play on LOAD ---- */
    // The hero foot (lead + CTAs + email) sits at the bottom of the 100vh hero, below the
    // generic 'top 80%' scroll-trigger — so a scroll-reveal would keep it hidden until you scroll.
    gsap.to('.hero .reveal', { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', stagger: 0.08, delay: 0.1 });

    /* ---- Generic reveal-up (skips sections with their own animation) ---- */
    const customSel = '.process, .plans, .maint, .why, .faq, .projects, .hero';
    gsap.utils.toArray('.reveal').forEach(el => {
      if (el.closest(customSel)) return;
      gsap.to(el, {
        y: 0, opacity: 1, duration: 0.85, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 80%' }
      });
    });
    // grouped staggers for service rows + stats
    [['.srv-row', 0.12], ['.stat', 0.12]].forEach(([sel, st]) => {
      gsap.to(gsap.utils.toArray(sel), {
        y: 0, opacity: 1, duration: 0.85, ease: 'power3.out', stagger: st,
        scrollTrigger: { trigger: sel, start: 'top 82%' }
      });
    });

    /* ---- Distinct scroll-in animation per section ---- */
    const once = (trigger) => ({ trigger, start: 'top 78%', once: true });

    // PROCESS — heading slides in; the steps flow in left→right tied to scroll
    gsap.set('.process .sec-head', { opacity: 0, x: -55, y: 0 });
    ScrollTrigger.create({ ...once('.process'),
      onEnter: () => gsap.to('.process .sec-head', { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' }) });
    gsap.set('.process .step', { opacity: 0, x: -90, y: 0 });
    gsap.to('.process .step', {
      opacity: 1, x: 0, ease: 'none', stagger: 0.4,
      scrollTrigger: { trigger: '.process', start: 'top 82%', end: 'center 48%', scrub: 0.6 }
    });
    // big "PROCESS" watermark drifts left → right as you scroll through the section
    gsap.fromTo('.process-wm', { x: -180 }, {
      x: 180, ease: 'none',
      scrollTrigger: { trigger: '.process', start: 'top bottom', end: 'bottom top', scrub: true }
    });

    // PROJECTS — scale / pop in
    gsap.set('.projects .reveal', { opacity: 0, scale: 0.9, y: 40 });
    ScrollTrigger.create({ ...once('.projects'),
      onEnter: () => gsap.to('.projects .reveal', { opacity: 1, scale: 1, y: 0, duration: 0.7, ease: 'back.out(1.4)', stagger: 0.1 }) });

    // PLANS / Solutions — #7 choreographed: heading → toggle → cards stagger → aside slides in
    gsap.set('.plans .sec-head, .plans .solu-toggle', { opacity: 0, y: 30 });
    gsap.set('.plans .sol-item', { opacity: 0, y: 22 });
    gsap.set('.plans .sol-aside', { opacity: 0, x: 36 });
    ScrollTrigger.create({ ...once('.plans'), onEnter: () => {
      gsap.to('.plans .sec-head, .plans .solu-toggle', { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.08 });
      gsap.to('.plans .sol-item', { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.06, delay: 0.15 });
      gsap.to('.plans .sol-aside', { opacity: 1, x: 0, duration: 0.7, ease: 'power3.out', delay: 0.3 });
    } });

    // Solutions toggle (Website projects / Care plans) — sliding indicator + bg re-bloom
    (function () {
      const toggle = document.querySelector('.solu-toggle');
      const tabs = [...document.querySelectorAll('.solu-tab')];
      const panels = [...document.querySelectorAll('.solu-panel')];
      if (!tabs.length) return;
      const ind = toggle && toggle.querySelector('.solu-ind');
      const plans = document.querySelector('.plans');
      const moveInd = (tab) => { if (ind && tab) { ind.style.width = tab.offsetWidth + 'px'; ind.style.transform = 'translateX(' + tab.offsetLeft + 'px)'; } };
      const activate = (t) => {
        tabs.forEach((x) => { const on = x === t; x.classList.toggle('active', on); x.setAttribute('aria-selected', on ? 'true' : 'false'); });
        panels.forEach((p) => p.classList.toggle('on', p.dataset.soluPanel === t.dataset.solu));
        moveInd(t);
        if (plans) { plans.classList.remove('bloom'); void plans.offsetWidth; plans.classList.add('bloom'); } // #9 re-bloom (existing keyframe)
      };
      tabs.forEach((t) => t.addEventListener('click', () => activate(t)));
      const initInd = () => moveInd(tabs.find((t) => t.classList.contains('active')) || tabs[0]);
      initInd();
      if (toggle) toggle.classList.add('ready');
      window.addEventListener('load', initInd);
      window.addEventListener('resize', initInd);
    })();

    // Solutions: hover (or focus) a plan → animate its details into the right aside
    (function () {
      const FACT = {
        'Starter Website': '~1–2 weeks', 'Business Website': '~2–4 weeks', 'Ecommerce Website': '~3–5 weeks', 'Custom Web App': 'Scoped per project',
        'Basic Care': 'Monthly retainer', 'Standard Support': 'Monthly retainer', 'Growth Support': 'Rollover included', 'Premium Support': 'Rollover included', 'Custom System Support': 'Tailored coverage'
      };
      document.querySelectorAll('.solu-panel').forEach((panel) => {
        const aside = panel.querySelector('.sol-aside');
        const items = [...panel.querySelectorAll('.sol-item')];
        if (!aside || !items.length) return;
        const nameEl = aside.querySelector('[data-aside="name"]');
        const descEl = aside.querySelector('[data-aside="desc"]');
        const factEl = aside.querySelector('[data-aside="fact"]');
        const tagsEl = aside.querySelector('[data-aside="tags"]');
        const link = aside.querySelector('.sol-aside-cta .btn-ghost');
        const show = (item) => {
          items.forEach((x) => x.classList.toggle('active', x === item));
          const nm = item.querySelector('.sol-name').textContent;
          aside.classList.add('swapping'); // #3 fade content out before swapping
          if (nameEl) nameEl.textContent = nm;
          if (descEl) descEl.textContent = item.dataset.desc || '';
          if (factEl) { factEl.textContent = FACT[nm] || ''; factEl.parentElement.hidden = !FACT[nm]; } // #10
          if (tagsEl) tagsEl.innerHTML = (item.dataset.feats || '').split('|').filter(Boolean).map((t) => '<span>' + t + '</span>').join(''); // #4 chips re-animate
          if (link) link.setAttribute('href', item.getAttribute('href')); // deep-link to this plan on pricing.html
          requestAnimationFrame(() => requestAnimationFrame(() => aside.classList.remove('swapping')));
        };
        items.forEach((item) => {
          item.addEventListener('mouseenter', () => show(item));
          item.addEventListener('focus', () => show(item));
        });
        show(items[0]);
      });
    })();

    // Testimonials marquee — JS-driven: cards from data, auto-scroll, drag, hover-pause, speed-on-scroll
    // + tilt (#4), hover-focus (#1, CSS), click→quote modal (#10), proof count-up (#3), featured card (#8)
    (function () {
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

      /* #10 — quote modal */
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

      /* #4 tilt + #10 click wiring on every card */
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

      /* #3 — count up the proof figures (4.9 / 18) on first view */
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
    })();

    // WHY KNB — rise up + icons spin in
    gsap.set('.why .reveal', { opacity: 0, y: 44 });
    gsap.set('.why .wp-ic', { scale: 0, rotation: -90 });
    ScrollTrigger.create({ ...once('.why'), onEnter: () => {
      gsap.to('.why .reveal', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.12 });
      gsap.to('.why .wp-ic', { scale: 1, rotation: 0, duration: 0.7, ease: 'back.out(2)', stagger: 0.12, delay: 0.2 });
    } });

    // FAQ — slide up from below
    gsap.set('.faq .reveal, .faq .faq-item', { opacity: 0, y: 50 });
    ScrollTrigger.create({ ...once('.faq'),
      onEnter: () => gsap.to('.faq .reveal, .faq .faq-item', { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.08 }) });

    /* ---- Count-up stats ---- */
    gsap.utils.toArray('.count').forEach(el => {
      const target = +el.dataset.target;
      ScrollTrigger.create({
        trigger: el, start: 'top 85%', once: true,
        onEnter: () => {
          gsap.to({ v: 0 }, {
            v: target, duration: 1.6, ease: 'power2.out',
            onUpdate() { el.textContent = Math.round(this.targets()[0].v); }
          });
        }
      });
    });

    /* ---- Infinite marquees (seamless, directional) ---- */
    function loopMarquee(track, duration, dir) {
      // duplicate content for seamless wrap
      track.innerHTML += track.innerHTML;
      const half = track.scrollWidth / 2;
      const from = dir === 'right' ? -half : 0;
      const to = dir === 'right' ? 0 : -half;
      return gsap.fromTo(track, { x: from }, { x: to, duration, ease: 'none', repeat: -1 });
    }
    // two opposing rows + hover to pause
    const mqRow1 = loopMarquee(document.getElementById('marquee1'), 22, 'left');
    const mqRow2 = loopMarquee(document.getElementById('marquee2'), 24, 'right');
    [['marquee1', mqRow1], ['marquee2', mqRow2]].forEach(([id, tw]) => {
      const row = document.getElementById(id).closest('.marquee-row');
      row.addEventListener('mouseenter', () => tw.pause());
      row.addEventListener('mouseleave', () => tw.resume());
    });

    /* ---- Logo wall marquee ---- */
    const logoNames = ['NORTHPEAK','VELORA','SUNBRO','KINFOLK','AQUARI','BLOOMR','EVERLY','PIVOTL','MANGO+','TIDEUP'];
    const logoTrack = document.getElementById('logoTrack');
    logoTrack.innerHTML = logoNames.map(n => `<div class="logo-item">${n}</div>`).join('');
    loopMarquee(logoTrack, 28);

    /* ---- (old testimonials slider removed — replaced by the marquee testimonials section) ---- */

    /* ---- Services intro: words fill grey → black on scroll ---- */
    (function () {
      const intro = document.querySelector('.services .intro');
      if (!intro) return;
      const text = intro.textContent.replace(/\s+/g, ' ').trim();
      intro.innerHTML = '';
      const words = text.split(' ').map((w) => {
        const s = document.createElement('span');
        s.className = 'iw';
        s.textContent = w;
        intro.appendChild(s);
        intro.appendChild(document.createTextNode(' '));
        return s;
      });
      gsap.set(words, { color: '#b7b5ad' });
      gsap.to(words, {
        color: '#111110', ease: 'none', stagger: 0.5,
        scrollTrigger: { trigger: '.services .intro', start: 'top 78%', end: 'top 38%', scrub: 0.5 }
      });
    })();

    /* ---- Process chevrons: full-width band, pop wave flows left → right ---- */
    (function () {
      const wrap = document.getElementById('procArrows');
      if (!wrap) return;
      const chev = '<svg viewBox="0 0 11 18"><path d="M1.5 1.5 L9 9 L1.5 16.5"/></svg>';
      const build = () => {
        const n = Math.max(10, Math.floor(window.innerWidth / 46));
        wrap.innerHTML = Array.from({ length: n }, (_, i) =>
          chev.replace('<svg', `<svg style="animation-delay:${(i * 0.075).toFixed(3)}s"`)).join('');
      };
      build();
      let t; window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(build, 200); });
    })();

    /* ---- Projects: unified filter (platform + goal + clickable chips + count + #work= hash) ---- */
    (function () {
      const grid = document.querySelector('.pj-grid');
      if (!grid) return;
      const filters = [...document.querySelectorAll('.proj-filter')];
      const cards = [...document.querySelectorAll('.pj-card')];
      const status = document.querySelector('.proj-status');
      const empty = document.querySelector('.pj-empty');
      const total = cards.length;
      const tokensOf = (c) => (c.dataset.tags || c.dataset.plat || '').split(/\s+/);

      function apply(key, push) {
        key = key || 'all';
        let n = 0;
        cards.forEach((c) => {
          const match = key === 'all' || tokensOf(c).includes(key);
          c.hidden = !match;
          if (match) n++;
        });
        const owned = filters.some((f) => f.dataset.filter === key);
        filters.forEach((f) => f.classList.toggle('active', f.dataset.filter === (owned ? key : 'all')));
        if (status) status.innerHTML = '<span>' + n + '</span> of ' + total + ' highlights shown';
        if (empty) empty.hidden = n !== 0;
        if (push) history.replaceState(null, '', key === 'all' ? location.pathname + location.search : '#work=' + key);
      }

      filters.forEach((f) => f.addEventListener('click', () => apply(f.dataset.filter, true)));
      document.querySelectorAll('button.pj-chip[data-filter]').forEach((chip) => {
        chip.addEventListener('click', (e) => {
          e.stopPropagation();
          apply(chip.dataset.filter, true);
          const ctrls = document.querySelector('.proj-controls');
          if (ctrls) ctrls.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
      });
      const reset = document.querySelector('.pj-reset');
      if (reset) reset.addEventListener('click', () => apply('all', true));

      const m = /#work=([\w-]+)/.exec(location.hash);
      if (m) apply(m[1], false);
    })();

    /* ---- Projects: count-ups (header + stat band) ---- */
    (function () {
      document.querySelectorAll('.projects [data-count]').forEach((el) => {
        const target = +el.dataset.count;
        ScrollTrigger.create({
          trigger: el, start: 'top 92%', once: true,
          onEnter: () => gsap.to({ v: 0 }, { v: target, duration: 1.4, ease: 'power2.out', onUpdate() { el.textContent = Math.round(this.targets()[0].v); } })
        });
      });
    })();

    /* ---- Projects: real screenshots (#1) via WordPress mShots + shimmer blur-up (#8) ---- */
    (function () {
      const imgs = document.querySelectorAll('.pj-img');
      imgs.forEach((img) => {
        const shot = img.dataset.shot;
        const fallback = img.dataset.fallback;
        const done = () => { const s = img.closest('.pj-shot'); if (s) s.classList.add('is-loaded'); };
        img.addEventListener('load', done);
        img.addEventListener('error', () => {
          if (fallback && img.src !== fallback) img.src = fallback; // mShots offline/blocked -> placeholder
          else done();
        });
        img.src = shot ? 'https://s.wp.com/mshots/v1/' + encodeURIComponent(shot) + '?w=1200' : (fallback || '');
      });
    })();

    /* ---- Projects: detail modal (#6) + live preview (#2) ---- */
    (function () {
      const modal = document.getElementById('pjModal');
      if (!modal) return;
      const byId = (id) => document.getElementById(id);
      const imgEl = byId('pjmImg'), frameEl = byId('pjmFrame');
      const shotWrap = modal.querySelector('.pjm-shotwrap');
      const liveWrap = modal.querySelector('.pjm-livewrap');
      const tabs = [...modal.querySelectorAll('.pjm-tab')];
      let lastFocus = null;

      function setView(view) {
        tabs.forEach((t) => t.classList.toggle('active', t.dataset.view === view));
        const live = view === 'live';
        liveWrap.hidden = !live;
        shotWrap.hidden = live;
        if (live && !frameEl.getAttribute('src') && frameEl.dataset.url) frameEl.src = frameEl.dataset.url;
      }

      function open(card) {
        const d = card.dataset;
        byId('pjmTitle').textContent = d.title || '';
        byId('pjmScope').textContent = d.scope || '';
        byId('pjmPlat').textContent = d.plain || '';
        byId('pjmUrl').textContent = (d.url || '').replace(/^https?:\/\//, '').replace(/\/$/, '');
        const shotImg = card.querySelector('.pj-img');
        imgEl.src = (shotImg && (shotImg.currentSrc || shotImg.src)) || '';
        imgEl.alt = d.title || '';
        byId('pjmLive').href = d.url || '#';
        byId('pjmOpen').href = d.url || '#';
        frameEl.dataset.url = d.url || '';
        frameEl.removeAttribute('src');
        const caseBtn = byId('pjmCase');
        if (d.case) { caseBtn.href = d.case; caseBtn.hidden = false; } else { caseBtn.hidden = true; }
        const tagWrap = byId('pjmTags'); tagWrap.innerHTML = '';
        card.querySelectorAll('.pj-tags .pj-chip').forEach((c) => {
          const s = document.createElement('span');
          s.className = c.className.replace(/\bproj-filter\b/, '').trim();
          s.textContent = c.textContent;
          tagWrap.appendChild(s);
        });
        modal.querySelector('.pjm-dialog').style.setProperty('--pa', (getComputedStyle(card).getPropertyValue('--pa') || '').trim());
        setView('shot');
        lastFocus = document.activeElement;
        modal.hidden = false;
        document.body.style.overflow = 'hidden';
        modal.querySelector('.pjm-x').focus();
      }
      function close() {
        modal.hidden = true;
        document.body.style.overflow = '';
        frameEl.removeAttribute('src');
        if (lastFocus && lastFocus.focus) lastFocus.focus();
      }

      document.querySelectorAll('.pj-card').forEach((card) => {
        const trigger = card.querySelector('.pj-open');
        if (trigger) trigger.addEventListener('click', (e) => { e.stopPropagation(); open(card); });
        const shot = card.querySelector('.pj-shot');
        if (shot) { shot.style.cursor = 'pointer'; shot.addEventListener('click', () => open(card)); }
      });
      modal.querySelectorAll('[data-close]').forEach((el) => el.addEventListener('click', close));
      tabs.forEach((t) => t.addEventListener('click', () => setView(t.dataset.view)));
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) close(); });
    })();

    /* ---- Projects: cursor-following dot spotlight ---- */
    (function () {
      const sec = document.querySelector('.projects');
      if (!sec || matchMedia('(hover: none)').matches) return;
      sec.addEventListener('mousemove', (e) => {
        const r = sec.getBoundingClientRect();
        sec.style.setProperty('--pmx', (e.clientX - r.left) + 'px');
        sec.style.setProperty('--pmy', (e.clientY - r.top) + 'px');
        sec.classList.add('cursor-on');
      });
      sec.addEventListener('mouseleave', () => sec.classList.remove('cursor-on'));
    })();

    /* ---- Scroll-reactive rail in the Why section (#8) ---- */
    (function () {
      const why = document.querySelector('.why');
      if (!why) return;
      const rail = document.createElement('div'); rail.className = 'why-rail'; why.appendChild(rail);
      const update = () => {
        const r = why.getBoundingClientRect();
        const vh = window.innerHeight;
        const prog = Math.min(1, Math.max(0, (vh - r.top) / (r.height + vh)));
        rail.style.height = (prog * 100) + '%';
      };
      window.addEventListener('scroll', update, { passive: true });
      window.addEventListener('resize', update);
      update();
    })();

    /* ---- Plans: package selector ---- */
    (function () {
      const items = document.querySelectorAll('.pkg-item');
      const panels = document.querySelectorAll('.pkg-panel');
      const plansSec = document.querySelector('.plans');
      if (!items.length) return;
      let activeKey = null;
      const activate = (it) => {
        const key = it.dataset.pkg;
        if (key === activeKey) return;          // already showing it
        activeKey = key;
        items.forEach((x) => x.classList.toggle('active', x === it));
        if (plansSec) { plansSec.classList.remove('bloom'); void plansSec.offsetWidth; plansSec.classList.add('bloom'); }
        panels.forEach((p) => {
          const on = p.dataset.panel === key;
          p.classList.toggle('on', on);
          if (on) { p.classList.remove('anim'); void p.offsetWidth; p.classList.add('anim'); }
        });
      };
      items.forEach((it) => {
        it.addEventListener('mouseenter', () => activate(it));   // hover to switch
        it.addEventListener('click', () => activate(it));        // tap fallback (touch)
      });
    })();

    /* ---- FAQ accordion ---- */
    document.querySelectorAll('#faqList .faq-item').forEach((item) => {
      const q = item.querySelector('.faq-q');
      const a = item.querySelector('.faq-a');
      q.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        // close all
        document.querySelectorAll('#faqList .faq-item').forEach((it) => {
          it.classList.remove('open');
          it.querySelector('.faq-a').style.maxHeight = null;
        });
        // open this one (unless it was already open)
        if (!isOpen) {
          item.classList.add('open');
          a.style.maxHeight = a.scrollHeight + 'px';
        }
      });
    });

    /* ---- Footer: back to top (smooth, no hash) ---- */
    (function () {
      const up = document.querySelector('.foot-up');
      if (!up) return;
      up.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      });
    })();
