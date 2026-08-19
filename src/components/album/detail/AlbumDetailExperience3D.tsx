import { Canvas, createPortal, useFrame, useLoader, useThree } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { RefObject } from 'react';
import * as THREE from 'three';
import type { Album } from '../../../data/albums';
import { assetUrl } from '../../../utils/assetUrl';
import { JI_SPINE_RATIO, PACKAGE_PANEL, readPackageRotation } from '../packageGeometry';
import { CdPolycarbonateMaterial, IvoryEdgeMaterial, PrintedPaperMaterial, TrayClearPlasticMaterial } from '../JiYoungHeePackageModel';

export type ExperienceMode = 'CLOSED' | 'ALBUM_OPEN' | 'BOOKLET_FOCUS' | 'PLAYER_FOCUS';
export type BookletBounds = { left: number; top: number; width: number; height: number };

export type ExperienceProps = {
  album: Album;
  backgroundSize: { width: number; height: number };
  openingFromClosed: boolean;
  mode: ExperienceMode;
  page: number;
  mobile: boolean;
  playing: boolean;
  reduced: boolean;
  homeActivationKey: number;
  onOpen(): void;
  onBooklet(): void;
  onPlayer(): void;
  onPrevious(): void;
  onNext(): void;
  onCdAnchor?(anchor: { x: number; y: number }): void;
  onBookletBounds?(bounds: BookletBounds): void;
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
const SPINE_SURFACE_OFFSET = 0.0015;
const FRONT_PANEL_CENTER_Z = HALF_PACKAGE_DEPTH - PAPER_THICKNESS / 2;
const BACK_PANEL_CENTER_Z = -FRONT_PANEL_CENTER_Z;
const BACK_INNER_Z = BACK_PANEL_CENTER_Z + PAPER_THICKNESS / 2 + SURFACE_OFFSET;
const TRAY_THICKNESS = 0.018;
const TRAY_PLATE_Z = BACK_INNER_Z + TRAY_THICKNESS / 2 + SURFACE_OFFSET;
const RECESS_Z = TRAY_PLATE_Z + TRAY_THICKNESS / 2 + SURFACE_OFFSET;
const HUB_Z = RECESS_Z + 0.009;
const CD_MOUNT_Z = RECESS_Z + 0.046;
const MOBILE_CLOSED_WIDTH = 0.69;
const getMobileClosedScale = (viewportWidth: number) => viewportWidth * MOBILE_CLOSED_WIDTH / PANEL_WIDTH;
// Negative Y brings the cover toward the viewer before it settles to the left.
const OPEN_ANGLE = THREE.MathUtils.degToRad(-160);
// Repository exports establish the trim ratios: booklet pages sit just inside
// the cover, while a pressed CD occupies 90% of the panel height.
const PAGE_HEIGHT = PANEL * 0.92;
const CD_RADIUS = PANEL * 0.45;
const PAGE_TURN_DURATION = 0.86;
const BOOKLET_EDGE_INSET = 0.003;
const DETAIL_BACKGROUND = {
  desktop: { sourceWidth: 3840, sourceHeight: 2160, x: 0.5 },
  mobile: { sourceWidth: 1440, sourceHeight: 2560, x: 0.5 },
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

function configureBookletTextures(textures: THREE.Texture[], maxAnisotropy: number) {
  textures.forEach((texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = maxAnisotropy;
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
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
  return <PrintedPaperMaterial texture={texture} />;
}

function CdDisc({ label, mode, playing, reduced, tray, onPlayer, onSettled, onAnchor }: {
  label: THREE.Texture; mode: ExperienceMode; playing: boolean; reduced: boolean; onPlayer(): void; onSettled(settled: boolean): void;
  tray: RefObject<THREE.Group | null>;
  onAnchor?(anchor: { x: number; y: number }): void;
}) {
  const rig = useRef<THREE.Group>(null);
  const tilt = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const { camera, scene, size, viewport } = useThree();
  const lastAnchor = useRef({ x: -1, y: -1 });
  const velocity = useRef(0);
  const tiltTarget = useRef({ x: 0, y: 0 });
  const tiltDrag = useRef<{ id: number; x: number; y: number } | null>(null);
  const detached = useRef(false);
  const CD_THICKNESS = CD_RADIUS * 0.02;
  const CENTER_HOLE_RADIUS = CD_RADIUS * 0.12;
  const HUB_RADIUS = CD_RADIUS * 0.235;
  const LABEL_OUTER_RADIUS = CD_RADIUS * 0.955;
  const mountPosition = useMemo(() => new THREE.Vector3(0, 0, CD_MOUNT_Z), []);
  const discShapes = useMemo(() => {
    const annulus = (innerRadius: number, outerRadius: number) => {
      const shape = new THREE.Shape();
      shape.absarc(0, 0, outerRadius, 0, Math.PI * 2);
      const hole = new THREE.Path();
      hole.absarc(0, 0, innerRadius, 0, Math.PI * 2);
      shape.holes.push(hole);
      return shape;
    };
    return { substrate: annulus(CENTER_HOLE_RADIUS, CD_RADIUS) };
  }, [CENTER_HOLE_RADIUS]);
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
    const playerScale = size.width <= 700 ? viewport.width * 0.7 / (CD_RADIUS * 2) : 1.72;
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
    <group ref={rig} position={[0, 0, CD_MOUNT_Z]} onClick={(event) => {
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
      <mesh castShadow>
        <extrudeGeometry args={[discShapes.substrate, { depth: CD_THICKNESS, bevelEnabled: false, curveSegments: 96 }]} />
        <CdPolycarbonateMaterial opacity={0.3} thickness={CD_THICKNESS} />
      </mesh>
      <mesh position={[0, 0, CD_THICKNESS + SURFACE_OFFSET]} castShadow>
        <ringGeometry args={[HUB_RADIUS, LABEL_OUTER_RADIUS, 96]} />
        <meshPhysicalMaterial map={label} roughness={0.3} metalness={0} clearcoat={0.24} clearcoatRoughness={0.22} specularIntensity={0.62} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, CD_THICKNESS + SURFACE_OFFSET * 2]}>
        <ringGeometry args={[LABEL_OUTER_RADIUS, CD_RADIUS, 96]} />
        <CdPolycarbonateMaterial opacity={0.42} thickness={CD_THICKNESS} />
      </mesh>
      <mesh position={[0, 0, CD_THICKNESS + SURFACE_OFFSET * 2]}>
        <ringGeometry args={[CENTER_HOLE_RADIUS, HUB_RADIUS, 96]} />
        <CdPolycarbonateMaterial opacity={0.38} thickness={CD_THICKNESS} />
      </mesh>
      </group>
      </group>
    </group>
  );
}

function TrayRig({ back, texture, label, mode, playing, reduced, onPlayer, onSettled, onDiscSettled, onCdAnchor }: {
  back: THREE.Texture; texture: THREE.Texture; label: THREE.Texture; mode: ExperienceMode; playing: boolean; reduced: boolean;
  onPlayer(): void; onSettled(settled: boolean): void; onDiscSettled(settled: boolean): void; onCdAnchor?(anchor: { x: number; y: number }): void;
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
    <group position={[HALF_PANEL, 0, 0]}>
      <mesh position={[0, 0, BACK_PANEL_CENTER_Z]} castShadow receiveShadow>
        <boxGeometry args={[PANEL_WIDTH, PANEL, PAPER_THICKNESS]} />
        <IvoryEdgeMaterial />
      </mesh>
      <mesh position={[0, 0, -HALF_PACKAGE_DEPTH - SURFACE_OFFSET]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[PANEL_WIDTH, PANEL]} />
        <PaperMaterial texture={back} />
      </mesh>
      <mesh position={[0, 0, BACK_PANEL_CENTER_Z + PAPER_THICKNESS / 2 + SURFACE_OFFSET]} receiveShadow><planeGeometry args={[PANEL_WIDTH, PANEL]} /><PaperMaterial texture={texture} /></mesh>
      <group ref={cdTray}>
        <group ref={trayContext}>
        <mesh position={[0, 0, TRAY_PLATE_Z]} receiveShadow userData={{ baseOpacity: 0.5 }}>
          <boxGeometry args={[PANEL_WIDTH * 0.95, PANEL * 0.95, TRAY_THICKNESS]} />
          <TrayClearPlasticMaterial opacity={0.34} thickness={TRAY_THICKNESS} />
        </mesh>
        <mesh position={[0, 0, RECESS_Z]} receiveShadow userData={{ baseOpacity: 0.68 }}>
          <ringGeometry args={[CD_RADIUS, PANEL * 0.475, 64]} />
          <TrayClearPlasticMaterial opacity={0.36} thickness={0.008} />
        </mesh>
        <mesh position={[0, 0, RECESS_Z + SURFACE_OFFSET]} userData={{ baseOpacity: 0.15 }}><ringGeometry args={[0.18, CD_RADIUS - 0.04, 64]} /><TrayClearPlasticMaterial opacity={0.15} thickness={0.006} /></mesh>
        <mesh position={[0, 0, HUB_Z]} rotation={[Math.PI / 2, 0, 0]} castShadow userData={{ baseOpacity: 0.62 }}>
          <cylinderGeometry args={[0.16, 0.145, 0.018, 32]} />
          <TrayClearPlasticMaterial opacity={0.3} thickness={0.012} />
        </mesh>
        </group>
        <CdDisc label={label} tray={cdTray} mode={mode} playing={playing} reduced={reduced} onPlayer={onPlayer} onSettled={onDiscSettled} onAnchor={onCdAnchor} />
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

function BookletPages({ album, page, mobile, reduced, active, onReady, onPageTurnComplete, onPrevious, onNext }: {
  album: Album; page: number; mobile: boolean; reduced: boolean; active: boolean;
  onPrevious(): void; onNext(): void;
  onReady(): void; onPageTurnComplete(): void;
}) {
  const { gl } = useThree();
  const urls = album.booklet!.previewImages.slice(1).map(({ src }) => assetUrl(src)!);
  const pages = useLoader(THREE.TextureLoader, urls) as THREE.Texture[];
  useMemo(() => configureBookletTextures(pages, gl.capabilities.getMaxAnisotropy()), [gl, pages]);
  const aspect = textureAspect(pages[0]);
  const width = PAGE_HEIGHT * aspect;
  const previous = useRef(page);
  const [settled, setSettled] = useState(page);
  const [turn, setTurn] = useState<PageTurn | null>(null);
  useEffect(onReady, [onReady]);
  useEffect(() => {
    if (!active) return;
    if (previous.current === page) return;
    const source = previous.current;
    previous.current = page;
    // Mobile is a static single-page reader: swap the texture directly instead
    // of reusing the desktop paper-curl mesh.
    if (mobile || reduced) { queueMicrotask(() => { setSettled(page); onPageTurnComplete(); }); return; }
    setTurn({ key: Date.now(), source, target: page, direction: page > source ? 1 : -1 });
  }, [active, mobile, onPageTurnComplete, page, reduced]);
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
  const spreads = [[pages[0], pages[1]], [pages[2], pages[3]], [pages[4], pages[5]]];
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


type BookletPhase = 'RESTING' | 'ENTERING' | 'READING' | 'RETURNING';

function BookletRig({ album, p1, mode, page, mobile, reduced, onBooklet, onSettled, onPageTurnComplete, onPrevious, onNext, onBounds }: {
  album: Album; p1: THREE.Texture; mode: ExperienceMode; page: number; mobile: boolean; reduced: boolean;
  onBooklet(): void; onSettled(settled: boolean): void; onPageTurnComplete(): void; onPrevious(): void; onNext(): void;
  onBounds?(bounds: BookletBounds): void;
}) {
  const { camera, gl, size, viewport } = useThree();
  const rig = useRef<THREE.Group>(null);
  const cover = useRef<THREE.Group>(null);
  const reader = useRef<THREE.Group>(null);
  const [detailsMounted, setDetailsMounted] = useState(mode === 'BOOKLET_FOCUS');
  const [detailsReady, setDetailsReady] = useState(false);
  const [phase, setPhase] = useState<BookletPhase>(mode === 'BOOKLET_FOCUS' ? 'ENTERING' : 'RESTING');
  const previousMode = useRef(mode);
  const opacity = useRef(1);
  const coverOpacity = useRef(1);
  const readerOpacity = useRef(0);
  const lastBounds = useRef<BookletBounds | null>(null);
  const p1Width = PAGE_HEIGHT * textureAspect(p1);

  useEffect(() => {
    if (mode === 'BOOKLET_FOCUS' && previousMode.current !== 'BOOKLET_FOCUS') {
      queueMicrotask(() => {
        setDetailsReady(false);
        setDetailsMounted(true);
        setPhase('ENTERING');
      });
    } else if (mode !== 'BOOKLET_FOCUS' && previousMode.current === 'BOOKLET_FOCUS') {
      queueMicrotask(() => setPhase('RETURNING'));
    }
    previousMode.current = mode;
  }, [mode]);

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
    const focusedTransform = phase !== 'RESTING';
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
        new THREE.Quaternion().setFromEuler(new THREE.Euler(mobile ? -0.04 : -0.08, 0, 0)),
        new THREE.Vector3(mobile ? mobileFocusScale : desktopFocusScale, mobile ? mobileFocusScale : desktopFocusScale, mobile ? mobileFocusScale : desktopFocusScale),
      );
      const local = rig.current.parent.matrixWorld.clone().invert().multiply(desiredWorld);
      local.decompose(targetPosition, targetQuaternion, targetScale);
    }
    rig.current.position.lerp(targetPosition, ease);
    rig.current.quaternion.slerp(targetQuaternion, ease);
    rig.current.scale.lerp(targetScale, ease);
    opacity.current = THREE.MathUtils.lerp(opacity.current, mode === 'PLAYER_FOCUS' ? 0 : 1, ease);
    setGroupOpacity(rig.current, opacity.current);

    const transformError = rig.current.position.distanceTo(targetPosition)
      + rig.current.quaternion.angleTo(targetQuaternion)
      + rig.current.scale.distanceTo(targetScale);
    const canRevealReader = detailsReady && (phase === 'READING' || (phase === 'ENTERING' && transformError < 0.12));
    const coverTarget = canRevealReader ? 0 : 1;
    const readerTarget = canRevealReader ? 1 : 0;
    coverOpacity.current = THREE.MathUtils.lerp(coverOpacity.current, coverTarget, ease);
    readerOpacity.current = THREE.MathUtils.lerp(readerOpacity.current, readerTarget, ease);
    setGroupOpacity(cover.current, coverOpacity.current * opacity.current);
    setGroupOpacity(reader.current, readerOpacity.current * opacity.current);

    if (mode === 'BOOKLET_FOCUS' && !mobile && onBounds) {
      const corners = [
        new THREE.Vector3(-p1Width, PAGE_HEIGHT / 2, 0), new THREE.Vector3(p1Width, PAGE_HEIGHT / 2, 0),
        new THREE.Vector3(-p1Width, -PAGE_HEIGHT / 2, 0), new THREE.Vector3(p1Width, -PAGE_HEIGHT / 2, 0),
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
    if (phase === 'ENTERING' && canRevealReader && crossfadeError < 0.035) setPhase('READING');
    if (phase === 'RETURNING' && crossfadeError < 0.035) {
      setDetailsMounted(false);
      setPhase('RESTING');
    }
    const opacitySettled = Math.abs(opacity.current - (mode === 'PLAYER_FOCUS' ? 0 : 1)) < 0.02;
    const geometrySettled = transformError < 0.035 && crossfadeError < 0.035 && opacitySettled;
    onSettled(geometrySettled && (phase === 'RESTING' || phase === 'READING'));
  });

  return (
    <group ref={rig} position={[-p1Width / 2, 0, 0.08]} onClick={(event) => { event.stopPropagation(); if (mode === 'ALBUM_OPEN') onBooklet(); }}>
      {detailsMounted && <group ref={reader} visible={phase !== 'RESTING'}>
        <Suspense fallback={null}><BookletPages album={album} page={page} mobile={mobile} reduced={reduced} active={mode === 'BOOKLET_FOCUS'} onReady={() => setDetailsReady(true)} onPageTurnComplete={onPageTurnComplete} onPrevious={onPrevious} onNext={onNext} /></Suspense>
      </group>}
      <group ref={cover} position={[0, 0, 0.035]}>
        <mesh position={[p1Width / 2, 0, 0]} castShadow><planeGeometry args={[p1Width, PAGE_HEIGHT]} /><PaperMaterial texture={p1} /></mesh>
      </group>
    </group>
  );
}

function Scene(props: ExperienceProps) {
  const { album, backgroundSize, openingFromClosed, mode, page, mobile, playing, reduced, homeActivationKey, onOpen, onBooklet, onPlayer, onPrevious, onNext, onCdAnchor, onBookletBounds, onTransitionChange } = props;
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

  useEffect(() => {
    if (homeActivationKey > 0) autoRotate.current = !reduced;
  }, [homeActivationKey, reduced]);

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
    const openInteractive = mode === 'ALBUM_OPEN' && aligned.current && openingPhaseRef.current === 'IDLE';
    packageRig.current.rotation.x = THREE.MathUtils.lerp(packageRig.current.rotation.x, closed || openInteractive ? rotation.current.x : -0.1, ease);
    packageRig.current.rotation.y = THREE.MathUtils.lerp(packageRig.current.rotation.y, closed || openInteractive ? rotation.current.y : alignedYaw.current, ease);
    const positioning = openingPhaseRef.current === 'POSITION_FOR_OPEN';
    const opening = openingPhaseRef.current === 'HINGE_OPEN' || (!closed && openingPhaseRef.current === 'IDLE');
    const targetHinge = opening ? OPEN_ANGLE : 0;
    hinge.current.rotation.y = THREE.MathUtils.lerp(hinge.current.rotation.y, targetHinge, ease);
    const keepClosedTransform = closed || openingPhaseRef.current === 'ALIGN_CLOSED';
    const x = keepClosedTransform ? closedX : mode === 'BOOKLET_FOCUS' ? 1.05 : mode === 'PLAYER_FOCUS' ? (mobile ? 0 : 0.32) : (mobile ? 0 : HALF_PANEL);
    const y = mobile
      ? (keepClosedTransform ? viewport.height * 0.2 : mode === 'PLAYER_FOCUS' ? viewport.height * 0.2 : viewport.height * 0.1)
      : 0.05;
    const mobileClosedScale = getMobileClosedScale(viewport.width);
    const mobileOpenScale = viewport.width * 0.9 / (PANEL_WIDTH * 1.94);
    const mobilePlayerScale = viewport.width * 0.62 / (CD_RADIUS * 2);
    const scale = keepClosedTransform
      ? (mobile ? mobileClosedScale : 1.18)
      : mode === 'BOOKLET_FOCUS'
        ? (mobile ? mobileOpenScale : 0.76)
        : mode === 'PLAYER_FOCUS'
          ? (mobile ? mobilePlayerScale : 1.18)
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
    const hingeError = Math.abs(hinge.current.rotation.y - targetHinge);
    if (openingPhaseRef.current === 'HINGE_OPEN' && hingeError < 0.025 && packageError < 0.04) {
      openingPhaseRef.current = 'IDLE';
      setOpeningPhase('IDLE');
    }
    const openingFromClosedComplete = closed || openingPhaseRef.current === 'IDLE';
    const complete = aligned.current
      && openingFromClosedComplete
      && hingeError < 0.025
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
    if (mode === 'CLOSED' && click && Math.hypot(active.x - active.startX, active.y - active.startY) < 7) onOpen();
    drag.current = null;
  };
  useEffect(() => {
    const up = (event: PointerEvent) => finish(event.pointerId, event.type === 'pointerup');
    window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
    return () => { window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); };
  });
  const down = (event: ThreeEvent<PointerEvent>) => {
    if (mode !== 'CLOSED' && mode !== 'ALBUM_OPEN') return;
    event.stopPropagation(); autoRotate.current = false;
    const canvas = event.nativeEvent.currentTarget as HTMLCanvasElement; canvas.setPointerCapture(event.pointerId);
    drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, startX: event.clientX, startY: event.clientY, canvas };
  };
  const move = (event: ThreeEvent<PointerEvent>) => {
    const active = drag.current; if (!active || active.id !== event.pointerId || (mode !== 'CLOSED' && mode !== 'ALBUM_OPEN')) return;
    const distance = Math.hypot(event.clientX - active.startX, event.clientY - active.startY);
    if (distance >= 7) {
      if (mode === 'ALBUM_OPEN') {
        rotation.current.y = THREE.MathUtils.clamp(rotation.current.y + (event.clientX - active.x) * 0.0035, alignedYaw.current - THREE.MathUtils.degToRad(10), alignedYaw.current + THREE.MathUtils.degToRad(10));
        rotation.current.x = THREE.MathUtils.clamp(rotation.current.x + (event.clientY - active.y) * 0.003, -0.1 - THREE.MathUtils.degToRad(6), -0.1 + THREE.MathUtils.degToRad(6));
      } else {
        rotation.current.y += (event.clientX - active.x) * 0.008;
        rotation.current.x = THREE.MathUtils.clamp(rotation.current.x + (event.clientY - active.y) * 0.006, -0.48, 0.48);
      }
    }
    active.x = event.clientX; active.y = event.clientY;
  };
  return (
    <>
      <group ref={packageRig} visible={mode !== 'PLAYER_FOCUS'} position={[0, mobile ? viewport.height * 0.2 : 0.05, 0]} rotation={[-0.1, 0.12, 0]} scale={mobile ? getMobileClosedScale(viewport.width) : 1.18}
        onPointerDown={down} onPointerMove={move} onPointerUp={(event) => finish(event.pointerId, true)} onPointerCancel={(event) => finish(event.pointerId, false)}>
        {/* Keep assembly coordinates spine-relative while packageRig rotates at
            the geometric centre shared by the closed front and back covers. */}
        <group position={[-HALF_PANEL, 0, 0]}>
        <TrayRig back={textures.back} texture={textures.interiorTray} label={textures.cdLabel} mode={keepInternalsClosed ? 'CLOSED' : mode} playing={playing} reduced={reduced} onPlayer={onPlayer} onSettled={setTraySettled} onDiscSettled={setDiscSettled} onCdAnchor={onCdAnchor} />
        <group ref={hinge}>
          <group position={[HALF_PANEL, 0, FRONT_PANEL_CENTER_Z]}>
            <mesh castShadow receiveShadow><boxGeometry args={[PANEL_WIDTH, PANEL, PAPER_THICKNESS]} /><IvoryEdgeMaterial /></mesh>
            <mesh position={[0, 0, PAPER_THICKNESS / 2 + SURFACE_OFFSET]}><planeGeometry args={[PANEL_WIDTH, PANEL]} /><PaperMaterial texture={textures.front} /></mesh>
            <mesh position={[0, 0, -PAPER_THICKNESS / 2 - SURFACE_OFFSET]} rotation={[0, Math.PI, 0]} receiveShadow><planeGeometry args={[PANEL_WIDTH, PANEL]} /><PaperMaterial texture={textures.interiorBooklet} /></mesh>
            <group position={[0, 0, 0.064]} rotation={[0, Math.PI, 0]}>
              <BookletRig album={album} p1={textures.p1} mode={keepInternalsClosed ? 'CLOSED' : mode} page={page} mobile={mobile} reduced={reduced} onBooklet={onBooklet} onSettled={setBookletSettled} onPageTurnComplete={() => props.onPageTurnComplete?.()} onPrevious={onPrevious} onNext={onNext} onBounds={onBookletBounds} />
            </group>
          </group>
        </group>
        {/* The printed spine stays in the fixed assembly as the cover opens. */}
        <mesh position={[-SPINE_SURFACE_OFFSET, 0, 0]} rotation={[0, -Math.PI / 2, 0]} castShadow><planeGeometry args={[PACKAGE_DEPTH, PANEL]} /><PaperMaterial texture={textures.spine} /></mesh>
        </group>
      </group>
      {/* This screen-facing interaction surface intentionally lives outside
          packageRig, so its usable width never collapses at spine/back angles. */}
      {mode === 'CLOSED' && (
        <mesh position={[closedX, mobile ? viewport.height * 0.2 : 0.05, 1.2]}
          onPointerDown={down} onPointerMove={move} onPointerUp={(e) => finish(e.pointerId, true)} onPointerCancel={(e) => finish(e.pointerId, false)}>
          <planeGeometry args={[mobile ? viewport.width * 0.78 : 3.7, mobile ? viewport.width * 0.78 : 3.4]} />
          <meshBasicMaterial transparent opacity={0} colorWrite={false} depthWrite={false} />
        </mesh>
      )}
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
