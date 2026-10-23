import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const selectedModel = process.env.GEMINI_MODEL || "gemini-3.8-flash";
const imageInputFlashModels = [
  { id: "gemini-3.8-flash", note: "current stable Flash" },
  { id: "gemini-3.6-flash", note: "stable previous-generation Flash" },
  { id: "gemini-3.5-flash-lite", note: "current stable Flash-Lite" },
  { id: "gemini-3.1-flash-lite", note: "stable Flash-Lite" },
  { id: "gemini-3-flash-preview", note: "preview" },
  { id: "gemini-3.7-flash", note: "deprecated; automatically routes to 3.8 Flash" },
  { id: "gemini-3.5-flash", note: "deprecated; automatically routes to 3.6 Flash" },
  { id: "gemini-2.5-flash", note: "stable; Google limits new access" },
  { id: "gemini-2.5-flash-lite", note: "stable; Google limits new access" },
];
const fallbackOrder = [
  "gemini-3.6-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-3-flash-preview",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
];

if (!apiKey) {
  console.error("GEMINI_API_KEY is missing. Add it to .env.local in the project root.");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

function modelId(model) {
  return model.baseModelId ?? model.name?.replace(/^models\//, "") ?? "unknown";
}

function errorDetails(error) {
  let status = error?.status;
  let message = error instanceof Error ? error.message : "Unknown API error";

  try {
    const body = JSON.parse(message);
    status ??= body.error?.code;
    message = body.error?.message ?? message;
  } catch {
    // Keep the SDK's plain-text error message.
  }

  return {
    status: status ?? "not provided",
    message: message.replaceAll(apiKey, "[redacted]"),
  };
}

let accessibleModels = [];
let modelListSucceeded = false;

try {
  for await (const model of await ai.models.list({ config: { pageSize: 1000 } })) {
    accessibleModels.push(model);
  }
  modelListSucceeded = true;

  accessibleModels.sort((left, right) => modelId(left).localeCompare(modelId(right)));
  console.log(`Models returned by Google for this key (${accessibleModels.length}):`);

  for (const model of accessibleModels) {
    const methods = model.supportedActions?.join(", ") ?? "methods not listed";
    console.log(`- ${modelId(model)} (${methods})`);
  }

  const accessibleIds = new Set(accessibleModels.map(modelId));
  console.log("\nGeneral-purpose Flash models documented for image input:");

  for (const model of imageInputFlashModels) {
    const access = accessibleIds.has(model.id) ? "listed for this key" : "not listed for this key";
    console.log(`- ${model.id}: ${access}; ${model.note}`);
  }

  console.log("Image-generation variants (different from page-reading models): gemini-3.1-flash-image, gemini-3.1-flash-lite-image, gemini-2.5-flash-image.");
} catch (error) {
  const details = errorDetails(error);
  console.error(`Model-list HTTP status: ${details.status}`);
  console.error(`Model-list error: ${details.message}`);
}

const accessibleIds = new Set(accessibleModels.map(modelId));
const modelsToTry = [
  selectedModel,
  ...fallbackOrder.filter((id) => id !== selectedModel && (!modelListSucceeded || accessibleIds.has(id))),
];

console.log(`\nChecking text generation. Preferred model: ${selectedModel}`);
let answeredModel = null;

for (const model of modelsToTry) {
  console.log(`Trying ${model}...`);

  try {
    const response = await ai.models.generateContent({
      model,
      contents: "Reply with exactly: Gemini access check passed.",
      config: { maxOutputTokens: 256 },
    });
    const candidate = response.candidates?.[0];
    const status = response.sdkHttpResponse?.responseInternal?.status ?? "not provided";

    console.log(`HTTP status: ${status}`);
    console.log(`Finish reason: ${candidate?.finishReason ?? "not provided"}`);

    if (candidate?.finishMessage) {
      console.log(`Finish message: ${candidate.finishMessage}`);
    }

    if (response.promptFeedback?.blockReason) {
      console.log(`Prompt block reason: ${response.promptFeedback.blockReason}`);
    }

    if (response.text) {
      answeredModel = model;
      console.log(`Model that answered: ${model}`);
      console.log(`Gemini reply: ${response.text.trim()}`);
      process.exitCode = 0;
      break;
    }

    console.error(`${model} returned no text; trying the next available model.`);
  } catch (error) {
    const details = errorDetails(error);
    console.error(`HTTP status: ${details.status}`);
    console.error(`Gemini error: ${details.message}`);

    if ([401, 403].includes(Number(details.status))) {
      console.error("The key was rejected; stopping without retrying other models.");
      process.exitCode = 1;
      break;
    }
  }
}

if (!answeredModel) {
  console.error("No available image-capable Flash model returned text.");
  process.exitCode = 1;
}