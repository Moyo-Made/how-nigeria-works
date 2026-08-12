import { Suspense, lazy, useEffect, useState } from "react";
import { useHashRoute, toInstitution } from "./hooks/useHashRoute.js";
import { getInstitution, institutions, officeHoldersAsOf } from "./data/institutions.js";
import Rail from "./components/Rail.jsx";
import Confluence from "./components/Confluence.jsx";
import ExploreCards from "./components/ExploreCards.jsx";
import ContentPanel from "./components/ContentPanel.jsx";

// Keeps three.js out of the first paint entirely.
const SpecimenView = lazy(() => import("./components/SpecimenView.jsx"));

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
  const { id } = useHashRoute();
  const institution = getInstitution(id) ?? FIRST;
  const built = institution.status === "complete";

  // Lifted out of the specimen so the toolbar and the cards below the well can
  // both start the animation.
  const [playRequest, setPlayRequest] = useState(0);

  useEffect(() => {
    if (!id) toInstitution(FIRST.id);
  }, [id]);

  return (
    <div className="shell">
      <header className="topbar">
        <button className="wordmark" onClick={() => toInstitution(FIRST.id)}>
          <Confluence />
          <span>How Nigeria&rsquo;s Government Works</span>
        </button>
        <span className="topbar-spacer" />
        <span className="topbar-note">
          Constitution of 1999, as amended &middot; office holders as of {officeHoldersAsOf()}
        </span>
      </header>

      <div className="workspace">
        <Rail currentId={institution.id} />

        {built ? (
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

      {built && (
        <ExploreCards
          institution={institution}
          onPlayAnimation={() => setPlayRequest((n) => n + 1)}
        />
      )}
    </div>
  );
}
