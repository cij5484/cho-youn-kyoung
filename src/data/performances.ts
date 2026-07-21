export type Performance = {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  displayDate: string;
  venue: string;
  featured: boolean;
  heroImage: string;
};

export const performances: Performance[] = [
  {
    id: 'haegeum-2026-08-02',
    title: '해금, 시대를 잇다',
    subtitle: '해금 창작곡의 변천',
    date: '2026-08-02',
    displayDate: '2026. 8. 2. (일) 16:00',
    venue: '향사아트센터',
    featured: true,
    heroImage: '/images/hero/hero-watercolor.png',
  },
];

export const getFeaturedPerformance = () => {
  const featured = performances.find((performance) => performance.featured);
  if (featured) return featured;

  const today = new Date().toISOString().slice(0, 10);
  return [...performances]
    .filter((performance) => performance.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))[0] ?? performances[0];
};
