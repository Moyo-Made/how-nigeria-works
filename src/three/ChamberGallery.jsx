import { useMemo } from "react";
import * as THREE from "three";

import { BAIZE_RED, BRASS, CARPET_RED, CARPET_SHADE, CHARCOAL, OAK, OAK_SHADE } from "./materials.js";
import { SeatPart } from "./ChamberBenches.jsx";
import {
  GALLERY_FAN,
  GALLERY_FRONT,
  GALLERY_PARAPET,
  GALLERY_RISE,
  GALLERY_SLAB,
  GALLERY_STEP,
  SEAT_PITCH,
  galleryRows,
  gallerySeatPositions,
} from "./chamberPlan.js";

// The public gallery: a balcony over the rear of the seating, and the reason the
// room now has a back.
//
// It is generated from chamberPlan for the same reason the floor is — every
// number in it is derived, and a derived room is only honest if changing the
// derivation changes the room. See the note there for what little constrains it.
//
// The one thing worth saying here rather than there: this is the piece that
// closes the chamber. Before it, the model stopped at the back bench and the
// 180 degrees beyond was bare carpet, which is what made the room read as
// unfinished from any angle but the front.

const SEGMENTS = 72;
const HALF = GALLERY_FAN / 2;

// Ring geometry measures its angle from +X where cylinder geometry measures from
// +Z — the same quarter turn every arc in this room deals with.
const RING_OFFSET = -HALF - Math.PI / 2;

const SEAT_W = SEAT_PITCH * 0.74;
const SOFFIT = GALLERY_RISE - GALLERY_SLAB;

// A band of wall, drawn from whichever side it is meant to be read from.
function Band({ radius, from, to, material, side = THREE.DoubleSide, segments = SEGMENTS }) {
  return (
    <mesh position={[0, (from + to) / 2, 0]} receiveShadow castShadow>
      <cylinderGeometry args={[radius, radius, to - from, segments, 1, true, -HALF, GALLERY_FAN]} />
      <meshStandardMaterial {...material} side={side} />
    </mesh>
  );
}

function Ring({ inner, outer, y, material, flip = false }) {
  return (
    <mesh position={[0, y, 0]} rotation={[flip ? Math.PI / 2 : -Math.PI / 2, 0, 0]} receiveShadow>
      <ringGeometry args={[inner, outer, SEGMENTS, 1, RING_OFFSET, GALLERY_FAN]} />
      <meshStandardMaterial {...material} side={THREE.DoubleSide} />
    </mesh>
  );
}

// What the balcony looks like from underneath, which — given the eye is fenced
// to the floor of the House — is most of what anyone sees of it. A lit soffit
// and a deep fascia, rather than the bare edge of a slab.
function Structure() {
  const back = galleryRows().at(-1).treadOuter;

  return (
    <group>
      <Band radius={GALLERY_FRONT} from={SOFFIT} to={GALLERY_RISE} material={OAK_SHADE} />
      <Ring inner={GALLERY_FRONT} outer={back} y={SOFFIT} material={CHARCOAL} flip />

      {/* A brass reveal along the bottom of the fascia. It is the only thing at
          this height catching the light off the floor, and without it the
          balcony reads as a shadow with no edge. */}
      <mesh position={[0, SOFFIT + 0.06, 0]}>
        <cylinderGeometry args={[GALLERY_FRONT + 0.03, GALLERY_FRONT + 0.03, 0.05, SEGMENTS, 1, true, -HALF, GALLERY_FAN]} />
        <meshStandardMaterial {...BRASS} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// Same construction as the floor tiers: a riser and a tread per row, stepped so
// the rake reads as steps under even light rather than flattening into one field.
function Tiers() {
  return (
    <group>
      {galleryRows().map(({ index, y, treadInner, treadOuter }) => (
        <group key={index}>
          {/* The front row has no riser of its own: its face is the balcony
              fascia, which stands at exactly this radius over exactly this
              height. Drawing both put two cylinders in the same place and the
              seam between them tore. */}
          {index > 0 && (
            <mesh position={[0, y - GALLERY_STEP / 2, 0]} receiveShadow castShadow>
              <cylinderGeometry
                args={[treadInner, treadInner, GALLERY_STEP, SEGMENTS, 1, true, -HALF, GALLERY_FAN]}
              />
              <meshStandardMaterial {...CARPET_SHADE} side={THREE.DoubleSide} />
            </mesh>
          )}
          <Ring inner={treadInner} outer={treadOuter} y={y} material={CARPET_RED} />
        </group>
      ))}
    </group>
  );
}

// The parapet. Its height is the constraint that fixes the gallery's own rake:
// low enough to see the floor over from the front row, high enough to lean on.
function Parapet() {
  const top = GALLERY_RISE + GALLERY_PARAPET;

  return (
    <group>
      <Band radius={GALLERY_FRONT} from={GALLERY_RISE} to={top} material={OAK} />
      {/* The coping has to be open-ended. A closed cylinder caps its ends, and
          on a 178-degree arc at this radius those caps are pie slices struck
          from the room's own axis — a solid lid across half the chamber at
          eye-height-plus-four. Harmless on a full cylinder, which is why the
          dais platform above can close and this cannot. */}
      <mesh position={[0, top + 0.03, 0]} receiveShadow castShadow>
        <cylinderGeometry
          args={[GALLERY_FRONT + 0.06, GALLERY_FRONT + 0.06, 0.07, SEGMENTS, 1, true, -HALF, GALLERY_FAN]}
        />
        <meshStandardMaterial {...OAK_SHADE} side={THREE.DoubleSide} />
      </mesh>
      {/* the flat of the rail, which the open band no longer provides */}
      <Ring inner={GALLERY_FRONT} outer={GALLERY_FRONT + 0.06} y={top + 0.065} material={OAK_SHADE} />
    </group>
  );
}

// Gallery seats are seats and nothing else — no desk, no microphone, no place to
// put a paper. The people up here are watching, not sitting.
function Seats() {
  const seats = useMemo(() => gallerySeatPositions(), []);

  return (
    <group>
      <SeatPart seats={seats} dy={0.2} dz={0}>
        <boxGeometry args={[SEAT_W * 0.5, 0.4, 0.1]} />
        <meshStandardMaterial {...CHARCOAL} />
      </SeatPart>

      <SeatPart seats={seats} dy={0.44} dz={0}>
        <boxGeometry args={[SEAT_W, 0.09, 0.4]} />
        <meshStandardMaterial {...BAIZE_RED} />
      </SeatPart>

      <SeatPart seats={seats} dy={0.72} dz={-0.16} tilt={-0.08}>
        <boxGeometry args={[SEAT_W, 0.48, 0.08]} />
        <meshStandardMaterial {...BAIZE_RED} />
      </SeatPart>
    </group>
  );
}

export default function ChamberGallery() {
  return (
    <group>
      <Structure />
      <Tiers />
      <Parapet />
      <Seats />
    </group>
  );
}
