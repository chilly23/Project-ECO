import { CX, API_KEY } from "./config.js";

/**
 * Generic Google search
 */
async function fetchLinks(query) {
  const url =
    `https://www.googleapis.com/customsearch/v1` +
    `?q=${encodeURIComponent(query)}` +
    `&key=${API_KEY}` +
    `&cx=${CX}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data.items) return [];

    return data.items.map(item => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet || "",
      image:
        item.pagemap?.cse_image?.[0]?.src ||
        item.pagemap?.cse_thumbnail?.[0]?.src ||
        null
    }));
  } catch (err) {
    console.error("Google Search API error:", err);
    return [];
  }
}
