import React, { useState } from 'react';
import {
  ClipboardCheck,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Info,
  Calendar,
  X,
  RotateCcw
} from 'lucide-react';
import { ChecklistItem } from '../types';
import { INITIAL_CHECKLIST } from '../data/mockData';

interface ChecklistConfigViewProps {
  checklist: ChecklistItem[];
  onUpdateItem: (item: ChecklistItem) => void;
  onResetChecklist: () => void;
}

export const ChecklistConfigView: React.FC<ChecklistConfigViewProps> = ({
  checklist,
  onUpdateItem,
  onResetChecklist
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New item form state
  const [newItem, setNewItem] = useState<Partial<ChecklistItem>>({
    requirementName: '',
    category: 'Land & Infrastructure',
    description: '',
    isRequired: true,
    expectedEvidenceType: '',
    validationMethod: '',
    ruleSource: 'AICTE Approval Process Handbook 2024-27',
    effectiveDate: '2024-04-01',
    currentStatus: 'Pending'
  });

  const categories = Array.from(new Set(checklist.map(c => c.category)));

  const filteredChecklist = checklist.filter(item => {
    const matchesSearch =
      item.requirementName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.ruleSource.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleToggleRequired = (item: ChecklistItem) => {
    onUpdateItem({
      ...item,
      isRequired: !item.isRequired
    });
  };

  const handleCreateNewItem = () => {
    if (!newItem.requirementName || !newItem.expectedEvidenceType) return;
    const fullItem: ChecklistItem = {
      id: `CHK-${Date.now().toString().slice(-4)}`,
      category: newItem.category || 'General Compliance',
      requirementName: newItem.requirementName,
      description: newItem.description || 'Statutory regulatory requirement verified by ReguLens AI.',
      isRequired: newItem.isRequired ?? true,
      expectedEvidenceType: newItem.expectedEvidenceType,
      validationMethod: newItem.validationMethod || 'Cross-document keyword and parameter matching',
      ruleSource: newItem.ruleSource || 'Statutory Guidelines',
      effectiveDate: newItem.effectiveDate || '2024-01-01',
      currentStatus: 'Pending'
    };
    onUpdateItem(fullItem);
    setShowAddModal(false);
    setNewItem({
      requirementName: '',
      category: 'Land & Infrastructure',
      description: '',
      isRequired: true,
      expectedEvidenceType: '',
      validationMethod: '',
      ruleSource: 'AICTE Approval Process Handbook 2024-27',
      effectiveDate: '2024-04-01',
      currentStatus: 'Pending'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Regulatory Verification Checklists</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {checklist.length} Rule Items
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configurable regulatory requirement matrices based on AICTE, NBC, and Fire Safety statutory guidelines
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (window.confirm('Reset checklist rules to standard statutory defaults?')) {
                onResetChecklist();
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Standards</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Checklist Item</span>
          </button>
        </div>
      </div>

      {/* Advisory Banner */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-800">Rule Governance Notice: </span>
          The rules below represent demonstration configurations referenced to AICTE Handbook 2024-27 and NBC 2016. Every automated cross-document finding generated by ReguLens AI cites its configured checklist item and verified source reference.
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search requirements or rule sources..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-700 focus:outline-none"
        >
          <option value="all">All Regulatory Domains</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Checklist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredChecklist.map(item => (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                  {item.id} • {item.category}
                </span>

                <button
                  onClick={() => handleToggleRequired(item)}
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded cursor-pointer transition-colors ${
                    item.isRequired
                      ? 'bg-red-100 text-red-800 border border-red-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                  title="Click to toggle mandatory status"
                >
                  {item.isRequired ? 'Mandatory' : 'Optional'}
                </button>
              </div>

              <h3 className="font-bold text-slate-900 text-sm leading-snug">
                {item.requirementName}
              </h3>

              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-1.5 text-[11px]">
              <div>
                <span className="text-slate-400 font-medium">Expected Evidence: </span>
                <span className="text-slate-700 font-semibold">{item.expectedEvidenceType}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Validation Method: </span>
                <span className="text-slate-700">{item.validationMethod}</span>
              </div>
              <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 font-mono">
                <span>Ref: {item.ruleSource}</span>
                <span>Eff: {item.effectiveDate}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Add Regulatory Checklist Rule</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Requirement Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Pollution Control Board Consent to Operate"
                  value={newItem.requirementName}
                  onChange={e => setNewItem({ ...newItem, requirementName: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Regulatory Category</label>
                  <select
                    value={newItem.category}
                    onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-white"
                  >
                    <option>Land & Infrastructure</option>
                    <option>Safety & Compliance</option>
                    <option>Financial & Governance</option>
                    <option>Academic Administration</option>
                    <option>Environmental Clearance</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Requirement</label>
                  <select
                    value={newItem.isRequired ? 'true' : 'false'}
                    onChange={e => setNewItem({ ...newItem, isRequired: e.target.value === 'true' })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-white"
                  >
                    <option value="true">Mandatory (Halts Approval)</option>
                    <option value="false">Optional / Supplementary</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Expected Evidence Type *</label>
                <input
                  type="text"
                  placeholder="e.g. State PCB Clearance Certificate"
                  value={newItem.expectedEvidenceType}
                  onChange={e => setNewItem({ ...newItem, expectedEvidenceType: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Validation Method</label>
                <input
                  type="text"
                  placeholder="e.g. PCB application reference match and validity date"
                  value={newItem.validationMethod}
                  onChange={e => setNewItem({ ...newItem, validationMethod: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Statutory Rule Source</label>
                <input
                  type="text"
                  value={newItem.ruleSource}
                  onChange={e => setNewItem({ ...newItem, ruleSource: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                disabled={!newItem.requirementName || !newItem.expectedEvidenceType}
                onClick={handleCreateNewItem}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50"
              >
                Save Rule Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
