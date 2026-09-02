import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  getDefaultHomeHeroIndex,
  getRecentWorks,
  homeHeroSlides,
  type HomeHeroSlide,
} from '../../data/homeHeroSlides';
import { HomeHero } from './HomeHero';
import { SanjoMatiereHero } from './SanjoMatiereHero';
import { HaegeumJeongakHero } from './HaegeumJeongakHero';
import { HomeCreativeCredit } from './HomeCreativeCredit';
import { HOME_HERO_RESET_EVENT } from './homeHeroEvents';
import { RecentWorks } from './recent-works/RecentWorks';

const AlbumHero = lazy(() => import('./AlbumHero').then((module) => ({ default: module.AlbumHero })));

const renderSlide = (slide: HomeHeroSlide, isActive: boolean) => {
  if (slide.theme === 'album-package') {
    if (!isActive) return null;
    return (
      <Suspense fallback={<div className="album-hero-loading" aria-hidden="true" />}>
        <AlbumHero slide={slide} />
      </Suspense>
    );
  }
  if (slide.theme === 'sanjo-matiere') {
    return <SanjoMatiereHero slide={slide} isActive={isActive} />;
  }
  if (slide.theme === 'haegeum-jeongak') {
    return <HaegeumJeongakHero slide={slide} isActive={isActive} />;
  }

  return <HomeHero slide={slide} isActive={isActive} />;
};

export function HomeHeroRotator() {
  const location = useLocation();
  const works = useMemo(() => getRecentWorks(homeHeroSlides), []);
  const shouldResetHomeHero = Boolean((location.state as { resetHomeHeroAt?: number } | null)?.resetHomeHeroAt);
  const [activeIndex, setActiveIndex] = useState(() => shouldResetHomeHero ? 0 : getDefaultHomeHeroIndex(works));
  const activeTheme = works[activeIndex]?.theme;
  const activeWorkId = works[activeIndex]?.id;

  useEffect(() => {
    const resetHomeHero = () => setActiveIndex(0);
    window.addEventListener(HOME_HERO_RESET_EVENT, resetHomeHero);
    return () => window.removeEventListener(HOME_HERO_RESET_EVENT, resetHomeHero);
  }, []);

  useEffect(() => {
    if (!activeTheme || !activeWorkId) return undefined;
    document.documentElement.dataset.homeHeroTheme = activeTheme;
    document.documentElement.dataset.homeHeroWork = activeWorkId;
    return () => {
      delete document.documentElement.dataset.homeHeroTheme;
      delete document.documentElement.dataset.homeHeroWork;
    };
  }, [activeTheme, activeWorkId]);

  if (works.length === 0) return null;

  return (
    <div className="home-hero-rotator" data-theme={activeTheme} data-work-id={activeWorkId}>
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
