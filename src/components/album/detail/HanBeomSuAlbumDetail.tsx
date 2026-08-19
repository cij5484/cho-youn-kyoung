import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { Album } from '../../../data/albums';
import { assetUrl } from '../../../utils/assetUrl';
import type { BookletBounds, BookletVisualPhase, ExperienceMode } from './HanBeomSuAlbumDetailExperience3D';
import { useAlbumAudio } from './useAlbumAudio';
import { AlbumAdjacentNavigation } from './AlbumAdjacentNavigation';
import { useHanBeomSuStage } from '../HanBeomSuPersistentStage';

const statusLabel = { 'coming-soon': 'COMING SOON', released: 'RELEASED' } as const;

function formatTime(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
}

function canUseWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

function BookletNavigation({
  mobile,
  mobilePage,
  spread,
  onBack,
  onNext,
  onPrevious,
  disabled,
  bounds,
  pageCount,
}: {
  mobile: boolean;
  mobilePage: number;
  spread: number;
  onBack(): void;
  onNext(): void;
  onPrevious(): void;
  disabled: boolean;
  bounds?: BookletBounds;
  pageCount: number;
}) {
  const readablePages = Math.max(0, pageCount - 1);
  const spreadCount = Math.ceil(readablePages / 2);
  const atStart = mobile ? mobilePage === 0 : spread === 0;
  const atEnd = mobile ? mobilePage === readablePages - 1 : spread === spreadCount - 1;
  const pageLabel = mobile
    ? `P${mobilePage + 2} / P${pageCount}`
    : `P${spread * 2 + 2} — P${Math.min(pageCount, spread * 2 + 3)}`;

  return (
    <div className="han-detail__booklet-ui" style={bounds}>
      <div className="han-detail__booklet-controls">
        <button type="button" disabled={disabled || atStart} onClick={onPrevious}>PREVIOUS</button>
        <button type="button" disabled={disabled || atEnd} onClick={onNext}>NEXT</button>
      </div>
      <div className="han-detail__booklet-footer">
        <p aria-live="polite">{pageLabel}</p>
        <button type="button" disabled={disabled} onClick={onBack}>BACK TO ALBUM</button>
      </div>
    </div>
  );
}

function PlayerPanel({
  tracks,
  player,
  onBack,
  disabled,
}: {
  tracks: NonNullable<Album['tracks']>;
  player: ReturnType<typeof useAlbumAudio>;
  onBack(): void;
  disabled: boolean;
}) {
  return (
    <div className="han-detail__player">
      <p className="han-detail__label">TRACKS</p>
      <ol>
        {tracks.map((track, index) => (
          <li key={track.number}>
            <button
              type="button"
              aria-current={player.selected === index ? 'true' : undefined}
              disabled={disabled}
              onClick={() => player.select(index)}
            >
              <span>{String(track.number).padStart(2, '0')}</span>
              <strong>{track.title}</strong>
              <time>{track.duration}</time>
            </button>
          </li>
        ))}
      </ol>
      <p className="han-detail__selected">
        {String(player.track.number).padStart(2, '0')} · {player.track.title}
      </p>
      <div className="han-detail__transport">
        <button type="button" disabled={!player.playable} onClick={player.toggle}>
          {player.playing ? 'PAUSE' : 'PLAY'}
        </button>
        <span>{formatTime(player.time)}</span>
        <input
          aria-label="재생 위치"
          type="range"
          disabled={!player.playable}
          max={player.duration || 1}
          min="0"
          value={player.time}
          onChange={(event) => player.seek(Number(event.target.value))}
        />
        <span>{player.track.duration ?? formatTime(player.duration)}</span>
      </div>
      {!player.hasAudio && <p className="han-detail__audio-status">ROTATION PREVIEW · AUDIO COMING SOON</p>}
      {player.error && <p role="status">{player.error}</p>}
      <button
        className="han-detail__player-back"
        type="button"
        disabled={disabled}
        onClick={() => {
          player.pause();
          onBack();
        }}
      >
        BACK TO ALBUM
      </button>
    </div>
  );
}

export default function HanBeomSuAlbumDetail({ album }: { album: Album }) {
  const location = useLocation();
  const autoOpenAlbum = Boolean((location.state as { autoOpenAlbum?: boolean } | null)?.autoOpenAlbum);
  const { setDetailProps } = useHanBeomSuStage();
  const [mode, setMode] = useState<ExperienceMode>(() => autoOpenAlbum ? 'ALBUM_OPEN' : 'CLOSED');
  const [spread, setSpread] = useState(0);
  const [settledSpread, setSettledSpread] = useState(0);
  const [bookletPhase, setBookletPhase] = useState<BookletVisualPhase>('RESTING');
  const [mobilePage, setMobilePage] = useState(0);
  const [sceneTransitioning, setSceneTransitioning] = useState(autoOpenAlbum);
  const [openingFromClosed, setOpeningFromClosed] = useState(autoOpenAlbum);
  const [pageTurning, setPageTurning] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [backgroundSize, setBackgroundSize] = useState({ width: 0, height: 0 });
  const [bookletBounds, setBookletBounds] = useState<BookletBounds>();
  const [webgl] = useState(canUseWebGL);
  const stage = useRef<HTMLElement>(null);
  const swipe = useRef<number | undefined>(undefined);
  const pages = album.booklet?.previewImages ?? [];
  const readablePageCount = Math.max(0, pages.length - 1);
  const spreadCount = Math.ceil(readablePageCount / 2);
  const tracks = album.tracks ?? [];
  const player = useAlbumAudio(tracks);
  const handleTransitionChange = useCallback((transitioning: boolean) => {
    setSceneTransitioning(transitioning);
    if (!transitioning) setOpeningFromClosed(false);
  }, []);
  const handleBookletBounds = useCallback((bounds: BookletBounds) => {
    const stageRect = stage.current?.getBoundingClientRect();
    setBookletBounds(stageRect ? { ...bounds, left: bounds.left - stageRect.left, top: bounds.top - stageRect.top } : bounds);
  }, []);

  useEffect(() => {
    const mobileQuery = matchMedia('(max-width: 700px)');
    const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      setMobile(mobileQuery.matches);
      setReduced(motionQuery.matches);
    };
    update();
    mobileQuery.addEventListener('change', update);
    motionQuery.addEventListener('change', update);
    return () => {
      mobileQuery.removeEventListener('change', update);
      motionQuery.removeEventListener('change', update);
    };
  }, []);

  useEffect(() => {
    const urls = (album.booklet?.previewImages ?? []).slice(1, 4).map((page) => assetUrl(page.src)!);
    let cancelled = false;
    const preload = async () => {
      for (const url of urls) {
        if (cancelled) return;
        const image = new Image();
        image.src = url;
        try { await image.decode(); } catch { /* The 3D loader remains the fallback. */ }
      }
    };
    const idle = window.requestIdleCallback?.(() => { void preload(); }, { timeout: 1800 })
      ?? window.setTimeout(() => { void preload(); }, 700);
    return () => {
      cancelled = true;
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
    };
  }, [album]);

  useEffect(() => {
    const element = stage.current;
    if (!element) return undefined;
    const update = () => setBackgroundSize({ width: element.clientWidth, height: element.clientHeight });
    queueMicrotask(update);
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const previous = useCallback(() => {
    if (pageTurning || sceneTransitioning || (!mobile && spread !== settledSpread)) return;
    if ((mobile && mobilePage === 0) || (!mobile && settledSpread === 0)) return;
    if (mobile) { setPageTurning(true); setMobilePage((value) => Math.max(0, value - 1)); }
    else setSpread((value) => Math.max(0, value - 1));
  }, [mobile, mobilePage, pageTurning, sceneTransitioning, settledSpread, spread]);

  const next = useCallback(() => {
    if (pageTurning || sceneTransitioning || (!mobile && spread !== settledSpread)) return;
    if ((mobile && mobilePage === readablePageCount - 1) || (!mobile && settledSpread === spreadCount - 1)) return;
    if (mobile) { setPageTurning(true); setMobilePage((value) => Math.min(readablePageCount - 1, value + 1)); }
    else setSpread((value) => Math.min(spreadCount - 1, value + 1));
  }, [mobile, mobilePage, pageTurning, readablePageCount, sceneTransitioning, settledSpread, spread, spreadCount]);

  const openAlbum = useCallback(() => {
    if (sceneTransitioning || mode !== 'CLOSED') return;
    setOpeningFromClosed(true);
    setSceneTransitioning(true);
    setMode('ALBUM_OPEN');
  }, [mode, sceneTransitioning]);

  const openBooklet = useCallback(() => {
    setSpread(0);
    setSettledSpread(0);
    setMobilePage(0);
    if (sceneTransitioning) return;
    setBookletPhase('ENTERING');
    setSceneTransitioning(true);
    setMode('BOOKLET_FOCUS');
    if (!mobile) stage.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  }, [mobile, reduced, sceneTransitioning]);

  const backToAlbum = () => {
    if (sceneTransitioning || pageTurning) return;
    player.pause();
    if (mode === 'BOOKLET_FOCUS') setBookletPhase(mobile ? 'RETURNING_FINISH' : 'RETURNING_MOVE');
    setSceneTransitioning(true);
    setMode('ALBUM_OPEN');
  };

  const enterPlayer = useCallback(() => {
    if (!sceneTransitioning && mode === 'ALBUM_OPEN') {
      setSceneTransitioning(true);
      setMode('PLAYER_FOCUS');
    }
  }, [mode, sceneTransitioning]);
  const handlePageTurnStart = useCallback((direction: 'forward' | 'backward') => {
    if (mobile) return;
    setBookletPhase(direction === 'forward' ? 'TURNING_FORWARD' : 'TURNING_BACKWARD');
    setPageTurning(true);
  }, [mobile]);
  const handlePageTurnComplete = useCallback(() => {
    if (!mobile) {
      setSettledSpread(spread);
      setBookletPhase('READING');
    }
    setPageTurning(false);
  }, [mobile, spread]);

  useEffect(() => () => setDetailProps(null), [setDetailProps]);
  useLayoutEffect(() => {
    setDetailProps({
      album, backgroundSize, openingFromClosed, mobile, mode, page: mobile ? mobilePage : spread, bookletPhase, detailActive: true,
      playing: player.playing, reduced, homeActivationKey: 0, onTransitionChange: handleTransitionChange,
      onBookletPhaseChange: setBookletPhase, onPageTurnStart: handlePageTurnStart,
      onPageTurnComplete: handlePageTurnComplete, onBooklet: openBooklet,
      onBookletBounds: handleBookletBounds,
      onPrevious: previous, onNext: next, onOpen: openAlbum, onPlayer: enterPlayer,
    });
  }, [album, backgroundSize, bookletPhase, enterPlayer, handleBookletBounds, handleTransitionChange, mobile, mobilePage, mode,
    handlePageTurnComplete, handlePageTurnStart, next, openAlbum, openBooklet, openingFromClosed, player.playing, previous, reduced,
    setDetailProps, spread]);

  useEffect(() => {
    if (mode !== 'BOOKLET_FOCUS') return undefined;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') previous();
      if (event.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [mode, next, previous]);

  if (!webgl) {
    return (
      <article className="han-detail han-detail--fallback">
        <Link to="/works">← BACK TO WORKS</Link>
        <img src={assetUrl(album.coverImage!)} alt={`${album.title} 앨범 커버`} />
        <h1>{album.title}</h1>
        <p>ALBUM · {album.year}</p>
        <Editorial album={album} />
        <section>
          <h2>DIGITAL BOOKLET</h2>
          <div className="han-detail__fallback-grid">
            {pages.map((page) => <img key={page.src} src={assetUrl(page.src)} alt={page.alt} />)}
          </div>
        </section>
      </article>
    );
  }

  return (
    <article className={`han-detail han-detail--${mode.toLowerCase()}`}>
      <section
        className="han-detail__stage"
        ref={stage}
        aria-label="한범수류 앨범 인터랙티브 전시"
      >
        {(mode === 'CLOSED' || mode === 'ALBUM_OPEN') && !sceneTransitioning && (
          <AlbumAdjacentNavigation currentId={album.id} tone="han" />
        )}
        {mobile && mode === 'BOOKLET_FOCUS' && (
          <div
            className="han-detail__swipe-surface"
            aria-hidden="true"
            onTouchStart={(event) => { swipe.current = event.touches[0].clientX; }}
            onTouchEnd={(event) => {
              if (swipe.current === undefined) return;
              const distance = event.changedTouches[0].clientX - swipe.current;
              if (Math.abs(distance) > 45) (distance > 0 ? previous : next)();
              swipe.current = undefined;
            }}
          />
        )}
        {mode === 'CLOSED' && !sceneTransitioning && (
          <div className="han-detail__intro">
            <Link to="/works" className="han-detail__back">← BACK TO WORKS</Link>
            <p>ALBUM · {album.year}</p>
            <h1>조윤경 해금산조</h1>
            <h2>한범수류</h2>
            <p className="han-detail__english">{album.englishTitle}</p>
            {album.releaseStatus && <strong>{statusLabel[album.releaseStatus]}</strong>}
            <button type="button" disabled={sceneTransitioning} onClick={openAlbum}>OPEN ALBUM <span>→</span></button>
          </div>
        )}
        {mode === 'ALBUM_OPEN' && !sceneTransitioning && (
          <div className="han-detail__open-ui">
            <section className="han-detail__open-info" aria-labelledby="open-album-info">
              <p id="open-album-info" className="han-detail__open-label">ALBUM · {album.year}</p>
              <h1>조윤경 해금산조</h1>
              <h2>한범수류</h2>
              <p className="han-detail__open-meta">
                {tracks.length} TRACKS
                {album.releaseStatus && <strong>{statusLabel[album.releaseStatus]}</strong>}
                {album.releaseDate && <strong>{album.releaseDate.replaceAll('-', '.')}</strong>}
              </p>
            </section>
            {album.credits?.length && (
              <section className="han-detail__open-credits" aria-labelledby="open-album-credits">
                <h2 id="open-album-credits">CREDITS</h2>
                <dl>
                  {album.credits.map((credit) => (
                    <div key={credit.role}>
                      <dt>{credit.role}</dt>
                      <dd>{credit.names.join(' · ')}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}
            <button className="han-detail__callout han-detail__callout--booklet" type="button" onClick={openBooklet}>
              <span>BOOKLET</span>
              <svg viewBox="0 0 210 32" aria-hidden="true">
                <path d="M1 16 H178 L195 3" pathLength="1" />
              </svg>
            </button>
            <button className="han-detail__callout han-detail__callout--tracks" type="button" onClick={enterPlayer}>
              <svg viewBox="0 0 210 32" aria-hidden="true">
                <path d="M15 3 L32 16 H209" pathLength="1" />
              </svg>
              <span>TRACKS</span>
            </button>
            <button className="han-detail__close-album" type="button" onClick={() => { setSceneTransitioning(true); setMode('CLOSED'); }}>
              CLOSE ALBUM
            </button>
          </div>
        )}
        {(mode === 'BOOKLET_FOCUS' || bookletPhase !== 'RESTING') && (
          <>
            {bookletBounds && (mobile ? !pageTurning : bookletPhase === 'READING') && (
              <div className={`han-detail__booklet-images${mobile ? ' is-mobile' : ''}`} style={bookletBounds} aria-hidden="true">
                {(mobile
                  ? [pages[mobilePage + 1]]
                  : [pages[settledSpread * 2 + 1], pages[settledSpread * 2 + 2]])
                  .filter(Boolean)
                  .map((page) => <img key={page.src} src={assetUrl(page.src)} alt="" />)}
              </div>
            )}
            {!mobile && mode === 'BOOKLET_FOCUS' && (
              <div className="han-detail__booklet-hit-areas" aria-label="북클릿 페이지 이동" style={bookletBounds}>
                <button type="button" aria-label="이전 북클릿 펼침면" disabled={bookletPhase !== 'READING' || pageTurning || settledSpread === 0} onClick={previous} />
                <button type="button" aria-label="다음 북클릿 펼침면" disabled={bookletPhase !== 'READING' || pageTurning || settledSpread === spreadCount - 1} onClick={next} />
              </div>
            )}
            {mode === 'BOOKLET_FOCUS' && <BookletNavigation
              mobile={mobile}
              mobilePage={mobilePage}
              spread={mobile ? spread : settledSpread}
              disabled={sceneTransitioning || pageTurning || (!mobile && bookletPhase !== 'READING')}
              bounds={bookletBounds}
              pageCount={pages.length}
              onBack={backToAlbum}
              onNext={next}
              onPrevious={previous}
            />}
          </>
        )}
        {mode === 'PLAYER_FOCUS' && !sceneTransitioning && (
          <>
            <PlayerPanel tracks={tracks} player={player} onBack={backToAlbum} disabled={sceneTransitioning} />
          </>
        )}
      </section>
    </article>
  );
}

function Editorial({ album }: { album: Album }) {
  return (
    <div className="han-detail__editorial">
      {album.credits?.length && (
        <section>
          <h2>CREDITS</h2>
          <dl>
            {album.credits.map((credit) => (
              <div key={credit.role}>
                <dt>{credit.role}</dt>
                <dd>{credit.names.join(' · ')}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
      {album.streamingLinks?.map((stream) => (
        <a className="han-detail__works" href={stream.url} target="_blank" rel="noreferrer" key={stream.url}>{stream.label ?? stream.platform} ↗</a>
      ))}
      <Link className="han-detail__works" to="/works">← BACK TO WORKS</Link>
    </div>
  );
}
