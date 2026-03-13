# Arquitetura de Assets do Jogo

Este arquivo é o MESTRE de todos os assets necessários para o jogo. O Asset Forge lê este arquivo para saber o que precisa ser gerado.

## Personagens (Heroes)
- `hero_warrior`: Frontline tank, earth/fire elements. Estilo medieval, armadura pesada.
- `hero_archer`: Ranged DPS, wind/fire elements. Estilo medieval, arco de madeira, roupas leves.
- `hero_mage`: AoE magic damage, water/wind elements. Estilo medieval, cajado brilhante, manto azul.
- `hero_priest`: Support and healer, water/earth elements. Estilo medieval, livro sagrado, manto branco.
- `hero_assassin`: Boss burst damage, wind/fire elements. Estilo medieval, adagas duplas, capuz escuro.

## Inimigos (Monsters)
- `enemy_slime`: Basic early game enemy. Gosma verde translúcida.
- `enemy_goblin`: Fast early game enemy. Goblin verde com adaga enferrujada.
- `enemy_skeleton`: Resilient early game enemy. Esqueleto com espada quebrada.
- `boss_tier1`: Large imposing boss for floors 1-50. Cavaleiro negro gigante com machado.

## Animações (Sprite Sheets)
- `anim_warrior_idle`: 4 frames, respirando, parado.
- `anim_warrior_attack`: 4 frames, atacando com a espada.
- `anim_slime_idle`: 4 frames, pulsando.
- `anim_slime_die`: 4 frames, derretendo.

## Tiles (Cenários)
- `tile_floor_stone`: Chão de pedra de masmorra medieval.
- `tile_wall_stone`: Parede de pedra de masmorra medieval.
- `tile_floor_wood`: Chão de madeira de taverna.
- `tile_water`: Água animada ou estática para rios.

## UI (Interface)
- `ui_coin`: Moeda de ouro brilhante.
- `ui_gem`: Gema azul brilhante.
- `ui_button_wood`: Botão de madeira com bordas de metal.
- `ui_panel_stone`: Painel de pedra esculpida.

## Áudio (Efeitos e Músicas)
- `bgm_dungeon`: Música de fundo para a masmorra, sombria e épica.
- `sfx_sword_hit`: Som de espada batendo em armadura.
- `sfx_coin_pickup`: Som de moeda sendo coletada.
- `sfx_level_up`: Som de subida de nível, triunfante.
