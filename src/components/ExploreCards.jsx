import Confluence from "./Confluence.jsx";

// Everything below the well: what else this institution can tell you, and the
// two structural ideas the whole app is about.
export default function ExploreCards({ institution, onPlayAnimation }) {
  const { animation, checksOnIt, didYouKnow, inYourDailyLife } = institution;

  return (
    <section className="explore" aria-label="More about this institution">
      <div className="explore-grid">
        {animation && (
          <button className="ecard" onClick={onPlayAnimation} data-arm="legislature">
            <p className="eyebrow">Animation</p>
            <h3>How a bill becomes law</h3>
            <p>
              Follow one document through both chambers and on to the President, stage by stage.
            </p>
            <span className="ecard-go">Play &rarr;</span>
          </button>
        )}

        {checksOnIt && (
          <div className="ecard" data-arm="judiciary">
            <p className="eyebrow">The limit</p>
            <h3>What holds it in check</h3>
            <p>{checksOnIt}</p>
          </div>
        )}

        {/* No heading: every card here is about the institution already named
            above, so repeating it would be the card saying nothing twice. */}
        {didYouKnow && (
          <div className="ecard" data-arm="executive">
            <p className="eyebrow">Did you know</p>
            <p className="ecard-lead">{didYouKnow}</p>
          </div>
        )}

        {inYourDailyLife && (
          <div className="ecard" data-arm="commission">
            <p className="eyebrow">Close to home</p>
            <h3>In your daily life</h3>
            <p>{inYourDailyLife}</p>
          </div>
        )}

        <div className="ecard ecard-quote">
          <Confluence />
          <p>Two chambers, one law. The mark is the Niger and the Benue meeting.</p>
        </div>
      </div>
    </section>
  );
}
