# Minnie & Tina — GitHub → Cloudflare → PWA

## 1) GitHub
Upload these files/folders to the repository root:

- `index.html`
- `manifest.webmanifest`
- `sw.js`
- `assets/`
  - `logo.webp`
  - `icon-192.png`
  - `icon-512.png`
  - `menu/*.webp`

Enable **GitHub Pages** from the repository settings and deploy from the main branch/root.

## 2) Cloudflare
Point the custom domain to GitHub Pages through Cloudflare DNS and turn the proxy (orange cloud) on.

Recommended Cloudflare settings:
- SSL/TLS: **Full**
- Always Use HTTPS: **On**
- Brotli: **On**
- HTTP/2: **On**
- HTTP/3: **On**
- Cache Rules: cache static assets (`/assets/*`, `*.webp`, `*.png`, `*.js`, `*.webmanifest`) for a long browser/edge TTL.
- Do not cache personalized/order API responses if you add any later.

## 3) PWA + slow network
`sw.js` caches the app shell and uses:
- **cache-first** for food WebP images
- **cache-first + background refresh** for navigation
- **stale-while-revalidate** for same-origin static files

Important: the **first visit still needs internet**. After the app shell/photos have been loaded once, repeat opens can work from the device cache even when the connection is very slow or temporarily unavailable.

## 4) WebP + Lazy Load
The original HTML contained embedded base64 food photos. They are now separate compressed WebP files, and menu `<img>` elements keep `loading="lazy"` and `decoding="async"`.

This reduces the initial HTML dramatically and lets the browser download only images that are near the screen.

## 5) Updating the site
When you change `index.html` or assets, increase the cache version in `sw.js`, for example:

`minnie-tina-v3` → `minnie-tina-v4`

Then deploy to GitHub Pages. The new service worker will replace the old cache.
