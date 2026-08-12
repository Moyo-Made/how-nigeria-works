const Icon = ({ d, flip }) => (
  <svg
    className="icon"
    viewBox="0 0 16 16"
    aria-hidden="true"
    focusable="false"
    style={flip ? { transform: "scaleX(-1)" } : undefined}
  >
    <path d={d} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const TURN = "M12.7 6.6A5 5 0 1 0 13 8M12.7 6.6H9.4M12.7 6.6V3.3";
const MINUS = "M4 8h8";
const PLUS = "M4 8h8M8 4v8";

function Nudge({ label, onClick, ...icon }) {
  return (
    <button className="tool tool-icon" onClick={onClick} aria-label={label} title={label}>
      <Icon {...icon} />
    </button>
  );
}

function Toggle({ label, on, disabled, note, onClick }) {
  return (
    <button
      className="tool"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={disabled ? undefined : on}
      data-on={on || undefined}
      title={note}
    >
      {label}
    </button>
  );
}

export default function StageControls({
  autoRotate,
  isolate,
  exploded,
  canExplode,
  hasAnimation,
  onRotate,
  onZoom,
  onToggle,
  onReset,
  onPlayAnimation,
}) {
  return (
    <div className="toolbar" role="group" aria-label="Model controls">
      <div className="tool-group">
        <Nudge label="Rotate left" d={TURN} onClick={() => onRotate(-1)} />
        <Nudge label="Rotate right" d={TURN} flip onClick={() => onRotate(1)} />
        <Nudge label="Zoom out" d={MINUS} onClick={() => onZoom(-1)} />
        <Nudge label="Zoom in" d={PLUS} onClick={() => onZoom(1)} />
      </div>

      <div className="tool-group">
        <Toggle
          label="Isolate"
          on={isolate}
          note="Hide the plinth and markers and show the building alone"
          onClick={() => onToggle("isolate")}
        />
        <Toggle
          label="Break open"
          on={exploded}
          disabled={!canExplode}
          note={
            canExplode
              ? "Separate the building into its parts"
              : "This model is a single piece and cannot be taken apart"
          }
          onClick={() => onToggle("exploded")}
        />
        <Toggle label="Compare" disabled note="Comparing two institutions comes in a later version" />
        <Toggle label="Auto-rotate" on={autoRotate} onClick={() => onToggle("autoRotate")} />
      </div>

      <div className="tool-group">
        <button className="tool" onClick={onReset}>
          Reset
        </button>
      </div>

      <span className="tool-spacer" />

      {hasAnimation && (
        <button className="cta" onClick={onPlayAnimation}>
          <span className="cta-play" aria-hidden="true" />
          How a bill becomes law
        </button>
      )}
    </div>
  );
}
