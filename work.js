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
