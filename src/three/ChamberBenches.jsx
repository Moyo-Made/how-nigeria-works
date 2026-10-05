import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import CurvedDesk from "./CurvedDesk.jsx";
import { useChamber } from "./chamberContext.js";

// The members' side of the room: one continuous desk arc per row, and a chair
// for every seat the plan says fits behind it.
//
// Neither is placed by hand, for the same reason the tiers are not — the row
// count is a guess, and a guess that can be changed in one place and re-read is
// worth more than one baked into a hundred meshes. Change ROWS and the desks,
// the chairs and the seat count all move together.

const DESK_SEGMENTS = 56;

// The chair is the manufacturer's Megaseat, and its drawing gives the sizes:
// 58 to 60 cm wide and 109 high. What it looks like is in every photograph of
// either room — a cloth seat, back and separate headrest in the chamber's
// colour, held in a black shell that shows as the whole of the chair from behind
// and as the arms from in front (Figueras gallery images r02, r07 and r11; the
// House's are the same chair, g01 and g04).
// https://figueras.com/wp-content/uploads/2023/07/Megaseat_9113_dimensions.jpg
const SEAT_W = 0.6;

// A slight rake to the back. The chair turns and slides on its foot, so there is
// room for more; this is what it shows at rest.
const RAKE = -0.12;

const X_AXIS = new THREE.Vector3(1, 0, 0);

// Exported: the gallery seats the same way, and the instancing maths is the
// same maths.
//
// A chair is around 170 copies of five small solids. Drawn individually that is
// most of the draw calls in the chamber spent on its least interesting
// furniture, so each part is one instanced mesh spanning every row at once — the
// same trade the fluting behind the dais makes.
//
// Local +Z points at the dais, matching the presiding chair, so the half turn is
// what aims a chair inward rather than out at the wall. A part is placed by an
// offset in the chair's own frame — across it, up, and toward the dais — which
// is turned to the chair's heading. Tilted parts are swung about the chair's own
// origin rather than their own centres, so a back and its headrest stay joined.
export function SeatPart({ seats, dx = 0, dy, dz, tilt = 0, children }) {
  const ref = useRef();

  useLayoutEffect(() => {
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const euler = new THREE.Euler();
    const scale = new THREE.Vector3(1, 1, 1);
    const offset = new THREE.Vector3(dx, dy, dz).applyAxisAngle(X_AXIS, tilt);

    seats.forEach(({ angle, radius, y, face = angle }, i) => {
      // A seat on the floor faces the chair, so its bearing is also the way it
      // faces. One on the balcony stands in a straight row and faces square off
      // it, so the two are given apart and the offset is turned to the facing.
      const yaw = face + Math.PI;
      position.set(
        Math.sin(angle) * radius + offset.x * Math.cos(yaw) + offset.z * Math.sin(yaw),
        y + offset.y,
        Math.cos(angle) * radius - offset.x * Math.sin(yaw) + offset.z * Math.cos(yaw)
      );
      // YXZ so the heading is applied before the rake, which makes the rake a
      // pitch about the chair's own left-right axis instead of a shear.
      quaternion.setFromEuler(euler.set(tilt, face + Math.PI, 0, "YXZ"));
      matrix.compose(position, quaternion, scale);
      ref.current.setMatrixAt(i, matrix);
    });

    ref.current.instanceMatrix.needsUpdate = true;
    ref.current.computeBoundingSphere();
  }, [seats, dx, dy, dz, tilt]);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, seats.length]} castShadow receiveShadow>
      {children}
    </instancedMesh>
  );
}

// The face that matters on a member's desk is the inner one, because that is the
// one the room sees. The outer face is a modesty panel with a pair of knees
// behind it and no light on it ever.
//
// A row is one desk per seating block rather than one arc across the fan: the
// gangways are gaps in the benching, and they have to be gaps in this geometry
// or the aisles the seat count was cut for would not exist in the room. Blocks
// come from the plan, so a desk can never end somewhere a chair does not.
//
// Every arc in this room is concentric, so a block is drawn centred and then
// turned to its own bearing — the desks stay the same component at every radius.
function BenchRow({ radius, y }) {
  const { plan, palette } = useChamber();
  const { BENCH_H, BENCH_DEPTH, BENCH_LIP, rowBlocks } = plan;

  return rowBlocks(radius).map((block, index) => (
    <group key={index} rotation={[0, (block.start + block.end) / 2, 0]}>
      <CurvedDesk
        radius={radius}
        halfAngle={(block.end - block.start) / 2}
        height={BENCH_H}
        depth={BENCH_DEPTH}
        lip={BENCH_LIP}
        y={y}
        face={palette.oakShade}
        back={palette.oak}
        top={palette.oak}
        segments={DESK_SEGMENTS}
      />
    </group>
  ));
}

// The parts of a chair, as instanced meshes over whatever seats are given. The
// balcony's chairs are the same chair without the desk, so it draws these too.
export function Chairs({ seats }) {
  const { plan, palette } = useChamber();
  const { SEAT_H } = plan;

  return (
    <group>
      {/* the single foot the chair turns on */}
      <SeatPart seats={seats} dy={SEAT_H - 0.27} dz={0}>
        <cylinderGeometry args={[0.05, 0.09, 0.36, 10]} />
        <meshStandardMaterial {...palette.charcoal} />
      </SeatPart>

      <SeatPart seats={seats} dy={SEAT_H - 0.04} dz={0.02}>
        <boxGeometry args={[SEAT_W - 0.12, 0.12, 0.48]} />
        <meshStandardMaterial {...palette.baize} />
      </SeatPart>

      {/* the back: cloth to the front, the black shell behind it and a little
          proud of it all round */}
      <SeatPart seats={seats} dy={SEAT_H + 0.3} dz={-0.2} tilt={RAKE}>
        <boxGeometry args={[SEAT_W - 0.1, 0.56, 0.08]} />
        <meshStandardMaterial {...palette.baize} />
      </SeatPart>
      <SeatPart seats={seats} dy={SEAT_H + 0.28} dz={-0.255} tilt={RAKE}>
        <boxGeometry args={[SEAT_W - 0.04, 0.64, 0.05]} />
        <meshStandardMaterial {...palette.charcoal} />
      </SeatPart>

      {/* the headrest, a separate pad standing above the back */}
      <SeatPart seats={seats} dy={SEAT_H + HEADREST_Y} dz={HEADREST_Z} tilt={RAKE}>
        <boxGeometry args={[HEADREST_W, HEADREST_H, 0.1]} />
        <meshStandardMaterial {...palette.baize} />
      </SeatPart>
      <SeatPart seats={seats} dy={SEAT_H + HEADREST_Y} dz={HEADREST_Z - 0.06} tilt={RAKE}>
        <boxGeometry args={[HEADREST_W + 0.03, HEADREST_H + 0.02, 0.04]} />
        <meshStandardMaterial {...palette.charcoal} />
      </SeatPart>

      {/* the arms, part of the shell */}
      {[-1, 1].map((dir) => (
        <SeatPart key={dir} seats={seats} dx={dir * (SEAT_W / 2 - 0.03)} dy={SEAT_H + 0.17} dz={0.0}>
          <boxGeometry args={[0.06, 0.07, 0.46]} />
          <meshStandardMaterial {...palette.charcoal} />
        </SeatPart>
      ))}
    </group>
  );
}

// Where the headrest stands on a chair, shared with whatever lights one up.
export const HEADREST_Y = 0.52;
export const HEADREST_Z = -0.21;
export const HEADREST_W = 0.4;
export const HEADREST_H = 0.24;

export default function ChamberBenches() {
  const { plan, palette } = useChamber();
  const { BENCH_DEPTH, BENCH_H, CHAIR_REACH, rows, seatPositions } = plan;
  const seats = useMemo(() => seatPositions(), [seatPositions]);
  // From the chair to the middle of its desk.
  const desk = CHAIR_REACH + BENCH_DEPTH / 2;

  return (
    <group>
      {rows().map(({ index, radius, y }) => (
        <BenchRow key={index} radius={radius} y={y} />
      ))}

      <Chairs seats={seats} />

      {/* What each place has on the desk in front of it, in both rooms: a grey
          inset pad, a microphone on a black gooseneck, and a brass nameplate
          standing on the far edge, read from the floor of the room (gallery
          images r07 and r08, and g04 in the House). */}
      <SeatPart seats={seats} dy={BENCH_H + 0.012} dz={desk - 0.04}>
        <boxGeometry args={[0.52, 0.012, 0.3]} />
        <meshStandardMaterial {...palette.screen} color="#6d7275" />
      </SeatPart>
      <SeatPart seats={seats} dx={0.3} dy={BENCH_H + 0.03} dz={desk + 0.12}>
        <boxGeometry args={[0.1, 0.04, 0.14]} />
        <meshStandardMaterial {...palette.charcoal} />
      </SeatPart>
      <SeatPart seats={seats} dx={0.3} dy={BENCH_H + 0.2} dz={desk + 0.06} tilt={0.5}>
        <cylinderGeometry args={[0.007, 0.007, 0.42, 6]} />
        <meshStandardMaterial {...palette.charcoal} />
      </SeatPart>
      <SeatPart seats={seats} dy={BENCH_H + 0.045} dz={CHAIR_REACH + BENCH_DEPTH - 0.04}>
        <boxGeometry args={[0.3, 0.07, 0.02]} />
        <meshStandardMaterial {...palette.brass} />
      </SeatPart>
    </group>
  );
}
