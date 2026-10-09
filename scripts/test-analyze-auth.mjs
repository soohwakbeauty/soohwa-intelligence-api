/**
 * Local validation: without secret → 401, with secret → not 401
 * Usage: node scripts/test-analyze-auth.mjs
 * Requires: `vercel dev` on :3000
 */
import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnvFile(name) {
  try {
    const raw = readFileSync(resolve(name), "utf8");
    for (const line of raw.split("\n")) {
      if (!line || line.trim().startsWith("#") || !line.includes("=")) continue;
      const i = line.indexOf("=");
      const k = line.slice(0, i).trim();
      const v = line.slice(i + 1).trim();
      if (!(k in process.env)) process.env[k] = v;
    }
  } catch {
    /* optional */
  }
}

loadEnvFile(".env");
loadEnvFile(".env.local");
const base = process.env.ANALYZE_TEST_URL || "http://127.0.0.1:3000/api/analyze";
const secret = process.env.ANALYZE_SECRET || "";

const minimal = {
  payload: {
    version: "3.0",
    locale: "fr-FR",
    questionnaire: {
      skin: "normale",
      sensitivity: "low",
      hydration: "sometimes",
      concern: "eclat",
      intensity: "rare",
      age: "30-39"
    },
    photo: { provided: false, base64: null }
  }
};

async function hit(label, headers) {
  const res = await fetch(base, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(minimal)
  });
  const text = await res.text();
  console.log(`\n[${label}] status=${res.status}`);
  console.log(text.slice(0, 240));
  return res.status;
}

const s1 = await hit("sans secret", {});
const s2 = await hit("avec secret", { "X-Soohwa-Analyze-Key": secret });

if (s1 !== 401) {
  console.error("\nFAIL: sans secret devrait être 401");
  process.exit(1);
}
if (s2 === 401) {
  console.error(
    "\nFAIL: avec secret ne devrait pas être 401 (vérifie ANALYZE_SECRET / vercel dev)"
  );
  process.exit(1);
}
console.log("\nOK auth locale (401 sans clé, accepté avec clé).");
if (s2 === 500) {
  console.log(
    "(500 possible en local si OPENAI_API_KEY manquant — auth OK quand même)"
  );
}
