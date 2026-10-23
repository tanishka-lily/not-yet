import Image from "next/image";

const NEW_BOOK = "new";

export default function StudyChat({
  books,
  selectedBookId,
  newBookTitle,
  messages,
  draftMessage,
  pendingImageUrl,
  pageLabel,
  transcription,
  nudgeCount,
  busyAction,
  storageAvailable,
  error,
  onBookChange,
  onNewBookTitleChange,
  onCreateBook,
  onPaste,
  onPageLabelChange,
  onTranscriptionChange,
  onReadSection,
  onSaveSection,
  onCancelImage,
  onDraftMessageChange,
  onSendMessage,
  onNudge,
}) {
  const hasBook = books.some((book) => book.id === selectedBookId);
  const canCreateBook = selectedBookId === NEW_BOOK && newBookTitle.trim().length > 0;

  return (
    <section className="study-chat" aria-labelledby="study-chat-heading">
      <p className="eyebrow">A quiet place to think</p>
      <h2 className="section-heading" id="study-chat-heading">Study chat</h2>
      <label className="field">
        This conversation is about
        <select onChange={(event) => onBookChange(event.target.value)} value={selectedBookId}>
          <option value={NEW_BOOK}>A new book</option>
          {books.map((book) => (
            <option key={book.id} value={book.id}>{book.title}</option>
          ))}
        </select>
      </label>

      {selectedBookId === NEW_BOOK && (
        <div className="new-book-row">
          <label className="field">
            Book title
            <input
              autoComplete="off"
              onChange={(event) => onNewBookTitleChange(event.target.value)}
              placeholder="Type the book title"
              value={newBookTitle}
            />
          </label>
          <button disabled={!canCreateBook} onClick={onCreateBook} type="button">Create book</button>
        </div>
      )}

      {storageAvailable === false && (
        <p className="notice" role="status">
          I can keep this here for now, but it may not be here if you refresh or leave.
        </p>
      )}

      <div className="chat-log" aria-live="polite" aria-label="Study conversation">
        {messages.length === 0 && (
          <p className="empty-chat">
            {hasBook
              ? "Choose a saved section to explore, or paste a screenshot here to add one."
              : "Choose or create a book, then paste a screenshot here whenever you're ready."}
          </p>
        )}
        {messages.map((message) => (
          <article className={`chat-message ${message.role}`} key={message.id}>
            <p className="chat-role">{message.role === "assistant" ? "Study partner" : "You"}</p>
            <p>{message.text}</p>
          </article>
        ))}
        {busyAction && <p className="status-line" role="status">{busyAction === "read" ? "Reading the page..." : "Thinking with your book..."}</p>}
      </div>

      {pendingImageUrl && (
        <section className="pasted-section" aria-label="Pasted page">
          <Image
            alt="Screenshot pasted into the study chat"
            className="photo-preview"
            height={700}
            src={pendingImageUrl}
            unoptimized
            width={1000}
          />
          <label className="field">
            Page or section label <span className="muted">(optional)</span>
            <input
              autoComplete="off"
              onChange={(event) => onPageLabelChange(event.target.value)}
              placeholder="For example, Chapter 2, page 31"
              value={pageLabel}
            />
          </label>
          {transcription !== null && (
            <>
              <p className="eyebrow">Check the reading</p>
              {transcription.includes("[unclear]") && (
                <p className="notice" role="status">I’m not sure about the parts marked [unclear]. Please check them against the screenshot.</p>
              )}
              <label className="field">
                Text read from the screenshot
                <textarea onChange={(event) => onTranscriptionChange(event.target.value)} value={transcription} />
              </label>
              <div className="button-row">
                <button disabled={!transcription.trim() || busyAction !== ""} onClick={onSaveSection} type="button">Save text section</button>
                <button className="secondary-button" disabled={busyAction !== ""} onClick={onCancelImage} type="button">Cancel</button>
              </div>
            </>
          )}
          {transcription === null && (
            <div className="button-row">
              <button disabled={busyAction !== ""} onClick={onReadSection} type="button">Read screenshot</button>
              <button className="secondary-button" disabled={busyAction !== ""} onClick={onCancelImage} type="button">Cancel</button>
            </div>
          )}
        </section>
      )}

      {error && <p className="notice" role="alert">{error}</p>}

      <form className="chat-composer" onSubmit={onSendMessage}>
        <label className="field">
          Your message
          <textarea
            onChange={(event) => onDraftMessageChange(event.target.value)}
            onPaste={onPaste}
            placeholder="Think out loud, ask a question, or paste a screenshot with Ctrl+V..."
            value={draftMessage}
          />
        </label>
        <p className="muted composer-hint">Paste a screenshot here to read it once and save its text under this book.</p>
        <div className="button-row">
          <button disabled={!hasBook || !draftMessage.trim() || busyAction !== ""} type="submit">Send</button>
          <button className="secondary-button" disabled={!hasBook || !messages.length || busyAction !== ""} onClick={onNudge} type="button">Nudge</button>
        </div>
      </form>
      {nudgeCount >= 3 && <p className="muted nudge-note">We can talk it through, or you can save where you got stuck.</p>}
    </section>
  );
}