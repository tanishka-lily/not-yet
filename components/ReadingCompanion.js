"use client";

import { useEffect, useRef, useState } from "react";
import StudyChat from "./StudyChat.js";
import Shelf from "./Shelf.js";
import { loadShelf, saveShelf, loadChat, saveChat, loadLayout, saveLayout } from "../lib/storage.js";

const DEFAULT_SHELF_WIDTH = 320;
const MIN_SHELF_WIDTH = 200;
const MAX_SHELF_WIDTH = 640;

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function clampWidth(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return DEFAULT_SHELF_WIDTH;
  }

  return Math.min(MAX_SHELF_WIDTH, Math.max(MIN_SHELF_WIDTH, Math.round(number)));
}

export default function ReadingCompanion() {
  const [books, setBooks] = useState([]);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [selectedBookId, setSelectedBookId] = useState("new");
  const [newBookTitle, setNewBookTitle] = useState("");
  const [messages, setMessages] = useState([]);
  const [draftMessage, setDraftMessage] = useState("");
  const [pendingImage, setPendingImage] = useState(null);
  const [pendingImageUrl, setPendingImageUrl] = useState("");
  const [pageLabel, setPageLabel] = useState("");
  const [transcription, setTranscription] = useState(null);
  const [nudgeCount, setNudgeCount] = useState(0);
  const [busyAction, setBusyAction] = useState("");
  const [error, setError] = useState("");
  const [shelfWidth, setShelfWidth] = useState(DEFAULT_SHELF_WIDTH);
  const [resizing, setResizing] = useState(false);
  const [hovering, setHovering] = useState(false);
  const workspaceRef = useRef(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const result = loadShelf();
      setBooks(result.books);
      setStorageAvailable(result.available);
      if (result.books.length > 0) {
        setSelectedBookId(result.books[0].id);
        setMessages(loadChat(result.books[0].id));
      }
      setShelfWidth(clampWidth(loadLayout({ shelfWidth: DEFAULT_SHELF_WIDTH }).shelfWidth));
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => () => {
    if (pendingImageUrl) {
      URL.revokeObjectURL(pendingImageUrl);
    }
  }, [pendingImageUrl]);

  useEffect(() => {
    if (selectedBookId !== "new") {
      saveChat(selectedBookId, messages);
    }
  }, [messages, selectedBookId]);

  const selectedBook = books.find((book) => book.id === selectedBookId);

  function startResize(event) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setResizing(true);
  }

  function moveResize(event) {
    if (!resizing || !workspaceRef.current) {
      return;
    }

    const rect = workspaceRef.current.getBoundingClientRect();
    setShelfWidth(clampWidth(rect.right - event.clientX - 10));
  }

  function endResize(event) {
    if (!resizing) {
      return;
    }

    event.currentTarget.releasePointerCapture?.(event.pointerId);
    setResizing(false);
    saveLayout({ shelfWidth });
  }

  function resetLayout() {
    setShelfWidth(DEFAULT_SHELF_WIDTH);
    saveLayout({ shelfWidth: DEFAULT_SHELF_WIDTH });
  }

  function updateShelf(nextBooks) {
    setBooks(nextBooks);

    if (!saveShelf(nextBooks)) {
      setStorageAvailable(false);
    }
  }

  function deleteSection(bookId, sectionId) {
    if (!window.confirm("Remove this section from your shelf? This can't be undone.")) {
      return;
    }

    const nextBooks = books.map((book) => (
      book.id === bookId
        ? { ...book, sections: book.sections.filter((section) => section.id !== sectionId) }
        : book
    ));

    updateShelf(nextBooks);
  }

  function saveStickingPoint(sectionId, note) {
    const cleanNote = note.trim();

    if (!selectedBook || !sectionId || !cleanNote) {
      return;
    }

    const point = {
      id: createId(),
      note: cleanNote,
      status: "active",
      savedAt: new Date().toISOString(),
    };
    const nextBooks = books.map((book) => (
      book.id === selectedBook.id
        ? {
          ...book,
          sections: book.sections.map((section) => (
            section.id === sectionId
              ? { ...section, stickingPoints: [...(section.stickingPoints ?? []), point] }
              : section
          )),
        }
        : book
    ));

    updateShelf(nextBooks);
    addMessage("assistant", "Saved. That's a good place to come back to, and there's nothing to fix right now.");
  }

  function setPointStatus(sectionId, pointId, status) {
    if (!selectedBook) {
      return;
    }

    const nextBooks = books.map((book) => (
      book.id === selectedBook.id
        ? {
          ...book,
          sections: book.sections.map((section) => (
            section.id === sectionId
              ? {
                ...section,
                stickingPoints: (section.stickingPoints ?? []).map((point) => (
                  point.id === pointId ? { ...point, status } : point
                )),
              }
              : section
          )),
        }
        : book
    ));

    updateShelf(nextBooks);

    if (status === "understood") {
      addMessage("assistant", "Nice, that one's yours now. It's tucked away under Understood if you ever want it back.");
    }
  }

  async function revisitStickingPoint(sectionId, pointId) {
    const section = selectedBook?.sections.find((item) => item.id === sectionId);
    const point = section?.stickingPoints?.find((item) => item.id === pointId);

    if (!section || !point) {
      return;
    }

    const prompt = `I want to come back to a place where I got stuck. I wrote: "${point.note}". Please ask me one fresh question about that point. Do not repeat an earlier question and do not give the answer.`;

    setError("");
    setNudgeCount(0);
    setBusyAction("chat");
    addMessage("assistant", `Coming back to what you wrote: "${point.note}"`);

    try {
      const reply = await requestStudy("chat", [...messages, { role: "user", text: prompt }], [section], 0);
      addMessage("assistant", reply);
    } catch (revisitError) {
      setError(revisitError.message || "I couldn't make a question just now. Try again in a moment.");
    } finally {
      setBusyAction("");
    }
  }

  function addMessage(role, text) {
    setMessages((current) => [...current, { id: createId(), role, text }]);
  }

  function selectBook(bookId) {
    setSelectedBookId(bookId);
    setMessages(bookId === "new" ? [] : loadChat(bookId));
    setNudgeCount(0);
    setError("");
    clearPastedImage();
  }

  function createBook() {
    const cleanTitle = newBookTitle.trim();
    if (!cleanTitle) {
      return;
    }

    const book = { id: createId(), title: cleanTitle, status: "reading", sections: [] };
    updateShelf([...books, book]);
    setSelectedBookId(book.id);
    setNewBookTitle("");
    setMessages([]);
    setNudgeCount(0);
    setError("");
  }

  function handlePaste(event) {
    const imageItem = Array.from(event.clipboardData?.items ?? [])
      .find((item) => item.type.startsWith("image/"));

    if (!imageItem) {
      return;
    }

    event.preventDefault();

    if (!selectedBook) {
      setError("Choose or create a book before pasting a page.");
      return;
    }

    const image = imageItem.getAsFile();
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!image || !allowedTypes.includes(image.type)) {
      setError("Please paste a JPEG, PNG, or WebP screenshot.");
      return;
    }

    if (image.size > 10 * 1024 * 1024) {
      setError("That screenshot is a little large. Try one under 10 MB.");
      return;
    }

    setPendingImage(image);
    setPendingImageUrl(URL.createObjectURL(image));
    setPageLabel("");
    setTranscription(null);
    setError("");
  }

  function clearPastedImage() {
    setPendingImage(null);
    setPendingImageUrl("");
    setPageLabel("");
    setTranscription(null);
  }

  async function requestStudy(action, nextMessages, sectionOverride = selectedBook?.sections ?? [], nextNudgeCount = nudgeCount) {
    const response = await fetch("/api/study", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        sections: sectionOverride,
        messages: nextMessages.map(({ role, text }) => ({ role, text })),
        nudgeCount: nextNudgeCount,
      }),
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "I couldn't make a useful reply just now. Please try again.");
    }

    return result.text;
  }

  async function readPastedImage() {
    if (!pendingImage || !selectedBook) {
      return;
    }

    setError("");
    setBusyAction("read");

    try {
      const formData = new FormData();
      formData.set("action", "read-section");
      formData.set("image", pendingImage);

      const response = await fetch("/api/study", { method: "POST", body: formData });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "I couldn't read that screenshot just now. Try again.");
      }

      setTranscription(result.text);
    } catch (readError) {
      setError(readError.message || "I couldn't read that screenshot just now. Try again.");
    } finally {
      setBusyAction("");
    }
  }

  async function saveTextSection() {
    if (!selectedBook || !transcription?.trim()) {
      return;
    }

    const section = {
      id: createId(),
      pageLabel: pageLabel.trim(),
      passageText: transcription.trim(),
      stickingPoints: [],
    };
    const nextBook = { ...selectedBook, sections: [...selectedBook.sections, section] };
    const nextBooks = books.map((book) => (book.id === selectedBookId ? nextBook : book));

    updateShelf(nextBooks);
    addMessage("assistant", `Saved this text section${section.pageLabel ? ` (${section.pageLabel})` : ""} under ${selectedBook.title}. Let's explore it together.`);
    clearPastedImage();
    setNudgeCount(0);
    setBusyAction("question");

    try {
      const question = await requestStudy("question", messages, nextBook.sections, 0);
      addMessage("assistant", question);
    } catch (questionError) {
      setError(questionError.message || "The section is saved. I couldn't make a question just now; try again in the chat.");
    } finally {
      setBusyAction("");
    }
  }

  async function sendMessage(event) {
    event.preventDefault();
    const text = draftMessage.trim();

    if (!text || !selectedBook) {
      return;
    }

    const nextMessages = [...messages, { role: "user", text }];
    addMessage("user", text);
    setDraftMessage("");
    setError("");
    setBusyAction("chat");

    try {
      addMessage("assistant", await requestStudy("chat", nextMessages));
    } catch (chatError) {
      setError(chatError.message || "I couldn't reply just now. Your message is still here for this visit.");
    } finally {
      setBusyAction("");
    }
  }

  async function requestNudge() {
    if (!selectedBook) {
      return;
    }

    const nextCount = nudgeCount + 1;
    setNudgeCount(nextCount);
    setError("");
    setBusyAction("nudge");

    try {
      addMessage("assistant", await requestStudy("nudge", messages, selectedBook.sections, nextCount));
    } catch (nudgeError) {
      setError(nudgeError.message || "I couldn't offer a nudge just now. Please try again.");
    } finally {
      setBusyAction("");
    }
  }

  const handleLit = resizing || hovering;

  return (
    <main className="app-shell">
      <header className="masthead">
        <div>
          <p className="eyebrow">A quiet place to think</p>
          <h1>Not Yet</h1>
        </div>
      </header>

      <div
        className="workspace"
        ref={workspaceRef}
        style={{
          "--shelf-width": `${shelfWidth}px`,
          "--chat-height": "65vh",
          display: "grid",
          gridTemplateColumns: `minmax(0, 1fr) ${shelfWidth}px`,
        }}
      >
        <StudyChat
          books={books}
          busyAction={busyAction}
          draftMessage={draftMessage}
          error={error}
          messages={messages}
          selectedBook={selectedBook}
          newBookTitle={newBookTitle}
          nudgeCount={nudgeCount}
          onBookChange={selectBook}
          onCancelImage={clearPastedImage}
          onCreateBook={createBook}
          onDraftMessageChange={setDraftMessage}
          onNewBookTitleChange={setNewBookTitle}
          onNudge={requestNudge}
          onPageLabelChange={setPageLabel}
          onPaste={handlePaste}
          onSaveStuckPoint={saveStickingPoint}
          onTranscriptionChange={setTranscription}
          onSaveSection={saveTextSection}
          onSendMessage={sendMessage}
          onReadSection={readPastedImage}
          pageLabel={pageLabel}
          pendingImageUrl={pendingImageUrl}
          selectedBookId={selectedBookId}
          storageAvailable={storageAvailable}
          transcription={transcription}
        />
        <aside className="shelf-panel" style={{ position: "relative", minWidth: 0 }}>
          <div
            aria-label="Drag to resize the shelf. Double-click to reset."
            onDoubleClick={resetLayout}
            onPointerCancel={endResize}
            onPointerDown={startResize}
            onPointerEnter={() => setHovering(true)}
            onPointerLeave={() => setHovering(false)}
            onPointerMove={moveResize}
            onPointerUp={endResize}
            role="separator"
            style={{
              position: "absolute",
              left: -16,
              top: 0,
              bottom: 0,
              width: 12,
              cursor: "col-resize",
              touchAction: "none",
              display: "flex",
              justifyContent: "center",
              zIndex: 5,
            }}
            title="Drag to resize. Double-click to reset."
          >
            <div
              style={{
                width: 3,
                height: "100%",
                borderRadius: 2,
                background: handleLit ? "#3b82f6" : "rgba(59, 130, 246, 0.25)",
                transition: "background 0.15s",
              }}
            />
          </div>
          <Shelf
            books={books}
            onDeleteSection={deleteSection}
            onOpenBook={selectBook}
            onRevisit={revisitStickingPoint}
            onSetPointStatus={setPointStatus}
            selectedBookId={selectedBookId}
          />
        </aside>
      </div>
    </main>
  );
}