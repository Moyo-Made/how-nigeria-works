import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { Emblem } from "./ChamberElevation.jsx";
import { useChamber } from "./chamberContext.js";

// The Main Courtroom of the Supreme Court. What it is drawn from, which room it
// is and is not, and why every length in it is derived rather than measured are
// all set out at the top of plans/courtroom.js; this file only draws what that
// plan says.
//
// Not the chambers' component, and not a variant of it. Those rooms are a fan
// of seats struck from one centre behind the presiding chair. This one is two
// arcs facing each other — the bench curving one way, the bar the other — in a
// plain rectangular hall with a balcony round three sides, and nothing in it is
// concentric with anything in a chamber.
//
// The room is laid out the way the chambers are: the wall behind the bench is
// at -Z and the public end at +Z.

const SEGMENTS = 40;

// A length of arc with thickness: two curved faces, a top between them and a
// cap on each end. Every desk, step and platform in the room is one of these.
//
// `flip` turns the arc to face the other way, for the bench: cylinder geometry
// measures its angle from +Z, which suits an arc bulging toward the back of the
// room and is half a turn out for one bulging toward the front wall.
function ArcSlab({ centre, flip = false, inner, outer, y0 = 0, y1, from, to, mat, wall }) {
  const height = y1 - y0;
  const mid = (y0 + y1) / 2;
  const sweep = to - from;
  const side = wall ?? mat;

  return (
    <group position={[0, 0, centre]} rotation={[0, flip ? Math.PI : 0, 0]}>
      {[inner, outer].map((radius) => (
        <mesh key={radius} position={[0, mid, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[radius, radius, height, SEGMENTS, 1, true, from, sweep]} />
          <meshStandardMaterial {...side} side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* Ring geometry measures from +X where the cylinder measures from +Z;
          the quarter turn between them is that, not a fudge. */}
      <mesh position={[0, y1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[inner, outer, SEGMENTS, 1, from - Math.PI / 2, sweep]} />
        <meshStandardMaterial {...mat} side={THREE.DoubleSide} />
      </mesh>

      {[from, to].map((angle) => (
        <mesh
          key={angle}
          position={[
            (Math.sin(angle) * (inner + outer)) / 2,
            mid,
            (Math.cos(angle) * (inner + outer)) / 2,
          ]}
          rotation={[0, angle - Math.PI / 2, 0]}
        >
          <planeGeometry args={[outer - inner, height]} />
          <meshStandardMaterial {...side} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

// One part of a chair, drawn once for every seat that has it. A seat says where
// it is and which way it faces; the part says where it sits in the chair's own
// frame — up, and forward toward whatever the sitter is looking at.
function SeatPart({ seats, dy, dz = 0, dx = 0, children }) {
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

// ---- The shell --------------------------------------------------------------

const LIT = { color: "#f6f8fb", emissive: "#ffffff", emissiveIntensity: 0.9, roughness: 0.9 };

const spaced = (from, to, pitch) => {
  const count = Math.max(1, Math.round((to - from) / pitch));
  return Array.from({ length: count }, (_, i) => from + ((i + 0.5) * (to - from)) / count);
};

// A plain hall lined in golden timber, the lining cut into upright panels by
// dark recesses, under a white ceiling of lit panels. The recesses and the lit
// ceiling are in every frame of the room; how many of each there are is not
// countable from any of them, so their spacing is derived.
function Shell() {
  const { plan, palette } = useChamber();
  const { HALF_W, FRONT_Z, REAR_Z, WALL_H, GALLERY_Y, BAY_CENTRE_W, BAY_SIDE_W, PIER_W } = plan;
  const depth = REAR_Z - FRONT_Z;
  const midZ = (REAR_Z + FRONT_Z) / 2;
  // The recesses start above the gallery rail: below it the wall is in the
  // balcony's shadow and no frame shows what is on it.
  const slotY0 = GALLERY_Y + 1.3;
  const slotH = WALL_H - 0.5 - slotY0;
  const slotY = slotY0 + slotH / 2;
  const composition = BAY_CENTRE_W / 2 + PIER_W + BAY_SIDE_W + 0.5;

  return (
    <group>
      <mesh position={[0, 0, midZ]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[HALF_W * 2, depth]} />
        <meshStandardMaterial {...palette.carpet} />
      </mesh>
      <mesh position={[0, WALL_H, midZ]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[HALF_W * 2, depth]} />
        <meshStandardMaterial {...palette.plaster} />
      </mesh>

      {/* Two runs of lit panels down the length of the room, one over each
          half of the bar (TheNigeriaLawyer frame; the 2025 wide shot). */}
      {[-1, 1].map((dir) =>
        spaced(FRONT_Z + 1, REAR_Z - 1, 3).map((z) => (
          <mesh key={`${dir}:${z}`} position={[dir * 6, WALL_H - 0.03, z]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2.4, 2]} />
            <meshStandardMaterial {...LIT} />
          </mesh>
        ))
      )}

      {/* behind the bench, and the public end */}
      <mesh position={[0, WALL_H / 2, FRONT_Z]} receiveShadow>
        <planeGeometry args={[HALF_W * 2, WALL_H]} />
        <meshStandardMaterial {...palette.timber} />
      </mesh>
      <mesh position={[0, WALL_H / 2, REAR_Z]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[HALF_W * 2, WALL_H]} />
        <meshStandardMaterial {...palette.timber} />
      </mesh>
      {[-1, 1].map((dir) => (
        <mesh key={dir} position={[dir * HALF_W, WALL_H / 2, midZ]} rotation={[0, -dir * (Math.PI / 2), 0]} receiveShadow>
          <planeGeometry args={[depth, WALL_H]} />
          <meshStandardMaterial {...palette.timber} />
        </mesh>
      ))}

      {/* the recesses: on the front wall either side of the drapes, along both
          side walls and across the back */}
      {[-1, 1].map((dir) =>
        spaced(composition, HALF_W, 1.9).map((x) => (
          <mesh key={`f${dir}:${x}`} position={[dir * x, WALL_H / 2 + 0.6, FRONT_Z + 0.02]}>
            <boxGeometry args={[0.4, WALL_H - 2.2, 0.04]} />
            <meshStandardMaterial {...palette.slot} />
          </mesh>
        ))
      )}
      {[-1, 1].map((dir) =>
        spaced(FRONT_Z, REAR_Z, 2.6).map((z) => (
          <mesh key={`s${dir}:${z}`} position={[dir * (HALF_W - 0.02), slotY, z]}>
            <boxGeometry args={[0.04, slotH, 0.7]} />
            <meshStandardMaterial {...palette.slot} />
          </mesh>
        ))
      )}
      {spaced(-HALF_W, HALF_W, 2.6).map((x) => (
        <mesh key={`r${x}`} position={[x, slotY, REAR_Z - 0.02]}>
          <boxGeometry args={[0.7, slotH, 0.04]} />
          <meshStandardMaterial {...palette.slot} />
        </mesh>
      ))}
    </group>
  );
}

// ---- The wall behind the bench ----------------------------------------------

function Drape({ width, bottom, top, x = 0, z }) {
  const { palette } = useChamber();
  const height = top - bottom;

  return (
    <group position={[x, bottom + height / 2, z]}>
      <mesh receiveShadow>
        <boxGeometry args={[width, height, 0.06]} />
        <meshStandardMaterial {...palette.drape} />
      </mesh>
      {/* The cloth hangs in folds, and a flat navy plane reads as a painted
          wall. A rib every hand's width is enough to say curtain. */}
      {spaced(-width / 2, width / 2, 0.28).map((fx) => (
        <mesh key={fx} position={[fx, 0, 0.04]}>
          <boxGeometry args={[0.07, height, 0.03]} />
          <meshStandardMaterial {...palette.drapeFold} />
        </mesh>
      ))}
    </group>
  );
}

// Three bays of dark blue drape between timber piers. The centre one runs most
// of the way to the ceiling and carries the coat of arms on a pale disc; the
// two outside it are lower, and each stands in a timber frame of its own with
// a cornice over it (Vanguard frame; TheNigeriaLawyer frame for the tops).
function BenchWall() {
  const { plan, palette } = useChamber();
  const { FRONT_Z, WALL_H, BENCH_FLOOR, BAY_CENTRE_W, BAY_SIDE_W, PIER_W } = plan;
  const { BAY_CENTRE_TOP, BAY_SIDE_TOP, ARMS_Y, ARMS_D } = plan;
  const pierX = BAY_CENTRE_W / 2 + PIER_W / 2;
  const sideX = BAY_CENTRE_W / 2 + PIER_W + BAY_SIDE_W / 2;
  const frameX = sideX + BAY_SIDE_W / 2 + 0.1;

  return (
    <group>
      <Drape width={BAY_CENTRE_W} bottom={BENCH_FLOOR} top={BAY_CENTRE_TOP} z={FRONT_Z + 0.08} />
      <mesh position={[0, BAY_CENTRE_TOP + 0.13, FRONT_Z + 0.2]} castShadow>
        <boxGeometry args={[BAY_CENTRE_W + PIER_W * 2 + 0.2, 0.26, 0.4]} />
        <meshStandardMaterial {...palette.pier} />
      </mesh>

      <group position={[0, ARMS_Y, FRONT_Z + 0.16]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[ARMS_D / 2, ARMS_D / 2, 0.07, 48]} />
          <meshStandardMaterial {...palette.disc} />
        </mesh>
        <group position={[0, 0, 0.045]}>
          <Emblem name="coat-of-arms" size={ARMS_D * 0.84} />
        </group>
      </group>

      {[-1, 1].map((dir) => (
        <group key={dir}>
          <mesh position={[dir * pierX, WALL_H / 2, FRONT_Z + 0.2]} castShadow receiveShadow>
            <boxGeometry args={[PIER_W, WALL_H, 0.4]} />
            <meshStandardMaterial {...palette.pier} />
          </mesh>

          <Drape
            width={BAY_SIDE_W}
            bottom={BENCH_FLOOR}
            top={BAY_SIDE_TOP}
            x={dir * sideX}
            z={FRONT_Z + 0.3}
          />
          <mesh position={[dir * frameX, BAY_SIDE_TOP / 2, FRONT_Z + 0.22]} castShadow>
            <boxGeometry args={[0.2, BAY_SIDE_TOP, 0.44]} />
            <meshStandardMaterial {...palette.pier} />
          </mesh>
          <mesh position={[dir * (sideX + 0.05), BAY_SIDE_TOP + 0.13, FRONT_Z + 0.26]} castShadow>
            <boxGeometry args={[BAY_SIDE_W + 0.5, 0.26, 0.56]} />
            <meshStandardMaterial {...palette.pier} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ---- The bench --------------------------------------------------------------

// The padded panels set into a desk front, one to a chair's width.
function FrontPanels({ centre, radius, count, pitch, y, height }) {
  const { palette } = useChamber();

  return (
    <group position={[0, 0, centre]} rotation={[0, Math.PI, 0]}>
      {Array.from({ length: count }, (_, i) => {
        const angle = ((i - (count - 1) / 2) * pitch) / radius;
        return (
          <mesh
            key={i}
            position={[Math.sin(angle) * (radius - 0.012), y, Math.cos(angle) * (radius - 0.012)]}
            rotation={[0, angle, 0]}
          >
            <boxGeometry args={[pitch * 0.82, height, 0.03]} />
            <meshStandardMaterial {...palette.panel} />
          </mesh>
        );
      })}
    </group>
  );
}

// One raised bench the width of the floor, curved so its ends lead its middle,
// and fifteen chairs behind it: grey leather in a timber frame, each with a
// carved crest standing well clear of the sitter's head. Below it and a step
// down, the desk the court's officers work at.
function Bench() {
  const { plan, palette } = useChamber();
  const { BENCH_CZ, BENCH_FRONT, BENCH_DEPTH, BENCH_SEAT_R, BENCH_FLOOR, BENCH_TOP } = plan;
  const { BENCH_CHAIRS, BENCH_PITCH, STAFF_FRONT, STAFF_FLOOR, STAFF_TOP, benchSeats } = plan;
  const seats = useMemo(() => benchSeats(), [benchSeats]);
  // A panel to a chair, so the chair spacing is carried down to the radius of
  // the bench front.
  const pitch = (BENCH_PITCH * BENCH_FRONT) / BENCH_SEAT_R;
  const half = ((BENCH_CHAIRS / 2) * BENCH_PITCH + 0.25) / BENCH_SEAT_R;

  const officers = useMemo(
    () =>
      [-1, 0, 1].map((i) => {
        const angle = (i * 1.3) / (STAFF_FRONT + 1.15);
        return {
          x: Math.sin(angle) * (STAFF_FRONT + 1.15),
          z: BENCH_CZ - Math.cos(angle) * (STAFF_FRONT + 1.15),
          y: STAFF_FLOOR,
          yaw: -angle,
        };
      }),
    [BENCH_CZ, STAFF_FRONT, STAFF_FLOOR]
  );

  return (
    <group>
      <ArcSlab centre={BENCH_CZ} flip inner={BENCH_FRONT + 0.01} outer={27} y1={BENCH_FLOOR} from={-half - 0.05} to={half + 0.05} mat={palette.carpet} wall={palette.mahogany} />
      <ArcSlab centre={BENCH_CZ} flip inner={BENCH_FRONT} outer={BENCH_FRONT + BENCH_DEPTH} y1={BENCH_TOP} from={-half} to={half} mat={palette.mahogany} />
      <FrontPanels centre={BENCH_CZ} radius={BENCH_FRONT} count={BENCH_CHAIRS} pitch={pitch} y={1.3} height={0.56} />
      <FrontPanels centre={BENCH_CZ} radius={BENCH_FRONT} count={BENCH_CHAIRS} pitch={pitch} y={0.62} height={0.56} />

      <SeatPart seats={seats} dy={0.5}>
        <boxGeometry args={[0.62, 0.12, 0.58]} />
        <meshStandardMaterial {...palette.leather} />
      </SeatPart>
      <SeatPart seats={seats} dy={1.02} dz={-0.3}>
        <boxGeometry args={[0.62, 1.05, 0.1]} />
        <meshStandardMaterial {...palette.leather} />
      </SeatPart>
      {[-1, 1].map((dir) => (
        <SeatPart key={dir} seats={seats} dy={0.8} dz={-0.31} dx={dir * 0.35}>
          <boxGeometry args={[0.08, 1.6, 0.13]} />
          <meshStandardMaterial {...palette.mahogany} />
        </SeatPart>
      ))}
      <SeatPart seats={seats} dy={1.72} dz={-0.31}>
        <boxGeometry args={[0.78, 0.34, 0.12]} />
        <meshStandardMaterial {...palette.mahogany} />
      </SeatPart>
      {/* The crest is a carving of the coat of arms. At this size it is a
          lighter boss on the rail and no more than that. */}
      <SeatPart seats={seats} dy={1.72} dz={-0.24}>
        <boxGeometry args={[0.3, 0.22, 0.03]} />
        <meshStandardMaterial {...palette.pier} />
      </SeatPart>

      <ArcSlab centre={BENCH_CZ} flip inner={STAFF_FRONT + 0.01} outer={BENCH_FRONT} y1={STAFF_FLOOR} from={-0.3} to={0.3} mat={palette.carpet} wall={palette.mahogany} />
      <ArcSlab centre={BENCH_CZ} flip inner={STAFF_FRONT} outer={STAFF_FRONT + 0.6} y1={STAFF_TOP} from={-0.27} to={0.27} mat={palette.mahogany} />
      <FrontPanels centre={BENCH_CZ} radius={STAFF_FRONT} count={11} pitch={0.94} y={0.68} height={0.8} />

      <SeatPart seats={officers} dy={0.46}>
        <boxGeometry args={[0.5, 0.1, 0.48]} />
        <meshStandardMaterial {...palette.seatDark} />
      </SeatPart>
      <SeatPart seats={officers} dy={0.8} dz={-0.26}>
        <boxGeometry args={[0.5, 0.6, 0.08]} />
        <meshStandardMaterial {...palette.seatDark} />
      </SeatPart>
    </group>
  );
}

// ---- The bar ----------------------------------------------------------------

// Where the lawyers sit, and behind them anyone else with business in the
// case: rows of dark timber desks, split by a centre aisle, each row a step up
// from the one in front, with the lectern in the well ahead of them all.
function Bar() {
  const { plan, palette } = useChamber();
  const { ROWS, ROW_CZ, HALF_W, INNER_ROWS, LECTERN, rowRadius, rowFloor, rowSpans, barSeats } = plan;
  const rows = Array.from({ length: ROWS }, (_, row) => row);
  const seats = useMemo(() => barSeats(), [barSeats]);
  const inner = useMemo(() => seats.filter((s) => s.row < INNER_ROWS), [seats, INNER_ROWS]);
  const outer = useMemo(() => seats.filter((s) => s.row >= INNER_ROWS), [seats, INNER_ROWS]);

  return (
    <group>
      {rows.slice(1).map((row) => {
        const from = rowRadius(row) - 0.4;
        const wide = Math.asin(HALF_W / from);
        return (
          <ArcSlab
            key={row}
            centre={ROW_CZ}
            inner={from}
            // The last step runs on under the rear gallery to the wall.
            outer={row === ROWS - 1 ? 50 : rowRadius(row + 1) - 0.4}
            y1={rowFloor(row)}
            from={-wide}
            to={wide}
            mat={palette.carpet}
            wall={palette.carpetShade}
          />
        );
      })}

      {rows.map((row) =>
        rowSpans(row).map(([from, to]) => (
          <ArcSlab
            key={`${row}:${from}`}
            centre={ROW_CZ}
            inner={rowRadius(row)}
            outer={rowRadius(row) + 0.45}
            y0={rowFloor(row)}
            y1={rowFloor(row) + 0.76}
            from={from}
            to={to}
            mat={palette.mahogany}
          />
        ))
      )}

      {[
        [inner, palette.seatDark],
        [outer, palette.seatTan],
      ].map(([group, mat], i) => (
        <group key={i}>
          <SeatPart seats={group} dy={0.45}>
            <boxGeometry args={[0.5, 0.1, 0.46]} />
            <meshStandardMaterial {...mat} />
          </SeatPart>
          <SeatPart seats={group} dy={0.76} dz={-0.25}>
            <boxGeometry args={[0.5, 0.56, 0.08]} />
            <meshStandardMaterial {...mat} />
          </SeatPart>
        </group>
      ))}

      <group position={LECTERN}>
        <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.65, 1.1, 0.45]} />
          <meshStandardMaterial {...palette.mahogany} />
        </mesh>
        <mesh position={[0, 1.14, 0]} rotation={[0.25, 0, 0]} castShadow>
          <boxGeometry args={[0.72, 0.04, 0.52]} />
          <meshStandardMaterial {...palette.mahogany} />
        </mesh>
        <mesh position={[0.16, 1.32, -0.08]} rotation={[-0.5, 0, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.36, 8]} />
          <meshStandardMaterial {...palette.charcoal} />
        </mesh>
      </group>
    </group>
  );
}

// ---- The galleries ----------------------------------------------------------

// A balcony down each side and across the back, hung off the walls with no
// columns under it, each fronted by a deep dark fascia that leans out over the
// floor. From the floor the fascia is all of the gallery there is to see, which
// is why nothing is drawn up there behind it.
const LEAN = 0.2;

function Galleries() {
  const { plan, palette } = useChamber();
  const { HALF_W, REAR_Z, GALLERY_DEPTH, GALLERY_Y, GALLERY_FRONT_Z, GALLERY_REAR_Z } = plan;
  const length = REAR_Z - GALLERY_FRONT_Z;
  const midZ = (REAR_Z + GALLERY_FRONT_Z) / 2;
  const edge = HALF_W - GALLERY_DEPTH;

  return (
    <group>
      {[-1, 1].map((dir) => (
        <group key={dir}>
          <mesh position={[dir * (HALF_W - GALLERY_DEPTH / 2), GALLERY_Y - 0.1, midZ]} castShadow receiveShadow>
            <boxGeometry args={[GALLERY_DEPTH, 0.2, length]} />
            <meshStandardMaterial {...palette.mahoganyDark} />
          </mesh>
          <mesh position={[dir * edge, GALLERY_Y + 0.38, midZ]} rotation={[0, 0, dir * LEAN]} castShadow>
            <boxGeometry args={[0.14, 1.3, length]} />
            <meshStandardMaterial {...palette.mahoganyDark} />
          </mesh>
          <mesh position={[dir * (HALF_W - GALLERY_DEPTH / 2), GALLERY_Y + 0.38, GALLERY_FRONT_Z]}>
            <boxGeometry args={[GALLERY_DEPTH, 1.3, 0.14]} />
            <meshStandardMaterial {...palette.mahoganyDark} />
          </mesh>
        </group>
      ))}

      <mesh position={[0, GALLERY_Y - 0.1, REAR_Z - GALLERY_DEPTH / 2]} receiveShadow>
        <boxGeometry args={[HALF_W * 2, 0.2, GALLERY_DEPTH]} />
        <meshStandardMaterial {...palette.mahoganyDark} />
      </mesh>
      <mesh position={[0, GALLERY_Y + 0.38, GALLERY_REAR_Z]} rotation={[-LEAN, 0, 0]}>
        <boxGeometry args={[edge * 2, 1.3, 0.14]} />
        <meshStandardMaterial {...palette.mahoganyDark} />
      </mesh>
    </group>
  );
}

// ---- The people -------------------------------------------------------------

// A robed figure, and deliberately no more than that: a dark gown, a pale wig,
// white bands at the throat. That much is common to everyone robed in this
// room. The trim that tells a Justice from counsel, and a working sitting from
// a ceremonial one, is not drawn, because no photograph of an ordinary panel
// sitting in this room was found to draw it from — every frame of the bench in
// use is a ceremonial sitting with all fifteen chairs filled.
function Figure({ x, y, z, yaw, standing = false }) {
  const { palette } = useChamber();
  const body = standing ? 1.32 : 0.66;
  const base = standing ? 0 : 0.56;
  const head = base + body + 0.15;

  return (
    <group position={[x, y, z]} rotation={[0, yaw, 0]}>
      <mesh position={[0, base + body / 2, 0]} castShadow>
        <cylinderGeometry args={[0.2, standing ? 0.3 : 0.28, body, 14]} />
        <meshStandardMaterial {...palette.robe} />
      </mesh>
      <mesh position={[0, head, 0.03]} castShadow>
        <sphereGeometry args={[0.115, 16, 12]} />
        <meshStandardMaterial {...palette.skin} />
      </mesh>
      <mesh position={[0, head + 0.035, -0.02]} scale={[1, 1, 0.95]} castShadow>
        <sphereGeometry args={[0.135, 16, 12]} />
        <meshStandardMaterial {...palette.wig} />
      </mesh>
      <mesh position={[0, base + body - 0.1, 0.2]}>
        <boxGeometry args={[0.08, 0.14, 0.02]} />
        <meshStandardMaterial {...palette.bands} />
      </mesh>
    </group>
  );
}

// ---- What the sequence points at --------------------------------------------

function Focus({ highlight }) {
  const { LECTERN, ARMS_Y, FRONT_Z, GALLERY_Y, HALF_W } = useChamber().plan;

  if (highlight === "bench") {
    return <pointLight position={[0, 4.4, -3]} intensity={70} distance={12} color="#fff0d6" />;
  }

  if (highlight === "officers") {
    return <pointLight position={[0, 3.2, -1.4]} intensity={36} distance={7} color="#fff0d6" />;
  }

  if (highlight === "lectern") {
    return (
      <group>
        <Figure x={LECTERN[0]} y={0} z={LECTERN[2] + 0.62} yaw={Math.PI} standing />
        <pointLight position={[0, 3.2, LECTERN[2] + 1.4]} intensity={30} distance={6} color="#ffe2b0" />
      </group>
    );
  }

  if (highlight === "gallery") {
    return [1, 7, 13].map((z) => (
      <pointLight
        key={z}
        position={[-(HALF_W - 2.6), GALLERY_Y + 2, z]}
        intensity={30}
        distance={8}
        color="#fff0d6"
      />
    ));
  }

  if (highlight === "arms") {
    return <pointLight position={[0, ARMS_Y + 0.3, FRONT_Z + 2.4]} intensity={36} distance={7} color="#fff6e6" />;
  }

  return null;
}

export default function Courtroom({ highlight = null, ...props }) {
  const { panelSeats } = useChamber().plan;
  const panel = useMemo(() => panelSeats(), [panelSeats]);

  return (
    <group {...props}>
      <Shell />
      <BenchWall />
      <Bench />
      <Bar />
      <Galleries />

      {/* Five Justices in the middle of a bench of fifteen: the least the
          Constitution lets hear an appeal (s. 234). They leave the room with
          the court when it rises. */}
      {highlight !== "empty" && panel.map((seat) => <Figure key={seat.index} {...seat} />)}

      <Focus highlight={highlight} />
    </group>
  );
}
