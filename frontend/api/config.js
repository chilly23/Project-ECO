export default function handler(req, res) {
  res.json({
    GOOGLE_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
    GOOGLE_CX: process.env.NEXT_PUBLIC_GOOGLE_CX,
    GOOGLE_API_KEY_2: process.env.NEXT_PUBLIC_GOOGLE_API_KEY_2,
    GOOGLE_CX_2: process.env.NEXT_PUBLIC_GOOGLE_CX_2,
    OPENROUTER_KEY: process.env.NEXT_PUBLIC_OPENROUTER_KEY,
    APOLLO_KEY: process.env.NEXT_PUBLIC_APOLLO_KEY
  });
}
