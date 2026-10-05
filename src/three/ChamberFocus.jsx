import { useMemo } from "react";

import { HEADREST_H, HEADREST_W, HEADREST_Y, HEADREST_Z, SeatPart } from "./ChamberBenches.jsx";
import { doors } from "./chamberDoors.js";
import { useChamber } from "./chamberContext.js";

// What the sitting sequence points at.
//
// Everything here reads the same seat generator the chairs do, so a place the
// sequence lights is by construction a place a member is actually sitting. That
// is the whole reason chamberPlan hands out seat positions as data instead of
// baking them into meshes — a highlight that had to guess where row three is
// would be wrong the first time ROWS changed.

// Tone-mapped, unlike most emissive markers. Left out of the tone mapper the
// glow does not read as brighter gold, it clips straight to white — a lit place
// stops looking like brass catching light and starts looking like a hole cut in
// the bench. Going through ACES keeps the colour and lets the near caps stay
// gold while the far ones still read.
const GLOW = {
  color: "#f4c65e",
  emissive: "#eda92c",
  emissiveIntensity: 2.4,
  roughness: 0.45,
  metalness: 0,
};

// Where a lit place has to be to be seen.
//
// The obvious marker is a ring of light on the carpet at a member's feet, and it
// is the wrong one: from every angle that shows this room as a room, the desk in
// front of them hides it. The division lit all 171 places and read as a faint
// scatter of gold behind the benches.
//
// So the marker is the headrest instead — the one part of a chair that stays
// legible from the far side of the chamber. Lighting a place means that pad
// glowing, at the same offsets ChamberBenches puts it, so a lit chair is the
// chair rather than something hovering near it.
function Places({ seats }) {
  const { SEAT_H } = useChamber().plan;

  return (
    <SeatPart seats={seats} dy={SEAT_H + HEADREST_Y} dz={HEADREST_Z + 0.01} tilt={-0.12}>
      <boxGeometry args={[HEADREST_W + 0.06, HEADREST_H + 0.05, 0.14]} />
      <meshStandardMaterial {...GLOW} />
    </SeatPart>
  );
}

const world = (seat) => [
  Math.sin(seat.angle) * seat.radius,
  seat.y,
  Math.cos(seat.angle) * seat.radius,
];

export default function ChamberFocus({ highlight }) {
  const { plan } = useChamber();
  const { seatPositions, speakingPlace } = plan;
  const place = useMemo(() => speakingPlace(), [speakingPlace]);
  const floor = useMemo(() => seatPositions(), [seatPositions]);
  // The doors sit in the elevation either side of the dais, in a different
  // place in each room, so the elevation is asked where it put them.
  const doorX = doors(plan).x;

  if (highlight === "member") {
    const [x, y, z] = world(place);
    return (
      <group>
        <Places seats={[place]} />
        {/* One place among a hundred and seventy needs the light as well as the
            marker: the cap says which chair, the light says look here. */}
        <pointLight position={[x, y + 1.5, z]} intensity={30} distance={5.5} color="#ffd88c" />
        <pointLight position={[x, y + 0.55, z]} intensity={9} distance={2.2} color="#ffc766" />
      </group>
    );
  }

  if (highlight === "division") return <Places seats={floor} />;

  if (highlight === "dais") {
    return <pointLight position={[0, 3.4, 4.4]} intensity={46} distance={11} color="#fff0d6" />;
  }

  if (highlight === "doors") {
    return (
      <group>
        {[-1, 1].map((dir) => (
          <pointLight
            key={dir}
            position={[dir * doorX, 2.4, 0.9]}
            intensity={26}
            distance={7}
            color="#e8f0ff"
          />
        ))}
      </group>
    );
  }

  return null;
}
