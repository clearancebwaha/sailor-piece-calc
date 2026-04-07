// ============================================================
// Verdict Engine — Logic Gates & Build Comparison
// ============================================================

/**
 * Run all logic gates and produce the absolute verdict.
 *
 * @param {Object} params
 * @param {Object} params.results - { AlterEngine, VoldigoatEngine, PrideEngine, Custom? }
 * @param {string} params.enemyType - 'Boss' | 'Mob'
 * @param {number} params.hitsToKill - 1-20
 * @param {number} params.timeBetweenEnemies - seconds
 * @param {Object} params.critResult - Crit engine output
 *
 * @returns {{ winner, reasoning, warnings[], disabledBuilds[], swapSuggestions[] }}
 */
export function calculateVerdict({
  results = {},
  enemyType = 'Boss',
  hitsToKill = 10,
  timeBetweenEnemies = 3,
  critResult = {},
}) {
  const warnings = [];
  const disabledBuilds = [];
  const reasoning = [];
  let winner = null;
  let winnerKey = null;

  // ---- WARNING: CC < 100% ----
  if (critResult.hasWarning) {
    warnings.push({
      type: 'STAT_TRAP',
      severity: 'critical',
      message: `STAT TRAP: RNG DETECTED. Your CC is ${critResult.totalCC.toFixed(1)}% (${critResult.ccDeficit.toFixed(1)}% short of 100%). DO NOT EQUIP CD BODY. Your DPS has uncontrollable variance.`,
    });
  }

  // ---- LOGIC GATE 1: Mob Mode ----
  if (enemyType === 'Mob') {
    warnings.push({
      type: 'MOB_MODE',
      severity: 'info',
      message: 'MOB MODE: Colossus Boss DMG multiplier is DISABLED. Consider Cursebrand (1.15x debuff) instead.',
    });
    reasoning.push('Enemy is Mob — Colossus Boss DMG inactive. Cursebrand suggested.');
  }

  // ---- LOGIC GATE 4: Pride Stack Reset ----
  if (timeBetweenEnemies > 5) {
    disabledBuilds.push('PrideEngine');
    warnings.push({
      type: 'STACK_RESET',
      severity: 'warning',
      message: `PRIDE ENGINE DISABLED: Time between enemies (${timeBetweenEnemies}s) exceeds 5s. Rampage stacks reset. Pride cannot sustain its multiplier.`,
    });
    reasoning.push(`Time between enemies (${timeBetweenEnemies}s) > 5s — Pride Engine stacks reset, build disabled.`);
  }

  // ---- LOGIC GATE 2: TTK <= 3 → Alter Wins ----
  if (hitsToKill <= 3) {
    winnerKey = 'AlterEngine';
    winner = 'The Speedrun Nuke (Alter Engine)';
    reasoning.push(
      `TTK ≤ 3 hits — Alter Engine is the ABSOLUTE WINNER.`,
      `At ${hitsToKill} hits, Voldigoat cannot effectively trigger its 50% HP threshold.`,
      `Alter's raw stat pool (35% DMG + 10% Melee) dominates in instant-kill scenarios.`,
      `The 1.50x 6th-hit multiplier doesn't apply at this TTK, but the base stat advantage is unbeatable.`,
    );
  }
  // ---- LOGIC GATE 3: TTK >= 4 → Voldigoat Wins for Burst ----
  else if (hitsToKill >= 4) {
    winnerKey = 'VoldigoatEngine';
    winner = 'The Executioner (Voldigoat Engine)';
    reasoning.push(
      `TTK ≥ 4 hits — Voldigoat Engine is the ABSOLUTE WINNER for burst damage.`,
      `At ${hitsToKill} hits, the enemy will cross the 50% HP threshold at approximately hit ${Math.ceil(hitsToKill / 2)}.`,
      `The combined execution phase (Voldigoat 1.25x × Executioner ≈1.45x = ~1.70x) overtakes Alter's fixed 1.50x nuke.`,
      `The back-half of the fight operates at a 1.70x isolated multiplier — no other build matches this.`,
    );
  }

  // ---- If Pride is disabled, note it ----
  if (disabledBuilds.includes('PrideEngine')) {
    reasoning.push('Pride Engine is excluded from contention due to stack reset conditions.');
  } else if (hitsToKill >= 12) {
    // Pride gets competitive at very high TTK
    reasoning.push(
      `Note: At ${hitsToKill} hits, Pride Engine approaches competitive territory due to Rampage stack accumulation.`,
      'However, Voldigoat execution phase still dominates in total output for the fight\'s duration.'
    );
  }

  // ---- SWAP SUGGESTIONS ----
  const swapSuggestions = generateSwapSuggestions({ results, enemyType, winnerKey });

  return {
    winner,
    winnerKey,
    reasoning,
    warnings,
    disabledBuilds,
    swapSuggestions,
  };
}

/**
 * Generate swap suggestions comparing user's build against presets.
 */
function generateSwapSuggestions({ results, enemyType, winnerKey }) {
  const suggestions = [];

  if (!results || Object.keys(results).length < 2) return suggestions;

  const custom = results.Custom;
  if (!custom) return suggestions;

  const winner = results[winnerKey];
  if (winner && custom) {
    const diff = winner.ceiling - custom.ceiling;
    if (diff > 0) {
      const pctGain = ((diff / custom.ceiling) * 100).toFixed(1);
      suggestions.push({
        message: `Switching to ${winnerKey} preset would increase your ceiling by ${pctGain}% (${diff.toFixed(2)} raw multiplier).`,
        priority: 'high',
      });
    }
  }

  // Compare each preset against custom
  for (const [key, preset] of Object.entries(results)) {
    if (key === 'Custom') continue;
    if (custom.ceiling > 0 && preset.ceiling > custom.ceiling) {
      const pctGain = (((preset.ceiling - custom.ceiling) / custom.ceiling) * 100).toFixed(1);
      if (parseFloat(pctGain) > 5) {
        suggestions.push({
          message: `${key}: +${pctGain}% ceiling over your current build.`,
          priority: parseFloat(pctGain) > 15 ? 'critical' : 'medium',
        });
      }
    }
  }

  return suggestions;
}

/**
 * Rank builds by a specific metric.
 */
export function rankBuilds(results, metric = 'ceiling') {
  return Object.entries(results)
    .map(([key, data]) => ({ key, ...data }))
    .sort((a, b) => (b[metric] || 0) - (a[metric] || 0));
}
