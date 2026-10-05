import { Emblem } from "./ChamberElevation.jsx";
import { useChamber } from "./chamberContext.js";
import { LIT } from "./roomKit.js";
import { Flag } from "./roomParts.jsx";

// The room at the State House where bills are signed. Which room that is, what
// it is not, and how little of it any photograph shows are set out at the top
// of plans/signing.js. In short: one wall and the desk in front of it are as
// photographed, and everything behind the camera is not known.
//
// The wall behind the chair is at -Z and the room is looked at from +Z, which
// is the only side it has ever been photographed from.

// Three fine brass lines, close together, running the height of whatever they
// are let into. The wall has them and so does the front of the desk.
function Inlay({ height, y, x = 0, z = 0 }) {
  const { palette } = useChamber();

  return [-0.07, 0, 0.07].map((dx) => (
    <mesh key={dx} position={[x + dx, y, z]}>
      <boxGeometry args={[0.018, height, 0.012]} />
      <meshStandardMaterial {...palette.brass} />
    </mesh>
  ));
}

// Dark glossy timber from floor to ceiling, washed by a row of downlights, with
// the coat of arms cast in bronze at its centre and two flags standing each
// side of it. Only this wall is in the photographs; the other three are drawn
// as more of the same timber and carry nothing, because nothing is known to be
// on them.
function Shell() {
  const { plan, palette } = useChamber();
  const { HALF_W, BACK_Z, FRONT_Z, WALL_H, ARMS_Y, FLAGS_X, INLAY_X } = plan;
  const depth = FRONT_Z - BACK_Z;
  const midZ = (FRONT_Z + BACK_Z) / 2;
  const national = [palette.flagGreen, palette.flagWhite, palette.flagGreen];
  const second = [palette.flagRed, palette.flagBlue, palette.flagWhite];

  return (
    <group>
      <mesh position={[0, 0, midZ]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[HALF_W * 2, depth]} />
        <meshStandardMaterial {...palette.carpet} />
      </mesh>
      <mesh position={[0, WALL_H, midZ]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[HALF_W * 2, depth]} />
        <meshStandardMaterial {...palette.timberDark} />
      </mesh>

      <mesh position={[0, WALL_H / 2, BACK_Z]} receiveShadow>
        <planeGeometry args={[HALF_W * 2, WALL_H]} />
        <meshStandardMaterial {...palette.timber} />
      </mesh>
      <mesh position={[0, WALL_H / 2, FRONT_Z]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[HALF_W * 2, WALL_H]} />
        <meshStandardMaterial {...palette.timber} />
      </mesh>
      {[-1, 1].map((dir) => (
        <mesh key={dir} position={[dir * HALF_W, WALL_H / 2, midZ]} rotation={[0, -dir * (Math.PI / 2), 0]}>
          <planeGeometry args={[depth, WALL_H]} />
          <meshStandardMaterial {...palette.timber} />
        </mesh>
      ))}

      {INLAY_X.map((x) => (
        <Inlay key={x} x={x} y={WALL_H / 2} z={BACK_Z + 0.008} height={WALL_H} />
      ))}

      {/* the downlights over the wall */}
      {[-0.8, -0.48, -0.16, 0.16, 0.48, 0.8].map((t) => (
        <mesh key={t} position={[t * HALF_W, WALL_H - 0.01, BACK_Z + 0.5]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.07, 16]} />
          <meshStandardMaterial {...LIT} />
        </mesh>
      ))}

      <group position={[0, ARMS_Y, BACK_Z + 0.03]}>
        <Emblem name="coat-of-arms" size={1} tint={palette.bronze} />
      </group>

      {FLAGS_X.map((x, i) => (
        <Flag key={x} x={x} z={BACK_Z + 0.35} bands={i % 2 ? second : national} />
      ))}
    </group>
  );
}

// One length of the desk: a timber block with brass lines down its face and a
// dark panel let into its top.
function DeskRun({ length }) {
  const { plan, palette } = useChamber();
  const { DESK_DEPTH, DESK_H } = plan;

  return (
    <group>
      <mesh position={[0, DESK_H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[length, DESK_H, DESK_DEPTH]} />
        <meshStandardMaterial {...palette.timber} />
      </mesh>
      <mesh position={[0, DESK_H + 0.006, 0]} receiveShadow>
        <boxGeometry args={[length - 0.28, 0.012, DESK_DEPTH - 0.28]} />
        <meshStandardMaterial {...palette.inset} />
      </mesh>
      {[-0.32, 0, 0.32].map((t) => (
        <Inlay key={t} x={t * length} y={DESK_H / 2} z={DESK_DEPTH / 2 + 0.006} height={DESK_H - 0.06} />
      ))}
    </group>
  );
}

// A straight front with a wing turned back from each end, and behind it a grey
// leather chair with the coat of arms on its headrest.
function Desk() {
  const { plan, palette } = useChamber();
  const { DESK_FRONT_Z, DESK_HALF, DESK_DEPTH, DESK_H, WING, WING_TURN, CHAIR } = plan;
  const sin = Math.sin(WING_TURN);
  const cos = Math.cos(WING_TURN);
  // A wing starts at the front corner, runs out and back, and keeps its face
  // to the room.
  const wingX = DESK_HALF + (cos * WING) / 2 - (sin * DESK_DEPTH) / 2;
  const wingZ = DESK_FRONT_Z - (sin * WING) / 2 - (cos * DESK_DEPTH) / 2;

  return (
    <group>
      <group position={[0, 0, DESK_FRONT_Z - DESK_DEPTH / 2]}>
        <DeskRun length={DESK_HALF * 2} />
      </group>
      {[-1, 1].map((dir) => (
        <group key={dir} scale={[dir, 1, 1]}>
          <group position={[wingX, 0, wingZ]} rotation={[0, WING_TURN, 0]}>
            <DeskRun length={WING} />
          </group>
        </group>
      ))}

      {/* what is being signed */}
      <mesh position={[0, DESK_H + 0.02, DESK_FRONT_Z - DESK_DEPTH + 0.3]} receiveShadow>
        <boxGeometry args={[0.5, 0.012, 0.36]} />
        <meshStandardMaterial {...palette.paper} />
      </mesh>

      <group position={CHAIR}>
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[0.62, 0.12, 0.58]} />
          <meshStandardMaterial {...palette.leather} />
        </mesh>
        <mesh position={[0, 1.05, -0.3]} castShadow>
          <boxGeometry args={[0.66, 1.02, 0.12]} />
          <meshStandardMaterial {...palette.leather} />
        </mesh>
        <group position={[0, 1.36, -0.235]}>
          <Emblem name="coat-of-arms" size={0.24} />
        </group>
      </group>
    </group>
  );
}

// A figure and no more than a figure, as in the Council Chamber: plain cloth
// and a head. It marks that someone is there, not who.
function Figure({ position, cloth, standing = false }) {
  const { palette } = useChamber();
  const body = standing ? 1.34 : 0.66;
  const base = standing ? 0 : 0.56;

  return (
    <group position={position}>
      <mesh position={[0, base + body / 2, 0]} castShadow>
        <cylinderGeometry args={[0.2, standing ? 0.31 : 0.28, body, 14]} />
        <meshStandardMaterial {...palette.cloth[cloth]} />
      </mesh>
      <mesh position={[0, base + body + 0.14, 0.02]} castShadow>
        <sphereGeometry args={[0.115, 16, 12]} />
        <meshStandardMaterial {...palette.skin} />
      </mesh>
    </group>
  );
}

function Focus({ highlight }) {
  const { BACK_Z, ARMS_Y, DESK_FRONT_Z, DESK_H, CHAIR } = useChamber().plan;

  if (highlight === "desk") {
    return <pointLight position={[0, 2.6, DESK_FRONT_Z + 0.8]} intensity={16} distance={6} color="#fff0d8" />;
  }

  if (highlight === "paper") {
    return <pointLight position={[0, DESK_H + 0.7, DESK_FRONT_Z - 0.55]} intensity={7} distance={2.4} color="#fff4dc" />;
  }

  // Nobody signs a bill alone in any photograph of this room: the people whose
  // bill it is stand behind the chair and watch.
  if (highlight === "assent") {
    return (
      <group>
        {[-2.3, -1.6, -0.95, 0.95, 1.6, 2.3].map((x, i) => (
          <Figure key={x} position={[x, 0, CHAIR[2] - 0.25]} cloth={i % 3} standing />
        ))}
        <pointLight position={[0, 2.7, -1]} intensity={14} distance={6} color="#fff0d8" />
      </group>
    );
  }

  if (highlight === "arms") {
    return <pointLight position={[0, ARMS_Y + 0.2, BACK_Z + 1.6]} intensity={12} distance={4.5} color="#fff2dc" />;
  }

  return null;
}

export default function SigningRoom({ highlight = null, ...props }) {
  const { CHAIR } = useChamber().plan;

  return (
    <group {...props}>
      <Shell />
      <Desk />
      {highlight !== "empty" && <Figure position={[CHAIR[0], 0, CHAIR[2] + 0.04]} cloth={1} />}
      <Focus highlight={highlight} />
    </group>
  );
}
