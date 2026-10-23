import { NextResponse } from "next/server";
import { readPhoto, respondToStudy } from "../../../lib/gemini.js";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxPhotoBytes = 10 * 1024 * 1024;
const textActions = new Set(["question", "chat", "nudge"]);

export async function POST(request) {
  if (request.headers.get("content-type")?.includes("multipart/form-data")) {
    return readSection(request);
  }

  return studyText(request);
}

async function readSection(request) {
  let formData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Choose a photo to continue." }, { status: 400 });
  }

  const action = formData.get("action");
  const photo = formData.get("image");

  if (action !== "read-section") {
    return NextResponse.json({ error: "That page request isn't available." }, { status: 400 });
  }

  if (!photo || typeof photo.arrayBuffer !== "function") {
    return NextResponse.json({ error: "Choose a photo to continue." }, { status: 400 });
  }

  if (!allowedTypes.has(photo.type)) {
    return NextResponse.json(
      { error: "Please choose a JPEG, PNG, or WebP photo." },
      { status: 415 },
    );
  }

  if (photo.size > maxPhotoBytes) {
    return NextResponse.json(
      { error: "That photo is a little large. Choose one under 10 MB." },
      { status: 413 },
    );
  }

  try {
    const data = Buffer.from(await photo.arrayBuffer()).toString("base64");
    const text = await readPhoto({ data, mimeType: photo.type });

    if (!text) {
      return NextResponse.json(
        { error: "I couldn't read that page just now. Try again, or choose a clearer photo." },
        { status: 502 },
      );
    }

    return NextResponse.json({ text });
  } catch (error) {
    const status = Number(error?.status);

    if (status === 401 || status === 403) {
      return NextResponse.json(
        { error: "Gemini couldn't use this key. Check the local key and model setting, then try again." },
        { status: 502 },
      );
    }

    return NextResponse.json(
      { error: "I couldn't read that page just now. Try again, or choose a clearer photo." },
      { status: 503 },
    );
  }
}

async function studyText(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "I couldn't read that message. Please try again." }, { status: 400 });
  }

  const { action, sections, messages, nudgeCount } = body;

  if (!textActions.has(action)) {
    return NextResponse.json({ error: "That study action isn't available." }, { status: 400 });
  }

  if (!Array.isArray(sections) || !Array.isArray(messages)) {
    return NextResponse.json({ error: "Choose a book before starting the conversation." }, { status: 400 });
  }

  try {
    const text = await respondToStudy({ action, sections, messages, nudgeCount });

    if (!text) {
      return NextResponse.json(
        { error: "I couldn't make a useful reply just now. Try again or keep exploring the saved text." },
        { status: 502 },
      );
    }

    return NextResponse.json({ text });
  } catch (error) {
    const status = Number(error?.status);

    if (status === 401 || status === 403) {
      return NextResponse.json(
        { error: "Gemini couldn't use this key. Check the local key and model setting, then try again." },
        { status: 502 },
      );
    }

    return NextResponse.json(
      { error: "I couldn't make a useful reply just now. Please try again." },
      { status: 503 },
    );
  }
}