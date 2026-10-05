import { lazy } from "react";

// Every model is its own chunk, so opening one institution never downloads
// another's geometry. Each entry is the procedural stand-in used until a real
// GLB of the same id is dropped into /public/models.
const PRIMITIVES = {
  "national-assembly": { load: () => import("./NationalAssembly.jsx"), scale: 0.55 },
  "aso-rock-villa": { load: () => import("./AsoRockVilla.jsx"), scale: 0.46 },
  "supreme-court": { load: () => import("./SupremeCourt.jsx"), scale: 0.52 },
  inec: { load: () => import("./Inec.jsx"), scale: 0.5 },
};

const FALLBACK = { load: () => import("./PlaceholderBuilding.jsx"), scale: 1 };

const entry = (id) => PRIMITIVES[id] ?? FALLBACK;

// lazy() must return the same component identity across renders or React
// remounts the model on every frame-triggered re-render.
const wrapped = new Map();

export function getPrimitive(id) {
  if (!wrapped.has(id)) wrapped.set(id, lazy(entry(id).load));
  return { Component: wrapped.get(id), scale: entry(id).scale };
}

export const preloadPrimitive = (id) => entry(id).load();

export const modelUrl = (id) => `${import.meta.env.BASE_URL}models/${id}.glb`;

// Resolved once per id and remembered, so returning to a specimen never re-probes.
const probes = new Map();

export function probeGlb(id) {
  if (!probes.has(id)) {
    const url = modelUrl(id);
    probes.set(
      id,
      fetch(url, { method: "HEAD" })
        // A static host that rewrites unknown paths to index.html answers 200
        // with HTML, so the content type is the real test for "a GLB is here".
        .then((res) => res.ok && !(res.headers.get("content-type") ?? "").includes("text/html"))
        .catch(() => false)
    );
  }
  return probes.get(id);
}
