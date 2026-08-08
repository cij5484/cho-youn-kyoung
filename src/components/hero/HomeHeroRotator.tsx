import { useEffect, useMemo, useState } from 'react';
import {
  getDefaultHomeHeroIndex,
  getRecentWorks,
  homeHeroSlides,
  type HomeHeroSlide,
} from '../../data/homeHeroSlides';
import { HomeHero } from './HomeHero';
import { SanjoMatiereHero } from './SanjoMatiereHero';
import { HomeCreativeCredit } from './HomeCreativeCredit';
import { RecentWorks } from './recent-works/RecentWorks';

const renderSlide = (slide: HomeHeroSlide, isActive: boolean) => {
  if (slide.theme === 'sanjo-matiere') {
    return <SanjoMatiereHero slide={slide} isActive={isActive} />;
  }

  return <HomeHero slide={slide} isActive={isActive} />;
};

export function HomeHeroRotator() {
  const works = useMemo(() => getRecentWorks(homeHeroSlides), []);
  const [activeIndex, setActiveIndex] = useState(() => getDefaultHomeHeroIndex(works));
  const activeTheme = works[activeIndex]?.theme;

  useEffect(() => {
    if (!activeTheme) return undefined;
    document.documentElement.dataset.homeHeroTheme = activeTheme;
    return () => { delete document.documentElement.dataset.homeHeroTheme; };
  }, [activeTheme]);

  if (works.length === 0) return null;

  return (
    <div className="home-hero-rotator" data-theme={activeTheme}>
      <div className="home-hero-rotator__stage" aria-live="polite">
        {works.map((slide, index) => {
          const isActive = index === activeIndex;
          return (
            <div
              className={`home-hero-rotator__slide${isActive ? ' is-active' : ''}`}
              key={slide.id}
              aria-hidden={!isActive}
              inert={!isActive ? true : undefined}
            >
              {renderSlide(slide, isActive)}
            </div>
          );
        })}
      </div>
      <HomeCreativeCredit />
      <RecentWorks works={works} activeIndex={activeIndex} onSelect={setActiveIndex} />
    </div>
  );
}
