"use client";

import { useEffect, useRef, useState } from 'react';
import { GameEngine, BIOMES } from '@/lib/game/GameEngine';
import { TopBar } from './top-bar';
import { LeftPanel } from './left-panel';
import { RightPanel } from './right-panel';
import { BottomBar } from './bottom-bar';
import { Battlefield } from './battlefield';
import { HeroesScreen } from './heroes-screen';
import { GearScreen } from './gear-screen';
import { PetsScreen } from './pets-screen';
import { ShopScreen } from './shop-screen';

export function GameUI({ sprites, audio }: { sprites: Record<string, HTMLImageElement>, audio: Record<string, HTMLAudioElement> }) {
  const [engine] = useState(() => new GameEngine());
  const [activeTab, setActiveTab] = useState('heroes');

  const [gameState, setGameState] = useState({
    floor: 1,
    gold: 0,
    crystals: 0,
    rubies: 0,
    isBossWave: false,
    biome: BIOMES[0]
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    engine.onStateChange = (state) => {
      setGameState({
        ...state,
        biome: engine.getBiome() || BIOMES[0]
      });
    };

    let bgm: HTMLAudioElement | null = null;
    
    if (audio && audio['music_bgm']) {
      bgm = audio['music_bgm'];
      try {
        // eslint-disable-next-line react-hooks/immutability
        bgm.loop = true;
        // eslint-disable-next-line react-hooks/immutability
        bgm.volume = 0.3;
        bgm.play().catch(() => {});
      } catch (e) {
        // Ignore if read-only
      }
    }

    engine.onEvent = (event, data) => {
      if (!audio) return;
      
      try {
        if (event === 'attack') {
          const isMagic = data.entity.class === 'mage';
          const soundId = isMagic ? 'sfx_magic' : 'sfx_attack';
          if (audio[soundId]) {
            audio[soundId].currentTime = 0;
            audio[soundId].play().catch(() => {});
          }
        } else if (event === 'die') {
          const isHero = data.entity.type === 'hero';
          const soundId = isHero ? 'sfx_hero_die' : 'sfx_monster_die';
          if (audio[soundId]) {
            audio[soundId].currentTime = 0;
            audio[soundId].play().catch(() => {});
          }
        } else if (event === 'collect') {
          if (audio['sfx_item']) {
            audio['sfx_item'].currentTime = 0;
            audio['sfx_item'].play().catch(() => {});
          }
        }
      } catch (e) {
        // Ignore audio play errors
      }
    };

    // Initial state
    engine.notifyStateChange();

    let lastTime = performance.now();
    let animationFrameId: number;

    const loop = (time: number) => {
      const dt = time - lastTime;
      lastTime = time;
      
      engine.update(dt);
      
      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [engine]);

  return (
    <div className="flex flex-col h-screen w-full relative overflow-hidden bg-[#1a0f0b]">
      <TopBar state={gameState} sprites={sprites} onToggleRightPanel={() => setActiveTab('season')} />
      
      {/* Full Screen: Battlefield & Panels */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Left Panel - Hidden on mobile, visible on md+ */}
        <div className="hidden md:flex h-full">
          <LeftPanel sprites={sprites} />
        </div>
        
        {/* Center: Battlefield */}
        <div className="flex-1 relative bg-[#1a0f0b]">
          {engine && <Battlefield engine={engine} biome={gameState.biome} sprites={sprites} />}
          
          {/* Screens Overlay */}
          {activeTab === 'heroes' && <HeroesScreen engine={engine} sprites={sprites} onClose={() => setActiveTab('')} />}
          {activeTab === 'gear' && <GearScreen engine={engine} sprites={sprites} onClose={() => setActiveTab('')} />}
          {activeTab === 'pets' && <PetsScreen engine={engine} sprites={sprites} onClose={() => setActiveTab('')} />}
          {activeTab === 'shop' && <ShopScreen engine={engine} sprites={sprites} onClose={() => setActiveTab('')} />}
          
          {/* Mobile Overlays for Side Panels */}
          {activeTab === 'missions' && (
            <div className="md:hidden absolute inset-0 z-30 bg-black/60 backdrop-blur-sm flex justify-center p-4">
              <div className="w-full max-w-sm h-full relative">
                <button 
                  onClick={() => setActiveTab('')}
                  className="absolute -top-2 -right-2 z-40 w-10 h-10 bg-[#3e2723] border-[2px] border-[#1a0f0b] flex items-center justify-center text-[#a8a29e] hover:text-white hover:bg-[#4e342e] shadow-[inset_0_2px_0_rgba(255,255,255,0.1),_2px_2px_0_rgba(0,0,0,0.5)] active:translate-y-[2px] active:shadow-none transition-all rounded-full"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
                <LeftPanel sprites={sprites} />
              </div>
            </div>
          )}

          {activeTab === 'season' && (
            <div className="lg:hidden absolute inset-0 z-30 bg-black/60 backdrop-blur-sm flex justify-center p-4">
              <div className="w-full max-w-sm h-full relative">
                <button 
                  onClick={() => setActiveTab('')}
                  className="absolute -top-2 -right-2 z-40 w-10 h-10 bg-[#3e2723] border-[2px] border-[#1a0f0b] flex items-center justify-center text-[#a8a29e] hover:text-white hover:bg-[#4e342e] shadow-[inset_0_2px_0_rgba(255,255,255,0.1),_2px_2px_0_rgba(0,0,0,0.5)] active:translate-y-[2px] active:shadow-none transition-all rounded-full"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
                <RightPanel sprites={sprites} />
              </div>
            </div>
          )}
        </div>
        
        {/* Right Panel - Hidden on mobile, visible on lg+ */}
        <div className="hidden lg:flex h-full">
          <RightPanel sprites={sprites} />
        </div>
      </div>
      
      <BottomBar sprites={sprites} activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
