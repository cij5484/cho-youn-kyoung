import type { Album } from '../../../data/albums';
import { assetUrl } from '../../../utils/assetUrl';

const ready = new Map<string, Promise<void>>();

function decodeImage(src: string | undefined) {
  if (!src) return Promise.resolve();
  const image = new Image();
  image.src = assetUrl(src) ?? src;
  return image.decode().catch(() => undefined);
}

/** Warms both the network cache and the lazy module cache before navigation. */
export function preloadAlbumDetail(album: Album) {
  const cached = ready.get(album.id);
  if (cached) return cached;

  const module = album.id === 'han-beom-su-haegeum-sanjo-2020'
    ? Promise.all([import('./HanBeomSuAlbumDetail'), import('./HanBeomSuAlbumDetailExperience3D')])
    : Promise.all([import('./JiYoungHeeAlbumDetail'), import('./AlbumDetailExperience3D')]);
  const images = [
    album.albumHero?.background.desktop,
    album.albumHero?.textures.front,
    album.albumHero?.textures.back,
    album.albumHero?.textures.spineLeft,
    album.albumHero?.textures.spineRight,
    album.cdLabelImage,
    album.booklet?.previewImages[0]?.src,
    album.detailExperience?.interior.bookletPanel,
    album.detailExperience?.interior.trayPanel,
  ];
  const promise = Promise.all([module, ...images.map(decodeImage)]).then(() => undefined);
  ready.set(album.id, promise);
  return promise;
}
