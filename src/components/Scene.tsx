import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Center } from '@react-three/drei';
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
  bgColor: string;
  ambientIntensity: number;
  lightRotation: number;
  transparentBg?: boolean;
  animate?: boolean;
  animationSpeed?: number;
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
  animate,
  animationSpeed = 1,
}: Partial<SceneProps>) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (animate && groupRef.current) {
      groupRef.current.rotation.y += delta * (animationSpeed || 1);
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
      <group ref={groupRef}>
        {items.map((_, i) => {
          let posX = 0, posY = 0, posZ = 0;
          let rotX = 0, rotY = 0, rotZ = 0;
          
          const gap = (spacing || 0) * 3.5;

          if (layoutMode === 'linear') {
            posZ = (i - ((quantity || 1) - 1) / 2) * gap;
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

          if (shapeType === 'logo') {
            return (
              <BrandLogo
                key={i}
                position={[posX, posY, posZ]}
                rotation={[rotX, rotY, rotZ]}
                thickness={thickness || 0.5}
                color={color === 'mixed' ? (i % 2 === 0 ? '#5c5cff' : '#ffffff') : (color || '#5c5cff')}
                bevelSize={0.05}
              />
            );
          }

          return (
            <Softpoint
              key={i}
              position={[posX, posY, posZ]}
              rotation={[rotX, rotY, rotZ]}
              thickness={thickness || 0.5}
              radius={radius || 0.4}
              color={color === 'mixed' ? (i % 2 === 0 ? '#5c5cff' : '#ffffff') : (color || '#5c5cff')}
              bevelSize={0.05}
            />
          );
        })}
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
  bgColor,
  ambientIntensity,
  lightRotation,
  transparentBg = false,
  animate = false,
  animationSpeed = 1,
}: SceneProps) {
  return (
    <Canvas gl={{ preserveDrawingBuffer: true, alpha: true }} camera={{ position: [0, 0, 8], fov: 45 }} shadows>
      {!transparentBg && <color attach="background" args={[bgColor]} />}
      
      {/* Lighting to make the glass look good */}
      <ambientLight intensity={ambientIntensity * 1.5} />
      
      <group rotation={[0, (lightRotation * Math.PI) / 180, 0]}>
        <directionalLight position={[10, 10, 10]} intensity={1.5 + ambientIntensity} castShadow />
        <directionalLight position={[-10, -10, -10]} intensity={0.5 + ambientIntensity * 0.5} />
        <pointLight position={[0, 5, 5]} intensity={0.8 + ambientIntensity} />
      </group>

      {/* Environment for reflections */}
      <Environment preset="city" environmentRotation={[0, (lightRotation * Math.PI) / 180, 0]} environmentIntensity={0.5 + ambientIntensity} />

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
        animate={animate}
        animationSpeed={animationSpeed}
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
