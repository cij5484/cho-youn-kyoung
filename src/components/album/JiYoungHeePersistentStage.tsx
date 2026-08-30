/* eslint-disable react-refresh/only-export-components */
import { createContext, lazy, Suspense, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { albums } from '../../data/albums';
import { assetUrl } from '../../utils/assetUrl';
import type { ExperienceProps } from './detail/AlbumDetailExperience3D';

const Experience3D = lazy(() => import('./detail/AlbumDetailExperience3D'));
const ALBUM_ID = 'ji-young-hee-ryu-haegeum-sanjo-2026';

type StageContextValue = {
  setDetailProps(props: ExperienceProps | null): void;
  setDetailStageVisible(visible: boolean): void;
  setHomeActive(active: boolean): void;
  prepareDetail(): Promise<void>;
};

const StageContext = createContext<StageContextValue | null>(null);

export function useJiYoungHeeStage() {
  const value = useContext(StageContext);
  if (!value) throw new Error('useJiYoungHeeStage must be used inside JiYoungHeePersistentStage');
  return value;
}

export function JiYoungHeePersistentStage({ children }: { children: ReactNode }) {
  const location = useLocation();
  const album = albums.find((item) => item.id === ALBUM_ID)!;
  const detailRoute = location.pathname === `/album/${ALBUM_ID}`;
  const [homeActive, setHomeActive] = useState(false);
  const [detailProps, setDetailProps] = useState<ExperienceProps | null>(null);
  const [detailStageVisible, setDetailStageVisible] = useState(true);
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
    preloadInterior: prewarming,
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
  // Keep the last desktop detail paint until HOME's persistent hero effect
  // takes ownership; mobile retains its existing route visibility behavior.
  const desktopDetailHandoff = !mobile && location.pathname === '/' && detailProps !== null;
  const visible = detailRoute || (location.pathname === '/' && (homeActive || desktopDetailHandoff));
  const renderStage = visible || prewarming;
  const context = useMemo(() => ({ setDetailProps, setDetailStageVisible, setHomeActive: updateHomeActive, prepareDetail }), [prepareDetail, updateHomeActive]);

  return (
    <StageContext.Provider value={context}>
      <div ref={stage} className={`ji-persistent-stage${visible ? ' is-visible' : ''}`} aria-hidden={!visible}>
        {renderStage ? <>
          <picture className="ji-persistent-stage__background">
            <source media="(max-width:700px)" srcSet={assetUrl(album.albumHero!.background.mobile)} />
            <img src={assetUrl(album.albumHero!.background.desktop)} alt="" />
          </picture>
          <div className={`ji-persistent-stage__canvas${detailRoute && !detailStageVisible ? ' is-editorial-hidden' : ''}`}>
            <Suspense fallback={null}>
              <Experience3D {...(detailRoute && detailProps ? { ...detailProps, preloadInterior: true } : fallbackProps)} />
            </Suspense>
          </div>
        </> : null}
      </div>
      {children}
    </StageContext.Provider>
  );
}
