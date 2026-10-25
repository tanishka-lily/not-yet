"use client";

import "../app/cabinet.css";

export default function Shelf({
  books,
  selectedBookId,
  onOpenBook,
  onDeleteSection,
  onRevisit,
  onSetPointStatus,
}) {
  const selectedBook = books.find((book) => book.id === selectedBookId);
  const sections = selectedBook?.sections ?? [];
  const points = sections.flatMap((section, index) => (
    (section.stickingPoints ?? []).map((point) => ({
      ...point,
      sectionId: section.id,
      sectionLabel: section.pageLabel || `Section ${index + 1}`,
    }))
  ));
  const active = points.filter((point) => point.status !== "understood");
  const understood = points.filter((point) => point.status === "understood");

  return (
    <section aria-labelledby="shelf-heading">
      <div className="shelf-title">
        <p className="eyebrow">Your reading lives here</p>
        <h2 className="section-heading" id="shelf-heading">Your shelf</h2>
      </div>

      <div className="cabinet">
        <div aria-hidden="true" className="cabinet-crown" />

        <div className="cabinet-body">
          <div aria-label="Books on your shelf" className="cabinet-shelf">
            {books.length === 0 ? (
              <p className="cabinet-empty">Your shelf is empty. Add a page when you&rsquo;re ready.</p>
            ) : (
              books.map((book) => (
                <button
                  aria-pressed={book.id === selectedBookId}
                  className="book-spine"
                  key={book.id}
                  onClick={() => onOpenBook(book.id)}
                  title={`Open ${book.title}`}
                  type="button"
                >
                  {book.title}
                </button>
              ))
            )}
          </div>

          <div className="cabinet-window">
            <div className="cabinet-glass">
              {!selectedBook && <p className="muted">Open a book to see its pages here.</p>}
              {selectedBook && sections.length === 0 && <p className="muted">No pages added yet.</p>}
              {sections.map((section, index) => (
                <details className="section-item" key={section.id}>
                  <summary>{section.pageLabel || `Section ${index + 1}`}</summary>
                  <p className="passage-excerpt">{section.passageText}</p>
                  <button
                    className="secondary-button"
                    onClick={() => onDeleteSection(selectedBook.id, section.id)}
                    type="button"
                  >
                    Remove this section
                  </button>
                </details>
              ))}
            </div>
            <div aria-hidden="true" className="cabinet-glare" />
          </div>
        </div>

        <div className="cabinet-base">
          <details className="drawer">
            <summary>
              <span aria-hidden="true" className="drawer-knob" />
              Where I got stuck ({active.length})
            </summary>
            <div className="drawer-content">
              {active.length === 0 && (
                <p className="muted">Nothing here yet. When you press I&rsquo;m stuck, it lands in this drawer.</p>
              )}
              {active.map((point) => (
                <div className="drawer-item" key={point.id}>
                  <p className="eyebrow">{point.sectionLabel}</p>
                  <p className="muted">&ldquo;{point.note}&rdquo;</p>
                  <div className="button-row">
                    <button onClick={() => onRevisit(point.sectionId, point.id)} type="button">Revisit</button>
                    <button
                      className="secondary-button"
                      onClick={() => onSetPointStatus(point.sectionId, point.id, "understood")}
                      type="button"
                    >
                      Got it
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </details>

          <details className="drawer">
            <summary>
              <span aria-hidden="true" className="drawer-knob" />
              Understood ({understood.length})
            </summary>
            <div className="drawer-content">
              {understood.length === 0 && (
                <p className="muted">Things you&rsquo;ve worked out will rest here.</p>
              )}
              {understood.map((point) => (
                <div className="drawer-item" key={point.id}>
                  <p className="eyebrow">{point.sectionLabel}</p>
                  <p className="muted">&ldquo;{point.note}&rdquo;</p>
                  <button
                    className="secondary-button"
                    onClick={() => onSetPointStatus(point.sectionId, point.id, "active")}
                    type="button"
                  >
                    Bring this back
                  </button>
                </div>
              ))}
            </div>
          </details>
        </div>

        <div aria-hidden="true" className="cabinet-feet">
          <span />
          <span />
        </div>
      </div>
    </section>
  );
}