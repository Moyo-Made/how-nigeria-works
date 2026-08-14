// Renders tools/og.html to public/og.png at exactly 1200x630.
//
// The card was previously a flat PNG with no source, so changing a word in it
// meant redrawing the whole thing. Headless Chrome is used rather than a
// rendering library because the card wants the same Google Fonts the site
// loads, and the browser already knows how to fetch and shape them.
//
//   npm run og
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(root, "tools/og.html");
const out = resolve(root, "public/og.png");

// Chrome is not a dependency of this project, so look for it where each
// platform keeps it and say something useful if it is not there.
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

execFileSync(
  chrome,
  [
    "--headless",
    "--disable-gpu",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    "--window-size=1200,630",
    // The card waits on webfonts; without a budget Chrome can shoot before
    // Archivo and Source Serif land and the card renders in a fallback face.
    "--virtual-time-budget=6000",
    `--screenshot=${out}`,
    `file://${source}`,
  ],
  { stdio: ["ignore", "ignore", "ignore"] },
);

console.log("Wrote public/og.png (1200x630)");
