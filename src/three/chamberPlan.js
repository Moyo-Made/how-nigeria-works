import * as THREE from "three";

// How a chamber is derived.
//
// No floor plan of either chamber of the National Assembly is public, and no
// dimension of either has ever been published. Everything a room needs is
// therefore worked out from a handful of parameters, and this file is the
// working — one place that turns those parameters into a room, so that the tier
// generator, the benching, the gallery and the camera can never disagree about
// the room they are describing.
//
// The parameters themselves, and the case for each of them, live with the
// chamber they belong to in ./plans. What lives here is only the reasoning that
// is true of any chamber of this shape, which is why it is worth having once
// rather than twice: two rooms built by copying this logic would drift, and the
// drift would be invisible because both would still look like rooms.

export function createPlan(p) {
  // Total sweep of the hemicycle. All arcs are concentric on a single point at
  // the dais wall, so the benches face the chair by construction rather than by
  // being aimed at it.
  const FAN = THREE.MathUtils.degToRad(p.fanDegrees);
  const HALF_FAN = FAN / 2;

  // The dais end is flat — a D-plan, with the curved wall wrapping the seating
  // and a straight wall carrying the panelled elevation behind the chair.
  const BACK_WALL_HALF = p.WALL_R;

  // ---- Gangways -------------------------------------------------------------
  // A chamber where a seat in the middle of a row can only be reached by
  // climbing over the people beside it is not a chamber. Aisles are cut here,
  // in the generator, because that is the only place they can be cut honestly:
  // notching them into geometry downstream would leave the seat count
  // describing a room that no longer exists, and that count is the only thing
  // testing whether the radii are sane.
  //
  // A gangway is a constant width in metres, so it takes the same arc length
  // out of every row and its angular width narrows as the rows lengthen — one
  // number describes it at every radius.
  const BLOCKS = p.AISLES + 1;

  // Every seating block on a row: where it starts, where it ends, and how many
  // seats fit between. The outer two are held off the stepped returns that
  // close the bank, so the desks and the seat count agree about where the bank
  // physically stops.
  const rowBlocks = (radius) => {
    const aisle = p.AISLE_W / 2 / radius;
    const inset = p.RETURN_W / 2 / radius;
    const span = FAN / BLOCKS;

    return Array.from({ length: BLOCKS }, (_, i) => {
      const start = -HALF_FAN + i * span + (i === 0 ? inset : aisle);
      const end = -HALF_FAN + (i + 1) * span - (i === BLOCKS - 1 ? inset : aisle);
      return {
        start,
        end,
        seats: Math.max(0, Math.floor(((end - start) * radius) / p.SEAT_PITCH)),
      };
    });
  };

  // Every row in the chamber, derived rather than placed. One function, so the
  // tier a row stands on, the bench that sits on it and anything that later
  // needs to address "the third row" can never disagree about where it is — and
  // so changing ROWS changes the room instead of changing six hard-coded meshes.
  const rows = () =>
    Array.from({ length: p.ROWS }, (_, index) => {
      const radius = p.ROW_0 + index * p.ROW_PITCH;
      return {
        index,
        radius,
        y: (index + 1) * p.ROW_RISE,
        treadInner: p.WELL_R + index * p.ROW_PITCH,
        treadOuter: p.WELL_R + (index + 1) * p.ROW_PITCH,
        seats: rowBlocks(radius).reduce((total, block) => total + block.seats, 0),
      };
    });

  // Chairs sit centred between the back of their own desk and the riser of the
  // row behind, so the gangway closes up or opens out with ROW_PITCH instead of
  // needing a second number kept in step with it by hand.
  const chairRadius = (row) => (row.radius + p.BENCH_LIP + row.treadOuter) / 2;

  // Seats are numbered across the whole row rather than restarting in each
  // block, so a place keeps one identity however the gangways are later moved.
  const seatPositions = () =>
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

  const floorSeatEstimate = () => rows().reduce((total, row) => total + row.seats, 0);

  // ---- Galleries ------------------------------------------------------------
  // The room does not stop at the back bench, and the arithmetic is what says
  // so: a chamber holds far more seats than its floor accounts for, and in a
  // room this shape a balcony over the rear of the fan is the only place the
  // rest can be. Its depth is fixed by making the last tread land on the wall,
  // which is what ties GALLERY_ROWS to GALLERY_PITCH rather than leaving both
  // free.
  //
  // How far round the balcony can run: the curved wall is only wall where it
  // stands in front of the dais elevation, and past that point the flat wall has
  // taken over. Inset slightly so the ends die into panelling rather than into
  // the junction itself.
  const GALLERY_FAN = 2 * (Math.acos(p.DAIS_WALL_Z / p.WALL_R) - 0.05);

  const galleryRows = () =>
    Array.from({ length: p.GALLERY_ROWS }, (_, index) => {
      const treadInner = p.GALLERY_FRONT + index * p.GALLERY_PITCH;
      const radius = treadInner + p.GALLERY_PITCH * 0.5;
      return {
        index,
        treadInner,
        treadOuter: treadInner + p.GALLERY_PITCH,
        radius,
        y: p.GALLERY_RISE + index * p.GALLERY_STEP,
        seats: Math.floor((GALLERY_FAN * radius) / p.SEAT_PITCH),
      };
    });

  const gallerySeatPositions = () =>
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

  const gallerySeatEstimate = () =>
    galleryRows().reduce((total, row) => total + row.seats, 0);

  // Floor and gallery together, against the count the room was actually fitted
  // with. This is the whole point of generating a room rather than placing it:
  // if the total drifts far from the installed figure, the radii are wrong.
  const seatEstimate = () => floorSeatEstimate() + gallerySeatEstimate();

  // One named place on the floor, for anything that has to address a single
  // member rather than the room. Which seat it is does not matter. That
  // everything agrees on the same one does, which is why it is resolved here.
  const speakingPlace = () => {
    const row = seatPositions().filter((seat) => seat.row === Math.min(2, p.ROWS - 1));
    return row[Math.floor(row.length * 0.34)];
  };

  // ---- Where an eye may stand -----------------------------------------------
  // Only the part of the room that holds seating is built, and there is nowhere
  // to stand in the rest of it. So the eye is fenced, and the fence is derived
  // from the same numbers the room is, so that changing the room moves the fence
  // with it instead of quietly letting the camera out of it.

  // The plane the eye may not cross. Behind the dais elevation is a crescent of
  // dead space between that flat wall and the cylinder — a room nobody has ever
  // been in, and the thing an unclamped sweep puts on screen.
  const DAIS_PLANE = p.DAIS_WALL_Z + 0.4;

  // How far the eye may get from what it is looking at.
  //
  // Measured against the shell, with the gallery kept out of the way rather than
  // allowed to set this. Note that the target is not the centre of the room — it
  // sits out in the seating — so subtracting a margin from WALL_R alone does not
  // keep the camera inside: it lets it out by however far the target is off
  // centre, and the curved wall is drawn BackSide, so from outside it is not
  // there at all.
  const cameraReach = (target, margin = 1.5) =>
    p.WALL_R - Math.hypot(target[0], target[2]) - margin;

  // How low the eye may swing. Far enough down to read the rake, not so far that
  // it drops into the back row: at full reach it must clear the desk top of the
  // outermost bench, which is that row's floor plus the height of a desk.
  const cameraMaxPolar = (target, reach, clear = 0.6) => {
    const backRowDeskTop = p.ROWS * p.ROW_RISE + p.BENCH_H;
    return Math.acos(
      Math.min(1, Math.max(-1, (backRowDeskTop + clear - target[1]) / reach))
    );
  };

  // The widest the eye may swing, and it is never 360.
  //
  // It cannot be. This is a D-plan room: a solid wall stands a few metres behind
  // the presiding chair, and there is no position back there that is not either
  // inside the panelling or in the dead crescent behind it. A full orbit is not
  // a setting being withheld — at eye level it is a place that does not exist.
  //
  // So the limit is solved for rather than picked: the angle at which the eye,
  // at full reach and at its lowest, still stands in front of the dais. Every
  // state nearer or higher has slack, which is what makes one static figure safe
  // across the whole envelope.
  const cameraHalfSweep = (target, reach, maxPolar) =>
    Math.acos(
      Math.min(1, Math.max(-1, (DAIS_PLANE - target[2]) / (reach * Math.sin(maxPolar))))
    );

  return {
    ...p,
    FAN,
    HALF_FAN,
    BACK_WALL_HALF,
    GALLERY_FAN,
    DAIS_PLANE,
    rows,
    rowBlocks,
    chairRadius,
    seatPositions,
    floorSeatEstimate,
    galleryRows,
    gallerySeatPositions,
    gallerySeatEstimate,
    seatEstimate,
    speakingPlace,
    cameraReach,
    cameraMaxPolar,
    cameraHalfSweep,
  };
}
