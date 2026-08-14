import { performances } from './performances';
import { albums, type AlbumHeroTextures } from './albums';

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
  albumTextures?: AlbumHeroTextures;
  albumBackground?: { desktop: string; mobile: string };
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

  const [artistLine, albumLine, ...subtitleParts] = (album.englishTitle ?? album.title).split('\n');
  const heroTitle = albumLine ? `${artistLine}\n${albumLine}` : artistLine;
  return [{
    id: album.id,
    eyebrow: 'ALBUM',
    title: heroTitle,
    subtitle: subtitleParts.join(' '),
    date: album.releaseDate,
    displayDate: `${album.year}${album.releaseStatus === 'coming-soon' ? ' · COMING SOON' : ''}`,
    time: '',
    venue: '',
    theme: album.albumHero.theme,
    detailLink: album.detailsPath,
    workType: 'ALBUM' as const,
    cardImage: album.coverImage,
    albumTextures: album.albumHero.textures,
    albumBackground: album.albumHero.background,
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

export const getDefaultHomeHeroIndex = (slides: HomeHeroSlide[], today = getSeoulDateString()) => {
  const upcoming = slides
    .map((slide, index) => ({ slide, index }))
    .filter(({ slide }) => Boolean(slide.date && slide.date >= today))
    .sort((a, b) => a.slide.date!.localeCompare(b.slide.date!));

  if (upcoming.length > 0) return upcoming[0].index;

  const datedSlides = slides.map((slide, index) => ({ slide, index })).filter(({ slide }) => slide.date);
  if (datedSlides.length === 0) return 0;
  return datedSlides.reduce((latest, current) => current.slide.date! > latest.slide.date! ? current : latest).index;
};
