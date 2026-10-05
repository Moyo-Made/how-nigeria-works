export const STONE = { color: "#e9e5d9", roughness: 0.92, metalness: 0.02 };
export const STONE_SHADE = { color: "#d8d3c4", roughness: 0.92, metalness: 0.02 };
export const DOME_GREEN = { color: "#46916a", roughness: 0.38, metalness: 0.3 };
export const ROOF_GREEN = { color: "#4d9270", roughness: 0.5, metalness: 0.2 };
export const TRIM_GREEN = { color: "#2f7a55", roughness: 0.6, metalness: 0.1 };
export const GLASS = { color: "#26332e", roughness: 0.25, metalness: 0.5 };
export const SLOT = { color: "#5e6d64", roughness: 0.35, metalness: 0.35 };
export const BANNER = { color: "#0f7a4a", roughness: 0.7, metalness: 0.05 };
export const BRASS = { color: "#c9a227", roughness: 0.3, metalness: 0.85 };
export const BRICK = { color: "#98604d", roughness: 0.85, metalness: 0.03 };
export const BRICK_DARK = { color: "#71453a", roughness: 0.88, metalness: 0.03 };
export const WATER = { color: "#4f9aa0", roughness: 0.12, metalness: 0.25 };
export const GRANITE = { color: "#5f544b", roughness: 0.96, metalness: 0.02 };
export const LAWN = { color: "#2b5a3c", roughness: 0.95, metalness: 0 };

// ---- Senate chamber interior ------------------------------------------------
// Sampled off post-renovation reference photography, then pulled back. Press and
// social images of the chamber are saturation-boosted hard enough that a direct
// read returns #fa0202 for the upholstery and #f26f04 for oak; building from
// those gives a cartoon. Hue and relative value are kept from the least
// processed reference and saturation is dropped to where a dyed wool baize and a
// stained oak actually sit. Oak lands at hue 26-32deg across every sample, which
// is the one figure here worth defending without qualification.
export const OAK = { color: "#b5834a", roughness: 0.62, metalness: 0.04 };
export const OAK_SHADE = { color: "#846649", roughness: 0.68, metalness: 0.04 };
// The fluted acoustic panels either side of the dais read paler and cooler than
// the bench oak; they are a different timber, not the same one in shadow.
// Dead matt, and not for realism's sake: any sheen on a wall of battens seen
// edge-on from beside it sums the whole ceiling's lamps into a white glare.
export const OAK_PALE = { color: "#bfa079", roughness: 0.95, metalness: 0 };
export const BAIZE_RED = { color: "#b3202b", roughness: 0.94, metalness: 0 };
export const CARPET_RED = { color: "#8e1c26", roughness: 0.98, metalness: 0 };
// The risers between tiers, a shade down from the treads. The real ones are the
// same carpet; separating them is what makes the steps read as steps under
// even chamber lighting rather than flattening into one red field.
export const CARPET_SHADE = { color: "#75161f", roughness: 0.98, metalness: 0 };
export const CHARCOAL = { color: "#3a3833", roughness: 0.8, metalness: 0.08 };
// The coat of arms and both chambers' seals are textures rather than sets of
// materials — see tools/emblems/ and `npm run emblems`.

// ---- The walls, in both chambers -------------------------------------------
// Read off the contractor's photographs of both renovated rooms — the brochure
// and its project gallery — and pulled back the same way as the oak above.
// https://figueras.com/project/national-assembly-of-nigeria/
//
// The piers either side of the chair, and the bands that run the walls, are a
// redder timber than the benches: hue 13-17deg in every sample from either room
// against the bench oak's 26-32, which is the difference that makes them read
// as a frame rather than more of the furniture.
export const CHERRY = { color: "#98583f", roughness: 0.55, metalness: 0.04 };
// The dark book-matched panel behind the presiding chair, in both rooms.
export const WALNUT = { color: "#664d3f", roughness: 0.55, metalness: 0.04 };
// The Senate mounts its seal on a board a shade lighter than the walnut round
// it; the House hangs its seal on the walnut directly.
export const SEAL_BOARD = { color: "#83634d", roughness: 0.55, metalness: 0.04 };
// Every photograph of either room shows white plaster above the timber and a
// white ceiling — the room is a timber lining in a white box.
export const PLASTER = { color: "#e9e8e3", roughness: 0.92, metalness: 0 };
// Display screens set into the walls, off.
export const SCREEN = { color: "#25282b", roughness: 0.22, metalness: 0.25 };
// The inside of a door reveal: timber in its own shadow.
const REVEAL = { color: "#2a1c15", roughness: 0.9, metalness: 0 };
// The glass screen behind the presiding chair.
const SCREEN_GLASS = { color: "#cfd8d4", roughness: 0.2, metalness: 0, transparent: true, opacity: 0.4 };
// The crested chairs on the dais are leather where every other seat in the room
// is cloth: the Senate's a red close to its baize, the House's a grey-green well
// off its own (red chamber g01, green chamber g07).
const LEATHER_RED = { color: "#a8242c", roughness: 0.5, metalness: 0.02 };
const LEATHER_GREEN = { color: "#5c7365", roughness: 0.5, metalness: 0.02 };
export const FLAG_GREEN = { color: "#17744a", roughness: 0.85, metalness: 0 };
export const FLAG_WHITE = { color: "#efefea", roughness: 0.85, metalness: 0 };
export const FLAG_RED = { color: "#b02229", roughness: 0.85, metalness: 0 };

// ---- The Green Chamber ------------------------------------------------------
// The House's fittings are the Senate's in its own colour: the photographs show
// the same oak, brass, fluted timber and cherry framing in both rooms, and only
// the dyed wool and the tint of the backlit panels change. What differs between
// the rooms is the shape of their walls, not what the walls are made of.
//
// Derived from the red rather than sampled fresh, and for the same reason the
// red was pulled back from its own reference: press and social images of both
// chambers are saturation-boosted hard enough that reading a colour straight
// off them returns a cartoon. Holding hue apart and keeping the Senate's
// saturation and value discipline gives a green that sits beside the red as the
// same material in another dye lot, which is what it is.
export const BAIZE_GREEN = { color: "#22774d", roughness: 0.94, metalness: 0 };
export const CARPET_GREEN = { color: "#1c6e42", roughness: 0.98, metalness: 0 };
export const CARPET_GREEN_SHADE = { color: "#145733", roughness: 0.98, metalness: 0 };

// The backlit printed panels on the side walls: the same two designs in both
// rooms, a gavel pair and a pair of linked rectangles, printed red on pink in
// the Senate and green on a pale green-white in the House. Sampled from gallery
// images r05 and r09 (Senate) and g06 (House), glow and all. The Senate's are
// a full pink, not a blush: in every frame they are the most saturated thing
// on the wall.
const PANEL_RED = { ground: "#f7adc0", line: "#d9506b" };
const PANEL_GREEN = { ground: "#e2ece7", line: "#3f9e86" };

// What a chamber's geometry actually asks for. Everything picks its colours
// through one of these, so adding a room is a palette rather than a search
// through the meshes for every place red was written down.
export const RED_CHAMBER = {
  baize: BAIZE_RED,
  carpet: CARPET_RED,
  carpetShade: CARPET_SHADE,
  oak: OAK,
  oakShade: OAK_SHADE,
  oakPale: OAK_PALE,
  cherry: CHERRY,
  walnut: WALNUT,
  sealBoard: SEAL_BOARD,
  plaster: PLASTER,
  screen: SCREEN,
  glass: SCREEN_GLASS,
  reveal: REVEAL,
  leather: LEATHER_RED,
  charcoal: CHARCOAL,
  brass: BRASS,
  panel: PANEL_RED,
};

export const GREEN_CHAMBER = {
  ...RED_CHAMBER,
  baize: BAIZE_GREEN,
  carpet: CARPET_GREEN,
  carpetShade: CARPET_GREEN_SHADE,
  leather: LEATHER_GREEN,
  panel: PANEL_GREEN,
};
