// Where you are in a sequence, and the way to anywhere else in it. Each stop is
// a segment of one line: filled behind you, bright where you are. A stop is
// known by its title, never by its number — the title is what you hear and
// what you get on hover.
export default function Steps({ stages, index, onStep }) {
  return (
    <ol className="steps">
      {stages.map((s, i) => (
        <li key={s.id}>
          <button
            className="step"
            data-state={i === index ? "current" : i < index ? "done" : undefined}
            aria-current={i === index ? "step" : undefined}
            aria-label={s.title}
            title={s.title}
            onClick={() => onStep?.(i)}
          />
        </li>
      ))}
    </ol>
  );
}
