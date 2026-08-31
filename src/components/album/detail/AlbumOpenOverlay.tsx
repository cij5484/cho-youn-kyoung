import { useId } from 'react';
import type { Album } from '../../../data/albums';
import '../../../styles/album-open.css';

const statusLabels = { 'coming-soon': 'COMING SOON', released: 'RELEASED' } as const;

type AlbumOpenOverlayProps = {
  album: Album;
  title: string;
  subtitle: string;
  visible: boolean;
  onBooklet(): void;
  onTracks(): void;
  onClose(): void;
};

export function AlbumOpenOverlay({ album, title, subtitle, visible, onBooklet, onTracks, onClose }: AlbumOpenOverlayProps) {
  const id = useId();
  const tracks = album.tracks ?? [];
  // Do not show an invented total when any track duration is missing.
  const totalSeconds = tracks.length && tracks.every((track) => /^\d+:\d{2}$/.test(track.duration ?? ''))
    ? tracks.reduce((sum, track) => {
      const [minutes, seconds] = track.duration!.split(':').map(Number);
      return sum + minutes * 60 + seconds;
    }, 0)
    : null;
  const duration = totalSeconds
    ? `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, '0')}`
    : null;

  return (
    <div className="album-open" aria-hidden={!visible} inert={!visible}>
      <div className="album-open__header">
        <section className="album-open__info" aria-labelledby={`${id}-title`}>
          <p className="album-open__label">ALBUM · {album.year}</p>
          <div className="album-open__heading">
            <h1 id={`${id}-title`}>{title}</h1>
            <h2>{subtitle}</h2>
          </div>
          <p className="album-open__meta">
            <span>{tracks.length} TRACKS{duration && ` · ${duration}`}</span>
            {album.releaseStatus && <strong>{statusLabels[album.releaseStatus]}</strong>}
            {album.releaseDate && <time dateTime={album.releaseDate}>{album.releaseDate.replaceAll('-', '.')}</time>}
          </p>
        </section>
        {Boolean(album.credits?.length) && (
          <section className="album-open__credits" aria-labelledby={`${id}-credits`}>
            <h2 id={`${id}-credits`} className="album-open__label">CREDITS</h2>
            <dl>
              {album.credits!.map((credit) => (
                <div key={credit.role}>
                  <dt>{credit.role}</dt>
                  <dd>{credit.names.join(' · ')}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}
      </div>
      <nav className="album-open__actions" aria-label="앨범 탐색">
        <button className="album-open__action album-open__booklet" type="button" onClick={onBooklet}>BOOKLET</button>
        <button className="album-open__action album-open__tracks" type="button" onClick={onTracks}>TRACKS</button>
        <button className="album-open__action album-open__close" type="button" onClick={onClose}>CLOSE ALBUM</button>
      </nav>
    </div>
  );
}
