import { Suspense, lazy, useEffect, useState } from "react";
import { useHashRoute, toInstitution } from "./hooks/useHashRoute.js";
import { getInstitution, institutions, officeHoldersAsOf } from "./data/institutions.js";
import { getChamber } from "./data/chambers.js";
import Rail from "./components/Rail.jsx";
import Confluence from "./components/Confluence.jsx";
import ExploreCards from "./components/ExploreCards.jsx";
import ContentPanel from "./components/ContentPanel.jsx";

// Keeps three.js out of the first paint entirely.
const SpecimenView = lazy(() => import("./components/SpecimenView.jsx"));
const ChamberView = lazy(() => import("./components/ChamberView.jsx"));
const Styleguide = lazy(() => import("./components/Styleguide.jsx"));

const FIRST = institutions.find((i) => i.status === "complete");

// The stage stands in for the specimen while the 3D chunk downloads, so the
// shell around it never moves.
function StagePlaceholder({ label }) {
  return (
    <div className="stage stage-empty">
      <div className="stage-plinth" aria-hidden="true" />
      <p className="stage-tip" role="status">
        {label}
      </p>
    </div>
  );
}

function NotBuilt({ institution }) {
  return (
    <div className="stage">
      <div className="soon">
        <div>
          <p className="eyebrow">Not built yet</p>
          <h2>{institution.name}</h2>
          <p>
            It is in the list so the full shape of government stays visible. Its model and content
            are still being made.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const { route, id } = useHashRoute();
  const inChamber = route === "chamber";
  const inStyleguide = route === "styleguide";
  // Inside a chamber the rail still points at the building the room is in. You
  // are in the National Assembly when you are in the Senate, and the highlight
  // saying so is also the way back out.
  const chamber = inChamber ? getChamber(id) : null;
  const institution = getInstitution(inChamber ? chamber?.institution : id) ?? FIRST;
  const built = institution.status === "complete";

  // Lifted out of the specimen so the toolbar and the cards below the well can
  // both start the animation.
  const [playRequest, setPlayRequest] = useState(0);

  useEffect(() => {
    if (!id && !inStyleguide) toInstitution(FIRST.id);
  }, [id, inStyleguide]);

  return (
    <div className="shell">
      <header className="topbar">
        <button className="wordmark" onClick={() => toInstitution(FIRST.id)}>
          <Confluence badge />
          <span className="wordmark-text">
            <span className="wordmark-name">Three Arms</span>
            <span className="wordmark-tagline">How Nigeria&rsquo;s government works</span>
          </span>
        </button>
        <span className="topbar-spacer" />
        <span className="topbar-note">
          Constitution of 1999, as amended &middot; office holders as of {officeHoldersAsOf()}
        </span>
      </header>

      {inStyleguide ? (
        <Suspense fallback={null}>
          <Styleguide />
        </Suspense>
      ) : (
        <div className="workspace">
          <Rail currentId={institution.id} />

          {inChamber ? (
            <>
              <Suspense fallback={<StagePlaceholder label="Preparing the chamber…" />}>
                <ChamberView id={id} />
              </Suspense>
              {/* Stepping into a room does not leave the building, so what the
                  panel says about the building stays beside it. Outside the
                  Suspense: it is plain text and should not wait for the room. */}
              <ContentPanel institution={institution} />
            </>
          ) : built ? (
            <Suspense fallback={<StagePlaceholder label="Preparing the model…" />}>
              <SpecimenView
                institution={institution}
                playRequest={playRequest}
                onPlayAnimation={() => setPlayRequest((n) => n + 1)}
              />
            </Suspense>
          ) : (
            <>
              <div className="stage-col">
                <NotBuilt institution={institution} />
                <div className="toolbar" />
              </div>
              <ContentPanel institution={institution} />
            </>
          )}
        </div>
      )}

      {built && !inChamber && !inStyleguide && (
        <ExploreCards
          institution={institution}
          onPlayAnimation={() => setPlayRequest((n) => n + 1)}
        />
      )}
    </div>
  );
}
