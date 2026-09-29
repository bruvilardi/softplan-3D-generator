import { useMemo } from 'react';
import * as THREE from 'three';
import { RoundedBox } from '@react-three/drei';
import { Custom3DModel, Model3DPart, ExtrudePart } from '../types/custom3D';

interface CustomModel3DProps {
  model: Custom3DModel;
  color: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  roughness?: number;
  metalness?: number;
  clearcoat?: number;
  clearcoatRoughness?: number;
  reflectivity?: number;
  envMapIntensity?: number;
}

interface MaterialParams {
  color: string;
  roughness: number;
  metalness: number;
  clearcoat: number;
  clearcoatRoughness: number;
  reflectivity: number;
  envMapIntensity: number;
}

function ExtrudePartMesh({ part, mat }: { part: ExtrudePart; mat: MaterialParams }) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    if (part.shape && part.shape.length > 0) {
      part.shape.forEach((cmd, i) => {
        if (cmd.op === 'move' || i === 0) {
          shape.moveTo(cmd.x, cmd.y);
        } else if (cmd.op === 'line') {
          shape.lineTo(cmd.x, cmd.y);
        } else if (cmd.op === 'quad' && cmd.cpX !== undefined && cmd.cpY !== undefined) {
          shape.quadraticCurveTo(cmd.cpX, cmd.cpY, cmd.x, cmd.y);
        } else if (
          cmd.op === 'bezier' &&
          cmd.cp1X !== undefined &&
          cmd.cp1Y !== undefined &&
          cmd.cp2X !== undefined &&
          cmd.cp2Y !== undefined
        ) {
          shape.bezierCurveTo(cmd.cp1X, cmd.cp1Y, cmd.cp2X, cmd.cp2Y, cmd.x, cmd.y);
        } else if (cmd.op === 'arc' && cmd.radius !== undefined) {
          shape.absarc(
            cmd.x,
            cmd.y,
            cmd.radius,
            cmd.startAngle ?? 0,
            cmd.endAngle ?? Math.PI * 2,
            false
          );
        } else {
          shape.lineTo(cmd.x, cmd.y);
        }
      });
    } else {
      // Default rounded rectangle
      const w = 1;
      const h = 1;
      const r = 0.2;
      shape.moveTo(-w / 2 + r, -h / 2);
      shape.lineTo(w / 2 - r, -h / 2);
      shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
      shape.lineTo(w / 2, h / 2 - r);
      shape.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
      shape.lineTo(-w / 2 + r, h / 2);
      shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
      shape.lineTo(-w / 2, -h / 2 + r);
      shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    }

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: part.depth ?? 0.3,
      bevelEnabled: part.bevelEnabled ?? true,
      bevelSize: part.bevelSize ?? 0.04,
      bevelThickness: part.bevelThickness ?? 0.04,
      bevelSegments: 12,
      curveSegments: 64,
      steps: 1,
    });
    geo.center();
    geo.computeVertexNormals();
    return geo;
  }, [part]);

  return (
    <mesh
      geometry={geometry}
      position={part.position || [0, 0, 0]}
      rotation={part.rotation || [0, 0, 0]}
      scale={part.scale || [1, 1, 1]}
      castShadow
      receiveShadow
    >
      <meshPhysicalMaterial
        color={mat.color}
        roughness={mat.roughness}
        metalness={mat.metalness}
        clearcoat={mat.clearcoat}
        clearcoatRoughness={mat.clearcoatRoughness}
        reflectivity={mat.reflectivity}
        envMapIntensity={mat.envMapIntensity}
        side={THREE.FrontSide}
      />
    </mesh>
  );
}

function RenderSinglePart({ part, mat }: { part: Model3DPart; mat: MaterialParams }) {
  const pos = part.position || [0, 0, 0];
  const rot = part.rotation || [0, 0, 0];
  const scl = part.scale || [1, 1, 1];

  const material = (
    <meshPhysicalMaterial
      color={mat.color}
      roughness={mat.roughness}
      metalness={mat.metalness}
      clearcoat={mat.clearcoat}
      clearcoatRoughness={mat.clearcoatRoughness}
      reflectivity={mat.reflectivity}
      envMapIntensity={mat.envMapIntensity}
      side={THREE.DoubleSide}
    />
  );

  switch (part.type) {
    case 'extrude':
      return <ExtrudePartMesh part={part} mat={mat} />;

    case 'sphere':
      return (
        <mesh position={pos} rotation={rot} scale={scl} castShadow receiveShadow>
          <sphereGeometry
            args={[
              part.radius || 1,
              48,
              36,
              0,
              part.phiLength ?? Math.PI * 2,
              part.thetaStart ?? 0,
              part.thetaLength ?? Math.PI,
            ]}
          />
          {material}
        </mesh>
      );

    case 'cylinder':
      return (
        <mesh position={pos} rotation={rot} scale={scl} castShadow receiveShadow>
          <cylinderGeometry
            args={[
              part.radiusTop ?? 1,
              part.radiusBottom ?? 1,
              part.height ?? 1,
              part.radialSegments ?? 48,
              1,
              false,
              part.thetaStart ?? 0,
              part.thetaLength ?? part.phiLength ?? Math.PI * 2,
            ]}
          />
          {material}
        </mesh>
      );

    case 'box': {
      const w = part.width ?? 1;
      const h = part.height ?? 1;
      const d = part.depth ?? 1;
      const minDim = Math.min(w, h, d);
      const bevelRadius = Math.min(0.04, Math.max(0.005, minDim * 0.15));
      return (
        <RoundedBox
          args={[w, h, d]}
          radius={bevelRadius}
          smoothness={4}
          position={pos}
          rotation={rot}
          scale={scl}
          castShadow
          receiveShadow
        >
          {material}
        </RoundedBox>
      );
    }

    case 'torus':
      return (
        <mesh position={pos} rotation={rot} scale={scl} castShadow receiveShadow>
          <torusGeometry args={[part.radius ?? 1, part.tube ?? 0.2, 32, 64, part.arc]} />
          {material}
        </mesh>
      );

    case 'capsule':
      return (
        <mesh position={pos} rotation={rot} scale={scl} castShadow receiveShadow>
          <capsuleGeometry args={[part.radius ?? 0.5, part.length ?? 1, 24, 48]} />
          {material}
        </mesh>
      );

    case 'cone':
      return (
        <mesh position={pos} rotation={rot} scale={scl} castShadow receiveShadow>
          <coneGeometry args={[part.radius ?? 1, part.height ?? 1, part.radialSegments ?? 48]} />
          {material}
        </mesh>
      );

    default:
      return null;
  }
}

export function CustomModel3D({
  model,
  color,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  roughness = 0.22,
  metalness = 0.02,
  clearcoat = 0.45,
  clearcoatRoughness = 0.12,
  reflectivity = 0.65,
  envMapIntensity = 1.1,
}: CustomModel3DProps) {
  const scaleArray: [number, number, number] = Array.isArray(scale)
    ? scale
    : [scale, scale, scale];

  const mat: MaterialParams = useMemo(() => ({
    color: color === 'mixed' ? '#5c5cff' : color,
    roughness,
    metalness,
    clearcoat,
    clearcoatRoughness,
    reflectivity,
    envMapIntensity,
  }), [color, roughness, metalness, clearcoat, clearcoatRoughness, reflectivity, envMapIntensity]);

  // Handle imported 3D CAD/GLTF/OBJ objects and procedural sculptures
  const clonedScene = useMemo(() => {
    if (!model.importedScene) return null;
    const clone = model.importedScene.clone(true);
    clone.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.material = new THREE.MeshPhysicalMaterial({
          color: mat.color,
          roughness: mat.roughness,
          metalness: mat.metalness,
          clearcoat: mat.clearcoat,
          clearcoatRoughness: mat.clearcoatRoughness,
          reflectivity: mat.reflectivity,
          envMapIntensity: mat.envMapIntensity,
          side: THREE.DoubleSide,
        });
      }
    });
    return clone;
  }, [model.importedScene, mat]);

  if (clonedScene) {
    return (
      <group position={position} rotation={rotation} scale={scaleArray}>
        <primitive object={clonedScene} />
      </group>
    );
  }

  return (
    <group position={position} rotation={rotation} scale={scaleArray}>
      {model.parts.map((part, index) => (
        <RenderSinglePart key={index} part={part} mat={mat} />
      ))}
    </group>
  );
}
