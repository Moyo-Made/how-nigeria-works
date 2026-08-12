const W = 560;
const H = 44;

// Where the two chambers run before they meet. The bill's own chamber is the
// upper channel; the other chamber is the lower one.
const Y_FIRST = 12;
const Y_OTHER = 32;
const Y_ONE = 22;

// Stage 8 is harmonisation — the point where the two texts become one. Stops
// before it sit on a channel; the rest sit on the single course after the join.
const JOIN_INDEX = 7;

function geometry(count) {
  const left = 14;
  const right = W - 14;
  const joinX = left + ((right - left) * (JOIN_INDEX - 0.5)) / (count - 1);
  const step = (right - left) / (count - 1);

  const stops = Array.from({ length: count }, (_, i) => {
    const x = left + step * i;
    // Only the transmitted-to chamber sits on the lower channel; the readings
    // and committee work all happen in the chamber the bill started in.
    const y = i >= JOIN_INDEX ? Y_ONE : i === JOIN_INDEX - 1 ? Y_OTHER : Y_FIRST;
    return { x, y };
  });

  const upper = `M ${left} ${Y_FIRST} H ${joinX - 18} L ${joinX} ${Y_ONE}`;
  const lower = `M ${left} ${Y_OTHER} H ${joinX - 18} L ${joinX} ${Y_ONE}`;
  const single = `M ${joinX} ${Y_ONE} H ${right}`;

  return { stops, upper, lower, single, joinX, right };
}

export default function BillPlayer({ stages, index, playing, onStep, onNudge, onPlayPause, onExit }) {
  const stage = stages[index];
  const last = index === stages.length - 1;
  const { stops, upper, lower, single, joinX, right } = geometry(stages.length);

  // How far the flow has travelled, as a fraction of the single course after
  // the join. Before the join the channels simply light up stop by stop.
  const afterJoin = Math.max(0, index - JOIN_INDEX) / (stages.length - 1 - JOIN_INDEX);
  const singleLength = right - joinX;

  return (
    <div className="player">
      <div className="player-caption" role="status" aria-live="polite">
        <p className="eyebrow">
          Stage {index + 1} of {stages.length}
        </p>
        <h2>{stage.title}</h2>
        <p>{stage.caption}</p>
      </div>

      <svg className="track" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
        <path className="track-channel" d={upper} />
        <path className="track-channel" d={lower} />
        <path className="track-channel" d={single} />

        {index >= JOIN_INDEX - 1 && <path className="track-flow" d={lower} />}
        <path className="track-flow" d={upper} />
        <path
          className="track-flow"
          d={single}
          strokeDasharray={singleLength}
          strokeDashoffset={singleLength * (1 - afterJoin)}
        />

        <text className="track-label" x="14" y={Y_FIRST - 6}>
          First chamber
        </text>
        <text className="track-label" x="14" y={Y_OTHER + 12}>
          Second chamber
        </text>

        {stops.map(({ x, y }, i) => (
          <g
            key={stages[i].id}
            className="track-stop"
            data-state={i === index ? "current" : i < index ? "done" : undefined}
            onClick={() => onStep(i)}
            role="button"
            tabIndex={0}
            aria-label={`Stage ${i + 1}: ${stages[i].title}`}
            aria-current={i === index || undefined}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onStep(i)}
          >
            <circle cx={x} cy={y} r={i === index ? 5 : 3.5} />
          </g>
        ))}
      </svg>

      <div className="player-buttons">
        <div className="tool-group">
          <button className="tool" onClick={() => onNudge(-1)} disabled={index === 0}>
            Back
          </button>
          <button className="tool" onClick={onPlayPause} disabled={last && !playing} data-on={playing || undefined}>
            {playing ? "Pause" : last ? "Finished" : "Play"}
          </button>
          <button className="tool" onClick={() => onNudge(1)} disabled={last}>
            Next
          </button>
        </div>
        <div className="tool-group">
          <button className="tool" onClick={onExit}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
