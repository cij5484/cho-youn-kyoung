import * as THREE from 'three';

export function PrintedPaperMaterial({ texture, side = THREE.FrontSide }: {
  texture: THREE.Texture;
  side?: THREE.Side;
}) {
  return <meshBasicMaterial map={texture} side={side} toneMapped={false} />;
}

export function HanOuterPlasticMaterial() {
  return <meshPhysicalMaterial color="#ffffff" transparent opacity={0.24} roughness={0.24} metalness={0} clearcoat={0.12} clearcoatRoughness={0.78} transmission={0.16} thickness={0.018} depthWrite={false} />;
}

function ClearPlasticMaterial({ opacity, thickness, roughness, clearcoat, specularIntensity, transmission }: {
  opacity: number; thickness: number; roughness: number; clearcoat: number; specularIntensity: number; transmission: number;
}) {
  return (
    <meshPhysicalMaterial
      color="#ffffff"
      transparent
      opacity={opacity}
      transmission={transmission}
      thickness={thickness}
      roughness={roughness}
      metalness={0}
      ior={1.47}
      clearcoat={clearcoat}
      clearcoatRoughness={roughness}
      specularIntensity={specularIntensity}
      depthWrite={false}
      toneMapped={false}
    />
  );
}

export function TrayClearPlasticMaterial({ opacity = 0.2, thickness = 0.012 }: { opacity?: number; thickness?: number }) {
  return <ClearPlasticMaterial opacity={opacity} thickness={thickness} transmission={0.9} roughness={0.2} clearcoat={0.08} specularIntensity={0.5} />;
}
