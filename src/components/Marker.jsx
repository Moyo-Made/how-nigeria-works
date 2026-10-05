// The ring-and-name on a feature. Kept free of three.js so the styleguide can
// show it without paying for the 3D engine; Hotspots places it in the scene.
//
// The name on the marker is the short one. The full label is still what a
// screen reader hears and what heads the card — "House" is enough to find the
// chamber on the building and not enough to say what it is.
export default function Marker({ hotspot, open = false, onClick }) {
  return (
    <button className="marker" onClick={onClick} aria-expanded={open} aria-label={hotspot.label}>
      <span className="marker-ring" aria-hidden="true" />
      <span className="marker-name" aria-hidden="true">
        {hotspot.short ?? hotspot.label}
      </span>
    </button>
  );
}
