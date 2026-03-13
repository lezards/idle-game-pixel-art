import { GameEngine } from '@/lib/game/GameEngine';
import { X } from 'lucide-react';

interface PetsScreenProps {
  engine: GameEngine;
  sprites: Record<string, HTMLImageElement>;
  onClose: () => void;
}

export function PetsScreen({ engine, sprites, onClose }: PetsScreenProps) {
  const petSlots = [
    { id: 'pet_fire', label: 'Ignis', element: 'Fire' },
    { id: 'pet_water', label: 'Aqua', element: 'Water' },
    { id: 'pet_earth', label: 'Terra', element: 'Earth' },
    { id: 'pet_wind', label: 'Aero', element: 'Wind' },
  ];

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
            Companions
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {petSlots.map((pet) => (
              <div key={pet.id} className="bg-[#3e2723] border-[3px] border-[#1a0f0b] p-4 flex flex-col items-center justify-center gap-2 shadow-[inset_0_2px_0_rgba(255,255,255,0.1),_4px_4px_0_rgba(0,0,0,0.5)] relative group">
                <div className="w-full flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-[#f3e5ab] uppercase tracking-widest" style={{ textShadow: '1px 1px 0 #000' }}>{pet.label}</span>
                  <span className="text-xs font-bold text-[#43a047] uppercase tracking-widest" style={{ textShadow: '1px 1px 0 #000' }}>{pet.element}</span>
                </div>
                
                <div className="w-24 h-24 bg-[#1a0f0b] border-[2px] border-[#d4af37] flex items-center justify-center mb-2 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)]">
                  {sprites[pet.id] ? (
                    <img 
                      src={sprites[pet.id].src} 
                      alt={pet.label} 
                      className="w-20 h-20 object-contain group-hover:-translate-y-2 transition-transform" 
                      style={{ imageRendering: 'pixelated' }}
                    />
                  ) : (
                    <div className="w-16 h-16 bg-[#2d1b14]" />
                  )}
                </div>
                
                <div className="w-full bg-[#1a0f0b] border-[2px] border-[#1a0f0b] h-4 relative mt-2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]">
                  <div className="absolute top-0 left-0 h-full bg-[#43a047] w-1/3"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white font-bold" style={{ textShadow: '1px 1px 0 #000' }}>
                    EXP 33%
                  </div>
                </div>
                
                <button className="w-full mt-2 py-2 px-2 text-xs font-black uppercase tracking-widest bg-[#2d1b14] hover:bg-[#4e342e] text-[#f3e5ab] border-[3px] border-[#1a0f0b] shadow-[inset_0_2px_0_rgba(255,255,255,0.1),_0_4px_0_#1a0f0b] active:translate-y-[4px] active:shadow-none transition-all">
                  Feed
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
