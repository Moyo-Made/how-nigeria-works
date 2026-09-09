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

export const WALL_R = 12.8;
export const WALL_H = 11.5;

// The dais end of the room is flat — a D-plan, with the curved wall wrapping the
// seating and a straight wall carrying the panelled elevation behind the chair.
export const BACK_WALL_HALF = WALL_R;
// Front face of the panelled elevation. Two things are measured off it: how far
// round the curved wall actually runs before the flat one takes over, and how
// far back the eye may go.
export const DAIS_WALL_Z = -0.5;
export const DAIS_LIFT = 0.85; // platform height above the floor

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
      seats: rowBlocks(radius).reduce((total, block) => total + block.seats, 0),
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

// ---- Radial gangways --------------------------------------------------------
// A chamber where a seat in the middle of a row can only be reached by climbing
// over the people beside it is not a chamber, and until now this one had no
// aisles at all.
//
// They are cut here, in the generator, because that is the only place they can
// be cut honestly: notching them into the geometry downstream would leave the
// seat count describing a room that no longer exists, and the seat count is the
// only thing testing whether these radii are sane.
//
// A gangway is a constant width in metres, so it takes the same arc length out
// of every row and its angular width narrows as the rows lengthen. Two of them
// divide the fan into three blocks, which puts no aisle on the centre line and
// leaves the middle block square to the chair — where the mace and the clerks'
// table already are. At the back row that leaves no seat more than six places
// from a gangway.
//
// This costs seats, and it is meant to. The floor count falls and moves away
// from the 312 the room was fitted with. A room with aisles is more right than
// a room whose total happens to land on the one published figure, and a count
// that only agreed because nobody could reach their seat was agreeing about
// the wrong thing.
export const AISLE_W = 1.1;
export const AISLES = 2;

const BLOCKS = AISLES + 1;

// Every seating block on a row: where it starts, where it ends, and how many
// seats fit between. The outer two are held off the stepped returns that close
// the bank, so the desks and the seat count agree about where the bank stops.
export const rowBlocks = (radius) => {
  const aisle = AISLE_W / 2 / radius;
  const inset = RETURN_W / 2 / radius;
  const span = FAN / BLOCKS;

  return Array.from({ length: BLOCKS }, (_, i) => {
    const start = -HALF_FAN + i * span + (i === 0 ? inset : aisle);
    const end = -HALF_FAN + (i + 1) * span - (i === BLOCKS - 1 ? inset : aisle);
    return { start, end, seats: Math.max(0, Math.floor(((end - start) * radius) / SEAT_PITCH)) };
  });
};

// Chairs sit centred between the back of their own desk and the riser of the row
// behind, so the gangway closes up or opens out with ROW_PITCH instead of
// needing a second number kept in step with it by hand.
export const chairRadius = (row) => (row.radius + BENCH_LIP + row.treadOuter) / 2;

// Every seat on the floor, as a flat list: where it is, and which row it belongs
// to. One generator, so the chairs, anything that later needs to light up a
// single member's place during the bill sequence, and the seat count that
// cross-checks the radii are all reading the same room.
//
// Seats are numbered across the whole row rather than restarting in each block,
// so a place keeps one identity however the gangways are later moved.
export const seatPositions = () =>
  rows().flatMap((row) => {
    const radius = chairRadius(row);
    let n = 0;

    return rowBlocks(row.radius).flatMap((block) => {
      const step = (block.end - block.start) / block.seats;
      return Array.from({ length: block.seats }, (_, i) => ({
        row: row.index,
        seat: n++,
        angle: block.start + (i + 0.5) * step,
        radius,
        y: row.y,
      }));
    });
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

// The plane the eye may not cross. Behind the dais elevation is a crescent of
// dead space between that flat wall and the cylinder — a room nobody has ever
// been in, and the thing an unclamped sweep puts on screen.
export const DAIS_PLANE = DAIS_WALL_Z + 0.4;

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
// Measured against the shell, and the gallery is kept out of the way rather than
// allowed to set this. Treating the balcony as the limit was a mistake worth
// recording: it only obstructs above its own soffit, and clamping reach as
// though it were a wall took the eye from 8.5 m to 7 and shut the room down to
// the dais. The soffit is high enough that the eye passes under it instead.
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

// ---- Galleries --------------------------------------------------------------
// The room does not stop at the back bench, and this is where the arithmetic
// says so. 312 seats were installed in this chamber; the floor built above holds
// 171. Something on the order of 140 places are therefore somewhere else, and in
// a room this size a balcony over the rear of the fan is the only place they can
// be. That gap is the nearest thing to a measurement the gallery has.
//
// Nothing else about it is published — not its height, not its depth, not how
// many rows it carries. What shapes it instead are two clearances that are not
// negotiable and one geometric fact:
//
//   - the soffit has to clear a person seated on the back bench;
//   - the parapet has to sit low enough to see the floor over from the front row;
//   - and the curved wall only runs as far as the flat one lets it.
//
// The seat count that falls out is the check, not the target. If it landed far
// from 312 the shape above would be wrong.

export const GALLERY_FRONT = 10.4; // front edge, cantilevered over the back rows
// Floor of the first gallery row. Set high deliberately, and not only because a
// public gallery sits high: the balcony is the innermost thing in the room, so
// wherever its soffit lands is a ceiling on how far back the eye can stand
// underneath it. Dropped to 4.6 it cost nearly two metres of reach and left the
// chamber unviewable as a room — you could see the dais and nothing else.
export const GALLERY_RISE = 6.6;
export const GALLERY_SLAB = 0.4; // structure below that floor
export const GALLERY_ROWS = 3;
export const GALLERY_PITCH = 0.8;
export const GALLERY_STEP = 0.42;
// Low enough that the seating behind it still reads from the floor. At 1.0 m it
// stood a clear 4 cm above the front row's seat backs and swallowed the row
// whole — correct for a real parapet with people behind it, wrong for a model
// whose job is to show that the row is there.
export const GALLERY_PARAPET = 0.85;

// How far round the balcony can run: the curved wall is only wall where it
// stands in front of the dais elevation, and past that point the flat wall has
// taken over. Inset slightly so the ends die into panelling rather than into the
// junction itself.
export const GALLERY_FAN = 2 * (Math.acos(DAIS_WALL_Z / WALL_R) - 0.05);

// The last row's tread lands exactly on the wall, which is what fixes ROWS
// against PITCH here rather than leaving both free.
export const galleryRows = () =>
  Array.from({ length: GALLERY_ROWS }, (_, index) => {
    const treadInner = GALLERY_FRONT + index * GALLERY_PITCH;
    const radius = treadInner + GALLERY_PITCH * 0.5;
    return {
      index,
      treadInner,
      treadOuter: treadInner + GALLERY_PITCH,
      radius,
      y: GALLERY_RISE + index * GALLERY_STEP,
      seats: Math.floor((GALLERY_FAN * radius) / SEAT_PITCH),
    };
  });

export const gallerySeatPositions = () =>
  galleryRows().flatMap((row) => {
    const step = GALLERY_FAN / row.seats;
    return Array.from({ length: row.seats }, (_, seat) => ({
      row: row.index,
      seat,
      angle: -GALLERY_FAN / 2 + (seat + 0.5) * step,
      radius: row.radius,
      y: row.y,
    }));
  });

export const gallerySeatEstimate = () =>
  galleryRows().reduce((total, row) => total + row.seats, 0);

// Floor and gallery together, against the 312 the room was fitted with. This is
// the whole point of generating the room rather than placing it.
export const seatEstimate = () => floorSeatEstimate() + gallerySeatEstimate();

// One named place on the floor, for anything that has to address a single member
// rather than the whole room — the sitting sequence points both a camera and a
// light at it. Which seat it is does not matter. That everything agrees on the
// same one does, which is why it is resolved here and not at each use.
export const speakingPlace = () => {
  const row = seatPositions().filter((seat) => seat.row === 2);
  return row[Math.floor(row.length * 0.34)];
};
