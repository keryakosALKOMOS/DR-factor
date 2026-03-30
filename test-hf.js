require('dotenv').config({ path: '.env.local' });

async function testHF() {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  console.log("Testing HF with key:", apiKey.substring(0, 5) + "...");
  
  const response = await fetch(
    "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: "A red cat" }),
    }
  );

  console.log("Status:", response.status, response.statusText);
  if (!response.ok) {
    const errorText = await response.text();
    console.log("Error Body:", errorText);
  } else {
    console.log("Success! Received bytes:", (await response.arrayBuffer()).byteLength);
  }
}

testHF();
