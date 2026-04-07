import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import { loadGameData, saveGameData } from '../data/storageAdapter.js';
import { calculateCritYield } from '../engine/critEngine.js';
import { calculateFullDamage } from '../engine/damageEngine.js';
import { calculateVerdict, rankBuilds } from '../engine/verdictEngine.js';

const GameDataContext = createContext(null);

// ============================================================
// Initial state factory
// ============================================================
function createInitialState() {
  const gameData = loadGameData();

  return {
    gameData,

    // User's current inputs
    selectedPreset: 'AlterEngine',
    customBuild: {
      clan: 'Alter',
      spec: 'Berserker',
      power: 'Colossus',
      weaponType: 'Melee',
    },
    specRolls: {},
    powerRolls: {},
    baseDamage: 800,

    // Artifact state
    artifactSet: 'Abyssal',
    bodyMainStat: 'DMG', // 'DMG' | 'CD' | 'CC'
    artifactSubs: {
      Helmet: { DMG: 6.5, CD: 14.0, CC: 8.0 },
      Gloves: { CD: 14.0, CC: 8.0 },
      Boots: { CD: 14.0, CC: 8.0 },
      Body: { CD: 14.0, CC: 8.0 },
    },

    // Enemy context
    enemyType: 'Boss',
    hitsToKill: 10,
    timeBetweenEnemies: 3,

    // Custom multiplier buckets
    customBuckets: [],

    // UI state
    activeView: 'dashboard', // 'dashboard' | 'config'
  };
}

// ============================================================
// Reducer
// ============================================================
function gameDataReducer(state, action) {
  switch (action.type) {
    case 'SET_CUSTOM_BUILD':
      return { ...state, customBuild: { ...state.customBuild, ...action.payload } };
    case 'SET_SPEC_ROLLS':
      return { ...state, specRolls: { ...state.specRolls, ...action.payload } };
    case 'SET_POWER_ROLLS':
      return { ...state, powerRolls: { ...state.powerRolls, ...action.payload } };
    case 'SET_BASE_DAMAGE':
      return { ...state, baseDamage: action.payload };
    case 'SET_ARTIFACT_SET':
      return { ...state, artifactSet: action.payload };
    case 'SET_BODY_MAIN_STAT':
      return { ...state, bodyMainStat: action.payload };
    case 'SET_ARTIFACT_SUB': {
      const { slot, stat, value } = action.payload;
      return {
        ...state,
        artifactSubs: {
          ...state.artifactSubs,
          [slot]: { ...state.artifactSubs[slot], [stat]: value },
        },
      };
    }
    case 'SET_ENEMY_TYPE':
      return { ...state, enemyType: action.payload };
    case 'SET_HITS_TO_KILL':
      return { ...state, hitsToKill: action.payload };
    case 'SET_TIME_BETWEEN':
      return { ...state, timeBetweenEnemies: action.payload };
    case 'SET_ACTIVE_VIEW':
      return { ...state, activeView: action.payload };
    case 'SET_CUSTOM_BUCKETS':
      return { ...state, customBuckets: action.payload };
    case 'UPDATE_GAME_DATA':
      return { ...state, gameData: { ...state.gameData, ...action.payload } };
    case 'REPLACE_GAME_DATA':
      return { ...state, gameData: action.payload };
    case 'RESET_ROLLS':
      return { ...state, specRolls: {}, powerRolls: {} };
    default:
      return state;
  }
}

// ============================================================
// Provider
// ============================================================
export function GameDataProvider({ children }) {
  const [state, dispatch] = useReducer(gameDataReducer, null, createInitialState);

  // Persist game data changes
  useEffect(() => {
    saveGameData(state.gameData);
  }, [state.gameData]);

  // ---- Derived calculations ----
  const computedResults = useMemo(() => {
    const { gameData, customBuild, specRolls, powerRolls, baseDamage,
      artifactSet, bodyMainStat, artifactSubs, enemyType, hitsToKill,
      timeBetweenEnemies, customBuckets } = state;

    // 1. Resolve artifact set bonuses
    const set = gameData.artifactSets[artifactSet];
    let setCC = 0, setCD = 0, setDMG = 0;
    if (set) {
      setCC = (set.twoPiece?.CC || 0) + (set.fourPiece?.CC || 0);
      setCD = (set.twoPiece?.CD || 0) + (set.fourPiece?.CD || 0);
      setDMG = (set.twoPiece?.DMG || 0) + (set.fourPiece?.DMG || 0);
    }

    // 2. Resolve body main stat
    let bodyMainCC = 0, bodyMainCD = 0, bodyMainDMG = 0;
    const bodySlot = gameData.artifactSlots.Body;
    if (bodyMainStat === 'CC') bodyMainCC = 30.6;
    else if (bodyMainStat === 'CD') bodyMainCD = 59.7;
    else bodyMainDMG = 27.9;

    // Gloves + Boots fixed DMG
    const glovesBootsDMG = 27.9 + 27.9;

    // 3. Sum sub-stats
    const allCCSubs = [];
    const allCDSubs = [];
    let allDMGSubs = 0;

    for (const [slotName, subs] of Object.entries(artifactSubs)) {
      if (subs.CC !== undefined) allCCSubs.push(subs.CC);
      if (subs.CD !== undefined) allCDSubs.push(subs.CD);
      if (subs.DMG !== undefined) allDMGSubs += subs.DMG;
    }

    // 4. Total artifact DMG% = set DMG + mainstat DMG + sub DMG + gloves/boots fixed
    const totalArtifactDMG = setDMG + bodyMainDMG + glovesBootsDMG + allDMGSubs;

    // 5. Calculate crit for each build
    function computeBuild(clanKey, specKey, powerKey, weaponType, useMaxRolls = false) {
      const clan = gameData.clans[clanKey];
      const spec = gameData.specs[specKey];
      const power = gameData.powers[powerKey];
      if (!clan || !spec || !power) return null;

      // Resolve rolls
      const sRolls = {};
      const pRolls = {};

      if (useMaxRolls) {
        // God roll — use max for everything
        if (spec.stats) {
          for (const [k, v] of Object.entries(spec.stats)) {
            sRolls[k] = typeof v === 'object' ? v.max : v;
          }
        }
        if (spec.mechanic?.range) {
          sRolls[spec.mechanic.statKey] = spec.mechanic.range.max;
        }
        if (power.stats) {
          for (const [k, v] of Object.entries(power.stats)) {
            pRolls[k] = typeof v === 'object' ? v.max : v;
          }
        }
        if (power.mechanic?.range) {
          pRolls[power.mechanic.statKey] = power.mechanic.range.max;
        }
      } else {
        // Use user rolls, fallback to max
        if (spec.stats) {
          for (const [k, v] of Object.entries(spec.stats)) {
            sRolls[k] = specRolls[k] ?? (typeof v === 'object' ? v.max : v);
          }
        }
        if (spec.mechanic?.range) {
          sRolls[spec.mechanic.statKey] = specRolls[spec.mechanic.statKey] ?? spec.mechanic.range.max;
        }
        if (power.stats) {
          for (const [k, v] of Object.entries(power.stats)) {
            pRolls[k] = powerRolls[k] ?? (typeof v === 'object' ? v.max : v);
          }
        }
        if (power.mechanic?.range) {
          pRolls[power.mechanic.statKey] = powerRolls[power.mechanic.statKey] ?? power.mechanic.range.max;
        }
      }

      const critResult = calculateCritYield(
        {
          baseCC: gameData.baseStats.baseCC,
          hiddenCC: gameData.baseStats.hiddenCC,
          setCC,
          bodyMainCC,
          substatCCs: allCCSubs,
          powerCC: pRolls.CC || 0,
          specCC: sRolls.CC || 0,
        },
        {
          baseCD: gameData.baseStats.baseCD,
          hiddenCD: gameData.baseStats.hiddenCD,
          setCD,
          bodyMainCD,
          substatCDs: allCDSubs,
          powerCD: pRolls.CD || 0,
          specCD: sRolls.CD || 0,
        }
      );

      return calculateFullDamage({
        clan,
        spec,
        power,
        specRolls: sRolls,
        powerRolls: pRolls,
        critResult,
        weaponType,
        artifactDMG: totalArtifactDMG,
        enemyType,
        hitsToKill,
        baseDamage,
        customBuckets,
      });
    }

    // Compute all 3 presets (God Roll)
    const presetResults = {};
    for (const [key, preset] of Object.entries(gameData.presets)) {
      const result = computeBuild(preset.clan, preset.spec, preset.power, preset.weaponType, true);
      if (result) presetResults[key] = result;
    }

    // Compute custom build (user rolls)
    const customResult = computeBuild(
      customBuild.clan,
      customBuild.spec,
      customBuild.power,
      customBuild.weaponType,
      false
    );
    if (customResult) presetResults.Custom = customResult;

    // Get the shared crit result for verdict
    const firstResult = Object.values(presetResults)[0];
    const critResult = firstResult?.critResult || { totalCC: 0, totalCD: 0, hasWarning: true, ccDeficit: 100 };

    // Run verdict engine
    const verdict = calculateVerdict({
      results: presetResults,
      enemyType,
      hitsToKill,
      timeBetweenEnemies,
      critResult,
    });

    // Rank builds
    const rankings = rankBuilds(presetResults, 'ceiling');

    return {
      presetResults,
      customResult,
      verdict,
      rankings,
      critResult,
      totalArtifactDMG,
      setCC,
      setCD,
      setDMG,
    };
  }, [state]);

  const value = useMemo(() => ({
    state,
    dispatch,
    computed: computedResults,
  }), [state, computedResults]);

  return (
    <GameDataContext.Provider value={value}>
      {children}
    </GameDataContext.Provider>
  );
}

export function useGameData() {
  const ctx = useContext(GameDataContext);
  if (!ctx) throw new Error('useGameData must be used within GameDataProvider');
  return ctx;
}
