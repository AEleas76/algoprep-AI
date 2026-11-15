require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");

const MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function timed(label, fn, ms = 30000) {
  const controller = new AbortController();
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new Error("TIMED OUT"));
    }, ms);
  });
  const start = Date.now();
  try {
    const out = await Promise.race([fn(controller.signal), timeout]);
    console.log(`OK   ${label} (${Date.now() - start}ms): ${out}`);
  } catch (err) {
    console.log(`FAIL ${label} (${Date.now() - start}ms): status=${err?.status ?? "none"} ${err?.message}`);
  } finally {
    clearTimeout(timer);
  }
}

(async () => {
  console.log(`Model under test: ${MODEL}\n`);

  await timed("1. list flash models", async () => {
    const names = [];
    const pager = await ai.models.list();
    for await (const m of pager) {
      if (m.name?.includes("flash")) names.push(m.name.replace("models/", ""));
    }
    return names.join(", ");
  });

  await timed("2. plain text", async (signal) => {
    const r = await ai.models.generateContent({
      model: MODEL,
      contents: "Reply with the single word: pong",
      config: { abortSignal: signal },
    });
    return r.text;
  });

  await timed("3. JSON mode + schema", async (signal) => {
    const r = await ai.models.generateContent({
      model: MODEL,
      contents: "List 3 sorting algorithms.",
      config: {
        abortSignal: signal,
        responseMimeType: "application/json",
        responseJsonSchema: {
          type: "object",
          properties: { items: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 3 } },
          required: ["items"],
        },
      },
    });
    return r.text;
  });

  process.exit(0);
})();