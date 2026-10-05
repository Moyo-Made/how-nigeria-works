import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { Emblem } from "./ChamberElevation.jsx";
import { useChamber } from "./chamberContext.js";

// The walls round the seating: fluted timber up to the band line, and set into
// it, pairs of tall backlit panels printed with one of two designs.
//
// Both rooms have the panels and both use the same two designs — a mirrored
// pair with a gavel, and a mirrored pair of linked rectangles — printed red on
// pink in the Senate and green on a pale green-white in the House (Figueras
// gallery images r03, r05, r08 and r09 of the red chamber, g01, g03 and g06 of
// the green). The House frames each pair between cherry pilasters; the Senate
// sets them straight into the fluting.
// https://figueras.com/project/national-assembly-of-nigeria/
//
// Where they are comes from wider photographs than the contractor's, taken from
// the galleries with the rooms in session:
//
//   Senate  three pairs a side between the tower and the balcony, linked
//           rectangles, gavel, linked rectangles going away from the chair. The
//           first two are on the wall behind the chair, outboard of the door;
//           the third is on the side wall.
//           https://www.lindaikejisblog.com/photos/shares/eedsd_1714480944.PNG
//   House   two a side, both on the side wall. The one nearer the balcony
//           stands in the foot of a tower like the one behind the Speaker — two
//           cherry piers to the ceiling with the coat of arms between them above
//           the band (gallery image g03, and both press photographs below).
//           https://dailytrust.com/wp-content/uploads/2024/10/house-of-reps.webp
//           https://www.pegasusreporters.com/wp-content/uploads/2024/05/The-Nigerian-Federal-House-of-Representative-in-session.png
//
// How far along each wall they stand is by eye. On the wall behind the chair it
// is in band heights off the centre line, like everything else on that wall; on
// a side wall it is a fraction of the wall's length from the dais end.
const PANELS = {
  senate: {
    framed: false,
    band: "oak",
    dais: [[1.55, "circuit"], [2.45, "gavel"]],
    side: [{ at: 0.5, design: "circuit" }],
  },
  house: {
    framed: true,
    band: "cherry",
    dais: [],
    side: [
      { at: 0.3, design: "circuit" },
      { at: 0.72, design: "gavel", tower: true },
    ],
  },
};

const PANEL_W = 1.0;
const MULLION = 0.08;

// The two designs, traced by eye from r09 and g06 and simplified to the lines
// that carry at the distance they are read from. Drawn for the left panel of a
// pair; the right panel is the same drawing mirrored, as it is on the wall.
function drawGavel(ctx, w, h) {
  const box = (x0, y0, x1, y1, fill = false) =>
    fill ? ctx.fillRect(x0 * w, y0 * h, (x1 - x0) * w, (y1 - y0) * h) : ctx.strokeRect(x0 * w, y0 * h, (x1 - x0) * w, (y1 - y0) * h);

  // a tall outline down the inner edge, with a filled square near its top
  box(0.52, 0.03, 0.84, 0.64);
  box(0.6, 0.06, 0.76, 0.1, true);

  // the gavel: a head across the panel, the handle running down and out
  ctx.save();
  ctx.translate(0.42 * w, 0.3 * h);
  ctx.rotate(-0.7);
  ctx.fillRect(-0.24 * w, -0.08 * w, 0.48 * w, 0.16 * w);
  ctx.fillRect(-0.05 * w, 0.08 * w, 0.1 * w, 0.55 * w);
  ctx.restore();

  // a bar and an outline below it
  box(0.12, 0.45, 0.84, 0.48, true);
  box(0.12, 0.51, 0.84, 0.6);
}

function drawCircuit(ctx, w, h) {
  const line = (points) => {
    ctx.beginPath();
    points.forEach(([x, y], i) => (i ? ctx.lineTo(x * w, y * h) : ctx.moveTo(x * w, y * h)));
    ctx.stroke();
  };
  const box = (x, y, bw, bh, fill = false) =>
    fill ? ctx.fillRect((x - bw / 2) * w, (y - bh / 2) * h, bw * w, bh * h) : ctx.strokeRect((x - bw / 2) * w, (y - bh / 2) * h, bw * w, bh * h);

  // one motif in each half of the panel, as photographed
  for (const top of [0, 0.5]) {
    const y = (v) => top + v;
    line([[0.14, y(0.03)], [0.56, y(0.03)], [0.56, y(0.36)], [0.88, y(0.36)]]);
    line([[0.14, y(0.03)], [0.14, y(0.44)], [0.56, y(0.44)]]);
    line([[0.88, y(0.08)], [0.88, y(0.36)]]);
    box(0.14, y(0.12), 0.14, 0.03);
    box(0.14, y(0.24), 0.14, 0.03);
    box(0.88, y(0.14), 0.12, 0.025, true);
    box(0.88, y(0.24), 0.12, 0.025, true);
    box(0.74, y(0.4), 0.2, 0.05);
    box(0.74, y(0.4), 0.12, 0.018, true);
  }
}

const DESIGNS = { gavel: drawGavel, circuit: drawCircuit };

function usePanelTexture(design, { ground, line }) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = ground;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = line;
    ctx.fillStyle = line;
    ctx.lineWidth = 9;
    DESIGNS[design](ctx, canvas.width, canvas.height);

    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 8;
    return map;
  }, [design, ground, line]);

  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

// One pair, standing on a wall and facing into the room. Local +Z is into the
// room, so the prints stand a little proud of the fluting behind them.
function PanelPair({ position, turn, design, framed, tower, y0, y1 }) {
  const { plan, palette } = useChamber();
  const { BAND_Y, WALL_H } = plan;
  const texture = usePanelTexture(design, palette.panel);
  const height = y1 - y0;
  const pilaster = tower ? 0.8 : 0.6;
  const pilasterX = PANEL_W + MULLION / 2 + 0.06 + pilaster / 2;

  // Backlit: the print is lit from behind, so it carries its own light rather
  // than waiting for the room's — and nothing else. The colours were sampled
  // off the photographs glow and all, so they go to the screen as sampled:
  // lit by the room as well, and then tone-mapped, a pink panel came out white.
  const material = <meshBasicMaterial map={texture} toneMapped={false} side={THREE.DoubleSide} />;

  return (
    <group position={[position[0], 0, position[1]]} rotation={[0, turn, 0]}>
      <group position={[0, (y0 + y1) / 2, 0.2]}>
        {/* the pale frame the two prints sit in */}
        <mesh position={[0, 0, -0.03]} receiveShadow>
          <boxGeometry args={[PANEL_W * 2 + MULLION + 0.12, height + 0.12, 0.04]} />
          <meshStandardMaterial {...palette.oakPale} />
        </mesh>
        {/* Facing the viewer, +X is their right, so the left print is drawn as
            it is and the right one mirrored. */}
        {[-1, 1].map((dir) => (
          <mesh key={dir} position={[(dir * (PANEL_W + MULLION)) / 2, 0, 0]} scale={[-dir, 1, 1]}>
            <planeGeometry args={[PANEL_W, height]} />
            {material}
          </mesh>
        ))}
      </group>

      {/* Pilasters either side. In a tower they are piers, and run to the
          ceiling. */}
      {framed &&
        [-1, 1].map((dir) => {
          const top = tower ? WALL_H : BAND_Y;
          return (
            <mesh key={dir} position={[dir * pilasterX, top / 2, 0.16]} castShadow receiveShadow>
              <boxGeometry args={[pilaster, top, 0.32]} />
              <meshStandardMaterial {...palette.cherry} />
            </mesh>
          );
        })}

      {/* the panel between the piers above the band, and the arms on it */}
      {tower && (
        <group>
          <mesh position={[0, (BAND_Y + WALL_H) / 2, 0.06]} receiveShadow>
            <boxGeometry args={[pilasterX * 2 - pilaster, WALL_H - BAND_Y, 0.12]} />
            <meshStandardMaterial {...palette.walnut} />
          </mesh>
          <group position={[0, BAND_Y + (WALL_H - BAND_Y) * 0.55, 0.14]}>
            <Emblem name="coat-of-arms" size={0.21 * BAND_Y} />
          </group>
        </group>
      )}
    </group>
  );
}

// Something standing on a wall: a group whose +X runs along it and whose +Z
// faces into the room.
function OnWall({ wall, children }) {
  return (
    <group position={[wall.mid[0], 0, wall.mid[1]]} rotation={[0, wall.bearing + Math.PI, 0]}>
      {children}
    </group>
  );
}

// The fluting along one wall, one instanced batten at a time.
function WallFluting({ wall, pitch = 0.17 }) {
  const { plan, palette } = useChamber();
  const { BAND_Y } = plan;
  const ref = useRef();
  const count = Math.floor(wall.length / pitch);

  useLayoutEffect(() => {
    const matrix = new THREE.Matrix4();
    for (let i = 0; i < count; i++) {
      matrix.setPosition(-wall.length / 2 + (i + 0.5) * (wall.length / count), BAND_Y / 2, 0.07);
      ref.current.setMatrixAt(i, matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
    ref.current.computeBoundingSphere();
  }, [BAND_Y, count, wall.length]);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} receiveShadow>
      <boxGeometry args={[pitch * 0.5, BAND_Y, 0.14]} />
      <meshStandardMaterial {...palette.oakPale} />
    </instancedMesh>
  );
}

// The band that carries the line of the balcony's fascia on down each side
// wall: a fascia standing forward of the fluting on a soffit, plaster above it.
// Both rooms have it, and in both it is what the timber lining stops under —
// pale in the Senate, cherry in the House. How far it stands off the wall is
// not readable; the photographs show one row of downlights in its soffit, which
// is under a metre.
const BAND_REACH = 0.9;

function SideBand({ wall, material }) {
  const { BAND_Y, FASCIA_TOP } = useChamber().plan;

  return (
    <mesh position={[0, (BAND_Y + FASCIA_TOP) / 2, BAND_REACH / 2]} castShadow receiveShadow>
      <boxGeometry args={[wall.length, FASCIA_TOP - BAND_Y, BAND_REACH]} />
      <meshStandardMaterial {...material} />
    </mesh>
  );
}

export default function ChamberSideWalls() {
  const { plan, palette } = useChamber();
  const { BAND_Y, DAIS_WALL_Z, elevation, onRun, walls } = plan;
  const { band, dais, framed, side } = PANELS[elevation];

  // Nearly the full height of the timber: from a little off the floor to just
  // under the band, the foot of each about level with the top of the door
  // furniture beside it (the press photograph of the Senate's first sitting,
  // where two of them stand on open wall next to a door).
  const y0 = BAND_Y * 0.14;
  const y1 = BAND_Y - 0.35;

  return (
    <group>
      {walls().map((wall) => (
        <group key={`${wall.kind}${wall.dir}`}>
          <OnWall wall={wall}>
            <WallFluting wall={wall} />
            {wall.kind === "side" && <SideBand wall={wall} material={palette[band]} />}
          </OnWall>

          {wall.kind === "side" &&
            side.map(({ at, design, tower }) => (
              <PanelPair
                key={at}
                {...onRun(wall, at)}
                design={design}
                framed={framed}
                tower={tower}
                y0={y0}
                y1={y1}
              />
            ))}
        </group>
      ))}

      {dais.flatMap(([bands, design]) =>
        [-1, 1].map((dir) => (
          <PanelPair
            key={`${design}${dir * bands}`}
            position={[dir * bands * BAND_Y, DAIS_WALL_Z]}
            turn={0}
            design={design}
            framed={framed}
            y0={y0}
            y1={y1}
          />
        ))
      )}
    </group>
  );
}
