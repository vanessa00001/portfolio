# Analytics setup guide — Vanessa Salonoy portfolio

Everything lives in **`analytics.js`**. You only edit the three IDs at the top of that file, commit, and you're live. Nothing about the site's design, layout, or behaviour changes. With the default placeholders in place the tracking is completely inert (no requests, no console errors, no page-speed cost), so it is safe to deploy before you have your IDs.

---

## What was added

- **`analytics.js`** — one self-contained file: provider bootstrap (GA4 + Clarity + GTM), a unified event dispatcher, scroll-depth, time-on-page, returning-visitor detection, and one delegated click listener wired to your existing elements.
- **`index.html`** — two additions only: a commented placeholder in `<head>` for the Google Search Console meta tag, and `<script defer src="analytics.js"></script>` before `</body>`. No markup, CSS, or layout changed.

---

## Setup steps

### Step 1 — Create a Google Analytics 4 property
Go to <https://analytics.google.com> → **Admin** → **Create property**. Add a **Web** data stream for `https://vanessa00001.github.io/portfolio/`.

### Step 2 — Get your Measurement ID
In the web stream details, copy the **Measurement ID**. It looks like `G-XXXXXXXXXX`.

### Step 3 — Paste the ID
Open `analytics.js`, find the `CONFIG` block near the top, and replace:
```js
GA4_MEASUREMENT_ID: 'G-XXXXXXXXXX',
```
with your real ID. Commit and push.

### Step 4 — Create a Microsoft Clarity project
Go to <https://clarity.microsoft.com> → **New project**, using the same site URL.

### Step 5 — Paste the Clarity Project ID
Copy the **Project ID** (looks like `abcd1234ef`) and replace in `analytics.js`:
```js
CLARITY_PROJECT_ID: 'xxxxxxxxxx',
```

### Step 6 — (Optional) Create a Google Tag Manager container
Go to <https://tagmanager.google.com>, create a **Web** container (`GTM-XXXXXXX`) and replace:
```js
GTM_CONTAINER_ID: 'GTM-XXXXXXX',
```
**Important:** if you decide to configure GA4 *inside* GTM, leave `GA4_MEASUREMENT_ID` as its placeholder so GA4 isn't loaded twice (which would double-count). Use direct GA4 **or** GA4-via-GTM, not both.

### Step 7 — Google Search Console
Go to <https://search.google.com/search-console> → add a **URL-prefix** property for your site → choose the **HTML tag** method. Copy the meta tag it gives you and paste it into `index.html` where the comment says:
```html
<!-- <meta name="google-site-verification" content="PASTE_YOUR_CODE_HERE"> -->
```
Remove the comment markers so the meta tag is live, then click **Verify**. Also submit your sitemap: `https://vanessa00001.github.io/portfolio/sitemap.xml`.

### Step 8 — Publish and verify
Commit and push to GitHub Pages. Then confirm everything works:
- **GA4:** open the site, then in GA4 go to **Reports → Realtime** — you should see yourself and events appear within seconds.
- **Clarity:** the dashboard shows sessions and recordings after a few minutes.
- **GTM:** use **Preview** mode to confirm the container loads and receives the `dataLayer` events.
- **Search Console:** the property shows as *Verified*.

---

## Events being tracked

| Event name | Fires when |
|---|---|
| `portfolio_page_viewed` | page loads |
| `new_visitor` / `returning_visitor` | first vs repeat visit (first-party, localStorage) |
| `nav_menu_click` | any top-nav link or the nav "Book a call" button |
| `hero_cta_click` | any hero button |
| `book_consultation` | the hero "Book a discovery call" button |
| `resume_download` | any résumé / PDF / download link |
| `email_click` | any `mailto:` link |
| `phone_click` | any `tel:` link (add one and it tracks automatically) |
| `email_copy` | the "Copy email" button |
| `linkedin_click` / `github_click` | those outbound links (anywhere on the page) |
| `outbound_link_click` | any other external link |
| `contact_form_submit` | the contact form is submitted |
| `case_study_click` | a Selected Enterprise Engagement card |
| `service_card_click` | a "How I Help" service card |
| `engagement_package_click` / `engagement_model_click` | the packages / engagement-model cards |
| `interactive_workflow` | a Consulting Process step is opened |
| `technology_card_click` | a technology chip |
| `certification_click` | a certification card |
| `industry_click` | an industry chip |
| `insight_click` | an Insights card |
| `scroll_depth` | 25 %, 50 %, 75 %, 100 % (each once) |
| `time_on_page` | when the tab is hidden or closed (carries seconds engaged) |

Each event carries useful parameters (label, href, section, company, etc.) so you can build reports in GA4 without extra setup. In GA4, register the ones you care about under **Admin → Custom definitions** if you want them as custom dimensions.

---

## Notes and best practices applied

- **Non-blocking:** `analytics.js` is loaded with `defer`; every provider SDK is injected `async`. Nothing blocks paint or your animations.
- **No duplicate listeners / no memory leaks:** all clicks run through a single delegated listener; the scroll listener detaches itself after 100 %.
- **Inert until configured:** with placeholder IDs, no third-party script loads and no requests are made — Lighthouse and page speed are unaffected until you opt in.
- **Privacy / GDPR (recommended next step):** `anonymize_ip` is on for GA4. If you expect EU visitors, the compliant pattern is to add a small consent banner and Google **Consent Mode v2**, gating GA4/Clarity until the visitor accepts. I did not add a banner because you asked for no UI changes — say the word and I'll add a minimal, on-brand one.
- **`DEBUG` flag:** set `DEBUG: true` in the CONFIG block to log every event to the browser console while you test, then set it back to `false`.
