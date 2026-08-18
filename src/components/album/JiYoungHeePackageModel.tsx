import * as THREE from 'three';

/** Shared, unlit paper treatment used by both the HOME and DETAIL stages. */
export function IvoryEdgeMaterial({ color = '#eee9df' }: { color?: string }) {
  return <meshBasicMaterial color={color} toneMapped={false} />;
}

export function PrintedPaperMaterial({ texture, side = THREE.FrontSide }: {
  texture: THREE.Texture;
  side?: THREE.Side;
}) {
  return <meshBasicMaterial map={texture} side={side} toneMapped={false} />;
}

/** Clear plastic is deliberately reserved for the tray and CD perimeter. */
export function ClearPlasticMaterial({ opacity = 0.2, thickness = 0.012 }: {
  opacity?: number;
  thickness?: number;
}) {
  return (
    <meshPhysicalMaterial
      color="#ffffff"
      transparent
      opacity={opacity}
      transmission={0.9}
      thickness={thickness}
      roughness={0.07}
      metalness={0}
      ior={1.46}
      depthWrite={false}
      toneMapped={false}
    />
  );
}
