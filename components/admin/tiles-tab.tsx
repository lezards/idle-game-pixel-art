import { useState } from 'react';
import { Play, Loader2, UploadCloud, ImageIcon, Wand2 } from 'lucide-react';

export function TilesTab({ config }: { config: any }) {
  const [prompt, setPrompt] = useState('');
  const [tileType, setTileType] = useState('floor');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const [isSuggesting, setIsSuggesting] = useState(false);

  const handleSuggestDescription = async () => {
    setIsSuggesting(true);
    try {
      const res = await fetch('/api/admin/suggest-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-key': config.geminiKey,
        },
        body: JSON.stringify({
          assetName: `A new ${tileType} tile`,
          category: 'tile',
          context: "Idle MMORPG Web game with endless floors, 3-hero party, elemental affinities (Fire, Water, Earth, Wind), pets, and a deep building metagame. Medieval fantasy pixel art style."
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPrompt(data.prompt);
    } catch (e: any) {
      console.error(e);
      alert('Failed to suggest description: ' + e.message);
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleSaveToS3 = async () => {
    if (!generatedImage) return;
    if (!config.awsBucket) {
      alert('AWS S3 bucket not configured');
      return;
    }

    setIsSaving(true);
    try {
      const filename = `tiles/${tileType}_${Date.now()}.png`;
      const res = await fetch('/api/admin/s3', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-aws-access-key': config.awsAccessKey,
          'x-aws-secret-key': config.awsSecretKey,
          'x-aws-region': config.awsRegion,
          'x-aws-bucket': config.awsBucket,
        },
        body: JSON.stringify({ base64: generatedImage, filename })
      });
      
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      alert(`Saved to S3 successfully: ${data.url}`);
    } catch (e: any) {
      alert('Failed to save to S3: ' + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const generateTile = async () => {
    if (!config.geminiKey && !config.openaiKey) return alert('Please configure an API key in settings');
    
    setIsGenerating(true);
    try {
      const finalPrompt = `Subject: ${prompt}\nStyle: pixel art 2D game tile\nTile Type: ${tileType}\nBackground: pure solid static white (#FFFFFF) if transparent, or fully filled if it's a solid block\nBase sprite rule: perfectly square tile, seamless texture if applicable\nExport rule: base image must be optimized for later real background removal`;
      
      const res = await fetch('/api/admin/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-gemini-key': config.geminiKey,
          'x-openai-key': config.openaiKey
        },
        body: JSON.stringify({ 
          prompt: finalPrompt,
          provider: config.provider,
          aspectRatio: "1:1" // Square tile
        })
      });
      
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setGeneratedImage(data.base64);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full">
      <div className="flex-1 flex flex-col gap-4">
        <div>
          <label className="block text-sm text-slate-400 mb-2 uppercase tracking-widest">Tile Type</label>
          <select 
            value={tileType} 
            onChange={(e) => setTileType(e.target.value)}
            className="w-full bg-[#0f111a] border-2 border-[#000] p-3 text-white pixel-borders outline-none focus:border-emerald-400"
          >
            <option value="floor">Floor / Ground</option>
            <option value="wall">Wall / Obstacle</option>
            <option value="ui_button">UI Button</option>
            <option value="ui_panel">UI Panel / Background</option>
          </select>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm text-slate-400 uppercase tracking-widest">Description</label>
            <button 
              onClick={handleSuggestDescription}
              disabled={isSuggesting}
              className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-2 py-1 border border-[#000] flex items-center gap-1 disabled:opacity-50"
            >
              {isSuggesting ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
              Suggest
            </button>
          </div>
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Dark stone dungeon floor with cracks..."
            className="w-full bg-[#0f111a] border-2 border-[#000] p-3 text-white h-32 pixel-borders outline-none focus:border-emerald-400 resize-none"
          />
        </div>

        <button 
          onClick={generateTile}
          disabled={isGenerating || !prompt}
          className="w-full bg-emerald-600 hover:bg-emerald-500 active:pixel-borders-pressed text-white font-bold py-4 text-lg uppercase tracking-widest border-2 border-[#000] pixel-borders transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isGenerating ? <Loader2 className="animate-spin" size={24} /> : <ImageIcon size={24} />}
          Generate Tile
        </button>
      </div>

      <div className="flex-1 bg-[#0f111a] border-2 border-[#000] pixel-borders flex flex-col relative overflow-hidden">
        {generatedImage ? (
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <div className="relative w-64 h-64 bg-white border-4 border-[#000] pixel-borders overflow-hidden">
              <img src={generatedImage} alt="Generated Tile" className="w-full h-full object-contain" style={{ imageRendering: 'pixelated' }} />
            </div>
            <div className="mt-4 flex gap-4 w-full">
              <button 
                onClick={handleSaveToS3}
                disabled={isSaving}
                className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-2 px-4 uppercase tracking-widest border-2 border-[#000] pixel-borders flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 className="animate-spin" size={16} /> : <UploadCloud size={16} />}
                {isSaving ? 'Saving...' : 'Save to S3'}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 text-center">
            <ImageIcon size={48} className="mb-4 opacity-20" />
            <p className="uppercase tracking-widest text-sm">Generated tile will appear here</p>
            <p className="text-xs mt-2 opacity-50">Generates a 1:1 square tile</p>
          </div>
        )}
      </div>
    </div>
  );
}
