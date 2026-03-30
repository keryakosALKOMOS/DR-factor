async function test() {
  const prompt = "A test prompt";
  const response = await fetch(`https://pollinations.ai/p/${encodeURIComponent(prompt)}?width=600&height=600&nologo=true`, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Accept": "image/jpeg"
    }
  });

  console.log("Status:", response.status, response.statusText);
  if (!response.ok) {
    console.log("Error:", await response.text());
  } else {
    console.log("Content-Type:", response.headers.get("content-type"));
    console.log("Success!");
  }
}

test();

