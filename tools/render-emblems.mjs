// Renders the emblems in tools/emblems/ to the transparent PNGs the chamber
// uses as textures. The SVGs are the masters; anything raster in
// public/textures/ comes from here.
//
//   npm run emblems
//
// Same approach as render-icons.mjs — headless Chrome, no dependencies — so the
// build stays installable anywhere without a native image toolchain.
//
// Why a texture and not geometry: the emblem is organic — an eagle, two horses,
// a wreath — and those do not reduce to primitives at any sane triangle count.
// Extruding real vector art was the other option and it is worse: the published
// SVGs of the arms run to 226 paths and 380 KB of path data, which becomes
// hundreds of thousands of triangles for something read at a couple of hundred
// pixels on screen.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = resolve(root, "public/textures");

const CANDIDATES = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);

const chrome = CANDIDATES.find((path) => existsSync(path));

if (!chrome) {
  console.error(
    "Could not find Chrome. Set CHROME_PATH to a Chrome or Chromium binary and run again.",
  );
  process.exit(1);
}

// Square, power-of-two, and generous enough that the emblem still holds up when
// a viewer walks the camera right up to the dais wall.
const EMBLEMS = [
  { source: "coat-of-arms.svg", name: "coat-of-arms.png", size: 1024 },
  { source: "seal-house.svg", name: "seal-house.png", size: 1024 },
  { source: "seal-senate.svg", name: "seal-senate.png", size: 1024 },
];

// Both chambers' seals carry the arms, and the arms have one master. So a seal
// names it with <include href x y width height /> rather than holding a copy,
// and it is inlined here as a nested <svg> placed in that box — a copy pasted
// into each seal would be three drawings of the arms free to drift apart.
const inline = (svg) =>
  svg.replace(
    /<include href="([^"]+)" x="([^"]+)" y="([^"]+)" width="([^"]+)" height="([^"]+)"\s*\/>/g,
    (_, href, x, y, width, height) =>
      readFileSync(resolve(root, "tools/emblems", href), "utf8").replace(
        /<svg\b([^>]*)>/,
        (_, attrs) =>
          `<svg${attrs.replace(/\s(width|height)="[^"]*"/g, "")} x="${x}" y="${y}" width="${width}" height="${height}">`,
      ),
  );

mkdirSync(outDir, { recursive: true });

for (const { source, name, size } of EMBLEMS) {
  const svg = inline(readFileSync(resolve(root, "tools/emblems", source), "utf8"));
  const page = join(tmpdir(), `three-arms-emblem-${name}.html`);

  // The emblem is drawn wider than it is tall, so it is letterboxed into a
  // square canvas: a square texture keeps the sampling even, and the mesh it
  // maps onto is squared off to match.
  writeFileSync(
    page,
    `<!doctype html><meta charset="utf-8">
<style>
  html, body { margin: 0; padding: 0; background: transparent; }
  body { width: ${size}px; height: ${size}px; display: grid; place-items: center; }
  body > svg { display: block; width: ${size}px; height: auto; }
</style>
${svg}`,
  );

  execFileSync(
    chrome,
    [
      "--headless",
      "--disable-gpu",
      "--hide-scrollbars",
      "--force-device-scale-factor=1",
      "--default-background-color=00000000",
      `--window-size=${size},${size}`,
      "--virtual-time-budget=2000",
      `--screenshot=${join(outDir, name)}`,
      `file://${page}`,
    ],
    { stdio: ["ignore", "ignore", "ignore"] },
  );

  console.log(`Wrote public/textures/${name} (${size}x${size})`);
}
