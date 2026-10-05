import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

import Marker from "../components/Marker.jsx";
import { getChamber } from "../data/chambers.js";
import { preloadInterior } from "./chamberRegistry.js";
import { toChamber } from "../hooks/useHashRoute.js";

const raycaster = new THREE.Raycaster();
const anchorWorld = new THREE.Vector3();
const direction = new THREE.Vector3();

// Occlusion is a raycast rather than a facing test: a dot can sit on the far
// side of the axis and still be in plain sight (the rock behind the Villa), or
// on the near side and hidden behind a portico.
const CHECK_EVERY = 4;

// A hotspot that names a room the app models offers a door into it. The link
// belongs on the card rather than on the marker: the marker is a name on the
// outside of a building, and turning some of them into doorways and not others
// would make a name mean two things at once.
//
// The unbuilt chamber is still offered, the way the rail still lists an unbuilt
// institution — the reader learns the room exists and why it is not here yet,
// which is more use than a card that quietly stops short.
function Interior({ id }) {
  const chamber = getChamber(id);
  if (!chamber) return null;

  const built = chamber.status === "complete";

  return (
    <button
      className="hotspot-go"
      data-soon={!built || undefined}
      onPointerEnter={built ? () => preloadInterior(id) : undefined}
      onClick={() => toChamber(id)}
    >
      {built ? "Step inside" : "Interior coming soon"} &rarr;
    </button>
  );
}

function Hotspot({ hotspot, index, open, occludes, onOpen, onClose }) {
  const anchor = useRef();
  const wrap = useRef();
  const tick = useRef(index);

  useFrame(({ camera }) => {
    if (!anchor.current || !wrap.current) return;
    if (tick.current++ % CHECK_EVERY !== 0) return;

    anchor.current.getWorldPosition(anchorWorld);
    direction.copy(anchorWorld).sub(camera.position);
    const distance = direction.length();

    raycaster.set(camera.position, direction.normalize());
    raycaster.far = distance - 0.03;

    const model = occludes?.current;
    const blocked = model ? raycaster.intersectObject(model, true).length > 0 : false;
    wrap.current.dataset.behind = blocked && !open ? "true" : "false";
  });

  return (
    <group ref={anchor} position={hotspot.position}>
      <Html center zIndexRange={open ? [90, 80] : [30, 10]}>
        <div
          className="hotspot"
          ref={wrap}
          data-open={open || undefined}
          // Cards open away from the model axis so they cover empty stage
          // rather than the feature being described.
          data-side={hotspot.position[0] < 0 ? "left" : "right"}
          // R3F's event source is the container div, so a click on this overlay
          // also reads as a miss and would close the card in the same tick.
          onPointerDown={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <Marker
            hotspot={hotspot}
            open={open}
            onClick={() => (open ? onClose() : onOpen(hotspot.id))}
          />

          {open && (
            <div className="hotspot-card" role="dialog" aria-label={hotspot.label}>
              <button className="hotspot-close" onClick={onClose} aria-label="Close">
                &times;
              </button>
              <h2>{hotspot.label}</h2>
              <p>{hotspot.blurb}</p>
              {hotspot.interior && <Interior id={hotspot.interior} />}
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}

export default function Hotspots({ items, openId, occludes, onOpen, onClose }) {
  return items.map((hotspot, index) => (
    <Hotspot
      key={hotspot.id}
      hotspot={hotspot}
      index={index}
      open={openId === hotspot.id}
      occludes={occludes}
      onOpen={onOpen}
      onClose={onClose}
    />
  ));
}
