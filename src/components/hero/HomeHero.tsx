import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Performance } from '../../data/performances';

type HomeHeroProps = { performance: Performance };

export function HomeHero({ performance }: HomeHeroProps) {
  const [hasHeroImage, setHasHeroImage] = useState(true);
  const heroImageSrc = `${import.meta.env.BASE_URL}${performance.heroImage.replace(/^\//, '')}`;

  return (
    <section className="home-hero" aria-labelledby="home-hero-title">
      <div className={`hero-background ${hasHeroImage ? 'has-image' : 'is-fallback'}`} aria-hidden="true">
        {hasHeroImage ? (
          <img
            src={heroImageSrc}
            alt=""
            onError={() => setHasHeroImage(false)}
          />
        ) : null}
      </div>
      <div className="hero-overlay" aria-hidden="true" />
      <div className="hero-ink-reveal" aria-hidden="true" />
      <div className="hero-content">
        <p className="eyebrow"><span /> HAEGEUM ARTIST</p>
        <h1 id="home-hero-title">{performance.title}</h1>
        <p className="hero-subtitle">{performance.subtitle}</p>
        <p className="hero-meta"><span>{performance.displayDate}</span><span>{performance.venue}</span></p>
        <Link className="text-link" to={`/performance/${performance.id}`}>VIEW PERFORMANCE <span aria-hidden="true">→</span></Link>
      </div>
    </section>
  );
}
