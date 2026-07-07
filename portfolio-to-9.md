# Portfolio page → 9/10 in every aspect

Target file: `portfolio.html` (+ `work.js`, `testimonials.js`, `work.css`)
Current overall: ~7.5/10. Two aspects already sit at 9 (visual design, code quality, SEO). This doc covers **only what's needed to raise the other five** — accessibility, performance, responsive, UX, and (the big one) content credibility.

Work top-to-bottom; each section has **Do**, **Where**, and **Done when** so you can check yourself off.

---

## 1. Content credibility — 4 → 9  *(highest impact; do this first)*

The page is engineered like it's done but populated like a demo. Three placeholders are actively costing trust. Nothing else on this list matters if a visitor spots fake content first.

### 1a. Replace the fabricated "Lumen Apparel" case study
**Where:** `portfolio.html` lines 110–133 (the `.spotlight` section).
**Problem:** "Lumen Apparel" isn't a real client, and the before/after slider is the *same* `picsum.photos` random image shown once in colour and once in grayscale (lines 114–115).

**Do:**
1. Pick one real project you can show fully — ideally **Light My Bricks** or **Cacao Collective** (already your featured/first card).
2. Capture two real screenshots: the site *before* your work and *after* (or two states you can honestly label). Save as `case-lumen-before.webp` / `-after.webp` → rename to the real brand.
3. Replace the two `picsum` `src`s (lines 114–115) with the local files.
4. Rewrite `<h2>`, the `.spot-chip`, and the three `<dd>` Problem/Approach/Outcome lines (lines 122–128) with true specifics. Keep outcomes qualitative unless you have permission to quote metrics — no invented "+37% conversion".
5. Confirm `case-study.html` (the "Read the full case study" target, line 129) matches the same real project.

**Done when:** every word and pixel in the spotlight is real and defensible, and the before/after are two genuinely different images.

### 1b. Swap placeholder testimonials for real, permissioned quotes
**Where:** `testimonials.js` — the `T` data array (see the `NOTE` on line 10: *"names below are illustrative placeholders … Get written permission + a real quote from each client before launch"*).

**Do:**
1. Collect at least **6 real quotes** (two marquee rows) with the client's written OK to publish name + company.
2. Replace each object's `q` (quote), `n` (name), and company/`meta` fields with the real values. Keep the `p` (platform) tag accurate so the "See the work" deep-link lands on the right filter.
3. If you can't get 6, show fewer — **4 real beats 8 fake.** Trim the array; the marquee handles any count.
4. Keep the `4.9 · 40+ projects` proof line (`portfolio.html:471`) only if it's true. If you don't track a rating, replace with something verifiable ("40+ projects shipped since 2021").

**Done when:** no string in `testimonials.js` is invented, and you hold written permission for each name shown.

### 1c. Resolve the client marquee permission TODO
**Where:** `portfolio.html` lines 103–107 (`<!-- TODO: swap to actual logos / confirm permission before launch -->`).

**Do:** For each of the 12 names, either (a) confirm you may list them as clients, or (b) drop the name. If you have logo permission, swap the text wordmarks for greyscale SVG logos (stronger trust signal). Then delete the TODO comment.

**Done when:** every marquee name is cleared for public display and the TODO is gone.

**Aspect hits 9 when:** a stranger can't find a single fabricated client, quote, image, or stat on the page.

---

## 2. Performance — 6.5 → 9  *(biggest technical lift)*

All 44 grid thumbnails are fetched **live at runtime** from `s.wp.com/mshots` with `picsum.photos` fallbacks (`work.js:222`). That's 44 third-party requests to a service that returns blank/half-rendered tiles on first hit, plus random stock images when it fails. It's the main thing separating this from a fast page.

### 2a. Self-host the 44 thumbnails
**Do:**
1. Generate one clean screenshot per project (1200px wide is enough; the modal also uses `?w=1200`). A headless-Chrome script over the 44 `data-url`s will do it in one pass.
2. Export as **WebP** (~80 quality), name them by slug, e.g. `thumbs/light-my-bricks.webp`. Target < 80 KB each.
3. On each `<article class="proj-card">`, add `data-thumb="thumbs/<slug>.webp"`.
4. In `work.js`, in the `load(img)` function (lines 212–223), prefer the local file:
   ```js
   const local = card && card.dataset.thumb;
   img.src = local || (url ? 'https://s.wp.com/mshots/v1/' + encodeURIComponent(url) + '?w=1200' : (fallback || ''));
   ```
   Keep the mShots URL as the *fallback* on error instead of `picsum`, so a missing file degrades to a real screenshot, never a random stock photo.
5. Do the same substitution in the modal `open()` path (`work.js:272–273`) and the platform-page copy (`work.js:605`).

### 2b. Kill layout shift (CLS) on the grid
**Where:** every `<img class="pf-shot">` (e.g. line 183) has no dimensions.
**Do:** add intrinsic size so the browser reserves space before load:
```html
<img class="pf-shot" width="720" height="495" decoding="async" ...>
```
or set `aspect-ratio: 16 / 11;` on `.proj-img img` in `work.css`. Match the ratio you actually export.

### 2c. Prioritise the hero, lazy-load the rest
**Do:**
- The hero mock images (`portfolio.html:92,96`) are above the fold — remove `loading="lazy"` from those two and add `fetchpriority="high"` to the front one. Everything below the fold stays lazy (already correct via the IntersectionObserver).
- Add `<link rel="preload" as="image" href="thumbs/light-my-bricks.webp">` in `<head>` for the one featured card that's above the fold.

**Aspect hits 9 when:** thumbnails render instantly and identically on every load with no third-party dependency, and Lighthouse CLS < 0.1 / LCP < 2.5s on a mid-tier phone.

---

## 3. Accessibility — 8 → 9  *(small, precise fixes)*

The modal is already strong (focus trap `work.js:306`, Escape `:304`, focus return `:292`, arrow-key nav `:320`, keyboard slider `:357`). Only a few gaps remain.

**Do:**
1. **Industry chips lack pressed state.** The platform pills use `aria-pressed` (`portfolio.html:145–152`) but `.ind-chip` buttons (lines 170–175) don't. Add `aria-pressed="false"` to each, and in `work.js` line 172 (which already toggles the `.active` class) also toggle the attribute:
   ```js
   document.querySelectorAll('.ind-chip').forEach((c) => {
     const on = c.dataset.filter === f;
     c.classList.toggle('active', on);
     c.setAttribute('aria-pressed', on);
   });
   ```
2. **Focus visibility.** Confirm every interactive element (chips, `.view-details`, `.cat`, modal tabs) shows a visible `:focus-visible` outline against both `--card` and `--ink` backgrounds. Add a token-based ring in `work.css` if any are outline:none without a replacement.
3. **Reduced-motion.** The FLIP and slider hint already respect `prefers-reduced-motion`. Verify the hero particle canvas (`#heroParticles`) and marquee also pause/omit under it — if not, gate them the same way.
4. **Contrast.** Check `.proj-scope` and `.ind-label` muted text (`var(--muted)`) hit 4.5:1 on `--card`. Nudge the token if borderline.

**Aspect hits 9 when:** you can drive the whole page — filter, search, open a project, page through prev/next, work the before/after slider — with keyboard only, every state is announced, and axe/Lighthouse a11y ≥ 95.

---

## 4. Responsive / mobile — 8 → 9  *(verification pass)*

The breakpoints exist; they just haven't been proven on-device. Use the headless-Chrome harness from your QA notes (500px min window → iframe harness for a true 390px viewport).

**Check at 390px, 768px, 1024px:**
- Hero split: does the `.hero-stack` mock collapse cleanly below the copy, or overflow? (line 89)
- Grid: 1 col at 390, 2 at 768 — no clipped `.proj-scope`, no overlapping `.pf-tags` chips.
- Filter row: pills + search + sort wrap without horizontal scroll (the `@media (max-width:600px)` rule at line 55 makes search full-width — confirm it fires).
- Modal: `.pfm-nav` prev/next don't cover the screenshot at 390 (rule at line 50); live-preview iframe is tappable and scrollable.
- Before/after handle: draggable with touch (touchstart is `passive:true`, `work.js:354`) — confirm it still moves.

**Do:** fix any overflow with the existing token spacing; don't introduce new literals (per your design-token system).

**Aspect hits 9 when:** all three widths are screenshot-verified with zero horizontal scroll and no clipped/overlapping content.

---

## 5. UX & interaction — 9 → 9  *(hold the line + two polish items)*

Already excellent (filter counts, sort, search, load-more FLIP, modal with live preview, deep-linking, copy-link). Two small things keep it at 9 after the content swap:

1. **Empty-state honesty.** When self-hosting thumbnails, make sure a project with no thumb still shows *something* real (mShots fallback), never a broken-image icon.
2. **Search + industry combined.** Confirm searching while an industry chip is active still ANDs correctly (`matches()` in `work.js:111` handles filter+search — just verify after adding `aria-pressed`).

**Aspect stays 9 when:** every control still works after the content and thumbnail changes — regression-check filter counts still read `6 / 10 / 28`.

---

## Suggested order & rough effort
1. **§1 Content** (case study, testimonials, marquee) — mostly your input/permissions, half a day once assets are in hand. *Biggest score jump.*
2. **§2 Performance** (self-host thumbnails + dimensions) — one screenshot script + ~15 lines of JS. ~2–3 hrs.
3. **§3 Accessibility** (aria-pressed, focus ring, contrast) — ~1 hr.
4. **§4 Responsive** (verify + patch) — ~1 hr.
5. **§5 UX** regression check — 20 min.

Do §1 and §2 and you're already at a genuine 9 overall; §3–§5 lock it in across the board.

---

## Final acceptance checklist (all-9 gate)
- [ ] No fabricated client, quote, image, or stat anywhere on the page
- [ ] Written permission held for every named client + testimonial
- [ ] 44 thumbnails self-hosted (WebP, sized), mShots as fallback, zero `picsum`
- [ ] `width`/`height` or `aspect-ratio` on every grid image; CLS < 0.1
- [ ] Hero LCP image preloaded + high priority; LCP < 2.5s on mobile
- [ ] `aria-pressed` on industry chips; keyboard-only run of the whole page passes
- [ ] axe/Lighthouse a11y ≥ 95, perf ≥ 90
- [ ] 390 / 768 / 1024 screenshot-verified, no horizontal scroll
- [ ] Filter counts still 6 / 10 / 28 after all changes
