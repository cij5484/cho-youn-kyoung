import { useState } from "react";
import { Link } from "react-router-dom";
import type { HomeHeroSlide } from "../../data/homeHeroSlides";

type HomeHeroProps = { slide: HomeHeroSlide };

export function HomeHero({ slide }: HomeHeroProps) {
  const [hasHeroImage, setHasHeroImage] = useState(true);
  const heroImageSrc = slide.heroImage ? `${import.meta.env.BASE_URL}${slide.heroImage.replace(/^\//, "")}` : "";

  return (
    <section className="home-hero" aria-labelledby="home-hero-title">
      <div
        className={`hero-background ${hasHeroImage ? "has-image" : "is-fallback"}`}
        aria-hidden="true"
      >
        {hasHeroImage ? (
          <img
            className="hero-background__image"
            src={heroImageSrc}
            alt=""
            decoding="async"
            onError={() => setHasHeroImage(false)}
          />
        ) : null}
      </div>
      <div className="hero-overlay" aria-hidden="true" />
      <div className="hero-content">
        <p className="eyebrow">
          <span /> HAEGEUM RECITAL 2026
        </p>
        <h1 id="home-hero-title">
          <span className="title-primary">해금,</span>
          <span className="title-secondary">시대를 잇다</span>
        </h1>
        <p className="hero-subtitle">{slide.subtitle}</p>
        <p className="hero-meta">
          <span className="hero-date">
            <span>2026.</span>
            <span className="date-accent">8. 2.</span>
            <span>16:00</span>
          </span>
          <span className="hero-venue">{slide.venue}</span>
        </p>
        <Link className="text-link" to={slide.detailLink}>
          VIEW PERFORMANCE <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
