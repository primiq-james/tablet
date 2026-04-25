import { createRoot, html } from "./lib.js";
import { articles } from "./data/articles.js";
import { Layout } from "./components/Layout.js";

function prettyDate(value) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function ArticlePage() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");
  const article = articles.find((entry) => entry.slug === slug) ?? articles[0];
  const related = articles.filter((entry) => entry.slug !== article.slug).slice(0, 3);

  document.title = `${article.title} | Texas Unchained`;

  return html`
    <${Layout} current="News">
      <main>
        <section className="article-page-hero fade-section">
          <article className="article-shell section-card">
            <div className="article-head">
              <span className="article-category">${article.category}</span>
              <h1>${article.title}</h1>
              <p className="section-intro">${article.excerpt}</p>
              <div className="article-meta">By ${article.author} · ${prettyDate(article.publishDate)}</div>
              <div className="article-hero">
                <img src=${article.heroImage} alt=${article.title} />
              </div>
            </div>

            <div className="article-content">
              <div className="article-body">
                ${article.bodyContent.map(
                  (section) => html`
                    <section>
                      ${section.heading ? html`<h2>${section.heading}</h2>` : null}
                      ${section.paragraphs.map((paragraph) => html`<p>${paragraph}</p>`)}
                      ${section.bullets
                        ? html`<ul>${section.bullets.map((bullet) => html`<li>${bullet}</li>`)}</ul>`
                        : null}
                    </section>
                  `
                )}
              </div>

              <aside className="article-sidebar">
                <section className="news-sidebar-card">
                  <p className="eyebrow">From the movement</p>
                  <h3>A premium editorial frame, not a tabloid one.</h3>
                  <p>
                    These seeded stories are placeholders for a CMS-backed publishing system that can later support
                    real reporting, commentary, and movement storytelling.
                  </p>
                </section>
                <section className="news-sidebar-card">
                  <p className="eyebrow">Support</p>
                  <a className="button-primary" href="./join.html">Join the Movement</a>
                </section>
              </aside>
            </div>
          </article>
        </section>

        <section className="section fade-section">
          <div className="section-head">
            <div className="section-head-copy">
              <p className="eyebrow">Related stories</p>
              <h2>Keep reading the desk.</h2>
            </div>
          </div>
          <div className="article-grid">
            ${related.map(
              (item) => html`
                <article className="article-card">
                  <a href=${`./article.html?slug=${item.slug}`}>
                    <div className="article-related-image">
                      <img src=${item.heroImage} alt=${item.title} loading="lazy" />
                    </div>
                    <div className="article-card-copy">
                      <span className="news-chip">${item.category}</span>
                      <h3>${item.title}</h3>
                      <p>${item.excerpt}</p>
                    </div>
                  </a>
                </article>
              `
            )}
          </div>
        </section>
      </main>
    <//>
  `;
}

createRoot(document.getElementById("root")).render(html`<${ArticlePage} />`);
