# CHO YOUN KYOUNG

Official static website and performance archive for haegeum artist **CHO YOUN KYOUNG**.

The official website is <https://choyounkyoung.com/>.

Documentation checked against source commit `41d082b` on 2026-08-31. This is a source review, not a new build, browser, or production verification.

## Site structure

- HOME presents performance and album Hero scenes selected through RECENT WORKS; it does not auto-rotate.
- WORKS lists performances and albums and links to their detail pages. `/performance` remains an alias for `/works`.
- MEDIA presents performance videos, press articles, and special archive records. Album listings belong to WORKS.
- ABOUT contains the artist profile, gallery, performance history, and available album summary.
- CONTACT provides the official contact channels.

## Tech stack

- React
- Vite
- TypeScript
- React Router with `HashRouter`
- Plain CSS
- Three.js + React Three Fiber for interactive album packages
- GitHub Actions + GitHub Pages

There is no application backend, database, login, or admin page. Content lives in TypeScript data files. Album audio uses external Cloudflare R2 URLs; YouTube embeds are created after user interaction. Motion uses CSS and Three.js/React Three Fiber rather than GSAP.

## Install and verify

```bash
npm install --no-audit --no-fund
npm run lint
npm run build
```

Use Node.js 22 to match CI. Run locally with `npm run dev`; stop the server with Ctrl+C. After building, `npm run preview` serves the production build locally. There is no automated test script in `package.json`.

## Deployment

The production URL is:

```text
https://choyounkyoung.com/
```

`vite.config.ts` uses the root deployment base:

```ts
base: '/'
```

The workflow at `.github/workflows/deploy-pages.yml` installs dependencies, lints, builds, and deploys `dist` on `main` pushes. In GitHub, set **Settings → Pages → Build and deployment → Source** to **GitHub Actions**.

## Assets

Runtime assets use the `public/assets/` structure. For example, a performance HOME Hero can be stored at:

```text
public/assets/performances/{performance-id}/web/home-hero-desktop.webp
```

Performance and album web/viewer images use WebP; download PDFs are separate. Artist and people assets also include JPEG. Keep an existing filename stable unless its matching data reference is updated in the same change. Approved design reference mockups and print/editing masters are not runtime assets.

## Add a new performance

Add an object to `performances` in `src/data/performances.ts` using a unique `id` and an asset path under `assets/performances/{performance-id}/`. The performance list and detail route are generated from this data; HOME Hero eligibility and ordering are managed by the current performance and Hero slide data structure rather than by permanently documenting one featured performance.

## Album status

`src/data/albums.ts` contains two albums, both with HOME Hero scenes and dedicated `/album/:id` detail pages:

- **조윤경 해금산조 – 지영희류**: `coming-soon`, year 2026; six R2 audio tracks and seven booklet pages. No exact release date or official platform link is registered.
- **조윤경 해금산조－한범수류**: released 2020-11-19; six R2 audio tracks, eleven booklet pages, and an official YouTube playlist link.

Each album has its own persistent 3D stage spanning HOME and detail, with closed/open package, booklet, and player modes. Album booklet PDF download URLs are not currently registered. Source configuration does not by itself verify external audio availability.

## Maintenance guide

Start with [docs/README.md](docs/README.md) for current operating guides and clearly labeled historical records. Routes live in `src/App.tsx`; content in `src/data/`; UI in `src/pages/` and `src/components/`; styles in `src/styles/`.
