/* eslint-disable react-refresh/only-export-components */
import { createContext, lazy, Suspense, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { albums } from '../../data/albums';
import { assetUrl } from '../../utils/assetUrl';
import type { ExperienceProps } from './detail/AlbumDetailExperience3D';

const Experience3D = lazy(() => import('./detail/AlbumDetailExperience3D'));
const ALBUM_ID = 'ji-young-hee-ryu-haegeum-sanjo-2026';

type StageContextValue = {
  setDetailProps(props: ExperienceProps | null): void;
  setHomeActive(active: boolean): void;
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
  const [mobile, setMobile] = useState(false);
  const [backgroundSize, setBackgroundSize] = useState({ width: 0, height: 0 });
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const query = matchMedia('(max-width: 700px)');
    const update = () => setMobile(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
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
    reduced: false,
    onOpen: () => undefined,
    onBooklet: () => undefined,
    onPlayer: () => undefined,
    onPrevious: () => undefined,
    onNext: () => undefined,
  }), [album, backgroundSize, mobile]);
  const visible = detailRoute || (location.pathname === '/' && homeActive);
  const context = useMemo(() => ({ setDetailProps, setHomeActive }), []);

  return (
    <StageContext.Provider value={context}>
      <div ref={stage} className={`ji-persistent-stage${visible ? ' is-visible' : ''}`} aria-hidden={!visible}>
        <picture className="ji-persistent-stage__background">
          <source media="(max-width:700px)" srcSet={assetUrl(album.albumHero!.background.mobile)} />
          <img src={assetUrl(album.albumHero!.background.desktop)} alt="" />
        </picture>
        <div className="ji-persistent-stage__canvas">
          <Suspense fallback={null}>
            <Experience3D {...(detailRoute && detailProps ? detailProps : fallbackProps)} />
          </Suspense>
        </div>
      </div>
      {children}
    </StageContext.Provider>
  );
}
