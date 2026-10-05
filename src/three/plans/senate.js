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
// UNVERIFIED: ROW_PITCH, SEAT_PITCH and every radius here. What is read off the
// contractor's photographs rather than derived — the row count, the gangway on
// the centre line, where the balcony stops — says so where it is set.
export default createPlan({
  // Which wall stands behind the chair. The two rooms' are different designs —
  // see the elevations in Chamber.jsx.
  elevation: "senate",

  // How far round the seating runs. From the gallery the bank is plainly less
  // than a half-circle, with open carpet either side of the dais between the
  // ends of the rows and the side walls (press photograph of the first sitting
  // in the renovated room, 30 April 2024).
  // https://www.lindaikejisblog.com/photos/shares/eedsd_1714480944.PNG
  fanDegrees: 120,

  // Which way the walls face, as the bearing of each from the chair. The side
  // walls stand nearly square to the wall behind the chair and the two rear
  // walls meet at a shallow angle on the centre line; that much the photographs
  // show, and the angles themselves are by eye.
  sideDegrees: 70,
  rearDegrees: 20,

  // Where the lower baize parapet of the dais crosses the centre line: room
  // behind it for two desks and two chairs, one above the other.
  DAIS_R: 2.6,
  // The front of the clerks' table. Far enough out to seat the clerks between
  // their desk and the parapet, close enough to still sit under the chair.
  CLERKS_R: 4.9,
  // Where the open floor of the well stops and the first tier starts. Every
  // photograph that takes in the well shows a broad apron of carpet between the
  // clerks' table and the front bench (gallery images r03 and r05), and none
  // carries a scale to say how broad. It is drawn at a little over two metres,
  // by eye, which is a guess about a thing that is certainly there; it stood at
  // 0.3 m before, which was a guess about a thing that is not.
  WELL_R: 7.2,

  ROW_0: 7.85, // the members' edge of the first desk, which stands wholly on its tier
  // Desk to desk, front to back. This is the manufacturer's figure for the
  // seat that was installed: its drawing of the turning chair at a desk gives
  // 60 cm of desk, 130 from the desk's front to the back of the chair's travel,
  // and 40 behind that. It stood at 1.05 m here, derived, which is less than
  // the desk and the chair add up to before anyone sits down.
  // https://figueras.com/wp-content/uploads/2023/07/MegaRT_2315_dimensions.jpg
  ROW_PITCH: 1.7,
  // Counted, not chosen: the wide shots of the bank show eight rows of chairs
  // from the low front bench to the one under the balcony (Figueras brochure
  // p. 3, gallery images r03 and r05). It stood at six.
  ROWS: 8,
  // Centre to centre along a row: 95 cm, the minimum the same drawing gives
  // for a chair that turns through a full circle, and what the photographs
  // show — chairs standing well clear of each other, most of a chair's width
  // between them (gallery images r02 and r09).
  SEAT_PITCH: 0.95,
  ROW_RISE: 0.34,

  // The nearest any wall stands to the chair: the back of the last row, and
  // the cross-aisle behind it.
  WALL_R: 22.1,
  WALL_H: 11.5,
  DAIS_WALL_Z: -0.5, // front face of the panelled elevation
  DAIS_LIFT: 0.85, // the top landing above the floor: five rises of 0.17

  BENCH_H: 0.75, // desk top above the floor of its own row
  BENCH_DEPTH: 0.6, // the manufacturer's drawing again
  BENCH_LIP: 0.08,
  SEAT_H: 0.45, // seat pad above the floor of its own row
  // Width of the stepped return that closes each end of the seating bank.
  RETURN_W: 0.26,

  // Three gangways, one of them on the centre line. That one is photographed: a
  // carpeted stair runs straight up the middle of the bank from the well, rows
  // either side of it (Figueras brochure, p. 8, nameplates of sitting
  // senators). Side gangways are photographed too (gallery image g08) but the
  // full set never is, so how many there are is still a choice — two, placed
  // evenly either side of the centre, which keeps every seat on the back row
  // within six places of one.
  AISLE_W: 1.1,
  AISLES: 3,

  // Two rows on the balcony. The floor holds 198 at the manufacturer's spacing,
  // which leaves 114 of the 312 installed for up here, and two rows of the
  // fixed chair along both rear walls is 114: 312 in all. That it lands exactly
  // is luck in the rounding, not proof; the fan and the well are still by eye.
  //
  // Set high deliberately, and not only because a public gallery sits high: the
  // balcony is the innermost thing in the room, so wherever its soffit lands is
  // a ceiling on how far back the eye can stand underneath it.
  GALLERY_RISE: 6.6,
  GALLERY_SLAB: 0.4,
  GALLERY_ROWS: 2,
  // The Senate's balcony is a loggia, not an open shelf: the white wall of the
  // room comes down in front of it to a lintel, carried on square white piers
  // that stand on the balcony's front edge, and the balcony has a ceiling of its
  // own at that lintel (Figueras gallery image r03, upper right). The opening
  // is about three times the height of the rail; the piers are about six chairs
  // apart.
  GALLERY_LOGGIA: { height: 2.6, bay: 3.8 },
  // What the ceiling carries: square flush light panels, a few of which show at
  // the top of the same photograph.
  CEILING: "panels",
  GALLERY_PITCH: 1.0,
  GALLERY_SEAT_PITCH: 0.6,
  GALLERY_STEP: 0.42,
  // Low enough that the seating behind it still reads from the floor.
  GALLERY_PARAPET: 0.85,
});
