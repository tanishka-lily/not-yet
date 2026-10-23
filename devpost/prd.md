---
doc: prd
status: approved
---
<!-- `status` is the progress state every skill reads. Write `draft` when you first save this file,
     and change it to `approved` when the learner clearly approves the displayed plan ("looks good" counts).
     Do not request a second sign-off. Never skip the draft save —
     an unsaved draft dies with the conversation. -->

# Technical Reading Companion (Working Title) — Product Requirements

A calm web companion for people studying difficult technical books on their own. The product name has not been chosen.
Source: `scope.md > Who It's For`, `scope.md > The Unique Kernel`.

## The Core Journey
 1. The reader opens the app. A book-focused chat sits beside the shelf. The chat accepts typed messages and screenshots pasted with Ctrl+V. If there are no books yet, the shelf says, "Your shelf is empty. Add a page when you're ready."
 2. Before pasting a screenshot, the reader chooses an existing book or creates one by entering its title. They can add an optional free-text page or section label. The app reads the pasted image once and shows its transcription in the chat for checking.
 3. The reader edits the transcription if needed and saves it as a text section under that book. The original screenshot is discarded. The book appears on the shelf with its title on the spine.
 4. The app asks a question about the selected book's saved sections. The reader can chat, think aloud, or ask for a nudge. Follow-up chat uses the book's saved text sections as context; the reader does not need to paste the same page again.
 5. The reader can skip a question. The app replaces it with a different question about the same passage; the skip is not saved as a sticking point and has no negative consequence.
 6. Later, the reader opens the book on the shelf and chooses an active sticking point. The app shows the reader's note and its source passage, then asks a fresh question about that point, not the original question and not the answer. The reader can chat, request a nudge, skip, or mark the point "got it."
 7. A point marked "got it" moves to a quiet understood section for that book and remains available. The reader can reopen it or return it to the active list. When finished with a book, the reader can mark it complete and see a small celebration.

## Screens and Layout
 - **Book chat and shelf:** The chat composer accepts text and pasted screenshots. A book selector lets the reader choose an existing book or create one with a title before adding a page. Each book appears as a spine; opening it shows its saved text sections and, later, its sticking points.
 - **Reading check in chat:** A pasted screenshot is read once; the transcription appears in the chat for checking and editing before it is saved as a text section. The original screenshot is temporary and is not saved.
 - **Study conversation:** Questions and chat use the selected book's saved text sections as context. The image is not resent for follow-up messages.
- **Book and revisit view:** Opening a book shows its active sticking points and a quiet understood section. Selecting a point shows the note and source passage, then starts a fresh question.

## Look and Feel
The experience should feel calm, warm, and encouraging, easing the loneliness of difficult solo study without adding pressure. Prioritize working behavior; visual artwork and polish can come later. Support light and dark modes: follow the device setting by default, allow a manual toggle, and remember the reader's choice in the browser. Specific colors, fonts, and artwork are not established.

## Features and Behavior

### Adding and checking a passage
 - The chat composer accepts a screenshot pasted with Ctrl+V; there is no separate photo-upload form in this version. The reader chooses an existing book or creates one by entering a title. A free-text page/section label is optional.
 - Read each pasted image once. Show the transcription in the chat for review; the reader can edit it before saving it as a text section under the selected book. Plain-text equations are acceptable. Discard the original image after the reading check is complete.
 - When the transcription contains uncertain text, especially an equation, mark it with `[unclear]` and ask the reader to check it against the pasted screenshot.
 - PDF support stays optional and deferred; if added later, the reader selects pages before they are rendered and added as sections.

### Study conversation and questions
 - After a section is saved, ask a question grounded in the selected book's saved sections rather than beginning with an explanation.
 - Provide a chat box for answering, thinking aloud, or talking about the material. Include saved text sections from the selected book as context on each request, so the reader does not need to paste a page again. Replies are warm and encouraging; the app does not label the reader right or wrong.
 - Ordinary chat history remains temporary to the current visit and is not saved in the browser.
- Never provide the answer, even if asked. If conversation drifts from the passage, gently guide it back.
- A nudge action provides a small hint without giving away the answer.
- Skipping dismisses only the current question and offers a different question about the same passage. It is not recorded as a sticking point and is never framed negatively. The reader leaves the passage by returning to the shelf or choosing different pages.
- If the app cannot make a useful question, it says so kindly and honestly. The reader can ask it to try again, choose different pages or a smaller passage, or chat about the passage and save a self-described sticking point. This is not treated as failure and does not automatically create a sticking point.

### Sticking points and revisits
- When the reader chooses "I'm stuck," save what they wrote in their own words with the book, page, and source passage. Keep the record with that book on the shelf.
- A revisit shows the note and source passage, then asks a fresh question about the sticking point. It must not repeat the original question or give the answer.
- During a revisit, the reader can chat, request a nudge, skip the question, or mark the point "got it." If skipped, offer another question about the same point without recording a failure.
- Marking "got it" moves the point from the active list to the book's quiet understood section, without deleting it. The reader can reopen it or move it back to the active list. Show a small, warm acknowledgment, never points or a score.
- If elapsed time since saving is shown, state it neutrally; never call a point overdue or use pressure language.

### Books, completion, and preferences
- The reader can mark a book completed and receives a small celebration. Completion does not remove the book or its saved points from the shelf.
- Persist the shelf and its book and sticking-point records in the same device/browser. There are no accounts or cross-device syncing in this version.
- Follow the device's light/dark setting by default. A manual toggle overrides it, and the browser remembers the choice.

## States and Boundaries
- **First use / empty shelf:** Show the book chat composer and "Your shelf is empty. Add a page when you're ready."
- **Reading check:** Show the pasted screenshot and extracted text together in the chat; surface uncertain text for review and allow edits before saving the section.
- **Question unavailable:** Kindly explain that a useful question could not be made; offer retry, narrower/different pages, or open chat. Do not create a sticking point unless the reader chooses to save one.
- **Skipped question:** Replace the question on the same passage (or same saved point during revisit); do not alter sticking-point records or imply a penalty.
- **Saved and understood points:** Keep both with the relevant book. Understood points remain reopenable and can return to the active list.
- **Persistence:** Shelf data and the manual theme choice remain available in the same browser/device. They do not follow the reader to another device.
- **Book completion:** Show a small celebration and keep the book and its points available.

## Product Decisions
- Focus the first version on a single reader working with one selected passage and returning to their own saved sticking point; this is the proof of the distinctive idea. Source: `scope.md > The Unique Kernel`, `scope.md > The POC Boundary`.
- Screenshots are pasted directly into the selected book's chat, read once, and saved as checked text sections; follow-up chat uses those saved sections without resending images. PDF page selection remains optional after the core chat workflow works.
- Let readers check and correct the app-read text, especially equations, before continuing; allow them to proceed when it is close enough.
- The chat is a supportive study partner, not a grader or answer source. The reader controls when to ask for a nudge, save a stuck point, skip, or leave.
- Keep the shelf local to the current device/browser to avoid accounts and syncing in the proof of concept. Export is a nice extra but not required.
- Keep light/dark mode functional and user-controllable, while deferring artwork and visual polish.
- The project name has not been selected; the title above is descriptive only.

## What We're Building
 - Paste a screenshot into a selected book's chat, choose an existing book or create one with a title, and add an optional page/section label.
 - Read each pasted image once, let the reader inspect/edit the transcription, and save it as text under the selected book; do not save or resend the original image.
 - Ask book-context questions in a warm chat that does not grade or give answers; provide nudges, skip, and recover when no useful question is available.
- Save the reader's own sticking point with its book, page, and passage; revisit it later as a fresh question.
- Manage active and understood points, including reopening and restoring a point.
- Mark a book completed with a small celebration.
- Preserve the shelf and chosen theme in the same browser/device, with system-following light/dark mode and a manual toggle.

## Deferred From the POC
 - PDF upload and page selection; keep it as an optional later step after the book chat and revisit loop work.
- Accounts and cross-device syncing: the local shelf is enough to demonstrate the core loop.
- Exporting the shelf: a nice extra, but not needed to prove the idea.
- Progress mode, pace tracking, rewards, and an optional quiz: these add a separate motivation system and are intentionally postponed.
- Cross-book connections: useful later, but not needed to prove revisiting a saved sticking point.
- Supporting-book suggestions: only considered later and only when the reader asks.

## Possible Later Enhancements
- Offer an optional quiz chosen by the reader, with a small celebration when they get an answer right.
- Add optional progress tracking and rewards, plus connections between passages from different books.
- Allow shelf export, accounts, and syncing if readers later need portability; any supporting-book suggestions remain opt-in.

## Non-Goals
 - A separate photo-upload form; screenshots are added through the book chat composer.
- Giving direct answers, including when requested: the product helps readers think rather than taking over.
- Grading answers or using scores, levels, streaks, overdue labels, or other default pressure mechanisms.
- Recommending general study plans; supporting-book recommendations are not part of the POC and should only be offered if requested.
- Requiring an account, online shelf, export, progress rewards, quiz, or cross-book graph to complete the POC.
- Polishing custom artwork before the core behavior works.

## Open Questions
- Product name: not chosen; can be decided later and does not block `4-spec`.