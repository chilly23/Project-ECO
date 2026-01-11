export async function handler(event) {
    const url = event.queryStringParameters?.url;
    if (!url) {
      return { statusCode: 400, body: "Missing url" };
    }
  
    const res = await fetch(
      `https://publish.twitter.com/oembed?omit_script=true&url=${encodeURIComponent(url)}`
    );
  
    const data = await res.text();
  
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: data
    };
  }

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
  
  