// The Main Courtroom of the Supreme Court of Nigeria.
//
// WHICH ROOM. The building has more than one courtroom and the press uses
// photographs of them interchangeably. This is the large one the court sits in
// for its ceremonial sessions and is known by: dark blue drapes between timber
// piers, the coat of arms on a disc, one long curved bench. The court's own
// footage shows it like that on 29 September 2025, the same as in press
// photographs from 2020, so the older frames are still this room.
//   https://www.youtube.com/watch?v=nbtXd6gzY-o   (court's media office, 2025)
//   https://www.youtube.com/watch?v=tM3C6KiWGt4   (court's media office, 2023)
//   https://cdn.vanguardngr.com/wp-content/uploads/2020/02/supreme-court.jpg
//   https://thenigerialawyer.com/wp-content/uploads/2020/12/Supreme-Court-of-Nigeria.jpg
//   https://lawcarenigeria.com/wp-content/uploads/2020/05/supreme-court-justices-image.png
//
// It is NOT the pale-oak room with a monitor on every desk. That is a second,
// smaller courtroom, refitted and handed over in October 2023, and it turns up
// under most recent headlines about the court.
//
// WHAT IS MEASURED. Nothing. No plan, section or dimension of this room has
// been published, and unlike the chambers of the National Assembly there is no
// contractor's seat count to hold the model to. Every length below is read off
// the photographs against the one thing in them of known size — a seated
// person, and so the spacing of the chairs on the bench — and is DERIVED. What
// the photographs do fix is the arrangement: what stands where, what curves
// which way, what is in front of what.

// ---- The shell --------------------------------------------------------------
// Derived. The bench of fifteen chairs fills the floor between the two side
// galleries, which sets the width; the depth is the well plus the rows the
// 2023 footage shows full of lawyers.
const HALF_W = 12;
const FRONT_Z = -8.5;
const REAR_Z = 17;
const WALL_H = 7;

// ---- The bench --------------------------------------------------------------
// Counted, not derived: fifteen chairs in the Vanguard frame, seven either side
// of the one under the coat of arms. Other frames crop the ends and show
// fourteen to sixteen.
const BENCH_CHAIRS = 15;
// Shoulder to shoulder with a clear gap, as the Justices sit in every frame.
const BENCH_PITCH = 0.98;
// The bench is a shallow arc with its ends brought forward, so its centre of
// curvature is out in the room in front of it. The radius is derived from how
// little the ends lead the middle in the oblique lawcarenigeria frame.
const BENCH_R = 22;
const BENCH_CZ = 16.4;
// Radii from that centre: the front of the bench, and where the chairs stand.
const BENCH_FRONT = 21.4;
const BENCH_DEPTH = 0.75;
const BENCH_SEAT_R = 22.8;
const BENCH_FLOOR = 0.9;
const BENCH_TOP = 1.78;

// Between the bench and the well, a step down: the long desk the court's
// officers sit at, with their backs to the Justices.
const STAFF_FRONT = 19.2;
const STAFF_FLOOR = 0.4;
const STAFF_TOP = 1.3;

// ---- The bar ----------------------------------------------------------------
// Rows of timber desks with seats behind them, curved the other way from the
// bench so that the two close round the well. Their centre of curvature is far
// behind the front wall, which is what "barely curved" is in numbers.
const ROWS = 10;
const ROW_PITCH = 1.25;
const ROW_CZ = -30;
const ROW_R0 = 32;
// The rows rise gently to the back: the camera at the rear of the room in the
// Vanguard frame sees the whole well over ten rows of heads. How much is
// derived.
const ROW_RISE = 0.08;
const AISLE_HALF = 0.8;
const ROW_HALF_W = 8.6;
const SEAT_PITCH = 0.62;
// The front rows are the inner bar, where senior counsel sit, and in the 2025
// footage their seats are dark where the rows behind are tan.
const INNER_ROWS = 2;

// ---- The galleries ----------------------------------------------------------
// A balcony down each side and across the back, cantilevered, each with a deep
// dark timber fascia. The public sit up there.
const GALLERY_DEPTH = 3;
const GALLERY_Y = 3.3;
const GALLERY_FRONT_Z = -5;
const GALLERY_REAR_Z = REAR_Z - GALLERY_DEPTH;

// ---- The wall behind the bench ----------------------------------------------
// Read off the Vanguard frame against the chair spacing: a tall centre bay of
// drape carrying the coat of arms, a timber pier each side of it, and a lower
// framed bay of the same drape outside each pier.
const BAY_CENTRE_W = 3.6;
const BAY_SIDE_W = 2;
const PIER_W = 0.35;
const BAY_CENTRE_TOP = 6.4;
const BAY_SIDE_TOP = 4.9;
const ARMS_Y = 4.35;
const ARMS_D = 1.8;

// The lectern counsel address the court from, in the well on the centre line.
const LECTERN = [0, 0, 0.3];

const benchPoint = (angle, radius) => [
  Math.sin(angle) * radius,
  BENCH_CZ - Math.cos(angle) * radius,
];

// Every chair on the bench, left to right as the room sees them. A chair faces
// the centre the bench is struck from.
const benchSeats = () =>
  Array.from({ length: BENCH_CHAIRS }, (_, i) => {
    const angle = ((i - (BENCH_CHAIRS - 1) / 2) * BENCH_PITCH) / BENCH_SEAT_R;
    const [x, z] = benchPoint(angle, BENCH_SEAT_R);
    return { index: i, x, z, y: BENCH_FLOOR, yaw: -angle };
  });

// The Constitution does not let the whole court hear an appeal and does not let
// fewer than five: a panel is five Justices, or seven on the questions s. 234
// lists. An ordinary panel takes the middle of the bench and the other chairs
// stand empty.
const panelSeats = (size = 5) => {
  const first = (BENCH_CHAIRS - size) / 2;
  return benchSeats().slice(first, first + size);
};

const rowRadius = (row) => ROW_R0 + row * ROW_PITCH;
const rowFloor = (row) => row * ROW_RISE;

// The two halves of a row, as angles about the rows' own centre.
const rowSpans = (row) => {
  const r = rowRadius(row);
  const near = Math.asin(AISLE_HALF / r);
  const far = Math.asin(ROW_HALF_W / r);
  return [
    [-far, -near],
    [near, far],
  ];
};

// A seat behind every desk, generated rather than placed, so the rows and the
// count of what they hold cannot drift apart.
const barSeats = () => {
  const seats = [];
  for (let row = 0; row < ROWS; row++) {
    const r = rowRadius(row) + 0.92;
    for (const [from, to] of rowSpans(row)) {
      const count = Math.floor(((to - from) * r) / SEAT_PITCH);
      const step = (to - from) / count;
      for (let i = 0; i < count; i++) {
        const angle = from + (i + 0.5) * step;
        seats.push({
          row,
          x: Math.sin(angle) * r,
          z: ROW_CZ + Math.cos(angle) * r,
          y: rowFloor(row),
          yaw: angle + Math.PI,
        });
      }
    }
  }
  return seats;
};

// The sitting sequence shares its camera with the chambers', which asks a plan
// where a named speaker stands. Here that is always the lectern.
const speakingPlace = () => ({ angle: 0, radius: LECTERN[2], y: 0 });

export default {
  HALF_W,
  FRONT_Z,
  REAR_Z,
  WALL_H,
  BENCH_CHAIRS,
  BENCH_PITCH,
  BENCH_R,
  BENCH_CZ,
  BENCH_FRONT,
  BENCH_DEPTH,
  BENCH_SEAT_R,
  BENCH_FLOOR,
  BENCH_TOP,
  STAFF_FRONT,
  STAFF_FLOOR,
  STAFF_TOP,
  ROWS,
  ROW_PITCH,
  ROW_CZ,
  ROW_RISE,
  ROW_HALF_W,
  INNER_ROWS,
  GALLERY_DEPTH,
  GALLERY_Y,
  GALLERY_FRONT_Z,
  GALLERY_REAR_Z,
  BAY_CENTRE_W,
  BAY_SIDE_W,
  PIER_W,
  BAY_CENTRE_TOP,
  BAY_SIDE_TOP,
  ARMS_Y,
  ARMS_D,
  LECTERN,
  benchSeats,
  panelSeats,
  rowRadius,
  rowFloor,
  rowSpans,
  barSeats,
  speakingPlace,
};
