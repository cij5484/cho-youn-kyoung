import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { Album } from '../../../data/albums';
import { assetUrl } from '../../../utils/assetUrl';

export type ExperienceMode = 'CLOSED' | 'ALBUM_OPEN' | 'BOOKLET_FOCUS' | 'PLAYER_FOCUS';
type Props = { album: Album; mode: ExperienceMode; page: number; playing: boolean; reduced: boolean; onOpen(): void; onBooklet(): void; onPlayer(): void };

function ArticulatedAlbum({ album, mode, page, playing, reduced, onOpen, onBooklet, onPlayer }: Props) {
  const hero = album.albumHero!; const detail = album.detailExperience!; const pages = album.booklet!.previewImages;
  const urls: string[] = [hero.textures.front!, hero.textures.back!, hero.textures.spineLeft!, detail.interior.bookletPanel, detail.interior.trayPanel, album.cdLabelImage!, ...pages.map((p) => p.src)].map((url) => assetUrl(url!)!);
  const textures = useLoader(THREE.TextureLoader, urls) as THREE.Texture[];
  textures.forEach((texture) => { texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 8; });
  const root = useRef<THREE.Group>(null); const hinge = useRef<THREE.Group>(null); const disc = useRef<THREE.Group>(null);
  const dragging = useRef<{ x: number; y: number; moved: number } | undefined>(undefined); const rotation = useRef({ x: -0.12, y: 0.12 }); const auto = useRef(true);
  const discShape = useMemo(() => { const shape = new THREE.Shape(); shape.absarc(0, 0, .82, 0, Math.PI * 2); const hole = new THREE.Path(); hole.absarc(0, 0, .13, 0, Math.PI * 2); shape.holes.push(hole); return shape; }, []);
  useFrame((_, delta) => {
    if (!root.current || !hinge.current || !disc.current) return;
    const open = mode !== 'CLOSED'; const ease = reduced ? 1 : 1 - Math.exp(-5 * delta);
    if (!open && auto.current && !reduced) rotation.current.y += delta * Math.PI * 2 / 30;
    const focusX = mode === 'BOOKLET_FOCUS' ? 1.2 : mode === 'PLAYER_FOCUS' ? -1 : 0;
    root.current.position.x = THREE.MathUtils.lerp(root.current.position.x, focusX, ease);
    root.current.rotation.x = THREE.MathUtils.lerp(root.current.rotation.x, open ? -0.14 : rotation.current.x, ease);
    root.current.rotation.y = THREE.MathUtils.lerp(root.current.rotation.y, open ? 0 : rotation.current.y, ease);
    root.current.scale.setScalar(THREE.MathUtils.lerp(root.current.scale.x, mode === 'BOOKLET_FOCUS' ? .82 : open ? .9 : 1, ease));
    hinge.current.rotation.y = THREE.MathUtils.lerp(hinge.current.rotation.y, open ? -Math.PI * .88 : 0, ease);
    disc.current.position.z = THREE.MathUtils.lerp(disc.current.position.z, mode === 'PLAYER_FOCUS' ? .23 : .13, ease);
    if (playing && !reduced) disc.current.rotation.z -= delta * Math.PI * 2 / 18;
  });
  const down = (e: { clientX: number; clientY: number; stopPropagation(): void }) => { e.stopPropagation(); auto.current = false; dragging.current = { x: e.clientX, y: e.clientY, moved: 0 }; };
  const move = (e: { clientX: number; clientY: number }) => { const d = dragging.current; if (!d || mode !== 'CLOSED') return; const dx=e.clientX-d.x,dy=e.clientY-d.y; d.moved += Math.hypot(dx,dy); d.x=e.clientX;d.y=e.clientY;rotation.current.y+=dx*.008;rotation.current.x=THREE.MathUtils.clamp(rotation.current.x+dy*.006,-.48,.48); };
  const up = () => { if (dragging.current && dragging.current.moved < 7 && mode === 'CLOSED') onOpen(); dragging.current=undefined; };
  const mat = (map: THREE.Texture) => <meshStandardMaterial map={map} roughness={.9} />;
  return <group ref={root} rotation={[-.12,.12,0]} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
    <group position={[1.32,0,0]}>
      <mesh position={[0,0,-.04]} castShadow>{<boxGeometry args={[2.55,2.55,.08]}/>} {mat(textures[1])}</mesh>
      <mesh position={[0,0,.015]}>{<planeGeometry args={[2.48,2.48]}/>} {mat(textures[4])}</mesh>
      <mesh position={[0,0,.09]}><boxGeometry args={[2.12,2.12,.05]}/><meshPhysicalMaterial color="#dedbd0" transparent opacity={mode==='PLAYER_FOCUS'?.2:.42} roughness={.65} transmission={.08}/></mesh>
      <mesh position={[0,0,.125]}><ringGeometry args={[.83,.94,64]}/><meshPhysicalMaterial color="#e5e2d8" transparent opacity={.35} roughness={.7}/></mesh>
      <mesh position={[0,0,.15]}><cylinderGeometry args={[.16,.16,.08,32]}/><meshPhysicalMaterial color="#ddd9cf" transparent opacity={.5} roughness={.6}/></mesh>
      <group ref={disc} position={[0,0,.13]} rotation={[0,0,0]} onClick={(e)=>{e.stopPropagation();onPlayer();}}>
        <mesh rotation={[Math.PI/2,0,0]} castShadow><extrudeGeometry args={[discShape,{depth:.035,bevelEnabled:false,curveSegments:64}]}/><meshPhysicalMaterial color="#dedede" transparent opacity={.82} roughness={.4}/></mesh>
        <mesh position={[0,0,.045]}><ringGeometry args={[.15,.78,64]}/><meshStandardMaterial map={textures[5]} roughness={.55} transparent/></mesh>
      </group>
    </group>
    <group ref={hinge} position={[0,0,.02]}>
      <mesh position={[-1.32,0,0]} castShadow><boxGeometry args={[2.55,2.55,.08]}/>{mat(textures[0])}</mesh>
      <mesh position={[-1.32,0,.046]}><planeGeometry args={[2.48,2.48]}/>{mat(textures[3])}</mesh>
      <mesh position={[-1.32,0,.11]} onClick={(e)=>{e.stopPropagation();onBooklet();}} castShadow><boxGeometry args={[1.75,2.18,.055]}/>{mat(mode==='BOOKLET_FOCUS'?textures[page+6]:textures[6])}</mesh>
      <mesh position={[-.015,0,0]} rotation={[0,Math.PI/2,0]}><planeGeometry args={[.1,2.55]}/>{mat(textures[2])}</mesh>
    </group>
  </group>;
}

export default function AlbumDetailExperience3D(props: Props) {
  return <Canvas dpr={[1,2]} camera={{ position:[0,0,7], fov:42 }} shadows aria-label="열고 탐색할 수 있는 지영희류 3D 디지팩">
    <ambientLight intensity={1.5}/><directionalLight position={[4,6,7]} intensity={2.2} castShadow/>
    <ArticulatedAlbum {...props}/>
  </Canvas>;
}
