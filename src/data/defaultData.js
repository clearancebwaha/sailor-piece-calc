// ============================================================
// Sailor Piece — Default Game Data Dictionary
// All values are sourced from Addendum 1-3 of the spec.
// This file is the DEFAULT state. The user can override via CRUD.
// ============================================================

export const DEFAULT_BASE_STATS = {
  baseCC: 27.0,
  baseCD: 97.5,
  hiddenCC: 5.0,
  hiddenCD: 50.0,
  // Computed baseline: CC=32%, CD=147.5%
};

export const DEFAULT_SUB_STAT_RANGES = {
  CC: { min: 6.0, max: 10.5, step: 0.1 },
  CD: { min: 11.0, max: 18.0, step: 0.1 },
  DMG: { min: 4.0, max: 9.0, step: 0.1 },
};

// ============================================================
// ARTIFACT SETS
// ============================================================
export const DEFAULT_ARTIFACT_SETS = {
  Abyssal: {
    id: 'Abyssal',
    name: 'Abyssal (God Set)',
    twoPiece: { CD: 20 },
    fourPiece: { DMG: 20, CC: 12.5, CD: 20 },
  },
  VoidReaver: {
    id: 'VoidReaver',
    name: 'Void Reaver',
    twoPiece: { DMG: 6.5 },
    fourPiece: { DMG: 6.5, CD: 15, CC: 12.5 },
  },
  Celestial: {
    id: 'Celestial',
    name: 'Celestial',
    twoPiece: { DMG: 15, CD: 12.5 },
    fourPiece: { DMG: 15, CD: 12.5, CC: 15 },
  },
};

// ============================================================
// ARTIFACT SLOTS
// ============================================================
export const DEFAULT_ARTIFACT_SLOTS = {
  Helmet: {
    mainStat: { type: 'HP', value: 0, label: 'HP (No DPS)' },
    mainStatOptions: null, // Fixed
    allowedSubs: ['DMG', 'CD', 'CC'],
  },
  Gloves: {
    mainStat: { type: 'DMG', value: 27.9, label: 'DMG 27.9%' },
    mainStatOptions: null, // Fixed
    allowedSubs: ['CD', 'CC'],
  },
  Boots: {
    mainStat: { type: 'DMG', value: 27.9, label: 'DMG 27.9%' },
    mainStatOptions: null, // Fixed
    allowedSubs: ['CD', 'CC'],
  },
  Body: {
    mainStat: { type: 'DMG', value: 27.9, label: 'DMG 27.9%' },
    mainStatOptions: [
      { type: 'DMG', value: 27.9, label: 'DMG 27.9%' },
      { type: 'CD', value: 59.7, label: 'CD 59.7%' },
      { type: 'CC', value: 30.6, label: 'CC 30.6%' },
    ],
    allowedSubs: ['CD', 'CC'], // Dynamic — changes based on selected main stat
  },
};

// ============================================================
// CLANS (Fixed Base Stats)
// ============================================================
export const DEFAULT_CLANS = {
  Voldigoat: {
    id: 'Voldigoat',
    name: 'Voldigoat',
    stats: { DMG: 25, HP: 35, Melee: 7, DMG_Reduc: 10 },
    mechanic: {
      type: 'conditional_multiplier',
      description: '1.25x Final Multiplier to NPC under 50% HP',
      multiplier: 1.25,
      condition: 'enemy_below_50',
    },
  },
  Monarch: {
    id: 'Monarch',
    name: 'Monarch',
    stats: { DMG: 27, HP: 40, Sword: 7, Luck: 10 },
    mechanic: null,
  },
  Pride: {
    id: 'Pride',
    name: 'Pride',
    stats: { DMG: 30, HP: 45, Sword: 10, Luck: 10 },
    mechanic: {
      type: 'scaling_multiplier',
      description: 'Up to 1.20x Final Multiplier Cap (0.002x per tick)',
      multiplierMin: 1.0,
      multiplierMax: 1.20,
      tickRate: 0.002,
    },
  },
  Espada: {
    id: 'Espada',
    name: 'Espada',
    stats: { DMG: 32, HP: 50, Sword: 10, Luck: 10 },
    mechanic: {
      type: 'timed_multiplier',
      description: '1.20x Final Multiplier for 6s every 10 abilities',
      multiplier: 1.20,
      trigger: 'every_10_abilities',
      duration: 6,
    },
  },
  Alter: {
    id: 'Alter',
    name: 'Alter',
    stats: { DMG: 35, HP: 50, Melee: 10, Luck: 12 },
    mechanic: {
      type: 'nth_hit_multiplier',
      description: '1.50x Final Multiplier on 6th ability',
      multiplier: 1.50,
      nthHit: 6,
    },
  },
  Eminence: {
    id: 'Eminence',
    name: 'Eminence',
    stats: { DMG: 35, HP: 55, Sword: 12, Luck: 12 },
    mechanic: null,
  },
  Upper: {
    id: 'Upper',
    name: 'Upper',
    stats: { DMG: 40, HP: 50, Melee: 12, Luck: 12 },
    mechanic: {
      type: 'chance_multiplier',
      description: '20% chance for 1.25x Final Multiplier for 8s',
      multiplier: 1.25,
      chance: 0.20,
      duration: 8,
    },
  },
  Frostbane: {
    id: 'Frostbane',
    name: 'Frostbane',
    stats: { DMG: 40, HP: 47, Sword: 10, Luck: 12 },
    mechanic: {
      type: 'scaling_multiplier',
      description: 'Up to 1.25x Final Multiplier Cap (0.00225x per tick)',
      multiplierMin: 1.0,
      multiplierMax: 1.25,
      tickRate: 0.00225,
    },
  },
};

// ============================================================
// RACES (Fixed Base Stats — Independent Multiplicative Bucket)
// ============================================================
export const DEFAULT_RACES = {
  Luckborn: {
    id: 'Luckborn',
    name: 'Luckborn',
    stats: { DMG: 80, HP: 90, Sword: 15, Melee: 15, Luck: 35 },
    mechanic: null,
  },
};

// ============================================================
// POWERS (RNG Stats with [min, max] ranges)
// ============================================================
export const DEFAULT_POWERS = {
  Cursebrand: {
    id: 'Cursebrand',
    name: 'Cursebrand',
    rarity: 'Mythical',
    stats: {
      DMG: { min: 18, max: 30 },
      HP: { min: 15, max: 30 },
      CC: { min: 2, max: 4 },
      CD: { min: 6, max: 12 },
    },
    mechanic: {
      type: 'debuff_multiplier',
      description: 'Debuff acts as isolated multiplier, stacks 2x max (multiplayer)',
      statKey: 'Mechanic_Debuff',
      range: { min: 10, max: 15 },
      maxStacks: 2,
    },
  },
  Colossus: {
    id: 'Colossus',
    name: 'Colossus',
    rarity: 'Mythical',
    stats: {
      DMG: { min: 20, max: 34 },
      HP: { min: 20, max: 35 },
      CC: { min: 1.5, max: 3 },
      CD: { min: 5, max: 10 },
      Luck: { min: 7.5, max: 15 },
    },
    mechanic: {
      type: 'boss_multiplier',
      description: 'Boss DMG acts as isolated multiplier unconditionally vs bosses',
      statKey: 'Mechanic_BossDMG',
      range: { min: 15, max: 25 },
    },
  },
  Apex: {
    id: 'Apex',
    name: 'Apex',
    rarity: 'Legendary',
    stats: {
      DMG: { min: 10, max: 20 },
      HP: { min: 10, max: 20 },
      CC: { min: 0.5, max: 1.5 },
      Luck: { min: 5, max: 12.5 },
    },
    mechanic: null,
  },
  Abyssal_Power: {
    id: 'Abyssal_Power',
    name: 'Abyssal Power',
    rarity: 'Legendary',
    stats: {
      DMG: { min: 14, max: 24 },
      HP: { min: 10, max: 20 },
      CC: { min: 1, max: 3 },
      CD: { min: 4, max: 8 },
    },
    mechanic: null,
  },
  Eternal: {
    id: 'Eternal',
    name: 'Eternal',
    rarity: 'Legendary',
    stats: {
      DMG: { min: 13, max: 22 },
      HP: { min: 14, max: 28 },
      CC: { min: 1, max: 3 },
      CD: { min: 5, max: 10 },
    },
    mechanic: null,
  },
};

// ============================================================
// SPEC PASSIVES (RNG Stats with [min, max] ranges)
// ============================================================
export const DEFAULT_SPECS = {
  Executioner: {
    id: 'Executioner',
    name: 'Executioner',
    rarity: 'Mythical',
    stats: {
      CC: { min: 2, max: 4 },
      CD: { min: 7.5, max: 15 },
    },
    mechanic: {
      type: 'execution_multiplier',
      description: 'Isolated multiplier to NPC under 50% HP',
      statKey: 'Mechanic_Execution',
      range: { min: 30, max: 45 },
    },
  },
  Rampage: {
    id: 'Rampage',
    name: 'Rampage',
    rarity: 'Mythical',
    stats: {
      DMG: { min: 15, max: 30 },
      CC: { min: 2, max: 4 },
      CD: { min: 5, max: 10 },
    },
    mechanic: {
      type: 'scaling_multiplier',
      description: 'Isolated scaling multiplier from 1.15x up to 1.30x',
      statKey: 'Mechanic_Cap',
      range: { min: 15, max: 30 },
    },
  },
  FortuneChosen: {
    id: 'FortuneChosen',
    name: 'Fortune Chosen',
    rarity: 'Mythical',
    stats: {
      DMG: { min: 5, max: 12.5 },
      Luck: { min: 5, max: 10 },
      DropChance: { min: 17.5, max: 30 },
    },
    mechanic: null,
  },
  Berserker: {
    id: 'Berserker',
    name: 'Berserker',
    rarity: 'Legendary',
    stats: {
      DMG: { min: 20, max: 30 },
      CD: { min: 5, max: 15 },
    },
    mechanic: null,
  },
  DamageV: {
    id: 'DamageV',
    name: 'Damage V',
    rarity: 'Common',
    stats: {
      DMG: { min: 25, max: 35 },
    },
    mechanic: null,
  },
  CritChanceV: {
    id: 'CritChanceV',
    name: 'Crit Chance V',
    rarity: 'Common',
    stats: {
      CC: { min: 2.5, max: 5 },
    },
    mechanic: null,
  },
  CritDamageV: {
    id: 'CritDamageV',
    name: 'Crit Damage V',
    rarity: 'Common',
    stats: {
      CD: { min: 8, max: 18 },
    },
    mechanic: null,
  },
  Eclipse: {
    id: 'Eclipse',
    name: 'Eclipse',
    rarity: 'Legendary',
    stats: {
      DMG: { min: 10, max: 20 },
      CC: { min: 2, max: 3.5 },
      Luck: { min: 5, max: 10 },
    },
    mechanic: null,
  },
};

// ============================================================
// GOD-TIER PRESETS
// ============================================================
export const DEFAULT_PRESETS = {
  AlterEngine: {
    id: 'AlterEngine',
    name: 'The Speedrun Nuke (Alter Engine)',
    shortName: 'Alter Engine',
    clan: 'Alter',
    spec: 'Berserker',
    power: 'Colossus',
    weaponType: 'Melee',
    description: 'Alter +35% DMG, +10% Melee, 1.50x on 6th hit | Berserker +30% DMG, +15% CD | Colossus +34% DMG, 1.25x Boss',
  },
  VoldigoatEngine: {
    id: 'VoldigoatEngine',
    name: 'The Executioner (Voldigoat Engine)',
    shortName: 'Voldigoat Engine',
    clan: 'Voldigoat',
    spec: 'Executioner',
    power: 'Colossus',
    weaponType: 'Melee',
    description: 'Voldigoat +25% DMG, +7% Melee, 1.25x <50% HP | Executioner +45% DMG <50% HP | Colossus 1.25x Boss',
  },
  FrostbaneEngine: {
    id: 'FrostbaneEngine',
    name: 'The Sustained God (Frostbane Engine)',
    shortName: 'Frostbane Engine',
    clan: 'Frostbane',
    spec: 'Rampage',
    power: 'Colossus',
    weaponType: 'Sword',
    description: 'Frostbane +40% DMG, +10% Sword, 1.25x cap | Rampage +30% DMG, +10% CD, 1.30x cap | Colossus 1.25x Boss',
  },
};

// ============================================================
// DEFAULT MULTIPLIER BUCKETS (Agnostic — user can add more)
// ============================================================
export const DEFAULT_MULTIPLIER_BUCKETS = [
  { id: 'clan', name: 'Clan', description: 'Clan base stats bucket' },
  { id: 'race', name: 'Race', description: 'Race base stats bucket' },
  { id: 'spec', name: 'Spec Passive', description: 'Spec passive stats bucket' },
  { id: 'power', name: 'Power', description: 'Power stats bucket' },
  { id: 'artifact', name: 'Artifact/Crit', description: 'Artifact set bonus + Crit Yield' },
];

// ============================================================
// Assemble full default state
// ============================================================
export function getDefaultGameData() {
  return {
    baseStats: { ...DEFAULT_BASE_STATS },
    subStatRanges: { ...DEFAULT_SUB_STAT_RANGES },
    artifactSets: { ...DEFAULT_ARTIFACT_SETS },
    artifactSlots: JSON.parse(JSON.stringify(DEFAULT_ARTIFACT_SLOTS)),
    clans: { ...DEFAULT_CLANS },
    races: { ...DEFAULT_RACES },
    powers: { ...DEFAULT_POWERS },
    specs: { ...DEFAULT_SPECS },
    presets: { ...DEFAULT_PRESETS },
    multiplierBuckets: [...DEFAULT_MULTIPLIER_BUCKETS],
  };
}
