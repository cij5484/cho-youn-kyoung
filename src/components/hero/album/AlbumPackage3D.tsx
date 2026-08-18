import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import type { ThreeEvent } from '@react-three/fiber';
import type {
  AlbumHeroBackgroundAnchor,
  AlbumHeroPackageGeometry,
  AlbumHeroTextures,
} from '../../../data/albums';
import { COVER_DEPTH, getPackageDimensions, storePackageRotation } from '../../album/packageGeometry';

// spine.png is 171 × 3000: its 0.057 width/height ratio defines the printed spine.
const SPINE_SURFACE_OFFSET = 0.0015;
const DEFAULT_ROTATION = { x: -0.06, y: 0.1 };
const TILT_LIMIT = THREE.MathUtils.degToRad(28);
const AUTO_ROTATION_SPEED = (Math.PI * 2) / 22;
const DEFAULT_BACKGROUND_ANCHORS = {
  desktop: { sourceWidth: 3840, sourceHeight: 2160, x: 1369 / 3840 },
  mobile: { sourceWidth: 1440, sourceHeight: 2560, x: 720 / 1440 },
} as const;

type AlbumPackage3DProps = {
  textures?: AlbumHeroTextures;
  backgroundAnchor?: { desktop: AlbumHeroBackgroundAnchor; mobile: AlbumHeroBackgroundAnchor };
  geometry?: AlbumHeroPackageGeometry;
};
type PackageProps = AlbumPackage3DProps & { scale: number; position: [number, number, number] };

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

function useMobileViewport() {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 700px)');
    const update = () => setMobile(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return mobile;
}

function usePackageMaterials(textures?: AlbumHeroTextures) {
  const [maps, setMaps] = useState<Partial<Record<keyof AlbumHeroTextures, THREE.Texture>>>({});
  const { gl } = useThree();

  useEffect(() => {
    let cancelled = false;
    const loaded: THREE.Texture[] = [];
    const entries = Object.entries(textures ?? {}).filter(
      (entry): entry is [keyof AlbumHeroTextures, string] => Boolean(entry[1]),
    );

    Promise.all(entries.map(async ([face, url]) => {
      const texture = await new THREE.TextureLoader().loadAsync(url);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
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
  }, [gl, textures]);

  return useMemo(() => {
    const paper = new THREE.MeshStandardMaterial({ color: '#e8e3d8', roughness: 0.94 });
    const printed = (map?: THREE.Texture) => new THREE.MeshBasicMaterial({
      color: map ? '#ffffff' : '#d3cec3', map, toneMapped: false,
    });
    const plastic = new THREE.MeshPhysicalMaterial({
      color: '#ffffff', transparent: true, opacity: 0.24, roughness: 0.24,
      metalness: 0, clearcoat: 0.12, clearcoatRoughness: 0.78,
      transmission: 0.16, thickness: 0.018, depthWrite: false,
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

function Package({ textures, geometry, scale, position }: PackageProps) {
  const group = useRef<THREE.Group>(null);
  const drag = useRef<{ pointerId: number; x: number; y: number } | null>(null);
  const target = useRef({ ...DEFAULT_ROTATION });
  const autoRotation = useRef(DEFAULT_ROTATION.y);
  const autoRotating = useRef(true);
  const persistFrame = useRef(0);
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
    } else if (reducedMotion) {
      group.current.rotation.set(target.current.x, target.current.y, 0);
    } else {
      const easing = 1 - Math.exp(-10 * delta);
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, target.current.x, easing);
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, target.current.y, easing);
    }
    persistFrame.current += 1;
    if (persistFrame.current % 12 === 0) {
      storePackageRotation({ x: group.current.rotation.x, y: group.current.rotation.y });
    }
  });

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    if (group.current && autoRotating.current) {
      const normalizedY = THREE.MathUtils.euclideanModulo(group.current.rotation.y + Math.PI, Math.PI * 2) - Math.PI;
      target.current.y = normalizedY;
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
    // Yaw deliberately remains unbounded so the package can be spun through
    // any number of full turns; only the vertical tilt needs a physical limit.
    target.current.y += dx * 0.008;
    target.current.x = THREE.MathUtils.clamp(target.current.x + dy * 0.006, -TILT_LIMIT, TILT_LIMIT);
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
  const dimensions = getPackageDimensions(geometry);

  const interactionProps = {
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
    onLostPointerCapture: () => { drag.current = null; },
  };

  return (
    <group position={position}>
      <group
        ref={group}
        rotation={[DEFAULT_ROTATION.x, DEFAULT_ROTATION.y, 0]}
        scale={scale}
      >
        <mesh material={materials.plastic} castShadow>
          <boxGeometry args={[dimensions.trayWidth, dimensions.trayHeight, dimensions.trayDepth]} />
        </mesh>
        <mesh position={[0, 0, dimensions.trayDepth / 2 + COVER_DEPTH / 2]} material={faceMaterials(materials.front, 4)} castShadow>
          <boxGeometry args={[dimensions.frontWidth, dimensions.frontHeight, COVER_DEPTH]} />
        </mesh>
        <mesh position={[0, 0, -(dimensions.trayDepth / 2 + COVER_DEPTH / 2)]} material={faceMaterials(materials.back, 5)} castShadow>
          <boxGeometry args={[dimensions.backWidth, dimensions.backHeight, COVER_DEPTH]} />
        </mesh>
        {geometry ? (
          <mesh
            position={[
              -Math.max(dimensions.frontWidth, dimensions.backWidth) / 2 - SPINE_SURFACE_OFFSET,
              0,
              0,
            ]}
            rotation={[0, -Math.PI / 2, 0]}
            material={materials.spine}
            castShadow
          >
            <planeGeometry args={[dimensions.printedSpineDepth, dimensions.frontHeight]} />
          </mesh>
        ) : (
          <mesh position={[-dimensions.frontWidth / 2 + COVER_DEPTH / 2, 0, 0]} material={spineMaterials} castShadow>
            <boxGeometry args={[COVER_DEPTH, dimensions.frontHeight, dimensions.trayDepth + COVER_DEPTH * 2]} />
          </mesh>
        )}
      </group>
      <mesh position={[0, 0, 0.35]} {...interactionProps}>
        <planeGeometry args={[Math.max(dimensions.frontWidth, dimensions.backWidth) * 1.14, dimensions.frontHeight * 1.14]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
      </mesh>
    </group>
  );
}

export function AlbumPackage3D({ textures, backgroundAnchor, geometry }: AlbumPackage3DProps) {
  return (
    <Canvas
      className="album-package-canvas"
      camera={{ position: [0, 0, 5], fov: 36 }}
      dpr={[1, 2]}
      fallback={<div className="album-package-fallback" aria-hidden="true" />}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      shadows="soft"
    >
      <AlbumPackageScene textures={textures} backgroundAnchor={backgroundAnchor} geometry={geometry} />
    </Canvas>
  );
}

function AlbumPackageScene({ textures, backgroundAnchor, geometry }: AlbumPackage3DProps) {
  const mobile = useMobileViewport();
  const { size, viewport } = useThree();
  const source = mobile
    ? backgroundAnchor?.mobile ?? DEFAULT_BACKGROUND_ANCHORS.mobile
    : backgroundAnchor?.desktop ?? DEFAULT_BACKGROUND_ANCHORS.desktop;
  const backgroundScale = Math.max(size.width / source.sourceWidth, size.height / source.sourceHeight);
  const renderedWidth = source.sourceWidth * backgroundScale;
  const backgroundOffsetX = (size.width - renderedWidth) / 2;
  const screenLineX = backgroundOffsetX + source.x * renderedWidth;
  const packageX = (screenLineX / size.width - 0.5) * viewport.width;
  const packageScale = mobile ? 0.48 : 0.7;

  // Keep the mobile cover below the header while allowing its size to determine
  // the natural start of the information block below the visual stage.
  const mobileHeader = Math.min(80, Math.max(60, size.height * 0.09));
  const projectedCoverHeight = getPackageDimensions(geometry).frontHeight * packageScale
    / viewport.height * size.height;
  const mobileCenterY = mobileHeader + 20 + projectedCoverHeight / 2;
  const packageY = mobile
    ? (0.5 - mobileCenterY / size.height) * viewport.height
    : 0.2;

  return (
    <>
      <ambientLight intensity={0.82} />
      <directionalLight
        position={[4.5, 6, 5.5]}
        intensity={1.65}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
        shadow-camera-near={1}
        shadow-camera-far={12}
        shadow-bias={-0.0002}
        shadow-radius={8}
      />
      <directionalLight position={[-3.5, 1.5, 3]} intensity={0.28} />
      <Package textures={textures} geometry={geometry} scale={packageScale} position={[packageX, packageY, 0]} />
      <mesh position={[0, 0, -0.34]} receiveShadow>
        <planeGeometry args={[12, 10]} />
        <shadowMaterial transparent opacity={0.13} depthWrite={false} />
      </mesh>
    </>
  );
}
