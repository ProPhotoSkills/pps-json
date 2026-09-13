import { getLessons } from "@/lib/course-data";

export default function Home() {
  const lessons = getLessons();

  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Pro Photo Skills · Kurs 12</p>
          <h1>Absicherung für kreative Profis.</h1>
          <p className="intro">Ein praxisnaher Leitfaden für die Entscheidungen, die dir im kreativen Alltag Sicherheit und Raum für gute Arbeit geben.</p>
          <div className="course-meta">
            <span>{lessons.length} Lektionen</span>
            <span>Selbstlern-Kurs</span>
            <span>Für Foto &amp; Film</span>
          </div>
        </div>
        <div className="hero-number" aria-hidden="true">12</div>
      </section>

      <section className="overview" aria-labelledby="lessons-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Kursübersicht</p>
            <h2 id="lessons-heading">Deine 15 Lektionen</h2>
          </div>
          <p>Jede Lektion macht ein Thema verständlich und direkt für deine Projekte nutzbar.</p>
        </div>

        <ol className="lesson-list">
          {lessons.map((lesson) => (
            <li key={lesson.slug} className="lesson-card">
              <details>
                <summary>
                  <span className="lesson-index">{String(lesson.number).padStart(2, "0")}</span>
                  <span className="lesson-title">{lesson.title}</span>
                  <span className="open-label">Öffnen</span>
                  <span className="chevron" aria-hidden="true">↓</span>
                </summary>
                <div className="lesson-content">
                  {lesson.summary && <p className="lesson-summary">{lesson.summary}{lesson.summary.length === 150 ? "…" : ""}</p>}
                  {lesson.html ? (
                    <div className="divi-content" dangerouslySetInnerHTML={{ __html: lesson.html }} />
                  ) : (
                    <p className="empty-content">Der Lektionstext wird aus der zugehörigen JSON-Datei geladen.</p>
                  )}
                </div>
              </details>
            </li>
          ))}
        </ol>
      </section>

      <footer>Pro Photo Skills · Sicher arbeiten. Frei gestalten.</footer>
    </main>
  );
}
