"use client";

import { useState, useEffect } from 'react';
import { Settings, Image as ImageIcon, UploadCloud, X, Loader2, Save, RefreshCw, Wand2, Eraser, ListChecks, Play, CheckCircle2, AlertCircle } from 'lucide-react';
import { GAME_ASSETS_SCHEMA, GameAssetSchema } from '@/lib/admin/game-assets-schema';
import { AnimationsTab } from './animations-tab';
import { AudioTab } from './audio-tab';
import { TilesTab } from './tiles-tab';

export function AdminButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 w-12 h-12 bg-slate-800 border-2 border-[#000] flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 pixel-borders transition-all"
        title="Admin Asset Generator"
      >
        <Wand2 size={20} />
      </button>

      {isOpen && <AdminPanel onClose={() => setIsOpen(false)} />}
    </>
  );
}

type BatchItem = GameAssetSchema & {
  prompt: string;
  status: 'idle' | 'suggesting' | 'generating' | 'uploading' | 'success' | 'error';
  url: string | null;
  selected: boolean;
};

function AdminPanel({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState('batch');
  
  // Settings State
  const [config, setConfig] = useState({
    geminiKey: '',
    openaiKey: '',
    elevenlabsKey: '',
    awsAccessKey: '',
    awsSecretKey: '',
    awsRegion: '',
    awsBucket: '',
    provider: 'gemini'
  });

  // Generator State
  const [prompt, setPrompt] = useState('');
  const [assetType, setAssetType] = useState('character');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [filename, setFilename] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);

  // Gallery State
  const [gallery, setGallery] = useState<any[]>([]);
  const [isLoadingGallery, setIsLoadingGallery] = useState(false);

  // Batch State
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('admin_config');
    if (saved) setConfig(JSON.parse(saved));

    const savedBatch = localStorage.getItem('admin_batch_items');
    if (savedBatch) {
      setBatchItems(JSON.parse(savedBatch));
    } else {
      setBatchItems(GAME_ASSETS_SCHEMA.map(item => ({
        ...item,
        prompt: '',
        status: 'idle',
        url: null,
        selected: false
      })));
    }
  }, []);

  useEffect(() => {
    if (batchItems.length > 0) {
      localStorage.setItem('admin_batch_items', JSON.stringify(batchItems));
    }
  }, [batchItems]);

  const saveConfig = () => {
    localStorage.setItem('admin_config', JSON.stringify(config));
    alert('Settings saved locally!');
  };

  const generateImageApi = async (promptText: string, type: string, sourceImgBase64?: string | null) => {
    let finalPrompt = promptText;
    let aspectRatio = "1:1";
    
    if (type === 'character' || type === 'item' || type === 'ui') {
      finalPrompt = `Subject: ${promptText}\nStyle: pixel art\nBackground: pure solid static white (#FFFFFF), no transparency\nBase sprite rule: centered subject only, no scene, no frame, no gradient, no fake alpha, no environmental background\nEffect: none\nEffect intensity: 0\nFrames: 1\nOutputs: ["base_png_white"]\nReadability rule: subject occupies ~60–75% of canvas and remains legible at small scale\nSilhouette rule: preserve clear contour against white\nExport rule: base image must be optimized for later real background removal`;
    } else if (type === 'background') {
      finalPrompt = `Subject: ${promptText}\nStyle: 16-bit pixel art game background landscape, seamless, highly detailed\nBackground: full scene, no borders`;
      aspectRatio = "16:9";
    } else if (type === 'animation') {
      finalPrompt = `Subject: ${promptText} sprite sheet animation frames\nStyle: pixel art\nBackground: pure solid static white (#FFFFFF)\nLayout: 4 frames of animation side by side horizontally`;
      aspectRatio = "16:9";
    }

    const res = await fetch('/api/admin/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-gemini-key': config.geminiKey,
        'x-openai-key': config.openaiKey,
      },
      body: JSON.stringify({ prompt: finalPrompt, provider: config.provider, aspectRatio, sourceImage: sourceImgBase64 })
    });
    
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data.base64;
  };

  const uploadToS3Api = async (base64: string, fname: string) => {
    if (!config.awsBucket) throw new Error('AWS S3 bucket not configured');
    const res = await fetch('/api/admin/s3', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-aws-access-key': config.awsAccessKey,
        'x-aws-secret-key': config.awsSecretKey,
        'x-aws-region': config.awsRegion,
        'x-aws-bucket': config.awsBucket,
      },
      body: JSON.stringify({ base64, filename: fname })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data.url;
  };

  const removeWhiteBackgroundApi = (base64: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(base64);
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i] > 230 && data[i+1] > 230 && data[i+2] > 230) {
            data[i+3] = 0;
          }
        }
        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = base64;
    });
  };

  const handleGenerate = async () => {
    if (!prompt) return alert('Please enter a prompt');
    setIsGenerating(true);
    setGeneratedImage(null);
    try {
      const base64 = await generateImageApi(prompt, assetType, sourceImage);
      setGeneratedImage(base64);
      setFilename(`${assetType}_${Date.now()}.png`);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsGenerating(false);
    }
  };

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
          assetName: `A new ${assetType}`,
          category: assetType,
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
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setSourceImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeWhiteBackground = async () => {
    if (!generatedImage) return;
    const newBase64 = await removeWhiteBackgroundApi(generatedImage);
    setGeneratedImage(newBase64);
  };

  const handleUpload = async () => {
    if (!generatedImage || !filename) return;
    setIsUploading(true);
    try {
      const url = await uploadToS3Api(generatedImage, filename);
      alert('Uploaded successfully to: ' + url);
      if (activeTab === 'gallery') loadGallery();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsUploading(false);
    }
  };

  const loadGallery = async () => {
    if (!config.awsBucket) return alert('Please configure AWS S3 bucket in settings');
    setIsLoadingGallery(true);
    try {
      const res = await fetch('/api/admin/s3', {
        headers: {
          'x-aws-access-key': config.awsAccessKey,
          'x-aws-secret-key': config.awsSecretKey,
          'x-aws-region': config.awsRegion,
          'x-aws-bucket': config.awsBucket,
        }
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setGallery(data.files);
    } catch (e: any) {
      console.error(e);
      alert('Failed to load gallery: ' + e.message);
    } finally {
      setIsLoadingGallery(false);
    }
  };

  // --- BATCH LOGIC ---

  const suggestPrompt = async (item: BatchItem, index: number) => {
    updateBatchItem(index, { status: 'suggesting' });
    try {
      const res = await fetch('/api/admin/suggest-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-key': config.geminiKey,
        },
        body: JSON.stringify({
          assetName: item.name,
          category: item.category,
          context: "Idle MMORPG Web game with endless floors, 3-hero party, elemental affinities (Fire, Water, Earth, Wind), pets, and a deep building metagame."
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      updateBatchItem(index, { prompt: data.prompt, status: 'idle' });
    } catch (e: any) {
      console.error(e);
      updateBatchItem(index, { status: 'error' });
    }
  };

  const suggestAllPrompts = async () => {
    const itemsToSuggest = batchItems.filter(i => !i.prompt);
    if (itemsToSuggest.length === 0) return alert('All items already have prompts.');
    
    // Process in small batches to avoid rate limits
    for (let i = 0; i < batchItems.length; i++) {
      if (!batchItems[i].prompt) {
        await suggestPrompt(batchItems[i], i);
        // Small delay
        await new Promise(r => setTimeout(r, 500));
      }
    }
  };

  const generateBatchItem = async (item: BatchItem, index: number) => {
    if (!item.prompt) return;
    updateBatchItem(index, { status: 'generating' });
    try {
      const base64 = await generateImageApi(item.prompt, item.category);
      
      updateBatchItem(index, { status: 'uploading' });
      
      let finalBase64 = base64;
      if (item.category !== 'background') {
        finalBase64 = await removeWhiteBackgroundApi(base64);
      }

      const fname = `${item.id}_${Date.now()}.png`;
      const url = await uploadToS3Api(finalBase64, fname);
      
      updateBatchItem(index, { status: 'success', url });
    } catch (e: any) {
      console.error(e);
      updateBatchItem(index, { status: 'error' });
    }
  };

  const generateSelected = async () => {
    const selected = batchItems.filter(i => i.selected && i.prompt && i.status !== 'success');
    if (selected.length === 0) return alert('Select items with prompts to generate.');
    
    setIsBatchProcessing(true);
    for (let i = 0; i < batchItems.length; i++) {
      if (batchItems[i].selected && batchItems[i].prompt && batchItems[i].status !== 'success') {
        await generateBatchItem(batchItems[i], i);
      }
    }
    setIsBatchProcessing(false);
  };

  const updateBatchItem = (index: number, updates: Partial<BatchItem>) => {
    setBatchItems(prev => {
      const next = [...prev];
      next[index] = { ...next[index], ...updates };
      return next;
    });
  };

  const toggleSelectAll = () => {
    const allSelected = batchItems.every(i => i.selected);
    setBatchItems(prev => prev.map(i => ({ ...i, selected: !allSelected })));
  };

  const loadFromMasterFile = async () => {
    try {
      const res = await fetch('/arquitetura.md');
      if (!res.ok) throw new Error('Could not load arquitetura.md');
      const text = await res.text();
      
      const newItems: BatchItem[] = [];
      let currentCategory = 'character';
      
      const lines = text.split('\n');
      for (const line of lines) {
        if (line.startsWith('## ')) {
          const catName = line.replace('## ', '').trim().toLowerCase();
          if (catName.includes('personagens') || catName.includes('inimigos')) currentCategory = 'character';
          else if (catName.includes('animações')) currentCategory = 'animation';
          else if (catName.includes('tiles')) currentCategory = 'tile';
          else if (catName.includes('ui')) currentCategory = 'ui';
          else if (catName.includes('áudio')) currentCategory = 'audio';
          else currentCategory = 'item';
        } else if (line.startsWith('- `')) {
          // Format: - `id`: Description
          const match = line.match(/- `([^`]+)`:\s*(.*)/);
          if (match) {
            const id = match[1];
            const description = match[2];
            
            // Only add if not already in batchItems
            if (!batchItems.find(i => i.id === id)) {
              newItems.push({
                id,
                name: id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                category: currentCategory,
                description,
                prompt: '',
                status: 'idle',
                url: null,
                selected: false
              });
            }
          }
        }
      }
      
      if (newItems.length > 0) {
        setBatchItems(prev => [...prev, ...newItems]);
        alert(`Loaded ${newItems.length} new items from arquitetura.md`);
      } else {
        alert('No new items found in arquitetura.md');
      }
    } catch (e: any) {
      alert('Failed to load master file: ' + e.message);
    }
  };

  const addWaves = (count: number) => {
    const currentHighestFloor = batchItems.reduce((max, item) => {
      const match = item.id.match(/floor_(\d+)/);
      return match ? Math.max(max, parseInt(match[1])) : max;
    }, 0);

    const newItems: BatchItem[] = [];
    for (let i = 1; i <= count; i++) {
      const floor = currentHighestFloor + i;
      newItems.push({
        id: `enemy_floor_${floor}`,
        name: `Floor ${floor} Mob`,
        category: 'character',
        description: `Common enemy for floor ${floor}`,
        prompt: '', status: 'idle', url: null, selected: false
      });
      if (floor % 10 === 0) {
        newItems.push({
          id: `boss_floor_${floor}`,
          name: `Floor ${floor} Boss`,
          category: 'character',
          description: `Boss for floor ${floor}`,
          prompt: '', status: 'idle', url: null, selected: false
        });
      }
    }
    setBatchItems(prev => [...prev, ...newItems]);
  };

  const addEquipment = () => {
    const tiers = ['wood', 'iron', 'steel', 'mithril', 'obsidian'];
    const types = ['sword', 'armor', 'helmet', 'boots', 'ring'];
    const newItems: BatchItem[] = [];
    
    tiers.forEach(tier => {
      types.forEach(type => {
        const id = `eq_${tier}_${type}`;
        if (!batchItems.find(i => i.id === id)) {
          newItems.push({
            id,
            name: `${tier} ${type}`,
            category: 'item',
            description: `${tier} tier ${type} equipment`,
            prompt: '', status: 'idle', url: null, selected: false
          });
        }
      });
    });
    setBatchItems(prev => [...prev, ...newItems]);
  };

  return (
    <div className="fixed inset-0 bg-[#1a202c] z-[100] flex flex-col font-pixel overflow-hidden">
      <div className="w-full h-full flex flex-col border-4 border-[#000] pixel-panel shadow-2xl">
        
        {/* Header */}
        <div className="bg-[#0f111a] border-b-4 border-[#000] p-4 flex justify-between items-center">
          <h2 className="text-2xl text-amber-400 uppercase tracking-widest" style={{ textShadow: '2px 2px 0 #000' }}>
            Admin Asset Forge
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b-4 border-[#000] bg-[#2d3748] overflow-x-auto">
          <button 
            onClick={() => setActiveTab('batch')}
            className={`flex-1 min-w-[150px] py-3 px-4 font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${activeTab === 'batch' ? 'bg-[#1a202c] text-purple-400' : 'text-slate-400 hover:bg-[#1a202c]/50'}`}
          >
            <ListChecks size={18} /> Batch Forge
          </button>
          <button 
            onClick={() => setActiveTab('generator')}
            className={`flex-1 min-w-[150px] py-3 px-4 font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${activeTab === 'generator' ? 'bg-[#1a202c] text-emerald-400' : 'text-slate-400 hover:bg-[#1a202c]/50'}`}
          >
            <Wand2 size={18} /> Single Gen
          </button>
          <button 
            onClick={() => { setActiveTab('gallery'); loadGallery(); }}
            className={`flex-1 min-w-[150px] py-3 px-4 font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${activeTab === 'gallery' ? 'bg-[#1a202c] text-blue-400' : 'text-slate-400 hover:bg-[#1a202c]/50'}`}
          >
            <ImageIcon size={18} /> S3 Gallery
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex-1 min-w-[150px] py-3 px-4 font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${activeTab === 'settings' ? 'bg-[#1a202c] text-amber-400' : 'text-slate-400 hover:bg-[#1a202c]/50'}`}
          >
            <Settings size={18} /> Settings
          </button>
          <button 
            onClick={() => setActiveTab('animations')}
            className={`flex-1 min-w-[150px] py-3 px-4 font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${activeTab === 'animations' ? 'bg-[#1a202c] text-pink-400' : 'text-slate-400 hover:bg-[#1a202c]/50'}`}
          >
            <Play size={18} /> Animations
          </button>
          <button 
            onClick={() => setActiveTab('tiles')}
            className={`flex-1 min-w-[150px] py-3 px-4 font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${activeTab === 'tiles' ? 'bg-[#1a202c] text-emerald-400' : 'text-slate-400 hover:bg-[#1a202c]/50'}`}
          >
            <ImageIcon size={18} /> Tiles
          </button>
          <button 
            onClick={() => setActiveTab('audio')}
            className={`flex-1 min-w-[150px] py-3 px-4 font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${activeTab === 'audio' ? 'bg-[#1a202c] text-indigo-400' : 'text-slate-400 hover:bg-[#1a202c]/50'}`}
          >
            <Play size={18} /> Audio
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 text-slate-200">
          
          {/* BATCH TAB */}
          {activeTab === 'batch' && (
            <div className="flex flex-col h-full gap-4">
              <div className="flex justify-between items-center bg-[#0f111a] p-4 border-2 border-[#000] pixel-borders flex-wrap gap-4">
                <div className="flex flex-wrap gap-4">
                  <button 
                    onClick={suggestAllPrompts}
                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 text-sm uppercase tracking-widest border-2 border-[#000] pixel-borders flex items-center gap-2"
                  >
                    <Wand2 size={16} /> Suggest Missing Prompts
                  </button>
                  <button 
                    onClick={generateSelected}
                    disabled={isBatchProcessing}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 text-sm uppercase tracking-widest border-2 border-[#000] pixel-borders flex items-center gap-2 disabled:opacity-50"
                  >
                    {isBatchProcessing ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />} 
                    Generate Selected
                  </button>
                  <div className="w-px h-8 bg-slate-700 mx-2 hidden md:block"></div>
                  <button 
                    onClick={loadFromMasterFile}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 text-sm uppercase tracking-widest border-2 border-[#000] pixel-borders flex items-center gap-2"
                  >
                    <Wand2 size={16} /> Load from Master File
                  </button>
                  <button 
                    onClick={() => addWaves(10)}
                    className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 text-sm uppercase tracking-widest border-2 border-[#000] pixel-borders flex items-center gap-2"
                  >
                    + 10 Waves & Boss
                  </button>
                  <button 
                    onClick={addEquipment}
                    className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 text-sm uppercase tracking-widest border-2 border-[#000] pixel-borders flex items-center gap-2"
                  >
                    + Equipment Set
                  </button>
                </div>
                <div className="text-sm text-slate-400 uppercase tracking-widest">
                  {batchItems.filter(i => i.status === 'success').length} / {batchItems.length} Completed
                </div>
              </div>

              <div className="flex-1 overflow-auto border-2 border-[#000] bg-[#0f111a]">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#1a202c] sticky top-0 z-10">
                    <tr>
                      <th className="p-3 border-b-2 border-[#000] w-10 text-center">
                        <input type="checkbox" onChange={toggleSelectAll} checked={batchItems.length > 0 && batchItems.every(i => i.selected)} className="w-4 h-4 accent-amber-400" />
                      </th>
                      <th className="p-3 border-b-2 border-[#000] uppercase tracking-widest text-xs text-slate-400 w-48">Asset</th>
                      <th className="p-3 border-b-2 border-[#000] uppercase tracking-widest text-xs text-slate-400">Prompt Description</th>
                      <th className="p-3 border-b-2 border-[#000] uppercase tracking-widest text-xs text-slate-400 w-24 text-center">Status</th>
                      <th className="p-3 border-b-2 border-[#000] uppercase tracking-widest text-xs text-slate-400 w-32 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batchItems.map((item, index) => (
                      <tr key={item.id} className="border-b border-[#2d3748] hover:bg-[#1a202c]/50 transition-colors">
                        <td className="p-3 text-center">
                          <input 
                            type="checkbox" 
                            checked={item.selected} 
                            onChange={(e) => updateBatchItem(index, { selected: e.target.checked })}
                            className="w-4 h-4 accent-amber-400" 
                          />
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-amber-400">{item.name}</div>
                          <div className="text-xs text-slate-500 uppercase">{item.category}</div>
                          <div className="text-xs text-slate-400 mt-1">{item.description}</div>
                        </td>
                        <td className="p-3">
                          <textarea 
                            value={item.prompt}
                            onChange={(e) => updateBatchItem(index, { prompt: e.target.value })}
                            className="w-full bg-[#1a202c] border border-[#000] p-2 text-xs text-slate-300 outline-none focus:border-amber-400 resize-none h-16"
                            placeholder="Describe the asset visually..."
                          />
                        </td>
                        <td className="p-3 text-center">
                          {item.status === 'idle' && <span className="text-slate-500 text-xs uppercase">Idle</span>}
                          {item.status === 'suggesting' && <Loader2 size={16} className="animate-spin text-purple-400 mx-auto" />}
                          {item.status === 'generating' && <span title="Generating Image"><Loader2 size={16} className="animate-spin text-emerald-400 mx-auto" /></span>}
                          {item.status === 'uploading' && <span title="Uploading to S3"><Loader2 size={16} className="animate-spin text-blue-400 mx-auto" /></span>}
                          {item.status === 'success' && (
                            <div className="flex flex-col items-center gap-1">
                              <CheckCircle2 size={16} className="text-emerald-400" />
                              <a href={item.url!} target="_blank" rel="noreferrer" className="text-[10px] text-blue-400 hover:underline">View</a>
                            </div>
                          )}
                          {item.status === 'error' && <span title="Error occurred"><AlertCircle size={16} className="text-red-400 mx-auto" /></span>}
                        </td>
                        <td className="p-3">
                          <div className="flex flex-col gap-2">
                            <button 
                              onClick={() => suggestPrompt(item, index)}
                              disabled={item.status === 'suggesting'}
                              className="bg-slate-700 hover:bg-slate-600 text-white text-xs py-1 px-2 border border-[#000] flex items-center justify-center gap-1 disabled:opacity-50"
                            >
                              <Wand2 size={12} /> Suggest
                            </button>
                            <button 
                              onClick={() => generateBatchItem(item, index)}
                              disabled={!item.prompt || item.status === 'generating' || item.status === 'uploading'}
                              className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs py-1 px-2 border border-[#000] flex items-center justify-center gap-1 disabled:opacity-50"
                            >
                              <Play size={12} /> Generate
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* GENERATOR TAB */}
          {activeTab === 'generator' && (
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 flex flex-col gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2 uppercase tracking-widest">Asset Category</label>
                  <select 
                    value={assetType} 
                    onChange={(e) => setAssetType(e.target.value)}
                    className="w-full bg-[#0f111a] border-2 border-[#000] p-3 text-white pixel-borders outline-none focus:border-amber-400"
                  >
                    <option value="character">Character / Enemy / Boss</option>
                    <option value="item">Item / Weapon / Armor / Coin</option>
                    <option value="ui">UI Element / Button / Icon</option>
                    <option value="background">Background (Day/Night/Afternoon)</option>
                    <option value="animation">Animation Sprite Sheet (4 frames)</option>
                  </select>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm text-slate-400 uppercase tracking-widest">Description Prompt</label>
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
                    placeholder="e.g. A fiery demon sword with glowing red runes..."
                    className="w-full h-32 bg-[#0f111a] border-2 border-[#000] p-3 text-white pixel-borders outline-none focus:border-amber-400 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2 uppercase tracking-widest">Source Image (Optional)</label>
                  <div className="bg-[#0f111a] border-2 border-[#000] p-3 pixel-borders flex flex-col gap-2">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload}
                      className="text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-bold file:bg-slate-700 file:text-white hover:file:bg-slate-600 cursor-pointer"
                    />
                    {sourceImage && (
                      <div className="flex items-center gap-4 mt-2">
                        <img src={sourceImage} alt="Source" className="w-16 h-16 object-contain border border-[#000] bg-[#1a202c]" style={{ imageRendering: 'pixelated' }} />
                        <button onClick={() => setSourceImage(null)} className="text-xs text-red-400 hover:text-red-300">Remove</button>
                      </div>
                    )}
                    <p className="text-xs text-slate-500 mt-1">Upload an existing sprite to animate or create variations.</p>
                  </div>
                </div>

                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 active:pixel-borders-pressed text-white font-bold py-4 text-lg uppercase tracking-widest border-2 border-[#000] pixel-borders transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 className="animate-spin" /> : <Wand2 />}
                  {isGenerating ? 'Forging...' : 'Generate Asset'}
                </button>
              </div>

              <div className="flex-1 flex flex-col gap-4">
                <label className="block text-sm text-slate-400 uppercase tracking-widest">Preview</label>
                <div className="flex-1 min-h-[300px] bg-[#0f111a] border-2 border-[#000] pixel-borders flex items-center justify-center relative overflow-hidden" style={{ backgroundImage: 'repeating-conic-gradient(#1a202c 0% 25%, transparent 0% 50%)', backgroundSize: '20px 20px' }}>
                  {generatedImage ? (
                    <img src={generatedImage} alt="Generated" className="max-w-full max-h-full object-contain" style={{ imageRendering: 'pixelated' }} />
                  ) : (
                    <span className="text-slate-600 uppercase tracking-widest">No asset generated</span>
                  )}
                </div>

                {generatedImage && (
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <button 
                        onClick={removeWhiteBackground}
                        className="flex-1 bg-slate-700 hover:bg-slate-600 active:pixel-borders-pressed text-white font-bold py-2 px-4 text-sm uppercase tracking-widest border-2 border-[#000] pixel-borders transition-all flex items-center justify-center gap-2"
                      >
                        <Eraser size={16} /> Remove White BG
                      </button>
                    </div>
                    
                    <div className="flex gap-2 items-center">
                      <input 
                        type="text" 
                        value={filename}
                        onChange={(e) => setFilename(e.target.value)}
                        placeholder="filename.png"
                        className="flex-1 bg-[#0f111a] border-2 border-[#000] p-2 text-white pixel-borders outline-none"
                      />
                      <button 
                        onClick={handleUpload}
                        disabled={isUploading}
                        className="bg-blue-600 hover:bg-blue-500 active:pixel-borders-pressed text-white font-bold py-2 px-6 text-sm uppercase tracking-widest border-2 border-[#000] pixel-borders transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isUploading ? <Loader2 className="animate-spin" size={16} /> : <UploadCloud size={16} />}
                        Save to S3
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* GALLERY TAB */}
          {activeTab === 'gallery' && (
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg text-slate-300 uppercase tracking-widest">S3 Storage</h3>
                <button onClick={loadGallery} className="text-slate-400 hover:text-white flex items-center gap-2">
                  <RefreshCw size={16} className={isLoadingGallery ? 'animate-spin' : ''} /> Refresh
                </button>
              </div>
              
              {isLoadingGallery ? (
                <div className="flex-1 flex items-center justify-center">
                  <Loader2 className="animate-spin text-blue-400" size={32} />
                </div>
              ) : gallery.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-slate-500 uppercase tracking-widest">
                  No assets found in bucket
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 overflow-y-auto pb-4">
                  {gallery.map((file) => (
                    <div key={file.key} className="bg-[#0f111a] border-2 border-[#000] pixel-borders p-2 flex flex-col gap-2 group">
                      <div className="aspect-square bg-[#1a202c] flex items-center justify-center overflow-hidden" style={{ backgroundImage: 'repeating-conic-gradient(#2d3748 0% 25%, transparent 0% 50%)', backgroundSize: '10px 10px' }}>
                        <img src={file.url} alt={file.key} className="max-w-full max-h-full object-contain" style={{ imageRendering: 'pixelated' }} loading="lazy" />
                      </div>
                      <div className="text-xs text-slate-400 truncate" title={file.key}>{file.key}</div>
                      <button 
                        onClick={() => { navigator.clipboard.writeText(file.url); alert('URL copied!'); }}
                        className="w-full bg-slate-700 hover:bg-slate-600 text-white text-xs py-1 border border-[#000] uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Copy URL
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl mx-auto flex flex-col gap-6">
              
              <div className="bg-[#0f111a] border-2 border-[#000] pixel-borders p-4 flex flex-col gap-4">
                <h3 className="text-lg text-amber-400 uppercase tracking-widest border-b-2 border-[#2d3748] pb-2">AI Provider</h3>
                
                <div>
                  <label className="block text-sm text-slate-400 mb-2 uppercase tracking-widest">Active Provider</label>
                  <select 
                    value={config.provider} 
                    onChange={(e) => setConfig({...config, provider: e.target.value})}
                    className="w-full bg-[#1a202c] border-2 border-[#000] p-2 text-white pixel-borders outline-none"
                  >
                    <option value="gemini">Google Gemini (2.5 Flash)</option>
                    <option value="openai">OpenAI (DALL-E 3)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2 uppercase tracking-widest">Gemini API Key</label>
                  <input 
                    type="password" 
                    value={config.geminiKey}
                    onChange={(e) => setConfig({...config, geminiKey: e.target.value})}
                    placeholder="Leave blank to use environment variable"
                    className="w-full bg-[#1a202c] border-2 border-[#000] p-2 text-white pixel-borders outline-none"
                  />
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline mt-1 inline-block">Get Gemini API Key here</a>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2 uppercase tracking-widest">OpenAI API Key (Fallback)</label>
                  <input 
                    type="password" 
                    value={config.openaiKey}
                    onChange={(e) => setConfig({...config, openaiKey: e.target.value})}
                    placeholder="sk-..."
                    className="w-full bg-[#1a202c] border-2 border-[#000] p-2 text-white pixel-borders outline-none"
                  />
                  <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline mt-1 inline-block">Get OpenAI API Key here</a>
                </div>

                <div className="bg-[#0f111a] border-2 border-[#000] pixel-borders p-4">
                  <label className="block text-sm text-slate-400 mb-2 uppercase tracking-widest">ElevenLabs API Key (Audio)</label>
                  <input 
                    type="password" 
                    value={config.elevenlabsKey}
                    onChange={(e) => setConfig({...config, elevenlabsKey: e.target.value})}
                    placeholder="sk_..."
                    className="w-full bg-[#1a202c] border-2 border-[#000] p-2 text-white pixel-borders outline-none"
                  />
                  <a href="https://elevenlabs.io/app/api-keys" target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline mt-1 inline-block">Get ElevenLabs API Key here</a>
                </div>
              </div>

              <div className="bg-[#0f111a] border-2 border-[#000] pixel-borders p-4 flex flex-col gap-4">
                <div className="flex justify-between items-center border-b-2 border-[#2d3748] pb-2">
                  <h3 className="text-lg text-blue-400 uppercase tracking-widest">AWS S3 Storage</h3>
                  <a href="https://docs.aws.amazon.com/AmazonS3/latest/userguide/setting-up-s3.html" target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline">How to setup S3 bucket?</a>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2 uppercase tracking-widest">Bucket Name</label>
                    <input 
                      type="text" 
                      value={config.awsBucket}
                      onChange={(e) => setConfig({...config, awsBucket: e.target.value})}
                      placeholder="my-game-assets"
                      className="w-full bg-[#1a202c] border-2 border-[#000] p-2 text-white pixel-borders outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2 uppercase tracking-widest">Region</label>
                    <input 
                      type="text" 
                      value={config.awsRegion}
                      onChange={(e) => setConfig({...config, awsRegion: e.target.value})}
                      placeholder="us-east-1"
                      className="w-full bg-[#1a202c] border-2 border-[#000] p-2 text-white pixel-borders outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2 uppercase tracking-widest">Access Key ID</label>
                  <input 
                    type="text" 
                    value={config.awsAccessKey}
                    onChange={(e) => setConfig({...config, awsAccessKey: e.target.value})}
                    className="w-full bg-[#1a202c] border-2 border-[#000] p-2 text-white pixel-borders outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2 uppercase tracking-widest">Secret Access Key</label>
                  <input 
                    type="password" 
                    value={config.awsSecretKey}
                    onChange={(e) => setConfig({...config, awsSecretKey: e.target.value})}
                    className="w-full bg-[#1a202c] border-2 border-[#000] p-2 text-white pixel-borders outline-none"
                  />
                </div>
              </div>

              <button 
                onClick={saveConfig}
                className="w-full bg-amber-600 hover:bg-amber-500 active:pixel-borders-pressed text-white font-bold py-3 text-lg uppercase tracking-widest border-2 border-[#000] pixel-borders transition-all flex items-center justify-center gap-2"
              >
                <Save size={20} /> Save Configuration
              </button>

            </div>
          )}

          {/* ANIMATIONS TAB */}
          {activeTab === 'animations' && <AnimationsTab config={config} />}

          {/* TILES TAB */}
          {activeTab === 'tiles' && <TilesTab config={config} />}

          {/* AUDIO TAB */}
          {activeTab === 'audio' && <AudioTab config={config} />}

        </div>
      </div>
    </div>
  );
}
