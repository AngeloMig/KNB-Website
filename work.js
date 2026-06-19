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
})();
