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

const featuredPerformance = performances.find((performance) => performance.id === 'haegeum-2026-08-02');

export const homeHeroSlides: HomeHeroSlide[] = [
  ...(featuredPerformance
    ? [
        {
          id: featuredPerformance.id,
          eyebrow: featuredPerformance.archiveLabel,
          title: featuredPerformance.title,
          subtitle: featuredPerformance.subtitle,
          date: featuredPerformance.date,
          displayDate: '2026. 8. 2.',
          time: '16:00',
          venue: featuredPerformance.venue,
          theme: 'haegeum-recital' as const,
          detailLink: `/performance/${featuredPerformance.id}`,
          heroImage: featuredPerformance.heroImage,
        },
      ]
    : []),
  {
    id: 'sanjo-gil-2026-08-16',
    eyebrow: 'SANJO-GIL PROJECT 02',
    title: '산조길, 둘',
    subtitle: '한범수류 해금산조',
    date: '2026-08-16',
    displayDate: '2026. 8. 16.',
    time: '15:30',
    venue: '해운대문화회관 고운홀',
    theme: 'sanjo-matiere',
    detailLink: '/performance',
    heroImage: 'images/hero/sanjo-gil-02/hero-background.png',
  },
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

export const getHomeHeroSlidesForDate = (slides: HomeHeroSlide[], today = getSeoulDateString()) => {
  const sortedSlides = [...slides].sort((a, b) => a.date.localeCompare(b.date));
  const upcomingSlides = sortedSlides.filter((slide) => slide.date >= today);

  if (upcomingSlides.length > 0) {
    return upcomingSlides;
  }

  const latestPastSlide = sortedSlides.at(-1);
  return latestPastSlide ? [latestPastSlide] : [];
};
