/* eslint-disable react-refresh/only-export-components */
import { createContext, lazy, Suspense, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { albums } from '../../data/albums';
import { assetUrl } from '../../utils/assetUrl';
import type { ExperienceProps } from './detail/HanBeomSuAlbumDetailExperience3D';

const Experience3D = lazy(() => import('./detail/HanBeomSuAlbumDetailExperience3D'));
const ALBUM_ID = 'han-beom-su-haegeum-sanjo-2020';

type StageContextValue = {
  setDetailProps(props: ExperienceProps | null): void;
  setHomeActive(active: boolean): void;
  prepareDetail(): Promise<void>;
};

const StageContext = createContext<StageContextValue | null>(null);

export function useHanBeomSuStage() {
  const value = useContext(StageContext);
  if (!value) throw new Error('useHanBeomSuStage must be used inside HanBeomSuPersistentStage');
  return value;
}

export function HanBeomSuPersistentStage({ children }: { children: ReactNode }) {
  const location = useLocation();
  const album = albums.find((item) => item.id === ALBUM_ID)!;
  const detailRoute = location.pathname === `/album/${ALBUM_ID}`;
  const [homeActive, setHomeActive] = useState(false);
  const [detailProps, setDetailProps] = useState<ExperienceProps | null>(null);
  const [prewarming, setPrewarming] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [homeActivationKey, setHomeActivationKey] = useState(0);
  const [backgroundSize, setBackgroundSize] = useState({ width: 0, height: 0 });
  const stage = useRef<HTMLDivElement>(null);
  const previousPath = useRef(location.pathname);
  const homeActiveRef = useRef(false);
  const prewarmReady = useRef(false);
  const prewarmPromise = useRef<Promise<void> | null>(null);
  const resolvePrewarm = useRef<(() => void) | null>(null);

  const handlePrewarmReady = useCallback(() => {
    prewarmReady.current = true;
    resolvePrewarm.current?.();
    resolvePrewarm.current = null;
  }, []);

  const updateHomeActive = useCallback((active: boolean) => {
    if (active && !homeActiveRef.current) setHomeActivationKey((key) => key + 1);
    homeActiveRef.current = active;
    setHomeActive(active);
  }, []);

  useEffect(() => {
    const previous = previousPath.current;
    if (location.pathname === '/' && previous !== '/' && previous !== `/album/${ALBUM_ID}`) {
      setHomeActivationKey((key) => key + 1);
    }
    previousPath.current = location.pathname;
  }, [location.pathname]);

  useEffect(() => {
    if (!homeActive || location.pathname !== '/') return undefined;
    const preload = () => [album.booklet?.previewImages[0].src, album.cdLabelImage].forEach((src) => {
      if (!src) return;
      const image = new Image();
      image.src = assetUrl(src) ?? src;
    });
    const idleWindow = window as unknown as { requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number; cancelIdleCallback?: (handle: number) => void };
    const requestIdle = idleWindow.requestIdleCallback;
    const handle = requestIdle ? requestIdle(preload, { timeout: 2200 }) : window.setTimeout(preload, 900);
    return () => requestIdle ? idleWindow.cancelIdleCallback?.(handle) : window.clearTimeout(handle);
  }, [album, homeActive, location.pathname]);

  useEffect(() => {
    const query = matchMedia('(max-width: 700px)');
    const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      setMobile(query.matches);
      setReduced(motionQuery.matches);
    };
    update();
    query.addEventListener('change', update);
    motionQuery.addEventListener('change', update);
    return () => {
      query.removeEventListener('change', update);
      motionQuery.removeEventListener('change', update);
    };
  }, []);

  useEffect(() => {
    if (!stage.current) return undefined;
    const update = () => setBackgroundSize({ width: stage.current!.clientWidth, height: stage.current!.clientHeight });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(stage.current);
    return () => observer.disconnect();
  }, []);

  const fallbackProps = useMemo<ExperienceProps>(() => ({
    album,
    backgroundSize,
    openingFromClosed: false,
    mode: 'CLOSED',
    page: 0,
    mobile,
    playing: false,
    reduced,
    homeActivationKey,
    detailActive: prewarming,
    onOpen: () => undefined,
    onBooklet: () => undefined,
    onPlayer: () => undefined,
    onPrevious: () => undefined,
    onNext: () => undefined,
    onPrewarmReady: prewarming ? handlePrewarmReady : undefined,
  }), [album, backgroundSize, handlePrewarmReady, homeActivationKey, mobile, prewarming, reduced]);
  const prepareDetail = useCallback(() => {
    if (mobile || prewarmReady.current) return Promise.resolve();
    if (prewarmPromise.current) return prewarmPromise.current;
    setPrewarming(true);
    prewarmPromise.current = new Promise<void>((resolve) => { resolvePrewarm.current = resolve; });
    return prewarmPromise.current;
  }, [mobile]);
  useEffect(() => {
    if (detailRoute && prewarmReady.current) queueMicrotask(() => setPrewarming(false));
    if (!detailRoute && location.pathname !== '/') {
      queueMicrotask(() => setPrewarming(false));
      prewarmReady.current = false;
      prewarmPromise.current = null;
      resolvePrewarm.current = null;
    }
  }, [detailRoute, location.pathname]);
  // On desktop, retain the outgoing detail stage for HOME's first commit.
  // The detail cleanup and AlbumHero activation then hand ownership over in
  // the same effect flush, so neither the body nor an empty canvas is exposed.
  const desktopDetailHandoff = !mobile && location.pathname === '/' && detailProps !== null;
  const visible = detailRoute || (location.pathname === '/' && (homeActive || desktopDetailHandoff));
  const context = useMemo(() => ({ setDetailProps, setHomeActive: updateHomeActive, prepareDetail }), [prepareDetail, updateHomeActive]);
  const routeEligible = detailRoute || prewarming || (location.pathname === '/' && (homeActive || desktopDetailHandoff));

  return (
    <StageContext.Provider value={context}>
      {routeEligible && <div ref={stage} className={`han-persistent-stage${visible ? ' is-visible' : ''}`} aria-hidden={!visible}>
        <picture className="han-persistent-stage__background">
          <source media="(max-width:700px)" srcSet={assetUrl(album.albumHero!.background.mobile)} />
          <img src={assetUrl(album.albumHero!.background.desktop)} alt="" />
        </picture>
        <div className={`han-persistent-stage__canvas${detailRoute ? '' : ' is-home'}`}>
          <Suspense fallback={null}>
            <Experience3D {...(detailRoute && detailProps ? detailProps : fallbackProps)} />
          </Suspense>
        </div>
      </div>}
      {children}
    </StageContext.Provider>
  );
}
