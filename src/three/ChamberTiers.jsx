import * as THREE from "three";

import { CARPET_RED, CARPET_SHADE } from "./materials.js";
import { FAN, HALF_FAN, RETURN_W, ROW_RISE, rows } from "./chamberPlan.js";

// The tiered floor of the chamber, generated from chamberPlan rather than placed.
//
// This is the part of the room we can least defend. Nobody has published how
// many rows the Senate chamber has, how deep they run, or how wide the room is;
// the 312 installed seats and roughly a thousand square metres of carpet are the
// only hard numbers, and both cover the galleries as well as the floor. So the
// tier is built as a function of its parameters and nothing here hard-codes a
// count. Change ROWS in chamberPlan and the room changes with it — which is the
// honest shape for a guess, and the thing a hand-placed set of six meshes could
// never be.

const SEGMENTS = 64;

// Ring geometry measures its angle from +X where cylinder geometry measures from
// +Z — the same quarter turn the desks deal with.
const RING_OFFSET = -HALF_FAN - Math.PI / 2;

function Tier({ inner, outer, y }) {
  return (
    <group>
      {/* the step up to this row */}
      <mesh position={[0, y - ROW_RISE / 2, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[inner, inner, ROW_RISE, SEGMENTS, 1, true, -HALF_FAN, FAN]} />
        <meshStandardMaterial {...CARPET_SHADE} side={THREE.DoubleSide} />
      </mesh>

      {/* the floor of it */}
      <mesh position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[inner, outer, SEGMENTS, 1, RING_OFFSET, FAN]} />
        <meshStandardMaterial {...CARPET_RED} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// The seating bank has to stop somewhere. Left open, each arc ends in a bare
// edge that reads as a fin floating off the side of the room; a real chamber
// returns the tier into a side wall. Stepped per row rather than one slab, so
// the return follows the rake instead of standing proud of the lower rows.
//
// A group rotated about Y puts the box's local +Z along the radius, which is the
// same convention the arcs are laid out in — no angle conversion needed.
function Return({ angle }) {
  return (
    <group rotation={[0, angle, 0]}>
      {rows().map(({ index, y, treadInner, treadOuter }) => (
        <mesh
          key={index}
          position={[0, y / 2, (treadInner + treadOuter) / 2]}
          receiveShadow
          castShadow
        >
          <boxGeometry args={[RETURN_W, y, treadOuter - treadInner]} />
          <meshStandardMaterial {...CARPET_SHADE} />
        </mesh>
      ))}
    </group>
  );
}

export default function ChamberTiers() {
  return (
    <group>
      {rows().map(({ index, y, treadInner, treadOuter }) => (
        <Tier key={index} inner={treadInner} outer={treadOuter} y={y} />
      ))}
      <Return angle={HALF_FAN} />
      <Return angle={-HALF_FAN} />
    </group>
  );
}
