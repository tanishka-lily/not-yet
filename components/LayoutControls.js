"use client";

import { useEffect, useState } from "react";
import { loadLayout, saveLayout } from "../lib/storage.js";

const DEFAULTS = { shelfWidth: 300, chatHeight: 60 };

export default function LayoutControls() {
  const [layout, setLayout] = useState(DEFAULTS);

  useEffect(() => {
    const timer = window.setTimeout(() => setLayout(loadLayout(DEFAULTS)), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--shelf-width", `${layout.shelfWidth}px`);
    root.style.setProperty("--chat-height", `${layout.chatHeight}vh`);
  }, [layout]);

  function change(key, value) {
    const next = { ...layout, [key]: Number(value) };
    setLayout(next);
    saveLayout(next);
  }

  function reset() {
    setLayout(DEFAULTS);
    saveLayout(DEFAULTS);
  }

  return (
    <details className="layout-controls">
      <summary>Layout</summary>
      <label className="field">
        Shelf width
        <input
          max="560"
          min="180"
          onChange={(event) => change("shelfWidth", event.target.value)}
          type="range"
          value={layout.shelfWidth}
        />
      </label>
      <label className="field">
        Chat height
        <input
          max="85"
          min="30"
          onChange={(event) => change("chatHeight", event.target.value)}
          type="range"
          value={layout.chatHeight}
        />
      </label>
      <button className="secondary-button" onClick={reset} type="button">Reset layout</button>
    </details>
  );
}