# CHO YOUN KYOUNG

Official static website and performance archive for haegeum artist **CHO YOUN KYOUNG**.

The official website is <https://choyounkyoung.com/>.

## Site structure

- HOME presents the currently eligible performance Hero slides.
- PERFORMANCE lists performances and links to their detail pages.
- MEDIA presents selected performance videos, discography links, and special archive records.
- ABOUT contains the artist profile, gallery, performance history, and available album summary.
- CONTACT provides the official contact channels.

## Tech stack

- React
- Vite
- TypeScript
- React Router with `HashRouter`
- Plain CSS
- GitHub Actions + GitHub Pages

No backend, database, login, admin page, animation library, or GSAP is used.

## Install and verify

```bash
npm install --no-audit --no-fund
npm run lint
npm run build
```

Run locally with `npm run dev`.

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
public/assets/performances/{performance-id}/web/home-hero-desktop.png
```

Keep an existing filename stable unless its matching data reference is updated in the same change. Approved design reference mockups are not committed to the repository.

## Add a new performance

Add an object to `performances` in `src/data/performances.ts` using a unique `id` and an asset path under `assets/performances/{performance-id}/`. The performance list and detail route are generated from this data; HOME Hero eligibility and ordering are managed by the current performance and Hero slide data structure rather than by permanently documenting one featured performance.

## Album status

`src/data/albums.ts` contains the existing 2020 album **조윤경 해금산조－한범수류**. It currently has no `coverImage` or `detailsPath`, so the site does not provide an album cover or album detail-page link. Add those optional fields only when the corresponding asset and detail route are ready.
