import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

const PROMPT_TEMPLATE = `Subject: {subject}
Style: pixel art
Size: 512x512
Pose: 3q
Background: pure solid static white (#FFFFFF), no transparency
Base sprite rule: centered subject only, no scene, no frame, no gradient, no fake alpha, no environmental background
Effect: none
Effect intensity: 0
Frames: 1
Outputs: ["base_png_white"]
Readability rule: subject occupies ~60–75% of canvas and remains legible at small scale
Silhouette rule: preserve clear contour against white
Export rule: base image must be optimized for later real background removal`;

export const ASSET_LIST = [
  { id: 'warrior', subject: 'fantasy warrior in iron armor with sword and shield' },
  { id: 'archer', subject: 'fantasy archer with green hood and wooden bow' },
  { id: 'mage', subject: 'fantasy mage in purple robes with glowing staff' },
  { id: 'slime', subject: 'green gelatinous slime monster' },
  { id: 'goblin', subject: 'sneaky green goblin with a rusty dagger' },
  { id: 'skeleton', subject: 'undead skeleton warrior with bone sword' },
  { id: 'boss', subject: 'giant void knight boss with dark purple armor and horns' },
];

export async function generateAndProcessSprite(subject: string): Promise<string> {
  const prompt = PROMPT_TEMPLATE.replace('{subject}', subject);
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: prompt,
  });

  let base64Image = '';
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      base64Image = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      break;
    }
  }

  if (!base64Image) {
    throw new Error("Failed to generate image");
  }

  // Process image: remove white bg and resize to 256x256 to save space
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error("No canvas context"));
      
      ctx.drawImage(img, 0, 0, 256, 256);
      
      const imageData = ctx.getImageData(0, 0, 256, 256);
      const data = imageData.data;
      
      // Simple white removal (tolerance)
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        if (r > 230 && g > 230 && b > 230) {
          data[i + 3] = 0; // transparent
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error("Failed to load image for processing"));
    img.src = base64Image;
  });
}
