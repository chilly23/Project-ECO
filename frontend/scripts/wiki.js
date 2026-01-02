export async function getWikiProfile(name) {
  try {
    const r = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`
    );
    const d = await r.json();

    return {
      name,
      image:
        d.thumbnail?.source ||
        "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png",
      extract: d.extract || ""
    };
  } catch {
    return {
      name,
      image: "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png",
      extract: ""
    };
  }
}
