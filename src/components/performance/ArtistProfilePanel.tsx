import { RefObject } from 'react';
import { SafeImage } from '../common/SafeImage';
import type { PerformanceCollaborator } from '../../data/performances';
import { assetUrl } from '../../utils/assetUrl';

type ArtistProfilePanelProps = {
  artist: PerformanceCollaborator;
  artists: PerformanceCollaborator[];
  activeIndex: number;
  panelRef: RefObject<HTMLDivElement | null>;
  onClose: () => void;
  onSelect: (artist: PerformanceCollaborator) => void;
  tone?: 'gold' | 'navy';
};

export function ArtistProfilePanel({ artist, artists, activeIndex, panelRef, onClose, onSelect, tone = 'gold' }: ArtistProfilePanelProps) {
  const previousArtist = artists[(activeIndex - 1 + artists.length) % artists.length];
  const nextArtist = artists[(activeIndex + 1) % artists.length];

  return (
    <div className="performance-detail__panel-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <aside className={`performance-detail__artist-panel performance-detail__artist-panel--${tone}`} role="dialog" aria-modal="true" aria-labelledby="artist-panel-title" tabIndex={-1} ref={panelRef}>
        <button className="performance-detail__panel-close" type="button" onClick={onClose}>CLOSE</button>
        <div className="performance-detail__panel-photo">
          <SafeImage src={assetUrl(artist.image)} alt={`${artist.name} ${artist.role} 사진`} fallbackClassName="safe-image-fallback" fallbackLabel={`${artist.role} ${artist.name}`} objectPosition={artist.id === 'kim-na-young' ? 'center center' : 'center top'} />
        </div>
        <p>{artist.role}</p>
        <h2 id="artist-panel-title">{artist.name}</h2>
        <ul>{artist.fullBio.map((bio) => <li key={bio}>{bio}</li>)}</ul>
        <h3>PARTICIPATING WORKS</h3>
        <ol>{artist.participatingWorks.map((work) => <li key={work}>{work}</li>)}</ol>
        <nav>
          <button type="button" onClick={() => onSelect(previousArtist)}>← PREV</button>
          <button type="button" onClick={() => onSelect(nextArtist)}>NEXT →</button>
        </nav>
      </aside>
    </div>
  );
}
