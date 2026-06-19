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

      resize();
      cancelAnimationFrame(rafId);
      tick();
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
      document.querySelectorAll('.btn, .nav-cta').forEach((btn) => {
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
        gsap.to(el, {
          y: (rot < 0 ? -1 : 1) * 26 + (id === 'p1' ? -34 : 0),
          ease: 'none',
          scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 }
        });
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

      /* ---- Hover: hovered card grows + stronger shadow, jumps to the front ---- */
      const stack = document.querySelector('.hero-photos');
      Object.keys(cards).forEach(id => {
        const el = cards[id];
        const inner = el.querySelector('.polaroid');
        el.addEventListener('mouseenter', () => {
          stack.style.zIndex = 50;         // lift the whole stack above the headline (but below the nav)
          el.style.zIndex = 99999;         // hovered card on top within the stack
          gsap.to(el, { scale: 1.12, y: -16, duration: 0.45, ease: 'power3.out', overwrite: 'auto' });
          gsap.to(inner, { boxShadow: '0 55px 95px rgba(0,0,0,0.32)', duration: 0.45, ease: 'power3.out', overwrite: 'auto' });
        });
        el.addEventListener('mouseleave', () => {
          stack.style.zIndex = '';         // restore stack below the headline
          el.style.zIndex = '';            // restore natural stacking
          gsap.to(el, { scale: 1, y: 0, duration: 0.5, ease: 'power3.out', overwrite: 'auto' });
          gsap.to(inner, { boxShadow: '0 30px 60px rgba(0,0,0,0.20)', duration: 0.5, ease: 'power3.out', overwrite: 'auto' });
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
      const text = title.textContent;
      title.textContent = '';
      const letters = [];
      [...text].forEach((ch) => {
        const s = document.createElement('span');
        s.className = 'hch';
        s.textContent = ch === ' ' ? ' ' : ch;
        title.appendChild(s);
        letters.push(s);
      });

      // load reveal — letters rise + fade in, staggered (uses yPercent so cursor can own y)
      gsap.from(letters, {
        yPercent: 120, autoAlpha: 0, duration: 0.85, ease: 'power4.out', stagger: 0.035, delay: 0.15
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
    })();

    /* ---- Generic reveal-up (skips sections with their own animation) ---- */
    const customSel = '.process, .plans, .maint, .why, .faq, .projects';
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

    // PLANS — heading + selector rise in
    gsap.set('.plans .sec-head, .plans .plans-sub', { opacity: 0, y: 30 });
    gsap.set('.plans .pkg', { opacity: 0, y: 36 });
    ScrollTrigger.create({ ...once('.plans'), onEnter: () => {
      gsap.to('.plans .sec-head, .plans .plans-sub', { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.08 });
      gsap.to('.plans .pkg', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.15 });
    } });

    // MAINTENANCE — slide in from the right
    gsap.set('.maint .reveal', { opacity: 0, x: 55, y: 0 });
    ScrollTrigger.create({ ...once('.maint'),
      onEnter: () => gsap.to('.maint .reveal', { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1 }) });

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

    /* ---- Testimonials slider ---- */
    const testimonials = [
      { name:'Maria Santos', role:'Owner, Lumen Apparel', img:'https://picsum.photos/seed/knb-maria/320/320',
        quote:'Our Shopify revamp finally made the store feel trustworthy. The product pages and checkout are so much cleaner, and customers tell us it\'s easy to buy from now.' },
      { name:'Daniel Cruz', role:'Founder, Verde Market', img:'https://picsum.photos/seed/knb-daniel/320/320',
        quote:'They migrated us to WooCommerce without a hitch and the site is noticeably faster. Working with the team was clear, patient, and on schedule.' },
      { name:'Dr. Aileen Reyes', role:'Northwind Clinic', img:'https://picsum.photos/seed/knb-aileen/320/320',
        quote:'Our old website looked dated and was hard to use on mobile. KNB rebuilt it to look professional and modern — booking enquiries have been much smoother since.' },
      { name:'Marcus Tan', role:'Operations, BookEasy', img:'https://picsum.photos/seed/knb-marcus/320/320',
        quote:'They built us a custom booking system that fits exactly how we work. Responsive, thoughtful, and great support after launch.' }
    ];
    const sliderTrack = document.getElementById('sliderTrack');
    sliderTrack.innerHTML = testimonials.map(t => `
      <div class="slide">
        <img src="${t.img}" alt="${t.name}">
        <div>
          <div class="stars">★★★★★</div>
          <p class="quote">“${t.quote}”</p>
          <p class="who" style="margin-top:24px">${t.name}</p>
          <p class="role">${t.role}</p>
        </div>
      </div>`).join('');

    let idx = 0;
    const total = testimonials.length;
    const go = i => {
      idx = (i + total) % total;
      sliderTrack.style.transform = `translateX(-${idx * 100}%)`;
    };
    document.getElementById('next').addEventListener('click', () => { go(idx + 1); resetAuto(); });
    document.getElementById('prev').addEventListener('click', () => { go(idx - 1); resetAuto(); });
    let auto = setInterval(() => go(idx + 1), 5000);
    function resetAuto() { clearInterval(auto); auto = setInterval(() => go(idx + 1), 5000); }

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

    /* ---- Projects: platform filter ---- */
    (function () {
      const filters = document.querySelectorAll('.proj-filter');
      const cards = document.querySelectorAll('.proj-card');
      if (!filters.length) return;
      filters.forEach((f) => {
        f.addEventListener('click', () => {
          const key = f.dataset.filter;
          filters.forEach((x) => x.classList.toggle('active', x === f));
          cards.forEach((c) => c.classList.toggle('hide', !(key === 'all' || c.dataset.plat === key)));
        });
      });
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
