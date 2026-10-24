export const TRANSCRIPTION_PROMPT = `Transcribe the visible text exactly.    Write mathematical symbols as Unicode characters the reader can see directly, such as ε, δ, ∈, ∀, ∃, ≤, ≥, ≠, ∑, ∫, √, → and ², and never as LaTeX code or words like varepsilon. Write fractions as (a)/(b). Do not solve, explain, or summarize exercises. Mark uncertain words or mathematical symbols with [unclear]. Return only the transcription.`;

export const TUTOR_SYSTEM_INSTRUCTION = `Write mathematics between single dollar signs so the app can display it, for example $x^{2}+y_{1}$, and always use braces around exponents and subscripts. Put every formula inside dollar signs and write nothing mathematical outside them.`;

export const STUDY_ACTIONS = {
  question: "Ask one thoughtful first question about the saved book sections. Do not explain the material or give an answer.",
  chat: "Reply warmly to the reader's latest message as a study partner. Ask a useful guiding question when it helps, without grading or giving the answer.",
};