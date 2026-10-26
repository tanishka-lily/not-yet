"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Mascot from "./Mascot.js";
import "../app/cat.css";
import "../app/cat-wood.css";

const HOME_W = 280;
const HOME_H = 520;
const CAT_W = 72;
const CAT_H = 68;
const VISIBLE_KEY = "technical-reading-companion:cat-visible:v1";
const SLEEPY_AFTER_MS = 60000;

// After you put your own drawings in public/cat/, set this to true.
// Files needed: calm, thinking, purr, walk, sleep, held.
const USE_OWN_ART = false;
const OWN_ART_EXTENSION = "svg";

// Where the cat can stand, from the top of the tree to the floor.
// Numbers are pixels from the top-left corner of the cat's home.
const PLATFORMS = [
  { id: "perch", top: 100, minX: 6, maxX: 196 },
  { id: "roof", top: 220, minX: 130, maxX: 278 },
  { id: "mid", top: 340, minX: 6, maxX: 122 },
  { id: "bed", top: 480, minX: 6, maxX: 112 },
];
const FLOOR = { id: "floor", top: HOME_H - 8, minX: 0, maxX: HOME_W };
const SURFACES = [...PLATFORMS, FLOOR];
const LEVELS = SURFACES.map((item) => item.id);
const ROPE_Y = Array.from({ length: 17 }, (_, index) => 236 + index * 15);
const EDGE = { stroke: "var(--wood-dark, #6f4529)", strokeWidth: 2 };
const DARK_WOOD = { fill: "var(--wood-dark, #6f4529)" };

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

function surfaceById(id) {
  return SURFACES.find((item) => item.id === id) ?? FLOOR;
}

// The highest surface below the cat's feet wins, or the floor if there is none.
function findSurface(left, top) {
  const feet = top + CAT_H;
  const centre = left + CAT_W / 2;
  let best = null;

  PLATFORMS.forEach((platform) => {
    const fits = centre >= platform.minX && centre <= platform.maxX;

    if (fits && platform.top >= feet - 6 && (!best || platform.top < best.top)) {
      best = platform;
    }
  });

  return best ?? FLOOR;
}

function Plank({ x, y, width, height = 14 }) {
  return (
    <g>
      <rect fill="url(#wood-h)" height={height} rx="3" style={EDGE} width={width} x={x} y={y} />
      <rect fill="url(#grain-h)" height={height} rx="3" width={width} x={x} y={y} />
      <circle cx={x + 8} cy={y + height / 2} r="1.8" style={DARK_WOOD} />
      <circle cx={x + width - 8} cy={y + height / 2} r="1.8" style={DARK_WOOD} />
    </g>
  );
}

export default function CatCorner({ busy, count, lastText }) {
  const [visible, setVisible] = useState(true);
  const [pos, setPos] = useState(null);
  const [phase, setPhaseState] = useState("idle");
  const [sleeping, setSleepingState] = useState(false);
  const [facing, setFacing] = useState(1);
  const [petted, setPetted] = useState(false);
  const [happy, setHappy] = useState(false);

  const homeRef = useRef(null);
  const posRef = useRef(null);
  const phaseRef = useRef("idle");
  const sleepingRef = useRef(false);
  const surfaceRef = useRef("perch");
  const dragRef = useRef(null);
  const animRef = useRef(0);
  const lastTouchRef = useRef(Date.now());

  const setPhase = useCallback((value) => {
    phaseRef.current = value;
    setPhaseState(value);
  }, []);

  const setSleeping = useCallback((value) => {
    sleepingRef.current = value;
    setSleepingState(value);
  }, []);

  const place = useCallback((next) => {
    posRef.current = next;
    setPos(next);
  }, []);

  // Moves the cat to a spot over time, one animation frame at a time.
  // Resolves true when it arrives, or false if something else took over.
  const glide = useCallback((to, movePhase, duration, arc) => new Promise((resolve) => {
    const from = posRef.current;

    if (!from) {
      resolve(false);
      return;
    }

    const token = animRef.current + 1;

    animRef.current = token;
    setPhase(movePhase);

    const startedAt = performance.now();

    function frame(now) {
      if (animRef.current !== token) {
        resolve(false);
        return;
      }

      const t = Math.min(1, (now - startedAt) / duration);
      const eased = movePhase === "walk" ? t : movePhase === "fall" ? t * t : t * t * (3 - 2 * t);

      place({
        left: from.left + (to.left - from.left) * eased,
        top: from.top + (to.top - from.top) * eased - Math.sin(Math.PI * t) * arc,
      });

      if (t < 1) {
        window.requestAnimationFrame(frame);
      } else {
        resolve(true);
      }
    }

    window.requestAnimationFrame(frame);
  }), [place, setPhase]);

  // Dropped by hand (or settling after a click): falls onto the surface below.
  const land = useCallback(async (surface, leftGuess, options = {}) => {
    const left = clamp(leftGuess, surface.minX, surface.maxX - CAT_W);
    const target = { left, top: surface.top - CAT_H };

    if (options.instant || !posRef.current) {
      place(target);
      surfaceRef.current = surface.id;
      setPhase("idle");
      setSleeping(options.awake ? false : surface.id === "bed");
      return;
    }

    const distance = Math.abs(target.top - posRef.current.top);
    const arrived = await glide(target, "fall", 250 + distance * 1.2, 0);

    if (arrived) {
      surfaceRef.current = surface.id;
      setPhase("idle");
      setSleeping(options.awake ? false : surface.id === "bed");
    }
  }, [glide, place, setPhase, setSleeping]);

  // Walks along the level it is standing on.
  const walkTo = useCallback(async (target) => {
    const current = posRef.current;

    if (!current) {
      return;
    }

    setFacing(target > current.left ? 1 : -1);

    const arrived = await glide(
      { left: target, top: current.top },
      "walk",
      Math.max(600, Math.abs(target - current.left) / 0.06),
      0,
    );

    if (arrived) {
      setPhase("idle");
    }
  }, [glide, setPhase]);

  // Hops in an arc to a neighbouring level.
  const hopTo = useCallback(async (surface, leftGuess) => {
    const current = posRef.current;

    if (!current) {
      return false;
    }

    const left = clamp(leftGuess, surface.minX, surface.maxX - CAT_W);
    const target = { left, top: surface.top - CAT_H };
    const goingUp = target.top < current.top;

    if (Math.abs(left - current.left) > 4) {
      setFacing(left > current.left ? 1 : -1);
    }

    const arrived = await glide(target, "hop", 750, goingUp ? 70 : 30);

    if (arrived) {
      surfaceRef.current = surface.id;
      setPhase("idle");
    }

    return arrived;
  }, [glide, setPhase]);

  // Hops down the tree one level at a time, then curls up in the bed.
  const goToBed = useCallback(async () => {
    const bedIndex = LEVELS.indexOf("bed");

    while (surfaceRef.current !== "bed") {
      const here = LEVELS.indexOf(surfaceRef.current);
      const next = surfaceById(LEVELS[here + Math.sign(bedIndex - here)]);
      const middle = (next.minX + next.maxX - CAT_W) / 2;
      const arrived = await hopTo(next, next.id === "bed" ? 20 : middle);

      if (!arrived) {
        return;
      }
    }

    setSleeping(true);
  }, [hopTo, setSleeping]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        if (window.localStorage.getItem(VISIBLE_KEY) === "no") {
          setVisible(false);
        }
      } catch {
        // Storage is unavailable, so the cat stays visible.
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-cat", visible ? "on" : "off");
  }, [visible]);

  useEffect(() => () => {
    animRef.current += 1;
  }, []);

  useEffect(() => {
    if (!visible) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      land(surfaceById("perch"), 40, { instant: true });
    }, 50);

    return () => window.clearTimeout(timer);
  }, [visible, land]);

  // The cat does its own thing: walks, hops between levels, and goes to bed when left alone.
  useEffect(() => {
    if (!visible) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      const current = posRef.current;

      if (!current || phaseRef.current !== "idle" || sleepingRef.current) {
        return;
      }

      if (Date.now() - lastTouchRef.current > SLEEPY_AFTER_MS) {
        goToBed();
        return;
      }

      const roll = Math.random();

      if (roll < 0.15) {
        return;
      }

      if (roll < 0.65) {
        const surface = surfaceById(surfaceRef.current);
        const range = Math.max(0, surface.maxX - surface.minX - CAT_W);
        const target = surface.minX + Math.random() * range;

        if (Math.abs(target - current.left) > 40) {
          walkTo(target);
        }

        return;
      }

      const here = LEVELS.indexOf(surfaceRef.current);
      const options = [here - 1, here + 1].filter((index) => index >= 0 && index < LEVELS.length);
      const next = surfaceById(LEVELS[options[Math.floor(Math.random() * options.length)]]);
      const range = Math.max(0, next.maxX - next.minX - CAT_W);

      hopTo(next, next.minX + Math.random() * range);
    }, 2500);

    return () => window.clearInterval(timer);
  }, [visible, goToBed, hopTo, walkTo]);

  useEffect(() => {
    if (!busy) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      lastTouchRef.current = Date.now();
      setSleeping(false);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [busy, setSleeping]);

  useEffect(() => {
    if (!/^(Saved|Nice, that one)/.test(lastText)) {
      return undefined;
    }

    const on = window.setTimeout(() => {
      lastTouchRef.current = Date.now();
      setSleeping(false);
      setHappy(true);
    }, 0);
    const off = window.setTimeout(() => setHappy(false), 3200);

    return () => {
      window.clearTimeout(on);
      window.clearTimeout(off);
    };
  }, [lastText, count, setSleeping]);

  function toggleVisible() {
    const next = !visible;

    animRef.current += 1;
    setVisible(next);

    if (!next) {
      place(null);
    }

    try {
      window.localStorage.setItem(VISIBLE_KEY, next ? "yes" : "no");
    } catch {
      // Storage is unavailable, so the choice is not remembered.
    }
  }

  function pet() {
    lastTouchRef.current = Date.now();
    setSleeping(false);
    setPetted(true);
    window.setTimeout(() => setPetted(false), 2500);
  }

  function startDrag(event) {
    if (!posRef.current || !homeRef.current) {
      return;
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    animRef.current += 1;

    const rect = homeRef.current.getBoundingClientRect();

    dragRef.current = {
      offsetX: event.clientX - (rect.left + posRef.current.left),
      offsetY: event.clientY - (rect.top + posRef.current.top),
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
    };
  }

  function moveDrag(event) {
    const drag = dragRef.current;

    if (!drag || !homeRef.current) {
      return;
    }

    if (!drag.moved && Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > 5) {
      drag.moved = true;
      lastTouchRef.current = Date.now();
      setPhase("drag");
      setSleeping(false);
    }

    if (!drag.moved) {
      return;
    }

    const rect = homeRef.current.getBoundingClientRect();

    place({
      left: clamp(event.clientX - rect.left - drag.offsetX, -rect.left, window.innerWidth - rect.left - CAT_W),
      top: clamp(event.clientY - rect.top - drag.offsetY, -rect.top, window.innerHeight - rect.top - CAT_H),
    });
  }

  function endDrag(event) {
    const drag = dragRef.current;

    if (!drag) {
      return;
    }

    dragRef.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);

    const spot = findSurface(posRef.current.left, posRef.current.top);

    if (!drag.moved) {
      pet();

      if (phaseRef.current !== "idle") {
        land(spot, posRef.current.left, { awake: true });
      }

      return;
    }

    land(spot, posRef.current.left);
  }

  let pose = "sit";

  if (phase === "drag") {
    pose = "held";
  } else if (sleeping) {
    pose = "sleep";
  } else if (phase === "walk" || phase === "hop") {
    pose = "walk";
  }

  let mood = "calm";

  if (busy) {
    mood = "thinking";
  } else if (petted || happy) {
    mood = "purr";
  }

  const ownArtName = pose === "sit" ? mood : pose;

  return (
    <div className={`cat-home${visible ? "" : " cat-home-off"}`} ref={homeRef}>
      <button className="secondary-button cat-toggle" onClick={toggleVisible} type="button">
        {visible ? "Hide cat" : "Show cat"}
      </button>

      {visible && (
        <>
          <svg aria-hidden="true" className="cat-layer cat-layer-back" viewBox="0 0 280 520">
            <defs>
              <linearGradient id="wood-v" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0" style={{ stopColor: "var(--wood-light, #c58d5e)" }} />
                <stop offset="0.55" style={{ stopColor: "var(--wood, #a9744a)" }} />
                <stop offset="1" style={{ stopColor: "var(--wood-dark, #6f4529)" }} />
              </linearGradient>
              <linearGradient id="wood-h" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" style={{ stopColor: "var(--wood-light, #c58d5e)" }} />
                <stop offset="0.5" style={{ stopColor: "var(--wood, #a9744a)" }} />
                <stop offset="1" style={{ stopColor: "var(--wood-dark, #6f4529)" }} />
              </linearGradient>
              <pattern height="12" id="grain-h" patternUnits="userSpaceOnUse" width="26">
                <path
                  d="M0 3 Q7 0 13 3 T26 3 M0 9 Q7 6 13 9 T26 9"
                  fill="none"
                  stroke="rgba(0,0,0,0.13)"
                  strokeWidth="1"
                />
              </pattern>
              <pattern height="12" id="grain-v" patternTransform="rotate(90)" patternUnits="userSpaceOnUse" width="26">
                <path
                  d="M0 3 Q7 0 13 3 T26 3 M0 9 Q7 6 13 9 T26 9"
                  fill="none"
                  stroke="rgba(0,0,0,0.13)"
                  strokeWidth="1"
                />
              </pattern>
            </defs>

            <ellipse className="tree-bed-back" cx="59" cy="474" rx="53" ry="12" />

            <rect fill="url(#wood-v)" height="388" rx="3" style={EDGE} width="22" x="120" y="112" />
            <rect fill="url(#grain-v)" height="388" rx="3" width="22" x="120" y="112" />
            {ROPE_Y.map((y) => (
              <line
                className="tree-rope"
                key={y}
                style={{ stroke: "#d8bf8f", strokeWidth: 3 }}
                x1="120"
                x2="142"
                y1={y}
                y2={y}
              />
            ))}

            <Plank width={190} x={6} y={100} />

            <rect fill="url(#wood-h)" height="140" rx="3" style={EDGE} width="42" x="142" y="232" />
            <rect fill="url(#wood-h)" height="140" rx="3" style={EDGE} width="42" x="184" y="232" />
            <rect fill="url(#wood-h)" height="140" rx="3" style={EDGE} width="42" x="226" y="232" />
            <rect fill="url(#grain-v)" height="140" width="126" x="142" y="232" />
            <circle cx="205" cy="302" r="31" style={{ fill: "var(--wood-dark, #6f4529)" }} />
            <circle className="tree-hole" cx="205" cy="302" r="26" />
            <circle cx="205" cy="306" r="19" style={{ fill: "rgba(0, 0, 0, 0.35)" }} />

            <Plank width={148} x={130} y={220} />
            <Plank width={116} x={6} y={340} />
            <Plank height={10} width={112} x={2} y={498} />

            <g className="tree-toy">
              <line className="tree-string" x1="30" x2="30" y1="114" y2="146" />
              <circle className="tree-ball" cx="30" cy="153" r="7" />
            </g>

            <circle className="toy-yarn" cx="200" cy="502" r="9" />
            <path className="toy-yarn-line" d="M193 498 Q200 505 207 500 M192 504 Q200 510 208 505" />
            <ellipse className="toy-mouse" cx="244" cy="506" rx="12" ry="6" />
            <path className="toy-tail" d="M232 506 q-12 4 -18 -3" />
          </svg>

          {pos && (
            <div
              className="cat-actor"
              data-phase={phase}
              onPointerCancel={endDrag}
              onPointerDown={startDrag}
              onPointerMove={moveDrag}
              onPointerUp={endDrag}
              style={{ left: pos.left, top: pos.top }}
              title="Pet me, or pick me up and put me down somewhere"
            >
              <div className="cat-flip" style={{ transform: `scaleX(${facing})` }}>
                {USE_OWN_ART ? (
                  <img alt="" draggable="false" src={`/cat/${ownArtName}.${OWN_ART_EXTENSION}`} />
                ) : (
                  <Mascot mood={mood} pose={pose} />
                )}
              </div>
              {pose === "sleep" && <span aria-hidden="true" className="cat-zzz">z z</span>}
            </div>
          )}

          <svg aria-hidden="true" className="cat-layer cat-layer-front" viewBox="0 0 280 520">
            <rect className="tree-bed" height="42" rx="18" width="106" x="6" y="456" />
            <path className="tree-bed-line" d="M24 478 H88" />
          </svg>
        </>
      )}
    </div>
  );
}