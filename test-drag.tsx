import React, { useRef } from 'react';
import { DragControls } from '@react-three/drei';
import * as THREE from 'three';

export function DraggableItem({ onDragUpdate }: { onDragUpdate: (pos: THREE.Vector3) => void }) {
  return (
    <DragControls
      onDrag={(localMatrix) => {
        const pos = new THREE.Vector3();
        pos.setFromMatrixPosition(localMatrix);
        onDragUpdate(pos);
      }}
    >
      <mesh />
    </DragControls>
  );
}
