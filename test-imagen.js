const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

async function test() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-fast-generate-001:predict?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        instances: [
          { prompt: "A test prompt" }
        ],
        parameters: {
          sampleCount: 1,
          aspectRatio: "1:1"
        }
      }),
    }
  );

  const text = await response.text();
  fs.writeFileSync('out.txt', `Status: ${response.status}\nBody: ${text}`);
  console.log("Done");
  process.exit(0);
}

test();


