import { createRoot, html, useMemo, useState } from "./lib.js";
import { postJson } from "./api.js";
import { Layout } from "./components/Layout.js";
import { products } from "./data/shopData.js";

function ShopPage() {
  const [selectedSizes, setSelectedSizes] = useState(
    Object.fromEntries(products.map((product) => [product.id, product.sizes[0]]))
  );
  const [cart, setCart] = useState([]);
  const [checkout, setCheckout] = useState({ fullName: "", email: "" });
  const [status, setStatus] = useState({ kind: "idle", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const total = useMemo(() => cart.reduce((sum, item) => sum + item.price, 0), [cart]);

  function addToCart(product) {
    setCart((items) => [...items, { ...product, size: selectedSizes[product.id] }]);
  }

  function removeFromCart(index) {
    setCart((items) => items.filter((_, itemIndex) => itemIndex !== index));
  }

  async function handleCheckout(event) {
    event.preventDefault();

    if (!cart.length) {
      setStatus({ kind: "error", message: "Add at least one shirt before requesting checkout." });
      return;
    }

    setSubmitting(true);
    setStatus({ kind: "idle", message: "" });

    try {
      await postJson("/api/shop-orders", {
        ...checkout,
        items: cart.map((item) => ({ id: item.id, name: item.name, size: item.size, price: item.price })),
      });

      setCart([]);
      setCheckout({ fullName: "", email: "" });
      setStatus({ kind: "success", message: "Your checkout request is in. We will follow up with fulfillment details." });
    } catch (error) {
      setStatus({ kind: "error", message: error.message });
    } finally {
      setSubmitting(false);
    }
  }

  document.title = "Shop | Texas Unchained";

  return html`
    <${Layout} current="Shop">
      <main>
        <section className="utility-page-hero fade-section">
          <div className="utility-hero-card section-card">
            <p className="eyebrow">Shop</p>
            <h1>Movement apparel with a premium storefront feel.</h1>
            <p className="section-intro">
              A compact merchandise drop built like a modern direct-to-consumer storefront, with a few flagship shirts
              to start.
            </p>
          </div>
        </section>

        <section className="section fade-section">
          <div className="shop-layout">
            <div className="shop-grid">
              ${products.map(
                (product) => html`
                  <article className="product-card section-card">
                    <div className=${`product-visual ${product.accentClass}`}>
                      <span>${product.name}</span>
                    </div>
                    <div className="product-copy">
                      <div className="product-head">
                        <div>
                          <p className="eyebrow">${product.color}</p>
                          <h2>${product.name}</h2>
                        </div>
                        <strong>$${product.price}</strong>
                      </div>
                      <p>${product.description}</p>
                      <div className="size-row">
                        ${product.sizes.map(
                          (size) => html`
                            <button
                              type="button"
                              className=${`size-chip ${selectedSizes[product.id] === size ? "active" : ""}`}
                              onClick=${() => setSelectedSizes({ ...selectedSizes, [product.id]: size })}
                            >
                              ${size}
                            </button>
                          `
                        )}
                      </div>
                      <button className="button-primary" type="button" onClick=${() => addToCart(product)}>Add to Cart</button>
                    </div>
                  </article>
                `
              )}
            </div>

            <aside className="cart-panel section-card">
              <p className="eyebrow">Cart</p>
              <h2>Request checkout.</h2>
              <div className="cart-items">
                ${cart.length
                  ? cart.map(
                      (item, index) => html`
                        <div className="cart-item">
                          <div>
                            <strong>${item.name}</strong>
                            <span>${item.size} · $${item.price}</span>
                          </div>
                          <button type="button" className="button-ghost" onClick=${() => removeFromCart(index)}>Remove</button>
                        </div>
                      `
                    )
                  : html`<p className="empty-copy">Your cart is empty.</p>`}
              </div>
              <div className="cart-total">Total: <strong>$${total}</strong></div>

              <form className="action-form" onSubmit=${handleCheckout}>
                <label className="form-field">
                  <span>Full name</span>
                  <input
                    type="text"
                    value=${checkout.fullName}
                    onInput=${(event) => setCheckout({ ...checkout, fullName: event.target.value })}
                    placeholder="Your full name"
                    required
                  />
                </label>
                <label className="form-field">
                  <span>Email</span>
                  <input
                    type="email"
                    value=${checkout.email}
                    onInput=${(event) => setCheckout({ ...checkout, email: event.target.value })}
                    placeholder="you@example.com"
                    required
                  />
                </label>
                ${status.message
                  ? html`<div className=${`form-status ${status.kind}`}>${status.message}</div>`
                  : null}
                <button className="button-primary" type="submit" disabled=${submitting}>
                  ${submitting ? "Sending..." : "Request Checkout"}
                </button>
              </form>
            </aside>
          </div>
        </section>
      </main>
    <//>
  `;
}

createRoot(document.getElementById("root")).render(html`<${ShopPage} />`);
