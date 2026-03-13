import { Users, Sword, Cat, Scroll, Store } from 'lucide-react';

interface BottomBarProps {
  sprites?: Record<string, HTMLImageElement>;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomBar({ sprites, activeTab, onTabChange }: BottomBarProps) {
  const tabs = [
    { id: 'heroes', icon: <Users size={24} />, label: 'Heroes' },
    { id: 'gear', icon: <Sword size={24} />, label: 'Gear' },
    { id: 'pets', icon: <Cat size={24} />, label: 'Pets' },
    { id: 'missions', icon: <Scroll size={24} />, label: 'Missions' },
    { id: 'shop', icon: <Store size={24} />, label: 'Shop' },
  ];

  return (
    <div className="h-20 md:h-24 bg-[#2d1b14] border-t-[6px] border-[#1a0f0b] flex items-center justify-center gap-2 md:gap-6 px-2 md:px-4 shadow-[0_-10px_20px_rgba(0,0,0,0.7)] z-20 relative" style={{
      backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h40v40H0V0zm20 20h20v20H20V20zM0 20h20v20H0V20zM20 0h20v20H20V0z\' fill=\'%231a0f0b\' fill-opacity=\'0.2\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")'
    }}>
      {/* Decorative side elements */}
      <div className="hidden md:block absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#1a0f0b] border-[3px] border-[#3e2723] rounded-full flex items-center justify-center shadow-[inset_0_4px_8px_rgba(0,0,0,0.8)]">
        <div className="w-8 h-8 rounded-full border-2 border-[#d4af37] border-dashed animate-[spin_10s_linear_infinite]"></div>
      </div>
      <div className="hidden md:block absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#1a0f0b] border-[3px] border-[#3e2723] rounded-full flex items-center justify-center shadow-[inset_0_4px_8px_rgba(0,0,0,0.8)]">
        <div className="w-8 h-8 rounded-full border-2 border-[#d4af37] border-dashed animate-[spin_10s_linear_infinite_reverse]"></div>
      </div>

      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              relative flex flex-col items-center justify-center w-16 h-16 md:w-24 md:h-20
              border-[3px] transition-all
              ${isActive 
                ? 'bg-[#1a0f0b] border-[#d4af37] shadow-[inset_0_4px_8px_rgba(0,0,0,0.8),_0_0_10px_rgba(212,175,55,0.3)] -translate-y-2' 
                : 'bg-[#3e2723] border-[#1a0f0b] shadow-[inset_0_2px_0_rgba(255,255,255,0.1),_2px_2px_0_rgba(0,0,0,0.5)] hover:bg-[#4e342e] hover:-translate-y-1'}
            `}
          >
            {sprites && sprites['tile_ui_button'] && (
              <div 
                className="absolute inset-0 opacity-40 pointer-events-none mix-blend-overlay"
                style={{ 
                  backgroundImage: `url(${sprites['tile_ui_button'].src})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  imageRendering: 'pixelated'
                }}
              />
            )}

            {/* Corner dots for active state */}
            {isActive && (
              <>
                <div className="absolute -left-1 -top-1 w-1.5 h-1.5 bg-[#d4af37] border border-[#000]"></div>
                <div className="absolute -right-1 -top-1 w-1.5 h-1.5 bg-[#d4af37] border border-[#000]"></div>
                <div className="absolute -left-1 -bottom-1 w-1.5 h-1.5 bg-[#d4af37] border border-[#000]"></div>
                <div className="absolute -right-1 -bottom-1 w-1.5 h-1.5 bg-[#d4af37] border border-[#000]"></div>
              </>
            )}

            <div className={`relative z-10 mb-1 md:mb-2 ${isActive ? 'text-[#f59e0b]' : 'text-[#a8a29e]'}`}>
              {tab.icon}
            </div>
            <span className={`relative z-10 text-[10px] md:text-xs font-bold uppercase tracking-widest ${
              isActive ? 'text-[#f3e5ab]' : 'text-[#a8a29e]'
            }`} style={{ textShadow: '1px 1px 0 #000' }}>
              {tab.label}
            </span>

            {/* Notification Badge Example */}
            {tab.id === 'heroes' && !isActive && (
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 border-2 border-[#000] rounded-full flex items-center justify-center text-[10px] text-white font-bold shadow-[2px_2px_0_rgba(0,0,0,0.5)] z-20">
                1
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
