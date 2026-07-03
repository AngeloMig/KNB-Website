/* KNB ambient hero décor — the single shared implementation of the floating
   particles + cursor grid spotlight (previously duplicated in main.js,
   work.js, and contact.html, where the copies drifted apart).
   House rules baked in: brand palette only (pink-weighted, ink, green),
   low density, idle start, and the canvas pauses while its host section
   is scrolled out of view. */
(function () {
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* floating dust particles (drift up + parallax depth + cursor) */
  if (!reduce) document.querySelectorAll('canvas.hero-particles, canvas.contact-particles').forEach(function (canvas) {
    var ctx = canvas.getContext('2d');
    var host = canvas.parentElement;
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0, h = 0, particles = [], mx = 0, my = 0, rafId, running = false, started = false;
    var palette = ['232,63,160', '232,63,160', '232,63,160', '17,17,16', '39,163,95'];
    function spawn(anywhere) {
      var depth = Math.random(); /* 0 = far/slow/faint, 1 = near/fast/bold */
      return { x: Math.random() * w, y: anywhere ? Math.random() * h : h + 12,
        r: 0.6 + depth * 2.2, vy: 0.15 + depth * 0.65, drift: (Math.random() - 0.5) * 0.3,
        alpha: 0.10 + depth * 0.34, rgb: palette[Math.floor(Math.random() * palette.length)], depth: depth };
    }
    function resize() {
      var nw = host.clientWidth, nh = host.clientHeight;
      if (nw === w && nh === h && particles.length) return;
      w = nw; h = nh;
      /* keep the drawing buffer locked to the rendered box — if they drift
         apart (fonts swap, images load), the round dots smear into streaks */
      canvas.width = w * DPR; canvas.height = h * DPR;
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      var count = Math.round(Math.min(36, w / 40));
      if (particles.length !== count) particles = Array.from({ length: count }, function () { return spawn(true); });
    }
    function tick() {
      if (!running) return;
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
    host.addEventListener('mousemove', function (e) {
      var r = host.getBoundingClientRect();
      mx = (e.clientX - r.left) / r.width - 0.5; my = (e.clientY - r.top) / r.height - 0.5;
    });
    host.addEventListener('mouseleave', function () { mx = 0; my = 0; });
    if ('ResizeObserver' in window) { new ResizeObserver(function () { resize(); }).observe(host); }
    else { var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(resize, 200); }); }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(resize);
    window.addEventListener('load', resize);
    /* decorative — start after idle so it never competes with first paint */
    var start = function () { started = true; resize(); running = true; cancelAnimationFrame(rafId); tick(); };
    if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 900 }); else setTimeout(start, 250);
    /* pause the rAF loop while the host section is scrolled out of view */
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (en) {
          if (!started) return;
          if (en.isIntersecting && !running) { running = true; cancelAnimationFrame(rafId); tick(); }
          else if (!en.isIntersecting) { running = false; cancelAnimationFrame(rafId); }
        });
      }).observe(host);
    }
  });

  /* grid spotlight follows the cursor */
  if (!matchMedia('(hover: none)').matches) {
    document.querySelectorAll('.hero-grid-spot, .contact-grid-spot').forEach(function (spot) {
      var host = spot.parentElement;
      host.addEventListener('mousemove', function (e) {
        var r = host.getBoundingClientRect();
        spot.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        spot.style.setProperty('--my', (e.clientY - r.top) + 'px');
        spot.classList.add('active');
      });
      host.addEventListener('mouseleave', function () { spot.classList.remove('active'); });
    });
  }
})();
