// Renders public/favicon.svg to the raster icon iOS and Android ask for.
// The SVG is the master; anything raster in public/ comes from here.
//
//   npm run icons
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(root, "public/favicon.svg");

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

// apple-touch-icon is the only raster the site needs: Safari on iOS ignores an
// SVG favicon when a page is saved to the home screen.
const SIZES = [{ size: 180, name: "apple-touch-icon.png" }];

// Chrome renders a standalone SVG at its intrinsic size, so the mark is wrapped
// in a page sized to the icon and told to fill it.
const mark = readFileSync(source, "utf8");

for (const { size, name } of SIZES) {
  const page = join(tmpdir(), `three-arms-icon-${size}.html`);
  writeFileSync(
    page,
    // iOS rounds the touch icon itself, so the corners behind the mark's own
    // rounding are filled with the same green — otherwise the mask leaves white
    // slivers at the edge.
    `<!doctype html><meta charset="utf-8">
<style>
  html, body { margin: 0; padding: 0; background: #008751; }
  svg { display: block; width: ${size}px; height: ${size}px; }
</style>
${mark}`,
  );

  execFileSync(
    chrome,
    [
      "--headless",
      "--disable-gpu",
      "--hide-scrollbars",
      "--force-device-scale-factor=1",
      `--window-size=${size},${size}`,
      "--virtual-time-budget=2000",
      `--screenshot=${resolve(root, "public", name)}`,
      `file://${page}`,
    ],
    { stdio: ["ignore", "ignore", "ignore"] },
  );
  console.log(`Wrote public/${name} (${size}x${size})`);
}
