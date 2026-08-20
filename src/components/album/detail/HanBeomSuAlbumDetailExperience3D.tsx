import { Canvas, createPortal, useFrame, useLoader, useThree } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import { Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
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
const PAGE_TURN_DURATION = 0.98;
const BOOKLET_EDGE_INSET = 0.003;
const DETAIL_BACKGROUND = {
  desktop: { sourceWidth: 3840, sourceHeight: 2160, x: 0.43 },
  mobile: { sourceWidth: 1440, sourceHeight: 2560, x: 0.5 },
} as const;
type PackageDimensions = ReturnType<typeof getPackageDimensions>;
type TransformSnapshot = { position: THREE.Vector3; quaternion: THREE.Quaternion; scale: THREE.Vector3 };
type OpeningSnapshot = TransformSnapshot & { hinge: number; cameraZ: number; cameraFov: number; elapsed: number };

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
    texture.anisotropy = maxAnisotropy;
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

function TurningPaperMaterial({ texture, side }: { texture: THREE.Texture; side: THREE.Side }) {
  return <meshStandardMaterial
    map={texture}
    color="#ffffff"
    metalness={0}
    roughness={0.94}
    side={side}
  />;
}

function CdDisc({ label, mode, playing, reduced, trayAnchor, onPlayer, onMotion }: {
  label: THREE.Texture; mode: ExperienceMode; playing: boolean; reduced: boolean; onPlayer(): void; onMotion(settled: boolean, docked: boolean): void;
  trayAnchor: React.RefObject<THREE.Group | null>;
}) {
  const rig = useRef<THREE.Group>(null);
  const tilt = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const { scene, size, viewport } = useThree();
  const velocity = useRef(0);
  const tiltTarget = useRef({ x: 0, y: 0 });
  const tiltDrag = useRef<{ id: number; x: number; y: number } | null>(null);
  const CD_THICKNESS = CD_RADIUS * 0.012;
  const trayPosition = useMemo(() => new THREE.Vector3(), []);
  const trayQuaternion = useMemo(() => new THREE.Quaternion(), []);
  const trayScale = useMemo(() => new THREE.Vector3(), []);
  const docked = useRef(mode !== 'PLAYER_FOCUS');
  useLayoutEffect(() => {
    if (!rig.current || !trayAnchor.current) return;
    trayAnchor.current.updateWorldMatrix(true, false);
    trayAnchor.current.matrixWorld.decompose(rig.current.position, rig.current.quaternion, rig.current.scale);
  }, [trayAnchor]);
  useFrame((_, delta) => {
    if (!rig.current || !trayAnchor.current) return;
    const ease = reduced ? 1 : 1 - Math.exp(-7 * delta);
    const player = mode === 'PLAYER_FOCUS';
    if (player) docked.current = false;
    const playerPosition = new THREE.Vector3(size.width <= 700 ? 0 : -1.55, size.width <= 700 ? viewport.height * 0.16 : 0.08, 0.34);
    trayAnchor.current.updateWorldMatrix(true, false);
    trayAnchor.current.matrixWorld.decompose(trayPosition, trayQuaternion, trayScale);
    const targetPosition = player ? playerPosition : trayPosition;
    const targetQuaternion = player ? new THREE.Quaternion() : trayQuaternion;
    const playerScale = size.width <= 700 ? viewport.width * 0.7 / (CD_RADIUS * 2) : JI_PLAYER_TARGET_RADIUS / CD_RADIUS;
    const targetScale = player ? playerScale : trayScale.x;
    if (docked.current && !player) {
      rig.current.position.copy(trayPosition);
      rig.current.quaternion.copy(trayQuaternion);
      rig.current.scale.copy(trayScale);
    } else {
      rig.current.position.lerp(targetPosition, ease);
      rig.current.quaternion.slerp(targetQuaternion, ease);
      const scale = THREE.MathUtils.lerp(rig.current.scale.x, targetScale, ease);
      rig.current.scale.setScalar(scale);
    }
    velocity.current = THREE.MathUtils.lerp(velocity.current, playing && !reduced ? Math.PI / 9 : 0, 1 - Math.exp(-3 * delta));
    if (spin.current) spin.current.rotation.z -= velocity.current * delta;
    if (tilt.current) {
      if (mode !== 'PLAYER_FOCUS') tiltTarget.current = { x: 0, y: 0 };
      const tiltEase = reduced ? 1 : 1 - Math.exp(-10 * delta);
      tilt.current.rotation.x = THREE.MathUtils.lerp(tilt.current.rotation.x, tiltTarget.current.x, tiltEase);
      tilt.current.rotation.y = THREE.MathUtils.lerp(tilt.current.rotation.y, tiltTarget.current.y, tiltEase);
    }
    const transformError = rig.current.position.distanceTo(targetPosition)
      + rig.current.quaternion.angleTo(targetQuaternion)
      + Math.abs(rig.current.scale.x - targetScale);
    if (!player && !docked.current && transformError < 0.008) {
      docked.current = true;
      rig.current.position.copy(trayPosition);
      rig.current.quaternion.copy(trayQuaternion);
      rig.current.scale.copy(trayScale);
    }
    onMotion(docked.current || transformError < 0.015, docked.current);
  });
  return createPortal(
    <group ref={rig} onClick={(event) => {
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
    </group>,
    scene,
  );
}

function TrayRig({ texture, label, dimensions, layout, mode, playing, reduced, onPlayer, onSettled, onDiscMotion }: {
  texture: THREE.Texture; label: THREE.Texture; dimensions: PackageDimensions; layout: ReturnType<typeof getPackageLayout>; mode: ExperienceMode; playing: boolean; reduced: boolean;
  onPlayer(): void; onSettled(settled: boolean): void; onDiscMotion(settled: boolean, docked: boolean): void;
}) {
  const cdTrayAnchor = useRef<THREE.Group>(null);
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
      <group>
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
        <group ref={cdTrayAnchor} position={[0, 0, layout.cdMountZ]} />
      </group>
    </group>
    <CdDisc label={label} trayAnchor={cdTrayAnchor} mode={mode} playing={playing} reduced={reduced} onPlayer={onPlayer} onMotion={onDiscMotion} />
    </>
  );
}

type PageTurn = { key: number; source: number; target: number; direction: -1 | 1 };

function BookletPages({ album, page, mobile, reduced, active, onReady, onPageTurnStart, onPageTurnComplete, onPrevious, onNext }: {
  album: Album; page: number; mobile: boolean; reduced: boolean; active: boolean;
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
  return (
    <group>
      <mesh position={[-width / 2, 0, leftStackZ]} castShadow receiveShadow><planeGeometry args={[width, PAGE_HEIGHT, 16, 2]} /><PaperMaterial texture={left} /></mesh>
      <mesh position={[width / 2, 0, 0]} castShadow receiveShadow onClick={active ? (event) => { event.stopPropagation(); onNext(); } : undefined}><planeGeometry args={[width, PAGE_HEIGHT, 16, 2]} /><PaperMaterial texture={right} /></mesh>
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
      mesh.geometry.computeVertexNormals();
    });
    if (t === 1 && !done.current) { done.current = true; onDone(); }
  });
  return (
    <group position={[0, 0, 0.025]}>
      <mesh ref={(node) => { frontSurface.current = node; if (node && !node.geometry.userData.original) node.geometry.userData.original = Float32Array.from(Array.from({ length: node.geometry.attributes.position.count }, (_, i) => (node.geometry.attributes.position as THREE.BufferAttribute).getX(i))); }} castShadow frustumCulled={false}>
        <planeGeometry args={[width, PAGE_HEIGHT, 28, 3]} /><TurningPaperMaterial texture={front} side={THREE.FrontSide} />
      </mesh>
      <mesh ref={(node) => { backSurface.current = node; if (node && !node.geometry.userData.original) { node.geometry.userData.original = Float32Array.from(Array.from({ length: node.geometry.attributes.position.count }, (_, i) => (node.geometry.attributes.position as THREE.BufferAttribute).getX(i))); const uv = node.geometry.attributes.uv as THREE.BufferAttribute; for (let i = 0; i < uv.count; i += 1) uv.setX(i, 1 - uv.getX(i)); uv.needsUpdate = true; } }} position={[0, 0, -0.002]} castShadow frustumCulled={false}>
        <planeGeometry args={[width, PAGE_HEIGHT, 28, 3]} /><TurningPaperMaterial texture={back} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}


function BookletRig({ album, p1, mountAnchor, mode, page, bookletPhase, mobile, reduced, onBooklet, onSettled, onPhaseChange, onPageTurnStart, onPageTurnComplete, onPrevious, onNext, onBounds }: {
  album: Album; p1: THREE.Texture; mountAnchor: React.RefObject<THREE.Group | null>; mode: ExperienceMode; page: number; mobile: boolean; reduced: boolean;
  bookletPhase: BookletVisualPhase;
  onBooklet(): void; onSettled(settled: boolean): void; onPageTurnComplete(): void; onPrevious(): void; onNext(): void;
  onPhaseChange?(phase: BookletVisualPhase): void; onPageTurnStart(direction: 'forward' | 'backward'): void;
  onBounds?(bounds: BookletBounds): void;
}) {
  const { camera, gl, scene, size, viewport } = useThree();
  const rig = useRef<THREE.Group>(null);
  const detailsReady = useRef(false);
  const lastBounds = useRef<BookletBounds | null>(null);
  const p1Width = PAGE_HEIGHT * textureAspect(p1);
  const mountPosition = useMemo(() => new THREE.Vector3(), []);
  const mountQuaternion = useMemo(() => new THREE.Quaternion(), []);
  const mountScale = useMemo(() => new THREE.Vector3(), []);
  const readerPosition = useMemo(() => new THREE.Vector3(), []);
  const readerQuaternion = useMemo(() => new THREE.Quaternion(), []);
  const readerScale = useMemo(() => new THREE.Vector3(), []);

  useLayoutEffect(() => {
    if (!rig.current || !mountAnchor.current) return;
    mountAnchor.current.updateWorldMatrix(true, false);
    mountAnchor.current.matrixWorld.decompose(rig.current.position, rig.current.quaternion, rig.current.scale);
  }, [mountAnchor]);

  useFrame((_, delta) => {
    if (!rig.current || !mountAnchor.current) return;
    mountAnchor.current.updateWorldMatrix(true, false);
    mountAnchor.current.matrixWorld.decompose(mountPosition, mountQuaternion, mountScale);
    const reading = bookletPhase === 'ENTERING' || bookletPhase === 'READING'
      || bookletPhase === 'TURNING_FORWARD' || bookletPhase === 'TURNING_BACKWARD';
    const returning = bookletPhase === 'RETURNING_MOVE';
    const desiredPosition = readerPosition.set(0, mobile ? 0.35 : 0.08, 0.82);
    const focusViewport = viewport.getCurrentViewport(camera, desiredPosition);
    const focusScale = Math.min(
      focusViewport.width * (mobile ? 0.95 : 0.93) / (p1Width * (mobile ? 1 : 2)),
      focusViewport.height * (mobile ? 0.91 : 0.94) / PAGE_HEIGHT,
    ) * 0.9;
    readerQuaternion.setFromEuler(new THREE.Euler(mobile ? -0.04 : 0, 0, 0));
    readerScale.setScalar(focusScale);
    const targetPosition = reading ? readerPosition : mountPosition;
    const targetQuaternion = reading ? readerQuaternion : mountQuaternion;
    const targetScale = reading ? readerScale : mountScale;
    const turning = bookletPhase === 'TURNING_FORWARD' || bookletPhase === 'TURNING_BACKWARD';
    if (bookletPhase === 'RESTING' || bookletPhase === 'RETURNING_FINISH') {
      rig.current.position.copy(mountPosition);
      rig.current.quaternion.copy(mountQuaternion);
      rig.current.scale.copy(mountScale);
    } else if (!turning) {
      const ease = reduced ? 1 : 1 - Math.exp(-5.5 * delta);
      rig.current.position.lerp(targetPosition, ease);
      rig.current.quaternion.slerp(targetQuaternion, ease);
      rig.current.scale.lerp(targetScale, ease);
    }
    const transformError = rig.current.position.distanceTo(targetPosition)
      + rig.current.quaternion.angleTo(targetQuaternion) + rig.current.scale.distanceTo(targetScale);
    if (bookletPhase === 'ENTERING' && detailsReady.current && transformError < 0.025) onPhaseChange?.('READING');
    if (returning && transformError < 0.025) onPhaseChange?.('RETURNING_FINISH');
    if (bookletPhase === 'RETURNING_FINISH') onPhaseChange?.('RESTING');
    onSettled((bookletPhase === 'RESTING' || bookletPhase === 'READING') && transformError < 0.025);

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
  });

  const showPages = bookletPhase !== 'RESTING' && bookletPhase !== 'RETURNING_FINISH';
  const showCover = bookletPhase === 'RESTING' || bookletPhase === 'ENTERING' || bookletPhase === 'RETURNING_FINISH';
  return createPortal(
    <group ref={rig} onClick={(event) => { event.stopPropagation(); if (mode === 'ALBUM_OPEN') onBooklet(); }}>
      {showPages && <Suspense fallback={null}><BookletPages album={album} page={page} mobile={mobile} reduced={reduced} active={mode === 'BOOKLET_FOCUS'} onReady={() => { detailsReady.current = true; }} onPageTurnStart={onPageTurnStart} onPageTurnComplete={onPageTurnComplete} onPrevious={onPrevious} onNext={onNext} /></Suspense>}
      {showCover && <mesh position={[p1Width / 2, 0, 0.035]} castShadow><planeGeometry args={[p1Width, PAGE_HEIGHT]} /><PaperMaterial texture={p1} /></mesh>}
    </group>,
    scene,
  );
}

function FrontInterior({ album, dimensions, mode, page, bookletPhase, mobile, reduced, onBooklet, onSettled, onPhaseChange, onPageTurnStart, onPageTurnComplete, onPrevious, onNext, onBounds }: {
  album: Album; dimensions: PackageDimensions; mode: ExperienceMode; page: number; mobile: boolean; reduced: boolean;
  bookletPhase: BookletVisualPhase;
  onBooklet(): void; onSettled(settled: boolean): void; onPageTurnComplete(): void; onPrevious(): void; onNext(): void; onBounds?(bounds: BookletBounds): void;
  onPhaseChange?(phase: BookletVisualPhase): void; onPageTurnStart(direction: 'forward' | 'backward'): void;
}) {
  const textures = useInteriorTextures(album);
  const bookletMountAnchor = useRef<THREE.Group>(null);
  return <>
    <mesh position={[0, 0, -COVER_DEPTH / 2 - SURFACE_OFFSET]} rotation={[0, Math.PI, 0]} receiveShadow><planeGeometry args={[dimensions.frontWidth, dimensions.frontHeight]} /><PaperMaterial texture={textures.interiorBooklet} /></mesh>
    <group ref={bookletMountAnchor} position={[0, 0, 0.064]} rotation={[0, Math.PI, 0]} />
    <BookletRig album={album} p1={textures.p1} mountAnchor={bookletMountAnchor} mode={mode} page={page} bookletPhase={bookletPhase} mobile={mobile} reduced={reduced} onBooklet={onBooklet} onSettled={onSettled} onPhaseChange={onPhaseChange} onPageTurnStart={onPageTurnStart} onPageTurnComplete={onPageTurnComplete} onPrevious={onPrevious} onNext={onNext} onBounds={onBounds} />
  </>;
}

function TrayInterior({ album, dimensions, layout, mode, playing, reduced, onPlayer, onSettled, onDiscMotion, onPrewarmReady }: {
  album: Album; dimensions: PackageDimensions; layout: ReturnType<typeof getPackageLayout>; mode: ExperienceMode; playing: boolean; reduced: boolean;
  onPlayer(): void; onSettled(settled: boolean): void; onDiscMotion(settled: boolean, docked: boolean): void;
  onPrewarmReady?(): void;
}) {
  const textures = useInteriorTextures(album);
  return <><TrayRig texture={textures.interiorTray} label={textures.cdLabel} dimensions={dimensions} layout={layout} mode={mode} playing={playing} reduced={reduced} onPlayer={onPlayer} onSettled={onSettled} onDiscMotion={onDiscMotion} /><PrewarmReady onReady={onPrewarmReady} /></>;
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
  const yawPitch = useRef(readHanRotation({ x: -0.06, y: 0.1 }));
  const autoRotate = useRef(true);
  const persistFrame = useRef(0);
  const previousMode = useRef(mode);
  const reported = useRef(false);
  const bookletSettled = useRef(mode === 'CLOSED');
  const traySettled = useRef(true);
  const discSettled = useRef(true);
  const discDocked = useRef(mode !== 'PLAYER_FOCUS');
  const openingSnapshot = useRef<OpeningSnapshot | null>(null);
  const awaitingDiscDock = useRef(false);
  const targetQuaternion = useMemo(() => new THREE.Quaternion(), []);
  const setBookletSettled = useCallback((value: boolean) => { bookletSettled.current = value; }, []);
  const setTraySettled = useCallback((value: boolean) => { traySettled.current = value; }, []);
  const setDiscMotion = useCallback((settled: boolean, docked: boolean) => {
    discSettled.current = settled;
    discDocked.current = docked;
  }, []);
  const keepInternalsClosed = openingFromClosed;
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
      yawPitch.current = { x: 0, y: 0 };
      return;
    }
    if (homeActivationKey > 0) autoRotate.current = !reduced;
  }, [homeActivationKey, prewarming, reduced]);

  useLayoutEffect(() => {
    const was = previousMode.current;
    if (mode === 'PLAYER_FOCUS' && was !== 'PLAYER_FOCUS') {
      discSettled.current = false;
      discDocked.current = false;
    }
    if (was === 'PLAYER_FOCUS' && mode === 'ALBUM_OPEN') {
      awaitingDiscDock.current = true;
      discSettled.current = false;
      discDocked.current = false;
    }
    if (was === 'CLOSED' && mode === 'ALBUM_OPEN' && packageRig.current && hinge.current) {
      autoRotate.current = false;
      yawPitch.current = { x: openPitch, y: 0 };
      openingSnapshot.current = {
        position: packageRig.current.position.clone(),
        quaternion: packageRig.current.quaternion.clone(),
        scale: packageRig.current.scale.clone(),
        hinge: hinge.current.rotation.y,
        cameraZ: perspectiveCamera.current.position.z,
        cameraFov: perspectiveCamera.current.fov,
        elapsed: 0,
      };
    }
    reported.current = false;
    onTransitionChange?.(true);
    previousMode.current = mode;
  }, [mode, onTransitionChange, openPitch]);

  useFrame((_, delta) => {
    if (!packageRig.current || !hinge.current) return;
    const rig = packageRig.current;
    const detailClosedX = mobile ? closedX : -viewport.width * 0.18;
    if (prewarming) {
      rig.position.set(detailClosedX, closedY, 0);
      rig.quaternion.identity();
      rig.scale.setScalar(mobile ? 0.48 : 1.18);
      hinge.current.rotation.y = 0;
      perspectiveCamera.current.position.z = 7;
      perspectiveCamera.current.fov = 42;
      perspectiveCamera.current.updateProjectionMatrix();
      yawPitch.current = { x: 0, y: 0 };
      return;
    }
    const closed = mode === 'CLOSED';
    if (closed && autoRotate.current && !reduced) yawPitch.current.y += delta * Math.PI / 11;
    persistFrame.current += 1;
    if (closed && persistFrame.current % 12 === 0) sessionStorage.setItem(HAN_ROTATION_KEY, JSON.stringify(yawPitch.current));

    const mobileClosedScale = 0.48;
    const mobileOpenScale = viewport.width * 0.9 / (packageDimensions.frontWidth * 1.94);
    const openScale = mobile ? mobileOpenScale : (PACKAGE_PANEL * 1.08) / packageDimensions.frontHeight;
    const closedScale = mobile ? mobileClosedScale : detailActive ? 1.18 : 0.7;
    const closedTargetX = detailActive ? detailClosedX : closedX;
    const openPosition = new THREE.Vector3(halfPanel, mobile ? viewport.height * 0.1 : -0.08, 0);
    const openQuaternion = targetQuaternion.identity();
    const snapshot = openingSnapshot.current;
    if (snapshot) {
      snapshot.elapsed = reduced ? 1.6 : Math.min(1.6, snapshot.elapsed + delta);
      const progress = snapshot.elapsed / 1.6;
      const transformProgress = THREE.MathUtils.smoothstep(Math.min(progress / 0.65, 1), 0, 1);
      const hingeProgress = THREE.MathUtils.smoothstep(Math.max(0, (progress - 0.35) / 0.65), 0, 1);
      rig.position.lerpVectors(snapshot.position, openPosition, transformProgress);
      rig.quaternion.copy(snapshot.quaternion).slerp(openQuaternion, transformProgress);
      rig.scale.lerpVectors(snapshot.scale, new THREE.Vector3(openScale, openScale, openScale), transformProgress);
      hinge.current.rotation.y = THREE.MathUtils.lerp(snapshot.hinge, OPEN_ANGLE, hingeProgress);
      perspectiveCamera.current.position.z = THREE.MathUtils.lerp(snapshot.cameraZ, 7, transformProgress);
      perspectiveCamera.current.fov = THREE.MathUtils.lerp(snapshot.cameraFov, 42, transformProgress);
      perspectiveCamera.current.updateProjectionMatrix();
      if (progress >= 1) openingSnapshot.current = null;
      return;
    }

    const ease = reduced ? 1 : 1 - Math.exp(-5 * delta);
    const targetCameraZ = detailActive ? 7 : 5;
    const targetFov = detailActive ? 42 : 36;
    perspectiveCamera.current.position.z = THREE.MathUtils.lerp(perspectiveCamera.current.position.z, targetCameraZ, ease);
    perspectiveCamera.current.fov = THREE.MathUtils.lerp(perspectiveCamera.current.fov, targetFov, ease);
    perspectiveCamera.current.updateProjectionMatrix();

    targetQuaternion.setFromEuler(new THREE.Euler(yawPitch.current.x, yawPitch.current.y, 0));
    rig.quaternion.slerp(targetQuaternion, ease);
    hinge.current.rotation.y = THREE.MathUtils.lerp(hinge.current.rotation.y, closed ? 0 : OPEN_ANGLE, ease);

    if (awaitingDiscDock.current && discDocked.current) awaitingDiscDock.current = false;
    const playerRetreated = !mobile && ((mode === 'PLAYER_FOCUS' && discSettled.current) || awaitingDiscDock.current);
    const targetPosition = closed
      ? new THREE.Vector3(closedTargetX, closedY, 0)
      : new THREE.Vector3(halfPanel, mobile ? viewport.height * 0.1 : -0.08, playerRetreated ? -2.5 : 0);
    const targetScale = closed ? closedScale : openScale;
    rig.position.lerp(targetPosition, ease);
    rig.scale.setScalar(THREE.MathUtils.lerp(rig.scale.x, targetScale, ease));

    const packageError = rig.position.distanceTo(targetPosition) + Math.abs(rig.scale.x - targetScale) + rig.quaternion.angleTo(targetQuaternion);
    const hingeError = Math.abs(hinge.current.rotation.y - (closed ? 0 : OPEN_ANGLE));
    const cameraError = Math.abs(perspectiveCamera.current.position.z - targetCameraZ) + Math.abs(perspectiveCamera.current.fov - targetFov);
    const complete = packageError < 0.04 && hingeError < 0.025 && cameraError < 0.025
      && bookletSettled.current && traySettled.current && discSettled.current;
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
        yawPitch.current.y = THREE.MathUtils.clamp(yawPitch.current.y + (event.clientX - active.x) * 0.0035, -THREE.MathUtils.degToRad(10), THREE.MathUtils.degToRad(10));
        yawPitch.current.x = THREE.MathUtils.clamp(yawPitch.current.x + (event.clientY - active.y) * 0.003, openPitch - THREE.MathUtils.degToRad(6), openPitch + THREE.MathUtils.degToRad(6));
      } else {
        yawPitch.current.y += (event.clientX - active.x) * 0.008;
        yawPitch.current.x = THREE.MathUtils.clamp(yawPitch.current.x + (event.clientY - active.y) * 0.006, -0.48, 0.48);
      }
    }
    active.x = event.clientX; active.y = event.clientY;
  };
  return (
    <>
      <group ref={packageRig} position={[closedX, closedY, 0]} scale={mobile ? 0.48 : 0.7}
        onPointerDown={down} onPointerMove={move} onPointerUp={(event) => finish(event.pointerId, true)} onPointerCancel={(event) => finish(event.pointerId, false)}>
        <mesh castShadow><boxGeometry args={[packageDimensions.trayWidth, packageDimensions.trayHeight, packageDimensions.trayDepth]} /><HanOuterPlasticMaterial /></mesh>
        <mesh position={[0, 0, -(packageDimensions.trayDepth / 2 + COVER_DEPTH / 2)]} material={outerMaterials.back} castShadow><boxGeometry args={[packageDimensions.backWidth, packageDimensions.backHeight, COVER_DEPTH]} /></mesh>
        {detailActive && <Suspense fallback={null}><TrayInterior album={album} dimensions={packageDimensions} layout={layout} mode={keepInternalsClosed ? 'CLOSED' : mode} playing={playing} reduced={reduced} onPlayer={onPlayer} onSettled={setTraySettled} onDiscMotion={setDiscMotion} onPrewarmReady={onPrewarmReady} /></Suspense>}
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
