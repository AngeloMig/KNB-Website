/* KNB shared site footer — single source of truth for the footer.
   Injected synchronously where the <script src="footer.js"> tag sits, so the
   end-of-body scripts (work.js / main.js / contact inline) still wire up the
   "back to top" control. The base footer is identical on every page; the
   optional CTA band on top is page-specific and picked from CTAS below. */
(function () {
  var here = (location.pathname.split('/').pop() || 'index').toLowerCase().replace(/\.html$/, '') || 'index';

  // Page-specific CTA bands (homepage review CTA + per-platform CTAs).
  // em colour comes from each page's own --pcol, so these theme automatically.
  var CTAS = {
    index: `
      <div class="foot-cta">
        <div class="foot-cta-l">
          <h2>Ready to make your website <em>clearer?</em></h2>
          <p class="foot-cta-sub">Send your site or idea. We’ll review it and recommend the next step.</p>
        </div>
        <div class="foot-cta-row">
          <a href="contact.html?type=audit" class="btn foot-cta-btn"><span class="dot"></span>Get a free website review</a>
          <p class="foot-cta-trust">Free consultation. Clear scope. No pressure.</p>
        </div>
      </div>`,
    shopify: `
      <div class="foot-cta">
        <h2>Let’s build a store <em>worth selling on.</em></h2>
        <a href="contact.html" class="btn foot-cta-btn"><span class="dot"></span>Start your project</a>
      </div>`,
    webflow: `
      <div class="foot-cta">
        <h2>Let’s build something <em>worth visiting.</em></h2>
        <a href="contact.html" class="btn foot-cta-btn"><span class="dot"></span>Start your project</a>
      </div>`,
    wordpress: `
      <div class="foot-cta">
        <h2>Let’s build a site <em>worth managing.</em></h2>
        <a href="contact.html" class="btn foot-cta-btn"><span class="dot"></span>Start your project</a>
      </div>`
  };
  var cta = CTAS[here] || '';

  var html = `
  <footer id="footer">
    <div class="wrap">
      ${cta}
      <div class="foot-top">
        <div class="foot-brand">
          <div class="logo">KNB<i class="lgdot"></i></div>
          <p>Web design, Shopify revamps, and ongoing support for growing businesses.</p>
          <span class="foot-status"><span class="fs-dot"></span>Now booking new projects</span>
        </div>
        <nav class="foot-cols" aria-label="Footer navigation">
          <div class="foot-col">
            <h3>Explore</h3>
            <a href="portfolio.html">Work</a>
            <a href="pricing.html">Packages</a>
            <a href="about.html">About</a>
            <a href="contact.html">Contact</a>
          </div>
          <div class="foot-col">
            <h3>Platforms</h3>
            <a href="shopify.html">Shopify</a>
            <a href="webflow.html">Webflow</a>
            <a href="wordpress.html">WordPress</a>
          </div>
          <div class="foot-col">
            <h3>Get in touch</h3>
            <a class="foot-email" href="mailto:info@knb.solutions">info@knb.solutions</a>
            <span class="foot-loc">Philippines · Remote worldwide</span>
            <span class="foot-note">Usually replies within 1 business day</span>
          </div>
        </nav>
      </div>
      <div class="foot-mark" aria-hidden="true"></div>
      <div class="foot-bottom">
        <span>© 2026 KNB Web Solution. All rights reserved.</span>
        <div class="foot-bottom-r">
          <a href="privacy.html">Privacy</a>
          <a href="#top" class="foot-up">Back to top <span class="fu-arr" aria-hidden="true">↑</span></a>
        </div>
      </div>
    </div>
  </footer>`;

  var sc = document.currentScript;
  if (sc) sc.insertAdjacentHTML('beforebegin', html);
  else document.body.insertAdjacentHTML('beforeend', html);
})();
