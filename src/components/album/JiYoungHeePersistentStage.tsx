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

  const updateHomeActive = useCallback((active: boolean) => {
    if (active && !homeActiveRef.current) setHomeActivationKey((key) => key + 1);
    homeActiveRef.current = active;
    setHomeActive(active);
  }, []);

  useEffect(() => {
    const preloadImage = (src: string | undefined) => {
      if (!src) return;
      const image = new Image();
      image.src = assetUrl(src) ?? src;
    };
    const detail = album.detailExperience!;
    const coreImages = [
      album.albumHero!.textures.front, album.albumHero!.textures.back,
      album.albumHero!.textures.spineLeft, detail.interior.bookletPanel,
      detail.interior.trayPanel, album.cdLabelImage, album.booklet!.previewImages[0].src,
    ];
    // Begin after the initial paint. Dynamic imports share Vite's module cache
    // with both lazy boundaries; Image preloads share the browser HTTP cache
    // with TextureLoader without allocating a second WebGL texture.
    const timer = window.setTimeout(() => {
      void import('./detail/JiYoungHeeAlbumDetail');
      void import('./detail/AlbumDetailExperience3D');
      coreImages.forEach(preloadImage);
      const preloadRemaining = () => album.booklet!.previewImages.slice(1).forEach(({ src }) => preloadImage(src));
      const requestIdle = (window as Window & { requestIdleCallback?: (callback: () => void, options: { timeout: number }) => number }).requestIdleCallback;
      if (requestIdle) requestIdle(preloadRemaining, { timeout: 2500 });
      else globalThis.setTimeout(preloadRemaining, 800);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [album]);

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
    onOpen: () => undefined,
    onBooklet: () => undefined,
    onPlayer: () => undefined,
    onPrevious: () => undefined,
    onNext: () => undefined,
  }), [album, backgroundSize, homeActivationKey, mobile, reduced]);
  const prepareDetail = useCallback(async () => {
    if (mobile) return;
    setPrewarming(true);
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  }, [mobile]);
  // Keep the last desktop detail paint until HOME's persistent hero effect
  // takes ownership; mobile retains its existing route visibility behavior.
  const desktopDetailHandoff = !mobile && location.pathname === '/' && detailProps !== null;
  const visible = detailRoute || (location.pathname === '/' && (homeActive || desktopDetailHandoff));
  const context = useMemo(() => ({ setDetailProps, setDetailStageVisible, setHomeActive: updateHomeActive, prepareDetail }), [prepareDetail, updateHomeActive]);

  return (
    <StageContext.Provider value={context}>
      <div ref={stage} className={`ji-persistent-stage${visible ? ' is-visible' : ''}`} aria-hidden={!visible}>
        <picture className="ji-persistent-stage__background">
          <source media="(max-width:700px)" srcSet={assetUrl(album.albumHero!.background.mobile)} />
          <img src={assetUrl(album.albumHero!.background.desktop)} alt="" />
        </picture>
        <div className={`ji-persistent-stage__canvas${detailRoute && !detailStageVisible ? ' is-editorial-hidden' : ''}`}>
          <Suspense fallback={null}>
            <Experience3D {...(detailRoute && detailProps ? detailProps : fallbackProps)} key={prewarming ? 'detail-prewarm' : 'default'} />
          </Suspense>
        </div>
      </div>
      {children}
    </StageContext.Provider>
  );
}
