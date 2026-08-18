import { Canvas, createPortal, useFrame, useLoader, useThree } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import type { Album } from '../../../data/albums';
import { assetUrl } from '../../../utils/assetUrl';
import { JI_SPINE_RATIO, PACKAGE_PANEL, readPackageRotation } from '../packageGeometry';

export type ExperienceMode = 'CLOSED' | 'ALBUM_OPEN' | 'BOOKLET_FOCUS' | 'PLAYER_FOCUS';

type ExperienceProps = {
  album: Album;
  backgroundSize: { width: number; height: number };
  openingFromClosed: boolean;
  mode: ExperienceMode;
  page: number;
  mobile: boolean;
  playing: boolean;
  reduced: boolean;
  onOpen(): void;
  onBooklet(): void;
  onPlayer(): void;
  onPrevious(): void;
  onNext(): void;
  onCdAnchor?(anchor: { x: number; y: number }): void;
  onTransitionChange?(transitioning: boolean): void;
  onPageTurnComplete?(): void;
};

type CoreTextures = {
  front: THREE.Texture;
  back: THREE.Texture;
  spine: THREE.Texture;
  interiorBooklet: THREE.Texture;
  interiorTray: THREE.Texture;
  cdLabel: THREE.Texture;
  p1: THREE.Texture;
};

const PANEL = PACKAGE_PANEL;
const PANEL_WIDTH = PANEL * 3000 / 2686;
const HALF_PANEL = PANEL_WIDTH / 2;
const PACKAGE_DEPTH = PANEL * JI_SPINE_RATIO;
const HALF_PACKAGE_DEPTH = PACKAGE_DEPTH / 2;
const PAPER_THICKNESS = 0.028;
const SURFACE_OFFSET = 0.001;
const FRONT_PANEL_CENTER_Z = HALF_PACKAGE_DEPTH - PAPER_THICKNESS / 2;
const BACK_PANEL_CENTER_Z = -FRONT_PANEL_CENTER_Z;
// Negative Y brings the cover toward the viewer before it settles to the left.
const OPEN_ANGLE = THREE.MathUtils.degToRad(-160);
// Repository exports establish the trim ratios: booklet pages sit just inside
// the cover, while a pressed CD occupies 90% of the panel height.
const PAGE_HEIGHT = PANEL * 0.92;
const CD_RADIUS = PANEL * 0.45;
const PAGE_TURN_DURATION = 0.86;
const DETAIL_BACKGROUND = {
  desktop: { sourceWidth: 3840, sourceHeight: 2160, x: 1369 / 3840 },
  mobile: { sourceWidth: 1440, sourceHeight: 2560, x: 720 / 1440 },
} as const;
type OpeningPhase = 'IDLE' | 'ALIGN_CLOSED' | 'POSITION_FOR_OPEN' | 'HINGE_OPEN';

function configureTextures(textures: THREE.Texture[], maxAnisotropy: number) {
  textures.forEach((texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(8, maxAnisotropy);
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.generateMipmaps = true;
    texture.needsUpdate = true;
  });
}

function textureAspect(texture: THREE.Texture) {
  const image = texture.image as { width?: number; height?: number } | undefined;
  return image?.width && image?.height ? image.width / image.height : 1;
}

function useCoreTextures(album: Album): CoreTextures {
  const { gl } = useThree();
  const hero = album.albumHero!;
  const detail = album.detailExperience!;
  const urls = [
    hero.textures.front!, hero.textures.back!, hero.textures.spineLeft!,
    detail.interior.bookletPanel, detail.interior.trayPanel, album.cdLabelImage!,
    album.booklet!.previewImages[0].src,
  ].map((url) => assetUrl(url)!);
  const loaded = useLoader(THREE.TextureLoader, urls) as THREE.Texture[];
  useMemo(() => configureTextures(loaded, gl.capabilities.getMaxAnisotropy()), [gl, loaded]);
  return {
    front: loaded[0], back: loaded[1], spine: loaded[2], interiorBooklet: loaded[3],
    interiorTray: loaded[4], cdLabel: loaded[5], p1: loaded[6],
  };
}

function PaperMaterial({ texture }: { texture: THREE.Texture }) {
  return <meshBasicMaterial map={texture} toneMapped={false} />;
}

function CdDisc({ label, mode, playing, reduced, onPlayer, onSettled, onAnchor }: {
  label: THREE.Texture; mode: ExperienceMode; playing: boolean; reduced: boolean; onPlayer(): void; onSettled(settled: boolean): void;
  onAnchor?(anchor: { x: number; y: number }): void;
}) {
  const rig = useRef<THREE.Group>(null);
  const { camera, size } = useThree();
  const lastAnchor = useRef({ x: -1, y: -1 });
  const velocity = useRef(0);
  const discShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.absarc(0, 0, CD_RADIUS, 0, Math.PI * 2);
    const hole = new THREE.Path();
    hole.absarc(0, 0, 0.13, 0, Math.PI * 2);
    shape.holes.push(hole);
    return shape;
  }, []);
  useFrame((_, delta) => {
    if (!rig.current) return;
    const ease = reduced ? 1 : 1 - Math.exp(-7 * delta);
    rig.current.position.z = THREE.MathUtils.lerp(rig.current.position.z, mode === 'PLAYER_FOCUS' ? 0.205 : 0.135, ease);
    const scale = THREE.MathUtils.lerp(rig.current.scale.x, mode === 'PLAYER_FOCUS' ? 1.025 : 1, ease);
    rig.current.scale.setScalar(scale);
    velocity.current = THREE.MathUtils.lerp(velocity.current, playing && !reduced ? Math.PI / 9 : 0, 1 - Math.exp(-3 * delta));
    rig.current.rotation.z -= velocity.current * delta;
    const targetZ = mode === 'PLAYER_FOCUS' ? 0.205 : 0.135;
    const targetScale = mode === 'PLAYER_FOCUS' ? 1.025 : 1;
    onSettled(Math.abs(rig.current.position.z - targetZ) + Math.abs(rig.current.scale.x - targetScale) < 0.015);
    if (mode === 'PLAYER_FOCUS' && onAnchor) {
      const projected = rig.current.getWorldPosition(new THREE.Vector3()).project(camera);
      const anchor = { x: (projected.x * 0.5 + 0.5) * size.width, y: (-projected.y * 0.5 + 0.5) * size.height };
      if (Math.abs(anchor.x - lastAnchor.current.x) + Math.abs(anchor.y - lastAnchor.current.y) > 0.5) {
        lastAnchor.current = anchor;
        onAnchor(anchor);
      }
    }
  });
  return (
    <group ref={rig} position={[0, 0, 0.135]} onClick={(event) => {
      event.stopPropagation();
      if (mode === 'ALBUM_OPEN') onPlayer();
    }}>
      <mesh castShadow>
        <extrudeGeometry args={[discShape, { depth: 0.014, bevelEnabled: false, curveSegments: 64 }]} />
        <meshStandardMaterial color="#e4e2dc" metalness={0} roughness={0.52} />
      </mesh>
      <mesh position={[0, 0, 0.016]} castShadow>
        <ringGeometry args={[0.155, CD_RADIUS - 0.06, 64]} />
        <meshBasicMaterial map={label} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, 0.017]}>
        <ringGeometry args={[CD_RADIUS - 0.06, CD_RADIUS, 64]} />
        <meshPhysicalMaterial color="#eeeae1" transparent opacity={0.62} roughness={0.65} depthWrite />
      </mesh>
      <mesh position={[0, 0, 0.018]}>
        <ringGeometry args={[0.13, 0.155, 64]} />
        <meshPhysicalMaterial color="#eeeae1" transparent opacity={0.62} roughness={0.65} depthWrite />
      </mesh>
    </group>
  );
}

function TrayRig({ back, texture, label, mode, playing, reduced, onPlayer, onSettled, onDiscSettled, onCdAnchor }: {
  back: THREE.Texture; texture: THREE.Texture; label: THREE.Texture; mode: ExperienceMode; playing: boolean; reduced: boolean;
  onPlayer(): void; onSettled(settled: boolean): void; onDiscSettled(settled: boolean): void; onCdAnchor?(anchor: { x: number; y: number }): void;
}) {
  const rig = useRef<THREE.Group>(null);
  const trayContext = useRef<THREE.Group>(null);
  const contextFactor = mode === 'PLAYER_FOCUS' ? 0 : mode === 'BOOKLET_FOCUS' ? 0.48 : 1;
  useFrame((_, delta) => {
    if (!rig.current) return;
    const ease = reduced ? 1 : 1 - Math.exp(-7 * delta);
    // The complete internal stack remains behind the front cover until the
    // hinge exposes it; this is physical occlusion rather than a visibility pop.
    const closedInternalZ = HALF_PACKAGE_DEPTH - 0.21 - SURFACE_OFFSET;
    rig.current.position.z = THREE.MathUtils.lerp(rig.current.position.z, mode === 'CLOSED' ? closedInternalZ : 0, ease);
    if (trayContext.current) {
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
    }
    const contextError = trayContext.current
      ? Math.abs(trayContext.current.scale.x - (mode === 'PLAYER_FOCUS' ? 0.94 : 1))
        + Math.abs(trayContext.current.position.y - (mode === 'PLAYER_FOCUS' ? -0.08 : 0))
        + Math.abs(((trayContext.current.children[0] as THREE.Mesh).material as THREE.Material & { opacity: number }).opacity - 0.5 * contextFactor)
      : 1;
    onSettled(Math.abs(rig.current.position.z - (mode === 'CLOSED' ? closedInternalZ : 0)) < 0.012 && contextError < 0.018);
  });
  return (
    <group position={[HALF_PANEL, 0, 0]}>
      <mesh position={[0, 0, BACK_PANEL_CENTER_Z]} castShadow receiveShadow>
        <boxGeometry args={[PANEL_WIDTH, PANEL, PAPER_THICKNESS]} />
        <meshStandardMaterial color="#d8d1c5" roughness={0.94} />
      </mesh>
      <mesh position={[0, 0, -HALF_PACKAGE_DEPTH - SURFACE_OFFSET]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[PANEL_WIDTH * 0.98, PANEL * 0.98]} />
        <PaperMaterial texture={back} />
      </mesh>
      <mesh position={[0, 0, BACK_PANEL_CENTER_Z + PAPER_THICKNESS / 2 + SURFACE_OFFSET]} receiveShadow><planeGeometry args={[PANEL_WIDTH * 0.98, PANEL * 0.98]} /><PaperMaterial texture={texture} /></mesh>
      <group ref={rig} position={[0, 0, mode === 'CLOSED' ? HALF_PACKAGE_DEPTH - 0.21 - SURFACE_OFFSET : 0]}>
        <group ref={trayContext}>
        <mesh position={[0, 0, 0.045]} receiveShadow userData={{ baseOpacity: 0.5 }}>
          <boxGeometry args={[PANEL_WIDTH * 0.95, PANEL * 0.95, 0.028]} />
          <meshPhysicalMaterial color="#dedbd2" transparent opacity={0.5} roughness={0.88} metalness={0} clearcoat={0.04} depthWrite />
        </mesh>
        <mesh position={[0, 0, 0.082]} receiveShadow userData={{ baseOpacity: 0.58 }}>
          <ringGeometry args={[CD_RADIUS, PANEL * 0.475, 64]} />
          <meshStandardMaterial color="#d9d5cc" transparent opacity={0.58} roughness={0.8} />
        </mesh>
        <mesh position={[0, 0, 0.09]} userData={{ baseOpacity: 0.09 }}><ringGeometry args={[0.18, CD_RADIUS - 0.04, 64]} /><meshStandardMaterial color="#e4e0d7" transparent opacity={0.09} roughness={0.85} /></mesh>
        <mesh position={[0, 0, 0.105]} rotation={[Math.PI / 2, 0, 0]} castShadow userData={{ baseOpacity: 0.62 }}>
          <cylinderGeometry args={[0.16, 0.145, 0.045, 32]} />
          <meshStandardMaterial color="#d8d4ca" transparent opacity={0.62} roughness={0.75} />
        </mesh>
        </group>
        <CdDisc label={label} mode={mode} playing={playing} reduced={reduced} onPlayer={onPlayer} onSettled={onDiscSettled} onAnchor={onCdAnchor} />
      </group>
    </group>
  );
}

type PageTurn = { key: number; source: number; target: number; direction: -1 | 1 };

function BookletPages({ album, page, mobile, reduced, active, returning, mobileReaderReady, resetToken, coverNode, onReady, onPageTurnComplete, onReturnPagesComplete, onPrevious, onNext }: {
  album: Album; page: number; mobile: boolean; reduced: boolean; coverNode: THREE.Group | null;
  active: boolean; returning: boolean; mobileReaderReady: boolean; resetToken: number;
  onPrevious(): void; onNext(): void;
  onReady(): void; onPageTurnComplete(): void; onReturnPagesComplete(): void;
}) {
  const { gl } = useThree();
  const urls = album.booklet!.previewImages.slice(1).map(({ src }) => assetUrl(src)!);
  const pages = useLoader(THREE.TextureLoader, urls) as THREE.Texture[];
  useMemo(() => configureTextures(pages, gl.capabilities.getMaxAnisotropy()), [gl, pages]);
  const aspect = textureAspect(pages[0]);
  const width = PAGE_HEIGHT * aspect;
  const previous = useRef(page);
  const [settled, setSettled] = useState(page);
  const [turn, setTurn] = useState<PageTurn | null>(null);
  useEffect(onReady, [onReady]);
  useEffect(() => {
    if (resetToken === 0) return;
    queueMicrotask(() => {
      previous.current = 0;
      setSettled(0);
      setTurn(null);
    });
  }, [resetToken]);
  useEffect(() => {
    if (!active) return;
    if (previous.current === page) return;
    const source = previous.current;
    previous.current = page;
    if (reduced) { queueMicrotask(() => { setSettled(page); onPageTurnComplete(); }); return; }
    setTurn({ key: Date.now(), source, target: page, direction: page > source ? 1 : -1 });
  }, [active, onPageTurnComplete, page, reduced]);
  useEffect(() => {
    if (!returning) return;
    // Collapse the current composition at once instead of replaying every
    // previously viewed spread in reverse.
    queueMicrotask(() => {
      previous.current = 0;
      setSettled(0);
      setTurn(null);
      onReturnPagesComplete();
    });
  }, [onReturnPagesComplete, returning]);
  const completeTurn = () => {
    if (!turn) return;
    previous.current = turn.target;
    setSettled(turn.target);
    setTurn(null);
    onPageTurnComplete();
  };
  const p2Back = coverNode ? createPortal(
    <mesh position={[width / 2, 0, -0.002]} rotation={[0, Math.PI, 0]} castShadow>
      <planeGeometry args={[width, PAGE_HEIGHT, 16, 2]} />
      <meshStandardMaterial map={pages[0]} roughness={0.94} side={THREE.FrontSide} />
    </mesh>,
    coverNode,
  ) : null;
  if (mobile) {
    const base = pages[turn ? turn.target : settled];
    return <>
      {p2Back}
      {mobileReaderReady && <mesh castShadow receiveShadow><planeGeometry args={[PAGE_HEIGHT * textureAspect(base), PAGE_HEIGHT, 16, 2]} /><PaperMaterial texture={base} /></mesh>}
      {mobileReaderReady && turn && <MobileTurningPage key={turn.key} source={pages[turn.source]} target={pages[turn.target]} width={width} direction={turn.direction} duration={returning ? 0.42 : PAGE_TURN_DURATION} onDone={completeTurn} />}
    </>;
  }
  const spreads = [[pages[0], pages[1]], [pages[2], pages[3]], [pages[4], pages[5]]];
  const source = spreads[turn ? turn.source : settled];
  const target = spreads[turn ? turn.target : settled];
  const left = turn ? (turn.direction > 0 ? source[0] : target[0]) : target[0];
  const right = turn ? (turn.direction > 0 ? target[1] : source[1]) : target[1];
  const leftSpreadIndex = turn
    ? (turn.direction > 0 ? turn.source : turn.target)
    : settled;
  const showStaticLeft = leftSpreadIndex > 0;
  const leftStackZ = 0.006 + leftSpreadIndex * 0.004;
  return (
    <group>
      {p2Back}
      {showStaticLeft && <mesh position={[-width / 2, 0, leftStackZ]} castShadow receiveShadow><planeGeometry args={[width, PAGE_HEIGHT, 16, 2]} /><PaperMaterial texture={left} /></mesh>}
      <mesh position={[width / 2, 0, 0]} castShadow receiveShadow onClick={(event) => { event.stopPropagation(); onNext(); }}><planeGeometry args={[width, PAGE_HEIGHT, 16, 2]} /><PaperMaterial texture={right} /></mesh>
      <mesh position={[-width / 2, 0, leftStackZ + 0.001]} userData={{ keepOpacity: true }} onClick={(event) => { event.stopPropagation(); onPrevious(); }}>
        <planeGeometry args={[width, PAGE_HEIGHT]} /><meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {turn && <TurningPage key={turn.key} pages={pages} width={width} turn={turn} duration={returning ? 0.42 : PAGE_TURN_DURATION} onDone={completeTurn} />}
      <mesh position={[0, 0, 0.012]}><planeGeometry args={[0.025, PAGE_HEIGHT]} /><meshBasicMaterial color="#7a6f65" transparent opacity={0.18} /></mesh>
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
        <planeGeometry args={[width, PAGE_HEIGHT, 28, 3]} /><meshStandardMaterial map={front} roughness={0.96} side={THREE.FrontSide} />
      </mesh>
      <mesh ref={(node) => { backSurface.current = node; if (node && !node.geometry.userData.original) { node.geometry.userData.original = Float32Array.from(Array.from({ length: node.geometry.attributes.position.count }, (_, i) => (node.geometry.attributes.position as THREE.BufferAttribute).getX(i))); const uv = node.geometry.attributes.uv as THREE.BufferAttribute; for (let i = 0; i < uv.count; i += 1) uv.setX(i, 1 - uv.getX(i)); uv.needsUpdate = true; } }} position={[0, 0, -0.002]} castShadow frustumCulled={false}>
        <planeGeometry args={[width, PAGE_HEIGHT, 28, 3]} /><meshStandardMaterial map={back} roughness={0.96} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

function MobileTurningPage({ source, target, width, direction, duration, onDone }: {
  source: THREE.Texture; target: THREE.Texture; width: number; direction: -1 | 1; duration?: number; onDone(): void;
}) {
  const turn: PageTurn = { key: 0, source: 0, target: 0, direction };
  return <TurningPage pages={[]} width={width} turn={turn} frontTexture={source} backTexture={target} duration={duration} onDone={onDone} />;
}

function BookletRig({ album, p1, mode, page, mobile, reduced, onBooklet, onSettled, onPageTurnComplete, onPrevious, onNext }: {
  album: Album; p1: THREE.Texture; mode: ExperienceMode; page: number; mobile: boolean; reduced: boolean;
  onBooklet(): void; onSettled(settled: boolean): void; onPageTurnComplete(): void; onPrevious(): void; onNext(): void;
}) {
  const rig = useRef<THREE.Group>(null);
  const cover = useRef<THREE.Group>(null);
  const [coverNode, setCoverNode] = useState<THREE.Group | null>(null);
  const [detailsMounted, setDetailsMounted] = useState(mode === 'BOOKLET_FOCUS');
  const [detailsReady, setDetailsReady] = useState(false);
  const [mobileReaderReady, setMobileReaderReady] = useState(false);
  const [resetToken, setResetToken] = useState(0);
  const [pagesReturned, setPagesReturned] = useState(false);
  const [coverClosed, setCoverClosed] = useState(false);
  const [returning, setReturning] = useState(false);
  const resetPending = useRef(false);
  const focusElapsed = useRef(0);
  const focusTransformSettled = useRef(false);
  const previousMode = useRef(mode);
  const opacity = useRef(1);
  const p1Width = PAGE_HEIGHT * textureAspect(p1);
  const assignCover = useCallback((node: THREE.Group | null) => {
    cover.current = node;
    setCoverNode(node);
  }, []);
  useEffect(() => {
    if (mode === 'BOOKLET_FOCUS') {
      resetPending.current = true;
      focusElapsed.current = 0;
      focusTransformSettled.current = false;
      queueMicrotask(() => {
        setDetailsMounted(true);
        setMobileReaderReady(false);
        setPagesReturned(false);
        setCoverClosed(false);
        setReturning(false);
      });
    } else if (previousMode.current === 'BOOKLET_FOCUS') {
      queueMicrotask(() => setReturning(true));
    }
    previousMode.current = mode;
  }, [mode]);
  const detailsLoaded = useCallback(() => setDetailsReady(true), []);
  const returnPagesComplete = useCallback(() => setPagesReturned(true), []);
  useFrame((_, delta) => {
    if (!rig.current || !cover.current) return;
    const focused = mode === 'BOOKLET_FOCUS';
    if (focused) focusElapsed.current += reduced ? 1 : delta;
    const holdFocusTransform = focused || (returning && !coverClosed);
    const ease = reduced ? 1 : 1 - Math.exp(-5.5 * delta);
    const targetPosition = new THREE.Vector3(mode === 'PLAYER_FOCUS' ? -p1Width / 2 - 0.16 : -p1Width / 2, 0, mode === 'PLAYER_FOCUS' ? -0.18 : 0.08);
    if (focused && focusElapsed.current < 0.18) targetPosition.z = 0.2;
    const targetQuaternion = new THREE.Quaternion();
    const restingScale = mode === 'PLAYER_FOCUS' ? 0.72 : 1;
    const targetScale = new THREE.Vector3(restingScale, restingScale, restingScale);
    // Lift the closed booklet first; only then carry it to the reader position.
    const movingToFocus = holdFocusTransform && focusElapsed.current >= 0.18;
    if (movingToFocus && rig.current.parent) {
      rig.current.parent.updateWorldMatrix(true, false);
      const desiredWorld = new THREE.Matrix4().compose(
        new THREE.Vector3(0, mobile ? 0.35 : 0.08, 0.82),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(mobile ? -0.04 : -0.08, 0, 0)),
        new THREE.Vector3(mobile ? 1.2 : 1.12, mobile ? 1.2 : 1.12, mobile ? 1.2 : 1.12),
      );
      const local = rig.current.parent.matrixWorld.clone().invert().multiply(desiredWorld);
      local.decompose(targetPosition, targetQuaternion, targetScale);
    }
    rig.current.position.lerp(targetPosition, ease);
    rig.current.quaternion.slerp(targetQuaternion, ease);
    rig.current.scale.lerp(targetScale, ease);
    opacity.current = THREE.MathUtils.lerp(opacity.current, mode === 'PLAYER_FOCUS' ? 0 : 1, ease);
    rig.current.traverse((object) => {
      if (!(object instanceof THREE.Mesh) || object.userData.keepOpacity) return;
      const material = object.material as THREE.Material & { opacity: number };
      material.transparent = true;
      material.opacity = opacity.current;
      material.depthWrite = opacity.current > 0.08;
    });
    const transformError = rig.current.position.distanceTo(targetPosition)
      + rig.current.quaternion.angleTo(targetQuaternion)
      + rig.current.scale.distanceTo(targetScale);
    if (focused && movingToFocus && transformError < 0.045) focusTransformSettled.current = true;
    const coverTarget = ((focused && focusTransformSettled.current) || (returning && !pagesReturned)) && detailsReady ? -Math.PI : 0;
    cover.current.rotation.y = THREE.MathUtils.lerp(cover.current.rotation.y, coverTarget, ease);
    cover.current.position.z = THREE.MathUtils.lerp(cover.current.position.z, coverTarget === -Math.PI ? 0 : 0.035, ease);
    const coverError = Math.abs(cover.current.rotation.y - coverTarget)
      + Math.abs(cover.current.position.z - (coverTarget === -Math.PI ? 0 : 0.035));
    if (returning && pagesReturned && coverError < 0.025 && !coverClosed) {
      queueMicrotask(() => setCoverClosed(true));
    }
    const opacitySettled = Math.abs(opacity.current - (mode === 'PLAYER_FOCUS' ? 0 : 1)) < 0.02;
    const geometrySettled = transformError < 0.035 && coverError < 0.025 && opacitySettled
      && (!focused || detailsReady) && (!returning || (pagesReturned && coverClosed));
    if (mobile && focused && geometrySettled && !mobileReaderReady) {
      queueMicrotask(() => setMobileReaderReady(true));
    }
    if (!focused && geometrySettled && resetPending.current) {
      resetPending.current = false;
      queueMicrotask(() => {
        setResetToken((value) => value + 1);
        setMobileReaderReady(false);
        setReturning(false);
      });
    }
    // Switch from the physical P2 backside to the centered reader atomically,
    // after the gutter-driven P1 opening has completed.
    const mobileReaderVisible = mobileReaderReady && (focused || (returning && !pagesReturned));
    cover.current.visible = !(mobile && mobileReaderVisible);
    onSettled(geometrySettled && (!mobile || !focused || mobileReaderReady));
  });
  return (
    <group ref={rig} position={[-p1Width / 2, 0, 0.08]} onClick={(event) => { event.stopPropagation(); if (mode === 'ALBUM_OPEN') onBooklet(); }}>
      {detailsMounted && <Suspense fallback={null}><BookletPages album={album} page={page} mobile={mobile} reduced={reduced} active={mode === 'BOOKLET_FOCUS'} returning={returning && !pagesReturned} mobileReaderReady={mobileReaderReady && (mode === 'BOOKLET_FOCUS' || !pagesReturned)} resetToken={resetToken} coverNode={coverNode} onReady={detailsLoaded} onPageTurnComplete={onPageTurnComplete} onReturnPagesComplete={returnPagesComplete} onPrevious={onPrevious} onNext={onNext} /></Suspense>}
      <group ref={assignCover} position={[0, 0, 0.035]} visible={!(mobile && mobileReaderReady && (mode === 'BOOKLET_FOCUS' || !pagesReturned))}>
        <mesh position={[p1Width / 2, 0, 0]} castShadow><planeGeometry args={[p1Width, PAGE_HEIGHT]} /><PaperMaterial texture={p1} /></mesh>
      </group>
    </group>
  );
}

function Scene(props: ExperienceProps) {
  const { album, backgroundSize, openingFromClosed, mode, page, mobile, playing, reduced, onOpen, onBooklet, onPlayer, onPrevious, onNext, onCdAnchor, onTransitionChange } = props;
  const textures = useCoreTextures(album);
  const { size, viewport } = useThree();
  const packageRig = useRef<THREE.Group>(null);
  const hinge = useRef<THREE.Group>(null);
  const drag = useRef<{ id: number; x: number; y: number; startX: number; startY: number; canvas: HTMLCanvasElement } | null>(null);
  const rotation = useRef(readPackageRotation({ x: -0.1, y: 0.12 }));
  const autoRotate = useRef(true);
  const aligned = useRef(mode !== 'CLOSED');
  const alignedYaw = useRef(0);
  const [openingPhase, setOpeningPhase] = useState<OpeningPhase>('IDLE');
  const openingPhaseRef = useRef<OpeningPhase>('IDLE');
  const previousMode = useRef(mode);
  const reported = useRef(false);
  const bookletSettled = useRef(mode === 'CLOSED');
  const traySettled = useRef(true);
  const discSettled = useRef(true);
  const setBookletSettled = useCallback((value: boolean) => { bookletSettled.current = value; }, []);
  const setTraySettled = useCallback((value: boolean) => { traySettled.current = value; }, []);
  const setDiscSettled = useCallback((value: boolean) => { discSettled.current = value; }, []);
  const keepInternalsClosed = openingFromClosed
    || openingPhase === 'ALIGN_CLOSED'
    || openingPhase === 'POSITION_FOR_OPEN';

  useEffect(() => {
    const openingFromClosed = previousMode.current === 'CLOSED' && mode !== 'CLOSED';
    if (openingFromClosed) {
      autoRotate.current = false;
      alignedYaw.current = Math.round(rotation.current.y / (Math.PI * 2)) * Math.PI * 2;
      aligned.current = false;
      openingPhaseRef.current = 'ALIGN_CLOSED';
    } else if (mode !== 'CLOSED') {
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
  }, [mode, onTransitionChange]);

  useFrame((_, delta) => {
    if (!packageRig.current || !hinge.current) return;
    const closed = mode === 'CLOSED';
    if (closed && autoRotate.current && !reduced) rotation.current.y += delta * Math.PI / 15;
    const ease = reduced ? 1 : 1 - Math.exp(-5 * delta);
    if (!closed && !aligned.current) {
      rotation.current.x = THREE.MathUtils.lerp(rotation.current.x, -0.1, ease);
      rotation.current.y = THREE.MathUtils.lerp(rotation.current.y, alignedYaw.current, ease);
      if (Math.abs(rotation.current.x + 0.1) + Math.abs(rotation.current.y - alignedYaw.current) < 0.018) {
        aligned.current = true;
        openingPhaseRef.current = 'POSITION_FOR_OPEN';
        setOpeningPhase('POSITION_FOR_OPEN');
      }
    }
    packageRig.current.rotation.x = THREE.MathUtils.lerp(packageRig.current.rotation.x, closed ? rotation.current.x : -0.1, ease);
    packageRig.current.rotation.y = THREE.MathUtils.lerp(packageRig.current.rotation.y, closed ? rotation.current.y : alignedYaw.current, ease);
    const positioning = openingPhaseRef.current === 'POSITION_FOR_OPEN';
    const opening = openingPhaseRef.current === 'HINGE_OPEN' || (!closed && openingPhaseRef.current === 'IDLE');
    const targetHinge = opening ? OPEN_ANGLE : 0;
    hinge.current.rotation.y = THREE.MathUtils.lerp(hinge.current.rotation.y, targetHinge, ease);
    const source = mobile ? album.albumHero?.backgroundAnchor?.mobile ?? DETAIL_BACKGROUND.mobile : album.albumHero?.backgroundAnchor?.desktop ?? DETAIL_BACKGROUND.desktop;
    const stageWidth = backgroundSize.width || size.width;
    const stageHeight = backgroundSize.height || size.height;
    const backgroundScale = Math.max(stageWidth / source.sourceWidth, stageHeight / source.sourceHeight);
    const renderedWidth = source.sourceWidth * backgroundScale;
    const backgroundOffsetX = (stageWidth - renderedWidth) / 2;
    const screenLineX = backgroundOffsetX + source.x * renderedWidth;
    const closedX = (screenLineX / stageWidth - 0.5) * viewport.width;
    const keepClosedTransform = closed || openingPhaseRef.current === 'ALIGN_CLOSED';
    const x = keepClosedTransform ? closedX : mode === 'BOOKLET_FOCUS' ? 1.05 : mode === 'PLAYER_FOCUS' ? (mobile ? 0 : 0.62) : (mobile ? 0 : HALF_PANEL);
    const y = mobile
      ? (keepClosedTransform ? viewport.height * 0.2 : mode === 'PLAYER_FOCUS' ? viewport.height * 0.2 : viewport.height * 0.1)
      : 0.05;
    const mobileClosedScale = viewport.width * 0.69 / PANEL;
    const mobileOpenScale = viewport.width * 0.9 / (PANEL_WIDTH * 1.94);
    const mobilePlayerScale = viewport.width * 0.58 / (CD_RADIUS * 2);
    const scale = keepClosedTransform
      ? (mobile ? mobileClosedScale : 1.18)
      : mode === 'BOOKLET_FOCUS'
        ? (mobile ? mobileOpenScale : 0.76)
        : mode === 'PLAYER_FOCUS'
          ? (mobile ? mobilePlayerScale : 1.01)
          : (mobile ? mobileOpenScale : 1.08);
    packageRig.current.position.x = THREE.MathUtils.lerp(packageRig.current.position.x, x, ease);
    packageRig.current.position.y = THREE.MathUtils.lerp(packageRig.current.position.y, y, ease);
    packageRig.current.position.z = THREE.MathUtils.lerp(packageRig.current.position.z, mode === 'BOOKLET_FOCUS' ? -1 : 0, ease);
    packageRig.current.scale.setScalar(THREE.MathUtils.lerp(packageRig.current.scale.x, scale, ease));
    const packageError = Math.abs(packageRig.current.position.x - x)
      + Math.abs(packageRig.current.position.y - y)
      + Math.abs(packageRig.current.position.z - (mode === 'BOOKLET_FOCUS' ? -1 : 0))
      + Math.abs(packageRig.current.scale.x - scale);
    if (positioning && packageError < 0.035) {
      openingPhaseRef.current = 'HINGE_OPEN';
      setOpeningPhase('HINGE_OPEN');
    }
    const openingFromClosedComplete = closed || openingPhaseRef.current === 'IDLE'
      || (openingPhaseRef.current === 'HINGE_OPEN'
        && Math.abs(hinge.current.rotation.y - OPEN_ANGLE) < 0.025);
    const complete = aligned.current
      && openingFromClosedComplete
      && Math.abs(hinge.current.rotation.y - targetHinge) < 0.025
      && packageError < 0.04
      && bookletSettled.current
      && traySettled.current
      && discSettled.current;
    if (complete && !reported.current) { reported.current = true; onTransitionChange?.(false); }
  });

  const finish = (id: number, click: boolean) => {
    const active = drag.current;
    if (!active || active.id !== id) return;
    if (active.canvas.hasPointerCapture(id)) active.canvas.releasePointerCapture(id);
    if (click && Math.hypot(active.x - active.startX, active.y - active.startY) < 7) onOpen();
    drag.current = null;
  };
  useEffect(() => {
    const up = (event: PointerEvent) => finish(event.pointerId, event.type === 'pointerup');
    window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
    return () => { window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); };
  });
  const down = (event: ThreeEvent<PointerEvent>) => {
    if (mode !== 'CLOSED') return;
    event.stopPropagation(); autoRotate.current = false;
    const canvas = event.nativeEvent.currentTarget as HTMLCanvasElement; canvas.setPointerCapture(event.pointerId);
    drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, startX: event.clientX, startY: event.clientY, canvas };
  };
  const move = (event: ThreeEvent<PointerEvent>) => {
    const active = drag.current; if (!active || active.id !== event.pointerId || mode !== 'CLOSED') return;
    rotation.current.y += (event.clientX - active.x) * 0.008;
    rotation.current.x = THREE.MathUtils.clamp(rotation.current.x + (event.clientY - active.y) * 0.006, -0.48, 0.48);
    active.x = event.clientX; active.y = event.clientY;
  };
  return (
    <>
      <group ref={packageRig} position={[0, mobile ? viewport.height * 0.2 : 0.05, 0]} rotation={[-0.1, 0.12, 0]} scale={mobile ? viewport.width * 0.69 / PANEL : 1.18}
        onPointerDown={down} onPointerMove={move} onPointerUp={(e) => finish(e.pointerId, true)} onPointerCancel={(e) => finish(e.pointerId, false)}>
        {/* Keep assembly coordinates spine-relative while packageRig rotates at
            the geometric centre shared by the closed front and back covers. */}
        <group position={[-HALF_PANEL, 0, 0]}>
        <TrayRig back={textures.back} texture={textures.interiorTray} label={textures.cdLabel} mode={keepInternalsClosed ? 'CLOSED' : mode} playing={playing} reduced={reduced} onPlayer={onPlayer} onSettled={setTraySettled} onDiscSettled={setDiscSettled} onCdAnchor={onCdAnchor} />
        <group ref={hinge}>
          <group position={[HALF_PANEL, 0, FRONT_PANEL_CENTER_Z]}>
            <mesh castShadow receiveShadow><boxGeometry args={[PANEL_WIDTH, PANEL, PAPER_THICKNESS]} /><meshStandardMaterial color="#d8d1c5" roughness={0.94} /></mesh>
            <mesh position={[0, 0, PAPER_THICKNESS / 2 + SURFACE_OFFSET]}><planeGeometry args={[PANEL_WIDTH * 0.98, PANEL * 0.98]} /><PaperMaterial texture={textures.front} /></mesh>
            <mesh position={[0, 0, -PAPER_THICKNESS / 2 - SURFACE_OFFSET]} rotation={[0, Math.PI, 0]} receiveShadow><planeGeometry args={[PANEL_WIDTH * 0.98, PANEL * 0.98]} /><PaperMaterial texture={textures.interiorBooklet} /></mesh>
            <group position={[0, 0, 0.064]} rotation={[0, Math.PI, 0]}>
              <BookletRig album={album} p1={textures.p1} mode={keepInternalsClosed ? 'CLOSED' : mode} page={page} mobile={mobile} reduced={reduced} onBooklet={onBooklet} onSettled={setBookletSettled} onPageTurnComplete={() => props.onPageTurnComplete?.()} onPrevious={onPrevious} onNext={onNext} />
            </group>
          </group>
        </group>
        {/* The printed spine stays in the fixed assembly as the cover opens. */}
        <mesh position={[SURFACE_OFFSET, 0, 0]} rotation={[0, -Math.PI / 2, 0]} castShadow><planeGeometry args={[PACKAGE_DEPTH, PANEL]} /><PaperMaterial texture={textures.spine} /></mesh>
        </group>
      </group>
      <mesh position={[0, 0, -0.48]} receiveShadow><planeGeometry args={[16, 12]} /><shadowMaterial transparent opacity={0.065} depthWrite={false} /></mesh>
    </>
  );
}

export default function AlbumDetailExperience3D(props: ExperienceProps) {
  return (
    <Canvas aria-label="열고 탐색할 수 있는 지영희류 3D 디지팩" camera={{ position: [0, 0, 7], fov: 42 }} dpr={[1, 2]} shadows="soft" gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}>
      <ambientLight intensity={1.05} />
      <directionalLight castShadow intensity={1.8} position={[4.5, 6, 7]} shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-camera-left={-6} shadow-camera-right={6} shadow-camera-top={5} shadow-camera-bottom={-5} shadow-radius={7} shadow-bias={-0.0002} />
      <directionalLight intensity={0.25} position={[-3, 1, 4]} />
      <Scene {...props} />
    </Canvas>
  );
}
