// ============================================================
// Damage Engine — Hit 1 Floor, Ceiling, TTK Average
// ============================================================
import { calculateBuildBuckets } from './bucketEngine.js';
import { calculateCritYield } from './critEngine.js';

/**
 * Gather all mechanic multipliers for a build.
 * Returns separate arrays for floor (immediate) and ceiling (max) multipliers.
 */
function gatherMechanics({ clan, spec, power, specRolls, powerRolls, enemyType, hitsToKill }) {
  const floorMechanics = [];
  const ceilingMechanics = [];
  const mechanicDetails = [];

  // --- CLAN MECHANICS ---
  if (clan?.mechanic) {
    const m = clan.mechanic;
    switch (m.type) {
      case 'nth_hit_multiplier':
        // Alter: 1.50x on 6th hit. Floor=1.0 (hit 1), Ceiling=1.50x
        ceilingMechanics.push(m.multiplier);
        mechanicDetails.push({
          source: `${clan.name} (Clan)`,
          floor: 1.0,
          ceiling: m.multiplier,
          description: m.description,
          type: m.type,
          nthHit: m.nthHit,
        });
        break;
      case 'conditional_multiplier':
        // Voldigoat: 1.25x when enemy <50% HP
        if (m.condition === 'enemy_below_50') {
          ceilingMechanics.push(m.multiplier);
          mechanicDetails.push({
            source: `${clan.name} (Clan)`,
            floor: 1.0,
            ceiling: m.multiplier,
            description: m.description,
            type: m.type,
          });
        }
        break;
      case 'scaling_multiplier':
        // Pride: scales from 1.0 to 1.20x
        ceilingMechanics.push(m.multiplierMax);
        mechanicDetails.push({
          source: `${clan.name} (Clan)`,
          floor: m.multiplierMin,
          ceiling: m.multiplierMax,
          description: m.description,
          type: m.type,
        });
        break;
      case 'timed_multiplier':
        // Espada: 1.20x for 6s every 10 abilities
        ceilingMechanics.push(m.multiplier);
        mechanicDetails.push({
          source: `${clan.name} (Clan)`,
          floor: 1.0,
          ceiling: m.multiplier,
          description: m.description,
          type: m.type,
        });
        break;
      case 'chance_multiplier':
        // Upper: 20% chance 1.25x
        ceilingMechanics.push(m.multiplier);
        mechanicDetails.push({
          source: `${clan.name} (Clan)`,
          floor: 1.0,
          ceiling: m.multiplier,
          description: m.description,
          type: m.type,
          chance: m.chance,
        });
        break;
    }
  }

  // --- SPEC MECHANICS ---
  if (spec?.mechanic) {
    const m = spec.mechanic;
    const rollValue = specRolls?.[m.statKey] ?? m.range?.max ?? 0;
    switch (m.type) {
      case 'execution_multiplier':
        // Executioner: 1.XX multiplier when enemy <50% HP
        const execMult = 1 + (rollValue / 100);
        ceilingMechanics.push(execMult);
        mechanicDetails.push({
          source: `${spec.name} (Spec)`,
          floor: 1.0,
          ceiling: execMult,
          description: `${m.description} (${rollValue}% → ${execMult.toFixed(4)}x)`,
          type: m.type,
        });
        break;
      case 'scaling_multiplier':
        // Rampage: scaling from base to cap
        const rampMax = 1 + (rollValue / 100);
        ceilingMechanics.push(rampMax);
        mechanicDetails.push({
          source: `${spec.name} (Spec)`,
          floor: 1.0,
          ceiling: rampMax,
          description: `${m.description} (${rollValue}% → ${rampMax.toFixed(4)}x)`,
          type: m.type,
        });
        break;
    }
  }

  // --- POWER MECHANICS ---
  if (power?.mechanic) {
    const m = power.mechanic;
    const rollValue = powerRolls?.[m.statKey] ?? m.range?.max ?? 0;
    switch (m.type) {
      case 'boss_multiplier':
        // Colossus: 1.XXx vs bosses
        if (enemyType === 'Boss') {
          const bossMult = 1 + (rollValue / 100);
          floorMechanics.push(bossMult);
          ceilingMechanics.push(bossMult);
          mechanicDetails.push({
            source: `${power.name} (Power)`,
            floor: bossMult,
            ceiling: bossMult,
            description: `${m.description} (${rollValue}% → ${bossMult.toFixed(4)}x)`,
            type: m.type,
          });
        } else {
          mechanicDetails.push({
            source: `${power.name} (Power)`,
            floor: 1.0,
            ceiling: 1.0,
            description: `${m.description} — DISABLED (Enemy is not Boss)`,
            type: m.type,
            disabled: true,
          });
        }
        break;
      case 'debuff_multiplier':
        // Cursebrand: debuff multiplier
        const debuffMult = 1 + (rollValue / 100);
        floorMechanics.push(debuffMult);
        ceilingMechanics.push(debuffMult);
        mechanicDetails.push({
          source: `${power.name} (Power)`,
          floor: debuffMult,
          ceiling: debuffMult,
          description: `${m.description} (${rollValue}% → ${debuffMult.toFixed(4)}x)`,
          type: m.type,
        });
        break;
    }
  }

  return { floorMechanics, ceilingMechanics, mechanicDetails };
}

/**
 * Calculate per-hit multiplier profile for TTK averaging.
 * Models ramp-up mechanics over N hits.
 */
function calculateHitProfile({ clan, spec, hitsToKill, baseMult, floorMechanicMult, ceilingMechanicMult, mechanicDetails }) {
  const hits = [];

  for (let hit = 1; hit <= hitsToKill; hit++) {
    let hitMult = baseMult;
    let hitMechanics = 1.0;

    for (const md of mechanicDetails) {
      if (md.disabled) continue;

      switch (md.type) {
        case 'nth_hit_multiplier':
          // Alter: activates on every Nth hit
          if (hit % (clan?.mechanic?.nthHit || 6) === 0) {
            hitMechanics *= md.ceiling;
          }
          break;

        case 'conditional_multiplier':
          // Voldigoat: activates when enemy crosses 50% HP threshold
          // Model: enemy crosses 50% at approximately hitsToKill/2
          if (hit >= Math.ceil(hitsToKill / 2)) {
            hitMechanics *= md.ceiling;
          }
          break;

        case 'execution_multiplier':
          // Executioner: same as conditional — activates in execution phase
          if (hit >= Math.ceil(hitsToKill / 2)) {
            hitMechanics *= md.ceiling;
          }
          break;

        case 'scaling_multiplier':
          // Pride/Rampage: linearly scales from floor to ceiling over hits
          const progress = Math.min(hit / hitsToKill, 1);
          const scaledMult = md.floor + (md.ceiling - md.floor) * progress;
          hitMechanics *= scaledMult;
          break;

        case 'boss_multiplier':
        case 'debuff_multiplier':
          // Constant multipliers — always active
          hitMechanics *= md.ceiling;
          break;

        case 'chance_multiplier':
          // Upper: use expected value (chance * multiplier + (1-chance) * 1.0)
          const expected = md.chance * md.ceiling + (1 - md.chance) * 1.0;
          hitMechanics *= expected;
          break;

        case 'timed_multiplier':
          // Espada: model as active 60% of the time (6/10 ratio)
          const uptime = 0.6;
          const timedExpected = uptime * md.ceiling + (1 - uptime) * 1.0;
          hitMechanics *= timedExpected;
          break;

        default:
          hitMechanics *= md.ceiling;
      }
    }

    hits.push({
      hit,
      baseMult,
      mechanicMult: hitMechanics,
      totalMult: baseMult * hitMechanics,
    });
  }

  return hits;
}

/**
 * Full damage calculation for a single build.
 *
 * @param {Object} config
 * @param {Object} config.clan
 * @param {Object} config.spec
 * @param {Object} config.power
 * @param {Object} config.specRolls - User's actual spec stat rolls
 * @param {Object} config.powerRolls - User's actual power stat rolls
 * @param {Object} config.critResult - Output from calculateCritYield()
 * @param {string} config.weaponType - 'Melee' | 'Sword'
 * @param {number} config.artifactDMG - Total artifact set DMG%
 * @param {string} config.enemyType - 'Boss' | 'Mob'
 * @param {number} config.hitsToKill - 1-20
 * @param {number} config.baseDamage - User's base damage %
 * @param {Object[]} config.customBuckets
 *
 * @returns {{ floor, ceiling, ttkAverage, bucketBreakdown, mechanicDetails, hitProfile }}
 */
export function calculateFullDamage({
  clan,
  spec,
  power,
  specRolls = {},
  powerRolls = {},
  critResult,
  weaponType = 'Melee',
  artifactDMG = 0,
  enemyType = 'Boss',
  hitsToKill = 10,
  baseDamage = 800,
  customBuckets = [],
}) {
  // 1. Calculate base buckets (Clan × Spec × Power × Artifact/Crit)
  const { buckets, totalMultiplier } = calculateBuildBuckets({
    clan,
    spec,
    power,
    specRolls,
    powerRolls,
    critYield: critResult.critYield,
    weaponType,
    artifactDMG,
    customBuckets,
  });

  // 2. Gather mechanic multipliers
  const { floorMechanics, ceilingMechanics, mechanicDetails } = gatherMechanics({
    clan, spec, power, specRolls, powerRolls, enemyType, hitsToKill,
  });

  const floorMechanicMult = floorMechanics.reduce((p, m) => p * m, 1);
  const ceilingMechanicMult = ceilingMechanics.reduce((p, m) => p * m, 1);

  // 3. Base Engine
  const baseEngine = 1 + (baseDamage / 100);

  // 4. Floor = BaseEngine × Buckets × FloorMechanics
  const floor = baseEngine * totalMultiplier * floorMechanicMult;

  // 5. Ceiling = BaseEngine × Buckets × CeilingMechanics
  const ceiling = baseEngine * totalMultiplier * ceilingMechanicMult;

  // 6. TTK Average = average multiplier across hit profile
  const hitProfile = calculateHitProfile({
    clan, spec, hitsToKill,
    baseMult: baseEngine * totalMultiplier,
    floorMechanicMult,
    ceilingMechanicMult,
    mechanicDetails,
  });

  const ttkAverage = hitProfile.reduce((sum, h) => sum + h.totalMult, 0) / hitProfile.length;

  // 7. Relative multiplier (divide out base engine for comparison)
  const relativeFloor = totalMultiplier * floorMechanicMult;
  const relativeCeiling = totalMultiplier * ceilingMechanicMult;
  const relativeTTK = ttkAverage / baseEngine;

  return {
    floor,
    ceiling,
    ttkAverage,
    relativeFloor,
    relativeCeiling,
    relativeTTK,
    baseEngine,
    bucketBreakdown: buckets,
    mechanicDetails,
    hitProfile,
    critResult,
  };
}
