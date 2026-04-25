import { createRoot, html } from "./lib.js";
import { Layout } from "./components/Layout.js";

const planPillars = [
  {
    title: "Energy Independence",
    body: "Protect production, refining, storage, ports, and grid resilience as strategic Texas assets.",
  },
  {
    title: "Industry Expansion",
    body: "Keep manufacturing, logistics, fabrication, and advanced production close to Texas labor and capital.",
  },
  {
    title: "Technology Corridors",
    body: "Build around compute, AI, cybersecurity, chips, and data centers powered by reliable Texas energy.",
  },
  {
    title: "Agricultural Security",
    body: "Defend food production, water stewardship, ranching, land management, and export capacity.",
  },
  {
    title: "Medical Innovation",
    body: "Grow research hospitals, biotechnology, specialized care, and public-health resilience.",
  },
  {
    title: "Financial Privacy",
    body: "Protect lawful savings, capital formation, hard-asset strength, and enterprise records.",
  },
];

function EconomicPlanPage() {
  document.title = "Economic Plan | Texas Unchained";

  return html`
    <${Layout} current="Home">
      <main>
        <section className="utility-page-hero fade-section">
          <div className="utility-hero-card section-card">
            <p className="eyebrow">Economic Plan</p>
            <h1>Build wealth where Texans live, work, and produce.</h1>
            <p className="section-intro">
              A serious sovereignty plan starts with productive capacity: energy, industry, agriculture, medicine,
              technology, and finance.
            </p>
          </div>
        </section>

        <section className="section fade-section">
          <div className="economic-plan-grid">
            ${planPillars.map(
              (pillar, index) => html`
                <article className="section-card economic-plan-card">
                  <span>${String(index + 1).padStart(2, "0")}</span>
                  <h2>${pillar.title}</h2>
                  <p>${pillar.body}</p>
                </article>
              `
            )}
          </div>
        </section>
      </main>
    <//>
  `;
}

createRoot(document.getElementById("root")).render(html`<${EconomicPlanPage} />`);
