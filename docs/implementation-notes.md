# Implementation Notes

## Scope
This first implementation establishes a static React, Vite, and TypeScript site for GitHub Pages and recreates the approved HOME hero as HTML/CSS instead of using the full mockup as a page background.

## Routing and deployment
- The app uses `HashRouter` so GitHub Pages refreshes do not require server rewrite rules.
- Vite `base` is `/` for `https://choyounkyoung.com/`.
- `.github/workflows/deploy-pages.yml` runs `npm install --no-audit --no-fund`, `npm run lint`, and `npm run build` for pull requests and pushes. It uploads `dist` and deploys through GitHub Pages only for `main` pushes.

## Images and HOME Hero
- Approved hero mockup and binary artwork files are intentionally not committed.
- Each HOME Hero references its performance-specific `public/assets/performances/{performance-id}/web/home-hero-desktop.png` artwork.
- To replace a Hero background, update the file at that performance ID path; `src/data/performances.ts` selects the matching asset.
- If the configured performance Hero is missing, the Hero keeps the same layered structure and displays a charcoal/black CSS fallback background without a broken image indicator.
- The Hero is split into background, dark overlay, ink reveal overlay, and text content layers so a future ink/watercolor texture PNG or SVG can be added without changing the page structure.
- A lightweight CSS ink-reveal animation is applied on first render, using gradients, blur, transform, and clip-path. It respects `prefers-reduced-motion` and uses a shorter, lighter animation on mobile.

## Content model
- Site metadata and contact email live in `src/data/site.ts`.
- Performances live in `src/data/performances.ts`.
- Albums live in `src/data/albums.ts`; the array starts empty and no Discography route is exposed yet.
- Profile basics live in `src/data/profile.ts`.

## Manual checks
- Check desktop and mobile hero proportions.
- Check the hamburger menu opens, closes, and closes after navigation.
- Check 360px width has no horizontal scrolling.
- In GitHub repository settings, set Pages source to GitHub Actions.
