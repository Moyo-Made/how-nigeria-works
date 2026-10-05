// The Council Chamber at the State House, where the President meets the
// Vice-President and the ministers.
//
// WHAT IT IS DRAWN FROM. The State House photographs every meeting held in this
// room and the press runs them, so it is the best documented interior in the
// app. The same room is in all of them from 2016 to the latest found, February
// 2025: one ring of table, the same timber, the same carpet of stars.
//   https://pbs.twimg.com/media/Fa6wTSKX0AASaB0.jpg   (@NigeriaGov, Aug 2022 — the whole ring)
//   https://pbs.twimg.com/media/Fa6wTSLWQAEytXt.jpg   (same meeting, the head of the table)
//   https://cdn.vanguardngr.com/wp-content/uploads/2023/08/TCMS0363B-scaled.jpg   (across the room; the ceiling)
//   https://www.naijanews.com/wp-content/uploads/2024/01/Tinubu-2024-FEC-MEETING.jpg   (the backdrop and flags)
//   https://d1jcea4y7xhp7l.cloudfront.net/wp-content/uploads/2025/02/Untitled-design-3.jpg   (Feb 2025)
//
// ONE THING CHANGED. Through 2022 the wall behind the President's chair carried
// a bronze coat of arms on the timber. From August 2023 it is a white backdrop
// carrying the Seal of the President. The later one is drawn.
//
// WHAT IS MEASURED. Nothing, as with the courtroom: no plan of this room is
// public. The arrangement is as photographed; every length is DERIVED from the
// people in the frames, and above all from the spacing of the seats round the
// table.

// ---- The table --------------------------------------------------------------
// One closed oval ring, the members on the outside of it facing in. Its long
// axis runs from the President's place at -Z to the foot at +Z. The half-axes
// are of the edge the members sit at.
const TABLE_X = 4.4;
const TABLE_Z = 7.9;
const TABLE_DEPTH = 0.85;
const TABLE_H = 0.77;
// The dark band the ring stands on (the Aug 2022 frame of the head of the
// table).
const PLINTH_H = 0.24;
// Derived: sixteen or so members are in view down one long side in the 2023
// frame, which over that length is a little under a metre each.
const SEAT_PITCH = 0.92;
const SEAT_OFFSET = 0.55;

// ---- The room ---------------------------------------------------------------
// Derived. The room is taken as a rectangle because the wall behind the
// President is flat and so is the curtained wall; no frame shows a corner.
const HALF_W = 9;
const HALF_L = 12.5;
// The timber soffit, and the top of the lit oval recessed into it.
const WALL_H = 4.2;
// The lit oval in the ceiling follows the table below it and oversails it.
const OVAL_X = 6.1;
const OVAL_Z = 9.6;
// The columns stand in from the walls on an oval of their own.
const COLUMN_X = 8.45;
const COLUMN_Z = 11.7;
const COLUMNS = 12;

// A point on an oval, and which way is out from it there. The angle is measured
// like everything else in these rooms: zero at +Z, turning toward +X.
const onOval = (rx, rz, t) => {
  const nx = Math.sin(t) / rx;
  const nz = Math.cos(t) / rz;
  return { x: rx * Math.sin(t), z: rz * Math.cos(t), out: Math.atan2(nx, nz) };
};

// Stations at equal distances round an oval, the first one at the President's
// end. Equal angles would crowd the long sides and starve the ends; people sit
// a shoulder apart wherever they are on the ring, so the spacing is by length.
const around = (rx, rz, count) => {
  const STEPS = 720;
  const lengths = [0];
  let last = onOval(rx, rz, Math.PI);
  for (let i = 1; i <= STEPS; i++) {
    const next = onOval(rx, rz, Math.PI + (i / STEPS) * Math.PI * 2);
    lengths.push(lengths[i - 1] + Math.hypot(next.x - last.x, next.z - last.z));
    last = next;
  }
  const total = lengths[STEPS];
  const n = typeof count === "function" ? count(total) : count;

  let step = 0;
  return Array.from({ length: n }, (_, k) => {
    const want = (k / n) * total;
    while (lengths[step + 1] < want) step++;
    const part = (want - lengths[step]) / (lengths[step + 1] - lengths[step]);
    return Math.PI + ((step + part) / STEPS) * Math.PI * 2;
  });
};

// Every place at the table. Place 0 is the President's, at the head; the rest
// run round from there. A member faces in across the table.
const seatAngles = () =>
  around(TABLE_X + SEAT_OFFSET, TABLE_Z + SEAT_OFFSET, (length) => Math.round(length / SEAT_PITCH));

const seats = () =>
  seatAngles().map((t, index) => {
    const at = onOval(TABLE_X + SEAT_OFFSET, TABLE_Z + SEAT_OFFSET, t);
    return { index, t, x: at.x, z: at.z, y: 0, yaw: at.out + Math.PI };
  });

// The same stations carried in to another line of the ring: the screens on the
// table top, the stone panels on its inner face.
const atSeats = (inset, every = 1) =>
  seatAngles()
    .filter((_, i) => i % every === 0)
    .map((t, index) => {
      const at = onOval(TABLE_X - inset, TABLE_Z - inset, t);
      return { index, x: at.x, z: at.z, y: 0, yaw: at.out + Math.PI };
    });

const columns = () =>
  Array.from({ length: COLUMNS }, (_, i) => {
    const t = ((i + 0.5) / COLUMNS) * Math.PI * 2;
    const at = onOval(COLUMN_X, COLUMN_Z, t);
    return { x: at.x, z: at.z, yaw: at.out + Math.PI };
  });

// The sitting camera asks a plan where a named speaker is. Here it is a member
// a third of the way down one side of the table.
const speaker = () => {
  const all = seats();
  return all[Math.round(all.length * 0.3)];
};
const speakingPlace = () => {
  const { x, z } = speaker();
  return { angle: Math.atan2(x, z), radius: Math.hypot(x, z), y: 0 };
};

export default {
  TABLE_X,
  TABLE_Z,
  TABLE_DEPTH,
  TABLE_H,
  PLINTH_H,
  HALF_W,
  HALF_L,
  WALL_H,
  OVAL_X,
  OVAL_Z,
  onOval,
  around,
  seats,
  atSeats,
  columns,
  speaker,
  speakingPlace,
};
