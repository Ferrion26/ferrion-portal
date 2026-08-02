#!/usr/bin/env node
// Generates an image via the Gemini API (Imagen) and saves it to disk.
//
// Usage:
//   node scripts/generate-image.js "<prompt>" <output-path> [aspectRatio] [model]
//
// aspectRatio: one of "1:1" "3:4" "4:3" "9:16" "16:9" (default "16:9")
// model: imagen-4.0-generate-001 (default) | imagen-4.0-ultra-generate-001 | imagen-4.0-fast-generate-001
//
// Requires GEMINI_API_KEY in .env.local (loaded automatically).

const fs = require("fs");
const path = require("path");

function loadEnvLocal() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)\s*=\s*"?(.*?)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}
loadEnvLocal();

const [, , prompt, outputPath, aspectRatio = "16:9", model = "gemini-3.1-flash-image"] = process.argv;

if (!prompt || !outputPath) {
  console.error('Usage: node scripts/generate-image.js "<prompt>" <output-path> [aspectRatio] [model]');
  process.exit(1);
}

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY not set in .env.local");
  process.exit(1);
}

async function main() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { imageConfig: { aspectRatio } },
    }),
  });

  const json = await res.json();
  if (!res.ok) {
    console.error("API error:", JSON.stringify(json, null, 2));
    process.exit(1);
  }

  const parts = json.candidates?.[0]?.content?.parts || [];
  const imgPart = parts.find((p) => p.inlineData?.data);
  if (!imgPart) {
    console.error("No image returned:", JSON.stringify(json, null, 2));
    process.exit(1);
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, Buffer.from(imgPart.inlineData.data, "base64"));
  console.log("Saved:", outputPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
