/* packing line — class-based timeline for the "What we do" scene (packline.css).
   Markup is static per page; this only choreographs classes:
   roll in → open (4 flaps) → all labels fan out, hold 6s → pack up → seal, stamp
   (+thud +confetti) → roll out → repeat. Pauses fully offscreen; skips under
   reduced motion (CSS shows the static grid instead). */
(function () {
  if (matchMedia('(prefers-reduced-motion:reduce)').matches) return;

  document.querySelectorAll('.pl-stage').forEach(function (stage) {
    var box = stage.querySelector('.pl-box');
    var tags = [].slice.call(stage.querySelectorAll('.pl-ftag'));
    if (!box || !tags.length) return;
    var t = [], running = false;

    function after(ms, fn) { t.push(setTimeout(fn, ms)); }

    function cycle() {
      var d = 0;
      box.classList.remove('sealed', 'stamped', 'out');
      box.classList.add('in'); void box.offsetWidth;
      after(d += 120, function () { box.classList.remove('in'); });          // roll to center
      after(d += 1150, function () { box.classList.add('open'); });          // lid opens
      after(d += 450, function () {                                          // all four fan out
        box.classList.remove('pop', 'burst'); void box.offsetWidth; box.classList.add('pop', 'burst');
        tags.forEach(function (tg, k) { after(k * 130, function () { tg.classList.remove('hide'); tg.classList.add('up'); }); });
      });
      after(d += 6000 + 4 * 130, function () {                               // hold 6s, then pack up
        tags.forEach(function (tg, k) { after(k * 90, function () { tg.classList.remove('up'); tg.classList.add('hide'); }); });
        box.classList.remove('pop', 'burst');
      });
      after(d += 750, function () { box.classList.remove('open'); });
      after(d += 550, function () { box.classList.add('sealed'); });
      after(d += 650, function () {                                          // stamp + thud + confetti
        box.classList.add('stamped');
        stage.classList.remove('pl-thud'); void stage.offsetWidth; stage.classList.add('pl-thud');
      });
      after(d += 1500, function () { box.classList.add('out'); });
      after(d += 1300, cycle);
    }

    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && !running) {
          running = true; stage.classList.remove('pl-frozen'); cycle();
        } else if (!e.isIntersecting && running) {
          running = false; t.forEach(clearTimeout); t = [];
          stage.classList.add('pl-frozen');
          tags.forEach(function (tg) { tg.classList.remove('up'); tg.classList.add('hide'); });
        }
      });
    }, { threshold: 0.25 });
    io.observe(stage);
    stage.classList.add('pl-frozen'); // frozen until first seen
  });
})();
