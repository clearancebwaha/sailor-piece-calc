import React from 'react';
import InputPanel from './InputPanel.jsx';
import CritDisplay from './CritDisplay.jsx';
import ResultsMatrix from './ResultsMatrix.jsx';
import VerdictPanel from './VerdictPanel.jsx';

// ============================================================
// Dashboard — Main calculator view
// ============================================================
export default function Dashboard() {
  return (
    <div className="dashboard">
      {/* Left: Inputs */}
      <InputPanel />

      {/* Right: Results */}
      <div className="results-area">
        <div className="panel-section">
          <div className="panel-section-title">Crit Yield Engine</div>
          <CritDisplay />
        </div>

        <div className="panel-section">
          <div className="panel-section-title">Damage Matrix — God Roll Ceiling</div>
          <ResultsMatrix />
        </div>

        <div className="panel-section">
          <VerdictPanel />
        </div>
      </div>
    </div>
  );
}
