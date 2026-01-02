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
  