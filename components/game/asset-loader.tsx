"use client";

import { useState, useEffect } from 'react';
import { GAME_ASSETS_SCHEMA } from '@/lib/admin/game-assets-schema';

export function AssetLoader({ children }: { children: (sprites: Record<string, HTMLImageElement>, audio: Record<string, HTMLAudioElement>) => React.ReactNode }) {
  const [sprites, setSprites] = useState<Record<string, HTMLImageElement>>({});
  const [audio, setAudio] = useState<Record<string, HTMLAudioElement>>({});
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Checking local assets...');

  useEffect(() => {
    async function loadAssets() {
      const loadedSprites: Record<string, HTMLImageElement> = {};
      const loadedAudio: Record<string, HTMLAudioElement> = {};
      
      // Check S3 first if configured
      const savedConfig = localStorage.getItem('admin_config');
      let s3Files: any[] = [];
      if (savedConfig) {
        try {
          const config = JSON.parse(savedConfig);
          if (config.awsBucket && config.awsAccessKey) {
            setStatus('Fetching S3 gallery...');
            const res = await fetch('/api/admin/s3', {
              headers: {
                'x-aws-access-key': config.awsAccessKey,
                'x-aws-secret-key': config.awsSecretKey,
                'x-aws-region': config.awsRegion,
                'x-aws-bucket': config.awsBucket,
              }
            });
            const data = await res.json();
            if (data.files) {
              s3Files = data.files;
              // Sort by lastModified descending so newest is first
              s3Files.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());
            }
          }
        } catch (e) {
          console.error('Failed to fetch S3 files', e);
        }
      }

      // Check if we have batch items saved with URLs
      const savedBatch = localStorage.getItem('admin_batch_items');
      let batchItems: any[] = [];
      if (savedBatch) {
        try {
          batchItems = JSON.parse(savedBatch);
        } catch (e) {}
      }

      // We will build a list of all assets to load
      // 1. Start with the base schema
      const assetsToLoad = new Map<string, { id: string, name: string, url: string, type: 'image' | 'audio' }>();
      
      for (const asset of GAME_ASSETS_SCHEMA) {
        // Try S3 first (newest file matching the ID)
        const s3File = s3Files.find(f => f.key.startsWith(`${asset.id}_`) || f.key === `${asset.id}.png`);
        let dataUrl = s3File?.url;

        // Try batch items
        if (!dataUrl) {
          const batchItem = batchItems.find((item: any) => item.id === asset.id);
          dataUrl = batchItem?.url;
        }
        
        // Fallback to old local storage cache
        if (!dataUrl) {
           dataUrl = localStorage.getItem(`sprite_${asset.id}`);
        }

        if (dataUrl) {
          assetsToLoad.set(asset.id, { id: asset.id, name: asset.name, url: dataUrl, type: 'image' });
        }
      }

      // 2. Add any other files from S3 that might be dynamically generated
      for (const file of s3Files) {
        const filename = file.key.split('/').pop() || file.key;
        
        // Handle images
        const imgMatch = filename.match(/^(.*?)(?:_\d+)?\.png$/);
        if (imgMatch && imgMatch[1]) {
          let id = imgMatch[1];
          if (file.key.startsWith('tiles/')) {
            id = `tile_${id}`;
          }
          if (!assetsToLoad.has(id)) {
            assetsToLoad.set(id, { id, name: id, url: file.url, type: 'image' });
          }
        }
        
        // Handle audio
        const audioMatch = filename.match(/^(.*?)(?:_\d+)?\.mp3$/);
        if (audioMatch && audioMatch[1]) {
          let id = audioMatch[1];
          if (!assetsToLoad.has(id)) {
            assetsToLoad.set(id, { id, name: id, url: file.url, type: 'audio' });
          }
        }
      }

      const totalAssets = assetsToLoad.size;
      let loadedCount = 0;

      if (totalAssets === 0) {
        setLoading(false);
        return;
      }

      for (const [id, asset] of Array.from(assetsToLoad.entries())) {
        setStatus(`Loading ${asset.name}...`);
        try {
          if (asset.type === 'image') {
            const img = new Image();
            img.src = asset.url;
            await new Promise((resolve, reject) => { 
              img.onload = resolve; 
              img.onerror = reject;
            });
            loadedSprites[id] = img;
          } else if (asset.type === 'audio') {
            const aud = new Audio();
            aud.src = asset.url;
            await new Promise((resolve, reject) => {
              aud.oncanplaythrough = resolve;
              aud.onerror = reject;
              // Some browsers don't fire oncanplaythrough reliably for data URIs or cached files
              setTimeout(resolve, 500); 
            });
            loadedAudio[id] = aud;
          }
        } catch (e) {
          console.error(`Failed to load ${asset.type} for ${id}`, e);
        }
        
        loadedCount++;
        setProgress((loadedCount / totalAssets) * 100);
      }

      setSprites(loadedSprites);
      setAudio(loadedAudio);
      setLoading(false);
    }

    loadAssets();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f111a] flex flex-col items-center justify-center font-pixel text-white">
        <h1 className="text-4xl mb-8 text-amber-400 uppercase tracking-widest" style={{ textShadow: '2px 2px 0 #000' }}>
          Forging Assets
        </h1>
        <div className="w-64 h-8 bg-slate-800 border-4 border-[#000] pixel-borders relative">
          <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
          {/* Pixel highlight */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-white/20"></div>
        </div>
        <p className="mt-4 text-slate-400 text-lg uppercase tracking-widest" style={{ textShadow: '1px 1px 0 #000' }}>
          {status}
        </p>
      </div>
    );
  }

  return <>{children(sprites, audio)}</>;
}
