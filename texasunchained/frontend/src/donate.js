import { createRoot, html } from "./lib.js";
import { Layout } from "./components/Layout.js";

function DonatePage() {
  document.title = "Donate | Texas Unchained";

  return html`
    <${Layout} current="Donate">
      <main>
        <section className="utility-page-hero fade-section">
          <div className="utility-hero-card section-card">
            <p className="eyebrow">Donate</p>
            <h1>Back the buildout.</h1>
            <p className="section-intro">
              Support the digital infrastructure, organizing, and movement rollouts that turn a message into something
              durable.
            </p>
          </div>
        </section>

        <section className="section fade-section">
          <div className="tier-grid">
            <article className="section-card tier-card">
              <p className="eyebrow">Builder</p>
              <h2>$25</h2>
              <p>Fuel list growth, petition capture, and local outreach.</p>
            </article>
            <article className="section-card tier-card">
              <p className="eyebrow">Operator</p>
              <h2>$100</h2>
              <p>Support media production, merchandise, and infrastructure.</p>
            </article>
            <article className="section-card tier-card">
              <p className="eyebrow">Founding Supporter</p>
              <h2>$250+</h2>
              <p>Back higher-touch organizing, creative direction, and strategic distribution.</p>
            </article>
          </div>
          <div className="donate-actions">
            <a className="button-primary" href="./join.html">Join the Movement</a>
          </div>
        </section>
      </main>
    <//>
  `;
}

createRoot(document.getElementById("root")).render(html`<${DonatePage} />`);
