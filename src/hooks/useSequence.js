import { useCallback, useState } from "react";

// A staged sequence the reader either watches or steps through: the bill's
// journey round a building, a sitting inside a chamber. Both players share
// this, so a stage that carries a check behaves the same wherever it is.
//
// `index` is null when nothing is playing. `asking` is a stage's question being
// on screen; `answered` remembers which stages have been settled, so going back
// over one does not ask it twice.
export function useSequence(stages) {
  const [index, setIndex] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [asking, setAsking] = useState(false);
  const [answered, setAnswered] = useState(() => new Set());

  // A view with no sequence is never in one, whatever index the last one left
  // behind: its reset runs after the first render of the new one.
  const active = stages !== null && index !== null;
  const current = active ? stages[index] : null;
  const last = active && index === stages.length - 1;
  const done = active && answered.has(current.id);
  const pending = Boolean(current?.check) && !done;

  const clamp = (i) => Math.max(0, Math.min(stages.length - 1, i));

  const start = useCallback(() => {
    setIndex(0);
    setPlaying(true);
    setAsking(false);
  }, []);

  const exit = useCallback(() => {
    setIndex(null);
    setPlaying(false);
    setAsking(false);
  }, []);

  // Leaving for somewhere else altogether also forgets what was answered.
  const reset = useCallback(() => {
    exit();
    setAnswered(new Set());
  }, [exit]);

  const step = (next) => {
    setIndex(clamp(next));
    setPlaying(false);
    setAsking(false);
  };

  // Relative moves go through the updater: two quick taps on Next both read the
  // same rendered index otherwise, and the second one is lost.
  const nudge = (delta) => {
    // Forward off a stage that still owes its question stops to ask it. Forward
    // again — answered or not — moves on, so the check can be skipped but not
    // missed. Leaving a question this way keeps the sequence playing if it was.
    if (delta > 0 && pending && !asking) {
      setAsking(true);
      return;
    }
    if (delta > 0 && asking) {
      setAsking(false);
      setIndex((i) => clamp(i + delta));
      return;
    }
    // Back from a question returns to the caption it was asked about.
    if (delta < 0 && asking) {
      setAsking(false);
      setPlaying(false);
      return;
    }
    setIndex((i) => clamp(i + delta));
    setPlaying(false);
  };

  // What the sequence does when a stage has had its time.
  const advance = () => {
    if (pending) setAsking(true);
    else if (!last) setIndex((i) => i + 1);
    else setPlaying(false);
  };

  return {
    index,
    active,
    current,
    playing,
    asking,
    done,
    start,
    exit,
    reset,
    step,
    nudge,
    advance,
    togglePlay: () => setPlaying((p) => !p),
    markAnswered: () => setAnswered((set) => new Set(set).add(current.id)),
  };
}
