import { articles } from "./news-data.js";

const root = document.querySelector("#article-root");
const params = new URLSearchParams(window.location.search);
const slug = params.get("slug");

function prettyDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function articleLink(nextSlug) {
  return `./article.html?slug=${encodeURIComponent(nextSlug)}`;
}

const article = articles.find((entry) => entry.slug === slug) ?? articles[0];
const related = articles.filter((entry) => entry.slug !== article.slug).slice(0, 3);

document.title = `${article.title} | Texas Unchained`;

if (root) {
  root.innerHTML = `
    <article class="article-shell">
      <div class="article-head">
        <span class="article-category">${article.category}</span>
        <h1>${article.title}</h1>
        <p class="article-lede">${article.excerpt}</p>
        <div class="article-byline">By ${article.author} · ${prettyDate(article.publishDate)}</div>
        <div class="article-hero-image">
          <img src="${article.heroImage}" alt="${article.title}" />
        </div>
      </div>

      <div class="article-content-layout">
        <div class="article-body">
          ${article.bodyContent
            .map(
              (section) => `
                <section>
                  ${section.heading ? `<h2>${section.heading}</h2>` : ""}
                  ${section.paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("")}
                  ${
                    section.bullets
                      ? `<ul>${section.bullets.map((bullet) => `<li>${bullet}</li>`).join("")}</ul>`
                      : ""
                  }
                </section>
              `
            )
            .join("")}

          <div class="article-quote">
            This is placeholder editorial structure, not reported journalism. The page is designed to plug into a CMS,
            manual publishing flow, or vetted real reporting pipeline later.
          </div>

          <section>
            <p class="eyebrow">Related stories</p>
            <div class="article-related-grid">
              ${related
                .map(
                  (item) => `
                    <article class="article-related-card">
                      <a href="${articleLink(item.slug)}">
                        <img src="${item.heroImage}" alt="${item.title}" />
                        <div class="article-related-copy">
                          <span class="news-chip">${item.category}</span>
                          <h3>${item.title}</h3>
                        </div>
                      </a>
                    </article>
                  `
                )
                .join("")}
            </div>
          </section>
        </div>

        <aside class="article-side-rail">
          <section class="article-rail-card">
            <p class="eyebrow">From the movement</p>
            <h3>Independent-minded by design</h3>
            <p>
              The Texas Unchained standard leaves room to praise Texas when it performs well and criticize state
              leadership when it falls short of the mission.
            </p>
          </section>

          <section class="article-rail-card">
            <p class="eyebrow">Subscribe</p>
            <h3>Get briefings and editorials</h3>
            <form class="signup-form compact">
              <input type="email" placeholder="Email address" aria-label="Email address" />
              <button class="button button-primary" type="button">Sign up</button>
            </form>
          </section>
        </aside>
      </div>
    </article>
  `;
}
