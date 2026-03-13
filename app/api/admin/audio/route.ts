import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt, type, category, elevenlabsKey } = await req.json();

    if (!elevenlabsKey) {
      return NextResponse.json({ error: 'ElevenLabs API key is required' }, { status: 400 });
    }

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Call ElevenLabs Sound Effects API
    // https://api.elevenlabs.io/v1/sound-generation
    const response = await fetch('https://api.elevenlabs.io/v1/sound-generation', {
      method: 'POST',
      headers: {
        'xi-api-key': elevenlabsKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: prompt,
        duration_seconds: type === 'music' ? 10 : 2, // Music longer, SFX shorter
        prompt_influence: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', errorText);
      return NextResponse.json({ error: `ElevenLabs API error: ${response.statusText}` }, { status: response.status });
    }

    // The response is an audio file (audio/mpeg)
    const audioBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString('base64');
    const dataUrl = `data:audio/mpeg;base64,${base64Audio}`;

    return NextResponse.json({ url: dataUrl });

  } catch (error: any) {
    console.error('Audio generation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate audio' }, { status: 500 });
  }
}
