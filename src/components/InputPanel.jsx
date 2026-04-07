import React from 'react';
import { useGameData } from '../context/GameDataContext.jsx';
import { gradeRoll } from '../engine/bucketEngine.js';

// ============================================================
// Input Panel — Left sidebar of the dashboard
// ============================================================
export default function InputPanel() {
  const { state, dispatch } = useGameData();
  const { gameData, customBuild, specRolls, powerRolls, baseDamage,
    artifactSet, bodyMainStat, artifactSubs, enemyType, hitsToKill,
    timeBetweenEnemies } = state;

  const clans = gameData.clans;
  const specs = gameData.specs;
  const powers = gameData.powers;

  const selectedClan = clans[customBuild.clan];
  const selectedSpec = specs[customBuild.spec];
  const selectedPower = powers[customBuild.power];

  return (
    <div className="input-panel">
      {/* ---- BUILD SELECTION ---- */}
      <div className="panel-section">
        <div className="panel-section-title">Build Configuration</div>

        <div className="input-group">
          <div className="input-label">Clan</div>
          <select
            className="select-input"
            value={customBuild.clan}
            onChange={e => dispatch({ type: 'SET_CUSTOM_BUILD', payload: { clan: e.target.value } })}
          >
            {Object.values(clans).map(c => (
              <option key={c.id} value={c.id}>{c.name} — DMG {c.stats.DMG}%</option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <div className="input-label">Spec Passive</div>
          <select
            className="select-input"
            value={customBuild.spec}
            onChange={e => {
              dispatch({ type: 'SET_CUSTOM_BUILD', payload: { spec: e.target.value } });
              dispatch({ type: 'RESET_ROLLS' });
            }}
          >
            {Object.values(specs).map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.rarity})</option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <div className="input-label">Power</div>
          <select
            className="select-input"
            value={customBuild.power}
            onChange={e => {
              dispatch({ type: 'SET_CUSTOM_BUILD', payload: { power: e.target.value } });
              dispatch({ type: 'RESET_ROLLS' });
            }}
          >
            {Object.values(powers).map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.rarity})</option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <div className="input-label">Weapon Type</div>
          <div className="toggle-container">
            <button
              className={`toggle-option ${customBuild.weaponType === 'Melee' ? 'active' : ''}`}
              onClick={() => dispatch({ type: 'SET_CUSTOM_BUILD', payload: { weaponType: 'Melee' } })}
            >Melee</button>
            <button
              className={`toggle-option ${customBuild.weaponType === 'Sword' ? 'active' : ''}`}
              onClick={() => dispatch({ type: 'SET_CUSTOM_BUILD', payload: { weaponType: 'Sword' } })}
            >Sword</button>
          </div>
        </div>
      </div>

      <div className="separator" />

      {/* ---- RNG STAT ROLLS ---- */}
      <div className="panel-section">
        <div className="panel-section-title">Your RNG Rolls</div>

        {/* Spec Rolls */}
        {selectedSpec && selectedSpec.stats && (
          <div className="card card-tight">
            <div className="text-xs text-muted mb-8">{selectedSpec.name} — Spec Stats</div>
            {Object.entries(selectedSpec.stats).map(([statKey, range]) => {
              if (typeof range !== 'object') return null;
              const val = specRolls[statKey] ?? range.max;
              const grade = gradeRoll(val, range.min, range.max);
              return (
                <div className="input-group" key={statKey}>
                  <div className="input-label">
                    <span>{statKey}%</span>
                    <span>
                      <span className="label-value">{val.toFixed(1)}%</span>
                      {' '}
                      <span className={`roll-grade ${grade.grade === 'GOD ROLL' ? 'god' : grade.grade === 'EXCELLENT' ? 'excellent' : grade.grade === 'GOOD' ? 'good' : grade.grade === 'AVERAGE' ? 'average' : grade.grade === 'BELOW AVG' ? 'below' : 'trash'}`}>
                        {grade.grade} ({grade.percentage}%)
                      </span>
                    </span>
                  </div>
                  <div className="slider-container">
                    <input
                      type="range"
                      className="slider-input"
                      min={range.min}
                      max={range.max}
                      step={0.1}
                      value={val}
                      onChange={e => dispatch({ type: 'SET_SPEC_ROLLS', payload: { [statKey]: parseFloat(e.target.value) } })}
                    />
                    <div className="slider-bounds">
                      <span>{range.min}</span>
                      <span>{range.max}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {/* Spec mechanic roll */}
            {selectedSpec.mechanic?.range && (
              <div className="input-group">
                <div className="input-label">
                  <span>{selectedSpec.mechanic.statKey}%</span>
                  <span>
                    <span className="label-value">{(specRolls[selectedSpec.mechanic.statKey] ?? selectedSpec.mechanic.range.max).toFixed(1)}%</span>
                    {' '}
                    {(() => {
                      const v = specRolls[selectedSpec.mechanic.statKey] ?? selectedSpec.mechanic.range.max;
                      const g = gradeRoll(v, selectedSpec.mechanic.range.min, selectedSpec.mechanic.range.max);
                      return <span className={`roll-grade ${g.grade === 'GOD ROLL' ? 'god' : g.grade === 'EXCELLENT' ? 'excellent' : g.grade === 'GOOD' ? 'good' : g.grade === 'AVERAGE' ? 'average' : g.grade === 'BELOW AVG' ? 'below' : 'trash'}`}>{g.grade}</span>;
                    })()}
                  </span>
                </div>
                <div className="slider-container">
                  <input
                    type="range"
                    className="slider-input"
                    min={selectedSpec.mechanic.range.min}
                    max={selectedSpec.mechanic.range.max}
                    step={0.1}
                    value={specRolls[selectedSpec.mechanic.statKey] ?? selectedSpec.mechanic.range.max}
                    onChange={e => dispatch({ type: 'SET_SPEC_ROLLS', payload: { [selectedSpec.mechanic.statKey]: parseFloat(e.target.value) } })}
                  />
                  <div className="slider-bounds">
                    <span>{selectedSpec.mechanic.range.min}</span>
                    <span>{selectedSpec.mechanic.range.max}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Power Rolls */}
        {selectedPower && selectedPower.stats && (
          <div className="card card-tight">
            <div className="text-xs text-muted mb-8">{selectedPower.name} — Power Stats</div>
            {Object.entries(selectedPower.stats).map(([statKey, range]) => {
              if (typeof range !== 'object') return null;
              const val = powerRolls[statKey] ?? range.max;
              const grade = gradeRoll(val, range.min, range.max);
              return (
                <div className="input-group" key={statKey}>
                  <div className="input-label">
                    <span>{statKey}%</span>
                    <span>
                      <span className="label-value">{val.toFixed(1)}%</span>
                      {' '}
                      <span className={`roll-grade ${grade.grade === 'GOD ROLL' ? 'god' : grade.grade === 'EXCELLENT' ? 'excellent' : grade.grade === 'GOOD' ? 'good' : grade.grade === 'AVERAGE' ? 'average' : grade.grade === 'BELOW AVG' ? 'below' : 'trash'}`}>
                        {grade.grade} ({grade.percentage}%)
                      </span>
                    </span>
                  </div>
                  <div className="slider-container">
                    <input
                      type="range"
                      className="slider-input"
                      min={range.min}
                      max={range.max}
                      step={0.1}
                      value={val}
                      onChange={e => dispatch({ type: 'SET_POWER_ROLLS', payload: { [statKey]: parseFloat(e.target.value) } })}
                    />
                    <div className="slider-bounds">
                      <span>{range.min}</span>
                      <span>{range.max}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {/* Power mechanic roll */}
            {selectedPower.mechanic?.range && (
              <div className="input-group">
                <div className="input-label">
                  <span>{selectedPower.mechanic.statKey}%</span>
                  <span>
                    <span className="label-value">{(powerRolls[selectedPower.mechanic.statKey] ?? selectedPower.mechanic.range.max).toFixed(1)}%</span>
                  </span>
                </div>
                <div className="slider-container">
                  <input
                    type="range"
                    className="slider-input"
                    min={selectedPower.mechanic.range.min}
                    max={selectedPower.mechanic.range.max}
                    step={0.1}
                    value={powerRolls[selectedPower.mechanic.statKey] ?? selectedPower.mechanic.range.max}
                    onChange={e => dispatch({ type: 'SET_POWER_ROLLS', payload: { [selectedPower.mechanic.statKey]: parseFloat(e.target.value) } })}
                  />
                  <div className="slider-bounds">
                    <span>{selectedPower.mechanic.range.min}</span>
                    <span>{selectedPower.mechanic.range.max}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="separator" />

      {/* ---- ARTIFACT CONFIG ---- */}
      <div className="panel-section">
        <div className="panel-section-title">Artifact Configuration</div>

        <div className="input-group">
          <div className="input-label">Artifact Set</div>
          <select
            className="select-input"
            value={artifactSet}
            onChange={e => dispatch({ type: 'SET_ARTIFACT_SET', payload: e.target.value })}
          >
            {Object.values(gameData.artifactSets).map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <div className="input-label">Body Main Stat</div>
          <div className="toggle-container">
            {['DMG', 'CD', 'CC'].map(stat => (
              <button
                key={stat}
                className={`toggle-option ${bodyMainStat === stat ? (stat === 'CC' ? 'active' : 'active') : ''}`}
                onClick={() => dispatch({ type: 'SET_BODY_MAIN_STAT', payload: stat })}
              >{stat}</button>
            ))}
          </div>
        </div>

        {/* Per-slot sub-stats */}
        {Object.entries(gameData.artifactSlots).map(([slotName, slotDef]) => {
          // Determine allowed subs for this slot
          let allowedSubs = [...slotDef.allowedSubs];
          if (slotName === 'Body') {
            // Remove the main stat from allowed subs
            allowedSubs = ['DMG', 'CD', 'CC'].filter(s => s !== bodyMainStat);
          }

          return (
            <div className="card card-tight" key={slotName}>
              <div className="text-xs text-muted mb-8">
                {slotName}
                <span className="text-mono" style={{ marginLeft: 8, color: 'var(--text-dim)' }}>
                  Main: {slotName === 'Body' ? `${bodyMainStat} ${bodyMainStat === 'DMG' ? '27.9' : bodyMainStat === 'CD' ? '59.7' : '30.6'}%` : slotDef.mainStat.label}
                </span>
              </div>
              {allowedSubs.map(subStat => {
                const range = gameData.subStatRanges[subStat];
                const val = artifactSubs[slotName]?.[subStat] ?? range.min;
                return (
                  <div className="input-group" key={subStat}>
                    <div className="input-label">
                      <span>{subStat} Sub</span>
                      <span className="label-value">{val.toFixed(1)}%</span>
                    </div>
                    <div className="slider-container">
                      <input
                        type="range"
                        className="slider-input"
                        min={range.min}
                        max={range.max}
                        step={range.step}
                        value={val}
                        onChange={e => dispatch({
                          type: 'SET_ARTIFACT_SUB',
                          payload: { slot: slotName, stat: subStat, value: parseFloat(e.target.value) }
                        })}
                      />
                      <div className="slider-bounds">
                        <span>{range.min}</span>
                        <span>{range.max}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="separator" />

      {/* ---- ENEMY CONTEXT ---- */}
      <div className="panel-section">
        <div className="panel-section-title">Enemy Context</div>

        <div className="input-group">
          <div className="input-label">Enemy Type</div>
          <div className="toggle-container">
            <button
              className={`toggle-option ${enemyType === 'Boss' ? 'active' : ''}`}
              onClick={() => dispatch({ type: 'SET_ENEMY_TYPE', payload: 'Boss' })}
            >Boss</button>
            <button
              className={`toggle-option ${enemyType === 'Mob' ? 'active-danger' : ''}`}
              onClick={() => dispatch({ type: 'SET_ENEMY_TYPE', payload: 'Mob' })}
            >Mob</button>
          </div>
        </div>

        <div className="input-group">
          <div className="input-label">
            <span>Hits to Kill (TTK)</span>
            <span className="label-value">{hitsToKill}</span>
          </div>
          <div className="slider-container">
            <input
              type="range"
              className="slider-input"
              min={1}
              max={20}
              step={1}
              value={hitsToKill}
              onChange={e => dispatch({ type: 'SET_HITS_TO_KILL', payload: parseInt(e.target.value) })}
            />
            <div className="slider-bounds">
              <span>1</span>
              <span>20</span>
            </div>
          </div>
        </div>

        <div className="input-group">
          <div className="input-label">
            <span>Time Between Enemies (s)</span>
            <span className="label-value">{timeBetweenEnemies}s</span>
          </div>
          <div className="slider-container">
            <input
              type="range"
              className="slider-input"
              min={1}
              max={30}
              step={1}
              value={timeBetweenEnemies}
              onChange={e => dispatch({ type: 'SET_TIME_BETWEEN', payload: parseInt(e.target.value) })}
            />
            <div className="slider-bounds">
              <span>1s</span>
              <span>30s</span>
            </div>
          </div>
        </div>

        <div className="input-group">
          <div className="input-label">
            <span>Base Damage %</span>
            <span className="label-value">{baseDamage}%</span>
          </div>
          <div className="slider-container">
            <input
              type="range"
              className="slider-input"
              min={100}
              max={2000}
              step={10}
              value={baseDamage}
              onChange={e => dispatch({ type: 'SET_BASE_DAMAGE', payload: parseInt(e.target.value) })}
            />
            <div className="slider-bounds">
              <span>100%</span>
              <span>2000%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
