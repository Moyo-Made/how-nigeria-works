import { useEffect, useLayoutEffect, useRef, useState } from "react";
import * as THREE from "three";

import {
  OAK,
  OAK_SHADE,
  OAK_PALE,
  BAY_WOOD,
  BAIZE_RED,
  CARPET_RED,
  CHARCOAL,
  BRASS,
} from "./materials.js";
import ChamberTiers from "./ChamberTiers.jsx";
import ChamberBenches from "./ChamberBenches.jsx";
import CurvedDesk from "./CurvedDesk.jsx";
import {
  BACK_WALL_HALF,
  CLERKS_R,
  DAIS_LIFT,
  DAIS_R,
  HALF_FAN,
  WALL_H,
  WALL_R,
} from "./chamberPlan.js";

// The chamber the app models is the one rebuilt in 2024, not the one in most
// photographs of it. The old concrete tier was demolished outright and the
// seats, desks, carpet and acoustic walls all replaced, so anything shot before
// April 2024 is a different room. Where an element below is sourced from the
// House chamber rather than the Senate, the comment says so: the two are
// mirror-image halls of one design and their dais photographs match element for
// element, which is what makes the substitution defensible — and it is also the
// single largest piece of inference in this model.

const WALL_SEGMENTS = 96;

// Three.js puts cylinder theta 0 on +Z and sweeps toward +X, which is the
// convention the whole room is laid out in: the dais wall is at -Z, the seating
// fans toward +Z, and every arc shares a centre on the wall.
const arcStart = (halfAngle) => -halfAngle;

// The acoustic wall either side of the dais is a few hundred battens. As
// separate meshes that is a few hundred draw calls for a surface nobody ever
// looks at straight on.
function Fluting({ x, z, width, height, y = 0, pitch = 0.17 }) {
  const ref = useRef();
  const count = Math.max(1, Math.floor(width / pitch));

  useLayoutEffect(() => {
    const matrix = new THREE.Matrix4();
    for (let i = 0; i < count; i++) {
      matrix.setPosition(x - width / 2 + pitch / 2 + i * pitch, y + height / 2, z);
      ref.current.setMatrixAt(i, matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  }, [count, pitch, width, height, x, y, z]);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} castShadow receiveShadow>
      <boxGeometry args={[pitch * 0.5, height, 0.14]} />
      <meshStandardMaterial {...OAK_PALE} />
    </instancedMesh>
  );
}

// The emblem is a rendered texture, not geometry. An eagle, two horses and a
// wreath do not reduce to primitives at any sane triangle count — the earlier
// attempt read as an arrow flanked by two white tubes. Extruding real vector art
// was the other option and it is worse: the published SVGs of the arms run to
// 226 paths and 380 KB of path data, which becomes hundreds of thousands of
// triangles for something read at a couple of hundred pixels on screen.
//
// The master is tools/emblems/coat-of-arms.svg, drawn for this project so no
// third-party licence rides along with it. `npm run emblems` renders it.
function CoatOfArms({ size = 2.75 }) {
  const [texture, setTexture] = useState(null);

  // Loaded imperatively rather than through a suspending hook. Suspense would
  // hold the entire chamber back behind one image — and worse, it left the room
  // blank indefinitely here rather than resolving. The emblem is a detail of a
  // wall; the wall should not wait for it.
  useEffect(() => {
    let live = true;
    new THREE.TextureLoader().load(`${import.meta.env.BASE_URL}textures/coat-of-arms.png`, (map) => {
      if (!live) {
        map.dispose();
        return;
      }
      map.colorSpace = THREE.SRGBColorSpace;
      // Read from the floor of the House at a steep angle, which is exactly
      // where an unfiltered texture goes to mush.
      map.anisotropy = 8;
      setTexture(map);
    });
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => () => texture?.dispose(), [texture]);

  if (!texture) return null;

  return (
    <mesh>
      <planeGeometry args={[size, size]} />
      {/* alphaTest rather than plain transparency: the emblem sits against a
          wall it must not sort behind, and a cutout has no ordering to get
          wrong. */}
      <meshStandardMaterial
        map={texture}
        transparent
        alphaTest={0.35}
        roughness={0.58}
        metalness={0.04}
      />
    </mesh>
  );
}

// Composition confirmed against dais photography of both chambers: a central
// book-matched bay carrying the arms, a narrow reddish pilaster to either side,
// pale fluted acoustic panelling outboard of those, charcoal panels at high
// level, and a door at the base of each fluted bay.
function DaisWall() {
  // The panelled elevation is a composition in its own right, not cladding run
  // wall to wall: it stops short of the curved wall either side, which is what
  // the reference shows and what keeps the doors and the fluted bays inside the
  // frame from anywhere on the floor.
  const half = 8.0;
  const panelTop = 7.4;
  const bayHalf = 3.3;
  const pilaster = 0.7;
  const flutedInner = bayHalf + pilaster * 2;
  const flutedWidth = half - flutedInner;
  const flutedMid = flutedInner + flutedWidth / 2;

  return (
    <group position={[0, 0, -0.5]}>
      {/* The flat wall itself runs the full width of the D — the panelling in
          front of it does not — so the dais end of the room stays closed. */}
      <mesh position={[0, WALL_H / 2, -0.12]} receiveShadow>
        <boxGeometry args={[BACK_WALL_HALF * 2, WALL_H, 0.24]} />
        <meshStandardMaterial {...OAK_PALE} />
      </mesh>

      {/* central book-matched bay */}
      <mesh position={[0, panelTop / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[bayHalf * 2, panelTop, 0.16]} />
        <meshStandardMaterial {...BAY_WOOD} />
      </mesh>

      {/* pilasters */}
      {[-1, 1].map((dir) => (
        <mesh
          key={dir}
          position={[dir * (bayHalf + pilaster), panelTop / 2, 0.03]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[pilaster * 2, panelTop, 0.22]} />
          <meshStandardMaterial {...OAK} />
        </mesh>
      ))}

      {/* fluted acoustic bays, and the charcoal panels above them */}
      {[-1, 1].map((dir) => (
        <group key={dir}>
          <mesh position={[dir * flutedMid, panelTop / 2, -0.04]} receiveShadow>
            <boxGeometry args={[flutedWidth, panelTop, 0.1]} />
            <meshStandardMaterial {...OAK_PALE} />
          </mesh>
          <Fluting x={dir * flutedMid} z={0.04} width={flutedWidth} height={panelTop} />
          <mesh position={[dir * flutedMid, panelTop + 1.1, 0]} receiveShadow>
            <boxGeometry args={[flutedWidth, 2.0, 0.12]} />
            <meshStandardMaterial {...CHARCOAL} />
          </mesh>
        </group>
      ))}

      {/* a door at the base of each fluted bay, flanking the dais */}
      {[-1, 1].map((dir) => (
        <mesh key={dir} position={[dir * flutedMid, 1.35, 0.14]} castShadow>
          <boxGeometry args={[1.7, 2.7, 0.12]} />
          <meshStandardMaterial {...OAK} />
        </mesh>
      ))}

      <group position={[0, 5.1, 0.14]}>
        <CoatOfArms />
      </group>
    </group>
  );
}

// The presiding chair, its platform, and the curved baize desk in front of it.
// The desk is a partial cylinder concentric with everything else in the room, so
// it faces the benches by construction.
function Dais() {
  const deskH = 1.05;
  const platformHalf = HALF_FAN * 0.42;

  return (
    <group>
      {/* raised platform */}
      <mesh position={[0, DAIS_LIFT / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry
          args={[DAIS_R + 0.9, DAIS_R + 0.9, DAIS_LIFT, 48, 1, false, arcStart(platformHalf), platformHalf * 2]}
        />
        <meshStandardMaterial {...OAK} />
      </mesh>

      {/* two steps up to the platform, so the dais is stood on rather than
          floating above the carpet */}
      {[0, 1].map((i) => {
        // Each tread rises from the carpet rather than from the one below it, so
        // the risers stack without the lower step sinking through the floor.
        const rise = DAIS_LIFT * (0.5 + i * 0.5);
        const radius = DAIS_R + 1.16 - i * 0.2;
        return (
          <mesh key={i} position={[0, rise / 2, 0]} receiveShadow castShadow>
            <cylinderGeometry
              args={[radius, radius, rise, 48, 1, false, arcStart(platformHalf * 0.94), platformHalf * 1.88]}
            />
            <meshStandardMaterial {...OAK_SHADE} />
          </mesh>
        );
      })}

      <CurvedDesk
        radius={DAIS_R}
        halfAngle={platformHalf * 0.82}
        height={deskH}
        depth={0.44}
        lip={0.16}
        y={DAIS_LIFT}
        face={BAIZE_RED}
        back={OAK_SHADE}
        top={OAK}
      />
      <mesh position={[0, DAIS_LIFT + deskH + 0.22, 0]}>
        <cylinderGeometry
          args={[DAIS_R + 0.16, DAIS_R + 0.16, 0.05, 32, 1, true, arcStart(platformHalf * 0.82), platformHalf * 1.64]}
        />
        <meshStandardMaterial {...BRASS} side={THREE.DoubleSide} />
      </mesh>

      {/* roundel on the desk front. In the Senate this reads "The President of
          the Senate"; the House carries the identical fitting lettered for the
          Speaker. Lettering is left off rather than faked at this resolution. */}
      <mesh position={[0, DAIS_LIFT + deskH * 0.55, DAIS_R + 0.02]} castShadow>
        <cylinderGeometry args={[0.34, 0.34, 0.04, 32]} />
        <meshStandardMaterial {...BRASS} />
      </mesh>

      <PresidingChair />
    </group>
  );
}

function PresidingChair() {
  const seat = DAIS_LIFT + 0.48;

  return (
    <group position={[0, 0, DAIS_R - 1.5]}>
      <mesh position={[0, seat, 0]} castShadow>
        <boxGeometry args={[0.82, 0.16, 0.72]} />
        <meshStandardMaterial {...BAIZE_RED} />
      </mesh>
      {/* A tall upholstered back rising well above the desk, so the chair still
          reads as the seat of the chair from the floor of the House. */}
      <mesh position={[0, seat + 0.78, -0.32]} castShadow>
        <boxGeometry args={[0.86, 1.42, 0.18]} />
        <meshStandardMaterial {...BAIZE_RED} />
      </mesh>
      <mesh position={[0, seat + 1.56, -0.32]} castShadow>
        <boxGeometry args={[0.86, 0.24, 0.22]} />
        <meshStandardMaterial {...OAK} />
      </mesh>
      {/* the coat-of-arms roundel set into the headrest */}
      <mesh position={[0, seat + 1.22, -0.22]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.19, 0.19, 0.03, 24]} />
        <meshStandardMaterial {...BRASS} />
      </mesh>
      {[-1, 1].map((dir) => (
        <mesh key={dir} position={[dir * 0.46, seat + 0.24, 0]} castShadow>
          <boxGeometry args={[0.1, 0.36, 0.62]} />
          <meshStandardMaterial {...OAK} />
        </mesh>
      ))}
      <mesh position={[0, seat - 0.26, 0]} castShadow>
        <boxGeometry args={[0.5, 0.38, 0.5]} />
        <meshStandardMaterial {...OAK} />
      </mesh>
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
function Mace({ length = 0.92 }) {
  const shaft = length * 0.58;

  return (
    <group rotation={[0, 0, Math.PI / 2]}>
      <mesh castShadow>
        <cylinderGeometry args={[length * 0.026, length * 0.032, shaft, 16]} />
        <meshStandardMaterial {...BRASS} />
      </mesh>

      {/* collars breaking up the shaft */}
      {[-0.28, 0.06].map((t) => (
        <mesh key={t} position={[0, shaft * t, 0]} castShadow>
          <cylinderGeometry args={[length * 0.042, length * 0.042, length * 0.028, 16]} />
          <meshStandardMaterial {...BRASS} />
        </mesh>
      ))}

      {/* head: bulb, crown and the arms on top */}
      <mesh position={[0, shaft * 0.5 + length * 0.05, 0]} castShadow>
        <sphereGeometry args={[length * 0.062, 20, 14]} />
        <meshStandardMaterial {...BRASS} />
      </mesh>
      <mesh position={[0, shaft * 0.5 + length * 0.125, 0]} castShadow>
        <cylinderGeometry args={[length * 0.055, length * 0.038, length * 0.07, 16, 1, true]} />
        <meshStandardMaterial {...BRASS} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, shaft * 0.5 + length * 0.18, 0]} castShadow>
        <sphereGeometry args={[length * 0.03, 14, 10]} />
        <meshStandardMaterial {...BRASS} />
      </mesh>

      {/* tapered foot */}
      <mesh position={[0, -shaft * 0.5 - length * 0.06, 0]} castShadow>
        <coneGeometry args={[length * 0.032, length * 0.12, 16]} />
        <meshStandardMaterial {...BRASS} />
      </mesh>
    </group>
  );
}

// Directly below and in front of the dais: oak, with a baize inset top and the
// brass stanchions that cradle the mace.
function ClerksTable() {
  const height = 0.78;
  const depth = 0.8;
  const halfAngle = 0.26;
  const maceY = height + 0.115;

  return (
    <group>
      <CurvedDesk
        radius={CLERKS_R}
        halfAngle={halfAngle}
        height={height}
        depth={depth}
        lip={0.07}
        face={OAK}
        back={OAK_SHADE}
        top={OAK}
        segments={32}
      />

      {/* baize inset, sitting just proud of the oak surround */}
      <mesh position={[0, height + 0.013, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry
          args={[
            CLERKS_R - depth + 0.13,
            CLERKS_R - 0.13,
            32,
            1,
            -halfAngle * 0.86 - Math.PI / 2,
            halfAngle * 1.72,
          ]}
        />
        <meshStandardMaterial {...BAIZE_RED} side={THREE.DoubleSide} />
      </mesh>

      {/* the cradle: two stanchions with saddles, and the mace across them */}
      {[-1, 1].map((dir) => (
        <group key={dir} position={[dir * 0.34, 0, CLERKS_R - 0.06]}>
          <mesh position={[0, height + 0.055, 0]} castShadow>
            <cylinderGeometry args={[0.022, 0.03, 0.11, 12]} />
            <meshStandardMaterial {...BRASS} />
          </mesh>
          <mesh position={[0, height + 0.115, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <torusGeometry args={[0.036, 0.011, 8, 16, Math.PI]} />
            <meshStandardMaterial {...BRASS} />
          </mesh>
        </group>
      ))}

      <group position={[0, maceY, CLERKS_R - 0.06]}>
        <Mace />
      </group>
    </group>
  );
}

// D-plan: a curved wall wrapping the seating, closed at the dais end by the flat
// panelled elevation. The curved wall is drawn from the inside, so it is a
// single open-ended cylinder with its faces flipped rather than a solid.
function Shell() {
  return (
    <group>
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[WALL_R, WALL_SEGMENTS]} />
        <meshStandardMaterial {...CARPET_RED} />
      </mesh>

      <mesh position={[0, WALL_H / 2, 0]}>
        <cylinderGeometry args={[WALL_R, WALL_R, WALL_H, WALL_SEGMENTS, 1, true]} />
        <meshStandardMaterial {...OAK_PALE} side={THREE.BackSide} />
      </mesh>

      <mesh position={[0, WALL_H, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[WALL_R, WALL_SEGMENTS]} />
        <meshStandardMaterial {...CHARCOAL} side={THREE.DoubleSide} />
      </mesh>

      {/* a plain skirt around the base of the curved wall, so the carpet does
          not run straight into the panelling */}
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[WALL_R - 0.02, WALL_R - 0.02, 0.44, WALL_SEGMENTS, 1, true]} />
        <meshStandardMaterial {...OAK} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

export default function SenateChamber(props) {
  return (
    <group {...props}>
      <Shell />
      <ChamberTiers />
      <ChamberBenches />
      <DaisWall />
      <Dais />
      <ClerksTable />
    </group>
  );
}
