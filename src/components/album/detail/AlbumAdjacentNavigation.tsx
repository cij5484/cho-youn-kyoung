import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { albums } from '../../../data/albums';
import { preloadAlbumDetail } from './preloadAlbumDetail';
import { useAlbumStage } from '../AlbumStages';

export function AlbumAdjacentNavigation({ currentId, tone }: { currentId: string; tone: 'han' | 'ji' | 'pyeongjo' | 'yeongsan' }) {
  const available = albums.filter((album) => album.detailsPath);
  const currentIndex = available.findIndex((album) => album.id === currentId);
  const next = available[(currentIndex + 1) % available.length];
  const navigate = useNavigate();
  const nextStage = useAlbumStage(next?.id ?? currentId);
  const [desktop, setDesktop] = useState(() => matchMedia('(min-width: 701px)').matches);
  const [navigating, setNavigating] = useState(false);
  useEffect(() => {
    const query = matchMedia('(min-width: 701px)');
    const update = () => setDesktop(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (!desktop || !next) return undefined;
    const warm = () => { void preloadAlbumDetail(next); };
    const idle = window.requestIdleCallback?.(warm, { timeout: 1800 }) ?? window.setTimeout(warm, 300);
    return () => window.cancelIdleCallback ? window.cancelIdleCallback(idle) : window.clearTimeout(idle);
  }, [desktop, next]);
  if (!next || next.id === currentId) return null;

  return (
    <nav className={`album-adjacent album-adjacent--${tone}`} aria-label="앨범 상세 내비게이션">
      <Link to={next.detailsPath!} state={{ autoOpenAlbum: true }} aria-disabled={desktop && navigating ? true : undefined} onClick={(event) => {
        if (!desktop) return;
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        if (navigating) return;
        setNavigating(true);
        void preloadAlbumDetail(next)
          .then(() => nextStage.prepareDetail())
          .then(() => navigate(next.detailsPath!, { state: { autoOpenAlbum: true } }))
          .catch(() => setNavigating(false));
      }}>
        <span className="album-adjacent__label">NEXT ALBUM</span>
        <strong><span>{next.title}</span><b aria-hidden="true">→</b></strong>
      </Link>
    </nav>
  );
}
