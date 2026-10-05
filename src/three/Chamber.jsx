import * as THREE from "three";

import ChamberTiers from "./ChamberTiers.jsx";
import ChamberBenches from "./ChamberBenches.jsx";
import ChamberDais from "./ChamberDais.jsx";
import ChamberElevation from "./ChamberElevation.jsx";
import ChamberFocus from "./ChamberFocus.jsx";
import ChamberGallery from "./ChamberGallery.jsx";
import ChamberSideWalls from "./ChamberSideWalls.jsx";
import { useChamber } from "./chamberContext.js";

// A chamber of the National Assembly. One component draws either of them.
//
// The case for one component is what the contractor's photographs of the two
// renovated rooms show when set side by side: the same chairs, the same curved
// oak desks, the same dais furniture piece for piece — clerks' table, mace
// cradle, the two baize parapets stepping down from the chair
// (ChamberDais.jsx) — and the same timbers and backlit panels on the walls. Those are drawn once, sized by each
// room's plan and coloured by its palette.
// https://figueras.com/project/national-assembly-of-nigeria/
//
// What the photographs do not show is two copies of one room. The wall behind
// the chair is a different composition in each, so each has its own elevation
// (ChamberElevation.jsx), chosen by the plan. An earlier version of this file
// said the two dais walls matched element for element and drew the Senate's
// from the House's photographs; they do not, and it no longer does.
//
// The chamber the app models is the one rebuilt in 2024, not the one in most
// photographs of it. The old concrete tier was demolished outright and the
// seats, desks, carpet and acoustic walls all replaced, so anything shot before
// April 2024 is a different room.

const WALL_SEGMENTS = 96;

// Three.js puts cylinder theta 0 on +Z and sweeps toward +X, which is the
// convention the whole room is laid out in: the dais wall is at -Z, the seating
// fans toward +Z, and every arc of the seating shares a centre on the wall.

// The shell: a wide flat wall behind the chair (ChamberElevation.jsx draws what
// stands on it), a wall down each side and two across the rear. The plan says
// where they are; see the note on the walls in chamberPlan.
//
// Timber to the band line and white plaster above it, under a white ceiling:
// every photograph of either renovated room shows that, and none shows the dark
// ceiling this used to have. The plaster carries a row of dark square grilles
// part-way up, on every wall of both rooms.
const GRILLE = 0.55;
const GRILLE_PITCH = 2.6;

function Grilles({ length, skip = 0 }) {
  const { plan, palette } = useChamber();
  const { BAND_Y, WALL_H } = plan;
  const count = Math.floor(length / GRILLE_PITCH);

  return Array.from({ length: count }, (_, i) => -length / 2 + (i + 0.5) * (length / count))
    .filter((x) => Math.abs(x) >= skip)
    .map((x) => (
      <mesh key={x} position={[x, BAND_Y + (WALL_H - BAND_Y) * 0.55, 0.02]}>
        <boxGeometry args={[GRILLE, GRILLE, 0.03]} />
        <meshStandardMaterial {...palette.screen} />
      </mesh>
    ));
}

// What the ceiling carries, which differs between the rooms; see CEILING in
// each plan. Both are lit surfaces, not lamps: the light in the room comes from
// ChamberRig, and these are what it would be coming out of.
const LIT = { color: "#f6f8fb", emissive: "#ffffff", emissiveIntensity: 0.9, roughness: 0.9 };

function Ceiling() {
  const { CEILING, WALL_H, WALL_R } = useChamber().plan;

  if (CEILING === "lantern") {
    return (
      <mesh position={[0, WALL_H - 0.04, WALL_R * 0.45]} rotation={[Math.PI / 2, 0, Math.PI / 8]}>
        <circleGeometry args={[WALL_R * 0.4, 8]} />
        <meshStandardMaterial {...LIT} side={THREE.DoubleSide} />
      </mesh>
    );
  }

  if (CEILING === "panels") {
    const pitch = 5.5;
    const reach = Math.floor(WALL_R / pitch);
    const spots = [];
    for (let i = -reach; i <= reach; i++) {
      for (let j = 0; j <= reach; j++) {
        const x = i * pitch;
        const z = (j + 0.5) * pitch;
        if (Math.hypot(x, z) < WALL_R - 2) spots.push([x, z]);
      }
    }
    return spots.map(([x, z]) => (
      <mesh key={`${x}:${z}`} position={[x, WALL_H - 0.03, z]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.2, 1.2]} />
        <meshStandardMaterial {...LIT} side={THREE.DoubleSide} />
      </mesh>
    ));
  }

  return null;
}

function Shell() {
  const { plan, palette } = useChamber();
  const { BACK_WALL_HALF, BAND_Y, DAIS_WALL_Z, FAR, WALL_H, walls } = plan;

  return (
    <group>
      {/* The floor and the ceiling are discs wide enough to reach every corner.
          What lies outside the walls is never seen from inside them. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[FAR + 1, WALL_SEGMENTS]} />
        <meshStandardMaterial {...palette.carpet} />
      </mesh>
      <mesh position={[0, WALL_H, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[FAR + 1, WALL_SEGMENTS]} />
        <meshStandardMaterial {...palette.plaster} side={THREE.DoubleSide} />
      </mesh>

      <Ceiling />

      {walls().map((wall) => (
        <group
          key={`${wall.kind}${wall.dir}`}
          position={[wall.mid[0], 0, wall.mid[1]]}
          rotation={[0, wall.bearing + Math.PI, 0]}
        >
          <mesh position={[0, BAND_Y / 2, 0]} receiveShadow>
            <planeGeometry args={[wall.length, BAND_Y]} />
            <meshStandardMaterial {...palette.oakPale} />
          </mesh>
          <mesh position={[0, (BAND_Y + WALL_H) / 2, 0]} receiveShadow>
            <planeGeometry args={[wall.length, WALL_H - BAND_Y]} />
            <meshStandardMaterial {...palette.plaster} />
          </mesh>
          {/* a plain skirt along the foot of the wall, so the carpet does not
              run straight into the panelling */}
          <mesh position={[0, 0.22, 0.16]}>
            <boxGeometry args={[wall.length, 0.44, 0.04]} />
            <meshStandardMaterial {...palette.oak} />
          </mesh>
          <Grilles length={wall.length} />
        </group>
      ))}

      {/* the grilles on the wall behind the chair, clear of whatever stands in
          the middle of it */}
      <group position={[0, 0, DAIS_WALL_Z]}>
        <Grilles length={BACK_WALL_HALF * 2} skip={BAND_Y * 1.2} />
      </group>
    </group>
  );
}

export default function Chamber({ highlight = null, ...props }) {
  return (
    <group {...props}>
      <Shell />
      <ChamberSideWalls />
      <ChamberTiers />
      <ChamberGallery />
      <ChamberBenches />
      <ChamberElevation />
      <ChamberDais maceLit={highlight === "mace"} />
      <ChamberFocus highlight={highlight} />
    </group>
  );
}
