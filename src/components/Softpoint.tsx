import { useMemo } from 'react';
import * as THREE from 'three';

interface SoftpointProps {
  thickness: number;
  radius: number;
  color: string;
  transmission?: number;
  roughness?: number;
  bevelSize?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

export function Softpoint({
  thickness,
  radius,
  color,
  transmission = 1,
  roughness = 0.05,
  bevelSize = 0.05,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}: SoftpointProps) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    const size = 2; // Base size of the square (2x2)
    const r = radius * size; // r is a percentage of size (0 to 0.5)

    // Start at Top-Right (sharp)
    shape.moveTo(size / 2, size / 2);
    // Line to Top-Left, then round it
    shape.lineTo(-size / 2 + r, size / 2);
    if (r > 0) {
      shape.quadraticCurveTo(-size / 2, size / 2, -size / 2, size / 2 - r);
    }
    // Line to Bottom-Left (sharp)
    shape.lineTo(-size / 2, -size / 2);
    // Line to Bottom-Right, then round it
    shape.lineTo(size / 2 - r, -size / 2);
    if (r > 0) {
      shape.quadraticCurveTo(size / 2, -size / 2, size / 2, -size / 2 + r);
    }
    // Back to Top-Right
    shape.lineTo(size / 2, size / 2);

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: thickness,
      bevelEnabled: true,
      bevelThickness: bevelSize,
      bevelSize: bevelSize,
      bevelSegments: 16, // High segments for smooth glass look
      curveSegments: 32, // High segments for smooth corners
    });
    geo.center();
    return geo;
  }, [thickness, radius, bevelSize]);

  return (
    <mesh geometry={geometry} position={position} rotation={rotation} castShadow receiveShadow>
      <meshPhysicalMaterial
        color={color}
        transmission={transmission}
        opacity={1}
        metalness={0.02}
        roughness={roughness}
        ior={1.55}
        thickness={thickness > 0 ? thickness * 1.5 : 0.5}
        attenuationColor={color}
        attenuationDistance={0.25}
        clearcoat={1}
        clearcoatRoughness={0}
        envMapIntensity={2}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
