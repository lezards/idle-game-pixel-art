import { Shield, Zap, TrendingUp, Star } from 'lucide-react';
import Image from 'next/image';

export function RightPanel({ sprites }: { sprites?: Record<string, HTMLImageElement> }) {
  return (
    <div className="w-full lg:w-64 xl:w-72 h-full bg-[#2d1b14] border-[6px] lg:border-r-0 lg:border-y-0 border-[#1a0f0b] p-3 flex flex-col gap-4 z-10 shadow-[-10px_0_20px_rgba(0,0,0,0.7)] overflow-y-auto relative" style={{
      backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h40v40H0V0zm20 20h20v20H20V20zM0 20h20v20H0V20zM20 0h20v20H20V0z\' fill=\'%231a0f0b\' fill-opacity=\'0.2\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")'
    }}>
      {/* Battle Pass Panel */}
      <div className="bg-[#3e2723] border-[3px] border-[#1a0f0b] shadow-[inset_0_2px_0_rgba(255,255,255,0.1),_2px_2px_0_rgba(0,0,0,0.5)] relative">
        {/* Decorative corners */}
        <div className="absolute -left-1 -top-1 w-2 h-2 bg-[#d4af37] border border-[#000]"></div>
        <div className="absolute -right-1 -top-1 w-2 h-2 bg-[#d4af37] border border-[#000]"></div>
        
        <div className="bg-[#1a0f0b] px-3 py-1.5 border-b-[3px] border-[#1a0f0b] flex items-center justify-center relative">
          <div className="absolute left-2 w-1.5 h-1.5 bg-[#d4af37] rounded-full"></div>
          <div className="absolute right-2 w-1.5 h-1.5 bg-[#d4af37] rounded-full"></div>
          <span className="font-bold text-[#f3e5ab] text-sm tracking-widest uppercase" style={{ textShadow: '1px 1px 0 #000' }}>
            Battle Pass
          </span>
        </div>
        
        <div className="p-3 flex flex-col gap-3 items-center bg-[#e6d5b8] bg-opacity-10">
          <div className="w-16 h-16 bg-[#1a0f0b] border-[3px] border-[#d4af37] flex items-center justify-center relative shadow-[2px_2px_0_0_rgba(0,0,0,0.8)]">
            <Image src="https://picsum.photos/seed/avatar/100/100" alt="Avatar" fill className="object-cover" style={{ imageRendering: 'pixelated' }} referrerPolicy="no-referrer" />
          </div>
          
          <div className="w-full flex flex-col gap-1">
            <div className="text-sm font-bold text-[#f3e5ab] text-center" style={{ textShadow: '1px 1px 0 #000' }}>Tier 18</div>
            <div className="flex items-center gap-2 w-full">
              <div className="flex-1 bg-[#1a0f0b] h-3 border border-[#000] relative">
                <div className="bg-[#43a047] h-full border-t border-[#81c784]" style={{ width: '33%' }}></div>
              </div>
            </div>
            <div className="text-[10px] text-[#a8a29e] text-right font-bold" style={{ textShadow: '1px 1px 0 #000' }}>
              60/180
            </div>
          </div>
        </div>
      </div>

      {/* Active Buffs Panel */}
      <div className="bg-[#3e2723] border-[3px] border-[#1a0f0b] shadow-[inset_0_2px_0_rgba(255,255,255,0.1),_2px_2px_0_rgba(0,0,0,0.5)] relative mt-2">
        {/* Decorative corners */}
        <div className="absolute -left-1 -top-1 w-2 h-2 bg-[#d4af37] border border-[#000]"></div>
        <div className="absolute -right-1 -top-1 w-2 h-2 bg-[#d4af37] border border-[#000]"></div>
        
        <div className="bg-[#1a0f0b] px-3 py-1.5 border-b-[3px] border-[#1a0f0b] flex items-center justify-center relative">
          <div className="absolute left-2 w-1.5 h-1.5 bg-[#d4af37] rounded-full"></div>
          <div className="absolute right-2 w-1.5 h-1.5 bg-[#d4af37] rounded-full"></div>
          <span className="font-bold text-[#f3e5ab] text-sm tracking-widest uppercase" style={{ textShadow: '1px 1px 0 #000' }}>
            Active Buffs
          </span>
        </div>
        
        <div className="p-3 flex flex-col gap-3 bg-[#e6d5b8] bg-opacity-10">
          <div className="flex items-center gap-3">
            <Star size={16} className="text-[#f59e0b] fill-[#f59e0b]" />
            <span className="text-xs text-[#f3e5ab] font-bold tracking-wide" style={{ textShadow: '1px 1px 0 #000' }}>XP Boost</span>
          </div>
          <div className="flex items-center gap-3">
            <Zap size={16} className="text-[#60a5fa] fill-[#60a5fa]" />
            <span className="text-xs text-[#f3e5ab] font-bold tracking-wide" style={{ textShadow: '1px 1px 0 #000' }}>Attack Up</span>
          </div>
          <div className="flex items-center gap-3">
            <Shield size={16} className="text-[#f59e0b] fill-[#f59e0b]" />
            <span className="text-xs text-[#f3e5ab] font-bold tracking-wide" style={{ textShadow: '1px 1px 0 #000' }}>Defense Aura</span>
          </div>
        </div>
      </div>
    </div>
  );
}
