// The room at the State House where the President signs bills into law.
//
// WHICH ROOM, AND WHAT IT IS NOT. Assent is photographed in more than one room
// at the Villa. This is the one with a bronze coat of arms on a timber wall
// behind the chair, where the Student Loans Bill was signed in June 2023 and
// the Electoral Act amendment in February 2026:
//   https://naltf.gov.ng/wp-content/uploads/2026/02/Tinubu-signs-electoral-act2-1024x722.jpg
//   https://businesspost.ng/wp-content/uploads/2026/02/Tinubu-signs-electoral-bill-768x512.jpg
//   https://www.kemifilani.ng/wp-content/uploads/2023/06/Tinubu-signs-students-loan-bill.jpg
//   https://www.pensionnigeria.com/wp-content/uploads/2023/06/President-Tinubu-1.png
// The 2024 budget and the 2025 tax bills were signed in a different room, with
// chequered curtains and a framed portrait. And neither is the President's own
// desk, of which one photograph was found (cream shelving, a teal chair). No
// source found names any of these rooms, so this one is called by what happens
// in it and nothing more is claimed for it.
//
// HOW MUCH OF IT IS KNOWN. One wall and the desk in front of it. Every frame is
// taken from the same side, looking at the President, so the wall behind the
// chair, the flags, the coat of arms, the chair and the desk are as
// photographed — and the other three walls, the far end of the room and its
// size are not in any picture. They are drawn as plain continuations of the
// wall that is, and the eye is kept facing the part that is known.
//
// Every length is DERIVED from the people in the frames.

const HALF_W = 5;
const BACK_Z = -3.5;
const FRONT_Z = 4.5;
const WALL_H = 3.4;

// The desk: a straight front with a wing angled back from each end, so that
// the people who come to watch can stand round three sides of it (the 2026
// frame). The President sits behind it with his back to the wall.
const DESK_FRONT_Z = -0.9;
const DESK_HALF = 1.7;
const DESK_DEPTH = 1;
const DESK_H = 0.88;
const WING = 1.7;
const WING_TURN = Math.PI / 4;

const CHAIR = [0, 0, -2.25];
const ARMS_Y = 2.05;
// Left to right as the room sees them: the national flag, a second flag in
// red, blue and white, the coat of arms, and the same pair again.
const FLAGS_X = [-1.55, -0.85, 0.85, 1.55];
// The brass lines let into the wall, in threes.
const INLAY_X = [-3.6, 0, 3.6];

// The sitting camera asks a plan where a named speaker is; here there is only
// the one chair.
const speakingPlace = () => ({ angle: Math.PI, radius: -CHAIR[2], y: 0 });

export default {
  HALF_W,
  BACK_Z,
  FRONT_Z,
  WALL_H,
  DESK_FRONT_Z,
  DESK_HALF,
  DESK_DEPTH,
  DESK_H,
  WING,
  WING_TURN,
  CHAIR,
  ARMS_Y,
  FLAGS_X,
  INLAY_X,
  speakingPlace,
};
