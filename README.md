# Three Arms

*How Nigeria's government works.* The name is Abuja's Three Arms Zone — the district
holding the Presidential Villa, the National Assembly and the Supreme Court, which are the
three landmarks the app opens on.

An interactive 3D explainer of Nigeria's federal government — the three arms, the three
tiers, and how a bill becomes law. Each institution is presented as a landmark on a
plinth that you can orbit, take apart and read about.

Built as a civic education tool. It is not affiliated with the Government of Nigeria.

## Accuracy

This is civic education, so a wrong fact here is worse than a missing one. Two rules hold
throughout:

- **Every constitutional claim carries its section.** Facts in the panel show the section
  of the Constitution of the Federal Republic of Nigeria 1999 (as amended) they come from
  — `s. 48`, `s. 230(2)`, `s. 292(1)` and so on — so a reader can check rather than trust.
- **Anything unverified says so.** A fact whose value contains `[TODO: verify …]` renders
  the verified part of the sentence and a visible "not yet verified" marker in its place.
  It never prints a confident-sounding guess. `factsNeedingSource()` in
  `src/data/institutions.js` lists any that remain.

Facts about **who currently holds an office** carry an `asOf` date, because they age in a
way that constitutional facts do not. Check them before each deploy.

The 3D models are schematic. Marker positions show how parts of a complex sit in relation
to one another; they are not a floor plan.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run lint
npm run og       # redraw public/og.png from tools/og.html
npm run icons    # redraw public/apple-touch-icon.png from public/favicon.svg
```

`og` and `icons` shell out to headless Chrome, which is not a dependency — set
`CHROME_PATH` if it is not in the usual place. Neither runs as part of `build`;
the outputs are committed, so you only run them when the card or the mark changes.

## How it is put together

| Path | What lives there |
| --- | --- |
| `src/data/institutions.json` | Every institution: facts, sources, hotspots, prose |
| `src/data/billToLaw.json` | The ten stages of the bill-to-law animation |
| `src/components/` | The shell — rail, stage controls, panel, bill player |
| `src/three/` | Scene rig, plinth, per-institution models, animation |
| `src/three/registry.js` | Maps an institution to its model chunk |

**Adding a model.** Drop `<institution-id>.glb` into `public/models/`. `ModelSlot` probes
for it and swaps it in for the procedural stand-in automatically — no code change. Models
are lazily loaded per institution and the GLTF loader itself is behind `lazy()`, so
nothing 3D is downloaded until it is needed. Draco decoding is self-hosted in
`public/draco/` rather than pulled from a CDN.

If a model should support **Break open**, the pipeline must emit separate nodes per
massing element. A single merged mesh cannot be taken apart, and the control disables
itself and says so rather than doing nothing.

## Design

The page is a night-green desk; the specimen well is set into it and is the deepest
surface. Archivo carries labels and headings, Source Serif 4 carries body copy — the
reverse of the usual pairing, so prose reads like a document rather than UI.

The mark is the confluence from the national coat of arms, where the Niger and the Benue
meet. It recurs as the bill-to-law track: two chambers running as separate channels,
joining at harmonisation, continuing as one law. The trunk is drawn heavier than the two
arms, because two rivers arrive and one leaves. On a flag-green tile it is the favicon and
the topbar lockup; bare, inheriting `currentColor`, it is the inline mark.

### The system

Everything is in `src/index.css`, and the whole of it is laid out live at
**`/#/styleguide`** — every token with its current value, and every component in each of
its states. Nothing links there; type it.

Tokens, all on `:root`:

| Group | Tokens |
| --- | --- |
| Surfaces and ink | `--paper`, `--paper-raised`, `--paper-sunk`, `--well`, `--well-2`, `--ink`, `--ink-2`, `--ink-3` |
| Colour | `--green`, `--green-fill`, `--green-bright`, `--green-pale`, `--brass`, `--indigo` |
| Arms | `--arm-legislature`, `--arm-executive`, `--arm-judiciary`, `--arm-commission` |
| Feedback | `--positive`, `--caution`, `--info` — a wrong answer is brass, never red |
| On the well | `--on-well`, `--on-well-1` to `-3`, `--well-line`, `--well-line-strong` |
| Type | `--text-2xs` (10px) to `--text-4xl` (27px), ten steps; `--lh-*`; `--track-*` |
| Space | `--space-1` (4px) to `--space-8` (32px) |
| Shape and depth | `--r-sm`, `--r-md`, `--r-lg`, `--r-pill`, `--shadow-marker`, `--shadow-card` |
| Motion | `--dur-fast`, `--dur-base`, `--dur-slow`, `--ease-out` |

Two rules: **no font size in px and no raw colour outside `:root`.** (The one exception is
the 8-unit label inside the track SVG, which is in viewBox units, not pixels.) Existing
paddings have not all been moved onto the space scale yet; new work should use it.

Components: eyebrow, button, tool group, call to action, rail, panel and facts, explore
card, player and track, hotspot card, and three added with the system —

- **Marker** (`Marker.jsx`) — a ring on the feature with its name beside it in tracked
  capitals, after the way NASA's *Eyes on the Solar System* labels a body. It replaces the
  numbered dot. A hotspot may carry a `short` name for the marker; the card and screen
  readers keep the full `label`.
- **Steps** (`Steps.jsx`) — a sequence as one line cut into its stops, each known by its
  title. The caption above it names the stage that comes next rather than counting.
- **Quick check** (`QuickCheck.jsx`) — one question, answered once, with the same
  explanation whether the pick was right or wrong.

**Checks in a sitting.** A stage in `chamberSitting.json` or `chamberSittingHouse.json` may
carry `check: { question, options, answer, explain, source }`. The sequence stops on that
stage to ask it; it can be skipped but not missed. A check is only written where the
Constitution gives the answer, and `source` is the section — the accuracy rules above
apply to questions exactly as they do to facts.

## Not in this version

Quiz mode, full Compare, animations beyond bill-to-law, and full content for the State
House of Assembly, LGA Secretariat and INEC. There is no backend, database or auth.
