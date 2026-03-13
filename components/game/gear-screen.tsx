import { GameEngine } from '@/lib/game/GameEngine';
import { X } from 'lucide-react';

interface GearScreenProps {
  engine: GameEngine;
  sprites: Record<string, HTMLImageElement>;
  onClose: () => void;
}

export function GearScreen({ engine, sprites, onClose }: GearScreenProps) {
  const equipmentSlots = [
    { id: 'weapon', label: 'Weapon', iconId: 'ui_sword' },
    { id: 'armor', label: 'Armor', iconId: 'ui_shield' },
    { id: 'accessory', label: 'Accessory', iconId: 'ui_ring' },
    { id: 'artifact', label: 'Artifact', iconId: 'ui_potion' },
  ];

  // We'll also show any dynamically generated equipment like eq_wood_sword
  const dynamicEquipment = Object.keys(sprites).filter(id => id.startsWith('eq_'));

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
            Equipment
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {equipmentSlots.map((slot) => (
              <div key={slot.id} className="bg-[#3e2723] border-[3px] border-[#1a0f0b] p-4 flex flex-col items-center justify-center gap-2 shadow-[inset_0_2px_0_rgba(255,255,255,0.1),_4px_4px_0_rgba(0,0,0,0.5)] relative group cursor-pointer hover:bg-[#4e342e] transition-colors">
                <div className="text-xs text-[#a8a29e] font-bold uppercase tracking-widest mb-2" style={{ textShadow: '1px 1px 0 #000' }}>{slot.label}</div>
                <div className="w-16 h-16 bg-[#1a0f0b] border-[2px] border-[#d4af37] flex items-center justify-center shadow-[inset_0_0_10px_rgba(0,0,0,0.8)]">
                  {sprites[slot.iconId] ? (
                    <img 
                      src={sprites[slot.iconId].src} 
                      alt={slot.label} 
                      className="w-12 h-12 object-contain group-hover:scale-110 transition-transform" 
                      style={{ imageRendering: 'pixelated' }}
                    />
                  ) : (
                    <div className="w-8 h-8 bg-[#2d1b14]" />
                  )}
                </div>
                <div className="text-sm text-[#f59e0b] font-bold mt-2" style={{ textShadow: '1px 1px 0 #000' }}>Lv. 1</div>
              </div>
            ))}
          </div>

          {dynamicEquipment.length > 0 && (
            <>
              <h3 className="text-xl font-bold text-[#f3e5ab] mb-4 uppercase tracking-widest" style={{ textShadow: '2px 2px 0 #000' }}>
                Inventory
              </h3>
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {dynamicEquipment.map(id => (
                  <div key={id} className="bg-[#3e2723] border-[3px] border-[#1a0f0b] p-2 flex flex-col items-center justify-center gap-1 shadow-[inset_0_2px_0_rgba(255,255,255,0.1),_2px_2px_0_rgba(0,0,0,0.5)] cursor-pointer hover:bg-[#4e342e] transition-colors" title={id}>
                    <div className="w-12 h-12 bg-[#1a0f0b] border-[2px] border-[#d4af37] flex items-center justify-center shadow-[inset_0_0_10px_rgba(0,0,0,0.8)]">
                      <img 
                        src={sprites[id].src} 
                        alt={id} 
                        className="w-10 h-10 object-contain" 
                        style={{ imageRendering: 'pixelated' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
