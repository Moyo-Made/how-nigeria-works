import { createPlan } from "../chamberPlan.js";

// The Senate chamber — the Red Chamber.
//
// The chamber modelled is the one rebuilt in 2024, not the one in most
// photographs of it. The concrete tier was demolished outright and the seats,
// desks, carpet and acoustic walls all replaced, so anything shot before April
// 2024 is a different room. Senators returned to it on 30 April 2024.
//
// PROVENANCE. Two numbers about this room are published, both by Figueras, the
// seating contractor for the 2022-24 renovation: 312 seats installed, and nearly
// a thousand square metres of red carpet.
// https://figueras.com/project/national-assembly-of-nigeria/
//
// Nothing else is. No floor plan, no dimension, no row count and no gallery
// split has ever been released. Every number below is therefore derived, not
// sourced, and is to be treated as such wherever it is surfaced to a reader.
// They were chosen so that the one hard count falls out at a believable seat
// pitch and so the fan matches the proportions visible in wide interior
// photography. They are working values.
//
// UNVERIFIED, all of it: ROWS, ROW_PITCH, SEAT_PITCH and every radius here.
export default createPlan({
  // Wide interior photography reads as appreciably more than a half-circle.
  fanDegrees: 150,

  DAIS_R: 2.6, // presiding desk
  // Far enough out to clear the dais steps, close enough to still sit under the
  // chair — the table has to read as belonging to the dais, not to the floor.
  CLERKS_R: 4.9,
  WELL_R: 5.2, // clear floor in front of the first bench

  ROW_0: 5.6, // first bench arc
  // The shakiest number here. All of a desk, a member in a chair behind it, and
  // whatever is left to squeeze past has to fit inside it; at 1.05 m there is
  // about 0.2 m left over, which is tight for a real chamber. Read that as a
  // signal about the number, not a claim that the Senate is uncomfortable.
  ROW_PITCH: 1.05,
  ROWS: 6,
  SEAT_PITCH: 0.74,
  ROW_RISE: 0.34,

  WALL_R: 12.8,
  WALL_H: 11.5,
  DAIS_WALL_Z: -0.5, // front face of the panelled elevation
  DAIS_LIFT: 0.85, // platform height above the floor

  BENCH_H: 0.75, // desk top above the floor of its own row
  BENCH_DEPTH: 0.42,
  BENCH_LIP: 0.08,
  SEAT_H: 0.45, // seat pad above the floor of its own row
  // Width of the stepped return that closes each end of the seating bank.
  RETURN_W: 0.26,

  // Two gangways, dividing the fan into three blocks: no aisle on the centre
  // line, the middle block square to the chair, and no seat on the back row
  // more than six places from an aisle.
  AISLE_W: 1.1,
  AISLES: 2,

  GALLERY_FRONT: 10.4, // front edge, cantilevered over the back rows
  // Set high deliberately, and not only because a public gallery sits high: the
  // balcony is the innermost thing in the room, so wherever its soffit lands is
  // a ceiling on how far back the eye can stand underneath it.
  GALLERY_RISE: 6.6,
  GALLERY_SLAB: 0.4,
  GALLERY_ROWS: 3,
  GALLERY_PITCH: 0.8,
  GALLERY_STEP: 0.42,
  // Low enough that the seating behind it still reads from the floor.
  GALLERY_PARAPET: 0.85,
});
