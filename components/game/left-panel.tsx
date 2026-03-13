import { CheckCircle, Clock, Skull, Sword } from 'lucide-react';

export function LeftPanel({ sprites }: { sprites?: Record<string, HTMLImageElement> }) {
  return (
    <div className="w-full md:w-64 lg:w-72 h-full bg-[#2d1b14] border-[6px] md:border-l-0 md:border-y-0 border-[#1a0f0b] p-3 flex flex-col gap-4 z-10 shadow-[10px_0_20px_rgba(0,0,0,0.7)] overflow-y-auto relative" style={{
      backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h40v40H0V0zm20 20h20v20H20V20zM0 20h20v20H0V20zM20 0h20v20H20V0z\' fill=\'%231a0f0b\' fill-opacity=\'0.2\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")'
    }}>
      {/* Quests Panel */}
      <div className="bg-[#3e2723] border-[3px] border-[#1a0f0b] shadow-[inset_0_2px_0_rgba(255,255,255,0.1),_2px_2px_0_rgba(0,0,0,0.5)] relative">
        {/* Decorative corners */}
        <div className="absolute -left-1 -top-1 w-2 h-2 bg-[#d4af37] border border-[#000]"></div>
        <div className="absolute -right-1 -top-1 w-2 h-2 bg-[#d4af37] border border-[#000]"></div>
        
        <div className="bg-[#1a0f0b] px-3 py-1.5 border-b-[3px] border-[#1a0f0b] flex items-center justify-center relative">
          <div className="absolute left-2 w-1.5 h-1.5 bg-[#d4af37] rounded-full"></div>
          <div className="absolute right-2 w-1.5 h-1.5 bg-[#d4af37] rounded-full"></div>
          <span className="font-bold text-[#f3e5ab] text-sm tracking-widest uppercase" style={{ textShadow: '1px 1px 0 #000' }}>
            Quests
          </span>
        </div>
        
        <div className="p-3 flex flex-col gap-4 bg-[#e6d5b8] bg-opacity-10">
          {/* Quest 1 */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-[#f3e5ab] text-xs font-bold" style={{ textShadow: '1px 1px 0 #000' }}>
              <Skull size={14} className="text-[#a8a29e]" />
              Defeat 10 Enemies
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-[#1a0f0b] h-2 border border-[#000] relative">
                <div className="bg-[#43a047] h-full border-t border-[#81c784]" style={{ width: '10%' }}></div>
              </div>
              <span className="text-[#a8a29e] text-[10px] font-bold" style={{ textShadow: '1px 1px 0 #000' }}>1/10</span>
            </div>
          </div>
          
          {/* Quest 2 */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-[#f3e5ab] text-xs font-bold" style={{ textShadow: '1px 1px 0 #000' }}>
              <Sword size={14} className="text-[#43a047]" />
              Collect 9 Relics
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-[#1a0f0b] h-2 border border-[#000] relative">
                <div className="bg-[#43a047] h-full border-t border-[#81c784]" style={{ width: '88%' }}></div>
              </div>
              <span className="text-[#a8a29e] text-[10px] font-bold" style={{ textShadow: '1px 1px 0 #000' }}>8/9</span>
            </div>
          </div>
        </div>
      </div>

      {/* Idle Missions Panel */}
      <div className="bg-[#3e2723] border-[3px] border-[#1a0f0b] shadow-[inset_0_2px_0_rgba(255,255,255,0.1),_2px_2px_0_rgba(0,0,0,0.5)] relative mt-2">
        {/* Decorative corners */}
        <div className="absolute -left-1 -top-1 w-2 h-2 bg-[#d4af37] border border-[#000]"></div>
        <div className="absolute -right-1 -top-1 w-2 h-2 bg-[#d4af37] border border-[#000]"></div>
        
        <div className="bg-[#1a0f0b] px-3 py-1.5 border-b-[3px] border-[#1a0f0b] flex items-center justify-center relative">
          <div className="absolute left-2 w-1.5 h-1.5 bg-[#d4af37] rounded-full"></div>
          <div className="absolute right-2 w-1.5 h-1.5 bg-[#d4af37] rounded-full"></div>
          <span className="font-bold text-[#f3e5ab] text-sm tracking-widest uppercase" style={{ textShadow: '1px 1px 0 #000' }}>
            Idle Missions
          </span>
        </div>
        
        <div className="p-3 flex flex-col gap-3 items-center bg-[#e6d5b8] bg-opacity-10">
          {/* Chest Image Placeholder */}
          <div className="w-full h-24 bg-[#1a0f0b] border-[2px] border-[#000] flex items-center justify-center relative shadow-[inset_0_0_10px_rgba(0,0,0,0.8)]">
             <span className="text-4xl" style={{ textShadow: '2px 2px 0 #000' }}>💎📦</span>
             {/* Sparkles */}
             <div className="absolute top-2 left-4 w-1 h-1 bg-yellow-300 animate-ping"></div>
             <div className="absolute bottom-4 right-6 w-1 h-1 bg-blue-300 animate-ping" style={{ animationDelay: '0.5s' }}></div>
          </div>

          <div className="text-xs text-[#f3e5ab] flex items-center gap-1 font-bold" style={{ textShadow: '1px 1px 0 #000' }}>
            <Clock size={12} className="text-[#a8a29e]" /> Time: <span className="text-white">8h 08m</span>
          </div>
          
          <button className="w-full bg-[#f59e0b] hover:bg-[#d97706] active:translate-y-[2px] active:shadow-none text-[#2d1b14] font-black py-2 text-sm uppercase tracking-widest border-[3px] border-[#1a0f0b] shadow-[inset_0_2px_0_rgba(255,255,255,0.4),_0_4px_0_#1a0f0b] transition-all">
            Collect
          </button>
        </div>
      </div>
    </div>
  );
}
