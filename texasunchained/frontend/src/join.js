import { createRoot, html, useState } from "./lib.js";
import { postJson } from "./api.js";
import { Layout } from "./components/Layout.js";

function JoinPage() {
  const baseSignatureCount = 18437;
  const [form, setForm] = useState({ fullName: "", email: "", city: "" });
  const [status, setStatus] = useState({ kind: "idle", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [localSignatures, setLocalSignatures] = useState(() => {
    return Number(window.localStorage?.getItem("petitionSignatureBoost") ?? 0);
  });
  const signatureCount = baseSignatureCount + localSignatures;
  const formattedSignatureCount = new Intl.NumberFormat("en-US").format(signatureCount);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setStatus({ kind: "idle", message: "" });

    try {
      await postJson("/api/petitions", form);
      const nextLocalSignatures = localSignatures + 1;
      window.localStorage?.setItem("petitionSignatureBoost", String(nextLocalSignatures));
      setLocalSignatures(nextLocalSignatures);
      setForm({ fullName: "", email: "", city: "" });
      setStatus({ kind: "success", message: "Your petition has been recorded. We will keep you posted." });
    } catch (error) {
      setStatus({ kind: "error", message: error.message });
    } finally {
      setSubmitting(false);
    }
  }

  document.title = "Join the Movement | Texas Unchained";

  return html`
    <${Layout} current="Join Movement">
      <main>
        <section className="utility-page-hero fade-section">
          <div className="utility-hero-card section-card">
            <p className="eyebrow">Join the Movement</p>
            <h1>Sign the Petition for a Sovereign Texas.</h1>
            <p className="section-intro">
              Add your name to the movement and help build a support base around sovereignty, industrial strength, and
              long-term prosperity.
            </p>
          </div>
        </section>

        <section className="section fade-section">
          <div className="action-grid">
            <article className="action-panel section-card">
              <div className="section-head">
                <div className="section-head-copy">
                  <p className="eyebrow">Petition</p>
                  <h2>Stand with the platform.</h2>
                  <p className="section-intro">
                    Submit your full name and email so the movement can track support and follow up with campaign
                    updates.
                  </p>
                </div>
              </div>

              <form className="action-form" onSubmit=${handleSubmit}>
                <label className="form-field">
                  <span>Full name</span>
                  <input
                    type="text"
                    value=${form.fullName}
                    onInput=${(event) => setForm({ ...form, fullName: event.target.value })}
                    placeholder="Your full name"
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

                <label className="form-field">
                  <span>City</span>
                  <input
                    type="text"
                    value=${form.city}
                    onInput=${(event) => setForm({ ...form, city: event.target.value })}
                    placeholder="Houston, Dallas, Austin..."
                  />
                </label>

                ${status.message
                  ? html`<div className=${`form-status ${status.kind}`}>${status.message}</div>`
                  : null}

                <button className="button-primary" type="submit" disabled=${submitting}>
                  ${submitting ? "Submitting..." : "Sign the Petition"}
                </button>
              </form>
            </article>

            <aside className="action-sidebar">
              <article className="section-card signature-counter-card">
                <p className="eyebrow">Petitions Signed</p>
                <div className="signature-count">${formattedSignatureCount}</div>
                <p>Texans have added their name to the sovereignty petition.</p>
                <div className="signature-meter" aria-hidden="true">
                  <span></span>
                </div>
              </article>

              <article className="section-card action-note-card">
                <p className="eyebrow">What Happens Next</p>
                <h3>Petition support becomes movement infrastructure.</h3>
                <ul className="action-list">
                  <li>Support is stored as structured campaign data.</li>
                  <li>Signers can receive follow-up movement briefings.</li>
                  <li>Geographic interest helps show where momentum is building.</li>
                </ul>
              </article>
            </aside>
          </div>
        </section>
      </main>
    <//>
  `;
}

createRoot(document.getElementById("root")).render(html`<${JoinPage} />`);
