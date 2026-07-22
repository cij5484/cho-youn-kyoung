import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { HomeHeroSlide } from '../../data/homeHeroSlides';

type SanjoMatiereHeroProps = {
  slide: HomeHeroSlide;
  isActive: boolean;
};

export function SanjoMatiereHero({ slide, isActive }: SanjoMatiereHeroProps) {
  const [hasHeroImage, setHasHeroImage] = useState(Boolean(slide.heroImage));
  const heroImageSrc = slide.heroImage ? `${import.meta.env.BASE_URL}${slide.heroImage.replace(/^\//, '')}` : '';

  return (
    <section className="home-hero sanjo-hero" aria-labelledby="sanjo-hero-title">
      <div className="sanjo-hero__background" aria-hidden="true" />
      {hasHeroImage ? (
        <img
          className="sanjo-hero__image"
          src={heroImageSrc}
          alt=""
          aria-hidden="true"
          decoding="async"
          onError={() => setHasHeroImage(false)}
        />
      ) : null}
      <div className="sanjo-hero__content" key={isActive ? `${slide.id}-active` : slide.id}>
        <p className="sanjo-hero__eyebrow">{slide.eyebrow}</p>
        <h1 className="sanjo-hero__title" id="sanjo-hero-title">
          <span className="sanjo-hero__title-primary">산조길,</span>
          <span className="sanjo-hero__title-accent">둘</span>
        </h1>
        <div className="sanjo-hero__divider" aria-hidden="true" />
        <p className="sanjo-hero__subtitle">
          <span>한범수류</span>
          <span>해금산조</span>
        </p>
        <p className="sanjo-hero__artist">CHO YOUN KYOUNG</p>
        <p className="sanjo-hero__date">
          <span>2026.</span>
          <span className="sanjo-hero__date-accent">8. 16.</span>
          <span>SUN 15:30</span>
        </p>
        <p className="sanjo-hero__venue">{slide.venue}</p>
        <Link className="sanjo-hero__link" to={slide.detailLink}>
          VIEW PERFORMANCE <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
