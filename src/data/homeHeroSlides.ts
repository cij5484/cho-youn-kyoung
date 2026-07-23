import { performances } from './performances';

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
};

export const homeHeroSlides: HomeHeroSlide[] = performances
  .filter((performance) => performance.homeHero)
  .map((performance) => ({
    id: performance.id,
    eyebrow: performance.archiveLabel,
    title: performance.title,
    subtitle: performance.subtitle,
    date: performance.date,
    displayDate: performance.homeHero!.displayDate,
    time: performance.homeHero!.time,
    venue: performance.venue,
    theme: performance.homeHero!.theme,
    detailLink: `/performance/${performance.id}`,
    heroImage: performance.heroImage,
  }));

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

export const getHomeHeroSlidesForDate = (slides: HomeHeroSlide[], today = getSeoulDateString()) => {
  const sortedSlides = [...slides].sort((a, b) => a.date.localeCompare(b.date));
  const upcomingSlides = sortedSlides.filter((slide) => slide.date >= today);

  if (upcomingSlides.length > 0) {
    return upcomingSlides;
  }

  const latestPastSlide = sortedSlides.at(-1);
  return latestPastSlide ? [latestPastSlide] : [];
};
