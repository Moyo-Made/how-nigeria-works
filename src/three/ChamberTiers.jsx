import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

import { useChamber } from "./chamberContext.js";

// The tiered floor of the chamber, generated from chamberPlan rather than placed.
//
// This is the part of the room we can least defend. Nobody has published how
// many rows either chamber has, how deep they run, or how wide the room is; the
// installed seat counts and the carpet areas are the only hard numbers, and both
// cover the galleries as well as the floor. So the tier is built as a function
// of its parameters and nothing here hard-codes a count. Change ROWS in a plan
// and the room changes with it — which is the honest shape for a guess, and the
// thing a hand-placed set of meshes could never be.
//
// What is sourced is how the gangways are built. Both rooms' stairs are
// photographed head-on in the contractor's gallery — the House's from the back
// looking down to the chair, the Senate's from the well looking up — and both
// show the same construction: carpeted treads at about twice the frequency of
// the rows, each with a brass nosing, the tier stepping down beside them in
// carpeted cheeks. So a gangway here is two steps per row, not a gap in the
// benches with the tier running through it.
// https://figueras.com/wp-content/uploads/2024/08/National-Assembly-Nigeria_EN.pdf
// (pp. 4 and 8)

const SEGMENTS = 64;
const NOSING = 0.045;

// Cylinder geometry puts theta 0 on +Z and sweeps toward +X, the convention
// every arc in the room is laid out in. Ring geometry measures from +X in its
// own plane, and laying it flat turns that into the same bearing less a quarter
// turn — the same conversion the desks make.
function riser(radius, from, to, y0, y1) {
  const geometry = new THREE.CylinderGeometry(radius, radius, y1 - y0, arcSegments(from, to), 1, true, from, to - from);
  return geometry.translate(0, (y0 + y1) / 2, 0);
}

function tread(inner, outer, from, to, y) {
  const geometry = new THREE.RingGeometry(inner, outer, arcSegments(from, to), 1, from - Math.PI / 2, to - from);
  return geometry.rotateX(-Math.PI / 2).translate(0, y, 0);
}

// Enough facets to hold a smooth arc whatever the span, without spending the
// full count on a gangway a metre wide.
const arcSegments = (from, to) => Math.max(2, Math.ceil(((to - from) / Math.PI) * SEGMENTS));

// The vertical face where the tier drops beside a gangway step, standing on a
// radius at a fixed bearing.
function cheek(bearing, inner, outer, y0, y1) {
  const geometry = new THREE.PlaneGeometry(outer - inner, y1 - y0);
  return geometry
    .rotateY(Math.PI / 2)
    .translate(0, (y0 + y1) / 2, (inner + outer) / 2)
    .rotateY(bearing);
}

// Everything the tier is made of, as one geometry per material. A gangway is a
// dozen small pieces per row, and eleven rows of five gangways drawn as
// separate meshes would be several hundred draw calls for the carpet.
function buildTier(plan) {
  const { HALF_FAN, ROW_PITCH, ROW_RISE, aisleBearings, aisleHalf, rows } = plan;
  const carpet = [];
  const shade = [];
  const brass = [];

  for (const row of rows()) {
    const { radius, y, treadInner, treadOuter } = row;
    const below = y - ROW_RISE;
    const half = aisleHalf(radius);

    // The bank itself: the stretches of this row's riser and tread that lie
    // between the gangways, cut at the same bearings the benches are cut at so
    // a desk never ends somewhere the tier does not.
    const edges = [-HALF_FAN, ...aisleBearings.flatMap((b) => [b - half, b + half]), HALF_FAN];
    for (let i = 0; i < edges.length; i += 2) {
      shade.push(riser(treadInner, edges[i], edges[i + 1], below, y));
      carpet.push(tread(treadInner, treadOuter, edges[i], edges[i + 1], y));
    }

    // Each gangway: a half-height step on the inner half of the tread, then the
    // tread itself, so a row is climbed in two rises rather than one.
    const mid = treadInner + ROW_PITCH / 2;
    const step = below + ROW_RISE / 2;
    for (const b of aisleBearings) {
      const [from, to] = [b - half, b + half];
      shade.push(riser(treadInner, from, to, below, step));
      carpet.push(tread(treadInner, mid, from, to, step));
      shade.push(riser(mid, from, to, step, y));
      carpet.push(tread(mid, treadOuter, from, to, y));

      brass.push(tread(treadInner, treadInner + NOSING, from, to, step + 0.004));
      brass.push(tread(mid, mid + NOSING, from, to, y + 0.004));

      shade.push(cheek(from, treadInner, mid, step, y));
      shade.push(cheek(to, treadInner, mid, step, y));
    }
  }

  // Behind the back row the tier does not drop back to the floor: it runs on at
  // that height to the walls, as the cross-aisle the top of each gangway lands
  // on (Figueras brochure p. 8, looking up the Senate's centre gangway to it).
  const last = rows().at(-1);
  const landing = new THREE.Shape();
  const STEPS = 96;
  for (let i = 0; i <= STEPS; i++) {
    const bearing = -HALF_FAN + (i / STEPS) * HALF_FAN * 2;
    const r = plan.wallDistance(bearing);
    landing[i ? "lineTo" : "moveTo"](Math.sin(bearing) * r, -Math.cos(bearing) * r);
  }
  for (let i = STEPS; i >= 0; i--) {
    const bearing = -HALF_FAN + (i / STEPS) * HALF_FAN * 2;
    landing.lineTo(Math.sin(bearing) * last.treadOuter, -Math.cos(bearing) * last.treadOuter);
  }
  landing.closePath();
  carpet.push(new THREE.ShapeGeometry(landing).rotateX(-Math.PI / 2).translate(0, last.y, 0).toNonIndexed());

  const merge = (parts) => {
    const merged = mergeGeometries(parts.map((part) => (part.index ? part.toNonIndexed() : part)));
    parts.forEach((part) => part.dispose());
    return merged;
  };

  return { carpet: merge(carpet), shade: merge(shade), brass: merge(brass) };
}

// The seating bank has to stop somewhere. Left open, each arc ends in a bare
// edge that reads as a fin floating off the side of the room; a real chamber
// returns the tier into a side wall. Stepped per row rather than one slab, so
// the return follows the rake instead of standing proud of the lower rows.
//
// A group rotated about Y puts the box's local +Z along the radius, which is the
// same convention the arcs are laid out in — no angle conversion needed.
function Return({ angle }) {
  const { plan, palette } = useChamber();
  const { RETURN_W, rows, wallDistance } = plan;
  const last = rows().at(-1);
  const wall = wallDistance(angle);

  return (
    <group rotation={[0, angle, 0]}>
      {/* the end of the cross-aisle behind the back row */}
      <mesh position={[0, last.y / 2, (last.treadOuter + wall) / 2]} receiveShadow castShadow>
        <boxGeometry args={[RETURN_W, last.y, wall - last.treadOuter]} />
        <meshStandardMaterial {...palette.carpetShade} />
      </mesh>
      {rows().map(({ index, y, treadInner, treadOuter }) => (
        <mesh
          key={index}
          position={[0, y / 2, (treadInner + treadOuter) / 2]}
          receiveShadow
          castShadow
        >
          <boxGeometry args={[RETURN_W, y, treadOuter - treadInner]} />
          <meshStandardMaterial {...palette.carpetShade} />
        </mesh>
      ))}
    </group>
  );
}

export default function ChamberTiers() {
  const { plan, palette } = useChamber();
  const { HALF_FAN } = plan;
  const tier = useMemo(() => buildTier(plan), [plan]);

  useEffect(
    () => () => Object.values(tier).forEach((geometry) => geometry.dispose()),
    [tier]
  );

  return (
    <group>
      <mesh geometry={tier.shade} receiveShadow castShadow>
        <meshStandardMaterial {...palette.carpetShade} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={tier.carpet} receiveShadow>
        <meshStandardMaterial {...palette.carpet} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={tier.brass}>
        <meshStandardMaterial {...palette.brass} side={THREE.DoubleSide} />
      </mesh>
      <Return angle={HALF_FAN} />
      <Return angle={-HALF_FAN} />
    </group>
  );
}
