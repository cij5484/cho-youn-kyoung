import { Canvas, createPortal, useFrame, useThree } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { RefObject } from 'react';
import * as THREE from 'three';
import type { Album } from '../../../data/albums';
import { assetUrl } from '../../../utils/assetUrl';
import { PACKAGE_PANEL } from '../packageGeometry';
import { getPackageProfile } from './packageProfile';
import type { PackageProfile } from './packageProfile';
import { DiscMotion, DISC_SEATED_EPSILON } from './discMotion';
import { PackageFade } from './packageFade';
import { packageAlignmentError, prepareFrontFacingPackage } from './packageAlignment';
import { needsContinuousAlbumFrames } from './renderPolicy';
import { PhysicalBooklet } from './PhysicalBooklet';
import { bookletReadingPose } from './bookletSheets';
import { CdPolycarbonateMaterial, IvoryEdgeMaterial, OuterPlasticMaterial, PrintedPaperMaterial, TrayClearPlasticMaterial } from '../PackageMaterials';

export type ExperienceMode = 'CLOSED' | 'ALBUM_OPEN' | 'BOOKLET_FOCUS' | 'PLAYER_FOCUS';
export type BookletBounds = { left: number; top: number; width: number; height: number };
export type AlbumAssetFailure = 'cover' | 'interior' | 'booklet';

export type ExperienceProps = {
  album: Album;
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
  onPrewarmReady?(): void;
  onAssetError?(kind: AlbumAssetFailure): void;
  preloadInterior?: boolean;
  renderEnabled?: boolean;
};

type InteriorTextures = {
  interiorBooklet: THREE.Texture;
  interiorTray: THREE.Texture;
  cdLabel: THREE.Texture;
  p1: THREE.Texture;
};

type CoreTextures = {
  front: THREE.Texture;
  back: THREE.Texture;
  spine: THREE.Texture;
  interior: InteriorTextures | null;
};

function PrewarmReady({ onReady }: { onReady?: () => void }) {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    if (!onReady) return;
    let cancelled = false;
    void gl.compileAsync(scene, camera)
      .then(() => { if (!cancelled) onReady(); })
      .catch(() => {
        // The stage's bounded prewarm timeout releases navigation on failure.
      });
    return () => { cancelled = true; };
  }, [camera, gl, onReady, scene]);
  return null;
}

function RenderScheduler({ active, enabled, motionKey }: { active: boolean; enabled: boolean; motionKey: string }) {
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    if (!enabled) return undefined;
    // A mode change gets a bounded render window of its own. This keeps a
    // newly-started transition alive even if the outgoing mode reports its
    // final settled frame during the same React update.
    const motionDeadline = performance.now() + 2500;
    let frame = 0;
    const render = (now: number) => {
      invalidate();
      if (active || now < motionDeadline) frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frame);
  }, [active, enabled, invalidate, motionKey]);
  return null;
}

const PANEL = PACKAGE_PANEL;
const SURFACE_OFFSET = 0.001;
const SPINE_SURFACE_OFFSET = 0.0015;
const TRAY_THICKNESS = 0.018;

// Negative Y brings the cover toward the viewer before it settles to the left.
const OPEN_ANGLE = THREE.MathUtils.degToRad(-160);
// Repository exports establish the trim ratios: booklet pages sit just inside
// the cover, while a pressed CD occupies 90% of the panel height.
const PAGE_HEIGHT = PANEL * 0.92;
const CD_RADIUS = PANEL * 0.45;
const PLAYER_TARGET_RADIUS = CD_RADIUS * 1.72;
const BOOKLET_OPEN_DURATION = 1.2;
const BOOKLET_RETURN_DURATION = 1.15;
const CLOSED_ROTATION_SPEED = (Math.PI * 2) / 22;
// Preserve real elapsed time through short decode/upload stalls. A 0.1s cap
// stretched one-second transitions to 7-12 seconds on the denser booklet
// textures. A one-second ceiling only filters genuine tab-resume gaps; normal
// low-frame-rate rendering still advances according to wall-clock time.
const MAX_ANIMATION_DELTA = 1;
type OpeningPhase = 'IDLE' | 'OPENING';

function animationDelta(delta: number) {
  return Math.min(delta, MAX_ANIMATION_DELTA);
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

function textureAspect(texture: THREE.Texture) {
  const image = texture.image as { width?: number; height?: number } | undefined;
  return image?.width && image?.height ? image.width / image.height : 1;
}

function useCoreTextures(album: Album, loadInterior: boolean, onAssetError?: (kind: AlbumAssetFailure) => void): CoreTextures {
  const { gl } = useThree();
  const hero = album.albumHero!;
  const detail = album.detailExperience!;
  const outerUrls = useMemo(() => [hero.textures.front!, hero.textures.back!, hero.textures.spineLeft!]
    .map((url) => assetUrl(url)!), [hero.textures.back, hero.textures.front, hero.textures.spineLeft]);
  const outerKey = outerUrls.join('|');
  const placeholder = useMemo(() => {
    const texture = new THREE.DataTexture(new Uint8Array([238, 233, 223, 255]), 1, 1, THREE.RGBAFormat);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }, []);
  const [outer, setOuter] = useState<THREE.Texture[] | null>(null);
  const [interior, setInterior] = useState<InteriorTextures | null>(null);
  const reportedFailures = useRef(new Set<AlbumAssetFailure>());
  const reportFailure = useCallback((kind: AlbumAssetFailure) => {
    if (reportedFailures.current.has(kind)) return;
    reportedFailures.current.add(kind);
    onAssetError?.(kind);
  }, [onAssetError]);

  useEffect(() => {
    let cancelled = false;
    let loaded: THREE.Texture[] | null = null;
    void Promise.allSettled(outerUrls.map((url) => new THREE.TextureLoader().loadAsync(url)))
      .then((results) => {
        if (results.some((result) => result.status === 'rejected')) reportFailure('cover');
        loaded = results.flatMap((result) => result.status === 'fulfilled' ? [result.value] : []);
        configureTextures(loaded, gl.capabilities.getMaxAnisotropy());
        if (cancelled) loaded.forEach((texture) => texture.dispose());
        else setOuter(results.map((result) => result.status === 'fulfilled' ? result.value : placeholder));
      });
    return () => {
      cancelled = true;
      loaded?.forEach((texture) => texture.dispose());
    };
  // A stable URL key avoids restarting the three parallel image decodes when
  // the surrounding detail state changes without changing the album.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, outerKey, placeholder, reportFailure]);

  useEffect(() => () => placeholder.dispose(), [placeholder]);

  useEffect(() => {
    if (!loadInterior) return undefined;
    let cancelled = false;
    let loaded: THREE.Texture[] | null = null;
    const interiorUrls = [
      detail.interior.bookletPanel, detail.interior.trayPanel, album.cdLabelImage!,
      album.booklet!.previewImages[0].src,
    ].map((url) => assetUrl(url)!);
    const uniqueUrls = Array.from(new Set(interiorUrls));
    void Promise.all(uniqueUrls.map((url) => new THREE.TextureLoader().loadAsync(url)))
      .then((textures) => {
        loaded = textures;
        configureTextures(textures, gl.capabilities.getMaxAnisotropy());
        if (cancelled) textures.forEach((texture) => texture.dispose());
        else {
          const textureByUrl = new Map(uniqueUrls.map((url, index) => [url, textures[index]]));
          setInterior({
            interiorBooklet: textureByUrl.get(interiorUrls[0])!,
            interiorTray: textureByUrl.get(interiorUrls[1])!,
            cdLabel: textureByUrl.get(interiorUrls[2])!,
            p1: textureByUrl.get(interiorUrls[3])!,
          });
        }
      })
      .catch(() => {
        if (!cancelled) reportFailure('interior');
      });
    return () => {
      cancelled = true;
      loaded?.forEach((texture) => texture.dispose());
    };
  }, [album, detail, gl, loadInterior, reportFailure]);

  return {
    front: outer?.[0] ?? placeholder,
    back: outer?.[1] ?? placeholder,
    spine: outer?.[2] ?? placeholder,
    interior,
  };
}

function PaperMaterial({ texture, contrast, gamma }: { texture: THREE.Texture; contrast?: number; gamma?: number }) {
  return <PrintedPaperMaterial texture={texture} contrast={contrast} gamma={gamma} />;
}

function CdDisc({ label, profile, mode, playing, reduced, tray, onPlayer, onSettled, onAnchor }: {
  label: THREE.Texture; profile: PackageProfile; mode: ExperienceMode; playing: boolean; reduced: boolean; onPlayer(): void; onSettled(settled: boolean): void;
  tray: RefObject<THREE.Group | null>;
  onAnchor?(anchor: { x: number; y: number }): void;
}) {
  const rig = useRef<THREE.Group>(null);
  const tilt = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const labelMaterial = useRef<THREE.MeshPhysicalMaterial>(null);
  const { camera, invalidate, scene, size, viewport } = useThree();
  const lastAnchor = useRef({ x: -1, y: -1 });
  const velocity = useRef(0);
  const tiltTarget = useRef({ x: 0, y: 0 });
  const tiltDrag = useRef<{ id: number; x: number; y: number } | null>(null);
  const motion = useMemo(() => new DiscMotion(), []);
  const initialized = useRef(false);
  const projected = useMemo(() => new THREE.Vector3(), []);
  const CD_THICKNESS = CD_RADIUS * (profile.scanned ? 0.012 : 0.02);
  const CENTER_HOLE_RADIUS = CD_RADIUS * (profile.scanned ? 0.133 : 0.12);
  const HUB_RADIUS = CD_RADIUS * 0.235;
  const LABEL_OUTER_RADIUS = CD_RADIUS * 0.955;
  const discShapes = useMemo(() => {
    const annulus = (innerRadius: number, outerRadius: number) => {
      const shape = new THREE.Shape();
      shape.absarc(0, 0, outerRadius, 0, Math.PI * 2);
      const hole = new THREE.Path();
      hole.absarc(0, 0, innerRadius, 0, Math.PI * 2);
      shape.holes.push(hole);
      return shape;
    };
    return { substrate: annulus(CENTER_HOLE_RADIUS, CD_RADIUS * (profile.scanned ? 0.981 : 1)) };
  }, [CENTER_HOLE_RADIUS, profile.scanned]);
  useFrame((_, delta) => {
    if (!rig.current) return;
    const step = animationDelta(delta);
    const ease = reduced ? 1 : 1 - Math.exp(-7 * step);
    const player = mode === 'PLAYER_FOCUS';
    if (!tray.current) return;
    const playerScale = size.width <= 700 ? viewport.width * 0.7 / (CD_RADIUS * 2) : PLAYER_TARGET_RADIUS / CD_RADIUS;
    const transformError = motion.step(rig.current, tray.current, scene, profile.cdMountZ, player,
      size.width <= 700 ? 0 : -1.55, size.width <= 700 ? viewport.height * 0.16 : 0.08,
      playerScale, initialized.current ? ease : 1);
    initialized.current = true;

    const targetVelocity = player && !reduced ? (playing ? Math.PI / 9 : Math.PI / 18) : 0;
    velocity.current = THREE.MathUtils.lerp(velocity.current, targetVelocity, 1 - Math.exp(-3 * step));
    if (spin.current) spin.current.rotation.z -= velocity.current * step;
    if (tilt.current) {
      if (mode !== 'PLAYER_FOCUS') {
        tiltTarget.current.x = 0;
        tiltTarget.current.y = 0;
      }
      const tiltEase = reduced ? 1 : 1 - Math.exp(-10 * step);
      tilt.current.rotation.x = THREE.MathUtils.lerp(tilt.current.rotation.x, tiltTarget.current.x, tiltEase);
      tilt.current.rotation.y = THREE.MathUtils.lerp(tilt.current.rotation.y, tiltTarget.current.y, tiltEase);
    }
    const tiltError = player ? 0 : Math.abs(tilt.current?.rotation.x ?? 0) + Math.abs(tilt.current?.rotation.y ?? 0);
    if (labelMaterial.current) {
      // During the presentation handoff, keep the travelling label above the
      // fading booklet. Restore physical occlusion as soon as it is seated.
      labelMaterial.current.depthTest = !(player || (mode === 'ALBUM_OPEN' && transformError + tiltError >= 0.015));
    }
    onSettled(transformError + tiltError < DISC_SEATED_EPSILON);

    if (mode === 'PLAYER_FOCUS' && onAnchor) {
      rig.current.getWorldPosition(projected).project(camera);
      const anchor = { x: (projected.x * 0.5 + 0.5) * size.width, y: (-projected.y * 0.5 + 0.5) * size.height };
      if (Math.abs(anchor.x - lastAnchor.current.x) + Math.abs(anchor.y - lastAnchor.current.y) > 0.5) {
        lastAnchor.current = anchor;
        onAnchor(anchor);
      }
    }
  });
  return (
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
      invalidate();
    }} onPointerUp={(event) => {
      if (tiltDrag.current?.id === event.pointerId) tiltDrag.current = null;
      (event.target as Element).releasePointerCapture(event.pointerId);
    }} onPointerCancel={() => { tiltDrag.current = null; }} onLostPointerCapture={() => { tiltDrag.current = null; }}>
      <group ref={tilt}>
      <group ref={spin} renderOrder={10}>
      <mesh castShadow>
        <extrudeGeometry args={[discShapes.substrate, { depth: CD_THICKNESS, bevelEnabled: false, curveSegments: 96 }]} />
        <CdPolycarbonateMaterial opacity={0.3} thickness={CD_THICKNESS} />
      </mesh>
      <mesh position={[0, 0, CD_THICKNESS + SURFACE_OFFSET]}>
        {profile.scanned ? <planeGeometry args={[CD_RADIUS * 2, CD_RADIUS * 2]} /> : <ringGeometry args={[HUB_RADIUS, LABEL_OUTER_RADIUS, 128]} />}
        <meshPhysicalMaterial ref={labelMaterial} map={label} transparent alphaTest={profile.scanned ? 0.5 : 0} alphaToCoverage={profile.scanned} side={THREE.DoubleSide} roughness={0.3} metalness={0} clearcoat={0.24} clearcoatRoughness={0.22} specularIntensity={0.62} toneMapped={false} />
      </mesh>
      {!profile.scanned && <><mesh position={[0, 0, CD_THICKNESS + SURFACE_OFFSET * 2]}>
        <ringGeometry args={[LABEL_OUTER_RADIUS, CD_RADIUS, 96]} />
        <CdPolycarbonateMaterial opacity={0.42} thickness={CD_THICKNESS} />
      </mesh>
      <mesh position={[0, 0, CD_THICKNESS + SURFACE_OFFSET * 2]}>
        <ringGeometry args={[CENTER_HOLE_RADIUS, HUB_RADIUS, 96]} />
        <CdPolycarbonateMaterial opacity={0.38} thickness={CD_THICKNESS} />
      </mesh></>}
      </group>
      </group>
    </group>
  );
}

function TrayRig({ texture, label, profile, mode, playing, reduced, onPlayer, onSettled, onDiscSettled, onCdAnchor }: {
  texture: THREE.Texture; label: THREE.Texture; profile: PackageProfile; mode: ExperienceMode; playing: boolean; reduced: boolean;
  onPlayer(): void; onSettled(settled: boolean): void; onDiscSettled(settled: boolean): void; onCdAnchor?(anchor: { x: number; y: number }): void;
}) {
  const { scene } = useThree();
  const cdTray = useRef<THREE.Group>(null);
  const trayContext = useRef<THREE.Group>(null);
  const opacity = useRef(1);
  const appliedOpacity = useRef(Number.NaN);
  const { dimensions, backInnerZ, trayPlateZ, recessZ, cdMountZ } = profile;
  useFrame((_, delta) => {
    const group = trayContext.current;
    if (!group) return;
    const step = animationDelta(delta);
    const target = mode === 'CLOSED' || mode === 'PLAYER_FOCUS' ? 0 : mode === 'BOOKLET_FOCUS' ? 0.48 : 1;
    opacity.current = THREE.MathUtils.lerp(opacity.current, target, reduced ? 1 : 1 - Math.exp(-7 * step));
    group.visible = opacity.current > 0.002;
    if (Math.abs(appliedOpacity.current - opacity.current) > 0.001) {
      group.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        const material = object.material as THREE.Material;
        material.opacity = Number(object.userData.baseOpacity) * opacity.current;
      });
      appliedOpacity.current = opacity.current;
    }
    onSettled(Math.abs(opacity.current - target) < 0.018);
  });
  return <>
    <mesh position={[0, 0, backInnerZ]} userData={{ packageSurface: true }} receiveShadow>
      <planeGeometry args={[dimensions.backWidth, dimensions.backHeight]} /><PaperMaterial texture={texture} />
    </mesh>
    <group ref={cdTray}>
      <group ref={trayContext}>
        <mesh position={[0, 0, trayPlateZ]} receiveShadow userData={{ baseOpacity: 0.5 }}><boxGeometry args={[dimensions.backWidth * 0.95, dimensions.backHeight * 0.95, TRAY_THICKNESS]} /><TrayClearPlasticMaterial opacity={0.34} thickness={TRAY_THICKNESS} /></mesh>
        <mesh position={[0, 0, recessZ]} receiveShadow userData={{ baseOpacity: 0.68 }}><ringGeometry args={[CD_RADIUS, PANEL * 0.475, 96]} /><TrayClearPlasticMaterial opacity={0.36} thickness={0.008} /></mesh>
        <mesh position={[0, 0, recessZ + SURFACE_OFFSET]} userData={{ baseOpacity: 0.15 }}><ringGeometry args={[0.18, CD_RADIUS - 0.04, 96]} /><TrayClearPlasticMaterial opacity={0.15} thickness={0.006} /></mesh>
        <ClearCdTrayAccents dimensions={dimensions} cdMountZ={cdMountZ} />
      </group>
    </group>
    {createPortal(<CdDisc label={label} profile={profile} tray={cdTray} mode={mode} playing={playing} reduced={reduced} onPlayer={onPlayer} onSettled={onDiscSettled} onAnchor={onCdAnchor} />, scene)}
  </>;
}

function ClearCdTrayAccents({ dimensions, cdMountZ }: {
  dimensions: PackageProfile['dimensions'];
  cdMountZ: number;
}) {
  const supports = useRef<THREE.InstancedMesh>(null);
  const hubTeeth = useRef<THREE.InstancedMesh>(null);
  const supportRadius = CD_RADIUS + 0.085;
  const panelBorder = useMemo(() => {
    const width = dimensions.backWidth * 0.95;
    const height = dimensions.backHeight * 0.95;
    const inset = 0.028;
    const shape = new THREE.Shape();
    shape.moveTo(-width / 2, -height / 2);
    shape.lineTo(width / 2, -height / 2);
    shape.lineTo(width / 2, height / 2);
    shape.lineTo(-width / 2, height / 2);
    shape.closePath();
    const opening = new THREE.Path();
    opening.moveTo(-width / 2 + inset, -height / 2 + inset);
    opening.lineTo(-width / 2 + inset, height / 2 - inset);
    opening.lineTo(width / 2 - inset, height / 2 - inset);
    opening.lineTo(width / 2 - inset, -height / 2 + inset);
    opening.closePath();
    shape.holes.push(opening);
    return shape;
  }, [dimensions.backHeight, dimensions.backWidth]);

  useEffect(() => {
    const supportMesh = supports.current;
    const teethMesh = hubTeeth.current;
    const transform = new THREE.Object3D();
    if (supportMesh) {
      [Math.PI / 4, Math.PI * 3 / 4, Math.PI * 5 / 4, Math.PI * 7 / 4].forEach((angle, index) => {
        transform.position.set(Math.cos(angle) * supportRadius, Math.sin(angle) * supportRadius, 0);
        transform.rotation.set(Math.PI / 2, 0, 0);
        transform.scale.set(1, 1, 1);
        transform.updateMatrix();
        supportMesh.setMatrixAt(index, transform.matrix);
      });
      supportMesh.instanceMatrix.needsUpdate = true;
    }
    if (teethMesh) {
      Array.from({ length: 8 }, (_, index) => index * Math.PI / 4).forEach((angle, index) => {
        transform.position.set(Math.cos(angle) * 0.105, Math.sin(angle) * 0.105, 0);
        transform.rotation.set(0, 0, angle - Math.PI / 2);
        transform.scale.set(1, 1, 1);
        transform.updateMatrix();
        teethMesh.setMatrixAt(index, transform.matrix);
      });
      teethMesh.instanceMatrix.needsUpdate = true;
    }
  }, [supportRadius]);

  return <>
    <mesh position={[0, 0, cdMountZ - 0.018]} userData={{ baseOpacity: 0.18 }}>
      <shapeGeometry args={[panelBorder]} />
      <meshBasicMaterial color="#dcecea" transparent opacity={0.18} depthWrite={false} toneMapped={false} />
    </mesh>
    <mesh position={[0, 0, cdMountZ - 0.014]} userData={{ baseOpacity: 0.24 }}>
      <ringGeometry args={[CD_RADIUS + 0.056, CD_RADIUS + 0.078, 96]} />
      <meshBasicMaterial color="#d5e8e5" transparent opacity={0.24} depthWrite={false} toneMapped={false} />
    </mesh>
    <instancedMesh ref={supports} args={[undefined, undefined, 4]} position={[0, 0, cdMountZ - 0.012]} userData={{ baseOpacity: 0.22 }}>
      <cylinderGeometry args={[0.072, 0.094, 0.022, 24]} />
      <meshBasicMaterial color="#d4e5e2" transparent opacity={0.22} depthWrite={false} toneMapped={false} />
    </instancedMesh>
    <mesh position={[0, 0, cdMountZ + 0.016]} rotation={[Math.PI / 2, 0, 0]} renderOrder={11} userData={{ baseOpacity: 0.4 }}>
      <cylinderGeometry args={[0.165, 0.152, 0.026, 32]} />
      <meshBasicMaterial color="#d5e8e5" transparent opacity={0.4} depthWrite={false} toneMapped={false} />
    </mesh>
    <instancedMesh ref={hubTeeth} args={[undefined, undefined, 8]} position={[0, 0, cdMountZ + 0.031]} renderOrder={12} userData={{ baseOpacity: 0.52 }}>
      <boxGeometry args={[0.04, 0.115, 0.022]} />
      <meshBasicMaterial color="#e9f5f3" transparent opacity={0.52} depthWrite={false} toneMapped={false} />
    </instancedMesh>
  </>;
}

type BookletPhase = 'RESTING' | 'ENTERING' | 'READING' | 'RETURNING';

function BookletRig({ album, p1, mode, page, mobile, reduced, onBooklet, onSettled, onPageTurnComplete, onPrevious, onNext, onBounds, onAssetError }: {
  album: Album; p1: THREE.Texture; mode: ExperienceMode; page: number; mobile: boolean; reduced: boolean;
  onBooklet(): void; onSettled(settled: boolean): void; onPageTurnComplete(): void; onPrevious(): void; onNext(): void;
  onBounds?(bounds: BookletBounds): void;
  onAssetError?(kind: AlbumAssetFailure): void;
}) {
  const { camera, gl, scene, size, viewport } = useThree();
  const rig = useRef<THREE.Group>(null);
  const sheetsSettled = useRef(true);
  const setSheetsSettled = useCallback((value: boolean) => { sheetsSettled.current = value; }, []);
  const reportBookletError = useCallback(() => onAssetError?.('booklet'), [onAssetError]);
  const [detailsReady, setDetailsReady] = useState(false);
  const [phase, setPhase] = useState<BookletPhase>(mode === 'BOOKLET_FOCUS' ? 'ENTERING' : 'RESTING');
  const previousMode = useRef(mode);
  const detached = useRef(false);
  const originalParent = useRef<THREE.Object3D | null>(null);
  const entryProgress = useRef(0);
  const entryStartPosition = useRef(new THREE.Vector3());
  const entryStartQuaternion = useRef(new THREE.Quaternion());
  const entryStartScale = useRef(new THREE.Vector3(1, 1, 1));
  const returnProgress = useRef(0);
  const returnStartPosition = useRef(new THREE.Vector3());
  const returnStartQuaternion = useRef(new THREE.Quaternion());
  const returnStartScale = useRef(new THREE.Vector3(1, 1, 1));
  const foldProgress = useRef(0);
  const foldOpenProgress = useRef(0);
  const lastBounds = useRef<BookletBounds | null>(null);
  const p1Width = PAGE_HEIGHT * textureAspect(p1);
  const mountPosition = useMemo(() => new THREE.Vector3(-p1Width / 2, 0, 0.08), [p1Width]);
  const scratch = useMemo(() => ({
    targetPosition: new THREE.Vector3(),
    targetQuaternion: new THREE.Quaternion(),
    targetScale: new THREE.Vector3(1, 1, 1),
    desiredPosition: new THREE.Vector3(),
    desiredQuaternion: new THREE.Quaternion(),
    desiredScale: new THREE.Vector3(1, 1, 1),
    desiredEuler: new THREE.Euler(),
    desiredWorld: new THREE.Matrix4(),
    mountMatrix: new THREE.Matrix4(),
    mountWorld: new THREE.Matrix4(),
    mountQuaternion: new THREE.Quaternion(),
    unitScale: new THREE.Vector3(1, 1, 1),
    corners: [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()],
  }), []);

  useEffect(() => {
    if (mode === 'BOOKLET_FOCUS' && previousMode.current !== 'BOOKLET_FOCUS') {
      entryProgress.current = 0;
      foldOpenProgress.current = 0;
      returnProgress.current = 0;
      lastBounds.current = null;
      setPhase('ENTERING');
    } else if (mode !== 'BOOKLET_FOCUS' && previousMode.current === 'BOOKLET_FOCUS') {
      returnProgress.current = 0;
      if (rig.current) {
        returnStartPosition.current.copy(rig.current.position);
        returnStartQuaternion.current.copy(rig.current.quaternion);
        returnStartScale.current.copy(rig.current.scale);
      }
      setPhase('RETURNING');
    }
    previousMode.current = mode;
  }, [mode]);

  useEffect(() => {
    const node = rig.current;
    return () => {
      // A scene-attached booklet must not survive its React owner (route
      // changes, asset retries or hot reloads) as an orphaned duplicate.
      if (node && detached.current && originalParent.current) {
        originalParent.current.attach(node);
        detached.current = false;
      }
    };
  }, []);

  useFrame((_, delta) => {
    if (!rig.current) return;
    const step = animationDelta(delta);
    if (phase === 'ENTERING' && !detached.current && rig.current.parent) {
      originalParent.current = rig.current.parent;
      scene.attach(rig.current);
      detached.current = true;
      entryStartPosition.current.copy(rig.current.position);
      entryStartQuaternion.current.copy(rig.current.quaternion);
      entryStartScale.current.copy(rig.current.scale);
    }
    const ease = reduced ? 1 : 1 - Math.exp(-7 * step);
    const fadeEase = reduced ? 1 : 1 - Math.exp(-12 * step);
    const targetPosition = scratch.targetPosition.copy(mountPosition);
    const targetQuaternion = scratch.targetQuaternion.identity();
    const targetScale = scratch.targetScale.set(1, 1, 1);
    let transitioning = false;
    let foldTarget = phase === 'READING' ? 1 : 0;
    if ((phase === 'ENTERING' || phase === 'READING') && detached.current) {
      const desiredPosition = scratch.desiredPosition.set(0, mobile ? 0.35 : 0.08, 0.82);
      const focusViewport = viewport.getCurrentViewport(camera, desiredPosition);
      const mobileFocusScale = Math.min(focusViewport.width * 0.95 / p1Width, focusViewport.height * 0.91 / PAGE_HEIGHT) * 0.9;
      const isScannedBooklet = album.id === 'han-beom-su-haegeum-sanjo-2020';
      const desktopWidthFit = isScannedBooklet ? 0.985 : 0.93;
      const desktopHeightFit = isScannedBooklet ? 0.97 : 0.94;
      const desktopMargin = isScannedBooklet ? 0.98 : 0.9;
      const desktopFocusScale = Math.min(
        focusViewport.width * desktopWidthFit / (p1Width * 2),
        focusViewport.height * desktopHeightFit / PAGE_HEIGHT,
      ) * desktopMargin;
      scratch.desiredScale.setScalar(mobile ? mobileFocusScale : desktopFocusScale);
      desiredPosition.x = -bookletReadingPose(page, mobile).center * p1Width * scratch.desiredScale.x;
      scratch.desiredQuaternion.setFromEuler(scratch.desiredEuler.set(mobile ? -0.04 : -0.08, 0, 0));
      const desiredWorld = scratch.desiredWorld.compose(
        desiredPosition,
        scratch.desiredQuaternion,
        scratch.desiredScale,
      );
      desiredWorld.decompose(targetPosition, targetQuaternion, targetScale);
      if (phase === 'ENTERING') {
        entryProgress.current = reduced
          ? 1
          : Math.min(1, entryProgress.current + step / BOOKLET_OPEN_DURATION);
        const progress = entryProgress.current;
        const eased = progress * progress * (3 - 2 * progress);
        rig.current.position.lerpVectors(entryStartPosition.current, targetPosition, eased);
        rig.current.position.z += Math.sin(Math.PI * eased) * 0.14;
        rig.current.quaternion.slerpQuaternions(entryStartQuaternion.current, targetQuaternion, eased);
        rig.current.scale.lerpVectors(entryStartScale.current, targetScale, eased);
        foldOpenProgress.current = detailsReady
          ? (reduced ? 1 : Math.min(1, foldOpenProgress.current + step / BOOKLET_OPEN_DURATION))
          : 0;
        foldTarget = THREE.MathUtils.smoothstep(foldOpenProgress.current, 0.06, 0.9);
        transitioning = true;
      }
    } else if (phase === 'RETURNING' && detached.current && originalParent.current) {
      originalParent.current.updateWorldMatrix(true, false);
      scratch.mountMatrix.compose(mountPosition, scratch.mountQuaternion.identity(), scratch.unitScale.set(1, 1, 1));
      scratch.mountWorld.copy(originalParent.current.matrixWorld).multiply(scratch.mountMatrix).decompose(targetPosition, targetQuaternion, targetScale);
      returnProgress.current = reduced
        ? 1
        : Math.min(1, returnProgress.current + step / BOOKLET_RETURN_DURATION);
      const progress = returnProgress.current;
      const eased = progress * progress * (3 - 2 * progress);
      rig.current.position.lerpVectors(returnStartPosition.current, targetPosition, eased);
      rig.current.position.z += Math.sin(Math.PI * eased) * 0.16;
      rig.current.quaternion.slerpQuaternions(returnStartQuaternion.current, targetQuaternion, eased);
      rig.current.scale.lerpVectors(returnStartScale.current, targetScale, eased);
      foldTarget = 1 - THREE.MathUtils.smoothstep(progress, 0.05, 0.9);
      transitioning = true;
    }
    if (!transitioning) {
      rig.current.position.lerp(targetPosition, ease);
      rig.current.quaternion.slerp(targetQuaternion, ease);
      rig.current.scale.lerp(targetScale, ease);
    }
    foldProgress.current = reduced
      ? foldTarget
      : THREE.MathUtils.lerp(foldProgress.current, foldTarget, fadeEase);
    const transformError = rig.current.position.distanceTo(targetPosition)
      + rig.current.quaternion.angleTo(targetQuaternion)
      + rig.current.scale.distanceTo(targetScale);

    if (mode === 'BOOKLET_FOCUS' && phase === 'READING' && !mobile && onBounds) {
      const corners = scratch.corners;
      corners[0].set(-p1Width, PAGE_HEIGHT / 2, 0);
      corners[1].set(p1Width, PAGE_HEIGHT / 2, 0);
      corners[2].set(-p1Width, -PAGE_HEIGHT / 2, 0);
      corners[3].set(p1Width, -PAGE_HEIGHT / 2, 0);
      let minX = Number.POSITIVE_INFINITY;
      let maxX = Number.NEGATIVE_INFINITY;
      let minY = Number.POSITIVE_INFINITY;
      let maxY = Number.NEGATIVE_INFINITY;
      corners.forEach((corner) => {
        rig.current!.localToWorld(corner).project(camera);
        const x = (corner.x * 0.5 + 0.5) * size.width;
        const y = (-corner.y * 0.5 + 0.5) * size.height;
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      });
      const canvasRect = gl.domElement.getBoundingClientRect();
      const bounds = { left: canvasRect.left + minX, top: canvasRect.top + minY, width: maxX - minX, height: maxY - minY };
      const last = lastBounds.current;
      if (!last || Math.abs(last.left - bounds.left) + Math.abs(last.top - bounds.top) + Math.abs(last.width - bounds.width) + Math.abs(last.height - bounds.height) > 0.5) {
        lastBounds.current = bounds;
        onBounds(bounds);
      }
    }

    const foldError = Math.abs(foldProgress.current - foldTarget);
    if (phase === 'ENTERING' && entryProgress.current >= 1 && foldOpenProgress.current >= 1 && detailsReady && foldError < 0.002) {
      foldProgress.current = 1;
      setPhase('READING');
    }
    if (phase === 'RETURNING' && returnProgress.current >= 1 && foldError < 0.002 && transformError < 0.035) {
      foldProgress.current = 0;
      if (detached.current && originalParent.current) {
        originalParent.current.attach(rig.current);
        rig.current.position.copy(mountPosition);
        rig.current.quaternion.identity();
        rig.current.scale.setScalar(1);
        detached.current = false;
      }
      setPhase('RESTING');
    }
    const geometrySettled = transformError < 0.035 && foldError < 0.002 && sheetsSettled.current;
    const phaseMatchesMode = mode === 'BOOKLET_FOCUS' ? phase === 'READING' : phase === 'RESTING';
    onSettled(geometrySettled && phaseMatchesMode);
  }, -1);

  return (
    <group ref={rig} position={[-p1Width / 2, 0, 0.08]} onClick={(event) => { event.stopPropagation(); if (mode === 'ALBUM_OPEN') onBooklet(); }}>
      <PhysicalBooklet
        album={album} cover={p1} width={p1Width} height={PAGE_HEIGHT}
        page={page} mobile={mobile} reduced={reduced}
        enabled={mode === 'BOOKLET_FOCUS' || phase !== 'RESTING'}
        reading={mode === 'BOOKLET_FOCUS' && phase === 'READING'}
        openProgress={foldProgress}
        onReady={setDetailsReady} onSettled={setSheetsSettled}
        onPageTurnComplete={onPageTurnComplete}
        onPrevious={onPrevious} onNext={onNext} onError={reportBookletError}
      />
    </group>
  );
}

type SceneProps = ExperienceProps & { onRenderActivityChange(active: boolean): void };

function Scene(props: SceneProps) {
  const { album, mode, page, mobile, playing, reduced, homeActivationKey, onOpen, onBooklet, onPlayer, onPrevious, onNext, onCdAnchor, onBookletBounds, onTransitionChange, onRenderActivityChange, onAssetError } = props;
  const openPitch = 0;
  const wantsInterior = Boolean(props.preloadInterior || mode !== 'CLOSED');
  const [interiorRequested, setInteriorRequested] = useState(wantsInterior);
  if (wantsInterior && !interiorRequested) setInteriorRequested(true);
  // Retain loaded internals through CLOSE/HOME. Dispose only when the scene leaves.
  const loadInterior = wantsInterior || interiorRequested;
  const textures = useCoreTextures(album, loadInterior, onAssetError);
  const profile = useMemo(() => getPackageProfile(album), [album]);
  const { dimensions, paperThickness, halfDepth, frontCenterZ, backCenterZ } = profile;
  const panelWidth = dimensions.frontWidth;
  const halfPanel = panelWidth / 2;
  const packageOpacity = useRef(1);
  const shellFade = useMemo(() => new PackageFade(), []);
  const { size, viewport } = useThree();
  const packageRig = useRef<THREE.Group>(null);
  const hinge = useRef<THREE.Group>(null);
  const drag = useRef<{ id: number; x: number; y: number; time: number; startX: number; startY: number; canvas: HTMLCanvasElement } | null>(null);
  const inertia = useRef({ x: 0, y: 0 });
  const rotation = useRef({ x: -0.1, y: 0.12 });
  const autoRotate = useRef(true);
  const aligned = useRef(mode !== 'CLOSED');
  const alignedYaw = useRef(0);
  const openingPhaseRef = useRef<OpeningPhase>('IDLE');
  const previousMode = useRef(mode);
  const reported = useRef(false);
  const interactionActive = useRef(false);
  const bookletSettled = useRef(mode === 'CLOSED');
  const traySettled = useRef(true);
  const discSettled = useRef(true);
  const setBookletSettled = useCallback((value: boolean) => { bookletSettled.current = value; }, []);
  const setTraySettled = useCallback((value: boolean) => { traySettled.current = value; }, []);
  const setDiscSettled = useCallback((value: boolean) => { discSettled.current = value; }, []);
  const closedX = mobile ? 0 : -viewport.width * 0.13;
  useEffect(() => {
    shellFade.capture(packageRig.current);
  }, [shellFade, textures.interior]);

  useEffect(() => {
    if (homeActivationKey > 0) {
      autoRotate.current = !reduced;
      onRenderActivityChange(autoRotate.current);
    }
  }, [homeActivationKey, onRenderActivityChange, reduced]);

  useEffect(() => {
    const priorMode = previousMode.current;
    const enteringBooklet = priorMode === 'ALBUM_OPEN' && mode === 'BOOKLET_FOCUS';
    const leavingBooklet = priorMode === 'BOOKLET_FOCUS' && mode === 'ALBUM_OPEN';
    if (enteringBooklet || leavingBooklet) bookletSettled.current = false;
    if (mode !== 'CLOSED') {
      autoRotate.current = false;
      onRenderActivityChange(false);
      alignedYaw.current = prepareFrontFacingPackage(rotation.current, inertia.current);
      const activeDrag = drag.current;
      if (activeDrag?.canvas.hasPointerCapture(activeDrag.id)) activeDrag.canvas.releasePointerCapture(activeDrag.id);
      drag.current = null;
      interactionActive.current = false;
      // Responsive updates or callback changes must not prematurely mark
      // the inherited HOME pose aligned while it is still rotating.
      aligned.current = false;
      openingPhaseRef.current = 'OPENING';
    } else {
      aligned.current = true;
      openingPhaseRef.current = 'IDLE';
      if (reduced) autoRotate.current = false;
      onRenderActivityChange(autoRotate.current && !reduced);
    }
    reported.current = false;
    onTransitionChange?.(true);
    previousMode.current = mode;
  }, [mobile, mode, onRenderActivityChange, onTransitionChange, openPitch, reduced]);

  useFrame((_, delta) => {
    if (!packageRig.current || !hinge.current) return;
    const step = animationDelta(delta);
    const closed = mode === 'CLOSED';
    const packageMode = mode;
    if (closed && autoRotate.current && !reduced) {
      rotation.current.y += step * CLOSED_ROTATION_SPEED;
    }
    const openInteractive = mode === 'ALBUM_OPEN' && aligned.current && openingPhaseRef.current === 'IDLE';
    if (!drag.current && !autoRotate.current && !reduced && (closed || openInteractive)) {
      rotation.current.x += inertia.current.x * step;
      rotation.current.y += inertia.current.y * step;
      const pitchCenter = openInteractive ? openPitch : 0;
      const pitchLimit = openInteractive ? THREE.MathUtils.degToRad(6) : 0.48;
      rotation.current.x = THREE.MathUtils.clamp(rotation.current.x, pitchCenter - pitchLimit, pitchCenter + pitchLimit);
      const decay = Math.exp(-5.2 * step);
      inertia.current.x *= decay;
      inertia.current.y *= decay;
    }
    const ease = reduced ? 1 : 1 - Math.exp(-6.5 * step);
    packageRig.current.rotation.x = THREE.MathUtils.lerp(packageRig.current.rotation.x, closed || openInteractive ? rotation.current.x : openPitch, ease);
    packageRig.current.rotation.y = THREE.MathUtils.lerp(packageRig.current.rotation.y, closed || openInteractive ? rotation.current.y : alignedYaw.current, ease);
    const targetHinge = closed ? 0 : OPEN_ANGLE;
    hinge.current.rotation.y = THREE.MathUtils.lerp(hinge.current.rotation.y, targetHinge, ease);
    const keepClosedTransform = packageMode === 'CLOSED';
    const mobileClosedScale = viewport.width * 0.69 / panelWidth;
    const mobileOpenScale = viewport.width * 0.9 / (panelWidth * 1.94);
    const mobileOpenX = halfPanel * mobileOpenScale;
    const x = keepClosedTransform ? closedX : packageMode === 'BOOKLET_FOCUS' ? 1.05 : packageMode === 'PLAYER_FOCUS' ? (mobile ? 0 : 0.68) : (mobile ? mobileOpenX : halfPanel * 1.08);
    const y = mobile
      ? (keepClosedTransform ? viewport.height * 0.2 : packageMode === 'PLAYER_FOCUS' ? viewport.height * 0.2 : viewport.height * 0.1)
      : 0.05;
    const scale = keepClosedTransform
      ? (mobile ? mobileClosedScale : 1.18)
      : packageMode === 'BOOKLET_FOCUS'
        ? (mobile ? mobileOpenScale : 0.76)
        : packageMode === 'PLAYER_FOCUS'
          ? (mobile ? mobileOpenScale * 0.72 : 0.78)
          : (mobile ? mobileOpenScale : 1.08);
    packageRig.current.position.x = THREE.MathUtils.lerp(packageRig.current.position.x, x, ease);
    packageRig.current.position.y = THREE.MathUtils.lerp(packageRig.current.position.y, y, ease);
    const targetZ = packageMode === 'BOOKLET_FOCUS' ? -1 : packageMode === 'PLAYER_FOCUS' ? -2.4 : 0;
    packageRig.current.position.z = THREE.MathUtils.lerp(packageRig.current.position.z, targetZ, ease);
    packageRig.current.scale.setScalar(THREE.MathUtils.lerp(packageRig.current.scale.x, scale, ease));
    const hidePackage = mode === 'PLAYER_FOCUS' || mode === 'BOOKLET_FOCUS';
    const fadeTarget = hidePackage ? 0 : 1;
    packageOpacity.current = THREE.MathUtils.lerp(packageOpacity.current, fadeTarget, ease);
    shellFade.update(packageOpacity.current, mode !== 'PLAYER_FOCUS');
    const packageError = Math.abs(packageOpacity.current - fadeTarget) + Math.abs(packageRig.current.position.x - x)
      + Math.abs(packageRig.current.position.y - y)
      + Math.abs(packageRig.current.position.z - targetZ)
      + Math.abs(packageRig.current.scale.x - scale);
    const hingeError = Math.abs(hinge.current.rotation.y - targetHinge);
    const alignmentError = closed ? 0 : packageAlignmentError(packageRig.current.rotation, alignedYaw.current);
    if (openingPhaseRef.current === 'OPENING' && alignmentError < 0.025 && hingeError < 0.04 && packageError < 0.055) {
      packageRig.current.rotation.x = openPitch;
      packageRig.current.rotation.y = alignedYaw.current;
      aligned.current = true;
      openingPhaseRef.current = 'IDLE';
    }
    const openingFromClosedComplete = closed || openingPhaseRef.current === 'IDLE';
    const complete = aligned.current
      && openingFromClosedComplete
      && hingeError < 0.04
      && packageError < 0.055
      && (!hidePackage || !packageRig.current.visible)
      && (mode === 'CLOSED' || Boolean(textures.interior))
      && bookletSettled.current
      && traySettled.current
      && discSettled.current;
    if (complete && !reported.current) { reported.current = true; onTransitionChange?.(false); }
    const inertiaError = Math.abs(inertia.current.x) + Math.abs(inertia.current.y);
    if (interactionActive.current && !drag.current && inertiaError < 0.015) {
      interactionActive.current = false;
      onRenderActivityChange(false);
    }
  }, -2); // Parent pose must update before the scene-space disc samples its mount.

  const finish = (id: number, click: boolean) => {
    const active = drag.current;
    if (!active || active.id !== id) return;
    if (active.canvas.hasPointerCapture(id)) active.canvas.releasePointerCapture(id);
    if (mode === 'CLOSED' && click && Math.hypot(active.x - active.startX, active.y - active.startY) < 7) onOpen();
    if (reduced || click && Math.hypot(active.x - active.startX, active.y - active.startY) < 7) inertia.current = { x: 0, y: 0 };
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
    interactionActive.current = true;
    onRenderActivityChange(true);
    const canvas = event.nativeEvent.currentTarget as HTMLCanvasElement; canvas.setPointerCapture(event.pointerId);
    inertia.current = { x: 0, y: 0 };
    drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, time: event.timeStamp, startX: event.clientX, startY: event.clientY, canvas };
  };
  const move = (event: ThreeEvent<PointerEvent>) => {
    const active = drag.current; if (!active || active.id !== event.pointerId || (mode !== 'CLOSED' && mode !== 'ALBUM_OPEN')) return;
    const distance = Math.hypot(event.clientX - active.startX, event.clientY - active.startY);
    if (distance >= 7) {
      const elapsed = Math.max(8, Math.min(40, event.timeStamp - active.time)) / 1000;
      const sensitivity = Math.PI / Math.max(size.width * 0.65, 700);
      const yawDelta = (event.clientX - active.x) * sensitivity;
      const pitchDelta = (event.clientY - active.y) * sensitivity * 0.76;
      if (mode === 'ALBUM_OPEN') {
        rotation.current.y = THREE.MathUtils.clamp(rotation.current.y + yawDelta, alignedYaw.current - THREE.MathUtils.degToRad(10), alignedYaw.current + THREE.MathUtils.degToRad(10));
        rotation.current.x = THREE.MathUtils.clamp(rotation.current.x + pitchDelta, openPitch - THREE.MathUtils.degToRad(6), openPitch + THREE.MathUtils.degToRad(6));
      } else {
        rotation.current.y += yawDelta;
        rotation.current.x = THREE.MathUtils.clamp(rotation.current.x + pitchDelta, -0.48, 0.48);
      }
      inertia.current.x = THREE.MathUtils.clamp(pitchDelta / elapsed, -2.4, 2.4);
      inertia.current.y = THREE.MathUtils.clamp(yawDelta / elapsed, -3.2, 3.2);
    }
    active.x = event.clientX; active.y = event.clientY; active.time = event.timeStamp;
  };
  return (
    <>
      <group ref={packageRig} position={[closedX, mobile ? viewport.height * 0.2 : 0.05, 0]} rotation={[-0.1, 0.12, 0]} scale={mobile ? viewport.width * 0.69 / panelWidth : 1.18}
        onPointerDown={down} onPointerMove={move} onPointerUp={(event) => finish(event.pointerId, true)} onPointerCancel={(event) => finish(event.pointerId, false)}>
        {/* Exterior is independent of interior loading, including on HOME. */}
        <mesh position={[0, 0, backCenterZ]} userData={{ packageSurface: true }} castShadow receiveShadow><boxGeometry args={[dimensions.backWidth, dimensions.backHeight, paperThickness]} /><IvoryEdgeMaterial /></mesh>
        <mesh position={[0, 0, -halfDepth - SURFACE_OFFSET]} rotation={[0, Math.PI, 0]} userData={{ packageSurface: true }}>
          <planeGeometry args={[dimensions.backWidth, dimensions.backHeight]} /><PaperMaterial texture={textures.back} />
        </mesh>
        {profile.scanned && <mesh userData={{ packageSurface: true }}><boxGeometry args={[dimensions.trayWidth, dimensions.trayHeight, dimensions.trayDepth]} /><OuterPlasticMaterial /></mesh>}
        {textures.interior && <TrayRig texture={textures.interior.interiorTray} label={textures.interior.cdLabel} profile={profile} mode={mode} playing={playing} reduced={reduced} onPlayer={onPlayer} onSettled={setTraySettled} onDiscSettled={setDiscSettled} onCdAnchor={onCdAnchor} />}
        <group ref={hinge} position={[-halfPanel, 0, 0]}>
          <group position={[halfPanel, 0, frontCenterZ]}>
            <mesh userData={{ packageSurface: true }} castShadow receiveShadow><boxGeometry args={[panelWidth, PANEL, paperThickness]} /><IvoryEdgeMaterial /></mesh>
            <mesh position={[0, 0, paperThickness / 2 + SURFACE_OFFSET]} userData={{ packageSurface: true }}><planeGeometry args={[panelWidth, PANEL]} /><PaperMaterial texture={textures.front} /></mesh>
            {textures.interior && <>
              <mesh position={[0, 0, -paperThickness / 2 - SURFACE_OFFSET]} rotation={[0, Math.PI, 0]} userData={{ packageSurface: true }} receiveShadow><planeGeometry args={[panelWidth, PANEL]} /><PaperMaterial texture={textures.interior.interiorBooklet} /></mesh>
              <group position={[0, 0, 0.064]} rotation={[0, Math.PI, 0]}>
                <BookletRig album={album} p1={textures.interior.p1} mode={mode} page={page} mobile={mobile} reduced={reduced} onBooklet={onBooklet} onSettled={setBookletSettled} onPageTurnComplete={() => props.onPageTurnComplete?.()} onPrevious={onPrevious} onNext={onNext} onBounds={onBookletBounds} onAssetError={onAssetError} />
              </group>
            </>}
          </group>
        </group>
        <mesh position={[-halfPanel - SPINE_SURFACE_OFFSET, 0, 0]} rotation={[0, -Math.PI / 2, 0]} userData={{ packageSurface: true }} castShadow><planeGeometry args={[dimensions.printedSpineDepth, PANEL]} /><PaperMaterial texture={textures.spine} /></mesh>
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
      <PrewarmReady onReady={!props.preloadInterior || textures.interior ? props.onPrewarmReady : undefined} />
    </>
  );
}

export default function AlbumDetailExperience3D(props: ExperienceProps) {
  const { onPageTurnComplete, onTransitionChange } = props;
  const [sceneTransitioning, setSceneTransitioning] = useState(true);
  const [pageTurning, setPageTurning] = useState(false);
  const [sceneMotion, setSceneMotion] = useState(props.mode === 'CLOSED' && !props.reduced);
  const [documentVisible, setDocumentVisible] = useState(() => document.visibilityState !== 'hidden');
  const previousMode = useRef(props.mode);
  const previousPage = useRef(props.page);
  useEffect(() => {
    const update = () => setDocumentVisible(document.visibilityState !== 'hidden');
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);
  useEffect(() => {
    const modeChanged = previousMode.current !== props.mode;
    const pageChanged = previousPage.current !== props.page;
    previousMode.current = props.mode;
    previousPage.current = props.page;
    // A mode change owns the start of a new motion cycle. Do not rely solely
    // on the scene's passive effect: a final frame from the outgoing mode can
    // otherwise report settled after the new mode has rendered and stop the
    // demand-loop halfway through the next transition.
    if (modeChanged) {
      setSceneTransitioning(true);
      // Reopening resets to P2/P3; that is an opening, not a separate turn.
      setPageTurning(false);
    } else if (pageChanged && props.mode === 'BOOKLET_FOCUS') {
      setPageTurning(true);
    }
  }, [props.mode, props.page]);
  const handleTransitionChange = useCallback((transitioning: boolean) => {
    setSceneTransitioning(transitioning);
    onTransitionChange?.(transitioning);
  }, [onTransitionChange]);
  const handlePageTurnComplete = useCallback(() => {
    setPageTurning(false);
    onPageTurnComplete?.();
  }, [onPageTurnComplete]);
  const continuous = needsContinuousAlbumFrames({
    mode: props.mode,
    playing: props.playing,
    reduced: props.reduced,
    sceneTransitioning,
    pageTurning,
    sceneMotion,
  });
  const renderEnabled = props.renderEnabled !== false && documentVisible;
  return (
    <Canvas aria-label={`열고 탐색할 수 있는 ${props.album.title} 3D 디지팩`} camera={{ position: [0, 0, 7], fov: 42 }} dpr={props.mobile ? [1, 1.5] : [1, 2]} frameloop={!renderEnabled ? 'never' : props.mode === 'CLOSED' && continuous ? 'always' : 'demand'} shadows="soft" gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }} onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}>
      <RenderScheduler active={props.mode !== 'CLOSED' && continuous} enabled={renderEnabled} motionKey={`${props.mode}:${renderEnabled}`} />
      <ambientLight intensity={1.05} />
      <directionalLight castShadow intensity={1.8} position={[4.5, 6, 7]} shadow-mapSize-width={props.mobile ? 512 : 1024} shadow-mapSize-height={props.mobile ? 512 : 1024} shadow-camera-left={-6} shadow-camera-right={6} shadow-camera-top={5} shadow-camera-bottom={-5} shadow-radius={props.mobile ? 5 : 7} shadow-bias={-0.0002} />
      <directionalLight intensity={0.25} position={[-3, 1, 4]} />
      <Scene {...props} onTransitionChange={handleTransitionChange} onPageTurnComplete={handlePageTurnComplete} onRenderActivityChange={setSceneMotion} />
    </Canvas>
  );
}
