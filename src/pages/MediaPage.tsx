import { useEffect, type ReactNode } from 'react';
import { Reveal } from '../components/Reveal';
import { SafeImage } from '../components/common/SafeImage';
import { YouTubePreview } from '../components/media/YouTubePreview';
import { albums } from '../data/albums';
import { mediaItems, mediaPageCopy, mediaSections, type MediaItem } from '../data/media';
import { site } from '../data/site';
import { assetUrl } from '../utils/assetUrl';
import '../styles/media.css';

function ExternalAction({ item }: { item: Pick<MediaItem, 'label' | 'url'> }) {
  if (!item.url || !item.label) return null;
  return (
    <a className="media-action motion-link" href={item.url} target="_blank" rel="noopener noreferrer">
      {item.label}<span aria-hidden="true">↗</span>
    </a>
  );
}

function VideoCard({ item, variant = 'selected' }: { item: MediaItem; variant?: 'featured' | 'selected' | 'special' }) {
  return (
    <article className={`media-card media-card--${variant}`}>
      <YouTubePreview youtubeId={item.youtubeId} title={item.title} />
      <div className="media-card__copy">
        {item.year && <time dateTime={item.year}>{item.year}</time>}
        <h3>{item.title}</h3>
        {item.subtitle && <p className="media-card__subtitle">{item.subtitle}</p>}
        {item.award && <p className="media-card__award">{item.award}</p>}
        <p className="media-card__description">{item.description}</p>
        <ExternalAction item={item} />
      </div>
    </article>
  );
}

function Discography() {
  return (
    <div className="media-albums">
      {albums.map((album) => {
        const streamingLink = album.streamingLinks?.[0];
        return (
          <article className="media-album" key={album.id}>
            <div className="media-album__cover">
              {album.coverImage ? (
                <SafeImage
                  src={assetUrl(album.coverImage)}
                  alt={`${album.title} 앨범 커버`}
                  fallbackClassName="media-album__fallback"
                  fallbackLabel={`${album.title}, ${album.year}`}
                />
              ) : (
                <div className="media-album__fallback" aria-label={`${album.title} 앨범 커버 준비 중`}>
                  <span>{site.artistName}</span>
                  <strong>{album.title}</strong>
                  <time dateTime={album.year}>{album.year}</time>
                </div>
              )}
            </div>
            <div className="media-album__copy">
              <time dateTime={album.year}>{album.year}</time>
              <h3>{album.title}</h3>
              <p>{album.description}</p>
              {streamingLink?.url && (
                <a className="media-action motion-link" href={streamingLink.url} target="_blank" rel="noopener noreferrer">
                  {streamingLink.label ?? streamingLink.platform}<span aria-hidden="true">↗</span>
                </a>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}

function SectionContent({ sectionId }: { sectionId: (typeof mediaSections)[number]['id'] }): ReactNode {
  if (sectionId === 'discography') return <Discography />;
  const items = mediaItems.filter((item) => item.section === sectionId);
  return (
    <div className={`media-items media-items--${sectionId}`}>
      {items.map((item) => <VideoCard item={item} variant={sectionId} key={item.id} />)}
    </div>
  );
}

export function MediaPage() {
  useEffect(() => {
    const previousTitle = document.title;
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousDescription = description?.content;
    document.title = mediaPageCopy.pageTitle;
    if (description) description.content = mediaPageCopy.metaDescription;
    return () => {
      document.title = previousTitle;
      if (description && previousDescription !== undefined) description.content = previousDescription;
    };
  }, []);

  return (
    <article className="media-page">
      <section className="media-hero" aria-labelledby="media-title">
        <div className="media-hero__copy">
          <p className="media-hero__eyebrow">{mediaPageCopy.eyebrow}</p>
          <h1 id="media-title">{mediaPageCopy.title}</h1>
          <span className="media-hero__rule" aria-hidden="true" />
          <p className="media-hero__description">{mediaPageCopy.description}</p>
        </div>
      </section>

      <div className="media-page__body">
        {mediaSections.map((section) => {
          const headingId = `media-${section.id}-title`;
          return (
            <Reveal as="section" className={`media-section media-section--${section.id}`} aria-labelledby={headingId} key={section.id}>
              <header className="media-section__heading reveal__heading">
                <span>{section.number}</span>
                <h2 id={headingId}>{section.title}</h2>
              </header>
              <div className="media-section__content reveal__content">
                <SectionContent sectionId={section.id} />
              </div>
            </Reveal>
          );
        })}
      </div>
    </article>
  );
}
