import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import type { ThreeEvent } from '@react-three/fiber';
import type { AlbumHeroTextures } from '../../../data/albums';

const PACKAGE_SIZE = { width: 2.35, height: 2.35, depth: 0.16 } as const;
const COVER_OVERHANG = 0.035;
const COVER_DEPTH = 0.025;
const DEFAULT_ROTATION = { x: -0.06, y: 0.1 };
const ROTATION_LIMIT = {
  x: THREE.MathUtils.degToRad(14),
  y: THREE.MathUtils.degToRad(168),
} as const;
const AUTO_ROTATION_SPEED = (Math.PI * 2) / 22;

type AlbumPackage3DProps = { textures?: AlbumHeroTextures };

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return reduced;
}

function usePackageMaterials(textures?: AlbumHeroTextures) {
  const [maps, setMaps] = useState<Partial<Record<keyof AlbumHeroTextures, THREE.Texture>>>({});

  useEffect(() => {
    let cancelled = false;
    const loaded: THREE.Texture[] = [];
    const entries = Object.entries(textures ?? {}).filter(
      (entry): entry is [keyof AlbumHeroTextures, string] => Boolean(entry[1]),
    );

    Promise.all(entries.map(async ([face, url]) => {
      const texture = await new THREE.TextureLoader().loadAsync(url);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 4;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      loaded.push(texture);
      return [face, texture] as const;
    })).then((results) => {
      if (!cancelled) setMaps(Object.fromEntries(results));
    }).catch(() => {
      if (!cancelled) setMaps({});
    });

    return () => {
      cancelled = true;
      loaded.forEach((texture) => texture.dispose());
    };
  }, [textures]);

  return useMemo(() => {
    const paper = new THREE.MeshStandardMaterial({ color: '#e8e3d8', roughness: 0.94 });
    const printed = (map?: THREE.Texture) => new THREE.MeshStandardMaterial({
      color: map ? '#ffffff' : '#d3cec3', map, roughness: 0.9, metalness: 0,
    });
    const plastic = new THREE.MeshPhysicalMaterial({
      color: '#dddcd5', transparent: true, opacity: 0.62, roughness: 0.38,
      metalness: 0, clearcoat: 0.22, clearcoatRoughness: 0.58, depthWrite: true,
    });
    return {
      paper,
      plastic,
      front: printed(maps.front),
      back: printed(maps.back),
      spine: printed(maps.spineLeft),
    };
  }, [maps]);
}

function Package({ textures }: AlbumPackage3DProps) {
  const group = useRef<THREE.Group>(null);
  const drag = useRef<{ pointerId: number; x: number; y: number } | null>(null);
  const target = useRef({ ...DEFAULT_ROTATION });
  const autoRotation = useRef(DEFAULT_ROTATION.y);
  const autoRotating = useRef(true);
  const reducedMotion = useReducedMotion();
  const materials = usePackageMaterials(textures);

  useEffect(() => () => Object.values(materials).forEach((material) => material.dispose()), [materials]);

  useEffect(() => {
    const endDrag = (event: PointerEvent) => {
      if (drag.current?.pointerId === event.pointerId) drag.current = null;
    };
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
    return () => {
      drag.current = null;
      window.removeEventListener('pointerup', endDrag);
      window.removeEventListener('pointercancel', endDrag);
    };
  }, []);

  useFrame((_, delta) => {
    if (!group.current) return;
    if (autoRotating.current && !reducedMotion) {
      autoRotation.current += AUTO_ROTATION_SPEED * delta;
      group.current.rotation.y = autoRotation.current;
      group.current.rotation.x = DEFAULT_ROTATION.x;
      return;
    }
    if (reducedMotion) {
      group.current.rotation.set(target.current.x, target.current.y, 0);
      return;
    }
    const easing = 1 - Math.exp(-10 * delta);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, target.current.x, easing);
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, target.current.y, easing);
  });

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    if (group.current && autoRotating.current) {
      const normalizedY = THREE.MathUtils.euclideanModulo(group.current.rotation.y + Math.PI, Math.PI * 2) - Math.PI;
      target.current.y = THREE.MathUtils.clamp(normalizedY, -ROTATION_LIMIT.y, ROTATION_LIMIT.y);
      group.current.rotation.y = target.current.y;
    }
    autoRotating.current = false;
    drag.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
    (event.nativeEvent.currentTarget as HTMLCanvasElement).setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (!drag.current || drag.current.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.current.x;
    const dy = event.clientY - drag.current.y;
    drag.current.x = event.clientX;
    drag.current.y = event.clientY;
    target.current.y = THREE.MathUtils.clamp(target.current.y + dx * 0.008, -ROTATION_LIMIT.y, ROTATION_LIMIT.y);
    target.current.x = THREE.MathUtils.clamp(target.current.x + dy * 0.006, -ROTATION_LIMIT.x, ROTATION_LIMIT.x);
  };

  const endDrag = (event: ThreeEvent<PointerEvent>) => {
    if (drag.current?.pointerId !== event.pointerId) return;
    drag.current = null;
    const canvas = event.nativeEvent.currentTarget as HTMLCanvasElement;
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
  };

  const faceMaterials = (printed: THREE.Material, faceIndex: 4 | 5) => {
    const faces: THREE.Material[] = Array(6).fill(materials.paper);
    faces[faceIndex] = printed;
    return faces;
  };
  const spineMaterials: THREE.Material[] = Array(6).fill(materials.paper);
  spineMaterials[1] = materials.spine;
  const coverSize = PACKAGE_SIZE.width + COVER_OVERHANG * 2;

  return (
    <group
      ref={group}
      rotation={[DEFAULT_ROTATION.x, DEFAULT_ROTATION.y, 0]}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onLostPointerCapture={() => { drag.current = null; }}
    >
      <mesh material={materials.plastic} castShadow>
        <boxGeometry args={[PACKAGE_SIZE.width, PACKAGE_SIZE.height, PACKAGE_SIZE.depth]} />
      </mesh>
      <mesh position={[0, 0, PACKAGE_SIZE.depth / 2 + COVER_DEPTH / 2]} material={faceMaterials(materials.front, 4)} castShadow>
        <boxGeometry args={[coverSize, coverSize, COVER_DEPTH]} />
      </mesh>
      <mesh position={[0, 0, -(PACKAGE_SIZE.depth / 2 + COVER_DEPTH / 2)]} material={faceMaterials(materials.back, 5)} castShadow>
        <boxGeometry args={[coverSize, coverSize, COVER_DEPTH]} />
      </mesh>
      <mesh position={[-coverSize / 2 + COVER_DEPTH / 2, 0, 0]} material={spineMaterials} castShadow>
        <boxGeometry args={[COVER_DEPTH, coverSize, PACKAGE_SIZE.depth + COVER_DEPTH * 2]} />
      </mesh>
      <mesh position={[0, 0, PACKAGE_SIZE.depth / 2 + COVER_DEPTH + 0.03]}>
        <planeGeometry args={[coverSize * 1.18, coverSize * 1.18]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

export function AlbumPackage3D({ textures }: AlbumPackage3DProps) {
  return (
    <Canvas
      className="album-package-canvas"
      camera={{ position: [0, 0, 5], fov: 36 }}
      dpr={[1, 1.5]}
      fallback={<div className="album-package-fallback" aria-hidden="true" />}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      shadows="soft"
    >
      <ambientLight intensity={1.05} />
      <directionalLight
        position={[3.5, 5.5, 5]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-3.2}
        shadow-camera-right={3.2}
        shadow-camera-top={3.2}
        shadow-camera-bottom={-3.2}
        shadow-camera-near={1}
        shadow-camera-far={12}
        shadow-bias={-0.0002}
        shadow-radius={7}
      />
      <directionalLight position={[-3, 1, 3]} intensity={0.32} />
      <Package textures={textures} />
      <mesh position={[0.08, -0.04, -0.25]} receiveShadow>
        <planeGeometry args={[6.2, 6.2]} />
        <shadowMaterial transparent opacity={0.11} depthWrite={false} />
      </mesh>
    </Canvas>
  );
}
