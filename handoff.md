# KNB Web Solution — Project Handoff

> Working doc for continuing this build across Claude / Codex / other sessions.
> **Rule: whenever you finish or change something meaningful, update the "Changelog" and "Open items" sections at the bottom.**

---

## 1. What this is
Marketing website for **KNB Web Solution** — a Philippines-based web design & development agency.
Services: **Shopify** store revamps & ecommerce, **WordPress/WooCommerce** sites, **Webflow** & custom business websites, maintenance/support retainers, and custom web apps.
Primary CTA everywhere: **"Start your project."** (Was "Get a free audit" — changed 2026-06-19 because "audit" assumes an existing site and excluded new-build customers. Button/nav labels = "Start your project"; the *offer* in prose = "free consultation" / "written proposal". "Audit" is now only kept where it's a real deliverable, e.g. the Ecommerce plan's "Store audit & customer-journey review".)

It is NOT a Shark Tank / creative-branding agency — the site started as a clone of the Tankfluence Webflow template, so any leftover placeholder copy should be replaced with real KNB content.

## 2. Tech & how to run
- **Pure static** HTML/CSS/JS — **no build step, no framework, no package manager.**
- Just open the file in a browser: `open index.html` (or use a static server: `python3 -m http.server 8000`).
- External deps (all via CDN, need internet):
  - **GSAP 3.12.5 + ScrollTrigger** (cloudflare CDN) — all scroll/hover animation.
  - **Satoshi** font via Fontshare (`api.fontshare.com`).
  - **simpleicons CDN** (`cdn.simpleicons.org/<slug>`) — brand logos (shopify, webflow, wordpress, woocommerce, figma, framer).
  - **picsum.photos** — placeholder project/testimonial images (seeded URLs).

## 3. File map
| File | Purpose |
|---|---|
| `index.html` | Home page (markup only — CSS/JS are external now). |
| `styles.css` | All home-page styles (extracted from index.html). |
| `main.js` | All home-page JS (extracted from index.html). Runs after GSAP CDN scripts. |
| `contact.html` | Contact page — **still has its own inline `<style>`/`<script>`** (not yet refactored). |
| `portfolio.html` | Portfolio overview — links to the 3 platform pages. Uses `work.css` + `work.js`. |
| `shopify.html` / `webflow.html` / `wordpress.html` | Per-platform work pages, each with its own project grid. Use `work.css` + `work.js`. |
| `case-study.html` | **Reusable case-study template** (Lumen example). Duplicate per real project. Uses `work.css` + `work.js`. Linked from the portfolio spotlight. |
| `work.css` / `work.js` | Shared styles/JS for portfolio + platform pages (nav, footer, buttons, reveal). |
| `headline-preview.html` | **Scratch/preview page** — used to compare design options (headline animations, marquee, stats counters, chevron behaviors, "how we work" ideas). Not linked from the site; safe to ignore or delete. |
| `index.html.bak` | Backup taken before the CSS/JS extraction refactor. Delete when confident. |
| `handoff.md` | This file. |

> Note: there are **two CSS/JS systems** — home page uses `styles.css`/`main.js`; the portfolio/platform pages use `work.css`/`work.js`. `contact.html` is still inline. Keep that in mind when changing shared-looking components (nav, footer, buttons exist in all three).

## 4. Conventions & hard rules
- **NO PRICING on the public site.** KNB's pricing, commission %, and internal procedures are confidential (per their SOP). Plans/packages show *coverage/scope only* + "Get a quote / free audit". Client-facing "Starting at …" prices exist in their guide but are **not added yet** — only add if the user explicitly asks.
- **No sales/ranking guarantees** in copy (their SOP forbids it).
- Email placeholder is `youremail@gmail.com` (not yet replaced with a real address).
- Brand: off-white bg `#f4f3ef`, near-black ink `#111110`, pink accent `#e83fa0`, green status dot `#6cf09a`. Font weights are light (Satoshi 500 for headings, not 800).
- Animations are GSAP-driven; most use `ScrollTrigger`. Respect `prefers-reduced-motion` where added.
- The site is centered/responsive; `html, body { overflow-x: clip }` prevents horizontal scroll — don't reintroduce wide/un-clipped elements.

## 5. Home page (`index.html`) section rundown
Order: **nav → hero → marquee → stats → services → process → projects → plans → maintenance → why-knb → logo wall → testimonials → faq → footer.**

- **Nav** — floating glass pill; transparent over hero, solid blur on scroll; mobile hamburger → full-screen overlay; CTA "Free audit".
- **Hero** — caption "Design · Build · Convert"; headline "KNB Web Solution" with **cursor-reactive letters** (lift toward mouse); 3 platform cards (Shopify center / Webflow left / WordPress right) that **deal in (spread outward), float + tilt, gradient-drift + sheen**, and on **hover grow + raise z-index above the headline** (no fan/compress). Background: drifting grid + cursor spotlight + canvas dust particles (pink-tinted). Foot: subtitle left, CTA + email right.
- **Marquee** — two opposing rows; hover pauses a row + highlights the hovered word pink; ✸ separators are pink.
- **Stats** — 3+/40+/100+ count up on scroll.
- **Services** — scroll-fill intro (grey→black word by word) on the left + **floating tech-logo cluster** (Shopify/WordPress/Webflow/Figma/Framer/WooCommerce badges, 134px, compact honeycomb) on the right; then 01–04 service rows.
- **Process ("How we work")** — heading + 4 steps that **flow in left→right on scroll**; big drifting **"PROCESS"** watermark; **full-width chevron "comet"** band at the top of the steps (1 black + ~5–6 fading tail + rest invisible, flows left→right infinitely, JS-generated to fill width).
- **Projects ("Recent websites & store revamps")** — header with **"View full portfolio"** button; **filter tabs** (All/Shopify/Webflow/WordPress); **featured card** (Lumen, full-width) + 4 cards; each card has a **platform chip + outcome line** and **links to its platform page**; cursor dot-spotlight background.
- **Plans ("Solutions for every stage")** — **interactive package selector**: hover a package (Starter/Business/Ecommerce/Custom Web App) on the left → detail panel swaps on the right (editorial headline + fact chips + Included vs Quoted-separately columns + CTA). Background: faint blueprint lines + "PLANS" watermark + pink spotlight that re-blooms on switch.
- **Maintenance** — inverted dark section with faint keyword watermark; **5 named tier cards** (Basic Care → Standard → Growth → Premium → Custom System Support; Growth flagged "Most popular"). Each shows best-for + coverage + response time. **No monthly fees and no hour counts** shown (kept confidential per the package guide); aligned to the guide's retainer model.
- **Why KNB** — 4 value points with icons that spin in; scroll-reactive pink rail + "04" marker.
- **Logo wall** — second marquee of placeholder client logos.
- **Testimonials** — slider, arrows, 5s autoplay; star-pattern bg.
- **FAQ** — accordion; "FAQ" watermark.
- **Footer** — logo, socials (SVG), copyright.

Each section has a **distinct scroll-in animation** (slide-left, scale-pop, 3D flip, slide-right, rise+icon-spin, etc.) defined in `main.js`.

## 6. Open items / TODO
- [ ] Replace `youremail@gmail.com` with the real email everywhere.
- [ ] `contact.html` still has inline CSS/JS — could refactor to share `work.css`/`work.js` or `styles.css`.
- [ ] Project cards, testimonials, logo wall still use **placeholder** images (picsum) and **made-up** project names + scope lines — swap for real work when available. (When real assets exist, the natural next step is per-project case-study pages so cards can link to detail again.)
- [ ] Decide whether to add real client-facing prices to Plans (currently intentionally omitted).
- [ ] `index.html.bak` backup can be deleted once the refactor is confirmed stable.
- [ ] Footer/socials point to `#` — add real social links.
- [ ] Platform work pages (shopify/webflow/wordpress) use placeholder projects too.
- [ ] **Portfolio testimonials are placeholder** (`[Client name]` / `[Sample Brand]`) — replace with real, attributable quotes (with permission) before launch. Do NOT ship fabricated quotes.
- [ ] **Portfolio marquee** shows placeholder brand wordmarks — replace with real client logos or remove before launch.
- [ ] **Portfolio stats** ("18 / 3 / 12+") are placeholder — confirm the real numbers before launch.
- [ ] Add `og:image` + absolute `og:url` to `portfolio.html` (and ideally all pages) once hosted on the real domain. SEO meta only added to `portfolio.html` so far — other pages still need description/OG tags.
- [ ] `case-study.html` is a **template** — duplicate it per real project and link the matching project cards to each, once real case-study content exists.

## 7. Changelog (append newest at top — keep this updated!)
- **2026-06-19** — Portfolio audit items 1–10 implemented. **(1) SEO:** added meta description + Open Graph + Twitter tags to `portfolio.html` (og:image/og:url left as TODO — need the live domain). **(2) Alt text:** all 18 grid images now have descriptive alt (name + platform); decorative spotlight icon stays empty. **(3) Perf:** `loading="lazy"` + `decoding="async"` on all 18 grid images. **(4) A11y:** filter buttons use `aria-pressed` + a `role=group`; an `aria-live` `#filterStatus` announces the visible count; the before/after handle has `aria-valuemin/max/now` updated live (drag + arrow keys). **(5)+(6) Marquee:** wrapped as `role="img"` with one honest label so screen readers don't read the duplicated row twice (`aria-hidden` on the track). **(9) Testimonials:** new section before the CTA — **PLACEHOLDER quotes with `[Client name]`/`[Sample Brand]` attributions; must be replaced with real, attributable quotes before launch.** **(10) Case studies:** new `case-study.html` reusable template (Lumen example — hero, meta row, before/after, Challenge/What we did/Result, gallery, next-project, CTA); the portfolio spotlight CTA now links to it ("Read the full case study →"). New CSS in `work.css` (`.sr-only`, `.testi-*`, `.cs-*`); new JS in `work.js` for the a11y wiring. **Still content-dependent (6/7/8):** marquee brand names, all picsum images, and the "18/3/12+" stats are placeholders — swap for real before launch.
- **2026-06-19** — Checked all site copy against KNB's internal **Package Coverage / Maintenance / Designer Payment guide** (`.docx`). Findings: the 4 **Plans** panels, the **Services** block, and the **contact** dropdown already matched the guide's Section 2 coverage (page counts, revision rounds, support windows, included/excluded splits) — no changes needed. No prices or guarantee/ranking claims anywhere (compliant). **Changed:** rebuilt the **Maintenance** section from 4 generic care themes into the guide's real model — 5 named tier cards (Basic Care → Custom System Support, Growth = "Most popular") with coverage + response time. Deliberately **no peso amounts and no consumable-hour counts** (confidential). New CSS `.maint-head`/`.maint-plans`/`.mplan` in `styles.css`; old `.maint-grid`/`.maint-item`/`.maint-list` styles now dead (safe to delete). NOTE: the guide still calls step 1 a "free website or store audit" — the site intentionally diverges (uses "free consultation" / "Start your project") per the prior CTA decision, to include new-build customers.
- **2026-06-19** — Site-wide CTA rewording. Replaced "Get a free audit" / "Free audit" with **"Start your project"** on every button + nav across `index.html`, `portfolio.html`, `shopify/webflow/wordpress.html`, `contact.html` (contact form submit → "Start my project"; CTA-box eyebrows → "Get started" to avoid duplicating the button). Reworded the *prose* "audit" mentions (hero, process step 01, plans-sub, why-point, FAQ, contact lead/step) to "free consultation" + goal-first language so new-build customers aren't excluded. Left intact: the internal `auditForm` id/JS in `contact.html`, and "Store audit & customer-journey review" in the Ecommerce plan (a genuine deliverable). `headline-preview.html` (scratch) not touched.
- **2026-06-19** — Full portfolio **hub** (`portfolio.html`) rebuild combining 5 ideas: (1) **filterable work grid** — all 18 projects on the hub with platform filter tabs (All/Shopify/Webflow/WordPress); (2) **editorial mosaic** — a wide "feature" tile (`.proj-card.feat` spans 2 cols) in the All view, auto-resets to uniform when a filter is active; (3) **proof-forward hero** — animated stat counters (18 projects / 3 platforms / 12+ industries) + a CSS client-logo marquee (placeholder wordmarks); (4) **case-study spotlight** — Lumen Apparel with a draggable before/after slider (grayscale→color) + Problem/Approach/Outcome (scope-only, no metrics per SOP); (5) **motion** — per-card platform accent bar + colored hover wash + scroll reveals. New CSS in `work.css` (hero stats, marquee, spotlight + `.ba` slider, filter tabs, `.pf-grid` mosaic) and new JS in `work.js` (count-up, filter tabs, before/after drag — all guarded so the platform pages are unaffected). Cards still link to platform pages (no per-project detail pages yet). Verified live (hero/spotlight/grid/filter) at desktop width. Note: counters use `requestAnimationFrame`, which is paused in hidden tabs — fine in a real visible browser. The old `.cats`/`.cat-card`/`.cats-grid`/`.plat-shopify|webflow|wordpress` styles in `work.css` are now **dead** (the hub no longer uses the 3-card menu) — safe to delete.
- **2026-06-19** — Revamped the shared CTA block (`.cta-box` in `work.css`, markup on `portfolio.html` + all 3 platform pages). Was a plain centered black box; now an asymmetric editorial split (headline left / pitch + action right) with a pink "Free audit" eyebrow, dotted texture, a pink corner glow, an arrow button, and a green-dot trust row (Free · No obligation · …). Collapses to a single column under 860px. Trust items are scope-only (no guarantees, per SOP). Verified at mobile + desktop widths via the preview.
- **2026-06-19** — Portfolio "structure + honesty" pass. Fixed false project counts on the hub (`portfolio.html`: Shopify 8→6, WordPress 7→6; all three grids actually hold 6). Removed the dead-end "View project →" tag from platform-page cards (no detail pages exist) and added an honest **scope line** per card (describes *what we did* — scope only, no invented metrics, per the no-guarantees SOP rule). Added a **"Featured work"** section to the hub (`portfolio.html`) — 3 cards (one per platform) that link to their platform pages, so the portfolio landing shows real work instead of being a bare 3-button menu. `work.css`: restructured `.proj-meta` (now `.proj-top` row + `.proj-scope`), added `.proj-grid.cols-3`, made `a.proj-card` the clickable variant. Added `.claude/launch.json` (static-server preview config; note: `python3 -m http.server` fails under the Claude preview sandbox but works in a normal terminal).
- **2026-06-19** — Created this handoff doc. Refactored `index.html` (inline CSS→`styles.css`, JS→`main.js`); fixed horizontal scroll (`overflow-x: clip`). Built interactive Plans selector + redesigned detail panel (chips + included/excluded). Revamped Projects (portfolio button, filter tabs, featured card, platform chips/links, outcome lines). Added floating tech-logo cluster to Services (bigger/compact). Process chevrons → full-width left→right "comet". Added sections: Process, Plans, Maintenance, Why KNB, FAQ. Per-section distinct scroll animations + per-section backgrounds. Hero platform cards + many hero animation iterations.
