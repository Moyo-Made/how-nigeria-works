import { useEffect, useLayoutEffect, useRef, useState } from "react";
import * as THREE from "three";

import { FLAG_GREEN, FLAG_RED, FLAG_WHITE } from "./materials.js";
import { doors } from "./chamberDoors.js";
import { useChamber } from "./chamberContext.js";

// The wall behind the presiding chair, which is where the two chambers stop
// being alike.
//
// Everything in front of it matches: the contractor's photographs show the same
// dais furniture in both rooms piece for piece, and the same timbers on every
// wall. The walls themselves are two different compositions, and each is built
// here from photographs of that room and no other:
//
//   House   brochure p. 4 (straight down the centre aisle to the chair), and
//           gallery images g05, g07, g08 and g09
//   Senate  gallery images g01 and g10 of the red chamber, and g05 for the
//           doors either side
//
// https://figueras.com/wp-content/uploads/2024/08/National-Assembly-Nigeria_EN.pdf
// https://figueras.com/project/national-assembly-of-nigeria/
//
// No photograph carries a scale, so nothing below is in metres except what is
// the size of a person — doors, flags, a speaker column. Everything else is a
// proportion read off the photograph against the band line (plan.BAND_Y): the
// height at which the fluted timber stops and the plaster starts, which is on
// the same wall as the things being measured and so shares their perspective.
// Where a photograph is cut off before an element ends, the comment says so and
// the element stops where the photograph does.

// The acoustic wall is a few hundred battens. As separate meshes that is a few
// hundred draw calls for a surface nobody ever looks at straight on.
function Fluting({ x, z, width, height, y = 0, pitch = 0.17 }) {
  const { palette } = useChamber();
  const ref = useRef();
  const count = Math.max(1, Math.floor(width / pitch));

  useLayoutEffect(() => {
    const matrix = new THREE.Matrix4();
    for (let i = 0; i < count; i++) {
      matrix.setPosition(x - width / 2 + pitch / 2 + i * pitch, y + height / 2, z);
      ref.current.setMatrixAt(i, matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
    ref.current.computeBoundingSphere();
  }, [count, pitch, width, height, x, y, z]);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} castShadow receiveShadow>
      <boxGeometry args={[pitch * 0.5, height, 0.14]} />
      <meshStandardMaterial {...palette.oakPale} />
    </instancedMesh>
  );
}

// An emblem is a rendered texture, not geometry. An eagle, two horses and a
// wreath do not reduce to primitives at any sane triangle count, and extruding
// the published vector art would be hundreds of thousands of triangles for
// something read at a couple of hundred pixels on screen.
//
// The masters are in tools/emblems/, drawn for this project so no third-party
// licence rides along with them. `npm run emblems` renders them.
export function Emblem({ name, size }) {
  const [texture, setTexture] = useState(null);

  // Loaded imperatively rather than through a suspending hook. Suspense would
  // hold the entire chamber back behind one image — and worse, it left the room
  // blank indefinitely here rather than resolving. An emblem is a detail of a
  // wall; the wall should not wait for it.
  useEffect(() => {
    let live = true;
    new THREE.TextureLoader().load(`${import.meta.env.BASE_URL}textures/${name}.png`, (map) => {
      if (!live) {
        map.dispose();
        return;
      }
      map.colorSpace = THREE.SRGBColorSpace;
      // Read from the floor at a steep angle, which is exactly where an
      // unfiltered texture goes to mush.
      map.anisotropy = 8;
      setTexture(map);
    });
    return () => {
      live = false;
    };
  }, [name]);

  useEffect(() => () => texture?.dispose(), [texture]);

  if (!texture) return null;

  return (
    <mesh>
      <planeGeometry args={[size, size]} />
      {/* alphaTest rather than plain transparency: the emblem sits against a
          wall it must not sort behind, and a cutout has no ordering to get
          wrong. */}
      <meshStandardMaterial map={texture} transparent alphaTest={0.35} roughness={0.58} metalness={0.04} />
    </mesh>
  );
}

// A flag on a floor pole beside the chair, as every photograph of either room
// shows them: hanging, not flying. The cloth is gathered at the top of the pole
// and falls in folds that widen toward the hem, so each stripe is drawn as a
// fold — narrow at the top, fuller at the bottom — rather than as a flat band.
// Nigeria's is green-white-green and its stripes run down the drop; the Senate's
// own flag is red with a gold emblem too small in any photograph to draw, and is
// three folds of plain red.
const NIGERIA = [FLAG_GREEN, FLAG_WHITE, FLAG_GREEN];
const SENATE = [FLAG_RED, FLAG_RED, FLAG_RED];

function Flag({ x, z, top, drop, stripes }) {
  const { plan, palette } = useChamber();
  // They stand on the top landing of the dais, not on the floor of the room.
  const foot = plan.DAIS_LIFT;
  const clothTop = top - 0.18;
  const spread = 0.1;

  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, (foot + top) / 2, 0]} castShadow>
        <cylinderGeometry args={[0.022, 0.028, top - foot, 10]} />
        <meshStandardMaterial {...palette.brass} />
      </mesh>
      <mesh position={[0, top + 0.07, 0]} castShadow>
        <coneGeometry args={[0.04, 0.16, 10]} />
        <meshStandardMaterial {...palette.brass} />
      </mesh>
      {stripes.map((material, i) => {
        const side = i - (stripes.length - 1) / 2;
        return (
          <mesh
            key={i}
            position={[side * spread * 0.55, clothTop - drop / 2, 0.05]}
            rotation={[0, 0, side * Math.atan2(spread * 0.9, drop)]}
            scale={[1, 1, 0.6]}
            castShadow
          >
            <cylinderGeometry args={[0.035, 0.085, drop, 8]} />
            <meshStandardMaterial {...material} />
          </mesh>
        );
      })}
    </group>
  );
}

// The flat wall either side of whatever stands behind the chair: fluted timber
// up to the band line and plaster above it, run the full width of the D so the
// dais end of the room stays closed. `from` is where the composition in the
// middle stops and this takes over.
function Lining({ from }) {
  const { plan, palette } = useChamber();
  const { BACK_WALL_HALF, BAND_Y, WALL_H } = plan;
  const width = BACK_WALL_HALF - from;

  return (
    <group>
      <mesh position={[0, BAND_Y / 2, -0.12]} receiveShadow>
        <boxGeometry args={[BACK_WALL_HALF * 2, BAND_Y, 0.24]} />
        <meshStandardMaterial {...palette.oakPale} />
      </mesh>
      <mesh position={[0, (BAND_Y + WALL_H) / 2, -0.12]} receiveShadow>
        <boxGeometry args={[BACK_WALL_HALF * 2, WALL_H - BAND_Y, 0.24]} />
        <meshStandardMaterial {...palette.plaster} />
      </mesh>
      {[-1, 1].map((dir) => (
        <Fluting key={dir} x={dir * (from + width / 2)} z={0.04} width={width} height={BAND_Y} />
      ))}
    </group>
  );
}

// Several stacked boards rather than one, which is how the piers are built in
// both rooms: the joints read as fine dark lines at regular heights.
function Pier({ x, width, height, depth, material }) {
  const { palette } = useChamber();
  const joints = Math.floor(height / 2.6);

  return (
    <group position={[x, 0, depth / 2]}>
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial {...material} />
      </mesh>
      {Array.from({ length: joints }, (_, i) => (
        <mesh key={i} position={[0, (i + 1) * (height / (joints + 1)), depth / 2 + 0.003]}>
          <boxGeometry args={[width + 0.004, 0.022, 0.004]} />
          <meshStandardMaterial {...palette.charcoal} />
        </mesh>
      ))}
    </group>
  );
}

// ---- The House ---------------------------------------------------------------
// A tower rising the full height of the wall on the centre line: a dark walnut
// panel between two cherry piers, carrying the coat of arms high up at the
// level of the band, a clock below that, and the seal of the House just above
// the Speaker's head, with a flag either side. Either side of the tower, fluted
// timber with a screen set high in it and a door at its base, then a narrower
// cherry pier; over all of it a cherry canopy along the band line, sloping back
// up to the wall, with plaster above. Every proportion is read off the brochure
// photograph on p. 4, taken on the centre line, against the band line as unity.
function HouseElevation() {
  const { plan, palette } = useChamber();
  const { BAND_Y: B, BACK_WALL_HALF, WALL_H } = plan;

  const inner = 0.265 * B; // half-width of the walnut panel
  const pier = 0.17 * B;
  const tower = inner + pier; // half-width of the tower, 0.435B
  const bay = 0.42 * B; // fluted bay between the tower and the outer pier
  const outer = 0.14 * B;
  const bayMid = tower + bay / 2;

  // The canopy: a fascia at the band line, and a soffit rising from it back to
  // the wall. Seen from below in both the p. 4 photograph and g03, where it is
  // plainly deep; how deep is not measurable, so a fifth of the band height.
  const reach = 0.2 * B;
  const rise = 0.25 * B;
  const canopyWidth = BACK_WALL_HALF - tower;
  const slope = Math.atan2(rise, reach);
  const door = doors(plan);

  return (
    <group>
      <Lining from={tower} />

      {/* The tower. The photograph runs out of frame above the arms and g03
          shows it meeting the ceiling, so it is carried to the top. */}
      <mesh position={[0, WALL_H / 2, 0.05]} receiveShadow>
        <boxGeometry args={[inner * 2, WALL_H, 0.1]} />
        <meshStandardMaterial {...palette.walnut} />
      </mesh>
      {[-1, 1].map((dir) => (
        <Pier
          key={dir}
          x={dir * (inner + pier / 2)}
          width={pier}
          height={WALL_H}
          depth={0.3}
          material={palette.cherry}
        />
      ))}

      {/* outer piers, which stop at the band */}
      {[-1, 1].map((dir) => (
        <Pier
          key={dir}
          x={dir * (tower + bay + outer / 2)}
          width={outer}
          height={B}
          depth={0.22}
          material={palette.cherry}
        />
      ))}

      {/* screens set high in the fluted bays, and a door at the base of each */}
      {[-1, 1].map((dir) => (
        <group key={dir}>
          <mesh position={[dir * bayMid, 0.67 * B, 0.14]}>
            <boxGeometry args={[0.4 * B, 0.24 * B, 0.06]} />
            <meshStandardMaterial {...palette.screen} />
          </mesh>
          {/* The door is not on the face of the wall: it stands at the back of
              a deep reveal that reads as a dark opening in the fluting, the
              leaf itself lower than the opening (g05, g08). */}
          <mesh position={[dir * door.x, door.base + door.height / 2, 0.13]}>
            <boxGeometry args={[door.width, door.height, 0.08]} />
            <meshStandardMaterial {...palette.reveal} />
          </mesh>
          <mesh position={[dir * door.x, door.base + door.height * 0.39, 0.175]}>
            <boxGeometry args={[door.width * 0.84, door.height * 0.78, 0.02]} />
            <meshStandardMaterial {...palette.cherry} />
          </mesh>
        </group>
      ))}

      {/* the canopy either side of the tower */}
      {[-1, 1].map((dir) => (
        <group key={dir} position={[dir * (tower + canopyWidth / 2), 0, 0]}>
          <mesh position={[0, B + rise / 2, reach / 2]} rotation={[slope, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[canopyWidth, 0.08, Math.hypot(reach, rise)]} />
            <meshStandardMaterial {...palette.cherry} />
          </mesh>
          <mesh position={[0, B + 0.18, reach]} castShadow receiveShadow>
            <boxGeometry args={[canopyWidth, 0.36, 0.1]} />
            <meshStandardMaterial {...palette.cherry} />
          </mesh>
        </group>
      ))}

      {/* the arms, at the level of the band */}
      <group position={[0, 1.15 * B, 0.12]}>
        <Emblem name="coat-of-arms" size={0.21 * B} />
      </group>

      {/* The clock: a black LED display with green digits, four of them either
          side of a colon (the press photograph of the House in session, where
          it is running). Which digits is not the model's business, so each is
          drawn as a lit block. */}
      <mesh position={[0, 0.66 * B, 0.13]}>
        <boxGeometry args={[0.13 * B, 0.048 * B, 0.06]} />
        <meshStandardMaterial {...palette.screen} />
      </mesh>
      {[-1.5, -0.5, 0.5, 1.5].map((n) => (
        <mesh key={n} position={[n * 0.027 * B + Math.sign(n) * 0.004 * B, 0.66 * B, 0.165]}>
          <boxGeometry args={[0.017 * B, 0.028 * B, 0.01]} />
          <meshStandardMaterial color="#1d6b3a" emissive="#35e06b" emissiveIntensity={1.4} />
        </mesh>
      ))}

      {/* line-array speakers down the inner edges of the walnut */}
      {[-1, 1].map((dir) => (
        <mesh key={dir} position={[dir * (inner - 0.03 * B), 0.695 * B, 0.16]}>
          <boxGeometry args={[0.1, 0.23 * B, 0.1]} />
          <meshStandardMaterial {...palette.charcoal} />
        </mesh>
      ))}

      {/* the seal of the House, just above the Speaker's head */}
      <group position={[0, 0.42 * B, 0.12]}>
        <Emblem name="seal-house" size={0.176 * B} />
      </group>

      {/* a Nigerian flag either side of the seal */}
      {[-1, 1].map((dir) => (
        <Flag key={dir} x={dir * 0.24 * B} z={0.5} top={0.41 * B} drop={0.18 * B} stripes={NIGERIA} />
      ))}
    </group>
  );
}

// ---- The Senate ----------------------------------------------------------------
// Not a tower but an alcove: a recess lined in walnut between two broad cherry
// piers that stand well forward of it. In the recess, the Seal of the Senate on
// a lighter board directly behind the President's chair; above that a lintel
// carrying three cameras, and above the lintel a black screen the width of the
// alcove, and above that, high on the walnut between the piers and over the band
// line, the coat of arms. The contractor's photographs are all cut off below
// the arms, and this file used to say the wall had none; press photographs
// taken from the gallery show them, and show the screen running up to the band.
// https://www.lindaikejisblog.com/photos/shares/eedsd_1714480944.PNG
// https://www.edition-bcn.com/wp-content/uploads/2024/04/Nigerian-senate-new-chamber-1068x534-1.jpg
// Both flags, Nigeria's and the Senate's, stand to the right of the chair.
// Outboard of the piers, fluted timber with a door.
//
// Proportions from gallery image g01, taken on the centre line from the front
// bench. That camera is closer to the chair than to the wall, so the chair is
// not a safe ruler; they are taken against the band line like the House's.
function SenateElevation() {
  const { plan, palette } = useChamber();
  const { BAND_Y: B, WALL_H } = plan;

  const alcove = 0.57 * B; // half-width of the recess
  const pier = 0.22 * B;
  const face = alcove + pier; // where the fluted lining starts, 0.79B
  const pierDepth = 0.6;

  const lintelY = 0.74 * B;
  const lintelH = 0.16 * B;
  // The screen runs from the lintel up to about the band line.
  const screenH = 1.08 * B - (lintelY + lintelH);
  const door = doors(plan);

  return (
    <group>
      <Lining from={face} />

      {/* The cherry band the Senate's side walls carry at the top of the
          fluting (gallery r03), carried across this wall too. */}
      {[-1, 1].map((dir) => (
        <mesh key={dir} position={[dir * (face + (plan.BACK_WALL_HALF - face) / 2), B + 0.22, 0.12]} receiveShadow>
          <boxGeometry args={[plan.BACK_WALL_HALF - face, 0.44, 0.24]} />
          <meshStandardMaterial {...palette.cherry} />
        </mesh>
      ))}

      {/* the recess, and the piers standing forward of it */}
      <mesh position={[0, WALL_H / 2, 0.02]} receiveShadow>
        <boxGeometry args={[alcove * 2, WALL_H, 0.1]} />
        <meshStandardMaterial {...palette.walnut} />
      </mesh>
      {[-1, 1].map((dir) => (
        <Pier
          key={dir}
          x={dir * (alcove + pier / 2)}
          width={pier}
          height={WALL_H}
          depth={pierDepth}
          material={palette.cherry}
        />
      ))}

      {/* line-array speakers on the faces of the piers */}
      {[-1, 1].map((dir) => (
        <mesh key={dir} position={[dir * (alcove + pier / 2), 0.87 * B, pierDepth + 0.06]}>
          <boxGeometry args={[0.12, 0.34 * B, 0.12]} />
          <meshStandardMaterial {...palette.charcoal} />
        </mesh>
      ))}

      {/* the board, and the seal on it */}
      <mesh position={[0, 0.49 * B, 0.13]} castShadow receiveShadow>
        <boxGeometry args={[0.355 * B, 0.34 * B, 0.12]} />
        <meshStandardMaterial {...palette.sealBoard} />
      </mesh>
      <group position={[0, 0.49 * B, 0.2]}>
        <Emblem name="seal-senate" size={0.25 * B} />
      </group>

      {/* the lintel, and the three cameras along it */}
      <mesh position={[0, lintelY + lintelH / 2, 0.3]} castShadow receiveShadow>
        <boxGeometry args={[alcove * 2, lintelH, 0.5]} />
        <meshStandardMaterial {...palette.sealBoard} />
      </mesh>
      {[-0.44 * B, 0, 0.44 * B].map((x) => (
        <mesh key={x} position={[x, lintelY + lintelH / 2, 0.64]} castShadow>
          <boxGeometry args={[0.18, 0.2, 0.2]} />
          <meshStandardMaterial {...palette.charcoal} />
        </mesh>
      ))}

      <mesh position={[0, lintelY + lintelH + screenH / 2, 0.1]}>
        <boxGeometry args={[alcove * 2 - 0.1, screenH, 0.06]} />
        <meshStandardMaterial {...palette.screen} />
      </mesh>

      {/* the arms, over the band line */}
      <group position={[0, 1.42 * B, 0.12]}>
        <Emblem name="coat-of-arms" size={0.3 * B} />
      </group>

      {/* a door in the fluting either side, just outboard of the piers */}
      {[-1, 1].map((dir) => (
        <mesh key={dir} position={[dir * door.x, door.base + door.height / 2, 0.13]} castShadow>
          <boxGeometry args={[door.width, door.height, 0.08]} />
          <meshStandardMaterial {...palette.cherry} />
        </mesh>
      ))}

      {/* Both flags stand right of the chair: Nigeria's nearer it. Tall, their
          finials level with the lintel. */}
      <Flag x={0.41 * B} z={0.5} top={0.83 * B} drop={0.53 * B} stripes={NIGERIA} />
      <Flag x={0.53 * B} z={0.5} top={0.83 * B} drop={0.53 * B} stripes={SENATE} />
    </group>
  );
}

const ELEVATIONS = { house: HouseElevation, senate: SenateElevation };

export default function ChamberElevation() {
  const { plan } = useChamber();
  const Elevation = ELEVATIONS[plan.elevation];

  return (
    <group position={[0, 0, plan.DAIS_WALL_Z]}>
      <Elevation />
    </group>
  );
}
