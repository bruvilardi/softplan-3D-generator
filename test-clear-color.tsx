import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

export function ClearColor({ color, transparent }: { color: string, transparent: boolean }) {
  const { gl, scene } = useThree();
  useEffect(() => {
    // Remove scene background so clear color takes effect
    scene.background = null;
    gl.setClearColor(new THREE.Color(color), transparent ? 0 : 1);
  }, [color, transparent, gl, scene]);
  return null;
}
