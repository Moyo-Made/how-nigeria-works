const W = 560;
const H = 34;
const Y = 17;

// A separate player from the bill's, and deliberately so. That track is the
// confluence — two chambers running as two channels and meeting where they
// agree — which is the right drawing for a bill's whole journey and the wrong
// one for this. Inside one chamber there is only ever one course, and borrowing
// the confluence here would draw a claim the sequence does not make.
export default function SittingPlayer({
  stages,
  index,
  playing,
  onStep,
  onNudge,
  onPlayPause,
  onExit,
}) {
  const stage = stages[index];
  const last = index === stages.length - 1;

  const left = 14;
  const right = W - 14;
  const step = (right - left) / (stages.length - 1);
  const line = `M ${left} ${Y} H ${right}`;
  const length = right - left;
  const travelled = index / (stages.length - 1);

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
        <path className="track-channel" d={line} />
        <path
          className="track-flow"
          d={line}
          strokeDasharray={length}
          strokeDashoffset={length * (1 - travelled)}
        />

        {stages.map((s, i) => (
          <g
            key={s.id}
            className="track-stop"
            data-state={i === index ? "current" : i < index ? "done" : undefined}
            onClick={() => onStep(i)}
            role="button"
            tabIndex={0}
            aria-label={`Stage ${i + 1}: ${s.title}`}
            aria-current={i === index || undefined}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onStep(i)}
          >
            <circle cx={left + step * i} cy={Y} r={i === index ? 5 : 3.5} />
          </g>
        ))}
      </svg>

      <div className="player-buttons">
        <div className="tool-group">
          <button className="tool" onClick={() => onNudge(-1)} disabled={index === 0}>
            Back
          </button>
          <button
            className="tool"
            onClick={onPlayPause}
            disabled={last && !playing}
            data-on={playing || undefined}
          >
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
