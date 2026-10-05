import { useEffect, useState } from "react";

import Confluence from "./Confluence.jsx";
import Marker from "./Marker.jsx";
import QuickCheck from "./QuickCheck.jsx";
import Steps from "./Steps.jsx";
import sittingStages from "../data/chamberSitting.json";

// The tokens are listed by name only. Their values are read off the page, so
// this cannot fall out of step with index.css the way a copied table would.
const COLOURS = [
  ["Surfaces", ["--paper", "--paper-raised", "--paper-sunk", "--well", "--well-2"]],
  ["Ink", ["--ink", "--ink-2", "--ink-3"]],
  ["Green", ["--green", "--green-fill", "--green-bright", "--green-pale"]],
  ["Accents", ["--brass", "--indigo"]],
  ["Arms", ["--arm-legislature", "--arm-executive", "--arm-judiciary", "--arm-commission"]],
  ["Feedback", ["--positive", "--caution", "--info"]],
  ["On the well", ["--on-well", "--on-well-1", "--on-well-2", "--on-well-3", "--well-line", "--well-line-strong"]],
  ["Lines", ["--line", "--line-strong"]],
];

const TYPE = [
  ["--text-4xl", "Panel title"],
  ["--text-3xl", "Empty-stage title"],
  ["--text-2xl", "Caption title"],
  ["--text-xl", "Card title, quote"],
  ["--text-lg", "Lede"],
  ["--text-md", "Body"],
  ["--text-base", "Controls, card body"],
  ["--text-sm", "Tools"],
  ["--text-xs", "Notes, sub-labels"],
  ["--text-2xs", "Eyebrow, marker name"],
];

const SPACE = ["--space-1", "--space-2", "--space-3", "--space-4", "--space-5", "--space-6", "--space-7", "--space-8"];
const RADII = ["--r-sm", "--r-md", "--r-lg", "--r-pill"];
const MOTION = ["--dur-fast", "--dur-base", "--dur-slow", "--ease-out"];
const LEADING = ["--lh-tight", "--lh-snug", "--lh-body", "--lh-prose"];
const TRACKING = ["--track-caps", "--track-label", "--track-tight"];

const ALL = [
  ...COLOURS.flatMap(([, names]) => names),
  ...TYPE.map(([name]) => name),
  ...SPACE,
  ...RADII,
  ...MOTION,
  ...LEADING,
  ...TRACKING,
];

function useTokens() {
  const [values, setValues] = useState({});

  useEffect(() => {
    const style = getComputedStyle(document.documentElement);
    setValues(Object.fromEntries(ALL.map((name) => [name, style.getPropertyValue(name).trim()])));
  }, []);

  return values;
}

const MARKER = {
  label: "The Senate (Red Chamber)",
  short: "Senate",
};

// Taken from the Senate sitting's own first stage rather than written for the
// page, so the sample makes no claim the app does not already make.
const CHECK = {
  question: "Who lays the mace on the table?",
  options: ["The President of the Senate", "The Sergeant-at-Arms", "The Clerk"],
  answer: 1,
  explain:
    "The Sergeant-at-Arms carries the mace in ahead of the President of the Senate and lays it on the table. Only then is the chamber in session.",
};

function Section({ title, note, children }) {
  return (
    <section className="sg-section">
      <h2>{title}</h2>
      {note && <p>{note}</p>}
      {children}
    </section>
  );
}

const Sub = ({ children }) => <p className="eyebrow sg-sub">{children}</p>;

export default function Styleguide() {
  const tokens = useTokens();
  const [stage, setStage] = useState(2);
  const [checkKey, setCheckKey] = useState(0);

  return (
    <main className="sg">
      <p className="eyebrow">Three Arms &middot; design system</p>
      <h1>Night green</h1>
      <p className="sg-lede">
        The page is a dark green desk; the specimen well is set into it and is the deepest surface.
        Archivo carries labels and headings, Source Serif 4 carries prose. Everything below is built
        from the classes the app itself uses.
      </p>

      <Section title="Colour" note="Every colour has a name. Nothing outside :root sets a raw one.">
        {COLOURS.map(([group, names]) => (
          <div key={group}>
            <Sub>{group}</Sub>
            <div className="sg-grid">
              {names.map((name) => (
                <div className="sg-swatch" key={name}>
                  <div className="sg-chip" style={{ background: `var(${name})` }} />
                  <div className="sg-meta">
                    <code>{name}</code>
                    <span>{tokens[name]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </Section>

      <Section title="Type" note="One scale of ten sizes. Display is Archivo; text is Source Serif 4.">
        <Sub>Scale</Sub>
        <div className="sg-rows">
          {TYPE.map(([name, use]) => (
            <div className="sg-row" key={name}>
              <div>
                <code>{name}</code>
                <span>
                  {tokens[name]} &middot; {use}
                </span>
              </div>
              <p style={{ fontSize: `var(${name})` }}>Two chambers, one law</p>
            </div>
          ))}
        </div>

        <Sub>Voices</Sub>
        <div className="sg-demo">
          <div>
            <p className="eyebrow">Eyebrow &middot; tracked caps</p>
            <h1 style={{ fontSize: "var(--text-4xl)", marginTop: 7 }}>National Assembly</h1>
            <p className="panel-tagline">Where the nation&rsquo;s laws are made</p>
            <p className="panel-lede" style={{ maxWidth: "46ch" }}>
              Prose is set in the serif so it reads like a document rather than an interface.
            </p>
          </div>
        </div>

        <Sub>Leading and tracking</Sub>
        <div className="sg-grid">
          {[...LEADING, ...TRACKING].map((name) => (
            <div className="sg-swatch" key={name}>
              <div className="sg-meta">
                <code>{name}</code>
                <span>{tokens[name]}</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Space, radius, motion">
        <Sub>Space</Sub>
        <div className="sg-rows">
          {SPACE.map((name) => (
            <div className="sg-row" key={name}>
              <div>
                <code>{name}</code>
                <span>{tokens[name]}</span>
              </div>
              <div className="sg-bar" style={{ width: `calc(var(${name}) * 4)` }} />
            </div>
          ))}
        </div>

        <Sub>Radius</Sub>
        <div className="sg-grid">
          {RADII.map((name) => (
            <div className="sg-swatch" key={name}>
              <div className="sg-meta">
                <div className="sg-box" style={{ borderRadius: `var(${name})`, marginBottom: 8 }} />
                <code>{name}</code>
                <span>{tokens[name]}</span>
              </div>
            </div>
          ))}
        </div>

        <Sub>Motion</Sub>
        <div className="sg-grid">
          {MOTION.map((name) => (
            <div className="sg-swatch" key={name}>
              <div className="sg-meta">
                <code>{name}</code>
                <span>{tokens[name]}</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Controls" note="Tools live on the desk below the well; one filled action per view.">
        <div className="sg-demo">
          <div className="tool-group">
            <button className="tool">Isolate</button>
            <button className="tool" data-on>
              Auto-rotate
            </button>
            <button className="tool" disabled>
              Break open
            </button>
          </div>
          <button className="cta">
            <span className="cta-play" aria-hidden="true" />
            Watch a sitting
          </button>
          <button className="btn">Button</button>
          <button className="hotspot-go">Step inside &rarr;</button>
        </div>
      </Section>

      <Section
        title="Marker"
        note="A ring on the feature and its name beside it. The name is the short one; the card carries the full label."
      >
        <div className="sg-demo" data-ground="well">
          <div className="sg-marker">
            <div className="hotspot" data-side="right">
              <Marker hotspot={MARKER} />
            </div>
          </div>

          <div className="sg-marker">
            <div className="hotspot" data-side="right" data-behind="true">
              <Marker hotspot={{ label: "The Green Dome", short: "Green Dome" }} />
            </div>
          </div>

          <div className="sg-marker" data-open>
            <div className="hotspot" data-side="right" data-open>
              <Marker hotspot={MARKER} open />
              <div className="hotspot-card">
                <button className="hotspot-close" aria-label="Close">
                  &times;
                </button>
                <h2>{MARKER.label}</h2>
                <p>109 senators. Every state sends three, regardless of size.</p>
                <button className="hotspot-go">Step inside &rarr;</button>
              </div>
            </div>
          </div>
        </div>
        <p className="sg-caption">Rest &middot; hidden behind the model &middot; open</p>
      </Section>

      <Section
        title="Steps and caption"
        note="A line cut into its stops. The caption names what comes next instead of counting."
      >
        <div className="sg-demo" data-ground="well">
          <div className="player">
            <div className="player-caption">
              <p className="eyebrow">
                {stage === sittingStages.length - 1
                  ? "Last stage"
                  : `Next · ${sittingStages[stage + 1].title}`}
              </p>
              <h2>{sittingStages[stage].title}</h2>
              <p>{sittingStages[stage].caption}</p>
            </div>
            <Steps stages={sittingStages} index={stage} onStep={setStage} />
            <div className="player-buttons">
              <div className="tool-group">
                <button className="tool" disabled={stage === 0} onClick={() => setStage(stage - 1)}>
                  Back
                </button>
                <button
                  className="tool"
                  disabled={stage === sittingStages.length - 1}
                  onClick={() => setStage(stage + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section
        title="Quick check"
        note="One question about the stage just watched. A wrong answer is brass, not red, and gets the same explanation."
      >
        <div className="sg-demo" data-ground="well">
          <QuickCheck key={checkKey} check={CHECK} />
        </div>
        <p className="sg-caption">
          <button className="btn" onClick={() => setCheckKey((k) => k + 1)}>
            Reset the check
          </button>
        </p>
      </Section>

      <Section title="Panel and cards">
        <div className="sg-demo">
          <aside className="panel">
            <p className="eyebrow">Legislature &middot; Federal</p>
            <h1>National Assembly</h1>
            <section className="panel-section">
              <h2>Key facts</h2>
              <dl className="facts">
                <div className="fact">
                  <dt>Senate</dt>
                  <dd>
                    109 senators <cite className="fact-source">s. 48</cite>
                  </dd>
                </div>
                <div className="fact">
                  <dt>Unverified</dt>
                  <dd>
                    A fact with a gap in it
                    <span className="fact-pending">Not yet verified in full</span>
                  </dd>
                </div>
              </dl>
            </section>
            <section className="panel-section" data-tone="power">
              <h2>Why it matters</h2>
              <p>The tinted card marks what this arm can do.</p>
            </section>
          </aside>

          <div className="explore-grid" style={{ flex: 1, minWidth: 240 }}>
            <div className="ecard" data-arm="judiciary">
              <p className="eyebrow">The limit</p>
              <h3>What holds it in check</h3>
              <p>A card takes its accent from the arm it speaks for.</p>
            </div>
            <div className="ecard ecard-quote">
              <Confluence />
              <p>Two chambers, one law.</p>
            </div>
          </div>
        </div>
      </Section>
    </main>
  );
}
