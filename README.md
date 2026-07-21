# CHO YOUN KYOUNG

Official static website and performance archive for haegeum artist **CHO YOUN KYOUNG**.

## Current phase
- Featured performance: **해금, 시대를 잇다**
- Date: **2026. 8. 2. (일) 16:00**
- Venue: **향사아트센터**
- Deployment target: **GitHub Pages**

## Tech stack
- React
- Vite
- TypeScript
- React Router with `HashRouter`
- Plain CSS
- GitHub Actions + GitHub Pages

No backend, database, login, admin page, animation library, or GSAP is used.

## Install

```bash
npm install
```

## Run locally

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Lint

```bash
npm run lint
```

## GitHub Pages deployment

The production URL is expected to be:

```text
https://cij5484.github.io/cho-youn-kyoung/
```

Vite is configured with:

```ts
base: '/cho-youn-kyoung/'
```

The workflow at `.github/workflows/deploy-pages.yml` runs on pushes to `main` and performs:

1. `npm install --no-audit --no-fund`
2. `npm run lint`
3. `npm run build`
4. deploys the `dist` folder to GitHub Pages on `main` pushes only

In GitHub, set **Settings → Pages → Build and deployment → Source** to **GitHub Actions**.

## Hero image replacement

- Approved design reference mockup files are not committed to the repository.
- The site references `public/images/hero/hero-watercolor.png` for the Hero artwork.

The actual artwork should be uploaded separately by the site owner at `public/images/hero/hero-watercolor.png`. Until that file exists, the Hero falls back to a charcoal ink-wash style CSS background. To use a different filename later, update the `heroImage` field in `src/data/performances.ts`.

## Add a new performance

Add an object to `performances` in `src/data/performances.ts`:

```ts
{
  id: 'unique-performance-id',
  title: '공연 제목',
  subtitle: '공연 부제',
  date: 'YYYY-MM-DD',
  displayDate: 'YYYY. M. D. (요일) HH:mm',
  venue: '공연장',
  featured: false,
  heroImage: '/images/hero/hero-watercolor.png',
}
```

The performance list and detail route are generated from this data.

## Add a new album

Add an object to the empty `albums` array in `src/data/albums.ts`. Discography is intentionally hidden while the album list is empty.

## Featured content rule

The home hero currently selects content in this order:

1. A performance marked `featured: true`
2. If none exists, the nearest upcoming performance
3. Album types are prepared so albums can become featured content later

Only one item should be marked as featured for the initial site experience.
