import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import type { ThreeEvent } from '@react-three/fiber';
import type { AlbumHeroTextures } from '../../../data/albums';

const PACKAGE_SIZE = {
  width: 2.35,
  height: 2.35,
  depth: 0.16,
} as const;

const DEFAULT_ROTATION = { x: -0.06, y: 0.1 };
const ROTATION_LIMIT = {
  x: THREE.MathUtils.degToRad(14),
  y: THREE.MathUtils.degToRad(30),
} as const;

type AlbumPackage3DProps = {
  textures?: AlbumHeroTextures;
};

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
    const entries = Object.entries(textures ?? {}).filter((entry): entry is [keyof AlbumHeroTextures, string] => Boolean(entry[1]));

    Promise.all(entries.map(async ([face, url]) => {
      const texture = await new THREE.TextureLoader().loadAsync(url);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 4;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = true;
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
    const material = (map?: THREE.Texture) => new THREE.MeshStandardMaterial({
      color: map ? '#ffffff' : '#cbc8c1',
      map,
      roughness: 0.88,
      metalness: 0,
    });
    // BoxGeometry order: right, left, top, bottom, front, back.
    return [maps.spineRight, maps.spineLeft, maps.top, maps.bottom, maps.front, maps.back].map(material);
  }, [maps]);
}

function Package({ textures }: AlbumPackage3DProps) {
  const group = useRef<THREE.Group>(null);
  const drag = useRef<{ pointerId: number; x: number; y: number } | null>(null);
  const target = useRef({ ...DEFAULT_ROTATION });
  const reducedMotion = useReducedMotion();
  const materials = usePackageMaterials(textures);

  useEffect(() => () => materials.forEach((material) => material.dispose()), [materials]);

  useFrame((_, delta) => {
    if (!group.current) return;
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
    (event.nativeEvent.currentTarget as HTMLCanvasElement).releasePointerCapture(event.pointerId);
  };

  return (
    <group
      ref={group}
      rotation={[DEFAULT_ROTATION.x, DEFAULT_ROTATION.y, 0]}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <mesh material={materials} castShadow>
        <boxGeometry args={[PACKAGE_SIZE.width, PACKAGE_SIZE.height, PACKAGE_SIZE.depth]} />
      </mesh>
    </group>
  );
}

export function AlbumPackage3D({ textures }: AlbumPackage3DProps) {
  return (
    <Canvas
      className="album-package-canvas"
      camera={{ position: [0, 0, 4.2], fov: 38 }}
      dpr={[1, 1.5]}
      fallback={<div className="album-package-fallback" aria-hidden="true" />}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      shadows
    >
      <ambientLight intensity={1.3} />
      <directionalLight position={[3, 4, 5]} intensity={1.7} castShadow />
      <directionalLight position={[-3, -1, 2]} intensity={0.45} />
      <Package textures={textures} />
    </Canvas>
  );
}
