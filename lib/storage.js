const STORAGE_KEY = "technical-reading-companion:shelf:v1";
const CHAT_KEY_PREFIX = "technical-reading-companion:chat:v1:";
const LAYOUT_KEY = "technical-reading-companion:layout:v1";

export function loadShelf() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return { books: [], available: true };
    }

    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed.books)) {
      return { books: [], available: false };
    }

    return { books: parsed.books, available: true };
  } catch {
    return { books: [], available: false };
  }
}

export function saveShelf(books) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, books }));
    return true;
  } catch {
    return false;
  }
}

export function loadChat(bookId) {
  try {
    const stored = window.localStorage.getItem(CHAT_KEY_PREFIX + bookId);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveChat(bookId, messages) {
  try {
    window.localStorage.setItem(CHAT_KEY_PREFIX + bookId, JSON.stringify(messages.slice(-40)));
    return true;
  } catch {
    return false;
  }
}

export function loadLayout(defaults) {
  try {
    const stored = window.localStorage.getItem(LAYOUT_KEY);
    return stored ? { ...defaults, ...JSON.parse(stored) } : defaults;
  } catch {
    return defaults;
  }
}

export function saveLayout(layout) {
  try {
    window.localStorage.setItem(LAYOUT_KEY, JSON.stringify(layout));
    return true;
  } catch {
    return false;
  }
}