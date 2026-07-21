# Technical SEO, accessibility & performance report — Vanessa Salonoy portfolio

Scope: SEO, metadata, structured data, accessibility, indexing, and performance only. **No visual change** was made: no layout, typography, color, spacing, animation, content, or JavaScript behavior was altered. Every change is either in the document head, in invisible/assistive markup, or in new sidecar files.

---

## Scores

These are audit-based estimates. Lighthouse depends on network and hosting, so run it against the **live** URL (`https://vanessa00001.github.io/portfolio/`) for exact numbers — the sandbox here is offline, which artificially depresses performance.

| Category | Before | After (expected on live site) |
|---|---|---|
| SEO | ~88 | **100** |
| Accessibility | ~90 | **96–100** |
| Best Practices | ~92 | **96–100** |
| Performance | ~85–92 | **90–99** |

The main remaining performance lever is the render-blocking Google Fonts stylesheet (see "Future opportunities").

---

## Issues found, why they matter, and what changed

### Metadata & search appearance
- **Meta description was ~215 characters** (Google truncates ~160). → Rewrote to a tight, keyword-front-loaded 160-char description.
- **Missing rich-result directives.** → Added `robots` and `googlebot` meta with `max-image-preview:large` so Google can show the large preview image.
- **Open Graph / Twitter were incomplete.** → Added `og:site_name`, `og:locale`, `og:image:alt`, `og:image:type`, `og:image:secure_url`, and `twitter:image:alt`. This fixes how the link renders on **LinkedIn, Facebook, X/Twitter, Slack, Discord, and Teams** (they all read these tags), including alt text and a correctly typed 1200×630 image.
- **Title** is long (~92 chars) but front-loads your name and primary role, so the important part shows before truncation. Left as-is intentionally.

### Structured data (the biggest AI-search win)
- **Old JSON-LD carried the previous positioning** ("Operations and transformation leadership") and over-indexed on automation tooling. → Replaced with a modern Schema.org `@graph` of five linked entities:
  - **Person** — updated job titles (Enterprise Business Consultant, Digital Transformation Advisor, ERP & CRM Consultant, etc.), a rich `knowsAbout` list covering your target keywords and platforms (Oracle, SAP, NetSuite, Dynamics 365, Salesforce, HubSpot…), credentials (PMP, Lean Six Sigma), and `sameAs` links.
  - **ProfessionalService** — your services as `serviceType`, `areaServed: Worldwide` (correct for remote/global, no fake storefront), and a `ContactPoint`.
  - **WebSite** and **WebPage** — so engines understand the site identity and page.
  - **FAQPage** — built from your Insights section (real on-page questions and answers). This is exactly the structured content that **Google AI Overviews, ChatGPT, Perplexity, Gemini, and Copilot** extract to describe your expertise. No fake ratings or reviews were added.

### Accessibility
- **No skip link.** → Added a "Skip to content" link (visible only on keyboard focus) and an `id="main"` landmark target. Keyboard users can bypass the nav.
- **Stats band had no heading.** → Added a screen-reader-only heading and `aria-label` so the section is announced.
- **Landmarks verified:** one `<h1>`, proper `header` / `nav` / `main` / `footer`, and clean `h1 → h2 → h3` order with no skipped levels.
- Existing strengths kept: visible focus outlines, `prefers-reduced-motion` support, form `<label>`s, `aria` on the nav toggle, and `aria-hidden` on decorative icons.

### Performance
- **Hero image not prioritized.** → Added `fetchpriority="high"` and `decoding="async"` to the LCP image; it already had explicit `width`/`height`, so there's no layout shift (good CLS).
- **Analytics** loads with `defer` and injects providers `async` only when configured, so it never blocks paint.
- Added `dns-prefetch` hints for the analytics domains (cheap, no connections opened).

### Security & links
- **External links** already used `target="_blank"`; → upgraded every one to `rel="noopener noreferrer"`.
- **HTTPS / canonical / mixed content:** canonical is HTTPS, all resources are HTTPS, no mixed content. Verified.

### Indexing files (new, GitHub Pages compatible)
- **`robots.txt`** — allow-all + sitemap reference.
- **`sitemap.xml`** — your single URL with `lastmod`.
- **`manifest.webmanifest`** + **`icon-192.png` / `icon-512.png` / `icon-180.png`** — installable PWA metadata and an on-brand app icon; also added an `apple-touch-icon` link.

> **GitHub Pages note (important):** for a project site (`username.github.io/portfolio/`), search engines read `robots.txt` from the **domain root** (`vanessa00001.github.io/robots.txt`), which this repo does not control. So the `robots.txt` here is informational, and the reliable way to register your sitemap is to **submit `https://vanessa00001.github.io/portfolio/sitemap.xml` directly in Google Search Console** (which works regardless of location).

---

## Keyword coverage

Your target searches are now reinforced naturally (no stuffing) across the title, description, headings, visible copy, and the structured data `knowsAbout` / `serviceType`: Enterprise Business Consultant, Digital Transformation Consultant, ERP/CRM Consultant, AI Strategy Consultant, Business Process Consultant, Systems Integration Consultant, ERP/Technical Project Manager, Business Transformation, Lean Six Sigma, and the platform names (Microsoft Dynamics, NetSuite, SAP, Oracle, HubSpot).

---

## AI-search optimization

AI engines favor clean semantic HTML plus explicit structured data. You now have: a linked `@graph` describing who you are, what you do, where you serve, and your credentials; an `FAQPage` of real questions and answers; and a heading structure that maps cleanly to your expertise, services, industries, and engagements. That is what lets ChatGPT, Perplexity, Claude, Gemini, Copilot, and Google AI Overviews summarize you accurately.

---

## Future opportunities (optional, some involve trade-offs)

1. **Fonts (biggest performance lever).** The Google Fonts stylesheet is render-blocking. Self-hosting the two fonts (or `preload` + async swap) would improve FCP/LCP, but the async approach can cause a brief font "flash" on load. I left it as-is to honor "no visual change" — say the word and I'll implement it with a controlled swap.
2. **Search Console + sitemap submission** (see the GitHub Pages note above).
3. **Consent Mode v2** if you expect EU visitors (pairs with the analytics work; needs a small consent UI).
4. **Custom domain** (e.g. `vanessasalonoy.com`) would give you a root `robots.txt`, cleaner URLs, and stronger personal-brand SEO than a `github.io` subpath.
