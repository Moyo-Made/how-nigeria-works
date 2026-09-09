import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { seatPositions, speakingPlace } from "./chamberPlan.js";

// What the sitting sequence points at.
//
// Everything here reads the same seat generator the chairs do, so a place the
// sequence lights is by construction a place a member is actually sitting. That
// is the whole reason chamberPlan hands out seat positions as data instead of
// baking them into meshes — a highlight that has to guess where row three is
// would be wrong the first time ROWS changed.

const GLOW = {
  color: "#f6c95c",
  emissive: "#f2b437",
  emissiveIntensity: 1.4,
  roughness: 0.5,
  metalness: 0,
  toneMapped: false,
};

const world = (seat) => [
  Math.sin(seat.angle) * seat.radius,
  seat.y,
  Math.cos(seat.angle) * seat.radius,
];

// A ring of light on the carpet at a member's feet. Instanced, because the
// division stage lights every place on the floor at once and a division is 171
// of these — which as separate meshes would cost more draw calls than the rest
// of the chamber put together.
function Places({ seats }) {
  const ref = useRef();

  useLayoutEffect(() => {
    const matrix = new THREE.Matrix4();
    seats.forEach((seat, i) => {
      // Rotation first, then the translation column is overwritten — a flat ring
      // needs no heading, only to lie down.
      matrix.makeRotationX(-Math.PI / 2);
      const [x, y, z] = world(seat);
      matrix.setPosition(x, y + 0.025, z);
      ref.current.setMatrixAt(i, matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
    ref.current.computeBoundingSphere();
  }, [seats]);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, seats.length]}>
      <ringGeometry args={[0.23, 0.31, 20]} />
      <meshStandardMaterial {...GLOW} side={THREE.DoubleSide} />
    </instancedMesh>
  );
}

export default function ChamberFocus({ highlight }) {
  const place = useMemo(() => speakingPlace(), []);
  const floor = useMemo(() => seatPositions(), []);

  if (highlight === "member") {
    const [x, y, z] = world(place);
    return (
      <group>
        <Places seats={[place]} />
        {/* Low and close, so it lifts one member out of the bank without
            washing the row either side of them. */}
        <pointLight position={[x, y + 1.5, z]} intensity={16} distance={4.5} color="#ffd88c" />
      </group>
    );
  }

  if (highlight === "division") return <Places seats={floor} />;

  if (highlight === "dais") {
    return <pointLight position={[0, 3.4, 4.4]} intensity={46} distance={11} color="#fff0d6" />;
  }

  if (highlight === "doors") {
    return (
      <group>
        {[-1, 1].map((dir) => (
          <pointLight
            key={dir}
            position={[dir * 6.35, 2.4, 0.9]}
            intensity={26}
            distance={7}
            color="#e8f0ff"
          />
        ))}
      </group>
    );
  }

  return null;
}
