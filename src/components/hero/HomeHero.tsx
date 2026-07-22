import { useState } from "react";
import { Link } from "react-router-dom";
import type { Performance } from "../../data/performances";

type HomeHeroProps = { performance: Performance };

export function HomeHero({ performance }: HomeHeroProps) {
  const [hasHeroImage, setHasHeroImage] = useState(true);
  const heroImageSrc = `${import.meta.env.BASE_URL}${performance.heroImage.replace(/^\//, "")}`;

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
        <p className="hero-subtitle">{performance.subtitle}</p>
        <p className="hero-meta">
          <span className="hero-date">
            <span>2026.</span>
            <span className="date-accent">8. 2.</span>
            <span>16:00</span>
          </span>
          <span className="hero-venue">{performance.venue}</span>
        </p>
        <Link className="text-link" to={`/performance/${performance.id}`}>
          VIEW PERFORMANCE <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
