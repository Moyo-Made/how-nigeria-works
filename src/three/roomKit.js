// Constants and arithmetic the rooms outside the National Assembly share. Kept
// apart from roomParts.jsx so that file exports only components.

// A ceiling panel with the light on: a lit surface, not a lamp. The light in a
// room comes from its rig, and this is what it would be coming out of.
export const LIT = { color: "#f6f8fb", emissive: "#ffffff", emissiveIntensity: 0.9, roughness: 0.9 };

// Evenly spaced stations between two ends, as near the asked pitch as divides
// the run exactly.
export const spaced = (from, to, pitch) => {
  const count = Math.max(1, Math.round((to - from) / pitch));
  return Array.from({ length: count }, (_, i) => from + ((i + 0.5) * (to - from)) / count);
};
