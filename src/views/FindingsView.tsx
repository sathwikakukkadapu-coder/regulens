import React, { useState } from 'react';
import {
  AlertTriangle,
  AlertOctagon,
  Info,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Filter,
  Search,
  MessageSquare,
  FileQuestion,
  FileText,
  ShieldCheck,
  Send,
  X
} from 'lucide-react';
import { Finding, FindingSeverity, FindingStatus } from '../types';

interface FindingsViewProps {
  findings: Finding[];
  onUpdateFinding: (updated: Finding) => void;
  onRequestEvidence: (finding: Finding) => void;
}

export const FindingsView: React.FC<FindingsViewProps> = ({
  findings,
  onUpdateFinding,
  onRequestEvidence
}) => {
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(
    findings.length > 0 ? findings[0].id : null
  );
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals for reviewer actions
  const [showDismissModal, setShowDismissModal] = useState(false);
  const [dismissalReason, setDismissalReason] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [reviewerNote, setReviewerNote] = useState('');

  // Filtering
  const filteredFindings = findings.filter(f => {
    const matchesSeverity = severityFilter === 'all' || f.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || f.status === statusFilter;
    const matchesSearch =
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.comparedField.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.caseId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesStatus && matchesSearch;
  });

  const selectedFinding =
    filteredFindings.find(f => f.id === selectedFindingId) ||
    filteredFindings[0] ||
    null;

  const handleStatusChange = (newStatus: FindingStatus) => {
    if (!selectedFinding) return;
    const updated: Finding = {
      ...selectedFinding,
      status: newStatus
    };
    onUpdateFinding(updated);
  };

  const handleConfirmDismiss = () => {
    if (!selectedFinding) return;
    const updated: Finding = {
      ...selectedFinding,
      status: 'Dismissed',
      dismissalReason
    };
    onUpdateFinding(updated);
    setShowDismissModal(false);
    setDismissalReason('');
  };

  const handleSaveNote = () => {
    if (!selectedFinding) return;
    const updated: Finding = {
      ...selectedFinding,
      reviewerNotes: reviewerNote
    };
    onUpdateFinding(updated);
    setShowNoteModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Regulatory Findings & Evidence Alerts</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
              {findings.filter(f => f.status !== 'Resolved' && f.status !== 'Dismissed').length} Open
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cross-document inconsistencies, missing prerequisites, and cadastral discrepancies requiring inspector triage
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search findings..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-xs w-40 sm:w-48"
            />
          </div>

          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium"
          >
            <option value="all">All Severities</option>
            <option value="High">High Severity</option>
            <option value="Medium">Medium Severity</option>
            <option value="Low">Low Severity</option>
            <option value="Informational">Informational</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Under Review">Under Review</option>
            <option value="Verified Discrepancy">Verified Discrepancy</option>
            <option value="Resolved">Resolved</option>
            <option value="Dismissed">Dismissed</option>
          </select>
        </div>
      </div>

      {/* Main 2-Column Findings Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Finding Cards List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {filteredFindings.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-slate-200/80 shadow-xs text-xs text-slate-400">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="font-bold text-slate-700">No matching findings</p>
              <p className="text-slate-400 mt-1">Adjust filters or run verification engine.</p>
            </div>
          ) : (
            filteredFindings.map(finding => {
              const isSelected = selectedFinding?.id === finding.id;
              const isHigh = finding.severity === 'High';
              const isMed = finding.severity === 'Medium';

              return (
                <div
                  key={finding.id}
                  onClick={() => setSelectedFindingId(finding.id)}
                  className={`p-4 rounded-2xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/40 shadow-sm ring-1 ring-blue-500/30'
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                        isHigh
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : isMed
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}
                    >
                      {finding.severity} • {finding.category}
                    </span>

                    <span className="text-[10px] font-mono text-slate-400">
                      {finding.caseId}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                    {finding.title}
                  </h3>

                  <p className="text-slate-500 text-xs mt-1.5 line-clamp-2">
                    {finding.reason}
                  </p>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-mono">{finding.comparedField}</span>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded ${
                        finding.status === 'Resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : finding.status === 'Dismissed'
                          ? 'bg-slate-100 text-slate-600'
                          : finding.status === 'Verified Discrepancy'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {finding.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Detailed Evidence Drawer & Reviewer Controls (7 cols) */}
        <div className="lg:col-span-7">
          {selectedFinding ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
              {/* Finding Title & Badges */}
              <div className="border-b border-slate-100 pb-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-md ${
                        selectedFinding.severity === 'High'
                          ? 'bg-red-100 text-red-800'
                          : selectedFinding.severity === 'Medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {selectedFinding.severity} Priority
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {selectedFinding.category}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">{selectedFinding.id} • {selectedFinding.dateDetected}</span>
                </div>

                <h2 className="text-lg font-bold text-slate-900">{selectedFinding.title}</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Case ID: <span className="font-mono font-bold text-blue-600">{selectedFinding.caseId}</span> • Assigned to: {selectedFinding.assignedReviewer}
                </p>
              </div>

              {/* Side-by-Side Compared Source Evidence (Core Requirement) */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Cross-Document Evidence Comparison
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Source A */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold">
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      <span className="truncate">Source Exhibit A</span>
                    </div>
                    <p className="font-bold text-slate-900 text-sm font-mono break-words">
                      {selectedFinding.extractedValueA || 'Value A Not Detected'}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Field: {selectedFinding.comparedField}
                    </p>
                  </div>

                  {/* Source B */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold">
                      <FileText className="w-3.5 h-3.5 text-teal-600" />
                      <span className="truncate">Source Exhibit B / Regulatory Expectation</span>
                    </div>
                    <p className="font-bold text-red-600 text-sm font-mono break-words">
                      {selectedFinding.extractedValueB || 'Value B Not Detected'}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Field: {selectedFinding.comparedField}
                    </p>
                  </div>
                </div>
              </div>

              {/* Detailed Reason & Regulatory Context */}
              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80">
                  <span className="font-bold text-amber-900 block mb-1">Reason for Flag:</span>
                  <p className="text-amber-800 leading-relaxed">{selectedFinding.reason}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/80">
                  <span className="font-bold text-blue-900 block mb-1">Recommended Regulatory Next Action:</span>
                  <p className="text-blue-800 leading-relaxed">{selectedFinding.recommendedAction}</p>
                </div>

                {selectedFinding.ruleReference && (
                  <div className="text-[11px] text-slate-500 font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-700">Statutory Rule Reference: </span>
                    {selectedFinding.ruleReference}
                  </div>
                )}

                {/* Reviewer Notes & Recorded Dismissal Rationale */}
                {selectedFinding.reviewerNotes && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                    <span className="font-bold block text-[11px]">Recorded Reviewer Note:</span>
                    <p className="mt-0.5">{selectedFinding.reviewerNotes}</p>
                  </div>
                )}

                {selectedFinding.dismissalReason && (
                  <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-800">
                    <span className="font-bold block text-[11px]">Recorded Dismissal Rationale:</span>
                    <p className="mt-0.5">{selectedFinding.dismissalReason}</p>
                  </div>
                )}
              </div>

              {/* Reviewer Action Buttons */}
              <div className="border-t border-slate-100 pt-5 space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Inspector Triage & Disposition Actions
                </span>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleStatusChange('Under Review')}
                    className="px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 text-xs font-semibold hover:bg-amber-100 transition-colors"
                  >
                    Mark Under Review
                  </button>

                  <button
                    onClick={() => handleStatusChange('Verified Discrepancy')}
                    className="px-3 py-1.5 rounded-lg border border-red-300 bg-red-50 text-red-800 text-xs font-semibold hover:bg-red-100 transition-colors"
                  >
                    Verify as True Discrepancy
                  </button>

                  <button
                    onClick={() => handleStatusChange('Resolved')}
                    className="px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition-colors"
                  >
                    Mark Resolved
                  </button>

                  <button
                    onClick={() => {
                      setDismissalReason(selectedFinding.dismissalReason || '');
                      setShowDismissModal(true);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors"
                  >
                    Dismiss Flag
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      setReviewerNote(selectedFinding.reviewerNotes || '');
                      setShowNoteModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{selectedFinding.reviewerNotes ? 'Edit Reviewer Note' : 'Add Reviewer Note'}</span>
                  </button>

                  <button
                    onClick={() => onRequestEvidence(selectedFinding)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Draft Formal Evidence Request (RFE)</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-xs text-xs text-slate-400">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>Select a finding from the left to view evidence and inspector actions.</p>
            </div>
          )}
        </div>
      </div>

      {/* Dismissal Reason Modal */}
      {showDismissModal && selectedFinding && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Dismiss Regulatory Flag</h3>
              <button onClick={() => setShowDismissModal(false)} className="text-slate-400 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Record statutory rationale for dismissing this discrepancy. This justification is permanently recorded in the audit trail.
            </p>
            <textarea
              rows={3}
              placeholder="e.g. Verified with Sub-Registrar revenue office that 142/8A was an inadvertent typing entry in the engineer draft; certified rectification deed supplied."
              value={dismissalReason}
              onChange={e => setDismissalReason(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowDismissModal(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                disabled={dismissalReason.trim().length < 5}
                onClick={handleConfirmDismiss}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
              >
                Confirm Dismissal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reviewer Note Modal */}
      {showNoteModal && selectedFinding && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Reviewer Note</h3>
              <button onClick={() => setShowNoteModal(false)} className="text-slate-400 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <textarea
              rows={4}
              placeholder="Add inspection notes or context..."
              value={reviewerNote}
              onChange={e => setReviewerNote(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowNoteModal(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-500"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
