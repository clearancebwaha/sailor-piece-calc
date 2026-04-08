import React, { useState } from 'react';
import { useGameData } from '../context/GameDataContext.jsx';
import { resetToDefaults, exportConfig, importConfig } from '../data/storageAdapter.js';
import { getDefaultGameData } from '../data/defaultData.js';

// ============================================================
// Config Panel — Settings, Global Vars, Entity CRUD
// ============================================================
export default function ConfigPanel() {
  const { state, dispatch } = useGameData();
  const { gameData } = state;
  const [activeTab, setActiveTab] = useState('globals');
  const [editingEntity, setEditingEntity] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addEntityType, setAddEntityType] = useState('clans');

  const tabs = [
    { id: 'globals', label: 'Global Vars' },
    { id: 'clans', label: 'Clans' },
    { id: 'races', label: 'Races' },
    { id: 'specs', label: 'Specs' },
    { id: 'powers', label: 'Powers' },
    { id: 'artifacts', label: 'Artifacts' },
    { id: 'buckets', label: 'Buckets' },
    { id: 'io', label: 'Import/Export' },
  ];

  // ---- Global Variables ----
  function renderGlobals() {
    const bs = gameData.baseStats;
    return (
      <div>
        <div className="text-xs text-muted mb-12" style={{ fontFamily: 'var(--font-mono)' }}>
          These base values propagate through all calculations. Update when the game patches.
        </div>
        <div className="form-grid">
          {[
            { key: 'baseCC', label: 'Base Crit Chance %', value: bs.baseCC },
            { key: 'baseCD', label: 'Base Crit Damage %', value: bs.baseCD },
            { key: 'hiddenCC', label: 'Hidden CC Bonus %', value: bs.hiddenCC },
            { key: 'hiddenCD', label: 'Hidden CD Bonus %', value: bs.hiddenCD },
          ].map(({ key, label, value }) => (
            <div className="form-field" key={key}>
              <label>{label}</label>
              <input
                type="number"
                className="number-input"
                value={value}
                step={0.1}
                onChange={e => {
                  dispatch({
                    type: 'UPDATE_GAME_DATA',
                    payload: {
                      baseStats: { ...bs, [key]: parseFloat(e.target.value) || 0 }
                    }
                  });
                }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ---- Entity List (Clans/Specs/Powers) ----
  function renderEntityList(type) {
    const entities = gameData[type] || {};
    return (
      <div>
        <div className="flex items-center justify-between mb-12">
          <div className="text-xs text-muted" style={{ fontFamily: 'var(--font-mono)' }}>
            {Object.keys(entities).length} entities
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => { setAddEntityType(type); setShowAddModal(true); }}>
            + Add New
          </button>
        </div>
        <div className="entity-list">
          {Object.values(entities).map(entity => (
            <div className="entity-item" key={entity.id}>
              <div>
                <div className="entity-name">{entity.name}</div>
                <div className="entity-meta">
                  {entity.rarity && <span>{entity.rarity} · </span>}
                  {entity.stats && Object.entries(entity.stats).map(([k, v]) => {
                    if (typeof v === 'object' && v.min !== undefined) return `${k}: ${v.min}-${v.max}%`;
                    if (typeof v === 'number') return `${k}: ${v}%`;
                    return null;
                  }).filter(Boolean).join(' | ')}
                </div>
                {entity.mechanic && (
                  <div className="entity-meta" style={{ color: 'var(--color-warning)' }}>
                    ⚡ {entity.mechanic.description}
                  </div>
                )}
              </div>
              <div className="entity-actions">
                <button className="btn btn-sm" onClick={() => setEditingEntity({ ...entity, _type: type })}>
                  Edit
                </button>
                <button className="btn btn-sm btn-danger" onClick={() => {
                  const updated = { ...gameData[type] };
                  delete updated[entity.id];
                  dispatch({ type: 'UPDATE_GAME_DATA', payload: { [type]: updated } });
                }}>
                  Del
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ---- Artifact Sets ----
  function renderArtifacts() {
    const sets = gameData.artifactSets;
    return (
      <div>
        <div className="flex items-center justify-between mb-12">
          <div className="text-xs text-muted" style={{ fontFamily: 'var(--font-mono)' }}>
            {Object.keys(sets).length} artifact sets
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => { setAddEntityType('artifactSets'); setShowAddModal(true); }}>
            + Add Set
          </button>
        </div>
        <div className="entity-list">
          {Object.values(sets).map(set => (
            <div className="entity-item" key={set.id}>
              <div>
                <div className="entity-name">{set.name}</div>
                <div className="entity-meta">
                  2pc: {Object.entries(set.twoPiece).map(([k, v]) => `${k} +${v}%`).join(', ')}
                </div>
                <div className="entity-meta">
                  4pc: {Object.entries(set.fourPiece).map(([k, v]) => `${k} +${v}%`).join(', ')}
                </div>
              </div>
              <div className="entity-actions">
                <button className="btn btn-sm" onClick={() => setEditingEntity({ ...set, _type: 'artifactSets' })}>
                  Edit
                </button>
                <button className="btn btn-sm btn-danger" onClick={() => {
                  const updated = { ...gameData.artifactSets };
                  delete updated[set.id];
                  dispatch({ type: 'UPDATE_GAME_DATA', payload: { artifactSets: updated } });
                }}>
                  Del
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ---- Multiplier Buckets ----
  function renderBuckets() {
    const buckets = gameData.multiplierBuckets;
    return (
      <div>
        <div className="text-xs text-muted mb-12" style={{ fontFamily: 'var(--font-mono)' }}>
          The mathematical core iterates through all active buckets. Add new ones for future gear slots.
        </div>
        <div className="entity-list">
          {buckets.map((b, i) => (
            <div className="entity-item" key={b.id}>
              <div>
                <div className="entity-name">{b.name}</div>
                <div className="entity-meta">{b.description}</div>
              </div>
              <button className="btn btn-sm btn-danger" onClick={() => {
                const updated = buckets.filter((_, idx) => idx !== i);
                dispatch({ type: 'UPDATE_GAME_DATA', payload: { multiplierBuckets: updated } });
              }}>
                Del
              </button>
            </div>
          ))}
        </div>
        <div className="form-grid mt-12">
          <div className="form-field">
            <label>Bucket Name</label>
            <input id="new-bucket-name" type="text" className="number-input" placeholder="e.g. Aura" />
          </div>
          <div className="form-field">
            <label>Description</label>
            <input id="new-bucket-desc" type="text" className="number-input" placeholder="e.g. Aura gear stat pool" />
          </div>
          <div className="form-field">
            <button className="btn btn-primary" onClick={() => {
              const name = document.getElementById('new-bucket-name').value;
              const desc = document.getElementById('new-bucket-desc').value;
              if (!name) return;
              const updated = [...buckets, { id: name.toLowerCase().replace(/\s/g, '_'), name, description: desc }];
              dispatch({ type: 'UPDATE_GAME_DATA', payload: { multiplierBuckets: updated } });
              document.getElementById('new-bucket-name').value = '';
              document.getElementById('new-bucket-desc').value = '';
            }}>
              Add Bucket
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- Import/Export ----
  function renderIO() {
    return (
      <div>
        <div className="text-xs text-muted mb-12" style={{ fontFamily: 'var(--font-mono)' }}>
          Export your complete configuration to share or backup. Import to restore.
        </div>
        <div className="flex gap-8 mb-12">
          <button className="btn btn-primary" onClick={() => {
            const json = exportConfig();
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'sailorpiece-config.json';
            a.click();
            URL.revokeObjectURL(url);
          }}>
            Export JSON
          </button>
          <button className="btn" onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = (e) => {
              const file = e.target.files[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (ev) => {
                try {
                  const result = importConfig(ev.target.result);
                  dispatch({ type: 'REPLACE_GAME_DATA', payload: result.gameData });
                  alert('Config imported successfully!');
                } catch (err) {
                  alert('Import failed: ' + err.message);
                }
              };
              reader.readAsText(file);
            };
            input.click();
          }}>
            Import JSON
          </button>
          <button className="btn btn-danger" onClick={() => {
            if (confirm('Reset ALL configuration to factory defaults? This cannot be undone.')) {
              const defaults = resetToDefaults();
              dispatch({ type: 'REPLACE_GAME_DATA', payload: defaults });
            }
          }}>
            Reset to Defaults
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="config-panel">
      <div className="panel-section-title" style={{ marginBottom: 16, fontSize: '0.85rem' }}>
        Configuration Engine
      </div>

      <div className="config-tabs">
        {tabs.map(t => (
          <button
            key={t.id}
            className={`config-tab ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'globals' && renderGlobals()}
      {activeTab === 'clans' && renderEntityList('clans')}
      {activeTab === 'races' && renderEntityList('races')}
      {activeTab === 'specs' && renderEntityList('specs')}
      {activeTab === 'powers' && renderEntityList('powers')}
      {activeTab === 'artifacts' && renderArtifacts()}
      {activeTab === 'buckets' && renderBuckets()}
      {activeTab === 'io' && renderIO()}

      {/* ---- Edit Modal ---- */}
      {editingEntity && (
        <EditEntityModal
          entity={editingEntity}
          onClose={() => setEditingEntity(null)}
          onSave={(updated) => {
            const type = updated._type;
            delete updated._type;
            const entities = { ...gameData[type], [updated.id]: updated };
            dispatch({ type: 'UPDATE_GAME_DATA', payload: { [type]: entities } });
            setEditingEntity(null);
          }}
        />
      )}

      {/* ---- Add Modal ---- */}
      {showAddModal && (
        <AddEntityModal
          entityType={addEntityType}
          onClose={() => setShowAddModal(false)}
          onSave={(entity) => {
            const entities = { ...gameData[addEntityType], [entity.id]: entity };
            dispatch({ type: 'UPDATE_GAME_DATA', payload: { [addEntityType]: entities } });
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
}

// ============================================================
// Edit Entity Modal
// ============================================================
function EditEntityModal({ entity, onClose, onSave }) {
  const [data, setData] = useState({ ...entity });
  const isArtifact = data._type === 'artifactSets';

  function updateStat(path, value) {
    const updated = { ...data };
    const keys = path.split('.');
    let obj = updated;
    for (let i = 0; i < keys.length - 1; i++) {
      obj[keys[i]] = { ...obj[keys[i]] };
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    setData(updated);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-title">Edit: {data.name}</div>

        <div className="form-grid">
          <div className="form-field full-width">
            <label>Name</label>
            <input
              type="text"
              className="number-input"
              value={data.name}
              onChange={e => setData({ ...data, name: e.target.value })}
            />
          </div>

          {/* Stats */}
          {data.stats && Object.entries(data.stats).map(([key, val]) => (
            <div className="form-field" key={key}>
              <label>{key}</label>
              {typeof val === 'object' && val.min !== undefined ? (
                <div className="flex gap-8">
                  <input
                    type="number"
                    className="number-input"
                    value={val.min}
                    step={0.1}
                    placeholder="Min"
                    style={{ width: '48%' }}
                    onChange={e => updateStat(`stats.${key}.min`, parseFloat(e.target.value) || 0)}
                  />
                  <input
                    type="number"
                    className="number-input"
                    value={val.max}
                    step={0.1}
                    placeholder="Max"
                    style={{ width: '48%' }}
                    onChange={e => updateStat(`stats.${key}.max`, parseFloat(e.target.value) || 0)}
                  />
                </div>
              ) : (
                <input
                  type="number"
                  className="number-input"
                  value={val}
                  step={0.1}
                  onChange={e => updateStat(`stats.${key}`, parseFloat(e.target.value) || 0)}
                />
              )}
            </div>
          ))}

          {/* Artifact set bonuses */}
          {isArtifact && data.twoPiece && (
            <>
              <div className="form-field full-width">
                <label style={{ color: 'var(--color-warning)' }}>2-Piece Bonus</label>
              </div>
              {Object.entries(data.twoPiece).map(([k, v]) => (
                <div className="form-field" key={`2pc-${k}`}>
                  <label>2pc {k}%</label>
                  <input
                    type="number"
                    className="number-input"
                    value={v}
                    step={0.1}
                    onChange={e => updateStat(`twoPiece.${k}`, parseFloat(e.target.value) || 0)}
                  />
                </div>
              ))}
              <div className="form-field full-width">
                <label style={{ color: 'var(--color-warning)' }}>4-Piece Bonus</label>
              </div>
              {Object.entries(data.fourPiece).map(([k, v]) => (
                <div className="form-field" key={`4pc-${k}`}>
                  <label>4pc {k}%</label>
                  <input
                    type="number"
                    className="number-input"
                    value={v}
                    step={0.1}
                    onChange={e => updateStat(`fourPiece.${k}`, parseFloat(e.target.value) || 0)}
                  />
                </div>
              ))}
            </>
          )}

          {/* Mechanic */}
          {data.mechanic && (
            <>
              <div className="form-field full-width">
                <label style={{ color: 'var(--accent-cyan)' }}>Mechanic</label>
              </div>
              <div className="form-field full-width">
                <label>Description</label>
                <input
                  type="text"
                  className="number-input"
                  value={data.mechanic.description}
                  onChange={e => updateStat('mechanic.description', e.target.value)}
                />
              </div>
              {data.mechanic.multiplier !== undefined && (
                <div className="form-field">
                  <label>Multiplier</label>
                  <input
                    type="number"
                    className="number-input"
                    value={data.mechanic.multiplier}
                    step={0.01}
                    onChange={e => updateStat('mechanic.multiplier', parseFloat(e.target.value) || 1)}
                  />
                </div>
              )}
              {data.mechanic.multiplierMax !== undefined && (
                <div className="form-field">
                  <label>Max Multiplier</label>
                  <input
                    type="number"
                    className="number-input"
                    value={data.mechanic.multiplierMax}
                    step={0.01}
                    onChange={e => updateStat('mechanic.multiplierMax', parseFloat(e.target.value) || 1)}
                  />
                </div>
              )}
              {data.mechanic.range && (
                <div className="form-field">
                  <label>Mechanic Range</label>
                  <div className="flex gap-8">
                    <input
                      type="number"
                      className="number-input"
                      value={data.mechanic.range.min}
                      step={0.1}
                      placeholder="Min"
                      style={{ width: '48%' }}
                      onChange={e => updateStat('mechanic.range.min', parseFloat(e.target.value) || 0)}
                    />
                    <input
                      type="number"
                      className="number-input"
                      value={data.mechanic.range.max}
                      step={0.1}
                      placeholder="Max"
                      style={{ width: '48%' }}
                      onChange={e => updateStat('mechanic.range.max', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="modal-actions">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onSave(data)}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Add Entity Modal
// ============================================================
function AddEntityModal({ entityType, onClose, onSave }) {
  const [name, setName] = useState('');
  const [rarity, setRarity] = useState('Legendary');

  const isArtifact = entityType === 'artifactSets';
  const isClan = entityType === 'clans';
  const isRace = entityType === 'races';

  function handleSubmit() {
    if (!name.trim()) return;
    const id = name.replace(/\s+/g, '_');

    let entity;
    if (isArtifact) {
      entity = {
        id,
        name,
        twoPiece: { DMG: 0, CC: 0, CD: 0 },
        fourPiece: { DMG: 0, CC: 0, CD: 0 },
      };
    } else if (isClan || isRace) {
      entity = {
        id,
        name,
        stats: { DMG: 0, HP: 0, Melee: 0, Sword: 0, Luck: 0 },
        mechanic: null,
      };
    } else {
      entity = {
        id,
        name,
        rarity,
        stats: { DMG: { min: 0, max: 0 }, CC: { min: 0, max: 0 }, CD: { min: 0, max: 0 } },
        mechanic: null,
      };
    }

    onSave(entity);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-title">Add New {entityType.slice(0, -1)}</div>

        <div className="form-grid">
          <div className="form-field full-width">
            <label>Name</label>
            <input
              type="text"
              className="number-input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Leviathan"
              autoFocus
            />
          </div>

          {!isArtifact && !isClan && !isRace && (
            <div className="form-field">
              <label>Rarity</label>
              <select className="select-input" value={rarity} onChange={e => setRarity(e.target.value)}>
                <option value="Mythical">Mythical</option>
                <option value="Legendary">Legendary</option>
                <option value="Common">Common</option>
              </select>
            </div>
          )}
        </div>

        <div className="text-xs text-muted mt-12">
          The entity will be created with zeroed stats. Use "Edit" to configure its values after creation.
        </div>

        <div className="modal-actions">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>Create</button>
        </div>
      </div>
    </div>
  );
}
