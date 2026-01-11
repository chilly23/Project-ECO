export default async function handler(req, res) {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }
  
    try {
      const r = await fetch(
        "https://api.apollo.io/v1/mixed_people/search",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Api-Key": process.env.APOLLO_KEY
          },
          body: JSON.stringify(req.body)
        }
      );
  
      const data = await r.json();
      res.status(200).json(data);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
