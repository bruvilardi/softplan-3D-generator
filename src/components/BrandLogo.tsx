import { useMemo } from 'react';
import * as THREE from 'three';

interface BrandLogoProps {
  thickness: number;
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

export function BrandLogo({
  thickness,
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
}: BrandLogoProps) {
  const geometry = useMemo(() => {
    const sShape = new THREE.Shape();
    
    // Mathematical construction of the exact S shape ribbon
    // T (Thickness) = 1.0
    // Left loop center: (0, 0). Outer radius 1.5, inner radius 0.5.
    // Right loop center: (2, -2). Outer radius 1.5, inner radius 0.5.
    
    // 1. Top bar right edge (Top-Right-Top corner)
    sShape.moveTo(3.5, 1.5);
    // 2. Top bar top edge
    sShape.lineTo(0, 1.5);
    // 3. Left outer arc (from top to bottom)
    sShape.absarc(0, 0, 1.5, Math.PI / 2, Math.PI * 1.5, false); // Ends at (0, -1.5)
    // 4. Middle bar bottom edge
    sShape.lineTo(2, -1.5);
    // 5. Right inner arc (from top to bottom, clockwise)
    sShape.absarc(2, -2, 0.5, Math.PI / 2, -Math.PI / 2, true); // Ends at (2, -2.5)
    // 6. Bottom bar top edge
    sShape.lineTo(-1.5, -2.5);
    // 7. Bottom bar left cut
    sShape.lineTo(-1.5, -3.5);
    // 8. Bottom bar bottom edge
    sShape.lineTo(2, -3.5);
    // 9. Right outer arc (from bottom to top, counter-clockwise)
    sShape.absarc(2, -2, 1.5, -Math.PI / 2, Math.PI / 2, false); // Ends at (2, -0.5)
    // 10. Middle bar top edge
    sShape.lineTo(0, -0.5);
    // 11. Left inner arc (from bottom to top, clockwise)
    sShape.absarc(0, 0, 0.5, -Math.PI / 2, Math.PI / 2, true); // Ends at (0, 0.5)
    // 12. Top bar bottom edge
    sShape.lineTo(3.5, 0.5);
    // 13. Top bar right cut (closes the shape)
    sShape.lineTo(3.5, 1.5);

    // Trace Dot shape (Softpoint format)
    const dotShape = new THREE.Shape();
    const r = 0.4; // Rounded corner radius
    const gap = 0.8; // Gap below the bottom bar (Increased)
    const dotTop = -3.5 - gap; 
    const dotBottom = dotTop - 1.0; 
    
    dotShape.moveTo(-0.5, dotTop); // Top-Right (sharp)
    dotShape.lineTo(-1.5 + r, dotTop); // Top-Left start
    dotShape.quadraticCurveTo(-1.5, dotTop, -1.5, dotTop - r); // Top-Left round
    dotShape.lineTo(-1.5, dotBottom); // Bottom-Left (sharp)
    dotShape.lineTo(-0.5 - r, dotBottom); // Bottom-Right start
    dotShape.quadraticCurveTo(-0.5, dotBottom, -0.5, dotBottom + r); // Bottom-Right round
    dotShape.lineTo(-0.5, dotTop); // Close

    // Scale to fit nicely in the scene (max dimension around 2-3 units)
    const scale = 0.35;
    // Keep bevel well-proportioned to prevent self-intersection on tight inner curves
    const safeBevel = Math.min(bevelSize / scale, 0.08);

    const geo = new THREE.ExtrudeGeometry([sShape, dotShape], {
      depth: thickness / scale, // Adjust depth so final thickness matches exact prop value
      bevelEnabled: true,
      bevelThickness: safeBevel,
      bevelSize: safeBevel,
      bevelSegments: 12,
      curveSegments: 128, // Ultra-high curve resolution for smooth rounding
      steps: 1,
    });
    
    geo.scale(scale, scale, scale);
    geo.center();
    // Continuous smooth vertex normals along curves (no jagged rippling/denteado)
    geo.computeVertexNormals();
    return geo;
  }, [thickness, bevelSize]);

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
        side={THREE.FrontSide}
      />
    </mesh>
  );
}
