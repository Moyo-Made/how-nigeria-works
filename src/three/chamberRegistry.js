import { lazy } from "react";

import {
  WALL_H,
  WALL_R,
  cameraHalfSweep,
  cameraMaxPolar,
  cameraReach,
  floorSeatEstimate,
  gallerySeatEstimate,
  seatEstimate,
} from "./chamberPlan.js";

const LOOK = [0, 1.5, 2.8];
const REACH = cameraReach(LOOK);
const MAX_POLAR = cameraMaxPolar(LOOK, REACH);

// Three-quarter from the floor of the House. Dead-on holds the dais elevation
// nicely but flattens the rake to a set of faint rings, because looking straight
// down a tiered bank hides every riser behind the tread in front of it.
const BEARING = [0.418, 0.358, 0.835];
const eyeAt = (look, reach) => BEARING.map((c, i) => look[i] + c * reach * 0.98);

// One entry per modelled interior: the geometry chunk, and the facts about the
// room a camera needs in order to stand inside it.
//
// The camera and the extents live here rather than in ChamberView because they
// are properties of the room, not of the viewer. The Green Chamber is about
// twice the Senate's floor area and will want its own eye, its own clamp and its
// own plan module; ChamberView should not have to know which room it is showing
// in order to frame it.
//
// Which chambers are *built* is stated once, in chambers.json, and this map
// follows it. Same split as institutions.json and registry.js: the data file
// carries the claim, the registry carries the geometry.
const INTERIORS = {
  senate: {
    load: () => import("./SenateChamber.jsx"),
    // Placed along a bearing at nearly full reach rather than written down as a
    // point. Reach moves whenever the room does, and an eye left behind outside
    // it is simply hauled in by the controls on the first frame — quietly
    // framing the room tighter than intended, with nothing to say it had.
    eye: eyeAt(LOOK, REACH),
    fov: 58,
    look: LOOK,
    // The fence, all of it derived in chamberPlan from the room's own numbers.
    // Nothing here is a tuned angle.
    reach: REACH,
    halfSweep: cameraHalfSweep(LOOK, REACH, MAX_POLAR),
    maxPolar: MAX_POLAR,
    // Nearest the eye may get. Not a comfort setting: the target sits inside the
    // dais platform, so a closer orbit swings the camera through the presiding
    // chair at the wide end of the sweep and fills the screen with the inside of
    // its upholstery.
    minReach: 3,
    radius: WALL_R,
    height: WALL_H,
    // What the modelled room actually holds, floor and gallery apart. Printed
    // beside the 312 it was fitted with, as the cross-check chamberPlan asks
    // for — not as a claim about how the real chamber divides between the two.
    floorSeats: floorSeatEstimate(),
    gallerySeats: gallerySeatEstimate(),
    // The sum, taken from the plan rather than added up again at the point of
    // display. It is the one number in this app that says whether the room is
    // the right size, and a caption that recomputed it could quietly disagree
    // with the room it is captioning.
    seats: seatEstimate(),
    ground: "#150b09",
  },
};

// lazy() must return the same component identity across renders, same as the
// specimen registry.
const wrapped = new Map();

export function getInterior(id) {
  const entry = INTERIORS[id];
  if (!entry) return null;
  if (!wrapped.has(id)) wrapped.set(id, lazy(entry.load));
  return { ...entry, Component: wrapped.get(id) };
}

export const preloadInterior = (id) => INTERIORS[id]?.load();
