import { useState } from 'react';
import { Play, Loader2, UploadCloud, Volume2, Wand2 } from 'lucide-react';

export function AudioTab({ config }: { config: any }) {
  const [prompt, setPrompt] = useState('');
  const [audioType, setAudioType] = useState('sfx');
  const [category, setCategory] = useState('hero_shout');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
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
          assetName: `A new ${audioType} audio for ${category}`,
          category: 'audio',
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
    if (!generatedAudio) return;
    if (!config.awsBucket) {
      alert('AWS S3 bucket not configured');
      return;
    }

    setIsSaving(true);
    try {
      const filename = `audio/${audioType}_${category}_${Date.now()}.mp3`;
      const res = await fetch('/api/admin/s3', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-aws-access-key': config.awsAccessKey,
          'x-aws-secret-key': config.awsSecretKey,
          'x-aws-region': config.awsRegion,
          'x-aws-bucket': config.awsBucket,
        },
        body: JSON.stringify({ base64: generatedAudio, filename })
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

  const generateAudio = async () => {
    if (!config.elevenlabsKey) return alert('Please configure ElevenLabs API key in settings');
    
    setIsGenerating(true);
    try {
      const res = await fetch('/api/admin/audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt,
          type: audioType,
          category,
          elevenlabsKey: config.elevenlabsKey
        })
      });
      
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setGeneratedAudio(data.url);
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
          <label className="block text-sm text-slate-400 mb-2 uppercase tracking-widest">Audio Type</label>
          <select 
            value={audioType} 
            onChange={(e) => {
              setAudioType(e.target.value);
              if (e.target.value === 'music') setCategory('bgm');
              else setCategory('hero_shout');
            }}
            className="w-full bg-[#0f111a] border-2 border-[#000] p-3 text-white pixel-borders outline-none focus:border-indigo-400"
          >
            <option value="sfx">Sound Effect (SFX)</option>
            <option value="music">Background Music</option>
          </select>
        </div>

        {audioType === 'sfx' && (
          <div>
            <label className="block text-sm text-slate-400 mb-2 uppercase tracking-widest">Category</label>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#0f111a] border-2 border-[#000] p-3 text-white pixel-borders outline-none focus:border-indigo-400"
            >
              <option value="hero_shout">Hero Shout / Voice</option>
              <option value="magic">Magic / Spell Cast</option>
              <option value="attack">Melee Attack / Hit</option>
              <option value="walk">Footsteps / Walk</option>
              <option value="item">Item Interaction / Chest</option>
              <option value="monster_die">Monster Death</option>
              <option value="hero_die">Hero Death</option>
            </select>
          </div>
        )}

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
            placeholder={audioType === 'sfx' ? "e.g. A loud, echoing explosion of magical fire..." : "e.g. Epic orchestral battle music with fast tempo..."}
            className="w-full bg-[#0f111a] border-2 border-[#000] p-3 text-white h-32 pixel-borders outline-none focus:border-indigo-400 resize-none"
          />
        </div>

        <button 
          onClick={generateAudio}
          disabled={isGenerating || !prompt}
          className="w-full bg-indigo-600 hover:bg-indigo-500 active:pixel-borders-pressed text-white font-bold py-4 text-lg uppercase tracking-widest border-2 border-[#000] pixel-borders transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isGenerating ? <Loader2 className="animate-spin" size={24} /> : <Volume2 size={24} />}
          Generate Audio
        </button>
      </div>

      <div className="flex-1 bg-[#0f111a] border-2 border-[#000] pixel-borders flex flex-col relative overflow-hidden">
        {generatedAudio ? (
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <div className="w-full p-6 bg-slate-800 border-4 border-[#000] pixel-borders flex flex-col items-center gap-4">
              <Volume2 size={48} className="text-indigo-400" />
              <audio controls src={generatedAudio} className="w-full" />
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
            <Volume2 size={48} className="mb-4 opacity-20" />
            <p className="uppercase tracking-widest text-sm">Generated audio will appear here</p>
            <p className="text-xs mt-2 opacity-50">Powered by ElevenLabs</p>
          </div>
        )}
      </div>
    </div>
  );
}
