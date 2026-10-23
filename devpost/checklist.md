---
doc: checklist
status: approved
---
<!-- `status` is the progress state every skill reads. Write `draft` when you first save this file,
     and change it to `approved` when the learner clearly approves this plan ("looks good" counts).
     Do not request a second sign-off. Never skip the draft save —
     an unsaved draft dies with the conversation. -->

# Build Checklist

Build mode: learn. Keep explanations short and focused on the main idea of each step. Switch to fast mode for the rest if the learner says "fast".

Before every commit, show the learner the exact staged file list and staged diff. Stage only the current slice's intended project files. Never stage or commit `.env`, `.env.*` local credentials, or `devpost/learner-profile.md`; `.env.example` is allowed.

## Slices

- [x] **1. Verify Gemini access**
  Becomes usable: The project is scaffolded and a small command-line check confirms that the learner's key can get a response from the preferred image-capable Flash model configured in `.env.local`. This is runnable evidence for the main external-service risk; the app UI comes in the next slice.
  Why now: Model access on the learner's own key is not yet confirmed. Checking it before building the photo flow makes a blocked or unavailable model visible while the project is still small.
  PRD ref: `prd.md > Features and Behavior > Adding and checking a passage`, `prd.md > Features and Behavior > Study conversation and questions`.
  Spec ref: `spec.md > Stack`, `spec.md > Where It Runs and How Someone Tries It`, `spec.md > External Services and Dependencies > Google Gemini Developer API`.
  Build: Scaffold the Next.js App Router project in the current workspace root using JavaScript and ESLint, preserving course files. Add `@google/genai`, a `scripts/check-gemini.js` script and `npm run check:gemini`, `.env.example`, and initial README setup/privacy instructions. Do not create or read the learner's real `.env.local`; the learner enters their key locally. The check sends a harmless text prompt and prints only the model response, never the key.
  Verify (mechanical): Run `npm run lint`, `npm run build`, and (after the learner adds `GEMINI_API_KEY` in the root `.env.local`) `npm run check:gemini`. Confirm the chosen model responds and no command prints the key.
  Learner check: In the project root, copy `.env.example` to `.env.local`, enter the key on the `GEMINI_API_KEY=` line, then run `npm run check:gemini`. Confirm a short response appears; do not paste or send the key in chat.
  Commit: `Add project scaffold and Gemini access check`; before committing, show the staged paths and diff and confirm no `.env` file, learner profile, or unrelated curriculum files are staged.

- [ ] **2. Paste a page into book chat and study its saved text**
  Becomes usable: The reader selects or creates a book, pastes a screenshot directly into its chat, checks and edits the reading, saves it once as a text section, then chats and gets a nudge using that book's saved text sections without resending images.
  Why now: It replaces the separate upload form with the learner's preferred workflow while preserving the kernel: studying a real passage in context. PDF remains an optional later phase.
  PRD ref: `prd.md > The Core Journey` (steps 1-4), `prd.md > Features and Behavior > Adding and checking a passage`, `prd.md > Features and Behavior > Study conversation and questions`, `prd.md > Screens and Layout`.
  Spec ref: `spec.md > How This Works, In Plain Language`, `spec.md > The Core Journey Through the System`, `spec.md > Components > StudyChat`, `spec.md > Components > Shelf`, `spec.md > Components > POST /api/study`, `spec.md > Components > lib/storage.js`, `spec.md > Components > lib/gemini.js and lib/prompts.js`, `spec.md > Data Model`.
  Build: Replace the separate photo-intake form with a book selector/title field and chat composer that accepts typed messages and Ctrl+V image screenshots. Read each pasted image once, show an inline editable transcription, save the checked text as a section under the selected book, and release the image. Add initial questions, regular chat, and progressive Nudge actions that send the selected book's saved text sections as context. Do not save ordinary chat or send original images after transcription.
  Verify (mechanical): Run `npm run lint` and `npm run build`; use a generated sample page to verify Ctrl+V image paste, transcription/edit/save, and text-only persistence after reload. Confirm a subsequent chat request includes saved section text and no image bytes; verify repeated Nudge requests use the same book context. Never print the key.
  Learner check: Select or create a book, paste a screenshot directly into the chat, edit and save its reading, then ask a follow-up without pasting the screenshot again. Try Nudge and confirm the response refers to the book's saved text. Share what feels missing or confusing before stuck-point revisits are added.
  Commit: `Add book study chat with pasted pages`; before committing, show the staged paths and diff and confirm no secrets, learner profile, or unrelated curriculum files are staged.

- [ ] **3. Study, save a sticking point, and revisit it**
  Becomes usable: The reader gets a passage question, chats or thinks aloud, receives progressively more specific nudges that stop short of the answer, saves an explicit sticking point, and later opens that point from the shelf to get a fresh question.
  Why now: This is the unique kernel and the central demo. Building it immediately after the book-chat path ensures the project proves its distinctive idea rather than stopping at saved text and chat.
  PRD ref: `prd.md > Features and Behavior > Study conversation and questions`, `prd.md > Features and Behavior > Sticking points and revisits`, `prd.md > States and Boundaries`.
  Spec ref: `spec.md > Components > StudyChat`, `spec.md > Components > RevisitPanel`, `spec.md > Components > POST /api/study`, `spec.md > Components > lib/gemini.js and lib/prompts.js`, `spec.md > Tutoring Prompt Rules`, `spec.md > Direct-Answer Manual Checks`, `spec.md > Data Model`.
  Build: Add question, chat, nudge, skip, explicit stuck-point saving, shelf point list, and revisit interactions. Keep ordinary chat only in memory; persist only the reader's explicit note and its book, section, page label, and checked passage. Use a new stateless Gemini request with the saved point for a fresh revisit question. Apply the tutoring rules and, after three nudges, offer to talk or save without displaying a count.
  Verify (mechanical): Run `npm run lint` and `npm run build`; complete the direct-answer manual checks in `spec.md > Direct-Answer Manual Checks`, including repeated Nudge presses, and verify a saved note survives refresh while ordinary chat does not.
  Learner check: Open a saved section, try the question, chat, press Nudge more than once, save a sticking point, return to the shelf, and reopen it. Check that the revisit shows your words and passage with a fresh question, not an answer.
  Commit: `Add study and sticking-point revisit`; before committing, show the staged paths and diff and confirm no secrets, learner profile, or unrelated curriculum files are staged.

- [ ] **4. Complete the shelf states and theme controls**
  Becomes usable: The reader can move a point into the quiet understood section and back, reopen it, mark a book complete, and control the light/dark theme without scores or pressure.
  Why now: These complete the agreed first version after the central photo-to-revisit loop works; they are deliberately sequenced behind the prize-demo kernel.
  PRD ref: `prd.md > Features and Behavior > Sticking points and revisits`, `prd.md > Features and Behavior > Books, completion, and preferences`, `prd.md > States and Boundaries`.
  Spec ref: `spec.md > Components > Shelf`, `spec.md > Components > RevisitPanel`, `spec.md > Components > ThemeToggle and StorageNotice`, `spec.md > Components > lib/storage.js`, `spec.md > Data Model`, `spec.md > Look and Feel`.
  Build: Add active/understood transitions, reopen/restore actions, book completion and a small warm celebration, system-following light/dark mode with a remembered manual override, and the storage-unavailable message. Keep artwork and visual polish minimal.
  Verify (mechanical): Run `npm run lint` and `npm run build`; manually check active-to-understood-to-active, book completion without point deletion, system theme default, remembered override, and a storage-failure fallback without a crash.
  Learner check: Move one point to understood and back, complete its book, and switch themes. Check that the shelf still feels calm and no progress score or pressure language appears.
  Commit: `Complete shelf states and theme controls`; before committing, show the staged paths and diff and confirm no secrets, learner profile, or unrelated curriculum files are staged.

- [ ] **5. Add PDF page selection if the core is ready**
  Becomes usable: A reader can select pages in a PDF, check the selected page reading, and add it as a section to a new or existing book. Only selected rendered pages are sent to Gemini; the PDF is not saved.
  Why now: The learner wants photo first and explicitly said PDF may be cut if it becomes fiddly. This stays last because PDF rendering adds a library and worker setup but does not define the kernel.
  PRD ref: `prd.md > The Core Journey` (steps 2-3), `prd.md > Features and Behavior > Adding and checking a passage`, `prd.md > Deferred From the POC`.
  Spec ref: `spec.md > Components > StudyChat`, `spec.md > External Services and Dependencies > Optional PDF.js`, `spec.md > File Structure`.
  Build: Only after slices 1-3 work and the learner confirms it is worth continuing, add `pdfjs-dist`, render the PDF in the browser, let the reader select pages, and add selected rendered pages through the existing book-chat section flow. If worker integration or page selection becomes fiddly, record the cut under `## Revisions` and leave the verified chat flow intact.
  Verify (mechanical): Run `npm run lint` and `npm run build`; with a reader-approved sample PDF, select one page, verify only the selected rendered page reaches the existing route, and confirm the PDF is not saved. If cut, verify the book-chat core still builds and runs.
  Learner check: If implemented, add one PDF page to a book and check its reading and shelf entry. If cut, confirm the book-chat workflow remains the complete demo journey.
  Commit: `Add optional PDF page intake`; only commit this slice if PDF support is completed. Before committing, show the staged paths and diff and confirm no secrets, learner profile, or unrelated curriculum files are staged.

## Hands-on Checkpoints

- [ ] Early usable behavior explored — after slice 2, learner tries the book-chat-to-shelf flow and gives feedback that can shape the tutor behavior.
- [ ] Final kick-the-tires exploration and feedback completed — after the last completed slice (slice 4 if PDF is cut, slice 5 if implemented).

## Final Review

- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete — guided route, focused alternative, prior practice connected, or brief recap
- [ ] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: [what actually happened; real document/test/code references; unfinished work if interrupted]
Route and stops: [actual paths and symbols; guided stops completed, or reference-only route]
Edit outcome: [tried/kept/reverted/declined/not applicable; verification if changed]
Reflection: [offered/answered/declined/already covered — personal answer belongs only in the ignored profile]
Activity mode: [live app and editor, explicit static fallback, focused alternative, prior practice, or recap]

## Revisions
- Replaced the separate photo intake form with screenshot paste in the selected book's chat; each page is transcribed once and saved as text context for later chat turns, avoiding image resends. PDF remains deferred.