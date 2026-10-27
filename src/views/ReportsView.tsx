import React, { useState } from 'react';
import {
  FileText,
  Download,
  Share2,
  Printer,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Calendar,
  Building2,
  Clock,
  ShieldCheck,
  Save,
  Check
} from 'lucide-react';
import { ReviewCase, Finding, DocumentEvidence, ChecklistItem, SystemSettings } from '../types';
import { generateCasePDFReport, exportCaseJSON, exportFindingsCSV } from '../services/reportGenerator';

interface ReportsViewProps {
  cases: ReviewCase[];
  activeCase: ReviewCase | null;
  onSelectCase: (caseId: string) => void;
  findings: Finding[];
  checklist: ChecklistItem[];
  settings: SystemSettings;
  onSaveDisposition: (caseId: string, disposition: string, note: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  cases,
  activeCase,
  onSelectCase,
  findings,
  checklist,
  settings,
  onSaveDisposition
}) => {
  const currentCase = activeCase || cases[0] || null;

  const [disposition, setDisposition] = useState(
    currentCase?.finalDisposition || 'Needs Supplementary Verification Hearing'
  );
  const [summaryNote, setSummaryNote] = useState(
    currentCase?.reviewerSummaryNote || ''
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!currentCase) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-xs">
        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800">No Review Case Available</h2>
        <p className="text-xs text-slate-500 mt-1">Please create a case or load demo data to view reports.</p>
      </div>
    );
  }

  const caseFindings = findings.filter(f => f.caseId === currentCase.id);
  const openCaseFindings = caseFindings.filter(f => f.status !== 'Resolved' && f.status !== 'Dismissed');
  const documents = currentCase.documents || [];

  const handleSaveDetermination = () => {
    onSaveDisposition(currentCase.id, disposition, summaryNote);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Export Actions */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Regulatory Review & Verification Dossier</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Audit Ready
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Statutory report integrating cross-document findings, missing document alerts, and human reviewer determination
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <button
            onClick={() => exportFindingsCSV(currentCase, caseFindings)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>CSV Table</span>
          </button>

          <button
            onClick={() => exportCaseJSON(currentCase, caseFindings, documents, checklist)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={() => generateCasePDFReport(currentCase, caseFindings, documents, checklist, settings)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-600/20 transition-all hover:scale-[1.02]"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Generate Official PDF Report</span>
          </button>
        </div>
      </div>

      {/* Case Switcher Strip */}
      <div className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3 text-xs">
        <span className="font-bold text-slate-700 uppercase tracking-wider">Select Case Dossier:</span>
        <select
          value={currentCase.id}
          onChange={e => onSelectCase(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-1.5 font-semibold text-slate-900 bg-slate-50 focus:outline-none"
        >
          {cases.map(c => (
            <option key={c.id} value={c.id}>
              {c.id} — {c.institutionName} ({c.status})
            </option>
          ))}
        </select>
      </div>

      {/* Printable Report Preview Card */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-md overflow-hidden">
        {/* Official Letterhead Header */}
        <div className="bg-[#0F172A] text-white p-6 sm:p-8 border-b-4 border-teal-500">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-teal-400 font-mono text-[11px] font-bold uppercase tracking-wider">
                {settings.regulatoryBody}
              </p>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-1">
                EVIDENTIARY AUDIT & STATUTORY DETERMINATION REPORT
              </h2>
              <p className="text-slate-400 text-xs mt-1">
                Confidential Regulatory Verification Record • ReguLens AI Assistive Review Platform
              </p>
            </div>

            <div className="text-right sm:border-l sm:border-slate-700 sm:pl-6 text-xs text-slate-300 space-y-1">
              <div>
                <span className="text-slate-400">Case Identifier: </span>
                <span className="font-mono font-bold text-teal-300">{currentCase.id}</span>
              </div>
              <div>
                <span className="text-slate-400">Generated: </span>
                <span>{new Date().toLocaleDateString('en-GB')}</span>
              </div>
              <div>
                <span className="text-slate-400">Security Hash: </span>
                <span className="font-mono text-[10px]">SHA-256-V2</span>
              </div>
            </div>
          </div>
        </div>

        {/* Report Content Body */}
        <div className="p-6 sm:p-8 space-y-8 text-xs text-slate-700">
          {/* Section 1: Institutional Metadata */}
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-200 flex items-center justify-between">
              <span>1. Institutional Particulars & Scope of Review</span>
              <span className="text-xs font-mono text-slate-400 font-normal">Section A-1</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Institution Name</span>
                <span className="font-bold text-slate-900 text-xs block mt-0.5">{currentCase.institutionName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Application Reference</span>
                <span className="font-mono font-bold text-slate-900 text-xs block mt-0.5">{currentCase.referenceNumber}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Review Category</span>
                <span className="font-semibold text-slate-800 text-xs block mt-0.5">{currentCase.reviewCategory}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Campus Location</span>
                <span className="font-semibold text-slate-800 text-xs block mt-0.5">{currentCase.location}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Evidentiary Coverage & Document Integrity */}
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-200 flex items-center justify-between">
              <span>2. Submitted Evidence Bundle ({documents.length} Files Received)</span>
              <span className="text-xs font-mono text-slate-400 font-normal">Section A-2</span>
            </h3>

            <div className="mt-3 border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 font-bold text-[11px] border-b border-slate-200">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Filename</th>
                    <th className="py-2.5 px-3">Regulatory Category</th>
                    <th className="py-2.5 px-3">SHA-256 Digest</th>
                    <th className="py-2.5 px-3 text-right">Extraction Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {documents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-slate-400">
                        No evidence files attached to this docket.
                      </td>
                    </tr>
                  ) : (
                    documents.map((d, i) => (
                      <tr key={d.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 text-slate-400">{i + 1}</td>
                        <td className="py-2 px-3 font-semibold text-slate-900">{d.name}</td>
                        <td className="py-2 px-3 text-slate-600">{d.category}</td>
                        <td className="py-2 px-3 font-mono text-[10px] text-slate-400">
                          {d.hash.slice(0, 16)}...
                        </td>
                        <td className="py-2 px-3 text-right">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                            d.status === 'Processed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {d.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Cross-Document Discrepancies & Flags */}
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-200 flex items-center justify-between">
              <span>3. Detailed Discrepancies & Regulatory Alerts ({caseFindings.length} Total)</span>
              <span className="text-xs font-mono text-slate-400 font-normal">Section B-1</span>
            </h3>

            <div className="space-y-3 mt-3">
              {caseFindings.length === 0 ? (
                <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>All cross-document consistency checks passed with zero discrepancies.</span>
                </div>
              ) : (
                caseFindings.map(f => (
                  <div
                    key={f.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                          f.severity === 'High' ? 'bg-red-100 text-red-800' :
                          f.severity === 'Medium' ? 'bg-amber-100 text-amber-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {f.severity} • {f.category}
                        </span>
                        <span className="font-bold text-slate-900">{f.title}</span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-400">{f.status}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 bg-white p-2.5 rounded-lg border border-slate-200 font-mono text-[11px]">
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase">Value A</span>
                        <span className="font-semibold text-slate-900">{f.extractedValueA || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase">Value B</span>
                        <span className="font-semibold text-red-600">{f.extractedValueB || 'N/A'}</span>
                      </div>
                    </div>

                    <p className="text-slate-600 text-xs">
                      <strong>Audit Explanation: </strong>{f.reason}
                    </p>

                    <p className="text-blue-800 text-xs">
                      <strong>Prescribed Next Action: </strong>{f.recommendedAction}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section 4: Human Reviewer Determination & Sign-Off */}
          <div className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-300 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center justify-between">
              <span>4. Final Reviewer Determination & Statutory Sign-off</span>
              <span className="text-xs font-mono text-blue-600">Human Discretion Mandate</span>
            </h3>

            <p className="text-xs text-slate-500">
              In compliance with administrative law, ReguLens AI does not issue automated institutional rejections or sanctions. The inspecting officer must record the formal regulatory disposition below.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Official Determination
                </label>
                <select
                  value={disposition}
                  onChange={e => setDisposition(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white font-semibold text-slate-900"
                >
                  <option>Needs Supplementary Verification Hearing</option>
                  <option>Notice of Defect (Form 4B) Issued - 14 Days to Rectify</option>
                  <option>Approved - Unconditional Extension Granted</option>
                  <option>Conditional Approval - Subject to Fire NOC & Demarcation</option>
                  <option>Rejected - Discrepant Cadastral Title</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Signatory Officer
                </label>
                <input
                  type="text"
                  disabled
                  value={`${currentCase.assignedReviewer} • Authorized Inspector`}
                  className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-slate-100 text-slate-600 font-medium"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Summary Findings Rationale
                </label>
                <textarea
                  rows={3}
                  placeholder="Record official regulatory rationale and instructions for the inspection panel..."
                  value={summaryNote}
                  onChange={e => setSummaryNote(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400">
                Official determination will be stamped onto exported PDF dossiers.
              </span>

              <button
                onClick={handleSaveDetermination}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all"
              >
                {savedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5" />}
                <span>{savedSuccess ? 'Disposition Recorded!' : 'Save Determination'}</span>
              </button>
            </div>
          </div>

          {/* Transparency & Limitations Disclaimer */}
          <div className="pt-4 border-t border-slate-200 text-[11px] text-slate-400 leading-relaxed font-sans italic">
            <strong>System Limitations Notice: </strong>
            Automated verification is performed using deterministic keyword, coordinate, and token-similarity checks. Scanned or image-based files require manual reviewer confirmation. ReguLens AI does not certify legal land title validity or make binding regulatory judgments.
          </div>
        </div>
      </div>
    </div>
  );
};
