import React from 'react';
import { MeshTransmissionMaterial } from '@react-three/drei';
export function Test() {
  return (
    <mesh>
      <MeshTransmissionMaterial 
        transmission={1} 
        transparent={true} 
        thickness={0.5} 
        roughness={0} 
        ior={1.5} 
      />
    </mesh>
  );
}
