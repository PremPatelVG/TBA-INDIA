# TBA India — React app

A React single-page app (SPA) version of the TBA India website, built with
**Vite** + **React** + **React Router**. This lives alongside the original
static HTML site (which is untouched at the repository root) so you can try the
React version without changing your live site.

## What's here

```
react-app/
  index.html          app shell
  package.json
  vite.config.js
  public/             static files copied verbatim into the build
    assets/images/    all site images
    favicon.svg, robots.txt, sitemap.xml
    _redirects        SPA fallback for Netlify-style hosts
    .htaccess         SPA fallback for Apache
  src/
    main.jsx          entry
    App.jsx           routes
    styles/index.css  the full site stylesheet (ported as-is)
    components/       Header, Footer, Layout, Seo, CtaBand, MetricStrip
    pages/            Home, About, Leadership, News, Contact, Legal, NotFound
    data/leaders.js   leadership team content
    content/          the legal pages' text (privacy, terms, ada)
    hooks/            scroll-reveal + metric count-up
```

## Run it locally

```bash
cd react-app
npm install
npm run dev      # dev server at http://localhost:5173
```

## Build for production

```bash
cd react-app
npm install
npm run build    # outputs static files to react-app/dist/
npm run preview  # preview the production build locally
```

The **contents of `react-app/dist/`** are what you upload to your web server
(it is plain static HTML/CSS/JS once built — no Node needed on the server).

## IMPORTANT — the SPA deep-link rule

A single-page app serves one `index.html` and does routing in the browser. For
URLs like `/about-us` to work on a **direct visit or refresh**, your server must
send unknown paths to `index.html`. Pick the file for your server:

- **Apache** (cPanel/WHM/most LAMP): `public/.htaccess` is included — it ships
  inside `dist/` automatically. Make sure `mod_rewrite` is enabled.
- **Netlify / similar**: `public/_redirects` is included and handled
  automatically.
- **Nginx**: add this to your server block (no file can do it for you):
  ```nginx
  location / {
    try_files $uri $uri/ /index.html;
  }
  ```
- **IIS / Windows**: ask and I'll add a `web.config` with the rewrite rule.

Without this rule, the home page works but other pages 404 on refresh — the same
issue we hit before. This is inherent to any SPA, not a bug.

## Contact form

The contact form posts to the same Google Apps Script endpoint as the static
site (writes to the Enquiries sheet + emails indiaops@tbaindia.in). The endpoint
is set in `src/pages/Contact.jsx`.

## Notes vs. the static site

- Same design, content, images and animations.
- The Tailwind CDN was removed; the handful of utility classes used in the
  markup are baked into `src/styles/index.css`, so there is no CDN dependency.
- SEO: page titles and meta tags update per route via `react-helmet-async`.
  Note that a client-rendered SPA is inherently weaker for SEO than the static
  HTML site; if search ranking matters, the static site is the better choice.
