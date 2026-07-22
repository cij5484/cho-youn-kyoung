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
        <h1 id="sanjo-hero-title">{slide.title}</h1>
        <p className="sanjo-hero__subtitle">{slide.subtitle}</p>
        <p className="sanjo-hero__meta">
          <span>{slide.displayDate}</span>
          <span>{slide.time}</span>
        </p>
        <p className="sanjo-hero__venue">{slide.venue}</p>
        <Link className="sanjo-hero__link" to={slide.detailLink}>
          VIEW PERFORMANCE <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
