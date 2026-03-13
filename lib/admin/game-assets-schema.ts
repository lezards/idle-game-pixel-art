export interface GameAssetSchema {
  id: string;
  name: string;
  category: string;
  description: string;
}

export const GAME_ASSETS_SCHEMA: GameAssetSchema[] = [
  // UI Elements
  { id: 'ui_coin', name: 'Gold Coin Icon', category: 'ui', description: 'Icon for the primary currency' },
  { id: 'ui_gem', name: 'Crystal Icon', category: 'ui', description: 'Icon for premium currency' },
  { id: 'ui_seal', name: 'Seal Icon', category: 'ui', description: 'Icon for mission seals' },
  { id: 'ui_potion', name: 'Potion Icon', category: 'ui', description: 'Icon for temporary buffs' },
  { id: 'ui_sword', name: 'Combat Item Icon', category: 'ui', description: 'Generic icon for combat equipment' },
  { id: 'ui_shield', name: 'Defense Item Icon', category: 'ui', description: 'Generic icon for defensive equipment' },
  { id: 'ui_ring', name: 'Efficiency Item Icon', category: 'ui', description: 'Generic icon for efficiency equipment' },
  
  // Heroes
  { id: 'hero_warrior', name: 'Warrior Class', category: 'character', description: 'Frontline tank, earth/fire elements' },
  { id: 'hero_archer', name: 'Archer Class', category: 'character', description: 'Ranged DPS, wind/fire elements' },
  { id: 'hero_mage', name: 'Mage Class', category: 'character', description: 'AoE magic damage, water/wind elements' },
  { id: 'hero_priest', name: 'Priest Class', category: 'character', description: 'Support and healer, water/earth elements' },
  { id: 'hero_assassin', name: 'Assassin Class', category: 'character', description: 'Boss burst damage, wind/fire elements' },
  { id: 'hero_summoner', name: 'Summoner Class', category: 'character', description: 'Economy and drops, earth/water elements' },
  
  // Enemies
  { id: 'enemy_slime', name: 'Slime', category: 'character', description: 'Basic early game enemy' },
  { id: 'enemy_goblin', name: 'Goblin', category: 'character', description: 'Fast early game enemy' },
  { id: 'enemy_skeleton', name: 'Skeleton', category: 'character', description: 'Resilient early game enemy' },
  { id: 'boss_tier1', name: 'Tier 1 Boss', category: 'character', description: 'Large imposing boss for floors 1-50' },
  
  // Buildings
  { id: 'bld_mint', name: 'Casa da Moeda', category: 'item', description: 'Building that multiplies gold generation' },
  { id: 'bld_blackmarket', name: 'Mercado Negro', category: 'item', description: 'Building for daily direct purchases' },
  { id: 'bld_forge', name: 'Forja Principal', category: 'item', description: 'Building for combat crafting' },
  { id: 'bld_atelier', name: 'Ateliê de Eficiência', category: 'item', description: 'Building for efficiency items' },
  { id: 'bld_lab', name: 'Laboratório de Fusão', category: 'item', description: 'Building for item fusion' },
  { id: 'bld_academy', name: 'Academia de Treinamento', category: 'item', description: 'Building for attribute training' },
  { id: 'bld_sanctuary', name: 'Santuário dos Pets', category: 'item', description: 'Building for pet management' },
  { id: 'bld_mine', name: 'Mina de Cristais', category: 'item', description: 'Building for premium currency generation' },
  
  // Pets
  { id: 'pet_fire', name: 'Fire Pet', category: 'character', description: 'Combat pet with fire affinity' },
  { id: 'pet_water', name: 'Water Pet', category: 'character', description: 'Combat pet with water affinity' },
  { id: 'pet_earth', name: 'Earth Pet', category: 'character', description: 'Efficiency pet with earth affinity' },
  { id: 'pet_wind', name: 'Wind Pet', category: 'character', description: 'Efficiency pet with wind affinity' },
  
  // Backgrounds
  { id: 'bg_tier1', name: 'Tier 1 Background', category: 'background', description: 'Background for floors 1-50, ancient ruins' },
  { id: 'bg_tier2', name: 'Tier 2 Background', category: 'background', description: 'Background for floors 51-100, ember fortress' },
  { id: 'bg_tier3', name: 'Tier 3 Background', category: 'background', description: 'Background for floors 101-150, frozen shrine' },
];
