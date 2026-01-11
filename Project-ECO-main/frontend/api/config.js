export default function handler(req, res) {
  res.json({
    GOOGLE_API_KEY: process.env.NEXT_PUBLIC_API_KEY,
    GOOGLE_CX: process.env.NEXT_PUBLIC_CX,
    GOOGLE_API_KEY_2: process.env.NEXT_PUBLIC_API_KEY2,
    GOOGLE_CX_2: process.env.NEXT_PUBLIC_CX2, // if same CX
    OPENROUTER_KEY: process.env.NEXT_PUBLIC_OPENROUTER_KEY,
    APOLLO_KEY: process.env.NEXT_PUBLIC_APOLLO_KEY
  });
}
