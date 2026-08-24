import { performances } from './performances';
import { albums, type AlbumHeroBackgroundAnchor, type AlbumHeroPackageGeometry, type AlbumHeroTextures } from './albums';

export type HomeHeroTheme = 'haegeum-recital' | 'sanjo-matiere' | 'album-package';

export type HomeHeroSlide = {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  date?: string;
  displayDate: string;
  time: string;
  venue: string;
  theme: HomeHeroTheme;
  detailLink: string;
  heroImage?: string;
  workType: 'PERFORMANCE' | 'ALBUM';
  cardImage: string;
  cardTitle?: string;
  cardSubtitle?: string;
  albumTextures?: AlbumHeroTextures;
  albumBackground?: { desktop: string; mobile: string };
  albumBackgroundAnchor?: { desktop: AlbumHeroBackgroundAnchor; mobile: AlbumHeroBackgroundAnchor };
  albumPackageGeometry?: AlbumHeroPackageGeometry;
  trackCount?: number;
};

const formatHomeDate = (date: string) => {
  const [year, month, day] = date.split('-').map(Number);
  return `${year}. ${month}. ${day}.`;
};

const getDisplayTime = (displayDate: string) => displayDate.trim().split(/\s+/).at(-1) ?? '';

const performanceHeroSlides: HomeHeroSlide[] = performances
  .filter((performance) => performance.homeHero)
  .flatMap((performance) => {
    const poster = performance.archiveMaterials
      ?.find((material) => material.label === 'POSTER')
      ?.previewImages.at(0)?.src;

    if (!poster) return [];

    return [{
      id: performance.id,
      eyebrow: performance.archiveLabel,
      title: performance.title,
      subtitle: performance.subtitle,
      date: performance.date,
      displayDate: formatHomeDate(performance.date),
      time: getDisplayTime(performance.displayDate),
      venue: performance.venue,
      theme: performance.homeHero!.theme,
      detailLink: `/performance/${performance.id}`,
      heroImage: performance.heroImage,
      workType: 'PERFORMANCE' as const,
      cardImage: poster,
    }];
  });

const albumHeroSlides: HomeHeroSlide[] = albums.flatMap((album) => {
  const canShowComingSoon = album.releaseStatus === 'coming-soon' && Boolean(album.year);
  if (!album.coverImage || !album.detailsPath || !album.albumHero || (!album.releaseDate && !canShowComingSoon)) return [];

  const [cardTitle, cardSubtitle] = album.title.split(/\s*[-–—－]\s*/, 2);
  return [{
    id: album.id,
    eyebrow: 'ALBUM',
    title: cardTitle,
    subtitle: cardSubtitle,
    date: album.releaseDate,
    displayDate: `${album.year}${album.releaseStatus === 'coming-soon' ? ' · COMING SOON' : ''}`,
    time: '',
    venue: '',
    theme: album.albumHero.theme,
    detailLink: album.detailsPath,
    workType: 'ALBUM' as const,
    cardImage: album.coverImage,
    cardTitle,
    cardSubtitle,
    albumTextures: album.albumHero.textures,
    albumBackground: album.albumHero.background,
    albumBackgroundAnchor: album.albumHero.backgroundAnchor,
    albumPackageGeometry: album.albumHero.packageGeometry,
    trackCount: album.tracks?.length,
  }];
});

export const homeHeroSlides: HomeHeroSlide[] = [
  ...performanceHeroSlides,
  ...albumHeroSlides,
];

export const getSeoulDateString = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const dateParts = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
};

export const getRecentWorks = (slides: HomeHeroSlide[]) =>
  [...slides].sort((a, b) => (b.date ?? `${b.displayDate.slice(0, 4)}-00-00`)
    .localeCompare(a.date ?? `${a.displayDate.slice(0, 4)}-00-00`));

export const DEFAULT_HOME_HERO_ID = 'ji-young-hee-ryu-haegeum-sanjo-2026';

export const getDefaultHomeHeroIndex = (slides: HomeHeroSlide[], today = getSeoulDateString()) => {
  const preferredIndex = slides.findIndex((slide) => slide.id === DEFAULT_HOME_HERO_ID);
  if (preferredIndex >= 0) return preferredIndex;

  const upcoming = slides
    .map((slide, index) => ({ slide, index }))
    .filter(({ slide }) => Boolean(slide.date && slide.date >= today))
    .sort((a, b) => a.slide.date!.localeCompare(b.slide.date!));

  if (upcoming.length > 0) return upcoming[0].index;

  const datedSlides = slides.map((slide, index) => ({ slide, index })).filter(({ slide }) => slide.date);
  if (datedSlides.length === 0) return 0;
  return datedSlides.reduce((latest, current) => current.slide.date! > latest.slide.date! ? current : latest).index;
};
