import { useEffect, useMemo, useRef, useState } from 'react';
import type { TouchEvent } from 'react';
import { HomeHeroSlide, getHomeHeroSlidesForDate, homeHeroSlides } from '../../data/homeHeroSlides';
import { HomeHero } from './HomeHero';
import { SanjoMatiereHero } from './SanjoMatiereHero';

const ROTATION_INTERVAL_MS = 12000;

const dotLabels = ['첫 번째 공연 보기', '두 번째 공연 보기', '세 번째 공연 보기', '네 번째 공연 보기'];

const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener('change', updatePreference);
    return () => mediaQuery.removeEventListener('change', updatePreference);
  }, []);

  return prefersReducedMotion;
};

const renderSlide = (slide: HomeHeroSlide, isActive: boolean) => {
  if (slide.theme === 'sanjo-matiere') {
    return <SanjoMatiereHero slide={slide} isActive={isActive} />;
  }

  return <HomeHero slide={slide} />;
};

export function HomeHeroRotator() {
  const slides = useMemo(() => getHomeHeroSlidesForDate(homeHeroSlides), []);
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef<number | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const canRotate = slides.length > 1 && !prefersReducedMotion;
  const activeTheme = slides[activeIndex]?.theme;

  useEffect(() => {
    if (!activeTheme) return undefined;

    document.documentElement.dataset.homeHeroTheme = activeTheme;

    return () => {
      delete document.documentElement.dataset.homeHeroTheme;
    };
  }, [activeTheme]);

  useEffect(() => {
    if (!canRotate) return undefined;

    const clearTimer = () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const scheduleTimer = () => {
      clearTimer();
      if (document.hidden) return;

      timerRef.current = window.setTimeout(() => {
        setActiveIndex((currentIndex) => (currentIndex + 1) % slides.length);
      }, ROTATION_INTERVAL_MS);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearTimer();
        return;
      }

      scheduleTimer();
    };

    scheduleTimer();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearTimer();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [activeIndex, canRotate, slides.length]);

  if (slides.length === 0) return null;

  const goToSlide = (index: number) => {
    setActiveIndex(index);
  };

  const goToAdjacentSlide = (direction: 1 | -1) => {
    setActiveIndex((currentIndex) => (currentIndex + direction + slides.length) % slides.length);
  };

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    if (slides.length <= 1) return;

    const touch = event.touches[0];
    touchStartXRef.current = touch.clientX;
    touchStartYRef.current = touch.clientY;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (slides.length <= 1 || touchStartXRef.current === null || touchStartYRef.current === null) return;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartXRef.current;
    const deltaY = touch.clientY - touchStartYRef.current;

    touchStartXRef.current = null;
    touchStartYRef.current = null;

    if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY) * 1.2) return;

    goToAdjacentSlide(deltaX < 0 ? 1 : -1);
  };

  return (
    <div
      className="home-hero-rotator"
      data-theme={activeTheme}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="home-hero-rotator__stage">
        {slides.map((slide, index) => {
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
      {slides.length > 1 ? (
        <div className="home-hero-dots" aria-label="홈 공연 Hero 선택">
          {slides.map((slide, index) => (
            <button
              type="button"
              className={`home-hero-dots__button${index === activeIndex ? ' is-active' : ''}`}
              key={slide.id}
              aria-label={dotLabels[index] ?? `${index + 1}번째 공연 보기`}
              aria-current={index === activeIndex ? 'true' : undefined}
              onClick={() => goToSlide(index)}
            >
              <span />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
