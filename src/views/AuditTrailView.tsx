import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  Download,
  ShieldCheck,
  Info,
  Clock,
  User,
  Activity,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { AuditEvent } from '../types';

interface AuditTrailViewProps {
  auditTrail: AuditEvent[];
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({ auditTrail }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredEvents = auditTrail.filter(evt => {
    const matchesSearch =
      evt.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (evt.caseId && evt.caseId.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = categoryFilter === 'all' || evt.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleExportAuditJSON = () => {
    const blob = new Blob([JSON.stringify(auditTrail, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ReguLens_AuditTrail_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Regulatory Audit & Integrity Log</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {auditTrail.length} Events Logged
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Chronological, immutable record of intake dockets, extraction runs, triage actions, and determinations
          </p>
        </div>

        <button
          onClick={handleExportAuditJSON}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Export Audit Log (JSON)</span>
        </button>
      </div>

      {/* Advisory Banner */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-800">Demonstration Integrity Notice: </span>
          This log demonstrates end-to-end evidence traceability for the SIH prototype. Actor identifiers and signatures reflect simulated session state; client-side storage is not presented as tamper-proof enterprise cryptography.
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by action, actor, case ID, or keyword..."
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
          <option value="all">All Action Categories</option>
          <option value="Case">Case Lifecycle</option>
          <option value="Document">Evidence Ingestion</option>
          <option value="Verification">Verification Engine</option>
          <option value="Finding">Finding Triage</option>
          <option value="Report">Report Generation</option>
          <option value="Security">Security & Access</option>
        </select>
      </div>

      {/* Events Timeline List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filteredEvents.map(evt => {
            const isAlert = evt.severity === 'alert';
            const isWarn = evt.severity === 'warn';
            const isSuccess = evt.severity === 'success';

            return (
              <div key={evt.id} className="p-4 hover:bg-slate-50/80 transition-colors flex items-start gap-3.5 text-xs">
                {/* Severity Dot */}
                <div className="mt-1">
                  <span
                    className={`w-3 h-3 rounded-full flex items-center justify-center ${
                      isAlert
                        ? 'bg-red-500 ring-4 ring-red-100'
                        : isWarn
                        ? 'bg-amber-500 ring-4 ring-amber-100'
                        : isSuccess
                        ? 'bg-emerald-500 ring-4 ring-emerald-100'
                        : 'bg-blue-500 ring-4 ring-blue-100'
                    }`}
                  />
                </div>

                {/* Event Body */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{evt.action}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {evt.category}
                      </span>
                      {evt.caseId && (
                        <span className="font-mono text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                          {evt.caseId}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
                      <Clock className="w-3 h-3" />
                      <span>{evt.timestamp}</span>
                    </div>
                  </div>

                  <p className="text-slate-600 leading-relaxed">{evt.details}</p>

                  <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-400">
                    <User className="w-3 h-3" />
                    <span>Actor: <strong className="text-slate-700">{evt.actor}</strong></span>
                    <span>•</span>
                    <span className="font-mono text-[10px]">ID: {evt.id}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
