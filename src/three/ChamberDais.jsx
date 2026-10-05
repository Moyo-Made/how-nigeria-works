import { useEffect, useMemo } from "react";
import * as THREE from "three";

import CurvedDesk from "./CurvedDesk.jsx";
import { Emblem } from "./ChamberElevation.jsx";
import { doors } from "./chamberDoors.js";
import { useChamber } from "./chamberContext.js";

// The dais: everything between the wall behind the chair and the open floor of
// the well.
//
// It is not a platform with a desk on it, which is what this used to draw. The
// contractor's photographs show the same arrangement in both rooms, in three
// levels stepping down from the wall:
//
//   - the presiding chair on the top landing, behind a baize-covered parapet;
//   - a lower landing in front of that, with officers' chairs on it, behind a
//     second, wider baize parapet that stands on the floor of the room;
//   - on the floor in front of that, four clerks' chairs at a curved oak desk
//     whose centre is a table carrying the mace.
//
// Carpeted stairs with brass nosings climb each side: two rises to the lower
// landing, three more to the top.
//
//   Senate  gallery images g01 (head-on), g05 (from the benches) and g10 (from
//           the floor beside it, the only one that shows the stairs)
//   House   gallery images g05, g07, g08 and g09
//
// https://figueras.com/project/national-assembly-of-nigeria/
//
// No photograph carries a scale. Widths below are in metres because furniture
// is the size of the people at it in either room, and were read off g01 and g08
// against the width of a chair in the same row; depths front to back are not
// readable from any frame and are what a desk and a chair need, no more.

// Every arc of the dais is struck from one centre well behind the wall: the
// parapets are shallow curves, bowed toward the room, not arcs about the chair.
const ARC_R = 5.46;

const LOWER_W = 6.3;
const UPPER_W = 4.2;
const TIER = 1.3; // one parapet to the next, front to back
const STAIR_W = 1.3;
const TREAD = 0.3;
const GATE_W = 0.8;
const GATE_H = 1.05;

const PARAPET_T = 0.16;
const DESK = 0.75;
const DESK_DEPTH = 0.5;
// How far the baize stands above the desk behind it.
const UPSTAND = 0.12;

// Who sits on the lower landing, as distances along it from the centre line.
// The rooms differ here: the Senate has a crested chair on the centre line
// below the President's and one at each end (g01), the House two either side
// of the centre and none on it (g08, g09).
const OFFICERS = {
  senate: [{ x: -1.7 }, { x: 0, crested: true }, { x: 1.7 }],
  house: [{ x: -0.85 }, { x: 0.85 }],
};
const CLERKS = [-2.5, -1.5, 1.5, 2.5];

function layout(plan) {
  const { CLERKS_R, DAIS_LIFT, DAIS_MID, DAIS_R, DAIS_WALL_Z } = plan;
  const zc = DAIS_R - ARC_R;
  // The radius of the arc that crosses the centre line at z.
  const arc = (z) => z - zc;

  const lowerR = arc(DAIS_R);
  const upperR = arc(DAIS_R - TIER);
  const lowerHalf = Math.asin(LOWER_W / 2 / lowerR);
  const upperHalf = Math.asin(UPPER_W / 2 / upperR);

  // A door that opens onto the landing rather than the floor has to have the
  // landing in front of it.
  const door = doors(plan);
  const lowerLanding = Math.max(
    LOWER_W / 2 + STAIR_W,
    door.base > 0 ? door.x + door.width / 2 + 0.2 : 0
  );

  const wingR = arc(CLERKS_R - 0.5);

  return {
    zc,
    zWall: DAIS_WALL_Z,
    lowerR,
    upperR,
    lowerHalf,
    upperHalf,
    lowerEnd: zc + lowerR * Math.cos(lowerHalf),
    upperEnd: zc + upperR * Math.cos(upperHalf),
    lowerLanding,
    upperLanding: UPPER_W / 2 + STAIR_W,
    lowerTop: DAIS_MID + DESK + UPSTAND,
    upperTop: DAIS_LIFT + DESK + UPSTAND,
    officerR: lowerR - PARAPET_T - DESK_DEPTH - 0.3,
    chairZ: DAIS_R - TIER - PARAPET_T - DESK_DEPTH - 0.3,
    wingR,
    clerkR: wingR - 0.65 - 0.45,
    // Where something x metres off the centre line stands on an arc, and which
    // way it faces from there.
    onArc: (r, x, y = 0) => {
      const angle = Math.asin(x / r);
      return { position: [x, y, zc + r * Math.cos(angle)], turn: angle };
    },
  };
}

function useDais() {
  const { plan } = useChamber();
  return useMemo(() => layout(plan), [plan]);
}

// A landing: square to the wall at the back, bowed at the front where the
// parapet stands on its edge. Carpet on top and a shade down on the risers, the
// same as the tiers.
function Landing({ halfWidth, r, half, height }) {
  const { palette } = useChamber();
  const { zc, zWall } = useDais();

  const geometry = useMemo(() => {
    const end = zc + r * Math.cos(half);
    // Drawn in the shape's own plane with z negated, so that standing the
    // extrusion up puts it back where the room has it.
    const shape = new THREE.Shape();
    shape.moveTo(-halfWidth, -zWall);
    shape.lineTo(-halfWidth, -end);
    for (let i = 0; i <= 24; i++) {
      const a = -half + (i / 24) * half * 2;
      shape.lineTo(Math.sin(a) * r, -(zc + Math.cos(a) * r));
    }
    shape.lineTo(halfWidth, -end);
    shape.lineTo(halfWidth, -zWall);
    shape.closePath();

    return new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: false }).rotateX(-Math.PI / 2);
  }, [half, halfWidth, height, r, zWall, zc]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial attach="material-0" {...palette.carpet} />
      <meshStandardMaterial attach="material-1" {...palette.carpetShade} />
    </mesh>
  );
}

function Nosing({ x, y, z, width }) {
  const { palette } = useChamber();
  return (
    <mesh position={[x, y + 0.004, z - 0.02]}>
      <boxGeometry args={[width, 0.012, 0.045]} />
      <meshStandardMaterial {...palette.brass} />
    </mesh>
  );
}

// The stair beside a parapet: `rises` of them from `from` to `to`, descending
// toward the room from the landing's edge at z. The last rise is the landing
// itself, so there is one fewer step than rises.
function Stair({ x, z, width, from, to, rises }) {
  const { palette } = useChamber();
  const rise = (to - from) / rises;

  return (
    <group>
      {Array.from({ length: rises - 1 }, (_, i) => {
        const top = from + (i + 1) * rise;
        const depth = TREAD * (rises - 1 - i);
        return (
          <group key={i}>
            <mesh position={[x, (from + top) / 2, z + depth / 2]} castShadow receiveShadow>
              <boxGeometry args={[width, top - from, depth]} />
              <meshStandardMaterial {...palette.carpet} />
            </mesh>
            <Nosing x={x} y={top} z={z + depth} width={width} />
          </group>
        );
      })}
      <Nosing x={x} y={to} z={z} width={width} />
    </group>
  );
}

// A parapet: baize from its foot to its top and over the top, with the oak desk
// it screens standing behind it, and the thin black joints both rooms' have
// between its panels (g10 shows them edge-on).
function Parapet({ r, half, base, top, panels }) {
  const { palette } = useChamber();
  const height = top - base;
  const deskY = top - UPSTAND;
  const inner = r - PARAPET_T;
  const sweep = half * 2;
  const ring = (from, to) => [from, to, 48, 1, -half - Math.PI / 2, sweep];

  return (
    <group>
      <mesh position={[0, base + height / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[r, r, height, 48, 1, true, -half, sweep]} />
        <meshStandardMaterial {...palette.baize} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, top, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={ring(inner, r)} />
        <meshStandardMaterial {...palette.baize} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, deskY + UPSTAND / 2, 0]}>
        <cylinderGeometry args={[inner, inner, UPSTAND, 48, 1, true, -half, sweep]} />
        <meshStandardMaterial {...palette.baize} side={THREE.DoubleSide} />
      </mesh>

      {/* the desk behind it */}
      <mesh position={[0, deskY, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={ring(inner - DESK_DEPTH, inner)} />
        <meshStandardMaterial {...palette.oak} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, deskY - 0.03, 0]}>
        <cylinderGeometry args={[inner - DESK_DEPTH, inner - DESK_DEPTH, 0.06, 48, 1, true, -half, sweep]} />
        <meshStandardMaterial {...palette.oakShade} side={THREE.DoubleSide} />
      </mesh>

      {[-1, 1].map((dir) => (
        <group key={dir} rotation={[0, dir * half, 0]}>
          <mesh position={[0, base + height / 2, r - PARAPET_T / 2]}>
            <boxGeometry args={[0.02, height, PARAPET_T]} />
            <meshStandardMaterial {...palette.baize} />
          </mesh>
        </group>
      ))}

      {Array.from({ length: panels - 1 }, (_, i) => (
        <group key={i} rotation={[0, -half + ((i + 1) * sweep) / panels, 0]}>
          <mesh position={[0, base + height / 2, r + 0.004]}>
            <boxGeometry args={[0.035, height * 0.96, 0.012]} />
            <meshStandardMaterial {...palette.charcoal} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// The chairs on the dais are the upholstered swivel chairs the photographs show
// at every level of it, on a black base (g10). The crested ones — the presiding
// chair, and the one below it in the Senate — are leather rather than cloth,
// with the arms on the headrest.
function Chair({ position, turn = 0, crested = false, scale = 1 }) {
  const { plan, palette } = useChamber();
  const cover = crested ? palette.leather : palette.baize;

  return (
    <group position={position} rotation={[0, turn, 0]} scale={scale}>
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.28, 0.3, 0.04, 20]} />
        <meshStandardMaterial {...palette.charcoal} />
      </mesh>
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.36, 10]} />
        <meshStandardMaterial {...palette.charcoal} />
      </mesh>
      <mesh position={[0, 0.46, 0]} castShadow>
        <boxGeometry args={[0.56, 0.13, 0.52]} />
        <meshStandardMaterial {...cover} />
      </mesh>
      <mesh position={[0, 0.83, -0.25]} rotation={[-0.1, 0, 0]} castShadow>
        <boxGeometry args={[0.56, 0.68, 0.13]} />
        <meshStandardMaterial {...cover} />
      </mesh>
      <mesh position={[0, 1.2, -0.3]} castShadow>
        <boxGeometry args={[0.42, 0.26, 0.14]} />
        <meshStandardMaterial {...cover} />
      </mesh>
      {[-1, 1].map((dir) => (
        <mesh key={dir} position={[dir * 0.31, 0.66, -0.02]}>
          <boxGeometry args={[0.07, 0.05, 0.4]} />
          <meshStandardMaterial {...palette.charcoal} />
        </mesh>
      ))}

      {/* The House's chair carries the arms in colour (g07). The Senate's
          carries a gold device on a red roundel too small in any photograph to
          read, so it is a plain disc of brass. */}
      {crested &&
        (plan.elevation === "house" ? (
          <group position={[0, 1.2, -0.225]}>
            <Emblem name="coat-of-arms" size={0.24} />
          </group>
        ) : (
          <mesh position={[0, 1.2, -0.225]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.012, 24]} />
            <meshStandardMaterial {...palette.brass} />
          </mesh>
        ))}
    </group>
  );
}

function Dais() {
  const { plan, palette } = useChamber();
  const { DAIS_LIFT, DAIS_MID, elevation } = plan;
  const d = useDais();

  return (
    <group>
      <Landing halfWidth={d.lowerLanding} r={d.lowerR - 0.02} half={d.lowerHalf} height={DAIS_MID} />
      <Landing halfWidth={d.upperLanding} r={d.upperR - 0.02} half={d.upperHalf} height={DAIS_LIFT} />

      {[-1, 1].map((dir) => {
        const lowerWidth = d.lowerLanding - LOWER_W / 2;
        return (
          <group key={dir}>
            <Stair
              x={dir * (LOWER_W / 2 + lowerWidth / 2)}
              z={d.lowerEnd}
              width={lowerWidth}
              from={0}
              to={DAIS_MID}
              rises={2}
            />
            <Stair
              x={dir * (UPPER_W / 2 + STAIR_W / 2)}
              z={d.upperEnd}
              width={STAIR_W}
              from={DAIS_MID}
              to={DAIS_LIFT}
              rises={3}
            />
          </group>
        );
      })}

      {/* The glass gates at the foot of the upper stairs, one each side, hung on
          a post at the outer edge (r10 shows one from the floor; both show
          head-on just outboard of the upper parapet in r01 and g08). They carry
          an etched crest that is not drawn. */}
      {[-1, 1].map((dir) => {
        const z = d.upperEnd + TREAD * 2 + 0.06;
        const hinge = dir * (UPPER_W / 2 + STAIR_W - 0.06);
        return (
          <group key={dir}>
            <mesh position={[hinge, DAIS_MID + GATE_H / 2 + 0.03, z]}>
              <boxGeometry args={[0.05, GATE_H + 0.06, 0.05]} />
              <meshStandardMaterial {...palette.charcoal} />
            </mesh>
            <mesh position={[hinge - dir * (GATE_W / 2 + 0.04), DAIS_MID + GATE_H / 2 + 0.06, z]}>
              <boxGeometry args={[GATE_W, GATE_H, 0.025]} />
              <meshStandardMaterial {...palette.glass} />
            </mesh>
          </group>
        );
      })}

      <group position={[0, 0, d.zc]}>
        <Parapet r={d.lowerR} half={d.lowerHalf} base={0} top={d.lowerTop} panels={5} />
        <Parapet r={d.upperR} half={d.upperHalf} base={DAIS_MID} top={d.upperTop} panels={3} />
      </group>

      {OFFICERS[elevation].map(({ x, crested }) => (
        <Chair key={x} {...d.onArc(d.officerR, x, DAIS_MID)} crested={crested} />
      ))}

      <Chair position={[0, DAIS_LIFT, d.chairZ]} crested scale={1.12} />

      {/* The glass screen behind the presiding chair, with its brass rail (g07
          in the House; the top of it shows behind the chair in the Senate's
          g01). */}
      <group position={[0, DAIS_LIFT, d.chairZ - 0.55]}>
        <mesh position={[0, 0.475, 0]}>
          <boxGeometry args={[2.2, 0.95, 0.03]} />
          <meshStandardMaterial {...palette.glass} />
        </mesh>
        <mesh position={[0, 0.78, 0.03]}>
          <boxGeometry args={[2.0, 0.03, 0.02]} />
          <meshStandardMaterial {...palette.brass} />
        </mesh>
      </group>
    </group>
  );
}

// The mace: roughly three feet, gold, the coat of arms at its head. It is not
// ornament — the Senate cannot validly sit without it, and the Sergeant-at-Arms
// carries it in ahead of the President of the Senate to open the sitting. Which
// is why it is modelled as an object in its own right rather than a detail of
// the table, and why the bill sequence will be able to address it.
//
// Built along Y because that is the axis every cylinder here is native to, then
// laid on its side, the way it rests on the table between sittings.
function Mace({ length = 0.92, lit = false }) {
  const { palette } = useChamber();
  const BRASS = palette.brass;
  const shaft = length * 0.58;
  // Lit, it is the same brass with the light turned up inside it rather than a
  // different object. The mace is the one thing in this room whose presence is
  // itself the fact being taught, so it has to read as the same mace.
  const brass = lit
    ? { ...BRASS, emissive: "#c9931f", emissiveIntensity: 0.85, toneMapped: false }
    : BRASS;

  return (
    <group rotation={[0, 0, Math.PI / 2]}>
      <mesh castShadow>
        <cylinderGeometry args={[length * 0.026, length * 0.032, shaft, 16]} />
        <meshStandardMaterial {...brass} />
      </mesh>

      {/* collars breaking up the shaft */}
      {[-0.28, 0.06].map((t) => (
        <mesh key={t} position={[0, shaft * t, 0]} castShadow>
          <cylinderGeometry args={[length * 0.042, length * 0.042, length * 0.028, 16]} />
          <meshStandardMaterial {...brass} />
        </mesh>
      ))}

      {/* head: bulb, crown and the arms on top */}
      <mesh position={[0, shaft * 0.5 + length * 0.05, 0]} castShadow>
        <sphereGeometry args={[length * 0.062, 20, 14]} />
        <meshStandardMaterial {...brass} />
      </mesh>
      <mesh position={[0, shaft * 0.5 + length * 0.125, 0]} castShadow>
        <cylinderGeometry args={[length * 0.055, length * 0.038, length * 0.07, 16, 1, true]} />
        <meshStandardMaterial {...brass} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, shaft * 0.5 + length * 0.18, 0]} castShadow>
        <sphereGeometry args={[length * 0.03, 14, 10]} />
        <meshStandardMaterial {...brass} />
      </mesh>

      {/* tapered foot */}
      <mesh position={[0, -shaft * 0.5 - length * 0.06, 0]} castShadow>
        <coneGeometry args={[length * 0.032, length * 0.12, 16]} />
        <meshStandardMaterial {...brass} />
      </mesh>
    </group>
  );
}

// On the floor in front of the lower parapet: a curved oak desk in two wings,
// and between them a table that stands forward of both, with a baize top, a row
// of bound volumes along its back edge and the two brass cradles the mace lies
// across at its front (g01 and g08, head-on; one cradle close up in the red
// chamber's g11).
const TABLE_W = 2.0;
const TABLE_D = 1.4;
const TABLE_H = 0.79;
const WING_D = 0.65;
const WING_OUT = 3.5;
const CRADLE_X = 0.45;

function ClerksTable({ maceLit }) {
  const { plan, palette } = useChamber();
  const { CLERKS_R } = plan;
  const d = useDais();
  const front = CLERKS_R;
  const cradleZ = front - 0.14;

  const from = Math.asin(TABLE_W / 2 / d.wingR);
  const to = Math.asin(WING_OUT / d.wingR);
  const wingHalf = (to - from) / 2;

  return (
    <group>
      <group position={[0, 0, d.zc]}>
        {[-1, 1].map((dir) => (
          <group key={dir} rotation={[0, (dir * (from + to)) / 2, 0]}>
            <CurvedDesk
              radius={d.wingR}
              halfAngle={wingHalf}
              height={DESK}
              depth={WING_D}
              lip={0.04}
              face={palette.oak}
              back={palette.oakShade}
              top={palette.oak}
              segments={24}
            />
            {/* the wing's ends, which a desk in a row never shows and this one
                does */}
            {[-1, 1].map((end) => (
              <group key={end} rotation={[0, end * wingHalf, 0]}>
                <mesh position={[0, DESK / 2, d.wingR - WING_D / 2]} castShadow>
                  <boxGeometry args={[0.03, DESK, WING_D]} />
                  <meshStandardMaterial {...palette.oakShade} />
                </mesh>
              </group>
            ))}
            <mesh position={[0, DESK / 2 - 0.04, d.wingR + 0.004]}>
              <boxGeometry args={[0.03, DESK * 0.86, 0.012]} />
              <meshStandardMaterial {...palette.charcoal} />
            </mesh>
          </group>
        ))}
      </group>

      {CLERKS.map((x) => (
        <Chair key={x} {...d.onArc(d.clerkR, x)} />
      ))}

      {/* the table */}
      <mesh position={[0, (TABLE_H - 0.05) / 2, front - TABLE_D / 2]} castShadow receiveShadow>
        <boxGeometry args={[TABLE_W - 0.1, TABLE_H - 0.05, TABLE_D - 0.1]} />
        <meshStandardMaterial {...palette.oak} />
      </mesh>
      <mesh position={[0, TABLE_H - 0.025, front - TABLE_D / 2]} castShadow receiveShadow>
        <boxGeometry args={[TABLE_W + 0.06, 0.05, TABLE_D + 0.06]} />
        <meshStandardMaterial {...palette.oak} />
      </mesh>
      <mesh position={[0, TABLE_H + 0.004, front - 0.6]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[TABLE_W - 0.5, 0.92]} />
        <meshStandardMaterial {...palette.baize} />
      </mesh>
      {/* paired black joints near each edge of its front */}
      {[-0.86, -0.8, 0.8, 0.86].map((x) => (
        <mesh key={x} position={[x, TABLE_H / 2 - 0.04, front - 0.046]}>
          <boxGeometry args={[0.025, TABLE_H * 0.86, 0.012]} />
          <meshStandardMaterial {...palette.charcoal} />
        </mesh>
      ))}

      {/* the bound volumes along the back edge. Their spines are not drawn. */}
      <mesh position={[0, TABLE_H + 0.12, front - TABLE_D + 0.2]} castShadow>
        <boxGeometry args={[1.1, 0.24, 0.17]} />
        <meshStandardMaterial {...palette.charcoal} />
      </mesh>

      {/* the cradle: two stanchions with saddles, each with the hook that hangs
          down the front of the table below it, and the mace across them */}
      {[-1, 1].map((dir) => (
        <group key={dir} position={[dir * CRADLE_X, 0, cradleZ]}>
          <mesh position={[0, TABLE_H + 0.055, 0]} castShadow>
            <cylinderGeometry args={[0.022, 0.03, 0.11, 12]} />
            <meshStandardMaterial {...palette.brass} />
          </mesh>
          <mesh position={[0, TABLE_H + 0.115, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <torusGeometry args={[0.036, 0.011, 8, 16, Math.PI]} />
            <meshStandardMaterial {...palette.brass} />
          </mesh>
          <mesh position={[0, TABLE_H - 0.13, 0.19]}>
            <boxGeometry args={[0.035, 0.16, 0.025]} />
            <meshStandardMaterial {...palette.brass} />
          </mesh>
        </group>
      ))}

      <group position={[0, TABLE_H + 0.115, cradleZ]}>
        <Mace lit={maceLit} />
      </group>
    </group>
  );
}

export default function ChamberDais({ maceLit = false }) {
  return (
    <group>
      <Dais />
      <ClerksTable maceLit={maceLit} />
    </group>
  );
}
