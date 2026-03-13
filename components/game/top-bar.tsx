import { Coins, Gem, Star, Settings, X, ShieldAlert } from 'lucide-react';
import Image from 'next/image';

interface TopBarProps {
  state: any;
  sprites?: Record<string, HTMLImageElement>;
  onToggleRightPanel?: () => void;
}

export function TopBar({ state, sprites, onToggleRightPanel }: TopBarProps) {
  return (
    <div className="h-16 md:h-20 bg-[#2d1b14] border-b-[6px] border-[#1a0f0b] flex items-center justify-between px-2 md:px-4 shadow-[0_10px_20px_rgba(0,0,0,0.7)] z-20 relative" style={{
      backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h40v40H0V0zm20 20h20v20H20V20zM0 20h20v20H0V20zM20 0h20v20H20V0z\' fill=\'%231a0f0b\' fill-opacity=\'0.2\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")'
    }}>
      {/* Left: Player Info */}
      <div className="flex items-center gap-2 md:gap-3 w-1/3">
        <div className="relative">
          <div className="w-10 h-10 md:w-14 md:h-14 bg-[#1a0f0b] border-[3px] border-[#d4af37] overflow-hidden flex items-center justify-center relative shadow-[2px_2px_0_0_rgba(0,0,0,0.8)]">
            <Image src="https://picsum.photos/seed/avatar/100/100" alt="Avatar" fill className="object-cover" style={{ imageRendering: 'pixelated' }} referrerPolicy="no-referrer" />
          </div>
        </div>
        <div className="flex flex-col">
          <div className="font-bold text-[#f3e5ab] text-sm md:text-lg tracking-wide" style={{ textShadow: '2px 2px 0 #000' }}>Player189</div>
          <div className="text-[10px] md:text-xs text-[#d4af37] flex items-center gap-2 font-bold" style={{ textShadow: '1px 1px 0 #000' }}>
            <span>Lv 49</span>
            <span className="text-[#a8a29e]">VIP3</span>
          </div>
        </div>
      </div>

      {/* Center: Floor Indicator */}
      <div className="flex items-center justify-center w-1/3">
        <div className="flex items-center gap-2 md:gap-3 bg-[#1a0f0b] px-4 md:px-8 py-1 md:py-2 border-[3px] border-[#3e2723] shadow-[inset_0_4px_8px_rgba(0,0,0,0.8),_0_2px_0_rgba(255,255,255,0.1)] rounded-sm relative">
          {/* Decorative corners */}
          <div className="absolute -left-1 -top-1 w-2 h-2 bg-[#d4af37] border border-[#000]"></div>
          <div className="absolute -right-1 -top-1 w-2 h-2 bg-[#d4af37] border border-[#000]"></div>
          <div className="absolute -left-1 -bottom-1 w-2 h-2 bg-[#d4af37] border border-[#000]"></div>
          <div className="absolute -right-1 -bottom-1 w-2 h-2 bg-[#d4af37] border border-[#000]"></div>

          <span className="text-[#a8a29e] text-xs md:text-base font-bold uppercase tracking-widest" style={{ textShadow: '1px 1px 0 #000' }}>Floor</span>
          <span className="text-[#f59e0b] font-bold text-lg md:text-2xl" style={{ textShadow: '2px 2px 0 #000' }}>{state.floor}</span>
          {state.isBossWave && <span className="text-red-500 text-xs md:text-sm font-bold ml-1 md:ml-2 animate-pulse" style={{ textShadow: '2px 2px 0 #000' }}>BOSS</span>}
        </div>
      </div>

      {/* Right: Currencies & Settings */}
      <div className="flex items-center justify-end gap-2 md:gap-4 w-1/3">
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-1">
            {sprites?.['ui_coin'] ? <img src={sprites['ui_coin'].src} alt="Coin" className="w-5 h-5" style={{ imageRendering: 'pixelated' }} /> : <Coins className="text-yellow-400" size={16} />}
            <span className="font-bold text-[#f3e5ab] text-sm" style={{ textShadow: '1px 1px 0 #000' }}>{Math.floor(state.gold).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            {sprites?.['ui_gem'] ? <img src={sprites['ui_gem'].src} alt="Gem" className="w-5 h-5" style={{ imageRendering: 'pixelated' }} /> : <Gem className="text-blue-400" size={16} />}
            <span className="font-bold text-[#f3e5ab] text-sm" style={{ textShadow: '1px 1px 0 #000' }}>{Math.floor(state.crystals).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            {sprites?.['ui_gem'] ? <img src={sprites['ui_gem'].src} alt="Ruby" className="w-5 h-5 hue-rotate-180" style={{ imageRendering: 'pixelated' }} /> : <Gem className="text-red-500" size={16} />}
            <span className="font-bold text-[#f3e5ab] text-sm" style={{ textShadow: '1px 1px 0 #000' }}>{Math.floor(state.rubies).toLocaleString()}</span>
          </div>
        </div>
        
        {/* Mobile compact view */}
        <div className="flex md:hidden items-center gap-2">
          <div className="flex items-center gap-1">
            <Coins className="text-yellow-400" size={14} />
            <span className="font-bold text-[#f3e5ab] text-xs" style={{ textShadow: '1px 1px 0 #000' }}>{Math.floor(state.gold)}</span>
          </div>
        </div>

        <div className="flex gap-1 md:gap-2">
          <button 
            onClick={onToggleRightPanel}
            className="lg:hidden w-8 h-8 md:w-10 md:h-10 bg-[#3e2723] border-[2px] border-[#1a0f0b] flex items-center justify-center text-[#d4af37] hover:text-white hover:bg-[#4e342e] shadow-[inset_0_2px_0_rgba(255,255,255,0.1),_2px_2px_0_rgba(0,0,0,0.5)] active:translate-y-[2px] active:shadow-none transition-all"
          >
            <Star size={16} className="md:w-5 md:h-5" />
          </button>
          <button className="w-8 h-8 md:w-10 md:h-10 bg-[#3e2723] border-[2px] border-[#1a0f0b] flex items-center justify-center text-[#a8a29e] hover:text-white hover:bg-[#4e342e] shadow-[inset_0_2px_0_rgba(255,255,255,0.1),_2px_2px_0_rgba(0,0,0,0.5)] active:translate-y-[2px] active:shadow-none transition-all">
            <Settings size={16} className="md:w-5 md:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
