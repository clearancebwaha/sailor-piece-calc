// ============================================================
// Crit Engine — CC/CD aggregation and Crit Yield math
// ============================================================

/**
 * Calculate total Critical Chance from all sources.
 * @returns {number} Total CC percentage (not capped)
 */
export function calculateTotalCC({
  baseCC = 27,
  hiddenCC = 5,
  setCC = 0,
  bodyMainCC = 0,
  substatCCs = [],
  powerCC = 0,
  specCC = 0,
}) {
  const total = baseCC + hiddenCC + setCC + bodyMainCC + powerCC + specCC +
    substatCCs.reduce((sum, v) => sum + v, 0);
  return total;
}

/**
 * Calculate total Critical Damage from all sources.
 * @returns {number} Total CD percentage
 */
export function calculateTotalCD({
  baseCD = 97.5,
  hiddenCD = 50,
  setCD = 0,
  bodyMainCD = 0,
  substatCDs = [],
  powerCD = 0,
  specCD = 0,
}) {
  const total = baseCD + hiddenCD + setCD + bodyMainCD + powerCD + specCD +
    substatCDs.reduce((sum, v) => sum + v, 0);
  return total;
}

/**
 * Calculate Crit Yield (the multiplicative crit bucket).
 *
 * If CC >= 100%: critYield = 1 + (totalCD / 100) — guaranteed crit
 * If CC < 100%:  critYield = 1 + (CC/100 * CD/100) — expected value with RNG penalty
 *
 * @returns {{ totalCC, totalCD, critYield, isLocked, hasWarning }}
 */
export function calculateCritYield(ccSources, cdSources) {
  const totalCC = calculateTotalCC(ccSources);
  const totalCD = calculateTotalCD(cdSources);

  const cappedCC = Math.min(totalCC, 100);
  const isLocked = totalCC >= 100;

  let critYield;
  if (isLocked) {
    critYield = 1 + (totalCD / 100);
  } else {
    critYield = 1 + ((cappedCC / 100) * (totalCD / 100));
  }

  return {
    totalCC,
    totalCD,
    cappedCC,
    critYield,
    isLocked,
    hasWarning: !isLocked,
    ccDeficit: isLocked ? 0 : 100 - totalCC,
  };
}
