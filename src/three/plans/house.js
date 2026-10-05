import { createPlan } from "../chamberPlan.js";

// The House of Representatives — the Green Chamber.
//
// Not the Senate in green. The same 2022-24 renovation put 644 seats and about
// two thousand square metres of green carpet in here, against 312 seats and
// about a thousand next door, so this is roughly twice the room and needs a
// plan of its own. Figueras, the contractor, is the only source for those
// numbers, and publishes no dimension of the room.
// https://figueras.com/project/national-assembly-of-nigeria/
//
// What its photographs do show, set side by side with the Senate's: the same
// fittings — chairs, curved oak desks, the dais furniture piece for piece,
// fluted acoustic timber, backlit printed panels — in a room that is not the
// same room. The wall behind the chair is a different composition (see
// Chamber.jsx), and the House's side walls carry things the Senate's do not.
// So the plan below borrows the Senate's form only where the photographs agree
// with it: a tiered fan concentric on the chair, a centre gangway, a panelled
// elevation behind the dais, a gallery. Everything about its size is derived.
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
// Three things have since been put in, and each moved the count. The centre
// gangway the photographs show takes a seat and a half out of every row. The
// well in front of the clerks' table is a broad apron of carpet, not the 0.4 m
// it was drawn at. And the manufacturer's own drawing of the chair gives the
// spacing it needs — 95 cm between centres, 1.7 m from one desk to the next —
// which is far more room than was first allowed. At those figures the floor
// holds 426, clear of 360, and the room 652 against the 644 installed. It also
// comes out at roughly twice the Senate's floor, which is what the carpet
// figures say.
//
// UNVERIFIED, all of it, exactly as next door.
export default createPlan({
  // Which wall stands behind the chair. Not the Senate's — see the elevations
  // in Chamber.jsx.
  elevation: "house",

  // Wider than the Senate's 120: the press photographs from this room's
  // gallery show the bank wrapping well round the dais, the end seats of the
  // long rows facing across the room rather than down it.
  // https://dailytrust.com/wp-content/uploads/2024/10/house-of-reps.webp
  fanDegrees: 150,

  // The walls, as next door and on the same footing.
  sideDegrees: 70,
  rearDegrees: 20,

  DAIS_R: 3.1,
  CLERKS_R: 5.8,
  // Two metres and a bit of open carpet in front of the table, as next door
  // and on the same footing: photographed, not measurable.
  WELL_R: 8.2,

  ROW_0: 8.85,
  // The Senate's, and deliberately: it is the manufacturer's figure for the
  // one chair and desk both rooms were fitted with.
  ROW_PITCH: 1.7,
  ROWS: 11,
  SEAT_PITCH: 0.95,
  ROW_RISE: 0.34,

  WALL_R: 28.2,
  WALL_H: 12.6,
  DAIS_WALL_Z: -0.6,
  DAIS_LIFT: 0.9,

  BENCH_H: 0.75,
  BENCH_DEPTH: 0.6,
  BENCH_LIP: 0.08,
  SEAT_H: 0.45,
  RETURN_W: 0.26,

  // Five gangways, one of them on the centre line. That one is photographed
  // head-on: a carpeted stair with brass nosings running from the back of the
  // bank straight down to the clerks' table (Figueras brochure, p. 4). Side
  // gangways show in the wide shot (gallery image g03) but cannot be counted
  // from it, so the other four are placed evenly either side — scaling with the
  // room, which is what keeps the walk to one within six places on the back row
  // in a chamber with nearly three times the Senate's floor seats.
  AISLE_W: 1.1,
  AISLES: 5,

  // Three rows on the balcony, against the Senate's two: 226 seats, which with
  // the floor's 426 is 652 against the 644 installed.
  // Higher than the Senate's, and for the same reason it is high there at all:
  // the balcony soffit is a ceiling on how far back the eye can stand under it,
  // and this room is wide enough that the eye needs to stand a long way back.
  GALLERY_RISE: 8.0,
  GALLERY_SLAB: 0.4,
  GALLERY_ROWS: 3,
  // What the ceiling carries: one large luminous panel over the middle of the
  // room, many-sided, bright enough to burn out in every photograph that looks
  // up at it (gallery image g03; the press photographs from the gallery).
  CEILING: "lantern",
  // Columns under each run of the balcony (gallery image g04).
  GALLERY_COLUMNS: 3,
  GALLERY_PITCH: 1.0,
  GALLERY_SEAT_PITCH: 0.6,
  GALLERY_STEP: 0.42,
  GALLERY_PARAPET: 0.85,
});
