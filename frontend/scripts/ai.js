import { OPENROUTER_KEY } from "./config.js";

async function callModel(model, prompt) {
  const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }]
    })
  });
  const d = await r.json();
  return d.choices[0].message.content;
}

export async function getAISummary(name) {
  try {
    return await callModel(
      "google/gemma-3n-e2b-it:free",
      `Tell me briefly about ${name}`
    );
  } catch {
    return await callModel(
      "openai/gpt-oss-120b:free",
      `Tell me briefly about ${name}`
    );
  }
}

export async function draftIntro(name, aboutMe) {
  return callModel(
    "google/gemma-3n-e2b-it:free",
    `Here's about me: ${aboutMe}. Now write a draft intro mail for ${name}.`
  );
}
