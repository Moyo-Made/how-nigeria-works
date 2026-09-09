import { createPlan } from "../chamberPlan.js";

// The House of Representatives — the Green Chamber.
//
// Not the Senate in green. The same 2022-24 renovation put 644 seats and about
// two thousand square metres of green carpet in here, against 312 seats and
// about a thousand next door, so this is roughly twice the room and needs a
// plan of its own. Figueras again is the only source, and again publishes
// nothing but those two numbers.
// https://figueras.com/project/national-assembly-of-nigeria/
//
// The two chambers are mirror-image halls of one design and their dais
// photography matches element for element, so the form below is the Senate's:
// a D-plan hemicycle, a tiered fan, a panelled elevation behind the chair, a
// balcony over the rear. Only the size differs, and everything about that size
// is derived.
//
// HOW THE SIZE WAS FOUND. Three things constrain it, and nothing else does:
//
//   - 360 members sit on this floor, so the floor must hold at least 360. The
//     Senate's does not have to clear a bar like this — 109 senators in a room
//     fitted with 312 seats leaves plenty of slack — and it is the single
//     firmest constraint either chamber has.
//   - 644 seats were installed across floor and galleries together.
//   - the back row needs the same 1.4 m to the wall the Senate's has, or the
//     balcony has nothing to stand on.
//
// Those give 412 on the floor and 224 in the gallery: 636 against the 644
// installed, 1.2 per cent out. The wall radius that falls out is 2.24 times the
// Senate's in area against a carpet ratio of 2, which is close enough to be
// worth stating and not close enough to be evidence — the carpet figure covers
// circulation and galleries too, so it caps a room rather than measuring one.
//
// UNVERIFIED, all of it, exactly as next door.
export default createPlan({
  // Wider than the Senate's 150. A chamber holding three times the members over
  // eleven rows has to open out or the back row ends up absurdly long.
  fanDegrees: 165,

  DAIS_R: 3.1,
  CLERKS_R: 5.8,
  WELL_R: 6.2,

  ROW_0: 6.6,
  // Unchanged from the Senate, and deliberately: a desk, a member and the
  // squeeze past them are the same size in either chamber. Nothing about this
  // room being bigger makes its rows deeper.
  ROW_PITCH: 1.05,
  ROWS: 11,
  SEAT_PITCH: 0.74,
  ROW_RISE: 0.34,

  WALL_R: 19.15,
  WALL_H: 12.6,
  DAIS_WALL_Z: -0.6,
  DAIS_LIFT: 0.9,

  BENCH_H: 0.75,
  BENCH_DEPTH: 0.42,
  BENCH_LIP: 0.08,
  SEAT_H: 0.45,
  RETURN_W: 0.26,

  // Four gangways rather than the Senate's two, dividing the fan into five
  // blocks. Scaling the aisle count with the room is what keeps the walk to one
  // at six places on the back row — the same as next door, in a chamber with
  // nearly three times the floor seats. Five blocks also keeps the centre line
  // clear, so the middle block stays square to the chair.
  AISLE_W: 1.1,
  AISLES: 4,

  // The last gallery tread lands on the wall, which is what fixes the front
  // edge once the row count and pitch are chosen.
  GALLERY_FRONT: 16.75,
  // Higher than the Senate's, and for the same reason it is high there at all:
  // the balcony soffit is a ceiling on how far back the eye can stand under it,
  // and this room is wide enough that the eye needs to stand a long way back.
  GALLERY_RISE: 8.0,
  GALLERY_SLAB: 0.4,
  GALLERY_ROWS: 3,
  GALLERY_PITCH: 0.8,
  GALLERY_STEP: 0.42,
  GALLERY_PARAPET: 0.85,
});
