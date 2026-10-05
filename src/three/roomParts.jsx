import { useLayoutEffect, useRef } from "react";
import * as THREE from "three";

import { useChamber } from "./chamberContext.js";

// What the rooms outside the National Assembly share. The two chambers have
// their own versions of some of this, struck from a single centre; a hall with
// furniture facing every which way wants a seat that is simply told where it is
// and which way it looks.

// One part of a chair, drawn once for every seat that has it. A seat says where
// it is and which way it faces; the part says where it sits in the chair's own
// frame — up, and forward toward whatever the sitter is looking at.
export function SeatPart({ seats, dy, dz = 0, dx = 0, children }) {
  const ref = useRef();

  useLayoutEffect(() => {
    const matrix = new THREE.Matrix4();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3(1, 1, 1);
    const up = new THREE.Vector3(0, 1, 0);

    seats.forEach(({ x, y, z, yaw }, i) => {
      const sin = Math.sin(yaw);
      const cos = Math.cos(yaw);
      quaternion.setFromAxisAngle(up, yaw);
      matrix.compose(
        new THREE.Vector3(x + sin * dz + cos * dx, y + dy, z + cos * dz - sin * dx),
        quaternion,
        scale
      );
      ref.current.setMatrixAt(i, matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  }, [seats, dx, dy, dz]);

  return (
    <instancedMesh ref={ref} args={[null, null, seats.length]} castShadow receiveShadow>
      {children}
    </instancedMesh>
  );
}

// Hanging, not flying, and drawn as it photographs: three bands down the drop.
export function Flag({ x, z, bands }) {
  const { palette } = useChamber();
  const top = 2.75;

  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, top / 2, 0]}>
        <cylinderGeometry args={[0.02, 0.026, top, 10]} />
        <meshStandardMaterial {...palette.brass} />
      </mesh>
      <mesh position={[0, top + 0.06, 0]}>
        <sphereGeometry args={[0.045, 12, 10]} />
        <meshStandardMaterial {...palette.brass} />
      </mesh>
      {bands.map((mat, i) => (
        <mesh key={i} position={[(i - 1) * 0.085, top - 0.85 - i * 0.05, 0.05]}>
          <boxGeometry args={[0.1, 1.4 + i * 0.1, 0.05]} />
          <meshStandardMaterial {...mat} />
        </mesh>
      ))}
    </group>
  );
}
