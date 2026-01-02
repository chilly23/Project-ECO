import { SERP_API_KEY } from "./config.js";

const BASE = "https://serpapi.com/search.json?source=web_with_cors";

export async function fetchNews(name) {
  const url = `${BASE}&engine=google_news&q=recent news on ${encodeURIComponent(name)}&api_key=${SERP_API_KEY}`;
  const r = await fetch(url);
  const d = await r.json();
  return (d.news_results || []).slice(0, 10);
}

export async function fetchSocialLinks(name) {
  const url = `${BASE}&engine=google&q=recent X and LinkedIn posts of ${encodeURIComponent(name)}&api_key=${SERP_API_KEY}`;
  const r = await fetch(url);
  const d = await r.json();

  const links = (d.organic_results || []).map(o => o.link);

  return {
    x: links.filter(l => l.includes("twitter.com") || l.includes("x.com")).slice(0, 3),
    linkedin: links.filter(l => l.includes("linkedin.com")).slice(0, 3)
  };
}
