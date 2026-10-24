"use client";

import { useEffect, useState } from "react";
import Mascot from "./Mascot.js";

const MODE_KEY = "technical-reading-companion:mode:v1";
const MODES = ["auto", "light", "dark"];
const MODE_LABELS = {
  auto: "Theme: match my device",
  light: "Theme: light",
  dark: "Theme: dark",
};

function applyMode(mode) {
  const root = document.documentElement;

  if (mode === "auto") {
    root.removeAttribute("data-mode");
  } else {
    root.setAttribute("data-mode", mode);
  }
}

export default function ThemeBar({ busy, lastText }) {
  const [mode, setMode] = useState("auto");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(MODE_KEY);

        if (MODES.includes(stored)) {
          setMode(stored);
          applyMode(stored);
        }
      } catch {
        // Storage is unavailable, so the device setting is used.
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  function cycleMode() {
    const next = MODES[(MODES.indexOf(mode) + 1) % MODES.length];

    setMode(next);
    applyMode(next);

    try {
      window.localStorage.setItem(MODE_KEY, next);
    } catch {
      // Storage is unavailable, so the choice is not remembered.
    }
  }

  const happy = /^(Saved|Nice, that one)/.test(lastText);
  const mood = busy ? "thinking" : happy ? "purr" : "calm";

  return (
    <div className="masthead-right">
      <button className="secondary-button theme-toggle" onClick={cycleMode} type="button">
        {MODE_LABELS[mode]}
      </button>
      <Mascot mood={mood} />
    </div>
  );
}