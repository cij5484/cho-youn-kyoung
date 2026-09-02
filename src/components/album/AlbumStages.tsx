/* eslint-disable react-refresh/only-export-components */
import { Component, createContext, lazy, Suspense, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { albums } from '../../data/albums';
import type { Album } from '../../data/albums';
import { assetUrl } from '../../utils/assetUrl';
import '../../styles/album-stage.css';
import type { AlbumAssetFailure, ExperienceProps } from './detail/AlbumDetailExperience3D';

const Experience3D = lazy(() => import('./detail/AlbumDetailExperience3D'));
// Keep the outgoing WebGL scene past the CSS fade so a delayed frame cannot
// expose an empty stage at the end of the route handoff.
const STAGE_EXIT_MS = 700;

type StageFailure = AlbumAssetFailure | 'background' | 'scene';

const failureMessage: Record<StageFailure, string> = {
  background: '앨범 배경 이미지를 불러오지 못했습니다.',
  cover: '앨범 표지 이미지를 불러오지 못했습니다.',
  interior: '앨범 내부 이미지를 불러오지 못했습니다.',
  booklet: '북클릿 페이지를 불러오지 못했습니다.',
  scene: '3D 앨범 화면을 시작하지 못했습니다.',
};

class AlbumStageErrorBoundary extends Component<{
  children: ReactNode;
  onError(): void;
}, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

type StageContextValue = {
  setDetailProps(props: ExperienceProps | null): void;
  setDetailStageVisible(visible: boolean): void;
  setHomeActive(active: boolean): void;
  prepareDetail(): Promise<void>;
};

const StageContext = createContext<Record<string, StageContextValue>>({});

export function useAlbumStage(albumId: string) {
  const value = useOptionalAlbumStage(albumId);
  if (!value) throw new Error('Album stage is not registered: ' + albumId);
  return value;
}

export function useOptionalAlbumStage(albumId: string) {
  return useContext(StageContext)[albumId];
}

export function AlbumStages({ children }: { children: ReactNode }) {
  return albums.filter((album) => album.detailExperience).reduceRight<ReactNode>(
    (content, album) => <AlbumStage key={album.id} album={album}>{content}</AlbumStage>, children);
}

function AlbumStage({ album, children }: { album: Album; children: ReactNode }) {
  const parentStages = useContext(StageContext);
  const ALBUM_ID = album.id;
  const location = useLocation();
  const detailRoute = location.pathname === `/album/${ALBUM_ID}`;
  const [homeActive, setHomeActive] = useState(false);
  const [detailProps, setDetailProps] = useState<ExperienceProps | null>(null);
  const [detailStageVisible, setDetailStageVisible] = useState(true);
  const [prewarming, setPrewarming] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [homeActivationKey, setHomeActivationKey] = useState(0);
  const [failure, setFailure] = useState<StageFailure | null>(null);
  const [attempt, setAttempt] = useState(0);
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

  const handleAssetFailure = useCallback((kind: AlbumAssetFailure) => {
    setFailure((current) => current ?? kind);
  }, []);
  const handleSceneFailure = useCallback(() => {
    setFailure((current) => current ?? 'scene');
  }, []);
  const retryStage = useCallback(() => {
    // React.lazy retains a rejected module promise. A document reload is the
    // only reliable retry for a failed 3D chunk; texture failures can remount
    // just this album stage without resetting the rest of the application.
    if (failure === 'scene') {
      window.location.reload();
      return;
    }
    setFailure(null);
    setAttempt((value) => value + 1);
    prewarmReady.current = false;
    prewarmPromise.current = null;
    resolvePrewarm.current?.();
    resolvePrewarm.current = null;
  }, [failure]);

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
  }, [ALBUM_ID, location.pathname]);

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

  const fallbackProps = useMemo<ExperienceProps>(() => ({
    album,
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
  }), [album, handlePrewarmReady, homeActivationKey, mobile, prewarming, reduced]);
  const prepareDetail = useCallback(() => {
    if (mobile || prewarmReady.current) return Promise.resolve();
    if (prewarmPromise.current) return prewarmPromise.current;
    setPrewarming(true);
    prewarmPromise.current = new Promise<void>((resolve) => {
      // Slow/failed warmup must never trap navigation behind a disabled link.
      const timeout = window.setTimeout(() => {
        resolvePrewarm.current = null;
        prewarmPromise.current = null;
        setPrewarming(false);
        resolve();
      }, 8000);
      resolvePrewarm.current = () => { window.clearTimeout(timeout); resolve(); };
    });
    return prewarmPromise.current;
  }, [mobile]);
  useEffect(() => {
    if (detailRoute && prewarmReady.current) queueMicrotask(() => setPrewarming(false));
    if (!detailRoute && location.pathname !== '/') {
      queueMicrotask(() => setPrewarming(false));
      prewarmReady.current = false;
      prewarmPromise.current = null;
      resolvePrewarm.current?.();
      resolvePrewarm.current = null;
    }
  }, [detailRoute, location.pathname]);
  useEffect(() => () => { resolvePrewarm.current?.(); }, []);
  // Keep the last desktop detail paint until HOME's persistent hero effect
  // takes ownership; mobile retains its existing route visibility behavior.
  const desktopDetailHandoff = !mobile && location.pathname === '/' && detailProps !== null;
  const visible = detailRoute || (location.pathname === '/' && (homeActive || desktopDetailHandoff));
  const stageActive = visible || prewarming;
  const [stageRetained, setStageRetained] = useState(stageActive);
  useEffect(() => {
    if (stageActive) {
      const frame = window.requestAnimationFrame(() => setStageRetained(true));
      return () => window.cancelAnimationFrame(frame);
    }
    const timeout = window.setTimeout(() => setStageRetained(false), STAGE_EXIT_MS);
    return () => window.clearTimeout(timeout);
  }, [stageActive]);
  const renderStage = stageActive || stageRetained;
  const renderEnabled = prewarming || (visible && (!detailRoute || detailStageVisible));
  const context = useMemo(() => ({ ...parentStages, [album.id]: { setDetailProps, setDetailStageVisible, setHomeActive: updateHomeActive, prepareDetail } }), [album.id, parentStages, prepareDetail, updateHomeActive]);

  return (
    <StageContext.Provider value={context}>
      <div className={`album-persistent-stage${visible ? ' is-visible' : ''}`} aria-hidden={!visible}>
        {renderStage ? <>
          <picture className="album-persistent-stage__background" key={`background-${attempt}`}>
            <source media="(max-width:700px)" srcSet={assetUrl(album.albumHero!.background.mobile)} />
            <img src={assetUrl(album.albumHero!.background.desktop)} alt="" onError={() => setFailure((current) => current ?? 'background')} />
          </picture>
          <div className={`album-persistent-stage__canvas${detailRoute && !detailStageVisible ? ' is-editorial-hidden' : ''}`}>
            <AlbumStageErrorBoundary key={`scene-${attempt}`} onError={handleSceneFailure}>
              <Suspense fallback={null}>
                <Experience3D {...(detailRoute && detailProps ? { ...detailProps, preloadInterior: true } : fallbackProps)} onAssetError={handleAssetFailure} renderEnabled={renderEnabled} />
              </Suspense>
            </AlbumStageErrorBoundary>
          </div>
          {failure && (
            <div className="album-persistent-stage__error" role="alert">
              <div>
                <p>{failureMessage[failure]}</p>
                <span>네트워크 상태를 확인한 뒤 다시 시도해 주세요.</span>
                <div className="album-persistent-stage__error-actions">
                  <button type="button" onClick={retryStage}>다시 불러오기</button>
                  <Link to="/works">WORKS로 돌아가기</Link>
                </div>
              </div>
            </div>
          )}
        </> : null}
      </div>
      {children}
    </StageContext.Provider>
  );
}
