import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

const raycaster = new THREE.Raycaster();
const anchorWorld = new THREE.Vector3();
const direction = new THREE.Vector3();

// Occlusion is a raycast rather than a facing test: a dot can sit on the far
// side of the axis and still be in plain sight (the rock behind the Villa), or
// on the near side and hidden behind a portico.
const CHECK_EVERY = 4;

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
          <button
            className="hotspot-dot"
            onClick={() => (open ? onClose() : onOpen(hotspot.id))}
            aria-expanded={open}
            aria-label={hotspot.label}
          >
            {index + 1}
          </button>

          {open && (
            <div className="hotspot-card" role="dialog" aria-label={hotspot.label}>
              <button className="hotspot-close" onClick={onClose} aria-label="Close">
                &times;
              </button>
              <h2>{hotspot.label}</h2>
              <p>{hotspot.blurb}</p>
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
