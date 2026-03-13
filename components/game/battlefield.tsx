"use client";

import { useEffect, useRef } from 'react';
import { GameEngine, Entity, FloatingText, Drop } from '@/lib/game/GameEngine';

interface BattlefieldProps {
  engine: GameEngine;
  biome: any;
  sprites: Record<string, HTMLImageElement>;
}

export function Battlefield({ engine, biome, sprites }: BattlefieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      // Handle resize
      const parent = canvas.parentElement;
      if (parent) {
        if (canvas.width !== parent.clientWidth || canvas.height !== parent.clientHeight) {
          canvas.width = parent.clientWidth;
          canvas.height = parent.clientHeight;
        }
      }

      // Clear
      ctx.fillStyle = biome.bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2 - 100; // Offset slightly up

      // Draw Grid
      const tw = engine.tileWidth;
      const th = engine.tileHeight;

      const toScreen = (x: number, y: number) => {
        return {
          sx: cx + (x - y) * (tw / 2),
          sy: cy + (x + y) * (th / 2)
        };
      };

      // Draw base tiles
      for (let x = 0; x < engine.gridWidth; x++) {
        for (let y = 0; y < engine.gridHeight; y++) {
          const { sx, sy } = toScreen(x, y);
          
          const floorSprite = sprites['tile_floor'];
          if (floorSprite) {
            ctx.drawImage(floorSprite, sx - tw / 2, sy, tw, th);
          } else {
            // Draw isometric tile
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(sx + tw / 2, sy + th / 2);
            ctx.lineTo(sx, sy + th);
            ctx.lineTo(sx - tw / 2, sy + th / 2);
            ctx.closePath();
            
            ctx.fillStyle = biome.tileColor;
            ctx.fill();
            ctx.strokeStyle = biome.edgeColor;
            ctx.lineWidth = 1;
            ctx.stroke();
          }

          // Add some depth/elevation to tiles randomly to simulate ruins
          if ((x * 3 + y * 7) % 5 === 0) {
            const wallSprite = sprites['tile_wall'];
            if (wallSprite) {
              ctx.drawImage(wallSprite, sx - tw / 2, sy - th / 2, tw, th);
            } else {
              ctx.fillStyle = biome.edgeColor;
              ctx.beginPath();
              ctx.moveTo(sx - tw / 2, sy + th / 2);
              ctx.lineTo(sx, sy + th);
              ctx.lineTo(sx, sy + th + 10);
              ctx.lineTo(sx - tw / 2, sy + th / 2 + 10);
              ctx.closePath();
              ctx.fill();

              ctx.fillStyle = '#11111155';
              ctx.beginPath();
              ctx.moveTo(sx, sy + th);
              ctx.lineTo(sx + tw / 2, sy + th / 2);
              ctx.lineTo(sx + tw / 2, sy + th / 2 + 10);
              ctx.lineTo(sx, sy + th + 10);
              ctx.closePath();
              ctx.fill();
            }
          }
        }
      }

      // Sort entities by Y for depth sorting (isometric depth is x + y)
      const allEntities = [...engine.heroes, ...engine.enemies];
      allEntities.sort((a, b) => (a.pos.x + a.pos.y) - (b.pos.x + b.pos.y));

      // Draw Drops
      engine.drops.forEach(drop => {
        const { sx, sy } = toScreen(drop.pos.x, drop.pos.y);
        ctx.fillStyle = drop.type === 'gold' ? '#F1C40F' : '#3498DB';
        ctx.beginPath();
        ctx.arc(sx, sy + th / 2 - 5, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Draw Entities
      allEntities.forEach(entity => {
        let { sx, sy } = toScreen(entity.pos.x, entity.pos.y);
        
        // Add attack animation offset
        if (entity.attackAnim > 0) {
          const lunge = Math.sin(entity.attackAnim * Math.PI) * 10;
          const dir = entity.type === 'hero' ? 1 : -1;
          sx += dir * lunge;
          sy -= dir * lunge * 0.5; // Isometric offset
        }

        const size = entity.size * 16;
        const drawY = sy + th / 2 - size;

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath();
        ctx.ellipse(sx, sy + th / 2, size, size / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Body
        let baseType = entity.type === 'enemy' ? 'monster' : entity.type;
        let animSpriteId = `${baseType}_${entity.animState}`;
        
        // Check if we have a specific animation sprite sheet
        let img = sprites[animSpriteId];
        let isSpriteSheet = !!img;
        
        // Fallback to static sprite
        if (!img) {
          let spriteId = entity.spriteId;
          if (!sprites[spriteId]) {
            if (entity.type === 'enemy') spriteId = 'enemy_slime';
            else if (entity.type === 'boss') spriteId = 'boss_tier1';
          }
          img = sprites[spriteId];
          isSpriteSheet = false;
        }
        
        if (img) {
          ctx.save();
          ctx.translate(sx, drawY - size);
          
          // Flip enemies to face left
          if (entity.type !== 'hero') {
            ctx.scale(-1, 1);
          }
          
          const imgSize = size * 5; // Scale up the image
          
          if (isSpriteSheet) {
            // Sprite sheet is 4 frames horizontally
            const frameCount = 4;
            const frameWidth = img.width / frameCount;
            const frameHeight = img.height;
            
            // Calculate current frame based on animTime
            // Let's say animation loops every 600ms
            const animDuration = entity.animState === 'die' ? 1000 : 600;
            let frameIndex = Math.floor((entity.animTime % animDuration) / (animDuration / frameCount));
            
            // If dying, stop at the last frame
            if (entity.animState === 'die' && entity.animTime >= animDuration) {
              frameIndex = frameCount - 1;
            }
            
            ctx.drawImage(
              img, 
              frameIndex * frameWidth, 0, frameWidth, frameHeight, 
              -imgSize/2, -imgSize/2, imgSize, imgSize
            );
          } else {
            // Static image
            ctx.drawImage(img, -imgSize/2, -imgSize/2, imgSize, imgSize);
          }
          
          ctx.restore();
        } else {
          // Fallback shape
          ctx.fillStyle = entity.color;
          ctx.beginPath();
          ctx.arc(sx, drawY - size * 0.8, size * 0.6, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.fillRect(sx - size * 0.5, drawY - size * 0.2, size, size);
          ctx.strokeRect(sx - size * 0.5, drawY - size * 0.2, size, size);

          ctx.fillStyle = '#FFF';
          if (entity.type === 'hero') {
            ctx.fillRect(sx + size * 0.2, drawY - size, size * 0.2, size * 0.2);
          } else {
            ctx.fillRect(sx - size * 0.4, drawY - size, size * 0.2, size * 0.2);
          }
        }

        // HP Bar
        const hpPercent = Math.max(0, entity.hp / entity.maxHp);
        const barWidth = size * 2;
        const barHeight = 4;
        ctx.fillStyle = '#000';
        ctx.fillRect(sx - barWidth / 2, drawY - size * 1.8, barWidth, barHeight);
        ctx.fillStyle = entity.type === 'hero' ? '#2ECC71' : '#E74C3C';
        ctx.fillRect(sx - barWidth / 2, drawY - size * 1.8, barWidth * hpPercent, barHeight);
        
        // Boss label
        if (entity.type === 'boss') {
          ctx.font = 'bold 12px var(--font-pixel), "Courier New", monospace';
          ctx.fillStyle = '#F39C12';
          ctx.fillText('BOSS', sx - 14, drawY - size * 1.8 - 6);

          // Draw horns
          ctx.fillStyle = '#333';
          ctx.beginPath();
          ctx.moveTo(sx - size * 0.3, drawY - size * 1.2);
          ctx.lineTo(sx - size * 0.6, drawY - size * 1.8);
          ctx.lineTo(sx - size * 0.1, drawY - size * 1.3);
          ctx.fill();
          
          ctx.beginPath();
          ctx.moveTo(sx + size * 0.3, drawY - size * 1.2);
          ctx.lineTo(sx + size * 0.6, drawY - size * 1.8);
          ctx.lineTo(sx + size * 0.1, drawY - size * 1.3);
          ctx.fill();
        }
      });

      // Draw Floating Texts
      engine.floatingTexts.forEach(ft => {
        const { sx, sy } = toScreen(ft.pos.x, ft.pos.y);
        ctx.font = 'bold 16px var(--font-pixel), "Courier New", monospace';
        ctx.fillStyle = ft.color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeText(ft.text, sx, sy);
        ctx.fillText(ft.text, sx, sy);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [engine, biome, sprites]);

  return (
    <div className="absolute inset-0 w-full h-full">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-crosshair"
        style={{ imageRendering: 'pixelated' }}
      />
      {/* Vignette effect for dungeon atmosphere */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]"></div>
    </div>
  );
}
