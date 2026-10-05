import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

import { Chairs } from "./ChamberBenches.jsx";
import { useChamber } from "./chamberContext.js";

// The public gallery: a balcony over the rear of the seating, and the reason the
// room has a back.
//
// It is generated from chamberPlan for the same reason the floor is — every
// number in it is derived, and a derived room is only honest if changing the
// derivation changes the room. See the note there for what little constrains it.
//
// Over the rear only, and straight. It was first drawn as a curve most of the
// way round the room; every photograph of either chamber has it against the two
// rear walls, its front two straight runs parallel to them, a timber fascia with
// a glass balustrade standing on it rather than a solid parapet (Figueras
// brochure pp. 3 and 8, gallery images g03 and g04, and the press photographs
// cited in chamberPlan).

// Something standing on one run of the balcony: a group whose +X runs along it
// and whose +Z faces the chair across the room.
function OnRun({ run, children }) {
  return (
    <group position={[run.mid[0], 0, run.mid[1]]} rotation={[0, run.bearing + Math.PI, 0]}>
      {children}
    </group>
  );
}

// A flat panel the length of each run of the balcony's front.
function Front({ from, to, material, out = 0, thickness = 0 }) {
  const { galleryFront } = useChamber().plan;

  return galleryFront().map((run) => (
    <OnRun key={run.bearing} run={run}>
      <mesh position={[0, (from + to) / 2, out]} receiveShadow castShadow>
        {thickness ? (
          <boxGeometry args={[run.length, to - from, thickness]} />
        ) : (
          <planeGeometry args={[run.length, to - from]} />
        )}
        <meshStandardMaterial {...material} side={THREE.DoubleSide} />
      </mesh>
    </OnRun>
  ));
}

const quad = (a, b, c, d) => {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute([...a, ...b, ...c, ...a, ...c, ...d], 3));
  geometry.computeVertexNormals();
  return geometry;
};

const merge = (parts) => {
  const merged = mergeGeometries(parts);
  parts.forEach((part) => part.dispose());
  return merged;
};

// The balcony's floor: a tread per row and a riser between them, the same
// construction as the tiers below, and the soffit under all of it.
function buildDeck(plan) {
  const { GALLERY_RISE, GALLERY_SLAB, GALLERY_STEP, galleryRows } = plan;
  const soffitY = GALLERY_RISE - GALLERY_SLAB;
  const at = ([x, z], y) => [x, y, z];
  const treads = [];
  const risers = [];
  const soffit = [];
  const rows = galleryRows();

  for (const row of rows) {
    for (const { front, back } of row.runs) {
      treads.push(quad(at(front.a, row.y), at(front.b, row.y), at(back.b, row.y), at(back.a, row.y)));
      if (row.index > 0) {
        risers.push(
          quad(
            at(front.a, row.y - GALLERY_STEP),
            at(front.b, row.y - GALLERY_STEP),
            at(front.b, row.y),
            at(front.a, row.y)
          )
        );
      }
    }
  }

  // From the front edge to the wall, in one piece each side of the centre.
  rows[0].runs.forEach(({ front }, i) => {
    const { back } = rows.at(-1).runs[i];
    soffit.push(quad(at(front.a, soffitY), at(front.b, soffitY), at(back.b, soffitY), at(back.a, soffitY)));
  });

  return { treads: merge(treads), risers: risers.length ? merge(risers) : null, soffit: merge(soffit) };
}

// What the balcony looks like from underneath, which — given the eye is fenced
// to the floor of the House — is most of what anyone sees of it. A soffit and a
// deep fascia, rather than the bare edge of a slab.
function Structure() {
  const { plan, palette } = useChamber();
  const { FASCIA_TOP, GALLERY_RISE, GALLERY_SLAB } = plan;
  const SOFFIT = GALLERY_RISE - GALLERY_SLAB;
  const deck = useMemo(() => buildDeck(plan), [plan]);

  useEffect(() => () => Object.values(deck).forEach((geometry) => geometry?.dispose()), [deck]);

  return (
    <group>
      {/* the fascia, carried above the balcony floor as the upstand the glass
          stands on */}
      <Front from={SOFFIT} to={FASCIA_TOP} material={palette.oak} />

      <mesh geometry={deck.soffit} receiveShadow>
        <meshStandardMaterial {...palette.plaster} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={deck.treads} receiveShadow>
        <meshStandardMaterial {...palette.carpet} side={THREE.DoubleSide} />
      </mesh>
      {deck.risers && (
        <mesh geometry={deck.risers} receiveShadow>
          <meshStandardMaterial {...palette.carpetShade} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* A brass reveal along the bottom of the fascia. It is the only thing at
          this height catching the light off the floor, and without it the
          balcony reads as a shadow with no edge. */}
      <Front from={SOFFIT + 0.035} to={SOFFIT + 0.085} material={palette.brass} out={0.02} thickness={0.03} />
    </group>
  );
}

// The balustrade. Its height is the constraint that fixes the gallery's own
// rake: low enough to see the floor over from the front row, high enough to lean
// on. Glass under a rail, standing on the fascia's upstand.
function Balustrade() {
  const { plan, palette } = useChamber();
  const { FASCIA_TOP, GALLERY_RISE, GALLERY_PARAPET } = plan;
  const top = GALLERY_RISE + GALLERY_PARAPET;

  return (
    <group>
      <Front from={FASCIA_TOP} to={top} material={palette.glass} />
      <Front from={top} to={top + 0.06} material={palette.charcoal} thickness={0.08} />
    </group>
  );
}

// The Senate's balcony stands behind the wall of the room rather than in front
// of it: piers on its front edge, a lintel across them, the room's plaster above
// that to the ceiling, and a ceiling of its own at the lintel. A plan that has
// one says how tall the opening is and how far apart the piers stand.
function Loggia() {
  const { plan, palette } = useChamber();
  const { GALLERY_LOGGIA, GALLERY_RISE, GALLERY_SLAB, WALL_H, galleryFront } = plan;
  const deck = useMemo(() => (GALLERY_LOGGIA ? buildDeck(plan) : null), [GALLERY_LOGGIA, plan]);

  useEffect(() => () => deck && Object.values(deck).forEach((geometry) => geometry?.dispose()), [deck]);

  if (!GALLERY_LOGGIA) return null;

  const { height, bay } = GALLERY_LOGGIA;
  const lintel = GALLERY_RISE + height;

  return (
    <group>
      {galleryFront().map((run) => {
        const bays = Math.max(1, Math.round(run.length / bay));
        return (
          <OnRun key={run.bearing} run={run}>
            <mesh position={[0, (lintel + WALL_H) / 2, -0.15]} receiveShadow>
              <boxGeometry args={[run.length, WALL_H - lintel, 0.3]} />
              <meshStandardMaterial {...palette.plaster} />
            </mesh>
            {Array.from({ length: bays + 1 }, (_, i) => (
              <mesh key={i} position={[-run.length / 2 + (i * run.length) / bays, GALLERY_RISE + height / 2, -0.2]} castShadow>
                <boxGeometry args={[0.45, height, 0.45]} />
                <meshStandardMaterial {...palette.plaster} />
              </mesh>
            ))}
          </OnRun>
        );
      })}

      {/* its ceiling: the soffit's own outline, lifted to the lintel */}
      <mesh geometry={deck.soffit} position={[0, lintel - (GALLERY_RISE - GALLERY_SLAB), 0]}>
        <meshStandardMaterial {...palette.plaster} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// The columns that carry the House's balcony: square, in the cherry of the
// piers, each with a lit sconce on the face toward the room (gallery image g04
// and the press photographs from that room's gallery). Nothing of the kind
// shows under the Senate's, so a plan says how many it has. They stand on the
// cross-aisle behind the back row.
function Columns() {
  const { plan, palette } = useChamber();
  const { GALLERY_COLUMNS = 0, GALLERY_RISE, GALLERY_SLAB, ROWS, ROW_RISE, galleryRows, onRun } = plan;
  if (!GALLERY_COLUMNS) return null;

  const foot = ROWS * ROW_RISE;
  const top = GALLERY_RISE - GALLERY_SLAB;

  return galleryRows()[0].runs.flatMap(({ back }) =>
    Array.from({ length: GALLERY_COLUMNS }, (_, i) => {
      const { position, turn } = onRun(back, (i + 0.6) / GALLERY_COLUMNS);
      return (
        <group key={`${back.bearing}${i}`} position={[position[0], 0, position[1]]} rotation={[0, turn, 0]}>
          <mesh position={[0, (foot + top) / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.75, top - foot, 0.75]} />
            <meshStandardMaterial {...palette.cherry} />
          </mesh>
          <mesh position={[0, foot + 2.1, 0.39]}>
            <boxGeometry args={[0.16, 0.7, 0.04]} />
            <meshStandardMaterial color="#ffe2a8" emissive="#ffc766" emissiveIntensity={1.6} />
          </mesh>
        </group>
      );
    })
  );
}

// Gallery seats are seats and nothing else — no desk, no microphone, no place to
// put a paper. The people up here are watching, not sitting. They are the same
// chair as the floor's, fixed.
function Seats() {
  const { gallerySeatPositions } = useChamber().plan;
  const seats = useMemo(() => gallerySeatPositions(), [gallerySeatPositions]);
  return <Chairs seats={seats} />;
}

export default function ChamberGallery() {
  return (
    <group>
      <Structure />
      <Balustrade />
      <Loggia />
      <Columns />
      <Seats />
    </group>
  );
}
