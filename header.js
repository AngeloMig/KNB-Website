/* KNB shared site header — single source of truth for the nav.
   Injected synchronously where the <script src="header.js"> tag sits, so the
   end-of-body scripts (navmenu.js, main.js / work.js) still initialise it.
   Active state + logo href are derived from the current page. */
(function () {
  var here = (location.pathname.split('/').pop() || 'index').toLowerCase().replace(/\.html$/, '') || 'index';
  var workPages = ['portfolio', 'shopify', 'webflow', 'wordpress', 'case-study'];
  var workActive = workPages.indexOf(here) !== -1 ? ' active' : '';
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
                    <a class="nm-item" data-plat="shopify" href="shopify.html"><span class="nm-th"><img src="https://s.wp.com/mshots/v1/https%3A%2F%2Fwww.lightmybricks.com%2F?w=320" alt="" loading="lazy"><span class="nm-view">View &#8594;</span></span><span class="nm-cap"><b>Light My Bricks</b><small>Shopify · Retail</small></span></a>
                    <a class="nm-item" data-plat="webflow" href="webflow.html"><span class="nm-th"><img src="https://s.wp.com/mshots/v1/https%3A%2F%2Ffeedbird.com%2F?w=320" alt="" loading="lazy"><span class="nm-view">View &#8594;</span></span><span class="nm-cap"><b>Feedbird</b><small>Webflow · Software</small></span></a>
                    <a class="nm-item" data-plat="shopify" href="shopify.html"><span class="nm-th"><img src="https://s.wp.com/mshots/v1/https%3A%2F%2Fwww.cacaocollective.com.au%2F?w=320" alt="" loading="lazy"><span class="nm-view">View &#8594;</span></span><span class="nm-cap"><b>Cacao Collective</b><small>Shopify · Food</small></span></a>
                    <a class="nm-item" data-plat="webflow" href="webflow.html"><span class="nm-th"><img src="https://s.wp.com/mshots/v1/https%3A%2F%2Fwww.maestrolabs.com%2F?w=320" alt="" loading="lazy"><span class="nm-view">View &#8594;</span></span><span class="nm-cap"><b>Maestro Labs</b><small>Webflow · Software</small></span></a>
                    <a class="nm-item" data-plat="shopify" href="shopify.html"><span class="nm-th"><img src="https://s.wp.com/mshots/v1/https%3A%2F%2Friseoutdoor.com.au%2F?w=320" alt="" loading="lazy"><span class="nm-view">View &#8594;</span></span><span class="nm-cap"><b>Rise Outdoor</b><small>Shopify · Outdoor</small></span></a>
                    <a class="nm-item" data-plat="wordpress" href="wordpress.html"><span class="nm-th"><img src="https://s.wp.com/mshots/v1/https%3A%2F%2Fcoptrz.com%2F?w=320" alt="" loading="lazy"><span class="nm-view">View &#8594;</span></span><span class="nm-cap"><b>Coptrz</b><small>WordPress · Drone tech</small></span></a>
                    <a class="nm-item" data-plat="wordpress" href="wordpress.html"><span class="nm-th"><img src="https://s.wp.com/mshots/v1/https%3A%2F%2Fcoachman.co.uk%2F?w=320" alt="" loading="lazy"><span class="nm-view">View &#8594;</span></span><span class="nm-cap"><b>Coachman</b><small>WordPress · Automotive</small></span></a>
                    <a class="nm-item" data-plat="wordpress" href="wordpress.html"><span class="nm-th"><img src="https://s.wp.com/mshots/v1/https%3A%2F%2Fphoenixsafe.co.uk%2F?w=320" alt="" loading="lazy"><span class="nm-view">View &#8594;</span></span><span class="nm-cap"><b>Phoenix Safe</b><small>WordPress · Security</small></span></a>
                  </div>
                  <div class="nm-foot"><span>44 projects · 3 platforms · 18+ industries</span><a href="portfolio.html">Browse the portfolio &#8594;</a></div>
                </div>
              </div>
            </div>
          </div>
          <a href="pricing.html"${act('pricing')}>Pricing</a>
          <a href="about.html"${act('about')}>About</a>
          <a href="contact.html"${act('contact')}>Contact</a>
        </div>
        <a href="contact.html" class="nav-cta"><span class="dot"></span>Start your project</a>
      </div>
      <button class="burger" id="burger" aria-label="Menu"><span></span><span></span><span></span></button>
    </div>
  </nav>
  <div class="mobile-menu" id="mobileMenu">
    <a href="portfolio.html">Portfolio</a>
    <div class="mm-plats"><a href="shopify.html">Shopify</a><a href="webflow.html">Webflow</a><a href="wordpress.html">WordPress</a></div>
    <a href="pricing.html">Pricing</a>
    <a href="about.html">About</a>
    <a href="contact.html">Contact</a>
    <a href="mailto:info@knb.solutions" class="mm-foot">info@knb.solutions &#8594;</a>
  </div>`;

  var sc = document.currentScript;
  if (sc) sc.insertAdjacentHTML('beforebegin', html);
  else document.body.insertAdjacentHTML('afterbegin', html);
})();
