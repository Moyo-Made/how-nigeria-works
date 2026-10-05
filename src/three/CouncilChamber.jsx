import { useMemo } from "react";
import * as THREE from "three";

import { Emblem } from "./ChamberElevation.jsx";
import { useChamber } from "./chamberContext.js";
import { spaced } from "./roomKit.js";
import { Flag, SeatPart } from "./roomParts.jsx";

// The Council Chamber at the State House. What it is drawn from and why every
// length in it is derived are set out at the top of plans/council.js; this file
// draws what that plan says.
//
// A third kind of room. The chambers are a fan and the courtroom is two arcs
// facing each other; this is a single oval ring with everyone on the outside of
// it looking in, and an oval of light in the ceiling over it. The President's
// place is at -Z and the foot of the table at +Z.

// A ring of oval outline and even thickness, standing from y0 to y1. Cut from
// a shape rather than scaled from a circle: scaling a round ring into an oval
// makes it half again as thick at the ends as along the sides, and the table is
// the same depth all the way round.
function OvalRing({ rx, rz, depth, y0 = 0, y1, mat }) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape().absellipse(0, 0, rx, rz, 0, Math.PI * 2);
    shape.holes.push(new THREE.Path().absellipse(0, 0, rx - depth, rz - depth, 0, Math.PI * 2, true));
    return new THREE.ExtrudeGeometry(shape, { depth: y1 - y0, bevelEnabled: false, curveSegments: 72 });
  }, [rx, rz, depth, y0, y1]);

  return (
    <mesh geometry={geometry} position={[0, y0, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
      <meshStandardMaterial {...mat} />
    </mesh>
  );
}

function OvalDisc({ rx, rz, y, mat, down = false }) {
  return (
    <mesh position={[0, y, 0]} rotation={[down ? Math.PI / 2 : -Math.PI / 2, 0, 0]} scale={[rx, rz, 1]} receiveShadow={!down}>
      <circleGeometry args={[1, 72]} />
      <meshStandardMaterial {...mat} />
    </mesh>
  );
}

// ---- The shell --------------------------------------------------------------

// Hung curtain rather than a painted wall: a rib every hand's width.
function Curtain({ width, height }) {
  const { palette } = useChamber();

  return (
    <group>
      <mesh>
        <boxGeometry args={[width, height, 0.06]} />
        <meshStandardMaterial {...palette.curtain} />
      </mesh>
      {spaced(-width / 2, width / 2, 0.3).map((x) => (
        <mesh key={x} position={[x, 0, 0.04]}>
          <boxGeometry args={[0.09, height, 0.03]} />
          <meshStandardMaterial {...palette.curtainFold} />
        </mesh>
      ))}
    </group>
  );
}

// The walls carry paintings, one between each pair of columns. Only their
// frames are drawn. They are particular works by particular artists, and a
// made-up picture in a frame would be a claim about what hangs there.
function Painting({ position, rotation }) {
  const { palette } = useChamber();

  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <boxGeometry args={[1.3, 1.7, 0.06]} />
        <meshStandardMaterial {...palette.frame} />
      </mesh>
      <mesh position={[0, 0, 0.035]}>
        <planeGeometry args={[1.1, 1.5]} />
        <meshStandardMaterial {...palette.canvas} />
      </mesh>
    </group>
  );
}

// Dark red timber on every wall and overhead, with the ceiling opened over the
// table into one long lit oval scattered with points of brighter light. Square
// columns stand in from the walls, each with a strip of lit stone up the face
// it turns to the table. One long wall is curtained along its middle.
function Shell() {
  const { plan, palette } = useChamber();
  const { HALF_W, HALF_L, WALL_H, OVAL_X, OVAL_Z, columns } = plan;
  const posts = useMemo(() => columns(), [columns]);

  // The points of light in the oval. No frame lets them be counted or mapped,
  // so they are laid on a sunflower spiral: even, and plainly not a pattern
  // anybody chose.
  const sparks = useMemo(
    () =>
      Array.from({ length: 110 }, (_, i) => {
        const r = Math.sqrt((i + 0.5) / 110) * 0.94;
        const a = i * 2.39996;
        return { x: Math.sin(a) * r * OVAL_X, z: Math.cos(a) * r * OVAL_Z, y: WALL_H - 0.035, yaw: 0 };
      }),
    [OVAL_X, OVAL_Z, WALL_H]
  );

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[HALF_W * 2, HALF_L * 2]} />
        <meshStandardMaterial {...palette.carpetOuter} />
      </mesh>
      <mesh position={[0, WALL_H, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[HALF_W * 2, HALF_L * 2]} />
        <meshStandardMaterial {...palette.timberDark} />
      </mesh>

      <OvalDisc rx={OVAL_X} rz={OVAL_Z} y={WALL_H - 0.02} mat={palette.oval} down />
      <OvalRing rx={OVAL_X + 0.12} rz={OVAL_Z + 0.12} depth={0.2} y0={WALL_H - 0.16} y1={WALL_H} mat={palette.rim} />
      <SeatPart seats={sparks} dy={0}>
        <boxGeometry args={[0.07, 0.01, 0.07]} />
        <meshStandardMaterial {...palette.spark} />
      </SeatPart>

      {[-1, 1].map((dir) => (
        <mesh key={`e${dir}`} position={[0, WALL_H / 2, dir * HALF_L]} rotation={[0, dir > 0 ? Math.PI : 0, 0]} receiveShadow>
          <planeGeometry args={[HALF_W * 2, WALL_H]} />
          <meshStandardMaterial {...palette.timber} />
        </mesh>
      ))}
      {[-1, 1].map((dir) => (
        <mesh key={`s${dir}`} position={[dir * HALF_W, WALL_H / 2, 0]} rotation={[0, -dir * (Math.PI / 2), 0]} receiveShadow>
          <planeGeometry args={[HALF_L * 2, WALL_H]} />
          <meshStandardMaterial {...palette.timber} />
        </mesh>
      ))}

      <SeatPart seats={posts} dy={WALL_H / 2}>
        <boxGeometry args={[0.55, WALL_H, 0.55]} />
        <meshStandardMaterial {...palette.timber} />
      </SeatPart>
      <SeatPart seats={posts} dy={WALL_H / 2} dz={0.285}>
        <boxGeometry args={[0.2, WALL_H - 0.3, 0.02]} />
        <meshStandardMaterial {...palette.stoneLit} />
      </SeatPart>

      {/* The curtained wall (the 2023 frame across the room), and paintings on
          the timber either side of it and down the wall opposite. */}
      <group position={[-HALF_W + 0.06, WALL_H / 2 - 0.1, 2.5]} rotation={[0, Math.PI / 2, 0]}>
        <Curtain width={11} height={WALL_H - 0.7} />
      </group>
      {[-9.6, -5.6].map((z) => (
        <Painting key={z} position={[-HALF_W + 0.05, 2.1, z]} rotation={[0, Math.PI / 2, 0]} />
      ))}
      {[-9.6, -5.6, -1.8, 1.8, 5.6, 9.6].map((z) => (
        <Painting key={z} position={[HALF_W - 0.05, 2.1, z]} rotation={[0, -Math.PI / 2, 0]} />
      ))}
      {[-4.6, 4.6].map((x) => (
        <Painting key={x} position={[x, 2.1, -HALF_L + 0.05]} rotation={[0, 0, 0]} />
      ))}
    </group>
  );
}

// ---- The wall behind the chair ----------------------------------------------

// A white backdrop the width of the head of the table, carrying the Seal of the
// President, with two flags standing each side of it: the national flag, and
// beside it one in red, blue and white (the January 2024 and February 2025
// frames). The seal is the coat of arms inside a lettered ring; the lettering
// is too fine to draw and the ring stands for it.
function HeadWall() {
  const { plan, palette } = useChamber();
  const { HALF_L } = plan;
  const z = -HALF_L + 0.06;
  const national = [palette.flagGreen, palette.flagWhite, palette.flagGreen];
  const second = [palette.flagRed, palette.flagBlue, palette.flagWhite];

  return (
    <group>
      <mesh position={[0, 2.2, z]} receiveShadow>
        <boxGeometry args={[6, 3.5, 0.08]} />
        <meshStandardMaterial {...palette.backdrop} />
      </mesh>

      <group position={[0, 2.45, z + 0.05]}>
        {[
          [0.98, 1.02],
          [0.72, 0.74],
        ].map(([inner, outer]) => (
          <mesh key={inner}>
            <ringGeometry args={[inner, outer, 64]} />
            <meshStandardMaterial {...palette.sealInk} />
          </mesh>
        ))}
        <group position={[0, 0, 0.005]}>
          <Emblem name="coat-of-arms" size={1.15} />
        </group>
      </group>

      <Flag x={-1.95} z={z + 0.5} bands={national} />
      <Flag x={-1.45} z={z + 0.5} bands={second} />
      <Flag x={1.45} z={z + 0.5} bands={national} />
      <Flag x={1.95} z={z + 0.5} bands={second} />
    </group>
  );
}

// ---- The table --------------------------------------------------------------

const wedge = (width, drop) => {
  const shape = new THREE.Shape();
  shape.moveTo(-width / 2, 0);
  shape.lineTo(width / 2, 0);
  shape.lineTo(0, -drop);
  shape.closePath();
  return new THREE.ShapeGeometry(shape);
};

// One closed ring of dark timber on a darker base, with a wedge of pale pink
// stone let into its inner face every couple of places, point down. The wedge
// at the President's place is larger and carries the coat of arms. On the top,
// a screen at every place.
function Table() {
  const { plan, palette } = useChamber();
  const { TABLE_X, TABLE_Z, TABLE_DEPTH, TABLE_H, PLINTH_H, atSeats } = plan;
  const wedges = useMemo(() => atSeats(TABLE_DEPTH + 0.012, 2).slice(1), [atSeats, TABLE_DEPTH]);
  const screens = useMemo(() => atSeats(0.5).slice(1), [atSeats]);
  const small = useMemo(() => wedge(0.78, 0.6), []);
  const large = useMemo(() => wedge(1.05, 0.72), []);
  const head = -(TABLE_Z - TABLE_DEPTH - 0.012);

  return (
    <group>
      <OvalRing rx={TABLE_X - 0.06} rz={TABLE_Z - 0.06} depth={TABLE_DEPTH - 0.12} y1={PLINTH_H} mat={palette.plinth} />
      <OvalRing rx={TABLE_X} rz={TABLE_Z} depth={TABLE_DEPTH} y0={PLINTH_H} y1={TABLE_H} mat={palette.timber} />
      <OvalRing rx={TABLE_X + 0.05} rz={TABLE_Z + 0.05} depth={TABLE_DEPTH + 0.1} y0={TABLE_H} y1={TABLE_H + 0.04} mat={palette.timberTop} />

      <SeatPart seats={wedges} dy={TABLE_H - 0.03}>
        <primitive object={small} attach="geometry" />
        <meshStandardMaterial {...palette.stone} />
      </SeatPart>
      <group position={[0, TABLE_H - 0.03, head]}>
        <mesh geometry={large}>
          <meshStandardMaterial {...palette.stone} />
        </mesh>
        <group position={[0, -0.26, 0.01]}>
          <Emblem name="coat-of-arms" size={0.4} />
        </group>
      </group>

      <SeatPart seats={screens} dy={TABLE_H + 0.15}>
        <boxGeometry args={[0.36, 0.21, 0.03]} />
        <meshStandardMaterial {...palette.charcoal} />
      </SeatPart>

      {/* The President's place stands a hand higher than the rest of the ring. */}
      <mesh position={[0, TABLE_H + 0.13, -(TABLE_Z - TABLE_DEPTH / 2)]} castShadow>
        <boxGeometry args={[1.5, 0.2, TABLE_DEPTH - 0.1]} />
        <meshStandardMaterial {...palette.timberTop} />
      </mesh>
    </group>
  );
}

// ---- The well ---------------------------------------------------------------

const star = (() => {
  const shape = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? 0.085 : 0.21;
    const a = (i / 10) * Math.PI * 2;
    shape[i ? "lineTo" : "moveTo"](Math.sin(a) * r, Math.cos(a) * r);
  }
  shape.closePath();
  return new THREE.ShapeGeometry(shape).rotateX(-Math.PI / 2);
})();

// Inside the ring: a blue-green carpet sown with white stars, the coat of arms
// worked into the middle of it, a red rope on brass posts round that, and pots
// of flowers. Nobody sits here; it is the floor the table looks across.
function Well() {
  const { plan, palette } = useChamber();
  const { TABLE_X, TABLE_Z, TABLE_DEPTH, onOval, around } = plan;
  const rx = TABLE_X - TABLE_DEPTH;
  const rz = TABLE_Z - TABLE_DEPTH;

  // The stars are in staggered rows in the photographs; their number is not
  // countable, so the pitch is derived.
  const stars = useMemo(() => {
    const out = [];
    const pitch = 1.05;
    for (let row = -8; row <= 8; row++) {
      for (let col = -5; col <= 5; col++) {
        const x = (col + (row % 2 ? 0.5 : 0)) * pitch;
        const z = row * pitch * 0.82;
        const inRing = (x / (rx - 0.5)) ** 2 + (z / (rz - 0.5)) ** 2 < 1;
        const clearOfArms = Math.hypot(x, z) > 2.5;
        if (inRing && clearOfArms) out.push({ x, z, y: 0.012, yaw: 0 });
      }
    }
    return out;
  }, [rx, rz]);

  const posts = useMemo(
    () => around(1.9, 3.1, 10).map((t) => onOval(1.9, 3.1, t)),
    [around, onOval]
  );

  return (
    <group>
      <OvalDisc rx={rx} rz={rz} y={0.006} mat={palette.carpet} />
      <SeatPart seats={stars} dy={0}>
        <primitive object={star} attach="geometry" />
        <meshStandardMaterial {...palette.star} />
      </SeatPart>

      <group position={[0, 0.014, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <Emblem name="coat-of-arms" size={2.2} />
      </group>

      {posts.map((post, i) => {
        const next = posts[(i + 1) % posts.length];
        const dx = next.x - post.x;
        const dz = next.z - post.z;
        return (
          <group key={i}>
            <mesh position={[post.x, 0.47, post.z]} castShadow>
              <cylinderGeometry args={[0.025, 0.03, 0.94, 10]} />
              <meshStandardMaterial {...palette.brass} />
            </mesh>
            <mesh position={[post.x, 0.97, post.z]}>
              <sphereGeometry args={[0.05, 12, 10]} />
              <meshStandardMaterial {...palette.brass} />
            </mesh>
            <group position={[(post.x + next.x) / 2, 0.8, (post.z + next.z) / 2]} rotation={[0, Math.atan2(dx, dz), 0]}>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.018, 0.018, Math.hypot(dx, dz), 8]} />
                <meshStandardMaterial {...palette.rope} />
              </mesh>
            </group>
          </group>
        );
      })}

      {[
        [-0.9, -1.7],
        [0.9, -1.7],
        [-0.9, 1.7],
        [0.9, 1.7],
      ].map(([x, z]) => (
        <group key={`${x}:${z}`} position={[x, 0, z]}>
          <mesh position={[0, 0.2, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.14, 0.4, 14]} />
            <meshStandardMaterial {...palette.pot} />
          </mesh>
          <mesh position={[0, 0.5, 0]}>
            <sphereGeometry args={[0.22, 12, 10]} />
            <meshStandardMaterial {...palette.leaf} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ---- The seats, and who is in them ------------------------------------------

function Chairs({ seats }) {
  const { palette } = useChamber();

  return (
    <group>
      <SeatPart seats={seats} dy={0.47}>
        <boxGeometry args={[0.56, 0.12, 0.52]} />
        <meshStandardMaterial {...palette.leather} />
      </SeatPart>
      <SeatPart seats={seats} dy={0.9} dz={-0.28}>
        <boxGeometry args={[0.56, 0.86, 0.1]} />
        <meshStandardMaterial {...palette.leather} />
      </SeatPart>
    </group>
  );
}

// A second line of places stands behind the ring along each long side, at a
// plain desk, for the officials who attend without being members (the
// foreground of the 2023 frame). How far it runs is derived.
function OuterRows() {
  const { plan, palette } = useChamber();
  const { TABLE_X } = plan;
  const x = TABLE_X + 2.5;
  const seats = useMemo(
    () =>
      [-1, 1].flatMap((dir) =>
        spaced(-4.5, 4.5, 0.95).map((z) => ({ x: dir * (x + 0.75), z, y: 0, yaw: -dir * (Math.PI / 2) }))
      ),
    [x]
  );

  return (
    <group>
      {[-1, 1].map((dir) => (
        <mesh key={dir} position={[dir * x, 0.375, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.6, 0.75, 9.4]} />
          <meshStandardMaterial {...palette.timber} />
        </mesh>
      ))}
      <Chairs seats={seats} />
    </group>
  );
}

// Someone in every place at the table, and no more than someone: a seated
// figure in one of three plain cloths. Who sits where, what they wear and how
// many ministers there are at any time are not things a model should assert —
// the Constitution fixes only the least number, one minister for each state.
function People({ seats }) {
  const { palette } = useChamber();
  const groups = useMemo(
    () => palette.cloth.map((_, g) => seats.filter((seat) => seat.index % palette.cloth.length === g)),
    [seats, palette.cloth]
  );

  return (
    <group>
      {groups.map((group, g) => (
        <SeatPart key={g} seats={group} dy={0.86}>
          <cylinderGeometry args={[0.19, 0.27, 0.64, 14]} />
          <meshStandardMaterial {...palette.cloth[g]} />
        </SeatPart>
      ))}
      <SeatPart seats={seats} dy={1.33} dz={0.03}>
        <sphereGeometry args={[0.115, 14, 10]} />
        <meshStandardMaterial {...palette.skin} />
      </SeatPart>
    </group>
  );
}

// ---- What the sequence points at --------------------------------------------

const GLOW = { color: "#f4c65e", emissive: "#eda92c", emissiveIntensity: 2.4, roughness: 0.45 };

// A lit cap on the back of a chair, the same marker the chambers use for a
// member's place.
function Place({ seat }) {
  return (
    <group>
      <SeatPart seats={[seat]} dy={1.36} dz={-0.28}>
        <boxGeometry args={[0.6, 0.1, 0.14]} />
        <meshStandardMaterial {...GLOW} />
      </SeatPart>
      <pointLight position={[seat.x * 0.9, 2.4, seat.z * 0.9]} intensity={22} distance={5} color="#ffd88c" />
    </group>
  );
}

function Focus({ highlight, seats }) {
  const { TABLE_Z, HALF_L, speaker } = useChamber().plan;
  const member = useMemo(() => speaker(), [speaker]);

  if (highlight === "head") return <Place seat={seats[0]} />;
  if (highlight === "member") return <Place seat={member} />;

  if (highlight === "table") {
    return [-0.5, 0.5].map((t) => (
      <pointLight key={t} position={[0, 3, t * TABLE_Z]} intensity={30} distance={11} color="#fff4e2" />
    ));
  }

  if (highlight === "seal") {
    return <pointLight position={[0, 2.6, -HALF_L + 2]} intensity={30} distance={7} color="#ffffff" />;
  }

  return null;
}

export default function CouncilChamber({ highlight = null, ...props }) {
  const { seats } = useChamber().plan;
  const places = useMemo(() => seats(), [seats]);

  return (
    <group {...props}>
      <Shell />
      <HeadWall />
      <Table />
      <Well />
      <Chairs seats={places} />
      <OuterRows />
      {highlight !== "empty" && <People seats={places} />}
      <Focus highlight={highlight} seats={places} />
    </group>
  );
}
