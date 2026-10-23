export default function Shelf({ books, selectedBookId, onOpenBook }) {
  const selectedBook = books.find((book) => book.id === selectedBookId);

  return (
    <section aria-labelledby="shelf-heading">
      <p className="eyebrow">Your reading lives here</p>
      <h2 className="section-heading" id="shelf-heading">Your shelf</h2>

      {books.length === 0 ? (
        <p className="empty-shelf">Your shelf is empty. Add a page when you’re ready.</p>
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
            selectedBook.sections.map((section) => (
              <article className="section-item" key={section.id}>
                <p className="eyebrow">{section.pageLabel || "Section"}</p>
                <p className="passage-excerpt">{section.passageText}</p>
              </article>
            ))
          )}
        </div>
      )}
    </section>
  );
}