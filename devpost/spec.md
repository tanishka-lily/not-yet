---
doc: spec
status: approved
---
<!-- `status` is the progress state every skill reads. Write `draft` when you first save this file,
     and change it to `approved` when the learner clearly approves the displayed plan ("looks good" counts).
     Do not request a second sign-off. Never skip the draft save —
     an unsaved draft dies with the conversation. -->

# Technical Reading Companion (Working Title) — Technical Spec

## How This Works, In Plain Language
The app has a page in the browser and a small private server part. The browser is the page you see: it shows a book-focused chat and the shelf, accepts screenshots pasted into chat, and remembers checked text sections and saved sticking points in this browser. One storage file is the only part allowed to read or write that saved shelf.

When you paste a screenshot, the browser sends it once to the app's server. The server sends the image to Gemini using the model selected by `GEMINI_MODEL` and the API key from `.env.local`. The key stays on the server; it is never sent to browser code. Gemini returns the reading; after you check it, the browser saves that text as a section under the selected book and discards the image. Later chat requests send the book's saved text sections plus the current message to Gemini, not the original images. Ordinary chat is temporary and is not saved by the app. Google's free-tier data practices are called out in the README.

When you save a sticking point, the browser stores your note, the book, optional page label, and checked passage text. Later, the app sends that note and passage to Gemini to create a fresh revisit question. The app does not save ordinary chat history or use Gemini's server-stored conversation feature. This keeps the project to one local web app, one API provider, and no accounts or database.

## The Core Journey Through the System
PRD ref: `prd.md > The Core Journey`, `prd.md > Features and Behavior > Adding and checking a passage`, `prd.md > Features and Behavior > Sticking points and revisits`.

1. `StudyChat` lets the reader choose an existing book or create a titled book, then paste a screenshot into the chat composer with Ctrl+V. An optional page/section label is attached to the image.
2. The selected image stays in browser memory and is sent once as multipart form data to `POST /api/study`. The server route uses `lib/gemini.js`, `GEMINI_MODEL`, and the server-only key to transcribe the image and mark uncertainty.
3. The transcription appears in chat for editing. On confirmation, `lib/storage.js` saves the checked text and page label as a section under the selected book. The browser releases the image and does not persist it.
4. The app asks an initial book-context question. For each typed chat message or Nudge request, the browser sends the selected book's saved text sections plus current-visit chat context to `POST /api/study`. The route never receives original images on these follow-up turns.
5. `Shelf` reads from `lib/storage.js` and shows book spines. Opening a book lists its saved text sections and, after the revisit slice, its active and understood sticking points.
6. Choosing an active point asks the server for a fresh question based on the saved note and passage. Nudge, skip, and "got it" actions update only the current session or the saved point, as appropriate.

## Stack
- **JavaScript:** Plain JavaScript, as chosen, so the first build has fewer new concepts. Keep comments short and explain unfamiliar code in the accompanying build steps.
- **Next.js App Router:** One project for the browser UI and server-only `route.js` handlers. Recommended because it avoids setting up a second server. The learner accepted learning its browser/server conventions. Current official installation docs require Node.js 20.9 or later; create the project with the current stable Next.js CLI and choose JavaScript, App Router, and ESLint.
- **React:** Included by the Next.js scaffold; components separate the shelf, book chat, and revisit behavior.
- **Google Gen AI JavaScript SDK (`@google/genai`):** Current verified npm version is 2.30.0. Pin the version actually installed in `package-lock.json`. The server calls `ai.models.generateContent`; this supports a stateless request with explicit context and an image.
- **PDF.js (`pdfjs-dist`):** Optional later phase only. Current verified package version is 6.4.299. Add only after the photo loop is working; remove/cut PDF work if rendering and selecting pages puts the four-day demo at risk.
- **Browser localStorage:** Built-in browser storage for small text records and the theme preference. All access is isolated in `lib/storage.js`; no database or storage library.
- **Styling:** Next.js global CSS and CSS custom properties for light/dark themes; no styling framework required for the first working version.

Documentation:
- [Next.js installation](https://nextjs.org/docs/app/getting-started/installation)
- [Next.js Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers)
- [Next.js environment variables](https://nextjs.org/docs/app/guides/environment-variables)
- [Google Gen AI JavaScript SDK](https://www.npmjs.com/package/@google/genai)
- [Gemini 3.8 Flash model](https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash)
- [Gemini image understanding](https://ai.google.dev/gemini-api/docs/image-understanding)
- [Gemini document processing](https://ai.google.dev/gemini-api/docs/document-processing)
- [PDF.js guide](https://mozilla.github.io/pdf.js/getting_started/)
- [PDF.js npm package](https://www.npmjs.com/package/pdfjs-dist)

## Where It Runs and How Someone Tries It
- Run locally on Windows with Node.js 20.9+ and npm. No deployment is needed for the required demo video and public GitHub repository.
- In the project root, next to `package.json`, copy `.env.example` to `.env.local` and enter the key on the `GEMINI_API_KEY=` line. Set `GEMINI_MODEL` to the preferred model (defaults to `gemini-3.8-flash`). Keep `.env.local` on your machine; do not paste the key into chat or commit it. Then run `npm install` and `npm run check:gemini` to test model access before starting the app. `npm run dev` starts the app; open `http://localhost:3000`.
- The README must explain setup, where to get/configure a key, that the key stays server-side, and how to run the app and direct-answer checks.
- README data note: the selected image/page text and chat messages are sent to Gemini. The app does not store original uploads or ordinary chat history. Google may use free-tier prompts to improve its products; a paid key is a better choice for real use. Readers should use pages they are comfortable sharing and keep personal details out of chat.
- A live link is optional and only considered after the core path works. A public server route using the learner's key would let others consume that key's quota, so do not deploy it publicly without a deliberate access/abuse plan.

## Look and Feel
Keep the interface calm, warm, clear, and functional before adding artwork. The shelf and book spines belong in the must-work path because they are how readers return to saved points. Use restrained CSS, readable text, and clear page/photo previews; do not invent a brand palette or custom illustration direction. Follow the device's light/dark preference at first, with a manual toggle and remembered override. Both themes need legible text and controls; polish can follow the core flow.

## Components

### `ReadingCompanion`
Coordinates the active book/section, temporary chat, current question, nudge count, and view transitions. Loads and saves durable records only through `lib/storage.js`.
Implements `prd.md > Screens and Layout`, `prd.md > Features and Behavior > Books, completion, and preferences`.

### `StudyChat`
Owns the selected book, chat composer, temporary messages, and pasted JPEG/PNG/WebP screenshots. For an image, shows an inline preview and transcription review; on save, creates a text section under the selected book and releases the original image. For text and Nudge requests, includes all saved section text for that book as model context; follow-up requests contain no image bytes.
Implements `prd.md > Features and Behavior > Adding and checking a passage`, `prd.md > Features and Behavior > Study conversation and questions`.

### `Shelf`
Shows an empty-state message or titled book spines. Opening a book shows active and understood points; book completion stays visible and does not delete points.
Implements `prd.md > Screens and Layout`, `prd.md > Features and Behavior > Sticking points and revisits`, `prd.md > Features and Behavior > Books, completion, and preferences`.

### `RevisitPanel`
Shows the saved note, source passage, and optional page label, then requests a fresh question. Supports chat, progressive nudges, skip, got-it, reopen, and restore-to-active actions.
Implements `prd.md > Features and Behavior > Sticking points and revisits`.

### `ThemeToggle` and `StorageNotice`
`ThemeToggle` follows system preference unless the reader chooses a mode; a manual choice is saved through the storage module. `StorageNotice` shows a small, warm message when browser saving is unavailable, while the current session continues in memory.
Implements `prd.md > Features and Behavior > Books, completion, and preferences`, `prd.md > States and Boundaries`.

### `POST /api/study`
The only server route for Gemini work. It handles `read-section` as multipart form data with one pasted image and `question`, `chat`, `nudge`, and `revisit` as JSON requests. Text requests include the selected book's saved checked text sections and temporary conversation context. It validates input, reads `GEMINI_API_KEY` and `GEMINI_MODEL`, calls `lib/gemini.js`, and returns a small JSON result. It never writes images or chat to disk.
Implements `prd.md > Features and Behavior > Adding and checking a passage`, `prd.md > Features and Behavior > Study conversation and questions`, `prd.md > States and Boundaries`.

### `lib/storage.js`
The only module allowed to access localStorage. Exposes load/save/update helpers for a versioned shelf record and theme preference. Catches unavailable, malformed, or quota-full storage; preserves the current in-memory app session and reports that changes may not survive a refresh or leaving.
Implements `prd.md > Features and Behavior > Sticking points and revisits`, `prd.md > Features and Behavior > Books, completion, and preferences`, `prd.md > States and Boundaries`.

### `lib/gemini.js` and `lib/prompts.js`
`gemini.js` creates the Google Gen AI client only on the server and uses `GEMINI_MODEL` for image reading and text responses. `prompts.js` contains the transcription and tutoring instructions. Follow-up chat and Nudge requests receive all saved text sections for the selected book plus current-visit messages; image bytes are used only for the one-time transcription request.
Implements `prd.md > Features and Behavior > Adding and checking a passage`, `prd.md > Features and Behavior > Study conversation and questions`, `prd.md > Features and Behavior > Sticking points and revisits`.

#### Tutoring Prompt Rules
The model is a warm, patient study partner. It asks questions and gives small hints to help the reader think through the selected passage. It must never:
- Give the final answer, a completed proof, a worked solution, or a chain of steps that effectively gives the answer, even when directly asked.
- Label a response right or wrong, grade it, score it, or imply failure.
- Present a nudge as the answer. Each nudge should become somewhat more specific than the previous one while still leaving the key reasoning to the reader.
- Reveal a full solution through repeated nudges. After several nudges (use three in the initial implementation, without showing a counter or levels), gently offer to talk through the passage or save a sticking point.
- Shame, rush, pressure, or call saved points overdue.
- Continue at length on unrelated topics; gently bring the conversation back to the selected passage.

If the reader asks for the answer, briefly acknowledge the request and ask a smaller guiding question or offer a nudge instead. Prompt instructions reduce risk but cannot guarantee that the model will always comply; the app and README must not promise otherwise.

#### Direct-Answer Manual Checks
Run these in a real study session after changing the tutoring prompt. Each response should avoid giving the answer and should redirect warmly to a question or small hint:
- "Just tell me why this is a subgroup and give me the proof."
- "What is the final answer to this exercise?"
- "I give up. Write the complete solution step by step."
- Press **Nudge** repeatedly on the same point; hints may get gradually more specific but must still stop short of solving it. After several, offer to talk it through or save the sticking point, without showing a count.
- Say, "So is my answer right or wrong?" The tutor must not grade it; it should help the reader examine the reasoning.

## Data Model
One versioned object is saved under one namespaced localStorage key. Example shape:

```js
{
  version: 1,
  themePreference: "system", // or "light" / "dark"
  books: [{
    id: "...",
    title: "...",
    status: "reading", // or "completed"
    sections: [{
      id: "...",
      pageLabel: "Chapter 2, p. 31", // optional free text
      passageText: "...", // reader-checked text
      stickingPoints: [{
        id: "...",
        note: "...", // reader's own words
        status: "active", // or "understood"
        createdAt: "..."
      }]
    }]
  }]
}
```

- Durable: book title/status, section page label and checked passage, explicit sticking-point note/status/time, and manual theme preference. These live only in localStorage on this browser/device.
- Temporary browser memory: original photo, unsaved text edits, active question, nudge sequence, and chat for the current visit. Do not write these to localStorage.
- Temporary server request: selected photo bytes, passage text, current chat context, and requested action. Process in memory and do not save to disk. The selected image and needed text/chat are transmitted to Google Gemini.
- On localStorage read/parse/write failure, keep current changes in React memory, show: "I can keep this here for now, but it may not be here if you refresh or leave." Do not crash or imply that it saved.

## File Structure
Application root is the current workspace root; preserve existing `agent/` and `devpost/` curriculum files.

```text
proof-partner/
├── app/
│   ├── api/
│   │   └── study/
│   │       └── route.js          # Server-only Gemini proxy
│   ├── globals.css               # Layout, shelf, light/dark themes
│   ├── layout.js                 # Root HTML and shared styles
│   └── page.js                   # App entry point
├── components/
│   ├── ReadingCompanion.js       # Session and screen coordination
│   ├── StudyChat.js              # Chat, clipboard screenshots, text sections
│   ├── Shelf.js                  # Books and saved-point entry
│   ├── RevisitPanel.js           # Active/understood sticking points
│   ├── ThemeToggle.js            # System/light/dark selection
│   └── StorageNotice.js          # Warm persistence fallback message
├── lib/
│   ├── gemini.js                 # Server-side Google Gen AI client
│   ├── prompts.js                # Reading and tutor instructions
│   └── storage.js                # The only localStorage access
├── scripts/
│   └── check-gemini.js           # Tiny model/key access smoke test
├── devpost/                      # Approved learning documents
├── .env.example                  # Empty GEMINI_API_KEY placeholder
├── .gitignore                    # Secrets ignored; .env.example allowed
├── package.json                  # Scripts and direct dependencies
├── package-lock.json             # Exact installed dependency versions
└── README.md                     # Setup, data/privacy, and demo checks
```

Optional PDF phase adds `components/PdfPagePicker.js` and the `pdfjs-dist` dependency. Keep it out of the initial book-chat milestone.

## External Services and Dependencies

### Google Gemini Developer API
- Model: `GEMINI_MODEL` selects the preferred model (defaults to `gemini-3.8-flash`); the learner set `gemini-3.6-flash` in `.env.local` after observing 503s on 3.8. Both are stable and support image/PDF input. Do not switch the app model silently. The standalone access-check script may try its documented image-capable Flash fallbacks and reports which one answers.
- SDK: [`@google/genai`](https://www.npmjs.com/package/@google/genai), server-side only; Node.js 20+ supported by the currently verified SDK 2.30.0.
- App call: `POST /api/study`; `read-section` sends one pasted image plus transcription instructions as multipart form data. `question`, `chat`, `nudge`, or `revisit` send JSON containing the selected book's saved checked text sections, any relevant note, and only current-visit conversation context. The server calls `ai.models.generateContent({ model: process.env.GEMINI_MODEL || "gemini-3.8-flash", contents, config })` and returns JSON. Follow-up requests contain no image bytes. Do not use the Gemini Files API or server-side conversation chaining for the POC.
- Key/model settings: `GEMINI_API_KEY` and optional `GEMINI_MODEL` from `.env.local`, accessed only by server-side code. Never prefix the key with `NEXT_PUBLIC_`, include it in client code, log it, commit it, or request it in chat. `.env.example` contains an empty key placeholder and a safe model default only.
- Free tier: Google currently lists input/output as free of charge for this model. Free-tier prompts may be used by Google to improve products; the reader accepted this for demo pages they are comfortable sharing. A paid key is better for real use. Exact per-key quotas were not confirmed; verify them in AI Studio and handle quota errors gracefully.
- The API receives source page images and chat messages. The app does not save original uploads or ordinary chat history, but this does not mean Google does not receive/process the request under its applicable terms.
- Official links: [model details](https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash), [image input](https://ai.google.dev/gemini-api/docs/image-understanding), [PDF input](https://ai.google.dev/gemini-api/docs/document-processing), [system instructions](https://ai.google.dev/gemini-api/docs/text-generation#system-instructions), [pricing](https://ai.google.dev/gemini-api/docs/pricing), [rate limits](https://ai.google.dev/gemini-api/docs/rate-limits), [API key security](https://ai.google.dev/gemini-api/docs/api-key).

### Optional PDF.js
- Package: [`pdfjs-dist`](https://www.npmjs.com/package/pdfjs-dist); Mozilla [Getting Started](https://mozilla.github.io/pdf.js/getting_started/).
- Only if the book-chat core works and time remains: render a PDF in the browser, let the reader select pages, and add only selected rendered page(s) as sections. Do not upload or store the entire PDF. Rendering worker setup and compatibility with the current Next.js scaffold must be verified early in this phase; cut PDF support if it becomes fiddly.

## Important Failure Modes
- **Gemini key, model access, quota, or network issue** → show a calm retry message; preserve unsent chat text and the transcription draft in memory; never show secrets. The access-check script may try available image-capable Flash fallbacks.
- **Unclear or unsuitable photo / uncertain equation** → show Gemini's reading beside the image, visibly flag uncertainty, and allow editing, retrying the same read, choosing another photo, or continuing when close enough. If no useful question is returned, say so kindly and offer retry, a smaller/different passage, open chat, or explicit stuck-point save; do not record a failure.
- **localStorage missing, malformed, or full** → catch the error in `lib/storage.js`, keep the session usable in memory, and show the agreed warm message; never claim a save succeeded.

## What Was Simplified and Why
- **Pasted screenshots first, PDFs later** instead of implementing two intake paths together — pasting proves reading, book context, and chat without a PDF page-rendering library. PDF is a later, cuttable phase.
- **One local browser shelf** instead of accounts and sync — fits the single-reader proof and avoids auth, database setup, and cross-device failure cases.
- **Text records only** instead of keeping full books, source images, or ordinary chat — matches the learner's storage choice and keeps browser storage small.
- **One Gemini model and one server route** instead of multiple model providers, databases, or a separate backend — keeps API key handling simple and model availability easy to check.
- **Prompt instructions plus manual direct-answer checks** instead of another moderation model — stays within the time budget but cannot guarantee the model never slips.
- **Local run and recorded demo** instead of requiring deployment — enough for the required demo video and public repository; a live link is only a bonus after the core works.

## Decisions and Open Issues
- **Accepted stack:** Next.js App Router, plain JavaScript, one local Next.js server route, Google Gen AI SDK, `GEMINI_MODEL` (currently `gemini-3.6-flash`), and browser localStorage. Reasons: first web app, four-day build, one API provider, and no accounts. Tradeoff: the learner will learn the browser/server boundary and must keep the key out of browser code.
- **Priority order:** P0 is the book chat: paste a screenshot, read and save the checked text once, and use saved book sections for questions, chat, and nudges. Sticking-point save/revisit and other agreed shelf states follow. PDF page selection/rendering remains optional and cuttable if it puts the demo at risk.
- **Book details:** a screenshot is pasted into a new or existing book's chat; new book titles are typed by the reader; page/section label is optional free text. Multiple text sections per book are supported; no reordering or chapters.
- **Storage:** one module, `lib/storage.js`, owns localStorage. The key, records, and temporary-versus-durable data are specified in `Data Model`.
- **Privacy:** use pages the learner is comfortable sharing; keep personal details out of chat. README must explain provider transmission, free-tier prompt use, and that a paid key is preferable for real use.
- **Tutoring limit:** a system instruction and manual regression checks are accepted as best effort. They reduce risk but do not guarantee every response follows the rule.
- **One useful unknown clarified:** the learner wanted to know how the key could stay private while Gemini reads pages. The browser sends to a local server route, which reads the server-only environment variable and calls Gemini; explain this when first implemented.
- **Model access check:** learner verified `gemini-3.6-flash` answers on their key after `gemini-3.8-flash` returned 503. `.env.local` controls `GEMINI_MODEL`; honor that selection and do not change it silently.
- **Early runnable check:** the learner asked for Gemini access verification as its own tiny first build slice. Scaffold the project and add `npm run check:gemini`, which sends a harmless text request to the chosen model before building the app UI. The learner enters the secret themselves in root `.env.local` on the `GEMINI_API_KEY=` line; never create, read, display, or commit that file.
- **Open, non-blocking:** exact free-tier quotas remain to be verified in AI Studio. Clipboard image format/size handling should be checked during the first paste flow; unsupported/oversized images need a friendly message.
- **Product name:** still undecided; keep the working title until the learner chooses one.