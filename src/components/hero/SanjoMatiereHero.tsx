import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { HomeHeroSlide } from '../../data/homeHeroSlides';

const circleLayers = [
  { src: 'images/hero/sanjo-gil-02/circle-navy.png', className: 'sanjo-circle sanjo-circle--navy' },
  { src: 'images/hero/sanjo-gil-02/circle-bluegray.png', className: 'sanjo-circle sanjo-circle--bluegray' },
  { src: 'images/hero/sanjo-gil-02/circle-beige.png', className: 'sanjo-circle sanjo-circle--beige' },
  { src: 'images/hero/sanjo-gil-02/circle-accent-1.png', className: 'sanjo-circle sanjo-circle--accent-one' },
  { src: 'images/hero/sanjo-gil-02/circle-accent-2.png', className: 'sanjo-circle sanjo-circle--accent-two' },
];

type SanjoMatiereHeroProps = {
  slide: HomeHeroSlide;
  isActive: boolean;
};

export function SanjoMatiereHero({ slide, isActive }: SanjoMatiereHeroProps) {
  const [hiddenLayers, setHiddenLayers] = useState<ReadonlySet<string>>(new Set());
  const baseUrl = import.meta.env.BASE_URL;

  const hideLayer = (src: string) => {
    setHiddenLayers((current) => new Set(current).add(src));
  };

  return (
    <section className="home-hero sanjo-hero" aria-labelledby="sanjo-hero-title">
      <div className="sanjo-hero__background" aria-hidden="true" />
      <div className="sanjo-hero__visual" aria-hidden="true">
        {circleLayers.map((layer) =>
          hiddenLayers.has(layer.src) ? null : (
            <img
              key={layer.src}
              className={layer.className}
              src={`${baseUrl}${layer.src}`}
              alt=""
              decoding="async"
              onError={() => hideLayer(layer.src)}
            />
          ),
        )}
      </div>
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
