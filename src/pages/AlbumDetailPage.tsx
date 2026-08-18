import { lazy, Suspense } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SafeImage } from '../components/common/SafeImage';
import { albums } from '../data/albums';
import { assetUrl } from '../utils/assetUrl';
import { NotFoundPage } from './NotFoundPage';
import '../styles/album-detail.css';

const releaseStatusLabels = {
  'coming-soon': 'COMING SOON',
  released: 'RELEASED',
} as const;
const JiYoungHeeAlbumDetail = lazy(() => import('../components/album/detail/JiYoungHeeAlbumDetail'));

export function AlbumDetailPage() {
  const { id } = useParams();
  const album = albums.find((item) => item.id === id);

  if (!album) return <NotFoundPage />;
  if (album.id === 'ji-young-hee-ryu-haegeum-sanjo-2026') {
    return <Suspense fallback={null}><JiYoungHeeAlbumDetail album={album} /></Suspense>;
  }

  return (
    <article className="album-detail">
      <header className="album-detail__hero">
        <div className="album-detail__hero-copy">
          <Link className="album-detail__back" to="/works">← BACK TO WORKS</Link>
          <p className="album-detail__eyebrow">ALBUM · {album.year}</p>
          <h1>{album.title}</h1>
          {album.englishTitle && <p className="album-detail__english-title">{album.englishTitle}</p>}
          {album.releaseStatus && <p className="album-detail__status">{releaseStatusLabels[album.releaseStatus]}</p>}
          <p className="album-detail__description">{album.description}</p>
        </div>
        {album.coverImage && (
          <div className="album-detail__cover">
            <SafeImage src={assetUrl(album.coverImage)} alt={`${album.title} 앨범 커버`} fallbackClassName="safe-image-fallback" fallbackLabel={album.title} />
          </div>
        )}
      </header>

      <div className="album-detail__body">
        {album.detailedDescription && (
          <section className="album-detail__section" aria-labelledby="album-about-title">
            <h2 id="album-about-title">ABOUT</h2>
            <p>{album.detailedDescription}</p>
          </section>
        )}
        {album.tracks && album.tracks.length > 0 && (
          <section className="album-detail__section" aria-labelledby="album-tracks-title">
            <h2 id="album-tracks-title">TRACKS</h2>
            <ol className="album-detail__tracks">
              {album.tracks.map((track) => (
                <li key={track.number}>
                  <span>{String(track.number).padStart(2, '0')}</span>
                  <div><strong>{track.title}</strong>{track.subtitle && <small>{track.subtitle}</small>}</div>
                  {track.duration && <time>{track.duration}</time>}
                </li>
              ))}
            </ol>
          </section>
        )}
        {album.credits && album.credits.length > 0 && (
          <section className="album-detail__section" aria-labelledby="album-credits-title">
            <h2 id="album-credits-title">CREDITS</h2>
            <dl className="album-detail__credits">
              {album.credits.map((credit) => <div key={`${credit.section ?? ''}-${credit.role}`}><dt>{credit.role}</dt><dd>{credit.names.join(' · ')}</dd></div>)}
            </dl>
          </section>
        )}
        {album.streamingLinks && album.streamingLinks.length > 0 && (
          <section className="album-detail__section" aria-labelledby="album-listen-title">
            <h2 id="album-listen-title">LISTEN</h2>
            <div className="album-detail__links">
              {album.streamingLinks.map((link) => <a href={link.url} target="_blank" rel="noopener noreferrer" key={`${link.platform}-${link.url}`}>{link.label ?? link.platform} <span aria-hidden="true">↗</span></a>)}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
