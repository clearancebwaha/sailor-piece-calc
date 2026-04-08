// ============================================================
// Bucket Engine — Agnostic multiplicative bucket system
// ============================================================

/**
 * Build a single bucket's multiplier from additive stats within it.
 * e.g., Clan DMG 35% + Clan Melee 10% → bucket multiplier = 1.45
 *
 * @param {number[]} additiveStats - Array of percentage values to sum
 * @returns {number} The bucket multiplier (1 + sum/100)
 */
export function buildBucketMultiplier(additiveStats) {
  const sum = additiveStats.reduce((acc, val) => acc + (val || 0), 0);
  return 1 + (sum / 100);
}

/**
 * Multiply all buckets together.
 * @param {number[]} multipliers - Array of bucket multipliers
 * @returns {number} Total multiplicative product
 */
export function multiplyBuckets(multipliers) {
  return multipliers.reduce((product, m) => product * m, 1);
}

/**
 * Build the full damage multiplier from a build configuration.
 *
 * @param {Object} buildConfig
 * @param {Object} buildConfig.clan - Selected clan object
 * @param {Object} buildConfig.spec - Selected spec object
 * @param {Object} buildConfig.power - Selected power object
 * @param {Object} buildConfig.specRolls - User's actual spec stat rolls
 * @param {Object} buildConfig.powerRolls - User's actual power stat rolls
 * @param {number} buildConfig.critYield - From crit engine
 * @param {string} buildConfig.weaponType - 'Melee' or 'Sword'
 * @param {number} buildConfig.artifactDMG - Total artifact DMG% (set bonuses + main stats)
 * @param {Object[]} buildConfig.customBuckets - Additional custom buckets [{name, multiplier}]
 *
 * @returns {{ buckets: Object[], totalMultiplier: number }}
 */
export function calculateBuildBuckets({
  clan,
  race,
  spec,
  power,
  specRolls = {},
  powerRolls = {},
  critYield = 1,
  weaponType = 'Melee',
  artifactDMG = 0,
  customBuckets = [],
}) {
  const buckets = [];

  // --- CLAN BUCKET ---
  if (clan) {
    const clanDMG = clan.stats?.DMG || 0;
    const clanWeapon = weaponType === 'Melee'
      ? (clan.stats?.Melee || 0)
      : (clan.stats?.Sword || 0);
    const clanBucket = buildBucketMultiplier([clanDMG, clanWeapon]);
    buckets.push({
      name: 'Clan',
      entity: clan.name,
      multiplier: clanBucket,
      breakdown: `DMG ${clanDMG}% + ${weaponType} ${clanWeapon}% = ${clanBucket.toFixed(4)}x`,
    });
  }

  // --- RACE BUCKET ---
  if (race) {
    const raceDMG = race.stats?.DMG || 0;
    const raceWeapon = weaponType === 'Melee'
      ? (race.stats?.Melee || 0)
      : (race.stats?.Sword || 0);
    const raceBucket = buildBucketMultiplier([raceDMG, raceWeapon]);
    buckets.push({
      name: 'Race',
      entity: race.name,
      multiplier: raceBucket,
      breakdown: `DMG ${raceDMG}% + ${weaponType} ${raceWeapon}% = ${raceBucket.toFixed(4)}x`,
    });
  }

  // --- SPEC BUCKET ---
  if (spec) {
    const specDMG = specRolls.DMG ?? spec.stats?.DMG?.max ?? spec.stats?.DMG ?? 0;
    const specBucket = buildBucketMultiplier([specDMG]);
    buckets.push({
      name: 'Spec',
      entity: spec.name,
      multiplier: specBucket,
      breakdown: `DMG ${specDMG}% = ${specBucket.toFixed(4)}x`,
    });
  }

  // --- POWER BUCKET ---
  if (power) {
    const powerDMG = powerRolls.DMG ?? power.stats?.DMG?.max ?? power.stats?.DMG ?? 0;
    const powerBucket = buildBucketMultiplier([powerDMG]);
    buckets.push({
      name: 'Power',
      entity: power.name,
      multiplier: powerBucket,
      breakdown: `DMG ${powerDMG}% = ${powerBucket.toFixed(4)}x`,
    });
  }

  // --- ARTIFACT / CRIT BUCKET ---
  // Artifact DMG goes into a separate additive pool, then multiplied by crit yield
  const artifactBucket = buildBucketMultiplier([artifactDMG]);
  const critBucket = critYield;
  buckets.push({
    name: 'Artifact',
    entity: 'Set + Crit',
    multiplier: artifactBucket * critBucket,
    breakdown: `ArtifactDMG ${artifactDMG}% (${artifactBucket.toFixed(4)}x) × CritYield ${critBucket.toFixed(4)}x`,
  });

  // --- CUSTOM BUCKETS ---
  for (const cb of customBuckets) {
    buckets.push({
      name: cb.name,
      entity: 'Custom',
      multiplier: cb.multiplier,
      breakdown: `Custom ${cb.multiplier.toFixed(4)}x`,
    });
  }

  const totalMultiplier = multiplyBuckets(buckets.map(b => b.multiplier));

  return { buckets, totalMultiplier };
}

/**
 * Grade a user's RNG roll against the possible range.
 * @returns {{ value, min, max, percentage, grade }}
 */
export function gradeRoll(value, min, max) {
  if (max === min) return { value, min, max, percentage: 100, grade: 'MAX' };
  const percentage = ((value - min) / (max - min)) * 100;
  let grade;
  if (percentage >= 95) grade = 'GOD ROLL';
  else if (percentage >= 80) grade = 'EXCELLENT';
  else if (percentage >= 60) grade = 'GOOD';
  else if (percentage >= 40) grade = 'AVERAGE';
  else if (percentage >= 20) grade = 'BELOW AVG';
  else grade = 'TRASH';
  return { value, min, max, percentage: Math.round(percentage * 10) / 10, grade };
}
