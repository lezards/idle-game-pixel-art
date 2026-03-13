import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { assetName, category, context } = body;

    const geminiKey = req.headers.get("x-gemini-key") || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!geminiKey) {
      return NextResponse.json({ error: "Gemini API Key is missing" }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey: geminiKey });
    
    const prompt = `You are an expert pixel art game designer and prompt engineer.
We are building an Idle MMORPG Web game.
Game Context: ${context}

I need a visual description prompt for an image generator to create the following asset:
Asset Name: "${assetName}"
Category: "${category}"

Provide ONLY the visual description prompt. Keep it under 40 words. Focus on colors, shapes, and iconic details. Do not include meta-instructions like "pixel art" or "white background" as they are appended automatically.
Example for "Warrior": "A fierce fantasy warrior in heavy iron armor, holding a broadsword and a kite shield, dynamic stance, metallic reflections."
Example for "Gold Coin": "A shiny gold coin with a star engraved in the center, glowing edges, rich yellow and orange tones."

Prompt:`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    const suggestedPrompt = response.text?.trim() || "";

    return NextResponse.json({ prompt: suggestedPrompt });
  } catch (error: any) {
    console.error("Suggestion error:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}
