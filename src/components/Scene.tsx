import { useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Center } from '@react-three/drei';
import * as THREE from 'three';
import { Softpoint } from './Softpoint';
import { BrandLogo } from './BrandLogo';
import { CustomModel3D } from './CustomModel3D';
import { Custom3DModel, PRESET_MODELS } from '../types/custom3D';

export type ShapeType = 'softpoint' | 'logo' | 'mixed' | 'custom';
export type LayoutMode = 'linear' | 'grid' | 'radial' | 'random';

interface SceneProps {
  shapeType: ShapeType;
  customModel?: Custom3DModel | null;
  layoutMode: LayoutMode;
  quantity: number;
  thickness: number;
  radius: number;
  twistAngle: number;
  spacing: number;
  color: string;
  roughness?: number;
  metalness?: number;
  clearcoat?: number;
  clearcoatRoughness?: number;
  transmission?: number;
  bgColor: string;
  ambientIntensity: number;
  lightRotation: number;
  environmentPreset?: 'studio' | 'city' | 'sunset' | 'dawn' | 'night' | 'warehouse' | 'forest' | 'apartment' | 'park' | 'lobby';
  transparentBg?: boolean;
  animate?: boolean;
  animationSpeed?: number;
  animationType?: 'rotate' | 'zoom-in' | 'zoom-out' | 'float' | 'tumble' | 'swing' | 'all';
  animationScope?: 'group' | 'individual';
  cameraFov?: number;
  cameraDistance?: number;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  cameraTrigger?: { id: number, preset: string };
  itemOverrides?: Record<number, { x: number, y: number, z: number, rx: number, ry: number, rz: number }>;
  onItemDrag?: (index: number, x: number, y: number, z: number) => void;
  circleTilt?: number;
  bendAngle?: number;
  waveAmplitude?: number;
  waveFrequency?: number;
  alignmentAxis?: 'x' | 'y' | 'z';
  exportBridgeRef?: React.MutableRefObject<any>;
  isRecording?: boolean;
  dragMode?: 'pan' | 'rotate';
  isSpacePressed?: boolean;
}

function SceneExportBridge({ bridgeRef }: { bridgeRef?: React.MutableRefObject<any> }) {
  const { gl, scene, camera } = useThree();

  useEffect(() => {
    if (!bridgeRef) return;
    bridgeRef.current = {
      captureImage: (format: 'png' | 'jpeg', transparent: boolean): string => {
        const originalDpr = gl.getPixelRatio();
        const originalBg = scene.background;

        // Super-sample at 3x or 4x device pixel ratio for smooth anti-aliased output without jagged edges
        const targetDpr = Math.min(Math.max(window.devicePixelRatio || 2, 2) * 2, 4);
        gl.setPixelRatio(targetDpr);

        if (transparent) {
          scene.background = null;
          gl.setClearColor(0x000000, 0);
        }

        gl.render(scene, camera);

        const mime = format === 'png' ? 'image/png' : 'image/jpeg';
        const dataUrl = gl.domElement.toDataURL(mime, format === 'jpeg' ? 0.98 : undefined);

        // Restore original state
        if (transparent) {
          scene.background = originalBg;
        }
        gl.setPixelRatio(originalDpr);
        gl.render(scene, camera);

        return dataUrl;
      }
    };
  }, [bridgeRef, gl, scene, camera]);

  return null;
}

function CameraController({ fov, trigger }: { fov: number, trigger?: { id: number, preset: string } }) {
  const { camera, controls } = useThree();

  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
  }, [fov, camera]);

  useEffect(() => {
    if (!trigger || !controls) return;
    
    const p = trigger.preset;
    if (p === 'center' || p === 'reset') {
      (controls as any).target.set(0, 0, 0);
      (controls as any).update();
      return;
    }

    const targetPos = new THREE.Vector3();
    
    if (p === 'isometric') {
      targetPos.set(6, 6, 6);
    } else if (p === 'front') {
      targetPos.set(0, 0, 8);
    } else if (p === 'top') {
      targetPos.set(0, 10, 0);
    } else if (p === 'side') {
      targetPos.set(8, 0, 0);
    } else if (p === 'bottom') {
      targetPos.set(0, -10, 0);
    } else if (p === 'back') {
      targetPos.set(0, 0, -8);
    } else if (p === 'close-up') {
      targetPos.set(0, 0, 3);
    }
    
    camera.position.copy(targetPos);
    camera.lookAt(0, 0, 0);
    (controls as any).target.set(0, 0, 0);
    (controls as any).update();
  }, [trigger, camera, controls]);

  return null;
}

function SpaceMousePanHandler({ isSpacePressed }: { isSpacePressed?: boolean }) {
  const { camera, controls, gl } = useThree();
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!isSpacePressed) {
      lastPosRef.current = null;
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isSpacePressed || !controls) return;

      let deltaX = e.movementX;
      let deltaY = e.movementY;

      if (deltaX === undefined || deltaY === undefined || (deltaX === 0 && deltaY === 0)) {
        if (lastPosRef.current) {
          deltaX = e.clientX - lastPosRef.current.x;
          deltaY = e.clientY - lastPosRef.current.y;
        } else {
          lastPosRef.current = { x: e.clientX, y: e.clientY };
          return;
        }
      }
      lastPosRef.current = { x: e.clientX, y: e.clientY };

      if (deltaX === 0 && deltaY === 0) return;

      const persCamera = camera as THREE.PerspectiveCamera;
      const target = (controls as any).target as THREE.Vector3;
      if (!target) return;

      const dist = persCamera.position.distanceTo(target);
      const fovRad = ((persCamera.fov || 50) * Math.PI) / 180;
      const heightAtTarget = 2 * Math.tan(fovRad / 2) * dist;
      const factor = heightAtTarget / (gl.domElement.clientHeight || window.innerHeight);

      // Camera right and up vectors in world space
      const vRight = new THREE.Vector3();
      const vUp = new THREE.Vector3();
      const vForward = new THREE.Vector3();
      persCamera.matrix.extractBasis(vRight, vUp, vForward);

      // Translate camera and target together
      const moveVec = new THREE.Vector3()
        .addScaledVector(vRight, -deltaX * factor)
        .addScaledVector(vUp, deltaY * factor);

      persCamera.position.add(moveVec);
      target.add(moveVec);
      (controls as any).update();
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isSpacePressed, camera, controls, gl]);

  return null;
}

function AnimatedItem({
  index,
  basePosition,
  baseRotation,
  animate,
  animationSpeed,
  animationType,
  animationScope,
  children
}: {
  index: number;
  basePosition: [number, number, number];
  baseRotation: [number, number, number];
  animate: boolean;
  animationSpeed: number;
  animationType: string;
  animationScope: string;
  children: React.ReactNode;
}) {
  const itemRef = useRef<THREE.Group>(null);
  const rotGroupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!itemRef.current || !rotGroupRef.current) return;
    
    if (animate && (animationScope === 'individual' || animationScope === 'self')) {
      const speed = animationSpeed || 1;
      const time = state.clock.elapsedTime * speed;
      const offset = index * 0.5; 
      const localTime = time + offset;

      // Handle positions: float ONLY if float or all
      if (animationType === 'float' || animationType === 'all') {
        itemRef.current.position.set(
          basePosition[0],
          basePosition[1] + Math.sin(localTime) * 0.5,
          basePosition[2]
        );
      } else {
        // Purely fixed in place - ZERO vertical shift
        itemRef.current.position.set(...basePosition);
      }

      // Handle scales
      if (animationType === 'zoom-in' || animationType === 'all') {
        const sin01 = Math.sin(localTime) * 0.5 + 0.5;
        const scale = 1 + sin01 * 2.5; 
        itemRef.current.scale.set(scale, scale, scale);
      } else if (animationType === 'zoom-out') {
        const sin01 = Math.sin(localTime) * 0.5 + 0.5;
        const scale = 0.2 + sin01 * 0.8; 
        itemRef.current.scale.set(scale, scale, scale);
      } else {
        itemRef.current.scale.set(1, 1, 1);
      }

      // Handle pure in-place vertical axis rotation with ZERO wobble / ZERO up-down shift
      if (animationType === 'rotate' || animationType === 'all') {
        rotGroupRef.current.rotation.y += delta * speed;
      } else if (animationType === 'tumble') {
        rotGroupRef.current.rotation.x += delta * speed * 0.5;
        rotGroupRef.current.rotation.y += delta * speed * 0.7;
        rotGroupRef.current.rotation.z += delta * speed * 0.3;
      } else if (animationType === 'swing') {
        rotGroupRef.current.rotation.set(
          0,
          Math.sin(localTime * 0.5) * 0.4,
          Math.sin(localTime) * 0.2
        );
      } else {
        rotGroupRef.current.rotation.set(0, 0, 0);
      }
    } else {
      itemRef.current.position.set(...basePosition);
      itemRef.current.scale.set(1, 1, 1);
      rotGroupRef.current.rotation.set(0, 0, 0);
    }
  });

  return (
    <group ref={itemRef} position={basePosition}>
      <group ref={rotGroupRef}>
        <group rotation={baseRotation}>
          {children}
        </group>
      </group>
    </group>
  );
}

function DraggableItemWrapper({ index, pos, basePos, onItemDrag, children, isSpacePressed }: any) {
  const { camera } = useThree();
  const draggingRef = useRef(false);
  const dragPlaneRef = useRef(new THREE.Plane());
  const planeIntersectRef = useRef(new THREE.Vector3());
  const offsetRef = useRef(new THREE.Vector3());

  const handlePointerDown = (e: any) => {
    if (isSpacePressed) return;
    // Only drag with left mouse button
    if (e.button !== undefined && e.button !== 0) return;
    e.stopPropagation();

    // Construct a plane parallel to the camera view plane at the piece's position
    const normal = new THREE.Vector3();
    camera.getWorldDirection(normal).negate();
    const currentWorldPos = new THREE.Vector3(...pos);
    dragPlaneRef.current.setFromNormalAndCoplanarPoint(normal, currentWorldPos);

    if (e.ray.intersectPlane(dragPlaneRef.current, planeIntersectRef.current)) {
      offsetRef.current.copy(planeIntersectRef.current).sub(currentWorldPos);
      draggingRef.current = true;
      try {
        (e.target as HTMLElement)?.setPointerCapture?.(e.pointerId);
      } catch (_) {}
    }
  };

  const handlePointerMove = (e: any) => {
    if (!draggingRef.current || isSpacePressed) return;
    e.stopPropagation();

    if (e.ray.intersectPlane(dragPlaneRef.current, planeIntersectRef.current)) {
      const newPos = planeIntersectRef.current.clone().sub(offsetRef.current);
      const dx = Number((newPos.x - basePos[0]).toFixed(2));
      const dy = Number((newPos.y - basePos[1]).toFixed(2));
      const dz = Number((newPos.z - basePos[2]).toFixed(2));
      onItemDrag?.(index, dx, dy, dz);
    }
  };

  const handlePointerUp = (e: any) => {
    if (draggingRef.current) {
      draggingRef.current = false;
      e.stopPropagation();
      try {
        (e.target as HTMLElement)?.releasePointerCapture?.(e.pointerId);
      } catch (_) {}
    }
  };

  return (
    <group
      position={pos}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {children}
    </group>
  );
}

function InnerScene({
  shapeType,
  customModel,
  layoutMode,
  quantity,
  thickness,
  radius,
  twistAngle,
  spacing,
  color,
  roughness = 0.22,
  metalness = 0.02,
  clearcoat = 0.45,
  clearcoatRoughness = 0.12,
  bgColor,
  animate,
  animationSpeed = 1,
  animationType = 'rotate',
  animationScope = 'group',
  itemOverrides = {},
  onItemDrag,
  circleTilt = 0,
  bendAngle = 0,
  waveAmplitude = 0,
  waveFrequency = 1,
  alignmentAxis = 'x',
  isSpacePressed,
}: Partial<SceneProps>) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const isMultiItem = (quantity || 1) > 1;

    if (animate && animationScope === 'group' && isMultiItem) {
      const speed = animationSpeed || 1;
      const time = state.clock.elapsedTime * speed;
      
      // Reset transforms for modes that don't use them to avoid getting stuck
      if (animationType !== 'zoom-in' && animationType !== 'zoom-out' && animationType !== 'all') {
        groupRef.current.scale.set(1, 1, 1);
      }
      if (animationType !== 'float' && animationType !== 'all') {
        groupRef.current.position.y = 0;
      }
      if (animationType !== 'tumble') {
        groupRef.current.rotation.x = 0;
      }
      if (animationType !== 'swing' && animationType !== 'tumble') {
        groupRef.current.rotation.z = 0;
      }

      // Apply animations
      if (animationType === 'rotate' || animationType === 'all') {
        groupRef.current.rotation.y += delta * speed;
      } else if (animationType === 'tumble') {
        groupRef.current.rotation.x += delta * speed * 0.5;
        groupRef.current.rotation.y += delta * speed * 0.7;
        groupRef.current.rotation.z += delta * speed * 0.3;
      } else if (animationType === 'swing') {
        groupRef.current.rotation.z = Math.sin(time) * 0.3;
        groupRef.current.rotation.y = Math.sin(time * 0.5) * 0.4;
      }

      if (animationType === 'zoom-in' || animationType === 'all') {
        const sin01 = Math.sin(time) * 0.5 + 0.5;
        const scale = 1 + sin01 * 5; 
        groupRef.current.scale.set(scale, scale, scale);
      } else if (animationType === 'zoom-out') {
        const sin01 = Math.sin(time) * 0.5 + 0.5;
        const scale = 0.15 + sin01 * 0.85; 
        groupRef.current.scale.set(scale, scale, scale);
      }

      if (animationType === 'float' || animationType === 'all') {
        groupRef.current.position.y = Math.sin(time) * 0.6;
      }
    } else {
       groupRef.current.position.set(0, 0, 0);
       groupRef.current.rotation.set(0, 0, 0);
       groupRef.current.scale.set(1, 1, 1);
    }
  });

  const items = Array.from({ length: quantity || 1 });

  // Deterministic random generator for the 'random' scatter mode
  const randomOffsets = useMemo(() => {
    const offsets = [];
    let seed = 12345;
    const random = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    
    for (let i = 0; i < 100; i++) {
      offsets.push({
        x: (random() - 0.5) * 2,
        y: (random() - 0.5) * 2,
        z: (random() - 0.5) * 2,
        rx: random() * Math.PI * 2,
        ry: random() * Math.PI * 2,
        rz: random() * Math.PI * 2,
      });
    }
    return offsets;
  }, []);

  return (
    <Center>
      <group rotation={layoutMode === 'radial' ? [(circleTilt || 0) * Math.PI / 180, 0, 0] : [0, 0, 0]}>
        <group ref={groupRef}>
          {items.map((_, i) => {
          let posX = 0, posY = 0, posZ = 0;
          let rotX = 0, rotY = 0, rotZ = 0;
          
          const gap = (spacing || 0) * 3.5;

          if (layoutMode === 'linear') {
            const L = ((quantity || 1) - 1) * gap;
            const s = (i - ((quantity || 1) - 1) / 2) * gap;

            if (bendAngle && bendAngle > 0 && L > 0) {
              const theta_total = (bendAngle * Math.PI) / 180;
              const R = L / theta_total;
              const theta = (s / L) * theta_total;
              
              if (alignmentAxis === 'z') {
                posZ = R * Math.sin(theta);
                posX = R * Math.cos(theta) - R;
                rotY = -theta;
              } else if (alignmentAxis === 'y') {
                posY = R * Math.sin(theta);
                posX = R * Math.cos(theta) - R;
                rotZ = theta;
              } else {
                posX = R * Math.sin(theta);
                posZ = R * Math.cos(theta) - R;
                rotY = theta;
              }
            } else {
              if (alignmentAxis === 'z') posZ = s;
              else if (alignmentAxis === 'y') posY = -s;
              else posX = s;
            }

            if (waveAmplitude && waveAmplitude > 0) {
              const freq = (waveFrequency || 1) * Math.PI * 2 / (L || 1);
              const waveOff = Math.sin(s * freq) * waveAmplitude;
              if (alignmentAxis === 'y') posX += waveOff;
              else posY += waveOff;
            }

            rotZ = ((twistAngle || 0) * Math.PI) / 180 * i;
          } else if (layoutMode === 'grid') {
            const cols = Math.ceil(Math.sqrt(quantity || 1));
            const rows = Math.ceil((quantity || 1) / cols);
            const col = i % cols;
            const row = Math.floor(i / cols);
            posX = (col - (cols - 1) / 2) * gap;
            posY = (row - (rows - 1) / 2) * gap;
            rotZ = ((twistAngle || 0) * Math.PI) / 180 * i;
          } else if (layoutMode === 'radial') {
            const angle = (i / (quantity || 1)) * Math.PI * 2;
            const r = gap * 1.5;
            posX = Math.cos(angle) * r;
            posY = Math.sin(angle) * r;
            rotZ = angle + (((twistAngle || 0) * Math.PI) / 180);
          } else if (layoutMode === 'random') {
            const rnd = randomOffsets[i] || { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0 };
            posX = rnd.x * gap * 1.5;
            posY = rnd.y * gap * 1.5;
            posZ = rnd.z * gap * 1.5;
            rotX = rnd.rx;
            rotY = rnd.ry;
            rotZ = rnd.rz;
          }
          
          if (itemOverrides[i]) {
            const over = itemOverrides[i];
            posX += over.x;
            posY += over.y;
            posZ += over.z;
            rotX += over.rx;
            rotY += over.ry;
            rotZ += over.rz;
          }

          const pos: [number, number, number] = [posX, posY, posZ];
          const rot: [number, number, number] = [rotX, rotY, rotZ];

          // Compute the base layout position (without overrides) to calculate offset later
          const basePosX = posX - (itemOverrides[i]?.x || 0);
          const basePosY = posY - (itemOverrides[i]?.y || 0);
          const basePosZ = posZ - (itemOverrides[i]?.z || 0);

          return (
            <DraggableItemWrapper
              key={i}
              index={i}
              pos={pos}
              basePos={[basePosX, basePosY, basePosZ]}
              onItemDrag={onItemDrag}
              isSpacePressed={isSpacePressed}
            >
              <AnimatedItem
                index={i}
                basePosition={[0, 0, 0]}
                baseRotation={rot}
                animate={animate || false}
                animationSpeed={animationSpeed}
                animationType={animationType}
                animationScope={(quantity || 1) <= 1 ? 'individual' : animationScope}
              >
                {shapeType === 'custom' && customModel ? (
                  <CustomModel3D
                    model={customModel}
                    color={color === 'mixed' ? (i % 2 === 0 ? '#5c5cff' : '#ffffff') : color}
                    position={[0, 0, 0]}
                    rotation={[0, 0, 0]}
                    roughness={roughness}
                    metalness={metalness}
                    clearcoat={clearcoat}
                    clearcoatRoughness={clearcoatRoughness}
                  />
                ) : (shapeType === 'mixed' ? (i % 2 === 0 ? 'softpoint' : 'logo') : shapeType) === 'logo' ? (
                  <BrandLogo
                    position={[0, 0, 0]}
                    rotation={[0, 0, 0]}
                    thickness={thickness || 0.5}
                    color={color === 'mixed' ? (i % 2 === 0 ? '#5c5cff' : '#ffffff') : color}
                    bevelSize={0.05}
                    roughness={roughness}
                    metalness={metalness}
                    clearcoat={clearcoat}
                    clearcoatRoughness={clearcoatRoughness}
                  />
                ) : (
                  <Softpoint
                    position={[0, 0, 0]}
                    rotation={[0, 0, 0]}
                    thickness={thickness || 0.5}
                    radius={radius || 0.4}
                    color={color === 'mixed' ? (i % 2 === 0 ? '#5c5cff' : '#ffffff') : color}
                    bevelSize={0.05}
                    roughness={roughness}
                    metalness={metalness}
                    clearcoat={clearcoat}
                    clearcoatRoughness={clearcoatRoughness}
                  />
                )}
              </AnimatedItem>
            </DraggableItemWrapper>
          );
        })}
        </group>
      </group>
    </Center>
  );
}

export function Scene({
  shapeType,
  customModel,
  layoutMode,
  quantity,
  thickness,
  radius,
  twistAngle,
  spacing,
  color,
  roughness = 0.22,
  metalness = 0.02,
  clearcoat = 0.45,
  clearcoatRoughness = 0.12,
  bgColor,
  ambientIntensity,
  lightRotation,
  environmentPreset = 'studio',
  transparentBg = false,
  animate = false,
  animationSpeed = 1,
  animationType = 'rotate',
  animationScope = 'group',
  cameraFov = 45,
  autoRotate = false,
  autoRotateSpeed = 2,
  cameraTrigger,
  itemOverrides = {},
  onItemDrag,
  circleTilt = 0,
  bendAngle = 0,
  waveAmplitude = 0,
  waveFrequency = 1,
  alignmentAxis = 'x',
  exportBridgeRef,
  isRecording = false,
  dragMode = 'rotate',
  isSpacePressed = false,
}: SceneProps) {
  return (
    <Canvas
      gl={{
        preserveDrawingBuffer: true,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      }}
      dpr={[1.75, 2.5]}
      camera={{ position: [0, 0, 8], fov: cameraFov }}
      shadows={{ enabled: true, type: THREE.PCFSoftShadowMap }}
    >
      <SceneExportBridge bridgeRef={exportBridgeRef} />
      <CameraController fov={cameraFov} trigger={cameraTrigger} />
      <SpaceMousePanHandler isSpacePressed={isSpacePressed} />
      {!transparentBg && <color attach="background" args={[bgColor]} />}
      
      {/* Lighting to make the shapes look soft and balanced without excessive specular glare */}
      <ambientLight intensity={ambientIntensity * 1.3} />
      
      <group rotation={[0, (lightRotation * Math.PI) / 180, 0]}>
        {/* Main studio key light with ultra-high fidelity shadow rendering (no jagged/wavy edges) */}
        <directionalLight
          position={[10, 10, 10]}
          intensity={1.1 + ambientIntensity * 0.5}
          castShadow
          shadow-mapSize-width={4096}
          shadow-mapSize-height={4096}
          shadow-camera-near={0.5}
          shadow-camera-far={32}
          shadow-camera-left={-8}
          shadow-camera-right={8}
          shadow-camera-top={8}
          shadow-camera-bottom={-8}
          shadow-bias={-0.0001}
          shadow-normalBias={0.04}
          shadow-radius={2.5}
        />
        {/* Broad soft fill light (eliminates harsh point specular lines on curved bevels) */}
        <directionalLight position={[-8, 6, 8]} intensity={0.5 + ambientIntensity * 0.3} />
        {/* Subtle rim / back light for dimensional separation */}
        <directionalLight position={[0, -6, -10]} intensity={0.3 + ambientIntensity * 0.2} />
      </group>

      {/* Environment for balanced studio reflections */}
      <Environment preset={environmentPreset as any} environmentRotation={[0, (lightRotation * Math.PI) / 180, 0]} environmentIntensity={0.45 + ambientIntensity * 0.6} />

      {/* Group of Elements */}
      <InnerScene 
        shapeType={shapeType}
        customModel={customModel}
        layoutMode={layoutMode}
        quantity={quantity}
        thickness={thickness}
        radius={radius}
        twistAngle={twistAngle}
        spacing={spacing}
        color={color}
        roughness={roughness}
        metalness={metalness}
        clearcoat={clearcoat}
        clearcoatRoughness={clearcoatRoughness}
        bgColor={bgColor}
        animate={animate}
        animationSpeed={animationSpeed}
        animationType={animationType}
        animationScope={animationScope}
        itemOverrides={itemOverrides}
        onItemDrag={onItemDrag}
        circleTilt={circleTilt}
        bendAngle={bendAngle}
        waveAmplitude={waveAmplitude}
        waveFrequency={waveFrequency}
        alignmentAxis={alignmentAxis}
        isSpacePressed={isSpacePressed}
      />

      {/* Ground shadow (hidden when exporting with transparent bg) */}
      {!transparentBg && (
        <ContactShadows
          position={[0, -3, 0]}
          opacity={0.6}
          scale={20}
          blur={2.5}
          far={5}
          color="#000000"
        />
      )}

      <OrbitControls
        makeDefault
        enabled={!isSpacePressed}
        minDistance={1}
        maxDistance={40}
        autoRotate={autoRotate}
        autoRotateSpeed={autoRotateSpeed}
        enablePan={true}
        screenSpacePanning={true}
        enableDamping={true}
        dampingFactor={0.08}
        mouseButtons={{
          LEFT: dragMode === 'pan' ? THREE.MOUSE.PAN : THREE.MOUSE.ROTATE,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: THREE.MOUSE.PAN,
        }}
        touches={{
          ONE: dragMode === 'pan' ? THREE.TOUCH.PAN : THREE.TOUCH.ROTATE,
          TWO: THREE.TOUCH.DOLLY_PAN,
        }}
      />
    </Canvas>
  );
}
