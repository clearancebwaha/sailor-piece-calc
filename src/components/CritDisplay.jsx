import React from 'react';
import { useGameData } from '../context/GameDataContext.jsx';

// ============================================================
// Crit Display — CC/CD totals + 100% Lock indicator
// ============================================================
export default function CritDisplay() {
  const { computed } = useGameData();
  const { critResult } = computed;

  if (!critResult) return null;

  const ccPct = Math.min(critResult.totalCC, 100);
  const isLocked = critResult.isLocked;

  return (
    <div className="crit-display">
      {/* CC */}
      <div className={`crit-stat ${isLocked ? 'locked' : 'warning'}`}>
        <div className="crit-stat-label">Crit Chance</div>
        <div className={`crit-stat-value ${isLocked ? 'green' : 'red'}`}>
          {critResult.totalCC.toFixed(1)}%
        </div>
        <div className="crit-progress">
          <div
            className={`crit-progress-bar ${isLocked ? 'green' : 'red'}`}
            style={{ width: `${ccPct}%` }}
          />
        </div>
        {isLocked ? (
          <div className="text-xs text-success mt-8" style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
            ✓ 100% LOCKED
          </div>
        ) : (
          <div className="text-xs text-danger mt-8" style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
            ✗ {critResult.ccDeficit.toFixed(1)}% SHORT
          </div>
        )}
      </div>

      {/* CD */}
      <div className="crit-stat">
        <div className="crit-stat-label">Crit Damage</div>
        <div className="crit-stat-value gold">
          {critResult.totalCD.toFixed(1)}%
        </div>
        <div className="text-xs text-muted mt-8" style={{ fontFamily: 'var(--font-mono)' }}>
          {isLocked
            ? `Guaranteed ${(1 + critResult.totalCD / 100).toFixed(4)}x`
            : `Expected ${critResult.critYield.toFixed(4)}x`
          }
        </div>
      </div>

      {/* Crit Yield */}
      <div className="crit-yield-box">
        <div className="crit-stat-label">Crit Yield Multiplier</div>
        <div className={`crit-stat-value ${isLocked ? 'green' : 'red'}`} style={{ fontSize: '1.8rem' }}>
          {critResult.critYield.toFixed(4)}x
        </div>
        <div className="text-xs text-muted mt-8" style={{ fontFamily: 'var(--font-mono)' }}>
          {isLocked
            ? 'GUARANTEED — Every hit crits at full CD'
            : `RNG PENALTY — Expected value with ${critResult.totalCC.toFixed(1)}% chance`
          }
        </div>
      </div>
    </div>
  );
}
