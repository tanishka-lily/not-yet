export default function Shelf({
  books,
  selectedBookId,
  onOpenBook,
  onDeleteSection,
  onRevisit,
  onSetPointStatus,
}) {
  const selectedBook = books.find((book) => book.id === selectedBookId);

  return (
    <section aria-labelledby="shelf-heading">
      <p className="eyebrow">Your reading lives here</p>
      <h2 className="section-heading" id="shelf-heading">Your shelf</h2>

      {books.length === 0 ? (
        <p className="empty-shelf">Your shelf is empty. Add a page when you&rsquo;re ready.</p>
      ) : (
        <div className="book-spines" aria-label="Books on your shelf">
          {books.map((book) => (
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
          ))}
        </div>
      )}

      {selectedBook && (
        <div className="book-detail">
          <h3>{selectedBook.title}</h3>
          {selectedBook.sections.length === 0 ? (
            <p className="muted">No pages added yet.</p>
          ) : (
            selectedBook.sections.map((section, index) => {
              const points = section.stickingPoints ?? [];
              const active = points.filter((point) => point.status !== "understood");
              const understood = points.filter((point) => point.status === "understood");
              const label = section.pageLabel || `Section ${index + 1}`;

              return (
                <details className="section-item" key={section.id}>
                  <summary>
                    {label}
                    {active.length > 0 ? ` · ${active.length} stuck` : ""}
                  </summary>

                  <p className="passage-excerpt">{section.passageText}</p>

                  {active.length > 0 && (
                    <div>
                      <p className="eyebrow">Where you got stuck</p>
                      {active.map((point) => (
                        <div key={point.id}>
                          <p className="muted">&ldquo;{point.note}&rdquo;</p>
                          <div className="button-row">
                            <button onClick={() => onRevisit(section.id, point.id)} type="button">Revisit</button>
                            <button
                              className="secondary-button"
                              onClick={() => onSetPointStatus(section.id, point.id, "understood")}
                              type="button"
                            >
                              Got it
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {understood.length > 0 && (
                    <div>
                      <p className="eyebrow">Understood</p>
                      {understood.map((point) => (
                        <div key={point.id}>
                          <p className="muted">&ldquo;{point.note}&rdquo;</p>
                          <button
                            className="secondary-button"
                            onClick={() => onSetPointStatus(section.id, point.id, "active")}
                            type="button"
                          >
                            Bring this back
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    className="secondary-button"
                    onClick={() => onDeleteSection(selectedBook.id, section.id)}
                    type="button"
                  >
                    Remove this section
                  </button>
                </details>
              );
            })
          )}
        </div>
      )}
    </section>
  );
}