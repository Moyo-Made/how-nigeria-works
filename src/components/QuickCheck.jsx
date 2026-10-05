import { useState } from "react";

// One question, answered once. A wrong pick is not a dead end: the right
// answer is shown beside it and the explanation is the same either way,
// because the point is that the reader leaves knowing, not that they scored.
//
// `check` is { question, options: string[], answer: index, explain, source? }.
export default function QuickCheck({ check, onAnswered }) {
  const [picked, setPicked] = useState(null);
  const answered = picked !== null;
  const right = picked === check.answer;

  const pick = (i) => {
    setPicked(i);
    onAnswered?.(i === check.answer);
  };

  return (
    <div className="check">
      <p className="eyebrow">Quick check</p>
      <h2>{check.question}</h2>

      <div className="check-options">
        {check.options.map((option, i) => (
          <button
            key={option}
            className="check-option"
            disabled={answered}
            data-state={
              !answered ? undefined : i === check.answer ? "correct" : i === picked ? "wrong" : undefined
            }
            onClick={() => pick(i)}
          >
            {option}
          </button>
        ))}
      </div>

      {answered && (
        <p className="check-feedback" role="status" data-tone={right ? "correct" : "wrong"}>
          <strong>{right ? "That's it." : "Not quite."}</strong> {check.explain}
          {check.source && <cite className="fact-source">{check.source}</cite>}
        </p>
      )}
    </div>
  );
}
