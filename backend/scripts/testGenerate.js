// Usage: node scripts/testGenerate.js <preset> ["your topic"]
// Presets: ok | quiz | flashcards | empty-topic | bad-mode | bad-json | no-body
// Test a deployed server:  $env:API_URL="https://your-api.onrender.com"; node scripts/testGenerate.js ok
const API_URL = process.env.API_URL || "http://localhost:5000";
const preset = process.argv[2] || "ok";
const topic = process.argv.slice(3).join(" ") || "Binary search trees: insertion, deletion and search";

const bodies = {
  ok: JSON.stringify({ topic, mode: "both" }),
  quiz: JSON.stringify({ topic, mode: "quiz", difficulty: "hard" }),
  flashcards: JSON.stringify({ topic, mode: "flashcards", difficulty: "easy" }),
  "empty-topic": JSON.stringify({ topic: "  ", mode: "both" }),
  "bad-mode": JSON.stringify({ topic, mode: "essay" }),
  "bad-json": "{ this is not json",
  "no-body": undefined,
};

if (!(preset in bodies)) {
  console.error(`Unknown preset "${preset}". Options: ${Object.keys(bodies).join(", ")}`);
  process.exit(1);
}

(async () => {
  const started = Date.now();
  const res = await fetch(`${API_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: bodies[preset],
  });
  const json = await res.json();
  console.log(`HTTP ${res.status} in ${Date.now() - started}ms`);
  console.log(JSON.stringify(json, null, 2));
})().catch((e) => console.error("Request failed (is the server running?):", e.message));