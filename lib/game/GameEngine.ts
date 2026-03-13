export type Position = { x: number; y: number };
export type EntityType = 'hero' | 'enemy' | 'boss';
export type HeroClass = 'warrior' | 'archer' | 'mage';

export interface Entity {
  id: string;
  type: EntityType;
  class?: HeroClass;
  level: number;
  hp: number;
  maxHp: number;
  pos: Position;
  targetPos: Position | null;
  targetId: string | null;
  attackTimer: number;
  attackSpeed: number; // ms per attack
  damage: number;
  range: number;
  speed: number; // tiles per second
  color: string;
  isDead: boolean;
  size: number; // 1 for normal, 2 for boss
  attackAnim: number; // 0 to 1
  animState: 'idle' | 'walk' | 'attack' | 'cast' | 'heal' | 'die' | 'hurt';
  animTime: number;
  spriteId: string;
}

export interface FloatingText {
  id: string;
  text: string;
  pos: Position;
  color: string;
  createdAt: number;
  lifeTime: number;
}

export interface Drop {
  id: string;
  type: 'gold' | 'crystal';
  amount: number;
  pos: Position;
  createdAt: number;
}

export const BIOMES = [
  { name: 'Ancient Ruins Plateau', floorStart: 1, floorEnd: 50, tileColor: '#8B9B7B', edgeColor: '#5C6B4E', bgColor: '#2C3E50', hazardColor: '#A9DFBF' },
  { name: 'Ember Fortress', floorStart: 51, floorEnd: 100, tileColor: '#A04000', edgeColor: '#6E2C00', bgColor: '#17202A', hazardColor: '#E74C3C' },
  { name: 'Frozen Shrine', floorStart: 101, floorEnd: 150, tileColor: '#85C1E9', edgeColor: '#2E86C1', bgColor: '#1B4F72', hazardColor: '#D4E6F1' },
  { name: 'Storm Watchtower', floorStart: 151, floorEnd: 200, tileColor: '#F4D03F', edgeColor: '#B7950B', bgColor: '#18202A', hazardColor: '#F9E79F' },
  { name: 'Verdant Temple', floorStart: 201, floorEnd: 250, tileColor: '#2ECC71', edgeColor: '#1E8449', bgColor: '#145A32', hazardColor: '#ABEBC6' },
  { name: 'Abyssal Catacombs', floorStart: 251, floorEnd: 300, tileColor: '#8E44AD', edgeColor: '#5B2C6F', bgColor: '#4A235A', hazardColor: '#D2B4DE' },
  { name: 'Celestial Terrace', floorStart: 301, floorEnd: 350, tileColor: '#FDFEFE', edgeColor: '#BDC3C7', bgColor: '#7FB3D5', hazardColor: '#E5E8E8' },
  { name: 'Desert Relic Grounds', floorStart: 351, floorEnd: 400, tileColor: '#F5CBA7', edgeColor: '#CA6F1E', bgColor: '#935116', hazardColor: '#FAD7A1' },
  { name: 'Corrupted Iron Bastion', floorStart: 401, floorEnd: 450, tileColor: '#7F8C8D', edgeColor: '#424949', bgColor: '#1B2631', hazardColor: '#D5D8DC' },
  { name: 'Worldroot Summit', floorStart: 451, floorEnd: 500, tileColor: '#117A65', edgeColor: '#0B5345', bgColor: '#0E6251', hazardColor: '#A3E4D7' },
];

export class GameEngine {
  gridWidth = 12;
  gridHeight = 12;
  tileWidth = 64;
  tileHeight = 32;

  floor = 1;
  gold = 0;
  crystals = 0;
  rubies = 0;

  heroes: Entity[] = [];
  enemies: Entity[] = [];
  drops: Drop[] = [];
  floatingTexts: FloatingText[] = [];

  lastTime = 0;
  waveCount = 0;
  isBossWave = false;

  onStateChange?: (state: any) => void;
  onEvent?: (event: string, data?: any) => void;

  constructor() {
    this.initHeroes();
    this.spawnWave();
  }

  initHeroes() {
    this.heroes = [
      {
        id: 'h1', type: 'hero', class: 'warrior', level: 1, hp: 500, maxHp: 500,
        pos: { x: 2, y: 5 }, targetPos: null, targetId: null,
        attackTimer: 0, attackSpeed: 1000, damage: 50, range: 1.5, speed: 2, color: '#BDC3C7', isDead: false, size: 1, attackAnim: 0, animState: 'idle', animTime: 0, spriteId: 'hero_warrior'
      },
      {
        id: 'h2', type: 'hero', class: 'archer', level: 1, hp: 300, maxHp: 300,
        pos: { x: 1, y: 4 }, targetPos: null, targetId: null,
        attackTimer: 0, attackSpeed: 800, damage: 40, range: 4, speed: 2.5, color: '#27AE60', isDead: false, size: 1, attackAnim: 0, animState: 'idle', animTime: 0, spriteId: 'hero_archer'
      },
      {
        id: 'h3', type: 'hero', class: 'mage', level: 1, hp: 250, maxHp: 250,
        pos: { x: 1, y: 6 }, targetPos: null, targetId: null,
        attackTimer: 0, attackSpeed: 1500, damage: 80, range: 5, speed: 1.5, color: '#8E44AD', isDead: false, size: 1, attackAnim: 0, animState: 'idle', animTime: 0, spriteId: 'hero_mage'
      }
    ];
  }

  levelUpHero(heroId: string) {
    const hero = this.heroes.find(h => h.id === heroId);
    if (!hero) return;

    const cost = Math.floor(100 * Math.pow(1.5, hero.level - 1));
    if (this.gold >= cost) {
      this.gold -= cost;
      hero.level++;
      hero.maxHp *= 1.2;
      hero.hp = hero.maxHp;
      hero.damage *= 1.2;
      this.notifyStateChange();
    }
  }

  spawnWave() {
    this.waveCount++;
    this.isBossWave = this.waveCount % 5 === 0;
    
    if (this.isBossWave) {
      this.enemies = [{
        id: `boss_${Date.now()}`, type: 'boss', level: this.floor, hp: 2000 * this.floor, maxHp: 2000 * this.floor,
        pos: { x: 9, y: 5 }, targetPos: null, targetId: null,
        attackTimer: 0, attackSpeed: 2000, damage: 150 * this.floor, range: 2, speed: 1, color: '#C0392B', isDead: false, size: 2, attackAnim: 0, animState: 'idle', animTime: 0, spriteId: `boss_floor_${this.floor}`
      }];
    } else {
      const numEnemies = 3 + Math.floor(Math.random() * 3);
      this.enemies = Array.from({ length: numEnemies }).map((_, i) => ({
        id: `e_${Date.now()}_${i}`, type: 'enemy', level: this.floor, hp: 100 * this.floor, maxHp: 100 * this.floor,
        pos: { x: 9 + Math.random() * 2, y: 2 + Math.random() * 6 }, targetPos: null, targetId: null,
        attackTimer: 0, attackSpeed: 1200, damage: 20 * this.floor, range: 1.5, speed: 1.5, color: '#E67E22', isDead: false, size: 1, attackAnim: 0, animState: 'idle', animTime: 0, spriteId: `enemy_floor_${this.floor}`
      }));
    }
  }

  update(dt: number) {
    this.updateEntities(this.heroes, this.enemies, dt);
    this.updateEntities(this.enemies, this.heroes, dt);

    // Clean up dead entities
    const deadEnemies = this.enemies.filter(e => e.isDead);
    deadEnemies.forEach(e => {
      this.addDrop(e.pos, e.type === 'boss' ? 'crystal' : 'gold', e.type === 'boss' ? 10 * this.floor : 5 * this.floor);
    });

    this.enemies = this.enemies.filter(e => !e.isDead);
    
    // Revive heroes if all dead (simple wipe mechanic)
    if (this.heroes.every(h => h.isDead)) {
      this.initHeroes();
      this.floor = Math.max(1, this.floor - 1);
      this.waveCount = 0;
      this.spawnWave();
      this.notifyStateChange();
    }

    // Next wave
    if (this.enemies.length === 0) {
      if (this.isBossWave) {
        this.floor++;
      }
      this.spawnWave();
      this.notifyStateChange();
    }

    // Update floating texts
    this.floatingTexts = this.floatingTexts.filter(ft => Date.now() - ft.createdAt < ft.lifeTime);
    this.floatingTexts.forEach(ft => {
      ft.pos.y -= dt * 0.001; // float up
    });

    // Auto collect drops after 2 seconds
    const now = Date.now();
    this.drops.forEach(d => {
      if (now - d.createdAt > 2000) {
        if (d.type === 'gold') this.gold += d.amount;
        if (d.type === 'crystal') this.crystals += d.amount;
        
        if (this.onEvent) {
          this.onEvent('collect', { type: d.type });
        }
      }
    });
    const collectedCount = this.drops.filter(d => now - d.createdAt > 2000).length;
    this.drops = this.drops.filter(d => now - d.createdAt <= 2000);
    
    if (collectedCount > 0) {
      this.notifyStateChange();
    }
  }

  updateEntities(team: Entity[], opponents: Entity[], dt: number) {
    team.forEach(entity => {
      if (entity.isDead) return;

      entity.animTime += dt;
      let isMoving = false;

      entity.attackTimer -= dt;
      if (entity.attackAnim > 0) {
        entity.attackAnim -= dt / 200; // 200ms animation
      }

      // Find target
      let target: Entity | undefined = opponents.find(o => o.id === entity.targetId && !o.isDead);
      if (!target) {
        // Find closest
        let minDist = Infinity;
        let closest: Entity | undefined;
        for (const o of opponents) {
          if (o.isDead) continue;
          const dist = this.getDist(entity.pos, o.pos);
          if (dist < minDist) {
            minDist = dist;
            closest = o;
          }
        }
        target = closest;
        if (target) entity.targetId = target.id;
      }

      if (target) {
        const dist = this.getDist(entity.pos, target.pos);
        if (dist <= entity.range) {
          // Attack
          if (entity.attackTimer <= 0) {
            entity.attackTimer = entity.attackSpeed;
            entity.attackAnim = 1;
            entity.animState = entity.class === 'mage' ? 'cast' : 'attack';
            entity.animTime = 0;
            
            if (this.onEvent) {
              this.onEvent('attack', { entity });
            }

            target.hp -= entity.damage;
            this.addFloatingText(target.pos, `${entity.damage}`, entity.type === 'hero' ? '#FFF' : '#F00');
            if (target.hp <= 0) {
              target.isDead = true;
              target.animState = 'die';
              target.animTime = 0;
              entity.targetId = null;
              
              if (this.onEvent) {
                this.onEvent('die', { entity: target });
              }
            } else {
              target.animState = 'hurt';
              target.animTime = 0;
            }
          }
        } else {
          // Move towards target
          const dx = target.pos.x - entity.pos.x;
          const dy = target.pos.y - entity.pos.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          const moveDist = (entity.speed * dt) / 1000;
          
          isMoving = true;
          if (len > moveDist) {
            entity.pos.x += (dx / len) * moveDist;
            entity.pos.y += (dy / len) * moveDist;
          } else {
            entity.pos.x = target.pos.x;
            entity.pos.y = target.pos.y;
          }
        }
      } else {
        // Return to starting pos if hero
        if (entity.type === 'hero') {
           // Simple return logic could go here
        }
      }

      // Update animState based on action
      if (entity.attackAnim <= 0 && entity.animState !== 'die') {
        if (isMoving) {
          if (entity.animState !== 'walk') {
            entity.animState = 'walk';
            entity.animTime = 0;
          }
        } else {
          if (entity.animState !== 'idle' && entity.animState !== 'hurt') {
            entity.animState = 'idle';
            entity.animTime = 0;
          }
          // Reset hurt state after a short time
          if (entity.animState === 'hurt' && entity.animTime > 300) {
            entity.animState = 'idle';
            entity.animTime = 0;
          }
        }
      }
    });
  }

  getDist(p1: Position, p2: Position) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  }

  addFloatingText(pos: Position, text: string, color: string) {
    this.floatingTexts.push({
      id: `ft_${Date.now()}_${Math.random()}`,
      text,
      pos: { x: pos.x, y: pos.y - 0.5 },
      color,
      createdAt: Date.now(),
      lifeTime: 1000
    });
  }

  addDrop(pos: Position, type: 'gold' | 'crystal', amount: number) {
    this.drops.push({
      id: `drop_${Date.now()}_${Math.random()}`,
      type,
      amount,
      pos: { x: pos.x + (Math.random() - 0.5), y: pos.y + (Math.random() - 0.5) },
      createdAt: Date.now()
    });
  }

  notifyStateChange() {
    if (this.onStateChange) {
      this.onStateChange({
        floor: this.floor,
        gold: this.gold,
        crystals: this.crystals,
        rubies: this.rubies,
        isBossWave: this.isBossWave
      });
    }
  }

  getBiome() {
    const biomeIndex = Math.floor((this.floor - 1) / 50) % BIOMES.length;
    return BIOMES[biomeIndex];
  }
}
