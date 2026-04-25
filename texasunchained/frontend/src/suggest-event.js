import { createRoot, html, useState } from "./lib.js";
import { Layout } from "./components/Layout.js";

function SuggestEventPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    eventTitle: "",
    city: "",
    date: "",
    details: "",
  });
  const [status, setStatus] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    const suggestions = JSON.parse(window.localStorage?.getItem("eventSuggestions") ?? "[]");
    suggestions.push({ ...form, submittedAt: new Date().toISOString() });
    window.localStorage?.setItem("eventSuggestions", JSON.stringify(suggestions));
    setForm({ name: "", email: "", eventTitle: "", city: "", date: "", details: "" });
    setStatus("Event suggestion received. The team can review it for the calendar.");
  }

  document.title = "Suggest an Event | Texas Unchained";

  return html`
    <${Layout} current="Upcoming Events">
      <main>
        <section className="utility-page-hero fade-section">
          <div className="utility-hero-card section-card">
            <p className="eyebrow">Suggest an Event</p>
            <h1>Bring the movement to your city.</h1>
            <p className="section-intro">
              Share a town hall, meetup, industry roundtable, or local gathering idea for the events calendar.
            </p>
          </div>
        </section>

        <section className="section fade-section">
          <div className="action-grid">
            <article className="action-panel section-card">
              <form className="action-form" onSubmit=${handleSubmit}>
                <label className="form-field">
                  <span>Your name</span>
                  <input value=${form.name} onInput=${(event) => setForm({ ...form, name: event.target.value })} required />
                </label>
                <label className="form-field">
                  <span>Email</span>
                  <input type="email" value=${form.email} onInput=${(event) => setForm({ ...form, email: event.target.value })} required />
                </label>
                <label className="form-field">
                  <span>Event title</span>
                  <input value=${form.eventTitle} onInput=${(event) => setForm({ ...form, eventTitle: event.target.value })} required />
                </label>
                <label className="form-field">
                  <span>City</span>
                  <input value=${form.city} onInput=${(event) => setForm({ ...form, city: event.target.value })} required />
                </label>
                <label className="form-field">
                  <span>Preferred date</span>
                  <input type="date" value=${form.date} onInput=${(event) => setForm({ ...form, date: event.target.value })} />
                </label>
                <label className="form-field">
                  <span>Details</span>
                  <textarea value=${form.details} onInput=${(event) => setForm({ ...form, details: event.target.value })} placeholder="Venue, topic, expected audience, host details..." required></textarea>
                </label>
                ${status ? html`<div className="form-status success">${status}</div>` : null}
                <button className="button-primary" type="submit">Submit Event</button>
              </form>
            </article>

            <aside className="action-sidebar">
              <article className="section-card action-note-card">
                <p className="eyebrow">Good Event Ideas</p>
                <h3>Keep it useful, local, and serious.</h3>
                <ul className="action-list">
                  <li>Town halls and civic briefings.</li>
                  <li>Industry, energy, agriculture, and finance roundtables.</li>
                  <li>Volunteer meetups and local organizing sessions.</li>
                </ul>
              </article>
            </aside>
          </div>
        </section>
      </main>
    <//>
  `;
}

createRoot(document.getElementById("root")).render(html`<${SuggestEventPage} />`);
