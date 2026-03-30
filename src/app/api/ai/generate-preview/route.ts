import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, hexColors } = body;

    let finalPrompt = prompt || "a custom clothing item";

    // Auto-translate Arabic to English for Stable Diffusion using a free API
    const arabicRegex = /[\u0600-\u06FF]/;
    if (arabicRegex.test(finalPrompt)) {
      try {
        const translateRes = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(finalPrompt)}&langpair=ar|en`);
        const translateData = await translateRes.json();
        if (translateData && translateData.responseData && translateData.responseData.translatedText) {
          finalPrompt = translateData.responseData.translatedText;
          console.log("Translated prompt to English:", finalPrompt);
        }
      } catch (e) {
        console.error("Translation error:", e);
      }
    }

    const apiKey = process.env.HUGGINGFACE_API_KEY;

    if (!apiKey) {
      console.warn("HUGGINGFACE_API_KEY is not set. Falling back to mock image.");
      const mockImageUrl = `https://picsum.photos/seed/${encodeURIComponent(finalPrompt)}/600/600`;
      return NextResponse.json({
        success: true,
        data: {
          previewUrl: mockImageUrl,
          message: "Mock preview generated (Hugging Face API Key missing)",
        },
      });
    }

    // Map hex colors to common color names for Stable Diffusion to understand
    const hexToName = (h: string) => {
      const hex = h.toLowerCase();
      if(hex === '#000000') return 'pure black';
      if(hex === '#ffffff') return 'pure white';
      if(hex.startsWith('#ff0000')) return 'red';
      if(hex.startsWith('#00ff00')) return 'green';
      if(hex.startsWith('#0000ff')) return 'blue';
      if(hex.startsWith('#ffff00')) return 'yellow';
      return hex; // fallback
    };

    // Combine prompt and colors for better image generation
    const colorString = hexColors && hexColors.length > 0 ? ` The primary color of the item MUST be ${hexColors.map(hexToName).join(", ")}.` : "";
    
    // Create a strict prompt enforcing standalone product photography
    const enhancedPrompt = `A single isolated piece of clothing: ${finalPrompt}.${colorString} Flat lay product photography. The garment is displayed entirely alone, fully flat, centered. Pure solid colored background. Studio lighting, high quality fashion ecommerce photo, minimal, no human, no other objects.`;

    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          inputs: enhancedPrompt,
          parameters: {
            negative_prompt: "human, person, model, mannequin, body, face, wearing, hanger, messy background, text, watermark, split screen"
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Hugging Face API Error:", errorText);
      throw new Error(`Failed to generate image from HF: ${response.status} ${response.statusText}`);
    }

    // Convert the binary image response to base64
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString("base64");
    const previewUrl = `data:image/jpeg;base64,${base64Image}`;

    return NextResponse.json({
      success: true,
      data: {
        previewUrl,
        message: "Design preview generated successfully using Hugging Face (Stable Diffusion)",
      },
    });
  } catch (error: any) {
    console.error("Image generation error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate AI preview" },
      { status: 500 }
    );
  }
}

