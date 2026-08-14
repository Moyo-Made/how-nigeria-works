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

The page is the white stripe of the flag; the specimen well is the green. Archivo carries
labels and headings, Source Serif 4 carries body copy — the reverse of the usual pairing,
so prose reads like a document rather than UI.

The mark is the confluence from the national coat of arms, where the Niger and the Benue
meet. It recurs as the bill-to-law track: two chambers running as separate channels,
joining at harmonisation, continuing as one law. The trunk is drawn heavier than the two
arms, because two rivers arrive and one leaves. On a flag-green tile it is the favicon and
the topbar lockup; bare, inheriting `currentColor`, it is the inline mark.

## Not in this version

Quiz mode, full Compare, animations beyond bill-to-law, and full content for the State
House of Assembly, LGA Secretariat and INEC. There is no backend, database or auth.
