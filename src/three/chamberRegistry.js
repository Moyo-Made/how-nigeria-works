import { lazy } from "react";

import { GREEN_CHAMBER, RED_CHAMBER } from "./materials.js";
import house from "./plans/house.js";
import senate from "./plans/senate.js";

// One entry per modelled interior: the plan that shapes the room, the palette
// that colours it, and the facts about it a camera needs in order to stand
// inside. Both chambers are the same component — see Chamber.jsx for why — so
// what distinguishes them is entirely here.
//
// Which chambers are built is stated once, in chambers.json, and this map
// follows it. Same split as institutions.json and registry.js: the data file
// carries the claim, the registry carries the geometry.

// lazy() must return the same component identity across renders, same as the
// specimen registry. Both rooms are that one component, so one wrapper serves.
const Chamber = lazy(() => import("./Chamber.jsx"));

// Three-quarter from the floor of the House. Dead-on holds the dais elevation
// nicely but flattens the rake to a set of faint rings, because looking straight
// down a tiered bank hides every riser behind the tread in front of it. Off-axis
// costs a little symmetry and buys the shape of the room.
const BEARING = [0.418, 0.358, 0.835];

// Everything below the plan is derived from it, so a room and the eye that looks
// at it can never be sized independently. The eye is placed along a bearing at
// nearly full reach rather than written down as a point: reach moves whenever
// the room does, and an eye left outside it is hauled in by the controls on the
// first frame, quietly framing the room tighter than intended.
function interior(plan, palette, look, ground) {
  const reach = plan.cameraReach(look);
  const maxPolar = plan.cameraMaxPolar(look, reach);

  return {
    plan,
    palette,
    Component: Chamber,
    eye: BEARING.map((c, i) => look[i] + c * reach * 0.98),
    look,
    fov: 58,
    reach,
    // Nearest the eye may get. Not a comfort setting: the target sits inside the
    // dais platform, so a closer orbit swings the camera through the presiding
    // chair at the wide end of the sweep and fills the screen with the inside of
    // its upholstery.
    minReach: plan.DAIS_R + 0.4,
    halfSweep: plan.cameraHalfSweep(look, reach, maxPolar),
    minPolar: plan.cameraMinPolar(look, reach),
    maxPolar,
    radius: plan.WALL_R,
    height: plan.WALL_H,
    // What the modelled room holds, floor and gallery apart, and the sum taken
    // from the plan rather than added up again at the point of display.
    floorSeats: plan.floorSeatEstimate(),
    gallerySeats: plan.gallerySeatEstimate(),
    seats: plan.seatEstimate(),
    ground,
  };
}

// The look-at point sits out in the seating rather than at the room's centre,
// and scales with the room: a chamber half again as wide is looked at from
// proportionally further into it.
const INTERIORS = {
  senate: interior(senate, RED_CHAMBER, [0, 1.5, 2.8], "#150b09"),
  house: interior(house, GREEN_CHAMBER, [0, 1.7, 3.9], "#0a1512"),
};

export function getInterior(id) {
  return INTERIORS[id] ?? null;
}

export const preloadInterior = (id) => (INTERIORS[id] ? import("./Chamber.jsx") : undefined);
