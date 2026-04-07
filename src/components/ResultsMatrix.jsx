import React, { useState } from 'react';
import { useGameData } from '../context/GameDataContext.jsx';

// ============================================================
// Results Matrix — 3 God Builds + Custom, Floor/Ceiling/TTK
// ============================================================
export default function ResultsMatrix() {
  const { state, computed } = useGameData();
  const { presetResults, rankings, verdict } = computed;
  const { gameData } = state;

  const [expandedBuild, setExpandedBuild] = useState(null);

  if (!presetResults || Object.keys(presetResults).length === 0) {
    return <div className="text-muted text-sm">No builds computed yet.</div>;
  }

  // Determine best/worst for each metric
  const metrics = ['relativeFloor', 'relativeCeiling', 'relativeTTK'];
  const bestWorst = {};
  for (const metric of metrics) {
    let best = -Infinity, worst = Infinity;
    for (const [key, data] of Object.entries(presetResults)) {
      const val = data[metric] || 0;
      if (val > best) best = val;
      if (val < worst) worst = val;
    }
    bestWorst[metric] = { best, worst };
  }

  function getCellClass(value, metric) {
    const { best, worst } = bestWorst[metric];
    if (value === best) return 'best';
    if (value === worst) return 'worst';
    return 'mid';
  }

  const buildOrder = ['AlterEngine', 'VoldigoatEngine', 'PrideEngine', 'Custom'];
  const activeBuildKeys = buildOrder.filter(k => presetResults[k]);

  const isDisabled = (key) => verdict.disabledBuilds.includes(key);

  return (
    <div>
      {/* Matrix Table */}
      <div
        className="results-matrix"
        style={{ gridTemplateColumns: '1.5fr repeat(3, 1fr)' }}
      >
        {/* Header Row */}
        <div className="matrix-cell header">Build</div>
        <div className="matrix-cell header" style={{ textAlign: 'right' }}>Floor</div>
        <div className="matrix-cell header" style={{ textAlign: 'right' }}>Ceiling</div>
        <div className="matrix-cell header" style={{ textAlign: 'right' }}>TTK Avg</div>

        {/* Data Rows */}
        {activeBuildKeys.map(key => {
          const data = presetResults[key];
          const preset = gameData.presets[key];
          const disabled = isDisabled(key);
          const isCustom = key === 'Custom';

          return (
            <React.Fragment key={key}>
              <div
                className={`matrix-cell build-name ${disabled ? 'disabled' : ''} ${isCustom ? 'matrix-row-custom' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => setExpandedBuild(expandedBuild === key ? null : key)}
              >
                <span>{isCustom ? '⚙ Your Build' : preset?.shortName || key}</span>
                <span className="build-label">
                  {isCustom
                    ? `${state.customBuild.clan} / ${state.customBuild.spec} / ${state.customBuild.power}`
                    : preset?.description?.slice(0, 60) + '...'
                  }
                </span>
                {disabled && <span className="build-label text-danger">⚠ DISABLED</span>}
              </div>

              <div className={`matrix-cell value ${disabled ? 'disabled' : getCellClass(data.relativeFloor, 'relativeFloor')} ${isCustom ? 'matrix-row-custom' : ''}`}>
                {data.relativeFloor.toFixed(4)}x
                <div className="relative-value">
                  {data.floor.toFixed(2)} raw
                </div>
              </div>

              <div className={`matrix-cell value ${disabled ? 'disabled' : getCellClass(data.relativeCeiling, 'relativeCeiling')} ${isCustom ? 'matrix-row-custom' : ''}`}>
                {data.relativeCeiling.toFixed(4)}x
                <div className="relative-value">
                  {data.ceiling.toFixed(2)} raw
                </div>
              </div>

              <div className={`matrix-cell value ${disabled ? 'disabled' : getCellClass(data.relativeTTK, 'relativeTTK')} ${isCustom ? 'matrix-row-custom' : ''}`}>
                {data.relativeTTK.toFixed(4)}x
                <div className="relative-value">
                  {data.ttkAverage.toFixed(2)} raw
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Expanded Bucket Breakdown */}
      {expandedBuild && presetResults[expandedBuild] && (
        <div className="card" style={{ marginTop: -10 }}>
          <div className="text-xs text-muted mb-8" style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {expandedBuild === 'Custom' ? 'Your Build' : gameData.presets[expandedBuild]?.shortName} — Bucket Breakdown
          </div>
          <div className="bucket-breakdown">
            {presetResults[expandedBuild].bucketBreakdown.map((bucket, i) => (
              <div className="bucket-row" key={i}>
                <span className="bucket-name">{bucket.name} ({bucket.entity})</span>
                <span className="bucket-value">{bucket.multiplier.toFixed(4)}x</span>
              </div>
            ))}
            <div className="separator" style={{ margin: '8px 0' }} />
            {/* Mechanic multipliers */}
            {presetResults[expandedBuild].mechanicDetails.map((md, i) => (
              <div className="bucket-row" key={`m-${i}`}>
                <span className="bucket-name" style={{ color: md.disabled ? 'var(--text-dim)' : 'var(--color-warning)' }}>
                  {md.disabled ? '✗' : '⚡'} {md.source}
                </span>
                <span className="bucket-value" style={{ color: md.disabled ? 'var(--text-dim)' : 'var(--color-gold)' }}>
                  {md.disabled ? 'OFF' : `${md.floor.toFixed(2)}x → ${md.ceiling.toFixed(2)}x`}
                </span>
              </div>
            ))}
            <div className="separator" style={{ margin: '8px 0' }} />
            <div className="bucket-row" style={{ background: 'var(--bg-hover)' }}>
              <span className="bucket-name" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Base Engine</span>
              <span className="bucket-value">{presetResults[expandedBuild].baseEngine.toFixed(2)}x</span>
            </div>
          </div>
        </div>
      )}

      {/* God Roll vs Reality comparison */}
      {presetResults.Custom && (
        <div className="card" style={{ marginTop: 10 }}>
          <div className="text-xs text-muted mb-8" style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            God Roll Ceiling vs Your Reality
          </div>
          {activeBuildKeys.filter(k => k !== 'Custom').map(key => {
            const godRoll = presetResults[key];
            const custom = presetResults.Custom;
            if (!godRoll) return null;

            const ceilingDiff = ((godRoll.relativeCeiling - custom.relativeCeiling) / custom.relativeCeiling * 100).toFixed(1);
            const isAhead = parseFloat(ceilingDiff) < 0;

            return (
              <div className="bucket-row" key={key} style={{ marginBottom: 4 }}>
                <span className="bucket-name">{gameData.presets[key]?.shortName || key} (God Roll)</span>
                <span className="bucket-value" style={{
                  color: isAhead ? 'var(--color-success)' : 'var(--color-danger)'
                }}>
                  {isAhead ? '' : '+'}{ceilingDiff}% vs Your Build
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
