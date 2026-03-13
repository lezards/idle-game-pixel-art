import { GameEngine } from '@/lib/game/GameEngine';
import { X } from 'lucide-react';

interface HeroesScreenProps {
  engine: GameEngine;
  sprites: Record<string, HTMLImageElement>;
  onClose: () => void;
}

export function HeroesScreen({ engine, sprites, onClose }: HeroesScreenProps) {
  const heroes = engine.heroes;

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-4xl h-full max-h-[800px] bg-[#2d1b14] border-[6px] border-[#1a0f0b] flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h40v40H0V0zm20 20h20v20H20V20zM0 20h20v20H0V20zM20 0h20v20H20V0z\' fill=\'%231a0f0b\' fill-opacity=\'0.2\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")'
      }}>
        {/* Decorative corners */}
        <div className="absolute -left-2 -top-2 w-4 h-4 bg-[#d4af37] border-2 border-[#000]"></div>
        <div className="absolute -right-2 -top-2 w-4 h-4 bg-[#d4af37] border-2 border-[#000]"></div>
        <div className="absolute -left-2 -bottom-2 w-4 h-4 bg-[#d4af37] border-2 border-[#000]"></div>
        <div className="absolute -right-2 -bottom-2 w-4 h-4 bg-[#d4af37] border-2 border-[#000]"></div>

        {/* Header */}
        <div className="bg-[#1a0f0b] p-4 border-b-[4px] border-[#3e2723] flex justify-between items-center relative shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
          <h2 className="text-xl md:text-3xl font-bold text-[#f3e5ab] uppercase tracking-widest" style={{ textShadow: '2px 2px 0 #000' }}>
            Heroes Roster
          </h2>
          <button 
            onClick={onClose}
            className="w-10 h-10 bg-[#3e2723] border-[2px] border-[#1a0f0b] flex items-center justify-center text-[#a8a29e] hover:text-white hover:bg-[#4e342e] shadow-[inset_0_2px_0_rgba(255,255,255,0.1),_2px_2px_0_rgba(0,0,0,0.5)] active:translate-y-[2px] active:shadow-none transition-all"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#e6d5b8] bg-opacity-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {heroes.map((hero) => {
              const cost = Math.floor(100 * Math.pow(1.5, hero.level - 1));
              const canAfford = engine.gold >= cost;
              
              return (
                <div key={hero.id} className="bg-[#3e2723] border-[3px] border-[#1a0f0b] p-4 flex gap-4 shadow-[inset_0_2px_0_rgba(255,255,255,0.1),_4px_4px_0_rgba(0,0,0,0.5)] relative">
                  {/* Hero Portrait */}
                  <div className="w-20 h-20 bg-[#1a0f0b] border-[2px] border-[#d4af37] flex items-center justify-center shrink-0 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)]">
                    {sprites[hero.spriteId] ? (
                      <img 
                        src={sprites[hero.spriteId].src} 
                        alt={hero.class} 
                        className="w-16 h-16 object-contain" 
                        style={{ imageRendering: 'pixelated' }}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-[#2d1b14]" />
                    )}
                  </div>
                  
                  {/* Hero Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="text-lg font-bold text-[#f3e5ab] capitalize" style={{ textShadow: '1px 1px 0 #000' }}>
                          {hero.class}
                        </h3>
                        <span className="text-[#f59e0b] font-bold text-sm" style={{ textShadow: '1px 1px 0 #000' }}>Lv.{hero.level}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] md:text-xs text-[#a8a29e] mb-3 font-bold" style={{ textShadow: '1px 1px 0 #000' }}>
                        <div>HP: <span className="text-white">{Math.floor(hero.maxHp)}</span></div>
                        <div>DMG: <span className="text-white">{Math.floor(hero.damage)}</span></div>
                        <div>SPD: <span className="text-white">{(1000 / hero.attackSpeed).toFixed(1)}/s</span></div>
                        <div>RNG: <span className="text-white">{hero.range}</span></div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => engine.levelUpHero(hero.id)}
                      disabled={!canAfford}
                      className={`w-full py-2 px-2 text-xs font-black uppercase tracking-widest border-[3px] border-[#1a0f0b] transition-all ${
                        canAfford 
                          ? 'bg-[#43a047] hover:bg-[#4caf50] text-[#1a0f0b] shadow-[inset_0_2px_0_rgba(255,255,255,0.4),_0_4px_0_#1a0f0b] active:translate-y-[4px] active:shadow-none' 
                          : 'bg-[#2d1b14] text-[#a8a29e] cursor-not-allowed opacity-70'
                      }`}
                    >
                      Level Up ({cost}g)
                    </button>
                  </div>
                </div>
              );
            })}
            
            {/* Locked Slots */}
            {Array.from({ length: Math.max(0, 6 - heroes.length) }).map((_, i) => (
              <div key={`locked-${i}`} className="bg-[#2d1b14] border-[3px] border-[#1a0f0b] border-dashed p-4 flex items-center justify-center min-h-[140px] opacity-50">
                <span className="text-[#a8a29e] font-bold uppercase tracking-widest text-sm" style={{ textShadow: '1px 1px 0 #000' }}>Locked Slot</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
