import { useId, useState } from "react";
import { Link } from "react-router-dom";
import type { Performance } from "../../data/performances";

type HomeHeroProps = { performance: Performance };

export function HomeHero({ performance }: HomeHeroProps) {
  const [hasHeroImage, setHasHeroImage] = useState(true);
  const maskId = useId().replace(/:/g, "");
  const heroImageSrc = `${import.meta.env.BASE_URL}${performance.heroImage.replace(/^\//, "")}`;

  return (
    <section className="home-hero" aria-labelledby="home-hero-title">
      <div
        className={`hero-background ${hasHeroImage ? "has-image" : "is-fallback"}`}
        aria-hidden="true"
      >
        {hasHeroImage ? (
          <>
            <img
              className="hero-background__image"
              src={heroImageSrc}
              alt=""
              decoding="async"
              style={{
                WebkitMaskImage: `url(#${maskId}-ink-mask)`,
                maskImage: `url(#${maskId}-ink-mask)`,
              }}
              onError={() => setHasHeroImage(false)}
            />
            <svg className="hero-mask-defs" focusable="false" aria-hidden="true">
              <defs>
                <filter id={`${maskId}-ink-edge`} x="-28%" y="-28%" width="156%" height="156%">
                  <feTurbulence
                    type="fractalNoise"
                    baseFrequency="0.012 0.052"
                    numOctaves="3"
                    seed="19"
                    result="wideNoise"
                  />
                  <feDisplacementMap
                    in="SourceGraphic"
                    in2="wideNoise"
                    scale="0.095"
                    xChannelSelector="R"
                    yChannelSelector="G"
                    result="warpedEdge"
                  />
                  <feGaussianBlur in="warpedEdge" stdDeviation="0.012" result="softEdge" />
                  <feComponentTransfer in="softEdge">
                    <feFuncA type="table" tableValues="0 0.1 0.32 0.72 0.93 1" />
                  </feComponentTransfer>
                </filter>
                <filter id={`${maskId}-paper-fiber`} x="-34%" y="-34%" width="168%" height="168%">
                  <feTurbulence
                    type="fractalNoise"
                    baseFrequency="0.18 0.56"
                    numOctaves="2"
                    seed="43"
                    result="fiberNoise"
                  />
                  <feDisplacementMap
                    in="SourceGraphic"
                    in2="fiberNoise"
                    scale="0.032"
                    xChannelSelector="R"
                    yChannelSelector="B"
                    result="fibers"
                  />
                  <feGaussianBlur in="fibers" stdDeviation="0.005" result="fiberFeather" />
                  <feComponentTransfer in="fiberFeather">
                    <feFuncA type="table" tableValues="0 0.04 0.18 0.42 0.7 0.86" />
                  </feComponentTransfer>
                </filter>
                <mask
                  id={`${maskId}-ink-mask`}
                  maskUnits="objectBoundingBox"
                  maskContentUnits="objectBoundingBox"
                  x="0"
                  y="0"
                  width="1"
                  height="1"
                >
                  <rect width="1" height="1" fill="black" />
                  <g className="ink-mask-bloom">
                    <path
                      className="ink-mask-main"
                      fill="white"
                      filter={`url(#${maskId}-ink-edge)`}
                      d="M0.64 0.34 C0.69 0.22 0.82 0.21 0.91 0.33 C1.02 0.47 0.94 0.71 0.8 0.83 C0.65 0.96 0.37 0.91 0.25 0.72 C0.15 0.55 0.31 0.39 0.49 0.37 C0.56 0.36 0.6 0.37 0.64 0.34Z"
                    />
                    <path
                      className="ink-mask-fiber ink-mask-fiber--wide"
                      fill="rgba(255,255,255,.68)"
                      filter={`url(#${maskId}-paper-fiber)`}
                      d="M0.59 0.34 C0.66 0.12 0.88 0.13 0.99 0.3 C1.14 0.52 0.98 0.83 0.77 0.97 C0.56 1.1 0.17 0.96 0.08 0.7 C0.02 0.52 0.21 0.41 0.42 0.37 C0.49 0.36 0.55 0.37 0.59 0.34Z"
                    />
                    <path
                      className="ink-mask-fiber ink-mask-fiber--threads"
                      fill="rgba(255,255,255,.38)"
                      filter={`url(#${maskId}-paper-fiber)`}
                      d="M0.62 0.33 C0.72 0.18 0.94 0.23 1.04 0.42 C1.17 0.67 0.9 1.02 0.58 1.04 C0.3 1.06 0.05 0.86 0.12 0.65 C0.17 0.5 0.38 0.43 0.52 0.36 C0.57 0.34 0.6 0.34 0.62 0.33Z"
                    />
                  </g>
                </mask>
              </defs>
            </svg>
          </>
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
