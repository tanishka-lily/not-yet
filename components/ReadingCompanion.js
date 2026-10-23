"use client";

import { useEffect, useState } from "react";
import StudyChat from "./StudyChat.js";
import Shelf from "./Shelf.js";
import { loadShelf, saveShelf } from "../lib/storage.js";

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
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

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const result = loadShelf();
      setBooks(result.books);
      setStorageAvailable(result.available);
      if (result.books.length > 0) {
        setSelectedBookId(result.books[0].id);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => () => {
    if (pendingImageUrl) {
      URL.revokeObjectURL(pendingImageUrl);
    }
  }, [pendingImageUrl]);

  const selectedBook = books.find((book) => book.id === selectedBookId);

  function updateShelf(nextBooks) {
    setBooks(nextBooks);

    if (!saveShelf(nextBooks)) {
      setStorageAvailable(false);
    }
  }

  function addMessage(role, text) {
    setMessages((current) => [...current, { id: createId(), role, text }]);
  }

  function selectBook(bookId) {
    setSelectedBookId(bookId);
    setMessages([]);
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

  return (
    <main className="app-shell">
      <header className="masthead">
        <div>
          <p className="eyebrow">A quiet place to think</p>
          <h1>Technical Reading Companion</h1>
        </div>
      </header>

      <div className="workspace">
        <StudyChat
          books={books}
          busyAction={busyAction}
          draftMessage={draftMessage}
          error={error}
          messages={messages}
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
        <aside className="shelf-panel">
          <Shelf books={books} onOpenBook={selectBook} selectedBookId={selectedBookId} />
        </aside>
      </div>
    </main>
  );
}