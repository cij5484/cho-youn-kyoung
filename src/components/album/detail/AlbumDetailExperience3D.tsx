import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import type { Album } from '../../../data/albums';
import { assetUrl } from '../../../utils/assetUrl';

export type ExperienceMode = 'CLOSED' | 'ALBUM_OPEN' | 'BOOKLET_FOCUS' | 'PLAYER_FOCUS';

type ExperienceProps = {
  album: Album;
  mode: ExperienceMode;
  page: number;
  pageDirection: -1 | 0 | 1;
  mobile: boolean;
  playing: boolean;
  reduced: boolean;
  onOpen(): void;
  onBooklet(): void;
  onPlayer(): void;
};

type LoadedTextures = {
  front: THREE.Texture;
  back: THREE.Texture;
  spine: THREE.Texture;
  interiorBooklet: THREE.Texture;
  interiorTray: THREE.Texture;
  cdLabel: THREE.Texture;
  booklet: THREE.Texture[];
};

const PANEL_WIDTH = 2.56;
const PANEL_HEIGHT = 2.56;
const PANEL_CENTER_X = PANEL_WIDTH / 2;
const OPEN_ANGLE = THREE.MathUtils.degToRad(158);
const PAGE_WIDTH = 1.72;
const PAGE_HEIGHT = 2.2;
const PAGE_TURN_DURATION = 0.82;

function useAlbumTextures(album: Album): LoadedTextures {
  const hero = album.albumHero!;
  const detail = album.detailExperience!;
  const pageUrls = album.booklet!.previewImages.map((image) => image.src);
  const urls = [
    hero.textures.front!,
    hero.textures.back!,
    hero.textures.spineLeft!,
    detail.interior.bookletPanel,
    detail.interior.trayPanel,
    album.cdLabelImage!,
    ...pageUrls,
  ].map((url) => assetUrl(url)!);
  const loaded = useLoader(THREE.TextureLoader, urls) as THREE.Texture[];

  loaded.forEach((texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(8, texture.anisotropy || 8);
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.generateMipmaps = true;
  });

  return {
    front: loaded[0],
    back: loaded[1],
    spine: loaded[2],
    interiorBooklet: loaded[3],
    interiorTray: loaded[4],
    cdLabel: loaded[5],
    booklet: loaded.slice(6),
  };
}

function PrintedSurface({ texture, opacity = 1 }: { texture: THREE.Texture; opacity?: number }) {
  return (
    <meshStandardMaterial
      map={texture}
      metalness={0}
      opacity={opacity}
      roughness={0.9}
      transparent={opacity < 1}
    />
  );
}

function CdDisc({
  label,
  mode,
  playing,
  reduced,
  onPlayer,
}: {
  label: THREE.Texture;
  mode: ExperienceMode;
  playing: boolean;
  reduced: boolean;
  onPlayer(): void;
}) {
  const disc = useRef<THREE.Group>(null);
  const angularVelocity = useRef(0);
  const shape = useMemo(() => {
    const result = new THREE.Shape();
    result.absarc(0, 0, 0.84, 0, Math.PI * 2);
    const centerHole = new THREE.Path();
    centerHole.absarc(0, 0, 0.13, 0, Math.PI * 2);
    result.holes.push(centerHole);
    return result;
  }, []);

  useFrame((_, delta) => {
    if (!disc.current) return;
    const easing = reduced ? 1 : 1 - Math.exp(-6 * delta);
    const targetZ = mode === 'PLAYER_FOCUS' ? 0.27 : 0.15;
    disc.current.position.z = THREE.MathUtils.lerp(disc.current.position.z, targetZ, easing);

    const targetVelocity = playing && !reduced ? (Math.PI * 2) / 18 : 0;
    angularVelocity.current = THREE.MathUtils.lerp(
      angularVelocity.current,
      targetVelocity,
      1 - Math.exp(-3.5 * delta),
    );
    disc.current.rotation.z -= angularVelocity.current * delta;
  });

  return (
    <group
      ref={disc}
      position={[0, 0, 0.15]}
      onClick={(event) => {
        event.stopPropagation();
        onPlayer();
      }}
    >
      <mesh castShadow>
        <extrudeGeometry
          args={[shape, { depth: 0.035, bevelEnabled: false, curveSegments: 64 }]}
        />
        <meshPhysicalMaterial
          color="#deddd8"
          metalness={0}
          opacity={0.84}
          roughness={0.42}
          transparent
        />
      </mesh>
      <mesh position={[0, 0, 0.038]}>
        <ringGeometry args={[0.155, 0.78, 64]} />
        <meshStandardMaterial map={label} metalness={0} roughness={0.58} transparent />
      </mesh>
      <mesh position={[0, 0, 0.039]}>
        <ringGeometry args={[0.13, 0.155, 64]} />
        <meshPhysicalMaterial color="#e9e7df" opacity={0.64} roughness={0.5} transparent />
      </mesh>
    </group>
  );
}

function CdTray({
  textures,
  mode,
  playing,
  reduced,
  onPlayer,
}: {
  textures: LoadedTextures;
  mode: ExperienceMode;
  playing: boolean;
  reduced: boolean;
  onPlayer(): void;
}) {
  const tray = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (!tray.current) return;
    const easing = reduced ? 1 : 1 - Math.exp(-5 * delta);
    const targetScale = mode === 'BOOKLET_FOCUS' ? 0.82 : 1;
    tray.current.scale.setScalar(THREE.MathUtils.lerp(tray.current.scale.x, targetScale, easing));
    tray.current.position.z = THREE.MathUtils.lerp(
      tray.current.position.z,
      mode === 'BOOKLET_FOCUS' ? -0.45 : 0,
      easing,
    );
  });

  const trayOpacity = mode === 'PLAYER_FOCUS' ? 0.2 : mode === 'BOOKLET_FOCUS' ? 0.18 : 0.42;
  return (
    <group ref={tray} position={[PANEL_CENTER_X, 0, 0]}>
      <mesh position={[0, 0, -0.04]} castShadow>
        <boxGeometry args={[PANEL_WIDTH, PANEL_HEIGHT, 0.08]} />
        <PrintedSurface texture={textures.back} />
      </mesh>
      <mesh position={[0, 0, 0.012]}>
        <planeGeometry args={[2.48, 2.48]} />
        <PrintedSurface texture={textures.interiorTray} />
      </mesh>
      <mesh position={[0, 0, 0.085]}>
        <boxGeometry args={[2.12, 2.12, 0.045]} />
        <meshPhysicalMaterial
          color="#dedbd0"
          metalness={0}
          opacity={trayOpacity}
          roughness={0.68}
          transparent
          transmission={0.05}
        />
      </mesh>
      <mesh position={[0, 0, 0.12]}>
        <ringGeometry args={[0.85, 0.94, 64]} />
        <meshPhysicalMaterial color="#e5e2d8" opacity={trayOpacity} roughness={0.72} transparent />
      </mesh>
      <mesh position={[0, 0, 0.14]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.07, 32]} />
        <meshPhysicalMaterial color="#ddd9cf" opacity={trayOpacity + 0.1} roughness={0.65} transparent />
      </mesh>
      <CdDisc
        label={textures.cdLabel}
        mode={mode}
        onPlayer={onPlayer}
        playing={playing}
        reduced={reduced}
      />
    </group>
  );
}

function MovingFrontPanel({
  textures,
  mode,
  reduced,
  onBooklet,
}: {
  textures: LoadedTextures;
  mode: ExperienceMode;
  reduced: boolean;
  onBooklet(): void;
}) {
  const hinge = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (!hinge.current) return;
    const target = mode === 'CLOSED' ? 0 : OPEN_ANGLE;
    const easing = reduced ? 1 : 1 - Math.exp(-5 * delta);
    hinge.current.rotation.y = THREE.MathUtils.lerp(hinge.current.rotation.y, target, easing);
  });

  return (
    <group ref={hinge}>
      <group position={[PANEL_CENTER_X, 0, 0.085]}>
        <mesh castShadow>
          <boxGeometry args={[PANEL_WIDTH, PANEL_HEIGHT, 0.08]} />
          <meshStandardMaterial color="#dfd9ce" metalness={0} roughness={0.94} />
        </mesh>
        <mesh position={[0, 0, 0.041]}>
          <planeGeometry args={[2.5, 2.5]} />
          <PrintedSurface texture={textures.front} />
        </mesh>
        <mesh position={[0, 0, -0.041]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[2.5, 2.5]} />
          <PrintedSurface texture={textures.interiorBooklet} />
        </mesh>
        {mode === 'ALBUM_OPEN' && (
          <group
            position={[0, 0, -0.09]}
            rotation={[0, Math.PI, 0]}
            onClick={(event) => {
              event.stopPropagation();
              onBooklet();
            }}
          >
            <mesh castShadow>
              <boxGeometry args={[1.75, 2.18, 0.055]} />
              <meshStandardMaterial map={textures.booklet[0]} metalness={0} roughness={0.92} />
            </mesh>
          </group>
        )}
      </group>
      <mesh position={[0.001, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.08, PANEL_HEIGHT]} />
        <PrintedSurface texture={textures.spine} />
      </mesh>
    </group>
  );
}

function CurledTurningPage({
  frontTexture,
  backTexture,
  direction,
  reduced,
  turnKey,
  onComplete,
}: {
  frontTexture: THREE.Texture;
  backTexture: THREE.Texture;
  direction: -1 | 1;
  reduced: boolean;
  turnKey: number;
  onComplete(): void;
}) {
  const pivot = useRef<THREE.Group>(null);
  const frontSurface = useRef<THREE.Mesh>(null);
  const backSurface = useRef<THREE.Mesh>(null);
  const elapsed = useRef(0);
  const completed = useRef(false);

  useEffect(() => {
    elapsed.current = 0;
    completed.current = false;
    if (pivot.current) {
      pivot.current.rotation.y = 0;
      pivot.current.visible = true;
    }
  }, [turnKey]);

  useFrame((_, delta) => {
    if (!pivot.current || !frontSurface.current || !backSurface.current) return;
    elapsed.current = Math.min(PAGE_TURN_DURATION, elapsed.current + delta);
    const linear = reduced ? 1 : elapsed.current / PAGE_TURN_DURATION;
    const progress = linear * linear * (3 - 2 * linear);
    // Both turns begin flat on their source side. NEXT folds the right page
    // leftward; PREVIOUS folds the left page rightward.
    pivot.current.rotation.y = direction > 0 ? -Math.PI * progress : Math.PI * progress;

    const surfaces: Array<[THREE.Mesh, number]> = [
      [frontSurface.current, 1],
      [backSurface.current, -1],
    ];
    surfaces.forEach(([surface, localDirection]) => {
      const positions = surface.geometry.attributes.position as THREE.BufferAttribute;
      for (let index = 0; index < positions.count; index += 1) {
        const x = positions.getX(index);
        const normalized = Math.abs(x) / PAGE_WIDTH;
        const curl = Math.sin(progress * Math.PI) * Math.sin(normalized * Math.PI) * 0.09;
        // The back mesh is rotated 180° around Y, so its local curl is inverted
        // to occupy the same physical paper surface as the front mesh.
        positions.setZ(index, curl * localDirection);
      }
      positions.needsUpdate = true;
    });

    if (linear >= 1 && !completed.current) {
      completed.current = true;
      pivot.current.visible = false;
      onComplete();
    }
  });

  const xOffset = direction > 0 ? PAGE_WIDTH / 2 : -PAGE_WIDTH / 2;
  return (
    <group ref={pivot} position={[0, 0, 0.035]}>
      <group position={[xOffset, 0, 0]}>
        <mesh ref={frontSurface} position={[0, 0, 0.001]}>
          <planeGeometry args={[PAGE_WIDTH, PAGE_HEIGHT, 18, 4]} />
          <meshStandardMaterial map={frontTexture} roughness={0.94} side={THREE.FrontSide} />
        </mesh>
        <mesh ref={backSurface} position={[0, 0, -0.001]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[PAGE_WIDTH, PAGE_HEIGHT, 18, 4]} />
          <meshStandardMaterial map={backTexture} roughness={0.94} side={THREE.FrontSide} />
        </mesh>
      </group>
    </group>
  );
}

function BookletFocus({
  textures,
  page,
  mobile,
  mode,
  reduced,
}: {
  textures: LoadedTextures;
  page: number;
  mobile: boolean;
  mode: ExperienceMode;
  reduced: boolean;
}) {
  const root = useRef<THREE.Group>(null);
  const previousPage = useRef(page);
  const [settledPage, setSettledPage] = useState(page);
  const [turn, setTurn] = useState({
    key: 0,
    active: false,
    sourcePage: page,
    targetPage: page,
    direction: 1 as -1 | 1,
    frontTexture: textures.booklet[2],
    backTexture: textures.booklet[3],
  });

  useEffect(() => {
    if (previousPage.current === page) return;
    const oldPage = previousPage.current;
    const direction: -1 | 1 = page > oldPage ? 1 : -1;
    const frontTexture = mobile
      ? textures.booklet[oldPage + 1]
      : textures.booklet[oldPage * 2 + (direction > 0 ? 2 : 1)];
    const backTexture = mobile
      ? textures.booklet[page + 1]
      : textures.booklet[page * 2 + (direction > 0 ? 1 : 2)];
    previousPage.current = page;
    if (reduced) {
      queueMicrotask(() => {
        setSettledPage(page);
        setTurn((current) => ({ ...current, active: false }));
      });
      return;
    }
    setTurn((current) => ({
      key: current.key + 1,
      active: true,
      sourcePage: oldPage,
      targetPage: page,
      direction,
      frontTexture,
      backTexture,
    }));
  }, [mobile, page, reduced, textures.booklet]);

  const completeTurn = () => {
    setSettledPage(turn.targetPage);
    setTurn((current) => ({ ...current, active: false }));
  };

  useFrame((_, delta) => {
    if (!root.current) return;
    const focused = mode === 'BOOKLET_FOCUS';
    const easing = reduced ? 1 : 1 - Math.exp(-5 * delta);
    const targetScale = focused ? (mobile ? 1.42 : 1.18) : 0.55;
    root.current.scale.setScalar(THREE.MathUtils.lerp(root.current.scale.x, targetScale, easing));
    root.current.position.x = THREE.MathUtils.lerp(root.current.position.x, focused ? 0 : -1.1, easing);
    root.current.position.y = THREE.MathUtils.lerp(root.current.position.y, focused ? 0.08 : -0.05, easing);
    root.current.position.z = THREE.MathUtils.lerp(root.current.position.z, focused ? 1.25 : -0.5, easing);
  });

  if (mode !== 'BOOKLET_FOCUS') return null;

  if (mobile) {
    const visiblePage = turn.active ? turn.targetPage : settledPage;
    const texture = textures.booklet[visiblePage + 1]; // P2 through P7; P1 stays on the album panel.
    return (
      <group ref={root} position={[-1.1, -0.05, -0.5]} scale={0.55}>
        <mesh castShadow>
          <planeGeometry args={[PAGE_WIDTH, PAGE_HEIGHT, 18, 4]} />
          <meshStandardMaterial map={texture} metalness={0} roughness={0.94} />
        </mesh>
        {turn.active && (
          <CurledTurningPage
            backTexture={turn.backTexture}
            direction={turn.direction}
            frontTexture={turn.frontTexture}
            onComplete={completeTurn}
            reduced={reduced}
            turnKey={turn.key}
          />
        )}
      </group>
    );
  }

  const spreads = [
    [textures.booklet[1], textures.booklet[2]], // P2 / P3
    [textures.booklet[3], textures.booklet[4]], // P4 / P5
    [textures.booklet[5], textures.booklet[6]], // P6 / P7
  ] as const;
  const sourceSpread = spreads[turn.sourcePage];
  const targetSpread = spreads[turn.targetPage];
  const settledSpread = spreads[settledPage];
  const leftPage = turn.active
    ? (turn.direction > 0 ? sourceSpread[0] : targetSpread[0])
    : settledSpread[0];
  const rightPage = turn.active
    ? (turn.direction > 0 ? targetSpread[1] : sourceSpread[1])
    : settledSpread[1];
  return (
    <group ref={root} position={[-1.1, -0.05, -0.5]} scale={0.55}>
      <mesh position={[-PAGE_WIDTH / 2, 0, 0]} castShadow>
        <planeGeometry args={[PAGE_WIDTH, PAGE_HEIGHT, 18, 4]} />
        <meshStandardMaterial map={leftPage} metalness={0} roughness={0.94} />
      </mesh>
      <mesh position={[PAGE_WIDTH / 2, 0, 0]} castShadow>
        <planeGeometry args={[PAGE_WIDTH, PAGE_HEIGHT, 18, 4]} />
        <meshStandardMaterial map={rightPage} metalness={0} roughness={0.94} />
      </mesh>
      {turn.active && (
        <CurledTurningPage
          backTexture={turn.backTexture}
          direction={turn.direction}
          frontTexture={turn.frontTexture}
          onComplete={completeTurn}
          reduced={reduced}
          turnKey={turn.key}
        />
      )}
    </group>
  );
}

function ArticulatedAlbum(props: ExperienceProps) {
  const { album, mode, page, mobile, playing, reduced, onOpen, onBooklet, onPlayer } = props;
  const textures = useAlbumTextures(album);
  const packageRig = useRef<THREE.Group>(null);
  const drag = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    lastX: number;
    lastY: number;
    movement: number;
    canvas: HTMLCanvasElement;
  } | null>(null);
  const rotation = useRef({ x: -0.12, y: 0.12 });
  const autoRotating = useRef(true);

  const finishDrag = (pointerId: number, openOnClick: boolean) => {
    const active = drag.current;
    if (!active || active.pointerId !== pointerId) return;
    if (active.canvas.hasPointerCapture(pointerId)) active.canvas.releasePointerCapture(pointerId);
    if (openOnClick && active.movement < 7 && mode === 'CLOSED') onOpen();
    drag.current = null;
  };

  useEffect(() => {
    const end = (event: PointerEvent) => finishDrag(event.pointerId, event.type === 'pointerup');
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
    return () => {
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
      drag.current = null;
    };
  });

  useFrame((_, delta) => {
    if (!packageRig.current) return;
    const closed = mode === 'CLOSED';
    if (closed && autoRotating.current && !reduced) {
      rotation.current.y += (delta * Math.PI * 2) / 30;
    }
    const easing = reduced ? 1 : 1 - Math.exp(-5 * delta);
    const targetX = mode === 'BOOKLET_FOCUS' ? 1.55 : mode === 'PLAYER_FOCUS' ? -0.82 : 0;
    const targetZ = mode === 'BOOKLET_FOCUS' ? -1.15 : mode === 'PLAYER_FOCUS' ? 0.25 : 0;
    const targetScale = mode === 'BOOKLET_FOCUS' ? 0.66 : mode === 'PLAYER_FOCUS' ? 1.02 : 0.9;
    packageRig.current.position.x = THREE.MathUtils.lerp(packageRig.current.position.x, targetX, easing);
    packageRig.current.position.z = THREE.MathUtils.lerp(packageRig.current.position.z, targetZ, easing);
    packageRig.current.scale.setScalar(THREE.MathUtils.lerp(packageRig.current.scale.x, targetScale, easing));
    packageRig.current.rotation.x = THREE.MathUtils.lerp(
      packageRig.current.rotation.x,
      closed ? rotation.current.x : -0.12,
      easing,
    );
    packageRig.current.rotation.y = THREE.MathUtils.lerp(
      packageRig.current.rotation.y,
      closed ? rotation.current.y : 0,
      easing,
    );
  });

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    if (mode !== 'CLOSED') return;
    event.stopPropagation();
    autoRotating.current = false;
    const canvas = event.nativeEvent.currentTarget as HTMLCanvasElement;
    canvas.setPointerCapture(event.pointerId);
    drag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lastY: event.clientY,
      movement: 0,
      canvas,
    };
  };

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    const active = drag.current;
    if (!active || active.pointerId !== event.pointerId || mode !== 'CLOSED') return;
    const dx = event.clientX - active.lastX;
    const dy = event.clientY - active.lastY;
    active.lastX = event.clientX;
    active.lastY = event.clientY;
    active.movement = Math.hypot(event.clientX - active.startX, event.clientY - active.startY);
    rotation.current.y += dx * 0.008;
    rotation.current.x = THREE.MathUtils.clamp(rotation.current.x + dy * 0.006, -0.48, 0.48);
  };

  return (
    <>
      <group
        ref={packageRig}
        rotation={[-0.12, 0.12, 0]}
        scale={0.9}
        onLostPointerCapture={() => {
          drag.current = null;
        }}
        onPointerCancel={(event) => finishDrag(event.pointerId, false)}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={(event) => finishDrag(event.pointerId, true)}
      >
        <CdTray
          mode={mode}
          onPlayer={onPlayer}
          playing={playing}
          reduced={reduced}
          textures={textures}
        />
        <MovingFrontPanel
          mode={mode}
          onBooklet={onBooklet}
          reduced={reduced}
          textures={textures}
        />
      </group>
      <BookletFocus
        mobile={mobile}
        mode={mode}
        page={page}
        reduced={reduced}
        textures={textures}
      />
    </>
  );
}

export default function AlbumDetailExperience3D(props: ExperienceProps) {
  return (
    <Canvas
      aria-label="열고 탐색할 수 있는 지영희류 3D 디지팩"
      camera={{ position: [0, 0, 7], fov: 42 }}
      dpr={[1, 2]}
      shadows
    >
      <ambientLight intensity={1.5} />
      <directionalLight castShadow intensity={2.2} position={[4, 6, 7]} />
      <ArticulatedAlbum {...props} />
    </Canvas>
  );
}
