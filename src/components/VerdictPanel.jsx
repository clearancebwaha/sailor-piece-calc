import React from 'react';
import { useGameData } from '../context/GameDataContext.jsx';

// ============================================================
// Verdict Panel — ABSOLUTE VERDICT declaration
// ============================================================
export default function VerdictPanel() {
  const { computed } = useGameData();
  const { verdict } = computed;

  if (!verdict) return null;

  return (
    <div className="verdict-panel">
      {/* Warnings First */}
      {verdict.warnings.map((w, i) => (
        <div className={`warning-banner ${w.severity}`} key={i}>
          <span className="warning-icon">
            {w.severity === 'critical' ? '🚨' : w.severity === 'warning' ? '⚠️' : 'ℹ️'}
          </span>
          <span>{w.message}</span>
        </div>
      ))}

      {/* Verdict Header */}
      <div className="verdict-header">Absolute Verdict</div>

      {/* Winner Declaration */}
      {verdict.winner ? (
        <div className="verdict-winner">
          {verdict.winner.toUpperCase()}
        </div>
      ) : (
        <div className="verdict-winner" style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>
          INSUFFICIENT DATA FOR VERDICT
        </div>
      )}

      {/* Reasoning */}
      <ul className="verdict-reasoning">
        {verdict.reasoning.map((r, i) => (
          <li key={i}>{r}</li>
        ))}
      </ul>

      {/* Swap Suggestions */}
      {verdict.swapSuggestions.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div className="text-xs text-muted mb-8" style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            💡 Swap Suggestions
          </div>
          {verdict.swapSuggestions.map((s, i) => (
            <div className="swap-suggestion" key={i}>{s.message}</div>
          ))}
        </div>
      )}
    </div>
  );
}
