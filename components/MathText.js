"use client";

import katex from "katex";
import "katex/dist/katex.min.css";

function renderMath(source) {
  try {
    return katex.renderToString(source, { throwOnError: false });
  } catch {
    return null;
  }
}

export default function MathText({ text }) {
  const parts = String(text).split(/(\$[^$]+\$)/g);

  return (
    <p>
      {parts.map((part, index) => {
        if (part.length > 2 && part.startsWith("$") && part.endsWith("$")) {
          const html = renderMath(part.slice(1, -1));

          if (html) {
            return <span key={index} dangerouslySetInnerHTML={{ __html: html }} />;
          }
        }

        return <span key={index}>{part}</span>;
      })}
    </p>
  );
}