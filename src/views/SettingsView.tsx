import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Sliders,
  User,
  RotateCcw,
  Check,
  Save,
  Cpu,
  Info,
  AlertTriangle
} from 'lucide-react';
import { SystemSettings } from '../types';

interface SettingsViewProps {
  settings: SystemSettings;
  onSaveSettings: (settings: SystemSettings) => void;
  onResetAllData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  onResetAllData
}) => {
  const [formState, setFormState] = useState<SystemSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    onSaveSettings(formState);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">System & Engine Settings</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure inspector identities, fuzzy comparison tolerances, and demonstration operational rules
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all"
        >
          {savedSuccess ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
          <span>{savedSuccess ? 'Settings Saved!' : 'Save Settings'}</span>
        </button>
      </div>

      {/* Reviewer Profile */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <User className="w-4 h-4 text-blue-600" />
          <h2 className="text-sm font-bold text-slate-900">Reviewer Credentials & Agency Profile</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Reviewing Officer Name
            </label>
            <input
              type="text"
              value={formState.reviewerName}
              onChange={e => setFormState({ ...formState, reviewerName: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Official Designation
            </label>
            <input
              type="text"
              value={formState.reviewerDesignation}
              onChange={e => setFormState({ ...formState, reviewerDesignation: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Regulatory Agency / Competent Authority
            </label>
            <input
              type="text"
              value={formState.regulatoryBody}
              onChange={e => setFormState({ ...formState, regulatoryBody: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Verification Engine Tuning */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Sliders className="w-4 h-4 text-teal-600" />
          <h2 className="text-sm font-bold text-slate-900">Verification Engine Tuning</h2>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700 uppercase tracking-wider">
                Name Similarity Match Threshold: {(formState.fuzzyThreshold * 100).toFixed(0)}%
              </label>
              <span className="text-slate-400 font-mono text-[11px]">
                {formState.fuzzyThreshold >= 0.85 ? 'Strict (Default)' : 'Relaxed Match'}
              </span>
            </div>
            <input
              type="range"
              min="0.60"
              max="0.95"
              step="0.05"
              value={formState.fuzzyThreshold}
              onChange={e => setFormState({ ...formState, fuzzyThreshold: parseFloat(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Controls when minor spelling variations or title abbreviations in institution names trigger an informational or medium severity flag.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800 block">High Severity Alert Banner</span>
              <p className="text-[11px] text-slate-500">
                Display critical warning banners immediately upon detecting missing mandatory certificates or survey number mismatches.
              </p>
            </div>
            <input
              type="checkbox"
              checked={formState.notifyOnHighSeverity}
              onChange={e => setFormState({ ...formState, notifyOnHighSeverity: e.target.checked })}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* AI Assistance & Governance Mode */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Cpu className="w-4 h-4 text-purple-600" />
          <h2 className="text-sm font-bold text-slate-900">AI Assistance & Governance Architecture</h2>
        </div>

        <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200 text-xs text-purple-900 space-y-2">
          <div className="flex items-center gap-2 font-bold">
            <Shield className="w-4 h-4 text-purple-600 shrink-0" />
            <span>Operational Mode: Deterministic Verification + Explainable Suggestions</span>
          </div>
          <p className="text-purple-800 leading-relaxed">
            ReguLens AI uses deterministic parsing, coordinate normalization, and rule-based consistency matrices to ensure 100% explainable findings without hallucination. External LLM services are kept optional and sandboxed for explanatory summaries only.
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 text-xs">
          <div>
            <span className="font-bold text-slate-800 block">AI Summary & Drafting Assistant</span>
            <p className="text-[11px] text-slate-500">
              Provide AI-assisted summaries and automated Notice of Defect draft generation.
            </p>
          </div>
          <input
            type="checkbox"
            checked={formState.aiAssistantEnabled}
            onChange={e => setFormState({ ...formState, aiAssistantEnabled: e.target.checked })}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Demo Reset Zone */}
      <div className="bg-white rounded-2xl p-6 border border-red-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-red-100 pb-3">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <h2 className="text-sm font-bold text-red-900">Demonstration Data Reset Zone</h2>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div>
            <p className="font-semibold text-slate-800">Restore Factory SIH Demonstration State</p>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Reset all uploaded documents, cases, findings, and audit trails back to the preloaded North Valley Institute benchmark dataset.
            </p>
          </div>

          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to restore the clean SIH demonstration database?')) {
                onResetAllData();
              }
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md shadow-red-600/20 shrink-0 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Database</span>
          </button>
        </div>
      </div>
    </div>
  );
};
