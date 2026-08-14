// The white Y on Nigeria's coat of arms: the Niger and the Benue meeting at
// Lokoja. Two channels joining into one — which is also what the National
// Assembly does to a bill, so the figure carries the app rather than decorating
// it. The trunk is drawn heavier than the arms: two rivers arrive, one leaves.
//
// `badge` puts the mark on a flag-green tile — the lockup used in the topbar and
// as the favicon, so the tab and the header carry the same drawing. Everywhere
// else the bare stroke inherits `currentColor`.
export default function Confluence({ className = "confluence", badge = false }) {
  return (
    <svg
      className={badge ? `${className} confluence-badge` : className}
      viewBox="0 0 24 24"
      role="presentation"
      focusable="false"
    >
      {badge && <rect className="confluence-tile" width="24" height="24" rx="5.6" />}
      <path className="confluence-channels" d="M5.2 5.9 12 13.2 18.8 5.9" />
      <path className="confluence-trunk" d="M12 13.2V18.8" />
    </svg>
  );
}
