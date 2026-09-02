import { Link } from 'react-router-dom';
import type { HomeHeroSlide } from '../../data/homeHeroSlides';
import { AlbumPackage3D } from './album/AlbumPackage3D';
import { useEffect } from 'react';
import { useOptionalAlbumStage } from '../album/AlbumStages';
import { AlbumClosedInfo } from '../album/AlbumClosedInfo';
import { albums } from '../../data/albums';
import { scheduleAlbumDetailPreload } from '../album/detail/preloadAlbumDetail';

type AlbumHeroProps = {
  slide: HomeHeroSlide;
};

export function AlbumHero({ slide }: AlbumHeroProps) {
  const stage = useOptionalAlbumStage(slide.id);
  const setHomeActive = stage?.setHomeActive;
  const persistent = Boolean(stage);
  useEffect(() => {
    if (!setHomeActive) return;
    setHomeActive(true);
    return () => setHomeActive(false);
  }, [setHomeActive]);
  useEffect(() => {
    if (!stage) return;
    const album = albums.find((item) => item.id === slide.id);
    if (!album) return;
    // Prepare the interior after the visible cover has had a chance to paint.
    // Shader compilation remains owned by the detail stage.
    return scheduleAlbumDetailPreload(album);
  }, [slide.id, stage]);
  const [year, status] = slide.displayDate.split(' · ');

  return (
    <section className={`album-hero album-hero--${slide.id}${persistent ? ' is-persistent' : ''}`} data-album-id={slide.id} aria-labelledby={`${slide.id}-hero-title`}>
      {slide.albumBackground && !persistent ? (
        <picture className="album-hero__background" aria-hidden="true">
          <source media="(max-width: 700px)" srcSet={slide.albumBackground.mobile} />
          <img src={slide.albumBackground.desktop} alt="" />
        </picture>
      ) : null}
      {!persistent && <div className="album-hero__stage" role="img" aria-label={`${slide.title} 디지팩 3D 미리보기`}>
        <AlbumPackage3D textures={slide.albumTextures} backgroundAnchor={slide.albumBackgroundAnchor} geometry={slide.albumPackageGeometry} />
      </div>}
      <AlbumClosedInfo
        eyebrow={slide.eyebrow || 'ALBUM'}
        headingId={`${slide.id}-hero-title`}
        status={status}
        subtitle={slide.subtitle}
        title={slide.title}
        trackCount={slide.trackCount}
        year={year}
        action={(
          <Link to={slide.detailLink} state={persistent ? { autoOpenAlbum: true } : undefined}>
            VIEW ALBUM <span aria-hidden="true">→</span>
          </Link>
        )}
      />
    </section>
  );
}
