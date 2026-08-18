import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Album } from '../../../data/albums';
import { assetUrl } from '../../../utils/assetUrl';
import type { BookletBounds, ExperienceMode } from './AlbumDetailExperience3D';
import { useAlbumAudio } from './useAlbumAudio';
import { useJiYoungHeeStage } from '../JiYoungHeePersistentStage';

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
}: {
  mobile: boolean;
  mobilePage: number;
  spread: number;
  onBack(): void;
  onNext(): void;
  onPrevious(): void;
  disabled: boolean;
  bounds?: BookletBounds;
}) {
  const atStart = mobile ? mobilePage === 0 : spread === 0;
  const atEnd = mobile ? mobilePage === 5 : spread === 2;
  const pageLabel = mobile
    ? `P${mobilePage + 2} / P7`
    : `P${spread * 2 + 2} — P${spread * 2 + 3}`;

  return (
    <div className="ji-detail__booklet-ui" style={bounds}>
      <div className="ji-detail__booklet-controls">
        <button type="button" disabled={disabled || atStart} onClick={onPrevious}>PREVIOUS</button>
        <button type="button" disabled={disabled || atEnd} onClick={onNext}>NEXT</button>
      </div>
      <div className="ji-detail__booklet-footer">
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
    <div className="ji-detail__player">
      <p className="ji-detail__label">TRACKS</p>
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
      <p className="ji-detail__selected">
        {String(player.track.number).padStart(2, '0')} · {player.track.title}
      </p>
      <div className="ji-detail__transport">
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
      {!player.hasAudio && <p className="ji-detail__audio-status">ROTATION PREVIEW · AUDIO COMING SOON</p>}
      {player.error && <p role="status">{player.error}</p>}
      <button
        className="ji-detail__player-back"
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

export default function JiYoungHeeAlbumDetail({ album }: { album: Album }) {
  const { setDetailProps, setDetailStageVisible } = useJiYoungHeeStage();
  const [mode, setMode] = useState<ExperienceMode>('CLOSED');
  const [spread, setSpread] = useState(0);
  const [mobilePage, setMobilePage] = useState(0);
  const [sceneTransitioning, setSceneTransitioning] = useState(false);
  const [openingFromClosed, setOpeningFromClosed] = useState(false);
  const [pageTurning, setPageTurning] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [backgroundSize, setBackgroundSize] = useState({ width: 0, height: 0 });
  const [bookletBounds, setBookletBounds] = useState<BookletBounds>();
  const [stageVisible, setStageVisible] = useState(true);
  const [webgl] = useState(canUseWebGL);
  const stage = useRef<HTMLElement>(null);
  const swipe = useRef<number | undefined>(undefined);
  const pages = album.booklet?.previewImages ?? [];
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
    const element = stage.current;
    if (!element) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      const visible = entry.isIntersecting && entry.intersectionRatio > 0.72;
      setStageVisible(visible);
      setDetailStageVisible(visible);
    }, { threshold: [0, 0.72, 0.85] });
    observer.observe(element);
    return () => {
      observer.disconnect();
      setDetailStageVisible(true);
    };
  }, [setDetailStageVisible]);

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
    if (pageTurning || sceneTransitioning) return;
    if ((mobile && mobilePage === 0) || (!mobile && spread === 0)) return;
    setPageTurning(true);
    if (mobile) setMobilePage((value) => Math.max(0, value - 1));
    else setSpread((value) => Math.max(0, value - 1));
  }, [mobile, mobilePage, pageTurning, sceneTransitioning, spread]);

  const next = useCallback(() => {
    if (pageTurning || sceneTransitioning) return;
    if ((mobile && mobilePage === 5) || (!mobile && spread === 2)) return;
    setPageTurning(true);
    if (mobile) setMobilePage((value) => Math.min(5, value + 1));
    else setSpread((value) => Math.min(2, value + 1));
  }, [mobile, mobilePage, pageTurning, sceneTransitioning, spread]);

  const openAlbum = useCallback(() => {
    if (sceneTransitioning || mode !== 'CLOSED') return;
    setOpeningFromClosed(true);
    setSceneTransitioning(true);
    setMode('ALBUM_OPEN');
  }, [mode, sceneTransitioning]);

  const openBooklet = useCallback(() => {
    setSpread(0);
    setMobilePage(0);
    if (sceneTransitioning) return;
    setSceneTransitioning(true);
    setMode('BOOKLET_FOCUS');
    stage.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  }, [reduced, sceneTransitioning]);

  const backToAlbum = () => {
    if (sceneTransitioning || pageTurning) return;
    player.pause();
    setSceneTransitioning(true);
    setMode('ALBUM_OPEN');
  };

  const enterPlayer = useCallback(() => {
    if (!sceneTransitioning && mode === 'ALBUM_OPEN') {
      setSceneTransitioning(true);
      setMode('PLAYER_FOCUS');
    }
  }, [mode, sceneTransitioning]);

  useEffect(() => () => setDetailProps(null), [setDetailProps]);
  useEffect(() => {
    setDetailProps({
      album, backgroundSize, openingFromClosed, mobile, mode, page: mobile ? mobilePage : spread,
      playing: player.playing, reduced, homeActivationKey: 0, onTransitionChange: handleTransitionChange,
      onPageTurnComplete: () => setPageTurning(false), onBooklet: openBooklet,
      onBookletBounds: handleBookletBounds,
      onPrevious: previous, onNext: next, onOpen: openAlbum, onPlayer: enterPlayer,
    });
  }, [album, backgroundSize, enterPlayer, handleBookletBounds, handleTransitionChange, mobile, mobilePage, mode,
    next, openAlbum, openBooklet, openingFromClosed, player.playing, previous, reduced,
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
      <article className="ji-detail ji-detail--fallback">
        <Link to="/works">← BACK TO WORKS</Link>
        <img src={assetUrl(album.coverImage!)} alt={`${album.title} 앨범 커버`} />
        <h1>{album.title}</h1>
        <p>ALBUM · {album.year}</p>
        <Editorial album={album} />
        <section>
          <h2>DIGITAL BOOKLET</h2>
          <div className="ji-detail__fallback-grid">
            {pages.map((page) => <img key={page.src} src={assetUrl(page.src)} alt={page.alt} />)}
          </div>
        </section>
      </article>
    );
  }

  return (
    <article className={`ji-detail ji-detail--${mode.toLowerCase()}`}>
      <section
        className="ji-detail__stage"
        ref={stage}
        aria-label="지영희류 앨범 인터랙티브 전시"
      >
        {mobile && mode === 'BOOKLET_FOCUS' && (
          <div
            className="ji-detail__swipe-surface"
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
          <div className="ji-detail__intro">
            <Link to="/works" className="ji-detail__back">← BACK TO WORKS</Link>
            <p>ALBUM · {album.year}</p>
            <h1>조윤경 해금산조</h1>
            <h2>지영희류</h2>
            <p className="ji-detail__english">{album.englishTitle}</p>
            {album.releaseStatus && <strong>{statusLabel[album.releaseStatus]}</strong>}
            <button type="button" disabled={sceneTransitioning} onClick={openAlbum}>OPEN ALBUM <span>→</span></button>
          </div>
        )}
        {mode === 'ALBUM_OPEN' && !sceneTransitioning && (
          <div className={`ji-detail__mode-actions${stageVisible ? '' : ' is-editorial-hidden'}`}>
            <button type="button" disabled={sceneTransitioning} onClick={openBooklet}>BOOKLET</button>
            <button type="button" disabled={sceneTransitioning} onClick={enterPlayer}>CD / TRACKS</button>
            <button type="button" disabled={sceneTransitioning} onClick={() => { setSceneTransitioning(true); setMode('CLOSED'); }}>CLOSE ALBUM</button>
          </div>
        )}
        {mode === 'BOOKLET_FOCUS' && !sceneTransitioning && (
          <>
            {!mobile && (
              <div className="ji-detail__booklet-hit-areas" aria-label="북클릿 페이지 이동" style={bookletBounds}>
                <button type="button" aria-label="이전 북클릿 펼침면" disabled={pageTurning || spread === 0} onClick={previous} />
                <button type="button" aria-label="다음 북클릿 펼침면" disabled={pageTurning || spread === 2} onClick={next} />
              </div>
            )}
            <BookletNavigation
              mobile={mobile}
              mobilePage={mobilePage}
              spread={spread}
              disabled={sceneTransitioning || pageTurning}
              bounds={bookletBounds}
              onBack={backToAlbum}
              onNext={next}
              onPrevious={previous}
            />
          </>
        )}
        {mode === 'PLAYER_FOCUS' && !sceneTransitioning && (
          <>
            <PlayerPanel tracks={tracks} player={player} onBack={backToAlbum} disabled={sceneTransitioning} />
          </>
        )}
      </section>
      <Editorial album={album} />
    </article>
  );
}

function Editorial({ album }: { album: Album }) {
  return (
    <div className="ji-detail__editorial">
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
      <Link className="ji-detail__works" to="/works">← BACK TO WORKS</Link>
    </div>
  );
}
