import { GoogleGenAI } from "@google/genai";
import { STUDY_ACTIONS, TRANSCRIPTION_PROMPT, TUTOR_SYSTEM_INSTRUCTION } from "./prompts.js";

// Models to try, in order. GEMINI_MODEL in .env.local goes first.
const DEFAULT_MODELS = ["gemini-3.5-flash-lite", "gemini-3.6-flash", "gemini-3.8-flash"];
const MAX_WAIT_MS = 25000;

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing. Add it to .env.local in the project root.");
  }

  return new GoogleGenAI({ apiKey });
}

function modelList() {
  const extra = (process.env.GEMINI_FALLBACK_MODELS || "")
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);

  return [...new Set([process.env.GEMINI_MODEL, ...extra, ...DEFAULT_MODELS].filter(Boolean))];
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Tries each model in turn. Busy errors get one retry; rate limits move on at once.
async function generateText(buildRequest) {
  const ai = getClient();
  const startedAt = Date.now();
  let lastError = new Error("No reply from Gemini");

  for (const model of modelList()) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      if (Date.now() - startedAt > MAX_WAIT_MS) {
        throw lastError;
      }

      try {
        const response = await ai.models.generateContent({ model, ...buildRequest() });
        const text = response.text?.trim();

        if (text) {
          return text;
        }

        lastError = new Error("Empty reply");
        break;
      } catch (error) {
        lastError = error;
        const status = Number(error?.status);

        if (status === 401 || status === 403) {
          throw error;
        }

        if (status === 500 || status === 503 || status === 504) {
          await sleep(1200);
          continue;
        }

        break;
      }
    }
  }

  throw lastError;
}

export async function readPhoto({ data, mimeType }) {
  return generateText(() => ({
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
  }));
}

export async function respondToStudy({ action, sections, messages, nudgeCount = 0 }) {
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

  return generateText(() => ({
    contents: [
      { role: "user", parts: [{ text: `Saved text sections for this book:\n${bookContext}` }] },
      ...history,
      { role: "user", parts: [{ text: nudgeInstruction }] },
    ],
    config: {
      systemInstruction: TUTOR_SYSTEM_INSTRUCTION,
      maxOutputTokens: 2048,
    },
  }));
}