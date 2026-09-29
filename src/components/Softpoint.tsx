import { useMemo } from 'react';
import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';

interface SoftpointProps {
  thickness: number;
  radius: number;
  color: string;
  roughness?: number;
  metalness?: number;
  clearcoat?: number;
  clearcoatRoughness?: number;
  reflectivity?: number;
  envMapIntensity?: number;
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
  roughness = 0.22,
  metalness = 0.02,
  clearcoat = 0.45,
  clearcoatRoughness = 0.12,
  reflectivity = 0.65,
  envMapIntensity = 1.1,
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

    let geo: THREE.BufferGeometry = new THREE.ExtrudeGeometry(shape, {
      depth: thickness,
      bevelEnabled: true,
      bevelThickness: bevelSize,
      bevelSize: bevelSize,
      bevelSegments: 16,
      curveSegments: 96,
    });
    geo.center();
    // Use toCreasedNormals with 35 degrees threshold to keep front/back faces perfectly flat
    // and rounded corners smooth without specular crease line artifacts
    geo = BufferGeometryUtils.toCreasedNormals(geo, (35 * Math.PI) / 180);
    return geo;
  }, [thickness, radius, bevelSize]);

  return (
    <mesh geometry={geometry} position={position} rotation={rotation} castShadow receiveShadow>
      <meshPhysicalMaterial
        color={color}
        roughness={roughness}
        metalness={metalness}
        clearcoat={clearcoat}
        clearcoatRoughness={clearcoatRoughness}
        reflectivity={reflectivity}
        envMapIntensity={envMapIntensity}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
