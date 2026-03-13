import { useState } from 'react';
import { Play, Loader2, UploadCloud, Wand2, Image as ImageIcon } from 'lucide-react';

export function AnimationsTab({ config }: { config: any }) {
  const [prompt, setPrompt] = useState('');
  const [entityType, setEntityType] = useState('hero');
  const [animationType, setAnimationType] = useState('walk');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [sourceImage, setSourceImage] = useState<string | null>(null);
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
          assetName: `A new ${animationType} animation for a ${entityType}`,
          category: 'animation',
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSourceImage(reader.result as string);
      };
      reader.readAsDataURL(file);
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
      const filename = `animations/${entityType}_${animationType}_${Date.now()}.png`;
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

  const generateAnimation = async () => {
    if (!config.geminiKey && !config.openaiKey) return alert('Please configure an API key in settings');
    
    setIsGenerating(true);
    try {
      const finalPrompt = `Subject: ${prompt}\nStyle: pixel art sprite sheet\nAnimation: ${animationType}\nEntity: ${entityType}\nBackground: pure solid static white (#FFFFFF)\nBase sprite rule: horizontal sprite sheet, 4 frames of animation, evenly spaced\nExport rule: base image must be optimized for later real background removal`;
      
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
          aspectRatio: "4:1", // Sprite sheet aspect ratio
          sourceImage: sourceImage
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
          <label className="block text-sm text-slate-400 mb-2 uppercase tracking-widest">Entity Type</label>
          <select 
            value={entityType} 
            onChange={(e) => setEntityType(e.target.value)}
            className="w-full bg-[#0f111a] border-2 border-[#000] p-3 text-white pixel-borders outline-none focus:border-pink-400"
          >
            <option value="hero">Hero</option>
            <option value="monster">Monster</option>
            <option value="boss">Boss</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-2 uppercase tracking-widest">Animation Type</label>
          <select 
            value={animationType} 
            onChange={(e) => setAnimationType(e.target.value)}
            className="w-full bg-[#0f111a] border-2 border-[#000] p-3 text-white pixel-borders outline-none focus:border-pink-400"
          >
            <option value="idle">Idle</option>
            <option value="walk">Walk Cycle</option>
            <option value="attack">Melee Attack</option>
            <option value="cast">Cast Magic</option>
            <option value="heal">Heal</option>
            <option value="hurt">Hurt / Take Damage</option>
            <option value="die">Death / Die</option>
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
            placeholder="e.g. A brave knight in silver armor..."
            className="w-full bg-[#0f111a] border-2 border-[#000] p-3 text-white h-32 pixel-borders outline-none focus:border-pink-400 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-2 uppercase tracking-widest">Source Image (Optional)</label>
          <div className="flex items-center gap-4">
            <label className="cursor-pointer bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 border-2 border-[#000] pixel-borders flex items-center gap-2 text-sm">
              <UploadCloud size={16} />
              Upload Base Sprite
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
            {sourceImage && (
              <div className="relative w-12 h-12 border-2 border-[#000] bg-white">
                <img src={sourceImage} alt="Source" className="w-full h-full object-contain" />
                <button 
                  onClick={() => setSourceImage(null)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs border border-[#000]"
                >
                  ×
                </button>
              </div>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-2">Upload an existing sprite to animate it.</p>
        </div>

        <button 
          onClick={generateAnimation}
          disabled={isGenerating || !prompt}
          className="w-full bg-pink-600 hover:bg-pink-500 active:pixel-borders-pressed text-white font-bold py-4 text-lg uppercase tracking-widest border-2 border-[#000] pixel-borders transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isGenerating ? <Loader2 className="animate-spin" size={24} /> : <Play size={24} />}
          Generate Sprite Sheet
        </button>
      </div>

      <div className="flex-1 bg-[#0f111a] border-2 border-[#000] pixel-borders flex flex-col relative overflow-hidden">
        {generatedImage ? (
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <div className="relative w-full aspect-[4/1] bg-white border-4 border-[#000] pixel-borders overflow-hidden">
              <img src={generatedImage} alt="Generated Animation" className="w-full h-full object-contain" style={{ imageRendering: 'pixelated' }} />
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
            <Play size={48} className="mb-4 opacity-20" />
            <p className="uppercase tracking-widest text-sm">Generated sprite sheet will appear here</p>
            <p className="text-xs mt-2 opacity-50">Generates a 4-frame horizontal sprite sheet</p>
          </div>
        )}
      </div>
    </div>
  );
}
