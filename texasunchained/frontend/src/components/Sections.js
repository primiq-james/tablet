import { Fragment, html, useEffect, useState } from "../lib.js";

const visionCards = [
  {
    title: "Sovereignty",
    body: "Local control, self-government, and a leaner governing model built to move faster with less bureaucracy.",
  },
  {
    title: "Industry Power",
    body: "Oil, gas, technology, AI, agriculture, medicine, and manufacturing aligned as a serious economic base.",
  },
  {
    title: "Strategic Neutrality",
    body: "Trade-first statecraft, resilient defense, and an aversion to unnecessary foreign wars or costly entanglements.",
  },
];

const industryCards = [
  {
    title: "Oil & Gas",
    description: "A sovereign Texas starts with upstream strength, export capacity, and durable control over critical energy flows.",
    icon: "drop",
    detail:
      "Critical leverage comes from production, refining, storage, and export infrastructure that keeps Texas central to regional and global energy markets.",
  },
  {
    title: "Gold-Backed Currency",
    description: "Sound money, hard-asset backing, and trusted reserves can strengthen confidence in a sovereign financial system.",
    icon: "grid",
    detail:
      "A gold-backed currency model signals monetary discipline, reserve credibility, and a harder foundation for savings, trade, and long-term capital formation.",
  },
  {
    title: "Technology & AI",
    description: "Build around compute, chips, data centers, applied AI, and cybersecurity that support productive industry.",
    icon: "circuit",
    detail:
      "The goal is not tech branding. It is a real operating base for compute, automation, logistics, and AI systems that amplify Texas industry.",
  },
  {
    title: "Agriculture",
    description: "Food security, water stewardship, and export-ready agriculture remain core advantages for long-term independence.",
    icon: "leaf",
    detail:
      "Agriculture is strategic capacity: food production, land management, and export resilience tied directly to population stability and trade.",
  },
  {
    title: "Manufacturing",
    description: "Refining, fabrication, logistics, and advanced production should keep more value creation inside Texas.",
    icon: "factory",
    detail:
      "A stronger manufacturing footprint means higher-value supply chains stay closer to home, with more leverage over inputs, jobs, and strategic output.",
  },
  {
    title: "Medicine & Biotech",
    description: "Medical research, care capacity, and biotechnology can anchor both public health resilience and high-value growth.",
    icon: "cross",
    detail:
      "Medical systems create both human resilience and economic depth through research clusters, specialized care, biotech investment, and institutional trust.",
  },
];

const whyTexasStats = [
  { value: "01", label: "Energy powerhouse", note: "Hydrocarbons, generation, refining, and export relevance." },
  { value: "02", label: "Gulf trade access", note: "Ports, shipping lanes, and continental logistics reach." },
  { value: "03", label: "Major tech hubs", note: "Austin, Dallas, Houston, and growing compute corridors." },
  { value: "04", label: "Agricultural capacity", note: "Ranches, crops, water systems, and food production scale." },
  { value: "05", label: "Independent identity", note: "A culture that still thinks in terms of self-direction." },
  { value: "06", label: "Business-friendly culture", note: "Entrepreneurial momentum, operating speed, and investment pull." },
];

const economicStages = [
  {
    title: "Low regulation",
    note: "Clear rules, faster approvals, and lower operating friction give enterprise room to move.",
  },
  {
    title: "Strong industry",
    note: "Energy, manufacturing, and applied technology create hard productive capacity.",
  },
  {
    title: "Financial privacy",
    note: "Trusted financial protections help attract founders, investors, and long-term capital.",
  },
  {
    title: "Global trade",
    note: "Ports, exports, logistics, and trade relationships extend Texas advantage outward.",
  },
  {
    title: "Prosperity",
    note: "The end state is broader wealth, stronger institutions, and a more resilient economy.",
  },
];

const heroModes = [
  {
    label: "Industry",
    title: "Industrial depth is the center of gravity.",
    body: "Texas already has the energy base, logistical scale, and productive capacity to frame itself as a serious industrial power.",
  },
  {
    label: "Neutrality",
    title: "Neutrality should be strategic, not passive.",
    body: "Trade, energy security, and domestic prosperity stay at the center while unnecessary foreign entanglements stay at the edge.",
  },
  {
    label: "Prosperity",
    title: "Prosperity comes from systems that compound.",
    body: "Lower friction, trusted finance, strong industry, and trade access create a model that scales instead of drifting.",
  },
];

function IndustryIcon({ type }) {
  if (type === "drop") {
    return html`
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M24 6C19 14 12 21 12 29c0 7 5.4 13 12 13s12-6 12-13c0-8-7-15-12-23Z" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round" />
        <path d="M18 30c0 3.3 2.7 6 6 6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" />
      </svg>
    `;
  }

  if (type === "grid") {
    return html`
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M24 7v34M10 16h28M10 32h28M16 10l-6 6 6 6M32 10l6 6-6 6M16 22l-6 10M32 22l6 10" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    `;
  }

  if (type === "circuit") {
    return html`
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M17 15h14v18H17zM10 19h7M10 29h7M31 19h7M31 29h7M21 8v7M27 8v7M21 33v7M27 33v7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    `;
  }

  if (type === "leaf") {
    return html`
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M38 10C24 10 12 18 12 31c0 5.7 4.3 9 9.3 9C34 40 38 23 38 10Z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" />
        <path d="M18 34c3-5 8-9 15-12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" />
      </svg>
    `;
  }

  if (type === "factory") {
    return html`
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M8 39V22l11 6v-8l11 6V14l10 6v19Z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" />
        <path d="M16 39v-7M24 39v-5M32 39v-7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" />
      </svg>
    `;
  }

  return html`
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path d="M24 10v28M12 18h24M16 10h16v28H16z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  `;
}

function EconomicFlowChart() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % economicStages.length);
    }, 2400);

    return () => window.clearInterval(timer);
  }, []);

  return html`
    <div className="economic-flow-shell">
      <div className="economic-flow-chart" role="list" aria-label="Economic strategy flow">
        ${economicStages.map(
          (stage, index) => html`
            <${Fragment} key=${stage.title}>
              <button
                type="button"
                role="listitem"
                className=${`flow-node ${index === activeIndex ? "is-active" : ""}`}
                onMouseEnter=${() => setActiveIndex(index)}
                onFocus=${() => setActiveIndex(index)}
                onClick=${() => setActiveIndex(index)}
                aria-pressed=${index === activeIndex}
              >
                <span className="flow-node-index">${String(index + 1).padStart(2, "0")}</span>
                <strong>${stage.title}</strong>
              </button>
              ${index < economicStages.length - 1
                ? html`<span className=${`flow-connector ${index < activeIndex ? "is-active" : ""}`} aria-hidden="true"></span>`
                : null}
            <//>
          `
        )}
      </div>
      <div className="flow-detail-card">
        <span className="flow-detail-label">Current pillar</span>
        <h3>${economicStages[activeIndex].title}</h3>
        <p>${economicStages[activeIndex].note}</p>
      </div>
    </div>
  `;
}

function HeroStrategyPanel() {
  const [activeMode, setActiveMode] = useState(0);

  return html`
    <div className="hero-side-panel strategy-panel">
      <div className="strategy-panel-copy">
        <div className="strategy-switcher" role="tablist" aria-label="Strategic focus">
          ${heroModes.map(
            (mode, index) => html`
              <button
                type="button"
                role="tab"
                className=${`strategy-switch ${index === activeMode ? "is-active" : ""}`}
                aria-selected=${index === activeMode}
                onClick=${() => setActiveMode(index)}
              >
                ${mode.label}
              </button>
            `
          )}
        </div>
        <div className="strategy-panel-body">
          <h2>${heroModes[activeMode].title}</h2>
          <p>${heroModes[activeMode].body}</p>
        </div>
      </div>
    </div>
  `;
}

function IndustryExplorer() {
  const [activeIndustry, setActiveIndustry] = useState(0);

  return html`
    <div className="industry-explorer">
      <div className="industry-grid">
        ${industryCards.map(
          (card, index) => html`
            <article
              className=${`industry-card ${index === activeIndustry ? "is-active" : ""}`}
              onMouseEnter=${() => setActiveIndustry(index)}
              onClick=${() => setActiveIndustry(index)}
            >
              <div className="industry-icon">
                <${IndustryIcon} type=${card.icon} />
              </div>
              <h3>${card.title}</h3>
              <p>${card.description}</p>
            </article>
          `
        )}
      </div>
    </div>
  `;
}

export function HeroSection() {
  return html`
    <section className="hero hero-strategy fade-section" id="top">
      <div className="hero-grid hero-grid-strategy">
        <div className="hero-copy hero-copy-strategy">
          <h1>Sovereign Texas: Industry, Neutrality, Prosperity</h1>
          <p className="hero-subheadline hero-subheadline-strategy">
            Armed Neutrality, Multi Cultural, Industry Focused
          </p>
          <div className="hero-actions hero-actions-strategy">
            <a className="button-primary" href="./join.html">Join the Movement</a>
          </div>
          <div className="hero-metric-strip" aria-label="Strategic strengths">
            <div className="hero-metric">
              <span>Positioning</span>
              <strong>Trade-Led</strong>
            </div>
            <div className="hero-metric">
              <span>Economic Base</span>
              <strong>Industrial</strong>
            </div>
            <div className="hero-metric">
              <span>Strategic Posture</span>
              <strong>Neutral, Strong</strong>
            </div>
          </div>
        </div>
        <${HeroStrategyPanel} />
      </div>
    </section>
  `;
}

export function VisionSection() {
  return html`
    <section className="section fade-section section-vision" id="vision">
      <div className="section-card vision-panel">
        <div className="section-head section-head-centered">
          <div className="section-head-copy strategy-head-copy">
            <p className="eyebrow">The Vision</p>
            <h2>Three strategic commitments.</h2>
          </div>
        </div>
        <div className="vision-grid">
          ${visionCards.map(
            (card) => html`
              <article className="vision-card">
                <span className="vision-index">${card.title}</span>
                <h3>${card.title}</h3>
                <p>${card.body}</p>
              </article>
            `
          )}
        </div>
      </div>
    </section>
  `;
}

export function IndustryGridSection() {
  return html`
    <section className="section fade-section section-industries" id="industries">
      <div className="section-card industries-panel">
        <div className="section-head section-head-centered">
          <div className="section-head-copy strategy-head-copy">
            <p className="eyebrow">Industry Base</p>
            <h2>The economic engine.</h2>
            <p className="section-intro">
              Six sectors, one coordinated thesis: industrial depth is the basis of sovereignty.
            </p>
          </div>
        </div>
        <${IndustryExplorer} />
      </div>
    </section>
  `;
}

export function EconomicModelSection() {
  return html`
    <section className="section fade-section section-model" id="model">
      <div className="section-card model-panel">
        <div className="section-head section-head-centered">
          <div className="section-head-copy strategy-head-copy">
            <p className="eyebrow">Economic Model</p>
            <h2>A simple chain of advantage.</h2>
          </div>
        </div>
        <${EconomicFlowChart} />
      </div>
    </section>
  `;
}

export function FinancialPrivacySection() {
  return html`
    <section className="section fade-section section-privacy" id="privacy">
      <div className="privacy-section-shell">
        <article className="section-card statement-card privacy-statement-card">
          <div className="section-head section-head-centered">
            <div className="section-head-copy strategy-head-copy">
              <p className="eyebrow">Financial Privacy</p>
              <h2>Financial Privacy</h2>
              <p className="section-intro">
                A sovereign Texas should protect lawful financial privacy, secure private property, and build trusted
                financial systems that attract entrepreneurs, investors, and families.
              </p>
            </div>
          </div>
          <div className="privacy-points-grid">
            <div className="privacy-point">
              <div className="privacy-point-icon" aria-hidden="true">◌</div>
              <span className="privacy-label">Lawful</span>
              <p>Clear rules, enforceable contracts, and institutional trust.</p>
            </div>
            <div className="privacy-point">
              <div className="privacy-point-icon" aria-hidden="true">◍</div>
              <span className="privacy-label">Secure</span>
              <p>Property rights and private accounts protected from arbitrary intrusion.</p>
            </div>
            <div className="privacy-point">
              <div className="privacy-point-icon" aria-hidden="true">◎</div>
              <span className="privacy-label">Competitive</span>
              <p>A serious financial climate for builders, investors, and long-term capital.</p>
            </div>
          </div>
        </article>
      </div>
    </section>
  `;
}

export function NeutralitySection() {
  return html`
    <section className="section fade-section section-neutrality" id="neutrality">
      <div className="neutrality-panel">
        <div className="section-head section-head-centered">
          <div className="section-head-copy strategy-head-copy">
            <p className="eyebrow">Strategic Neutrality</p>
            <h2>Neutral by Default. Strong by Necessity.</h2>
          </div>
        </div>
        <div className="neutrality-grid">
          <article className="neutrality-point">
            <div className="neutrality-icon" aria-hidden="true">◌</div>
            <h3>Neutral by Default</h3>
            <p>
              We don't pick fights, join wars, or police the world. Texas stays out of foreign entanglements, enforces
              strict financial privacy, and lets capital flow freely. Sovereignty means minding our own damn business.
            </p>
          </article>
          <article className="neutrality-point">
            <div className="neutrality-icon" aria-hidden="true">◍</div>
            <h3>Strong by Necessity</h3>
            <p>
              Energy dominance, cutting-edge tech, agriculture, medicine, and manufacturing aren't optional — they're
              the armor. An independent Texas will be energy-independent, economically bulletproof, and ready to defend
              our borders and interests without asking permission.
            </p>
          </article>
          <article className="neutrality-point">
            <div className="neutrality-icon" aria-hidden="true">◎</div>
            <h3>Prosperity Through Power</h3>
            <p>
              Gold-standard money, low taxes, open trade with the world but zero political loyalty to it. Neutrality
              isn't weakness — it's the smartest strategy for a rich, free, and unbreakable Texas.
            </p>
          </article>
        </div>
      </div>
    </section>
  `;
}

export function WhyTexasSection() {
  return html`
    <section className="section fade-section section-why" id="why-texas">
      <div className="section-card why-panel">
        <div className="section-head section-head-centered">
          <div className="section-head-copy strategy-head-copy">
            <p className="eyebrow">Why Texas?</p>
            <h2>The conditions already exist.</h2>
            <p className="section-intro">The case is not theoretical. The base is already here.</p>
          </div>
        </div>
        <div className="stats-grid">
          ${whyTexasStats.map(
            (stat) => html`
              <article className="stat-card">
                <span className="stat-value">${stat.value}</span>
                <h3>${stat.label}</h3>
                <p>${stat.note}</p>
              </article>
            `
          )}
        </div>
      </div>
    </section>
  `;
}

export function FinalCtaSection() {
  return html`
    <section className="section fade-section" id="movement">
      <div className="final-cta strategy-final-cta">
        <div className="final-cta-layout">
          <div className="final-cta-copy">
            <p className="eyebrow">Closing Statement</p>
            <h2>Strength. Sovereignty. Texas.</h2>
            <p className="section-intro">
              Build the network, support the vision, and stay connected as the strategy takes shape.
            </p>
          </div>
          <div className="final-actions">
            <a className="button-primary" href="./join.html">Join the Movement</a>
          </div>
        </div>
      </div>
    </section>
  `;
}
