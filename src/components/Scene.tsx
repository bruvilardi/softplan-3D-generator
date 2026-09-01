import { useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Center, DragControls } from '@react-three/drei';
import * as THREE from 'three';
import { Softpoint } from './Softpoint';
import { BrandLogo } from './BrandLogo';

export type ShapeType = 'softpoint' | 'logo';
export type LayoutMode = 'linear' | 'grid' | 'radial' | 'random';

interface SceneProps {
  shapeType: ShapeType;
  layoutMode: LayoutMode;
  quantity: number;
  thickness: number;
  radius: number;
  twistAngle: number;
  spacing: number;
  color: string;
  transmission?: number;
  roughness?: number;
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
  cameraTrigger?: { id: number, preset: string };
  itemOverrides?: Record<number, { x: number, y: number, z: number, rx: number, ry: number, rz: number }>;
  onItemDrag?: (index: number, x: number, y: number, z: number) => void;
  circleTilt?: number;
  bendAngle?: number;
  waveAmplitude?: number;
  waveFrequency?: number;
  alignmentAxis?: 'x' | 'y' | 'z';
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
    const targetPos = new THREE.Vector3();
    
    if (p === 'isometric') {
      targetPos.set(6, 6, 6);
    } else if (p === 'front') {
      targetPos.set(0, 0, 8);
    } else if (p === 'top') {
      targetPos.set(0, 10, 0);
    } else if (p === 'side') {
      targetPos.set(8, 0, 0);
    }
    
    camera.position.copy(targetPos);
    camera.lookAt(0, 0, 0);
    (controls as any).target.set(0, 0, 0);
    (controls as any).update();
  }, [trigger, camera, controls]);

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

  useFrame((state, delta) => {
    if (!itemRef.current) return;
    
    if (animate && animationScope === 'individual') {
      const speed = animationSpeed || 1;
      const time = state.clock.elapsedTime * speed;
      const offset = index * 0.5; 
      const localTime = time + offset;

      // Handle positions
      if (animationType === 'float' || animationType === 'all') {
        itemRef.current.position.set(
          basePosition[0],
          basePosition[1] + Math.sin(localTime) * 1.5,
          basePosition[2]
        );
      } else {
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

      // Handle rotations
      if (animationType === 'rotate' || animationType === 'all') {
        itemRef.current.rotation.y += delta * speed;
      } else if (animationType === 'tumble') {
        itemRef.current.rotation.x += delta * speed * 0.5;
        itemRef.current.rotation.y += delta * speed * 0.7;
        itemRef.current.rotation.z += delta * speed * 0.3;
      } else if (animationType === 'swing') {
        itemRef.current.rotation.set(
          baseRotation[0],
          baseRotation[1] + Math.sin(localTime * 0.5) * 0.6,
          baseRotation[2] + Math.sin(localTime) * 0.4
        );
      } else {
         itemRef.current.rotation.set(...baseRotation);
      }
    } else {
       itemRef.current.position.set(...basePosition);
       itemRef.current.rotation.set(...baseRotation);
       itemRef.current.scale.set(1, 1, 1);
    }
  });

  return (
    <group ref={itemRef} position={basePosition} rotation={baseRotation}>
      {children}
    </group>
  );
}

function DraggableItemWrapper({ index, pos, basePos, onItemDrag, children }: any) {
  const groupRef = useRef<THREE.Group>(null);
  
  return (
    <DragControls
      onDragEnd={() => {
        if (groupRef.current && onItemDrag) {
          const newX = groupRef.current.position.x;
          const newY = groupRef.current.position.y;
          const newZ = groupRef.current.position.z;
          
          const overrideX = newX - basePos[0];
          const overrideY = newY - basePos[1];
          const overrideZ = newZ - basePos[2];
          
          onItemDrag(index, overrideX, overrideY, overrideZ);
        }
      }}
    >
      <group ref={groupRef} position={pos}>
        {children}
      </group>
    </DragControls>
  );
}

function InnerScene({
  shapeType,
  layoutMode,
  quantity,
  thickness,
  radius,
  twistAngle,
  spacing,
  color,
  transmission,
  roughness,
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
}: Partial<SceneProps>) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (!groupRef.current) return;

    if (animate && animationScope === 'group') {
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
            >
              <AnimatedItem
                index={i}
                basePosition={[0, 0, 0]}
                baseRotation={rot}
                animate={animate || false}
                animationSpeed={animationSpeed}
                animationType={animationType}
                animationScope={animationScope}
              >
                {shapeType === 'logo' ? (
                  <BrandLogo
                    position={[0, 0, 0]}
                    rotation={[0, 0, 0]}
                    thickness={thickness || 0.5}
                    color={color === 'mixed' ? (i % 2 === 0 ? '#5c5cff' : '#ffffff') : (color || '#5c5cff')}
                    transmission={transmission}
                    roughness={roughness}
                    bevelSize={0.05}
                    bgColor={bgColor}
                  />
                ) : (
                  <Softpoint
                    position={[0, 0, 0]}
                    rotation={[0, 0, 0]}
                    thickness={thickness || 0.5}
                    radius={radius || 0.4}
                    color={color === 'mixed' ? (i % 2 === 0 ? '#5c5cff' : '#ffffff') : (color || '#5c5cff')}
                    transmission={transmission}
                    roughness={roughness}
                    bevelSize={0.05}
                    bgColor={bgColor}
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
  layoutMode,
  quantity,
  thickness,
  radius,
  twistAngle,
  spacing,
  color,
  transmission = 1,
  roughness = 0.05,
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
  cameraTrigger,
  itemOverrides = {},
  onItemDrag,
  circleTilt = 0,
  bendAngle = 0,
  waveAmplitude = 0,
  waveFrequency = 1,
  alignmentAxis = 'x',
}: SceneProps) {
  return (
    <Canvas gl={{ preserveDrawingBuffer: true, alpha: true }} camera={{ position: [0, 0, 8], fov: cameraFov }} shadows>
      <CameraController fov={cameraFov} trigger={cameraTrigger} />
      {!transparentBg && <color attach="background" args={[bgColor]} />}
      
      {/* Lighting to make the glass look good */}
      <ambientLight intensity={ambientIntensity * 1.5} />
      
      <group rotation={[0, (lightRotation * Math.PI) / 180, 0]}>
        <directionalLight position={[10, 10, 10]} intensity={1.5 + ambientIntensity} castShadow />
        <directionalLight position={[-10, -10, -10]} intensity={0.5 + ambientIntensity * 0.5} />
        <pointLight position={[0, 5, 5]} intensity={0.8 + ambientIntensity} />
      </group>

      {/* Environment for reflections */}
      <Environment preset={environmentPreset as any} environmentRotation={[0, (lightRotation * Math.PI) / 180, 0]} environmentIntensity={0.5 + ambientIntensity} />

      {/* Group of Elements */}
      <InnerScene 
        shapeType={shapeType}
        layoutMode={layoutMode}
        quantity={quantity}
        thickness={thickness}
        radius={radius}
        twistAngle={twistAngle}
        spacing={spacing}
        color={color}
        transmission={transmission}
        roughness={roughness}
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

      <OrbitControls makeDefault minDistance={3} maxDistance={40} />
    </Canvas>
  );
}
