import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { BAIZE_RED, BRASS, CHARCOAL, OAK, OAK_SHADE } from "./materials.js";
import CurvedDesk from "./CurvedDesk.jsx";
import {
  BENCH_DEPTH,
  BENCH_H,
  BENCH_LIP,
  SEAT_H,
  SEAT_PITCH,
  benchHalfAngle,
  rows,
  seatPositions,
} from "./chamberPlan.js";

// The members' side of the room: one continuous desk arc per row, and a chair
// for every seat the plan says fits behind it.
//
// Neither is placed by hand, for the same reason the tiers are not — the row
// count is a guess, and a guess that can be changed in one place and re-read is
// worth more than one baked into a hundred meshes. Change ROWS and the desks,
// the chairs and the seat count all move together.

const DESK_SEGMENTS = 56;
const SEAT_W = SEAT_PITCH * 0.76; // leaves a real gap between neighbours

// How far a chair may lean back before it fouls the desk of the row behind. The
// row pitch leaves about 0.57 m between the back of one desk and the riser of
// the next, the chair is centred in it, and the desk behind starts 0.265 m aft
// of that centre — so every offset below is checked against that figure, and the
// rake is 5 degrees rather than a comfortable 10 because that is all the room
// the derived pitch has to give. See the note on ROW_PITCH in chamberPlan.
const RAKE = -0.09;

const X_AXIS = new THREE.Vector3(1, 0, 0);

// A chair is around 170 copies of five small solids. Drawn individually that is
// most of the draw calls in the chamber spent on its least interesting
// furniture, so each part is one instanced mesh spanning every row at once — the
// same trade the fluting behind the dais makes.
//
// Local +Z points at the dais, matching the presiding chair, so the half turn is
// what aims a chair inward rather than out at the wall. Every arc in the room is
// concentric, which means an offset along that axis is simply a smaller radius:
// a part needs an angle and a radial offset and nothing else. Tilted parts are
// swung about the chair's own origin rather than their own centres, so a back
// and the cap on top of it stay joined.
function SeatPart({ seats, dy, dz, tilt = 0, children }) {
  const ref = useRef();

  useLayoutEffect(() => {
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const euler = new THREE.Euler();
    const scale = new THREE.Vector3(1, 1, 1);
    const offset = new THREE.Vector3(0, dy, dz).applyAxisAngle(X_AXIS, tilt);

    seats.forEach(({ angle, radius, y }, i) => {
      const r = radius - offset.z;
      position.set(Math.sin(angle) * r, y + offset.y, Math.cos(angle) * r);
      // YXZ so the heading is applied before the rake, which makes the rake a
      // pitch about the chair's own left-right axis instead of a shear.
      quaternion.setFromEuler(euler.set(tilt, angle + Math.PI, 0, "YXZ"));
      matrix.compose(position, quaternion, scale);
      ref.current.setMatrixAt(i, matrix);
    });

    ref.current.instanceMatrix.needsUpdate = true;
    ref.current.computeBoundingSphere();
  }, [seats, dy, dz, tilt]);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, seats.length]} castShadow receiveShadow>
      {children}
    </instancedMesh>
  );
}

// The face that matters on a member's desk is the inner one, because that is the
// one the room sees. The outer face is a modesty panel with a pair of knees
// behind it and no light on it ever.
function BenchRow({ radius, y }) {
  return (
    <CurvedDesk
      radius={radius}
      halfAngle={benchHalfAngle(radius)}
      height={BENCH_H}
      depth={BENCH_DEPTH}
      lip={BENCH_LIP}
      y={y}
      face={OAK_SHADE}
      back={OAK}
      top={OAK}
      segments={DESK_SEGMENTS}
    />
  );
}

export default function ChamberBenches() {
  const seats = useMemo(() => seatPositions(), []);

  return (
    <group>
      {rows().map(({ index, radius, y }) => (
        <BenchRow key={index} radius={radius} y={y} />
      ))}

      {/* pedestal, run a little into the underside of the pad so the two never
          part company on a row the rake has shifted */}
      <SeatPart seats={seats} dy={SEAT_H - 0.27} dz={0}>
        <cylinderGeometry args={[0.05, 0.08, 0.36, 10]} />
        <meshStandardMaterial {...CHARCOAL} />
      </SeatPart>

      <SeatPart seats={seats} dy={SEAT_H - 0.05} dz={0}>
        <boxGeometry args={[SEAT_W, 0.1, 0.44]} />
        <meshStandardMaterial {...BAIZE_RED} />
      </SeatPart>

      <SeatPart seats={seats} dy={SEAT_H + 0.28} dz={-0.11} tilt={RAKE}>
        <boxGeometry args={[SEAT_W, 0.56, 0.09]} />
        <meshStandardMaterial {...BAIZE_RED} />
      </SeatPart>

      {/* oak cap along the top of the back — the one part of a chair that stays
          legible from the far side of the room, and what keeps a full bank of
          them reading as rows of seats rather than a wall of red */}
      <SeatPart seats={seats} dy={SEAT_H + 0.59} dz={-0.11} tilt={RAKE}>
        <boxGeometry args={[SEAT_W + 0.03, 0.06, 0.11]} />
        <meshStandardMaterial {...OAK} />
      </SeatPart>

      {/* a microphone stem per place. At this distance it is two centimetres of
          brass, but a chamber desk without one reads as a school hall. */}
      <SeatPart seats={seats} dy={BENCH_H + 0.11} dz={0.5}>
        <cylinderGeometry args={[0.008, 0.012, 0.22, 6]} />
        <meshStandardMaterial {...BRASS} />
      </SeatPart>
    </group>
  );
}
