import { createRoot, html } from "./lib.js";
import { Layout } from "./components/Layout.js";
import { events } from "./data/eventsData.js";

const monthLabel = "May / June 2026";
const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const calendarDays = Array.from({ length: 35 }, (_, index) => index + 1);
const eventDayMap = new Map(events.map((event) => [Number(event.date.slice(-2)), event]));

function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

function EventsPage() {
  document.title = "Upcoming Events | Texas Unchained";

  return html`
    <${Layout} current="Upcoming Events">
      <main>
        <section className="utility-page-hero fade-section">
          <div className="utility-hero-card section-card">
            <p className="eyebrow">Upcoming Events</p>
            <h1>Organize locally. Build Texas-wide momentum.</h1>
            <p className="section-intro">
              Town halls, industry briefings, volunteer meetups, and local events for Texans ready to build.
            </p>
            <a className="button-primary" href="./suggest-event.html">Suggest an Event</a>
          </div>
        </section>

        <section className="section fade-section">
          <div className="events-layout">
            <article className="section-card events-calendar-card">
              <div className="events-calendar-head">
                <div>
                  <p className="eyebrow">Calendar</p>
                  <h2>${monthLabel}</h2>
                </div>
                <a className="button-secondary" href="./suggest-event.html">Suggest Event</a>
              </div>

              <div className="calendar-grid calendar-weekdays">
                ${weekdays.map((day) => html`<span>${day}</span>`)}
              </div>
              <div className="calendar-grid">
                ${calendarDays.map((day) => {
                  const event = eventDayMap.get(day);
                  return html`
                    <div className=${`calendar-day ${event ? "has-event" : ""}`}>
                      <span>${day}</span>
                      ${event ? html`<strong>${event.city}</strong>` : null}
                    </div>
                  `;
                })}
              </div>
            </article>

            <aside className="events-list">
              ${events.map(
                (event) => html`
                  <article className="section-card event-card">
                    <p className="eyebrow">${formatDate(event.date)} / ${event.time}</p>
                    <h3>${event.title}</h3>
                    <p>${event.city} / ${event.venue}</p>
                    <span>${event.description}</span>
                  </article>
                `
              )}
            </aside>
          </div>
        </section>
      </main>
    <//>
  `;
}

createRoot(document.getElementById("root")).render(html`<${EventsPage} />`);
