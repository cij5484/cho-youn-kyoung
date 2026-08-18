import { Link } from 'react-router-dom';
import type { HomeHeroSlide } from '../../data/homeHeroSlides';
import { AlbumPackage3D } from './album/AlbumPackage3D';
import { useEffect } from 'react';
import { useJiYoungHeeStage } from '../album/JiYoungHeePersistentStage';

type AlbumHeroProps = {
  slide: HomeHeroSlide;
};

export function AlbumHero({ slide }: AlbumHeroProps) {
  const { setHomeActive } = useJiYoungHeeStage();
  const persistent = slide.id === 'ji-young-hee-ryu-haegeum-sanjo-2026';
  useEffect(() => {
    if (!persistent) return undefined;
    setHomeActive(true);
    return () => setHomeActive(false);
  }, [persistent, setHomeActive]);
  const titleLines = slide.title.split('\n');
  const [year, status] = slide.displayDate.split(' · ');

  return (
    <section className={`album-hero album-hero--${slide.id}`} data-album-id={slide.id} aria-labelledby={`${slide.id}-hero-title`}>
      {slide.albumBackground && !persistent ? (
        <picture className="album-hero__background" aria-hidden="true">
          <source media="(max-width: 700px)" srcSet={slide.albumBackground.mobile} />
          <img src={slide.albumBackground.desktop} alt="" />
        </picture>
      ) : null}
      {!persistent && <div className="album-hero__stage" role="img" aria-label={`${slide.title} 디지팩 3D 미리보기`}>
        <AlbumPackage3D textures={slide.albumTextures} backgroundAnchor={slide.albumBackgroundAnchor} geometry={slide.albumPackageGeometry} />
      </div>}
      <div className="album-hero__content">
        <p className="album-hero__eyebrow">{slide.eyebrow || 'ALBUM'}</p>
        <h1 id={`${slide.id}-hero-title`}>
          {titleLines.map((line) => <span key={line}>{line}</span>)}
        </h1>
        {slide.subtitle ? <p className="album-hero__subtitle">{slide.subtitle}</p> : null}
        <p className="album-hero__meta">
          <span>{year}</span>
          {status ? <span className="album-hero__status">{status}</span> : null}
        </p>
        {slide.trackCount ? <p className="album-hero__tracks">{slide.trackCount} TRACKS</p> : null}
        <Link className="album-hero__link" to={slide.detailLink}>
          VIEW ALBUM <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
