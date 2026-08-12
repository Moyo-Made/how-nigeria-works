import { useEffect, useRef } from "react";

// A fact may be wholly unsourced or only partly so, e.g. "...a number of
// Justices set by the Constitution [TODO: verify the maximum]". The verified
// half is worth showing, so the marker is stripped and replaced by a visible
// gap rather than swallowing the whole entry.
const TODO = /\s*\[TODO:[^\]]*\]/i;

function Fact({ label, value, source, asOf }) {
  const pending = TODO.test(value);
  const verified = value.replace(TODO, "").trim();

  return (
    <div className="fact">
      <dt>{label}</dt>
      <dd>
        {verified}
        {/* The section of the Constitution the fact comes from, so a reader can
            check it rather than take the app's word for it. */}
        {source && <cite className="fact-source">{source}</cite>}
        {/* Who holds an office changes; what the office is does not. Dating the
            first kind in place means a stale name reads as out of date rather
            than as wrong. */}
        {asOf && <cite className="fact-source">as of {asOf}</cite>}
        {pending && (
          <span className="fact-pending">
            {verified ? "Not yet verified in full" : "Awaiting a verified source"}
          </span>
        )}
      </dd>
    </div>
  );
}

export default function ContentPanel({ institution }) {
  const { id, name, tagline, arm, tier, description, keyFacts = [], whyItMatters, modelNote } =
    institution;

  const panel = useRef();

  // The panel scrolls inside itself, so moving to another institution would
  // otherwise open it half way down the previous one's text.
  useEffect(() => {
    panel.current?.scrollTo(0, 0);
  }, [id]);

  return (
    <aside className="panel" ref={panel} aria-label={`About ${name}`}>
      <p className="eyebrow">
        {arm} &middot; {tier}
      </p>
      <h1>{name}</h1>
      <p className="panel-tagline">{tagline}</p>

      {description && <p className="panel-lede">{description}</p>}

      {keyFacts.length > 0 && (
        <section className="panel-section">
          <h2>Key facts</h2>
          <dl className="facts">
            {keyFacts.map((fact) => (
              <Fact key={fact.label} {...fact} />
            ))}
          </dl>
        </section>
      )}

      {whyItMatters && (
        <section className="panel-section" data-tone="power">
          <h2>Why it matters</h2>
          <p>{whyItMatters}</p>
        </section>
      )}

      {modelNote && <p className="panel-note">{modelNote}</p>}
    </aside>
  );
}
