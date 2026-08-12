import { byArm, institutions } from "../data/institutions.js";
import { toInstitution } from "../hooks/useHashRoute.js";
import InstitutionMark from "./InstitutionMark.jsx";

const ARM_SLUG = {
  Legislature: "legislature",
  Executive: "executive",
  Judiciary: "judiciary",
  "Independent Commission": "commission",
};

function prefetch(id) {
  import("./SpecimenView.jsx");
  import("../three/registry.js").then((m) => m.preloadPrimitive(id));
}

// Always on screen, so choosing another institution is a glance sideways rather
// than a trip back to a landing page.
export default function Rail({ currentId }) {
  const built = institutions.filter((i) => i.status === "complete").length;

  return (
    <nav className="rail" aria-label="Institutions">
      <div className="rail-scroll">
        {byArm().map(({ arm, items }) => (
          <div className="rail-group" key={arm} data-arm={ARM_SLUG[arm]}>
            <p className="eyebrow">{arm}</p>
            {items.map((i) => (
              <button
                key={i.id}
                className="rail-item"
                data-status={i.status}
                aria-current={i.id === currentId}
                onPointerEnter={i.status === "complete" ? () => prefetch(i.id) : undefined}
                onClick={() => toInstitution(i.id)}
              >
                <span className="rail-thumb">
                  <InstitutionMark id={i.id} muted={i.status === "placeholder"} />
                </span>
                <span className="rail-text">
                  <span className="rail-name">{i.name}</span>
                  <span className="rail-sub">
                    {i.status === "placeholder" ? "Coming soon" : i.tier}
                  </span>
                </span>
              </button>
            ))}
          </div>
        ))}
      </div>

      <p className="rail-foot">
        {built} of {institutions.length} built
      </p>
    </nav>
  );
}
