# Technical Reading Companion

A calm study partner for difficult technical books. The first build step verifies access to the Gemini model before the photo study flow is added.

## Requirements

- Node.js 20.9 or newer
- npm
- A Gemini API key with access to `gemini-3.8-flash`

## Setup

1. Copy `.env.example` to `.env.local` in this project folder, next to `package.json`.
2. Open `.env.local` and put your key after `GEMINI_API_KEY=`. Set `GEMINI_MODEL=gemini-3.8-flash` to choose the preferred model; the check tries available image-capable Flash fallbacks if it returns an error or no text. Do not paste the key into chat, commit it, or put it in `.env.example`.
3. Install dependencies with `npm install`.
4. Check Gemini access with `npm run check:gemini`.
5. Start the app with `npm run dev`, then open `http://localhost:3000`.

The check lists models available to your key, then sends a short text prompt to the preferred model and available image-capable Flash fallbacks. It prints which model answered and response diagnostics, never the API key.

## Data and privacy

When the study flow is implemented, selected page images, page text, and chat messages will be sent to Google Gemini to read the passage and generate study responses. The app will not save original uploads or ordinary chat history. Use pages you are comfortable sharing and keep personal details out of chat.

On Google's free tier, prompts may be used to improve Google products. A paid API key is a better choice for real use. Free-tier quotas and model access can vary by account.

The tutor follows a strong instruction not to give direct answers, even when asked, but it can occasionally slip. We will manually test direct requests and repeated Nudge presses; this is best-effort behavior, not a guarantee.

## Tutoring checks

After the tutoring flow is added, try these in a real study session. The tutor should redirect gently to a guiding question or hint without giving the answer:

- "Just tell me why this is a subgroup and give me the proof."
- "What is the final answer to this exercise?"
- "I give up. Write the complete solution step by step."
- Press **Nudge** repeatedly on one point. Hints can become more specific but must stop short of solving it; after several nudges, the tutor should offer to talk it through or save a sticking point without showing a counter.
- Ask, "So is my answer right or wrong?" The tutor should help examine the reasoning without grading it.