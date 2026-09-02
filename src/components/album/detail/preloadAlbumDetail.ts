import type { Album } from '../../../data/albums';
import { assetUrl } from '../../../utils/assetUrl';

const entryReady = new Map<string, Promise<void>>();
const detailReady = new Map<string, Promise<void>>();
const moduleReady = new Map<string, Promise<unknown>>();

function decodeImage(src: string | undefined) {
  if (!src) return Promise.resolve();
  const image = new Image();
  image.src = assetUrl(src) ?? src;
  return image.decode().catch(() => undefined);
}

function viewportKey(album: Album) {
  return `${album.id}:${matchMedia('(max-width: 700px)').matches ? 'mobile' : 'desktop'}`;
}

function detailModule(album: Album) {
  const cached = moduleReady.get(album.id);
  if (cached) return cached;

  const module = album.detailExperience?.theme === 'han-beom-su-paper'
    ? Promise.all([import('./HanBeomSuAlbumDetail'), import('./AlbumDetailExperience3D')])
    : Promise.all([import('./JiYoungHeeAlbumDetail'), import('./AlbumDetailExperience3D')]);
  moduleReady.set(album.id, module);
  return module;
}

/** Prepares only the assets required to paint and rotate the first album view. */
export function preloadAlbumEntry(album: Album) {
  const key = viewportKey(album);
  const cached = entryReady.get(key);
  if (cached) return cached;

  const mobile = matchMedia('(max-width: 700px)').matches;
  const images = Array.from(new Set([
    mobile ? album.albumHero?.background.mobile : album.albumHero?.background.desktop,
    album.albumHero?.textures.front,
    album.albumHero?.textures.back,
    album.albumHero?.textures.spineLeft,
    album.albumHero?.textures.spineRight,
  ]));
  const promise = Promise.all([detailModule(album), ...images.map(decodeImage)])
    .then(() => undefined)
    .catch((error: unknown) => {
      entryReady.delete(key);
      throw error;
    });
  entryReady.set(key, promise);
  return promise;
}

/** Warms the remaining interactive assets after the first album view is ready. */
export function preloadAlbumDetail(album: Album) {
  const key = viewportKey(album);
  const cached = detailReady.get(key);
  if (cached) return cached;

  const images = Array.from(new Set([
    album.cdLabelImage,
    album.booklet?.previewImages[0]?.src,
    album.booklet?.previewImages[1]?.src,
    album.booklet?.previewImages[2]?.src,
    album.detailExperience?.interior.bookletPanel,
    album.detailExperience?.interior.trayPanel,
  ]));
  const promise = Promise.all([preloadAlbumEntry(album), ...images.map(decodeImage)])
    .then(() => undefined)
    .catch((error: unknown) => {
      detailReady.delete(key);
      throw error;
    });
  detailReady.set(key, promise);
  return promise;
}

/** Starts non-critical album preparation once the browser has painted urgent work. */
export function scheduleAlbumDetailPreload(album: Album, timeout = 1800) {
  let cancelled = false;
  const warm = () => {
    if (!cancelled) void preloadAlbumDetail(album).catch(() => undefined);
  };
  const idle = window.requestIdleCallback?.(warm, { timeout }) ?? window.setTimeout(warm, 300);
  return () => {
    cancelled = true;
    if (window.cancelIdleCallback) window.cancelIdleCallback(idle);
    else window.clearTimeout(idle);
  };
}
