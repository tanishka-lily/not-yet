"use client";

import { useEffect, useState } from "react";
import "../app/room.css";

const LOOK_KEY = "technical-reading-companion:look:v1";
const OLD_MODE_KEY = "technical-reading-companion:mode:v1";
const LOOKS = [
  { id: "auto", label: "Room: match my device", mode: null, wall: null },
  { id: "light", label: "Room: light", mode: "light", wall: null },
  { id: "dark", label: "Room: dark", mode: "dark", wall: null },
  { id: "warm", label: "Room: warm", mode: "light", wall: "warm" },
  { id: "night", label: "Room: night", mode: "dark", wall: "night" },
];

function applyLook(look) {
  const root = document.documentElement;

  if (look.mode) {
    root.setAttribute("data-mode", look.mode);
  } else {
    root.removeAttribute("data-mode");
  }

  if (look.wall) {
    root.setAttribute("data-wall", look.wall);
  } else {
    root.removeAttribute("data-wall");
  }
}

export default function ThemeBar() {
  const [lookId, setLookId] = useState("auto");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(LOOK_KEY) || window.localStorage.getItem(OLD_MODE_KEY);
        const look = LOOKS.find((item) => item.id === stored);

        if (look) {
          setLookId(look.id);
          applyLook(look);
        }
      } catch {
        // Storage is unavailable, so the device setting is used.
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  function cycleLook() {
    const index = LOOKS.findIndex((item) => item.id === lookId);
    const next = LOOKS[(index + 1) % LOOKS.length];

    setLookId(next.id);
    applyLook(next);

    try {
      window.localStorage.setItem(LOOK_KEY, next.id);
    } catch {
      // Storage is unavailable, so the choice is not remembered.
    }
  }

  const current = LOOKS.find((item) => item.id === lookId) ?? LOOKS[0];

  return (
    <div className="masthead-right">
      <button className="secondary-button theme-toggle" onClick={cycleLook} type="button">
        {current.label}
      </button>
    </div>
  );
}