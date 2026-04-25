import { createRoot, html, useMemo, useState } from "./lib.js";
import { articleCategories, articles } from "./data/articles.js";
import { latestUpdates, mostRead } from "./data/siteData.js";
import { Layout } from "./components/Layout.js";

function prettyDate(value) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function NewsPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = useMemo(() => {
    if (activeCategory === "All") return articles;
    return articles.filter((article) => article.category === activeCategory);
  }, [activeCategory]);

  const featured = articles.find((article) => article.featured) ?? articles[0];

  return html`
    <${Layout} current="News">
      <main>
        <section className="news-page-hero fade-section">
          <div className="news-page-hero-card section-card">
            <p className="eyebrow">News and Analysis</p>
            <h1>What Washington Gets Wrong. What Texas Must Get Right.</h1>
            <p className="section-intro">
              This desk tracks federal waste, Texas wins, leadership failures, border policy, energy, infrastructure,
              technology, healthcare, elections, and public trust.
            </p>
          </div>
        </section>

        <section className="section fade-section">
          <div className="news-card">
            <a href=${`./article.html?slug=${featured.slug}`}>
              <div className="news-card-image">
                <img src=${featured.heroImage} alt=${featured.title} />
              </div>
              <div className="news-card-copy">
                <span className="news-chip">${featured.category}</span>
                <h2>${featured.title}</h2>
                <p>${featured.excerpt}</p>
                <div className="article-meta">${prettyDate(featured.publishDate)} · ${featured.author}</div>
                <span className="card-link">Read More</span>
              </div>
            </a>
          </div>
        </section>

        <section className="section fade-section">
          <div className="news-controls">
            <div className="news-filters">
              ${articleCategories.map(
                (category) => html`
                  <button
                    type="button"
                    className=${`filter-button ${activeCategory === category ? "active" : ""}`}
                    onClick=${() => setActiveCategory(category)}
                  >
                    ${category}
                  </button>
                `
              )}
            </div>
          </div>

          <div className="news-overview">
            <div className="news-grid">
              ${filtered.map(
                (article) => html`
                  <article className="news-card">
                    <a href=${`./article.html?slug=${article.slug}`}>
                      <div className="news-card-image">
                        <img src=${article.heroImage} alt=${article.title} loading="lazy" />
                      </div>
                      <div className="news-card-copy">
                        <span className="news-chip">${article.category}</span>
                        <h3>${article.title}</h3>
                        <p>${article.excerpt}</p>
                        <div className="article-meta">${prettyDate(article.publishDate)} · ${article.author}</div>
                        <span className="card-link">Read More</span>
                      </div>
                    </a>
                  </article>
                `
              )}
            </div>

            <aside className="article-sidebar">
              <section className="news-sidebar-card">
                <p className="eyebrow">Most Read</p>
                ${mostRead.map(
                  (article) => html`
                    <div className="metric-card">
                      <span className="metric-label">${article.category}</span>
                      <strong>${article.title}</strong>
                      <p>${prettyDate(article.publishDate)}</p>
                    </div>
                  `
                )}
              </section>

              <section className="news-sidebar-card">
                <p className="eyebrow">Latest Updates</p>
                ${latestUpdates.map(
                  (article) => html`
                    <div className="metric-card">
                      <span className="metric-label">${prettyDate(article.publishDate)}</span>
                      <strong>${article.title}</strong>
                    </div>
                  `
                )}
              </section>

              <section className="news-sidebar-card">
                <p className="eyebrow">Subscribe</p>
                <h3>Get the next movement briefing.</h3>
                <a className="button-primary" href="./join.html">Join the Movement</a>
              </section>
            </aside>
          </div>
        </section>
      </main>
    <//>
  `;
}

createRoot(document.getElementById("root")).render(html`<${NewsPage} />`);
