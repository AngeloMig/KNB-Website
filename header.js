/* KNB shared site header — single source of truth for the nav.
   Injected synchronously where the <script src="header.js"> tag sits, so the
   end-of-body scripts (navmenu.js, main.js / work.js) still initialise it.
   Active state + logo href are derived from the current page. */
/* Canonical care-plan data — THE single source for names, hours, audiences.
   Consumed here (Packages mega menu), by pricing.html (card hydration + quiz)
   and by packages.js (care compare modal). Change hours HERE only. */
window.KNBDATA = {
  care: [
    { id: 'basic',    name: 'Basic',         hours: '5',       who: 'Light support',   resp: '2\u20133 day response' },
    { id: 'standard', name: 'Standard',      hours: '12',      who: 'Regular updates', resp: '1\u20132 day response' },
    { id: 'growth',   name: 'Growth',        hours: '20',      who: 'Active stores',   resp: '1 day response', popular: true, rollover: true },
    { id: 'premium',  name: 'Premium',       hours: '35',      who: 'Busy ecommerce',  resp: 'Same / next day response', rollover: true },
    { id: 'custom',   name: 'Custom System', hours: '20\u201340', who: 'Custom apps', resp: 'Response by agreement' }
  ]
};

(function () {
  var here = (location.pathname.split('/').pop() || 'index').toLowerCase().replace(/\.html$/, '') || 'index';
  var workPages = ['portfolio', 'shopify', 'webflow', 'wordpress', 'case-study'];
  var workActive = workPages.indexOf(here) !== -1 ? ' active' : '';
  var pkgActive = here === 'pricing' ? ' active' : '';
  var act = function (p) { return here === p ? ' class="active"' : ''; };
  var logoHref = here === 'index' ? '#top' : 'index.html';

  var html = `
  <nav class="nav" id="nav">
    <div class="wrap nav-inner">
      <a href="${logoHref}" class="logo" aria-label="KNB Web Solution — home"><span class="lw"><span class="ch">K</span><span class="ch">N</span><span class="ch">B</span><i class="ld"></i></span></a>
      <div class="nav-right">
        <div class="nav-links">
          <div class="nav-item nm">
            <button class="nm-trigger${workActive}" aria-haspopup="true" aria-expanded="false">Work
              <svg class="nm-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
            </button>
            <div class="nm-panel" role="menu">
              <div class="nm-wrap">
                <div class="nm-side">
                  <span class="nm-label">Browse</span>
                  <a href="portfolio.html">All work <span>44</span></a>
                  <a href="shopify.html">Shopify <span>6</span></a>
                  <a href="webflow.html">Webflow <span>10</span></a>
                  <a href="wordpress.html">WordPress <span>28</span></a>
                  <div class="nm-ind"><span class="nm-label">By industry</span><div class="nm-indchips"><span>Retail</span><span>Food</span><span>Software</span><span>Outdoor</span><span>Beauty</span></div></div>
                </div>
                <div class="nm-main">
                  <div class="nm-head"><div><span class="nm-label">Selected work</span><h3>Sites we've shipped</h3></div><div class="nm-filters"><button class="on" data-f="all">All</button><button data-f="shopify">Shopify</button><button data-f="webflow">Webflow</button><button data-f="wordpress">WordPress</button></div></div>
                  <div class="nm-thumbs">
                    <a class="nm-item" data-plat="shopify" href="shopify.html"><span class="nm-th"><img src="assets/shots/nav-lightmybricks.jpg" alt="" loading="lazy"><span class="nm-view">View &#8594;</span></span><span class="nm-cap"><b>Light My Bricks</b><small>Shopify · Retail</small></span></a>
                    <a class="nm-item" data-plat="webflow" href="webflow.html"><span class="nm-th"><img src="assets/shots/nav-feedbird.jpg" alt="" loading="lazy"><span class="nm-view">View &#8594;</span></span><span class="nm-cap"><b>Feedbird</b><small>Webflow · Software</small></span></a>
                    <a class="nm-item" data-plat="shopify" href="shopify.html"><span class="nm-th"><img src="assets/shots/nav-cacao.jpg" alt="" loading="lazy"><span class="nm-view">View &#8594;</span></span><span class="nm-cap"><b>Cacao Collective</b><small>Shopify · Food</small></span></a>
                    <a class="nm-item" data-plat="webflow" href="webflow.html"><span class="nm-th"><img src="assets/shots/nav-maestro.jpg" alt="" loading="lazy"><span class="nm-view">View &#8594;</span></span><span class="nm-cap"><b>Maestro Labs</b><small>Webflow · Software</small></span></a>
                    <a class="nm-item" data-plat="shopify" href="shopify.html"><span class="nm-th"><img src="assets/shots/nav-rise.jpg" alt="" loading="lazy"><span class="nm-view">View &#8594;</span></span><span class="nm-cap"><b>Rise Outdoor</b><small>Shopify · Outdoor</small></span></a>
                    <a class="nm-item" data-plat="wordpress" href="wordpress.html"><span class="nm-th"><img src="assets/shots/nav-coptrz.jpg" alt="" loading="lazy"><span class="nm-view">View &#8594;</span></span><span class="nm-cap"><b>Coptrz</b><small>WordPress · Drone tech</small></span></a>
                    <a class="nm-item" data-plat="wordpress" href="wordpress.html"><span class="nm-th"><img src="assets/shots/nav-coachman.jpg" alt="" loading="lazy"><span class="nm-view">View &#8594;</span></span><span class="nm-cap"><b>Coachman</b><small>WordPress · Automotive</small></span></a>
                    <a class="nm-item" data-plat="wordpress" href="wordpress.html"><span class="nm-th"><img src="assets/shots/nav-phoenix.jpg" alt="" loading="lazy"><span class="nm-view">View &#8594;</span></span><span class="nm-cap"><b>Phoenix Safe</b><small>WordPress · Security</small></span></a>
                  </div>
                  <div class="nm-foot"><span>44 projects · 3 platforms · 12+ industries</span><a href="portfolio.html">Browse the portfolio &#8594;</a></div>
                </div>
              </div>
            </div>
          </div>
          <div class="nav-item nm">
            <button class="nm-trigger${pkgActive}" aria-haspopup="true" aria-expanded="false">Packages
              <svg class="nm-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
            </button>
            <div class="nm-panel np-panel" role="menu">
              <div class="np-dip">
                <div class="np-side">
                  <div class="np-k"><b>Build</b><span class="nm-label">Website packages</span></div>
                  <a class="np-item" href="pricing.html#build-starter"><span class="np-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></svg></span><span class="np-tx"><b>Starter Website</b><span>Small businesses &amp; service sites</span></span></a>
                  <a class="np-item" href="pricing.html#build-business"><span class="np-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 21h18M5 21V7l7-4 7 4v14"/><path d="M9 9h.01M15 9h.01M9 13h.01M15 13h.01"/></svg></span><span class="np-tx"><b>Business Website<i class="np-pop">Popular</i></b><span>Growing companies, B2B, clinics</span></span></a>
                  <a class="np-item" href="pricing.html#build-ecom"><span class="np-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="20" r="1.2"/><circle cx="18" cy="20" r="1.2"/><path d="M2 3h3l2.4 12.3a1.6 1.6 0 0 0 1.6 1.3h8.6a1.6 1.6 0 0 0 1.6-1.3L23 7H6"/></svg></span><span class="np-tx"><b>Ecommerce Website</b><span>Shopify &amp; WooCommerce brands</span></span></a>
                  <a class="np-item" href="pricing.html#build-app"><span class="np-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg></span><span class="np-tx"><b>Custom Web App</b><span>Dashboards, portals, booking, POS</span></span></a>
                </div>
                <div class="np-side np-keep">
                  <div class="np-k"><b>Keep</b><span class="nm-label">Care plans &#183; monthly</span></div>
                  ${window.KNBDATA.care.map(function (c) { return '<a class="np-item' + (c.popular ? ' np-hot' : '') + '" href="pricing.html#care-' + c.id + '"><span class="np-tx"><b>' + c.name + (c.popular ? '<i class="np-pop">Popular</i>' : '') + '</b><span>' + c.who + '</span></span><span class="np-hrs">' + c.hours + ' hrs/mo</span></a>'; }).join('')}
                  <div class="np-cta">
                    <p><b>Not sure where to start?</b> A few quick questions point you to the right package &#8212; and the extras you&#8217;ll likely need.</p>
                    <div class="np-cta-row">
                      <a class="np-quiz-btn" href="pricing.html#quiz"><span></span>Take the 30-second quiz</a>
                      <a class="np-quote" href="contact.html">Or get an exact quote &#8594;</a>
                    </div>
                  </div>
                </div>
                <div class="np-dfoot"><span>4 packages &#183; 5 care plans &#183; quoted in writing</span><a href="pricing.html">See all packages &amp; plans &#8594;</a></div>
              </div>
            </div>
          </div>
          <a href="about.html"${act('about')}>About</a>
          <a href="contact.html"${act('contact')}>Contact</a>
        </div>
        <a href="contact.html" class="nav-cta"><span class="dot"></span>Start your project</a>
      </div>
      <button class="burger" id="burger" aria-label="Open menu" aria-controls="mnavSheet" aria-expanded="false"><span></span><span></span><span></span></button>
    </div>
  </nav>
  <!-- MOBILE NAV — bottom sheet (behaviour in navmenu.js, styles in navmenu.css) -->
  <div class="mnav-scrim" id="mnavScrim"></div>
  <div class="mnav-sheet" id="mnavSheet" role="dialog" aria-modal="true" aria-label="Menu" aria-hidden="true">
    <div class="mnav-grab" id="mnavGrab"><span></span></div>
    <div class="mnav-top"><span class="mnav-lbl">Menu</span><button class="mnav-x" id="mnavX" type="button" aria-label="Close menu">&#10005;</button></div>
    <div class="mnav-body">

      <button class="mnav-row" type="button" data-mnav-acc aria-expanded="false" aria-controls="mnavWork">Work <span class="mnav-cnt">44</span><span class="mnav-chev"></span></button>
      <div class="mnav-acc" id="mnavWork"><div class="mnav-acc-in"><div class="mnav-acc-pad">
        <div class="mnav-sub">
          <a href="portfolio.html">All work <span class="mnav-n">44</span></a>
          <a href="shopify.html">Shopify <span class="mnav-n">6</span></a>
          <a href="webflow.html">Webflow <span class="mnav-n">10</span></a>
          <a href="wordpress.html">WordPress <span class="mnav-n">28</span></a>
        </div>
        <div class="mnav-thumbs">
          <a class="mnav-thumb" href="shopify.html"><img src="assets/shots/nav-lightmybricks.jpg" alt="" loading="lazy"><b>Light My Bricks</b><small>Shopify &#183; Retail</small></a>
          <a class="mnav-thumb" href="webflow.html"><img src="assets/shots/nav-feedbird.jpg" alt="" loading="lazy"><b>Feedbird</b><small>Webflow &#183; Software</small></a>
          <a class="mnav-thumb" href="shopify.html"><img src="assets/shots/nav-cacao.jpg" alt="" loading="lazy"><b>Cacao Collective</b><small>Shopify &#183; Food</small></a>
          <a class="mnav-thumb" href="wordpress.html"><img src="assets/shots/nav-coptrz.jpg" alt="" loading="lazy"><b>Coptrz</b><small>WordPress &#183; Tech</small></a>
        </div>
      </div></div></div>

      <button class="mnav-row" type="button" data-mnav-acc aria-expanded="false" aria-controls="mnavPkg">Packages <span class="mnav-chev"></span></button>
      <div class="mnav-acc" id="mnavPkg"><div class="mnav-acc-in"><div class="mnav-acc-pad">
        <div class="mnav-grpk">Build &#183; website packages</div>
        <a class="mnav-pkg" href="pricing.html#build-starter"><span class="mnav-pic"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></svg></span><span class="mnav-tx"><b>Starter Website</b><span>Small businesses &amp; service sites</span></span></a>
        <a class="mnav-pkg" href="pricing.html#build-business"><span class="mnav-pic"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 21h18M5 21V7l7-4 7 4v14"/></svg></span><span class="mnav-tx"><b>Business Website <i class="mnav-pop">Popular</i></b><span>Growing companies, B2B, clinics</span></span></a>
        <a class="mnav-pkg" href="pricing.html#build-ecom"><span class="mnav-pic"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="20" r="1.2"/><circle cx="18" cy="20" r="1.2"/><path d="M2 3h3l2.4 12.3a1.6 1.6 0 0 0 1.6 1.3h8.6a1.6 1.6 0 0 0 1.6-1.3L23 7H6"/></svg></span><span class="mnav-tx"><b>Ecommerce Website</b><span>Shopify &amp; WooCommerce brands</span></span></a>
        <a class="mnav-pkg" href="pricing.html#build-app"><span class="mnav-pic"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg></span><span class="mnav-tx"><b>Custom Web App</b><span>Dashboards, portals, booking, POS</span></span></a>
        <div class="mnav-grpk">Keep &#183; care plans &#183; monthly</div>
        ${window.KNBDATA.care.map(function (c) { return '<a class="mnav-pkg" href="pricing.html#care-' + c.id + '"><span class="mnav-tx"><b>' + c.name + (c.popular ? '<i class="mnav-pop">Popular</i>' : '') + '</b><span>' + c.who + '</span></span><span class="mnav-hrs">' + c.hours + ' hrs/mo</span></a>'; }).join('')}
        <div class="mnav-quizrow">
          <a class="mnav-quiz" href="pricing.html#quiz"><span></span>Take the 30-second quiz</a>
          <a class="mnav-alt" href="contact.html">or get an exact quote &#8594;</a>
        </div>
      </div></div></div>

      <a class="mnav-row" href="about.html">About</a>
      <a class="mnav-row mnav-row-last" href="contact.html">Contact</a>
    </div>
    <div class="mnav-cta">
      <a class="mnav-start" href="contact.html"><span class="dot"></span>Start your project</a>
      <a class="mnav-email" href="mailto:info@knb.solutions">info@knb.solutions &#8594;</a>
    </div>
  </div>`;

  var sc = document.currentScript;
  if (sc) sc.insertAdjacentHTML('beforebegin', html);
  else document.body.insertAdjacentHTML('afterbegin', html);
})();
