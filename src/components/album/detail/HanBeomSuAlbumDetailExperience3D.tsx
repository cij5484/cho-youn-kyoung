import { Canvas, createPortal, useFrame, useLoader, useThree } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { RefObject } from 'react';
import * as THREE from 'three';
import type { Album } from '../../../data/albums';
import { assetUrl } from '../../../utils/assetUrl';
import { COVER_DEPTH, getPackageDimensions, PACKAGE_PANEL } from '../packageGeometry';
import { HanOuterPlasticMaterial, PrintedPaperMaterial, TrayClearPlasticMaterial } from '../HanBeomSuPackageModel';

export type ExperienceMode = 'CLOSED' | 'ALBUM_OPEN' | 'BOOKLET_FOCUS' | 'PLAYER_FOCUS';
export type BookletVisualPhase = 'RESTING' | 'ENTERING' | 'READING' | 'TURNING_FORWARD' | 'TURNING_BACKWARD' | 'RETURNING_MOVE' | 'RETURNING_FINISH';
export type BookletBounds = { left: number; top: number; width: number; height: number };

export type ExperienceProps = {
  album: Album;
  backgroundSize: { width: number; height: number };
  openingFromClosed: boolean;
  mode: ExperienceMode;
  page: number;
  bookletPhase: BookletVisualPhase;
  mobile: boolean;
  playing: boolean;
  reduced: boolean;
  homeActivationKey: number;
  detailActive: boolean;
  prewarming?: boolean;
  onOpen(): void;
  onBooklet(): void;
  onPlayer(): void;
  onPrevious(): void;
  onNext(): void;
  onBookletBounds?(bounds: BookletBounds): void;
  onBookletPhaseChange?(phase: BookletVisualPhase): void;
  onPageTurnStart?(direction: 'forward' | 'backward'): void;
  onPrewarmReady?(): void;
  onTransitionChange?(transitioning: boolean): void;
  onPageTurnComplete?(): void;
};

type OuterTextures = {
  front: THREE.Texture;
  back: THREE.Texture;
  spine: THREE.Texture;
};
type InteriorTextures = {
  interiorBooklet: THREE.Texture;
  interiorTray: THREE.Texture;
  cdLabel: THREE.Texture;
  p1: THREE.Texture;
};

const PANEL = PACKAGE_PANEL;
const HAN_ROTATION_KEY = 'han-beom-su-package-rotation';
const SURFACE_OFFSET = 0.001;
const SPINE_SURFACE_OFFSET = 0.0015;
const TRAY_THICKNESS = 0.018;
// Negative Y brings the cover toward the viewer before it settles to the left.
const OPEN_ANGLE = THREE.MathUtils.degToRad(-160);
// Repository exports establish the trim ratios: booklet pages sit just inside
// the cover, while a pressed CD occupies 90% of the panel height.
const PAGE_HEIGHT = PANEL * 0.92;
const CD_RADIUS = PANEL * 0.45;
const JI_PLAYER_TARGET_RADIUS = PACKAGE_PANEL * 0.45 * 1.72;
const PAGE_TURN_DURATION = 0.86;
const BOOKLET_EDGE_INSET = 0.003;
const DETAIL_BACKGROUND = {
  desktop: { sourceWidth: 3840, sourceHeight: 2160, x: 0.43 },
  mobile: { sourceWidth: 1440, sourceHeight: 2560, x: 0.5 },
} as const;
type OpeningPhase = 'IDLE' | 'ALIGN_CLOSED' | 'POSITION_FOR_OPEN' | 'HINGE_OPEN';
type PackageDimensions = ReturnType<typeof getPackageDimensions>;

function getPackageLayout(dimensions: PackageDimensions) {
  const halfDepth = dimensions.printedSpineDepth / 2;
  const frontCenterZ = halfDepth - COVER_DEPTH / 2;
  const backCenterZ = -frontCenterZ;
  const backInnerZ = backCenterZ + COVER_DEPTH / 2 + SURFACE_OFFSET;
  const trayPlateZ = backInnerZ + TRAY_THICKNESS / 2 + SURFACE_OFFSET;
  const recessZ = trayPlateZ + TRAY_THICKNESS / 2 + SURFACE_OFFSET;
  return { frontCenterZ, backInnerZ, trayPlateZ, recessZ, hubZ: recessZ + 0.009, cdMountZ: recessZ + 0.046 };
}

function readHanRotation(fallback: { x: number; y: number }) {
  try {
    const stored = JSON.parse(sessionStorage.getItem(HAN_ROTATION_KEY) ?? '') as { x?: number; y?: number };
    return typeof stored.x === 'number' && typeof stored.y === 'number' ? { x: stored.x, y: stored.y } : fallback;
  } catch { return fallback; }
}

function configureTextures(textures: THREE.Texture[], maxAnisotropy: number) {
  textures.forEach((texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(8, maxAnisotropy);
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.generateMipmaps = true;
    texture.needsUpdate = true;
  });
}

function configureBookletTextures(textures: THREE.Texture[], maxAnisotropy: number) {
  textures.forEach((texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(8, maxAnisotropy);
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.generateMipmaps = true;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.offset.set(BOOKLET_EDGE_INSET, BOOKLET_EDGE_INSET);
    texture.repeat.set(1 - BOOKLET_EDGE_INSET * 2, 1 - BOOKLET_EDGE_INSET * 2);
    texture.needsUpdate = true;
  });
}

function textureAspect(texture: THREE.Texture) {
  const image = texture.image as { width?: number; height?: number } | undefined;
  return image?.width && image?.height ? image.width / image.height : 1;
}

function PrewarmReady({ onReady }: { onReady?: () => void }) {
  const { gl, scene, camera } = useThree();
  const frames = useRef(0);
  const reported = useRef(false);
  useEffect(() => {
    frames.current = 0;
    reported.current = false;
  }, [onReady]);
  useFrame(() => {
    if (!onReady || reported.current || ++frames.current < 2) return;
    gl.compile(scene, camera);
    reported.current = true;
    onReady();
  });
  return null;
}

function useOuterTextures(album: Album): OuterTextures {
  const { gl } = useThree();
  const hero = album.albumHero!;
  const urls = [
    hero.textures.front!, hero.textures.back!, hero.textures.spineLeft!,
  ].map((url) => assetUrl(url)!);
  const loaded = useLoader(THREE.TextureLoader, urls) as THREE.Texture[];
  useMemo(() => configureTextures(loaded, gl.capabilities.getMaxAnisotropy()), [gl, loaded]);
  return {
    front: loaded[0], back: loaded[1], spine: loaded[2],
  };
}

function useInteriorTextures(album: Album): InteriorTextures {
  const { gl } = useThree();
  const detail = album.detailExperience!;
  const urls = [detail.interior.bookletPanel, detail.interior.trayPanel, album.cdLabelImage!, album.booklet!.previewImages[0].src].map((url) => assetUrl(url)!);
  const loaded = useLoader(THREE.TextureLoader, urls) as THREE.Texture[];
  useMemo(() => configureTextures(loaded, gl.capabilities.getMaxAnisotropy()), [gl, loaded]);
  return { interiorBooklet: loaded[0], interiorTray: loaded[1], cdLabel: loaded[2], p1: loaded[3] };
}

function PaperMaterial({ texture }: { texture: THREE.Texture }) {
  return <PrintedPaperMaterial texture={texture} />;
}

function CdDisc({ label, mode, playing, reduced, tray, cdMountZ, onPlayer, onSettled }: {
  label: THREE.Texture; mode: ExperienceMode; playing: boolean; reduced: boolean; onPlayer(): void; onSettled(settled: boolean): void;
  tray: RefObject<THREE.Group | null>;
  cdMountZ: number;
}) {
  const rig = useRef<THREE.Group>(null);
  const tilt = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const { scene, size, viewport } = useThree();
  const velocity = useRef(0);
  const tiltTarget = useRef({ x: 0, y: 0 });
  const tiltDrag = useRef<{ id: number; x: number; y: number } | null>(null);
  const detached = useRef(false);
  const CD_THICKNESS = CD_RADIUS * 0.012;
  const mountPosition = useMemo(() => new THREE.Vector3(0, 0, cdMountZ), [cdMountZ]);
  useFrame((_, delta) => {
    if (!rig.current) return;
    const ease = reduced ? 1 : 1 - Math.exp(-7 * delta);
    const player = mode === 'PLAYER_FOCUS';
    if (player && !detached.current) {
      scene.attach(rig.current);
      detached.current = true;
    }
    const playerPosition = new THREE.Vector3(size.width <= 700 ? 0 : -1.55, size.width <= 700 ? viewport.height * 0.16 : 0.08, 0.34);
    const trayWorld = tray.current
      ? tray.current.localToWorld(mountPosition.clone())
      : rig.current.position.clone();
    const targetPosition = player ? playerPosition : (detached.current ? trayWorld : mountPosition);
    rig.current.position.lerp(targetPosition, ease);
    const trayQuaternion = tray.current?.getWorldQuaternion(new THREE.Quaternion()) ?? new THREE.Quaternion();
    const targetQuaternion = player || !detached.current ? new THREE.Quaternion() : trayQuaternion;
    rig.current.quaternion.slerp(targetQuaternion, ease);
    const playerScale = size.width <= 700 ? viewport.width * 0.7 / (CD_RADIUS * 2) : JI_PLAYER_TARGET_RADIUS / CD_RADIUS;
    const trayScale = tray.current?.getWorldScale(new THREE.Vector3()).x ?? 1;
    const targetScale = player ? playerScale : (detached.current ? trayScale : 1);
    const scale = THREE.MathUtils.lerp(rig.current.scale.x, targetScale, ease);
    rig.current.scale.setScalar(scale);
    velocity.current = THREE.MathUtils.lerp(velocity.current, playing && !reduced ? Math.PI / 9 : 0, 1 - Math.exp(-3 * delta));
    if (spin.current) spin.current.rotation.z -= velocity.current * delta;
    if (tilt.current) {
      if (mode !== 'PLAYER_FOCUS') tiltTarget.current = { x: 0, y: 0 };
      const tiltEase = reduced ? 1 : 1 - Math.exp(-10 * delta);
      tilt.current.rotation.x = THREE.MathUtils.lerp(tilt.current.rotation.x, tiltTarget.current.x, tiltEase);
      tilt.current.rotation.y = THREE.MathUtils.lerp(tilt.current.rotation.y, tiltTarget.current.y, tiltEase);
    }
    const positionError = rig.current.position.distanceTo(targetPosition);
    if (!player && detached.current && positionError < 0.012 && tray.current) {
      tray.current.attach(rig.current);
      rig.current.position.copy(mountPosition);
      rig.current.quaternion.identity();
      rig.current.scale.setScalar(1);
      detached.current = false;
    }
    onSettled(positionError + Math.abs(rig.current.scale.x - targetScale) < 0.015);
  });
  return (
    <group ref={rig} position={[0, 0, cdMountZ]} onClick={(event) => {
      event.stopPropagation();
      if (mode === 'ALBUM_OPEN') onPlayer();
    }} onPointerDown={(event) => {
      if (mode !== 'PLAYER_FOCUS') return;
      event.stopPropagation();
      (event.target as Element).setPointerCapture(event.pointerId);
      tiltDrag.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
    }} onPointerMove={(event) => {
      const active = tiltDrag.current;
      if (!active || active.id !== event.pointerId || mode !== 'PLAYER_FOCUS') return;
      tiltTarget.current.y = THREE.MathUtils.clamp(tiltTarget.current.y + (event.clientX - active.x) * 0.0035, -THREE.MathUtils.degToRad(11), THREE.MathUtils.degToRad(11));
      tiltTarget.current.x = THREE.MathUtils.clamp(tiltTarget.current.x + (event.clientY - active.y) * 0.0028, -THREE.MathUtils.degToRad(7), THREE.MathUtils.degToRad(7));
      active.x = event.clientX;
      active.y = event.clientY;
    }} onPointerUp={(event) => {
      if (tiltDrag.current?.id === event.pointerId) tiltDrag.current = null;
      (event.target as Element).releasePointerCapture(event.pointerId);
    }} onPointerCancel={() => { tiltDrag.current = null; }} onLostPointerCapture={() => { tiltDrag.current = null; }}>
      <group ref={tilt}>
      <group ref={spin}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[CD_RADIUS, CD_RADIUS, CD_THICKNESS, 96, 1, true]} />
        <meshBasicMaterial color="#77736b" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, CD_THICKNESS / 2 + SURFACE_OFFSET]} castShadow>
        <circleGeometry args={[CD_RADIUS, 96]} />
        <meshBasicMaterial map={label} toneMapped={false} />
      </mesh>
      </group>
      </group>
    </group>
  );
}

function TrayRig({ texture, label, dimensions, layout, mode, playing, reduced, onPlayer, onSettled, onDiscSettled }: {
  texture: THREE.Texture; label: THREE.Texture; dimensions: PackageDimensions; layout: ReturnType<typeof getPackageLayout>; mode: ExperienceMode; playing: boolean; reduced: boolean;
  onPlayer(): void; onSettled(settled: boolean): void; onDiscSettled(settled: boolean): void;
}) {
  const { scene, size } = useThree();
  const cdTray = useRef<THREE.Group>(null);
  const trayContext = useRef<THREE.Group>(null);
  const contextFactor = mode === 'PLAYER_FOCUS' ? 0 : mode === 'BOOKLET_FOCUS' ? 0.48 : 1;
  useFrame((_, delta) => {
    if (!trayContext.current) return;
    const ease = reduced ? 1 : 1 - Math.exp(-7 * delta);
    const contextScale = mode === 'PLAYER_FOCUS' ? 0.94 : 1;
    trayContext.current.scale.setScalar(THREE.MathUtils.lerp(trayContext.current.scale.x, contextScale, ease));
    trayContext.current.position.y = THREE.MathUtils.lerp(trayContext.current.position.y, mode === 'PLAYER_FOCUS' ? -0.08 : 0, ease);
    trayContext.current.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      const material = object.material as THREE.Material & { opacity: number };
      const targetOpacity = Number(object.userData.baseOpacity) * contextFactor;
      material.transparent = true;
      material.opacity = THREE.MathUtils.lerp(material.opacity, targetOpacity, ease);
      material.depthWrite = material.opacity > 0.08;
    });
    const contextError = Math.abs(trayContext.current.scale.x - contextScale)
      + Math.abs(trayContext.current.position.y - (mode === 'PLAYER_FOCUS' ? -0.08 : 0))
      + Math.abs(((trayContext.current.children[0] as THREE.Mesh).material as THREE.Material & { opacity: number }).opacity - 0.5 * contextFactor);
    onSettled(contextError < 0.018);
  });
  return (
    <>
    <group>
      <mesh position={[0, 0, layout.backInnerZ]} receiveShadow><planeGeometry args={[dimensions.backWidth, dimensions.backHeight]} /><PaperMaterial texture={texture} /></mesh>
      <group ref={cdTray}>
        <group ref={trayContext}>
        <mesh position={[0, 0, layout.trayPlateZ]} receiveShadow userData={{ baseOpacity: 0.5 }}>
          <boxGeometry args={[dimensions.backWidth * 0.95, dimensions.backHeight * 0.95, TRAY_THICKNESS]} />
          <TrayClearPlasticMaterial opacity={0.34} thickness={TRAY_THICKNESS} />
        </mesh>
        <mesh position={[0, 0, layout.recessZ]} receiveShadow userData={{ baseOpacity: 0.68 }}>
          <ringGeometry args={[CD_RADIUS, PANEL * 0.475, 64]} />
          <TrayClearPlasticMaterial opacity={0.36} thickness={0.008} />
        </mesh>
        <mesh position={[0, 0, layout.recessZ + SURFACE_OFFSET]} userData={{ baseOpacity: 0.15 }}><ringGeometry args={[0.18, CD_RADIUS - 0.04, 64]} /><TrayClearPlasticMaterial opacity={0.15} thickness={0.006} /></mesh>
        <mesh position={[0, 0, layout.hubZ]} rotation={[Math.PI / 2, 0, 0]} castShadow userData={{ baseOpacity: 0.62 }}>
          <cylinderGeometry args={[0.16, 0.145, 0.018, 32]} />
          <TrayClearPlasticMaterial opacity={0.3} thickness={0.012} />
        </mesh>
        </group>
        <CdDisc label={label} tray={cdTray} cdMountZ={layout.cdMountZ} mode={mode} playing={playing} reduced={reduced} onPlayer={onPlayer} onSettled={onDiscSettled} />
      </group>
    </group>
    {mode === 'PLAYER_FOCUS' && createPortal(
      <mesh position={[size.width <= 700 ? 0 : -1.55, size.width <= 700 ? 0.3 : -0.72, 0.05]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.25, 0.62]} />
        <meshBasicMaterial color="#5a4840" transparent opacity={0.1} depthWrite={false} toneMapped={false} />
      </mesh>,
      scene,
    )}
    </>
  );
}

type PageTurn = { key: number; source: number; target: number; direction: -1 | 1 };

function BookletPages({ album, page, mobile, reduced, active, visualPhase, onReady, onPageTurnStart, onPageTurnComplete, onPrevious, onNext }: {
  album: Album; page: number; mobile: boolean; reduced: boolean; active: boolean;
  visualPhase: BookletVisualPhase;
  onPrevious(): void; onNext(): void;
  onReady(): void; onPageTurnStart(direction: 'forward' | 'backward'): void; onPageTurnComplete(): void;
}) {
  const { gl } = useThree();
  const allUrls = useMemo(() => album.booklet!.previewImages.slice(1).map(({ src }) => assetUrl(src)!), [album]);
  const pageIndices = useCallback((value: number) => mobile ? [value] : [value * 2, value * 2 + 1], [mobile]);
  const textureCache = useRef(new Map<number, THREE.Texture>());
  const [visibleCache, setVisibleCache] = useState(() => new Map<number, THREE.Texture>());
  const loader = useRef(new THREE.TextureLoader());
  const mounted = useRef(true);
  const previous = useRef(page);
  const [settled, setSettled] = useState(page);
  const [turn, setTurn] = useState<PageTurn | null>(null);
  const readyReported = useRef(false);
  const loadPage = useCallback(async (value: number) => {
    const missing = pageIndices(value).filter((index) => index < allUrls.length && !textureCache.current.has(index));
    if (!missing.length) return;
    const textures = await Promise.all(missing.map((index) => loader.current.loadAsync(allUrls[index])));
    configureBookletTextures(textures, gl.capabilities.getMaxAnisotropy());
    if (!mounted.current) {
      textures.forEach((texture) => texture.dispose());
      return;
    }
    missing.forEach((index, position) => textureCache.current.set(index, textures[position]));
    setVisibleCache(new Map(textureCache.current));
  }, [allUrls, gl, pageIndices]);

  useEffect(() => {
    let cancelled = false;
    void loadPage(page).then(() => {
      if (cancelled) return;
      if (!readyReported.current) {
        readyReported.current = true;
        onReady();
      }
      if (!active || previous.current === page) return;
      const source = previous.current;
      if (mobile || reduced) {
        previous.current = page;
        setSettled(page);
        onPageTurnComplete();
        return;
      }
      onPageTurnStart(page > source ? 'forward' : 'backward');
      setTurn({ key: Date.now(), source, target: page, direction: page > source ? 1 : -1 });
    });
    return () => { cancelled = true; };
  }, [active, loadPage, mobile, onPageTurnComplete, onPageTurnStart, onReady, page, reduced]);

  useEffect(() => {
    if (turn || settled !== page) return undefined;
    const upcoming = [page + 1, page + 2].filter((nextPage) => pageIndices(nextPage).some((index) => index < allUrls.length));
    if (!upcoming.length) return undefined;
    const idleWindow = window as unknown as { requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number; cancelIdleCallback?: (handle: number) => void };
    const prefetch = () => { void upcoming.reduce((ready, nextPage) => ready.then(() => loadPage(nextPage)), Promise.resolve()); };
    const handle = idleWindow.requestIdleCallback ? idleWindow.requestIdleCallback(prefetch, { timeout: 1800 }) : window.setTimeout(prefetch, 700);
    return () => idleWindow.requestIdleCallback ? idleWindow.cancelIdleCallback?.(handle) : window.clearTimeout(handle);
  }, [allUrls.length, loadPage, page, pageIndices, settled, turn]);

  useEffect(() => () => {
    mounted.current = false;
    textureCache.current.forEach((texture) => texture.dispose());
    textureCache.current.clear();
  }, []);

  const fallback = visibleCache.get(pageIndices(settled)[0]);
  if (!fallback) return null;
  const pages = Array.from({ length: allUrls.length }, (_, index) => visibleCache.get(index) ?? fallback);
  const width = PAGE_HEIGHT * textureAspect(fallback);
  const completeTurn = () => {
    if (!turn) return;
    previous.current = turn.target;
    setSettled(turn.target);
    setTurn(null);
    onPageTurnComplete();
  };
  if (mobile) {
    const base = pages[turn ? turn.target : settled];
    return <mesh castShadow receiveShadow><planeGeometry args={[PAGE_HEIGHT * textureAspect(base), PAGE_HEIGHT, 16, 2]} /><PaperMaterial texture={base} /></mesh>;
  }
  const spreads = Array.from({ length: Math.ceil(pages.length / 2) }, (_, index) => [pages[index * 2], pages[index * 2 + 1] ?? pages[index * 2]]);
  const source = spreads[turn ? turn.source : settled];
  const target = spreads[turn ? turn.target : settled];
  const left = turn ? (turn.direction > 0 ? source[0] : target[0]) : target[0];
  const right = turn ? (turn.direction > 0 ? target[1] : source[1]) : target[1];
  const leftSpreadIndex = turn
    ? (turn.direction > 0 ? turn.source : turn.target)
    : settled;
  const leftStackZ = 0.006 + leftSpreadIndex * 0.004;
  // HTML owns only a fully settled READING frame. Three.js keeps both static
  // pages present for entry, return, and the entire paper-turn interval.
  const showStaticPages = mobile || turn !== null || visualPhase !== 'READING';
  return (
    <group>
      <mesh visible={showStaticPages} position={[-width / 2, 0, leftStackZ]} castShadow receiveShadow><planeGeometry args={[width, PAGE_HEIGHT, 16, 2]} /><PaperMaterial texture={left} /></mesh>
      <mesh visible={showStaticPages} position={[width / 2, 0, 0]} castShadow receiveShadow onClick={active ? (event) => { event.stopPropagation(); onNext(); } : undefined}><planeGeometry args={[width, PAGE_HEIGHT, 16, 2]} /><PaperMaterial texture={right} /></mesh>
      {active && <mesh position={[-width / 2, 0, leftStackZ + 0.001]} userData={{ keepOpacity: true }} onClick={(event) => { event.stopPropagation(); onPrevious(); }}>
        <planeGeometry args={[width, PAGE_HEIGHT]} /><meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>}
      {turn && <TurningPage key={turn.key} pages={pages} width={width} turn={turn} onDone={completeTurn} />}
    </group>
  );
}

function TurningPage({ pages, width, turn, onDone, frontTexture, backTexture, duration = PAGE_TURN_DURATION }: {
  pages: THREE.Texture[]; width: number; turn: { source: number; target: number; direction: -1 | 1 }; onDone(): void;
  frontTexture?: THREE.Texture; backTexture?: THREE.Texture; duration?: number;
}) {
  const frontSurface = useRef<THREE.Mesh>(null);
  const backSurface = useRef<THREE.Mesh>(null);
  const elapsed = useRef(0);
  const done = useRef(false);
  const arc = useRef({ x: new Float32Array(29), z: new Float32Array(29) });
  const front = frontTexture ?? (turn.direction > 0 ? pages[turn.source * 2 + 1] : pages[turn.source * 2]);
  const back = backTexture ?? (turn.direction > 0 ? pages[turn.target * 2] : pages[turn.target * 2 + 1]);
  useFrame((_, delta) => {
    if (!frontSurface.current || !backSurface.current) return;
    elapsed.current = Math.min(duration, elapsed.current + delta);
    const t = elapsed.current / duration;
    const side = turn.direction > 0 ? 1 : -1;
    const segmentLength = width / 28;
    const arcX = arc.current.x;
    const arcZ = arc.current.z;
    arcX[0] = 0;
    arcZ[0] = 0;
    // Integrating each column's tangent preserves the sheet's width while the
    // gutter leads and the outer edge follows. It avoids collapsing every
    // vertex through x=0 as a linear horizontal reflection would.
    for (let column = 1; column <= 28; column += 1) {
      const previousNormalized = (column - 1) / 28;
      const normalized = column / 28;
      const previousLocal = THREE.MathUtils.clamp((t - previousNormalized * 0.2) / 0.8, 0, 1);
      const local = THREE.MathUtils.clamp((t - normalized * 0.2) / 0.8, 0, 1);
      const previousEase = previousLocal * previousLocal * (3 - 2 * previousLocal);
      const paperEase = local * local * (3 - 2 * local);
      const tangentAngle = Math.PI * (previousEase + paperEase) / 2;
      arcX[column] = arcX[column - 1] + Math.cos(tangentAngle) * segmentLength;
      arcZ[column] = arcZ[column - 1] + Math.sin(tangentAngle) * segmentLength * 0.16;
    }
    [frontSurface.current, backSurface.current].forEach((mesh) => {
      const positions = mesh.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < positions.count; i += 1) {
        const originalX = (mesh.geometry.userData.original as Float32Array)[i];
        const normalized = THREE.MathUtils.clamp(side > 0 ? originalX / width + 0.5 : 0.5 - originalX / width, 0, 1);
        const column = Math.round(normalized * 28);
        positions.setX(i, side * arcX[column]);
        positions.setZ(i, arcZ[column]);
      }
      positions.needsUpdate = true;
    });
    if (t === 1 && !done.current) { done.current = true; onDone(); }
  });
  return (
    <group position={[0, 0, 0.025]}>
      <mesh ref={(node) => { frontSurface.current = node; if (node && !node.geometry.userData.original) node.geometry.userData.original = Float32Array.from(Array.from({ length: node.geometry.attributes.position.count }, (_, i) => (node.geometry.attributes.position as THREE.BufferAttribute).getX(i))); }} castShadow frustumCulled={false}>
        <planeGeometry args={[width, PAGE_HEIGHT, 28, 3]} /><PrintedPaperMaterial texture={front} side={THREE.FrontSide} />
      </mesh>
      <mesh ref={(node) => { backSurface.current = node; if (node && !node.geometry.userData.original) { node.geometry.userData.original = Float32Array.from(Array.from({ length: node.geometry.attributes.position.count }, (_, i) => (node.geometry.attributes.position as THREE.BufferAttribute).getX(i))); const uv = node.geometry.attributes.uv as THREE.BufferAttribute; for (let i = 0; i < uv.count; i += 1) uv.setX(i, 1 - uv.getX(i)); uv.needsUpdate = true; } }} position={[0, 0, -0.002]} castShadow frustumCulled={false}>
        <planeGeometry args={[width, PAGE_HEIGHT, 28, 3]} /><PrintedPaperMaterial texture={back} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}


function BookletRig({ album, p1, mode, page, bookletPhase, mobile, reduced, onBooklet, onSettled, onPhaseChange, onPageTurnStart, onPageTurnComplete, onPrevious, onNext, onBounds }: {
  album: Album; p1: THREE.Texture; mode: ExperienceMode; page: number; mobile: boolean; reduced: boolean;
  bookletPhase: BookletVisualPhase;
  onBooklet(): void; onSettled(settled: boolean): void; onPageTurnComplete(): void; onPrevious(): void; onNext(): void;
  onPhaseChange?(phase: BookletVisualPhase): void; onPageTurnStart(direction: 'forward' | 'backward'): void;
  onBounds?(bounds: BookletBounds): void;
}) {
  const { camera, gl, size, viewport } = useThree();
  const rig = useRef<THREE.Group>(null);
  const cover = useRef<THREE.Group>(null);
  const reader = useRef<THREE.Group>(null);
  const detailsReady = useRef(false);
  const opacity = useRef(1);
  const coverOpacity = useRef(1);
  const readerOpacity = useRef(0);
  const lastBounds = useRef<BookletBounds | null>(null);
  const p1Width = PAGE_HEIGHT * textureAspect(p1);

  const setGroupOpacity = (group: THREE.Group | null, value: number) => {
    group?.traverse((object) => {
      if (!(object instanceof THREE.Mesh) || object.userData.keepOpacity) return;
      const material = object.material as THREE.Material & { opacity: number };
      material.transparent = true;
      material.opacity = value;
      material.depthWrite = value > 0.08;
    });
  };

  useFrame((_, delta) => {
    if (!rig.current || !cover.current) return;
    if (bookletPhase === 'RESTING') detailsReady.current = false;
    const focusedTransform = bookletPhase === 'ENTERING' || bookletPhase === 'READING'
      || bookletPhase === 'TURNING_FORWARD' || bookletPhase === 'TURNING_BACKWARD'
      || (mobile && bookletPhase === 'RETURNING_FINISH');
    const ease = reduced ? 1 : 1 - Math.exp(-5.5 * delta);
    const targetPosition = new THREE.Vector3(mode === 'PLAYER_FOCUS' ? -p1Width / 2 - 0.16 : -p1Width / 2, 0, mode === 'PLAYER_FOCUS' ? -0.18 : 0.08);
    const targetQuaternion = new THREE.Quaternion();
    const restingScale = mode === 'PLAYER_FOCUS' ? 0.72 : 1;
    const targetScale = new THREE.Vector3(restingScale, restingScale, restingScale);
    if (focusedTransform && rig.current.parent) {
      rig.current.parent.updateWorldMatrix(true, false);
      const desiredPosition = new THREE.Vector3(0, mobile ? 0.35 : 0.08, 0.82);
      const focusViewport = viewport.getCurrentViewport(camera, desiredPosition);
      const mobileFocusScale = Math.min(focusViewport.width * 0.95 / p1Width, focusViewport.height * 0.91 / PAGE_HEIGHT) * 0.9;
      const desktopFocusScale = Math.min(focusViewport.width * 0.93 / (p1Width * 2), focusViewport.height * 0.94 / PAGE_HEIGHT) * 0.9;
      const desiredWorld = new THREE.Matrix4().compose(
        desiredPosition,
        new THREE.Quaternion().setFromEuler(new THREE.Euler(mobile ? -0.04 : 0, 0, 0)),
        new THREE.Vector3(mobile ? mobileFocusScale : desktopFocusScale, mobile ? mobileFocusScale : desktopFocusScale, mobile ? mobileFocusScale : desktopFocusScale),
      );
      const local = rig.current.parent.matrixWorld.clone().invert().multiply(desiredWorld);
      local.decompose(targetPosition, targetQuaternion, targetScale);
    }
    const turning = bookletPhase === 'TURNING_FORWARD' || bookletPhase === 'TURNING_BACKWARD';
    if (turning) {
      rig.current.position.copy(targetPosition);
      rig.current.quaternion.copy(targetQuaternion);
      rig.current.scale.copy(targetScale);
    } else {
      rig.current.position.lerp(targetPosition, ease);
      rig.current.quaternion.slerp(targetQuaternion, ease);
      rig.current.scale.lerp(targetScale, ease);
    }
    opacity.current = THREE.MathUtils.lerp(opacity.current, mode === 'PLAYER_FOCUS' ? 0 : 1, ease);
    setGroupOpacity(rig.current, opacity.current);

    const transformError = rig.current.position.distanceTo(targetPosition)
      + rig.current.quaternion.angleTo(targetQuaternion)
      + rig.current.scale.distanceTo(targetScale);
    const canRevealReader = detailsReady.current && (bookletPhase === 'READING'
      || bookletPhase === 'TURNING_FORWARD' || bookletPhase === 'TURNING_BACKWARD'
      || bookletPhase === 'RETURNING_MOVE'
      || (bookletPhase === 'ENTERING' && transformError < 0.12));
    const coverTarget = canRevealReader ? 0 : 1;
    const readerTarget = canRevealReader ? 1 : 0;
    if (mobile) {
      coverOpacity.current = THREE.MathUtils.lerp(coverOpacity.current, coverTarget, ease);
      readerOpacity.current = THREE.MathUtils.lerp(readerOpacity.current, readerTarget, ease);
    } else {
      // The desktop cover/reader handoff happens only after the cover reaches
      // its reading position. A short optical dissolve keeps it one object.
      const crossfadeEase = reduced ? 1 : 1 - Math.exp(-22 * delta);
      coverOpacity.current = THREE.MathUtils.lerp(coverOpacity.current, coverTarget, crossfadeEase);
      readerOpacity.current = THREE.MathUtils.lerp(readerOpacity.current, readerTarget, crossfadeEase);
    }
    setGroupOpacity(cover.current, coverOpacity.current * opacity.current);
    setGroupOpacity(reader.current, readerOpacity.current * opacity.current);

    if (mode === 'BOOKLET_FOCUS' && onBounds) {
      const horizontalExtent = mobile ? p1Width / 2 : p1Width;
      const corners = [
        new THREE.Vector3(-horizontalExtent, PAGE_HEIGHT / 2, 0), new THREE.Vector3(horizontalExtent, PAGE_HEIGHT / 2, 0),
        new THREE.Vector3(-horizontalExtent, -PAGE_HEIGHT / 2, 0), new THREE.Vector3(horizontalExtent, -PAGE_HEIGHT / 2, 0),
      ].map((corner) => rig.current!.localToWorld(corner).project(camera));
      const xs = corners.map((corner) => (corner.x * 0.5 + 0.5) * size.width);
      const ys = corners.map((corner) => (-corner.y * 0.5 + 0.5) * size.height);
      const canvasRect = gl.domElement.getBoundingClientRect();
      const bounds = { left: canvasRect.left + Math.min(...xs), top: canvasRect.top + Math.min(...ys), width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) };
      const last = lastBounds.current;
      if (!last || Math.abs(last.left - bounds.left) + Math.abs(last.top - bounds.top) + Math.abs(last.width - bounds.width) + Math.abs(last.height - bounds.height) > 0.5) {
        lastBounds.current = bounds;
        onBounds(bounds);
      }
    }

    const crossfadeError = Math.abs(coverOpacity.current - coverTarget) + Math.abs(readerOpacity.current - readerTarget);
    if (bookletPhase === 'ENTERING' && canRevealReader && crossfadeError < 0.035) onPhaseChange?.('READING');
    if (bookletPhase === 'RETURNING_MOVE' && transformError < 0.035) onPhaseChange?.('RETURNING_FINISH');
    if (bookletPhase === 'RETURNING_FINISH' && crossfadeError < 0.035) {
      onPhaseChange?.('RESTING');
    }
    const opacitySettled = Math.abs(opacity.current - (mode === 'PLAYER_FOCUS' ? 0 : 1)) < 0.02;
    const geometrySettled = transformError < 0.035 && crossfadeError < 0.035 && opacitySettled;
    onSettled(geometrySettled && (bookletPhase === 'RESTING' || bookletPhase === 'READING'));
  });

  return (
    <group ref={rig} position={[-p1Width / 2, 0, 0.08]} onClick={(event) => { event.stopPropagation(); if (mode === 'ALBUM_OPEN') onBooklet(); }}>
      <group ref={reader} visible={bookletPhase !== 'RESTING'}>
        {bookletPhase !== 'RESTING' && <Suspense fallback={null}><BookletPages album={album} page={page} mobile={mobile} reduced={reduced} active={mode === 'BOOKLET_FOCUS'} visualPhase={bookletPhase} onReady={() => { detailsReady.current = true; }} onPageTurnStart={onPageTurnStart} onPageTurnComplete={onPageTurnComplete} onPrevious={onPrevious} onNext={onNext} /></Suspense>}
      </group>
      <group ref={cover} position={[0, 0, 0.035]}>
        <mesh position={[p1Width / 2, 0, 0]} castShadow><planeGeometry args={[p1Width, PAGE_HEIGHT]} /><PaperMaterial texture={p1} /></mesh>
      </group>
    </group>
  );
}

function FrontInterior({ album, dimensions, mode, page, bookletPhase, mobile, reduced, onBooklet, onSettled, onPhaseChange, onPageTurnStart, onPageTurnComplete, onPrevious, onNext, onBounds }: {
  album: Album; dimensions: PackageDimensions; mode: ExperienceMode; page: number; mobile: boolean; reduced: boolean;
  bookletPhase: BookletVisualPhase;
  onBooklet(): void; onSettled(settled: boolean): void; onPageTurnComplete(): void; onPrevious(): void; onNext(): void; onBounds?(bounds: BookletBounds): void;
  onPhaseChange?(phase: BookletVisualPhase): void; onPageTurnStart(direction: 'forward' | 'backward'): void;
}) {
  const textures = useInteriorTextures(album);
  return <>
    <mesh position={[0, 0, -COVER_DEPTH / 2 - SURFACE_OFFSET]} rotation={[0, Math.PI, 0]} receiveShadow><planeGeometry args={[dimensions.frontWidth, dimensions.frontHeight]} /><PaperMaterial texture={textures.interiorBooklet} /></mesh>
    <group position={[0, 0, 0.064]} rotation={[0, Math.PI, 0]}>
      <BookletRig album={album} p1={textures.p1} mode={mode} page={page} bookletPhase={bookletPhase} mobile={mobile} reduced={reduced} onBooklet={onBooklet} onSettled={onSettled} onPhaseChange={onPhaseChange} onPageTurnStart={onPageTurnStart} onPageTurnComplete={onPageTurnComplete} onPrevious={onPrevious} onNext={onNext} onBounds={onBounds} />
    </group>
  </>;
}

function TrayInterior({ album, dimensions, layout, mode, playing, reduced, onPlayer, onSettled, onDiscSettled, onPrewarmReady }: {
  album: Album; dimensions: PackageDimensions; layout: ReturnType<typeof getPackageLayout>; mode: ExperienceMode; playing: boolean; reduced: boolean;
  onPlayer(): void; onSettled(settled: boolean): void; onDiscSettled(settled: boolean): void;
  onPrewarmReady?(): void;
}) {
  const textures = useInteriorTextures(album);
  return <><TrayRig texture={textures.interiorTray} label={textures.cdLabel} dimensions={dimensions} layout={layout} mode={mode} playing={playing} reduced={reduced} onPlayer={onPlayer} onSettled={onSettled} onDiscSettled={onDiscSettled} /><PrewarmReady onReady={onPrewarmReady} /></>;
}

function Scene(props: ExperienceProps) {
  const { album, backgroundSize, openingFromClosed, mode, page, bookletPhase, mobile, playing, reduced, homeActivationKey, detailActive, prewarming = false, onOpen, onBooklet, onPlayer, onPrevious, onNext, onBookletBounds, onBookletPhaseChange, onPageTurnStart, onPrewarmReady, onTransitionChange } = props;
  const openPitch = mobile ? -0.1 : 0;
  const textures = useOuterTextures(album);
  const outerMaterials = useMemo(() => {
    const paper = new THREE.MeshStandardMaterial({ color: '#e8e3d8', roughness: 0.94 });
    const printed = (map: THREE.Texture) => new THREE.MeshBasicMaterial({ color: '#ffffff', map, toneMapped: false });
    const faceMaterials = (map: THREE.Texture, faceIndex: 4 | 5) => {
      const materials: THREE.Material[] = Array(6).fill(paper);
      materials[faceIndex] = printed(map);
      return materials;
    };
    return { front: faceMaterials(textures.front, 4), back: faceMaterials(textures.back, 5) };
  }, [textures.back, textures.front]);
  useEffect(() => () => new Set([...outerMaterials.front, ...outerMaterials.back]).forEach((material) => material.dispose()), [outerMaterials]);
  const packageDimensions = getPackageDimensions(album.albumHero?.packageGeometry);
  const layout = getPackageLayout(packageDimensions);
  const halfPanel = packageDimensions.frontWidth / 2;
  const { camera, size, viewport } = useThree();
  const perspectiveCamera = useRef(camera as THREE.PerspectiveCamera);
  const packageRig = useRef<THREE.Group>(null);
  const hinge = useRef<THREE.Group>(null);
  const drag = useRef<{ id: number; x: number; y: number; startX: number; startY: number; canvas: HTMLCanvasElement; intent: 'pending' | 'rotate' | 'scroll' } | null>(null);
  const rotation = useRef(readHanRotation({ x: -0.06, y: 0.1 }));
  const autoRotate = useRef(true);
  const persistFrame = useRef(0);
  const aligned = useRef(mode !== 'CLOSED');
  const alignedYaw = useRef(0);
  const [openingPhase, setOpeningPhase] = useState<OpeningPhase>('IDLE');
  const openingPhaseRef = useRef<OpeningPhase>('IDLE');
  const previousMode = useRef(mode);
  const reported = useRef(false);
  const bookletSettled = useRef(mode === 'CLOSED');
  const traySettled = useRef(true);
  const discSettled = useRef(true);
  const playerReturnPending = useRef(false);
  const setBookletSettled = useCallback((value: boolean) => { bookletSettled.current = value; }, []);
  const setTraySettled = useCallback((value: boolean) => { traySettled.current = value; }, []);
  const setDiscSettled = useCallback((value: boolean) => { discSettled.current = value; }, []);
  const keepInternalsClosed = openingFromClosed
    || openingPhase === 'ALIGN_CLOSED'
    || openingPhase === 'POSITION_FOR_OPEN';
  const backgroundSource = mobile
    ? album.albumHero?.backgroundAnchor?.mobile ?? DETAIL_BACKGROUND.mobile
    : album.albumHero?.backgroundAnchor?.desktop ?? DETAIL_BACKGROUND.desktop;
  const stageWidth = backgroundSize.width || size.width;
  const stageHeight = backgroundSize.height || size.height;
  const backgroundScale = Math.max(stageWidth / backgroundSource.sourceWidth, stageHeight / backgroundSource.sourceHeight);
  const renderedWidth = backgroundSource.sourceWidth * backgroundScale;
  const backgroundOffsetX = (stageWidth - renderedWidth) / 2;
  const screenLineX = backgroundOffsetX + backgroundSource.x * renderedWidth;
  const closedX = (screenLineX / stageWidth - 0.5) * viewport.width;
  const mobileHeader = Math.min(80, Math.max(60, size.height * 0.09));
  const projectedCoverHeight = packageDimensions.frontHeight * 0.48 / viewport.height * size.height;
  const mobileCenterY = mobileHeader + 20 + projectedCoverHeight / 2;
  const closedY = mobile ? (0.5 - mobileCenterY / size.height) * viewport.height : 0.2;

  useEffect(() => {
    if (prewarming) {
      autoRotate.current = false;
      rotation.current = { x: 0, y: 0 };
      return;
    }
    if (homeActivationKey > 0) autoRotate.current = !reduced;
  }, [homeActivationKey, prewarming, reduced]);

  useEffect(() => {
    if (mode === 'PLAYER_FOCUS' && previousMode.current !== 'PLAYER_FOCUS') {
      discSettled.current = false;
    }
    if (previousMode.current === 'PLAYER_FOCUS' && mode === 'ALBUM_OPEN') {
      playerReturnPending.current = true;
      discSettled.current = false;
    }
    const openingFromClosed = previousMode.current === 'CLOSED' && mode !== 'CLOSED';
    if (openingFromClosed) {
      autoRotate.current = false;
      alignedYaw.current = Math.round(rotation.current.y / (Math.PI * 2)) * Math.PI * 2;
      aligned.current = false;
      openingPhaseRef.current = 'ALIGN_CLOSED';
    } else if (mode !== 'CLOSED') {
      if (!mobile) {
        rotation.current.x = openPitch;
        rotation.current.y = alignedYaw.current;
      }
      aligned.current = true;
      openingPhaseRef.current = 'IDLE';
    } else {
      aligned.current = true;
      openingPhaseRef.current = 'IDLE';
    }
    queueMicrotask(() => setOpeningPhase(openingPhaseRef.current));
    reported.current = false;
    onTransitionChange?.(true);
    previousMode.current = mode;
  }, [mobile, mode, onTransitionChange, openPitch]);

  useFrame((_, delta) => {
    if (!packageRig.current || !hinge.current) return;
    const closed = mode === 'CLOSED';
    if (closed && !prewarming && autoRotate.current && !reduced) rotation.current.y += delta * Math.PI / 11;
    persistFrame.current += 1;
    if (closed && !prewarming && persistFrame.current % 12 === 0) sessionStorage.setItem(HAN_ROTATION_KEY, JSON.stringify(rotation.current));
    const ease = reduced ? 1 : 1 - Math.exp(-5 * delta);
    const targetCameraZ = detailActive ? 7 : 5;
    const targetFov = detailActive ? 42 : 36;
    perspectiveCamera.current.position.z = THREE.MathUtils.lerp(perspectiveCamera.current.position.z, targetCameraZ, ease);
    perspectiveCamera.current.fov = THREE.MathUtils.lerp(perspectiveCamera.current.fov, targetFov, ease);
    perspectiveCamera.current.updateProjectionMatrix();
    if (!closed && !aligned.current) {
      rotation.current.x = THREE.MathUtils.lerp(rotation.current.x, openPitch, ease);
      rotation.current.y = THREE.MathUtils.lerp(rotation.current.y, alignedYaw.current, ease);
      if (Math.abs(rotation.current.x - openPitch) + Math.abs(rotation.current.y - alignedYaw.current) < 0.018) {
        aligned.current = true;
        openingPhaseRef.current = 'POSITION_FOR_OPEN';
        setOpeningPhase('POSITION_FOR_OPEN');
      }
    }
    const openInteractive = mode === 'ALBUM_OPEN' && aligned.current && openingPhaseRef.current === 'IDLE';
    packageRig.current.rotation.x = THREE.MathUtils.lerp(packageRig.current.rotation.x, closed || openInteractive ? rotation.current.x : openPitch, ease);
    packageRig.current.rotation.y = THREE.MathUtils.lerp(packageRig.current.rotation.y, closed || openInteractive ? rotation.current.y : alignedYaw.current, ease);
    const positioning = openingPhaseRef.current === 'POSITION_FOR_OPEN';
    const opening = openingPhaseRef.current === 'HINGE_OPEN' || (!closed && openingPhaseRef.current === 'IDLE');
    const targetHinge = opening ? OPEN_ANGLE : 0;
    hinge.current.rotation.y = THREE.MathUtils.lerp(hinge.current.rotation.y, targetHinge, ease);
    const keepClosedTransform = closed || openingPhaseRef.current === 'ALIGN_CLOSED';
    const detailClosedX = mobile ? closedX : -viewport.width * 0.18;
    const closedTargetX = detailActive ? detailClosedX : closedX;
    const x = keepClosedTransform ? closedTargetX : mode === 'BOOKLET_FOCUS' ? (mobile ? halfPanel : 1.05) : mode === 'PLAYER_FOCUS' ? (mobile ? 0 : 0.32) : halfPanel;
    const y = mobile
      ? (keepClosedTransform ? closedY : mode === 'PLAYER_FOCUS' ? viewport.height * 0.2 : viewport.height * 0.1)
      : (keepClosedTransform ? closedY : mode === 'ALBUM_OPEN' ? -0.08 : 0.05);
    const mobileClosedScale = 0.48;
    const mobileOpenScale = viewport.width * 0.9 / (packageDimensions.frontWidth * 1.94);
    const mobilePlayerScale = viewport.width * 0.62 / (CD_RADIUS * 2);
    const hanOpenScale = (PACKAGE_PANEL * 1.08) / packageDimensions.frontHeight;
    const scale = keepClosedTransform
      ? (mobile ? mobileClosedScale : detailActive ? 1.18 : 0.7)
      : mode === 'BOOKLET_FOCUS'
        ? (mobile ? mobileOpenScale : 0.76)
        : mode === 'PLAYER_FOCUS'
          ? (mobile ? mobilePlayerScale : 1.18)
          : (mobile ? mobileOpenScale : hanOpenScale);
    if (playerReturnPending.current && discSettled.current) playerReturnPending.current = false;
    packageRig.current.position.x = THREE.MathUtils.lerp(packageRig.current.position.x, x, ease);
    packageRig.current.position.y = THREE.MathUtils.lerp(packageRig.current.position.y, y, ease);
    const playerPackageRetreated = !mobile && (mode === 'PLAYER_FOCUS'
      ? discSettled.current
      : playerReturnPending.current);
    const packageZ = mode === 'BOOKLET_FOCUS' ? -1 : (playerPackageRetreated ? -2.5 : 0);
    packageRig.current.position.z = THREE.MathUtils.lerp(packageRig.current.position.z, packageZ, ease);
    packageRig.current.scale.setScalar(THREE.MathUtils.lerp(packageRig.current.scale.x, scale, ease));
    // Desktop depth and opacity provide the handoff; a z-threshold hard cut
    // exposed an empty tray on return. Preserve the existing mobile branch.
    packageRig.current.visible = mobile ? mode !== 'PLAYER_FOCUS' : true;
    const packageError = Math.abs(packageRig.current.position.x - x)
      + Math.abs(packageRig.current.position.y - y)
      + Math.abs(packageRig.current.position.z - packageZ)
      + Math.abs(packageRig.current.scale.x - scale);
    if (positioning && packageError < 0.035) {
      openingPhaseRef.current = 'HINGE_OPEN';
      setOpeningPhase('HINGE_OPEN');
    }
    const hingeError = Math.abs(hinge.current.rotation.y - targetHinge);
    if (openingPhaseRef.current === 'HINGE_OPEN' && hingeError < 0.025 && packageError < 0.04) {
      openingPhaseRef.current = 'IDLE';
      setOpeningPhase('IDLE');
    }
    const openingFromClosedComplete = closed || openingPhaseRef.current === 'IDLE';
    const cameraError = Math.abs(perspectiveCamera.current.position.z - targetCameraZ) + Math.abs(perspectiveCamera.current.fov - targetFov);
    const complete = aligned.current
      && openingFromClosedComplete
      && hingeError < 0.025
      && packageError < 0.04
      && cameraError < 0.025
      && bookletSettled.current
      && traySettled.current
      && discSettled.current;
    if (complete && !reported.current) { reported.current = true; onTransitionChange?.(false); }
  });

  const finish = (id: number, click: boolean) => {
    const active = drag.current;
    if (!active || active.id !== id) return;
    if (active.canvas.hasPointerCapture(id)) active.canvas.releasePointerCapture(id);
    if (mode === 'CLOSED' && click && Math.hypot(active.x - active.startX, active.y - active.startY) < 7) onOpen();
    drag.current = null;
  };
  useEffect(() => {
    const up = (event: PointerEvent) => finish(event.pointerId, event.type === 'pointerup');
    window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
    return () => { window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); };
  });
  const down = (event: ThreeEvent<PointerEvent>) => {
    if (prewarming || (mode !== 'CLOSED' && mode !== 'ALBUM_OPEN')) return;
    event.stopPropagation(); autoRotate.current = false;
    const canvas = event.nativeEvent.currentTarget as HTMLCanvasElement;
    if (!mobile) canvas.setPointerCapture(event.pointerId);
    drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, startX: event.clientX, startY: event.clientY, canvas, intent: mobile ? 'pending' : 'rotate' };
  };
  const move = (event: ThreeEvent<PointerEvent>) => {
    const active = drag.current; if (!active || active.id !== event.pointerId || (mode !== 'CLOSED' && mode !== 'ALBUM_OPEN')) return;
    if (active.intent === 'pending') {
      const dx = Math.abs(event.clientX - active.startX);
      const dy = Math.abs(event.clientY - active.startY);
      if (dx > dy * 1.15 && dx > 7) {
        active.intent = 'rotate';
        active.canvas.setPointerCapture(event.pointerId);
      } else if (dy > dx * 1.15 && dy > 7) {
        active.intent = 'scroll';
      }
    }
    if (active.intent !== 'rotate') return;
    const distance = Math.hypot(event.clientX - active.startX, event.clientY - active.startY);
    if (distance >= 7) {
      if (mode === 'ALBUM_OPEN') {
        rotation.current.y = THREE.MathUtils.clamp(rotation.current.y + (event.clientX - active.x) * 0.0035, alignedYaw.current - THREE.MathUtils.degToRad(10), alignedYaw.current + THREE.MathUtils.degToRad(10));
        rotation.current.x = THREE.MathUtils.clamp(rotation.current.x + (event.clientY - active.y) * 0.003, openPitch - THREE.MathUtils.degToRad(6), openPitch + THREE.MathUtils.degToRad(6));
      } else {
        rotation.current.y += (event.clientX - active.x) * 0.008;
        rotation.current.x = THREE.MathUtils.clamp(rotation.current.x + (event.clientY - active.y) * 0.006, -0.48, 0.48);
      }
    }
    active.x = event.clientX; active.y = event.clientY;
  };
  return (
    <>
      <group ref={packageRig} visible={mobile ? mode !== 'PLAYER_FOCUS' : true} position={[closedX, closedY, 0]} rotation={[-0.06, 0.1, 0]} scale={mobile ? 0.48 : 0.7}
        onPointerDown={down} onPointerMove={move} onPointerUp={(event) => finish(event.pointerId, true)} onPointerCancel={(event) => finish(event.pointerId, false)}>
        <mesh castShadow><boxGeometry args={[packageDimensions.trayWidth, packageDimensions.trayHeight, packageDimensions.trayDepth]} /><HanOuterPlasticMaterial /></mesh>
        <mesh position={[0, 0, -(packageDimensions.trayDepth / 2 + COVER_DEPTH / 2)]} material={outerMaterials.back} castShadow><boxGeometry args={[packageDimensions.backWidth, packageDimensions.backHeight, COVER_DEPTH]} /></mesh>
        {detailActive && <Suspense fallback={null}><TrayInterior album={album} dimensions={packageDimensions} layout={layout} mode={keepInternalsClosed ? 'CLOSED' : mode} playing={playing} reduced={reduced} onPlayer={onPlayer} onSettled={setTraySettled} onDiscSettled={setDiscSettled} onPrewarmReady={onPrewarmReady} /></Suspense>}
        <group ref={hinge} position={[-packageDimensions.frontWidth / 2, 0, 0]}>
          <group position={[packageDimensions.frontWidth / 2, 0, layout.frontCenterZ]}>
            <mesh material={outerMaterials.front} castShadow><boxGeometry args={[packageDimensions.frontWidth, packageDimensions.frontHeight, COVER_DEPTH]} /></mesh>
            {detailActive && <Suspense fallback={null}><FrontInterior album={album} dimensions={packageDimensions} mode={keepInternalsClosed ? 'CLOSED' : mode} page={page} bookletPhase={bookletPhase} mobile={mobile} reduced={reduced} onBooklet={onBooklet} onSettled={setBookletSettled} onPhaseChange={onBookletPhaseChange} onPageTurnStart={(direction) => onPageTurnStart?.(direction)} onPageTurnComplete={() => props.onPageTurnComplete?.()} onPrevious={onPrevious} onNext={onNext} onBounds={onBookletBounds} /></Suspense>}
          </group>
        </group>
        <mesh position={[-Math.max(packageDimensions.frontWidth, packageDimensions.backWidth) / 2 - SPINE_SURFACE_OFFSET, 0, 0]} rotation={[0, -Math.PI / 2, 0]} castShadow><planeGeometry args={[packageDimensions.printedSpineDepth, packageDimensions.frontHeight]} /><PaperMaterial texture={textures.spine} /></mesh>
        <mesh position={[-Math.max(packageDimensions.frontWidth, packageDimensions.backWidth) / 2 + SPINE_SURFACE_OFFSET, 0, 0]} rotation={[0, Math.PI / 2, 0]} castShadow><planeGeometry args={[packageDimensions.printedSpineDepth, packageDimensions.frontHeight]} /><PaperMaterial texture={textures.spine} /></mesh>
      </group>
      {/* This screen-facing interaction surface intentionally lives outside
          packageRig, so its usable width never collapses at spine/back angles. */}
      {mode === 'CLOSED' && (
        <mesh position={[closedX, closedY, 1.2]}
          onPointerDown={down} onPointerMove={move} onPointerUp={(e) => finish(e.pointerId, true)} onPointerCancel={(e) => finish(e.pointerId, false)}>
          <planeGeometry args={[mobile ? viewport.width * 0.78 : 5.5, mobile ? viewport.width * 0.78 : 4.4]} />
          <meshBasicMaterial transparent opacity={0} colorWrite={false} depthWrite={false} />
        </mesh>
      )}
      <mesh position={[0, 0, -0.34]} receiveShadow><planeGeometry args={[12, 10]} /><shadowMaterial transparent opacity={0.13} depthWrite={false} /></mesh>
    </>
  );
}

export default function HanBeomSuAlbumDetailExperience3D(props: ExperienceProps) {
  return (
    <Canvas aria-label="열고 탐색할 수 있는 한범수류 3D 디지팩" camera={{ position: [0, 0, 5], fov: 36 }} dpr={[1, 2]} shadows="soft" gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}>
      <ambientLight intensity={0.82} />
      <directionalLight castShadow intensity={1.65} position={[4.5, 6, 5.5]} shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-camera-left={-4} shadow-camera-right={4} shadow-camera-top={4} shadow-camera-bottom={-4} shadow-radius={8} shadow-bias={-0.0002} />
      <directionalLight intensity={0.28} position={[-3.5, 1.5, 3]} />
      <Scene {...props} />
    </Canvas>
  );
}
