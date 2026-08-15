import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
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
  mobile: boolean;
  playing: boolean;
  reduced: boolean;
  onOpen(): void;
  onBooklet(): void;
  onPlayer(): void;
  onTransitionChange?(transitioning: boolean): void;
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

const PANEL = 2.56;
const HALF_PANEL = PANEL / 2;
const SPINE_WIDTH = PANEL * 171 / 3000;
const OPEN_ANGLE = THREE.MathUtils.degToRad(160);
const PAGE_HEIGHT = 2.12;
const PAGE_TURN_DURATION = 0.86;

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
  return <meshStandardMaterial map={texture} metalness={0} roughness={0.93} />;
}

function CdDisc({ label, mode, playing, reduced, onPlayer }: {
  label: THREE.Texture; mode: ExperienceMode; playing: boolean; reduced: boolean; onPlayer(): void;
}) {
  const rig = useRef<THREE.Group>(null);
  const velocity = useRef(0);
  const discShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.absarc(0, 0, 0.84, 0, Math.PI * 2);
    const hole = new THREE.Path();
    hole.absarc(0, 0, 0.13, 0, Math.PI * 2);
    shape.holes.push(hole);
    return shape;
  }, []);
  useFrame((_, delta) => {
    if (!rig.current) return;
    const ease = reduced ? 1 : 1 - Math.exp(-7 * delta);
    rig.current.position.z = THREE.MathUtils.lerp(rig.current.position.z, mode === 'PLAYER_FOCUS' ? 0.34 : 0.17, ease);
    const scale = THREE.MathUtils.lerp(rig.current.scale.x, mode === 'PLAYER_FOCUS' ? 1.06 : 1, ease);
    rig.current.scale.setScalar(scale);
    velocity.current = THREE.MathUtils.lerp(velocity.current, playing && !reduced ? Math.PI / 9 : 0, 1 - Math.exp(-3 * delta));
    rig.current.rotation.z -= velocity.current * delta;
  });
  return (
    <group ref={rig} position={[0, 0, 0.17]} onClick={(event) => { event.stopPropagation(); onPlayer(); }}>
      <mesh castShadow>
        <extrudeGeometry args={[discShape, { depth: 0.035, bevelEnabled: false, curveSegments: 64 }]} />
        <meshStandardMaterial color="#e4e2dc" metalness={0} roughness={0.52} />
      </mesh>
      <mesh position={[0, 0, 0.037]} castShadow>
        <ringGeometry args={[0.155, 0.78, 64]} />
        <meshStandardMaterial map={label} transparent={false} metalness={0} roughness={0.58} />
      </mesh>
      <mesh position={[0, 0, 0.039]}>
        <ringGeometry args={[0.78, 0.84, 64]} />
        <meshPhysicalMaterial color="#eeeae1" transparent opacity={0.62} roughness={0.65} depthWrite />
      </mesh>
      <mesh position={[0, 0, 0.04]}>
        <ringGeometry args={[0.13, 0.155, 64]} />
        <meshPhysicalMaterial color="#eeeae1" transparent opacity={0.62} roughness={0.65} depthWrite />
      </mesh>
    </group>
  );
}

function TrayRig({ texture, label, mode, playing, reduced, onPlayer }: {
  texture: THREE.Texture; label: THREE.Texture; mode: ExperienceMode; playing: boolean; reduced: boolean; onPlayer(): void;
}) {
  const rig = useRef<THREE.Group>(null);
  const plasticOpacity = mode === 'PLAYER_FOCUS' ? 0.2 : mode === 'BOOKLET_FOCUS' ? 0.24 : 0.5;
  useFrame((_, delta) => {
    if (!rig.current) return;
    const ease = reduced ? 1 : 1 - Math.exp(-7 * delta);
    // The complete internal stack remains behind the front cover until the
    // hinge exposes it; this is physical occlusion rather than a visibility pop.
    rig.current.position.z = THREE.MathUtils.lerp(rig.current.position.z, mode === 'CLOSED' ? -0.16 : 0, ease);
  });
  return (
    <group ref={rig} position={[HALF_PANEL, 0, mode === 'CLOSED' ? -0.16 : 0]}>
      <mesh position={[0, 0, -0.055]} castShadow receiveShadow>
        <boxGeometry args={[PANEL, PANEL, 0.08]} />
        <meshStandardMaterial color="#d8d1c5" roughness={0.94} />
      </mesh>
      <mesh position={[0, 0, -0.01]} receiveShadow><planeGeometry args={[2.5, 2.5]} /><PaperMaterial texture={texture} /></mesh>
      <mesh position={[0, 0, 0.055]} receiveShadow>
        <boxGeometry args={[2.25, 2.25, 0.045]} />
        <meshPhysicalMaterial color="#dedbd2" transparent opacity={plasticOpacity} roughness={0.76} metalness={0} depthWrite />
      </mesh>
      <mesh position={[0, 0, 0.082]} receiveShadow>
        <ringGeometry args={[0.84, 0.94, 64]} />
        <meshStandardMaterial color="#d9d5cc" transparent opacity={plasticOpacity + 0.08} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0, 0.09]}><ringGeometry args={[0.18, 0.82, 64]} /><meshStandardMaterial color="#e4e0d7" transparent opacity={plasticOpacity * 0.18} roughness={0.85} /></mesh>
      <mesh position={[0, 0, 0.12]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.16, 0.065, 32]} />
        <meshStandardMaterial color="#d8d4ca" transparent opacity={plasticOpacity + 0.12} roughness={0.75} />
      </mesh>
      <CdDisc label={label} mode={mode} playing={playing} reduced={reduced} onPlayer={onPlayer} />
    </group>
  );
}

function BookletPages({ album, page, mobile, reduced }: { album: Album; page: number; mobile: boolean; reduced: boolean }) {
  const { gl } = useThree();
  const urls = album.booklet!.previewImages.slice(1).map(({ src }) => assetUrl(src)!);
  const pages = useLoader(THREE.TextureLoader, urls) as THREE.Texture[];
  useMemo(() => configureTextures(pages, gl.capabilities.getMaxAnisotropy()), [gl, pages]);
  const aspect = textureAspect(pages[0]);
  const width = PAGE_HEIGHT * aspect;
  const previous = useRef(page);
  const [settled, setSettled] = useState(page);
  const [turn, setTurn] = useState<{ key: number; source: number; target: number; direction: -1 | 1 } | null>(null);
  useEffect(() => {
    if (previous.current === page) return;
    const source = previous.current;
    previous.current = page;
    if (reduced) { queueMicrotask(() => setSettled(page)); return; }
    setTurn({ key: Date.now(), source, target: page, direction: page > source ? 1 : -1 });
  }, [page, reduced]);
  if (mobile) {
    const visible = pages[turn ? turn.target : settled];
    return <mesh castShadow receiveShadow><planeGeometry args={[PAGE_HEIGHT * textureAspect(visible), PAGE_HEIGHT, 16, 2]} /><PaperMaterial texture={visible} /></mesh>;
  }
  const spreads = [[pages[0], pages[1]], [pages[2], pages[3]], [pages[4], pages[5]]];
  const visible = spreads[turn ? turn.target : settled];
  return (
    <group>
      <mesh position={[-width / 2, 0, 0]} castShadow receiveShadow><planeGeometry args={[width, PAGE_HEIGHT, 16, 2]} /><PaperMaterial texture={visible[0]} /></mesh>
      <mesh position={[width / 2, 0, 0]} castShadow receiveShadow><planeGeometry args={[width, PAGE_HEIGHT, 16, 2]} /><PaperMaterial texture={visible[1]} /></mesh>
      {turn && <TurningPage key={turn.key} pages={pages} width={width} turn={turn} onDone={() => { setSettled(turn.target); setTurn(null); }} />}
      <mesh position={[0, 0, 0.012]}><planeGeometry args={[0.025, PAGE_HEIGHT]} /><meshBasicMaterial color="#7a6f65" transparent opacity={0.18} /></mesh>
    </group>
  );
}

function TurningPage({ pages, width, turn, onDone }: {
  pages: THREE.Texture[]; width: number; turn: { source: number; target: number; direction: -1 | 1 }; onDone(): void;
}) {
  const pivot = useRef<THREE.Group>(null);
  const sheet = useRef<THREE.Mesh>(null);
  const elapsed = useRef(0);
  const done = useRef(false);
  const front = turn.direction > 0 ? pages[turn.source * 2 + 1] : pages[turn.source * 2];
  const back = turn.direction > 0 ? pages[turn.target * 2] : pages[turn.target * 2 + 1];
  useFrame((_, delta) => {
    if (!pivot.current || !sheet.current) return;
    elapsed.current = Math.min(PAGE_TURN_DURATION, elapsed.current + delta);
    const t = elapsed.current / PAGE_TURN_DURATION;
    const smooth = t * t * (3 - 2 * t);
    pivot.current.rotation.y = (turn.direction > 0 ? -1 : 1) * Math.PI * smooth;
    const positions = sheet.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < positions.count; i += 1) {
      const x = positions.getX(i);
      positions.setZ(i, Math.sin(Math.abs(x / width) * Math.PI) * Math.sin(t * Math.PI) * 0.065);
    }
    positions.needsUpdate = true;
    if (t === 1 && !done.current) { done.current = true; onDone(); }
  });
  return (
    <group ref={pivot} position={[0, 0, 0.025]}>
      <group position={[turn.direction > 0 ? width / 2 : -width / 2, 0, 0]}>
        <mesh ref={sheet} castShadow><planeGeometry args={[width, PAGE_HEIGHT, 18, 3]} /><meshStandardMaterial map={front} roughness={0.94} side={THREE.FrontSide} /></mesh>
        <mesh rotation={[0, Math.PI, 0]} position={[0, 0, -0.002]} castShadow><planeGeometry args={[width, PAGE_HEIGHT, 18, 3]} /><meshStandardMaterial map={back} roughness={0.94} side={THREE.FrontSide} /></mesh>
      </group>
    </group>
  );
}

function BookletRig({ album, p1, mode, page, mobile, reduced, onBooklet }: {
  album: Album; p1: THREE.Texture; mode: ExperienceMode; page: number; mobile: boolean; reduced: boolean; onBooklet(): void;
}) {
  const rig = useRef<THREE.Group>(null);
  const cover = useRef<THREE.Group>(null);
  const p1Width = PAGE_HEIGHT * textureAspect(p1);
  useFrame((_, delta) => {
    if (!rig.current || !cover.current) return;
    const focused = mode === 'BOOKLET_FOCUS';
    const ease = reduced ? 1 : 1 - Math.exp(-5.5 * delta);
    const homeX = -HALF_PANEL;
    rig.current.position.x = THREE.MathUtils.lerp(rig.current.position.x, focused ? 0 : homeX, ease);
    rig.current.position.y = THREE.MathUtils.lerp(rig.current.position.y, focused ? 0.08 : 0, ease);
    rig.current.position.z = THREE.MathUtils.lerp(rig.current.position.z, focused ? 1.35 : 0.18, ease);
    const targetScale = focused ? (mobile ? 1.35 : 1.32) : 0.84;
    rig.current.scale.setScalar(THREE.MathUtils.lerp(rig.current.scale.x, targetScale, ease));
    cover.current.rotation.y = THREE.MathUtils.lerp(cover.current.rotation.y, focused && !mobile ? -Math.PI : 0, ease);
  });
  return (
    <group ref={rig} position={[-HALF_PANEL, 0, 0.18]} scale={0.84} onClick={(event) => { event.stopPropagation(); if (mode === 'ALBUM_OPEN') onBooklet(); }}>
      {mode === 'BOOKLET_FOCUS' && <BookletPages album={album} page={page} mobile={mobile} reduced={reduced} />}
      <group ref={cover} position={[mobile ? 0 : p1Width / 2, 0, 0.035]}>
        <mesh position={[mobile ? 0 : -p1Width / 2, 0, 0]} castShadow><planeGeometry args={[p1Width, PAGE_HEIGHT]} /><PaperMaterial texture={p1} /></mesh>
      </group>
    </group>
  );
}

function Scene(props: ExperienceProps) {
  const { album, mode, page, mobile, playing, reduced, onOpen, onBooklet, onPlayer, onTransitionChange } = props;
  const textures = useCoreTextures(album);
  const packageRig = useRef<THREE.Group>(null);
  const hinge = useRef<THREE.Group>(null);
  const drag = useRef<{ id: number; x: number; y: number; startX: number; startY: number; canvas: HTMLCanvasElement } | null>(null);
  const rotation = useRef({ x: -0.1, y: 0.12 });
  const autoRotate = useRef(true);
  const aligned = useRef(mode !== 'CLOSED');
  const reported = useRef(false);

  useEffect(() => {
    if (mode !== 'CLOSED') { autoRotate.current = false; aligned.current = false; reported.current = false; onTransitionChange?.(true); }
    else { aligned.current = true; reported.current = false; }
  }, [mode, onTransitionChange]);

  useFrame((_, delta) => {
    if (!packageRig.current || !hinge.current) return;
    const closed = mode === 'CLOSED';
    if (closed && autoRotate.current && !reduced) rotation.current.y += delta * Math.PI / 15;
    const ease = reduced ? 1 : 1 - Math.exp(-5 * delta);
    if (!closed && !aligned.current) {
      rotation.current.x = THREE.MathUtils.lerp(rotation.current.x, -0.1, ease);
      rotation.current.y = THREE.MathUtils.lerp(rotation.current.y, Math.round(rotation.current.y / (Math.PI * 2)) * Math.PI * 2, ease);
      if (Math.abs(rotation.current.x + 0.1) + Math.abs(Math.sin(rotation.current.y / 2)) < 0.018) aligned.current = true;
    }
    packageRig.current.rotation.x = THREE.MathUtils.lerp(packageRig.current.rotation.x, closed ? rotation.current.x : -0.1, ease);
    packageRig.current.rotation.y = THREE.MathUtils.lerp(packageRig.current.rotation.y, closed || !aligned.current ? rotation.current.y : 0, ease);
    const targetHinge = !closed && aligned.current ? OPEN_ANGLE : 0;
    hinge.current.rotation.y = THREE.MathUtils.lerp(hinge.current.rotation.y, targetHinge, ease);
    const x = closed ? (mobile ? 0 : -1.15) : mode === 'BOOKLET_FOCUS' ? 0.95 : mode === 'PLAYER_FOCUS' ? (mobile ? 0 : -0.38) : 0;
    const y = mobile ? (closed ? 1.05 : 0.6) : 0.05;
    const scale = closed ? (mobile ? 1.03 : 1.18) : mode === 'BOOKLET_FOCUS' ? 0.72 : (mobile ? 0.62 : 1.08);
    packageRig.current.position.x = THREE.MathUtils.lerp(packageRig.current.position.x, x, ease);
    packageRig.current.position.y = THREE.MathUtils.lerp(packageRig.current.position.y, y, ease);
    packageRig.current.position.z = THREE.MathUtils.lerp(packageRig.current.position.z, mode === 'BOOKLET_FOCUS' ? -1 : 0, ease);
    packageRig.current.scale.setScalar(THREE.MathUtils.lerp(packageRig.current.scale.x, scale, ease));
    const complete = closed || (aligned.current && Math.abs(hinge.current.rotation.y - targetHinge) < 0.025);
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
      <group ref={packageRig} position={[mobile ? 0 : -1.15, mobile ? 1.05 : 0.05, 0]} rotation={[-0.1, 0.12, 0]} scale={mobile ? 1.03 : 1.18}
        onPointerDown={down} onPointerMove={move} onPointerUp={(e) => finish(e.pointerId, true)} onPointerCancel={(e) => finish(e.pointerId, false)}>
        <TrayRig texture={textures.interiorTray} label={textures.cdLabel} mode={mode} playing={playing} reduced={reduced} onPlayer={onPlayer} />
        <group ref={hinge}>
          <group position={[HALF_PANEL, 0, 0.1]}>
            <mesh castShadow receiveShadow><boxGeometry args={[PANEL, PANEL, 0.08]} /><meshStandardMaterial color="#d8d1c5" roughness={0.94} /></mesh>
            <mesh position={[0, 0, 0.041]}><planeGeometry args={[2.5, 2.5]} /><PaperMaterial texture={textures.front} /></mesh>
            <mesh position={[0, 0, -0.041]} rotation={[0, Math.PI, 0]} receiveShadow><planeGeometry args={[2.5, 2.5]} /><PaperMaterial texture={textures.interiorBooklet} /></mesh>
          </group>
          <mesh position={[0.001, 0, 0.056]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[SPINE_WIDTH, PANEL]} /><PaperMaterial texture={textures.spine} /></mesh>
        </group>
      </group>
      {mode !== 'CLOSED' && <BookletRig album={album} p1={textures.p1} mode={mode} page={page} mobile={mobile} reduced={reduced} onBooklet={onBooklet} />}
      <mesh position={[0, 0, -0.6]} receiveShadow><planeGeometry args={[16, 12]} /><shadowMaterial transparent opacity={0.11} depthWrite={false} /></mesh>
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
