import { GoogleGenAI } from "@google/genai";
import { STUDY_ACTIONS, TRANSCRIPTION_PROMPT, TUTOR_SYSTEM_INSTRUCTION } from "./prompts.js";

const DEFAULT_MODEL = "gemini-3.8-flash";

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing. Add it to .env.local in the project root.");
  }

  return new GoogleGenAI({ apiKey });
}

export async function readPhoto({ data, mimeType }) {
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const ai = getClient();
  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        role: "user",
        parts: [
          { text: TRANSCRIPTION_PROMPT },
          { inlineData: { data, mimeType } },
        ],
      },
    ],
    config: { maxOutputTokens: 4096 },
  });

  return response.text?.trim() ?? "";
}

export async function respondToStudy({ action, sections, messages, nudgeCount = 0 }) {
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const bookContext = sections.length
    ? sections.map((section, index) => {
      const label = section.pageLabel ? ` (${section.pageLabel})` : "";
      return `Section ${index + 1}${label}:\n${section.passageText}`;
    }).join("\n\n")
    : "No saved text sections yet. Invite the reader to paste a screenshot into this book's chat.";
  const history = messages.map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: message.text }],
  }));
  const nudgeInstruction = action === "nudge"
    ? `Give one small hint. This is nudge ${nudgeCount}; make it a little more specific than earlier hints but stop before the answer. ${nudgeCount >= 3 ? "After this hint, gently offer to talk it through or save a sticking point." : ""}`
    : STUDY_ACTIONS[action];
  const ai = getClient();
  const response = await ai.models.generateContent({
    model,
    contents: [
      { role: "user", parts: [{ text: `Saved text sections for this book:\n${bookContext}` }] },
      ...history,
      { role: "user", parts: [{ text: nudgeInstruction }] },
    ],
    config: {
      systemInstruction: TUTOR_SYSTEM_INSTRUCTION,
      maxOutputTokens: 512,
    },
  });

  return response.text?.trim() ?? "";
}