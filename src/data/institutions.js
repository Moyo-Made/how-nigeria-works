import data from "./institutions.json";

// Deliberately free of three.js imports — the library screen loads this module
// and must not pay for the 3D engine. Models live in ../three/registry.js.
export const institutions = data;

export const getInstitution = (id) => data.find((i) => i.id === id) ?? null;

export const ARM_ORDER = ["Legislature", "Executive", "Judiciary", "Independent Commission"];

export const byArm = () =>
  ARM_ORDER.map((arm) => ({
    arm,
    items: data.filter((i) => i.arm === arm),
  })).filter((g) => g.items.length > 0);

// The date the app claims for its office holders. Read off the data so the
// footer can never drift from what the facts themselves say.
export const officeHoldersAsOf = () =>
  data.flatMap((i) => (i.keyFacts ?? []).map((f) => f.asOf).filter(Boolean))[0] ?? null;

export const factsNeedingSource = () =>
  data.flatMap((i) =>
    (i.keyFacts ?? [])
      .filter((f) => f.value.includes("[TODO"))
      .map((f) => ({ institution: i.name, label: f.label }))
  );
