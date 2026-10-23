---
doc: scope
status: approved
---
<!-- `status` is the progress state every skill reads. Write `draft` when you first save this file,
     and change it to `approved` when the learner clearly approves the displayed plan ("looks good" counts).
     Do not request a second sign-off. Never skip the draft save —
     an unsaved draft dies with the conversation. -->

<!-- Scope is a rough sketch of the heart of the idea — NOT the detailed product
     definition. Resist the urge to fill this out exhaustively: features, screens,
     and behavior belong in the PRD, which comes next. Capture what makes this
     project distinctive and what belongs in a coherent proof of concept.
     Add a section if the conversation surfaced something important that
     doesn't fit below. Keep it short and readable. -->

# A Technical Reading Companion

A supportive companion that helps independent readers work through a difficult technical passage and return to what puzzled them.

## The Unique Kernel
It remembers the reader's own words about where they got stuck, then brings that point back later as a fresh question instead of supplying the answer.

## Who It's For
Someone reading a challenging technical book on their own, such as a math, quantum mechanics, or quantitative finance text. They want help getting unstuck without being made to feel inadequate; what they currently do when stuck is not established.

## The Core Loop
The reader gives the app a PDF or a photo of a book section. The app asks a question about the passage; if the reader is stuck, they can ask for a small nudge, not the answer. They write where they got stuck in their own words, and the app saves it. Later, the reader revisits that point as a new question.

## Inspiration & Identity
The experience should ease the loneliness and self-doubt of studying difficult material alone, without adding pressure. No specific visual references or aesthetic direction have been established.

## Why This Matters to the Learner
The learner has experienced this difficulty while reading Spivak. Their primary goal is to win a prize; they also want to understand how the code and app components fit together well enough to explain themself.

## What "Working" Looks Like
In a short demo, the learner gives the app a book page, receives a question rather than an explanation, asks for and receives a nudge, records where they got stuck, and later sees that same sticking point return as a new question. The compelling moment is recognizing their own saved sticking point in the revisit question.

## The POC Boundary
Demonstrate one passage from input through question, optional nudge, a learner-written sticking point, and a later revisit question based on that point. The app must not give the answer. Keep the experience supportive and free of default scores, levels, or streaks.

## Later
- Optional progress mode with pace tracking and small rewards.
- Connections between passages from different books.
- Supporting-book suggestions, only when the reader asks for them.

## Explicitly Cut
- Direct answers to the passage: they undermine the central promise of helping without taking over the reader's thinking.
- Scores, levels, and streaks by default: the learner wants the experience to avoid adding pressure.
- Progress rewards and cross-book connections in the first version: both are explicitly deferred so the proof of concept can focus on the stuck-point revisit loop.