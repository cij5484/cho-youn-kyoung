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
          <svg
            className="hero-ink-reveal"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            focusable="false"
          >
            <defs>
              <filter id={`${maskId}-paper-grain`} x="-12%" y="-12%" width="124%" height="124%">
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.018 0.07"
                  numOctaves="3"
                  seed="19"
                  result="paperNoise"
                />
                <feDisplacementMap in="SourceGraphic" in2="paperNoise" scale="5.8" xChannelSelector="R" yChannelSelector="G" />
                <feGaussianBlur stdDeviation="0.52" result="feather" />
                <feComponentTransfer>
                  <feFuncA type="gamma" amplitude="1.08" exponent="0.72" offset="0" />
                </feComponentTransfer>
              </filter>
              <filter id={`${maskId}-fiber-edge`} x="-18%" y="-18%" width="136%" height="136%">
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.055 0.16"
                  numOctaves="2"
                  seed="43"
                  result="fiberNoise"
                />
                <feDisplacementMap in="SourceGraphic" in2="fiberNoise" scale="8.4" xChannelSelector="R" yChannelSelector="B" />
                <feGaussianBlur stdDeviation="1.2" result="softBloom" />
                <feComponentTransfer>
                  <feFuncA type="table" tableValues="0 0.08 0.3 0.68 0.92 1" />
                </feComponentTransfer>
              </filter>
              <mask id={`${maskId}-ink-mask`} maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100">
                <rect width="100" height="100" fill="black" />
                <g className="ink-mask-flow" filter={`url(#${maskId}-paper-grain)`}>
                  <path className="ink-wash ink-wash--core" fill="white" d="M62 33 C67 24 79 25 84 34 C91 43 91 58 83 68 C74 80 55 82 46 70 C38 60 43 43 54 38 C57 36 59 35 62 33Z" />
                  <path className="ink-wash ink-wash--fiber" fill="rgba(255,255,255,.62)" filter={`url(#${maskId}-fiber-edge)`} d="M58 38 C63 20 83 16 95 29 C108 43 98 64 87 78 C73 96 43 91 32 73 C22 57 33 43 48 39 C52 38 55 38 58 38Z" />
                  <path className="ink-wash ink-wash--hand" fill="rgba(255,255,255,.72)" filter={`url(#${maskId}-fiber-edge)`} d="M57 59 C65 51 79 55 85 65 C91 75 80 88 64 88 C47 88 40 77 45 68 C47 64 52 62 57 59Z" />
                  <path className="ink-wash ink-wash--upper" fill="rgba(255,255,255,.48)" filter={`url(#${maskId}-fiber-edge)`} d="M70 17 C84 11 100 18 106 32 C111 45 99 53 86 50 C73 47 61 42 61 31 C61 25 65 20 70 17Z" />
                  <path className="ink-wash ink-wash--lower" fill="rgba(255,255,255,.5)" filter={`url(#${maskId}-fiber-edge)`} d="M42 73 C55 62 81 66 96 82 C110 97 93 115 66 112 C39 109 20 93 29 81 C32 77 37 76 42 73Z" />
                  <path className="ink-wash ink-wash--finish" fill="white" filter={`url(#${maskId}-fiber-edge)`} d="M53 44 C70 14 112 14 128 47 C145 82 113 119 68 121 C26 123 -8 101 -8 69 C-8 43 29 56 53 44Z" />
                </g>
              </mask>
            </defs>
            <image
              href={heroImageSrc}
              width="100"
              height="100"
              preserveAspectRatio="xMidYMid slice"
              mask={`url(#${maskId}-ink-mask)`}
              onError={() => setHasHeroImage(false)}
            />
          </svg>
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
