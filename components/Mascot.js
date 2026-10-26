"use client";

import { useEffect, useState } from "react";

const OUT = {
  stroke: "var(--cat-ink)",
  strokeWidth: 2.4,
  strokeLinejoin: "round",
  strokeLinecap: "round",
};
const MOUTH_FILL = { fill: "#7a2b3a", stroke: "var(--cat-ink)", strokeWidth: 2, strokeLinejoin: "round" };
const TONGUE = { fill: "#f08a9a", stroke: "var(--cat-ink)", strokeWidth: 1.5, strokeLinejoin: "round" };
const HEART = "M12 22 C2 14 3 5 8 5 C10 5 12 7 12 9 C12 7 14 5 16 5 C21 5 22 14 12 22 Z";
const STAR = "M0 -6 L1.6 -1.6 L6 0 L1.6 1.6 L0 6 L-1.6 1.6 L-6 0 L-1.6 -1.6 Z";

// Edit these lists to change which faces the cat can pull at random.
const EYE_KINDS = ["dots", "happy", "wide", "sparkle", "smug", "dizzy", "heart", "sleepy"];
const MOUTH_KINDS = ["w", "smile", "open", "tongue", "flat", "o"];
const EXTRA_KINDS = ["none", "none", "none", "hearts", "sparkles", "sweat", "anger", "question", "exclaim", "note"];

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function randomFace() {
  return { eyes: pick(EYE_KINDS), mouth: pick(MOUTH_KINDS), extra: pick(EXTRA_KINDS) };
}

function faceFor(mood, held, idle) {
  if (held) {
    return { eyes: "wide", mouth: "o", extra: "sweat" };
  }

  if (mood === "purr") {
    return { eyes: "happy", mouth: "w", extra: "hearts" };
  }

  if (mood === "thinking") {
    return { eyes: "lookup", mouth: "flat", extra: "none" };
  }

  return idle ?? { eyes: "dots", mouth: "w", extra: "none" };
}

function Eyes({ kind }) {
  switch (kind) {
    case "happy":
      return (
        <>
          <path className="cat-line" d="M38 55 Q44 46 50 55" />
          <path className="cat-line" d="M70 55 Q76 46 82 55" />
        </>
      );
    case "sleepy":
      return (
        <>
          <path className="cat-line" d="M38 52 Q44 58 50 52" />
          <path className="cat-line" d="M70 52 Q76 58 82 52" />
        </>
      );
    case "wide":
      return (
        <>
          <circle className="cat-eye cat-ink" cx="44" cy="52" r="7" />
          <circle className="cat-eye cat-ink" cx="76" cy="52" r="7" />
          <circle cx="46" cy="49.5" fill="#fff" r="2.6" />
          <circle cx="78" cy="49.5" fill="#fff" r="2.6" />
        </>
      );
    case "sparkle":
      return (
        <>
          <circle className="cat-eye cat-ink" cx="44" cy="52" r="7.4" />
          <circle className="cat-eye cat-ink" cx="76" cy="52" r="7.4" />
          <circle cx="46.2" cy="49.4" fill="#fff" r="2.8" />
          <circle cx="78.2" cy="49.4" fill="#fff" r="2.8" />
          <circle cx="42" cy="55" fill="#fff" r="1.3" />
          <circle cx="74" cy="55" fill="#fff" r="1.3" />
        </>
      );
    case "smug":
      return (
        <>
          <ellipse className="cat-ink" cx="44" cy="53" rx="5" ry="4.2" />
          <ellipse className="cat-ink" cx="76" cy="53" rx="5" ry="4.2" />
          <path className="cat-line" d="M37 49.5 H51" />
          <path className="cat-line" d="M69 49.5 H83" />
        </>
      );
    case "dizzy":
      return (
        <>
          <path className="cat-line" d="M40 48 L48 56 M48 48 L40 56" />
          <path className="cat-line" d="M72 48 L80 56 M80 48 L72 56" />
        </>
      );
    case "heart":
      return (
        <g style={{ fill: "#e56b85" }}>
          <path d={HEART} transform="translate(32 41) scale(0.8)" />
          <path d={HEART} transform="translate(64 41) scale(0.8)" />
        </g>
      );
    case "lookup":
      return (
        <>
          <circle className="cat-eye cat-ink" cx="47" cy="47" r="4.6" />
          <circle className="cat-eye cat-ink" cx="79" cy="47" r="4.6" />
          <circle cx="48.4" cy="45.4" fill="#fff" r="1.5" />
          <circle cx="80.4" cy="45.4" fill="#fff" r="1.5" />
        </>
      );
    default:
      return (
        <>
          <circle className="cat-eye cat-ink" cx="44" cy="52" r="4.8" />
          <circle className="cat-eye cat-ink" cx="76" cy="52" r="4.8" />
          <circle cx="45.6" cy="50.2" fill="#fff" r="1.6" />
          <circle cx="77.6" cy="50.2" fill="#fff" r="1.6" />
        </>
      );
  }
}

function Mouth({ kind }) {
  switch (kind) {
    case "smile":
      return <path className="cat-line" d="M52 63 Q60 70 68 63" />;
    case "open":
      return (
        <>
          <path d="M52 63 Q60 77 68 63 Z" style={MOUTH_FILL} />
          <ellipse cx="60" cy="70.5" rx="4" ry="2.4" style={{ fill: "#f08a9a" }} />
        </>
      );
    case "tongue":
      return (
        <>
          <path className="cat-line" d="M60 61 Q55 68 49.5 63" />
          <path className="cat-line" d="M60 61 Q65 68 70.5 63" />
          <path d="M56 65 Q60 75 64 65 Z" style={TONGUE} />
        </>
      );
    case "flat":
      return <path className="cat-line" d="M54 65 H66" />;
    case "o":
      return <ellipse cx="60" cy="66" rx="3" ry="4" style={MOUTH_FILL} />;
    default:
      return (
        <>
          <path className="cat-line" d="M60 61 Q55 68 49.5 63" />
          <path className="cat-line" d="M60 61 Q65 68 70.5 63" />
        </>
      );
  }
}

function Extra({ kind }) {
  switch (kind) {
    case "hearts":
      return (
        <g style={{ fill: "#e56b85" }}>
          <path d={HEART} transform="translate(96 4) scale(0.7)" />
          <path d={HEART} transform="translate(4 8) scale(0.5)" />
        </g>
      );
    case "sparkles":
      return (
        <g style={{ fill: "#f2c94c", stroke: "var(--cat-ink)", strokeWidth: 0.8 }}>
          <path d={STAR} transform="translate(108 16)" />
          <path d={STAR} transform="translate(12 18) scale(0.7)" />
        </g>
      );
    case "sweat":
      return (
        <path
          d="M104 22 Q97 32 104 37 Q111 32 104 22 Z"
          style={{ fill: "#7db7e8", stroke: "var(--cat-ink)", strokeWidth: 1.2 }}
        />
      );
    case "anger":
      return (
        <path
          d="M97 12 L107 22 M107 12 L97 22"
          style={{ fill: "none", stroke: "#d64545", strokeWidth: 3, strokeLinecap: "round" }}
        />
      );
    case "question":
      return (
        <text style={{ fill: "var(--cat-ink)", font: "700 20px Arial, sans-serif" }} x="102" y="22">?</text>
      );
    case "exclaim":
      return (
        <text style={{ fill: "#d64545", font: "700 22px Arial, sans-serif" }} x="104" y="22">!</text>
      );
    case "note":
      return (
        <text style={{ fill: "var(--cat-ink)", font: "700 20px Arial, sans-serif" }} x="100" y="20">&#9834;</text>
      );
    default:
      return null;
  }
}

function SitCat({ face, held, mood }) {
  const thinking = mood === "thinking" && !held;

  return (
    <svg
      aria-label={`A friendly cat, ${held ? "being held" : mood}`}
      className={`mascot pose-sit mood-${held ? "held" : mood}`}
      preserveAspectRatio="xMidYMax meet"
      role="img"
      viewBox="0 0 120 114"
    >
      <g className="cat-tail-sit">
        <path
          d="M84 100 C110 102 114 78 102 70"
          style={{ fill: "none", stroke: "var(--cat-ink)", strokeWidth: 13, strokeLinecap: "round" }}
        />
        <path className="cat-stroke-fur" d="M84 100 C110 102 114 78 102 70" />
      </g>

      <g className="cat-breathe">
        <ellipse className="cat-fur" cx="60" cy="96" rx="27" ry="17" style={OUT} />
        <ellipse className="cat-belly" cx="60" cy="100" rx="13" ry="10" />
        {held ? (
          <>
            <rect className="cat-fur cat-dangle" height="14" rx="6" style={OUT} width="11" x="42" y="101" />
            <rect className="cat-fur cat-dangle cat-dangle-b" height="14" rx="6" style={OUT} width="11" x="67" y="101" />
          </>
        ) : (
          <>
            <ellipse className="cat-fur cat-paw" cx="46" cy="107" rx="10" ry="6.5" />
            <ellipse className="cat-fur cat-paw" cx="74" cy="107" rx="10" ry="6.5" />
          </>
        )}
      </g>

      <g className="cat-ears">
        <path className="cat-fur" d="M22 46 L25 12 L51 27 Z" style={OUT} />
        <path className="cat-fur" d="M98 46 L95 12 L69 27 Z" style={OUT} />
        <path className="cat-ear" d="M29 38 L30 21 L43 29 Z" />
        <path className="cat-ear" d="M91 38 L90 21 L77 29 Z" />
      </g>

      <ellipse className="cat-fur" cx="60" cy="54" rx="42" ry="32" style={OUT} />
      <path className="cat-line" d="M53 24 V32 M60 23 V32 M67 24 V32" style={{ opacity: 0.45 }} />

      <Eyes kind={face.eyes} />
      <ellipse className="cat-blush" cx="30" cy="63" rx="7" ry="4.5" />
      <ellipse className="cat-blush" cx="90" cy="63" rx="7" ry="4.5" />
      <path className="cat-nose" d="M56.5 57 L63.5 57 L60 61 Z" />
      <Mouth kind={face.mouth} />
      <path className="cat-line cat-whisker" d="M22 60 L6 56" />
      <path className="cat-line cat-whisker" d="M22 65 L8 70" />
      <path className="cat-line cat-whisker" d="M98 60 L114 56" />
      <path className="cat-line cat-whisker" d="M98 65 L112 70" />

      <Extra kind={face.extra} />

      {thinking && (
        <>
          <circle className="cat-dot cat-dot-1" cx="106" cy="22" r="2" />
          <circle className="cat-dot cat-dot-2" cx="111" cy="14" r="2.6" />
          <circle className="cat-dot cat-dot-3" cx="115" cy="5" r="3.2" />
        </>
      )}
    </svg>
  );
}

function WalkCat() {
  return (
    <svg
      aria-label="A friendly cat walking"
      className="mascot pose-walk"
      preserveAspectRatio="xMidYMax meet"
      role="img"
      viewBox="0 0 148 100"
    >
      <g className="walk-bob">
        <g className="cat-tail-walk">
          <path
            d="M32 58 C8 56 6 26 24 20"
            style={{ fill: "none", stroke: "var(--cat-ink)", strokeWidth: 12, strokeLinecap: "round" }}
          />
          <path className="cat-stroke-fur" d="M32 58 C8 56 6 26 24 20" />
        </g>

        <rect className="cat-fur cat-far leg-a" height="32" rx="5" style={OUT} width="10" x="38" y="66" />
        <rect className="cat-fur cat-far leg-b" height="32" rx="5" style={OUT} width="10" x="86" y="66" />
        <ellipse className="cat-fur" cx="66" cy="60" rx="40" ry="19" style={OUT} />
        <rect className="cat-fur leg-b" height="32" rx="5" style={OUT} width="10" x="52" y="66" />
        <rect className="cat-fur leg-a" height="32" rx="5" style={OUT} width="10" x="98" y="66" />

        <path className="cat-fur" d="M95 38 L97 14 L113 30 Z" style={OUT} />
        <path className="cat-fur" d="M126 30 L137 14 L137 38 Z" style={OUT} />
        <ellipse className="cat-fur" cx="112" cy="46" rx="24" ry="20" style={OUT} />
        <circle className="cat-eye cat-ink" cx="106" cy="44" r="3.6" />
        <circle className="cat-eye cat-ink" cx="122" cy="44" r="3.6" />
        <circle cx="107.2" cy="42.8" fill="#fff" r="1.2" />
        <circle cx="123.2" cy="42.8" fill="#fff" r="1.2" />
        <ellipse className="cat-blush" cx="100" cy="53" rx="5" ry="3.4" />
        <ellipse className="cat-blush" cx="128" cy="53" rx="5" ry="3.4" />
        <path className="cat-nose" d="M129 50 L136 50 L132.5 54 Z" />
        <path className="cat-line" d="M132.5 54 Q129 59 125 57" />
        <path className="cat-line cat-whisker" d="M134 52 L147 48" />
        <path className="cat-line cat-whisker" d="M134 55 L147 59" />
      </g>
    </svg>
  );
}

function SleepCat() {
  return (
    <svg
      aria-label="A friendly cat asleep"
      className="mascot pose-sleep"
      preserveAspectRatio="xMidYMax meet"
      role="img"
      viewBox="0 0 120 76"
    >
      <g className="cat-tail-sleep">
        <path
          d="M98 64 C116 62 116 42 98 40"
          style={{ fill: "none", stroke: "var(--cat-ink)", strokeWidth: 13, strokeLinecap: "round" }}
        />
        <path className="cat-stroke-fur" d="M98 64 C116 62 116 42 98 40" />
      </g>
      <g className="cat-breathe">
        <ellipse className="cat-fur" cx="62" cy="54" rx="48" ry="21" style={OUT} />
      </g>
      <path className="cat-fur" d="M18 40 L21 16 L38 30 Z" style={OUT} />
      <path className="cat-fur" d="M58 40 L55 16 L40 30 Z" style={OUT} />
      <ellipse className="cat-fur" cx="38" cy="48" rx="25" ry="21" style={OUT} />
      <path className="cat-line" d="M26 50 Q31 55 36 50" />
      <path className="cat-line" d="M42 50 Q47 55 52 50" />
      <path className="cat-nose" d="M36 56 L42 56 L39 60 Z" />
      <path className="cat-line" d="M39 60 Q36 64 33 62" />
      <path className="cat-line" d="M39 60 Q42 64 45 62" />
      <ellipse className="cat-blush" cx="24" cy="58" rx="5" ry="3.4" />
      <ellipse className="cat-blush" cx="54" cy="58" rx="5" ry="3.4" />
    </svg>
  );
}

export default function Mascot({ pose = "sit", mood = "calm" }) {
  const [idle, setIdle] = useState(null);

  useEffect(() => {
    if (pose !== "sit" || mood !== "calm") {
      return undefined;
    }

    let first;
    let second;

    function schedule() {
      first = window.setTimeout(() => {
        setIdle(randomFace());
        second = window.setTimeout(() => {
          setIdle(null);
          schedule();
        }, 2600);
      }, 5000 + Math.random() * 6000);
    }

    schedule();

    return () => {
      window.clearTimeout(first);
      window.clearTimeout(second);
    };
  }, [pose, mood]);

    if (pose === "walk") {
    return <SitCat face={{ eyes: "happy", mouth: "w", extra: "none" }} held={false} mood="calm" />;
  }

  if (pose === "sleep") {
    return <SleepCat />;
  }

  const held = pose === "held";

  return <SitCat face={faceFor(mood, held, idle)} held={held} mood={mood} />;
}