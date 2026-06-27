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
    const ring = el.closest('.stat-ring');
    const dur = 1200, start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (ring) ring.style.setProperty('--p', (eased * 100).toFixed(1)); // B5 fill the ring
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

  // build card tag chips (same design as home Projects: platform · category · industry)
  (function () {
    const INDUSTRY = {
      'Light My Bricks': 'Retail', 'Cacao Collective': 'Food & drink', 'Omenz': 'Retail',
      'Thirsty Squirrel': 'Beverage', 'Rise Outdoor': 'Outdoor', 'Salon Store': 'Beauty',
      'Brookhaven Village': 'Property', 'Feedbird': 'Software', 'Qi Platform': 'Software',
      'Maestro Labs': 'Software', 'Teamtown': 'Software', 'Narrative Hub': 'Media',
      'Peregrine Projects': 'Creative', 'Monsera': 'Business', 'TCA': 'Consulting',
      'BBD': 'Design', 'All Terrain Industries': 'Industrial', 'Privvy Marketing': 'Agency'
    };
    const PLATNAME = { shopify: 'Shopify', webflow: 'Webflow', wordpress: 'WordPress' };
    const catOf = (tags) => tags.includes('ecommerce') ? 'Ecommerce' : (tags.includes('cms') ? 'CMS' : 'Business');
    const mk = (cls, text, filter) => {
      const el = document.createElement(filter ? 'button' : 'span');
      el.className = 'pf-chip' + (cls ? ' ' + cls : '');
      el.textContent = text;
      if (filter) { el.type = 'button'; el.dataset.filter = filter; el.setAttribute('data-stop', ''); }
      return el;
    };
    document.querySelectorAll('.pf-grid .proj-card').forEach((card) => {
      const meta = card.querySelector('.proj-meta');
      if (!meta || meta.querySelector('.pf-tags')) return;
      const plat = card.dataset.plat || '';
      const tags = (card.dataset.tags || '').split(/\s+/);
      const title = card.dataset.title || '';
      const oldCat = meta.querySelector('.cat'); if (oldCat) oldCat.remove(); // replace plain label
      const row = document.createElement('div');
      row.className = 'pf-tags';
      // platform + category chips are clickable filters (tokens already in data-tags)
      row.appendChild(mk('is-plat', PLATNAME[plat] || plat, plat));
      const cat = catOf(tags);
      row.appendChild(mk('', cat, cat.toLowerCase()));
      // industry chip filters too — register its slug as a token on the card
      const ind = INDUSTRY[title];
      if (ind) {
        const slug = ind.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        card.dataset.tags = ((card.dataset.tags || '') + ' ' + slug).trim();
        row.appendChild(mk('is-type', ind, slug));
      }
      meta.appendChild(row);
    });
  })();

  // ===== work grid controller: filter + sort + load-more + FLIP =====
  const filters = document.querySelectorAll('.proj-filter');
  const grid = document.querySelector('.pf-grid');
  const filterStatus = document.getElementById('filterStatus');
  const workCount = document.getElementById('workCount');
  const pfEmpty = document.querySelector('.pf-empty');
  const sortSel = document.getElementById('workSort');
  const moreBtn = document.getElementById('loadMore');
  const PAGE = 9;
  if (filters.length && grid) {
    const allCards = [...grid.querySelectorAll('.proj-card')];
    const origOrder = allCards.slice();
    const total = allCards.length;
    let activeFilter = 'all';
    let limit = PAGE;
    let searchTerm = '';
    const tokensOf = (c) => (c.dataset.tags || c.dataset.plat || '').split(/\s+/);
    const matches = (c) => {
      if (activeFilter !== 'all' && !tokensOf(c).includes(activeFilter)) return false;
      if (searchTerm) {
        const hay = ((c.dataset.title || '') + ' ' + (c.dataset.scope || '') + ' ' + (c.dataset.tags || '')).toLowerCase();
        if (!hay.includes(searchTerm)) return false;
      }
      return true;
    };

    // #2 show a count on each filter pill, e.g. "Shopify (6)"
    filters.forEach((b) => {
      const f = b.dataset.filter;
      const n = f === 'all' ? total : allCards.filter((c) => tokensOf(c).includes(f)).length;
      const base = b.dataset.label || b.textContent;
      b.dataset.label = base;
      b.innerHTML = base + ' <span class="pf-n">' + n + '</span>';
    });

    const flip = (run) => {
      const motionOK = !matchMedia('(prefers-reduced-motion: reduce)').matches;
      const before = motionOK ? allCards.map((c) => c.getBoundingClientRect()) : null;
      run();
      if (!motionOK) return;
      allCards.forEach((c, i) => {
        if (c.hidden) return;
        const a = c.getBoundingClientRect();
        const dx = before[i].left - a.left, dy = before[i].top - a.top;
        if (!dx && !dy) return;
        c.style.transition = 'none';
        c.style.transform = `translate(${dx}px, ${dy}px)`;
        requestAnimationFrame(() => {
          c.style.transition = 'transform 0.5s ease';
          c.style.transform = '';
          c.addEventListener('transitionend', () => { c.style.transition = ''; c.style.transform = ''; }, { once: true });
        });
      });
    };

    const render = () => {
      grid.classList.toggle('is-filtering', activeFilter !== 'all');
      let matched = 0, shown = 0;
      allCards.forEach((c) => {
        if (matches(c)) { matched++; c.hidden = matched > limit; if (!c.hidden) shown++; }
        else c.hidden = true;
      });
      if (workCount) workCount.innerHTML = 'Showing <b>' + shown + '</b> of ' + (activeFilter === 'all' ? total : matched) + ' projects';
      if (filterStatus) filterStatus.textContent = 'Showing ' + shown + ' of ' + matched + ' projects.';
      if (pfEmpty) pfEmpty.hidden = matched !== 0;
      if (moreBtn) moreBtn.hidden = matched <= limit;
    };

    const setFilter = (f, push) => {
      f = f || 'all';
      const owned = [...filters].some((b) => b.dataset.filter === f);
      if (!owned && !allCards.some((c) => tokensOf(c).includes(f))) f = 'all';
      activeFilter = f; limit = PAGE;
      filters.forEach((b) => {
        const on = b.dataset.filter === f;
        b.classList.toggle('active', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      document.querySelectorAll('.ind-chip').forEach((c) => c.classList.toggle('active', c.dataset.filter === f));
      flip(render);
      if (push) history.replaceState(null, '', f === 'all' ? location.pathname + location.search : '#work=' + f);
    };

    const sortBy = (mode) => {
      let arr = origOrder.slice();
      if (mode === 'az') arr.sort((a, b) => (a.dataset.title || '').localeCompare(b.dataset.title || ''));
      else if (mode === 'platform') arr.sort((a, b) => (a.dataset.plat || '').localeCompare(b.dataset.plat || '') || (a.dataset.title || '').localeCompare(b.dataset.title || ''));
      flip(() => { arr.forEach((c) => grid.appendChild(c)); render(); });
    };

    filters.forEach((btn) => btn.addEventListener('click', () => setFilter(btn.dataset.filter, true)));
    grid.querySelectorAll('button.pf-chip[data-filter]').forEach((chip) => {
      chip.addEventListener('click', (e) => {
        e.preventDefault(); e.stopPropagation();
        setFilter(chip.dataset.filter, true);
        const bar = document.querySelector('.work-controls');
        if (bar) bar.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
    if (sortSel) sortSel.addEventListener('change', () => sortBy(sortSel.value));
    if (moreBtn) moreBtn.addEventListener('click', () => { limit += PAGE; flip(render); });
    const pfReset = document.querySelector('.pf-reset');
    if (pfReset) pfReset.addEventListener('click', () => setFilter('all', true));
    const searchInput = document.getElementById('workSearch');
    if (searchInput) searchInput.addEventListener('input', () => { searchTerm = searchInput.value.trim().toLowerCase(); limit = PAGE; flip(render); });
    document.querySelectorAll('.ind-chip').forEach((b) => b.addEventListener('click', () => {
      setFilter(activeFilter === b.dataset.filter ? 'all' : b.dataset.filter, true);
      const bar = document.querySelector('.work-controls');
      if (bar) bar.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }));
    const m = /#work=([\w-]+)/.exec(location.hash);
    setFilter(m ? m[1] : 'all', false);
  }

  // real screenshots via WordPress mShots — LAZY (load as each card nears the viewport) + shimmer blur-up
  (function () {
    const shots = [...document.querySelectorAll('.pf-shot')];
    if (!shots.length) return;
    const load = (img) => {
      if (img.dataset.loaded) return;
      img.dataset.loaded = '1';
      const card = img.closest('.proj-card');
      const url = card && card.dataset.url;
      const fallback = img.dataset.fallback;
      const wrap = img.closest('.proj-img');
      const done = () => { if (wrap) wrap.classList.add('is-loaded'); };
      img.addEventListener('load', done);
      img.addEventListener('error', () => { if (fallback && img.src !== fallback) img.src = fallback; else done(); });
      img.src = url ? 'https://s.wp.com/mshots/v1/' + encodeURIComponent(url) + '?w=1200' : (fallback || '');
    };
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries, o) => {
        entries.forEach((e) => { if (e.isIntersecting) { load(e.target); o.unobserve(e.target); } });
      }, { rootMargin: '300px' });
      shots.forEach((img) => io.observe(img));
    } else {
      shots.forEach(load);
    }
  })();

  // detail modal (#6) + live preview (#2)
  (function () {
    const modal = document.getElementById('pfModal');
    if (!modal) return;
    const byId = (id) => document.getElementById(id);
    const imgEl = byId('pfmImg'), frameEl = byId('pfmFrame');
    const shotWrap = modal.querySelector('.pfm-shotwrap');
    const liveWrap = modal.querySelector('.pfm-livewrap');
    const loadingEl = byId('pfmLoading');
    const tabs = [...modal.querySelectorAll('.pfm-tab')];
    let lastFocus = null;
    let currentCard = null;
    let liveTimer = null;
    const hideLoading = () => { clearTimeout(liveTimer); if (loadingEl) loadingEl.hidden = true; };
    if (frameEl) frameEl.addEventListener('load', hideLoading);
    const slugOf = (t) => (t || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const setView = (view) => {
      tabs.forEach((t) => t.classList.toggle('active', t.dataset.view === view));
      const live = view === 'live';
      modal.classList.toggle('is-live', live);
      liveWrap.hidden = !live; shotWrap.hidden = live;
      if (live && !frameEl.getAttribute('src') && frameEl.dataset.url) {
        if (loadingEl) loadingEl.hidden = false;
        clearTimeout(liveTimer);
        liveTimer = setTimeout(hideLoading, 8000); // stop spinning even if the frame never resolves
        frameEl.src = frameEl.dataset.url;
      }
    };
    const open = (card) => {
      const d = card.dataset;
      currentCard = card;
      const sBtn = byId('pfmStart'); if (sBtn) sBtn.href = 'contact.html#' + (d.plat || '');
      if (d.title) history.replaceState(null, '', '#project=' + slugOf(d.title));
      byId('pfmTitle').textContent = d.title || '';
      byId('pfmScope').textContent = d.scope || '';
      byId('pfmPlat').textContent = (d.plat || '').charAt(0).toUpperCase() + (d.plat || '').slice(1);
      byId('pfmUrl').textContent = (d.url || '').replace(/^https?:\/\//, '').replace(/\/$/, '');
      const shotImg = card.querySelector('.pf-shot');
      imgEl.src = (shotImg && (shotImg.currentSrc || shotImg.src))
        || (d.url ? 'https://s.wp.com/mshots/v1/' + encodeURIComponent(d.url) + '?w=1200' : '');
      imgEl.alt = d.title || '';
      byId('pfmLive').href = d.url || '#';
      byId('pfmOpen').href = d.url || '#';
      frameEl.dataset.url = d.url || '';
      frameEl.removeAttribute('src');
      hideLoading();
      modal.querySelector('.pfm-dialog').style.setProperty('--accent', (getComputedStyle(card).getPropertyValue('--accent') || '').trim());
      setView('shot');
      lastFocus = document.activeElement;
      modal.hidden = false;
      document.body.style.overflow = 'hidden';
      modal.querySelector('.pfm-x').focus();
    };
    const close = () => {
      modal.hidden = true;
      document.body.style.overflow = '';
      frameEl.removeAttribute('src');
      history.replaceState(null, '', location.pathname + location.search);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    };
    document.querySelectorAll('.proj-card').forEach((card) => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('[data-stop]')) return; // Visit-site link & cat chip handle their own clicks
        open(card);
      });
      const vd = card.querySelector('.view-details');
      if (vd) vd.addEventListener('click', (e) => { e.stopPropagation(); open(card); });
    });
    modal.querySelectorAll('[data-close]').forEach((el) => el.addEventListener('click', close));
    tabs.forEach((t) => t.addEventListener('click', () => setView(t.dataset.view)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) close(); });
    // #4 trap Tab focus inside the open dialog
    modal.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const f = [...modal.querySelectorAll('button, a[href], select, iframe, [tabindex]:not([tabindex="-1"])')].filter((el) => el.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    // prev / next between visible projects
    const visibleCards = () => [...document.querySelectorAll('.pf-grid .proj-card')].filter((c) => !c.hidden);
    const navTo = (dir) => { const v = visibleCards(); const i = v.indexOf(currentCard); if (i < 0) return; open(v[(i + dir + v.length) % v.length]); };
    const prevB = byId('pfmPrev'), nextB = byId('pfmNext');
    if (prevB) prevB.addEventListener('click', (e) => { e.stopPropagation(); navTo(-1); });
    if (nextB) nextB.addEventListener('click', (e) => { e.stopPropagation(); navTo(1); });
    document.addEventListener('keydown', (e) => { if (modal.hidden) return; if (e.key === 'ArrowLeft') navTo(-1); else if (e.key === 'ArrowRight') navTo(1); });
    // copy-link / share
    const shareB = byId('pfmShare');
    if (shareB) shareB.addEventListener('click', () => {
      const done = () => { shareB.textContent = 'Copied!'; setTimeout(() => { shareB.textContent = 'Copy link'; }, 1500); };
      if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(done).catch(done); else done();
    });
    // deep-link: open the matching project on load
    const dm = /#project=([\w-]+)/.exec(location.hash);
    if (dm) {
      const card = [...document.querySelectorAll('.pf-grid .proj-card')].find((c) => slugOf(c.dataset.title) === dm[1]);
      if (card) open(card);
    }
  })();

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

    // #6 nudge the slider once when it scrolls into view, to hint it's draggable
    if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const hintIO = new IntersectionObserver((entries, o) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          o.disconnect();
          const seq = [{ to: 66, d: 650 }, { to: 50, d: 650 }];
          let i = 0, v = 50;
          const run = () => {
            if (i >= seq.length) return;
            const from = v, target = seq[i].to, dur = seq[i].d, t0 = performance.now();
            const step = (now) => {
              const p = Math.min((now - t0) / dur, 1);
              v = from + (target - from) * (1 - Math.pow(1 - p, 3));
              ba.style.setProperty('--split', v + '%');
              if (handle) handle.setAttribute('aria-valuenow', Math.round(v));
              if (p < 1) requestAnimationFrame(step); else { i++; run(); }
            };
            requestAnimationFrame(step);
          };
          run();
        });
      }, { threshold: 0.55 });
      hintIO.observe(ba);
    }
  }

  const noHover = matchMedia('(hover: none)').matches;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // B1: cursor spotlight on the work section
  (function () {
    const sec = document.querySelector('.work');
    if (!sec || noHover) return;
    sec.addEventListener('mousemove', (e) => {
      const r = sec.getBoundingClientRect();
      sec.style.setProperty('--wmx', ((e.clientX - r.left) / r.width * 100) + '%');
      sec.style.setProperty('--wmy', ((e.clientY - r.top) / r.height * 100) + '%');
      sec.classList.add('cursor-on');
    });
    sec.addEventListener('mouseleave', () => sec.classList.remove('cursor-on'));
  })();

  // B2: hero headline word reveal on load
  (function () {
    const h1 = document.querySelector('.page-hero h1');
    if (!h1 || reduce) return;
    if (h1.querySelector('.rot')) return; // rotating-word headline manages its own reveal
    const words = h1.textContent.trim().split(/\s+/);
    const frag = document.createDocumentFragment();
    words.forEach((w, i) => {
      const s = document.createElement('span');
      s.textContent = w;
      s.style.cssText = 'display:inline-block;opacity:0;transform:translateY(0.45em);transition:opacity 0.6s ease,transform 0.7s cubic-bezier(0.2,0.7,0.2,1);transition-delay:' + (0.05 + i * 0.08) + 's';
      frag.appendChild(s);
      if (i < words.length - 1) frag.appendChild(document.createTextNode(' '));
    });
    h1.textContent = '';
    h1.appendChild(frag);
    requestAnimationFrame(() => h1.querySelectorAll('span').forEach((s) => { s.style.opacity = '1'; s.style.transform = 'none'; }));
  })();

  // B3: magnetic buttons
  if (!noHover) {
    document.querySelectorAll('.btn').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        btn.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * 0.25 + 'px,' + (e.clientY - r.top - r.height / 2) * 0.35 + 'px)';
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  // B4: subtle tilt on project screenshots
  if (!noHover) {
    document.querySelectorAll('.pf-grid .proj-card').forEach((card) => {
      const img = card.querySelector('.proj-img');
      if (!img) return;
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const rx = ((e.clientY - r.top) / r.height - 0.5) * -6;
        const ry = ((e.clientX - r.left) / r.width - 0.5) * 6;
        img.style.transform = 'perspective(700px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)';
      });
      card.addEventListener('mouseleave', () => { img.style.transform = ''; });
    });
  }

  // B6: logo marquee speeds up while scrolling
  (function () {
    const track = document.querySelector('.logos-track');
    if (!track || reduce) return;
    let t;
    window.addEventListener('scroll', () => {
      track.style.animationDuration = '16s';
      clearTimeout(t);
      t = setTimeout(() => { track.style.animationDuration = ''; }, 220);
    }, { passive: true });
  })();

  // #3 scroll-progress bar + back-to-top
  (function () {
    const prog = document.getElementById('scrollProg');
    const toTop = document.getElementById('toTop');
    if (!prog && !toTop) return;
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      if (prog) prog.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
      if (toTop) toTop.classList.toggle('show', h.scrollTop > 600);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    if (toTop) toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));
  })();
})();

/* platform-page grid load-more (shopify / webflow / wordpress) — not the portfolio controller grid */
(function () {
  const grid = document.querySelector('.work .proj-grid:not(.pf-grid)');
  if (!grid) return;
  const cards = [...grid.querySelectorAll('.proj-card')];
  const STEP = 9;
  if (cards.length <= STEP) return;
  let shown = STEP;
  const wrap = document.createElement('div');
  wrap.className = 'work-more';
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn ghost';
  wrap.appendChild(btn);
  grid.parentNode.insertBefore(wrap, grid.nextSibling);
  const render = () => {
    cards.forEach((c, i) => {
      if (i < shown) {
        c.style.display = '';
        if (i >= STEP) c.classList.add('in'); // force-reveal cards loaded via the button (observer won't fire for them)
      } else {
        c.style.display = 'none';
      }
    });
    const left = cards.length - shown;
    if (left <= 0) { wrap.remove(); return; }
    btn.textContent = 'Load more (' + left + ' more)';
  };
  btn.addEventListener('click', () => { shown += STEP; render(); });
  render();
})();

/* platform-page stat count-up (decimals + suffix; ★ stays static in markup) */
(function () {
  var nums = document.querySelectorAll('.plat-stats [data-num], .hero-stats [data-num]');
  if (!nums.length) return;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!('IntersectionObserver' in window) || reduce) { nums.forEach(function (el) { el.textContent = parseFloat(el.dataset.num).toFixed(+(el.dataset.dec || 0)) + (el.dataset.suffix || ''); }); return; }
  var io = new IntersectionObserver(function (es, o) {
    es.forEach(function (en) {
      if (!en.isIntersecting) return;
      var el = en.target, target = parseFloat(el.dataset.num), dec = +(el.dataset.dec || 0), suf = el.dataset.suffix || '', t0 = performance.now();
      (function tick(now) {
        var p = Math.min((now - t0) / 1400, 1), e = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * e).toFixed(dec) + suf;
        if (p < 1) requestAnimationFrame(tick); else el.textContent = target.toFixed(dec) + suf;
      })(t0);
      o.unobserve(el);
    });
  }, { threshold: 0.5 });
  nums.forEach(function (el) { io.observe(el); });
})();

/* platform "is this right for you?" — cursor glow + fit-finder toggle */
(function () {
  var sec = document.querySelector('.why-plat');
  if (!sec) return;
  // cursor-reactive glow (desktop / pointer only)
  if (matchMedia('(hover: hover)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    sec.addEventListener('mousemove', function (e) {
      var r = sec.getBoundingClientRect();
      sec.style.setProperty('--gx', ((e.clientX - r.left) / r.width * 100) + '%');
      sec.style.setProperty('--gy', ((e.clientY - r.top) / r.height * 100) + '%');
      sec.classList.add('glow-on');
    });
    sec.addEventListener('mouseleave', function () { sec.classList.remove('glow-on'); });
  }
  // fit-finder: swap the verdict + emphasise store-fit vs. alternatives
  var seg = sec.querySelector('.why-seg');
  var verdict = sec.querySelector('#whyVerdict');
  if (seg && verdict) {
    seg.querySelectorAll('button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        seg.querySelectorAll('button').forEach(function (b) { b.classList.toggle('on', b === btn); });
        if (btn.dataset.verdict) verdict.innerHTML = btn.dataset.verdict;
        sec.classList.remove('fit-store', 'fit-content', 'fit-both');
        sec.classList.add('fit-' + btn.dataset.fit);
      });
    });
  }
})();

/* platform pages — sticky sub-nav scroll-spy + progress bar */
(function () {
  var sn = document.querySelector('.plat-subnav');
  if (!sn) return;
  var links = [].slice.call(sn.querySelectorAll('a[href^="#"]'));
  var bar = sn.querySelector('.psn-bar i');
  var secs = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  function onScroll() {
    var st = window.scrollY || window.pageYOffset;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.width = (h > 0 ? Math.max(0, Math.min(1, st / h)) : 0) * 100 + '%';
    var idx = 0;
    for (var i = 0; i < secs.length; i++) {
      if (secs[i] && secs[i].getBoundingClientRect().top <= 140) idx = i;
    }
    links.forEach(function (a, i) { a.classList.toggle('active', i === idx); });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();
})();

/* ==============================================================
   HOMEPAGE ALIGNMENT — ported behaviour (vanilla, no GSAP)
   ============================================================== */

/* living hero — floating particles (drift up + cursor parallax) */
(function () {
  var canvas = document.getElementById('heroParticles');
  if (!canvas || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var ctx = canvas.getContext('2d');
  var hero = canvas.parentElement;
  var DPR = Math.min(window.devicePixelRatio || 1, 2);
  var w = 0, h = 0, particles = [], mx = 0, my = 0, rafId;
  var palette = ['232,63,160', '17,17,16', '96,132,255', '39,196,153', '255,168,84'];
  function spawn(anywhere) {
    var depth = Math.random();
    return { x: Math.random() * w, y: anywhere ? Math.random() * h : h + 12,
      r: 0.6 + depth * 2.2, vy: 0.15 + depth * 0.65, drift: (Math.random() - 0.5) * 0.3,
      alpha: 0.10 + depth * 0.34, rgb: palette[Math.floor(Math.random() * palette.length)], depth: depth };
  }
  function resize() {
    w = hero.clientWidth; h = hero.clientHeight;
    canvas.width = w * DPR; canvas.height = h * DPR;
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    particles = Array.from({ length: Math.round(Math.min(70, w / 20)) }, function () { return spawn(true); });
  }
  function tick() {
    ctx.clearRect(0, 0, w, h);
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.y -= p.vy; p.x += p.drift;
      if (p.y < -12) Object.assign(p, spawn(false));
      ctx.beginPath();
      ctx.arc(p.x + mx * p.depth * 28, p.y + my * p.depth * 16, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + p.rgb + ',' + p.alpha + ')'; ctx.fill();
    }
    rafId = requestAnimationFrame(tick);
  }
  hero.addEventListener('mousemove', function (e) {
    var r = hero.getBoundingClientRect();
    mx = (e.clientX - r.left) / r.width - 0.5; my = (e.clientY - r.top) / r.height - 0.5;
  });
  hero.addEventListener('mouseleave', function () { mx = 0; my = 0; });
  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(resize, 200); });
  var start = function () { resize(); cancelAnimationFrame(rafId); tick(); };
  if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 900 }); else setTimeout(start, 250);
})();

/* living hero — grid cursor spotlight */
(function () {
  var spot = document.getElementById('gridSpot');
  var heroEl = document.querySelector('.page-hero');
  if (!spot || !heroEl || matchMedia('(hover: none)').matches) return;
  heroEl.addEventListener('mousemove', function (e) {
    var r = heroEl.getBoundingClientRect();
    spot.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    spot.style.setProperty('--my', (e.clientY - r.top) + 'px');
    spot.classList.add('active');
  });
  heroEl.addEventListener('mouseleave', function () { spot.classList.remove('active'); });
})();

/* project screenshots via mShots + shimmer blur-up */
(function () {
  document.querySelectorAll('.pj-img').forEach(function (img) {
    var shot = img.dataset.shot, fallback = img.dataset.fallback;
    var done = function () { var s = img.closest('.pj-shot'); if (s) s.classList.add('is-loaded'); };
    img.addEventListener('load', done);
    img.addEventListener('error', function () { if (fallback && img.src !== fallback) img.src = fallback; else done(); });
    img.src = shot ? 'https://s.wp.com/mshots/v1/' + encodeURIComponent(shot) + '?w=1200' : (fallback || '');
  });
})();

/* project detail modal + live preview */
(function () {
  var modal = document.getElementById('pjModal');
  if (!modal) return;
  var byId = function (id) { return document.getElementById(id); };
  var imgEl = byId('pjmImg'), frameEl = byId('pjmFrame');
  var shotWrap = modal.querySelector('.pjm-shotwrap');
  var liveWrap = modal.querySelector('.pjm-livewrap');
  var tabs = [].slice.call(modal.querySelectorAll('.pjm-tab'));
  var loadingEl = byId('pjmLoading'), fallbackEl = byId('pjmFallback');
  var lastFocus = null, currentCard = null, probeTimer = null;
  function resetLive() { clearTimeout(probeTimer); if (loadingEl) loadingEl.hidden = true; if (fallbackEl) fallbackEl.hidden = true; }
  function startLive() {
    if (loadingEl) loadingEl.hidden = false; if (fallbackEl) fallbackEl.hidden = true;
    clearTimeout(probeTimer);
    probeTimer = setTimeout(function () { if (loadingEl) loadingEl.hidden = true; if (fallbackEl) fallbackEl.hidden = false; }, 8000);
  }
  if (frameEl) frameEl.addEventListener('load', function () { clearTimeout(probeTimer); if (loadingEl) loadingEl.hidden = true; if (fallbackEl) fallbackEl.hidden = true; });
  function setView(view) {
    tabs.forEach(function (t) { t.classList.toggle('active', t.dataset.view === view); });
    var live = view === 'live';
    modal.classList.toggle('is-live', live);
    liveWrap.hidden = !live; shotWrap.hidden = live;
    if (live && !frameEl.getAttribute('src') && frameEl.dataset.url) { startLive(); frameEl.src = frameEl.dataset.url; }
  }
  function open(card) {
    var d = card.dataset; currentCard = card;
    byId('pjmTitle').textContent = d.title || '';
    byId('pjmScope').textContent = d.scope || '';
    byId('pjmPlat').textContent = d.plain || '';
    byId('pjmUrl').textContent = (d.url || '').replace(/^https?:\/\//, '').replace(/\/$/, '');
    var shotImg = card.querySelector('.pj-img');
    imgEl.src = (shotImg && (shotImg.currentSrc || shotImg.src)) || ''; imgEl.alt = d.title || '';
    byId('pjmLive').href = d.url || '#'; byId('pjmOpen').href = d.url || '#';
    if (byId('pjmOpenBig')) byId('pjmOpenBig').href = d.url || '#';
    frameEl.dataset.url = d.url || ''; frameEl.removeAttribute('src'); resetLive();
    var tagWrap = byId('pjmTags'); tagWrap.innerHTML = '';
    card.querySelectorAll('.pj-tags .pj-chip').forEach(function (c) {
      var s = document.createElement('span'); s.className = c.className; s.textContent = c.textContent; tagWrap.appendChild(s);
    });
    var cap = function (s) { return s.replace(/\b\w/g, function (m) { return m.toUpperCase(); }); };
    var cleanUrl = (d.url || '').replace(/^https?:\/\//, '').replace(/\/$/, '');
    if (byId('pjmMetaPlat')) byId('pjmMetaPlat').textContent = d.plain || '—';
    if (byId('pjmMetaFocus')) { var f = (d.tags || '').split(/\s+/).filter(function (t) { return t && t !== (d.plat || ''); }); byId('pjmMetaFocus').textContent = f.length ? cap(f.join(', ')) : '—'; }
    if (byId('pjmMetaUrl')) byId('pjmMetaUrl').textContent = cleanUrl || '—';
    setView('shot');
    lastFocus = document.activeElement; modal.hidden = false; document.body.style.overflow = 'hidden';
    modal.querySelector('.pjm-x').focus();
  }
  function close() { modal.hidden = true; document.body.style.overflow = ''; frameEl.removeAttribute('src'); resetLive(); if (lastFocus && lastFocus.focus) lastFocus.focus(); }
  document.querySelectorAll('.pj-card').forEach(function (card) {
    var trigger = card.querySelector('.pj-open');
    if (trigger) trigger.addEventListener('click', function (e) { e.stopPropagation(); open(card); });
    var shot = card.querySelector('.pj-shot');
    if (shot) shot.addEventListener('click', function () { open(card); });
  });
  modal.querySelectorAll('[data-close]').forEach(function (el) { el.addEventListener('click', close); });
  tabs.forEach(function (t) { t.addEventListener('click', function () { setView(t.dataset.view); }); });
  ['pjmBackShot', 'pjmBackShot2'].forEach(function (id) { var b = byId(id); if (b) b.addEventListener('click', function () { setView('shot'); }); });
  var allCards = function () { return [].slice.call(document.querySelectorAll('.pj-card')); };
  function navTo(dir) { var v = allCards(), i = v.indexOf(currentCard); if (i < 0) return; open(v[(i + dir + v.length) % v.length]); }
  var prevB = byId('pjmPrev'), nextB = byId('pjmNext');
  if (prevB) prevB.addEventListener('click', function (e) { e.stopPropagation(); navTo(-1); });
  if (nextB) nextB.addEventListener('click', function (e) { e.stopPropagation(); navTo(1); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !modal.hidden) close(); });
  document.addEventListener('keydown', function (e) { if (modal.hidden) return; if (e.key === 'ArrowLeft') navTo(-1); else if (e.key === 'ArrowRight') navTo(1); });
})();

/* two-column FAQ accordion */
(function () {
  document.querySelectorAll('#faqList .faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q'), a = item.querySelector('.faq-a');
    if (!q || !a) return;
    q.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('#faqList .faq-item').forEach(function (it) { it.classList.remove('open'); var aa = it.querySelector('.faq-a'); if (aa) aa.style.maxHeight = null; });
      if (!isOpen) { item.classList.add('open'); a.style.maxHeight = a.scrollHeight + 'px'; }
    });
  });
})();

/* process chevron band — comet pop wave flows left → right (homepage parity) */
(function () {
  var wrap = document.getElementById('procArrows');
  if (!wrap) return;
  var chev = '<svg viewBox="0 0 11 18"><path d="M1.5 1.5 L9 9 L1.5 16.5"/></svg>';
  var build = function () {
    var n = Math.max(10, Math.floor(window.innerWidth / 46));
    wrap.innerHTML = Array.from({ length: n }, function (_, i) {
      return chev.replace('<svg', '<svg style="animation-delay:' + (i * 0.075).toFixed(3) + 's"');
    }).join('');
  };
  build();
  var t; window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(build, 200); });
})();

/* ==============================================================
   PLATFORM PAGES — motion & design pass
   ============================================================== */

/* scroll-progress bar (themed, top of page) */
(function () {
  var bar = document.createElement('div');
  bar.className = 'scroll-prog'; bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);
  var upd = function () {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = 'scaleX(' + (h > 0 ? (window.scrollY / h).toFixed(4) : 0) + ')';
  };
  window.addEventListener('scroll', upd, { passive: true });
  window.addEventListener('resize', upd); upd();
})();

/* (magnetic buttons already handled by the B3 block above) */

/* 3D tilt on project cards (tilts the inner frame; pointer only) */
(function () {
  if (matchMedia('(hover: none)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('.pj-card').forEach(function (card) {
    var frame = card.querySelector('.pj-frame'); if (!frame) return;
    card.addEventListener('mousemove', function (e) {
      var r = card.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
      frame.style.transform = 'rotateX(' + (-py * 5).toFixed(2) + 'deg) rotateY(' + (px * 6).toFixed(2) + 'deg)';
    });
    card.addEventListener('mouseleave', function () { frame.style.transform = ''; });
  });
})();

/* hero browser-mock parallax drift on scroll */
(function () {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var mock = document.querySelector('.page-hero .hero-mock'); if (!mock) return;
  var onScroll = function () {
    var y = window.scrollY || 0;
    if (y > 1000) return;
    mock.style.transform = 'translateY(' + (y * 0.08).toFixed(1) + 'px)';
  };
  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* process progress line — fills 01 → 04 as the section scrolls through */
(function () {
  var steps = document.querySelector('.process .proc-steps'); if (!steps) return;
  document.querySelector('.process').classList.add('has-prog');
  var track = document.createElement('div'); track.className = 'proc-prog'; track.setAttribute('aria-hidden', 'true');
  var fill = document.createElement('div'); fill.className = 'proc-prog-fill'; track.appendChild(fill);
  steps.appendChild(track);
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { fill.style.width = '100%'; return; }
  var upd = function () {
    var r = steps.getBoundingClientRect(), vh = window.innerHeight;
    var p = Math.max(0, Math.min(1, (vh - r.top) / (vh * 0.5 + r.height)));
    fill.style.width = (p * 100).toFixed(1) + '%';
  };
  window.addEventListener('scroll', upd, { passive: true });
  window.addEventListener('resize', upd); upd();
})();

/* distinct scroll-in entrance per section (uses existing r-* reveal variants) */
(function () {
  var set = function (sel, cls) {
    document.querySelectorAll(sel).forEach(function (e) { if (!e.classList.contains('in')) e.classList.add(cls); });
  };
  set('.svc-rows .svc-row.reveal', 'r-left');
  set('.pj-grid .pj-card.reveal', 'r-scale');
})();

/* (1) hero rotating word (words from data-words) */
(function () {
  var rot = document.getElementById('heroRotator'); if (!rot) return;
  var word = rot.querySelector('.rot-word'); if (!word) return;
  var words = (rot.dataset.words || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
  if (words.length < 2 || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var i = 0;
  setInterval(function () {
    word.classList.add('out');
    setTimeout(function () { i = (i + 1) % words.length; word.textContent = words[i]; word.classList.remove('out'); }, 320);
  }, 2600);
})();

/* (9) pop-in for the platform-compare cards */
(function () {
  document.querySelectorAll('.pc-grid .pc-card.reveal').forEach(function (e) { if (!e.classList.contains('in')) e.classList.add('r-pop'); });
})();

/* "What we do" card grid — pointer 3D tilt + spotlight */
(function () {
  var cards = document.querySelectorAll('.svc-card');
  if (!cards.length) return;
  cards.forEach(function (c) {
    var fx = c.querySelector('.svc-fx');
    if (!fx) return;
    c.addEventListener('pointermove', function (e) {
      var r = c.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      fx.style.setProperty('--ry', ((x - 0.5) * 8) + 'deg');
      fx.style.setProperty('--rx', ((0.5 - y) * 8) + 'deg');
      fx.style.setProperty('--mx', (x * 100) + '%');
      fx.style.setProperty('--my', (y * 100) + '%');
    });
    c.addEventListener('pointerleave', function () {
      fx.style.setProperty('--rx', '0deg');
      fx.style.setProperty('--ry', '0deg');
    });
  });
})();

/* platform project grids — "Load more" (activates only when > INITIAL cards, e.g. WordPress) */
(function () {
  var INITIAL = 10, STEP = 10;
  document.querySelectorAll('.pj-grid').forEach(function (grid) {
    var cards = [].slice.call(grid.querySelectorAll('.pj-card'));
    if (cards.length <= INITIAL) return;
    var shown = INITIAL;
    var wrap = document.createElement('div');
    wrap.className = 'pj-more';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn ghost';
    wrap.appendChild(btn);
    grid.parentNode.insertBefore(wrap, grid.nextSibling);
    function render() {
      cards.forEach(function (c, i) { c.hidden = i >= shown; if (i < shown) c.classList.add('in'); });
      btn.textContent = 'Load more projects (' + (cards.length - shown) + ' left)';
      btn.hidden = shown >= cards.length;
    }
    btn.addEventListener('click', function () { shown = Math.min(shown + STEP, cards.length); render(); });
    render();
  });
})();

/* "How it works" flip cards (pricing) — entrance trigger + hover/click/tilt */
(function () {
  var grid = document.querySelector('.v-flip');
  if (!grid) return;
  var cards = [].slice.call(grid.querySelectorAll('.fl-card'));
  function play() { grid.classList.add('played'); }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { play(); io.unobserve(e.target); } }); }, { threshold: 0.25 });
    io.observe(grid);
  } else { play(); }
  cards.forEach(function (c) {
    var tilt = c.querySelector('.fl-tilt'); c._locked = false;
    c.addEventListener('mouseenter', function () { if (!c._locked) c.classList.add('flipped'); });
    c.addEventListener('mouseleave', function () { if (!c._locked) c.classList.remove('flipped'); tilt.style.setProperty('--tx', '0deg'); tilt.style.setProperty('--ty', '0deg'); });
    c.addEventListener('click', function (e) { if (e.target.closest('.fl-cta')) return; e.preventDefault(); c._locked = !c._locked; if (c._locked) c.classList.add('flipped'); else if (!c.matches(':hover')) c.classList.remove('flipped'); });
    c.addEventListener('pointermove', function (e) { if (!c.classList.contains('flipped')) return; var r = c.getBoundingClientRect(); var x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; tilt.style.setProperty('--ty', (x * 7) + 'deg'); tilt.style.setProperty('--tx', (-y * 7) + 'deg'); });
  });
})();
