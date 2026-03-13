import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, provider, aspectRatio, sourceImage } = body;

    const geminiKey = req.headers.get("x-gemini-key") || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    const openaiKey = req.headers.get("x-openai-key");

    if (provider === "openai") {
      if (!openaiKey) {
        return NextResponse.json({ error: "OpenAI API Key is missing" }, { status: 400 });
      }
      const openai = new OpenAI({ apiKey: openaiKey });
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        response_format: "b64_json",
      });
      
      if (!response.data || !response.data[0] || !response.data[0].b64_json) {
        return NextResponse.json({ error: "Failed to generate image with OpenAI" }, { status: 500 });
      }
      
      return NextResponse.json({ base64: `data:image/png;base64,${response.data[0].b64_json}` });
    } else {
      // Default to Gemini
      if (!geminiKey) {
        return NextResponse.json({ error: "Gemini API Key is missing" }, { status: 400 });
      }
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      
      let contents: any = prompt;
      if (sourceImage) {
        // sourceImage is expected to be a data URL like data:image/png;base64,...
        const mimeType = sourceImage.split(';')[0].split(':')[1];
        const base64Data = sourceImage.split(',')[1];
        contents = {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
            { text: prompt }
          ]
        };
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: contents,
        config: {
          imageConfig: {
            aspectRatio: aspectRatio || "1:1",
          }
        }
      });

      let base64Image = "";
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          base64Image = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }

      if (!base64Image) {
        return NextResponse.json({ error: "Failed to generate image with Gemini" }, { status: 500 });
      }

      return NextResponse.json({ base64: base64Image });
    }
  } catch (error: any) {
    console.error("Generation error:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}
