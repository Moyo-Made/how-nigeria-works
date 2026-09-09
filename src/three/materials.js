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
export const OAK_PALE = { color: "#bfa079", roughness: 0.72, metalness: 0.02 };
export const BAY_WOOD = { color: "#a28976", roughness: 0.5, metalness: 0.05 };
export const BAIZE_RED = { color: "#b3202b", roughness: 0.94, metalness: 0 };
export const CARPET_RED = { color: "#8e1c26", roughness: 0.98, metalness: 0 };
// The risers between tiers, a shade down from the treads. The real ones are the
// same carpet; separating them is what makes the steps read as steps under
// even chamber lighting rather than flattening into one red field.
export const CARPET_SHADE = { color: "#75161f", roughness: 0.98, metalness: 0 };
export const CHARCOAL = { color: "#3a3833", roughness: 0.8, metalness: 0.08 };
// The coat of arms is a texture rather than a set of materials — see
// tools/emblems/coat-of-arms.svg and `npm run emblems`.

// ---- The Green Chamber ------------------------------------------------------
// The House sits in green where the Senate sits in red, and nothing else about
// the two rooms' materials differs: they are mirror-image halls of one design,
// so the oak, the brass, the charcoal and the pale acoustic timber are shared
// and only the dyed wool changes hue.
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
  bay: BAY_WOOD,
  charcoal: CHARCOAL,
  brass: BRASS,
};

export const GREEN_CHAMBER = {
  ...RED_CHAMBER,
  baize: BAIZE_GREEN,
  carpet: CARPET_GREEN,
  carpetShade: CARPET_GREEN_SHADE,
};
