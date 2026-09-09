// Dimensions for the Senate chamber, in metres.
//
// No floor plan of this room is public and no dimension of it has ever been
// published. The only number that constrains the space at all is the ~1,000 sq m
// of carpet Figueras laid, and that figure covers galleries and circulation as
// well as the floor, so it caps the room rather than sizing it.
//
// Everything below is therefore *derived*, not sourced: radii chosen so that the
// one hard count we do have — 312 installed seats — falls out at a believable
// seat pitch, and so the fan matches the proportions visible in wide interior
// photography. They are working values. They live here, in one place, rather
// than scattered through the geometry, so that the tier generator and the shell
// can never disagree about the room they are building, and so the guesses stay
// countable.
//
// UNVERIFIED, and to be treated as such wherever it is surfaced to a reader:
// ROWS, ROW_PITCH, SEAT_PITCH, and every radius on this page.

import * as THREE from "three";

// Total sweep of the hemicycle. Wide interior photography reads as appreciably
// more than a half-circle.
export const FAN = THREE.MathUtils.degToRad(150);
export const HALF_FAN = FAN / 2;

// All arcs are concentric on a single point at the dais wall, so the benches
// face the chair by construction rather than by being aimed at it.
export const DAIS_R = 2.6; // presiding desk
// Far enough out to clear the dais steps, close enough to still sit under the
// chair — the table has to read as belonging to the dais, not to the floor.
export const CLERKS_R = 4.9;
export const WELL_R = 5.2; // clear floor in front of the first bench

export const ROW_0 = 5.6; // first bench arc
export const ROW_PITCH = 1.05;
export const ROWS = 6;
export const SEAT_PITCH = 0.74;
export const ROW_RISE = 0.34; // each tier steps up by this much

export const GALLERY_R = 12.0;
export const WALL_R = 12.8;
export const WALL_H = 11.5;

// The dais end of the room is flat — a D-plan, with the curved wall wrapping the
// seating and a straight wall carrying the panelled elevation behind the chair.
export const BACK_WALL_HALF = WALL_R;
export const DAIS_LIFT = 0.85; // platform height above the floor

export const outerRow = () => ROW_0 + (ROWS - 1) * ROW_PITCH;

// Every row in the chamber, derived from the parameters above rather than
// placed by hand. One function, so the tier that a row stands on, the bench that
// sits on it and anything that later needs to address "the third row" can never
// disagree about where it is — and so changing ROWS changes the room instead of
// changing six hard-coded meshes.
export const rows = () =>
  Array.from({ length: ROWS }, (_, index) => {
    const radius = ROW_0 + index * ROW_PITCH;
    return {
      index,
      radius, // where the bench arc sits
      y: (index + 1) * ROW_RISE, // floor level of this row
      treadInner: WELL_R + index * ROW_PITCH,
      treadOuter: WELL_R + (index + 1) * ROW_PITCH,
      seats: Math.floor((FAN * radius) / SEAT_PITCH),
    };
  });

// Seats that fit on the floor at the current parameters. Not a source — a
// cross-check. If this drifts far from the floor's plausible share of the 312
// installed, the radii above are wrong.
export const floorSeatEstimate = () => rows().reduce((total, row) => total + row.seats, 0);

// ---- Benches ----------------------------------------------------------------
// Also derived. The one thing here that is close to a constraint rather than a
// guess is that all of it has to fit inside ROW_PITCH: a desk, a member in a
// chair behind it, and whatever is left over to squeeze past. At 1.05 m there is
// very little left over — about 0.2 m — which is tight for a real chamber and is
// worth reading as a signal that ROW_PITCH is the shakiest number on this page,
// not as a claim that the Senate is uncomfortable.
export const BENCH_H = 0.75; // desk top above the floor of its own row
export const BENCH_DEPTH = 0.42;
export const BENCH_LIP = 0.08;
export const SEAT_H = 0.45; // seat pad above the floor of its own row

// Width of the stepped return that closes each end of the seating bank. Lives
// here because two files need to agree about it: ChamberTiers builds it, and the
// bench arcs have to stop short of it instead of running into it.
export const RETURN_W = 0.26;

// A bench arc sweeps the full fan less the returns it would otherwise disappear
// into. Taken as an arc length rather than a fixed angle, so the clearance is
// the same 13 cm on the front row as on the back one.
export const benchHalfAngle = (radius) => HALF_FAN - RETURN_W / 2 / radius;

// Chairs sit centred between the back of their own desk and the riser of the row
// behind, so the gangway closes up or opens out with ROW_PITCH instead of
// needing a second number kept in step with it by hand.
export const chairRadius = (row) => (row.radius + BENCH_LIP + row.treadOuter) / 2;

// Every seat on the floor, as a flat list: where it is, and which row it belongs
// to. One generator, so the chairs, anything that later needs to light up a
// single member's place during the bill sequence, and the seat count that
// cross-checks the radii are all reading the same room.
//
// Seats are spaced evenly across the whole fan with no radial gangways, which no
// real chamber does. Cutting aisles means removing seats, and the seat count is
// currently the only thing testing whether these radii are sane — so gangways
// have to be added here, to rows(), rather than notched into the geometry
// downstream, or the plan and the room stop describing each other.
export const seatPositions = () =>
  rows().flatMap((row) => {
    const step = FAN / row.seats;
    const radius = chairRadius(row);
    return Array.from({ length: row.seats }, (_, seat) => ({
      row: row.index,
      seat,
      angle: -HALF_FAN + (seat + 0.5) * step,
      radius,
      y: row.y,
    }));
  });

// ---- Where an eye may stand -------------------------------------------------
// Only the 150 degrees of this room that hold seating are built, and there is
// nowhere to stand in the rest of it: 1.3 m between the back row and the wall,
// and behind the dais elevation a crescent of dead space between that flat wall
// and the cylinder, which is a room nobody has ever been in.
//
// So the eye is fenced. The fence is derived from the same numbers the room is,
// rather than tuned by eye, so that changing ROWS or WALL_R moves the fence with
// the room instead of quietly letting the camera out of it.

// The plane the eye may not cross. The dais elevation stands at z = -0.5 with
// its panelling a little nearer; behind it is a crescent of dead space between
// that flat wall and the cylinder — a room nobody has ever been in, and the
// thing an unclamped sweep puts on screen.
export const DAIS_PLANE = -0.1;

// The widest the eye may swing, and it is not 360.
//
// It cannot be. This is a D-plan room: 3.4 m behind the presiding chair is a
// solid wall, and there is no position back there that is not either inside the
// panelling or in the dead crescent behind it. A full orbit is not a setting
// being withheld — at eye level it is a place that does not exist. The room only
// opens up overhead, where you are above the dais rather than behind it.
//
// So the limit is solved for rather than picked: the angle at which the eye, at
// full reach and at its lowest, still stands in front of the dais. Every state
// nearer or higher than that has slack, which is what makes one static figure
// safe across the whole envelope.
export const cameraHalfSweep = (target, reach, maxPolar) =>
  Math.acos(
    Math.max(-1, Math.min(1, (DAIS_PLANE - target[2]) / (reach * Math.sin(maxPolar))))
  );

// How far the eye may get from what it is looking at.
//
// This is the one that was wrong. OrbitControls measures its distance from the
// target, and the target is not the centre of the room — it sits out in the
// seating. Subtracting a margin from WALL_R therefore does not keep the camera
// inside the shell; it lets it out by however far the target is off centre. And
// the curved wall is drawn BackSide, so from outside it is not there: the room
// loses its wall and shows you the back of everything in it.
export const cameraReach = (target, margin = 1.5) =>
  WALL_R - Math.hypot(target[0], target[2]) - margin;

// How low the eye may swing. Far enough down to read the rake, not so far that
// it drops into the back row: at full reach the eye must clear the desk top of
// the outermost bench, which is that row's floor plus the height of a desk.
export const cameraMaxPolar = (target, reach, clear = 0.6) => {
  const backRowDeskTop = ROWS * ROW_RISE + BENCH_H;
  return Math.acos(
    Math.min(1, Math.max(-1, (backRowDeskTop + clear - target[1]) / reach))
  );
};

