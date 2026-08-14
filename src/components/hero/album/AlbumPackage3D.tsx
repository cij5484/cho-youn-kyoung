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
  y: THREE.MathUtils.degToRad(168),
} as const;
const ZOOM_LIMIT = { min: 0.9, max: 1.35 } as const;

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
    const printedMaterial = (map?: THREE.Texture) => new THREE.MeshStandardMaterial({
      color: map ? '#ffffff' : '#cbc8c1',
      map,
      roughness: 0.88,
      metalness: 0,
    });
    const edgeMaterial = (map?: THREE.Texture) => map
      ? printedMaterial(map)
      : new THREE.MeshPhysicalMaterial({
        color: '#e9e7df',
        transparent: true,
        opacity: 0.72,
        roughness: 0.3,
        metalness: 0,
        clearcoat: 0.42,
        clearcoatRoughness: 0.38,
        depthWrite: true,
      });
    // BoxGeometry order: right, left, top, bottom, front, back.
    return [
      edgeMaterial(maps.spineRight),
      printedMaterial(maps.spineLeft),
      edgeMaterial(maps.top),
      edgeMaterial(maps.bottom),
      printedMaterial(maps.front),
      printedMaterial(maps.back),
    ];
  }, [maps]);
}

function Package({ textures }: AlbumPackage3DProps) {
  const group = useRef<THREE.Group>(null);
  const drag = useRef<{ pointerId: number; x: number; y: number } | null>(null);
  const target = useRef({ ...DEFAULT_ROTATION });
  const zoom = useRef(1);
  const targetZoom = useRef(1);
  const reducedMotion = useReducedMotion();
  const materials = usePackageMaterials(textures);

  useEffect(() => () => materials.forEach((material) => material.dispose()), [materials]);

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
    if (reducedMotion) {
      group.current.rotation.set(target.current.x, target.current.y, 0);
      group.current.scale.setScalar(targetZoom.current);
      return;
    }
    const easing = 1 - Math.exp(-10 * delta);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, target.current.x, easing);
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, target.current.y, easing);
    zoom.current = THREE.MathUtils.lerp(zoom.current, targetZoom.current, easing);
    group.current.scale.setScalar(zoom.current);
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
    const canvas = event.nativeEvent.currentTarget as HTMLCanvasElement;
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
  };

  const handleWheel = (event: ThreeEvent<WheelEvent>) => {
    event.stopPropagation();
    if (event.nativeEvent.cancelable) event.nativeEvent.preventDefault();
    targetZoom.current = THREE.MathUtils.clamp(
      targetZoom.current - event.deltaY * 0.0007,
      ZOOM_LIMIT.min,
      ZOOM_LIMIT.max,
    );
  };

  const resetZoom = () => { targetZoom.current = 1; };

  return (
    <group
      ref={group}
      rotation={[DEFAULT_ROTATION.x, DEFAULT_ROTATION.y, 0]}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onLostPointerCapture={() => { drag.current = null; }}
      onWheel={handleWheel}
      onDoubleClick={resetZoom}
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
      shadows="soft"
    >
      <ambientLight intensity={1.15} />
      <directionalLight
        position={[2.5, 7, 4.5]}
        intensity={1.75}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0004}
        shadow-radius={5}
      />
      <directionalLight position={[-3, -1, 2]} intensity={0.45} />
      <Package textures={textures} />
      <mesh position={[0, -1.32, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[5.4, 3.4]} />
        <shadowMaterial transparent opacity={0.15} />
      </mesh>
    </Canvas>
  );
}
