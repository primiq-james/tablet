import { createRoot, html, useEffect, useState } from "./lib.js";

const values = [
  {
    title: "Sovereignty",
    icon: "sovereignty",
    body: "Decisions made closer to the people who live with the consequences.",
  },
  {
    title: "Prosperity",
    icon: "prosperity",
    body: "A serious growth model built on energy, industry, trade, and innovation.",
  },
  {
    title: "Neutrality",
    icon: "neutrality",
    body: "A stable posture focused on commerce, security, and avoiding reckless entanglements.",
  },
  {
    title: "Self-Reliance",
    icon: "self-reliance",
    body: "Food, power, infrastructure, and institutions strong enough to stand under pressure.",
  },
];

const industries = [
  {
    title: "Oil & Gas",
    body: "Energy production, refining, ports, and export capacity that keep Texas strategically indispensable.",
  },
  {
    title: "Technology & Data Centers",
    body: "Compute, AI, cybersecurity, and data infrastructure built beside energy, talent, and enterprise.",
  },
  {
    title: "Agriculture",
    body: "Food security, water stewardship, ranching, crops, and the land base behind durable independence.",
  },
  {
    title: "Medical Innovation",
    body: "Research hospitals, biotechnology, specialized care, and health systems built for long-term resilience.",
  },
  {
    title: "Manufacturing",
    body: "Fabrication, logistics, advanced production, and supply chains that keep value creation close to home.",
  },
  {
    title: "Financial Privacy",
    body: "Lawful financial protections for families, founders, investors, and the capital that builds Texas.",
  },
];

const platform = [
  {
    title: "Texas-first economic policy",
    body: "Keep capital, talent, infrastructure, and regulatory focus aligned around Texas families and enterprise.",
  },
  {
    title: "Secure, abundant energy",
    body: "Defend the grid, expand generation, and treat energy independence as a strategic advantage.",
  },
  {
    title: "Infrastructure and border authority",
    body: "Give Texas direct responsibility for the systems that move people, goods, power, and commerce.",
  },
  {
    title: "Neutral trade and diplomacy",
    body: "Trade widely, avoid needless conflicts, and build stable partnerships from a position of strength.",
  },
  {
    title: "Financial privacy protections",
    body: "Protect lawful savings, investment, enterprise records, and personal financial dignity.",
  },
  {
    title: "Local control and accountability",
    body: "Push power downward so communities can govern with clarity, proximity, and restraint.",
  },
];

const focusItems = [
  {
    label: "Energy",
    detail: "Generation, refining, ports, storage, and grid resilience.",
  },
  {
    label: "Technology",
    detail: "Compute corridors, AI operations, cybersecurity, and data centers.",
  },
  {
    label: "Medicine",
    detail: "Research institutions, biotechnology, and specialized care capacity.",
  },
  {
    label: "Agriculture",
    detail: "Food security, water stewardship, ranching, and export production.",
  },
  {
    label: "Finance",
    detail: "Lawful privacy, trusted reserves, capital formation, and enterprise.",
  },
];

const statementPanels = [
  {
    eyebrow: "The Problem",
    title: "Washington is sucking Texas dry.",
    image: "./assets/images/problem-red.jpg",
    align: "left",
    tone: "red",
    paragraphs: [
      "We send them billions more than we get back while they flood our borders, strangle our energy, tax us to death, and let coastal elites trash our values.",
      "Texas carries the country on its back and gets kicked for it. Enough.",
    ],
    pills: ["Billions out", "Border failure", "Energy pressure"],
  },
  {
    eyebrow: "The Solution",
    title: "Secede. Succeed.",
    image: "./assets/images/solution-blue.jpg",
    align: "right",
    tone: "blue",
    paragraphs: [
      "Cut the federal chains. Build a sovereign Texas Republic: secure borders, our own military, gold-backed strength.",
      "Unleash oil, tech, and manufacturing without Washington in the way. Low taxes, real freedom, Texas values first.",
      "Neutral but deadly if provoked. Richest, freest nation on earth.",
    ],
    pills: ["Secure borders", "Gold-backed strength", "Low taxes", "Texas values"],
    closing: "Texas First. Secede Now.",
  },
];

function ValueIcon({ type }) {
  if (type === "neutrality") {
    return html`
      <svg viewBox="0 0 48 48" className="h-7 w-7" aria-hidden="true">
        <rect x="8" y="8" width="32" height="32" rx="7" fill="#b71f34" />
        <path d="M21 15h6v6h6v6h-6v6h-6v-6h-6v-6h6v-6Z" fill="white" />
      </svg>
    `;
  }

  if (type === "prosperity") {
    return html`
      <svg viewBox="0 0 48 48" className="h-7 w-7" fill="none" aria-hidden="true">
        <path d="M10 36h28M15 31V20M24 31V13M33 31V17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M13 18 24 11l11 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    `;
  }

  if (type === "self-reliance") {
    return html`
      <svg viewBox="0 0 48 48" className="h-7 w-7" fill="none" aria-hidden="true">
        <path d="M11 25 24 13l13 12v14H11V25Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M20 39V27h8v12M17 18V11h6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    `;
  }

  return html`
    <svg viewBox="0 0 48 48" className="h-7 w-7" fill="none" aria-hidden="true">
      <path d="M24 7 36 12v10c0 8.5-4.8 14.4-12 19-7.2-4.6-12-10.5-12-19V12l12-5Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="m24 16 2.3 4.7 5.2.8-3.8 3.7.9 5.2-4.6-2.4-4.6 2.4.9-5.2-3.8-3.7 5.2-.8L24 16Z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
    </svg>
  `;
}

function DebtCounter() {
  const baseDebt = 37100000000000;
  const debtPerSecond = 74000;
  const [debt, setDebt] = useState(baseDebt);

  useEffect(() => {
    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);
      setDebt(baseDebt + elapsedSeconds * debtPerSecond);
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const formattedDebt = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(debt);

  return html`
    <div className="fixed right-3 top-20 z-40 rounded-full border border-white/25 bg-black/28 p-1 shadow-2xl shadow-black/35 backdrop-blur-md sm:right-6 lg:right-8">
      <div className="flex items-center gap-3 rounded-full border border-white/10 bg-black/30 px-4 py-2">
        <span className="rounded-full border border-[#f1c97b]/35 bg-[#f1c97b]/10 px-3 py-1 font-['Sora'] text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#f1c97b]">
          U.S. Debt
        </span>
        <span className="font-['Sora'] text-xs font-extrabold text-white sm:text-sm">${formattedDebt}</span>
      </div>
    </div>
  `;
}

function StatementPanel({ panel }) {
  const fallback =
    panel.tone === "red"
      ? "bg-[#130609]"
      : "bg-[#071124]";
  const isSolution = panel.tone === "blue";

  return html`
    <section className="relative min-h-screen w-full overflow-hidden">
      <div className=${`absolute inset-0 ${fallback}`}>
        <img
          src=${panel.image}
          alt=${panel.tone === "red" ? "Red Texas crisis artwork" : "Texas independence solution artwork"}
          className="h-full w-full object-cover object-center"
        />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.58)_0%,rgba(0,0,0,0.34)_28%,rgba(0,0,0,0.02)_58%,rgba(0,0,0,0)_100%)]"></div>
      <div className="relative min-h-screen w-full">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent"></div>

        <div className=${`flex min-h-screen items-center px-4 py-24 sm:px-7 lg:px-10 ${
          panel.align === "right" ? "justify-end" : "justify-start"
        }`}>
          <div className=${`w-full max-w-[455px] rounded-[1.2rem] border p-6 shadow-2xl backdrop-blur-sm sm:p-8 ${
            isSolution
              ? "border-[#f1c97b]/38 bg-black/58 shadow-black/45 backdrop-blur-md"
              : "border-white/12 bg-black/24 shadow-black/24"
          }`}>
            <p className=${`font-['Sora'] text-xs font-bold uppercase tracking-[0.28em] ${
              isSolution ? "text-[#f1c97b]" : "text-[#f1c97b]"
            }`}>${panel.eyebrow}</p>
            <h2 className=${`mt-6 font-['Sora'] text-4xl font-extrabold leading-[0.98] tracking-tight sm:text-5xl ${
              isSolution ? "text-[#f1c97b]" : "text-white"
            }`}>
              ${panel.title}
            </h2>
            <div className=${`mt-7 space-y-4 text-base leading-7 sm:text-lg sm:leading-8 ${
              isSolution ? "text-white" : "text-slate-200"
            }`}>
              ${panel.paragraphs.map((paragraph) => html`<p>${paragraph}</p>`)}
            </div>
            <div className="mt-7 flex flex-wrap gap-2">
              ${panel.pills.map(
                (pill) => html`
                  <span className=${`rounded-full border px-3 py-2 font-['Sora'] text-[11px] font-bold uppercase tracking-[0.12em] ${
                    isSolution
                      ? "border-[#f1c97b]/35 bg-[#f1c97b]/12 text-[#ffe4a3]"
                      : "border-white/15 bg-white/[0.075] text-white/90"
                  }`}>
                    ${pill}
                  </span>
                `
              )}
            </div>
            ${panel.closing
              ? html`<p className=${`mt-9 font-['Sora'] text-2xl font-extrabold tracking-tight ${
                  isSolution ? "text-[#f1c97b]" : "text-[#f1c97b]"
                }`}>${panel.closing}</p>`
              : null}
          </div>
        </div>
      </div>
    </section>
  `;
}

function HeroPhoto() {
  const [activeFocus, setActiveFocus] = useState(0);

  return html`
    <div className="relative mx-auto w-full max-w-[590px]">
      <div className="absolute -inset-4 rounded-[2.5rem] bg-[radial-gradient(circle_at_78%_18%,rgba(241,201,123,0.24),transparent_28%),radial-gradient(circle_at_18%_82%,rgba(183,31,52,0.22),transparent_32%)] blur-xl"></div>
      <div className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#070b12] shadow-2xl shadow-black/50">
        <img
          src="./assets/images/hero-texas-secession.jpg"
          alt="Cinematic Texas independence rally scene"
          className="h-[480px] w-full object-cover object-center opacity-90 saturate-[0.9] transition duration-700 group-hover:scale-[1.035] group-hover:opacity-100 sm:h-[620px]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,7,12,0.08)_0%,rgba(5,7,12,0.22)_42%,rgba(5,7,12,0.92)_100%),linear-gradient(90deg,rgba(5,7,12,0.72)_0%,rgba(5,7,12,0.12)_52%,rgba(5,7,12,0.56)_100%)]"></div>
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#f1c97b]/70 to-transparent"></div>
        <div className="absolute left-5 top-5 rounded-full border border-white/15 bg-black/35 px-4 py-2 font-['Sora'] text-[11px] font-bold uppercase tracking-[0.18em] text-white/90 backdrop-blur-md">
          Strategic Independence
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
          <div className="rounded-[1.35rem] border border-white/10 bg-black/35 p-4 backdrop-blur-xl sm:p-5">
            <div className="flex flex-wrap gap-2">
              ${focusItems.map(
                (item, index) => html`
                  <button
                    type="button"
                    onMouseEnter=${() => setActiveFocus(index)}
                    onFocus=${() => setActiveFocus(index)}
                    onClick=${() => setActiveFocus(index)}
                    className=${`rounded-full border px-3 py-2 font-['Sora'] text-[11px] font-bold uppercase tracking-[0.12em] transition ${
                      activeFocus === index
                        ? "border-[#f1c97b]/70 bg-[#f1c97b] text-[#080b10]"
                        : "border-white/10 bg-white/[0.055] text-slate-200 hover:border-white/25 hover:bg-white/[0.09]"
                    }`}
                    aria-pressed=${activeFocus === index}
                  >
                    ${item.label}
                  </button>
                `
              )}
            </div>
            <p className="mt-4 min-h-12 text-sm leading-6 text-slate-200">${focusItems[activeFocus].detail}</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

function HomePage() {
  const [activeIndustry, setActiveIndustry] = useState(0);
  const [activePlatform, setActivePlatform] = useState(0);
  const [navOpen, setNavOpen] = useState(false);

  return html`
    <div className="min-h-screen bg-[#05070c] font-['Space_Grotesk'] text-white selection:bg-[#f1c97b] selection:text-[#080b10]">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(31,92,153,0.28),transparent_30%),radial-gradient(circle_at_16%_26%,rgba(241,201,123,0.12),transparent_24%),linear-gradient(180deg,#060912_0%,#080b12_42%,#05070c_100%)]"></div>

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#05070c]/78 backdrop-blur-xl">
        <nav className="relative mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-4 lg:px-8" aria-label="Primary">
          <a href="./index.html" className="font-['Sora'] text-lg font-extrabold tracking-tight text-white">Texas Independence</a>
          <button
            type="button"
            className="rounded-xl border border-white/10 px-4 py-2 font-['Sora'] text-sm font-bold text-white md:hidden"
            onClick=${() => setNavOpen((value) => !value)}
            aria-label="Toggle navigation"
          >
            ${navOpen ? "Close" : "Menu"}
          </button>
          <div className=${`${
            navOpen
              ? "absolute left-5 right-5 top-[calc(100%+10px)] grid rounded-2xl border border-white/10 bg-[#05070c]/95 p-4 shadow-2xl shadow-black/40 backdrop-blur-xl"
              : "hidden"
          } items-center gap-4 text-sm font-semibold text-slate-300 md:static md:flex md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-0`}>
            <a className="transition hover:text-white" href="./shop.html">Shop</a>
            <a className="rounded-full bg-[#f1c97b] px-5 py-3 font-['Sora'] text-sm font-extrabold text-[#090b10] shadow-lg shadow-[#f1c97b]/10 transition hover:-translate-y-0.5 hover:bg-[#ffd98b]" href="./join.html">Join Movement</a>
            <a className="transition hover:text-white" href="./events.html">Upcoming Events</a>
          </div>
        </nav>
      </header>
      <${DebtCounter} />

      <main>
        <section className="relative overflow-hidden px-5 pb-24 pt-20 sm:pt-28 lg:px-8 lg:pb-32">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
          <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[1.02fr_.98fr]">
            <div>
              <p className="mb-6 font-['Sora'] text-xs font-bold uppercase tracking-[0.28em] text-[#f1c97b]">Sovereignty. Industry. Unity.</p>
              <h1 className="max-w-5xl font-['Sora'] text-5xl font-extrabold leading-[0.95] tracking-tight text-white sm:text-7xl lg:text-8xl">
                Texas Was Built to Stand on Its Own.
              </h1>
              <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
                A disciplined movement for Texas sovereignty, economic strength, neutrality, energy independence, financial privacy, and the industries that can carry a serious future.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <a href="./join.html" className="rounded-full bg-[#f1c97b] px-7 py-4 text-center font-['Sora'] text-sm font-extrabold text-[#080b10] shadow-2xl shadow-[#f1c97b]/15 transition hover:-translate-y-0.5 hover:bg-[#ffd98b]">
                  Join the Movement
                </a>
                <a href="#platform" className="rounded-full border border-white/15 bg-white/[0.04] px-7 py-4 text-center font-['Sora'] text-sm font-bold text-white transition hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/[0.07]">
                  Read the Platform
                </a>
              </div>
              <div className="mt-12 grid max-w-2xl grid-cols-3 gap-3">
                ${[
                  ["01", "Industry"],
                  ["02", "Neutrality"],
                  ["03", "Privacy"],
                ].map(
                  ([number, label]) => html`
                    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                      <p className="font-['Sora'] text-xs font-bold text-[#f1c97b]">${number}</p>
                      <p className="mt-2 font-['Sora'] text-sm font-extrabold text-white sm:text-base">${label}</p>
                    </div>
                  `
                )}
              </div>
            </div>
            <${HeroPhoto} />
          </div>
        </section>

        ${statementPanels.map((panel) => html`<${StatementPanel} panel=${panel} />`)}

        <section id="values" className="border-y border-white/10 bg-white/[0.025] px-5 py-16 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
            ${values.map(
              (value) => html`
                <article className="group min-h-44 rounded-2xl border border-white/10 bg-white/[0.035] p-6 transition hover:-translate-y-1 hover:border-[#f1c97b]/35 hover:bg-white/[0.055]">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-[#070b12]/70 text-[#f1c97b] shadow-lg shadow-black/20 transition group-hover:border-[#f1c97b]/35 group-hover:bg-[#f1c97b]/10 group-hover:text-[#ffd98b]">
                    <${ValueIcon} type=${value.icon} />
                  </div>
                  <p className="font-['Sora'] text-2xl font-extrabold tracking-tight text-white">${value.title}</p>
                  <p className="mt-4 leading-7 text-slate-300">${value.body}</p>
                </article>
              `
            )}
          </div>
        </section>

        <section id="industries" className="px-5 py-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.07),rgba(255,255,255,0.025))] p-6 text-center shadow-2xl shadow-black/30 backdrop-blur sm:p-10 lg:p-12">
              <p className="font-['Sora'] text-xs font-bold uppercase tracking-[0.24em] text-[#f1c97b]">Industry Power</p>
              <h2 className="mt-4 font-['Sora'] text-4xl font-extrabold tracking-tight text-white sm:text-5xl">A sovereign future has to produce.</h2>
              <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-300">
                Texas has the operating base: energy, land, ports, builders, engineers, capital, and institutions with global relevance.
              </p>
              <a href="./economic-plan.html" className="mt-8 inline-flex rounded-full bg-[#f1c97b] px-6 py-3 font-['Sora'] text-sm font-extrabold text-[#080b10] shadow-lg shadow-[#f1c97b]/10 transition hover:-translate-y-0.5 hover:bg-[#ffd98b]">
                Learn More
              </a>
            </div>
            <div className="mt-12 text-center">
              <p className="font-['Sora'] text-xs font-bold uppercase tracking-[0.24em] text-[#f1c97b]">Economic Pillars</p>
              <h3 className="mt-3 font-['Sora'] text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Six engines for a sovereign Texas.</h3>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              ${industries.map(
                (card, index) => html`
                  <article
                    onMouseEnter=${() => setActiveIndustry(index)}
                    onFocus=${() => setActiveIndustry(index)}
                    onClick=${() => setActiveIndustry(index)}
                    tabIndex="0"
                    className=${`group min-h-60 cursor-pointer rounded-[1.5rem] border p-7 shadow-xl shadow-black/20 backdrop-blur transition duration-300 hover:-translate-y-1 ${
                      activeIndustry === index
                        ? "border-[#f1c97b]/45 bg-white/[0.07]"
                        : "border-white/10 bg-white/[0.045] hover:border-white/20 hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className=${`mb-8 h-1 w-16 rounded-full transition ${
                      activeIndustry === index
                        ? "bg-[#f1c97b]"
                        : "bg-gradient-to-r from-[#b71f34] via-white to-[#1f5c99]"
                    }`}></div>
                    <h3 className="font-['Sora'] text-2xl font-extrabold tracking-tight text-white">${card.title}</h3>
                    <p className="mt-4 leading-7 text-slate-300">${card.body}</p>
                  </article>
                `
              )}
            </div>
          </div>
        </section>

        <div className="relative overflow-hidden bg-[#05070c]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(31,92,153,0.22),transparent_28%),radial-gradient(circle_at_20%_32%,rgba(241,201,123,0.1),transparent_24%),linear-gradient(180deg,#05070c_0%,#080b12_52%,#05070c_100%)]"></div>

          <section id="platform" className="relative px-5 py-24 lg:px-8">
            <div className="mx-auto max-w-7xl rounded-[2rem] border border-white/10 bg-[#05070c] p-6 shadow-2xl shadow-slate-950/30 sm:p-10 lg:p-14">
              <div className="grid gap-12 lg:grid-cols-[.85fr_1.15fr]">
                <div>
                  <p className="font-['Sora'] text-xs font-bold uppercase tracking-[0.24em] text-[#f1c97b]">Platform</p>
                  <h2 className="mt-4 font-['Sora'] text-4xl font-extrabold tracking-tight text-white sm:text-5xl">Texas Deserves Better. Texas Was Born Sovereign.</h2>
                  <p className="mt-6 text-lg leading-8 text-slate-300">
                    We built this state. We fund this country. Yet Washington violates our rights, drains our wealth, and treats us like a colony instead of a partner. Enough.
                  </p>
                </div>
                <div className="grid gap-4">
                  ${platform.map(
                    (item, index) => html`
                      <button
                        type="button"
                        onMouseEnter=${() => setActivePlatform(index)}
                        onFocus=${() => setActivePlatform(index)}
                        onClick=${() => setActivePlatform(index)}
                        className=${`rounded-2xl border p-5 text-left transition duration-300 ${
                          activePlatform === index
                            ? "border-[#f1c97b]/45 bg-[#f1c97b]/10"
                            : "border-white/10 bg-[#070b12]/70 hover:border-white/25 hover:bg-white/[0.045]"
                        }`}
                      >
                        <span className="font-['Sora'] text-lg font-extrabold text-white">${item.title}</span>
                        <span className=${`mt-3 block overflow-hidden text-sm leading-6 text-slate-300 transition-all duration-300 ${
                          activePlatform === index ? "max-h-24 opacity-100" : "max-h-0 opacity-0"
                        }`}>
                          ${item.body}
                        </span>
                      </button>
                    `
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="relative px-5 py-24 lg:px-8">
            <div className="mx-auto max-w-7xl rounded-[2rem] border border-white/10 bg-[#05070c] p-6 text-center shadow-2xl shadow-slate-950/30 sm:p-10 lg:p-14">
              <div className="mx-auto max-w-4xl">
                <p className="font-['Sora'] text-xs font-bold uppercase tracking-[0.24em] text-[#f1c97b]">Movement</p>
                <h2 className="mt-4 font-['Sora'] text-4xl font-extrabold tracking-tight text-white sm:text-6xl">Not left. Not right. Texas first.</h2>
                <p className="mx-auto mt-8 max-w-3xl text-xl leading-9 text-slate-300">
                  This movement is for Texans who believe the future should be built here, governed here, and protected here.
                </p>
                <p className="mx-auto mt-6 max-w-3xl text-xl leading-9 text-slate-200">
                  Ranchers, engineers, builders, doctors, founders, veterans, parents, and workers - one Texas future.
                </p>
              </div>
            </div>
          </section>

          <section className="relative px-5 py-24 lg:px-8">
            <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#0a0f18] p-8 text-center shadow-2xl shadow-black/30 sm:p-14">
              <div className="mx-auto max-w-3xl">
                <h2 className="font-['Sora'] text-4xl font-extrabold tracking-tight text-white sm:text-6xl">Strength. Sovereignty. Texas.</h2>
                <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                  A calm, serious, Texas-first movement for people ready to build what comes next.
                </p>
                <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
                  <a href="./join.html" className="rounded-full bg-[#f1c97b] px-7 py-4 font-['Sora'] text-sm font-extrabold text-[#080b10] transition hover:-translate-y-0.5 hover:bg-[#ffd98b]">Join the Movement</a>
                  <a href="./donate.html" className="rounded-full border border-white/15 bg-white/[0.04] px-7 py-4 font-['Sora'] text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/[0.07]">Support the Mission</a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-white/10 bg-[#05070c] px-5 py-10 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-['Sora'] text-base font-extrabold text-white">Texas Independence</p>
            <p className="mt-2">Strength. Sovereignty. Texas.</p>
          </div>
          <div className="flex flex-wrap gap-6 font-semibold">
            <a className="hover:text-white" href="#platform">Platform</a>
            <a className="hover:text-white" href="mailto:contact@texasunchained.com">Contact</a>
            <a className="hover:text-white" href="./donate.html">Donate</a>
          </div>
        </div>
      </footer>
    </div>
  `;
}

createRoot(document.getElementById("root")).render(html`<${HomePage} />`);
