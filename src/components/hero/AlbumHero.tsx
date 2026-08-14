import { Link } from 'react-router-dom';
import type { HomeHeroSlide } from '../../data/homeHeroSlides';
import { AlbumPackage3D } from './album/AlbumPackage3D';

type AlbumHeroProps = {
  slide: HomeHeroSlide;
};

export function AlbumHero({ slide }: AlbumHeroProps) {
  return (
    <section className="album-hero" aria-labelledby={`${slide.id}-hero-title`}>
      <div className="album-hero__object" role="img" aria-label={`${slide.title} 디지팩 3D 미리보기`}>
        <AlbumPackage3D textures={slide.albumTextures} />
      </div>
      <div className="album-hero__content">
        <p className="album-hero__eyebrow">{slide.eyebrow || 'ALBUM'}</p>
        <h1 id={`${slide.id}-hero-title`}>{slide.title}</h1>
        {slide.subtitle ? <p className="album-hero__subtitle">{slide.subtitle}</p> : null}
        <p className="album-hero__meta">{slide.displayDate}</p>
        {slide.trackCount ? <p className="album-hero__tracks">{slide.trackCount} TRACKS</p> : null}
        <Link className="album-hero__link" to={slide.detailLink}>
          VIEW ALBUM <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
