import { useEffect, useState, type ReactNode } from 'react';
import { albums } from '../data/albums';
import {
  getDefaultHomeHeroIndex,
  getRecentWorks,
  homeHeroSlides,
} from '../data/homeHeroSlides';
import { assetUrl } from '../utils/assetUrl';
import { preloadAlbumEntry } from './album/detail/preloadAlbumDetail';
import '../styles/initial-load-screen.css';

const MINIMUM_VISIBLE_MS = 1000;
const MAXIMUM_WAIT_MS = 3000;
const EXIT_MS = 480;

function decodeImage(src: string | undefined) {
  if (!src) return Promise.resolve();
  const image = new Image();
  image.src = assetUrl(src) ?? src;
  return image.decode().catch(() => undefined);
}

function initialPathname() {
  const route = window.location.hash.replace(/^#/, '').split('?')[0];
  return route || '/';
}

function prepareInitialView() {
  const pathname = initialPathname();
  const albumId = pathname.match(/^\/album\/([^/]+)$/)?.[1];
  if (albumId) {
    const album = albums.find((item) => item.id === albumId);
    return album ? preloadAlbumEntry(album) : Promise.resolve();
  }

  if (pathname !== '/') return Promise.resolve();
  const works = getRecentWorks(homeHeroSlides);
  const initial = works[getDefaultHomeHeroIndex(works)];
  const image = matchMedia('(max-width: 700px)').matches
    ? initial?.heroImageMobile ?? initial?.albumBackground?.mobile ?? initial?.heroImage
    : initial?.heroImage ?? initial?.albumBackground?.desktop;
  return decodeImage(image);
}

export function InitialLoadScreen({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    let active = true;
    let maximumTimer = 0;
    let minimumTimer = 0;
    let exitTimer = 0;
    const started = performance.now();
    document.documentElement.dataset.initialLoading = 'true';

    const fonts = document.fonts?.ready?.catch(() => undefined) ?? Promise.resolve();
    const maximumWait = new Promise<void>((resolve) => {
      maximumTimer = window.setTimeout(resolve, MAXIMUM_WAIT_MS);
    });

    Promise.race([
      Promise.all([fonts, prepareInitialView()]),
      maximumWait,
    ]).then(() => {
      window.clearTimeout(maximumTimer);
      const remaining = Math.max(0, MINIMUM_VISIBLE_MS - (performance.now() - started));
      minimumTimer = window.setTimeout(() => {
        if (!active) return;
        setReady(true);
        delete document.documentElement.dataset.initialLoading;
        exitTimer = window.setTimeout(() => active && setRemoved(true), EXIT_MS);
      }, remaining);
    });

    return () => {
      active = false;
      window.clearTimeout(maximumTimer);
      window.clearTimeout(minimumTimer);
      window.clearTimeout(exitTimer);
      delete document.documentElement.dataset.initialLoading;
    };
  }, []);

  return <>
    {children}
    {!removed && (
      <div className={`initial-load-screen${ready ? ' is-ready' : ''}`} role="status" aria-live="polite">
        <div className="initial-load-screen__mark">
          <strong>CHO YOUN KYOUNG</strong>
          <span aria-hidden="true" />
          <small>LOADING</small>
        </div>
      </div>
    )}
  </>;
}
