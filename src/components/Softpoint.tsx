import { useMemo } from 'react';
import * as THREE from 'three';
import { MeshTransmissionMaterial } from '@react-three/drei';

interface SoftpointProps {
  thickness: number;
  radius: number;
  color: string;
  transmission?: number;
  roughness?: number;
  bevelSize?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  bgColor?: string;
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
  bgColor = '#ffffff',
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
      <MeshTransmissionMaterial
        color={color}
        transmission={transmission}
        transparent={true}
        opacity={1}
        metalness={0.05}
        roughness={roughness}
        ior={1.55}
        thickness={thickness > 0 ? thickness * 1.5 : 0.5}
        attenuationColor={color}
        attenuationDistance={0.5}
        clearcoat={1}
        clearcoatRoughness={0.1}
        envMapIntensity={2.5}
        side={THREE.DoubleSide}
        background={new THREE.Color(bgColor)}
        resolution={1024}
        samples={16}
        chromaticAberration={0.03}
        anisotropy={0.1}
      />
    </mesh>
  );
}
