import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { RefObject } from 'react';
import * as THREE from 'three';
import type { Album } from '../../../data/albums';
import { assetUrl } from '../../../utils/assetUrl';
import { PrintedPaperMaterial } from '../PackageMaterials';
import {
  bendBookletLeaf, bookletLeaves, bookletReadingPose, bookletTextureWindow,
  createBookletLeafGeometry, poseBookletLeaf,
} from './bookletSheets';

function useSheetTextures(album: Album, enabled: boolean, source: number, target: number, onError?: () => void) {
  const { gl, invalidate } = useThree();
  const urls = useMemo(() => album.booklet!.previewImages.map(({ src }) => assetUrl(src)!), [album]);
  const wantedKey = enabled ? bookletTextureWindow(urls.length, source, target).filter((index) => index > 0).join(',') : '';
  const cache = useRef(new Map<number, THREE.Texture>());
  const [textures, setTextures] = useState(new Map<number, THREE.Texture>());
  const failed = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const wanted = wantedKey ? wantedKey.split(',').map(Number) : [];
    const retained = new Set(wanted);
    cache.current.forEach((texture, index) => {
      if (!retained.has(index)) { texture.dispose(); cache.current.delete(index); }
    });
    setTextures(new Map(cache.current));
    const loader = new THREE.TextureLoader();
    for (const index of wanted) {
      if (cache.current.has(index)) continue;
      void loader.loadAsync(urls[index]).then((texture) => {
        if (cancelled) { texture.dispose(); return; }
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = Math.min(4, gl.capabilities.getMaxAnisotropy());
        texture.magFilter = THREE.LinearFilter;
        texture.minFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;
        texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.offset.set(0.003, 0.003);
        texture.repeat.set(0.994, 0.994);
        cache.current.set(index, texture);
        setTextures(new Map(cache.current));
        invalidate();
      }).catch(() => {
        if (!cancelled && !failed.current) { failed.current = true; onError?.(); }
      });
    }
    return () => { cancelled = true; };
  }, [gl, invalidate, onError, urls, wantedKey]);

  useEffect(() => {
    const owned = cache.current;
    return () => { owned.forEach((texture) => texture.dispose()); owned.clear(); };
  }, []);

  const ready = enabled && wantedKey.split(',').filter(Boolean).every((index) => textures.has(Number(index)));
  return { textures, ready };
}

type Props = {
  album: Album;
  cover: THREE.Texture;
  width: number;
  height: number;
  page: number;
  mobile: boolean;
  enabled: boolean;
  reading: boolean;
  reduced: boolean;
  openProgress: RefObject<number>;
  onReady(ready: boolean): void;
  onSettled(settled: boolean): void;
  onPageTurnComplete(): void;
  onPrevious(): void;
  onNext(): void;
  onError?(): void;
};

export function PhysicalBooklet({ album, cover, width, height, page, mobile, enabled, reading, reduced,
  openProgress, onReady, onSettled, onPageTurnComplete, onPrevious, onNext, onError }: Props) {
  const leaves = useMemo(() => bookletLeaves(album.booklet!.previewImages.length), [album]);
  const meshes = useRef<Array<THREE.Mesh | null>>([]);
  const lastOpenness = useRef<number[]>([]);
  const [settledPage, setSettledPage] = useState(page);
  const [turn, setTurn] = useState<{ from: number; to: number; page: number } | null>(null);
  const elapsed = useRef(0);
  const finished = useRef(false);
  const source = bookletReadingPose(settledPage, mobile).turnedLeaves;
  const target = bookletReadingPose(page, mobile).turnedLeaves;
  const { textures, ready } = useSheetTextures(album, enabled, source, target, onError);
  const geometries = useMemo(() => leaves.map(() => createBookletLeafGeometry(width, height)), [height, leaves, width]);
  const blank = useMemo(() => {
    const texture = new THREE.DataTexture(new Uint8Array([238, 233, 223, 255]), 1, 1);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }, []);
  useEffect(() => () => geometries.forEach((geometry) => geometry.dispose()), [geometries]);
  useEffect(() => () => blank.dispose(), [blank]);
  useEffect(() => { onReady(ready); }, [onReady, ready]);
  useFrame((_, delta) => {
    if (!enabled) {
      if (settledPage !== 0) setSettledPage(0);
      if (turn) setTurn(null);
    } else if (reading && ready && !turn && settledPage !== page) {
      elapsed.current = 0;
      finished.current = false;
      setTurn({ from: source, to: target, page });
    }
    if (turn) elapsed.current = reduced ? 0.72 : Math.min(0.72, elapsed.current + Math.min(delta, 1));
    const progress = turn ? elapsed.current / 0.72 : 1;
    const eased = progress * progress * (3 - 2 * progress);
    leaves.forEach((_, index) => {
      const mesh = meshes.current[index];
      if (!mesh) return;
      const from = index < (turn?.from ?? source) ? 1 : 0;
      const to = index < (turn?.to ?? source) ? 1 : 0;
      const openness = (from + (to - from) * eased) * openProgress.current;
      poseBookletLeaf(mesh, index, leaves.length, openness);
      if (lastOpenness.current[index] !== openness) {
        bendBookletLeaf(geometries[index], width, openness);
        lastOpenness.current[index] = openness;
      }
    });
    onSettled(!turn && (!reading || (ready && settledPage === page)));
    if (turn && progress === 1 && !finished.current) {
      finished.current = true;
      setSettledPage(turn.page);
      setTurn(null);
      onPageTurnComplete();
    }
  });

  const grade = album.id === 'han-beom-su-haegeum-sanjo-2020'
    ? { contrast: 1.08, gamma: 1.025 } : {};
  return <group>
    {leaves.map((leaf, index) => <mesh
      key={leaf.front}
      ref={(mesh) => { meshes.current[index] = mesh; }}
      geometry={geometries[index]}
      castShadow
      receiveShadow
      frustumCulled={false}
      onClick={reading && !turn ? (event) => {
        event.stopPropagation();
        if (index < source) onPrevious(); else onNext();
      } : undefined}
    >
      <PrintedPaperMaterial attach="material-0" texture={leaf.front === 0 ? cover : textures.get(leaf.front) ?? blank} {...grade} />
      <PrintedPaperMaterial attach="material-1" texture={leaf.back === null ? blank : textures.get(leaf.back) ?? blank} {...grade} />
    </mesh>)}
  </group>;
}
