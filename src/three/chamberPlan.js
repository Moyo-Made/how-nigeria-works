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

  // ---- The walls ------------------------------------------------------------
  // The room is not round. Press photographs taken from the galleries of both
  // chambers in session show flat walls meeting at corners: a wide wall behind
  // the chair, a wall down each side, and two more across the rear that meet on
  // the centre line, with the balcony over those two.
  // https://www.lindaikejisblog.com/photos/shares/eedsd_1714480944.PNG (Senate)
  // https://dailytrust.com/wp-content/uploads/2024/10/house-of-reps.webp (House)
  //
  // The seating is still struck from one point on the dais wall, so the walls
  // are laid out round the circle the seating needs: WALL_R is how far each one
  // stands from that point at its nearest, and a plan says which way the side
  // and rear walls face. Everything a circle of that radius holds, the room
  // holds, which is what lets the camera's fence stay a single number.
  const SIDE = THREE.MathUtils.degToRad(p.sideDegrees);
  const REAR = THREE.MathUtils.degToRad(p.rearDegrees);

  // Where two lines meet, each given by the bearing of its normal and its
  // distance from the origin.
  const meet = (b1, d1, b2, d2) => {
    const det = Math.sin(b1 - b2);
    return [
      (d1 * Math.cos(b2) - d2 * Math.cos(b1)) / det,
      (d2 * Math.sin(b1) - d1 * Math.sin(b2)) / det,
    ];
  };
  // A run of wall, or of anything else that stands parallel to one: its ends,
  // its middle, its length and the bearing it faces away from the chair on.
  const run = (a, b, bearing) => ({
    a,
    b,
    bearing,
    mid: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2],
    length: Math.hypot(b[0] - a[0], b[1] - a[1]),
  });
  // The run parallel to a rear wall at a given distance from the origin, from
  // the centre line out to the side wall. The rear walls themselves are this at
  // WALL_R; the balcony's front and each of its rows are this nearer in.
  const rearRun = (dir, distance) =>
    run(
      [0, distance / Math.cos(REAR)],
      meet(dir * SIDE, p.WALL_R, dir * REAR, distance),
      dir * REAR
    );

  const walls = () =>
    [1, -1].flatMap((dir) => {
      const rear = rearRun(dir, p.WALL_R);
      const foot = meet(dir * SIDE, p.WALL_R, 0, p.DAIS_WALL_Z);
      return [
        { kind: "side", dir, ...run(foot, rear.b, dir * SIDE) },
        { kind: "rear", dir, ...rear },
      ];
    });

  // A point a fraction of the way along a run, stood off it toward the chair,
  // and the turn that faces something there into the room.
  const onRun = ({ a, b, bearing }, u, inset = 0) => ({
    position: [
      a[0] + (b[0] - a[0]) * u - Math.sin(bearing) * inset,
      a[1] + (b[1] - a[1]) * u - Math.cos(bearing) * inset,
    ],
    turn: bearing + Math.PI,
  });

  // How far the wall is from the origin on a bearing, for anything that has to
  // run out to it.
  const wallDistance = (bearing) =>
    Math.min(
      ...[SIDE, REAR, -REAR, -SIDE]
        .map((b) => Math.cos(bearing - b))
        .filter((c) => c > 1e-6)
        .map((c) => p.WALL_R / c)
    );

  // The wall behind the chair runs corner to corner.
  const BACK_WALL_HALF = meet(SIDE, p.WALL_R, 0, p.DAIS_WALL_Z)[0];
  // The furthest any corner is from the origin, for the floor and the ceiling.
  const FAR = Math.max(...walls().map(({ b }) => Math.hypot(...b)), BACK_WALL_HALF);

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
  //
  // Gangways divide the fan evenly, so an odd count puts one on the centre line.
  // Both rooms need that: the contractor's photographs look straight down a
  // stepped aisle to the chair in the House and straight up one from the well in
  // the Senate. See the note on AISLES in ./plans.
  const BLOCKS = p.AISLES + 1;
  const aisleBearings = Array.from(
    { length: p.AISLES },
    (_, i) => -HALF_FAN + ((i + 1) * FAN) / BLOCKS
  );

  // Half the angle a gangway takes out of an arc at this radius.
  const aisleHalf = (radius) => p.AISLE_W / 2 / radius;

  // Every seating block on a row: where it starts, where it ends, and how many
  // seats fit between. The outer two are held off the stepped returns that
  // close the bank, so the desks and the seat count agree about where the bank
  // physically stops.
  const rowBlocks = (radius) => {
    const aisle = aisleHalf(radius);
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

  // A chair stands drawn up to its desk, not centred in the space behind it:
  // the manufacturer's drawing has the chair hard against the desk and what is
  // left of the row behind the chair, as the way past.
  // https://figueras.com/wp-content/uploads/2023/07/MegaRT_2315_dimensions.jpg
  const CHAIR_REACH = p.BENCH_LIP + 0.45;
  const chairRadius = (row) => row.radius + CHAIR_REACH;

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
  // so: a chamber holds far more seats than its floor accounts for, and the
  // balcony is where the rest are.
  //
  // It stands over the rear of the room only — against the two rear walls, from
  // one side wall to the other — and its front is two straight runs parallel to
  // those walls, meeting at an angle on the centre line with a screen hung under
  // the join (Figueras brochure p. 8 for the Senate; gallery images g03 and g04
  // and the press photographs above for the House). Its rows are straight too.
  // Its depth is its rows.
  const GALLERY_NEAR = p.WALL_R - p.GALLERY_ROWS * p.GALLERY_PITCH;
  const galleryFront = () => [1, -1].map((dir) => rearRun(dir, GALLERY_NEAR));

  // The line the timber lining stops at. Every photograph of either room shows
  // the same arrangement: fluted timber up to a cherry band, white plaster above
  // it, and that band carried round the room at the height of the gallery's
  // fascia (Figueras gallery images r03 and g03). So the band sits wherever the
  // fascia does, and the walls behind the chair are laid out from it: the only
  // proportions the photographs give are ones between things on the same wall.
  //
  // The band is deep. Against the fluting under it, on the same wall, it is
  // between a fifth and a third as tall in every frame that shows both (r05 and
  // the press photograph of the Senate; g03 and the press photograph of the
  // House), and the balcony's fascia is the same depth where the two meet. So
  // GALLERY_SLAB is not a slab: it is the whole depth of the balcony's edge
  // below its floor, and a plan sets it to make the band about a quarter of
  // the height of the timber.
  const BAND_Y = p.GALLERY_RISE - p.GALLERY_SLAB;
  // And where the fascia stops: a little above the balcony floor, as an upstand
  // the glass balustrade stands on. The band down the side walls is the same
  // fascia carried on, so it stops at the same height.
  const FASCIA_TOP = p.GALLERY_RISE + 0.35;

  // The dais climbs in five rises, two to the lower landing and three more to
  // the top one (Figueras gallery image r10, the only frame that shows its
  // stairs), so the lower landing stands two fifths of the way up.
  const DAIS_MID = p.DAIS_LIFT * 0.4;

  // Each row of the balcony: the tread it stands on, as a run either side of
  // the centre line, and the height of it.
  const galleryRows = () =>
    Array.from({ length: p.GALLERY_ROWS }, (_, index) => {
      const near = GALLERY_NEAR + index * p.GALLERY_PITCH;
      return {
        index,
        near,
        far: near + p.GALLERY_PITCH,
        y: p.GALLERY_RISE + index * p.GALLERY_STEP,
        runs: [1, -1].map((dir) => ({
          dir,
          front: rearRun(dir, near),
          back: rearRun(dir, near + p.GALLERY_PITCH),
          seats: rearRun(dir, near + p.GALLERY_PITCH * 0.55),
        })),
      };
    });

  // The balcony's seats are the fixed version of the chair on the floor, with
  // no desk and no travel, so they stand closer: 58 to 60 cm centre to centre
  // on the manufacturer's drawing against 95 for the ones that turn.
  // https://figueras.com/wp-content/uploads/2023/07/Megaseat_9113_dimensions.jpg
  const gallerySeatPositions = () =>
    galleryRows().flatMap((row) =>
      row.runs.flatMap(({ dir, seats: line }) => {
        // Held off the centre line, where the two runs meet, and off the wall.
        const usable = line.length - 1.2;
        const count = Math.max(0, Math.floor(usable / p.GALLERY_SEAT_PITCH));
        return Array.from({ length: count }, (_, seat) => {
          const u = (0.5 + ((seat + 0.5) * usable) / count) / line.length;
          const x = line.a[0] + (line.b[0] - line.a[0]) * u;
          const z = line.a[1] + (line.b[1] - line.a[1]) * u;
          return {
            row: row.index,
            seat,
            angle: Math.atan2(x, z),
            radius: Math.hypot(x, z),
            // Faces square off its own row, not at the chair.
            face: dir * REAR,
            y: row.y,
          };
        });
      })
    );

  const gallerySeatEstimate = () => gallerySeatPositions().length;

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
  //
  // Stood off the wall by more than the wall's own thickness: piers, a lintel
  // and in the House a canopy all stand forward of it, and an eye swung round
  // at their height would otherwise pass through them.
  const DAIS_PLANE = p.DAIS_WALL_Z + 2.0;

  // How far the eye may get from what it is looking at.
  //
  // Measured against the shell, with the gallery kept out of the way rather than
  // allowed to set this. Note that the target is not the centre of the room — it
  // sits out in the seating — so subtracting a margin from WALL_R alone does not
  // keep the camera inside: it lets it out by however far the target is off
  // centre, and the curved wall is drawn BackSide, so from outside it is not
  // there at all.
  //
  // The balcony is a second fence inside the first. It used to be kept out of
  // the way by standing it high; a room this size is deep enough that the eye,
  // swung up at full reach, arrives at the balcony's front edge above its
  // soffit all the same. Under the soffit the eye may go where it likes, so the
  // limit is the reach at which, on reaching soffit height, it is still short
  // of the nearest point of that edge.
  const cameraReach = (target, margin = 1.5) => {
    const off = Math.hypot(target[0], target[2]);
    const up = BAND_Y - 0.5 - target[1];
    return Math.min(p.WALL_R - off - margin, Math.hypot(GALLERY_NEAR - 0.5 - off, up));
  };

  // How high the eye may swing: at full reach it must still be under the
  // ceiling. In a small room the reach is short enough that it always is, and
  // the floor on this angle is just the one that stops the view going plan.
  const cameraMinPolar = (target, reach, clear = 0.8, floor = 0.35) =>
    Math.max(floor, Math.acos(Math.min(1, (p.WALL_H - clear - target[1]) / reach)));

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
    FAR,
    GALLERY_NEAR,
    galleryFront,
    walls,
    onRun,
    wallDistance,
    BAND_Y,
    FASCIA_TOP,
    DAIS_MID,
    DAIS_PLANE,
    aisleBearings,
    aisleHalf,
    rows,
    rowBlocks,
    chairRadius,
    CHAIR_REACH,
    seatPositions,
    floorSeatEstimate,
    galleryRows,
    gallerySeatPositions,
    gallerySeatEstimate,
    seatEstimate,
    speakingPlace,
    cameraReach,
    cameraMinPolar,
    cameraMaxPolar,
    cameraHalfSweep,
  };
}
