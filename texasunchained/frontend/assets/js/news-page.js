import { articleCategories, articles } from "./news-data.js";

const featuredRoot = document.querySelector("#featured-story");
const chipRoot = document.querySelector("#filter-chips");
const gridRoot = document.querySelector("#news-grid");
const mostReadRoot = document.querySelector("#most-read");
const latestRoot = document.querySelector("#latest-updates");

let activeCategory = "All";

function prettyDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function articleLink(slug) {
  return `./article.html?slug=${encodeURIComponent(slug)}`;
}

function renderFeatured() {
  const featured = articles.find((article) => article.featured) ?? articles[0];
  if (!featuredRoot || !featured) return;

  featuredRoot.innerHTML = `
    <article class="featured-story-card">
      <a class="featured-story-link" href="${articleLink(featured.slug)}">
        <div class="featured-story-media">
          <img src="${featured.heroImage}" alt="${featured.title}" />
        </div>
        <div class="featured-story-copy">
          <span class="news-chip">${featured.category}</span>
          <h2>${featured.title}</h2>
          <p>${featured.excerpt}</p>
          <div class="news-meta">
            <span>${prettyDate(featured.publishDate)}</span>
            <span>${featured.author}</span>
          </div>
        </div>
      </a>
    </article>
  `;
}

function renderFilters() {
  if (!chipRoot) return;
  chipRoot.innerHTML = articleCategories
    .map(
      (category) => `
        <button class="filter-chip ${category === activeCategory ? "is-active" : ""}" type="button" data-category="${category}">
          ${category}
        </button>
      `
    )
    .join("");

  chipRoot.querySelectorAll(".filter-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      activeCategory = chip.dataset.category ?? "All";
      renderFilters();
      renderGrid();
    });
  });
}

function filteredArticles() {
  if (activeCategory === "All") return articles;
  return articles.filter((article) => article.category === activeCategory);
}

function renderGrid() {
  if (!gridRoot) return;
  gridRoot.innerHTML = filteredArticles()
    .map(
      (article) => `
        <article class="news-card">
          <a class="news-card-link" href="${articleLink(article.slug)}">
            <div class="news-card-media">
              <img src="${article.heroImage}" alt="${article.title}" />
            </div>
            <div class="news-card-copy">
              <span class="news-chip">${article.category}</span>
              <h3>${article.title}</h3>
              <p>${article.excerpt}</p>
              <div class="news-meta">
                <span>${prettyDate(article.publishDate)}</span>
                <span>${article.author}</span>
              </div>
              <span class="text-link">Read more</span>
            </div>
          </a>
        </article>
      `
    )
    .join("");
}

function renderMostRead() {
  if (!mostReadRoot) return;
  mostReadRoot.innerHTML = `
    <div class="sidebar-list">
      ${articles
        .filter((article) => article.mostRead)
        .slice(0, 4)
        .map(
          (article) => `
            <a class="sidebar-list-item" href="${articleLink(article.slug)}">
              <strong>${article.title}</strong>
              <small>${article.category} · ${prettyDate(article.publishDate)}</small>
            </a>
          `
        )
        .join("")}
    </div>
  `;
}

function renderLatest() {
  if (!latestRoot) return;
  const latest = [...articles].sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate)).slice(0, 4);
  latestRoot.innerHTML = `
    <div class="latest-list">
      ${latest
        .map(
          (article) => `
            <a class="latest-list-item" href="${articleLink(article.slug)}">
              <strong>${article.title}</strong>
              <small>${prettyDate(article.publishDate)}</small>
            </a>
          `
        )
        .join("")}
    </div>
  `;
}

renderFeatured();
renderFilters();
renderGrid();
renderMostRead();
renderLatest();
