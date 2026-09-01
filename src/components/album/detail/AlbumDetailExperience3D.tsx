import { Canvas, createPortal, useFrame, useLoader, useThree } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { RefObject } from 'react';
import * as THREE from 'three';
import type { Album } from '../../../data/albums';
import { assetUrl } from '../../../utils/assetUrl';
import { PACKAGE_PANEL } from '../packageGeometry';
import { getPackageProfile } from './packageProfile';
import type { PackageProfile } from './packageProfile';
import { DiscMotion } from './discMotion';
import { PackageFade } from './packageFade';
import { needsContinuousAlbumFrames } from './renderPolicy';
import { CdPolycarbonateMaterial, IvoryEdgeMaterial, OuterPlasticMaterial, PrintedPaperMaterial, TrayClearPlasticMaterial } from '../PackageMaterials';

export type ExperienceMode = 'CLOSED' | 'ALBUM_OPEN' | 'BOOKLET_FOCUS' | 'PLAYER_FOCUS';
export type BookletBounds = { left: number; top: number; width: number; height: number };

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
  preloadInterior?: boolean;
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

function RenderScheduler({ active }: { active: boolean }) {
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    invalidate();
    if (!active) return undefined;
    let frame = 0;
    const render = () => {
      invalidate();
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frame);
  }, [active, invalidate]);
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
const PAGE_TURN_DURATION = 0.72;
const PAGE_TURN_SEGMENTS = 48;
const BOOKLET_EDGE_INSET = 0.003;
const MAX_ANIMATION_DELTA = 1 / 30;
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

function useCoreTextures(album: Album, loadInterior: boolean): CoreTextures {
  const { gl } = useThree();
  const hero = album.albumHero!;
  const detail = album.detailExperience!;
  const outerUrls = [hero.textures.front!, hero.textures.back!, hero.textures.spineLeft!]
    .map((url) => assetUrl(url)!);
  const outer = useLoader(THREE.TextureLoader, outerUrls) as THREE.Texture[];
  const [interior, setInterior] = useState<InteriorTextures | null>(null);
  useMemo(() => configureTextures(outer, gl.capabilities.getMaxAnisotropy()), [gl, outer]);

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
      .catch(() => undefined);
    return () => {
      cancelled = true;
      loaded?.forEach((texture) => texture.dispose());
    };
  }, [album, detail, gl, loadInterior]);

  return {
    front: outer[0], back: outer[1], spine: outer[2], interior,
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
      if (mode !== 'PLAYER_FOCUS') tiltTarget.current = { x: 0, y: 0 };
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
    onSettled(transformError + tiltError < 0.015);

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
  const { dimensions, backInnerZ, trayPlateZ, recessZ, hubZ } = profile;
  useFrame((_, delta) => {
    const group = trayContext.current;
    if (!group) return;
    const step = animationDelta(delta);
    const target = mode === 'PLAYER_FOCUS' ? 0 : mode === 'BOOKLET_FOCUS' ? 0.48 : 1;
    opacity.current = THREE.MathUtils.lerp(opacity.current, target, reduced ? 1 : 1 - Math.exp(-7 * step));
    group.visible = opacity.current > 0.002;
    group.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      const material = object.material as THREE.Material;
      material.opacity = Number(object.userData.baseOpacity) * opacity.current;
    });
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
        {profile.scanned
          ? <ScannedTrayAccents dimensions={dimensions} recessZ={recessZ} hubZ={hubZ} />
          : <mesh position={[0, 0, hubZ]} rotation={[Math.PI / 2, 0, 0]} castShadow userData={{ baseOpacity: 0.62 }}><cylinderGeometry args={[0.16, 0.145, 0.018, 32]} /><TrayClearPlasticMaterial opacity={0.3} thickness={0.012} /></mesh>}
      </group>
    </group>
    {createPortal(<CdDisc label={label} profile={profile} tray={cdTray} mode={mode} playing={playing} reduced={reduced} onPlayer={onPlayer} onSettled={onDiscSettled} onAnchor={onCdAnchor} />, scene)}
  </>;
}

function ScannedTrayAccents({ dimensions, recessZ, hubZ }: {
  dimensions: PackageProfile['dimensions'];
  recessZ: number;
  hubZ: number;
}) {
  const supports = useRef<THREE.InstancedMesh>(null);
  const hubTeeth = useRef<THREE.InstancedMesh>(null);
  const supportRadius = Math.min(dimensions.backWidth, dimensions.backHeight) * 0.405;
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
    <mesh position={[0, 0, recessZ + 0.01]} userData={{ baseOpacity: 0.32 }}>
      <shapeGeometry args={[panelBorder]} />
      <TrayClearPlasticMaterial opacity={0.24} thickness={0.008} />
    </mesh>
    <mesh position={[0, 0, recessZ + 0.012]} castShadow userData={{ baseOpacity: 0.72 }}>
      <torusGeometry args={[CD_RADIUS + 0.018, 0.022, 8, 96]} />
      <TrayClearPlasticMaterial opacity={0.44} thickness={0.012} />
    </mesh>
    <instancedMesh ref={supports} args={[undefined, undefined, 4]} position={[0, 0, recessZ + 0.013]} castShadow userData={{ baseOpacity: 0.62 }}>
      <cylinderGeometry args={[0.108, 0.126, 0.022, 24]} />
      <TrayClearPlasticMaterial opacity={0.38} thickness={0.014} />
    </instancedMesh>
    <mesh position={[0, 0, hubZ]} rotation={[Math.PI / 2, 0, 0]} castShadow userData={{ baseOpacity: 0.68 }}>
      <cylinderGeometry args={[0.165, 0.152, 0.026, 32]} />
      <TrayClearPlasticMaterial opacity={0.4} thickness={0.016} />
    </mesh>
    <instancedMesh ref={hubTeeth} args={[undefined, undefined, 8]} position={[0, 0, hubZ + 0.018]} castShadow userData={{ baseOpacity: 0.76 }}>
      <boxGeometry args={[0.04, 0.115, 0.022]} />
      <TrayClearPlasticMaterial opacity={0.46} thickness={0.012} />
    </instancedMesh>
  </>;
}

type PageTurn = { key: number; source: number; target: number; direction: -1 | 1 };

function bookletCurrentIndices(page: number, mobile: boolean, pageCount: number) {
  if (mobile) return page >= 0 && page < pageCount ? [page] : [];
  const first = page * 2;
  if (first < 0 || first >= pageCount) return [];
  return first + 1 < pageCount ? [first, first + 1] : [first];
}

function bookletTextureIndices(page: number, mobile: boolean, pageCount: number) {
  const indices = new Set<number>();
  if (mobile) {
    for (let index = page - 1; index <= page + 1; index += 1) {
      if (index >= 0 && index < pageCount) indices.add(index);
    }
  } else {
    const spreadCount = Math.ceil(pageCount / 2);
    for (let spread = page - 1; spread <= page + 1; spread += 1) {
      if (spread < 0 || spread >= spreadCount) continue;
      indices.add(spread * 2);
      if (spread * 2 + 1 < pageCount) indices.add(spread * 2 + 1);
    }
  }
  return Array.from(indices).sort((a, b) => a - b);
}

function useBookletTextureWindow(album: Album, page: number, mobile: boolean) {
  const { gl } = useThree();
  const urls = useMemo(
    () => album.booklet!.previewImages.slice(1).map(({ src }) => assetUrl(src)!),
    [album],
  );
  const wanted = useMemo(() => bookletTextureIndices(page, mobile, urls.length), [mobile, page, urls.length]);
  const current = useMemo(() => bookletCurrentIndices(page, mobile, urls.length), [mobile, page, urls.length]);
  const [textures, setTextures] = useState(() => new Map<number, THREE.Texture>());
  const texturesForCleanup = useRef(textures);
  useEffect(() => { texturesForCleanup.current = textures; }, [textures]);

  useEffect(() => {
    let cancelled = false;
    const retained = texturesForCleanup.current;
    const wantedSet = new Set(wanted);
    retained.forEach((texture, index) => {
      if (wantedSet.has(index)) return;
      retained.delete(index);
      texture.dispose();
    });
    setTextures(new Map(retained));
    const loader = new THREE.TextureLoader();
    const load = async (indices: number[], prewarm: boolean) => {
      const missing = indices.filter((index) => !texturesForCleanup.current.has(index));
      if (missing.length === 0) return;
      const loaded = await Promise.all(missing.map(async (index) => ({ index, texture: await loader.loadAsync(urls[index]) })));
      if (cancelled) {
        loaded.forEach(({ texture }) => texture.dispose());
        return;
      }
      configureBookletTextures(loaded.map(({ texture }) => texture), gl.capabilities.getMaxAnisotropy());
      for (const { index, texture } of loaded) {
        if (cancelled) {
          texture.dispose();
          continue;
        }
        if (prewarm) {
          await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
          if (cancelled) {
            texture.dispose();
            continue;
          }
          gl.initTexture(texture);
        }
        const existing = texturesForCleanup.current.get(index);
        if (existing) {
          texture.dispose();
          continue;
        }
        texturesForCleanup.current.set(index, texture);
        setTextures(new Map(texturesForCleanup.current));
      }
    };
    void (async () => {
      try {
        await load(current, false);
        if (cancelled) return;
        await load(wanted.filter((index) => !current.includes(index)), true);
      } catch {
        // A missing optional preview must not take down the whole album scene.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [current, gl, urls, wanted]);

  useEffect(() => () => {
    texturesForCleanup.current.forEach((texture) => texture.dispose());
    texturesForCleanup.current.clear();
  }, []);

  return { textures, urls };
}

function BookletPages({ album, page, mobile, reduced, active, onReady, onPageTurnComplete, onPrevious, onNext }: {
  album: Album; page: number; mobile: boolean; reduced: boolean; active: boolean;
  onPrevious(): void; onNext(): void;
  onReady(): void; onPageTurnComplete(): void;
}) {
  const previous = useRef(page);
  const [settled, setSettled] = useState(page);
  const [turn, setTurn] = useState<PageTurn | null>(null);
  const window = useBookletTextureWindow(album, settled, mobile);
  const currentIndices = bookletCurrentIndices(page, mobile, window.urls.length);
  const ready = currentIndices.every((index) => window.textures.has(index));
  const pages = window.urls.map((_, index) => window.textures.get(index)) as THREE.Texture[];
  useEffect(() => { if (ready) onReady(); }, [onReady, ready]);
  useEffect(() => {
    if (!active || !ready) return;
    if (previous.current === page) return;
    const source = previous.current;
    previous.current = page;
    if (reduced) {
      queueMicrotask(() => {
        setSettled(page);
        onPageTurnComplete();
      });
      return;
    }
    setTurn({ key: Date.now(), source, target: page, direction: page > source ? 1 : -1 });
  }, [active, onPageTurnComplete, page, ready, reduced]);
  const completeTurn = () => {
    if (!turn) return;
    previous.current = turn.target;
    setSettled(turn.target);
    setTurn(null);
    onPageTurnComplete();
  };
  if (!ready) return null;
  const scannedColorGrade = album.id === 'han-beom-su-haegeum-sanjo-2020'
    ? { contrast: 1.08, gamma: 1.025 }
    : { contrast: 1, gamma: 1 };
  const aspect = textureAspect(pages[currentIndices[0]]);
  const width = PAGE_HEIGHT * aspect;
  if (mobile) {
    if (turn) return <MobileTurningPage key={turn.key} pages={pages} turn={turn} onDone={completeTurn} {...scannedColorGrade} />;
    const base = pages[settled];
    return <mesh castShadow receiveShadow><planeGeometry args={[PAGE_HEIGHT * textureAspect(base), PAGE_HEIGHT, 16, 2]} /><PaperMaterial texture={base} {...scannedColorGrade} /></mesh>;
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
      <mesh position={[-width / 2, 0, leftStackZ]} castShadow receiveShadow><planeGeometry args={[width, PAGE_HEIGHT, 16, 2]} /><PaperMaterial texture={left} {...scannedColorGrade} /></mesh>
      <mesh position={[width / 2, 0, 0]} castShadow receiveShadow onClick={active ? (event) => { event.stopPropagation(); onNext(); } : undefined}><planeGeometry args={[width, PAGE_HEIGHT, 16, 2]} /><PaperMaterial texture={right} {...scannedColorGrade} /></mesh>
      {active && <mesh position={[-width / 2, 0, leftStackZ + 0.001]} userData={{ keepOpacity: true }} onClick={(event) => { event.stopPropagation(); onPrevious(); }}>
        <planeGeometry args={[width, PAGE_HEIGHT]} /><meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>}
      {turn && <TurningPage key={turn.key} pages={pages} width={width} turn={turn} onDone={completeTurn} {...scannedColorGrade} />}
    </group>
  );
}

function MobileTurningPage({ pages, turn, onDone, contrast, gamma }: {
  pages: THREE.Texture[]; turn: PageTurn; onDone(): void; contrast: number; gamma: number;
}) {
  const leaf = useRef<THREE.Group>(null);
  const elapsed = useRef(0);
  const done = useRef(false);
  const source = pages[turn.source];
  const target = pages[turn.target];
  const sourceWidth = PAGE_HEIGHT * textureAspect(source);
  const targetWidth = PAGE_HEIGHT * textureAspect(target);
  const side = turn.direction > 0 ? -1 : 1;
  useFrame((_, delta) => {
    if (!leaf.current) return;
    elapsed.current = Math.min(0.48, elapsed.current + animationDelta(delta));
    const progress = elapsed.current / 0.48;
    const eased = progress * progress * (3 - 2 * progress);
    leaf.current.rotation.y = side * Math.PI * eased;
    leaf.current.rotation.z = side * Math.sin(Math.PI * progress) * 0.035;
    if (progress === 1 && !done.current) { done.current = true; onDone(); }
  });
  return (
    <group>
      <mesh position={[0, 0, -0.006]} castShadow receiveShadow><planeGeometry args={[targetWidth, PAGE_HEIGHT, 16, 3]} /><PaperMaterial texture={target} contrast={contrast} gamma={gamma} /></mesh>
      <group ref={leaf} position={[-side * sourceWidth / 2, 0, 0.01]}>
        <mesh position={[side * sourceWidth / 2, 0, 0]} castShadow frustumCulled={false}><planeGeometry args={[sourceWidth, PAGE_HEIGHT, 24, 4]} /><PaperMaterial texture={source} contrast={contrast} gamma={gamma} /></mesh>
      </group>
    </group>
  );
}

function TurningPage({ pages, width, turn, onDone, frontTexture, backTexture, duration = PAGE_TURN_DURATION, contrast = 1, gamma = 1 }: {
  pages: THREE.Texture[]; width: number; turn: { source: number; target: number; direction: -1 | 1 }; onDone(): void;
  frontTexture?: THREE.Texture; backTexture?: THREE.Texture; duration?: number; contrast?: number; gamma?: number;
}) {
  const frontSurface = useRef<THREE.Mesh>(null);
  const backSurface = useRef<THREE.Mesh>(null);
  const elapsed = useRef(0);
  const done = useRef(false);
  const arc = useRef({ x: new Float32Array(PAGE_TURN_SEGMENTS + 1), z: new Float32Array(PAGE_TURN_SEGMENTS + 1) });
  const front = frontTexture ?? (turn.direction > 0 ? pages[turn.source * 2 + 1] : pages[turn.source * 2]);
  const back = backTexture ?? (turn.direction > 0 ? pages[turn.target * 2] : pages[turn.target * 2 + 1]);
  useFrame((_, delta) => {
    if (!frontSurface.current || !backSurface.current) return;
    elapsed.current = Math.min(duration, elapsed.current + animationDelta(delta));
    const t = elapsed.current / duration;
    const side = turn.direction > 0 ? 1 : -1;
    const segmentLength = width / PAGE_TURN_SEGMENTS;
    const arcX = arc.current.x;
    const arcZ = arc.current.z;
    arcX[0] = 0;
    arcZ[0] = 0;
    // Integrating each column's tangent preserves the sheet's width while the
    // gutter leads and the outer edge follows. It avoids collapsing every
    // vertex through x=0 as a linear horizontal reflection would.
    for (let column = 1; column <= PAGE_TURN_SEGMENTS; column += 1) {
      const previousNormalized = (column - 1) / PAGE_TURN_SEGMENTS;
      const normalized = column / PAGE_TURN_SEGMENTS;
      const previousLocal = THREE.MathUtils.clamp((t - previousNormalized * 0.28) / 0.72, 0, 1);
      const local = THREE.MathUtils.clamp((t - normalized * 0.28) / 0.72, 0, 1);
      const previousEase = previousLocal * previousLocal * (3 - 2 * previousLocal);
      const paperEase = local * local * (3 - 2 * local);
      const tangentAngle = Math.PI * (previousEase + paperEase) / 2;
      arcX[column] = arcX[column - 1] + Math.cos(tangentAngle) * segmentLength;
      arcZ[column] = arcZ[column - 1] + Math.sin(tangentAngle) * segmentLength * 0.34;
    }
    [frontSurface.current, backSurface.current].forEach((mesh) => {
      const positions = mesh.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < positions.count; i += 1) {
        const originalX = (mesh.geometry.userData.original as Float32Array)[i];
        const normalized = THREE.MathUtils.clamp(side > 0 ? originalX / width + 0.5 : 0.5 - originalX / width, 0, 1);
        const column = Math.round(normalized * PAGE_TURN_SEGMENTS);
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
        <planeGeometry args={[width, PAGE_HEIGHT, PAGE_TURN_SEGMENTS, 8]} /><PrintedPaperMaterial texture={front} side={THREE.FrontSide} contrast={contrast} gamma={gamma} />
      </mesh>
      <mesh ref={(node) => { backSurface.current = node; if (node && !node.geometry.userData.original) { node.geometry.userData.original = Float32Array.from(Array.from({ length: node.geometry.attributes.position.count }, (_, i) => (node.geometry.attributes.position as THREE.BufferAttribute).getX(i))); const uv = node.geometry.attributes.uv as THREE.BufferAttribute; for (let i = 0; i < uv.count; i += 1) uv.setX(i, 1 - uv.getX(i)); uv.needsUpdate = true; } }} position={[0, 0, -0.002]} castShadow frustumCulled={false}>
        <planeGeometry args={[width, PAGE_HEIGHT, PAGE_TURN_SEGMENTS, 8]} /><PrintedPaperMaterial texture={back} side={THREE.BackSide} contrast={contrast} gamma={gamma} />
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
  const { camera, gl, scene, size, viewport } = useThree();
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
  const detached = useRef(false);
  const originalParent = useRef<THREE.Object3D | null>(null);
  const lastBounds = useRef<BookletBounds | null>(null);
  const p1Width = PAGE_HEIGHT * textureAspect(p1);
  const mountPosition = useMemo(() => new THREE.Vector3(-p1Width / 2, 0, 0.08), [p1Width]);

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
    const step = animationDelta(delta);
    if (phase === 'ENTERING' && !detached.current && rig.current.parent) {
      originalParent.current = rig.current.parent;
      scene.attach(rig.current);
      detached.current = true;
    }
    const ease = reduced ? 1 : 1 - Math.exp(-7 * step);
    const fadeEase = reduced ? 1 : 1 - Math.exp(-12 * step);
    const targetPosition = mountPosition.clone();
    const targetQuaternion = new THREE.Quaternion();
    const targetScale = new THREE.Vector3(1, 1, 1);
    if ((phase === 'ENTERING' || phase === 'READING') && detached.current) {
      const desiredPosition = new THREE.Vector3(0, mobile ? 0.35 : 0.08, 0.82);
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
      const desiredWorld = new THREE.Matrix4().compose(
        desiredPosition,
        new THREE.Quaternion().setFromEuler(new THREE.Euler(mobile ? -0.04 : -0.08, 0, 0)),
        new THREE.Vector3(mobile ? mobileFocusScale : desktopFocusScale, mobile ? mobileFocusScale : desktopFocusScale, mobile ? mobileFocusScale : desktopFocusScale),
      );
      desiredWorld.decompose(targetPosition, targetQuaternion, targetScale);
    } else if (phase === 'RETURNING' && detached.current && originalParent.current) {
      originalParent.current.updateWorldMatrix(true, false);
      const mountMatrix = new THREE.Matrix4().compose(mountPosition, new THREE.Quaternion(), new THREE.Vector3(1, 1, 1));
      originalParent.current.matrixWorld.clone().multiply(mountMatrix).decompose(targetPosition, targetQuaternion, targetScale);
    }
    rig.current.position.lerp(targetPosition, ease);
    rig.current.quaternion.slerp(targetQuaternion, ease);
    rig.current.scale.lerp(targetScale, ease);
    opacity.current = THREE.MathUtils.lerp(opacity.current, mode === 'PLAYER_FOCUS' ? 0 : 1, ease);
    setGroupOpacity(rig.current, opacity.current);

    const transformError = rig.current.position.distanceTo(targetPosition)
      + rig.current.quaternion.angleTo(targetQuaternion)
      + rig.current.scale.distanceTo(targetScale);
    const canRevealReader = detailsReady && (phase === 'READING' || (phase === 'ENTERING' && transformError < 0.055));
    const coverTarget = canRevealReader ? 0 : 1;
    const readerTarget = canRevealReader ? 1 : 0;
    coverOpacity.current = THREE.MathUtils.lerp(coverOpacity.current, coverTarget, fadeEase);
    readerOpacity.current = THREE.MathUtils.lerp(readerOpacity.current, readerTarget, fadeEase);
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
    if (phase === 'RETURNING' && crossfadeError < 0.035 && transformError < 0.035) {
      if (detached.current && originalParent.current) {
        originalParent.current.attach(rig.current);
        rig.current.position.copy(mountPosition);
        rig.current.quaternion.identity();
        rig.current.scale.setScalar(1);
        detached.current = false;
      }
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

type SceneProps = ExperienceProps & { onRenderActivityChange(active: boolean): void };

function Scene(props: SceneProps) {
  const { album, mode, page, mobile, playing, reduced, homeActivationKey, onOpen, onBooklet, onPlayer, onPrevious, onNext, onCdAnchor, onBookletBounds, onTransitionChange, onRenderActivityChange } = props;
  const openPitch = mobile ? -0.1 : 0;
  const wantsInterior = Boolean(props.preloadInterior || mode !== 'CLOSED');
  const [interiorRequested, setInteriorRequested] = useState(wantsInterior);
  if (wantsInterior && !interiorRequested) setInteriorRequested(true);
  // Retain loaded internals through CLOSE/HOME. Dispose only when the scene leaves.
  const loadInterior = wantsInterior || interiorRequested;
  const textures = useCoreTextures(album, loadInterior);
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
    const openingFromClosed = previousMode.current === 'CLOSED' && mode !== 'CLOSED';
    if (openingFromClosed) {
      autoRotate.current = false;
      onRenderActivityChange(false);
      inertia.current = { x: 0, y: 0 };
      alignedYaw.current = Math.round(rotation.current.y / (Math.PI * 2)) * Math.PI * 2;
      aligned.current = false;
      openingPhaseRef.current = 'OPENING';
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
    if (closed && autoRotate.current && !reduced) rotation.current.y += step * Math.PI / 12;
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
    if (!closed && !aligned.current) {
      rotation.current.x = THREE.MathUtils.lerp(rotation.current.x, openPitch, ease);
      rotation.current.y = THREE.MathUtils.lerp(rotation.current.y, alignedYaw.current, ease);
    }
    packageRig.current.rotation.x = THREE.MathUtils.lerp(packageRig.current.rotation.x, closed || openInteractive ? rotation.current.x : openPitch, ease);
    packageRig.current.rotation.y = THREE.MathUtils.lerp(packageRig.current.rotation.y, closed || openInteractive ? rotation.current.y : alignedYaw.current, ease);
    const targetHinge = closed ? 0 : OPEN_ANGLE;
    hinge.current.rotation.y = THREE.MathUtils.lerp(hinge.current.rotation.y, targetHinge, ease);
    const keepClosedTransform = closed;
    const mobileClosedScale = viewport.width * 0.69 / panelWidth;
    const mobileOpenScale = viewport.width * 0.9 / (panelWidth * 1.94);
    const mobilePlayerScale = viewport.width * 0.62 / (CD_RADIUS * 2);
    const mobileOpenX = halfPanel * mobileOpenScale;
    const x = keepClosedTransform ? closedX : mode === 'BOOKLET_FOCUS' ? 1.05 : mode === 'PLAYER_FOCUS' ? (mobile ? 0 : 0.68) : (mobile ? mobileOpenX : halfPanel * 1.08);
    const y = mobile
      ? (keepClosedTransform ? viewport.height * 0.2 : mode === 'PLAYER_FOCUS' ? viewport.height * 0.2 : viewport.height * 0.1)
      : 0.05;
    const scale = keepClosedTransform
      ? (mobile ? mobileClosedScale : 1.18)
      : mode === 'BOOKLET_FOCUS'
        ? (mobile ? mobileOpenScale : 0.76)
        : mode === 'PLAYER_FOCUS'
          ? (mobile ? mobilePlayerScale : 0.82)
          : (mobile ? mobileOpenScale : 1.08);
    packageRig.current.position.x = THREE.MathUtils.lerp(packageRig.current.position.x, x, ease);
    packageRig.current.position.y = THREE.MathUtils.lerp(packageRig.current.position.y, y, ease);
    const targetZ = mode === 'BOOKLET_FOCUS' ? -1 : mode === 'PLAYER_FOCUS' ? -0.9 : 0;
    packageRig.current.position.z = THREE.MathUtils.lerp(packageRig.current.position.z, targetZ, ease);
    packageRig.current.scale.setScalar(THREE.MathUtils.lerp(packageRig.current.scale.x, scale, ease));
    const fadeTarget = mode === 'PLAYER_FOCUS' ? 0 : 1;
    packageOpacity.current = THREE.MathUtils.lerp(packageOpacity.current, fadeTarget, ease);
    shellFade.update(packageOpacity.current);
    const packageError = Math.abs(packageOpacity.current - fadeTarget) + Math.abs(packageRig.current.position.x - x)
      + Math.abs(packageRig.current.position.y - y)
      + Math.abs(packageRig.current.position.z - targetZ)
      + Math.abs(packageRig.current.scale.x - scale);
    const hingeError = Math.abs(hinge.current.rotation.y - targetHinge);
    const alignmentError = closed ? 0 : Math.abs(rotation.current.x - openPitch) + Math.abs(rotation.current.y - alignedYaw.current);
    if (openingPhaseRef.current === 'OPENING' && alignmentError < 0.025 && hingeError < 0.04 && packageError < 0.055) {
      aligned.current = true;
      openingPhaseRef.current = 'IDLE';
    }
    const openingFromClosedComplete = closed || openingPhaseRef.current === 'IDLE';
    const complete = aligned.current
      && openingFromClosedComplete
      && hingeError < 0.04
      && packageError < 0.055
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
                <BookletRig album={album} p1={textures.interior.p1} mode={mode} page={page} mobile={mobile} reduced={reduced} onBooklet={onBooklet} onSettled={setBookletSettled} onPageTurnComplete={() => props.onPageTurnComplete?.()} onPrevious={onPrevious} onNext={onNext} onBounds={onBookletBounds} />
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
  const previousPage = useRef(props.page);
  useEffect(() => {
    if (previousPage.current !== props.page) {
      previousPage.current = props.page;
      setPageTurning(true);
    }
  }, [props.page]);
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
    sceneTransitioning,
    pageTurning,
    sceneMotion,
  });
  return (
    <Canvas aria-label={`열고 탐색할 수 있는 ${props.album.title} 3D 디지팩`} camera={{ position: [0, 0, 7], fov: 42 }} dpr={[1, 2]} frameloop="demand" shadows="soft" gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}>
      <RenderScheduler active={continuous} />
      <ambientLight intensity={1.05} />
      <directionalLight castShadow intensity={1.8} position={[4.5, 6, 7]} shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-camera-left={-6} shadow-camera-right={6} shadow-camera-top={5} shadow-camera-bottom={-5} shadow-radius={7} shadow-bias={-0.0002} />
      <directionalLight intensity={0.25} position={[-3, 1, 4]} />
      <Scene {...props} onTransitionChange={handleTransitionChange} onPageTurnComplete={handlePageTurnComplete} onRenderActivityChange={setSceneMotion} />
    </Canvas>
  );
}
