// Silhouette marks stand in for card thumbnails until real /thumbs/*.webp exist.
// Each traces the massing of its building so the card is identifiable at a glance.

function NationalAssemblyMark() {
  return (
    <>
      <path className="m-green" d="M14 56h36l-6-11H20z" />
      <path className="m-green" d="M110 56h36l-6-11h-24z" />
      <rect className="m-stone" x="14" y="56" width="36" height="14" />
      <rect className="m-stone" x="110" y="56" width="36" height="14" />
      <rect className="m-stone" x="56" y="44" width="48" height="26" />
      <path className="m-stone" d="M58 44h44l-4-11H62z" />
      <rect className="m-stone" x="66" y="23" width="28" height="10" />
      <path className="m-green" d="M64 23a16 13 0 0 1 32 0z" />
      <rect className="m-brass" x="79" y="14" width="2" height="6" />
      <rect className="m-stone" x="68" y="57" width="24" height="13" />
      <rect className="m-shade" x="8" y="70" width="144" height="6" />
    </>
  );
}

function AsoRockMark() {
  return (
    <>
      <path className="m-rock" d="M22 70C26 26 48 12 80 12s54 14 58 58z" />
      <rect className="m-stone" x="52" y="40" width="56" height="30" />
      <path className="m-green" d="M56 40a24 15 0 0 1 48 0z" />
      <rect className="m-brass" x="79" y="21" width="2" height="5" />
      <rect className="m-stone" x="14" y="53" width="40" height="17" />
      <rect className="m-stone" x="106" y="53" width="40" height="17" />
      <rect className="m-green" x="13" y="49" width="42" height="5" />
      <rect className="m-green" x="105" y="49" width="42" height="5" />
      <rect className="m-shade" x="8" y="70" width="144" height="6" />
    </>
  );
}

function SupremeCourtMark() {
  return (
    <>
      <rect className="m-brick" x="30" y="27" width="18" height="31" />
      <rect className="m-brick" x="112" y="27" width="18" height="31" />
      <rect className="m-brick" x="48" y="18" width="64" height="40" />
      {[54, 62, 70, 78, 86, 94, 102].map((x) => (
        <rect key={x} className="m-brick-dark" x={x} y="20" width="2" height="36" />
      ))}
      <rect className="m-stone" x="12" y="54" width="136" height="16" />
      <rect className="m-green" x="11" y="50" width="138" height="5" />
      <rect className="m-stone" x="62" y="46" width="36" height="6" />
      <rect className="m-stone" x="66" y="52" width="28" height="18" />
      <rect className="m-shade" x="8" y="70" width="144" height="6" />
    </>
  );
}

function InecMark() {
  return (
    <>
      <rect className="m-stone" x="62" y="16" width="62" height="54" />
      {[62, 71, 80, 89, 98, 107, 116, 122].map((x) => (
        <rect key={x} className="m-shade" x={x} y="14" width="2" height="56" />
      ))}
      <rect className="m-shade" x="60" y="12" width="66" height="4" />
      <rect className="m-shade" x="124" y="14" width="12" height="56" rx="5" />
      <rect className="m-stone" x="22" y="46" width="56" height="24" />
      {[22, 31, 40, 49, 58, 67, 76].map((x) => (
        <rect key={x} className="m-shade" x={x} y="44" width="2" height="26" />
      ))}
      <rect className="m-shade" x="20" y="42" width="60" height="4" />
      <rect className="m-green" x="140" y="52" width="6" height="18" />
      <rect className="m-shade" x="8" y="70" width="144" height="6" />
    </>
  );
}

function GenericMark() {
  return (
    <>
      <rect className="m-stone" x="34" y="38" width="92" height="32" />
      <path className="m-shade" d="M30 38h100l-8-10H38z" />
      {[46, 60, 74, 88, 102, 116].map((x) => (
        <rect key={x} className="m-shade" x={x} y="46" width="6" height="24" />
      ))}
      <rect className="m-shade" x="8" y="70" width="144" height="6" />
    </>
  );
}

const MARKS = {
  "national-assembly": NationalAssemblyMark,
  "aso-rock-villa": AsoRockMark,
  "supreme-court": SupremeCourtMark,
  inec: InecMark,
};

export default function InstitutionMark({ id, muted = false }) {
  const Mark = MARKS[id] ?? GenericMark;
  return (
    <svg
      className={`mark${muted ? " mark-muted" : ""}`}
      viewBox="0 0 160 90"
      role="presentation"
      focusable="false"
    >
      <ellipse className="m-plinth" cx="80" cy="76" rx="66" ry="7" />
      <Mark />
    </svg>
  );
}
