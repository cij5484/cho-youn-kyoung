import { performances } from './performances';
import { albums } from './albums';

export type HomeHeroTheme = 'haegeum-recital' | 'sanjo-matiere';

export type HomeHeroSlide = {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  date: string;
  displayDate: string;
  time: string;
  venue: string;
  theme: HomeHeroTheme;
  detailLink: string;
  heroImage?: string;
  workType: 'PERFORMANCE' | 'ALBUM';
  cardImage: string;
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

// Albums remain owned by albums.ts. An album only enters this adapter after its
// cover, release date, detail route, and dedicated Hero scene all exist.
const albumHeroSlides: HomeHeroSlide[] = albums.flatMap(() => []);

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
  [...slides].sort((a, b) => b.date.localeCompare(a.date));

export const getDefaultHomeHeroIndex = (slides: HomeHeroSlide[], today = getSeoulDateString()) => {
  const upcoming = slides
    .map((slide, index) => ({ slide, index }))
    .filter(({ slide }) => slide.date >= today)
    .sort((a, b) => a.slide.date.localeCompare(b.slide.date));

  if (upcoming.length > 0) return upcoming[0].index;

  return slides.reduce((latestIndex, slide, index) =>
    slide.date > slides[latestIndex].date ? index : latestIndex, 0);
};
