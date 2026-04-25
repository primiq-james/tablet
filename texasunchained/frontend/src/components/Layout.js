import { html, useEffect, useState } from "../lib.js";
import { navItems } from "../data/siteData.js";

function useReveal() {
  useEffect(() => {
    const nodes = document.querySelectorAll(".fade-section");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.15 }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);
}

export function Layout({ current = "Home", children }) {
  useReveal();
  const [open, setOpen] = useState(false);
  const navHref = (href) => (href.startsWith("#") ? (current === "Home" ? href : `./index.html${href}`) : href);

  useEffect(() => {
    if (!window.dataLayer) {
      window.dataLayer = [];
    }
    window.dataLayer.push({ event: "page_view", page: current.toLowerCase() });
  }, [current]);

  return html`
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="./index.html">
          <img src="./assets/images/texas-unchained-logo.jpg" alt="Texas Unchained logo" />
          <span className="brand-copy">
            <strong>Texas Unchained</strong>
            <span>Strength. Sovereignty. Texas.</span>
          </span>
        </a>

        <button className="nav-toggle" onClick=${() => setOpen((value) => !value)} aria-label="Toggle navigation">
          ${open ? "Close" : "Menu"}
        </button>

        <nav className=${`nav-links ${open ? "open" : ""}`} aria-label="Primary">
          ${navItems.map(
            (item) =>
              html`<a
                className=${item.cta ? "nav-cta" : undefined}
                href=${navHref(item.href)}
                aria-current=${current === item.label ? "page" : undefined}
              >${item.label}</a>`
          )}
        </nav>
      </header>

      ${children}

      <footer className="footer"></footer>
    </div>
  `;
}
