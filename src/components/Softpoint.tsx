import { useMemo } from 'react';
import * as THREE from 'three';

interface SoftpointProps {
  thickness: number;
  radius: number;
  color: string;
  roughness?: number;
  metalness?: number;
  clearcoat?: number;
  clearcoatRoughness?: number;
  bevelSize?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  bgColor?: string;
  transmission?: number;
}

export function Softpoint({
  thickness,
  radius,
  color,
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
      bevelSegments: 32, // High segments for smooth glass look
      curveSegments: 128, // High segments for smooth corners
    });
    geo.center();
    geo.computeVertexNormals(); // Ensure smooth shading
    return geo;
  }, [thickness, radius, bevelSize]);

  return (
    <mesh geometry={geometry} position={position} rotation={rotation} castShadow receiveShadow>
      <meshPhysicalMaterial
        color={color}
        roughness={0.08}
        metalness={0.02}
        clearcoat={1.0}
        clearcoatRoughness={0.05}
        reflectivity={1.0}
        envMapIntensity={2.0}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
