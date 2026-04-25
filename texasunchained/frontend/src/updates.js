import { createRoot, html, useState } from "./lib.js";
import { postJson } from "./api.js";
import { Layout } from "./components/Layout.js";

function UpdatesPage() {
  const [form, setForm] = useState({ name: "", email: "" });
  const [status, setStatus] = useState({ kind: "idle", message: "" });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setStatus({ kind: "idle", message: "" });

    try {
      await postJson("/api/updates", form);
      setForm({ name: "", email: "" });
      setStatus({ kind: "success", message: "You are on the list. Expect future movement briefings." });
    } catch (error) {
      setStatus({ kind: "error", message: error.message });
    } finally {
      setSubmitting(false);
    }
  }

  document.title = "Get Updates | Texas Unchained";

  return html`
    <${Layout} current="Updates">
      <main>
        <section className="utility-page-hero fade-section">
          <div className="utility-hero-card section-card">
            <p className="eyebrow">Get Updates</p>
            <h1>Receive movement briefings and strategic updates.</h1>
            <p className="section-intro">
              Join the contact list for campaign announcements, merchandise drops, and future organizing updates.
            </p>
          </div>
        </section>

        <section className="section fade-section">
          <div className="action-grid">
            <article className="action-panel section-card">
              <div className="section-head">
                <div className="section-head-copy">
                  <p className="eyebrow">Subscriber List</p>
                  <h2>Get on the inside track.</h2>
                </div>
              </div>

              <form className="action-form" onSubmit=${handleSubmit}>
                <label className="form-field">
                  <span>Name</span>
                  <input
                    type="text"
                    value=${form.name}
                    onInput=${(event) => setForm({ ...form, name: event.target.value })}
                    placeholder="Your name"
                    required
                  />
                </label>

                <label className="form-field">
                  <span>Email</span>
                  <input
                    type="email"
                    value=${form.email}
                    onInput=${(event) => setForm({ ...form, email: event.target.value })}
                    placeholder="you@example.com"
                    required
                  />
                </label>

                ${status.message
                  ? html`<div className=${`form-status ${status.kind}`}>${status.message}</div>`
                  : null}

                <button className="button-primary" type="submit" disabled=${submitting}>
                  ${submitting ? "Saving..." : "Get Updates"}
                </button>
              </form>
            </article>

            <aside className="action-sidebar">
              <article className="section-card action-note-card">
                <p className="eyebrow">Stored Securely</p>
                <h3>Subscriber records are captured server-side.</h3>
                <ul className="action-list">
                  <li>Name and email are stored as structured submissions.</li>
                  <li>The list can later feed newsletters or campaign outreach.</li>
                  <li>No CMS is required for this first version.</li>
                </ul>
              </article>
            </aside>
          </div>
        </section>
      </main>
    <//>
  `;
}

createRoot(document.getElementById("root")).render(html`<${UpdatesPage} />`);
