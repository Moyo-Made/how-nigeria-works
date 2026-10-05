import QuickCheck from "./QuickCheck.jsx";
import Steps from "./Steps.jsx";

// A separate player from the bill's, and deliberately so. That track is the
// confluence — two chambers running as two channels and meeting where they
// agree — which is the right drawing for a bill's whole journey and the wrong
// one for this. Inside one chamber there is only ever one course, and borrowing
// the confluence here would draw a claim the sequence does not make.
//
// A stage may carry a check: one question about what was just shown. It takes
// the caption's place rather than joining it, because the caption is where the
// answer was.
export default function SittingPlayer({
  stages,
  index,
  playing,
  asking,
  answered,
  onStep,
  onNudge,
  onPlayPause,
  onAnswered,
  onExit,
}) {
  const stage = stages[index];
  const last = index === stages.length - 1;
  const pending = Boolean(stage.check) && !answered;

  return (
    <div className="player">
      {asking ? (
        <QuickCheck key={stage.id} check={stage.check} onAnswered={onAnswered} />
      ) : (
        <div className="player-caption" role="status" aria-live="polite">
          {/* What comes next, by name: the line above already shows how far
              along this is, and a count would only say it again. */}
          <p className="eyebrow">{last ? "Last stage" : `Next · ${stages[index + 1].title}`}</p>
          <h2>{stage.title}</h2>
          <p>
            {stage.caption}
            {stage.source && <cite className="fact-source">{stage.source}</cite>}
          </p>
        </div>
      )}

      <Steps stages={stages} index={index} onStep={onStep} />

      <div className="player-buttons">
        <div className="tool-group">
          <button className="tool" onClick={() => onNudge(-1)} disabled={index === 0 && !asking}>
            Back
          </button>
          <button
            className="tool"
            onClick={onPlayPause}
            disabled={(last && !playing) || asking}
            data-on={playing || undefined}
          >
            {playing ? "Pause" : last ? "Finished" : "Play"}
          </button>
          <button className="tool" onClick={() => onNudge(1)} disabled={last && !pending && !asking}>
            {asking ? (answered ? (last ? "Done" : "Continue") : "Skip") : "Next"}
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
