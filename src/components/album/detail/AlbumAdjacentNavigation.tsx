import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { albums } from '../../../data/albums';
import { preloadAlbumDetail } from './preloadAlbumDetail';

export function AlbumAdjacentNavigation({ currentId, tone }: { currentId: string; tone: 'han' | 'ji' }) {
  const available = albums.filter((album) => album.detailsPath);
  const currentIndex = available.findIndex((album) => album.id === currentId);
  const next = available[(currentIndex + 1) % available.length];
  const navigate = useNavigate();
  const [navigating, setNavigating] = useState(false);
  useEffect(() => {
    if (!next) return undefined;
    const warm = () => { void preloadAlbumDetail(next); };
    const idle = window.requestIdleCallback?.(warm, { timeout: 1800 }) ?? window.setTimeout(warm, 300);
    return () => window.cancelIdleCallback ? window.cancelIdleCallback(idle) : window.clearTimeout(idle);
  }, [next]);
  if (!next || next.id === currentId) return null;

  return (
    <nav className={`album-adjacent album-adjacent--${tone}`} aria-label="앨범 상세 내비게이션">
      <a href={next.detailsPath!} aria-disabled={navigating} onClick={(event) => {
        event.preventDefault();
        if (navigating) return;
        setNavigating(true);
        void preloadAlbumDetail(next).then(() => navigate(next.detailsPath!, { state: { autoOpenAlbum: true } })).catch(() => setNavigating(false));
      }}>
        <span className="album-adjacent__label">NEXT ALBUM</span>
        <strong><span>{next.title}</span><b aria-hidden="true">→</b></strong>
      </a>
    </nav>
  );
}
