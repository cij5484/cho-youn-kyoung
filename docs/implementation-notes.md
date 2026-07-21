# Implementation Notes

## Scope
This first implementation establishes a static React, Vite, and TypeScript site for GitHub Pages and recreates the approved HOME hero as HTML/CSS instead of using the full mockup as a page background.

## Routing and deployment
- The app uses `HashRouter` so GitHub Pages refreshes do not require server rewrite rules.
- Vite `base` is `/cho-youn-kyoung/` for `https://cij5484.github.io/cho-youn-kyoung/`.
- `.github/workflows/deploy-pages.yml` runs `npm install --no-audit --no-fund`, `npm run lint`, and `npm run build` for pull requests and pushes. It uploads `dist` and deploys through GitHub Pages only for `main` pushes.

## Images
- Approved hero mockup and binary artwork files are intentionally not committed.
- The code references `public/images/hero/hero-watercolor.png` for the future owner-uploaded artwork.
- If that image is missing, the Hero displays a charcoal CSS fallback background.
- Replace the hero artwork by uploading that filename or by updating `heroImage` in `src/data/performances.ts`.

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
