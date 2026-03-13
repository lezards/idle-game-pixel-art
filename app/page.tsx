"use client";

import { GameUI } from '@/components/game/game-ui';
import { AssetLoader } from '@/components/game/asset-loader';
import { AdminButton } from '@/components/admin/asset-admin';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0f111a] text-slate-200 font-pixel overflow-hidden">
      <AssetLoader>
        {(sprites, audio) => <GameUI sprites={sprites} audio={audio} />}
      </AssetLoader>
      <AdminButton />
    </main>
  );
}
