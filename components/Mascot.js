// A placeholder cat. Swap the drawing for your own SVG later and keep the mood prop.
export default function Mascot({ mood = "calm" }) {
  return (
    <svg
      aria-label={`A friendly cat, ${mood}`}
      className={`mascot mascot-${mood}`}
      role="img"
      viewBox="0 0 120 110"
    >
      <path className="cat-tail cat-stroke-fur" d="M92 98 C118 98 118 68 104 62" />
      <ellipse className="cat-fur" cx="60" cy="94" rx="38" ry="18" />
      <path className="cat-fur" d="M28 52 L32 16 L56 36 Z" />
      <path className="cat-fur" d="M92 52 L88 16 L64 36 Z" />
      <path className="cat-ear" d="M35 42 L37 26 L49 36 Z" />
      <path className="cat-ear" d="M85 42 L83 26 L71 36 Z" />
      <ellipse className="cat-fur" cx="60" cy="58" rx="35" ry="28" />

      {mood === "purr" ? (
        <>
          <path className="cat-line" d="M40 57 Q47 48 54 57" />
          <path className="cat-line" d="M66 57 Q73 48 80 57" />
          <ellipse className="cat-blush" cx="38" cy="66" rx="6" ry="4" />
          <ellipse className="cat-blush" cx="82" cy="66" rx="6" ry="4" />
        </>
      ) : (
        <>
          <ellipse className="cat-eye cat-ink" cx="47" cy={mood === "thinking" ? 52 : 56} rx="4.5" ry="6" />
          <ellipse className="cat-eye cat-ink" cx="73" cy={mood === "thinking" ? 52 : 56} rx="4.5" ry="6" />
        </>
      )}

      <path className="cat-nose" d="M56 64 L64 64 L60 69 Z" />
      <path className="cat-line" d="M60 69 Q55 75 50 72" />
      <path className="cat-line" d="M60 69 Q65 75 70 72" />
      <path className="cat-line cat-whisker" d="M32 66 L10 62" />
      <path className="cat-line cat-whisker" d="M32 70 L12 75" />
      <path className="cat-line cat-whisker" d="M88 66 L110 62" />
      <path className="cat-line cat-whisker" d="M88 70 L108 75" />

      {mood === "thinking" && (
        <>
          <circle className="cat-dot cat-dot-1" cx="98" cy="24" r="2" />
          <circle className="cat-dot cat-dot-2" cx="106" cy="17" r="3" />
          <circle className="cat-dot cat-dot-3" cx="113" cy="9" r="4" />
        </>
      )}

      {mood === "purr" && (
        <>
          <path className="cat-line" d="M4 40 q5 -5 10 0 t10 0" />
          <path className="cat-line" d="M96 40 q5 -5 10 0 t10 0" />
        </>
      )}
    </svg>
  );
}