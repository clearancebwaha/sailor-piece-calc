// ============================================================
// localStorage persistence adapter
// ============================================================
import { getDefaultGameData } from './defaultData.js';

const STORAGE_KEY = 'sailorpiece-data';
const USER_BUILDS_KEY = 'sailorpiece-user-builds';

export function loadGameData() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to pick up any new fields from updates
      const defaults = getDefaultGameData();
      return deepMerge(defaults, parsed);
    }
  } catch (e) {
    console.warn('Failed to load game data from localStorage:', e);
  }
  return getDefaultGameData();
}

export function saveGameData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save game data:', e);
  }
}

export function loadUserBuilds() {
  try {
    const stored = localStorage.getItem(USER_BUILDS_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.warn('Failed to load user builds:', e);
  }
  return {};
}

export function saveUserBuilds(builds) {
  try {
    localStorage.setItem(USER_BUILDS_KEY, JSON.stringify(builds));
  } catch (e) {
    console.error('Failed to save user builds:', e);
  }
}

export function resetToDefaults() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(USER_BUILDS_KEY);
  return getDefaultGameData();
}

export function exportConfig() {
  return JSON.stringify({
    gameData: loadGameData(),
    userBuilds: loadUserBuilds(),
  }, null, 2);
}

export function importConfig(jsonString) {
  const parsed = JSON.parse(jsonString);
  if (parsed.gameData) saveGameData(parsed.gameData);
  if (parsed.userBuilds) saveUserBuilds(parsed.userBuilds);
  return {
    gameData: parsed.gameData || getDefaultGameData(),
    userBuilds: parsed.userBuilds || {},
  };
}

// Deep merge utility — target values override source where they exist
function deepMerge(source, target) {
  const result = { ...source };
  for (const key of Object.keys(target)) {
    if (
      target[key] &&
      typeof target[key] === 'object' &&
      !Array.isArray(target[key]) &&
      source[key] &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key])
    ) {
      result[key] = deepMerge(source[key], target[key]);
    } else {
      result[key] = target[key];
    }
  }
  return result;
}
