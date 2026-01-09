export default function handler(req, res) {
  res.json({
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
    GOOGLE_CX: process.env.GOOGLE_CX,
    GOOGLE_API_KEY_2: process.env.GOOGLE_API_KEY_2,
    GOOGLE_CX_2: process.env.GOOGLE_CX_2,
    OPENROUTER_KEY: process.env.OPENROUTER_KEY,
    APOLLO_KEY: process.env.APOLLO_KEY
  });
}
