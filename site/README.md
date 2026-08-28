# Personal CV Website

Static HTML/CSS personal site for Marcello Carletti, deployed on Cloudflare Pages.

## Architecture
- **`index.html`** — Minimal landing: small intro + button row. Each button opens a
  modal window (skeleton shimmer ~400ms, then content from inline `<template>` blocks).
  The CV modal has an EN/IT language toggle and download buttons.
- **Standalone fallback pages** — `about.html`, `cv.html`, `contact.html`, `privacy.html`.
  These are real pages (same content, no emojis, JetBrains Mono) used when JavaScript is
  disabled or for SEO/print/direct links. The landing buttons link to them and JS
  intercepts to open the modal instead.
- **`css/styles.css`** — Neutral palette, JetBrains Mono (Google Fonts), responsive,
  skeleton + modal styles.
- **`js/main.js`** — Vanilla JS: modal open/close (Esc + backdrop), skeleton timer,
  CV language toggle. No dependencies.
- **`assets/downloads/`** — CV EN, CV IT, Nanotech paper (PDFs).
- **`assets/images/profile.placeholder.svg`** — placeholder avatar (replace with `profile.jpg`).

## Local preview
```
python -m http.server 8000
```
Then visit http://localhost:8000

## Deploy to Cloudflare Pages
1. Push this folder to a GitHub repository.
2. Cloudflare Pages: **Create a project → Connect to Git**.
3. Build settings: **Build command:** (none) · **Output directory:** `/` (root).
4. Save and deploy. Add custom domain `carletti.work` + enable HTTPS.

Optional CLI deploy with Wrangler:
```
wrangler pages deploy . --project-name carletti-work
```

## Updating content
- Modal content lives in `<template>` blocks at the bottom of `index.html`.
  Keep the standalone pages (`about.html`, `cv.html`, `contact.html`, `privacy.html`)
  in sync with the templates.
- Replace `assets/images/profile.placeholder.svg` with a square `profile.jpg`
  (CSS crops any image to a square via `object-fit: cover`).
- To update CVs, replace the PDFs in `assets/downloads/`.
