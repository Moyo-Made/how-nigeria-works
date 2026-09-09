import * as THREE from "three";

// Every desk in the room is the same construction — an arc concentric with the
// chair, faced front and back with a real top between them, so nothing reads as
// a sheet of material standing on edge. The dais, the clerks' table and the
// member benches in the tiers are all this component at different radii.
//
// Ring geometry measures its angle from +X where cylinder geometry measures from
// +Z, so the quarter turn between the two is deliberate, not a fudge.
export default function CurvedDesk({
  radius,
  halfAngle,
  height,
  depth,
  lip = 0.1,
  y = 0,
  face,
  back,
  top,
  segments = 48,
}) {
  const sweep = halfAngle * 2;

  return (
    <group position={[0, y, 0]}>
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius, height, segments, 1, true, -halfAngle, sweep]} />
        <meshStandardMaterial {...face} side={THREE.DoubleSide} />
      </mesh>

      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry
          args={[radius - depth, radius - depth, height, segments, 1, true, -halfAngle, sweep]}
        />
        <meshStandardMaterial {...(back ?? face)} side={THREE.DoubleSide} />
      </mesh>

      <mesh position={[0, height + 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry
          args={[radius - depth, radius + lip, segments, 1, -halfAngle - Math.PI / 2, sweep]}
        />
        <meshStandardMaterial {...(top ?? face)} side={THREE.DoubleSide} />
      </mesh>

      <mesh position={[0, height - 0.045, 0]} castShadow>
        <cylinderGeometry
          args={[radius + lip, radius + lip, 0.09, segments, 1, true, -halfAngle, sweep]}
        />
        <meshStandardMaterial {...(top ?? face)} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
